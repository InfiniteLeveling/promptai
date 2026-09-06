import React, { useState, useEffect } from 'react';
import { usePromptStore } from '../../store/usePromptStore';
import { GeminiSidebar } from './GeminiSidebar';
import { FloatingWorkspaceNav } from './FloatingWorkspaceNav';
import { PromptGreeting } from './PromptGreeting';
import { MessageStream } from './MessageStream';
import { FloatingInputBar } from './FloatingInputBar';
import { ClaudeArtifactPanel } from './ClaudeArtifactPanel';

export const SandboxShell: React.FC = () => {
  const { rawPrompt, clearPrompt } = usePromptStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);

  // Ensure sandbox arrives in a clean state
  useEffect(() => {
    clearPrompt();
    setIsArtifactOpen(false);
  }, [clearPrompt]);

  // Close artifact panel whenever prompt is cleared
  useEffect(() => {
    if (!rawPrompt.trim()) {
      setIsArtifactOpen(false);
    }
  }, [rawPrompt]);

  // Auto-open artifact panel when compilation completes
  const handleCompileStart = () => {
    setIsArtifactOpen(true);
  };

  const hasContent = Boolean(rawPrompt.trim());

  return (
    <div className="flex h-screen w-screen bg-surface-container-lowest text-on-surface overflow-hidden relative">
      {/* 1. Left Gemini Collapsible Sidebar */}
      <GeminiSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Central Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Floating Top Nav */}
        <FloatingWorkspaceNav
          isArtifactOpen={isArtifactOpen}
          onToggleArtifact={() => setIsArtifactOpen(!isArtifactOpen)}
        />

        {/* Scrollable Center Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-center">
            {!hasContent ? (
              <PromptGreeting />
            ) : (
              <MessageStream onOpenArtifacts={() => setIsArtifactOpen(true)} />
            )}
          </div>

          {/* Floating Bottom Input Bar */}
          <div className="sticky bottom-0 z-20 pt-4 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/90 to-transparent">
            <FloatingInputBar onCompileStart={handleCompileStart} />
          </div>
        </div>
      </div>

      {/* 3. Right Claude Split Artifact Sheet */}
      <ClaudeArtifactPanel
        isOpen={isArtifactOpen}
        onClose={() => setIsArtifactOpen(false)}
      />
    </div>
  );
};
