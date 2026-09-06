/**
 * PromptArchitect AI - Frontend Typed API Client
 * Connects React 19 UI to Express backend with automatic error normalization and fallback resilience.
 */
import type { TargetFormat } from '../types/prompt';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  domain: string;
  summary: string;
  recommended_agent: string;
  diagnostic_score: number;
  default_stack: string[];
  canonical_spec?: any;
  prompt_a?: string;
  prompt_b?: string;
}

export interface UsageQuota {
  user_id: string;
  tier: string;
  date: string;
  prompts_used_today: number;
  daily_limit: number;
  prompts_remaining: number;
  resets_at: string;
}

/**
 * Standard HTTP fetch helper with 8-second timeout.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const apiService = {
  /**
   * Check backend health status
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/health`, {}, 3000);
      if (!res.ok) return false;
      const json = await res.json();
      return json.status === 'ok';
    } catch {
      return false;
    }
  },

  /**
   * Pre-compile requirements analysis & scoring
   */
  async analyzePrompt(rawInput: string, targetAgent: TargetFormat = 'antigravity'): Promise<ApiResponse> {
    const res = await fetchWithTimeout(`${API_BASE}/prompts/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raw_input: rawInput,
        target_agent: targetAgent
      })
    });
    return res.json();
  },

  /**
   * Full 7-stage prompt compiler pipeline
   */
  async compilePrompt(
    rawInput: string,
    selectedChips: string[] = [],
    targetAgent: TargetFormat = 'antigravity'
  ): Promise<ApiResponse> {
    const res = await fetchWithTimeout(`${API_BASE}/prompts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raw_input: rawInput,
        selected_chips: selectedChips,
        target_agent: targetAgent
      })
    });
    return res.json();
  },

  /**
   * On-demand adversarial critique & optimization pass (Level 1/2)
   */
  async improvePrompt(
    currentPrompt: string,
    targetAgent: TargetFormat = 'antigravity',
    isSecondPass = false,
    spec?: any
  ): Promise<ApiResponse> {
    const res = await fetchWithTimeout(`${API_BASE}/prompts/improve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_prompt: currentPrompt,
        target_agent: targetAgent,
        is_second_pass: isSecondPass,
        requirement_spec: spec
      })
    });
    return res.json();
  },

  /**
   * Fetch curated enterprise template catalog
   */
  async fetchTemplates(category?: string, search?: string): Promise<TemplateItem[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchWithTimeout(`${API_BASE}/templates${qs}`);
    if (!res.ok) throw new Error(`Failed to fetch templates: ${res.statusText}`);
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch single template by ID
   */
  async fetchTemplateById(id: string): Promise<TemplateItem | null> {
    const res = await fetchWithTimeout(`${API_BASE}/templates/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  },

  /**
   * Save compiled prompt to user library (Authenticated)
   */
  async savePrompt(promptData: any, token = 'dev_user_token'): Promise<ApiResponse> {
    const res = await fetchWithTimeout(`${API_BASE}/prompts/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(promptData)
    });
    return res.json();
  },

  /**
   * Fetch user's saved prompt library
   */
  async fetchUserPrompts(token = 'dev_user_token'): Promise<ApiResponse> {
    const res = await fetchWithTimeout(`${API_BASE}/prompts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.json();
  },

  /**
   * Fetch user subscription tier and daily quota status
   */
  async fetchUsage(token = 'dev_user_token'): Promise<UsageQuota | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }
};

export default apiService;
