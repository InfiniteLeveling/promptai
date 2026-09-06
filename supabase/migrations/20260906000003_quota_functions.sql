-- ==============================================================================
-- PromptArchitect AI - Quota Engine, Persistent Reservations & Ledger RPCs
-- Migration: 20260906000003_quota_functions.sql
-- Specification: Version 2.3.0 (Sections 15, 16, 20)
-- ==============================================================================

-- 1. Reserve Compilation Quota RPC
-- Enforces: compilations_used + compilations_reserved + p_amount <= daily_limit
CREATE OR REPLACE FUNCTION public.reserve_compilation_quota(
    p_compilation_run_id UUID,
    p_user_id UUID,
    p_amount INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tier TEXT;
    v_daily_limit INTEGER;
    v_entitlement_version TEXT;
    v_today DATE;
    v_used INTEGER;
    v_reserved INTEGER;
    v_reservation_id UUID;
    v_existing_reservation UUID;
BEGIN
    -- Validate amount
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Reservation amount must be strictly positive (requested: %)', p_amount;
    END IF;

    -- Check if reservation already exists for this run (idempotency by run ID)
    SELECT id INTO v_existing_reservation
    FROM public.quota_reservations
    WHERE compilation_run_id = p_compilation_run_id;

    IF v_existing_reservation IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'status', 'already_reserved',
            'reservation_id', v_existing_reservation
        );
    END IF;

    -- Fetch active tier for user
    SELECT tier INTO v_tier
    FROM public.profiles
    WHERE id = p_user_id AND deleted_at IS NULL;

    IF v_tier IS NULL THEN
        RAISE EXCEPTION 'User profile % not found or has been soft-deleted', p_user_id;
    END IF;

    -- Look up active plan entitlement limit
    SELECT daily_compilations, version
    INTO v_daily_limit, v_entitlement_version
    FROM public.plan_entitlements
    WHERE plan = v_tier
    ORDER BY effective_from DESC
    LIMIT 1;

    IF v_daily_limit IS NULL THEN
        -- Fallback default for free tier
        v_daily_limit := 5;
        v_entitlement_version := '2026-Q3-v1';
    END IF;

    v_today := (TIMEZONE('utc', NOW()))::DATE;

    -- Ensure usage counter row exists for today
    INSERT INTO public.usage_counters (user_id, usage_date, compilations_used, compilations_reserved, tokens_consumed)
    VALUES (p_user_id, v_today, 0, 0, 0)
    ON CONFLICT (user_id, usage_date) DO NOTHING;

    -- Row lock on user's counter for today
    SELECT compilations_used, compilations_reserved
    INTO v_used, v_reserved
    FROM public.usage_counters
    WHERE user_id = p_user_id AND usage_date = v_today
    FOR UPDATE;

    -- Authoritative Operational Invariant check
    IF (v_used + v_reserved + p_amount) > v_daily_limit THEN
        RAISE EXCEPTION 'QUOTA_EXCEEDED: Daily limit of % reached for tier "%". Used: %, Reserved: %, Requested: %',
            v_daily_limit, v_tier, v_used, v_reserved, p_amount;
    END IF;

    -- Atomic transition: increment compilations_reserved
    UPDATE public.usage_counters
    SET compilations_reserved = compilations_reserved + p_amount,
        updated_at = TIMEZONE('utc', NOW())
    WHERE user_id = p_user_id AND usage_date = v_today;

    -- Create persistent quota reservation record
    INSERT INTO public.quota_reservations (
        compilation_run_id,
        user_id,
        usage_date,
        amount,
        status,
        reserved_at,
        expires_at
    ) VALUES (
        p_compilation_run_id,
        p_user_id,
        v_today,
        p_amount,
        'reserved',
        TIMEZONE('utc', NOW()),
        TIMEZONE('utc', NOW()) + INTERVAL '10 minutes'
    ) RETURNING id INTO v_reservation_id;

    -- Record in immutable usage ledger
    INSERT INTO public.usage_events (
        reservation_id,
        user_id,
        event_type,
        amount,
        metadata
    ) VALUES (
        v_reservation_id,
        p_user_id,
        'reservation',
        p_amount,
        jsonb_build_object(
            'compilation_run_id', p_compilation_run_id,
            'plan_tier', v_tier,
            'entitlement_version', v_entitlement_version,
            'daily_limit', v_daily_limit,
            'usage_date', v_today
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'status', 'reserved',
        'reservation_id', v_reservation_id,
        'user_id', p_user_id,
        'amount', p_amount,
        'usage_date', v_today,
        'daily_limit', v_daily_limit
    );
END;
$$;

-- 2. Commit Compilation Quota RPC
-- Transitions reservation from 'reserved' to 'committed'
-- Decrements compilations_reserved, increments compilations_used
CREATE OR REPLACE FUNCTION public.commit_compilation_quota(
    p_reservation_id UUID,
    p_tokens INTEGER DEFAULT 0,
    p_actual_cost_usd NUMERIC(10, 6) DEFAULT 0.000000
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_res RECORD;
BEGIN
    SELECT id, compilation_run_id, user_id, usage_date, amount, status
    INTO v_res
    FROM public.quota_reservations
    WHERE id = p_reservation_id
    FOR UPDATE;

    IF v_res.id IS NULL THEN
        RAISE EXCEPTION 'Quota reservation % not found', p_reservation_id;
    END IF;

    -- Idempotent check
    IF v_res.status = 'committed' THEN
        RETURN jsonb_build_object(
            'success', true,
            'status', 'already_committed',
            'reservation_id', p_reservation_id
        );
    END IF;

    -- Conflict check
    IF v_res.status = 'refunded' THEN
        RAISE EXCEPTION 'Cannot commit reservation % because it is already refunded', p_reservation_id;
    END IF;

    -- Update reservation state
    UPDATE public.quota_reservations
    SET status = 'committed',
        resolved_at = TIMEZONE('utc', NOW())
    WHERE id = p_reservation_id;

    -- Settle usage counter: reserved -> used
    UPDATE public.usage_counters
    SET compilations_reserved = GREATEST(0, compilations_reserved - v_res.amount),
        compilations_used = compilations_used + v_res.amount,
        tokens_consumed = tokens_consumed + GREATEST(0, COALESCE(p_tokens, 0)),
        updated_at = TIMEZONE('utc', NOW())
    WHERE user_id = v_res.user_id AND usage_date = v_res.usage_date;

    -- Record completion event in ledger
    INSERT INTO public.usage_events (
        reservation_id,
        user_id,
        event_type,
        amount,
        tokens,
        actual_cost_usd,
        metadata
    ) VALUES (
        p_reservation_id,
        v_res.user_id,
        'completion',
        v_res.amount,
        GREATEST(0, COALESCE(p_tokens, 0)),
        GREATEST(0, COALESCE(p_actual_cost_usd, 0)),
        jsonb_build_object(
            'compilation_run_id', v_res.compilation_run_id,
            'status', 'committed'
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'status', 'committed',
        'reservation_id', p_reservation_id,
        'user_id', v_res.user_id,
        'amount', v_res.amount,
        'tokens', p_tokens
    );
END;
$$;

-- 3. Refund Compilation Quota RPC
-- Reservation-specific, cross-UTC midnight safe
-- Decrements compilations_reserved on the original usage_date
CREATE OR REPLACE FUNCTION public.refund_compilation_quota(
    p_reservation_id UUID,
    p_reason TEXT DEFAULT 'compilation_failed'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_res RECORD;
BEGIN
    SELECT id, compilation_run_id, user_id, usage_date, amount, status
    INTO v_res
    FROM public.quota_reservations
    WHERE id = p_reservation_id
    FOR UPDATE;

    IF v_res.id IS NULL THEN
        RAISE EXCEPTION 'Quota reservation % not found', p_reservation_id;
    END IF;

    -- Idempotent check
    IF v_res.status = 'refunded' THEN
        RETURN jsonb_build_object(
            'success', true,
            'status', 'already_refunded',
            'reservation_id', p_reservation_id
        );
    END IF;

    -- Conflict check
    IF v_res.status = 'committed' THEN
        RAISE EXCEPTION 'Cannot refund reservation % because it is already committed', p_reservation_id;
    END IF;

    -- Cross-UTC midnight safe counter decrement on original usage_date
    UPDATE public.usage_counters
    SET compilations_reserved = GREATEST(0, compilations_reserved - v_res.amount),
        updated_at = TIMEZONE('utc', NOW())
    WHERE user_id = v_res.user_id AND usage_date = v_res.usage_date;

    -- Update reservation state
    UPDATE public.quota_reservations
    SET status = 'refunded',
        resolved_at = TIMEZONE('utc', NOW())
    WHERE id = p_reservation_id;

    -- Record refund event in ledger
    INSERT INTO public.usage_events (
        reservation_id,
        user_id,
        event_type,
        amount,
        metadata
    ) VALUES (
        p_reservation_id,
        v_res.user_id,
        'refund',
        -v_res.amount,
        jsonb_build_object(
            'compilation_run_id', v_res.compilation_run_id,
            'reason', p_reason,
            'usage_date', v_res.usage_date
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'status', 'refunded',
        'reservation_id', p_reservation_id,
        'user_id', v_res.user_id,
        'amount_refunded', v_res.amount,
        'reason', p_reason
    );
END;
$$;

-- 4. Stale Reservation Recovery Algorithm
-- Identifies abandoned reservations older than 10 minutes where run is not active
CREATE OR REPLACE FUNCTION public.recover_stale_quota_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    r RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR r IN
        SELECT r.id, r.user_id, r.amount, r.usage_date
        FROM public.quota_reservations r
        JOIN public.compilation_runs c ON c.id = r.compilation_run_id
        LEFT JOIN public.compilation_jobs j ON j.compilation_run_id = c.id
        WHERE r.status = 'reserved'
          AND r.expires_at < TIMEZONE('utc', NOW())
          AND c.status NOT IN ('running')
          AND (j.lease_expires_at IS NULL OR j.lease_expires_at < TIMEZONE('utc', NOW()))
        FOR UPDATE OF r SKIP LOCKED
    LOOP
        PERFORM public.refund_compilation_quota(r.id, 'stale_reservation_timeout');
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

-- 5. Administrative RPC: Adjust User Quota
-- Privileged only (service_role)
CREATE OR REPLACE FUNCTION public.adjust_user_quota(
    p_user_id UUID,
    p_date DATE,
    p_adjustment INTEGER,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_old_used INTEGER;
    v_new_used INTEGER;
BEGIN
    -- Ensure usage counter row exists
    INSERT INTO public.usage_counters (user_id, usage_date, compilations_used, compilations_reserved, tokens_consumed)
    VALUES (p_user_id, p_date, 0, 0, 0)
    ON CONFLICT (user_id, usage_date) DO NOTHING;

    SELECT compilations_used INTO v_old_used
    FROM public.usage_counters
    WHERE user_id = p_user_id AND usage_date = p_date
    FOR UPDATE;

    v_new_used := GREATEST(0, v_old_used + p_adjustment);

    UPDATE public.usage_counters
    SET compilations_used = v_new_used,
        updated_at = TIMEZONE('utc', NOW())
    WHERE user_id = p_user_id AND usage_date = p_date;

    -- Log to immutable usage events
    INSERT INTO public.usage_events (
        user_id,
        event_type,
        amount,
        metadata
    ) VALUES (
        p_user_id,
        'admin_adjustment',
        p_adjustment,
        jsonb_build_object(
            'reason', p_reason,
            'previous_used', v_old_used,
            'new_used', v_new_used,
            'date', p_date
        )
    );

    -- Log to audit log
    INSERT INTO public.audit_logs (
        actor_role,
        action,
        entity_type,
        entity_id,
        previous_state,
        new_state
    ) VALUES (
        'service_role',
        'adjust_user_quota',
        'usage_counters',
        p_user_id::TEXT,
        jsonb_build_object('compilations_used', v_old_used),
        jsonb_build_object('compilations_used', v_new_used, 'reason', p_reason)
    );

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'date', p_date,
        'previous_used', v_old_used,
        'new_used', v_new_used,
        'adjustment', p_adjustment
    );
END;
$$;

-- 6. Administrative RPC: Override Subscription Tier
-- Privileged only (service_role)
CREATE OR REPLACE FUNCTION public.override_subscription_tier(
    p_user_id UUID,
    p_tier TEXT,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_old_tier TEXT;
BEGIN
    IF p_tier NOT IN ('free', 'pro', 'developer') THEN
        RAISE EXCEPTION 'Invalid tier "%". Must be free, pro, or developer', p_tier;
    END IF;

    SELECT tier INTO v_old_tier
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_old_tier IS NULL THEN
        RAISE EXCEPTION 'User % not found', p_user_id;
    END IF;

    UPDATE public.profiles
    SET tier = p_tier,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = p_user_id;

    -- Audit log
    INSERT INTO public.audit_logs (
        actor_role,
        action,
        entity_type,
        entity_id,
        previous_state,
        new_state
    ) VALUES (
        'service_role',
        'override_subscription_tier',
        'profiles',
        p_user_id::TEXT,
        jsonb_build_object('tier', v_old_tier),
        jsonb_build_object('tier', p_tier, 'reason', p_reason)
    );

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'previous_tier', v_old_tier,
        'new_tier', p_tier,
        'reason', p_reason
    );
END;
$$;

-- ==============================================================================
-- PERMISSION GRANTS & REVOCATIONS
-- ==============================================================================

-- Revoke all administrative RPC execution from public and authenticated
REVOKE ALL ON FUNCTION public.adjust_user_quota FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.override_subscription_tier FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_user_quota TO service_role;
GRANT EXECUTE ON FUNCTION public.override_subscription_tier TO service_role;

-- Grant execution of standard quota operations to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.reserve_compilation_quota TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.commit_compilation_quota TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refund_compilation_quota TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.recover_stale_quota_reservations TO service_role;
