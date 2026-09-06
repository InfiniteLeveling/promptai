import React from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import { Badge } from '../ui/badge';
import { Sparkles } from 'lucide-react';

export const ScoreGauge: React.FC = () => {
  const { totalScore, scoreBreakdown } = usePromptStore();

  const getStatusBadge = () => {
    if (totalScore >= 90) {
      return <Badge variant="emerald">PASS (&ge;90)</Badge>;
    } else if (totalScore >= 75) {
      return <Badge variant="cyan">NEEDS EXPANSION (75-89)</Badge>;
    } else {
      return <Badge variant="secondary" className="text-red-400 border-red-500/30 bg-red-500/10">FAIL (&lt;75)</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="font-headline-sm text-sm font-bold text-on-surface">100-Point Heuristic Score</h4>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex items-center gap-6">
        {/* Radial SVG Meter */}
        <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-surface-container-high"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-primary transition-all duration-700 ease-out"
              strokeDasharray={`${totalScore}, 100`}
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display-hero text-2xl font-bold text-on-surface">{totalScore}</span>
            <span className="text-[9px] text-outline font-mono uppercase">/ 100</span>
          </div>
        </div>

        {/* Detailed Sliders */}
        <div className="flex-1 space-y-2 text-[11px]">
          <div>
            <div className="flex justify-between text-outline">
              <span>Goal Clarity</span>
              <span className="font-bold text-on-surface">{scoreBreakdown.clarity}/20</span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(scoreBreakdown.clarity / 20) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-outline">
              <span>Completeness</span>
              <span className="font-bold text-on-surface">{scoreBreakdown.completeness}/20</span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(scoreBreakdown.completeness / 20) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-outline">
              <span>Constraint Rigor</span>
              <span className="font-bold text-on-surface">{scoreBreakdown.constraints}/15</span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-tertiary rounded-full transition-all duration-500"
                style={{ width: `${(scoreBreakdown.constraints / 15) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-outline">
              <span>Agent Gating</span>
              <span className="font-bold text-on-surface">{scoreBreakdown.gating}/15</span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${(scoreBreakdown.gating / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
