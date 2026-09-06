import React from 'react';
import { Link } from 'react-router-dom';
import { usePromptStore } from '../store/usePromptStore';
import { ARCHETYPES } from '../lib/constants';
import { TiltCard } from '../components/motion/TiltCard';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { RevealOnScroll } from '../components/motion/RevealOnScroll';
import { ScoreGauge } from '../components/shared/ScoreGauge';
import { ClarificationChips } from '../components/shared/ClarificationChips';
import { StageVisualizer } from '../components/shared/StageVisualizer';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Zap,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Layers,
  Cpu,
  Sparkles,
  GitPullRequest,
  Terminal,
  Code2,
  FileCode2,
  Box,
  Compass
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { rawPrompt, setRawPrompt, activeArchetype, loadArchetype, runCompilation, isCompiling } = usePromptStore();

  return (
    <div className="space-y-24 pt-8 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="text-center max-w-4xl mx-auto px-6 pt-10">
        <RevealOnScroll>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 shadow-sm backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping opacity-75" />
            <span className="w-2 h-2 -ml-4 rounded-full bg-tertiary" />
            <span className="text-[11px] font-mono text-on-surface-variant tracking-wider">
              ⚡ Task-First Ingestion • Zero Conversational Fatigue
            </span>
          </div>

          <h1 className="font-display-hero text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-on-surface">
            Your Raw Idea In.{' '}
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
              Production-Ready
            </span>{' '}
            Prompts Out.
          </h1>

          <p className="mt-6 text-on-surface-variant font-body-lg text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Coding agents like Google Antigravity and Cursor fail because raw human prompts lack architectural specs, database relationships, and boundary conditions. PromptArchitect pre-compiles your ideas into verified, rubric-scored master prompts.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/sandbox">
              <Button size="lg" className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-tertiary" />
                <span>Launch Sandbox ⚡</span>
              </Button>
            </Link>
            <Link to="/compiler">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <span>The 7-Stage Engine</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* 2. INTERACTIVE LIVE COMPILER PREVIEW */}
      <section className="max-w-6xl mx-auto px-6">
        <RevealOnScroll delay={0.1}>
          <SpotlightCard className="p-8 border border-outline-variant/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
              <div>
                <Badge variant="cyan">Live Compiler Demonstration</Badge>
                <h2 className="font-headline-lg text-2xl font-bold text-on-surface mt-2">
                  Test the Heuristic Scorer in Real-Time
                </h2>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto text-xs">
                {ARCHETYPES.map((arch) => (
                  <button
                    key={arch.id}
                    onClick={() => loadArchetype(arch.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      activeArchetype === arch.id
                        ? 'bg-primary/20 border-primary text-primary font-bold'
                        : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {arch.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
              <div className="lg:col-span-7 space-y-5">
                <div className="relative">
                  <textarea
                    value={rawPrompt}
                    onChange={(e) => setRawPrompt(e.target.value)}
                    rows={6}
                    className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 text-xs font-code-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all resize-none leading-relaxed"
                    placeholder="Enter project requirements..."
                  />
                </div>
                <ClarificationChips />
                <StageVisualizer />
                <div className="pt-2 flex justify-end">
                  <Button onClick={() => runCompilation()} disabled={isCompiling} className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-tertiary" />
                    <span>{isCompiling ? 'Compiling Pipeline...' : 'Compile Prompt ⚡'}</span>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-surface-container p-6 rounded-xl border border-outline-variant/20 flex flex-col justify-between">
                <ScoreGauge />
                <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-outline">
                  <span>Target Adapter: Google Antigravity</span>
                  <Link to="/sandbox" className="text-primary font-semibold hover:underline flex items-center gap-1">
                    Open Workbench &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </RevealOnScroll>
      </section>

      {/* 3. THE 4 PILLARS BENTO GRID */}
      <section className="max-w-6xl mx-auto px-6">
        <RevealOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="purple">System Architecture</Badge>
            <h2 className="font-display-hero text-3xl md:text-4xl font-bold text-on-surface mt-3">
              The 4 Pillars of Precision Prompting
            </h2>
            <p className="text-on-surface-variant text-sm mt-2">
              Transforming unformed thoughts into deterministic execution specs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pillar 1 */}
            <TiltCard>
              <SpotlightCard className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <Badge variant="default">Pillar 01</Badge>
                  <h3 className="font-headline-lg text-xl font-bold text-on-surface mt-2">7-Stage Core Compiler</h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Deterministic pipeline separating raw intent classification, schema validation, synthesis, and an adversarial red-team critique loop before model code generation.
                  </p>
                </div>
                <Link to="/compiler" className="mt-6 text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  Explore The 7 Stages &rarr;
                </Link>
              </SpotlightCard>
            </TiltCard>

            {/* Pillar 2 */}
            <TiltCard>
              <SpotlightCard className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <Badge variant="cyan">Pillar 02</Badge>
                  <h3 className="font-headline-lg text-xl font-bold text-on-surface mt-2">100-Point Quality Scorer</h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Closed-loop heuristic evaluating prompts across 7 dimensions (Goal clarity, Completeness, Constraint rigor, Agent gating). Only prompts scoring &ge;90 are approved.
                  </p>
                </div>
                <Link to="/features" className="mt-6 text-xs text-tertiary font-semibold hover:underline flex items-center gap-1">
                  Inspect Rubric Weights &rarr;
                </Link>
              </SpotlightCard>
            </TiltCard>

            {/* Pillar 3 */}
            <TiltCard>
              <SpotlightCard className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 mb-4">
                    <Layers className="w-5 h-5" />
                  </div>
                  <Badge variant="emerald">Pillar 03</Badge>
                  <h3 className="font-headline-lg text-xl font-bold text-on-surface mt-2">Tri-Modal Ingestion</h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Zero conversational fatigue. Ingest from raw speech dictation, visual Figma/wireframe screenshots, or GitHub repository structural trees with instant chip recommendations.
                  </p>
                </div>
                <Link to="/sandbox" className="mt-6 text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                  Try Ingestion Workbench &rarr;
                </Link>
              </SpotlightCard>
            </TiltCard>

            {/* Pillar 4 */}
            <TiltCard>
              <SpotlightCard className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                    <GitPullRequest className="w-5 h-5" />
                  </div>
                  <Badge variant="purple">Pillar 04</Badge>
                  <h3 className="font-headline-lg text-xl font-bold text-on-surface mt-2">Two-Prompt Vibe Framework</h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Bifurcates tasks into an immutable Architectural Specification (Prompt A) and a step-by-step Execution Blueprint (Prompt B) with mandatory terminal gates.
                  </p>
                </div>
                <Link to="/two-prompt" className="mt-6 text-xs text-secondary font-semibold hover:underline flex items-center gap-1">
                  Read The Vibe Whitepaper &rarr;
                </Link>
              </SpotlightCard>
            </TiltCard>

          </div>
        </RevealOnScroll>
      </section>

      {/* 4. THE TWO-PROMPT FAILURE COMPARISON */}
      <section className="max-w-6xl mx-auto px-6">
        <RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* The Old Way */}
            <SpotlightCard className="p-8 border-red-500/30">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-red-400 bg-red-500/10 border-red-500/30">The Old Way • 82% Failure</Badge>
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-headline-lg text-xl font-bold text-on-surface">The Monolithic Prompt</h3>
              <p className="text-xs text-on-surface-variant mt-2 italic">
                "Build me a full-stack SaaS app with Stripe, Next.js, and Auth0. Make it clean and test it."
              </p>
              <div className="mt-6 space-y-3 text-xs text-on-surface-variant">
                <div className="p-3 rounded-lg bg-surface-container border border-red-500/20">
                  <strong className="text-red-400">Immediate Code Editing:</strong> Agent writes code before confirming database schema or file tree structure.
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-red-500/20">
                  <strong className="text-red-400">Context Drift:</strong> Rewrites existing schemas midway through component implementation.
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-red-500/20">
                  <strong className="text-red-400">Infinite Loops:</strong> Exhausts context in broken unit test loops without completing tasks.
                </div>
              </div>
            </SpotlightCard>

            {/* The PromptArchitect Way */}
            <SpotlightCard className="p-8 border-emerald-500/40">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="emerald">PromptArchitect • 98.4% First-Pass</Badge>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-headline-lg text-xl font-bold text-on-surface">The Two-Prompt Separation</h3>
              <p className="text-xs text-on-surface-variant mt-2">
                Decouples planning from execution into strict mathematical stages.
              </p>
              <div className="mt-6 space-y-3 text-xs text-on-surface-variant">
                <div className="p-3 rounded-lg bg-surface-container border border-emerald-500/20">
                  <strong className="text-emerald-400">Prompt A (Contract):</strong> Zero code modifications. Locks DB relations, schemas, error codes & PRD.
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-emerald-500/20">
                  <strong className="text-emerald-400">Prompt B (Blueprint):</strong> Requires tree inspection first, step-by-step terminal checkpoints & rollbacks.
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-emerald-500/20">
                  <strong className="text-emerald-400">Zero Hallucination:</strong> Subagents execute bounded tasks with deterministic validation gates.
                </div>
              </div>
            </SpotlightCard>

          </div>
        </RevealOnScroll>
      </section>

      {/* 5. TARGET AGENTS TICKER */}
      <section className="max-w-6xl mx-auto px-6 text-center">
        <RevealOnScroll>
          <span className="text-[11px] font-mono text-outline uppercase tracking-wider">
            Compiles Natively For Any Autonomous Engine
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
            <Link to="/targets" className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 hover:border-primary transition-all">
              <Compass className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-xs font-bold text-on-surface">Google Antigravity</div>
              <div className="text-[10px] text-outline font-mono">.agents/skills</div>
            </Link>
            <Link to="/targets" className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 hover:border-secondary transition-all">
              <FileCode2 className="w-5 h-5 text-secondary mx-auto mb-2" />
              <div className="text-xs font-bold text-on-surface">Cursor IDE</div>
              <div className="text-[10px] text-outline font-mono">.cursorrules / .mdc</div>
            </Link>
            <Link to="/targets" className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 hover:border-tertiary transition-all">
              <Code2 className="w-5 h-5 text-tertiary mx-auto mb-2" />
              <div className="text-xs font-bold text-on-surface">Claude Code</div>
              <div className="text-[10px] text-outline font-mono">Semantic XML</div>
            </Link>
            <Link to="/targets" className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 hover:border-emerald-400 transition-all">
              <Box className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-on-surface">v0 (Vercel)</div>
              <div className="text-[10px] text-outline font-mono">React / Tailwind</div>
            </Link>
            <Link to="/targets" className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 hover:border-purple-400 transition-all">
              <Terminal className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-on-surface">Midjourney v6</div>
              <div className="text-[10px] text-outline font-mono">Optics / Flags</div>
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <RevealOnScroll>
          <SpotlightCard className="p-12 border border-outline-variant/30 text-center">
            <h2 className="font-display-hero text-3xl font-bold text-on-surface">
              Stop Fighting Your Coding Agents.
            </h2>
            <p className="text-on-surface-variant text-sm mt-3 max-w-lg mx-auto">
              Feed them verified architectural specifications. Get started free in under 30 seconds.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link to="/sandbox">
                <Button size="lg" className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-tertiary" />
                  <span>Launch Live Sandbox</span>
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing & ROI
                </Button>
              </Link>
            </div>
          </SpotlightCard>
        </RevealOnScroll>
      </section>

    </div>
  );
};
