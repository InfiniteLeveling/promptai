import type { FastifyPluginAsync } from 'fastify';
import { CompileRequestSchema, CompileResponseSchema } from '../../schemas/compile.js';
import { CompilationService } from './compilationService.js';
import { CompilationRepository } from './compilationRepository.js';
import { QuotaRepository } from '../quota/quotaRepository.js';
import { IdempotencyService } from '../idempotency/idempotencyService.js';
import { AIClient } from '../../providers/ai/aiClient.js';
import { supabaseAdmin } from '../../infrastructure/database/supabaseClient.js';

export const compilationRoutes: FastifyPluginAsync = async (app) => {
  const compilationRepo = new CompilationRepository(supabaseAdmin);
  const quotaRepo = new QuotaRepository(supabaseAdmin);
  const idempotencyService = new IdempotencyService(supabaseAdmin);
  const aiClient = new AIClient();

  const compilationService = new CompilationService({
    compilationRepo,
    quotaRepo,
    idempotencyService,
    aiClient
  });

  // POST /api/v1/compile - Synchronous Compilation Pipeline
  app.post(
    '/api/v1/compile',
    {
      preHandler: [app.authenticate],
      schema: {
        body: CompileRequestSchema,
        response: {
          200: CompileResponseSchema
        }
      }
    },
    async (request, reply) => {
      const user = request.user!;
      const idempotencyKey = request.headers['idempotency-key'] as string | undefined;

      const result = await compilationService.compile(user, request.body, {
        requestId: request.id,
        idempotencyKey
      });

      return reply.status(200).send(result);
    }
  );

  // GET /api/v1/compile/:runId - Fetch Run Execution Metadata
  app.get(
    '/api/v1/compile/:runId',
    {
      preHandler: [app.authenticate]
    },
    async (request, reply) => {
      const { runId } = request.params as { runId: string };
      const run = await compilationRepo.getCompilationRun(runId, request.user!.id);

      if (!run) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Compilation run ${runId} not found`,
            requestId: request.id
          }
        });
      }

      return reply.status(200).send({ run });
    }
  );
};
