import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '../../infrastructure/database/types.js';

export type CompilationRunRow = Database['public']['Tables']['compilation_runs']['Row'];

export interface CreateCompilationRunInput {
  userId: string;
  requestId: string;
  promptInput: string;
  inputHash: string;
  options?: Json;
  compilerVersion: string;
  schemaVersion: string;
  adapterVersion: string;
  modelProvider: string;
  modelName: string;
  modelPolicyVersion: string;
  pricingVersion: string;
  entitlementVersion: string;
  isShadow?: boolean;
}

export interface UpdateCompilationRunInput {
  status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: Json | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd?: string;
  actualCostUsd?: string | null;
  fallbackUsed?: boolean;
}

export class CompilationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async createCompilationRun(input: CreateCompilationRunInput): Promise<CompilationRunRow> {
    const { data, error } = await this.client
      .from('compilation_runs')
      .insert({
        user_id: input.userId,
        request_id: input.requestId,
        prompt_input: input.promptInput,
        input_hash: input.inputHash,
        options: input.options || {},
        status: 'queued',
        compiler_version: input.compilerVersion,
        schema_version: input.schemaVersion,
        adapter_version: input.adapterVersion,
        model_provider: input.modelProvider,
        model_name: input.modelName,
        model_policy_version: input.modelPolicyVersion,
        pricing_version: input.pricingVersion,
        entitlement_version: input.entitlementVersion,
        is_shadow: input.isShadow || false,
        fallback_used: false
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to create compilation run: ${error?.message}`);
    }

    return data;
  }

  async updateCompilationRun(
    runId: string,
    update: UpdateCompilationRunInput
  ): Promise<CompilationRunRow> {
    const updatePayload: Database['public']['Tables']['compilation_runs']['Update'] = {};

    if (update.status) updatePayload.status = update.status;
    if (update.result !== undefined) updatePayload.result = update.result;
    if (update.errorMessage !== undefined) updatePayload.error_message = update.errorMessage;
    if (update.startedAt !== undefined) updatePayload.started_at = update.startedAt;
    if (update.completedAt !== undefined) updatePayload.completed_at = update.completedAt;
    if (update.inputTokens !== undefined) updatePayload.input_tokens = update.inputTokens;
    if (update.outputTokens !== undefined) updatePayload.output_tokens = update.outputTokens;
    if (update.estimatedCostUsd !== undefined) updatePayload.estimated_cost_usd = update.estimatedCostUsd;
    if (update.actualCostUsd !== undefined) updatePayload.actual_cost_usd = update.actualCostUsd;
    if (update.fallbackUsed !== undefined) updatePayload.fallback_used = update.fallbackUsed;

    const { data, error } = await this.client
      .from('compilation_runs')
      .update(updatePayload)
      .eq('id', runId)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to update compilation run ${runId}: ${error?.message}`);
    }

    return data;
  }

  async getCompilationRun(runId: string, userId?: string): Promise<CompilationRunRow | null> {
    let query = this.client
      .from('compilation_runs')
      .select('*')
      .eq('id', runId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`Failed to fetch compilation run ${runId}: ${error.message}`);
    }

    return data;
  }
}
