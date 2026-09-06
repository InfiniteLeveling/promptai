import { readFile } from 'fs/promises';
import { createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/infrastructure/database/types.js';
import { toDeterministicUuid } from './migrate-legacy.js';

export interface VerificationResult {
  valid: boolean;
  sourceSha256: string;
  sourcePromptsCount: number;
  dbPromptsCount: number;
  sourceTemplatesCount: number;
  dbBlueprintsCount: number;
  errors: string[];
}

export async function verifyLegacyMigration(
  client: SupabaseClient<Database>,
  dbJsonPath = 'server/data/db.json'
): Promise<VerificationResult> {
  const errors: string[] = [];

  const rawContent = await readFile(dbJsonPath, 'utf8');
  const sourceSha256 = createHash('sha256').update(rawContent).digest('hex');
  const legacyDb = JSON.parse(rawContent);

  const sourcePrompts = Array.isArray(legacyDb.prompts) ? legacyDb.prompts : [];
  const sourceTemplates = Array.isArray(legacyDb.templates) ? legacyDb.templates : [];

  // Verify prompts
  let dbPromptsCount = 0;
  for (const p of sourcePrompts) {
    const uuid = toDeterministicUuid(p.id);
    const { data } = await client
      .from('prompts')
      .select('id, title')
      .eq('id', uuid)
      .maybeSingle();

    if (!data) {
      errors.push(`Prompt ${p.id} (${uuid}) not found in database`);
    } else {
      dbPromptsCount++;
    }
  }

  // Verify templates
  let dbBlueprintsCount = 0;
  for (const t of sourceTemplates) {
    const uuid = toDeterministicUuid(t.id);
    const { data } = await client
      .from('blueprints')
      .select('id, slug')
      .eq('slug', t.id)
      .maybeSingle();

    if (!data) {
      errors.push(`Template blueprint ${t.id} not found in database`);
    } else {
      dbBlueprintsCount++;
    }
  }

  return {
    valid: errors.length === 0,
    sourceSha256,
    sourcePromptsCount: sourcePrompts.length,
    dbPromptsCount,
    sourceTemplatesCount: sourceTemplates.length,
    dbBlueprintsCount,
    errors
  };
}
