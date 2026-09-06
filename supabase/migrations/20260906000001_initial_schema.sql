-- ==============================================================================
-- PromptArchitect AI - Base Relational Schema Migration
-- Migration: 20260906000001_initial_schema.sql
-- Specification: Version 2.3.0 (implementation_plan.md)
-- ==============================================================================

-- 1. Profiles & Authorization
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'developer')),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    deleted_at TIMESTAMPTZ
);

-- 2. Blueprints Catalog (Curated Enterprise Architecture Templates)
CREATE TABLE IF NOT EXISTS public.blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    complexity TEXT NOT NULL CHECK (complexity IN ('Beginner', 'Intermediate', 'Advanced', 'Enterprise')),
    spec JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Prompts Library
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    fork_count INTEGER NOT NULL DEFAULT 0 CHECK (fork_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    deleted_at TIMESTAMPTZ
);

-- 4. Prompt Versions (Immutable Snapshots)
CREATE TABLE IF NOT EXISTS public.prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL CHECK (version_number >= 1),
    input_prompt TEXT NOT NULL,
    canonical_spec JSONB NOT NULL,
    dialect_outputs JSONB NOT NULL,
    heuristic_score INTEGER NOT NULL CHECK (heuristic_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(prompt_id, version_number)
);

-- 5. Plan Entitlements (Actually Versioned)
CREATE TABLE IF NOT EXISTS public.plan_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'developer')),
    version TEXT NOT NULL,
    daily_compilations INTEGER NOT NULL CHECK (daily_compilations > 0),
    daily_ai_budget_usd NUMERIC(10, 4) NOT NULL CHECK (daily_ai_budget_usd >= 0),
    max_input_size_bytes INTEGER NOT NULL CHECK (max_input_size_bytes > 0),
    max_output_tokens INTEGER NOT NULL CHECK (max_output_tokens > 0),
    max_concurrency INTEGER NOT NULL CHECK (max_concurrency > 0),
    allowed_models TEXT[] NOT NULL,
    feature_flags JSONB NOT NULL DEFAULT '{}',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    effective_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(plan, version)
);

-- 6. Subscriptions (Financial Record - ON DELETE SET NULL)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('pro', 'developer')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT chk_subscription_dates CHECK (current_period_end >= current_period_start)
);

-- 7. Billing Events (Immutable Webhook Audit Log - ON DELETE SET NULL)
CREATE TABLE IF NOT EXISTS public.billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    stripe_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    event_received_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    event_processed_at TIMESTAMPTZ,
    processing_status TEXT NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received', 'processing', 'processed', 'failed', 'ignored')),
    failure_reason TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    payload JSONB NOT NULL
);

-- 8. Daily Usage Counters
CREATE TABLE IF NOT EXISTS public.usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    compilations_used INTEGER NOT NULL DEFAULT 0 CHECK (compilations_used >= 0),
    compilations_reserved INTEGER NOT NULL DEFAULT 0 CHECK (compilations_reserved >= 0),
    tokens_consumed INTEGER NOT NULL DEFAULT 0 CHECK (tokens_consumed >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, usage_date)
);

-- 9. Compilation Runs (Complete Execution Metadata)
CREATE TABLE IF NOT EXISTS public.compilation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    prompt_input TEXT NOT NULL,
    input_hash TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '{}',
    result JSONB,
    error_message TEXT,
    is_shadow BOOLEAN NOT NULL DEFAULT FALSE,
    fallback_used BOOLEAN NOT NULL DEFAULT FALSE,
    compiler_version TEXT NOT NULL,
    schema_version TEXT NOT NULL,
    adapter_version TEXT NOT NULL,
    model_provider TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_policy_version TEXT NOT NULL,
    pricing_version TEXT NOT NULL,
    entitlement_version TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
    output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
    estimated_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.000000 CHECK (estimated_cost_usd >= 0),
    actual_cost_usd NUMERIC(10, 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 10. Compilation Attempts History
CREATE TABLE IF NOT EXISTS public.compilation_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compilation_run_id UUID NOT NULL REFERENCES public.compilation_runs(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1),
    attempt_id UUID NOT NULL UNIQUE,
    worker_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'timeout', 'cancelled')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMPTZ,
    error_code TEXT,
    error_message TEXT,
    model_provider TEXT NOT NULL,
    model_name TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
    output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
    estimated_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.000000 CHECK (estimated_cost_usd >= 0),
    actual_cost_usd NUMERIC(10, 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(compilation_run_id, attempt_number)
);

