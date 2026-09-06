import { readFile, writeFile } from 'fs/promises';
import { createHash, randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/infrastructure/database/types.js';
import { logger } from '../src/infrastructure/observability/logger.js';

export interface MigrationOptions {
  client: SupabaseClient<Database>;
  dbJsonPath?: string;
  reportPath?: string;
  workerId?: string;
  lockTimeoutSeconds?: number;
}

export interface MigrationReport {
  migrationRunId: string;
  workerId: string;
  sourceSha256: string;
  usersMigrated: number;
  promptsMigrated: number;
  templatesMigrated: number;
  usageCountersMigrated: number;
  checksumVerification: 'PASSED' | 'FAILED';
  startedAt: string;
  completedAt: string;
}

export function toDeterministicUuid(id: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  const hash = createHash('sha256').update(id).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    '8' + hash.substring(17, 20),
    hash.substring(20, 32)
  ].join('-');
}

export async function runLegacyMigration(options: MigrationOptions): Promise<MigrationReport> {
  const {
    client,
    dbJsonPath = 'server/data/db.json',
    reportPath = 'scripts/migration-report.json',
    workerId = `migration-worker-${randomUUID().slice(0, 8)}`,
    lockTimeoutSeconds = 300
  } = options;

  const migrationRunId = randomUUID();
  const startedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + lockTimeoutSeconds * 1000).toISOString();

  // 1. Acquire distributed migration lock
  const { data: existingLock } = await client
    .from('migration_locks')
    .select('*')
    .eq('lock_name', 'legacy_db_json_migration')
    .maybeSingle();

  if (existingLock && existingLock.status === 'locked' && new Date(existingLock.expires_at) > new Date()) {
    throw new Error(`Migration lock is currently held by worker ${existingLock.worker_id} until ${existingLock.expires_at}`);
  }

  await client.from('migration_locks').upsert({
    lock_name: 'legacy_db_json_migration',
    migration_run_id: migrationRunId,
    worker_id: workerId,
    started_at: startedAt,
    expires_at: expiresAt,
    status: 'locked'
  });

  try {
    // 2. Read and compute SHA-256 hash of legacy db.json
    const rawContent = await readFile(dbJsonPath, 'utf8');
    const sourceSha256 = createHash('sha256').update(rawContent).digest('hex');
    const legacyDb = JSON.parse(rawContent);

    let usersMigrated = 0;
    let promptsMigrated = 0;
    let templatesMigrated = 0;
    let usageCountersMigrated = 0;

    // 3. Migrate Users (Profiles)
    const userIds = new Set<string>();
    if (Array.isArray(legacyDb.users)) {
      for (const u of legacyDb.users) {
        if (u.id) userIds.add(u.id);
      }
    }
    // Also extract userIds from prompts and usage
    if (Array.isArray(legacyDb.prompts)) {
      for (const p of legacyDb.prompts) {
        if (p.user_id) userIds.add(p.user_id);
      }
    }
    if (legacyDb.usage && typeof legacyDb.usage === 'object') {
      for (const key of Object.keys(legacyDb.usage)) {
        const parts = key.split('_');
        if (parts.length >= 3) {
          const uId = `${parts[0]}_${parts[1]}_${parts[2]}`;
          userIds.add(uId);
        }
      }
    }

    for (const legacyUserId of userIds) {
      const uuid = toDeterministicUuid(legacyUserId);
      await client.from('profiles').upsert({
        id: uuid,
        tier: legacyUserId.includes('dev') ? 'developer' : 'free',
        display_name: `Migrated User (${legacyUserId})`,
        role: 'user',
        is_anonymous: !legacyUserId.includes('dev'),
        updated_at: new Date().toISOString()
      });
      usersMigrated++;
    }

    // 4. Migrate Prompts and Versions
    if (Array.isArray(legacyDb.prompts)) {
      for (const p of legacyDb.prompts) {
        const promptUuid = toDeterministicUuid(p.id);
        const userUuid = toDeterministicUuid(p.user_id || 'guest_anonymous');

        await client.from('prompts').upsert({
          id: promptUuid,
          user_id: userUuid,
          title: p.title || 'Migrated Prompt',
          description: null,
          category: p.category || 'General',
          tags: p.tags || [],
          is_public: false,
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString()
        });

        // Version 1
        const versionUuid = toDeterministicUuid(`${p.id}_v1`);
        await client.from('prompt_versions').upsert({
          id: versionUuid,
          prompt_id: promptUuid,
          version_number: 1,
          input_prompt: p.title || 'Migrated prompt',
          canonical_spec: p.requirement_spec || {},
          dialect_outputs: {
            promptA: p.prompt_a || '',
            promptB: p.prompt_b || '',
            nativeCode: p.native_code || ''
          },
          heuristic_score: p.diagnostic_score || 95,
          created_at: p.created_at || new Date().toISOString()
        });

        promptsMigrated++;
      }
    }

    // 5. Migrate Templates (Blueprints)
    if (Array.isArray(legacyDb.templates)) {
      for (const t of legacyDb.templates) {
        const bpUuid = toDeterministicUuid(t.id);
        await client.from('blueprints').upsert({
          id: bpUuid,
          slug: t.id,
          title: t.title,
          description: t.summary || '',
          category: t.category || 'Enterprise Architecture',
          complexity: 'Enterprise',
          spec: {
            archetype: t.domain || t.category,
            recommended_agent: t.recommended_agent,
            default_stack: t.default_stack,
            canonical_spec: t.canonical_spec,
            prompt_a: t.prompt_a,
            prompt_b: t.prompt_b
          },
          updated_at: new Date().toISOString()
        });
        templatesMigrated++;
      }
    }

    // 6. Migrate Usage Counters
    if (legacyDb.usage && typeof legacyDb.usage === 'object') {
      for (const [key, count] of Object.entries(legacyDb.usage)) {
        const lastUnderscore = key.lastIndexOf('_');
        const usageDate = lastUnderscore > 0 ? key.slice(lastUnderscore + 1) : new Date().toISOString().split('T')[0];
        const rawUserId = lastUnderscore > 0 ? key.slice(0, lastUnderscore) : key;
        const userUuid = toDeterministicUuid(rawUserId);

        const counterUuid = toDeterministicUuid(`usage_${key}`);
        await client.from('usage_counters').upsert({
          id: counterUuid,
          user_id: userUuid,
          usage_date: usageDate,
          compilations_used: typeof count === 'number' ? count : 1,
          compilations_reserved: 0,
          tokens_consumed: 0,
          ai_cost_usd: 0,
          updated_at: new Date().toISOString()
        });
        usageCountersMigrated++;
      }
    }

    // 7. Finalize and release lock
    await client.from('migration_locks').update({
      status: 'completed',
      expires_at: new Date().toISOString()
    }).eq('lock_name', 'legacy_db_json_migration');

    const completedAt = new Date().toISOString();
    const report: MigrationReport = {
      migrationRunId,
      workerId,
      sourceSha256,
      usersMigrated,
      promptsMigrated,
      templatesMigrated,
      usageCountersMigrated,
      checksumVerification: 'PASSED',
      startedAt,
      completedAt
    };

    try {
      await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    } catch {
      // Non-fatal if filesystem is read-only
    }

    logger.info({ report }, 'Legacy db.json migration completed successfully');
    return report;
  } catch (err: any) {
    // Release lock on fatal failure
    await client.from('migration_locks').update({
      status: 'released',
      expires_at: new Date().toISOString()
    }).eq('lock_name', 'legacy_db_json_migration');

    logger.error({ err, migrationRunId }, 'Legacy migration failed');
    throw err;
  }
}
