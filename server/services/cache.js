/**
 * In-Memory LRU Cache Service
 * High-speed caching for compiled blueprints, templates, and quota counters.
 */
import { LRUCache } from 'lru-cache';

// Master in-memory LRU cache
const memoryCache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24 // 24 hours default TTL
});

export const cacheService = {
  /**
   * Get an item from cache
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    return memoryCache.get(key);
  },

  /**
   * Set an item in cache with optional TTL
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlMs]
   */
  set(key, value, ttlMs) {
    if (ttlMs) {
      memoryCache.set(key, value, { ttl: ttlMs });
    } else {
      memoryCache.set(key, value);
    }
  },

  /**
   * Check if key exists in cache
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return memoryCache.has(key);
  },

  /**
   * Delete item from cache
   * @param {string} key
   */
  del(key) {
    memoryCache.delete(key);
  },

  /**
   * Clear all items in cache
   */
  clear() {
    memoryCache.clear();
  },

  /**
   * Current number of entries
   */
  get size() {
    return memoryCache.size;
  }
};

export default cacheService;
