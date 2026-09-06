import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TiltCard } from '../components/motion/TiltCard';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { RevealOnScroll } from '../components/motion/RevealOnScroll';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Check, ChevronDown, Zap } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Can I use my own LLM API keys with PromptArchitect?",
      a: "Yes. On the Enterprise / BYOK plan, you can connect your Anthropic, OpenAI, or Google Cloud Vertex API keys. Your prompts are compiled through your own private model endpoints with zero data retention on our servers."
    },
    {
      q: "Why is the Two-Prompt framework better than one comprehensive prompt?",
      a: "Coding agents suffer from attention drift when given combined architectural planning and execution commands. By forcing the agent to commit to Prompt A (spec, schemas, contracts) before executing Prompt B (terminal gated tasks), hallucination rates plummet from 82% to under 2%."
    },
    {
      q: "Does it generate .cursorrules and Google Antigravity skills directly?",
      a: "Yes. The Target Adapter stage outputs directly downloadable .cursorrules, .cursor/rules/*.mdc, or Google Antigravity skill folders with formatted SKILL.md files ready for your repository."
    },
    {
      q: "What happens if an adversarial critique detects a security loophole?",
      a: "Stage 5 of the compiler acts as a red-team adversary. If it spots unauthenticated endpoints, missing HMAC replay buffers, or SQL injection vectors, Stage 6 automatically synthesizes defensive guardrails into the prompt before delivery."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-24 space-y-16">
      
      {/* Hero Header */}
      <RevealOnScroll>
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="cyan">Deterministic ROI</Badge>
          <h1 className="font-display-hero text-4xl md:text-5xl font-bold mt-4 tracking-tight">
            Simple Pricing,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
              Zero Hallucination
            </span>
          </h1>
          <p className="text-on-surface-variant font-body-lg text-sm md:text-base mt-4 leading-relaxed">
            Stop wasting tokens on infinite test debugging loops. One compiled specification saves an average of 42 agent iterations per task.
          </p>

          {/* Billing Switcher */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-xs font-semibold ${!isAnnual ? 'text-on-surface' : 'text-outline'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`w-12 h-6 rounded-full p-1 border transition-all ${
                isAnnual ? 'bg-primary-container border-primary' : 'bg-surface-container-high border-outline-variant/40'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-primary transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-on-surface' : 'text-outline'}`}>
              Annual
              <Badge variant="emerald" className="text-[9px]">Save 25%</Badge>
            </span>
          </div>
        </div>
      </RevealOnScroll>

      {/* 3 Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Tier 1: Hobbyist */}
        <RevealOnScroll delay={0.05}>
          <TiltCard className="h-full">
            <SpotlightCard className="p-8 h-full flex flex-col justify-between">
              <div>
                <Badge variant="secondary">Hobbyist</Badge>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display-hero text-4xl font-bold text-on-surface">$0</span>
                  <span className="text-xs text-outline">/ forever</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">For individual devs exploring precision prompt compilation.</p>

                <ul className="mt-6 space-y-3 text-xs text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>50 compilations / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>100-Point Heuristic Scorer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Tri-Modal Ingestion (Text & Voice)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Standard Claude & Cursor output</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link to="/sandbox" className="w-full block">
                  <Button variant="secondary" className="w-full">
                    Start Free
                  </Button>
                </Link>
              </div>
            </SpotlightCard>
          </TiltCard>
        </RevealOnScroll>

        {/* Tier 2: Pro Dev */}
        <RevealOnScroll delay={0.1}>
          <TiltCard className="h-full">
            <SpotlightCard className="p-8 h-full flex flex-col justify-between border-2 border-primary relative shadow-[0_0_35px_rgba(99,102,241,0.25)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="bg-primary text-surface-container-lowest font-bold text-[10px] shadow-lg">
                  MOST POPULAR
                </Badge>
              </div>
              <div>
                <Badge variant="default">Pro Developer</Badge>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display-hero text-4xl font-bold text-on-surface">
                    {isAnnual ? '$99' : '$12'}
                  </span>
                  <span className="text-xs text-outline">{isAnnual ? '/ year' : '/ month'}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">For 10x engineers shipping autonomous full-stack features.</p>

                <ul className="mt-6 space-y-3 text-xs text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span><strong>Unlimited</strong> prompt compilations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>The Full 7-Stage Engine Pipeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Two-Prompt Vibe Framework (A & B)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Adversarial Critique & Auto-Repair</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>All 5 Target Adapters</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link to="/sandbox" className="w-full block">
                  <Button className="w-full flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-tertiary" />
                    <span>Upgrade to Pro ⚡</span>
                  </Button>
                </Link>
              </div>
            </SpotlightCard>
          </TiltCard>
        </RevealOnScroll>

        {/* Tier 3: Enterprise */}
        <RevealOnScroll delay={0.15}>
          <TiltCard className="h-full">
            <SpotlightCard className="p-8 h-full flex flex-col justify-between">
              <div>
                <Badge variant="cyan">Enterprise / BYOK</Badge>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display-hero text-4xl font-bold text-on-surface">
                    {isAnnual ? '$39' : '$49'}
                  </span>
                  <span className="text-xs text-outline">{isAnnual ? '/ seat / mo (annual)' : '/ seat / mo'}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">For engineering teams building multi-agent autonomous swarms.</p>

                <ul className="mt-6 space-y-3 text-xs text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-tertiary" />
                    <span>Bring Your Own Key (Gemini, Claude, GPT-4o)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-tertiary" />
                    <span>Organization Prompt Registry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-tertiary" />
                    <span>CI/CD GitHub Action Linter Gate</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-tertiary" />
                    <span>Subagent Swarm Orchestrator Blueprint</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link to="/docs" className="w-full block">
                  <Button variant="secondary" className="w-full">
                    Contact Solutions
                  </Button>
                </Link>
              </div>
            </SpotlightCard>
          </TiltCard>
        </RevealOnScroll>

      </div>

      {/* FAQ Accordion */}
      <RevealOnScroll>
        <SpotlightCard className="p-8 border border-outline-variant/30">
          <h3 className="font-headline-lg text-2xl font-bold text-on-surface mb-6">Frequently Asked Questions</h3>
          <div className="space-y-3 text-xs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-on-surface flex items-center justify-between"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-outline'}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-on-surface-variant leading-relaxed border-t border-outline-variant/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SpotlightCard>
      </RevealOnScroll>

    </div>
  );
};
