import React, { useState } from 'react';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { TiltCard } from '../components/motion/TiltCard';
import { RevealOnScroll } from '../components/motion/RevealOnScroll';
import { MarkdownViewer } from '../components/shared/MarkdownViewer';
import { Badge } from '../components/ui/badge';
import { Compass, FileCode2, Code2, Box, Terminal } from 'lucide-react';
import type { TargetFormat } from '../types/prompt';

export const TargetsPage: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<TargetFormat>('antigravity');

  const targetsData: Record<TargetFormat, { title: string; badge: string; icon: any; code: string }> = {
    antigravity: {
      title: "Google Antigravity Autonomous Agent Task Blueprint",
      badge: ".agents/skills markdown format",
      icon: Compass,
      code: `# Mission: Build Production PostgreSQL-Backed Auth Gateway

## 1. Directory Tree Mandate
You MUST first execute \`run_command: ls -la\` or inspect the workspace root before creating any new file.

## 2. Skill Dependencies
- Load \`skills/database-migration/SKILL.md\` for schema migration scripts.
- Load \`skills/jwt-cryptography/SKILL.md\` for Ed25519 token signing.

## 3. Atomic Phase Progression
### Phase 1: Database Migration
- Target: \`prisma/schema.prisma\`
- Checkpoint: Run \`npx prisma migrate dev\` and verify exit code 0.
- Failure Action: If migration fails, revert and emit detailed error log.

### Phase 2: Route Handlers & HMAC Middleware
- Target: \`src/routes/auth.ts\`
- Terminal Gate: Run \`npm run test:auth\`
- Verification: 100% pass on replay attack rejection tests.`
    },
    cursor: {
      title: "Cursor IDE MDC Rules Specification",
      badge: ".cursorrules / .mdc globs",
      icon: FileCode2,
      code: `---
description: Production standards for React 19 + TypeScript API routes
globs: ["src/app/api/**/*.ts", "src/components/**/*.tsx"]
alwaysApply: false
---

# Codebase Standards & Boundaries
- STRICT: Never use \`any\` or \`unknown\` without runtime type guards (Zod).
- STYLING: TailwindCSS with CSS variables. Do not use inline styles.
- ARCHITECTURE: Keep business logic in \`src/services/*\`, routes only handle validation and HTTP response mapping.

# Terminal Checkpoints
Before completing any task:
1. Run \`npm run typecheck\`
2. Run \`npm run lint\`
3. If errors exist, repair without suppressing linter rules.`
    },
    claude: {
      title: "Anthropic Claude Semantic XML Prompt",
      badge: "Semantic XML Containers",
      icon: Code2,
      code: `<context>
You are an expert distributed systems engineer refactoring an in-memory queue into an AWS SQS + Lambda event-driven consumer.
</context>

<system_constraints>
1. IDEMPOTENCY: Every message must have a deduplication ID computed from SHA256(payload.timestamp + payload.userId).
2. DEAD LETTER QUEUE: Max receive count = 3 before redrive to DLQ.
3. CONCURRENCY: Maximum batch size = 10, visibility timeout = 30 seconds.
</system_constraints>

<instructions>
1. Inspect \`src/queues/\` to review the legacy in-memory interface.
2. Implement \`src/queues/sqs-consumer.ts\` satisfying the interface.
3. Add integration test suite in \`test/sqs.test.ts\` utilizing LocalStack.
</instructions>

<output_format>
Output code modifications with standard unified diff format. Include unit test execution results.
</output_format>`
    },
    v0: {
      title: "Component-First v0 Prompt Specification",
      badge: "React, Tailwind, Lucide",
      icon: Box,
      code: `Create a responsive modern dark-mode Analytics Dashboard in React 19 with Tailwind CSS and Lucide React icons.

Layout Requirements:
- Left sidebar with icons (Dashboard, Reports, Integrations, Settings) and collapsible behavior.
- Top sticky stats bar with 4 KPI cards: Total Revenue ($48.2k), Churn Rate (1.2%), Active Sessions (8,412), Conversion (4.8%).
- Main view: Interactive Recharts area chart showing 30-day traffic velocity with gradient fills.
- Recent Activity table with status pills (Success: emerald, Pending: amber, Failed: rose).

State & Interactivity:
- Include time range selector pills (7D, 30D, 90D, 1Y) with smooth state transitions.
- All mock data must be realistic and strongly typed.`
    },
    midjourney: {
      title: "Optical & Stylistic Photorealistic Prompt",
      badge: "Midjourney v6 / Flux Optics",
      icon: Terminal,
      code: `/imagine prompt: Cinematic medium shot of a cybernetic research scientist in an obsidian glass cleanroom, volumetric cyan and lavender fiber-optic rim lighting, detailed reflective surfaces, 85mm Hasselblad lens, f/1.8 aperture, subtle chromatic aberration, hyper-detailed textures, octane render --ar 16:9 --style raw --v 6.1 --s 350 --no cartoon, illustration, lowres, blurry, oversaturated, watermark`
    },
    twoprompt: {
      title: "Two-Prompt Vibe Framework",
      badge: "Prompt A & Prompt B",
      icon: Compass,
      code: `Prompt A: Architectural Spec (docs/SPEC.md)\nPrompt B: Execution Blueprint with terminal checkpoints.`
    }
  };

  const current = targetsData[selectedTarget];

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-24 space-y-16">
      
      {/* Hero Header */}
      <RevealOnScroll>
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="cyan">Target Adapters</Badge>
          <h1 className="font-display-hero text-4xl md:text-5xl font-bold mt-4 tracking-tight">
            Zero Prompt Friction for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
              Any Agent Engine
            </span>
          </h1>
          <p className="text-on-surface-variant font-body-lg text-sm md:text-base mt-4 leading-relaxed">
            Autonomous coding models have vastly different syntactic appetites. PromptArchitect translates your requirements into the exact structural dialect required for maximum adherence.
          </p>
        </div>
      </RevealOnScroll>

      {/* Target Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { key: 'antigravity' as TargetFormat, label: 'Google Antigravity', sub: '.agents/skills & gates', icon: Compass },
          { key: 'cursor' as TargetFormat, label: 'Cursor IDE', sub: '.cursorrules & .mdc', icon: FileCode2 },
          { key: 'claude' as TargetFormat, label: 'Claude Code', sub: 'Semantic XML Containers', icon: Code2 },
          { key: 'v0' as TargetFormat, label: 'v0 (Vercel)', sub: 'React, Lucide, Tailwind', icon: Box },
          { key: 'midjourney' as TargetFormat, label: 'Midjourney v6', sub: 'Optics & Parameter Flags', icon: Terminal },
        ].map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTarget === t.key;
          return (
            <TiltCard key={t.key} onClick={() => setSelectedTarget(t.key)} className="cursor-pointer">
              <SpotlightCard className={`p-5 transition-all h-full ${isSelected ? 'border-2 border-primary shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-outline-variant/30'}`}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-on-surface text-sm">{t.label}</h4>
                <p className="text-[11px] text-outline mt-1">{t.sub}</p>
                <div className={`mt-3 text-[10px] font-mono px-2 py-0.5 rounded w-fit ${isSelected ? 'bg-primary/20 text-primary font-bold' : 'bg-surface-container text-outline'}`}>
                  {isSelected ? 'Active Target' : 'Adapter'}
                </div>
              </SpotlightCard>
            </TiltCard>
          );
        })}
      </div>

      {/* Output Code Viewer */}
      <RevealOnScroll>
        <SpotlightCard className="p-8 border border-outline-variant/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
            <div>
              <Badge variant="cyan">{current.badge}</Badge>
              <h3 className="font-headline-lg text-xl font-bold text-on-surface mt-1">{current.title}</h3>
            </div>
          </div>
          <div className="mt-6">
            <MarkdownViewer content={current.code} maxHeight="max-h-[420px]" />
          </div>
        </SpotlightCard>
      </RevealOnScroll>

      {/* Capability Matrix */}
      <RevealOnScroll>
        <SpotlightCard className="p-8 border border-outline-variant/30">
          <h3 className="font-headline-lg text-xl font-bold text-on-surface mb-6">Target Adapter Capability Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-outline">
                  <th className="py-3 px-4">Feature / Capability</th>
                  <th className="py-3 px-4 text-primary">Antigravity</th>
                  <th className="py-3 px-4 text-secondary">Cursor MDC</th>
                  <th className="py-3 px-4 text-tertiary">Claude Code</th>
                  <th className="py-3 px-4 text-emerald-400">v0 React</th>
                  <th className="py-3 px-4 text-purple-400">Midjourney</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                <tr>
                  <td className="py-3 px-4 font-semibold">Semantic XML Encapsulation</td>
                  <td className="py-3 px-4 text-emerald-400">Supported</td>
                  <td className="py-3 px-4 text-outline">N/A (Markdown)</td>
                  <td className="py-3 px-4 text-emerald-400">Native Optimal</td>
                  <td className="py-3 px-4 text-outline">N/A</td>
                  <td className="py-3 px-4 text-outline">N/A</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">File Glob Pattern Matching</td>
                  <td className="py-3 px-4 text-outline">Path-based</td>
                  <td className="py-3 px-4 text-emerald-400">Native `globs: [...]`</td>
                  <td className="py-3 px-4 text-outline">Instructional</td>
                  <td className="py-3 px-4 text-outline">Single-file</td>
                  <td className="py-3 px-4 text-outline">N/A</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Terminal Verification Gates</td>
                  <td className="py-3 px-4 text-emerald-400">Strict Checkpoints</td>
                  <td className="py-3 px-4 text-emerald-400">Supported</td>
                  <td className="py-3 px-4 text-emerald-400">Supported</td>
                  <td className="py-3 px-4 text-outline">N/A (Browser)</td>
                  <td className="py-3 px-4 text-outline">N/A</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Adversarial Edge Defenses</td>
                  <td className="py-3 px-4 text-emerald-400">100% Injected</td>
                  <td className="py-3 px-4 text-emerald-400">100% Injected</td>
                  <td className="py-3 px-4 text-emerald-400">100% Injected</td>
                  <td className="py-3 px-4 text-emerald-400">UI Fallbacks</td>
                  <td className="py-3 px-4 text-emerald-400">Negative Prompts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      </RevealOnScroll>

    </div>
  );
};
