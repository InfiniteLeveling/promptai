import React from 'react';
import { ARCHETYPES } from '../../lib/constants';
import { usePromptStore } from '../../store/usePromptStore';
import { Globe, Cpu, Smartphone, Box, ArrowUpRight, Sparkles } from 'lucide-react';

export const PromptGreeting: React.FC = () => {
  const { loadArchetype, setRawPrompt, runCompilation } = usePromptStore();

  const getIcon = (id: string) => {
    switch (id) {
      case 'saas': return <Globe className="w-5 h-5 text-primary" />;
      case 'microservice': return <Cpu className="w-5 h-5 text-tertiary" />;
      case 'mobile': return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'canvas': return <Box className="w-5 h-5 text-purple-400" />;
      default: return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const sampleIdeas = [
    {
      label: 'Build a SaaS website',
      prompt: 'Build a full-stack SaaS platform in TypeScript with Next.js 15, Supabase auth, Stripe subscription billing, and responsive dashboard.',
      icon: '✨'
    },
    {
      label: 'Microservice API with Redis',
      prompt: 'Build a high-throughput webhook dispatcher microservice in Go with Redis Streams, PostgreSQL, and HMAC signature verification.',
      icon: '⚙️'
    },
    {
      label: 'Mobile App with Offline Sync',
      prompt: 'Build an offline-first mobile notes application in React Native with encrypted local SQLite and biometric auth.',
      icon: '📱'
    },
    {
      label: 'Analyze existing prompt',
      prompt: 'Review and refine this prompt for Google Antigravity: Ensure directory inspection first, 100% test coverage gate, and zero any types.',
      icon: '🔍'
    }
  ];

  const handleIdeaClick = (promptText: string) => {
    setRawPrompt(promptText);
    runCompilation();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 text-center select-none">
      {/* 1. Conversational Hero Section (user-experence.md § 1) */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-[11px] font-mono text-tertiary">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-tertiary" />
          <span>7-Stage Autonomous Prompt Compiler</span>
        </div>
        
        <h1 className="font-display-hero text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
          What do you want to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
            create?
          </span>
        </h1>
        
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          Describe your idea in your own words. You don't need to know how to write a prompt — PromptArchitect compiles the production-ready specification for you.
        </p>
      </div>

      {/* 2. One-Click Idea Inspiration Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
        {sampleIdeas.map((idea, idx) => (
          <button
            key={idx}
            onClick={() => handleIdeaClick(idea.prompt)}
            className="px-3.5 py-1.5 rounded-full bg-surface-container/80 hover:bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <span>{idea.icon}</span>
            <span className="font-medium group-hover:text-primary transition-colors">{idea.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Domain Archetype Starter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-2">
        {ARCHETYPES.map((arch) => (
          <button
            key={arch.id}
            onClick={() => loadArchetype(arch.id)}
            className="p-4 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 transition-all duration-200 group flex flex-col justify-between h-32 hover:shadow-[0_4px_20px_rgba(99,102,241,0.15)] cursor-pointer"
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
