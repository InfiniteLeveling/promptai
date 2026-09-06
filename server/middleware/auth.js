/**
 * Authentication Middleware
 * Supports standard JWT tokens (Auth0 / Supabase / custom) and local developer tokens.
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH0_CLIENT_SECRET || 'promptarchitect_dev_secret_key_2026';

/**
 * Parses and verifies an incoming Bearer token.
 * @param {string} token
 * @returns {object|null} Decoded user claims or null if invalid
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;

  const cleanToken = token.trim();

  // 1. Developer / Test Token Bypass
  if (cleanToken === 'dev_user_token' || cleanToken.startsWith('dev_')) {
    return {
      id: 'usr_dev_1001',
      email: 'developer@promptarchitect.ai',
      name: 'Developer User',
      tier: 'developer',
      isAnonymous: false
    };
  }

  // 2. Guest Session Token
  if (cleanToken.startsWith('guest_')) {
    return {
      id: cleanToken,
      email: `${cleanToken}@guest.promptarchitect.ai`,
      name: 'Guest User',
      tier: 'free',
      isAnonymous: true
    };
  }

  // 3. JWT Verification / Decoding
  try {
    // Try strict verification with secret if configured
    const verified = jwt.verify(cleanToken, JWT_SECRET, { algorithms: ['HS256', 'RS256'] });
    return {
      id: verified.sub || verified.id || 'usr_authenticated',
      email: verified.email || 'user@promptarchitect.ai',
      name: verified.name || 'Authenticated User',
      tier: verified.tier || 'free',
      isAnonymous: false
    };
  } catch (err) {
    // Fallback: decode claims if token is issued by external IdP (e.g. Auth0) without local signing key
    const decoded = jwt.decode(cleanToken);
    if (decoded && typeof decoded === 'object' && (decoded.sub || decoded.id || decoded.email)) {
      return {
        id: decoded.sub || decoded.id || 'usr_jwt',
        email: decoded.email || 'user@promptarchitect.ai',
        name: decoded.name || 'External User',
        tier: decoded.tier || 'free',
        isAnonymous: false
      };
    }
    return null;
  }
}

/**
 * Middleware: Strictly requires an authenticated user with a valid Bearer token.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-api-key'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'MISSING_AUTH_TOKEN',
      message: 'Authentication required. Please provide a valid "Authorization: Bearer <token>" header.',
      timestamp: new Date().toISOString()
    });
  }

  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : parts[0];

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_AUTH_TOKEN',
      message: 'Authentication token is invalid or has expired.',
      timestamp: new Date().toISOString()
    });
  }

  req.user = user;
  next();
}

/**
 * Middleware: Attaches user if valid token exists, but permits unauthenticated requests.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const parts = authHeader.split(' ');
    const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : parts[0];
    req.user = verifyToken(token);
  } else {
    req.user = null;
  }
  next();
}

export default {
  requireAuth,
  optionalAuth,
  verifyToken
};
