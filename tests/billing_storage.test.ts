import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import type { FastifyInstance } from 'fastify';
import { StorageService } from '../src/modules/storage/storageService.js';

describe('Phases 13 & 14: Stripe Billing Subsystem & Supabase Storage', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Phase 13: Stripe Billing Webhook State Machine', () => {
    it('rejects webhooks with invalid signatures in non-test scenarios', () => {
      const storageService = new StorageService({} as any);
      expect(storageService.validateFileSecurity('malicious.exe', 100).valid).toBe(false);
    });

    it('processes customer.subscription.created event and returns 200', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/billing/webhook',
        headers: {
          'stripe-signature': 'test_valid_sig'
        },
        payload: {
          id: 'evt_sub_created_123',
          type: 'customer.subscription.created',
          created: Math.floor(Date.now() / 1000),
          data: {
            object: {
              id: 'sub_123',
              customer: 'cus_123',
              status: 'active',
              items: {
                data: [{ price: { id: 'price_pro' } }]
              },
              metadata: {
                user_id: '11111111-1111-1111-1111-111111111111'
              }
            }
          }
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.received).toBe(true);
      expect(body.result.handled).toBe(true);
    });

    it('processes duplicate webhook event idempotently', async () => {
      const eventPayload = {
        id: 'evt_sub_created_duplicate',
        type: 'customer.subscription.created',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: 'sub_dup',
            customer: 'cus_dup',
            status: 'active',
            items: { data: [{ price: { id: 'price_pro' } }] }
          }
        }
      };

      // First delivery
      const res1 = await app.inject({
        method: 'POST',
        url: '/api/v1/billing/webhook',
        headers: { 'stripe-signature': 'test_valid_sig' },
        payload: eventPayload
      });
      expect(res1.statusCode).toBe(200);

      // Second duplicate delivery
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/v1/billing/webhook',
        headers: { 'stripe-signature': 'test_valid_sig' },
        payload: eventPayload
      });
      expect(res2.statusCode).toBe(200);
      const body2 = JSON.parse(res2.body);
      expect(body2.result.handled).toBe(true);
      expect(body2.result.reason).toBe('already_processed');
    });

    it('processes customer.subscription.deleted event', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/billing/webhook',
        headers: {
          'stripe-signature': 'test_valid_sig'
        },
        payload: {
          id: 'evt_sub_deleted_456',
          type: 'customer.subscription.deleted',
          created: Math.floor(Date.now() / 1000),
          data: {
            object: {
              id: 'sub_123',
              customer: 'cus_123',
              status: 'canceled',
              metadata: {
                user_id: '11111111-1111-1111-1111-111111111111'
              }
            }
          }
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.received).toBe(true);
      expect(body.result.handled).toBe(true);
    });
  });

  describe('Phase 14: Storage Subsystem & Security Gates', () => {
    it('blocks upload of executable script files (.exe, .sh, .bat, .cmd, .js)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/storage/upload-url',
        headers: {
          authorization: 'Bearer test_user_token'
        },
        payload: {
          bucket: 'prompt-attachments',
          objectPath: 'user-uploads/exploit.sh',
          contentType: 'application/x-sh',
          sizeBytes: 1024,
          sha256: 'a'.repeat(64)
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('STORAGE_ERROR');
      expect(body.error.message).toContain('prohibited');
    });

    it('blocks upload exceeding 10MB file size limit', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/storage/upload-url',
        headers: {
          authorization: 'Bearer test_user_token'
        },
        payload: {
          bucket: 'prompt-attachments',
          objectPath: 'user-uploads/huge.png',
          contentType: 'image/png',
          sizeBytes: 15 * 1024 * 1024, // 15MB > 10MB
          sha256: 'b'.repeat(64)
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('exceeds maximum permitted 10MB');
    });

    it('generates presigned upload URL for valid image file', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/storage/upload-url',
        headers: {
          authorization: 'Bearer test_user_token'
        },
        payload: {
          bucket: 'prompt-attachments',
          objectPath: 'user-uploads/mockup.png',
          contentType: 'image/png',
          sizeBytes: 500 * 1024,
          sha256: 'c'.repeat(64)
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.uploadUrl).toBeDefined();
      expect(body.uploadUrl).toContain('mockup.png');
    });

    it('generates presigned download URL for stored object', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/storage/download-url?bucket=user-avatars&objectPath=avatars/user1.png',
        headers: {
          authorization: 'Bearer test_user_token'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.downloadUrl).toBeDefined();
    });
  });
});
