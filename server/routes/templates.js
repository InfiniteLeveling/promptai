/**
 * Enterprise Templates API Router
 * Endpoints for browsing and retrieving curated enterprise prompt templates.
 */
import { Router } from 'express';
import { getTemplates, getTemplateById } from '../controllers/templateController.js';

const router = Router();

/**
 * @route   GET /api/templates
 * @desc    Get curated enterprise architecture prompt templates
 */
router.get('/', getTemplates);

/**
 * @route   GET /api/templates/:id
 * @desc    Get single enterprise template details
 */
router.get('/:id', getTemplateById);

export default router;
