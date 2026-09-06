import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { RevealOnScroll } from '../components/motion/RevealOnScroll';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Cpu, Zap, ArrowRight } from 'lucide-react';

export const CompilerPage: React.FC = () => {
  const [activeStage, setActiveStage] = useState(1);

  const stagesData = [
    {
      num: 1,
      title: "Stage 1: Intent & Archetype Classifier",
      badge: "Ingestion SLA: <25ms",
      desc: "Classifies raw human input into one of 11 multi-domain archetypes (e.g. backend microservice, SaaS, 3D WebGL, mobile).",
      input: "Raw unstructured text string or transcribed speech.",
      output: "Archetype tag + initial parameter boundary schema.",
      invariant: "Non-blocking fallback to general_fullstack if confidence < 0.85."
    },
    {
      num: 2,
      title: "Stage 2: Heuristic Constraint Extractor",
      badge: "Analysis SLA: <40ms",
      desc: "Extracts architectural requirements, database relations, security mandates, and SLAs into structured criteria.",
      input: "Classified raw prompt string.",
      output: "Extracted constraints array (e.g. PostgreSQL 16, HMAC-SHA256, Redis Redlock).",
      invariant: "Outlaws vague buzzwords ('make it fast' -> converted to '<10ms p99')."
    },
    {
      num: 3,
      title: "Stage 3: Parameter Gap Isolator",
      badge: "Interactive Chips: <15s",
      desc: "Detects missing architectural boundaries and generates 3-4 clickable clarification chips to prevent conversational fatigue.",
      input: "Extracted constraints vs CanonicalRequirementSpec schema.",
      output: "Dynamic chip recommendation list with +5pt score incentives.",
      invariant: "Always includes 'Proceed with defaults' escape hatch."
    },
    {
      num: 4,
      title: "Stage 4: Candidate Prompt v1 Synthesizer",
      badge: "Generation SLA: <120ms",
      desc: "Assembles the complete Candidate Prompt v1 utilizing strict XML boundary containers and anti-hallucination directives.",
      input: "CanonicalRequirementSpec JSON object.",
      output: "Candidate Prompt v1 with complete deliverable schemas.",
      invariant: "Requires tree inspection first rule injected into all outputs."
    },
    {
      num: 5,
      title: "Stage 5: Adversarial Critique Engine",
      badge: "Red-Team Pass: <80ms",
      desc: "Acts as a red-team adversary searching for security loopholes, race conditions, missing indexes, and unauthenticated endpoints.",
      input: "Candidate Prompt v1.",
      output: "Adversarial critique log with flagged vulnerability vectors.",
      invariant: "Flags any TypeScript prompt lacking strict mode or Zod boundary checks."
    },
    {
      num: 6,
      title: "Stage 6: Heuristic Optimization Loop",
      badge: "Target Score: >=90 pts",
      desc: "Automatically injects defensive guardrails and refines the candidate prompt until it satisfies the 100-point rubric.",
      input: "Candidate Prompt v1 + Critique Log.",
      output: "Verified Master Prompt.",
      invariant: "Terminates after max 3 iterations to guarantee sub-second completion."
    },
    {
      num: 7,
      title: "Stage 7: Target Format Adapter",
      badge: "Native Dialects: 5 Targets",
      desc: "Translates the verified Master Prompt into native syntactic containers for Google Antigravity, Cursor, Claude Code, v0, or Midjourney.",
      input: "Verified Master Prompt.",
      output: ".agents/skills markdown, .cursorrules, or semantic XML.",
      invariant: "Guarantees 100% syntactic compliance with target LLM parser."
    }
  ];

  const currentStage = stagesData.find((s) => s.num === activeStage) || stagesData[0];

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-24 space-y-16">
      
      {/* Hero Header */}
      <RevealOnScroll>
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="cyan">Compiler Pipeline</Badge>
          <h1 className="font-display-hero text-4xl md:text-5xl font-bold mt-4 tracking-tight">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">7-Stage</span> Core Compiler Engine
          </h1>
          <p className="text-on-surface-variant font-body-lg text-sm md:text-base mt-4 leading-relaxed">
            From ambiguous human intention to mathematically bounded execution prompts. Discover how our multi-stage compiler ensures 98.4% first-pass coding agent success.
          </p>
        </div>
      </RevealOnScroll>

      {/* Interactive Stage Stepper */}
      <RevealOnScroll>
        <SpotlightCard className="p-8 border border-outline-variant/30">
          <div className="flex items-center justify-between pb-6 border-b border-outline-variant/30">
            <div>
              <span className="text-xs font-mono text-outline uppercase tracking-wider">Interactive Stage Explorer</span>
              <h2 className="font-headline-lg text-xl font-bold text-on-surface mt-1">Select A Pipeline Stage</h2>
            </div>
            <Badge variant="default">{currentStage.badge}</Badge>
          </div>

          {/* Stage Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-6">
            {stagesData.map((st) => (
              <button
                key={st.num}
                onClick={() => setActiveStage(st.num)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                  activeStage === st.num
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline'
                }`}
              >
                <div className="font-mono text-[10px] opacity-70">Stage 0{st.num}</div>
                <div className="text-xs font-bold truncate mt-1">{st.title.split(':')[1]?.trim() || st.title}</div>
              </button>
            ))}
          </div>

          {/* Stage Details Inspection Card */}
          <div className="mt-8 bg-surface-container p-6 rounded-xl border border-outline-variant/20 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-tertiary" />
              <h3 className="font-headline-lg text-lg font-bold text-on-surface">{currentStage.title}</h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">{currentStage.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/20 text-xs">
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20">
                <div className="font-mono text-[10px] text-outline uppercase">Input Format</div>
                <div className="text-on-surface mt-1">{currentStage.input}</div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20">
                <div className="font-mono text-[10px] text-outline uppercase">Synthesized Output</div>
                <div className="text-on-surface mt-1">{currentStage.output}</div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20">
                <div className="font-mono text-[10px] text-tertiary uppercase">Pipeline Invariant</div>
                <div className="text-tertiary mt-1">{currentStage.invariant}</div>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </RevealOnScroll>

      {/* CTA */}
      <RevealOnScroll>
        <SpotlightCard className="p-10 text-center border border-outline-variant/30">
          <h3 className="font-headline-lg text-2xl font-bold text-on-surface">Test The Compiler In Action</h3>
          <p className="text-on-surface-variant text-sm mt-2 max-w-lg mx-auto">
            Input your own unformed prompt and watch the 7-stage engine compile it in under a second.
          </p>
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
