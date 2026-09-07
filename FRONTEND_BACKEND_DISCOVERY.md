# PromptArchitect AI — Frontend ↔ Backend Discovery Report

Generated: September 2026  
Repository: `PromptArchitect AI (promptarchitect-ai)`  
Target Specification: **PromptArchitect AI — Final Implementation Specification (Version 2.3)**

---

## 1. Executive Summary

This discovery audit compares the existing **React 19 / Vite** frontend (`frontend/`) and the legacy Express backend against the newly rebuilt **Fastify 5.x / Supabase / TypeScript** backend (`src/`).

| Domain | Existing Repository State | Target Architecture (v2.3) | Alignment Status |
| :--- | :--- | :--- | :--- |
| **API Server** | Fastify 5.x (`src/server.ts`) listening on `:3000` with 15 legacy Express compatibility routes | Fastify 5.x API gateway with Zod schema validation & Pino logging | ✅ **Aligned** |
| **Frontend Framework** | React 19.2 + Vite 8.2 + Tailwind CSS + Zustand 5 | React 19 + Vite | ✅ **Aligned** |
| **Network Layer** | Vite dev proxy (`/api` & `/health` → `localhost:3000`) | Proxy in dev, configurable `VITE_API_URL` for staging/prod | ✅ **Aligned** |
| **Compiler Engine** | `@promptarchitect/compiler` 7-stage AST pipeline | Pure deterministic compiler AST pipeline | ✅ **Aligned** |
| **Database & Auth** | Supabase PostgreSQL (18 tables, RLS, RPCs, seed data) | Supabase PostgreSQL + Auth | ✅ **Database Aligned** |
| **Frontend Auth UI** | Simulated mock login modal in `Header.tsx` (2s timer) | Supabase Auth (Anonymous, Magic Link, Email, OAuth) | ⚠️ **Needs Migration** |
| **Prompt Storage UI** | Local in-memory / mock state in `ClaudeArtifactPanel.tsx` | Supabase DB via `/api/prompts/save` and `/api/prompts` | ⚠️ **Needs Migration** |
| **Quota Display** | Fallback calculation in `usePromptStore.ts` | Authoritative server quota via `/api/usage` | ⚠️ **Needs Migration** |
| **Async Compilation UI** | Client-side 7-stage timer simulation | Async job submission (`POST /api/v1/compile`) + polling | ⚠️ **Needs Migration** |
| **Storage Asset Upload** | Not connected in UI | Signed upload via `/api/v1/storage/upload-url` | ⚠️ **Needs Migration** |
| **Billing UI** | Static pricing tiers linking to `/sandbox` | Stripe Checkout & Webhook synchronization | ⚠️ **Needs Migration** |

---

## 2. Comprehensive Frontend Inventory

### 2.1 Pages & Routes (`frontend/src/App.tsx`)

| Route | Component | Purpose | Backend Dependencies |
| :--- | :--- | :--- | :--- |
| `/` | `LandingPage.tsx` | Marketing landing page with value proposition | None (static) |
| `/features` | `FeaturesPage.tsx` | Feature deep-dive & architectural breakdown | None (static) |
| `/compiler` | `CompilerPage.tsx` | Visual walkthrough of the 7-stage pipeline | None (static) |
| `/two-prompt` | `TwoPromptPage.tsx` | Two-Prompt framework methodology explanation | None (static) |
| `/targets` | `TargetsPage.tsx` | Explanations of 5 agent dialects (Antigravity, Cursor, etc.) | None (static) |
| `/pricing` | `PricingPage.tsx` | Subscription pricing tiers (Free, Pro, Enterprise) | Currently static links; needs Stripe checkout |
| `/sandbox` | `SandboxPage.tsx` -> `SandboxShell.tsx` | Core interactive prompt compilation IDE | `/api/prompts/generate`, `/api/prompts/improve`, `/api/templates`, `/api/usage`, `/api/health` |
| `/docs` | `DocsPage.tsx` | API reference and code integration snippets | None (documentation) |
| `/*` | Redirects to `/` | 404 fallback handler | None |

---

## 3. Frontend API Call Mapping vs. Backend Endpoints

