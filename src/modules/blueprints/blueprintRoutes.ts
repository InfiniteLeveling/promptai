import type { FastifyPluginAsync } from 'fastify';
import { BlueprintRepository } from './blueprintRepository.js';
import { supabaseAdmin } from '../../infrastructure/database/supabaseClient.js';

export const blueprintRoutes: FastifyPluginAsync = async (app) => {
  const repo = new BlueprintRepository(supabaseAdmin);

  // GET /api/v1/blueprints - List Curated Blueprints
  app.get(
    '/api/v1/blueprints',
    async (request, reply) => {
      const query = request.query as { category?: string; complexity?: string };
      const blueprints = await repo.listBlueprints(query);
      return reply.status(200).send({ blueprints });
    }
  );

  // GET /api/v1/blueprints/:slug - Fetch Blueprint by Slug
  app.get(
    '/api/v1/blueprints/:slug',
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const blueprint = await repo.getBlueprintBySlug(slug);

      if (!blueprint) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Blueprint ${slug} not found`,
            requestId: request.id
          }
        });
      }

      return reply.status(200).send({ blueprint });
    }
  );
};
