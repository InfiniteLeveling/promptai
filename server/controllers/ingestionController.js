/**
 * Ingestion & External APIs Controller
 * Handles GitHub repo inspection, Iconify vector icons, and mock data fixtures.
 */
import { inspectRepository } from '../services/github.js';
import { resolveTechIcons, getTechIcon } from '../services/iconify.js';
import { getRealisticFixtures } from '../services/mockData.js';
import { checkGrammar } from '../services/languagetool.js';

/**
 * POST /api/ingest/github
 * Inspects a public GitHub repository to extract stack, dependencies, and file tree.
 */
export async function ingestGitHubRepo(req, res, next) {
  try {
    const { repo_url } = req.body;
    if (!repo_url || typeof repo_url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Field "repo_url" is required (e.g. "https://github.com/owner/repo").'
      });
    }

    const inspection = await inspectRepository(repo_url);

    return res.status(200).json({
      success: true,
      data: inspection,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error.message.includes('Invalid GitHub') || error.message.includes('not found')) {
      return res.status(400).json({
        success: false,
        error: 'GITHUB_INGESTION_ERROR',
        message: error.message
      });
    }
    next(error);
  }
}

/**
 * GET /api/ingest/icons (or /api/icons)
 * Resolves Iconify SVG vector badges for tech stack names.
 */
export async function lookupIcons(req, res, next) {
  try {
    const stacksQuery = req.query.stacks || req.query.stack || '';
    const icons = resolveTechIcons(stacksQuery);

    return res.status(200).json({
      success: true,
      data: icons,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ingest/lint
 * Lints natural language input for typos and grammar before prompt compilation.
 */
export async function lintInput(req, res, next) {
  try {
    const { text } = req.body;
    const result = await checkGrammar(text);

    return res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ingest/fixtures
 * Injects realistic entity JSON fixtures for database contracts.
 */
export async function getFixtures(req, res, next) {
  try {
    const category = req.query.category || 'website';
    const fixtures = await getRealisticFixtures(category);

    return res.status(200).json({
      success: true,
      data: fixtures,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

export default {
  ingestGitHubRepo,
  lookupIcons,
  lintInput,
  getFixtures
};
