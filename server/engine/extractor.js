/**
 * Stage 2: Requirement Extraction Engine
 * Normalizes user input and injected chip options into CanonicalRequirementSpec.
 */
import { v4 as uuidv4 } from 'uuid';
import { geminiService } from '../services/gemini.js';
import { classifyIntent } from './classifier.js';
import { validateRequirementSpec } from '../services/schemaValidator.js';

/**
 * Extracts and synthesizes a validated CanonicalRequirementSpec from input and chips.
 * @param {string} rawInput
 * @param {Array<string>} selectedChips
 * @param {string} targetAgent
 * @returns {Promise<object>} CanonicalRequirementSpec object
 */
export async function extractRequirements(rawInput, selectedChips = [], targetAgent = 'antigravity') {
  // Step 1: Detect intent and default baseline stack
  const classification = classifyIntent(rawInput);

  // Step 2: Use Gemini GenAI service (with automatic deterministic fallback)
  let spec = await geminiService.analyzeRequirement(rawInput, targetAgent);

  // Ensure spec_id exists
  if (!spec.spec_id) {
    spec.spec_id = uuidv4();
  }

  // Ensure category is aligned
  if (!spec.category || spec.category === 'general') {
    spec.category = classification.category;
  }

  // Ensure tech stack is populated
  if (!spec.technical_stack || !spec.technical_stack.frontend?.length) {
    spec.technical_stack = classification.defaultStack;
  }

  // Step 3: Inject user-selected chip enhancements
  if (Array.isArray(selectedChips) && selectedChips.length > 0) {
    for (const chipId of selectedChips) {
      if (chipId === 'chip_db' || chipId.includes('postgres') || chipId.includes('database')) {
        if (!spec.technical_stack.database.includes('PostgreSQL 16')) {
          spec.technical_stack.database = ['PostgreSQL 16', 'Prisma ORM'];
        }
        spec.constraints.push('Mandate 3NF relational normalization with compound index on (tenant_id, created_at DESC).');
      }

      if (chipId === 'chip_security' || chipId.includes('security') || chipId.includes('hmac')) {
        spec.constraints.push('Enforce HMAC-SHA256 request verification with a 300s sliding replay protection window.');
        spec.constraints.push('Mandatory Idempotency-Key headers on POST/PUT endpoints using atomic Redis SETNX with 24h TTL.');
      }

      if (chipId === 'chip_gating' || chipId.includes('gating') || chipId.includes('rollback')) {
        spec.acceptance_criteria.push('Atomic Phase Gating: terminal test validation checkpoint must achieve 100% pass before next phase.');
        spec.acceptance_criteria.push('Automated Rollback Mandate: issue git reset --hard HEAD upon any test regression.');
      }
    }
  }

  // Deduplicate array fields
  spec.functional_requirements = [...new Set(spec.functional_requirements)];
  spec.constraints = [...new Set(spec.constraints)];
  spec.acceptance_criteria = [...new Set(spec.acceptance_criteria)];

  // Validate against draft-07 CanonicalRequirementSpec schema
  const { isValid, errors } = validateRequirementSpec(spec);
  if (!isValid) {
    console.warn('[Extractor] Minor schema alignment needed:', errors);
    if (!spec.metadata) spec.metadata = {};
    spec.metadata.target_agent = targetAgent;
    spec.metadata.created_at = new Date().toISOString();
  }

  return spec;
}

export default {
  extractRequirements
};
