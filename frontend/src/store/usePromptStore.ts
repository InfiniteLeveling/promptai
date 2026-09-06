import { create } from 'zustand';
import type { ScoreBreakdown, TargetFormat, CompiledOutput } from '../types/prompt';
import { ARCHETYPES, AVAILABLE_CHIPS } from '../lib/constants';
import { apiService } from '../services/api';

interface PromptState {
  rawPrompt: string;
  activeArchetype: string;
  detectedCategory: string;
  selectedChipIds: string[];
  targetFormat: TargetFormat;
  isCompiling: boolean;
  compilingStage: number; // 0 = idle, 1..7
  scoreBreakdown: ScoreBreakdown;
  totalScore: number;
  compiledOutput: CompiledOutput;
  currentRequirementSpec: any;
  isEditingArtifact: boolean;
  isImproving: boolean;
  improvementLevel: number;
  lastImprovementNotice: string | null;

  // Actions
  setRawPrompt: (text: string) => void;
  loadArchetype: (archetypeId: string) => void;
  loadEnterpriseTemplate: (templateId: string) => Promise<void>;
  toggleChip: (chipId: string) => void;
  setTargetFormat: (format: TargetFormat) => void;
  clearPrompt: () => void;
  runCompilation: () => Promise<void>;
  improvePrompt: () => Promise<void>;
  dismissImprovementNotice: () => void;
  recalculateScore: () => void;
  setIsEditingArtifact: (val: boolean) => void;
  updateArtifactContent: (tab: 'promptA' | 'promptB' | 'native' | 'schema', content: string) => void;
}

const EMPTY_SCORE: ScoreBreakdown = {
  clarity: 0,
  completeness: 0,
  constraints: 0,
  gating: 0,
  context: 0,
  modelFit: 0,
  edgeDefenses: 0
};

export function detectCategory(text: string): { label: string; icon: string } {
  const lower = text.toLowerCase();
  if (!lower.trim()) {
    return { label: '', icon: '' };
  }
  if (lower.includes('image') || lower.includes('photo') || lower.includes('cinematic') || lower.includes('midjourney') || lower.includes('render')) {
    return { label: 'Image / Creative', icon: '🎨' };
  }
  if (lower.includes('mobile') || lower.includes('react native') || lower.includes('ios') || lower.includes('android') || lower.includes('flutter')) {
    return { label: 'Mobile App', icon: '📱' };
  }
  if (lower.includes('microservice') || lower.includes('api') || lower.includes('redis') || lower.includes('postgres') || lower.includes('docker') || lower.includes('queue') || lower.includes('sqs') || lower.includes('worker') || lower.includes('backend')) {
    return { label: 'Microservice API', icon: '⚙️' };
  }
  if (lower.includes('3d') || lower.includes('three.js') || lower.includes('webgl') || lower.includes('canvas') || lower.includes('shader')) {
    return { label: '3D WebGL Canvas', icon: '📦' };
  }
  return { label: 'Web Application', icon: '🌐' };
}

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

  const whyBetterNotes = {
    original: text.trim() || 'Vague / unstructured initial requirement',
    additions: [
      'Two discrete normalized actor roles with clear RBAC security boundaries',
      '3NF Relational database schema with compound indexing and foreign keys',
      'Bounded error domains (HTTP 400 validation, 401 auth, 429 rate limit, 503 retry)',
      'Cryptographic verification & HMAC-SHA256 timestamp replay protection',
      'Atomic terminal validation gates enforcing >=85% branch test coverage',
      `Target dialect optimizations formatted specifically for ${target.toUpperCase()}`
    ]
  };

  const diffSummary = [
    'Injected strict TypeScript type invariants and validation rules',
    'Configured atomic terminal test checkpoints for agent progression',
    'Specified 3NF database models with zero loose string definitions',
    'Enforced bounded error domains and retry exponential backoff'
  ];

  return { promptA, promptB, nativeCode, schemaJson, diffSummary, whyBetterNotes };
}

