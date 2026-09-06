/**
 * Usage Quota API Router
 * Endpoints for tracking user tier quotas and remaining daily compilations.
 */
import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { getUsage } from '../controllers/usageController.js';

const router = Router();

/**
 * @route   GET /api/usage
 * @desc    Get current user or guest tier quota and remaining prompts
 */
router.get('/', optionalAuth, getUsage);

export default router;
