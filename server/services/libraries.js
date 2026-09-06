/**
 * Libraries & Package Deprecation Validator
 * Detects deprecated, unmaintained, or legacy packages and suggests modern replacements.
 */

export const KNOWN_DEPRECATIONS = {
  'request': {
    replacement: 'native fetch / axios',
    reason: 'The `request` library has been fully deprecated since February 2020.'
  },
  'node-uuid': {
    replacement: 'uuid (v11+)',
    reason: '`node-uuid` was renamed and deprecated in favor of `uuid`.'
  },
  'tslint': {
    replacement: 'typescript-eslint / oxlint',
    reason: '`tslint` has been deprecated in favor of ESLint TypeScript plugins.'
  },
  'body-parser': {
    replacement: 'express.json() / express.urlencoded()',
    reason: 'Standalone `body-parser` is built into Express v4.16+.'
  },
  'moment': {
    replacement: 'date-fns / dayjs',
    reason: '`moment.js` is in maintenance-only mode with significant bundle size overhead.'
  }
};

/**
 * Checks a package name against known deprecation databases.
 * @param {string} packageName
 * @returns {{ isDeprecated: boolean, replacement?: string, reason?: string }}
 */
export function checkPackageDeprecation(packageName) {
  if (!packageName) return { isDeprecated: false };
  const lower = packageName.trim().toLowerCase();
  if (KNOWN_DEPRECATIONS[lower]) {
    return {
      isDeprecated: true,
      ...KNOWN_DEPRECATIONS[lower]
    };
  }
  return { isDeprecated: false };
}

/**
 * Scans a prompt string or tech stack array for deprecated packages.
 * @param {string|Array<string>} textOrPackages
 * @returns {Array<object>} Deprecation alerts
 */
export function scanForDeprecations(textOrPackages) {
  const alerts = [];
  const text = Array.isArray(textOrPackages) ? textOrPackages.join(' ') : (textOrPackages || '');
  const lower = text.toLowerCase();

  for (const [pkg, info] of Object.entries(KNOWN_DEPRECATIONS)) {
    if (lower.includes(pkg)) {
      alerts.push({
        package: pkg,
        replacement: info.replacement,
        reason: info.reason
      });
    }
  }

  return alerts;
}

export default {
  checkPackageDeprecation,
  scanForDeprecations,
  KNOWN_DEPRECATIONS
};
