/**
 * @promptarchitect/compiler
 * Stage 4: Master Generator Engine
 * Synthesizes Candidate Prompt v1 with system role, architecture, constraints, and deliverables.
 */
import type { CanonicalRequirementSpec } from '@promptarchitect/contracts';

/**
 * Generates Candidate Prompt v1 markdown from a CanonicalRequirementSpec.
 */
export function generateCandidatePrompt(
  spec: CanonicalRequirementSpec,
  targetAgent = 'antigravity'
): string {
  const techStack = spec.technical_stack || {};
  const frontend = (techStack.frontend || []).join(', ') || 'React 19';
  const backend = (techStack.backend || []).join(', ') || 'Node.js 24 LTS, Fastify 5.x';
  const database = (techStack.database || []).join(', ') || 'Supabase PostgreSQL';
  const infra = (techStack.infra || []).join(', ') || 'Docker Compose';

  const functionalList = (spec.functional_requirements || [])
    .map((req, idx) => `${idx + 1}. ${req}`)
    .join('\n');

  const constraintsList = (spec.constraints || [])
    .map((c) => `- ${c}`)
    .join('\n');

  const criteriaList = (spec.acceptance_criteria || [])
    .map((crit, idx) => `${idx + 1}. ${crit}`)
    .join('\n');

  return `# MASTER REQUIREMENTS SPECIFICATION & ARCHITECTURAL BLUEPRINT
<!-- Compiled by PromptArchitect AI 7-Stage Core Compiler -->
<!-- Target Engine: ${targetAgent.toUpperCase()} • Spec ID: ${spec.spec_id} -->

<system_role>
You are the Principal Systems Architect and Lead Autonomous Engineer.
Your mission is to construct a production-ready, fault-tolerant implementation conforming precisely to this contract.
Mandate: Always inspect workspace tree first (\`ls -la\` or \`tree\`) before touching or editing any files.
</system_role>

<system_objective>
${spec.objective}
</system_objective>

<technology_stack>
- Frontend: ${frontend}
- Backend: ${backend}
- Database: ${database}
- Infrastructure & Deployment: ${infra}
</technology_stack>

<functional_requirements>
${functionalList}
</functional_requirements>

<strict_constraints>
${constraintsList}
</strict_constraints>

<acceptance_criteria>
${criteriaList}
</acceptance_criteria>`;
}
