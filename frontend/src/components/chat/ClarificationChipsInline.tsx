import React from 'react';
import type { ClarificationGroup } from '../../types/chat';
import { useChatStore } from '../../store/useChatStore';
import { Check, Sparkles } from 'lucide-react';

interface ClarificationChipsInlineProps {
  messageId: string;
  groups: ClarificationGroup[];
  hasClarified?: boolean;
}

export const ClarificationChipsInline: React.FC<ClarificationChipsInlineProps> = ({
  messageId,
  groups,
  hasClarified = false
}) => {
  const { selectClarification } = useChatStore();

  if (!groups || groups.length === 0) return null;

  return (
    <div className="my-4 p-4 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
        <span>Architecture Clarifications & Hardening Options</span>
        {hasClarified && (
          <span className="ml-auto text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Constraints Injected ✓
          </span>
        )}
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          return (
            <div key={group.id} className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-on-surface">
                <span>{group.icon || '📌'}</span>
                <span className="font-medium text-[11px] sm:text-xs">{group.question}</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-0.5">
                {group.options.map((opt) => {
                  const isSelected = group.selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectClarification(messageId, group.id, opt.id)}
                      className={`group/chip relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(99,102,241,0.3)] font-semibold'
                          : 'bg-surface-container-high/60 border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-outline/60 group-hover/chip:bg-primary transition-colors" />
                      )}
                      <span>{opt.label}</span>
                      {opt.pointsDelta && (
                        <span
                          className={`text-[10px] font-mono px-1 rounded ${
                            isSelected
                              ? 'bg-primary/30 text-primary'
                              : 'bg-surface-container text-outline'
                          }`}
                        >
                          +{opt.pointsDelta}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
