import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

describe('Phase 7: Fastify API Server Core & Security Middleware', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });

    // Register a test route with strict Zod validation for testing
    app.post(
      '/test/validate',
      {
        schema: {
          body: z.object({
            name: z.string().min(3),
            count: z.number().int().positive()
          })
        }
      },
      async (req) => {
        return { success: true, data: req.body };
      }
    );

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 with status ok and version', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
    expect(body.version).toBe('3.0.0');
    expect(typeof body.uptime).toBe('number');
    expect(typeof body.timestamp).toBe('string');
  });

  it('reflects x-request-id correlation header in responses', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    const reqId = response.headers['x-request-id'];
    expect(reqId).toBeDefined();
    expect(typeof reqId).toBe('string');
    expect(reqId.length).toBeGreaterThan(10);
  });

  it('preserves client-provided x-request-id header', async () => {
    const customId = 'client-req-998877';
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        'x-request-id': customId
      }
    });

    expect(response.headers['x-request-id']).toBe(customId);
  });

  it('returns standardized JSON error format for 404 routes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/non-existent-endpoint'
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.requestId).toBeDefined();
  });

  it('validates request payload using Zod schema and returns 400 for invalid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/test/validate',
      payload: {
        name: 'a', // Too short (min 3)
        count: -5  // Negative
      }
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toBeDefined();
  });

  it('enforces payload body limit of 128KB', async () => {
    const hugePayload = {
      data: 'x'.repeat(130 * 1024) // 130 KB > 128 KB limit
    };

    const response = await app.inject({
      method: 'POST',
      url: '/test/validate',
      payload: hugePayload
    });

    expect(response.statusCode).toBe(413);
  });

  it('applies security headers via Helmet', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });
});
