import React from 'react';
import { ARCHETYPES } from '../../lib/constants';
import { usePromptStore } from '../../store/usePromptStore';
import { Globe, Cpu, Smartphone, Box, ArrowUpRight, Sparkles } from 'lucide-react';

export const PromptGreeting: React.FC = () => {
  const { loadArchetype } = usePromptStore();

  const getIcon = (id: string) => {
    switch (id) {
      case 'saas': return <Globe className="w-5 h-5 text-primary" />;
      case 'microservice': return <Cpu className="w-5 h-5 text-tertiary" />;
      case 'mobile': return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'canvas': return <Box className="w-5 h-5 text-purple-400" />;
      default: return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10 text-center select-none">
      {/* Gemini-style Hero Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-[11px] font-mono text-tertiary">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-tertiary" />
          <span>7-Stage Autonomous Prompt Compiler</span>
        </div>
        <h1 className="font-display-hero text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
          Hello,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
            Architect.
          </span>
          <br />
          What are we compiling today?
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto">
          Select a domain archetype below, or type your project requirements into the prompt bar to generate verified dual-stage blueprints.
        </p>
      </div>

      {/* 4 Quick Start Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
        {ARCHETYPES.map((arch) => (
          <button
            key={arch.id}
            onClick={() => loadArchetype(arch.id)}
            className="p-4 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 transition-all duration-200 group flex flex-col justify-between h-32 hover:shadow-[0_4px_20px_rgba(99,102,241,0.15)]"
          >
            <div className="flex items-start justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center">
                {getIcon(arch.id)}
              </div>
              <ArrowUpRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <div className="font-headline-sm font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                {arch.name}
              </div>
              <div className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                {arch.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
