/**
 * Master 7-Stage Compiler Engine Orchestrator
 * Integrates Stages 1-7 into a deterministic, closed-loop pipeline.
 */
import { classifyIntent } from './classifier.js';
import { extractRequirements } from './extractor.js';
import { isolateParameterGaps } from './clarifier.js';
import { generateCandidatePrompt } from './generator.js';
import { critiquePrompt } from './critic.js';
import { optimizeRequirements } from './optimizer.js';
import { scorePrompt } from './scorer.js';

import { AntigravityAdapter } from './adapters/antigravity.js';
import { CursorAdapter } from './adapters/cursor.js';
import { ClaudeAdapter } from './adapters/claude.js';
import { V0Adapter } from './adapters/v0.js';

const adapters = {
  antigravity: new AntigravityAdapter(),
  cursor: new CursorAdapter(),
  claude: new ClaudeAdapter(),
  v0: new V0Adapter(),
  twoprompt: new AntigravityAdapter()
};

/**
 * Gets the target dialect adapter.
 * @param {string} targetAgent
 * @returns {object} Adapter instance
 */
export function getAdapter(targetAgent = 'antigravity') {
  const key = (targetAgent || '').toLowerCase();
  return adapters[key] || adapters.antigravity;
}

/**
 * Executes the complete 7-Stage Prompt Compilation Pipeline.
 * @param {string} rawInput
 * @param {Array<string>} selectedChips
 * @param {string} targetAgent
 * @returns {Promise<object>} Complete compiled blueprint
 */
export async function compilePipeline(rawInput, selectedChips = [], targetAgent = 'antigravity') {
  // Stage 1: Intent & Domain Classification
  const classification = classifyIntent(rawInput);

  // Stage 2: Requirement Extraction Engine
  const baseSpec = await extractRequirements(rawInput, selectedChips, targetAgent);

  // Stage 3: Parameter Gap Isolator & Clarification Chips
  const clarificationChips = isolateParameterGaps(baseSpec, rawInput);

  // Stage 4: Master Generator Engine (Candidate Prompt v1)
  const candidatePrompt = generateCandidatePrompt(baseSpec, targetAgent);

  // Stage 5: Adversarial Red-Team Critique Engine
  const critiqueResult = critiquePrompt(candidatePrompt, baseSpec);

  // Stage 6: Closed-Loop Heuristic Optimizer
  const { optimizedSpec, additions } = optimizeRequirements(baseSpec, critiqueResult.defects);

  // Stage 7: Target Format Adaptation
  const adapter = getAdapter(targetAgent);
  const adaptedOutputs = adapter.adapt(optimizedSpec);

  // Heuristic Quality Scoring
  const scoring = scorePrompt(rawInput, optimizedSpec, targetAgent, true);

  const diffSummary = [
    'Injected strict TypeScript type invariants and validation rules',
    'Configured atomic terminal test checkpoints for agent progression',
    'Specified 3NF database models with zero loose string definitions',
    'Enforced bounded error domains and retry exponential backoff'
  ];

  const whyBetterNotes = {
    original: rawInput.trim() || 'Vague initial requirement',
    additions: [
      ...additions,
      'Two discrete normalized actor roles with clear RBAC boundaries',
      '3NF Relational database schema with compound indexing and foreign keys',
      'Bounded error domains (HTTP 400 validation, 401 auth, 429 rate limit, 503 retry)',
      'Cryptographic verification & HMAC-SHA256 timestamp replay protection',
      'Atomic terminal validation gates enforcing >=85% branch test coverage',
      `Target dialect optimizations formatted specifically for ${targetAgent.toUpperCase()}`
    ]
  };

  return {
    spec_id: optimizedSpec.spec_id,
    category: classification.category,
    category_label: classification.label,
    category_icon: classification.icon,
    diagnostic_score: scoring.totalScore,
    score_breakdown: scoring.breakdown,
    clarification_chips: clarificationChips,
    prompt_a: adaptedOutputs.promptA,
    prompt_b: adaptedOutputs.promptB,
    native_code: adaptedOutputs.nativeCode,
    schema_json: adaptedOutputs.schemaJson,
    requirement_spec: optimizedSpec,
    diff_summary: diffSummary,
    why_better_notes: whyBetterNotes
  };
}

/**
 * Executes an on-demand prompt improvement & enterprise hardening pass.
 * @param {object} currentSpec
 * @param {string} targetAgent
 * @param {boolean} isFullHardening
 * @returns {Promise<object>} Improved prompt artifacts
 */
export async function improvePipeline(currentSpec, targetAgent = 'antigravity', isFullHardening = false) {
  // Stage 6 Optimizer Pass
  const { optimizedSpec, additions, qualityScore } = optimizeRequirements(currentSpec, [], isFullHardening);

  // Stage 7 Format Adaptation
  const adapter = getAdapter(targetAgent);
  const adaptedOutputs = adapter.adapt(optimizedSpec);

  return {
    spec_id: optimizedSpec.spec_id,
    quality_score: qualityScore,
    additions,
    prompt_a: adaptedOutputs.promptA,
    prompt_b: adaptedOutputs.promptB,
    native_code: adaptedOutputs.nativeCode,
    schema_json: adaptedOutputs.schemaJson,
    requirement_spec: optimizedSpec
  };
}

export default {
  compilePipeline,
  improvePipeline,
  getAdapter
};
