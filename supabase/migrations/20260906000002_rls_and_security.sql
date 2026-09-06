-- ==============================================================================
-- PromptArchitect AI - RLS Policies & Column-Level Privilege Hardening
-- Migration: 20260906000002_rls_and_security.sql
-- Specification: Version 2.3.0 (Sections 15 & 16)
-- ==============================================================================

-- 1. Helper function: authorize_admin based on auth.uid()
CREATE OR REPLACE FUNCTION public.authorize_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
    );
END;
$$;

-- Revoke execute on administrative helper from public
REVOKE ALL ON FUNCTION public.authorize_admin FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.authorize_admin TO authenticated, service_role;

-- 2. Enable Row Level Security on all 18 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compilation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compilation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compilation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;

-- 3. Profiles Policies
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.authorize_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 4. Blueprints Policies (Public read for templates)
DROP POLICY IF EXISTS "blueprints_select_all" ON public.blueprints;
CREATE POLICY "blueprints_select_all" ON public.blueprints
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "blueprints_admin_modify" ON public.blueprints;
CREATE POLICY "blueprints_admin_modify" ON public.blueprints
    FOR ALL TO authenticated
    USING (public.authorize_admin())
    WITH CHECK (public.authorize_admin());

-- 5. Prompts Policies
DROP POLICY IF EXISTS "prompts_select_public_or_own" ON public.prompts;
CREATE POLICY "prompts_select_public_or_own" ON public.prompts
    FOR SELECT TO anon, authenticated
    USING (is_public = true OR user_id = auth.uid() OR public.authorize_admin());

DROP POLICY IF EXISTS "prompts_insert_own" ON public.prompts;
CREATE POLICY "prompts_insert_own" ON public.prompts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "prompts_update_own" ON public.prompts;
CREATE POLICY "prompts_update_own" ON public.prompts
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR public.authorize_admin())
    WITH CHECK (user_id = auth.uid() OR public.authorize_admin());

DROP POLICY IF EXISTS "prompts_delete_own" ON public.prompts;
CREATE POLICY "prompts_delete_own" ON public.prompts
    FOR DELETE TO authenticated
    USING (user_id = auth.uid() OR public.authorize_admin());

-- 6. Prompt Versions Policies
DROP POLICY IF EXISTS "prompt_versions_select" ON public.prompt_versions;
CREATE POLICY "prompt_versions_select" ON public.prompt_versions
    FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.prompts p
            WHERE p.id = prompt_id AND (p.is_public = true OR p.user_id = auth.uid() OR public.authorize_admin())
        )
    );

DROP POLICY IF EXISTS "prompt_versions_insert" ON public.prompt_versions;
CREATE POLICY "prompt_versions_insert" ON public.prompt_versions
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prompts p
            WHERE p.id = prompt_id AND p.user_id = auth.uid()
        )
    );

-- 7. Plan Entitlements (Public read for active tiers)
DROP POLICY IF EXISTS "plan_entitlements_select" ON public.plan_entitlements;
CREATE POLICY "plan_entitlements_select" ON public.plan_entitlements
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "plan_entitlements_admin_all" ON public.plan_entitlements;
CREATE POLICY "plan_entitlements_admin_all" ON public.plan_entitlements
    FOR ALL TO authenticated
    USING (public.authorize_admin())
    WITH CHECK (public.authorize_admin());

-- 8. Subscriptions Policies
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.authorize_admin());

-- 9. Billing Events Policies (Admin view only)
DROP POLICY IF EXISTS "billing_events_admin_select" ON public.billing_events;
CREATE POLICY "billing_events_admin_select" ON public.billing_events
    FOR SELECT TO authenticated
    USING (public.authorize_admin());

-- 10. Daily Usage Counters Policies
DROP POLICY IF EXISTS "usage_counters_select_own" ON public.usage_counters;
CREATE POLICY "usage_counters_select_own" ON public.usage_counters
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.authorize_admin());

-- 11. Compilation Runs Policies
DROP POLICY IF EXISTS "compilation_runs_select_own" ON public.compilation_runs;
CREATE POLICY "compilation_runs_select_own" ON public.compilation_runs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.authorize_admin());

DROP POLICY IF EXISTS "compilation_runs_insert_own" ON public.compilation_runs;
CREATE POLICY "compilation_runs_insert_own" ON public.compilation_runs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 12. Compilation Attempts Policies
DROP POLICY IF EXISTS "compilation_attempts_select_own" ON public.compilation_attempts;
CREATE POLICY "compilation_attempts_select_own" ON public.compilation_attempts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.compilation_runs r
            WHERE r.id = compilation_run_id AND (r.user_id = auth.uid() OR public.authorize_admin())
        )
    );

-- 13. Quota Reservations Policies
DROP POLICY IF EXISTS "quota_reservations_select_own" ON public.quota_reservations;
CREATE POLICY "quota_reservations_select_own" ON public.quota_reservations
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.authorize_admin());

-- 14. Usage Events Policies
DROP POLICY IF EXISTS "usage_events_select_own" ON public.usage_events;
CREATE POLICY "usage_events_select_own" ON public.usage_events
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.authorize_admin());

-- 15. Storage Objects Metadata Policies
DROP POLICY IF EXISTS "storage_objects_select_own" ON public.storage_objects;
CREATE POLICY "storage_objects_select_own" ON public.storage_objects
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.authorize_admin());

DROP POLICY IF EXISTS "storage_objects_insert_own" ON public.storage_objects;
CREATE POLICY "storage_objects_insert_own" ON public.storage_objects
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 16. Idempotency Keys Policies
DROP POLICY IF EXISTS "idempotency_keys_select_own" ON public.idempotency_keys;
CREATE POLICY "idempotency_keys_select_own" ON public.idempotency_keys
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.authorize_admin());

DROP POLICY IF EXISTS "idempotency_keys_insert_own" ON public.idempotency_keys;
CREATE POLICY "idempotency_keys_insert_own" ON public.idempotency_keys
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 17. Account Deletions Policies
DROP POLICY IF EXISTS "account_deletions_select_own" ON public.account_deletions;
CREATE POLICY "account_deletions_select_own" ON public.account_deletions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.authorize_admin());

-- ==============================================================================
-- COLUMN-LEVEL PRIVILEGE HARDENING
-- ==============================================================================

-- Revoke all table-level update privileges from authenticated users on profiles
REVOKE UPDATE ON public.profiles FROM authenticated;

-- Grant column-specific update permissions ONLY to user-modifiable attributes
GRANT UPDATE (display_name, avatar_url, updated_at) ON public.profiles TO authenticated;

-- Grant SELECT on all user-facing tables to authenticated
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.blueprints TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompts TO authenticated;
GRANT SELECT, INSERT ON public.prompt_versions TO authenticated;
GRANT SELECT ON public.plan_entitlements TO anon, authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.usage_counters TO authenticated;
GRANT SELECT, INSERT ON public.compilation_runs TO authenticated;
GRANT SELECT ON public.compilation_attempts TO authenticated;
GRANT SELECT ON public.quota_reservations TO authenticated;
GRANT SELECT ON public.usage_events TO authenticated;
GRANT SELECT, INSERT ON public.storage_objects TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.idempotency_keys TO authenticated;
GRANT SELECT ON public.account_deletions TO authenticated;
