import React, { useState } from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import type { TargetFormat } from '../../types/prompt';
import { TARGET_AGENT_DETAILS } from '../../lib/constants';
import {
  ChevronDown,
  Sparkles,
  Share2,
  Check,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';

interface FloatingWorkspaceNavProps {
  isArtifactOpen: boolean;
  onToggleArtifact: () => void;
}

export const FloatingWorkspaceNav: React.FC<FloatingWorkspaceNavProps> = ({
  isArtifactOpen,
  onToggleArtifact,
}) => {
  const { targetFormat, setTargetFormat } = usePromptStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const targets: TargetFormat[] = ['twoprompt', 'antigravity', 'cursor', 'claude', 'v0', 'midjourney'];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <header className="h-14 px-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md relative z-20">
      {/* Target Model Selector Pill (Gemini / Claude style) */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>{TARGET_AGENT_DETAILS[targetFormat]?.name || 'Target Engine'}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-outline transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-10 left-0 w-64 p-2 rounded-2xl bg-surface-container-high border border-outline-variant/30 shadow-2xl space-y-1 z-50">
            <div className="px-2 py-1 text-[10px] font-mono text-outline uppercase tracking-wider">
              Select Compilation Target
            </div>
            {targets.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTargetFormat(t);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                  targetFormat === t
                    ? 'bg-primary/20 text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <div>
                  <div className="font-semibold">{TARGET_AGENT_DETAILS[t].name}</div>
                  <div className="text-[10px] text-outline font-mono">{TARGET_AGENT_DETAILS[t].badge}</div>
                </div>
                {targetFormat === t && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleShare}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs text-on-surface transition-all"
        >
          {shared ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-outline" />
              <span>Share</span>
            </>
          )}
        </button>

        {/* Artifact Drawer Toggle */}
        <button
          onClick={onToggleArtifact}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            isArtifactOpen
              ? 'bg-primary/20 text-primary border-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface border-outline-variant/30'
          }`}
          title={isArtifactOpen ? "Close Artifact Sheet" : "Open Artifact Sheet"}
        >
          {isArtifactOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Artifacts</span>
        </button>
      </div>
    </header>
  );
};
