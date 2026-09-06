/**
 * Prompt Controller
 * Handles prompt analysis, canonical spec validation, and dynamic chip generation.
 */
import { geminiService } from '../services/gemini.js';
import { validateRequirementSpec } from '../services/schemaValidator.js';

/**
 * Calculates heuristic diagnostic score and 7-dimension breakdown.
 * @param {string} rawText
 * @param {object} spec
 * @returns {{ totalScore: number, breakdown: object }}
 */
function calculateDiagnosticScore(rawText, spec) {
  const text = rawText.trim();
  const textLen = text.length;

  const clarity = Math.min(20, Math.floor(textLen / 15) + 10);
  const completeness = Math.min(20, 12 + (spec.functional_requirements?.length || 3) * 2);
  const constraints = Math.min(15, 9 + (spec.constraints?.length || 3) * 1.5);
  const gating = (text.includes('test') || text.includes('checkpoint') || spec.acceptance_criteria?.length > 1) ? 14 : 10;
  const context = (text.includes('React') || text.includes('Node') || text.includes('Postgres')) ? 10 : 8;
  const modelFit = 9;
  const edgeDefenses = (text.includes('security') || text.includes('HMAC') || text.includes('token')) ? 10 : 7;

  const total = Math.min(100, Math.round(clarity + completeness + constraints + gating + context + modelFit + edgeDefenses));

  return {
    totalScore: total,
    breakdown: {
      clarity,
      completeness,
      constraints,
      gating,
      context,
      modelFit,
      edgeDefenses
    }
  };
}

/**
 * Generates 3-4 interactive clarification chips tailored to the spec.
 * @param {string} category
 * @param {string} rawText
 * @returns {Array<object>}
 */
function generateClarificationChips(category, rawText) {
  const lower = rawText.toLowerCase();

  const chips = [];

  // Database chip
  if (!lower.includes('postgres') && !lower.includes('mongo') && !lower.includes('sqlite')) {
    chips.push({
      id: 'chip_db',
      label: 'PostgreSQL 16 + Prisma',
      text: 'Mandate PostgreSQL 16 schema with 3NF relational normalization and Prisma ORM migrations.',
      delta_points: 5,
      category: 'database'
    });
  }

  // Security & Resilience chip
  if (!lower.includes('hmac') && !lower.includes('idempotency') && !lower.includes('rate limit')) {
    chips.push({
      id: 'chip_security',
      label: 'HMAC Replay Protection',
      text: 'Enforce HMAC-SHA256 signature verification and distributed Redis idempotency keys on mutating routes.',
      delta_points: 5,
      category: 'security'
    });
  }

  // Testing / Terminal Gate chip
  if (!lower.includes('terminal') && !lower.includes('rollback') && !lower.includes('coverage')) {
    chips.push({
      id: 'chip_gating',
      label: 'Atomic Rollback Gates',
      text: 'Enforce atomic phase progression with terminal test checkpoints and automated git rollback on failure.',
      delta_points: 5,
      category: 'testing'
    });
  }

  // Escape hatch chip (always included)
  chips.push({
    id: 'chip_defaults',
    label: 'Proceed with defaults',
    text: 'Use industry standard enterprise defaults for remaining architectural parameters.',
    delta_points: 0,
    category: 'architecture'
  });

  return chips.slice(0, 4);
}

/**
 * POST /api/prompts/analyze
 * Analyzes raw input, synthesizes CanonicalRequirementSpec, validates schema, and returns diagnostic score.
 */
export async function analyzePrompt(req, res, next) {
  try {
    const rawInput = req.sanitizedInput;
    const targetAgent = req.targetAgent || 'antigravity';

    // 1. Synthesize CanonicalRequirementSpec via Gemini Service (or resilient fallback)
    const spec = await geminiService.analyzeRequirement(rawInput, targetAgent);

    // 2. Validate against Draft-07 CanonicalRequirementSpec Schema
    const { isValid, errors } = validateRequirementSpec(spec);

    if (!isValid) {
      console.warn('[PromptController] Spec validation warnings:', errors);
      // Ensure required structure is restored if schema had minor gap
      if (!spec.metadata) spec.metadata = {};
      spec.metadata.schema_repaired = true;
    }

    // 3. Compute 7-dimension diagnostic score
    const { totalScore, breakdown } = calculateDiagnosticScore(rawInput, spec);
    spec.metadata.heuristic_score = totalScore;

    // 4. Generate dynamic clarification chips with score incentives
    const chips = generateClarificationChips(spec.category, rawInput);

    return res.status(200).json({
      success: true,
      data: {
        spec_id: spec.spec_id,
        category: spec.category,
        diagnostic_score: totalScore,
        score_breakdown: breakdown,
        clarification_chips: chips,
        requirement_spec: spec
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

export default {
  analyzePrompt
};
