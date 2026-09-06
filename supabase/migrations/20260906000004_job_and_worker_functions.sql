-- ==============================================================================
-- Migration: 20260906000004_job_and_worker_functions.sql
-- Description: Worker claiming (FOR UPDATE SKIP LOCKED), heartbeats, and job lifecycle
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.claim_next_compilation_job(
    p_worker_id TEXT,
    p_lease_seconds INTEGER DEFAULT 60
)
RETURNS TABLE (
    job_id UUID,
    compilation_run_id UUID,
    current_attempt_id UUID,
    retry_count INTEGER,
    max_retries INTEGER,
    run_input_hash TEXT,
    run_spec JSONB,
    run_user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_job_id UUID;
    v_attempt_id UUID;
    v_run_id UUID;
    v_retry_count INTEGER;
BEGIN
    -- Select next available queued or expired running job
    SELECT j.id, j.compilation_run_id, j.retry_count
    INTO v_job_id, v_run_id, v_retry_count
    FROM public.compilation_jobs j
    WHERE (
        j.status = 'queued' 
        OR (j.status = 'running' AND j.lease_expires_at < TIMEZONE('utc', NOW()))
    )
    ORDER BY j.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1;

    IF v_job_id IS NULL THEN
        RETURN;
    END IF;

    -- Create new compilation_attempt
    INSERT INTO public.compilation_attempts (
        compilation_run_id,
        attempt_number,
        worker_id,
        status
    ) VALUES (
        v_run_id,
        v_retry_count + 1,
        p_worker_id,
        'running'
    )
    RETURNING id INTO v_attempt_id;

    -- Update job lease and state
    UPDATE public.compilation_jobs
    SET worker_id = p_worker_id,
        current_attempt_id = v_attempt_id,
        lease_started_at = TIMEZONE('utc', NOW()),
        lease_expires_at = TIMEZONE('utc', NOW()) + (p_lease_seconds || ' seconds')::INTERVAL,
        heartbeat_at = TIMEZONE('utc', NOW()),
        retry_count = v_retry_count + 1,
        status = 'running',
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = v_job_id;

    -- Return claimed job data
    RETURN QUERY
    SELECT 
        j.id AS job_id,
        j.compilation_run_id,
        v_attempt_id AS current_attempt_id,
        j.retry_count,
        j.max_retries,
        r.input_hash AS run_input_hash,
        r.spec AS run_spec,
        r.user_id AS run_user_id
    FROM public.compilation_jobs j
    JOIN public.compilation_runs r ON r.id = j.compilation_run_id
    WHERE j.id = v_job_id;
END;
$$;

-- Worker heartbeat to extend lease
CREATE OR REPLACE FUNCTION public.worker_heartbeat(
    p_job_id UUID,
    p_worker_id TEXT,
    p_lease_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_updated_rows INTEGER;
BEGIN
    UPDATE public.compilation_jobs
    SET heartbeat_at = TIMEZONE('utc', NOW()),
        lease_expires_at = TIMEZONE('utc', NOW()) + (p_lease_seconds || ' seconds')::INTERVAL,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = p_job_id
      AND worker_id = p_worker_id
      AND status = 'running';

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    RETURN v_updated_rows > 0;
END;
$$;

-- Finalize compilation job (completed, failed, or dead_letter with automatic quota refund)
CREATE OR REPLACE FUNCTION public.finalize_compilation_job(
    p_job_id UUID,
    p_worker_id TEXT,
    p_status TEXT, -- 'completed' or 'failed'
    p_error_message TEXT DEFAULT NULL,
    p_tokens INTEGER DEFAULT 0,
    p_actual_cost_usd NUMERIC(10,6) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_job RECORD;
    v_reservation_id UUID;
BEGIN
    SELECT * INTO v_job
    FROM public.compilation_jobs
    WHERE id = p_job_id AND worker_id = p_worker_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Job not found or worker mismatch');
    END IF;

    IF p_status = 'completed' THEN
        -- Mark job completed
        UPDATE public.compilation_jobs
        SET status = 'completed',
            updated_at = TIMEZONE('utc', NOW())
        WHERE id = p_job_id;

        -- Mark attempt completed
        UPDATE public.compilation_attempts
        SET status = 'completed',
            tokens_consumed = p_tokens,
            actual_cost_usd = p_actual_cost_usd
        WHERE id = v_job.current_attempt_id;

        -- Mark run completed
        UPDATE public.compilation_runs
        SET status = 'completed',
            updated_at = TIMEZONE('utc', NOW())
        WHERE id = v_job.compilation_run_id;

        -- Commit quota reservation
        SELECT id INTO v_reservation_id
        FROM public.quota_reservations
        WHERE compilation_run_id = v_job.compilation_run_id AND status = 'reserved';

        IF v_reservation_id IS NOT NULL THEN
            PERFORM public.commit_compilation_quota(v_reservation_id, p_tokens, COALESCE(p_actual_cost_usd, 0.000000));
        END IF;

        RETURN jsonb_build_object('success', true, 'status', 'completed');

    ELSIF p_status = 'failed' THEN
        -- Check if retries exhausted
        IF v_job.retry_count >= v_job.max_retries THEN
            -- Transition to dead_letter
            UPDATE public.compilation_jobs
            SET status = 'dead_letter',
                updated_at = TIMEZONE('utc', NOW())
            WHERE id = p_job_id;

            -- Mark attempt failed
            UPDATE public.compilation_attempts
            SET status = 'failed',
                error_message = p_error_message
            WHERE id = v_job.current_attempt_id;

            -- Mark run failed
            UPDATE public.compilation_runs
            SET status = 'failed',
                error_message = p_error_message,
                updated_at = TIMEZONE('utc', NOW())
            WHERE id = v_job.compilation_run_id;

            -- Auto-refund quota reservation
            SELECT id INTO v_reservation_id
            FROM public.quota_reservations
            WHERE compilation_run_id = v_job.compilation_run_id AND status = 'reserved';

            IF v_reservation_id IS NOT NULL THEN
                PERFORM public.refund_compilation_quota(v_reservation_id, 'Max retries exceeded; dead-lettered');
            END IF;

            RETURN jsonb_build_object('success', true, 'status', 'dead_letter');
        ELSE
            -- Re-queue for next retry
            UPDATE public.compilation_jobs
            SET status = 'queued',
                worker_id = NULL,
                lease_started_at = NULL,
                lease_expires_at = NULL,
                updated_at = TIMEZONE('utc', NOW())
            WHERE id = p_job_id;

            UPDATE public.compilation_attempts
            SET status = 'failed',
                error_message = p_error_message
            WHERE id = v_job.current_attempt_id;

            RETURN jsonb_build_object('success', true, 'status', 'queued_retry');
        END IF;
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid status argument');
    END IF;
END;
$$;

-- Security Grants: strictly service_role privileged execution
REVOKE ALL ON FUNCTION public.claim_next_compilation_job FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.worker_heartbeat FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_compilation_job FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_next_compilation_job TO service_role;
GRANT EXECUTE ON FUNCTION public.worker_heartbeat TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_compilation_job TO service_role;
