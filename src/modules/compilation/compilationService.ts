import { createHash } from 'crypto';
import {
  compilePipeline,
  type CompilerContext,
  COMPILER_VERSION,
  type CompiledPipelineOutput
} from '@promptarchitect/compiler';
import type { CompilationRepository } from './compilationRepository.js';
import type { QuotaRepository } from '../quota/quotaRepository.js';
import type { IdempotencyService } from '../idempotency/idempotencyService.js';
import type { AIClient } from '../../providers/ai/aiClient.js';
import type { AuthUser } from '../auth/types.js';
import type { CompileRequest, CompileResponse } from '../../schemas/compile.js';
import { logger } from '../../infrastructure/observability/logger.js';

export interface CompilationServiceDeps {
  compilationRepo: CompilationRepository;
  quotaRepo: QuotaRepository;
  idempotencyService?: IdempotencyService;
  aiClient: AIClient;
}

export class CompilationService {
  constructor(private readonly deps: CompilationServiceDeps) {}

  async compile(
    user: AuthUser,
    request: CompileRequest,
    options?: {
      requestId?: string;
      idempotencyKey?: string;
      deadlineMs?: number;
    }
  ): Promise<CompileResponse> {
    const requestId = options?.requestId || crypto.randomUUID();
    const targetAgent = request.target || 'antigravity';
    const inputHash = createHash('sha256').update(request.prompt).digest('hex');

    // 1. Idempotency Check
    if (options?.idempotencyKey && this.deps.idempotencyService) {
      const lockRes = await this.deps.idempotencyService.checkAndLock(
        user.id,
        '/api/v1/compile',
        options.idempotencyKey,
        request
      );

      if (!lockRes.allowed) {
        if (lockRes.isCached && lockRes.responseBody) {
          return {
            ...(lockRes.responseBody as unknown as CompileResponse),
            cached: true
          };
        }
        if (lockRes.error) {
          const err: any = new Error(lockRes.error.message);
          err.statusCode = lockRes.error.statusCode;
          err.code = lockRes.error.code;
          throw err;
        }
      }
    }

    // 2. Create Initial Compilation Run Record
    const run = await this.deps.compilationRepo.createCompilationRun({
      userId: user.id,
      requestId,
      promptInput: request.prompt,
      inputHash,
      options: request.options as any,
      compilerVersion: COMPILER_VERSION,
      schemaVersion: '1.0.0',
      adapterVersion: '1.0.0',
      modelProvider: 'google',
      modelName: 'gemini-1.5-flash',
      modelPolicyVersion: '2026-Q3-v1',
      pricingVersion: '2026-Q3-v1',
      entitlementVersion: '2026-Q3-v1'
    });

    let reservationId: string | undefined;

    try {
      // 3. Reserve Quota
      const quotaRes: any = await this.deps.quotaRepo.reserveQuota(run.id, user.id, 1);
      reservationId = quotaRes?.reservation_id;

      // 4. Update Run to running
      await this.deps.compilationRepo.updateCompilationRun(run.id, {
        status: 'running',
        startedAt: new Date().toISOString()
      });

      // 5. Construct CompilerContext
      const compilerContext: CompilerContext = {
        requirementModel: this.deps.aiClient,
        deadlineAt: Date.now() + (options?.deadlineMs || 30000)
      };

      const selectedChips: string[] = request.options?.clarifications
        ? Object.values(request.options.clarifications)
        : [];

      // 6. Execute Pure 7-Stage Compiler Pipeline
      const output: CompiledPipelineOutput = await compilePipeline(
        request.prompt,
        selectedChips,
        targetAgent,
        compilerContext
      );

      // Estimated tokens and cost
      const inputTokens = Math.ceil(request.prompt.length / 4);
      const outputTokens = Math.ceil((output.prompt_a.length + output.prompt_b.length) / 4);
      const estimatedCostUsd = ((inputTokens * 0.00000015) + (outputTokens * 0.0000006)).toFixed(6);

      // 7. Commit Quota
      if (reservationId) {
        await this.deps.quotaRepo.commitQuota(reservationId, inputTokens + outputTokens, parseFloat(estimatedCostUsd));
      }

      const responsePayload: CompileResponse = {
        success: true,
        runId: run.id,
        score: {
          overall: output.diagnostic_score,
          breakdown: output.score_breakdown
        },
        clarifications: output.clarification_chips.map((c) => ({
          id: c.id,
          question: c.question,
          options: c.options
        })),
        canonicalSpec: output.requirement_spec as unknown as Record<string, unknown>,
        dialectOutputs: {
          prompt_a: output.prompt_a,
          prompt_b: output.prompt_b,
          native_code: output.native_code,
          schema_json: output.schema_json
        },
        cached: false
      };

      // 8. Update Run to completed
      await this.deps.compilationRepo.updateCompilationRun(run.id, {
        status: 'completed',
        result: responsePayload as any,
        completedAt: new Date().toISOString(),
        inputTokens,
        outputTokens,
        estimatedCostUsd,
        actualCostUsd: estimatedCostUsd
      });

      // 9. Complete Idempotency Lock
      if (options?.idempotencyKey && this.deps.idempotencyService) {
        await this.deps.idempotencyService.complete(
          user.id,
          '/api/v1/compile',
          options.idempotencyKey,
          200,
          responsePayload as any
        );
      }

      return responsePayload;
    } catch (err: any) {
      logger.error({ err, runId: run.id }, 'Compilation failed, initiating quota refund');

      // Refund quota if reserved
      if (reservationId) {
        try {
          await this.deps.quotaRepo.refundQuota(reservationId, err?.message || 'compilation_failed');
        } catch (refundErr) {
          logger.error({ refundErr, reservationId }, 'Failed to refund quota after compilation error');
        }
      }

      // Mark run failed
      await this.deps.compilationRepo.updateCompilationRun(run.id, {
        status: 'failed',
        errorMessage: err?.message || 'Internal compilation error',
        completedAt: new Date().toISOString()
      });

      // Fail idempotency lock
      if (options?.idempotencyKey && this.deps.idempotencyService) {
        await this.deps.idempotencyService.fail(user.id, '/api/v1/compile', options.idempotencyKey);
      }

      throw err;
    }
  }
}
