/**
 * @promptarchitect/contracts
 * Authoritative CanonicalRequirementSpec AST Definitions and Ajv Draft-07 Validator
 */



export interface TechnicalStack {
  frontend: string[];
  backend: string[];
  database: string[];
  infra: string[];
  [key: string]: string[] | undefined;
}

export interface SpecMetadata {
  target_agent: string;
  created_at: string;
  heuristic_score?: number;
  schema_repaired?: boolean;
  [key: string]: unknown;
}

export interface CanonicalRequirementSpec {
  spec_id: string;
  category:
    | 'website'
    | 'coding'
    | 'debugging'
    | 'image'
    | 'video'
    | 'app'
    | 'agent'
    | 'research'
    | 'writing'
    | 'education'
    | 'general';
  objective: string;
  technical_stack: TechnicalStack;
  functional_requirements: string[];
  constraints: string[];
  acceptance_criteria: string[];
  metadata: SpecMetadata;
}

import type { ValidateFunction } from 'ajv';
import _Ajv from 'ajv';
import _addFormats from 'ajv-formats';
import canonicalSpecSchema from './canonicalRequirementSpec.json' with { type: 'json' };

export { canonicalSpecSchema };

const AjvClass: any = (_Ajv as any).default || _Ajv;
const addFormatsFn: any = (_addFormats as any).default || _addFormats;

const ajv = new AjvClass({ allErrors: true, strict: false });
addFormatsFn(ajv);
export const validateCanonicalSpec: ValidateFunction<CanonicalRequirementSpec> = ajv.compile(canonicalSpecSchema);

export function assertValidCanonicalSpec(data: unknown): asserts data is CanonicalRequirementSpec {
  const valid = validateCanonicalSpec(data);
  if (!valid) {
    const errorMsg = validateCanonicalSpec.errors
      ?.map((err: { instancePath?: string; message?: string }) => `${err.instancePath || ''} ${err.message || ''}`)
      .join(', ');
    throw new Error(`CanonicalRequirementSpec schema violation: ${errorMsg}`);
  }
}
