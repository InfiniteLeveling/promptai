/**
 * Resilient Persistence Engine
 * File-backed JSON store with in-memory caching and Vercel serverless resilience.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { ENTERPRISE_TEMPLATES } from '../models/Template.js';
import { cacheService } from './cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Tier limits definition
export const TIER_LIMITS = {
  free: 5,
  pro: 100,
  developer: 1000
};

class StorageEngine {
  constructor() {
    this.memoryDb = {
      users: [],
      prompts: [],
      templates: [...ENTERPRISE_TEMPLATES],
      usage: {}
    };
    this.isPersisting = true;
    this.init();
  }

  /**
   * Initializes local storage file and hydrates in-memory cache.
   */
  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.memoryDb = {
          users: parsed.users || [],
          prompts: parsed.prompts || [],
          templates: parsed.templates && parsed.templates.length > 0 ? parsed.templates : [...ENTERPRISE_TEMPLATES],
          usage: parsed.usage || {}
        };
      } else {
        this.persist();
      }
    } catch (err) {
      console.warn('[StorageEngine] Disk persistence read-only or restricted. Operating in memory-safe mode:', err.message);
      this.isPersisting = false;
    }
  }

  /**
   * Writes memory DB to disk if writable.
   */
  persist() {
    if (!this.isPersisting) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryDb, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[StorageEngine] Failed to write db.json. Switching to in-memory fallback:', err.message);
      this.isPersisting = false;
    }
  }

  // ============================================================================
  // PROMPTS CRUD
  // ============================================================================

  /**
   * Saves a compiled prompt to user library.
   */
  savePrompt(userId, promptData) {
    const id = promptData.id || `prompt_${uuidv4()}`;
    const timestamp = new Date().toISOString();

    const record = {
      id,
      user_id: userId,
      title: promptData.title || promptData.requirement_spec?.objective?.slice(0, 60) || 'Untitled Blueprint',
      category: promptData.category || promptData.requirement_spec?.category || 'coding',
      target_agent: promptData.target_agent || 'antigravity',
      diagnostic_score: promptData.diagnostic_score || 90,
      spec_id: promptData.spec_id || promptData.requirement_spec?.spec_id || uuidv4(),
      requirement_spec: promptData.requirement_spec || null,
      prompt_a: promptData.prompt_a || '',
      prompt_b: promptData.prompt_b || '',
      native_code: promptData.native_code || '',
      tags: Array.isArray(promptData.tags) ? promptData.tags : [promptData.category || 'coding'],
      created_at: promptData.created_at || timestamp,
      updated_at: timestamp
    };

    // Check if updating existing
    const existingIdx = this.memoryDb.prompts.findIndex(p => p.id === id && p.user_id === userId);
    if (existingIdx >= 0) {
      this.memoryDb.prompts[existingIdx] = { ...this.memoryDb.prompts[existingIdx], ...record };
    } else {
      this.memoryDb.prompts.unshift(record);
    }

    this.persist();
    cacheService.set(`prompt:${id}`, record);
    return record;
  }

  /**
   * Lists user's saved prompts with filtering and pagination.
   */
  getUserPrompts(userId, { category, search, page = 1, limit = 20 } = {}) {
    let items = this.memoryDb.prompts.filter(p => p.user_id === userId);

    if (category && category !== 'all') {
      items = items.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.prompt_a && p.prompt_a.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginated = items.slice(startIndex, startIndex + limit);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      total_pages: Math.ceil(total / limit) || 1,
      items: paginated
    };
  }

  /**
   * Finds a prompt by ID for a user.
   */
  getPromptById(promptId, userId) {
    const cached = cacheService.get(`prompt:${promptId}`);
    if (cached && (cached.user_id === userId || userId === 'admin')) {
      return cached;
    }

    const found = this.memoryDb.prompts.find(p => p.id === promptId && (p.user_id === userId || userId === 'admin'));
    if (found) {
      cacheService.set(`prompt:${promptId}`, found);
    }
    return found || null;
  }

  /**
   * Deletes a prompt by ID.
   */
  deletePrompt(promptId, userId) {
    const initialLen = this.memoryDb.prompts.length;
    this.memoryDb.prompts = this.memoryDb.prompts.filter(p => !(p.id === promptId && p.user_id === userId));

    const deleted = this.memoryDb.prompts.length < initialLen;
    if (deleted) {
      this.persist();
      cacheService.del(`prompt:${promptId}`);
    }
    return deleted;
  }

  // ============================================================================
  // TEMPLATES
  // ============================================================================

  /**
   * Retrieves enterprise templates with optional filtering.
   */
  getTemplates({ category, search } = {}) {
    let items = [...this.memoryDb.templates];

    if (category && category !== 'all') {
      items = items.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q)
      );
    }

    return items;
  }

  /**
   * Retrieves single template by ID.
   */
  getTemplateById(templateId) {
    return this.memoryDb.templates.find(t => t.id === templateId) || null;
  }

  // ============================================================================
  // USAGE & QUOTAS
  // ============================================================================

  /**
   * Gets today's date key formatted as YYYY-MM-DD.
   */
  getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * Calculates midnight UTC reset time.
   */
  getResetTimestamp() {
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * Gets usage quota for a user.
   */
  getUsage(userId, tier = 'free') {
    const dateKey = this.getTodayKey();
    const storageKey = `${userId}_${dateKey}`;
    const used = this.memoryDb.usage[storageKey] || 0;
    const limit = TIER_LIMITS[tier] || TIER_LIMITS.free;
    const remaining = Math.max(0, limit - used);

    return {
      user_id: userId,
      tier,
      date: dateKey,
      prompts_used_today: used,
      daily_limit: limit,
      prompts_remaining: remaining,
      resets_at: this.getResetTimestamp()
    };
  }

  /**
   * Increments prompt usage count for today.
   */
  recordUsage(userId, tier = 'free') {
    const dateKey = this.getTodayKey();
    const storageKey = `${userId}_${dateKey}`;
    const current = this.memoryDb.usage[storageKey] || 0;
    this.memoryDb.usage[storageKey] = current + 1;
    this.persist();

    return this.getUsage(userId, tier);
  }
}

export const storage = new StorageEngine();
export default storage;
