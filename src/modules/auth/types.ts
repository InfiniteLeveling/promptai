export interface AuthUser {
  id: string;
  email?: string;
  role: 'user' | 'admin';
  tier: 'free' | 'pro' | 'developer';
  isAnonymous: boolean;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser | null;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    optionalAuthenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
