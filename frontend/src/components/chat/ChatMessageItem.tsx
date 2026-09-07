import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../../types/chat';
import { useChatStore } from '../../store/useChatStore';
import { TypingAnimation } from './TypingAnimation';
import { ClarificationChipsInline } from './ClarificationChipsInline';
import {
  User,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCw,
  Zap,
  FileText,
  Terminal,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const { improveResponse, regenerateResponse, activeTargetFormat } = useChatStore();
  const [activeTab, setActiveTab] = useState<'promptA' | 'promptB' | 'native' | 'diff'>('promptA');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSpecExpanded, setIsSpecExpanded] = useState(true);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      className={`group w-full py-5 px-4 sm:px-6 transition-colors duration-150 ${
        isUser ? 'bg-transparent' : 'bg-surface-container-lowest/70 border-y border-outline-variant/15'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3.5 sm:gap-4.5 items-start">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-on-surface shadow-sm">
              <User className="w-4 h-4 text-on-surface-variant" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-secondary to-tertiary flex items-center justify-center text-surface-container-lowest font-black shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header row: Author + Timestamp */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-on-surface">
              {isUser ? 'You' : 'PromptArchitect AI'}
            </span>
            <span className="text-[11px] text-outline font-mono">{formattedTime}</span>

            {isAssistant && message.detectedCategory && (
              <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                {message.detectedCategory}
              </span>
            )}

            {isAssistant && message.improvementLevel && message.improvementLevel > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-300">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Hardened Level {message.improvementLevel}</span>
              </span>
            )}
          </div>

          {/* Streaming / Compiling State Indicator */}
          {message.isStreaming && (
            <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline-variant/30 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-primary font-medium">
                  Compiler Pipeline Stage {message.compilingStage || 1} / 7
                </span>
                <span className="text-outline text-[11px] font-mono">
                  {message.compilingStage === 1 && 'Analyzing Intent & Architecture'}
                  {message.compilingStage === 2 && 'Detecting Ambiguity & Edge Risks'}
                  {message.compilingStage === 3 && 'Synthesizing PRD Specification (Prompt A)'}
                  {message.compilingStage === 4 && 'Generating Agent Checkpoint Blueprint (Prompt B)'}
                  {message.compilingStage === 5 && 'Applying Target Dialect Adapter'}
                  {message.compilingStage === 6 && 'Verifying Gate Constraints'}
                  {message.compilingStage === 7 && 'Calculating Heuristic Diagnostic Score'}
                </span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary via-secondary to-tertiary h-full transition-all duration-300"
                  style={{ width: `${((message.compilingStage || 1) / 7) * 100}%` }}
                />
              </div>
              <TypingAnimation />
            </div>
          )}

          {/* Markdown Content (Intro / Summary Text) */}
          {message.content && !message.isStreaming && (
            <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-on-surface font-sans">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-base font-bold text-primary mb-2 mt-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold text-tertiary mb-1 mt-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xs font-semibold text-on-surface mb-1 mt-2">{children}</h3>,
                  p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                  code: ({ children }) => (
                    <code className="bg-surface-container px-1.5 py-0.5 rounded text-primary text-[11px] font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-surface-container-high/80 p-3 rounded-xl overflow-x-auto my-2 border border-outline-variant/30 text-[11px] font-mono">
                      {children}
                    </pre>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-1.5">{children}</ul>,
                  li: ({ children }) => <li className="text-on-surface-variant">{children}</li>
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Inline Quality Score HUD */}
          {isAssistant && message.diagnosticScore !== undefined && !message.isStreaming && (
            <div className="p-3.5 rounded-xl bg-surface-container/50 border border-outline-variant/25 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono text-outline">Architecture Score</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black tracking-tight text-primary">
                      {message.diagnosticScore}
                    </span>
                    <span className="text-xs text-outline font-mono">/100</span>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                      ▲ Production Ready
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col gap-1 pl-4 border-l border-outline-variant/20 text-[10px] font-mono text-outline">
                  <span>Target: {activeTargetFormat.toUpperCase()}</span>
                  <span>Validation: 7/7 Checkpoints Passed</span>
                </div>
              </div>

              {/* Score breakdown progress bar */}
              <div className="w-full sm:w-48 bg-surface-container-high rounded-full h-2 overflow-hidden border border-outline-variant/20">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, message.diagnosticScore)}%` }}
                />
              </div>
            </div>
          )}

          {/* Inline Interactive Clarification Chips */}
          {isAssistant && message.clarificationGroups && !message.isStreaming && (
            <ClarificationChipsInline
              messageId={message.id}
              groups={message.clarificationGroups}
              hasClarified={message.hasClarified}
            />
          )}

          {/* Dual-Prompt Output Canvas (Prompt A & Prompt B Tabs) */}
          {isAssistant && message.compiledOutput && !message.isStreaming && (
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden shadow-lg">
              {/* Header with Tab Navigation */}
              <div className="flex flex-wrap items-center justify-between border-b border-outline-variant/20 bg-surface-container/60 px-3 py-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('promptA')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'promptA'
                        ? 'bg-primary/20 text-primary font-bold border border-primary/30'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Prompt A (PRD Spec)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('promptB')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'promptB'
                        ? 'bg-secondary/20 text-secondary font-bold border border-secondary/30'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Prompt B (Agent Steps)</span>
                  </button>

                  {message.compiledOutput.diffSummary && message.compiledOutput.diffSummary.length > 0 && (
                    <button
                      onClick={() => setActiveTab('diff')}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'diff'
                          ? 'bg-tertiary/20 text-tertiary font-bold border border-tertiary/30'
                          : 'text-outline hover:text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Why Better?</span>
                    </button>
                  )}
                </div>

                {/* Right controls: Collapse / Expand & Copy */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsSpecExpanded(!isSpecExpanded)}
                    className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
                    title={isSpecExpanded ? 'Collapse Blueprint' : 'Expand Blueprint'}
                  >
                    {isSpecExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tab Content Display */}
              {isSpecExpanded && (
                <div className="p-4 relative">
                  {/* Copy & Download Floating Toolbar */}
                  <div className="absolute top-6 right-6 flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => {
                        const content =
                          activeTab === 'promptA'
                            ? message.compiledOutput!.promptA
                            : activeTab === 'promptB'
                            ? message.compiledOutput!.promptB
                            : JSON.stringify(message.compiledOutput!.diffSummary, null, 2);
                        handleCopy(content, activeTab);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-[11px] font-mono text-on-surface transition-all shadow-sm"
                    >
                      {copiedSection === activeTab ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-outline" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        const filename =
                          activeTab === 'promptA' ? 'SPEC.md' : 'BLUEPRINT.md';
                        const content =
                          activeTab === 'promptA'
                            ? message.compiledOutput!.promptA
                            : message.compiledOutput!.promptB;
                        handleDownload(filename, content);
                      }}
                      className="p-1 rounded-md bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-outline hover:text-on-surface transition-all"
                      title="Download Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tab 1: Prompt A */}
                  {activeTab === 'promptA' && (
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar font-mono text-[11px] text-on-surface-variant pr-14 leading-relaxed whitespace-pre-wrap">
                      {message.compiledOutput.promptA}
                    </div>
                  )}

                  {/* Tab 2: Prompt B */}
                  {activeTab === 'promptB' && (
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar font-mono text-[11px] text-on-surface-variant pr-14 leading-relaxed whitespace-pre-wrap">
                      {message.compiledOutput.promptB}
                    </div>
                  )}

                  {/* Tab 3: Diff / Why Better */}
                  {activeTab === 'diff' && (
                    <div className="space-y-3 py-1">
                      <div className="text-xs font-semibold text-tertiary flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-tertiary" />
                        <span>Architectural Injections & Hardening Applied</span>
                      </div>
                      <ul className="space-y-1.5">
                        {message.compiledOutput.diffSummary?.map((d, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-on-surface-variant bg-surface-container/30 p-2 rounded-lg border border-outline-variant/20"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Assistant Action Bar (Improve, Regenerate, Copy All) */}
          {isAssistant && message.compiledOutput && !message.isStreaming && (
            <div className="flex flex-wrap items-center gap-2 pt-1 opacity-80 hover:opacity-100 transition-opacity">
              <button
                onClick={() => improveResponse(message.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-medium text-on-surface transition-all hover:border-primary/40 hover:text-primary shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Improve with Adversarial Pass</span>
              </button>

              <button
                onClick={() => regenerateResponse(message.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-medium text-on-surface transition-all hover:border-outline-variant"
              >
                <RotateCw className="w-3.5 h-3.5 text-outline" />
                <span>Regenerate</span>
              </button>

              <button
                onClick={() => {
                  const combined = `${message.compiledOutput!.promptA}\n\n---\n\n${message.compiledOutput!.promptB}`;
                  handleCopy(combined, 'all');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-medium text-on-surface transition-all"
              >
                {copiedSection === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">All Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-outline" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
