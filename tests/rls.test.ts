import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Phase 5: RLS Policies & Column-Level Privilege Hardening', () => {
  const rlsMigrationPath = join(process.cwd(), 'supabase/migrations/20260906000002_rls_and_security.sql');

  it('verifies that the RLS migration file exists', () => {
    expect(existsSync(rlsMigrationPath)).toBe(true);
  });

  it('verifies RLS is enabled on all 18 tables', () => {
    const sql = readFileSync(rlsMigrationPath, 'utf-8');

    const expectedTables = [
      'public.profiles',
      'public.blueprints',
      'public.prompts',
      'public.prompt_versions',
      'public.plan_entitlements',
      'public.subscriptions',
      'public.billing_events',
      'public.usage_counters',
      'public.compilation_runs',
      'public.compilation_attempts',
      'public.compilation_jobs',
      'public.quota_reservations',
      'public.usage_events',
      'public.storage_objects',
      'public.idempotency_keys',
      'public.migration_locks',
      'public.audit_logs',
      'public.account_deletions'
    ];

    for (const table of expectedTables) {
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it('verifies column-level privilege hardening on public.profiles', () => {
    const sql = readFileSync(rlsMigrationPath, 'utf-8');

    // Asserts that full table updates are revoked from authenticated users
    expect(sql).toContain('REVOKE UPDATE ON public.profiles FROM authenticated;');

    // Asserts that updates are granted ONLY to safe, user-editable attributes
    expect(sql).toContain('GRANT UPDATE (display_name, avatar_url, updated_at) ON public.profiles TO authenticated;');

    // Asserts that sensitive columns (role, tier, is_anonymous, stripe_customer_id) are NOT in the grant list
    const grantLine = sql
      .split('\n')
      .find((line) => line.includes('GRANT UPDATE') && line.includes('public.profiles'));
    expect(grantLine).toBeDefined();
    expect(grantLine).not.toContain('role');
    expect(grantLine).not.toContain('tier');
    expect(grantLine).not.toContain('is_anonymous');
    expect(grantLine).not.toContain('stripe_customer_id');
  });

  it('verifies authorize_admin RPC uses auth.uid() and has SECURITY DEFINER', () => {
    const sql = readFileSync(rlsMigrationPath, 'utf-8');

    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.authorize_admin()');
    expect(sql).toContain('SECURITY DEFINER');
    expect(sql).toContain('SET search_path = public, pg_temp');
    expect(sql).toContain('WHERE id = auth.uid() AND role = \'admin\' AND deleted_at IS NULL');
  });

  it('verifies tenant isolation policies on prompts and compilation runs', () => {
    const sql = readFileSync(rlsMigrationPath, 'utf-8');

    // Prompts isolation
    expect(sql).toContain('CREATE POLICY "prompts_insert_own" ON public.prompts');
    expect(sql).toContain('WITH CHECK (user_id = auth.uid())');

    // Compilation runs isolation
    expect(sql).toContain('CREATE POLICY "compilation_runs_insert_own" ON public.compilation_runs');
    expect(sql).toContain('WITH CHECK (user_id = auth.uid())');

    // Storage objects isolation
    expect(sql).toContain('CREATE POLICY "storage_objects_insert_own" ON public.storage_objects');
    expect(sql).toContain('WITH CHECK (user_id = auth.uid())');
  });
});
