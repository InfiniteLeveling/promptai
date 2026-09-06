# PromptArchitect AI — Project Memory & Context Journal

> **Document:** `memory.md`  
> **Document Version:** 1.0.0  
> **Target Standard:** Persistent Context, Decision Tracking & Session Continuity  
> **Alignment:** [architecture.md](file:///d:/prompt%20maker/architecture.md), [rules.md](file:///d:/prompt%20maker/rules.md), [phase.doc.md](file:///d:/prompt%20maker/phase.doc.md), [design.md](file:///d:/prompt%20maker/design.md), and [user-experence.md](file:///d:/prompt%20maker/user-experence.md)  

---

## 1. MEMORY (Core Context, Architectural Decisions & Patterns)

### 1.1 Project Identity & Value Proposition
* **Project Name:** PromptArchitect AI
* **Domain:** Autonomous Pre-Compilation Requirements & Prompt Orchestration Engine.
* **Core Problem:** The "Garbage In, Garbage Out" (GIGO) chasm. Coding agents (Google Antigravity, Cursor, Claude Code, v0) fail because human prompts lack architectural clarity, database relationships, boundary conditions, and target-engine syntax.
* **Taglines:** *"Describe what you want. We'll turn it into the prompt AI understands."* / *"Your idea in. A production-ready prompt out."*

### 1.2 Core Architectural Decisions & Invariants
1. **The Intermediate Representation (`CanonicalRequirementSpec`):** Every user prompt (text, screenshot, or GitHub repo) compiles into a standardized draft-07 JSON Schema before target prompt synthesis.
2. **Zero Conversational Fatigue:** No 10-turn interrogation loops. Missing parameters are isolated into 3–4 interactive selection chips (<15s completion) accompanied by a non-blocking *"Generate with current info"* escape hatch.
3. **The Two-Prompt Vibe-Coding Framework:**
   * **Prompt A (Architectural Specification):** Locks in system design, DB schemas, API endpoints, and banned packages (PRD.md & `RequirementSpec`) without touching code.
   * **Prompt B (Antigravity / Agent Implementation):** Instructs the agent to inspect the tree first, execute phase-by-phase with terminal test checkpoints, and verify browser output.
4. **Heuristic 100-Point Scorer:** Weighted rubric measuring Goal Clarity (20), Requirements Completeness (20), Context & Environment (15), Technical Constraints (15), Technical Specificity (10), Output Formatting (10), and Acceptance Criteria (10). Closed-loop Critic/Optimizer refines until score $\ge 90$.
5. **Non-Executable Principle:** PromptArchitect only generates specifications, configurations, and prompt artifacts; it never runs arbitrary code or user shell commands.

### 1.3 Tech Stack & Design System Decisions
* **Frontend:** Flexible & open (Vanilla HTML5/CSS3/ES6+, or modern frameworks like React, Next.js, Vite, TailwindCSS, etc., as preferred per feature/phase).
* **Backend:** Flexible (Node.js/Express, Fastify, Python/FastAPI), with `@google/genai` structured JSON output as default.
* **Model Engine:** Google Gemini models (Gemini 1.5/2.0 Flash / Pro) yielding ultra-low cost per session and high operating margins.
* **Design Identity:** Cyber-Obsidian dark mode (`#080b11`), glass cards (`#0f1523`), neon indigo (`#6366f1`), electric cyan (`#06b6d4`), Google Fonts: **Outfit** (Headers), **Inter** (UI), **JetBrains Mono** (Code & Prompts).

### 1.4 Governance Protocols (from `rules.md`)
* **Phase Kickoff Rule:** No code may be written for a new phase without a formal `implementation_plan.md` reviewed and approved by the USER.
* **Phase Completion Rule:** A phase cannot be closed without a comprehensive `walkthrough.md` verifying all exit criteria with automated test and visual proofs.

---

## 2. WHAT HAPPENED (Milestones, Changes & Decisions Log)

| Date / Phase | Action / Milestone | Key Files / Decisions | Outcome / Status |
| :--- | :--- | :--- | :---: |
| **2026-09-05** | Document Analysis | Analyzed 6-page Master PRD v3.0 Ultimate specification. | ✅ Complete |
| **2026-09-05** | System Architecture | Authored [architecture.md](file:///d:/prompt%20maker/architecture.md) detailing 7-stage engine, Tri-modal ingestion, RequirementSpec schema, Mermaid flows, and REST endpoints. | ✅ Complete |
| **2026-09-05** | Project Rules & Standards | Authored [rules.md](file:///d:/prompt%20maker/rules.md) establishing approved/prohibited stack, error codes, AI boundaries, setup guide, and phase lifecycle protocols. | ✅ Complete |
| **2026-09-06** | Engineering Roadmap | Authored [phase.doc.md](file:///d:/prompt%20maker/phase.doc.md) outlining Phases V0.1 through V3.0 with exit criteria and immediate Sprint 1 task plan. | ✅ Complete |
| **2026-09-06** | UI/UX Design System | Authored [design.md](file:///d:/prompt%20maker/design.md) defining the 4 pillars (UI/UX, Colors & Themes, Fonts & Typography, and Memory/LocalStorage schema). | ✅ Complete |
| **2026-09-06** | Project Memory Journal | Authored [memory.md](file:///d:/prompt%20maker/memory.md) (this document) to maintain persistent session context. | ✅ Complete |
| **2026-09-06** | Phase V0.1 Execution | Built standalone [client/index.html](file:///d:/prompt%20maker/client/index.html), CSS tokens, Score Gauge HUD, Clarification Deck, Two-Prompt Viewer, and [tests/mocks/sampleSpecs.json](file:///d:/prompt%20maker/tests/mocks/sampleSpecs.json). Authored [walkthrough.md](file:///C:/Users/goura/.gemini/antigravity-ide/brain/cc210ce4-c960-4ca0-97fe-7164c97bb377/walkthrough.md). | ✅ Complete |
| **2026-09-06** | Rules Modernization | Updated [rules.md](file:///d:/prompt%20maker/rules.md) to remove all tech stack limitations, enabling modern frameworks (React, Next.js, Vite, TailwindCSS, etc.) while preserving core security guardrails. | ✅ Complete |
| **2026-09-06** | Landing Page Integration | Integrated the Google Stitch production landing page into [client/index.html](file:///d:/prompt%20maker/client/index.html) featuring Tailwind design tokens, 3D perspective hero, interactive compiler canvas, bento grid, and targets ticker. | ✅ Complete |
| **2026-09-06** | Heavy Frontend & Motion Engine | Built [client/js/effects.js](file:///d:/prompt%20maker/client/js/effects.js) with 3D card tilt (`.tilt-card`), radial mouse-tracking spotlight (`.spotlight-card`), `IntersectionObserver` scroll reveals (`.reveal-on-scroll`), number counters, and interactive ambient particle canvas (`#ambient-canvas`). | ✅ Complete |
| **2026-09-06** | Complete Subpage Suite | Created 7 thematic subpages matching the Google Stitch Cyber-Obsidian aesthetic: [features.html](file:///d:/prompt%20maker/client/features.html), [compiler.html](file:///d:/prompt%20maker/client/compiler.html), [two-prompt.html](file:///d:/prompt%20maker/client/two-prompt.html), [targets.html](file:///d:/prompt%20maker/client/targets.html), [pricing.html](file:///d:/prompt%20maker/client/pricing.html), [sandbox.html](file:///d:/prompt%20maker/client/sandbox.html), and [docs.html](file:///d:/prompt%20maker/client/docs.html). All endpoints validated with HTTP 200. | ✅ Complete |
| **2026-09-06** | Modern Frontend Stack Upgrade | Upgraded entire frontend architecture to **React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Lucide Icons + Framer Motion + React Router + Zustand + React Markdown** in `frontend/`. All 8 routes compiled with 0 type errors, verified on preview server `http://localhost:4173` with HTTP 200. | ✅ Complete |
| **2026-09-06** | Gemini & Claude AI Workspace Redesign | Redesigned Live Sandbox into a full-height AI chat & compiler workspace (`SandboxShell`): collapsible `GeminiSidebar` (260px/68px), floating model selector, center canvas with Gemini greeting & suggestion cards, bottom floating frosted capsule input bar with mic & attachment buttons, and Claude-style slide-out `ClaudeArtifactPanel` for dual-prompts. Synchronized both the React 19 SPA (`frontend/src/`) and static mirror ([client/sandbox.html](file:///d:/prompt%20maker/client/sandbox.html)). | ✅ Complete |
| **2026-09-06** | CTA Redirection Fix | Updated `Launch Free Sandbox` and pricing CTAs in [client/index.html](file:///d:/prompt%20maker/client/index.html), [client/landing.html](file:///d:/prompt%20maker/client/landing.html), and [frontend/src/pages/LandingPage.tsx](file:///d:/prompt%20maker/frontend/src/pages/LandingPage.tsx) to redirect directly to the Live Sandbox page (`sandbox.html` / `/sandbox`). | ✅ Complete |
| **2026-09-06** | Sandbox Clean State & Recent Specs Cleanup | Cleaned live sandbox initial load: fresh new chat greeting, empty input, artifact panel closed by default, and pruned recent specs down to 1 sample chat (`Webhook Dispatcher`). Synchronized across both React 19 SPA and static mirror. | ✅ Complete |
| **2026-09-06** | Constraints Shelf Removal | Removed horizontal constraints chips bar above the floating prompt input container in both React 19 (`FloatingInputBar.tsx`) and static mirror (`client/sandbox.html`), streamlining the minimalist floating capsule look. | ✅ Complete |
| **2026-09-06** | Developer Footer Architecture & Universal Integration | Created a rich, modern Cyber-Obsidian developer footer featuring top luminous gradient, weekly prompt architecture newsletter card, 5 categorized link columns, target dialect ticker strip, and back-to-top scroll button. Integrated across all marketing pages in React 19 (`Footer.tsx`) and static subpages (`client/`), while keeping `/sandbox` and `sandbox.html` clean and full-height without a footer. | ✅ Complete |
| **2026-09-06** | UX Manifesto & Interaction Guide | Authored [user-experence.md](file:///d:/prompt%20maker/user-experence.md) establishing the 25 human-centered interaction design principles, progressive disclosure patterns, P0/P1/P2 feature priority matrix, and effortless AI consultant interaction flow. | ✅ Complete |
| **2026-09-06** | UX Manifesto Implementation (Lines 211–260) | Implemented the human-centered UX improvements across both React 19 SPA and static mirror: (1) Conversational first screen ("What do you want to create?") with 4 instant inspiration pills, (2) Auto-category detection pill & progressive stage messages, (3) Prompt DNA Score card (Goal Clarity, Context, Edge cases, Rigor), (4) Action Toolbar with `[Copy] [Edit] [Improve] [Export]`, and (5) "Why is this better?" side-by-side comparison tab. All builds passed with 0 errors. | ✅ Complete |
| **2026-09-06** | Main Navbar Login Button & Auth Modal | Replaced "Launch Sandbox" in the main navigation header with a sleek "Login" button across all marketing pages in React 19 ([Header.tsx](file:///d:/prompt%20maker/frontend/src/components/layout/Header.tsx)) and static pages (`client/`), featuring a Cyber-Obsidian modal for Google, GitHub, and email authentication. | ✅ Complete |
| **2026-09-06** | Backend Architecture & API Matrix Guide | Authored [backend.md](file:///d:/prompt%20maker/backend.md) detailing backend layered architecture, recommended tech stack (Node/Express, `@google/genai`, AJV, MongoDB/PostgreSQL, Redis), step-by-step pipeline walkthrough, the complete Curated Third-Party API Matrix from the Master PRD, and frontend-to-backend connection bridge. | ✅ Complete |
| **2026-09-06** | Master Backend Build Prompt | Created [backend-build-prompt.txt](file:///d:/prompt%20maker/backend-build-prompt.txt) specifying the complete autonomous prompt to build the backend in 6 phases, enforcing the 3 Golden Rules (pre-phase plan, post-phase setup & testing guide, and closed-loop 'Proceed' gate). | ✅ Complete |

### Issues Encountered & Resolved
* **Issue:** Playwright driver download error (`404 Not Found` fetching `playwright-1.57.0-win32_x64.zip` from Azure CDN) during automated browser subagent initialization.
* **Resolution:** Verified development servers (`http://localhost:5000/client/sandbox.html`, `http://localhost:5173/sandbox`, and `http://localhost:4173/sandbox`) using node fetch checks confirming all endpoints respond with HTTP 200, and verified production bundle builds cleanly via `tsc -b && vite build`.
* **Issue:** User reported "nothing chages in ui" with screenshot showing the old static sandbox.
* **Resolution:** Synchronized [client/sandbox.html](file:///d:/prompt%20maker/client/sandbox.html) on port 5000 and rebuilt the React SPA in `frontend/dist/` on ports 5173 & 4173, so all ports instantly serve the Gemini/Claude UI.

---

## 3. CURRENTLY WORKING

### 3.1 Active Milestone & Focus
* **Current Phase:** UX Manifesto Implementation Verified & Synchronized.
* **Active Status:** Synchronized on `http://localhost:5000/client/sandbox.html` and `http://localhost:5173/sandbox`.

### 3.2 What's Next
1. Walk user through testing the new UX Manifesto features in their browser on `http://localhost:5173/sandbox` or `http://localhost:5000/client/sandbox.html`.
2. Commit and push updated files to Git.
3. Proceed to Phase V0.2: Gemini Backend Integration.


---

## 4. UPDATES & MAINTENANCE PROTOCOL

To ensure `memory.md` remains a single source of truth across all sessions:
* **Frequency:** Update `memory.md` at the conclusion of every major feature, task completion, or phase transition.
* **Accuracy:** Keep the "Currently Working" section synchronized with active development; mark finished tasks in "What Happened".
* **Pruning:** Remove superseded assumptions or temporary scratch notes to prevent clutter.
* **Cross-Referencing:** Always link directly to workspace files using markdown file links (`[filename](file:///path/to/file)`).

---

## 5. PURPOSE & VALUE PROPOSITION

* **Context Retention:** Seamlessly preserve architectural decisions, user preferences, and implementation status across conversation breaks or model switches.
* **Productivity & Speed:** Eliminates redundant re-investigation of codebase structure and rules.
* **Rule Enforcement:** Keeps autonomous agents strictly bounded within approved guidelines, technology stacks, and security protocols.
* **Zero Forgetting:** Ensures all exit criteria, schema constraints, and edge-case requirements are verified and documented.

---
*End of Project Memory Journal (`memory.md`).*
