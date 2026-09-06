import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Phase 4: Supabase Schema & Migration Verification', () => {
  const migrationPath = join(process.cwd(), 'supabase/migrations/20260906000001_initial_schema.sql');
  const seedPath = join(process.cwd(), 'supabase/seed.sql');

  it('verifies that the initial SQL migration file exists', () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  it('verifies that the seed.sql file exists', () => {
    expect(existsSync(seedPath)).toBe(true);
  });

  it('verifies all 18 core tables are declared in migration DDL', () => {
    const sql = readFileSync(migrationPath, 'utf-8');

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
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it('verifies critical CHECK constraints and immutability guards', () => {
    const sql = readFileSync(migrationPath, 'utf-8');

    // Positive and non-negative constraints
    expect(sql).toContain('CHECK (compilations_used >= 0)');
    expect(sql).toContain('CHECK (compilations_reserved >= 0)');
    expect(sql).toContain('CHECK (tokens_consumed >= 0)');
    expect(sql).toContain('CHECK (amount > 0)');
    expect(sql).toContain('CHECK (estimated_cost_usd >= 0)');
    expect(sql).toContain('CHECK (current_period_end >= current_period_start)');

    // Scoped idempotency uniqueness
    expect(sql).toContain('UNIQUE(user_id, request_path, idempotency_key)');

    // Versioned plan entitlements uniqueness
    expect(sql).toContain('UNIQUE(plan, version)');

    // Storage bucket and object path uniqueness
    expect(sql).toContain('UNIQUE(bucket, object_path)');

    // Immutability triggers on ledgers
    expect(sql).toContain('trg_usage_events_immutable');
    expect(sql).toContain('trg_billing_events_immutable');
    expect(sql).toContain('trg_audit_logs_immutable');
    expect(sql).toContain('trg_compilation_attempts_immutable');

    // User creation trigger
    expect(sql).toContain('on_auth_user_created');
  });

  it('verifies seed data contains plan entitlements and 5 enterprise blueprints', () => {
    const seedSql = readFileSync(seedPath, 'utf-8');

    // Entitlements
    expect(seedSql).toContain("'free'");
    expect(seedSql).toContain("'pro'");
    expect(seedSql).toContain("'developer'");
    expect(seedSql).toContain("'2026-Q3-v1'");

    // Blueprints
    expect(seedSql).toContain('tpl_payment_reconciler');
    expect(seedSql).toContain('tpl_saas_multi_tenant');
    expect(seedSql).toContain('tpl_mobile_offline_sync');
    expect(seedSql).toContain('tpl_cyber_dashboard');
    expect(seedSql).toContain('tpl_autonomous_agent');
  });
});
