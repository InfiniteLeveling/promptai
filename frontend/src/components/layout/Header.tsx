import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Code } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-surface-container-lowest font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-transform duration-300 group-hover:scale-105">
            PA
          </div>
          <span className="font-headline-sm font-bold text-lg text-on-surface tracking-tight flex items-center gap-1">
            PromptArchitect AI
            <span className="text-[10px] font-code-sm font-bold text-primary border border-primary/30 bg-primary/10 px-1 py-0.2 rounded ml-1">TM</span>
          </span>
        </Link>

        {/* Trailing Actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/InfiniteLeveling/promptai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-mono text-on-surface transition-all"
          >
            <Code className="w-3.5 h-3.5 text-primary" />
            <span>GitHub</span>
            <span className="text-[10px] bg-surface-container-highest px-1.5 py-0.5 rounded text-primary font-bold">★ 4.2k</span>
          </a>

          <Link
            to="/sandbox"
            className="relative group inline-flex items-center justify-center p-0.5 rounded-full overflow-hidden text-xs font-bold transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.85)]"
            style={{
              background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 50%, rgb(6, 182, 212) 100%)'
            }}
          >
            <span className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface group-hover:text-white transition-colors">
              <Zap className="w-3.5 h-3.5 text-tertiary group-hover:rotate-12 transition-transform duration-300" />
              <span>Launch Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 transition-transform duration-300" />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
