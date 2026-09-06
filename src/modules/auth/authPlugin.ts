import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { verifyToken } from './authService.js';
import type { AuthUser } from './types.js';

function extractToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.trim().split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1].trim();
  }

  return null;
}

const authPluginAsync: FastifyPluginAsync = async (fastify) => {
  // Decorate request with user property
  fastify.decorateRequest('user', null);

  // Mandatory Authentication Hook
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const token = extractToken(request);

      if (!token) {
        return reply.status(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authorization header with Bearer token is required',
            requestId: request.id
          }
        });
      }

      const result = await verifyToken(token);

      if (!result.valid || !result.user) {
        const statusCode = result.errorCode === 'ACCOUNT_DELETED' ? 403 : 401;
        return reply.status(statusCode).send({
          error: {
            code: result.errorCode || 'UNAUTHORIZED',
            message: result.errorMessage || 'Invalid or expired authentication token',
            requestId: request.id
          }
        });
      }

      request.user = result.user;
    }
  );

  // Optional Authentication Hook (For endpoints accessible to both anonymous and authenticated)
  fastify.decorate(
    'optionalAuthenticate',
    async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
      const token = extractToken(request);
      if (!token) {
        request.user = null;
        return;
      }

      const result = await verifyToken(token);
      if (result.valid && result.user) {
        request.user = result.user;
      } else {
        request.user = null;
      }
    }
  );
};

export const authPlugin = fp(authPluginAsync, {
  name: 'promptarchitect-auth',
  fastify: '5.x'
});
