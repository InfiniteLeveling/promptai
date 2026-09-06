import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { StorageService } from './storageService.js';
import { supabaseAdmin } from '../../infrastructure/database/supabaseClient.js';

const UploadUrlSchema = z.object({
  bucket: z.enum(['prompt-attachments', 'user-avatars']),
  objectPath: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  sha256: z.string().length(64)
});

export const storageRoutes: FastifyPluginAsync = async (app) => {
  const storageService = new StorageService(supabaseAdmin);

  // POST /api/v1/storage/upload-url - Generate Presigned Upload URL
  app.post(
    '/api/v1/storage/upload-url',
    {
      preHandler: [app.authenticate],
      schema: {
        body: UploadUrlSchema
      }
    },
    async (request, reply) => {
      const user = request.user!;
      const body = request.body as z.infer<typeof UploadUrlSchema>;

      try {
        const result = await storageService.createPresignedUploadUrl({
          userId: user.id,
          ...body
        });

        return reply.status(200).send(result);
      } catch (err: any) {
        return reply.status(400).send({
          error: {
            code: 'STORAGE_ERROR',
            message: err?.message || 'Failed to create presigned upload URL',
            requestId: request.id
          }
        });
      }
    }
  );

  // GET /api/v1/storage/download-url - Generate Presigned Download URL
  app.get(
    '/api/v1/storage/download-url',
    {
      preHandler: [app.authenticate]
    },
    async (request, reply) => {
      const user = request.user!;
      const query = request.query as { bucket?: string; objectPath?: string };

      if (!query.bucket || !query.objectPath) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Both bucket and objectPath query parameters are required',
            requestId: request.id
          }
        });
      }

      try {
        const downloadUrl = await storageService.createPresignedDownloadUrl(
          user.id,
          query.bucket,
          query.objectPath
        );

        return reply.status(200).send({ downloadUrl });
      } catch (err: any) {
        return reply.status(403).send({
          error: {
            code: 'UNAUTHORIZED_STORAGE_ACCESS',
            message: err?.message || 'Access to storage object denied',
            requestId: request.id
          }
        });
      }
    }
  );
};
