/**
 * @promptarchitect/compiler
 * Base Target Format Adapter
 */
import type { CanonicalRequirementSpec } from '@promptarchitect/contracts';

export interface AdaptedOutputs {
  promptA: string;
  promptB: string;
  nativeCode?: string;
  schemaJson?: string;
}

export abstract class BaseAdapter {
  constructor(public readonly name: string) {}

  abstract adapt(spec: CanonicalRequirementSpec, options?: Record<string, unknown>): AdaptedOutputs;
}
