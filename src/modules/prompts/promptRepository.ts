import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '../../infrastructure/database/types.js';

export type PromptRow = Database['public']['Tables']['prompts']['Row'];
export type PromptVersionRow = Database['public']['Tables']['prompt_versions']['Row'];

export interface CreatePromptInput {
  userId: string;
  title: string;
  description?: string | null;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  inputPrompt: string;
  canonicalSpec: Json;
  dialectOutputs: Json;
  heuristicScore: number;
}

export interface CreateVersionInput {
  inputPrompt: string;
  canonicalSpec: Json;
  dialectOutputs: Json;
  heuristicScore: number;
}

export interface PromptWithVersions extends PromptRow {
  versions: PromptVersionRow[];
}

export class PromptRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listUserPrompts(
    userId: string,
    options?: { isPublicOnly?: boolean; limit?: number; offset?: number }
  ): Promise<PromptRow[]> {
    let query = this.client
      .from('prompts')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (options?.isPublicOnly) {
      query = query.eq('is_public', true);
    } else {
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    }

    if (options?.limit) {
      const from = options.offset || 0;
      query = query.range(from, from + options.limit - 1);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to list prompts: ${error.message}`);
    }

    return data || [];
  }

  async getPromptWithVersions(promptId: string, requesterUserId?: string): Promise<PromptWithVersions | null> {
    const { data: prompt, error: promptError } = await this.client
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .is('deleted_at', null)
      .maybeSingle();

    if (promptError) {
      throw new Error(`Failed to fetch prompt ${promptId}: ${promptError.message}`);
    }

    if (!prompt) return null;

    // Check visibility
    if (!prompt.is_public && prompt.user_id !== requesterUserId) {
      return null;
    }

    const { data: versions, error: versionsError } = await this.client
      .from('prompt_versions')
      .select('*')
      .eq('prompt_id', promptId)
      .order('version_number', { ascending: true });

    if (versionsError) {
      throw new Error(`Failed to fetch versions for prompt ${promptId}: ${versionsError.message}`);
    }

    return {
      ...prompt,
      versions: versions || []
    };
  }

  async createPrompt(input: CreatePromptInput): Promise<PromptWithVersions> {
    // 1. Insert prompt
    const { data: prompt, error: promptError } = await this.client
      .from('prompts')
      .insert({
        user_id: input.userId,
        title: input.title,
        description: input.description || null,
        category: input.category || 'General',
        tags: input.tags || [],
        is_public: input.isPublic ?? false
      })
      .select('*')
      .single();

    if (promptError || !prompt) {
      throw new Error(`Failed to create prompt: ${promptError?.message}`);
    }

    // 2. Insert initial version (version_number = 1)
    const { data: version, error: versionError } = await this.client
      .from('prompt_versions')
      .insert({
        prompt_id: prompt.id,
        version_number: 1,
        input_prompt: input.inputPrompt,
        canonical_spec: input.canonicalSpec,
        dialect_outputs: input.dialectOutputs,
        heuristic_score: input.heuristicScore
      })
      .select('*')
      .single();

    if (versionError || !version) {
      throw new Error(`Failed to create initial prompt version: ${versionError?.message}`);
    }

    return {
      ...prompt,
      versions: [version]
    };
  }

  async createPromptVersion(
    promptId: string,
    userId: string,
    input: CreateVersionInput
  ): Promise<PromptVersionRow> {
    // Verify prompt ownership
    const { data: prompt, error: promptError } = await this.client
      .from('prompts')
      .select('id, user_id')
      .eq('id', promptId)
      .is('deleted_at', null)
      .single();

    if (promptError || !prompt) {
      throw new Error(`Prompt not found: ${promptId}`);
    }

    if (prompt.user_id !== userId) {
      throw new Error('Unauthorized: cannot add version to a prompt you do not own');
    }

    // Determine next version number
    const { data: latestVersion } = await this.client
      .from('prompt_versions')
      .select('version_number')
      .eq('prompt_id', promptId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (latestVersion?.version_number || 0) + 1;

    const { data: version, error: versionError } = await this.client
      .from('prompt_versions')
      .insert({
        prompt_id: promptId,
        version_number: nextVersion,
        input_prompt: input.inputPrompt,
        canonical_spec: input.canonicalSpec,
        dialect_outputs: input.dialectOutputs,
        heuristic_score: input.heuristicScore
      })
      .select('*')
      .single();

    if (versionError || !version) {
      throw new Error(`Failed to create prompt version ${nextVersion}: ${versionError?.message}`);
    }

    // Touch parent prompt updated_at
    await this.client
      .from('prompts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', promptId);

    return version;
  }

  async updatePrompt(
    promptId: string,
    userId: string,
    update: { title?: string; description?: string; category?: string; tags?: string[]; isPublic?: boolean }
  ): Promise<PromptRow> {
    const { data, error } = await this.client
      .from('prompts')
      .update({
        ...(update.title !== undefined ? { title: update.title } : {}),
        ...(update.description !== undefined ? { description: update.description } : {}),
        ...(update.category !== undefined ? { category: update.category } : {}),
        ...(update.tags !== undefined ? { tags: update.tags } : {}),
        ...(update.isPublic !== undefined ? { is_public: update.isPublic } : {}),
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to update prompt ${promptId}: ${error?.message}`);
    }

    return data;
  }

  async deletePrompt(promptId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('prompts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', promptId)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to delete prompt ${promptId}: ${error.message}`);
    }
  }
}
