import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md py-10 mt-20 relative z-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-outline">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">PA</div>
          <span>&copy; {new Date().getFullYear()} PromptArchitect AI Inc. • Pre-compilation Orchestration</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/features" className="hover:text-primary transition-colors">Features</Link>
          <Link to="/compiler" className="hover:text-primary transition-colors">Compiler</Link>
          <Link to="/two-prompt" className="hover:text-primary transition-colors">Two-Prompt</Link>
          <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
          <Link to="/docs" className="hover:text-primary transition-colors">API Docs</Link>
        </div>
      </div>
    </footer>
  );
};
