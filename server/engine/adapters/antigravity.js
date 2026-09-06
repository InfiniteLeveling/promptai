/**
 * Google Antigravity Two-Prompt Vibe Spec Adapter
 * Generates Prompt A (Architectural PRD) and Prompt B (Autonomous Blueprint with terminal test gates).
 */
import { BaseAdapter } from './base.js';

export class AntigravityAdapter extends BaseAdapter {
  constructor() {
    super('antigravity');
  }

  adapt(spec, options = {}) {
    const tech = spec.technical_stack || {};
    const frontend = (tech.frontend || []).join(', ') || 'React 19, Tailwind CSS';
    const backend = (tech.backend || []).join(', ') || 'Node.js v20+, Express, TypeScript';
    const database = (tech.database || []).join(', ') || 'PostgreSQL 16, Prisma ORM';
    const infra = (tech.infra || []).join(', ') || 'Docker Compose';

    const constraints = (spec.constraints || [])
      .map(c => `- ${c}`)
      .join('\n');

    const acceptance = (spec.acceptance_criteria || [])
      .map((a, idx) => `${idx + 1}. ${a}`)
      .join('\n');

    // 1. Prompt A: Architectural Specification (PRD.md)
    const promptA = `# ARCHITECTURAL SPECIFICATION & SYSTEM CONTRACT (PRD.md)
<!-- Compiled by PromptArchitect AI 7-Stage Core Compiler -->
<!-- Target Engine: GOOGLE ANTIGRAVITY (VIBE CODING FRAMEWORK) • Spec ID: ${spec.spec_id} -->

<system_role>
You are the Chief Enterprise Software Architect. Your mission is to write docs/SPEC.md.
DO NOT WRITE SOURCE CODE OR GENERATE CODEBASE FILES IN THIS PHASE.
</system_role>

<system_mission>
${spec.objective}
</system_mission>

<technology_stack>
- Frontend: ${frontend}
- Backend: ${backend}
- Database: ${database}
- Infrastructure & Runtime: ${infra}
</technology_stack>

<injected_constraints>
${constraints}
</injected_constraints>

<contract_deliverables>
1. Entity Relationship Diagram (Mermaid.js) with 3NF relational normalization.
2. OpenAPI 3.1 Yaml Schemas with zero loose string definitions.
3. Cryptographic Verification & Replay Protection Algorithms.
4. Failure Recovery & Exponential Backoff Matrix.
5. Disaster Recovery Runbook with Zero-Downtime Rollback Checkpoints.
</contract_deliverables>

<acceptance_criteria>
${acceptance}
</acceptance_criteria>`;

    // 2. Prompt B: Autonomous Agent Implementation Blueprint
    const promptB = `# AUTONOMOUS AGENT IMPLEMENTATION BLUEPRINT
<!-- Target Engine: GOOGLE ANTIGRAVITY • Checkpoint Gates Enforced -->
<!-- Reference Specification: docs/SPEC.md -->

<agent_execution_rules>
1. PRE-FLIGHT MANDATE: Execute directory tree inspection (\`ls -la\` or \`tree -L 2\`) before creating any file.
2. CONTRACT ADHERENCE: Read docs/SPEC.md. All schemas, tables, and endpoints MUST match with zero deviation.
3. ATOMIC PHASE PROGRESSION: Execute only one phase at a time. Stop and verify with terminal validation tests.
4. AUTOMATED ROLLBACK: Any test regression immediately triggers autonomous \`git reset --hard HEAD\` and logs root cause analysis.
</agent_execution_rules>

<phase_1_database_and_schemas>
- Target: Database models & migrations
- Command: \`npx prisma migrate dev --name init\`
- Checkpoint: Verify table creation with \`psql -c "\\dt"\`
- Constraint: Compound index on (tenant_id, created_at DESC).
</phase_1_database_and_schemas>

<phase_2_middleware_and_security>
- Target: \`src/middleware/auth.ts\` and \`src/middleware/sanitize.ts\`
- Checkpoint: Run \`npm test test/auth.test.ts\`
- Gate: 100% pass on replay attack simulation and clock skew rejection.
</phase_2_middleware_and_security>

<phase_3_core_domain_services>
- Target: API controllers & business logic
- Checkpoint: Run unit and integration test suite (\`npm test\`).
- Gate: Minimum 85% branch coverage required.
</phase_3_core_domain_services>

<phase_4_resilience_and_idempotency_audit>
- Target: \`test/resilience/replay_protection.test.ts\`
- Command: \`npm run test:resilience\`
- Gate: Zero failure tolerance on duplicate request replay and Redis failover.
</phase_4_resilience_and_idempotency_audit>

<phase_5_terminal_verification_and_smoke_test>
- Command: \`npx autocannon -c 50 -d 10 http://localhost:3000/api/health\`
- Checkpoint: P95 latency < 120ms with 0% socket timeouts.
- Gate: Final verification smoke tests return HTTP 200 OK.
</phase_5_terminal_verification_and_smoke_test>`;

    // 3. Native Dialect Code
    const nativeCode = `# Google Antigravity Task Blueprint
## Mandate: Inspect workspace root before editing.
## Constraints & Skills:
- Load \`skills/database-migration/SKILL.md\`
- Strict negative constraints: Never use \`any\`. Enforce strict TypeScript and Zod validation.
- Checkpoint: Run \`npm test\` before proceeding to next phase.

${spec.objective}

### Architectural Invariants:
${constraints}`;

    const schemaJson = JSON.stringify(spec, null, 2);

    return {
      promptA,
      promptB,
      nativeCode,
      schemaJson
    };
  }
}

export default AntigravityAdapter;
