import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { ChatMessageItem } from './ChatMessageItem';
import { Sparkles, Globe, Cpu, Smartphone, ArrowUpRight } from 'lucide-react';

export const MessageList: React.FC = () => {
  const { getActiveConversation, sendMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConversation = getActiveConversation();
  const messages = activeConversation?.messages || [];

  // Auto-scroll to bottom on new messages or streaming chunks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.compilingStage, messages[messages.length - 1]?.content]);

  const sampleIdeas = [
    {
      title: 'SaaS Platform with Stripe',
      prompt: 'Build a full-stack SaaS platform in TypeScript with Next.js 15, Supabase auth, Stripe subscription billing, and responsive dashboard.',
      icon: <Globe className="w-4 h-4 text-primary" />
    },
    {
      title: 'Microservice with Redis Streams',
      prompt: 'Build a high-throughput webhook dispatcher microservice in Go with Redis Streams, PostgreSQL, and HMAC signature verification.',
      icon: <Cpu className="w-4 h-4 text-tertiary" />
    },
    {
      title: 'Offline-First Mobile App',
      prompt: 'Build an offline-first mobile notes application in React Native with encrypted local SQLite and biometric auth.',
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />
    },
    {
      title: 'Antigravity Skills Task Agent',
      prompt: 'Refine and structure this prompt for Google Antigravity: Ensure workspace directory inspection first, 100% test coverage gate, and zero any types.',
      icon: <Sparkles className="w-4 h-4 text-secondary" />
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between">
      <div className="flex-1 pb-4">
        {/* If conversation is fresh / has only 1 greeting message, show prompt starter cards */}
        {messages.length <= 1 && (
          <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 text-center select-none animate-in fade-in duration-300">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-[11px] font-mono text-tertiary">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-tertiary" />
                <span>Conversational Prompt Compiler Engine</span>
              </div>

              <h1 className="font-display-hero text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
                What do you want to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
                  create?
                </span>
              </h1>
              <p className="text-on-surface-variant text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                Describe your project requirements. PromptArchitect compiles high-fidelity PRD specifications, agent implementation steps, and architecture defenses without conversational drift.
              </p>
            </div>

            {/* Quick Inspiration Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              {sampleIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(idea.prompt)}
                  className="group p-4 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 transition-all duration-200 text-left flex flex-col justify-between space-y-2 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {idea.icon}
                      <span>{idea.title}</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-outline group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="text-[11px] text-outline line-clamp-2 leading-relaxed font-sans">
                    {idea.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="divide-y divide-outline-variant/10">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}
        </div>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-6" />
      </div>
    </div>
  );
};
