/**
 * Template Controller
 * Handles retrieval of curated enterprise architecture prompt blueprints.
 */
import { storage } from '../services/storage.js';

/**
 * GET /api/templates
 * Retrieves curated enterprise prompt templates with optional filtering.
 */
export async function getTemplates(req, res, next) {
  try {
    const { category, search } = req.query;
    const templates = storage.getTemplates({ category, search });

    return res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/templates/:id
 * Retrieves a single enterprise template by ID.
 */
export async function getTemplateById(req, res, next) {
  try {
    const { id } = req.params;
    const template = storage.getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'TEMPLATE_NOT_FOUND',
        message: `Enterprise template with ID "${id}" was not found.`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: template,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getTemplates,
  getTemplateById
};
