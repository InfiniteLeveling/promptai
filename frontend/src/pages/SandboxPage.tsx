import React, { useState } from 'react';
import { usePromptStore } from '../store/usePromptStore';
import { ARCHETYPES } from '../lib/constants';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { ScoreGauge } from '../components/shared/ScoreGauge';
import { ClarificationChips } from '../components/shared/ClarificationChips';
import { StageVisualizer } from '../components/shared/StageVisualizer';
import { MarkdownViewer } from '../components/shared/MarkdownViewer';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import type { TargetFormat } from '../types/prompt';
import { Zap, Mic, Edit3, RotateCcw } from 'lucide-react';

export const SandboxPage: React.FC = () => {
  const {
    rawPrompt,
    setRawPrompt,
    activeArchetype,
    loadArchetype,
    clearPrompt,
    targetFormat,
    setTargetFormat,
    runCompilation,
    isCompiling,
    compiledOutput
  } = usePromptStore();

  const [outputTab, setOutputTab] = useState<'promptA' | 'promptB' | 'native' | 'schema'>('promptA');

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-20 space-y-6">
      
      {/* Workbench Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display-hero text-2xl md:text-3xl font-bold text-on-surface">Interactive Compiler Workbench</h1>
            <Badge variant="emerald" className="hidden sm:inline-flex">v2.4 Engine Active</Badge>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Ingest raw thoughts &rarr; Heuristic constraint expansion &rarr; Dual-Prompt compilation.
          </p>
        </div>

        {/* Archetype Selector */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 text-xs font-mono">
          {ARCHETYPES.map((arch) => (
            <button
              key={arch.id}
              onClick={() => loadArchetype(arch.id)}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                activeArchetype === arch.id
                  ? 'bg-primary/20 border-primary text-primary font-bold'
                  : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {arch.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Split Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input, Chips & Pipeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <SpotlightCard className="p-6 border border-outline-variant/30 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  <span>Text Prompt</span>
                </Badge>
                <button
                  onClick={() => alert("Voice Ingestion active. Transcribing audio stream...")}
                  className="px-2.5 py-0.5 rounded-full bg-surface-container text-outline hover:text-on-surface border border-outline-variant/30 text-[10px] font-mono flex items-center gap-1"
                >
                  <Mic className="w-3 h-3" />
                  <span>Voice Mode</span>
                </button>
              </div>
              <button
                onClick={clearPrompt}
                className="text-xs text-outline hover:text-on-surface flex items-center gap-1 font-mono"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            {/* Prompt Textarea */}
            <textarea
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              rows={7}
              className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 text-xs font-code-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all resize-none leading-relaxed"
              placeholder="Describe your project requirements, API schemas, and architecture..."
            />

            {/* Dynamic Chips */}
            <ClarificationChips />

            {/* Execution Stepper */}
            <StageVisualizer />

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-outline">
                <span>Target Engine:</span>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as TargetFormat)}
                  className="bg-surface-container border border-outline-variant/30 rounded px-2.5 py-1 text-on-surface text-xs font-sans focus:outline-none focus:border-primary"
                >
                  <option value="twoprompt">Two-Prompt Vibe Framework</option>
                  <option value="antigravity">Google Antigravity</option>
                  <option value="cursor">Cursor IDE (.cursorrules / .mdc)</option>
                  <option value="claude">Claude Code Semantic XML</option>
                  <option value="v0">v0 (Vercel React)</option>
                  <option value="midjourney">Midjourney v6 Optics</option>
                </select>
              </div>

              <Button
                onClick={() => runCompilation()}
                disabled={isCompiling}
                className="flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-tertiary" />
                <span>{isCompiling ? 'Compiling 7 Stages...' : 'Compile Prompt ⚡'}</span>
              </Button>
            </div>
          </SpotlightCard>
        </div>

        {/* Right Column: Score Radar & Output (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scorer Card */}
          <SpotlightCard className="p-6 border border-outline-variant/30">
            <ScoreGauge />
          </SpotlightCard>

          {/* Compiled Output Card */}
          <SpotlightCard className="p-6 border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setOutputTab('promptA')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    outputTab === 'promptA' ? 'bg-primary/20 text-primary font-bold' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Prompt A (Spec)
                </button>
                <button
                  onClick={() => setOutputTab('promptB')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    outputTab === 'promptB' ? 'bg-tertiary/20 text-tertiary font-bold' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Prompt B (Exec)
                </button>
                <button
                  onClick={() => setOutputTab('native')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    outputTab === 'native' ? 'bg-secondary/20 text-secondary font-bold' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Target
                </button>
                <button
                  onClick={() => setOutputTab('schema')}
                  className={`px-2.5 py-1 rounded transition-all ${
                    outputTab === 'schema' ? 'bg-surface-container-high text-on-surface font-bold' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  JSON
                </button>
              </div>
            </div>

            <MarkdownViewer
              content={
                outputTab === 'promptA'
                  ? compiledOutput.promptA
                  : outputTab === 'promptB'
                  ? compiledOutput.promptB
                  : outputTab === 'native'
                  ? compiledOutput.nativeCode
                  : `\`\`\`json\n${compiledOutput.schemaJson}\n\`\`\``
              }
              maxHeight="max-h-[380px]"
            />
          </SpotlightCard>
        </div>

      </div>

    </div>
  );
};
