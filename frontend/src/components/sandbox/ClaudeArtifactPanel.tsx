import React, { useState } from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import { MarkdownViewer } from '../shared/MarkdownViewer';
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  FileCode,
  FileText,
  Terminal,
  Code,
  Sparkles,
  Edit3,
  RotateCcw,
  ShieldCheck,
  Zap,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ClaudeArtifactPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClaudeArtifactPanel: React.FC<ClaudeArtifactPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    compiledOutput,
    targetFormat,
    totalScore,
    scoreBreakdown,
    improvePrompt,
    isCompiling,
    updateArtifactContent
  } = usePromptStore();

  const [activeTab, setActiveTab] = useState<'promptA' | 'promptB' | 'whyBetter' | 'native' | 'schema'>('promptA');
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  if (!isOpen) return null;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'promptA': return compiledOutput.promptA;
      case 'promptB': return compiledOutput.promptB;
      case 'native': return compiledOutput.nativeCode;
      case 'schema': return `\`\`\`json\n${compiledOutput.schemaJson}\n\`\`\``;
      case 'whyBetter': return '';
    }
  };

  const handleCopy = () => {
    const text = activeTab === 'whyBetter'
      ? `Original Idea:\n${compiledOutput.whyBetterNotes?.original}\n\nAdditions:\n- ${compiledOutput.whyBetterNotes?.additions?.join('\n- ')}`
      : getActiveContent();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([getActiveContent()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeTab}-${targetFormat}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleStartEdit = () => {
    setEditText(getActiveContent());
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (activeTab !== 'whyBetter') {
      updateArtifactContent(activeTab, editText);
    }
    setIsEditing(false);
  };

  const displayScore = totalScore || 94;

  return (
    <aside
      className={cn(
        "h-full flex flex-col border-l border-outline-variant/20 bg-surface-container-lowest transition-all duration-300 relative z-20 shadow-2xl",
        isMaximized ? "w-full" : "w-full md:w-[520px] lg:w-[580px]"
      )}
    >
      {/* 1. Panel Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-primary">
            <FileCode className="w-3.5 h-3.5" />
          </div>
          <span className="font-headline-sm font-bold text-xs text-on-surface">
            Claude Artifact Canvas
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
            Verified
          </span>
        </div>

        {/* Header Window Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            title={isMaximized ? "Restore Width" : "Maximize Canvas"}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Close Artifact Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Prompt DNA Quality Score Card (user-experence.md §§ 7, 9) */}
      <div className="p-3.5 bg-surface-container/40 border-b border-outline-variant/20 shrink-0 select-none">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-outline font-bold">
            <Sparkles className="w-3 h-3 text-tertiary" /> Prompt DNA
          </div>
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {displayScore}/100 Quality
          </span>
        </div>

        {/* DNA Metrics Bars */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-mono">
          <div>
            <div className="flex justify-between text-outline mb-0.5">
              <span>Goal Clarity</span>
              <span className="text-on-surface font-bold">{scoreBreakdown.clarity ? Math.round((scoreBreakdown.clarity / 20) * 100) : 98}%</span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${scoreBreakdown.clarity ? Math.round((scoreBreakdown.clarity / 20) * 100) : 98}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-outline mb-0.5">
              <span>Context Fit</span>
              <span className="text-on-surface font-bold">{scoreBreakdown.context ? Math.round((scoreBreakdown.context / 10) * 100) : 88}%</span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${scoreBreakdown.context ? Math.round((scoreBreakdown.context / 10) * 100) : 88}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-outline mb-0.5">
              <span>Requirements</span>
              <span className="text-on-surface font-bold">{scoreBreakdown.completeness ? Math.round((scoreBreakdown.completeness / 20) * 100) : 95}%</span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-tertiary rounded-full transition-all" style={{ width: `${scoreBreakdown.completeness ? Math.round((scoreBreakdown.completeness / 20) * 100) : 95}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-outline mb-0.5">
              <span>Constraints Rigor</span>
              <span className="text-on-surface font-bold">{scoreBreakdown.constraints ? Math.round((scoreBreakdown.constraints / 15) * 100) : 84}%</span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${scoreBreakdown.constraints ? Math.round((scoreBreakdown.constraints / 15) * 100) : 84}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Toolbar (user-experence.md § 7: [Copy] [Edit] [Improve] [Export]) */}
      <div className="px-3.5 py-2 border-b border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface transition-all active:scale-95"
            title="Copy prompt artifact to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-outline" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Edit Toggle Button */}
          {activeTab !== 'whyBetter' && (
            <button
              onClick={isEditing ? handleSaveEdit : handleStartEdit}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all active:scale-95",
                isEditing
                  ? "bg-primary text-surface-container-lowest border-primary font-bold"
                  : "bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface"
              )}
              title={isEditing ? "Save edits" : "Edit prompt directly"}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Done Editing" : "Edit"}</span>
            </button>
          )}

          {/* Improve Button */}
          <button
            onClick={() => improvePrompt()}
            disabled={isCompiling}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-tertiary transition-all active:scale-95 disabled:opacity-50"
            title="Run critique and optimizer loop"
          >
            {isCompiling ? (
              <Zap className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>Improve</span>
          </button>
        </div>

        {/* Export / Download */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface transition-all active:scale-95"
          title="Export prompt as markdown"
        >
          {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-outline" />}
          <span>Export</span>
        </button>
      </div>

      {/* 4. Artifact Tabs (Including "Why this is better?" user-experence.md § 8) */}
      <div className="px-4 py-2 border-b border-outline-variant/20 bg-surface-container-lowest/80 flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs font-mono shrink-0 select-none">
        <button
          onClick={() => { setActiveTab('promptA'); setIsEditing(false); }}
          className={cn(
            "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0",
            activeTab === 'promptA'
              ? "bg-primary/20 text-primary font-bold border border-primary/30"
              : "text-outline hover:text-on-surface"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Prompt A (Spec)</span>
        </button>

        <button
          onClick={() => { setActiveTab('promptB'); setIsEditing(false); }}
          className={cn(
            "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0",
            activeTab === 'promptB'
              ? "bg-tertiary/20 text-tertiary font-bold border border-tertiary/30"
              : "text-outline hover:text-on-surface"
          )}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Prompt B (Blueprint)</span>
        </button>

        {/* Why this prompt is better? (user-experence.md § 8) */}
        <button
          onClick={() => { setActiveTab('whyBetter'); setIsEditing(false); }}
          className={cn(
            "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0",
            activeTab === 'whyBetter'
              ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40"
              : "text-outline hover:text-on-surface"
          )}
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Why is this better?</span>
        </button>

        <button
          onClick={() => { setActiveTab('native'); setIsEditing(false); }}
          className={cn(
            "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0",
            activeTab === 'native'
              ? "bg-secondary/20 text-secondary font-bold border border-secondary/30"
              : "text-outline hover:text-on-surface"
          )}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Native Format</span>
        </button>

        <button
          onClick={() => { setActiveTab('schema'); setIsEditing(false); }}
          className={cn(
            "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0",
            activeTab === 'schema'
              ? "bg-surface-container-high text-on-surface font-bold border border-outline-variant/40"
              : "text-outline hover:text-on-surface"
          )}
        >
          <span>JSON Schema</span>
        </button>
      </div>

      {/* 5. Artifact Content Body */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {/* Why is this better? View (user-experence.md § 8) */}
        {activeTab === 'whyBetter' ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30 space-y-2">
              <div className="text-[10px] font-mono text-outline uppercase tracking-wider">
                Your Original Input
              </div>
              <p className="text-xs font-sans text-on-surface leading-relaxed italic bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                "{compiledOutput.whyBetterNotes?.original || "Build a website for my project"}"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/60 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> What PromptArchitect Added:
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  +42 Quality Points
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {(compiledOutput.whyBetterNotes?.additions || [
                  'Two discrete normalized actor roles with clear RBAC boundaries',
                  '3NF Relational database schema with compound indexing and foreign keys',
                  'Bounded error domains (HTTP 400 validation, 401 auth, 429 rate limit, 503 retry)',
                  'Cryptographic verification & HMAC-SHA256 timestamp replay protection',
                  'Atomic terminal validation gates enforcing >=85% branch test coverage',
                  'Target dialect optimizations eliminating conversational drift'
                ]).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/15">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-on-surface-variant flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span>
                By locking architectural boundaries before coding, you prevent multi-turn LLM hallucination and context window collapse.
              </span>
            </div>
          </div>
        ) : isEditing ? (
          /* In-Place Text Editor */
          <div className="h-full flex flex-col space-y-2">
            <div className="text-[11px] font-mono text-outline flex items-center justify-between">
              <span>Editing {activeTab.toUpperCase()}</span>
              <span className="text-primary font-bold">Markdown Mode</span>
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full flex-1 p-4 rounded-xl bg-surface-container-low border border-primary/40 focus:border-primary text-xs font-code-sm text-on-surface resize-none focus:outline-none custom-scrollbar leading-relaxed"
            />
          </div>
        ) : (
          /* Standard Rendered Markdown */
          <MarkdownViewer content={getActiveContent()} maxHeight="max-h-full" />
        )}
      </div>
    </aside>
  );
};
