/**
 * Prompt Controller
 * Handles prompt analysis, 7-stage compilation, and iterative optimization.
 */
import { geminiService } from '../services/gemini.js';
import { validateRequirementSpec } from '../services/schemaValidator.js';
import { compilePipeline, improvePipeline } from '../engine/index.js';
import { scorePrompt } from '../engine/scorer.js';
import { isolateParameterGaps } from '../engine/clarifier.js';

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
      if (!spec.metadata) spec.metadata = {};
      spec.metadata.schema_repaired = true;
    }

    // 3. Compute 7-dimension diagnostic score
    const scoring = scorePrompt(rawInput, spec, targetAgent, false);
    spec.metadata.heuristic_score = scoring.totalScore;

    // 4. Generate dynamic clarification chips with score incentives
    const chips = isolateParameterGaps(spec, rawInput);

    return res.status(200).json({
      success: true,
      data: {
        spec_id: spec.spec_id,
        category: spec.category,
        diagnostic_score: scoring.totalScore,
        score_breakdown: scoring.breakdown,
        clarification_chips: chips,
        requirement_spec: spec
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/prompts/generate
 * Executes the complete 7-Stage Compiler Pipeline, incorporating selected clarification chips.
 */
export async function generatePrompt(req, res, next) {
  try {
    const rawInput = req.sanitizedInput;
    const targetAgent = req.targetAgent || 'antigravity';
    const selectedChips = Array.isArray(req.body.selected_chips) ? req.body.selected_chips : [];

    // Run complete 7-Stage Compiler Pipeline
    const compiledResult = await compilePipeline(rawInput, selectedChips, targetAgent);

    return res.status(200).json({
      success: true,
      data: compiledResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/prompts/improve
 * Triggers on-demand Stage 5/6 Adversarial Critic & Optimizer Pass, boosting score >= 95.
 */
export async function improvePrompt(req, res, next) {
  try {
    const targetAgent = req.targetAgent || req.body.target_agent || 'antigravity';
    const isSecondPass = Boolean(req.body.is_second_pass);

    let spec = req.body.requirement_spec || req.body.spec;

    // If spec is not provided, synthesize from raw_input or current_prompt
    if (!spec || typeof spec !== 'object') {
      const fallbackInput = req.body.current_prompt || req.body.raw_input || 'Production Web Service';
      spec = await geminiService.analyzeRequirement(fallbackInput, targetAgent);
    }

    // Run Stage 6/7 Improvement Pipeline
    const improvedResult = await improvePipeline(spec, targetAgent, isSecondPass);

    return res.status(200).json({
      success: true,
      data: improvedResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

export default {
  analyzePrompt,
  generatePrompt,
  improvePrompt
};
