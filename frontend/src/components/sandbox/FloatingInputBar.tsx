import React, { useRef, useEffect, useState } from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import { AVAILABLE_CHIPS } from '../../lib/constants';
import {
  ArrowUp,
  Mic,
  Paperclip,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface FloatingInputBarProps {
  onCompileStart?: () => void;
}

export const FloatingInputBar: React.FC<FloatingInputBarProps> = ({ onCompileStart }) => {
  const {
    rawPrompt,
    setRawPrompt,
    selectedChipIds,
    toggleChip,
    runCompilation,
    isCompiling,
    targetFormat
  } = usePromptStore();

  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [rawPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (rawPrompt.trim() && !isCompiling) {
        onCompileStart?.();
        runCompilation();
      }
    }
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      const simulatedVoiceText = " Also add exponential retry backoff with jitter and dead letter queue threshold of 3 attempts.";
      setTimeout(() => {
        setRawPrompt(rawPrompt.trim() + simulatedVoiceText);
        setIsListening(false);
      }, 1800);
    }
  };

  const handleAttachment = () => {
    alert("Attach Repo Tree / UI Wireframe: Mock schema boundary ingested.");
    setRawPrompt(rawPrompt.trim() + " Ingested repo dependencies: Prisma 5.12, Redis 7.2, TypeScript 5.4.");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 space-y-2 select-none">
      {/* Floating Clarification Chips Shelf */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1 text-xs">
        <span className="text-[10px] font-mono text-outline uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-tertiary" /> Constraints:
        </span>
        {AVAILABLE_CHIPS.map((chip) => {
          const isSelected = selectedChipIds.includes(chip.id);
          return (
            <button
              key={chip.id}
              onClick={() => toggleChip(chip.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border shrink-0 flex items-center gap-1",
                isSelected
                  ? "bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                  : "bg-surface-container/70 border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-primary" />}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Floating Capsule Input Box (Gemini / Claude / ChatGPT style) */}
      <div className="relative rounded-3xl border border-outline-variant/40 bg-surface-container/85 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all focus-within:border-primary focus-within:shadow-[0_0_30px_rgba(99,102,241,0.25)] p-2 sm:p-2.5 flex flex-col justify-between">
        
        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={rawPrompt}
          onChange={(e) => setRawPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Describe your system requirements, API routes, or agent task..."
          className="w-full bg-transparent px-3 pt-1 text-xs sm:text-sm font-sans text-on-surface placeholder:text-outline focus:outline-none resize-none leading-relaxed custom-scrollbar max-h-40"
        />

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between pt-2 px-1 text-xs">
          {/* Left Buttons: Paperclip & Mic */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleAttachment}
              className="p-2 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Attach Wireframe or Repo Tree"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              onClick={handleVoiceToggle}
              className={cn(
                "p-2 rounded-full transition-all",
                isListening
                  ? "text-primary bg-primary/20 animate-pulse ring-2 ring-primary"
                  : "text-outline hover:text-on-surface hover:bg-surface-container-high"
              )}
              title={isListening ? "Listening..." : "Dictate requirements with voice"}
            >
              <Mic className="w-4 h-4" />
            </button>
            <span className="hidden sm:inline text-[10px] font-mono text-outline uppercase ml-1">
              Target: {targetFormat}
            </span>
          </div>

          {/* Right Button: Glowing Send / Compile Button */}
          <button
            onClick={() => {
              if (rawPrompt.trim() && !isCompiling) {
                onCompileStart?.();
                runCompilation();
              }
            }}
            disabled={!rawPrompt.trim() || isCompiling}
            className={cn(
              "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md",
              rawPrompt.trim() && !isCompiling
                ? "bg-gradient-to-br from-primary-container to-secondary text-surface-container-lowest hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.5)] active:scale-95 cursor-pointer"
                : "bg-surface-container-high text-outline opacity-50 cursor-not-allowed"
            )}
            title="Compile Prompt (Enter)"
          >
            {isCompiling ? (
              <Zap className="w-4 h-4 text-tertiary animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
      <div className="text-center text-[10px] text-outline font-mono">
        PromptArchitect can make errors. Verify generated architectural contracts before feeding coding agents.
      </div>
    </div>
  );
};
