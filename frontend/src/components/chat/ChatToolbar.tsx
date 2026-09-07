import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import type { TargetFormat } from '../../types/prompt';
import { TARGET_AGENT_DETAILS } from '../../lib/constants';
import {
  Sparkles,
  ChevronDown,
  Check,
  Share2,
  Download,
  ArrowLeft,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ChatToolbar: React.FC = () => {
  const {
    activeTargetFormat,
    setTargetFormat,
    activeModel,
    setModel,
    isBackendConnected,
    backendLatency,
    checkBackendStatus,
    getActiveConversation
  } = useChatStore();

  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    checkBackendStatus();
  }, [checkBackendStatus]);

  const targets: TargetFormat[] = ['antigravity', 'cursor', 'claude', 'twoprompt', 'v0', 'midjourney'];

  const models = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fast)', badge: 'Default' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Deep Reasoning)', badge: 'Pro' },
    { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet (Hybrid)', badge: 'Advanced' },
    { id: 'gpt-4o', name: 'OpenAI GPT-4o (Multimodal)', badge: 'Standard' }
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleExportMarkdown = () => {
    const conv = getActiveConversation();
    if (!conv) return;

    let md = `# ${conv.title}\n\nGenerated with PromptArchitect AI (Target: ${conv.targetFormat.toUpperCase()})\nDate: ${new Date(conv.updatedAt).toLocaleString()}\n\n---\n\n`;
    for (const m of conv.messages) {
      const author = m.role === 'user' ? '## 👤 User' : '## 🤖 PromptArchitect AI';
      md += `${author} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.content}\n\n`;
      if (m.compiledOutput) {
        md += `### Prompt A: Architectural Spec\n\`\`\`markdown\n${m.compiledOutput.promptA}\n\`\`\`\n\n`;
        md += `### Prompt B: Implementation Blueprint\n\`\`\`markdown\n${m.compiledOutput.promptB}\n\`\`\`\n\n`;
      }
      md += `---\n\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-14 px-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-lowest/85 backdrop-blur-md relative z-20 select-none">
      {/* Left side: Back to home & Target Engine Selector */}
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
          title="Back to Landing Page"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Target Engine Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setTargetDropdownOpen(!targetDropdownOpen);
              setModelDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{TARGET_AGENT_DETAILS[activeTargetFormat]?.name || 'Target Engine'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-outline transition-transform duration-200 ${
                targetDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {targetDropdownOpen && (
            <div className="absolute top-10 left-0 w-64 p-2 rounded-2xl bg-surface-container-high border border-outline-variant/30 shadow-2xl space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-mono text-outline uppercase tracking-wider">
                Select Agent Target Dialect
              </div>
              {targets.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTargetFormat(t);
                    setTargetDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                    activeTargetFormat === t
                      ? 'bg-primary/20 text-primary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{TARGET_AGENT_DETAILS[t].name}</div>
                    <div className="text-[10px] text-outline font-mono">
                      {TARGET_AGENT_DETAILS[t].badge}
                    </div>
                  </div>
                  {activeTargetFormat === t && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Model Selector Dropdown Pill */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => {
              setModelDropdownOpen(!modelDropdownOpen);
              setTargetDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container/60 hover:bg-surface-container border border-outline-variant/25 text-xs text-on-surface-variant transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-secondary" />
            <span className="font-mono text-[11px]">{activeModel}</span>
            <ChevronDown className="w-3 h-3 text-outline" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute top-10 left-0 w-60 p-2 rounded-2xl bg-surface-container-high border border-outline-variant/30 shadow-2xl space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-mono text-outline uppercase tracking-wider">
                Select Underlying AI Model
              </div>
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setModel(m.id);
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                    activeModel === m.id
                      ? 'bg-secondary/20 text-secondary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-[10px] text-outline font-mono">{m.badge}</div>
                  </div>
                  {activeModel === m.id && <Check className="w-3.5 h-3.5 text-secondary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Backend Live Status Badge & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Connection status badge */}
        <button
          onClick={() => checkBackendStatus()}
          title={
            isBackendConnected
              ? `Connected to Fastify backend (${backendLatency !== null ? `${backendLatency}ms` : '<10ms'}). Click to ping.`
              : 'Backend offline — deterministic local compiler fallback active. Click to test connection.'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all border shadow-sm ${
            isBackendConnected
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/70'
              : isBackendConnected === false
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/70'
              : 'bg-surface-container border-outline-variant/30 text-outline'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendConnected
                ? 'bg-emerald-400 animate-pulse'
                : isBackendConnected === false
                ? 'bg-amber-400'
                : 'bg-neutral-500'
            }`}
          />
          <span className="hidden md:inline">
            {isBackendConnected
              ? `Fastify Live${backendLatency !== null ? ` (${backendLatency}ms)` : ''}`
              : isBackendConnected === false
              ? 'Offline Fallback'
              : 'Connecting...'}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-1.5 rounded-lg hover:bg-surface-container border border-outline-variant/25 text-outline hover:text-on-surface transition-all"
          title="Share conversation link"
        >
          {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>

        {/* Export Markdown */}
        <button
          onClick={handleExportMarkdown}
          className="p-1.5 rounded-lg hover:bg-surface-container border border-outline-variant/25 text-outline hover:text-on-surface transition-all"
          title="Export Conversation as Markdown"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
