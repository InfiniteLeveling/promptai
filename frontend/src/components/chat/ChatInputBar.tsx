import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { ArrowUp, Loader2, Paperclip, Mic, Sparkles } from 'lucide-react';

export const ChatInputBar: React.FC = () => {
  const { sendMessage, isStreaming, activeTargetFormat } = useChatStore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      const simulatedVoiceText =
        ' Also enforce distributed Redis locks on invoice ID and mandate 100% Vitest coverage on webhooks.';
      setTimeout(() => {
        setInput((prev) => (prev ? prev.trim() + simulatedVoiceText : simulatedVoiceText.trim()));
        setIsListening(false);
      }, 1600);
    }
  };

  const handleAttachMock = () => {
    const mockSchema =
      '\n\n```json\n// Attached OpenAPI Spec Snippet\n{\n  "/payments/webhook": { "post": { "security": ["Stripe-Signature"] } }\n}\n```';
    setInput((prev) => prev + mockSchema);
  };

  return (
    <div className="p-3 sm:p-4 bg-surface-container-lowest/80 backdrop-blur-lg border-t border-outline-variant/20 relative z-20">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
        {/* Input Capsule Box */}
        <div className="relative rounded-2xl bg-surface-container/70 border border-outline-variant/30 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-md p-2 sm:p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Describe your project requirements or ask a follow-up architecture question..."
            className="w-full bg-transparent resize-none font-sans text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none custom-scrollbar leading-relaxed min-h-[44px] max-h-[180px] pr-12"
          />

          {/* Bottom actions inside the capsule */}
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 mt-1">
            {/* Left toolbar tools */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleAttachMock}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                title="Attach Schema / Documentation snippet"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`p-1.5 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'hover:bg-surface-container-high text-outline hover:text-on-surface'
                }`}
                title="Voice Input (Dictation)"
              >
                <Mic className="w-4 h-4" />
              </button>

              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-outline uppercase ml-2 px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant/20">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
                <span>Target: {activeTargetFormat}</span>
              </span>
            </div>

            {/* Right send button & counter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-outline hidden xs:inline">
                {input.length > 0 ? `${input.length} chars • Enter ↵` : 'Enter to send'}
              </span>

              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md ${
                  input.trim() && !isStreaming
                    ? 'bg-gradient-to-br from-primary via-secondary to-tertiary text-surface-container-lowest hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.4)] cursor-pointer'
                    : 'bg-surface-container-high text-outline opacity-40 cursor-not-allowed'
                }`}
                title="Send Prompt (Enter)"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin text-surface-container-lowest" />
                ) : (
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Informative Subtext */}
        <div className="text-center text-[10px] font-mono text-outline select-none">
          PromptArchitect synthesizes dual-prompt specifications (PRD Contract + Agent Blueprint) with zero conversational drift.
        </div>
      </form>
    </div>
  );
};
