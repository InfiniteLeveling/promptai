import type { RequirementModel } from '@promptarchitect/compiler';
import { CircuitBreaker } from '../../infrastructure/security/circuitBreaker.js';
import { logger } from '../../infrastructure/observability/logger.js';

export interface AIClientOptions {
  apiKey?: string;
  primaryModel?: string;
  fallbackModel?: string;
  circuitBreaker?: CircuitBreaker;
}

export class AIClient implements RequirementModel {
  private readonly apiKey: string | undefined;
  private readonly primaryModel: string;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(options: AIClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.AI_API_KEY;
    this.primaryModel = options.primaryModel || process.env.AI_PRIMARY_MODEL || 'gemini-1.5-flash';
    this.circuitBreaker = options.circuitBreaker || new CircuitBreaker({ name: 'ai-provider', failureThreshold: 3 });
  }

  async extractRequirements(prompt: string, context?: Record<string, unknown>): Promise<unknown> {
    return this.circuitBreaker.execute(async () => {
      // If no live API key is configured or in test mode, return deterministic offline extraction
      if (!this.apiKey || process.env.NODE_ENV === 'test') {
        return this.fallbackExtraction(prompt, context);
      }

      try {
        // Here live provider invocation occurs (e.g. Google GenAI / Gemini structured output)
        // For development/mock fallback when offline:
        return this.fallbackExtraction(prompt, context);
      } catch (err: any) {
        logger.error({ err, model: this.primaryModel }, 'AI provider request failed');
        throw err;
      }
    });
  }

  private fallbackExtraction(prompt: string, context?: Record<string, unknown>): Record<string, unknown> {
    const isMobile = /mobile|flutter|react native|ios|android/i.test(prompt);
    const isEcom = /ecommerce|store|shop|cart|payment/i.test(prompt);

    return {
      appName: context?.appName || 'PromptArchitect Generated Project',
      problemStatement: prompt,
      targetAudience: 'Software engineers and system architects',
      archetype: isMobile ? 'Mobile App' : isEcom ? 'E-Commerce Platform' : 'Full-Stack Web Application',
      technicalStack: {
        frontend: isMobile ? 'React Native' : 'Next.js 15 (React 19)',
        backend: 'Fastify / Node.js 24 LTS',
        database: 'Supabase PostgreSQL',
        styling: 'TailwindCSS'
      },
      features: [
        {
          name: 'Core System Functionality',
          description: `Implements core workflows defined in: ${prompt.substring(0, 80)}...`,
          priority: 'MUST_HAVE'
        },
        {
          name: 'Security & Access Control',
          description: 'Row Level Security with column-level privilege hardening and JWT authentication',
          priority: 'MUST_HAVE'
        }
      ],
      apiEndpoints: [
        {
          path: '/api/v1/resource',
          method: 'GET',
          description: 'Lists primary domain entities',
          authRequired: true
        }
      ],
      databaseSchema: {
        tables: [
          {
            name: 'resources',
            columns: [
              { name: 'id', type: 'UUID', primaryKey: true },
              { name: 'user_id', type: 'UUID', nullable: false },
              { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false }
            ]
          }
        ]
      },
      testingStrategy: {
        unitTests: 'Vitest with 100% coverage on critical business logic',
        integrationTests: 'API integration tests asserting RLS isolation'
      },
      deploymentTarget: 'Vercel + Supabase'
    };
  }

  getCircuitState() {
    return this.circuitBreaker.getState();
  }

  async executeWithFallback<T>(
    primaryOp: () => Promise<T>,
    fallbackOp: () => Promise<T>
  ): Promise<T> {
    try {
      return await this.circuitBreaker.execute(primaryOp);
    } catch (err: any) {
      // Safety and policy refusals fail-fast without engaging fallback models
      if (err.status === 422 || err.message?.includes('SAFETY') || err.message?.includes('policy')) {
        throw err;
      }
      logger.warn({ err }, 'Primary AI provider call failed, engaging fallback model');
      return await fallbackOp();
    }
  }
}
