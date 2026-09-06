import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlueprintRepository } from '../src/modules/blueprints/blueprintRepository.js';
import { PromptRepository } from '../src/modules/prompts/promptRepository.js';
import { QuotaRepository } from '../src/modules/quota/quotaRepository.js';
import { CompilationRepository } from '../src/modules/compilation/compilationRepository.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/infrastructure/database/types.js';

describe('Phase 9: Connection Pooling & Data Repositories', () => {
  let mockClient: SupabaseClient<Database>;

  beforeEach(() => {
    mockClient = {
      from: vi.fn(),
      rpc: vi.fn()
    } as unknown as SupabaseClient<Database>;
  });

  describe('BlueprintRepository', () => {
    it('listBlueprints queries blueprints with ordering and optional filters', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: [{ id: 'bp-1', slug: 'saas', title: 'SaaS', category: 'Backend', complexity: 'Enterprise' }],
        error: null
      });

      (mockClient.from as any).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        eq: mockEq
      });

      const repo = new BlueprintRepository(mockClient);
      const results = await repo.listBlueprints({ category: 'Backend' });

      expect(mockClient.from).toHaveBeenCalledWith('blueprints');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('saas');
    });

    it('getBlueprintBySlug fetches single blueprint', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { id: 'bp-1', slug: 'payment-reconciler', title: 'Payment Reconciler' },
        error: null
      });

      (mockClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      });

      const repo = new BlueprintRepository(mockClient);
      const blueprint = await repo.getBlueprintBySlug('payment-reconciler');

      expect(mockClient.from).toHaveBeenCalledWith('blueprints');
      expect(blueprint).not.toBeNull();
      expect(blueprint?.slug).toBe('payment-reconciler');
    });
  });

  describe('PromptRepository', () => {
    it('createPrompt inserts prompt and version 1 atomically', async () => {
      const mockPromptInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'p-1', user_id: 'u-1', title: 'Test Prompt', is_public: false },
            error: null
          })
        })
      });

      const mockVersionInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'pv-1', prompt_id: 'p-1', version_number: 1, heuristic_score: 95 },
            error: null
          })
        })
      });

      (mockClient.from as any).mockImplementation((table: string) => {
        if (table === 'prompts') return { insert: mockPromptInsert };
        if (table === 'prompt_versions') return { insert: mockVersionInsert };
        return {};
      });

      const repo = new PromptRepository(mockClient);
      const result = await repo.createPrompt({
        userId: 'u-1',
        title: 'Test Prompt',
        inputPrompt: 'Build an API',
        canonicalSpec: { type: 'api' },
        dialectOutputs: { antigravity: 'spec' },
        heuristicScore: 95
      });

      expect(result.id).toBe('p-1');
      expect(result.versions).toHaveLength(1);
      expect(result.versions[0].version_number).toBe(1);
    });

    it('createPromptVersion increments version number correctly', async () => {
      (mockClient.from as any).mockImplementation((table: string) => {
        if (table === 'prompts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'p-1', user_id: 'u-1' },
                    error: null
                  })
                })
              })
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null })
            })
          };
        }
        if (table === 'prompt_versions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { version_number: 2 },
                      error: null
                    })
                  })
                })
              })
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'pv-3', prompt_id: 'p-1', version_number: 3, heuristic_score: 98 },
                  error: null
                })
              })
            })
          };
        }
        return {};
      });

      const repo = new PromptRepository(mockClient);
      const newVersion = await repo.createPromptVersion('p-1', 'u-1', {
        inputPrompt: 'Build an API v2',
        canonicalSpec: { type: 'api', version: 2 },
        dialectOutputs: { antigravity: 'v2' },
        heuristicScore: 98
      });

      expect(newVersion.version_number).toBe(3);
    });

    it('deletePrompt soft-deletes prompt record with deleted_at timestamp', async () => {
      const mockEqUserId = vi.fn().mockReturnValue({
        is: vi.fn().mockResolvedValue({ error: null })
      });
      const mockEqId = vi.fn().mockReturnValue({ eq: mockEqUserId });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqId });

      (mockClient.from as any).mockReturnValue({ update: mockUpdate });

      const repo = new PromptRepository(mockClient);
      await repo.deletePrompt('p-1', 'u-1');

      expect(mockClient.from).toHaveBeenCalledWith('prompts');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: expect.any(String) })
      );
    });
  });

  describe('QuotaRepository', () => {
    it('getUserQuotaStatus calculates remaining compilations accurately', async () => {
      (mockClient.from as any).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { tier: 'pro' },
                    error: null
                  })
                })
              })
            })
          };
        }
        if (table === 'plan_entitlements') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { daily_compilations: 100 },
                      error: null
                    })
                  })
                })
              })
            })
          };
        }
        if (table === 'usage_counters') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { compilations_used: 15, compilations_reserved: 5, tokens_consumed: 3000 },
                    error: null
                  })
                })
              })
            })
          };
        }
        return {};
      });

      const repo = new QuotaRepository(mockClient);
      const status = await repo.getUserQuotaStatus('u-1');

      expect(status.plan).toBe('pro');
      expect(status.dailyLimit).toBe(100);
      expect(status.compilationsUsed).toBe(15);
      expect(status.compilationsReserved).toBe(5);
      expect(status.compilationsRemaining).toBe(80); // 100 - (15 + 5)
    });

    it('reserveQuota invokes reserve_compilation_quota RPC function', async () => {
      (mockClient.rpc as any).mockResolvedValue({
        data: { success: true, reservation_id: 'r-1' },
        error: null
      });

      const repo = new QuotaRepository(mockClient);
      const result = await repo.reserveQuota('run-1', 'user-1', 1);

      expect(mockClient.rpc).toHaveBeenCalledWith('reserve_compilation_quota', {
        p_compilation_run_id: 'run-1',
        p_user_id: 'user-1',
        p_amount: 1
      });
      expect(result).toEqual({ success: true, reservation_id: 'r-1' });
    });
  });

  describe('CompilationRepository', () => {
    it('createCompilationRun records initial queued run', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'run-1', status: 'queued', prompt_input: 'test' },
            error: null
          })
        })
      });

      (mockClient.from as any).mockReturnValue({ insert: mockInsert });

      const repo = new CompilationRepository(mockClient);
      const run = await repo.createCompilationRun({
        userId: 'u-1',
        requestId: 'req-1',
        promptInput: 'test prompt',
        inputHash: 'hash123',
        compilerVersion: '1.0.0',
        schemaVersion: '1.0.0',
        adapterVersion: '1.0.0',
        modelProvider: 'gemini',
        modelName: 'gemini-1.5',
        modelPolicyVersion: '2026-v1',
        pricingVersion: '2026-v1',
        entitlementVersion: '2026-v1'
      });

      expect(mockClient.from).toHaveBeenCalledWith('compilation_runs');
      expect(run.status).toBe('queued');
    });

    it('updateCompilationRun transitions state and updates metadata', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'run-1', status: 'completed', input_tokens: 150, output_tokens: 450 },
              error: null
            })
          })
        })
      });

      (mockClient.from as any).mockReturnValue({ update: mockUpdate });

      const repo = new CompilationRepository(mockClient);
      const updated = await repo.updateCompilationRun('run-1', {
        status: 'completed',
        inputTokens: 150,
        outputTokens: 450,
        completedAt: new Date().toISOString()
      });

      expect(updated.status).toBe('completed');
    });
  });
});
