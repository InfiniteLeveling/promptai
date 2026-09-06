import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePromptStore } from '../../store/usePromptStore';
import { ARCHETYPES } from '../../lib/constants';
import {
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Cpu,
  Smartphone,
  Box,
  ExternalLink,
  BookOpen,
  History,
  Sparkles
} from 'lucide-react';

interface GeminiSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const GeminiSidebar: React.FC<GeminiSidebarProps> = ({ isCollapsed, onToggle }) => {
  const { activeArchetype, loadArchetype, clearPrompt } = usePromptStore();

  const getArchetypeIcon = (id: string) => {
    switch (id) {
      case 'saas': return <Globe className="w-4 h-4 text-primary" />;
      case 'microservice': return <Cpu className="w-4 h-4 text-tertiary" />;
      case 'mobile': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'canvas': return <Box className="w-4 h-4 text-purple-400" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  const recentCompilations = [
    { id: 'saas', name: 'Webhook Dispatcher', score: 94, lang: 'TypeScript' },
    { id: 'microservice', name: 'Reconciliation Worker', score: 92, lang: 'Go' },
    { id: 'mobile', name: 'Encrypted Notes App', score: 90, lang: 'React Native' },
    { id: 'canvas', name: '3D Solar System', score: 91, lang: 'Three.js' },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 68 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="h-screen flex flex-col justify-between bg-surface-container-lowest border-r border-outline-variant/20 relative z-30 select-none overflow-hidden"
    >
      {/* Top Brand & New Prompt Button */}
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between h-10 px-1">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-surface-container-lowest font-black text-xs shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                PA
              </div>
              <span className="font-headline-sm font-bold text-sm text-on-surface tracking-tight">
                PromptArchitect
              </span>
            </Link>
          )}

          <button
            onClick={onToggle}
            className="p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors mx-auto"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* New Prompt Button */}
        <button
          onClick={clearPrompt}
          className={`w-full flex items-center gap-2.5 rounded-xl border border-outline-variant/30 hover:border-primary transition-all p-2.5 bg-surface-container/60 hover:bg-surface-container text-xs font-semibold text-on-surface group ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="New Prompt Compilation"
        >
          <Plus className="w-4 h-4 text-primary group-hover:rotate-90 transition-transform duration-200" />
          {!isCollapsed && <span>New Compilation</span>}
        </button>
      </div>

      {/* Center Nav: Recent Compilations & Archetypes */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-5 py-2">
        {/* Recent Compilations */}
        <div>
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 text-[10px] font-mono text-outline uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <History className="w-3 h-3" /> Recent Specs
              </span>
            </div>
          )}
          <div className="space-y-1">
            {recentCompilations.map((item) => (
              <button
                key={item.id}
                onClick={() => loadArchetype(item.id)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-all ${
                  activeArchetype === item.id
                    ? 'bg-primary/15 text-primary border border-primary/30 font-medium'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={item.name}
              >
                {getArchetypeIcon(item.id)}
                {!isCollapsed && (
                  <div className="flex-1 truncate">
                    <div className="truncate text-xs">{item.name}</div>
                    <div className="text-[10px] text-outline flex items-center justify-between mt-0.5 font-mono">
                      <span>{item.lang}</span>
                      <span className="text-emerald-400 font-bold">{item.score} pts</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Domain Archetypes */}
        <div>
          {!isCollapsed && (
            <div className="px-2 text-[10px] font-mono text-outline uppercase tracking-wider mb-2">
              Archetypes
            </div>
          )}
          <div className="space-y-1">
            {ARCHETYPES.map((arch) => (
              <button
                key={arch.id}
                onClick={() => loadArchetype(arch.id)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-all ${
                  activeArchetype === arch.id
                    ? 'bg-surface-container-high text-on-surface font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={arch.name}
              >
                {getArchetypeIcon(arch.id)}
                {!isCollapsed && <span className="truncate">{arch.name}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Profile / Links */}
      <div className="p-3 border-t border-outline-variant/20 space-y-1">
        <Link
          to="/"
          className={`flex items-center gap-2.5 p-2 rounded-xl text-xs text-outline hover:text-on-surface hover:bg-surface-container transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Back to Landing Page"
        >
          <ExternalLink className="w-4 h-4 text-outline" />
          {!isCollapsed && <span>Back to Website</span>}
        </Link>

        <Link
          to="/docs"
          className={`flex items-center gap-2.5 p-2 rounded-xl text-xs text-outline hover:text-on-surface hover:bg-surface-container transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Developer Documentation"
        >
          <BookOpen className="w-4 h-4 text-outline" />
          {!isCollapsed && <span>Documentation</span>}
        </Link>

        {!isCollapsed && (
          <div className="pt-2 px-2 flex items-center justify-between text-[10px] text-outline font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine v2.4
            </span>
            <span className="text-primary font-bold">PRO TIER</span>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
