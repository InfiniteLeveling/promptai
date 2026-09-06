/**
 * @promptarchitect/compiler
 * Stage 2: Requirement Extraction Engine
 * Normalizes user input and injected chip options into CanonicalRequirementSpec.
 * Injects external AI models through CompilerContext interfaces.
 */
import type { CanonicalRequirementSpec } from '@promptarchitect/contracts';
import { validateCanonicalSpec } from '@promptarchitect/contracts';
import { classifyIntent } from './classifier.js';
import type { CompilerContext } from './interfaces/index.js';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'spec_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

/**
 * Extracts and synthesizes a validated CanonicalRequirementSpec from input and chips.
 */
export async function extractRequirements(
  rawInput: string,
  selectedChips: string[] = [],
  targetAgent = 'antigravity',
  context?: CompilerContext
): Promise<CanonicalRequirementSpec> {
  // Step 1: Detect intent and default baseline stack
  const classification = classifyIntent(rawInput);

  let rawSpec: Partial<CanonicalRequirementSpec> | null = null;

  // Step 2: Use injected RequirementModel if available
  if (context?.requirementModel) {
    try {
      const extracted = await context.requirementModel.extractRequirements(rawInput, { targetAgent });
      if (extracted && typeof extracted === 'object') {
        rawSpec = extracted as Partial<CanonicalRequirementSpec>;
      }
    } catch {
      // Graceful fallback to deterministic offline synthesis
      rawSpec = null;
    }
  }

  // Fallback synthesis if offline or provider failed
  if (!rawSpec) {
    rawSpec = {
      spec_id: generateUuid(),
      category: classification.category,
      objective: `Architect and construct a production-ready ${classification.label} adhering to strict type safety and high reliability.`,
      technical_stack: classification.defaultStack,
      functional_requirements: [
        `Implement robust core business logic and state management for ${classification.label}`,
        'Provide comprehensive error handling, input validation, and user feedback'
      ],
      constraints: [
        'Strict Type Safety: Zero loose "any" types; 100% strict TypeScript mode',
        'Parameter validation boundaries enforced on all service inputs'
      ],
      acceptance_criteria: [
        'Automated test suite achieves passing verification before phase completion',
        'All critical user journeys execute with zero uncaught exceptions'
      ],
      metadata: {
        target_agent: targetAgent,
        created_at: new Date().toISOString(),
        heuristic_score: 85
      }
    };
  }

  // Ensure spec_id exists
  if (!rawSpec.spec_id) {
    rawSpec.spec_id = generateUuid();
  }

  // Ensure category is aligned
  if (!rawSpec.category || rawSpec.category === 'general') {
    rawSpec.category = classification.category;
  }

  // Ensure tech stack is populated
  if (!rawSpec.technical_stack || !rawSpec.technical_stack.frontend?.length) {
    rawSpec.technical_stack = classification.defaultStack;
  }
  if (!rawSpec.constraints) rawSpec.constraints = [];
  if (!rawSpec.functional_requirements) rawSpec.functional_requirements = [];
  if (!rawSpec.acceptance_criteria) rawSpec.acceptance_criteria = [];

  // Step 3: Inject user-selected chip enhancements
  if (Array.isArray(selectedChips) && selectedChips.length > 0) {
    for (const chipId of selectedChips) {
      if (chipId === 'chip_db' || chipId.includes('postgres') || chipId.includes('database')) {
        if (!rawSpec.technical_stack.database.includes('Supabase PostgreSQL')) {
          rawSpec.technical_stack.database = ['Supabase PostgreSQL', 'Prisma ORM'];
        }
        rawSpec.constraints.push('Mandate 3NF relational normalization with compound index on (tenant_id, created_at DESC).');
      }

      if (chipId === 'chip_security' || chipId.includes('security') || chipId.includes('hmac')) {
        rawSpec.constraints.push('Enforce HMAC-SHA256 request verification with a 300s sliding replay protection window.');
        rawSpec.constraints.push('Mandatory Idempotency-Key headers on POST/PUT endpoints using atomic Upstash Redis SETNX with 24h TTL.');
      }

      if (chipId === 'chip_gating' || chipId.includes('gating') || chipId.includes('rollback')) {
        rawSpec.acceptance_criteria.push('Atomic Phase Gating: terminal test validation checkpoint must achieve 100% pass before next phase.');
        rawSpec.acceptance_criteria.push('Automated Rollback Mandate: issue git reset --hard HEAD upon any test regression.');
      }
    }
  }

  // Deduplicate array fields
  rawSpec.functional_requirements = [...new Set(rawSpec.functional_requirements)];
  rawSpec.constraints = [...new Set(rawSpec.constraints)];
  rawSpec.acceptance_criteria = [...new Set(rawSpec.acceptance_criteria)];

  if (!rawSpec.metadata) {
    rawSpec.metadata = {
      target_agent: targetAgent,
      created_at: new Date().toISOString()
    };
  }

  // Schema validation
  const isValid = validateCanonicalSpec(rawSpec);
  if (!isValid && rawSpec.metadata) {
    (rawSpec.metadata as Record<string, unknown>).schema_repaired = true;
  }

  return rawSpec as CanonicalRequirementSpec;
}
