/**
 * Stage 5: Prompt Critic Engine (Adversarial Red-Team Pass)
 * Audits Candidate Prompt v1 for security loopholes, missing migrations, loose types, and OSV CVE vulnerabilities.
 */
import { scanPromptForVulnerabilities } from '../services/osv.js';
import { scanForDeprecations } from '../services/libraries.js';

/**
 * Red-teams a candidate prompt and canonical spec.
 * @param {string} candidatePrompt
 * @param {object} spec
 * @returns {Promise<{ defects: Array<string>, scorePenalty: number, passesCritique: boolean, cveReports: Array<object> }>}
 */
export async function critiquePrompt(candidatePrompt = '', spec = {}) {
  const defects = [];
  const text = candidatePrompt.toLowerCase();

  // Audit 1: Missing DB Migration or Compound Indexing
  const hasDb = spec.technical_stack?.database?.length > 0;
  if (hasDb && !text.includes('compound index') && !text.includes('migration')) {
    defects.push('Missing explicit compound index on (tenant_id, created_at DESC) and migration rollback scripts.');
  }

  // Audit 2: Missing Idempotency or Replay Protection
  if (!text.includes('idempotency') || !text.includes('hmac') && !text.includes('replay')) {
    defects.push('Lacks distributed idempotency key mandate and HMAC-SHA256 sliding replay defense for mutating routes.');
  }

  // Audit 3: Missing Atomic Terminal Verification Gates
  if (!text.includes('terminal') && !text.includes('npm test') && !text.includes('checkpoint')) {
    defects.push('Missing explicit terminal verification test checkpoints before phase progression.');
  }

  // Audit 4: Missing Automated Rollback Mandate
  if (!text.includes('rollback') && !text.includes('git reset')) {
    defects.push('Lacks autonomous failure recovery mandate (automated git reset --hard HEAD on test failure).');
  }

  // Audit 5: Type Invariants
  if (text.includes('typescript') && !text.includes('zero loose') && !text.includes('any')) {
    defects.push('Does not explicitly forbid loose "any" types or enforce runtime Zod validation boundaries.');
  }

  // Audit 6: OSV.dev CVE Vulnerability Scanner Integration
  let cveReports = [];
  try {
    cveReports = await scanPromptForVulnerabilities(candidatePrompt);
    for (const report of cveReports) {
      const cveIds = report.cves.map(c => c.id).slice(0, 3).join(', ');
      defects.push(`Security Vulnerability Alert: Package "${report.package}@${report.version}" has known CVEs (${cveIds || 'GHSA advisory'}). Upgrade to safe version.`);
    }
  } catch {
    // Non-blocking OSV pass
  }

  // Audit 7: Deprecated packages (Libraries.io)
  const deprecations = scanForDeprecations(candidatePrompt);
  for (const dep of deprecations) {
    defects.push(`Deprecated Package Alert: "${dep.package}" is deprecated. Replace with "${dep.replacement}".`);
  }

  const scorePenalty = defects.length * 4;
  const passesCritique = defects.length === 0;

  return {
    defects,
    scorePenalty,
    passesCritique,
    cveReports
  };
}

export default {
  critiquePrompt
};
