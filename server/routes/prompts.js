/**
 * Prompts API Router
 * Endpoints for prompt analysis, 7-stage compilation, and iterative optimization.
 */
import { Router } from 'express';
import { sanitizePromptInput } from '../middleware/sanitize.js';
import { requireAuth } from '../middleware/auth.js';
import { analyzePrompt, generatePrompt, improvePrompt } from '../controllers/promptController.js';
import {
  savePrompt,
  getUserPrompts,
  getPromptById,
  deletePrompt
} from '../controllers/userPromptsController.js';

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

/**
 * @route   POST /api/prompts/save
 * @desc    Save compiled prompt to user library (Authenticated)
 */
router.post('/save', requireAuth, savePrompt);

/**
 * @route   GET /api/prompts
 * @desc    List saved prompts for authenticated user
 */
router.get('/', requireAuth, getUserPrompts);

/**
 * @route   GET /api/prompts/:id
 * @desc    Retrieve saved prompt details by ID (Authenticated)
 */
router.get('/:id', requireAuth, getPromptById);

/**
 * @route   DELETE /api/prompts/:id
 * @desc    Delete saved prompt by ID (Authenticated)
 */
router.delete('/:id', requireAuth, deletePrompt);

export default router;
