import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import type { FastifyInstance } from 'fastify';

describe('Phase 17: Legacy API Compatibility Layer (15 Endpoints)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /api/health emits status and RFC deprecation headers', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health'
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['deprecation']).toBe('@1798761600');
    expect(res.headers['sunset']).toBe('Thu, 31 Dec 2026 23:59:59 GMT');
    expect(res.headers['link']).toContain('</api/v1/compile>');

    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(body.version).toBe('3.0.0');
  });

  it('2. POST /api/prompts/analyze synthesizes spec and diagnostic score', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/prompts/analyze',
      payload: {
        raw_input: 'Build a fintech payment reconciler in Node.js',
        target_agent: 'antigravity'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.spec_id).toBeDefined();
    expect(body.data.diagnostic_score).toBeGreaterThan(0);
    expect(body.data.clarification_chips).toBeInstanceOf(Array);
    expect(body.data.requirement_spec).toBeDefined();
  });

  it('3. POST /api/prompts/generate executes 7-stage compiler pipeline', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/prompts/generate',
      payload: {
        raw_input: 'Build an offline-first mobile sync engine',
        selected_chips: ['Strict Schema Validation'],
        target_agent: 'cursor'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.prompt_a).toBeDefined();
    expect(body.data.prompt_b).toBeDefined();
    expect(body.data.diagnostic_score).toBeGreaterThan(80);
    expect(body.data.requirement_spec).toBeDefined();
  });

  it('4. POST /api/prompts/improve executes on-demand critic & optimizer', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/prompts/improve',
      payload: {
        current_prompt: 'Basic CRUD backend',
        target_agent: 'antigravity',
        is_second_pass: true
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.total_score).toBe(100);
    expect(body.data.adversarial_critique).toBeDefined();
  });

  let savedPromptId: string;

  it('5. POST /api/prompts/save saves deliverable to user library', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/prompts/save',
      headers: {
        authorization: 'Bearer test_user_token'
      },
      payload: {
        title: 'Legacy Saved Architecture',
        description: 'Testing backwards compatibility',
        category: 'Fintech',
        prompt_a: '# Prompt A Spec',
        prompt_b: '# Prompt B Spec',
        diagnostic_score: 98
      }
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    savedPromptId = body.data.id;
  });

  it('6. GET /api/prompts lists user saved prompts', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/prompts',
      headers: {
        authorization: 'Bearer test_user_token'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('7. GET /api/prompts/:id retrieves single saved prompt', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/prompts/${savedPromptId}`,
      headers: {
        authorization: 'Bearer test_user_token'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(savedPromptId);
    expect(body.data.title).toBe('Legacy Saved Architecture');
  });

  it('8. DELETE /api/prompts/:id deletes saved prompt', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/prompts/${savedPromptId}`,
      headers: {
        authorization: 'Bearer test_user_token'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Deleted successfully');
  });

  it('9. GET /api/templates lists enterprise architecture templates', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/templates'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(5);
    expect(body.data[0].id).toBeDefined();
    expect(body.data[0].summary).toBeDefined();
  });

  it('10. GET /api/templates/:id retrieves single template', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/templates/tpl_payment_reconciler'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Autonomous Payment Reconciliation Engine');
  });

  it('11. POST /api/ingest/github parses repository details', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/ingest/github',
      payload: {
        repo_url: 'https://github.com/fastify/fastify'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.repo).toBe('fastify');
    expect(body.data.detected_stack).toContain('TypeScript');
  });

  it('12. GET /api/ingest/icons resolves SVG vector icon badges', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/ingest/icons?stacks=react,typescript'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(2);
    expect(body.data[0].svg_url).toContain('iconify');
  });

  it('13. POST /api/ingest/lint performs grammar and clarity checks', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/ingest/lint',
      payload: {
        text: 'Clean architecture specification text'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.hasErrors).toBe(false);
  });

  it('14. GET /api/ingest/fixtures returns realistic JSON domain fixtures', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/ingest/fixtures?category=ecommerce'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.entity).toBe('User');
    expect(body.data.fixtures.length).toBeGreaterThan(0);
  });

  it('15. GET /api/usage returns quota and tier metrics', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/usage',
      headers: {
        authorization: 'Bearer test_user_token'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.tier).toBeDefined();
    expect(body.data.daily_limit).toBeGreaterThan(0);
    expect(body.data.prompts_remaining).toBeDefined();
  });
});
