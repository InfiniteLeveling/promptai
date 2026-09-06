import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import type { FastifyInstance } from 'fastify';

describe('Phase 12: Compilation Controller & Synchronous Pipeline', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated compilation requests with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/compile',
      payload: {
        prompt: 'Build a fintech invoicing app with stripe'
      }
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects prompts that are too short with 400 validation error', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/compile',
      headers: {
        authorization: 'Bearer test_user_token'
      },
      payload: {
        prompt: 'tiny' // 4 chars < min 5
      }
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('successfully compiles prompt for Antigravity (Two-Prompt Vibe Spec)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/compile',
      headers: {
        authorization: 'Bearer test_user_token'
      },
      payload: {
        prompt: 'Build a multi-tenant payment reconciliation microservice with Supabase and Stripe',
        target: 'antigravity'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    expect(body.success).toBe(true);
    expect(body.runId).toBeDefined();

    // Heuristic Score
    expect(body.score).toBeDefined();
    expect(body.score.overall).toBeGreaterThanOrEqual(70);
    expect(body.score.breakdown).toBeDefined();

    // Clarification Chips
    expect(Array.isArray(body.clarifications)).toBe(true);

    // Canonical AST
    expect(body.canonicalSpec).toBeDefined();
    expect(body.canonicalSpec.appName).toBeDefined();

    // Antigravity Dialect Outputs
    expect(body.dialectOutputs).toBeDefined();
    expect(body.dialectOutputs.prompt_a).toBeDefined();
    expect(body.dialectOutputs.prompt_b).toBeDefined();
    expect(body.dialectOutputs.prompt_a).toContain('ARCHITECTURAL SPECIFICATION');
    expect(body.dialectOutputs.prompt_b).toContain('# AUTONOMOUS AGENT IMPLEMENTATION BLUEPRINT');
    expect(body.dialectOutputs.prompt_b).toContain('<agent_execution_rules>');
  });

  it('compiles prompt for Cursor (.cursorrules dialect)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/compile',
      headers: {
        authorization: 'Bearer test_user_token'
      },
      payload: {
        prompt: 'Create a Flutter mobile crypto wallet with biometric auth',
        target: 'cursor'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.dialectOutputs.prompt_a).toContain('# Architectural Invariants & Execution Rules');
  });

  it('compiles prompt for Claude Code (XML structured tags)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/compile',
      headers: {
        authorization: 'Bearer test_user_token'
      },
      payload: {
        prompt: 'Build an internal cybersecurity monitoring dashboard in React',
        target: 'claude'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.dialectOutputs.prompt_a).toContain('<context>');
    expect(body.dialectOutputs.prompt_a).toContain('<system_role>');
  });

  it('compiles prompt for v0 (Frontend Component Spec)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/compile',
      headers: {
        authorization: 'Bearer test_user_token'
      },
      payload: {
        prompt: 'Design a sleek glassmorphic Kanban board in TailwindCSS',
        target: 'v0'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.dialectOutputs.prompt_a).toContain('React 19 + Tailwind CSS');
    expect(body.dialectOutputs.prompt_a).toContain('## Visual Identity:');
  });

  it('GET /api/v1/blueprints returns enterprise blueprints array', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/blueprints'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body.blueprints)).toBe(true);
  });
});
