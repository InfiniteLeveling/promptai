import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

/**
 * Standard tier-based rate limiter middleware.
 * Default: 60 requests per 1-minute window per IP.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 60, // Limit each IP to 60 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      error_code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Free tier allows 60 requests per minute.',
      details: {
        retry_after_seconds: Math.ceil(req.rateLimit.resetTime ? (req.rateLimit.resetTime.getTime() - Date.now()) / 1000 : 60),
        limit: req.rateLimit.limit,
        current: req.rateLimit.current
      },
      timestamp: new Date().toISOString(),
      request_id: uuidv4()
    });
  }
});
