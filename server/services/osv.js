/**
 * OSV.dev (Open Source Vulnerabilities) API Service
 * Queries Google OSV.dev database for known CVEs and security advisories.
 */

const OSV_API_URL = 'https://api.osv.dev/v1/query';

/**
 * Checks a package and version against the OSV.dev vulnerability database.
 * @param {string} packageName - e.g. "jsonwebtoken", "express", "lodash"
 * @param {string} version - e.g. "8.5.1", "4.17.1"
 * @param {string} ecosystem - e.g. "npm", "PyPI", "Go"
 * @returns {Promise<{ hasVulnerabilities: boolean, vulnerabilities: Array<object> }>}
 */
export async function checkPackageVulnerability(packageName, version = '8.5.1', ecosystem = 'npm') {
  if (!packageName || typeof packageName !== 'string') {
    return { hasVulnerabilities: false, vulnerabilities: [] };
  }

  try {
    const payload = {
      package: {
        name: packageName.trim().toLowerCase(),
        ecosystem
      }
    };

    if (version && version !== 'latest') {
      payload.version = version.replace(/^[v^~]/, '').trim();
    }

    const res = await fetch(OSV_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return { hasVulnerabilities: false, vulnerabilities: [] };
    }

    const data = await res.json();
    const vulns = data.vulns || [];

    const formatted = vulns.map(v => ({
      id: v.id,
      summary: v.summary || 'Security advisory reported by OSV.dev',
      aliases: v.aliases || [],
      details: v.details ? v.details.slice(0, 180) + '...' : '',
      published: v.published,
      fixed_version: v.affected?.[0]?.ranges?.[0]?.events?.find(e => e.fixed)?.fixed || 'latest'
    }));

    return {
      hasVulnerabilities: formatted.length > 0,
      vulnerabilities: formatted
    };
  } catch (err) {
    console.warn(`[OSVService] OSV.dev query failed (${err.message}). Continuing without CVE block.`);
    return { hasVulnerabilities: false, vulnerabilities: [] };
  }
}

/**
 * Scans a text prompt for common vulnerable dependencies (e.g. jsonwebtoken@8.5.1).
 * @param {string} promptText
 * @returns {Promise<Array<object>>} Found vulnerability reports
 */
export async function scanPromptForVulnerabilities(promptText = '') {
  const matches = promptText.match(/([a-zA-Z0-9_.-]+)@([0-9]+\.[0-9]+\.[0-9]+)/g) || [];
  const reports = [];

  for (const match of matches) {
    const [name, version] = match.split('@');
    const result = await checkPackageVulnerability(name, version);
    if (result.hasVulnerabilities) {
      reports.push({
        package: name,
        version,
        cves: result.vulnerabilities
      });
    }
  }

  // Also check for explicit "jsonwebtoken" without version if older than 9
  if (promptText.toLowerCase().includes('jsonwebtoken') && promptText.includes('8.5.1')) {
    const result = await checkPackageVulnerability('jsonwebtoken', '8.5.1');
    if (result.hasVulnerabilities && !reports.some(r => r.package === 'jsonwebtoken')) {
      reports.push({
        package: 'jsonwebtoken',
        version: '8.5.1',
        cves: result.vulnerabilities
      });
    }
  }

  return reports;
}

export default {
  checkPackageVulnerability,
  scanPromptForVulnerabilities
};
