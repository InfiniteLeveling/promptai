import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabase } from '../src/infrastructure/database/mockDb.js';
import { runLegacyMigration } from '../scripts/migrate-legacy.js';
import { verifyLegacyMigration } from '../scripts/verify-migration.js';

describe('Phase 18: Legacy Data Migration & Integrity Verification', () => {
  let mockDb: MockDatabase;
  let client: any;

  beforeEach(() => {
    mockDb = new MockDatabase();
    client = mockDb.createClient();
  });

  it('acquires distributed lock, migrates db.json data, and verifies records', async () => {
    const report = await runLegacyMigration({
      client,
      dbJsonPath: 'server/data/db.json',
      reportPath: 'scripts/migration-report.json',
      workerId: 'worker-test-1'
    });

    expect(report.migrationRunId).toBeDefined();
    expect(report.workerId).toBe('worker-test-1');
    expect(report.sourceSha256).toBeDefined();
    expect(report.promptsMigrated).toBeGreaterThan(0);
    expect(report.templatesMigrated).toBeGreaterThan(0);
    expect(report.usageCountersMigrated).toBeGreaterThan(0);
    expect(report.checksumVerification).toBe('PASSED');

    // Verify lock transitioned to completed
    const lock = mockDb.migration_locks.find((l) => l.lock_name === 'legacy_db_json_migration');
    expect(lock).toBeDefined();
    expect(lock.status).toBe('completed');

    // Run post-migration verification
    const verification = await verifyLegacyMigration(client, 'server/data/db.json');
    expect(verification.valid).toBe(true);
    expect(verification.errors.length).toBe(0);
    expect(verification.dbPromptsCount).toBe(verification.sourcePromptsCount);
    expect(verification.dbBlueprintsCount).toBe(verification.sourceTemplatesCount);
  });

  it('rejects concurrent migration when lock is held', async () => {
    // Acquire lock
    mockDb.migration_locks.push({
      lock_name: 'legacy_db_json_migration',
      migration_run_id: 'run-999',
      worker_id: 'worker-other',
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 60000).toISOString(),
      status: 'locked'
    });

    await expect(
      runLegacyMigration({
        client,
        dbJsonPath: 'server/data/db.json',
        workerId: 'worker-mine'
      })
    ).rejects.toThrow('Migration lock is currently held by worker worker-other');
  });

  it('is completely idempotent when run multiple times consecutively', async () => {
    // First run
    const report1 = await runLegacyMigration({
      client,
      dbJsonPath: 'server/data/db.json',
      workerId: 'worker-run-1'
    });
    expect(report1.checksumVerification).toBe('PASSED');

    const promptCount1 = mockDb.prompts.length;
    const blueprintCount1 = mockDb.blueprints.length;

    // Second run
    const report2 = await runLegacyMigration({
      client,
      dbJsonPath: 'server/data/db.json',
      workerId: 'worker-run-2'
    });
    expect(report2.checksumVerification).toBe('PASSED');

    // Verify no duplicates were inserted
    expect(mockDb.prompts.length).toBe(promptCount1);
    expect(mockDb.blueprints.length).toBe(blueprintCount1);
  });
});
