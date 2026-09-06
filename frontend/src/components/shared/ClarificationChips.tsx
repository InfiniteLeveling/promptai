import React from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import { AVAILABLE_CHIPS } from '../../lib/constants';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ClarificationChips: React.FC = () => {
  const { selectedChipIds, toggleChip } = usePromptStore();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-outline uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-tertiary" />
          Recommended Constraint Chips
        </span>
        <span className="text-[10px] text-tertiary">Click to inject (+5 pts)</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {AVAILABLE_CHIPS.map((chip) => {
          const isSelected = selectedChipIds.includes(chip.id);
          return (
            <button
              key={chip.id}
              onClick={() => toggleChip(chip.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border",
                isSelected
                  ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline"
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