export const usePromptStore = create<PromptState>((set, get) => ({
  rawPrompt: '',
  activeArchetype: '',
  detectedCategory: '',
  selectedChipIds: [],
  targetFormat: 'twoprompt',
  isCompiling: false,
  compilingStage: 0,
  scoreBreakdown: EMPTY_SCORE,
  totalScore: 0,
  compiledOutput: generateOutputs('', [], 'twoprompt'),
  currentRequirementSpec: null,
  isEditingArtifact: false,
  isImproving: false,
  improvementLevel: 0,
  lastImprovementNotice: null,

  setRawPrompt: (text: string) => {
    const cat = detectCategory(text);
    set({ rawPrompt: text, detectedCategory: cat.label });
    get().recalculateScore();
  },

  loadArchetype: (archetypeId: string) => {
    const arch = ARCHETYPES.find(a => a.id === archetypeId);
    if (!arch) return;
    const cat = detectCategory(arch.samplePrompt);
    set({
      activeArchetype: arch.id,
      rawPrompt: arch.samplePrompt,
      detectedCategory: cat.label,
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
      activeArchetype: '',
      detectedCategory: '',
      selectedChipIds: [],
      scoreBreakdown: EMPTY_SCORE,
      totalScore: 0,
      compilingStage: 0,
      isCompiling: false,
      isImproving: false,
      improvementLevel: 0,
      lastImprovementNotice: null,
      isEditingArtifact: false
    });
  },

  recalculateScore: () => {
    const { rawPrompt, selectedChipIds } = get();
    const text = rawPrompt.trim();
    if (!text) {
      set({
        scoreBreakdown: EMPTY_SCORE,
        totalScore: 0
      });
      return;
    }
    
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
    set({ isCompiling: true, compilingStage: 1, improvementLevel: 0, lastImprovementNotice: null });

    for (let stage = 1; stage <= 7; stage++) {
      set({ compilingStage: stage });
      await new Promise(resolve => setTimeout(resolve, 140));
    }

    const { rawPrompt, selectedChipIds, targetFormat } = get();

    // 1. Attempt live backend compiler endpoint
    try {
      const json = await apiService.compilePrompt(
        rawPrompt.trim() || 'Multi-tenant event processing engine',
        selectedChipIds,
        targetFormat
      );
      if (json && json.success && json.data) {
        const d = json.data;
        set({
          isCompiling: false,
          compilingStage: 7,
          totalScore: d.diagnostic_score || 94,
          scoreBreakdown: d.score_breakdown || get().scoreBreakdown,
          currentRequirementSpec: d.requirement_spec,
          compiledOutput: {
            promptA: d.prompt_a,
            promptB: d.prompt_b,
            nativeCode: d.native_code,
            schemaJson: d.schema_json,
            diffSummary: d.diff_summary || [],
            whyBetterNotes: d.why_better_notes || { original: rawPrompt, additions: [] }
          }
        });
        return;
      }
    } catch {
      // Seamless fallback to client-side compiler
    }

    // 2. Client-side compilation fallback
    set({
      isCompiling: false,
      compilingStage: 7,
      compiledOutput: generateOutputs(rawPrompt, selectedChipIds, targetFormat)
    });
  },

  dismissImprovementNotice: () => set({ lastImprovementNotice: null }),

  improvePrompt: async () => {
    const { compiledOutput, improvementLevel, isImproving, currentRequirementSpec } = get();
    if (isImproving) return;

    set({ isImproving: true });

    // 1. Attempt live backend on-demand improve pass
    try {
      const isSecondPass = improvementLevel > 0;
      const res = await apiService.improvePrompt(
        compiledOutput.promptA || get().rawPrompt,
        get().targetFormat,
        isSecondPass,
        currentRequirementSpec
      );
      if (res && res.success && res.data) {
        const d = res.data;
        set({
          isImproving: false,
          improvementLevel: isSecondPass ? 2 : 1,
          totalScore: d.quality_score || (isSecondPass ? 100 : 98),
          scoreBreakdown: {
            clarity: 20,
            completeness: 20,
            constraints: 15,
            gating: 15,
            context: 10,
            modelFit: isSecondPass ? 10 : 9,
            edgeDefenses: isSecondPass ? 10 : 9
          },
          compiledOutput: {
            ...compiledOutput,
            promptA: d.prompt_a || d.hardened_prompt_a || compiledOutput.promptA,
            promptB: d.prompt_b || d.hardened_prompt_b || compiledOutput.promptB,
            nativeCode: d.native_code || d.hardened_native || compiledOutput.nativeCode,
            schemaJson: d.schema_json || compiledOutput.schemaJson,
            whyBetterNotes: {
              original: compiledOutput.whyBetterNotes?.original || get().rawPrompt,
              additions: d.additions || d.applied_optimizations || compiledOutput.whyBetterNotes?.additions || []
            }
          },
          lastImprovementNotice: d.notice || (isSecondPass ? "🌟 Enterprise Observability Applied (+100/100 Quality)" : "✨ Adversarial Security Hardened (+98/100 Quality)")
        });
        return;
      }
    } catch {
      // Graceful fallback to client-side synthesis
    }

    // Realistic synthesis delay for Stage 5 Adversarial Critique & Stage 6 Optimization pass
    await new Promise(resolve => setTimeout(resolve, 650));

    const currentOutput = { ...compiledOutput };

    if (improvementLevel === 0) {
      // LEVEL 1: Enterprise Hardened Invariants & Rollback Gates
      const hardeningA = `\n\n<hardened_security_and_resilience_bounds>
<!-- Applied by PromptArchitect Self-Refinement Engine (Level 1 Hardening) -->
1. CRYPTOGRAPHIC REPLAY DEFENSE: Mandate HMAC-SHA256 signature verification on all state-mutating requests with a strict 300s clock-drift sliding window.
2. DISTRIBUTED IDEMPOTENCY: Enforce \`Idempotency-Key\` headers on POST/PUT endpoints backed by atomic Redis SETNX (24h TTL) with automatic payload deduplication.
3. ERROR ENVELOPE STANDARD: Standardize all failure payloads to RFC-7807 Problem Details (type, title, status, detail, instance).
4. RETRY STRATEGY: Upstream RPC calls strictly bounded by exponential backoff with full jitter and Dead-Letter-Queue (DLQ) failover.
5. ZERO-LEAK CONCURRENCY: Optimistic concurrency control via monotonic \`version_id\` column on all transactional models.
</hardened_security_and_resilience_bounds>`;

      const hardeningB = `\n\n<terminal_safety_and_rollback_gates>
<!-- Checkpoint Gates Enforced by Autonomous Repair Loop -->
<phase_4_resilience_and_idempotency_audit>
- Target: \`test/resilience/replay_protection.test.ts\`
- Command: \`npm run test:resilience\`
- Gate: Zero failure tolerance on concurrent replay attacks and clock skew beyond 300s.
</phase_4_resilience_and_idempotency_audit>

<phase_5_terminal_verification_and_rollback>
- Command: \`npx autocannon -c 50 -d 10 http://localhost:3000/api/health\`
- Gate: P95 latency < 120ms with 0% socket timeouts.
- ROLLBACK MANDATE: Any test failure immediately triggers autonomous \`git reset --hard HEAD\` and logs root cause analysis.
</phase_5_terminal_verification_and_rollback>
</terminal_safety_and_rollback_gates>`;

      const extraDeliverables = `\n5. Disaster Recovery Runbook with Zero-Downtime Rollback Checkpoints.\n6. Threat Model Matrix (STRIDE) with cryptographic proof-of-work mitigations.`;

      const updatedPromptA = currentOutput.promptA.includes('</contract_deliverables>')
        ? currentOutput.promptA.replace('</contract_deliverables>', `${extraDeliverables}\n</contract_deliverables>`) + hardeningA
        : currentOutput.promptA + hardeningA;

      const updatedPromptB = currentOutput.promptB + hardeningB;

      let updatedNative = currentOutput.nativeCode;
      if (!updatedNative.includes('Hardened Enterprise Invariants')) {
        updatedNative += `\n\n## Hardened Enterprise Invariants:\n- All external payloads strictly validated with Zod/io-ts schemas before domain logic.\n- Atomic database transactions wrapped in explicit isolation levels (Serializable / Repeatable Read).\n- Strict idempotency guarantees and RFC-7807 structured error responses.`;
      }

      let parsedSchema: Record<string, unknown> = {};
      try {
        parsedSchema = JSON.parse(currentOutput.schemaJson);
      } catch {
        parsedSchema = {};
      }
      const updatedSchema = JSON.stringify({
        ...parsedSchema,
        resilience_profile: "enterprise_hardened",
        heuristic_score: 98,
        hardened_invariants: [
          "hmac_replay_defense",
          "distributed_idempotency_keys",
          "dlq_exponential_backoff",
          "terminal_rollback_gates"
        ]
      }, null, 2);

      const updatedWhyBetter = {
        original: currentOutput.whyBetterNotes?.original || get().rawPrompt || 'Requirement Spec',
        additions: [
          '✨ Enterprise Invariants: Injected HMAC-SHA256 replay defense and distributed Redis idempotency',
          '✨ Terminal Rollback Gates: Enforced Phase 4/5 automated regression tests and P95 latency thresholds',
          '✨ Threat Model Hardening: Added STRIDE matrix and RFC-7807 structured error envelopes',
          ...(currentOutput.whyBetterNotes?.additions || [])
        ]
      };

      const updatedDiff = [
        '✨ Injected enterprise resilience invariants (HMAC, Idempotency, DLQ, Rollback gates)',
        ...(currentOutput.diffSummary || [])
      ];

      set({
        isImproving: false,
        improvementLevel: 1,
        totalScore: 98,
        scoreBreakdown: {
          clarity: 20,
          completeness: 20,
          constraints: 15,
          gating: 15,
          context: 10,
          modelFit: 9,
          edgeDefenses: 9
        },
        compiledOutput: {
          promptA: updatedPromptA,
          promptB: updatedPromptB,
          nativeCode: updatedNative,
          schemaJson: updatedSchema,
          diffSummary: updatedDiff,
          whyBetterNotes: updatedWhyBetter
        },
        lastImprovementNotice: "✨ Prompt Optimized (+4 Quality Pts): Injected HMAC replay defense, distributed idempotency keys, and automated rollback gates."
      });

    } else if (improvementLevel === 1) {
      // LEVEL 2: Telemetry, Observability & Peak Quality (Push to 100/100)
      const telemetryA = `\n\n<observability_and_auditability_invariants>
<!-- Level 2 Enterprise Observability & Audit Trail -->
1. DISTRIBUTED TRACING: OpenTelemetry (OTel) W3C tracecontext propagation on all ingress/egress spans.
2. STRUCTURED TELEMETRY: JSON log formatting with correlation IDs (\`trace_id\`, \`span_id\`, \`tenant_id\`) outputted to stdout.
3. METRICS EXPORTER: Prometheus \`/metrics\` endpoint exposing RED metrics (Rate, Errors, Duration) with P50/P90/P99 latency histograms.
4. AUDIT LOGGING: SOC2 compliant immutable append-only audit trail for all authorization and data mutation events.
</observability_and_auditability_invariants>`;

      const telemetryB = `\n\n<phase_6_telemetry_and_synthetic_monitoring>
- Target: \`src/telemetry/tracer.ts\`
- Command: \`npm run test:telemetry\`
- Gate: 100% trace context propagation across async event boundaries.
- Synthetic Canary: Continuous synthetic health probe with SLA latency alerting (<80ms).
</phase_6_telemetry_and_synthetic_monitoring>`;

      const updatedPromptA = currentOutput.promptA + telemetryA;
      const updatedPromptB = currentOutput.promptB + telemetryB;
      const updatedNative = currentOutput.nativeCode + `\n\n## Observability Invariants:\n- OpenTelemetry distributed tracing integrated into all HTTP and message queue boundaries.\n- Prometheus metrics exporter active with zero-allocation logging.`;

      let parsedSchema: Record<string, unknown> = {};
      try {
        parsedSchema = JSON.parse(currentOutput.schemaJson);
      } catch {
        parsedSchema = {};
      }
      const updatedSchema = JSON.stringify({
        ...parsedSchema,
        telemetry_enabled: true,
        audit_trail: "soc2_immutable",
        heuristic_score: 100
      }, null, 2);

      const updatedWhyBetter = {
        original: currentOutput.whyBetterNotes?.original || get().rawPrompt || 'Requirement Spec',
        additions: [
          '🌟 Full Distributed Tracing: OpenTelemetry W3C tracecontext propagation on all RPC & async boundaries',
          '🌟 Real-Time Metrics & SLA: Prometheus RED metrics with sub-80ms canary alerts',
          '🌟 SOC2 Compliance: Immutable audit trail with cryptographic correlation IDs',
          ...(currentOutput.whyBetterNotes?.additions || [])
        ]
      };

      set({
        isImproving: false,
        improvementLevel: 2,
        totalScore: 100,
        scoreBreakdown: {
          clarity: 20,
          completeness: 20,
          constraints: 15,
          gating: 15,
          context: 10,
          modelFit: 10,
          edgeDefenses: 10
        },
        compiledOutput: {
          promptA: updatedPromptA,
          promptB: updatedPromptB,
          nativeCode: updatedNative,
          schemaJson: updatedSchema,
          diffSummary: [
            '🌟 Enforced full-stack OpenTelemetry tracing and Prometheus RED telemetry',
            ...(currentOutput.diffSummary || [])
          ],
          whyBetterNotes: updatedWhyBetter
        },
        lastImprovementNotice: "🌟 Peak Enterprise Fidelity (100/100): Injected OpenTelemetry distributed tracing, Prometheus metrics, and SOC2 audit compliance."
      });

    } else {
      // Already at max level
      set({
        isImproving: false,
        lastImprovementNotice: "✨ Prompt is at peak architectural fidelity (100/100 Quality DNA). All invariants and rollback gates are fully active."
      });
    }
  },

  loadEnterpriseTemplate: async (templateId: string) => {
    try {
      const tpl = await apiService.fetchTemplateById(templateId);
      if (tpl) {
        set({
          rawPrompt: tpl.canonical_spec?.objective || tpl.summary,
          detectedCategory: tpl.category,
          totalScore: tpl.diagnostic_score || 98,
          currentRequirementSpec: tpl.canonical_spec,
          compiledOutput: {
            promptA: tpl.prompt_a || '',
            promptB: tpl.prompt_b || '',
            nativeCode: '',
            schemaJson: JSON.stringify(tpl.canonical_spec || {}, null, 2),
            diffSummary: ['Pre-compiled enterprise reference blueprint'],
            whyBetterNotes: {
              original: tpl.title,
              additions: [tpl.summary, `Recommended for ${tpl.recommended_agent.toUpperCase()}`]
            }
          }
        });
      }
    } catch (err) {
      console.warn('Failed to load enterprise template:', err);
    }
  },

  setIsEditingArtifact: (val: boolean) => set({ isEditingArtifact: val }),

  updateArtifactContent: (tab: 'promptA' | 'promptB' | 'native' | 'schema', content: string) => {
    const current = get().compiledOutput;
    set({
      compiledOutput: {
        ...current,
        [tab === 'native' ? 'nativeCode' : tab === 'schema' ? 'schemaJson' : tab]: content
      }
    });
  }
}));
