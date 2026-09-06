import { create } from 'zustand';
import type { ScoreBreakdown, TargetFormat, CompiledOutput } from '../types/prompt';
import { ARCHETYPES, AVAILABLE_CHIPS } from '../lib/constants';

interface PromptState {
  rawPrompt: string;
  activeArchetype: string;
  selectedChipIds: string[];
  targetFormat: TargetFormat;
  isCompiling: boolean;
  compilingStage: number; // 0 = idle, 1..7
  scoreBreakdown: ScoreBreakdown;
  totalScore: number;
  compiledOutput: CompiledOutput;

  // Actions
  setRawPrompt: (text: string) => void;
  loadArchetype: (archetypeId: string) => void;
  toggleChip: (chipId: string) => void;
  setTargetFormat: (format: TargetFormat) => void;
  clearPrompt: () => void;
  runCompilation: () => Promise<void>;
  recalculateScore: () => void;
}

const DEFAULT_SCORE: ScoreBreakdown = {
  clarity: 19,
  completeness: 19,
  constraints: 15,
  gating: 14,
  context: 9,
  modelFit: 9,
  edgeDefenses: 8
};

function generateOutputs(text: string, chips: string[], target: TargetFormat): CompiledOutput {
  const chipAdditions = chips
    .map(id => AVAILABLE_CHIPS.find(c => c.id === id)?.text)
    .filter(Boolean)
    .join('\n- ');

  const promptA = `# ARCHITECTURAL SPECIFICATION & SYSTEM CONTRACT (PRD.md)
<!-- Compiled by PromptArchitect AI 7-Stage Core Compiler -->

<system_role>
You are the Chief Enterprise Software Architect. Your mission is to write docs/SPEC.md.
DO NOT WRITE SOURCE CODE OR GENERATE CODEBASE FILES IN THIS PHASE.
</system_role>

<system_requirements>
${text || 'Multi-tenant event processing engine'}
${chipAdditions ? `\n<injected_constraints>\n- ${chipAdditions}\n</injected_constraints>` : ''}
</system_requirements>

<contract_deliverables>
1. Entity Relationship Diagram (Mermaid.js) with 3NF relational normalization.
2. OpenAPI 3.1 Yaml Schemas with zero loose string definitions.
3. Cryptographic Verification & Replay Protection Algorithms.
4. Failure Recovery & Exponential Backoff Matrix.
</contract_deliverables>`;

  const promptB = `# AUTONOMOUS AGENT IMPLEMENTATION BLUEPRINT
<!-- Target Engine: ${target.toUpperCase()} • Checkpoint Gates Enforced -->

<agent_execution_rules>
1. PRE-FLIGHT MANDATE: Execute directory inspection (\`ls -la\` or \`tree -L 2\`) before creating any file.
2. CONTRACT ADHERENCE: Read docs/SPEC.md. All schemas, tables, and endpoints MUST match with zero deviation.
3. ATOMIC PHASE PROGRESSION: Execute only one phase at a time. Stop and verify with terminal validation tests.
</agent_execution_rules>

<phase_1_database_and_schemas>
- Command: \`npx prisma migrate dev --name init\`
- Checkpoint: Verify table creation with \`psql -c "\\dt"\`
- Constraint: Compound index on (tenant_id, created_at DESC).
</phase_1_database_and_schemas>

<phase_2_middleware_and_security>
- Target: \`src/middleware/auth.ts\`
- Checkpoint: Run \`npm test test/auth.test.ts\`
- Gate: 100% pass on replay attacks and timestamp deviation rejection.
</phase_2_middleware_and_security>

<phase_3_worker_dispatch_queue>
- Target: \`src/workers/dispatcher.ts\`
- Checkpoint: Run integration suite with mock payload stream.
</phase_3_worker_dispatch_queue>`;

  let nativeCode = '';
  if (target === 'antigravity') {
    nativeCode = `# Google Antigravity Task Blueprint
## Mandate: Inspect workspace root before editing.
## Constraints & Skills:
- Load \`skills/database-migration/SKILL.md\`
- Strict negative constraints applied.
${text}`;
  } else if (target === 'cursor') {
    nativeCode = `---
description: Auto-compiled rules for project
globs: ["src/**/*.ts", "test/**/*.ts"]
alwaysApply: true
---
# Architectural Invariants
${text}
- Never use \`any\`. Enforce strict TypeScript and Zod validation.
- Checkpoint: Run \`npm run typecheck && npm test\` before finishing.`;
  } else if (target === 'claude') {
    nativeCode = `<context>
Autonomous refactoring agent executing precision blueprint.
</context>
<system_constraints>
${text}
</system_constraints>
<instructions>
1. Inspect directory layout.
2. Implement schema models.
3. Validate against test checkpoints.
</instructions>`;
  } else if (target === 'v0') {
    nativeCode = `Create a responsive modern dark-mode application in React 19 + Tailwind CSS + Lucide React.
Requirements:
- ${text}
- All mock data strongly typed with zero backend assumptions.`;
  } else if (target === 'midjourney') {
    nativeCode = `/imagine prompt: Cinematic medium shot of a cybernetic systems engineer in an obsidian glass cleanroom, volumetric cyan and lavender rim lighting, 85mm Hasselblad lens, f/1.8 aperture, octane render --ar 16:9 --style raw --v 6.1 --s 350 --no cartoon, lowres, blurry`;
  } else {
    nativeCode = `${promptA}\n\n${promptB}`;
  }

  const schemaJson = JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "CanonicalRequirementSpec",
    "type": "object",
    "properties": {
      "domain_archetype": "backend_microservice",
      "target_agent": target,
      "heuristic_score": 94,
      "injected_constraints": chips
    }
  }, null, 2);

  return { promptA, promptB, nativeCode, schemaJson };
}

