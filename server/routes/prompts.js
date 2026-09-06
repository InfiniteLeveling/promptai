/**
 * Prompts API Router
 * Endpoints for prompt analysis, compilation, and optimization.
 */
import { Router } from 'express';
import { sanitizePromptInput } from '../middleware/sanitize.js';
import { analyzePrompt } from '../controllers/promptController.js';

const router = Router();

/**
 * @route   POST /api/prompts/analyze
 * @desc    Analyze raw requirement input, generate CanonicalRequirementSpec & diagnostic score
 * @access  Public
 */
router.post('/analyze', sanitizePromptInput, analyzePrompt);

export default router;
