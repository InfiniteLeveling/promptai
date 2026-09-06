import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUp,
  Sparkles,
  Terminal,
  CheckCircle2,
  Send,
  ShieldCheck,
  Cpu,
  Globe,
  Activity,
  Layers,
  Code2
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 relative z-20 mt-20 select-none before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/50 before:to-transparent">
      
      {/* 1. Newsletter & Prompt Architecture Digest Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-10">
        <div className="rounded-3xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border border-outline-variant/30 p-8 sm:p-10 relative overflow-hidden shadow-2xl shadow-primary/5">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/40 text-[11px] font-mono text-tertiary">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Weekly Prompt Architecture Digest</span>
              </div>
              <h3 className="font-display-hero text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                Master Coding Agent Infrastructure &amp; Schemas
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Join 14,000+ AI engineers receiving zero-drift PRD templates, benchmark scores, and target dialect updates every Tuesday.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex-1 max-w-md">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your engineer email..."
                    required
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 focus:border-primary text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribed}
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary-container to-secondary text-surface-container-lowest font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 shrink-0 cursor-pointer disabled:opacity-80"
                >
                  {subscribed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <>
                      <span>Join Free</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-outline font-mono mt-2.5 pl-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Zero spam
                </span>
                <span>•</span>
                <span>Unsubscribe anytime</span>
                <span>•</span>
                <span>Plain markdown code</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-t border-outline-variant/15">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
          
          {/* Col 1 & 2: Brand Identity & Telemetry */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-surface-container-lowest font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
                PA
              </div>
              <span className="font-display-hero text-lg font-bold tracking-tight text-on-surface">
                PromptArchitect <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-bold align-super">AI</span>
              </span>
            </Link>

            <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
              Autonomous pre-compilation requirements &amp; prompt orchestration engine. Eliminating conversational drift and turn exhaustion for AI coding agents.
            </p>

            {/* Telemetry Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Engine v3.1: All Systems Operational</span>
            </div>

            {/* Social & Community Links */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-outline hover:text-primary transition-all hover:scale-105"
                title="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-outline hover:text-primary transition-all hover:scale-105"
                title="Twitter / X"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <Link
                to="/docs"
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-outline hover:text-primary transition-all hover:scale-105"
                title="Documentation"
              >
                <Terminal className="w-4 h-4" />
              </Link>
              <Link
                to="/compiler"
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-outline hover:text-primary transition-all hover:scale-105"
                title="Compiler Pipeline"
              >
                <Cpu className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Col 3: Engine & Pipeline */}
          <div className="space-y-3.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-primary" /> Engine
            </div>
            <ul className="space-y-2.5 text-xs text-on-surface-variant">
              <li>
                <Link to="/compiler" className="hover:text-primary transition-colors flex items-center gap-1">
                  7-Stage Pipeline
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-primary transition-colors">
                  Heuristic 100-pt Scorer
                </Link>
              </li>
              <li>
                <Link to="/compiler" className="hover:text-primary transition-colors">
                  Canonical JSON Schema
                </Link>
              </li>
              <li>
                <Link to="/two-prompt" className="hover:text-primary transition-colors">
                  Two-Prompt Framework
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-primary transition-colors">
                  Tri-Modal Ingestion
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Target Dialects */}
          <div className="space-y-3.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-tertiary" /> Target Dialects
            </div>
            <ul className="space-y-2.5 text-xs text-on-surface-variant">
              <li>
                <Link to="/targets" className="hover:text-tertiary transition-colors">
                  Google Antigravity
                </Link>
              </li>
              <li>
                <Link to="/targets" className="hover:text-tertiary transition-colors">
                  Cursor Rules (.mdc)
                </Link>
              </li>
              <li>
                <Link to="/targets" className="hover:text-tertiary transition-colors">
                  Claude Code XML
                </Link>
              </li>
              <li>
                <Link to="/targets" className="hover:text-tertiary transition-colors">
                  v0 (Vercel) React 19
                </Link>
              </li>
              <li>
                <Link to="/targets" className="hover:text-tertiary transition-colors">
                  Midjourney Cinematic
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Product & Workbench */}
          <div className="space-y-3.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-secondary" /> Product
            </div>
            <ul className="space-y-2.5 text-xs text-on-surface-variant">
              <li>
                <Link to="/sandbox" className="hover:text-secondary transition-colors font-semibold text-secondary flex items-center gap-1">
                  Live AI Sandbox <span className="text-[9px] px-1 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/30">Free</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-secondary transition-colors">
                  Pricing &amp; Quotas
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-secondary transition-colors">
                  REST API &amp; SDK
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-secondary transition-colors">
                  Benchmark Matrix
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-secondary transition-colors">
                  Enterprise SLA
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 6: Documentation & Standards */}
          <div className="space-y-3.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Standards
            </div>
            <ul className="space-y-2.5 text-xs text-on-surface-variant">
              <li>
                <Link to="/docs" className="hover:text-emerald-400 transition-colors">
                  Architecture Docs
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-emerald-400 transition-colors">
                  Security Invariants
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-emerald-400 transition-colors">
                  Release Changelog
                </Link>
              </li>
              <li>
                <a href="#status" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" /> Status Dashboard
                </a>
              </li>
              <li>
                <Link to="/docs" className="hover:text-emerald-400 transition-colors">
                  Privacy Protocol
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Supported Dialects Ticker Strip */}
      <div className="max-w-7xl mx-auto px-6 py-4 border-t border-outline-variant/10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-outline">
          <span className="text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" /> Supported Agent Dialects:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-on-surface-variant">
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-colors">Google Antigravity</span>
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-colors">Cursor IDE (.mdc)</span>
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-colors">Claude Code XML</span>
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-colors">v0 (React 19)</span>
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-colors">Windsurf</span>
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-colors">Devin AI</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Legal & Back to Top Strip */}
      <div className="border-t border-outline-variant/20 bg-surface-container-lowest/60">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-outline">
          <div className="flex items-center gap-3">
            <span>&copy; {new Date().getFullYear()} PromptArchitect AI Inc. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline font-mono text-[10px]">Zero Conversational Fatigue Protocol</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/20">
              v3.1.2-prod
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface hover:text-primary transition-all text-xs group"
              title="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
};