export const usePromptStore = create<PromptState>((set, get) => ({
  rawPrompt: ARCHETYPES[0].samplePrompt,
  activeArchetype: ARCHETYPES[0].id,
  selectedChipIds: ARCHETYPES[0].defaultChips,
  targetFormat: 'twoprompt',
  isCompiling: false,
  compilingStage: 0,
  scoreBreakdown: DEFAULT_SCORE,
  totalScore: 94,
  compiledOutput: generateOutputs(ARCHETYPES[0].samplePrompt, ARCHETYPES[0].defaultChips, 'twoprompt'),

  setRawPrompt: (text: string) => {
    set({ rawPrompt: text });
    get().recalculateScore();
  },

  loadArchetype: (archetypeId: string) => {
    const arch = ARCHETYPES.find(a => a.id === archetypeId);
    if (!arch) return;
    set({
      activeArchetype: arch.id,
      rawPrompt: arch.samplePrompt,
      selectedChipIds: arch.defaultChips
    });
    get().recalculateScore();
    get().runCompilation();
  },

  toggleChip: (chipId: string) => {
    const { selectedChipIds, rawPrompt } = get();
    const chip = AVAILABLE_CHIPS.find(c => c.id === chipId);
    if (!chip) return;

    const exists = selectedChipIds.includes(chipId);
    const updatedChips = exists
      ? selectedChipIds.filter(id => id !== chipId)
      : [...selectedChipIds, chipId];

    let newPrompt = rawPrompt;
    if (!exists) {
      newPrompt = rawPrompt.trim() + ' ' + chip.text;
    }

    set({ selectedChipIds: updatedChips, rawPrompt: newPrompt });
    get().recalculateScore();
  },

  setTargetFormat: (format: TargetFormat) => {
    set({ targetFormat: format });
    const { rawPrompt, selectedChipIds } = get();
    set({ compiledOutput: generateOutputs(rawPrompt, selectedChipIds, format) });
  },

  clearPrompt: () => {
    set({
      rawPrompt: '',
      selectedChipIds: [],
      scoreBreakdown: { clarity: 5, completeness: 5, constraints: 5, gating: 5, context: 5, modelFit: 5, edgeDefenses: 5 },
      totalScore: 35
    });
  },

  recalculateScore: () => {
    const { rawPrompt, selectedChipIds } = get();
    const text = rawPrompt.trim();
    
    let clarity = Math.min(20, Math.floor(text.length / 15) + 8);
    let completeness = Math.min(20, 10 + (selectedChipIds.length * 2));
    let constraints = Math.min(15, 8 + (selectedChipIds.length * 1.5));
    let gating = text.includes('checkpoint') || text.includes('test') ? 14 : 9;
    let context = text.includes('TypeScript') || text.includes('PostgreSQL') ? 10 : 6;
    let modelFit = 9;
    let edgeDefenses = text.includes('HMAC') || text.includes('replay') || text.includes('TTL') ? 10 : 6;

    const total = Math.min(100, Math.round(clarity + completeness + constraints + gating + context + modelFit + edgeDefenses));

    set({
      scoreBreakdown: { clarity, completeness, constraints, gating, context, modelFit, edgeDefenses },
      totalScore: total
    });
  },

  runCompilation: async () => {
    set({ isCompiling: true, compilingStage: 1 });

    for (let stage = 1; stage <= 7; stage++) {
      set({ compilingStage: stage });
      await new Promise(resolve => setTimeout(resolve, 160));
    }

    const { rawPrompt, selectedChipIds, targetFormat } = get();
    set({
      isCompiling: false,
      compilingStage: 7,
      compiledOutput: generateOutputs(rawPrompt, selectedChipIds, targetFormat)
    });
  }
}));
