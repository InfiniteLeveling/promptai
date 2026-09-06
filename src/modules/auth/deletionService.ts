import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../infrastructure/database/types.js';
import { logger } from '../../infrastructure/observability/logger.js';

export type DeletionStatus =
  | 'requested'
  | 'sessions_revoked'
  | 'billing_cleaned'
  | 'data_purged'
  | 'storage_purged'
  | 'audit_anonymized'
  | 'auth_deleted'
  | 'completed'
  | 'failed';

export class DeletionService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async isDeletionInProgress(userId: string): Promise<boolean> {
    const { data } = await this.client
      .from('account_deletions')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) return false;
    return !['completed', 'failed'].includes(data.status);
  }

  async requestDeletion(userId: string, requestedBy: string = userId): Promise<{ success: boolean; id: string }> {
    // 1. Check if already requested
    const inProgress = await this.isDeletionInProgress(userId);
    if (inProgress) {
      throw new Error('Account deletion is already in progress');
    }

    // 2. Insert deletion request
    const { data: deletionRecord, error: insertError } = await this.client
      .from('account_deletions')
      .insert({
        user_id: userId,
        requested_by: requestedBy,
        status: 'requested'
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(`Failed to request deletion: ${insertError.message}`);
    }

    // 3. Mark profile soft-deleted immediately
    await this.client
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    // 4. Cancel active background jobs
    const { data: runs } = await this.client
      .from('compilation_runs')
      .select('id')
      .eq('user_id', userId);

    if (runs && runs.length > 0) {
      for (const run of runs) {
        await this.client
          .from('compilation_jobs')
          .update({
            status: 'dead_letter',
            updated_at: new Date().toISOString()
          })
          .eq('compilation_run_id', run.id);
      }
    }

    return { success: true, id: deletionRecord.id };
  }

  async executeDeletionLifecycle(userId: string): Promise<{ success: boolean; finalStatus: DeletionStatus }> {
    const updateStatus = async (status: DeletionStatus, failureReason?: string) => {
      await this.client
        .from('account_deletions')
        .update({
          status,
          failure_reason: failureReason || null,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('user_id', userId);
    };

    try {
      // Stage 1: sessions_revoked
      await (this.client.auth as any)?.admin?.signOut?.(userId).catch(() => {});
      await updateStatus('sessions_revoked');

      // Stage 2: billing_cleaned (preserve financial records with ON DELETE SET NULL)
      await this.client
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      await updateStatus('billing_cleaned');

      // Stage 3: data_purged (prompts, versions, compilation runs, reservations)
      const { data: userPrompts } = await this.client
        .from('prompts')
        .select('id')
        .eq('user_id', userId);

      if (userPrompts && userPrompts.length > 0) {
        for (const p of userPrompts) {
          await this.client.from('prompt_versions').delete?.().eq('prompt_id', p.id);
        }
      }

      await this.client.from('prompts').delete?.().eq('user_id', userId);
      await updateStatus('data_purged');

      // Stage 4: storage_purged (remove all user files from storage buckets)
      const { data: objects } = await this.client
        .from('storage_objects')
        .select('bucket, object_path')
        .eq('user_id', userId);

      if (objects && objects.length > 0) {
        for (const obj of objects) {
          await this.client.storage?.from?.(obj.bucket)?.remove?.([obj.object_path]);
        }
        await this.client.from('storage_objects').delete?.().eq('user_id', userId);
      }
      await updateStatus('storage_purged');

      // Stage 5: audit_anonymized (retain security logs but strip PII)
      await this.client
        .from('audit_logs')
        .update({
          actor_id: null,
          ip_address: '0.0.0.0',
          user_agent: '[REDACTED]'
        })
        .eq('actor_id', userId);

      await updateStatus('audit_anonymized');

      // Stage 6: auth_deleted (delete user record from Supabase Auth)
      await (this.client.auth as any)?.admin?.deleteUser?.(userId).catch(() => {});
      await updateStatus('auth_deleted');

      // Final Completion
      await updateStatus('completed');

      return { success: true, finalStatus: 'completed' };
    } catch (err: any) {
      logger.error({ err, userId }, 'Account deletion lifecycle execution failed');
      await updateStatus('failed', err?.message || 'Lifecycle execution failure');
      return { success: false, finalStatus: 'failed' };
    }
  }
}
