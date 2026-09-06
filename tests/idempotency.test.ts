import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdempotencyService } from '../src/modules/idempotency/idempotencyService.js';
import { SlidingWindowRateLimiter } from '../src/modules/ratelimit/rateLimiter.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/infrastructure/database/types.js';

describe('Phase 11: Idempotency & Rate Limiting', () => {
  describe('IdempotencyService', () => {
    let mockClient: SupabaseClient<Database>;

    beforeEach(() => {
      mockClient = {
        from: vi.fn()
      } as unknown as SupabaseClient<Database>;
    });

    it('allows fresh request and inserts in_progress lock', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        })
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      (mockClient.from as any).mockReturnValue({
        select: mockSelect,
        insert: mockInsert
      });

      const service = new IdempotencyService(mockClient);
      const res = await service.checkAndLock('user-1', '/api/v1/compile', 'key-123', { prompt: 'hello' });

      expect(res.allowed).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          request_path: '/api/v1/compile',
          idempotency_key: 'key-123',
          status: 'in_progress'
        })
      );
    });

    it('returns deterministic 409 IDEMPOTENCY_KEY_REUSED if payload hash differs', async () => {
      const storedHash = IdempotencyService.computePayloadHash({ prompt: 'original payload' });

      (mockClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    user_id: 'user-1',
                    idempotency_key: 'key-123',
                    request_hash: storedHash,
                    status: 'completed',
                    response_code: 200,
                    response_body: { ok: true }
                  },
                  error: null
                })
              })
            })
          })
        })
      });

      const service = new IdempotencyService(mockClient);
      const res = await service.checkAndLock('user-1', '/api/v1/compile', 'key-123', { prompt: 'tampered payload' });

      expect(res.allowed).toBe(false);
      expect(res.error?.code).toBe('IDEMPOTENCY_KEY_REUSED');
      expect(res.error?.statusCode).toBe(409);
    });

    it('returns cached response if key matches completed request with identical payload', async () => {
      const payload = { prompt: 'identical payload' };
      const hash = IdempotencyService.computePayloadHash(payload);

      (mockClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    user_id: 'user-1',
                    idempotency_key: 'key-123',
                    request_hash: hash,
                    status: 'completed',
                    response_code: 200,
                    response_body: { result: 'cached spec' }
                  },
                  error: null
                })
              })
            })
          })
        })
      });

      const service = new IdempotencyService(mockClient);
      const res = await service.checkAndLock('user-1', '/api/v1/compile', 'key-123', payload);

      expect(res.allowed).toBe(false);
      expect(res.isCached).toBe(true);
      expect(res.responseCode).toBe(200);
      expect(res.responseBody).toEqual({ result: 'cached spec' });
    });
  });

  describe('SlidingWindowRateLimiter', () => {
    it('allows requests within window threshold', () => {
      const limiter = new SlidingWindowRateLimiter({ windowMs: 1000, maxRequests: 3 });

      expect(limiter.check('ip-1').allowed).toBe(true);
      expect(limiter.check('ip-1').allowed).toBe(true);
      expect(limiter.check('ip-1').allowed).toBe(true);
      expect(limiter.check('ip-1').allowed).toBe(false);
    });
  });
});
