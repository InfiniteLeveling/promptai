import React from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import { ScoreGauge } from '../shared/ScoreGauge';
import { StageVisualizer } from '../shared/StageVisualizer';
import { User, FileCode2 } from 'lucide-react';
import { Button } from '../ui/button';

interface MessageStreamProps {
  onOpenArtifacts: () => void;
}

export const MessageStream: React.FC<MessageStreamProps> = ({ onOpenArtifacts }) => {
  const { rawPrompt, targetFormat, compilingStage, totalScore } = usePromptStore();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* User Message Bubble */}
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface shrink-0">
          <User className="w-4 h-4" />
        </div>
        <div className="flex-1 bg-surface-container/70 border border-outline-variant/30 rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm font-sans text-on-surface leading-relaxed shadow-sm">
          <div className="font-mono text-[10px] text-outline uppercase tracking-wider mb-1">
            Raw Requirements Spec • Target: {targetFormat.toUpperCase()}
          </div>
          <div className="whitespace-pre-wrap">{rawPrompt}</div>
        </div>
      </div>

      {/* Compiler Assistant Response Card */}
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-surface-container-lowest font-black text-xs shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          PA
        </div>
        <div className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-2xl rounded-tl-sm p-5 space-y-6 shadow-md">
          {/* Pipeline Status */}
          <StageVisualizer />

          {/* Heuristic Quality Score HUD */}
          <div className="bg-surface-container/60 p-4 rounded-xl border border-outline-variant/20">
            <ScoreGauge />
          </div>

          {/* Open Artifacts Button */}
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 text-xs">
            <span className="text-outline font-mono text-[11px]">
              {compilingStage === 7 ? `✓ Specification verified (Score: ${totalScore || 94})` : 'Compiling stages...'}
            </span>
            <Button
              onClick={onOpenArtifacts}
              size="sm"
              className="flex items-center gap-1.5"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Inspect Artifacts Canvas</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
