/**
 * Cursor IDE Target Format Adapter
 * Outputs .cursorrules and .cursor/rules/*.mdc format with strict YAML frontmatter.
 */
import { BaseAdapter } from './base.js';

export class CursorAdapter extends BaseAdapter {
  constructor() {
    super('cursor');
  }

  adapt(spec, options = {}) {
    const constraints = (spec.constraints || [])
      .map(c => `- ${c}`)
      .join('\n');

    const acceptance = (spec.acceptance_criteria || [])
      .map(a => `- Checkpoint: ${a}`)
      .join('\n');

    const nativeCode = `---
description: Auto-compiled rules for ${spec.category} project (${spec.spec_id})
globs: ["src/**/*.ts", "test/**/*.ts", "prisma/**/*.prisma"]
alwaysApply: true
---
# Architectural Invariants & Execution Rules

## Objective
${spec.objective}

## Core Guardrails
- PRE-FLIGHT: Read directory tree before modifying or creating any file.
- TYPE SAFETY: Never use \`any\`. Enforce strict TypeScript and Zod schema boundaries.
${constraints}

## Checkpoint Commands
- Build & Typecheck: \`npm run build && npm run typecheck\`
- Test Checkpoint: \`npm test\`
${acceptance}

## Failure Recovery
- In case of test failure, immediately roll back changes with \`git reset --hard HEAD\` and investigate.`;

    const schemaJson = JSON.stringify(spec, null, 2);

    return {
      promptA: nativeCode,
      promptB: nativeCode,
      nativeCode,
      schemaJson
    };
  }
}

export default CursorAdapter;
