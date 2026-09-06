/**
 * @promptarchitect/compiler
 * Stage 5: Prompt Critic Engine (Adversarial Red-Team Pass)
 * Audits Candidate Prompt v1 for security loopholes, missing migrations, loose types, and vulnerabilities.
 */
import type { CanonicalRequirementSpec } from '@promptarchitect/contracts';
import type { CompilerContext, PackageReference, VulnerabilityItem } from './interfaces/index.js';

export interface CritiqueResult {
  defects: string[];
  scorePenalty: number;
  passesCritique: boolean;
  vulnerabilityReports: VulnerabilityItem[];
}

/**
 * Red-teams a candidate prompt and canonical spec.
 */
export async function critiquePrompt(
  candidatePrompt = '',
  spec: CanonicalRequirementSpec,
  context?: CompilerContext
): Promise<CritiqueResult> {
  const defects: string[] = [];
  const text = candidatePrompt.toLowerCase();

  // Audit 1: Missing DB Migration or Compound Indexing
  const hasDb = spec.technical_stack?.database && spec.technical_stack.database.length > 0;
  if (hasDb && !text.includes('compound index') && !text.includes('migration')) {
    defects.push('Missing explicit compound index on (tenant_id, created_at DESC) and migration rollback scripts.');
  }

  // Audit 2: Missing Idempotency or Replay Protection
  if (!text.includes('idempotency') || (!text.includes('hmac') && !text.includes('replay'))) {
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

  // Audit 6: External Vulnerability Scanner Integration (Injected via DI)
  const vulnerabilityReports: VulnerabilityItem[] = [];
  if (context?.vulnerabilityScanner) {
    try {
      const packages: PackageReference[] = [];
      const backendPackages = spec.technical_stack?.backend || [];
      for (const pkg of backendPackages) {
        packages.push({ name: pkg, version: 'latest', ecosystem: 'npm' });
      }
      const scanRes = await context.vulnerabilityScanner.scan(packages);
      if (scanRes?.vulnerabilities) {
        for (const vuln of scanRes.vulnerabilities) {
          vulnerabilityReports.push(vuln);
          defects.push(`Security Vulnerability Alert: ${vuln.cveId} - ${vuln.summary}`);
        }
      }
    } catch {
      // Non-blocking scanner pass
    }
  }

  const scorePenalty = defects.length * 4;
  const passesCritique = defects.length === 0;

  return {
    defects,
    scorePenalty,
    passesCritique,
    vulnerabilityReports
  };
}
