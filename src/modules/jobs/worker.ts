import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../infrastructure/database/types.js';
import { logger } from '../../infrastructure/observability/logger.js';
import { compilePipeline } from '@promptarchitect/compiler';
import type { ClaimedJob, FinalizeJobOptions } from './types.js';

export class CompilationWorker {
  private heartbeatTimer: NodeJS.Timeout | null = null;
  public isRunning = false;

  constructor(
    private readonly client: SupabaseClient<Database>,
    public readonly workerId: string = `worker-${crypto.randomUUID().slice(0, 8)}`,
    public readonly leaseSeconds: number = 60,
    public readonly heartbeatIntervalMs: number = 15000
  ) {}

  async claimNextJob(): Promise<ClaimedJob | null> {
    const { data, error } = await this.client.rpc('claim_next_compilation_job', {
      p_worker_id: this.workerId,
      p_lease_seconds: this.leaseSeconds
    } as any);

    if (error) {
      logger.error({ err: error, workerId: this.workerId }, 'Failed to claim next compilation job');
      return null;
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return null;
    }

    const claimed = Array.isArray(data) ? data[0] : data;
    return claimed as ClaimedJob;
  }

  async heartbeat(jobId: string): Promise<boolean> {
    const { data, error } = await this.client.rpc('worker_heartbeat', {
      p_job_id: jobId,
      p_worker_id: this.workerId,
      p_lease_seconds: this.leaseSeconds
    } as any);

    if (error) {
      logger.warn({ err: error, jobId, workerId: this.workerId }, 'Worker heartbeat RPC failed');
      return false;
    }

    return Boolean(data);
  }

  startHeartbeat(jobId: string): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.heartbeat(jobId);
      } catch (err) {
        logger.error({ err, jobId }, 'Heartbeat execution error');
      }
    }, this.heartbeatIntervalMs);
  }

  stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  async finalizeJob(jobId: string, options: FinalizeJobOptions): Promise<{ success: boolean; status?: string }> {
    const { data, error } = await this.client.rpc('finalize_compilation_job', {
      p_job_id: jobId,
      p_worker_id: this.workerId,
      p_status: options.status,
      p_error_message: options.errorMessage || null,
      p_tokens: options.tokens || 0,
      p_actual_cost_usd: options.actualCostUsd || null
    } as any);

    if (error) {
      logger.error({ err: error, jobId, options }, 'Failed to finalize compilation job');
      return { success: false };
    }

    return (data as any) || { success: true };
  }

  async processJob(job: ClaimedJob): Promise<{ success: boolean; output?: any; error?: string }> {
    this.startHeartbeat(job.job_id);

    try {
      const promptInput = job.run_spec?.prompt || job.run_spec?.raw_input || 'Synthesize architecture spec';
      const targetAgent = job.run_spec?.target_agent || 'antigravity';
      const selectedChips = job.run_spec?.selected_chips || [];

      // Execute pure compiler pipeline
      const output = await compilePipeline(promptInput, selectedChips, targetAgent);

      // Finalize job as completed
      const finalizeRes = await this.finalizeJob(job.job_id, {
        status: 'completed',
        tokens: 450,
        actualCostUsd: 0.0009
      });

      this.stopHeartbeat();
      return { success: finalizeRes.success, output };
    } catch (err: any) {
      this.stopHeartbeat();
      logger.error({ err, jobId: job.job_id }, 'Worker failed processing compilation job');

      const finalizeRes = await this.finalizeJob(job.job_id, {
        status: 'failed',
        errorMessage: err?.message || 'Unknown processing error'
      });

      return { success: false, error: err?.message };
    }
  }

  async runOnce(): Promise<{ claimed: boolean; result?: any }> {
    const job = await this.claimNextJob();
    if (!job) {
      return { claimed: false };
    }

    const result = await this.processJob(job);
    return { claimed: true, result };
  }

  async recoverStaleReservations(): Promise<number> {
    const { data, error } = await this.client.rpc('recover_stale_quota_reservations');
    if (error) {
      logger.error({ err: error }, 'Failed to recover stale quota reservations');
      return 0;
    }
    return Number(data || 0);
  }
}
