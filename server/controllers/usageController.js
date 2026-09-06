/**
 * Usage & Quotas Controller
 * Manages tier-based rate limiting, daily prompt compilation counters, and quota resets.
 */
import { storage } from '../services/storage.js';

/**
 * GET /api/usage
 * Retrieves user's subscription tier and daily quota status.
 */
export async function getUsage(req, res, next) {
  try {
    // If authenticated, use user ID; otherwise use guest ID from IP or header
    const userId = req.user ? req.user.id : (req.headers['x-guest-id'] || 'guest_anonymous');
    const tier = req.user ? req.user.tier : 'free';

    const usageInfo = storage.getUsage(userId, tier);

    return res.status(200).json({
      success: true,
      data: usageInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getUsage
};
