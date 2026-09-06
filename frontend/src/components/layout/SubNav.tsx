import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '../ui/badge';

export const SubNav: React.FC = () => {
  const navItems = [
    { label: 'Features', path: '/features' },
    { label: 'The 7-Stage Engine', path: '/compiler' },
    { label: 'Two-Prompt Bridge', path: '/two-prompt' },
    { label: 'Targets', path: '/targets' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Live Sandbox', path: '/sandbox' },
    { label: 'Docs', path: '/docs' },
  ];

  return (
    <div className="w-full border-b border-outline-variant/20 bg-surface-container-lowest/60 backdrop-blur-md sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 overflow-x-auto custom-scrollbar py-1">
          <Badge variant="cyan" className="shrink-0 text-[9px]">v3.0 React SPA</Badge>
          <nav className="flex items-center gap-5 shrink-0">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `transition-colors font-medium ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-outline">
          <span>Engine SLA: &lt;180ms</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
