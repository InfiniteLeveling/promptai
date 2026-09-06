import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabase } from '../src/infrastructure/database/mockDb.js';
import { CompilationWorker } from '../src/modules/jobs/worker.js';

describe('Phase 15: Background Jobs & Worker Claiming Engine', () => {
  let mockDb: MockDatabase;
  let client: any;
  let worker: CompilationWorker;

  beforeEach(() => {
    mockDb = new MockDatabase();
    client = mockDb.createClient();
    worker = new CompilationWorker(client, 'test-worker-1', 60, 5000);
  });

  it('returns null when no queued jobs exist', async () => {
    const job = await worker.claimNextJob();
    expect(job).toBeNull();
  });

  it('claims a queued job, assigns worker ID and starts lease', async () => {
    const runId = crypto.randomUUID();
    const jobId = crypto.randomUUID();

    mockDb.compilation_runs.push({
      id: runId,
      user_id: 'user-123',
      input_hash: 'hash-abc',
      spec: { prompt: 'Build payment reconciler' },
      status: 'pending'
    });

    mockDb.compilation_jobs.push({
      id: jobId,
      compilation_run_id: runId,
      status: 'queued',
      retry_count: 0,
      max_retries: 3
    });

    const claimed = await worker.claimNextJob();
    expect(claimed).not.toBeNull();
    expect(claimed?.job_id).toBe(jobId);
    expect(claimed?.compilation_run_id).toBe(runId);
    expect(claimed?.retry_count).toBe(1);

    // Verify DB state updated
    const dbJob = mockDb.compilation_jobs.find((j) => j.id === jobId);
    expect(dbJob.worker_id).toBe('test-worker-1');
    expect(dbJob.status).toBe('running');
    expect(dbJob.lease_started_at).toBeDefined();
    expect(dbJob.lease_expires_at).toBeDefined();

    // Verify attempt created
    expect(mockDb.compilation_attempts.length).toBe(1);
    expect(mockDb.compilation_attempts[0].worker_id).toBe('test-worker-1');
    expect(mockDb.compilation_attempts[0].status).toBe('running');
  });

  it('extends lease with worker heartbeat', async () => {
    const runId = crypto.randomUUID();
    const jobId = crypto.randomUUID();

    mockDb.compilation_jobs.push({
      id: jobId,
      compilation_run_id: runId,
      worker_id: 'test-worker-1',
      status: 'running',
      heartbeat_at: new Date(Date.now() - 30000).toISOString(),
      lease_expires_at: new Date(Date.now() + 30000).toISOString(),
      retry_count: 1,
      max_retries: 3
    });

    const success = await worker.heartbeat(jobId);
    expect(success).toBe(true);

    const dbJob = mockDb.compilation_jobs.find((j) => j.id === jobId);
    expect(new Date(dbJob.lease_expires_at).getTime()).toBeGreaterThan(Date.now() + 50000);
  });

  it('executes compilation pipeline end-to-end and commits quota', async () => {
    const runId = crypto.randomUUID();
    const jobId = crypto.randomUUID();
    const reservationId = crypto.randomUUID();

    mockDb.compilation_runs.push({
      id: runId,
      user_id: 'user-123',
      input_hash: 'hash-abc',
      spec: { prompt: 'Autonomous Payment Engine', target_agent: 'cursor' },
      status: 'pending'
    });

    mockDb.quota_reservations.push({
      id: reservationId,
      compilation_run_id: runId,
      user_id: 'user-123',
      status: 'reserved',
      amount: 1
    });

    mockDb.compilation_jobs.push({
      id: jobId,
      compilation_run_id: runId,
      status: 'queued',
      retry_count: 0,
      max_retries: 3
    });

    const { claimed, result } = await worker.runOnce();
    expect(claimed).toBe(true);
    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
    expect(result.output.requirement_spec).toBeDefined();

    // Verify job finalized as completed
    const dbJob = mockDb.compilation_jobs.find((j) => j.id === jobId);
    expect(dbJob.status).toBe('completed');

    // Verify attempt finalized as completed
    const attempt = mockDb.compilation_attempts.find((a) => a.compilation_run_id === runId);
    expect(attempt.status).toBe('completed');
    expect(attempt.tokens_consumed).toBeGreaterThan(0);

    // Verify quota reservation committed
    const res = mockDb.quota_reservations.find((r) => r.id === reservationId);
    expect(res.status).toBe('committed');
  });

  it('re-queues job for retry if failure occurs and retries remain', async () => {
    const runId = crypto.randomUUID();
    const jobId = crypto.randomUUID();

    mockDb.compilation_runs.push({
      id: runId,
      user_id: 'user-123',
      input_hash: 'hash-fail',
      status: 'pending'
    });

    mockDb.compilation_jobs.push({
      id: jobId,
      compilation_run_id: runId,
      status: 'queued',
      retry_count: 0,
      max_retries: 3
    });

    const claimed = await worker.claimNextJob();
    expect(claimed).not.toBeNull();

    // Simulate failure
    const finalizeRes = await worker.finalizeJob(jobId, {
      status: 'failed',
      errorMessage: 'Transient network timeout'
    });

    expect(finalizeRes.status).toBe('queued_retry');

    const dbJob = mockDb.compilation_jobs.find((j) => j.id === jobId);
    expect(dbJob.status).toBe('queued');
    expect(dbJob.worker_id).toBeNull();
  });

  it('dead-letters job and refunds quota if max retries exceeded', async () => {
    const runId = crypto.randomUUID();
    const jobId = crypto.randomUUID();
    const reservationId = crypto.randomUUID();

    mockDb.compilation_runs.push({
      id: runId,
      user_id: 'user-123',
      status: 'pending'
    });

    mockDb.quota_reservations.push({
      id: reservationId,
      compilation_run_id: runId,
      user_id: 'user-123',
      status: 'reserved',
      amount: 1
    });

    mockDb.compilation_jobs.push({
      id: jobId,
      compilation_run_id: runId,
      status: 'queued',
      retry_count: 2, // Claim will push this to 3 == max_retries
      max_retries: 3
    });

    const claimed = await worker.claimNextJob();
    expect(claimed?.retry_count).toBe(3);

    const finalizeRes = await worker.finalizeJob(jobId, {
      status: 'failed',
      errorMessage: 'Fatal prompt compilation exception'
    });

    expect(finalizeRes.status).toBe('dead_letter');

    const dbJob = mockDb.compilation_jobs.find((j) => j.id === jobId);
    expect(dbJob.status).toBe('dead_letter');

    // Quota reservation refunded!
    const res = mockDb.quota_reservations.find((r) => r.id === reservationId);
    expect(res.status).toBe('refunded');
  });

  it('recovers abandoned/stale reservations', async () => {
    mockDb.quota_reservations.push({
      id: 'stale-res-1',
      status: 'reserved',
      expires_at: new Date(Date.now() - 10000).toISOString()
    });
    mockDb.quota_reservations.push({
      id: 'active-res-2',
      status: 'reserved',
      expires_at: new Date(Date.now() + 60000).toISOString()
    });

    const recoveredCount = await worker.recoverStaleReservations();
    expect(recoveredCount).toBe(1);

    expect(mockDb.quota_reservations.find((r) => r.id === 'stale-res-1')?.status).toBe('refunded');
    expect(mockDb.quota_reservations.find((r) => r.id === 'active-res-2')?.status).toBe('reserved');
  });
});
