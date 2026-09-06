/**
 * Claude Code XML Format Adapter
 * Outputs standardized XML boundary tags for Claude 3.5 Sonnet / Claude Code CLI.
 */
import { BaseAdapter } from './base.js';

export class ClaudeAdapter extends BaseAdapter {
  constructor() {
    super('claude');
  }

  adapt(spec, options = {}) {
    const tech = spec.technical_stack || {};
    const frontend = (tech.frontend || []).join(', ');
    const backend = (tech.backend || []).join(', ');
    const database = (tech.database || []).join(', ');

    const functional = (spec.functional_requirements || [])
      .map((req, idx) => `  <requirement id="${idx + 1}">${req}</requirement>`)
      .join('\n');

    const constraints = (spec.constraints || [])
      .map(c => `  <constraint>${c}</constraint>`)
      .join('\n');

    const criteria = (spec.acceptance_criteria || [])
      .map(a => `  <gate>${a}</gate>`)
      .join('\n');

    const nativeCode = `<context>
Autonomous refactoring and development agent executing precision architectural blueprint.
Spec ID: ${spec.spec_id} • Domain: ${spec.category}
</context>

<system_role>
You are an expert autonomous software engineer.
Execute this plan step-by-step. Stop and test after each phase.
Never introduce placeholder code, mock data, or TODO comments.
</system_role>

<objective>
${spec.objective}
</objective>

<technical_stack>
  <frontend>${frontend}</frontend>
  <backend>${backend}</backend>
  <database>${database}</database>
</technical_stack>

<functional_requirements>
${functional}
</functional_requirements>

<system_constraints>
${constraints}
</system_constraints>

<terminal_checkpoint_gates>
${criteria}
</terminal_checkpoint_gates>

<instructions>
1. Inspect directory layout (\`ls -la\`).
2. Implement schema models & run database migrations.
3. Implement core controllers and middleware with 100% Zod validation.
4. Execute test suite and verify 0 errors before reporting completion.
</instructions>`;

    const schemaJson = JSON.stringify(spec, null, 2);

    return {
      promptA: nativeCode,
      promptB: nativeCode,
      nativeCode,
      schemaJson
    };
  }
}

export default ClaudeAdapter;
