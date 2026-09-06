/**
 * @promptarchitect/compiler
 * v0 by Vercel Target Format Adapter
 * Outputs single-file React 19 + Tailwind CSS component specifications with mock data invariants.
 */
import type { CanonicalRequirementSpec } from '@promptarchitect/contracts';
import { BaseAdapter, type AdaptedOutputs } from './base.js';

export class V0Adapter extends BaseAdapter {
  constructor() {
    super('v0');
  }

  adapt(spec: CanonicalRequirementSpec, _options: Record<string, unknown> = {}): AdaptedOutputs {
    const functional = (spec.functional_requirements || []).map((r) => `- ${r}`).join('\n');
    const constraints = (spec.constraints || []).map((c) => `- ${c}`).join('\n');

    const nativeCode = `Create a responsive, modern dark-mode application in React 19 + Tailwind CSS + Lucide React.

## Mission Objective:
${spec.objective}

## Visual Identity:
- Theme: Cyber-Obsidian dark mode (#080b11 background, #0f1523 cards, #161f36 borders).
- Accents: Neon Indigo (#6366f1) and Electric Cyan (#06b6d4).
- Modern typography, glassmorphic card overlays, and subtle hover micro-animations.

## Required Features:
${functional}

## UI & Data Invariants:
- All mock data must be strongly typed with TypeScript interfaces.
- Zero external backend assumptions; provide robust local state with React hooks.
- Mobile-first responsive layout with accessible keyboard navigation (ARIA).
${constraints}`;

    const schemaJson = JSON.stringify(spec, null, 2);

    return {
      promptA: nativeCode,
      promptB: nativeCode,
      nativeCode,
      schemaJson
    };
  }
}
