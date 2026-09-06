/**
 * Prompts API Router
 * Endpoints for prompt analysis, 7-stage compilation, and iterative optimization.
 */
import { Router } from 'express';
import { sanitizePromptInput } from '../middleware/sanitize.js';
import { analyzePrompt, generatePrompt, improvePrompt } from '../controllers/promptController.js';

const router = Router();

/**
 * @route   POST /api/prompts/analyze
 * @desc    Analyze raw input, synthesize CanonicalRequirementSpec & diagnostic score
 */
router.post('/analyze', sanitizePromptInput, analyzePrompt);

/**
 * @route   POST /api/prompts/generate
 * @desc    Execute 7-stage compilation pipeline incorporating selected chips & target dialect
 */
router.post('/generate', sanitizePromptInput, generatePrompt);

/**
 * @route   POST /api/prompts/improve
 * @desc    Trigger on-demand Stage 5/6 Adversarial Critic & Optimizer pass
 */
router.post('/improve', improvePrompt);

export default router;
