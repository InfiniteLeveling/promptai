/**
 * User Prompts Controller
 * Handles CRUD operations for saving, listing, retrieving, and deleting prompts in user libraries.
 */
import { storage } from '../services/storage.js';

/**
 * POST /api/prompts/save
 * Saves a compiled prompt deliverable to user's library.
 */
export async function savePrompt(req, res, next) {
  try {
    const userId = req.user.id;
    const promptData = req.body;

    if (!promptData || typeof promptData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PAYLOAD',
        message: 'Prompt payload is required to save.',
        timestamp: new Date().toISOString()
      });
    }

    const saved = storage.savePrompt(userId, promptData);

    // Record usage for saving/compiling
    storage.recordUsage(userId, req.user.tier);

    return res.status(201).json({
      success: true,
      data: saved,
      message: 'Prompt blueprint successfully saved to library.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/prompts
 * Lists saved prompts for the authenticated user with optional pagination and category filtering.
 */
export async function getUserPrompts(req, res, next) {
  try {
    const userId = req.user.id;
    const { category, search, page = 1, limit = 20 } = req.query;

    const result = storage.getUserPrompts(userId, {
      category,
      search,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        total_pages: result.total_pages
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/prompts/:id
 * Retrieves a single saved prompt by ID for the authenticated user.
 */
export async function getPromptById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const prompt = storage.getPromptById(id, userId);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'PROMPT_NOT_FOUND',
        message: `Saved prompt with ID "${id}" was not found or belongs to another user.`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: prompt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/prompts/:id
 * Deletes a saved prompt by ID for the authenticated user.
 */
export async function deletePrompt(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = storage.deletePrompt(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'PROMPT_NOT_FOUND',
        message: `Saved prompt with ID "${id}" was not found or could not be deleted.`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Prompt with ID "${id}" was successfully deleted.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

export default {
  savePrompt,
  getUserPrompts,
  getPromptById,
  deletePrompt
};
