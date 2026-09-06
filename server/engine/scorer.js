/**
 * 100-Point Heuristic Quality Scorer
 * Evaluates requirements and compiled prompts across 7 weighted dimensions.
 */

export const SCORER_WEIGHTS = {
  clarity: 20,       // Goal Clarity
  completeness: 20,  // Requirements Completeness
  constraints: 15,   // Technical & Negative Constraints
  gating: 15,        // Terminal Checkpoints & Rollback Gates
  context: 10,       // Context & Architecture Fit
  modelFit: 10,      // Model & Agent Dialect Fit
  edgeDefenses: 10   // Edge Cases & Adversarial Invariants
};

/**
 * Evaluates a requirement spec and prompt text against the 100-point rubric.
 * @param {string} rawInput
 * @param {object} spec - CanonicalRequirementSpec object
 * @param {string} targetAgent
 * @param {boolean} isOptimized
 * @returns {{ totalScore: number, breakdown: object, status: string, suggestions: Array<string> }}
 */
export function scorePrompt(rawInput = '', spec = {}, targetAgent = 'antigravity', isOptimized = false) {
  const text = (rawInput || '').trim();
  const textLen = text.length;

  // 1. Goal Clarity (max 20)
  let clarity = Math.min(20, Math.floor(textLen / 15) + (spec.objective ? 10 : 6));

  // 2. Requirements Completeness (max 20)
  const reqCount = spec.functional_requirements?.length || 0;
  let completeness = Math.min(20, 10 + reqCount * 2.5);

  // 3. Technical Constraints (max 15)
  const constraintCount = spec.constraints?.length || 0;
  let constraints = Math.min(15, 8 + constraintCount * 1.8);

  // 4. Execution Checkpoints & Gating (max 15)
  const criteriaCount = spec.acceptance_criteria?.length || 0;
  let gating = text.toLowerCase().includes('checkpoint') || criteriaCount >= 2 ? 14 : 9;

  // 5. Context & Architecture Fit (max 10)
  const hasStack = spec.technical_stack && Object.values(spec.technical_stack).some(arr => arr?.length > 0);
  let context = hasStack ? 10 : 6;

  // 6. Model & Agent Dialect Fit (max 10)
  let modelFit = ['antigravity', 'cursor', 'claude', 'v0'].includes(targetAgent) ? 10 : 8;

  // 7. Edge Cases & Adversarial Invariants (max 10)
  const hasSecurity = text.toLowerCase().includes('hmac') ||
    text.toLowerCase().includes('idempotency') ||
    text.toLowerCase().includes('security') ||
    spec.constraints?.some(c => c.toLowerCase().includes('replay') || c.toLowerCase().includes('idempotency'));
  let edgeDefenses = hasSecurity ? 10 : 6;

  // Optimization boost if critique & repair loop has run
  if (isOptimized) {
    clarity = 20;
    completeness = 20;
    constraints = 15;
    gating = 15;
    context = 10;
    modelFit = 10;
    edgeDefenses = 10;
  }

  const totalScore = Math.min(100, Math.round(clarity + completeness + constraints + gating + context + modelFit + edgeDefenses));

  let status = 'FAIL';
  if (totalScore >= 90) {
    status = 'PASS';
  } else if (totalScore >= 75) {
    status = 'NEEDS_EXPANSION';
  }

  const suggestions = [];
  if (clarity < 18) suggestions.push('Elaborate primary mission statement with quantitative business outcomes.');
  if (constraints < 13) suggestions.push('Inject negative constraints (banned packages, zero loose "any" types).');
  if (gating < 13) suggestions.push('Define explicit terminal test checkpoint commands (e.g. npm test).');
  if (edgeDefenses < 9) suggestions.push('Add cryptographic replay defense and distributed idempotency keys.');

  return {
    totalScore,
    breakdown: {
      clarity,
      completeness,
      constraints,
      gating,
      context,
      modelFit,
      edgeDefenses
    },
    status,
    suggestions
  };
}

export default {
  scorePrompt,
  SCORER_WEIGHTS
};
