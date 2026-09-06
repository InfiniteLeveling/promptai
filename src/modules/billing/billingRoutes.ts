import type { FastifyPluginAsync } from 'fastify';
import { BillingService } from './billingService.js';
import { supabaseAdmin } from '../../infrastructure/database/supabaseClient.js';

export const billingRoutes: FastifyPluginAsync = async (app) => {
  const billingService = new BillingService(supabaseAdmin);

  // POST /api/v1/billing/webhook - Stripe Webhook Ingestion
  app.post(
    '/api/v1/billing/webhook',
    {
      config: {
        rawBody: true
      }
    },
    async (request, reply) => {
      const sigHeader = request.headers['stripe-signature'] as string | undefined;
      const rawBody = (request as any).rawBody || JSON.stringify(request.body);

      const isValid = billingService.verifySignature(rawBody, sigHeader);
      if (!isValid) {
        return reply.status(400).send({
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Stripe webhook HMAC signature verification failed',
            requestId: request.id
          }
        });
      }

      const eventPayload = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      const result = await billingService.processWebhookEvent(eventPayload);

      return reply.status(200).send({ received: true, result });
    }
  );
};
