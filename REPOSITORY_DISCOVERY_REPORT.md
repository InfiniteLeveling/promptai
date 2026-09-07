# PromptArchitect AI — Repository Discovery & Systems Audit Report

**Target System:** PromptArchitect AI  
**Audit Date:** September 2026  
**Auditor:** Senior Full-Stack Architect & DevOps Engineer  
**Document Purpose:** Complete technical audit distinguishing what exists in the repository versus target architecture requirements for a complete beginner.

---

## 1. Classification Methodology

To ensure 100% architectural honesty without hallucination, every component in this report is categorized into one of three classifications:

1. `FOUND IN REPOSITORY`: Code, configuration, or data physically present in the workspace files.
2. `REQUIRED BY ARCHITECTURE`: Target behavior mandated by the approved PromptArchitect AI Specification (v2.3) that needs to be connected or implemented.
3. `UNKNOWN / MUST BE CONFIRMED`: Ambiguities or external account dependencies marked with `[VERIFY DURING IMPLEMENTATION]`.

---

## 2. Executive Audit Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PROMPTARCHITECT AI REPOSITORY                   │
├───────────────────────────────┬────────────────────────────────────────┤
│ Existing Monorepo Subsystems  │ Status in Repository                   │
├───────────────────────────────┼────────────────────────────────────────┤
│ Frontend (React 19 / Vite 8)  │ FOUND IN REPOSITORY (frontend/)        │
│ Legacy Backend (Express.js)   │ FOUND IN REPOSITORY (server/)          │
│ New Backend (Fastify 5.x)     │ FOUND IN REPOSITORY (src/)             │
│ Pure Compiler AST Engine      │ FOUND IN REPOSITORY (packages/compiler)│
│ Canonical Contracts & Schemas │ FOUND IN REPOSITORY (packages/contracts│
│ Database Schema & Migrations  │ FOUND IN REPOSITORY (supabase/)        │
│ Legacy Database Snapshot      │ FOUND IN REPOSITORY (server/data/db.js)│
│ Automated Test Suites         │ FOUND IN REPOSITORY (tests/ - 19 files)│
│ Supabase Browser Client       │ REQUIRED BY ARCHITECTURE (not in front)│
│ Centralized Auth Store        │ REQUIRED BY ARCHITECTURE (mock in UI)  │
│ Cloud Supabase Credentials    │ UNKNOWN / MUST BE CONFIRMED            │
│ Stripe Secret API Keys        │ UNKNOWN / MUST BE CONFIRMED            │
│ Upstash Redis Instance        │ UNKNOWN / MUST BE CONFIRMED            │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 3. Subsystem Breakdown

### 3.1 Frontend (`frontend/`)

* **Framework & Build Tool:** `FOUND IN REPOSITORY`
  - React `19.2.8` + React DOM `19.2.8`
  - Vite `8.2.2` configured with `@vitejs/plugin-react`
  - Tailwind CSS `3.4.17` + Lucide React `1.41.0` + Framer Motion `13.2.0`
  - Zustand `5.0.15` for client-side state management
* **Routing (`frontend/src/App.tsx`):** `FOUND IN REPOSITORY`
  - Routes: `/` (Landing), `/features`, `/compiler`, `/two-prompt`, `/targets`, `/pricing`, `/docs`, `/sandbox` (Sandbox IDE).
* **Proxy Configuration (`frontend/vite.config.ts`):** `FOUND IN REPOSITORY`
  - Reverse proxy forwards `/api` and `/health` to `http://localhost:3000`.
* **API Service (`frontend/src/services/api.ts`):** `FOUND IN REPOSITORY`
  - Centralized HTTP helper with 8-second timeout, `getBackendHealth()`, `compilePrompt()`, `improvePrompt()`, `fetchTemplates()`, `savePrompt()`, `fetchUserPrompts()`, and `fetchUsage()`.
* **Authentication State:** `REQUIRED BY ARCHITECTURE`
  - **Discrepancy:** The login modal in [Header.tsx](file:///d:/prompt%20maker/frontend/src/components/layout/Header.tsx) is currently a mock simulation with a 2-second `setTimeout`. `@supabase/supabase-js` is not yet installed in `frontend/package.json`.

---

### 3.2 Backend Services (`src/` vs `server/`)

* **New Fastify API (`src/server.ts` & `src/app.ts`):** `FOUND IN REPOSITORY`
  - Fastify `5.12.3` with Zod validation (`@fastify/type-provider-zod`), Pino structured logging, Helmet security headers, raw-body capture (for Stripe), and strict CORS.
  - Passes all 19 Vitest test suites (120 tests).
* **Legacy Express API (`server/app.js` & `server/index.js`):** `FOUND IN REPOSITORY`
  - Express `4.21.2` server on port 3000 with in-memory LRU cache and JSON persistence (`server/data/db.json`).
  - Retained for backward compatibility reference; DO NOT delete until migration verification is 100% complete.
* **15 Legacy Compatibility Routes (`src/compatibility/legacyRoutes.ts`):** `FOUND IN REPOSITORY`
  - Fastify exposes all 15 routes: `/api/health`, `/api/prompts/analyze`, `/api/prompts/generate`, `/api/prompts/improve`, `/api/prompts/save`, `/api/prompts`, `/api/prompts/:id` (GET & DELETE), `/api/templates`, `/api/templates/:id`, `/api/ingest/github`, `/api/ingest/icons`, `/api/ingest/lint`, `/api/ingest/fixtures`, `/api/usage`.
* **v1 Routes (`src/modules/`):** `FOUND IN REPOSITORY`
  - Synchronous compilation (`/api/v1/compile`), Blueprints (`/api/v1/blueprints`), Storage Presigned URLs (`/api/v1/storage/*`), Stripe Webhooks (`/api/v1/billing/webhook`).

---

### 3.3 Database & Migrations (`supabase/`)

* **PostgreSQL Relational Schema:** `FOUND IN REPOSITORY`
  - 4 migration scripts in [supabase/migrations/](file:///d:/prompt%20maker/supabase/migrations):
    1. `20260906000001_initial_schema.sql`: 18 tables including users, plans, subscriptions, prompts, prompt_versions, blueprints, compilation_runs, compilation_jobs, compilation_attempts, quota_ledgers, audit_ledgers, migration_locks, idempotency_keys.
    2. `20260906000002_rls_and_security.sql`: Row Level Security policies enforcing strict tenant isolation.
    3. `20260906000003_quota_functions.sql`: Double-entry atomic RPC functions (`reserve_compilation_quota`, `commit_compilation_quota`, `refund_compilation_quota`, `recover_stale_quota_reservations`).
    4. `20260906000004_job_and_worker_functions.sql`: Worker RPC functions (`claim_next_compilation_job` with `SKIP LOCKED`, `worker_heartbeat`, `finalize_compilation_job`).
* **Seed Data (`supabase/seed.sql`):** `FOUND IN REPOSITORY`
  - Plan entitlements for `free` (5 req/day), `pro` (100 req/day), and `developer` (1,000 req/day).
  - 5 production blueprints (Payment Reconciler, Multi-Agent Orchestration, E-Commerce, Microservices Mesh, RAG Pipeline).

---

### 3.4 Compiler Engine & Canonical AST (`packages/`)

* **Canonical Contracts (`packages/contracts/`):** `FOUND IN REPOSITORY`
  - `src/canonicalRequirementSpec.json`: Draft-07 JSON Schema defining the intermediate AST.
  - `src/index.ts`: TypeScript interfaces and Ajv runtime validation function `assertValidCanonicalSpec`.
* **Pure Compiler AST Engine (`packages/compiler/`):** `FOUND IN REPOSITORY`
  - Pure, deterministic 7-stage AST pipeline without database or HTTP side-effects:
    1. `classifier.ts`: 11 domain archetypes.
    2. `extractor.ts`: Heuristic constraint extraction.
    3. `clarifier.ts`: Interactive clarification chips with +5pt score incentives.
    4. `synthesizer.ts`: Prompt A (PRD) and Prompt B (Atomic checklist) generation.
    5. `critic.ts`: Adversarial security red-team analysis.
    6. `optimizer.ts`: Heuristic self-healing loop (score >= 90).
    7. `adapters/`: Dialect outputs for Google Antigravity, Cursor, Claude Code, v0, Midjourney.

---

### 3.5 Legacy Persistence (`server/data/db.json`)

* **Legacy Snapshot:** `FOUND IN REPOSITORY`
  - Contains 1 saved user prompt (`prompt_f438741a-18c2-4199-b716-963b2924cc73`) and 1 template (`tpl_payment_reconciler`).
* **Automated Migration Script (`scripts/migrate-legacy.ts`):** `FOUND IN REPOSITORY`
  - Converts string IDs to deterministic UUIDv4 hashes, acquires a migration lock in Supabase, validates SHA-256 source hash, and outputs `scripts/migration-report.json`.

---

## 4. Integration Gap Analysis & Migration Risks

| Area | Current State | Target Architecture Requirement | Risk / Mitigation |
| :--- | :--- | :--- | :--- |
| **Frontend Auth** | Mock `Header.tsx` modal | Supabase Auth Browser Client (`@supabase/supabase-js`) | **High**: Need to wire real Supabase client without breaking navigation. |
| **Compiler Fallback** | Silent fallback in `usePromptStore.ts` | Server compilation with visible error reporting | **Medium**: Users might not know backend is offline unless badge is observed. |
| **Redis Cache** | In-memory `lru-cache` in Fastify | Upstash Redis (Cloud) | **Low**: PostgreSQL is authoritative; Redis is acceleration only. |
| **Stripe Checkout** | Static buttons linking to `/sandbox` | Stripe Checkout sessions via `/api/v1/billing/checkout` | **Low**: Can be wired after core prompt compilation is tested. |

---

## 5. Unknowns & Verification Checklist

The following items are external credentials that must be confirmed by the user during implementation:

1. `[VERIFY DURING IMPLEMENTATION]` **Supabase Project Type**: Is the beginner using local Docker Supabase CLI (`127.0.0.1:54321`) or a free hosted Supabase Cloud account? *(Guide supports both).*
2. `[VERIFY DURING IMPLEMENTATION]` **Google Gemini AI API Key**: Has the user generated a key from [aistudio.google.com](https://aistudio.google.com/)? *(If not, backend automatically uses deterministic mock responses).*
3. `[VERIFY DURING IMPLEMENTATION]` **Stripe Account**: Is Stripe CLI installed on Windows for webhook testing? *(Optional for Day 1 local development).*