Every API call triggered by [frontend/src/services/api.ts](file:///d:/prompt%20maker/frontend/src/services/api.ts) and components:

| Frontend Method | Frontend Origin | Wire Request | Target Backend Route | Authentication | Backend Handler | Response Contract |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `checkHealth()` | `apiService.ts` | `GET /api/health` | `/api/health` & `/health` | Public | Fastify health handler | `{"status":"ok","uptime":...,"version":"3.0.0"}` |
| `getBackendHealth()` | `apiService.ts` | `GET /api/health` | `/api/health` | Public | Fastify health handler | `{"status":"ok", ...}` + client latency |
| `analyzePrompt()` | `apiService.ts` | `POST /api/prompts/analyze` | `/api/prompts/analyze` | Optional / Dev | `legacyRoutes.ts` | `{"success":true,"data":{"spec_id":...,"diagnostic_score":...}}` |
| `compilePrompt()` | `apiService.ts` | `POST /api/prompts/generate` | `/api/prompts/generate` (or `/api/v1/compile`) | Optional / Dev | `legacyRoutes.ts` / `compilationRoutes.ts` | `{"success":true,"data":{"prompt_a":...,"prompt_b":...,"score":...}}` |
| `improvePrompt()` | `apiService.ts` | `POST /api/prompts/improve` | `/api/prompts/improve` | Optional / Dev | `legacyRoutes.ts` | `{"success":true,"data":{"improved_prompt":...,"critique":...}}` |
| `fetchTemplates()` | `apiService.ts` | `GET /api/templates` | `/api/templates` | Public | `blueprintRoutes.ts` / `legacyRoutes.ts` | `{"success":true,"data":[Blueprint...]}` |
| `fetchTemplateById()` | `apiService.ts` | `GET /api/templates/:id` | `/api/templates/:id` | Public | `blueprintRoutes.ts` / `legacyRoutes.ts` | `{"success":true,"data":Blueprint}` |
| `savePrompt()` | `apiService.ts` | `POST /api/prompts/save` | `/api/prompts/save` | **Bearer Required** | `legacyRoutes.ts` -> `PromptRepository` | `{"success":true,"data":SavedPrompt}` |
| `fetchUserPrompts()`| `apiService.ts` | `GET /api/prompts` | `/api/prompts` | **Bearer Required** | `legacyRoutes.ts` -> `PromptRepository` | `{"success":true,"data":[SavedPrompt...],"pagination":{...}}` |
| `fetchUsage()` | `apiService.ts` | `GET /api/usage` | `/api/usage` | Optional / Bearer | `legacyRoutes.ts` -> `QuotaRepository` | `{"success":true,"data":{"used":...,"daily_limit":...,"remaining":...}}` |
| *(None)* | UI lacks UI action | `POST /api/v1/storage/upload-url` | `/api/v1/storage/upload-url` | **Bearer Required** | `storageRoutes.ts` -> `StorageService` | `{"uploadUrl":"...","signedUrl":"..."}` |
| *(None)* | UI lacks UI action | `POST /api/v1/billing/webhook` | `/api/v1/billing/webhook` | Stripe HMAC | `billingRoutes.ts` -> `BillingService` | `{"received":true}` |

---

## 4. Gap Analysis: Known, Unknown & Migration Items

### 4.1 Already Compatible (No Breaking Changes)
1. **Compilation Engine**: The pure compiler `@promptarchitect/compiler` pipeline works identically in Fastify as in legacy Express.
2. **Reverse Proxy Configuration**: `frontend/vite.config.ts` correctly proxies `/api` and `/health` to `http://localhost:3000`.
3. **Legacy API Shape**: All 15 endpoints in `src/compatibility/legacyRoutes.ts` return exact matching JSON schemas expected by `apiService.ts`.
4. **Development Token Bypass**: Backend accepts `dev_user_token` during local development, mapping it to a seeded developer-tier user (`00000000-0000-0000-0000-000000000001`).

### 4.2 Discrepancies Requiring Migration (Needs Migration)
1. **Authentication in Frontend**:
   - *Current State*: `Header.tsx` uses a mock form with `setTimeout`. No `@supabase/supabase-js` is installed in `frontend/`.
   - *Target State*: Install `@supabase/supabase-js` in `frontend/`, create `frontend/src/lib/supabase.ts`, establish a centralized `AuthProvider` or `useAuthStore`, and pass real Supabase JWTs to `apiService.ts`.
2. **Fallback Masking Failures**:
   - *Current State*: [frontend/src/store/usePromptStore.ts](file:///d:/prompt%20maker/frontend/src/store/usePromptStore.ts#L337-L347) catches all compilation fetch errors and silently generates client-side mock text.
   - *Target State*: Display the visual connection badge (`Fastify Live` vs `Offline Fallback`) and explicitly surface server validation/quota error messages to the user.
3. **Saved Prompt UI**:
   - *Current State*: `GeminiSidebar.tsx` has hardcoded recent specs (`recentCompilations`). `ClaudeArtifactPanel.tsx` only copies or downloads text locally.
   - *Target State*: Wire `savePrompt()` and `fetchUserPrompts()` into `GeminiSidebar` and `ClaudeArtifactPanel` so user prompts persist in Supabase.
4. **Quota Authoritative Display**:
   - *Current State*: `UsageQuota` is fetched but never rendered on the frontend.
   - *Target State*: Render remaining compilations and daily reset countdown in the Sandbox sidebar or header.
5. **Pricing Checkout**:
   - *Current State*: `PricingPage.tsx` links to `/sandbox`.
   - *Target State*: Add Stripe Checkout initiation or payment link redirection.

### 4.3 Unknowns Resolved During Discovery
- **Vercel Serverless Function**: `vercel.json` rewrote `/api/(.*)` to legacy `api/index.js` (Express). For production Fastify deployment, Fastify runs as a standalone container/Node process (or serverless adapter).
- **Direct Database Access**: The frontend does not currently contain direct PostgreSQL queries, which conforms to the V2.3 rule that all business logic flows through Fastify.
