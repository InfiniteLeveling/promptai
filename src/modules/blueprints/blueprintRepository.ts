import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../infrastructure/database/types.js';

export type BlueprintRow = Database['public']['Tables']['blueprints']['Row'];
export type CreateBlueprintDTO = Database['public']['Tables']['blueprints']['Insert'];

export class BlueprintRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listBlueprints(filter?: { category?: string; complexity?: string }): Promise<BlueprintRow[]> {
    let query = this.client
      .from('blueprints')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.category) {
      query = query.eq('category', filter.category);
    }

    if (filter?.complexity) {
      query = query.eq('complexity', filter.complexity as BlueprintRow['complexity']);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to list blueprints: ${error.message}`);
    }

    return data || [];
  }

  async getBlueprintBySlug(slug: string): Promise<BlueprintRow | null> {
    const { data, error } = await this.client
      .from('blueprints')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch blueprint by slug ${slug}: ${error.message}`);
    }

    return data;
  }

  async getBlueprintById(id: string): Promise<BlueprintRow | null> {
    const { data, error } = await this.client
      .from('blueprints')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch blueprint by ID ${id}: ${error.message}`);
    }

    return data;
  }

  async createBlueprint(blueprint: CreateBlueprintDTO): Promise<BlueprintRow> {
    const { data, error } = await this.client
      .from('blueprints')
      .insert(blueprint)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create blueprint: ${error.message}`);
    }

    return data;
  }
}
