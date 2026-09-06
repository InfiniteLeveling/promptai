/**
 * Stage 5: Prompt Critic Engine (Adversarial Red-Team Pass)
 * Audits Candidate Prompt v1 for security loopholes, missing migrations, loose types, and missing rollback checkpoints.
 */

/**
 * Red-teams a candidate prompt and canonical spec.
 * @param {string} candidatePrompt
 * @param {object} spec
 * @returns {{ defects: Array<string>, scorePenalty: number, passesCritique: boolean }}
 */
export function critiquePrompt(candidatePrompt = '', spec = {}) {
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

  const scorePenalty = defects.length * 4;
  const passesCritique = defects.length === 0;

  return {
    defects,
    scorePenalty,
    passesCritique
  };
}

export default {
  critiquePrompt
};
