import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabase } from '../src/infrastructure/database/mockDb.js';
import { DeletionService } from '../src/modules/auth/deletionService.js';

describe('Phase 16: Asynchronous Account Deletion & Data Privacy', () => {
  let mockDb: MockDatabase;
  let client: any;
  let deletionService: DeletionService;

  beforeEach(() => {
    mockDb = new MockDatabase();
    client = mockDb.createClient();
    deletionService = new DeletionService(client);
  });

  it('initiates deletion request, soft-deletes profile, and dead-letters active jobs', async () => {
    const userId = 'user-del-1';
    mockDb.profiles.push({
      id: userId,
      email: 'user1@example.com',
      deleted_at: null
    });

    const runId = crypto.randomUUID();
    mockDb.compilation_runs.push({
      id: runId,
      user_id: userId,
      status: 'running'
    });

    mockDb.compilation_jobs.push({
      id: crypto.randomUUID(),
      compilation_run_id: runId,
      status: 'running',
      worker_id: 'worker-1'
    });

    const res = await deletionService.requestDeletion(userId);
    expect(res.success).toBe(true);
    expect(res.id).toBeDefined();

    // Verify deletion request recorded
    const request = mockDb.account_deletions.find((r) => r.user_id === userId);
    expect(request).toBeDefined();
    expect(request.status).toBe('requested');

    // Verify profile soft-deleted
    const profile = mockDb.profiles.find((p) => p.id === userId);
    expect(profile.deleted_at).not.toBeNull();

    // Verify active jobs dead-lettered
    const job = mockDb.compilation_jobs.find((j) => j.compilation_run_id === runId);
    expect(job.status).toBe('dead_letter');

    // Verify isDeletionInProgress flag
    const inProgress = await deletionService.isDeletionInProgress(userId);
    expect(inProgress).toBe(true);
  });

  it('rejects duplicate deletion request while one is in progress', async () => {
    const userId = 'user-del-2';
    mockDb.account_deletions.push({
      id: crypto.randomUUID(),
      user_id: userId,
      status: 'requested'
    });

    await expect(deletionService.requestDeletion(userId)).rejects.toThrow('already in progress');
  });

  it('executes the full 6-stage deletion lifecycle and preserves financial/audit logs', async () => {
    const userId = 'user-del-3';

    mockDb.profiles.push({
      id: userId,
      email: 'user3@example.com',
      deleted_at: null
    });

    mockDb.account_deletions.push({
      id: crypto.randomUUID(),
      user_id: userId,
      status: 'requested'
    });

    // Subscriptions
    mockDb.subscriptions.push({
      id: crypto.randomUUID(),
      user_id: userId,
      status: 'active',
      stripe_customer_id: 'cus_333'
    });

    // Prompts and versions
    const promptId = crypto.randomUUID();
    mockDb.prompts.push({
      id: promptId,
      user_id: userId,
      title: 'Secret Prompt'
    });
    mockDb.prompt_versions.push({
      id: crypto.randomUUID(),
      prompt_id: promptId,
      version_number: 1
    });

    // Storage objects
    mockDb.storage_objects.push({
      id: crypto.randomUUID(),
      user_id: userId,
      bucket: 'prompt-attachments',
      object_path: 'user3/secret.png'
    });

    // Audit logs
    mockDb.audit_logs.push({
      id: crypto.randomUUID(),
      actor_id: userId,
      action: 'compile_prompt',
      ip_address: '192.168.1.50',
      user_agent: 'Mozilla/5.0'
    });

    const lifecycleResult = await deletionService.executeDeletionLifecycle(userId);
    expect(lifecycleResult.success).toBe(true);
    expect(lifecycleResult.finalStatus).toBe('completed');

    // 1. Check account_deletions status
    const deletionRecord = mockDb.account_deletions.find((r) => r.user_id === userId);
    expect(deletionRecord.status).toBe('completed');
    expect(deletionRecord.completed_at).toBeDefined();

    // 2. Check billing status canceled
    const sub = mockDb.subscriptions.find((s) => s.user_id === userId);
    expect(sub.status).toBe('canceled');

    // 3. Check data purged
    expect(mockDb.prompts.find((p) => p.user_id === userId)).toBeUndefined();
    expect(mockDb.prompt_versions.find((v) => v.prompt_id === promptId)).toBeUndefined();

    // 4. Check storage purged
    expect(mockDb.storage_objects.find((o) => o.user_id === userId)).toBeUndefined();

    // 5. Check audit logs anonymized (record retained, PII scrubbed)
    expect(mockDb.audit_logs.length).toBe(1);
    expect(mockDb.audit_logs[0].actor_id).toBeNull();
    expect(mockDb.audit_logs[0].ip_address).toBe('0.0.0.0');
    expect(mockDb.audit_logs[0].user_agent).toBe('[REDACTED]');

    // 6. Check auth user deleted
    expect(mockDb.profiles.find((p) => p.id === userId)).toBeUndefined();
  });
});
