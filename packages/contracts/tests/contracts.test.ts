import { describe, it, expect } from 'vitest';
import { validateCanonicalSpec } from '../src/index.js';

describe('@promptarchitect/contracts - CanonicalRequirementSpec Schema', () => {
  it('validates a correct CanonicalRequirementSpec AST fixture', () => {
    const validSpec = {
      spec_id: '2441aab5-27cc-433e-932b-6e1dada0be39',
      category: 'coding',
      objective: 'Build an enterprise payment reconciler microservice with idempotency guarantees.',
      technical_stack: {
        frontend: [],
        backend: ['Node.js 24 LTS', 'Fastify 5.x', 'TypeScript'],
        database: ['Supabase PostgreSQL'],
        infra: ['Docker', 'Upstash Redis']
      },
      functional_requirements: [
        'Process incoming webhook events with HMAC signature verification',
        'Persist double-entry accounting ledger records'
      ],
      constraints: [
        'Zero tolerance for untyped or loose any types',
        'Database writes must be wrapped in atomic transactions'
      ],
      acceptance_criteria: [
        'Duplicate webhook payloads return 200 without mutating ledger balances',
        'All database queries use parameterized prepared statements'
      ],
      metadata: {
        target_agent: 'antigravity',
        created_at: new Date().toISOString(),
        heuristic_score: 96
      }
    };

    const isValid = validateCanonicalSpec(validSpec);
    expect(isValid).toBe(true);
  });

  it('rejects an invalid AST missing required fields', () => {
    const invalidSpec = {
      spec_id: 'invalid-uuid',
      category: 'coding'
    };

    const isValid = validateCanonicalSpec(invalidSpec);
    expect(isValid).toBe(false);
    expect(validateCanonicalSpec.errors).toBeDefined();
    expect(validateCanonicalSpec.errors!.length).toBeGreaterThan(0);
  });
});
