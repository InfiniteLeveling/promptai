import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import type { FastifyInstance } from 'fastify';
import { verifyToken } from '../src/modules/auth/authService.js';

describe('Phase 8: Supabase Auth & Anonymous Lifecycle Management', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });

    // Register a test route with optional authentication
    app.get(
      '/test/optional-auth',
      {
        preHandler: [app.optionalAuthenticate]
      },
      async (request) => {
        return {
          authenticated: Boolean(request.user),
          user: request.user
        };
      }
    );

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated requests to protected endpoints with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me'
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects requests with malformed Authorization headers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: 'Basic dXNlcjpwYXNz'
      }
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('authenticates valid test user token and populates user session context', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: 'Bearer test_user_token'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.user).toBeDefined();
    expect(body.user.id).toBe('11111111-1111-1111-1111-111111111111');
    expect(body.user.role).toBe('user');
    expect(body.user.tier).toBe('free');
    expect(body.user.isAnonymous).toBe(false);
  });

  it('authenticates admin token with elevated role', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: 'Bearer test_admin_token'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.user.role).toBe('admin');
    expect(body.user.tier).toBe('developer');
  });

  it('authenticates anonymous user with isAnonymous flag preserved', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: 'Bearer test_anonymous_token'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.user.isAnonymous).toBe(true);
  });

  it('allows optional authentication endpoint without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test/optional-auth'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.authenticated).toBe(false);
    expect(body.user).toBeNull();
  });

  it('populates user in optional authentication endpoint when token provided', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test/optional-auth',
      headers: {
        authorization: 'Bearer test_user_token'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.authenticated).toBe(true);
    expect(body.user.id).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('security gate: rejects legacy dev_user_token when NODE_ENV is production', async () => {
    const prevEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const result = await verifyToken('dev_user_token');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('UNAUTHORIZED');
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });
});
