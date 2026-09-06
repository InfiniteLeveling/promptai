import { z } from 'zod';

export const CompileRequestSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters').max(128 * 1024, 'Prompt exceeds 128KB limit'),
  target: z.enum(['antigravity', 'cursor', 'claude', 'v0']).default('antigravity'),
  options: z
    .object({
      appName: z.string().optional(),
      clarifications: z.record(z.string(), z.string()).optional()
    })
    .optional()
});

export type CompileRequest = z.infer<typeof CompileRequestSchema>;

export const CompileResponseSchema = z
  .object({
    success: z.boolean(),
    runId: z.string(),
    score: z
      .object({
        overall: z.number(),
        breakdown: z.record(z.string(), z.number()).optional()
      })
      .passthrough(),
    clarifications: z.array(z.any()).default([]),
    canonicalSpec: z.any(),
    dialectOutputs: z.any(),
    cached: z.boolean().optional()
  })
  .passthrough();

export type CompileResponse = z.infer<typeof CompileResponseSchema>;