-- 11. Compilation Jobs (Worker Queue & Leases)
CREATE TABLE IF NOT EXISTS public.compilation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compilation_run_id UUID NOT NULL REFERENCES public.compilation_runs(id) ON DELETE CASCADE UNIQUE,
    worker_id TEXT,
    current_attempt_id UUID NOT NULL,
    lease_started_at TIMESTAMPTZ,
    lease_expires_at TIMESTAMPTZ,
    heartbeat_at TIMESTAMPTZ,
    retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    max_retries INTEGER NOT NULL DEFAULT 3 CHECK (max_retries >= 1),
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'dead_letter')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 12. Quota Reservations (Explicit FK to compilation_runs)
CREATE TABLE IF NOT EXISTS public.quota_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compilation_run_id UUID NOT NULL REFERENCES public.compilation_runs(id) ON DELETE CASCADE UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1 CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'committed', 'refunded')),
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- 13. Usage Events (Immutable Financial Ledger - ON DELETE SET NULL)
CREATE TABLE IF NOT EXISTS public.usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.quota_reservations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('reservation', 'completion', 'refund', 'admin_adjustment')),
    amount INTEGER NOT NULL,
    tokens INTEGER NOT NULL DEFAULT 0 CHECK (tokens >= 0),
    estimated_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.000000 CHECK (estimated_cost_usd >= 0),
    actual_cost_usd NUMERIC(10, 6),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 14. Storage Objects Metadata
CREATE TABLE IF NOT EXISTS public.storage_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bucket TEXT NOT NULL,
    object_path TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
    sha256 TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(bucket, object_path)
);

-- 15. Idempotency Keys (User-Scoped)
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_path TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed')),
    response_code INTEGER,
    response_body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    locked_until TIMESTAMPTZ NOT NULL,
    UNIQUE(user_id, request_path, idempotency_key)
);

-- 16. Migration Locks
CREATE TABLE IF NOT EXISTS public.migration_locks (
    lock_name TEXT PRIMARY KEY,
    migration_run_id UUID NOT NULL,
    worker_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('locked', 'completed', 'released'))
);

-- 17. Audit Logs (Immutable Security Record - ON DELETE SET NULL)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 18. Account Deletions
CREATE TABLE IF NOT EXISTS public.account_deletions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    requested_by UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
        'requested', 'sessions_revoked', 'billing_cleaned', 
        'data_purged', 'storage_purged', 'audit_anonymized', 
        'auth_deleted', 'completed', 'failed'
    )),
    failure_reason TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMPTZ
);

-- ==============================================================================
-- DATABASE-LEVEL IMMUTABILITY PROTECTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.enforce_immutable_record()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Table % is strictly append-only. UPDATE and DELETE are prohibited.', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usage_events_immutable ON public.usage_events;
CREATE TRIGGER trg_usage_events_immutable BEFORE UPDATE OR DELETE ON public.usage_events
FOR EACH ROW EXECUTE FUNCTION public.enforce_immutable_record();

DROP TRIGGER IF EXISTS trg_billing_events_immutable ON public.billing_events;
CREATE TRIGGER trg_billing_events_immutable BEFORE UPDATE OR DELETE ON public.billing_events
FOR EACH ROW EXECUTE FUNCTION public.enforce_immutable_record();

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.enforce_immutable_record();

DROP TRIGGER IF EXISTS trg_compilation_attempts_immutable ON public.compilation_attempts;
CREATE TRIGGER trg_compilation_attempts_immutable BEFORE UPDATE OR DELETE ON public.compilation_attempts
FOR EACH ROW EXECUTE FUNCTION public.enforce_immutable_record();

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION & IDENTITY UPGRADE TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url, is_anonymous)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.is_anonymous, FALSE)
    )
    ON CONFLICT (id) DO UPDATE
    SET is_anonymous = EXCLUDED.is_anonymous,
        updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE OF is_anonymous ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
