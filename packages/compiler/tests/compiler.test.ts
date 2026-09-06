import { describe, it, expect } from 'vitest';
import {
  COMPILER_VERSION,
  compilePipeline,
  improvePipeline,
  scorePrompt,
  classifyIntent,
  isolateParameterGaps,
  type CompilerContext
} from '../src/index.js';

describe('@promptarchitect/compiler - 7-Stage Compiler Suite', () => {
  it('exports active compiler version 2.3.0', () => {
    expect(COMPILER_VERSION).toBe('2.3.0');
  });

  it('Stage 1: classifies domain archetypes correctly', () => {
    const webResult = classifyIntent('Build a SaaS web dashboard in React');
    expect(webResult.category).toBe('website');
    expect(webResult.confidence).toBeGreaterThan(0.6);

    const apiResult = classifyIntent('Distributed payment reconciliation microservice API with redis queue');
    expect(apiResult.category).toBe('coding');

    const appResult = classifyIntent('Mobile iOS and Android app with react native expo');
    expect(appResult.category).toBe('app');
  });

  it('Stage 3: generates relevant parameter gap clarification chips', () => {
    const mockSpec = {
      spec_id: 'test-spec',
      category: 'coding' as const,
      objective: 'Build a service',
      technical_stack: { frontend: [], backend: ['Node.js'], database: [], infra: [] },
      functional_requirements: ['Req 1'],
      constraints: [],
      acceptance_criteria: [],
      metadata: { target_agent: 'antigravity', created_at: new Date().toISOString() }
    };

    const chips = isolateParameterGaps(mockSpec, 'A basic service');
    expect(chips.length).toBeGreaterThanOrEqual(3);
    expect(chips.some((c) => c.id === 'chip_db')).toBe(true);
    expect(chips.some((c) => c.id === 'chip_security')).toBe(true);
    expect(chips.some((c) => c.id === 'chip_defaults')).toBe(true);
  });

  it('Heuristic Scorer: evaluates 100-point rubric across 7 dimensions', () => {
    const score = scorePrompt('Detailed prompt with HMAC and checkpoints', {}, 'antigravity', false);
    expect(score.totalScore).toBeGreaterThan(0);
    expect(score.totalScore).toBeLessThanOrEqual(100);
    expect(score.breakdown.clarity).toBeDefined();
    expect(score.breakdown.completeness).toBeDefined();
    expect(score.breakdown.constraints).toBeDefined();
    expect(score.breakdown.gating).toBeDefined();
    expect(score.breakdown.context).toBeDefined();
    expect(score.breakdown.modelFit).toBeDefined();
    expect(score.breakdown.edgeDefenses).toBeDefined();
  });

  it('Full 7-Stage Pipeline: compiles for Google Antigravity adapter', async () => {
    const result = await compilePipeline(
      'Build a distributed payment reconciler with Stripe webhooks',
      ['chip_db', 'chip_security'],
      'antigravity'
    );

    expect(result.compiler_version).toBe('2.3.0');
    expect(result.spec_id).toBeDefined();
    expect(result.prompt_a).toContain('ARCHITECTURAL SPECIFICATION');
    expect(result.prompt_a).toContain('GOOGLE ANTIGRAVITY');
    expect(result.prompt_b).toContain('AUTONOMOUS AGENT IMPLEMENTATION BLUEPRINT');
    expect(result.diagnostic_score).toBeGreaterThanOrEqual(90);
    expect(result.diff_summary.length).toBeGreaterThan(0);
    expect(result.why_better_notes.additions.length).toBeGreaterThan(0);
  });

  it('Adapters: compiles for Cursor, Claude Code, and v0 dialects', async () => {
    const cursorResult = await compilePipeline('Full stack app', [], 'cursor');
    expect(cursorResult.prompt_a).toContain('globs:');
    expect(cursorResult.prompt_a).toContain('alwaysApply: true');

    const claudeResult = await compilePipeline('Autonomous microservice', [], 'claude');
    expect(claudeResult.prompt_a).toContain('<system_role>');
    expect(claudeResult.prompt_a).toContain('<terminal_checkpoint_gates>');

    const v0Result = await compilePipeline('Cyber dashboard UI', [], 'v0');
    expect(v0Result.prompt_a).toContain('Tailwind CSS');
    expect(v0Result.prompt_a).toContain('Cyber-Obsidian');
  });

  it('Dependency Injection: injects external models and scanners via CompilerContext', async () => {
    let scannerCalled = false;
    let modelCalled = false;

    const mockContext: CompilerContext = {
      deadlineAt: Date.now() + 10000,
      requirementModel: {
        extractRequirements: async (prompt) => {
          modelCalled = true;
          return {
            spec_id: 'injected-spec-uuid',
            category: 'coding',
            objective: `Injected objective for ${prompt}`,
            technical_stack: { frontend: ['Vite'], backend: ['Fastify'], database: ['Supabase PostgreSQL'], infra: [] },
            functional_requirements: ['Injected requirement 1'],
            constraints: ['Strict TypeScript'],
            acceptance_criteria: ['100% test pass'],
            metadata: { target_agent: 'antigravity', created_at: new Date().toISOString() }
          };
        }
      },
      vulnerabilityScanner: {
        scan: async () => {
          scannerCalled = true;
          return {
            vulnerabilities: [
              { cveId: 'CVE-2026-TEST', severity: 'HIGH', summary: 'Simulated vulnerability for test' }
            ]
          };
        }
      }
    };

    const result = await compilePipeline('Test Injected Run', [], 'antigravity', mockContext);
    expect(modelCalled).toBe(true);
    expect(scannerCalled).toBe(true);
    expect(result.spec_id).toBe('injected-spec-uuid');
    expect(result.diagnostic_score).toBeGreaterThanOrEqual(90);
  });

  it('Stage 6: improves existing spec on demand', async () => {
    const initialSpec = {
      spec_id: 'improve-test-uuid',
      category: 'coding' as const,
      objective: 'Build an API service',
      technical_stack: { frontend: [], backend: ['Fastify'], database: ['PostgreSQL'], infra: [] },
      functional_requirements: ['Process API requests'],
      constraints: [],
      acceptance_criteria: [],
      metadata: { target_agent: 'antigravity', created_at: new Date().toISOString() }
    };

    const improved = await improvePipeline(initialSpec, 'antigravity', true);
    expect(improved.total_score).toBe(100);
    expect(improved.structural_integrity).toContain('PASS');
    expect(improved.optimizer_log.length).toBeGreaterThan(0);
    expect(improved.prompt_a).toBeDefined();
    expect(improved.prompt_b).toBeDefined();
  });
});
