import React from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import { GitCommit } from 'lucide-react';
import { cn } from '../../lib/utils';

export const StageVisualizer: React.FC = () => {
  const { isCompiling, compilingStage } = usePromptStore();

  const stages = [
    { num: 1, label: 'Ingest' },
    { num: 2, label: 'Archetype' },
    { num: 3, label: 'Schema' },
    { num: 4, label: 'Synth v1' },
    { num: 5, label: 'Critique' },
    { num: 6, label: 'Repair' },
    { num: 7, label: 'Adapter' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-primary" />
          <h4 className="font-headline-sm text-sm font-bold text-on-surface">7-Stage Compilation Engine</h4>
        </div>
        <span className={cn(
          "text-[10px] font-mono px-2 py-0.5 rounded",
          isCompiling
            ? "text-tertiary bg-tertiary/10 border border-tertiary/30 animate-pulse"
            : compilingStage === 7
            ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/30"
            : "text-outline bg-surface-container"
        )}>
          {isCompiling ? 'COMPILING...' : compilingStage === 7 ? 'COMPLETE (100%)' : 'READY'}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {stages.map((st) => {
          const isActive = compilingStage === st.num;
          const isDone = compilingStage > st.num || compilingStage === 7;

          return (
            <div
              key={st.num}
              className={cn(
                "p-2 rounded border transition-all duration-300",
                isActive
                  ? "bg-primary/20 text-primary border-primary font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                  : isDone
                  ? "bg-surface-container-high text-emerald-400 border-emerald-500/30"
                  : "bg-surface-container text-outline border-outline-variant/20"
              )}
            >
              <div className="font-mono text-[9px] opacity-70">{st.num}</div>
              <div className="truncate mt-0.5">{st.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
