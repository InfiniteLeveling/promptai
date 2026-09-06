import React, { useState } from 'react';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { Badge } from '../components/ui/badge';
import { MarkdownViewer } from '../components/shared/MarkdownViewer';

export const DocsPage: React.FC = () => {
  const [langTab, setLangTab] = useState<'curl' | 'js' | 'py'>('curl');

  const curlSnippet = `curl -X POST https://api.promptarchitect.ai/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "raw_prompt": "Build a multi-tenant webhook dispatcher in TypeScript with PostgreSQL",
    "target_model": "google-antigravity",
    "strict_mode": true
  }'`;

  const jsSnippet = `const res = await fetch("https://api.promptarchitect.ai/v1/analyze", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    raw_prompt: "Build a multi-tenant webhook dispatcher in TypeScript with PostgreSQL",
    target_model: "google-antigravity",
    strict_mode: true
  })
});
const data = await res.json();
console.log("Score:", data.heuristic_score);`;

  const pySnippet = `import requests

response = requests.post(
    "https://api.promptarchitect.ai/v1/analyze",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "raw_prompt": "Build a multi-tenant webhook dispatcher in TypeScript with PostgreSQL",
        "target_model": "google-antigravity",
        "strict_mode": True
    }
)
data = response.json()
print("Score:", data["heuristic_score"])`;

  const responseJson = `{
  "status": "success",
  "heuristic_score": 94,
  "domain_archetype": "backend_microservice",
  "extracted_constraints": [
    "Database: PostgreSQL 16 (Relational 3NF)",
    "Language: TypeScript (Strict mode)",
    "Pattern: Multi-tenant partitioning via tenant_id"
  ],
  "clarification_chips": [
    { "id": "chip_1", "text": "Enforce HMAC-SHA256 signature verification", "delta_points": 5 },
    { "id": "chip_2", "text": "Require compound index on (tenant_id, created_at DESC)", "delta_points": 5 }
  ]
}`;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-24 flex flex-col md:flex-row gap-10">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6 text-xs">
        <div>
          <div className="font-bold text-on-surface text-sm uppercase tracking-wider mb-2 font-headline-sm">
            Getting Started
          </div>
          <ul className="space-y-1 text-on-surface-variant">
            <li><a href="#overview" className="block py-1 text-primary font-semibold">Overview & Architecture</a></li>
            <li><a href="#endpoint-analyze" className="block py-1 hover:text-on-surface">REST API Reference</a></li>
            <li><a href="#twoprompt" className="block py-1 hover:text-on-surface">Two-Prompt Protocol</a></li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-on-surface text-sm uppercase tracking-wider mb-2 font-headline-sm">
            API Endpoints
          </div>
          <ul className="space-y-1 text-on-surface-variant font-mono text-[11px]">
            <li className="flex items-center gap-1.5 py-1 text-emerald-400">
              <span className="text-[9px] bg-emerald-500/10 px-1 rounded border border-emerald-500/30 font-bold">POST</span>
              <span>/v1/analyze</span>
            </li>
            <li className="flex items-center gap-1.5 py-1 text-tertiary">
              <span className="text-[9px] bg-tertiary/10 px-1 rounded border border-tertiary/30 font-bold">POST</span>
              <span>/v1/generate</span>
            </li>
            <li className="flex items-center gap-1.5 py-1 text-primary">
              <span className="text-[9px] bg-primary/10 px-1 rounded border border-primary/30 font-bold">POST</span>
              <span>/v1/critique</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Documentation Body */}
      <main className="flex-1 space-y-12">
        
        {/* Section 1: Overview */}
        <section id="overview">
          <SpotlightCard className="p-8 border border-outline-variant/30 space-y-4">
            <Badge variant="cyan">System Documentation</Badge>
            <h1 className="font-display-hero text-3xl font-bold text-on-surface">PromptArchitect AI Documentation</h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              PromptArchitect AI is an autonomous prompt compiler that bridges the gap between ambiguous human software requirements and deterministic execution by autonomous coding agents.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
                <div className="text-primary font-bold">Model Neutrality</div>
                <div className="text-outline mt-1">Outputs compile natively for Claude, Gemini, Cursor, Antigravity, and GPT-4o.</div>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
                <div className="text-tertiary font-bold">Sub-200ms Latency</div>
                <div className="text-outline mt-1">Stage 1 through 3 constraint extraction executes in under 180ms p95.</div>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
                <div className="text-emerald-400 font-bold">98.4% First-Pass</div>
                <div className="text-outline mt-1">Eliminates prompt regression and hallucinated package imports.</div>
              </div>
            </div>
          </SpotlightCard>
        </section>

        {/* Section 2: REST API Explorer */}
        <section id="endpoint-analyze">
          <SpotlightCard className="p-8 border border-outline-variant/30 space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant="emerald">POST</Badge>
              <span className="font-mono text-sm font-semibold text-on-surface">/v1/analyze</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Passes raw user input to Stages 1-3. Returns domain classification, extracted constraints, heuristic score, and recommended clarification chips.
            </p>

            {/* Language Switcher */}
            <div className="pt-2">
              <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-2 text-xs font-mono">
                <button
                  onClick={() => setLangTab('curl')}
                  className={`transition-colors ${langTab === 'curl' ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'}`}
                >
                  cURL
                </button>
                <span className="text-outline">|</span>
                <button
                  onClick={() => setLangTab('js')}
                  className={`transition-colors ${langTab === 'js' ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'}`}
                >
                  JavaScript
                </button>
                <span className="text-outline">|</span>
                <button
                  onClick={() => setLangTab('py')}
                  className={`transition-colors ${langTab === 'py' ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'}`}
                >
                  Python
                </button>
              </div>

              <div className="mt-4">
                <MarkdownViewer
                  content={`\`\`\`${langTab === 'curl' ? 'bash' : langTab === 'js' ? 'javascript' : 'python'}\n${
                    langTab === 'curl' ? curlSnippet : langTab === 'js' ? jsSnippet : pySnippet
                  }\n\`\`\``}
                />
              </div>
            </div>

            {/* Response Schema */}
            <div className="pt-4">
              <span className="text-xs font-mono text-outline uppercase tracking-wider">Sample JSON Response (200 OK)</span>
              <div className="mt-2">
                <MarkdownViewer content={`\`\`\`json\n${responseJson}\n\`\`\``} />
              </div>
            </div>
          </SpotlightCard>
        </section>

        {/* Section 3: Two-Prompt Protocol */}
        <section id="twoprompt">
          <SpotlightCard className="p-8 border border-outline-variant/30 space-y-4">
            <Badge variant="purple">Vibe Protocol</Badge>
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">The Two-Prompt Execution Protocol</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              When executing autonomous workflows, always decouple the Architectural Contract from the Execution Blueprint:
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-surface-container border border-primary/20">
                <strong className="text-primary">Step 1: Ingest Prompt A</strong>
                <p className="text-on-surface-variant mt-1">Directs the agent to author only documentation (docs/SPEC.md, PRD.md). Zero code edits permitted.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-tertiary/20">
                <strong className="text-tertiary">Step 2: Review & Lock Contract</strong>
                <p className="text-on-surface-variant mt-1">Confirm schemas, database relationships, and SLAs before code generation begins.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-emerald-500/20">
                <strong className="text-emerald-400">Step 3: Feed Prompt B</strong>
                <p className="text-on-surface-variant mt-1">The agent executes atomic phases one-by-one against the locked specification with terminal test checkpoints.</p>
              </div>
            </div>
          </SpotlightCard>
        </section>

      </main>

    </div>
  );
};
