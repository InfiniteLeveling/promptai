import React, { useState } from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import { MarkdownViewer } from '../shared/MarkdownViewer';
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  Check,
  FileCode,
  FileText,
  Terminal,
  Code
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
  const { compiledOutput, targetFormat } = usePromptStore();
  const [activeTab, setActiveTab] = useState<'promptA' | 'promptB' | 'native' | 'schema'>('promptA');
  const [isMaximized, setIsMaximized] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'promptA': return compiledOutput.promptA;
      case 'promptB': return compiledOutput.promptB;
      case 'native': return compiledOutput.nativeCode;
      case 'schema': return `\`\`\`json\n${compiledOutput.schemaJson}\n\`\`\``;
    }
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

  return (
    <aside
      className={cn(
        "h-full flex flex-col border-l border-outline-variant/20 bg-surface-container-lowest transition-all duration-300 relative z-20 shadow-2xl",
        isMaximized ? "w-full" : "w-full md:w-[500px] lg:w-[560px]"
      )}
    >
      {/* Artifact Panel Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-primary">
            <FileCode className="w-3.5 h-3.5" />
          </div>
          <span className="font-headline-sm font-bold text-xs text-on-surface">
            Claude Artifact Canvas
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
            Compiled
          </span>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Download Artifact as Markdown"
          >
            {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
          </button>
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

      {/* Artifact Tabs */}
      <div className="px-4 py-2 border-b border-outline-variant/20 bg-surface-container-lowest/80 flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs font-mono">
        <button
          onClick={() => setActiveTab('promptA')}
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
          onClick={() => setActiveTab('promptB')}
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

        <button
          onClick={() => setActiveTab('native')}
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
          onClick={() => setActiveTab('schema')}
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

      {/* Artifact Markdown Content Body */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <MarkdownViewer content={getActiveContent()} maxHeight="max-h-full" />
      </div>
    </aside>
  );
};
