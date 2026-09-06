/**
 * @promptarchitect/compiler
 * Stage 3: Smart Clarification Engine (Heuristic Gap Analyzer)
 * Produces interactive chips to bridge parameter gaps without conversational fatigue.
 */
import type { CanonicalRequirementSpec } from '@promptarchitect/contracts';

export interface ClarificationChip {
  id: string;
  label: string;
  text: string;
  delta_points: number;
  category: 'database' | 'security' | 'testing' | 'architecture';
}

/**
 * Evaluates missing architectural parameters and outputs structured chip recommendations.
 */
export function isolateParameterGaps(
  spec: Partial<CanonicalRequirementSpec>,
  rawInput = ''
): ClarificationChip[] {
  const lower = rawInput.toLowerCase();
  const chips: ClarificationChip[] = [];

  // Gap 1: Database & Persistence
  const hasDb = spec.technical_stack?.database && spec.technical_stack.database.length > 0;
  if (!hasDb || (!lower.includes('postgres') && !lower.includes('mongo') && !lower.includes('mysql') && !lower.includes('supabase'))) {
    chips.push({
      id: 'chip_db',
      label: 'Supabase PostgreSQL + Prisma',
      text: 'Mandate Supabase PostgreSQL schema with 3NF relational normalization and Prisma ORM migrations.',
      delta_points: 5,
      category: 'database'
    });
  }

  // Gap 2: Security & Replay Attacks
  const hasSecurity = spec.constraints?.some(
    (c) => c.toLowerCase().includes('hmac') || c.toLowerCase().includes('idempotency')
  );
  if (!hasSecurity) {
    chips.push({
      id: 'chip_security',
      label: 'HMAC Replay Protection',
      text: 'Enforce HMAC-SHA256 signature verification and distributed Upstash Redis idempotency keys on mutating routes.',
      delta_points: 5,
      category: 'security'
    });
  }

  // Gap 3: Execution Gating & Rollback
  const hasRollback = spec.acceptance_criteria?.some(
    (a) => a.toLowerCase().includes('rollback') || a.toLowerCase().includes('checkpoint')
  );
  if (!hasRollback) {
    chips.push({
      id: 'chip_gating',
      label: 'Atomic Rollback Gates',
      text: 'Enforce atomic phase progression with terminal test checkpoints and automated git rollback on failure.',
      delta_points: 5,
      category: 'testing'
    });
  }

  // Gap 4: Observability & Tracing
  if (chips.length < 3) {
    chips.push({
      id: 'chip_observability',
      label: 'OpenTelemetry Spans',
      text: 'Inject OpenTelemetry distributed tracing and Prometheus RED metrics on all service boundaries.',
      delta_points: 5,
      category: 'architecture'
    });
  }

  // Always include the "Proceed with defaults" escape hatch
  chips.push({
    id: 'chip_defaults',
    label: 'Proceed with defaults',
    text: 'Use industry standard enterprise defaults for remaining architectural parameters.',
    delta_points: 0,
    category: 'architecture'
  });

  return chips.slice(0, 4);
}
