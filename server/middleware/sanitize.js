/**
 * Input Sanitization & Prompt Injection Defense Middleware
 * Enforces XML boundaries and guards against jailbreak attempts.
 */

const SUSPICIOUS_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts)/i,
  /output\s+(the\s+)?system\s+prompt\s+(verbatim|completely|entirely)/i,
  /print\s+(your\s+)?(initial|system)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior)\s+(rules|guidelines)/i,
  /bypass\s+(safety|content)\s+filters/i,
  /you\s+are\s+now\s+dan\b/i,
  /jailbreak\s+mode/i,
  /override\s+system\s+instructions/i
];

const ALLOWED_TARGET_AGENTS = [
  'antigravity',
  'cursor',
  'claude',
  'v0',
  'midjourney',
  'twoprompt'
];

/**
 * Escapes XML special characters to prevent boundary escape.
 * @param {string} str
 * @returns {string}
 */
export function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Middleware to sanitize raw prompt inputs and block injection exploits.
 */
export function sanitizePromptInput(req, res, next) {
  const { raw_input, target_agent } = req.body;

  if (typeof raw_input !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_INPUT',
      message: 'Field "raw_input" is required and must be a string.',
      timestamp: new Date().toISOString()
    });
  }

  const trimmed = raw_input.trim();

  // Length boundaries: 5 to 10,000 characters
  if (trimmed.length < 5) {
    return res.status(400).json({
      success: false,
      error: 'INPUT_TOO_SHORT',
      message: 'Prompt input must be at least 5 characters long.',
      timestamp: new Date().toISOString()
    });
  }

  if (trimmed.length > 10000) {
    return res.status(400).json({
      success: false,
      error: 'INPUT_TOO_LONG',
      message: 'Prompt input must not exceed 10,000 characters.',
      timestamp: new Date().toISOString()
    });
  }

  // Check for adversarial prompt injection signatures
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return res.status(400).json({
        success: false,
        error: 'PROMPT_INJECTION_DETECTED',
        message: 'Security Alert: Adversarial prompt injection or directive override detected. Input rejected.',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Validate and normalize target_agent
  const normalizedAgent = (typeof target_agent === 'string' && ALLOWED_TARGET_AGENTS.includes(target_agent.toLowerCase()))
    ? target_agent.toLowerCase()
    : 'antigravity';

  // Store sanitized plain text and escaped XML container
  req.sanitizedInput = trimmed;
  req.escapedXml = escapeXml(trimmed);
  req.wrappedXmlInput = `<raw_user_input>\n${req.escapedXml}\n</raw_user_input>`;
  req.targetAgent = normalizedAgent;

  next();
}
