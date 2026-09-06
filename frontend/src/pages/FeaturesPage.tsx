import React from 'react';
import { Link } from 'react-router-dom';
import { TiltCard } from '../components/motion/TiltCard';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { RevealOnScroll } from '../components/motion/RevealOnScroll';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Cpu, Sparkles, Layers, GitPullRequest, ArrowRight, Zap } from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-24 space-y-16">
      
      {/* Hero Header */}
      <RevealOnScroll>
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="cyan">Architecture Deep Dive</Badge>
          <h1 className="font-display-hero text-4xl md:text-5xl font-bold mt-4 tracking-tight">
            Engineered for Extreme{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
              Syntactic Rigor
            </span>
          </h1>
          <p className="text-on-surface-variant font-body-lg text-sm md:text-base mt-4 leading-relaxed">
            PromptArchitect AI turns unformed developer thoughts into model-neutral, mathematically bounded execution blueprints that autonomous coding agents can execute without hallucination.
          </p>
        </div>
      </RevealOnScroll>

      {/* The 4 Pillars Detailed Grid */}
      <div className="space-y-12">
        
        {/* Pillar 1 */}
        <RevealOnScroll>
          <TiltCard>
            <SpotlightCard className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="cyan">Pillar 01 • Compilation Pipeline</Badge>
                <Cpu className="w-6 h-6 text-tertiary" />
              </div>
              <h2 className="font-headline-lg text-2xl text-on-surface font-bold">The 7-Stage Core Compiler</h2>
              <p className="text-on-surface-variant text-sm mt-2 max-w-3xl">
                Rather than delegating architecture and code generation to a single, chaotic LLM call, our pipeline separates intent parsing, heuristic constraint extraction, adversarial critique, and final router formatting into deterministic stages.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                  <div className="text-tertiary font-bold text-sm">Stages 1-3: Intent & Normalization</div>
                  <p className="text-xs text-on-surface-variant mt-2">Classifies domain across 11 archetypes, compiles raw constraints into the CanonicalRequirementSpec JSON schema, and extracts missing parameter chips.</p>
                </div>
                <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                  <div className="text-primary font-bold text-sm">Stages 4-6: Synthesis & Critique Loop</div>
                  <p className="text-xs text-on-surface-variant mt-2">Synthesizes Candidate Prompt v1, runs an adversarial reasoning pass exposing security holes and missing edges, and optimizes until score &ge; 90.</p>
                </div>
                <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                  <div className="text-emerald-400 font-bold text-sm">Stage 7: Target Format Adapter</div>
                  <p className="text-xs text-on-surface-variant mt-2">Compiles the master prompt into native XML containers for Claude, .cursorrules for Cursor, or step-by-step terminal gates for Antigravity.</p>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
        </RevealOnScroll>

        {/* Pillar 2 */}
        <RevealOnScroll>
          <TiltCard>
            <SpotlightCard className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="default">Pillar 02 • Scoring Engine</Badge>
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-headline-lg text-2xl text-on-surface font-bold">100-Point Heuristic Quality Scorer</h2>
              <p className="text-on-surface-variant text-sm mt-2 max-w-3xl">
                Transforms subjective prompt quality into mathematical certainty. Prompts are rigorously scored across 7 weighted dimensions before release:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mt-6 text-center text-xs">
                <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/20">
                  <div className="font-bold text-primary">Goal Clarity</div>
                  <div className="text-lg font-bold text-on-surface mt-1">20 pts</div>
                  <div className="text-[10px] text-outline mt-1">Role & Deliverable</div>
                </div>
                <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/20">
                  <div className="font-bold text-tertiary">Completeness</div>
                  <div className="text-lg font-bold text-on-surface mt-1">20 pts</div>
                  <div className="text-[10px] text-outline mt-1">Requirements</div>
                </div>
                <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/20">
                  <div className="font-bold text-emerald-400">Rigor</div>
                  <div className="text-lg font-bold text-on-surface mt-1">15 pts</div>
                  <div className="text-[10px] text-outline mt-1">Constraints</div>
                </div>
                <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/20">
                  <div className="font-bold text-secondary">Gating</div>
                  <div className="text-lg font-bold text-on-surface mt-1">15 pts</div>
                  <div className="text-[10px] text-outline mt-1">Terminal Tests</div>
                </div>
                <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/20">
                  <div className="font-bold text-on-surface">Context</div>
                  <div className="text-lg font-bold text-on-surface mt-1">10 pts</div>
                  <div className="text-[10px] text-outline mt-1">Environment</div>
                </div>
                <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/20">
                  <div className="font-bold text-primary">Model Fit</div>
                  <div className="text-lg font-bold text-on-surface mt-1">10 pts</div>
                  <div className="text-[10px] text-outline mt-1">Syntax Match</div>
                </div>
                <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/20">
                  <div className="font-bold text-purple-400">Defenses</div>
                  <div className="text-lg font-bold text-on-surface mt-1">10 pts</div>
                  <div className="text-[10px] text-outline mt-1">Edge Cases</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
        </RevealOnScroll>

        {/* Pillar 3 */}
        <RevealOnScroll>
          <TiltCard>
            <SpotlightCard className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="emerald">Pillar 03 • Ingestion Architecture</Badge>
                <Layers className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="font-headline-lg text-2xl text-on-surface font-bold">Tri-Modal Ingestion Engine</h2>
              <p className="text-on-surface-variant text-sm mt-2 max-w-3xl">
                Eliminates conversational fatigue. Ingest from raw speech dictation, visual wireframe screenshots, or repository structural trees:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                  <div className="text-emerald-400 font-bold text-sm">Mode A: Voice Dictation</div>
                  <p className="text-xs text-on-surface-variant mt-2">Transcribes raw spoken streams, strips conversational filler, and isolates actionable architectural boundaries in real-time.</p>
                </div>
                <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                  <div className="text-primary font-bold text-sm">Mode B: UI Screenshots & Wireframes</div>
                  <p className="text-xs text-on-surface-variant mt-2">Deconstructs UI wireframes into React component trees, layout hierarchy, and strongly typed prop models.</p>
                </div>
                <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                  <div className="text-tertiary font-bold text-sm">Mode C: GitHub Repo Ingestion</div>
                  <p className="text-xs text-on-surface-variant mt-2">Analyzes directory trees, package.json dependencies, and exported function interfaces to ensure zero dependency duplication.</p>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
        </RevealOnScroll>

        {/* Pillar 4 */}
        <RevealOnScroll>
          <TiltCard>
            <SpotlightCard className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="purple">Pillar 04 • Vibe-Coding Framework</Badge>
                <GitPullRequest className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="font-headline-lg text-2xl text-on-surface font-bold">The Two-Prompt Vibe Framework</h2>
              <p className="text-on-surface-variant text-sm mt-2 max-w-3xl">
                Bifurcates tasks into an immutable Architectural Specification (Prompt A) and an Execution Blueprint (Prompt B) with mandatory terminal gates.
              </p>
              <div className="space-y-3 mt-4 text-xs">
                <div className="p-3 rounded-lg bg-surface-container border border-primary/20">
                  <strong className="text-primary">Prompt A (Architectural Spec):</strong> Defines DB relations, API signatures, and strict constraints (PRD.md) without modifying code.
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-tertiary/20">
                  <strong className="text-tertiary">Prompt B (Agent Implementation):</strong> Requires agent to inspect the repo tree first and execute atomic phases with terminal test checkpoints.
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
        </RevealOnScroll>

      </div>

      {/* CTA Section */}
      <RevealOnScroll>
        <SpotlightCard className="p-10 text-center border border-outline-variant/30">
          <h3 className="font-headline-lg text-2xl font-bold text-on-surface">Experience Deterministic Prompt Compilation</h3>
          <p className="text-on-surface-variant text-sm mt-2 max-w-lg mx-auto">Test the compiler in our sandbox with pre-loaded multi-domain archetypes.</p>
          <div className="mt-6 flex justify-center">
            <Link to="/sandbox">
              <Button size="lg" className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-tertiary" />
                <span>Launch Sandbox</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </SpotlightCard>
      </RevealOnScroll>

    </div>
  );
};
