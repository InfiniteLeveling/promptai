/**
 * Ingestion & Developer Intelligence API Router
 * Endpoints for GitHub repo analysis, SVG icon lookup, grammar linting, and fixtures.
 */
import { Router } from 'express';
import {
  ingestGitHubRepo,
  lookupIcons,
  lintInput,
  getFixtures
} from '../controllers/ingestionController.js';

const router = Router();

/**
 * @route   POST /api/ingest/github
 * @desc    Inspect GitHub repository to extract tech stack, dependencies, and file tree
 */
router.post('/github', ingestGitHubRepo);

/**
 * @route   GET /api/ingest/icons
 * @desc    Lookup Iconify SVG vector badges for tech stack names
 */
router.get('/icons', lookupIcons);

/**
 * @route   POST /api/ingest/lint
 * @desc    Pre-flight grammar and clarity linter
 */
router.post('/lint', lintInput);

/**
 * @route   GET /api/ingest/fixtures
 * @desc    Get realistic JSON fixtures matching domain archetype
 */
router.get('/fixtures', getFixtures);

export default router;
