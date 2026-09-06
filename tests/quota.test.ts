import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Phase 6: Quota Engine, Persistent Reservations & Ledger RPCs', () => {
  const quotaMigrationPath = join(process.cwd(), 'supabase/migrations/20260906000003_quota_functions.sql');

  it('verifies that the quota functions migration file exists', () => {
    expect(existsSync(quotaMigrationPath)).toBe(true);
  });

  it('verifies reserve_compilation_quota enforces operational invariant', () => {
    const sql = readFileSync(quotaMigrationPath, 'utf-8');

    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.reserve_compilation_quota');
    expect(sql).toContain('SECURITY DEFINER');
    expect(sql).toContain('SET search_path = public, pg_temp');

    // Authoritative Operational Invariant check
    expect(sql).toContain('IF (v_used + v_reserved + p_amount) > v_daily_limit THEN');
    expect(sql).toContain('QUOTA_EXCEEDED');

    // Increments reserved counter
    expect(sql).toContain('compilations_reserved = compilations_reserved + p_amount');

    // Inserts persistent quota reservation
    expect(sql).toContain('INSERT INTO public.quota_reservations');
    expect(sql).toContain("'reserved'");

    // Appends to immutable usage ledger
    expect(sql).toContain('INSERT INTO public.usage_events');
    expect(sql).toContain("'reservation'");
  });

  it('verifies commit_compilation_quota performs accounting state transition', () => {
    const sql = readFileSync(quotaMigrationPath, 'utf-8');

    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.commit_compilation_quota');

    // Checks state conflict
    expect(sql).toContain("IF v_res.status = 'refunded' THEN");
    expect(sql).toContain('Cannot commit reservation');

    // Idempotency check
    expect(sql).toContain("IF v_res.status = 'committed' THEN");

    // Transition reserved -> used
    expect(sql).toContain('compilations_reserved = GREATEST(0, compilations_reserved - v_res.amount)');
    expect(sql).toContain('compilations_used = compilations_used + v_res.amount');

    // Appends to ledger
    expect(sql).toContain("'completion'");
  });

  it('verifies refund_compilation_quota is reservation-specific and cross-UTC safe', () => {
    const sql = readFileSync(quotaMigrationPath, 'utf-8');

    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.refund_compilation_quota');

    // Conflict check
    expect(sql).toContain("IF v_res.status = 'committed' THEN");
    expect(sql).toContain('Cannot refund reservation');

    // Idempotent return
    expect(sql).toContain("IF v_res.status = 'refunded' THEN");

    // Decrements counter strictly on the original reservation's usage_date
    expect(sql).toContain('WHERE user_id = v_res.user_id AND usage_date = v_res.usage_date');
    expect(sql).toContain('compilations_reserved = GREATEST(0, compilations_reserved - v_res.amount)');

    // Appends refund event to ledger with negative amount
    expect(sql).toContain("'refund'");
    expect(sql).toContain('-v_res.amount');
  });

  it('verifies stale reservation recovery algorithm matches specification', () => {
    const sql = readFileSync(quotaMigrationPath, 'utf-8');

    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.recover_stale_quota_reservations()');
    expect(sql).toContain("WHERE r.status = 'reserved'");
    expect(sql).toContain("r.expires_at < TIMEZONE('utc', NOW())");
    expect(sql).toContain("c.status NOT IN ('running')");
    expect(sql).toContain('FOR UPDATE OF r SKIP LOCKED');
    expect(sql).toContain("public.refund_compilation_quota(r.id, 'stale_reservation_timeout')");
  });

  it('verifies administrative RPCs and privilege containment', () => {
    const sql = readFileSync(quotaMigrationPath, 'utf-8');

    // adjust_user_quota
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.adjust_user_quota');
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.adjust_user_quota FROM PUBLIC, authenticated;');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.adjust_user_quota TO service_role;');

    // override_subscription_tier
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.override_subscription_tier');
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.override_subscription_tier FROM PUBLIC, authenticated;');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.override_subscription_tier TO service_role;');

    // Standard RPCs granted to authenticated
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.reserve_compilation_quota TO authenticated, service_role;');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.commit_compilation_quota TO authenticated, service_role;');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.refund_compilation_quota TO authenticated, service_role;');
  });
});
