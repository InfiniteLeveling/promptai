import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TiltCard } from '../components/motion/TiltCard';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { RevealOnScroll } from '../components/motion/RevealOnScroll';
import { MarkdownViewer } from '../components/shared/MarkdownViewer';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ShieldAlert, CheckCircle2, Zap, ArrowRight, FolderSearch, TrafficCone, RotateCcw, AlertOctagon } from 'lucide-react';

export const TwoPromptPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'a' | 'b'>('a');

  const promptAExample = `# PROMPT A: ARCHITECTURAL SPECIFICATION CONTRACT (PRD.md)
<!-- Purpose: Formulate system invariants without touching code -->

<role>
You are the Chief Systems Architect. Your mission is to write a comprehensive, mathematically rigorous system specification for a multi-tenant webhook dispatcher.
DO NOT WRITE APPLICATION CODE OR CREATE CODEBASE FILES IN THIS STAGE.
</role>

<system_requirements>
1. INGESTION SLA: Handle 15,000 requests/sec with <10ms p99 response time.
2. PERSISTENCE: PostgreSQL 16 + Redis Streams with at-least-once delivery guarantees.
3. IDEMPOTENCY: SHA-256 header hash deduplication window of 300 seconds.
4. ERROR DOMAINS: Explicit HTTP 400 (Malformed payload), 401 (HMAC invalid), 429 (Bucket exhausted), 503 (Upstream partition).
</system_requirements>

<deliverable_schema>
Generate exclusively \`docs/SPEC.md\` adhering to the following structure:
- Section 1: Entity Relationship Diagram (Mermaid.js) with strict foreign keys
- Section 2: OpenAPI 3.1 YAML Schemas with zero loose string definitions
- Section 3: Failure Mode & Recovery Matrix (Network partition, retry exponential formula)
- Section 4: Cryptographic Verification Algorithm (HMAC-SHA256 with timestamp replay buffer)
</deliverable_schema>`;

  const promptBExample = `# PROMPT B: AUTONOMOUS AGENT IMPLEMENTATION BLUEPRINT
<!-- Purpose: Execute step-by-step atomic phases with terminal gates -->

<agent_execution_rules>
1. PRE-FLIGHT MANDATE: You MUST run \`tree -L 2\` or view the existing workspace directory before editing or creating any file.
2. SPEC ADHERENCE: Read \`docs/SPEC.md\`. All database schema migrations, route paths, and error codes MUST strictly match without deviation.
3. ATOMIC PHASE PROGRESSION: Execute only one phase at a time. Stop and verify with terminal validation tests before advancing.
</agent_execution_rules>

<phases>
Phase 1: Foundation & DB Schema
  - Command: \`npx prisma migrate dev --name init\`
  - Checkpoint: Verify table creation with \`psql -c "\\dt"\`
  - Constraint: Ensure indexes exist on \`(tenant_id, created_at DESC)\` and \`(idempotency_key)\`.

Phase 2: HMAC Verification Middleware
  - File: \`src/middleware/auth.ts\`
  - Checkpoint: Run \`npm test test/auth.test.ts\`
  - Success Criteria: 100% branch coverage on replay window and signature mismatch rejection.

Phase 3: Dispatch Worker & Retry Loop
  - File: \`src/workers/dispatcher.ts\`
  - Checkpoint: Launch worker in background, push 500 mock payloads via test script, verify zero dropped messages.
</phases>`;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-24 space-y-16">
      
      {/* Hero Header */}
      <RevealOnScroll>
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="purple">Vibe-Coding Methodology</Badge>
          <h1 className="font-display-hero text-4xl md:text-5xl font-bold mt-4 tracking-tight">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">Two-Prompt</span> Bridge
          </h1>
          <p className="text-on-surface-variant font-body-lg text-sm md:text-base mt-4 leading-relaxed">
            Why do 82% of autonomous agent coding sessions fail into infinite loops, hallucinated dependencies, and architectural drift? Because humans ask agents to design and execute simultaneously.
          </p>
        </div>
      </RevealOnScroll>

      {/* Comparison Grid */}
      <RevealOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <TiltCard>
            <SpotlightCard className="p-8 border-red-500/30 h-full">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-red-400 bg-red-500/10 border-red-500/30">The Monolithic Way • 82% Failure</Badge>
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-headline-lg text-xl font-bold text-on-surface">The Single Monolithic Prompt</h3>
              <p className="text-xs text-on-surface-variant mt-2 italic">
                "Build me a full-stack SaaS app with Stripe, Next.js, and Auth0. Make it clean and test it."
              </p>
              <div className="mt-6 space-y-3 text-xs text-on-surface-variant">
                <div className="p-3 rounded-lg bg-surface-container border border-red-500/20">
                  <strong className="text-on-surface">Immediate Code Generation:</strong> Agent edits files before verifying project layout or schemas.
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-red-500/20">
                  <strong className="text-on-surface">Architectural Drift:</strong> Modifies database migrations midway through writing UI components.
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-red-500/20">
                  <strong className="text-on-surface">Context Exhaustion:</strong> Infinite test debug loops exhaust 100k+ tokens without shipping.
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>

          <TiltCard>
            <SpotlightCard className="p-8 border-emerald-500/40 h-full">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="emerald">PromptArchitect • 98.4% First-Pass Pass</Badge>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-headline-lg text-xl font-bold text-on-surface">The Two-Prompt Separation</h3>
              <p className="text-xs text-on-surface-variant mt-2">
                Mathematical bifurcation into an immutable Architectural Specification (Prompt A) and a Gated Execution Blueprint (Prompt B).
              </p>
              <div className="mt-6 space-y-3 text-xs text-on-surface-variant">
                <div className="p-3 rounded-lg bg-surface-container border border-emerald-500/20">
                  <strong className="text-on-surface">Prompt A (Contract):</strong> Zero code modifications. Locks DB relations, schemas, error codes & PRD.
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-emerald-500/20">
                  <strong className="text-on-surface">Prompt B (Blueprint):</strong> Requires tree inspection first, step-by-step terminal checkpoints & git rollbacks.
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-emerald-500/20">
                  <strong className="text-on-surface">Subagent Alignment:</strong> Multi-agent systems execute against the spec without hallucination.
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>

        </div>
      </RevealOnScroll>

      {/* Interactive Blueprint Viewer */}
      <RevealOnScroll>
        <SpotlightCard className="p-8 border border-outline-variant/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
            <div>
              <Badge variant="cyan">Interactive Blueprint Comparison</Badge>
              <h2 className="font-headline-lg text-2xl font-bold text-on-surface mt-1">Inspect Generated Dual-Prompts</h2>
            </div>
            <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl border border-outline-variant/30 text-xs">
              <button
                onClick={() => setActiveTab('a')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'a'
                    ? 'bg-primary text-surface-container-lowest shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Prompt A (Spec)
              </button>
              <button
                onClick={() => setActiveTab('b')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'b'
                    ? 'bg-tertiary text-surface-container-lowest shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Prompt B (Execution)
              </button>
            </div>
          </div>

          <div className="mt-6">
            <MarkdownViewer
              content={activeTab === 'a' ? promptAExample : promptBExample}
              maxHeight="max-h-[380px]"
            />
          </div>
        </SpotlightCard>
      </RevealOnScroll>

      {/* 4 Guardrails */}
      <RevealOnScroll>
        <SpotlightCard className="p-8 border border-outline-variant/30">
          <h3 className="font-headline-lg text-xl font-bold text-on-surface mb-6">4 Guardrails Enforced in Every Output</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container p-5 rounded-xl border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                <FolderSearch className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-on-surface text-sm">Directory Inspection First</h4>
              <p className="text-xs text-on-surface-variant mt-2">Forces coding agents to inspect the folder tree first to prevent overwriting existing conventions.</p>
            </div>
            <div className="bg-surface-container p-5 rounded-xl border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary mb-3">
                <TrafficCone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-on-surface text-sm">Terminal Gates</h4>
              <p className="text-xs text-on-surface-variant mt-2">Every code modification must be bookended by a discrete validation command (e.g. `npm test`, `tsc --noEmit`).</p>
            </div>
            <div className="bg-surface-container p-5 rounded-xl border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mb-3">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-on-surface text-sm">Rollback Thresholds</h4>
              <p className="text-xs text-on-surface-variant mt-2">Specifies exact failure limits. If a test fails 3 consecutive times, agent rolls back rather than continuing to patch.</p>
            </div>
            <div className="bg-surface-container p-5 rounded-xl border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400 mb-3">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-on-surface text-sm">Negative Constraints</h4>
              <p className="text-xs text-on-surface-variant mt-2">Explicitly outlaws antipatterns: no mock data in production endpoints, no any types in TypeScript.</p>
            </div>
          </div>
        </SpotlightCard>
      </RevealOnScroll>

      {/* CTA */}
      <RevealOnScroll>
        <SpotlightCard className="p-10 text-center border border-outline-variant/30">
          <h3 className="font-headline-lg text-2xl font-bold text-on-surface">Experience the Two-Prompt Framework in Action</h3>
          <p className="text-on-surface-variant text-sm mt-2 max-w-lg mx-auto">Generate real-time Prompt A and Prompt B specs directly inside our Live Compiler Sandbox.</p>
          <div className="mt-6 flex justify-center">
            <Link to="/sandbox">
              <Button size="lg" className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-tertiary" />
                <span>Try Live Sandbox</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </SpotlightCard>
      </RevealOnScroll>

    </div>
  );
};
