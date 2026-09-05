/**
 * PromptArchitect AI — Client State Store & LocalStorage Persistence
 */

const STORAGE_KEYS = {
  THEME: 'promptarchitect_theme',
  TARGET_AGENT: 'promptarchitect_target_agent',
  INGEST_MODE: 'promptarchitect_ingest_mode',
  HISTORY: 'promptarchitect_history'
};

function safeGetStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

function safeSetStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`LocalStorage write failed for key ${key}:`, e);
  }
}

class Store {
  constructor() {
    this.state = {
      theme: safeGetStorage(STORAGE_KEYS.THEME, 'dark'),
      targetAgent: safeGetStorage(STORAGE_KEYS.TARGET_AGENT, 'antigravity'),
      ingestMode: safeGetStorage(STORAGE_KEYS.INGEST_MODE, 'text'),
      rawInput: '',
      activeSampleId: null,
      currentSpec: null,
      selectedChips: {},
      diagnosticScore: 0,
      finalScore: 0,
      scoreBreakdown: null,
      isCompiling: false,
      isCompleted: false,
      history: safeGetStorage(STORAGE_KEYS.HISTORY, [])
    };

    this.listeners = new Set();
  }

  getState() {
    return { ...this.state };
  }

  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // Auto-persist specific preferences
    if (updates.theme && updates.theme !== prevState.theme) {
      safeSetStorage(STORAGE_KEYS.THEME, updates.theme);
      document.documentElement.setAttribute('data-theme', updates.theme);
    }

    if (updates.targetAgent && updates.targetAgent !== prevState.targetAgent) {
      safeSetStorage(STORAGE_KEYS.TARGET_AGENT, updates.targetAgent);
    }

    if (updates.ingestMode && updates.ingestMode !== prevState.ingestMode) {
      safeSetStorage(STORAGE_KEYS.INGEST_MODE, updates.ingestMode);
    }

    if (updates.history) {
      safeSetStorage(STORAGE_KEYS.HISTORY, updates.history);
    }

    this.notify(this.state, prevState);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(state, prevState) {
    for (const listener of this.listeners) {
      try {
        listener(state, prevState);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  addToHistory(item) {
    const history = [item, ...this.state.history.slice(0, 9)];
    this.setState({ history });
  }
}

export const store = new Store();
