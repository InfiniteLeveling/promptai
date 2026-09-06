import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rawBody from 'fastify-raw-body';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
  hasZodFastifySchemaValidationErrors
} from '@fastify/type-provider-zod';
import { randomUUID } from 'crypto';
import { logger } from './infrastructure/observability/logger.js';
import { HealthResponseSchema } from './schemas/api.js';
import { authPlugin } from './modules/auth/authPlugin.js';
import { compilationRoutes } from './modules/compilation/compilationRoutes.js';
import { blueprintRoutes } from './modules/blueprints/blueprintRoutes.js';
import { billingRoutes } from './modules/billing/billingRoutes.js';
import { storageRoutes } from './modules/storage/storageRoutes.js';
import { legacyRoutes } from './compatibility/legacyRoutes.js';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    loggerInstance: logger,
    genReqId: (req) => {
      const incomingId = req.headers['x-request-id'];
      if (typeof incomingId === 'string' && incomingId.trim().length > 0) {
        return incomingId.trim();
      }
      return randomUUID();
    },
    requestIdHeader: 'x-request-id',
    bodyLimit: 128 * 1024, // 128 KB maximum prompt payload
    ...opts
  }).withTypeProvider<ZodTypeProvider>();

  // 1. Set Zod Schema Compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // 2. Security Headers (Helmet)
  await app.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false
  });

  // 3. CORS Configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'https://promptarchitect.ai'];

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'Idempotency-Key']
  });

  // 4. Raw Body Capture (Mandatory for Stripe webhook signature verification)
  await app.register(rawBody, {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true
  });

  // 5. Auth Plugin Registration
  await app.register(authPlugin);

  // 6. Ensure x-request-id is sent back in all responses
  app.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  // 7. Standardized 404 Not Found Handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method}:${request.url} not found`,
        requestId: request.id
      }
    });
  });

  // 8. Global Error Handler
  app.setErrorHandler((error, request, reply) => {
    // Check for Zod schema validation errors
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request payload failed schema validation',
          details: error.validation,
          requestId: request.id
        }
      });
    }

    const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 500;

    if (statusCode >= 500) {
      request.log.error({ err: error, requestId: request.id }, 'Internal server error');
    }

    return reply.status(statusCode).send({
      error: {
        code: error.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
        message: statusCode === 500 && process.env.NODE_ENV === 'production'
          ? 'An internal server error occurred'
          : error.message,
        requestId: request.id
      }
    });
  });

  // 9. Health Check Route
  app.get(
    '/health',
    {
      schema: {
        response: {
          200: HealthResponseSchema
        }
      }
    },
    async () => {
      return {
        status: 'ok' as const,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '3.0.0'
      };
    }
  );

  // 10. Auth User Info Route (Protected)
  app.get(
    '/api/v1/auth/me',
    {
      preHandler: [app.authenticate]
    },
    async (request) => {
      return {
        user: request.user
      };
    }
  );

  // 11. Domain Feature Routes
  await app.register(compilationRoutes);
  await app.register(blueprintRoutes);
  await app.register(billingRoutes);
  await app.register(storageRoutes);
  await app.register(legacyRoutes);

  return app;
}
