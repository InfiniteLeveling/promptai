# PromptArchitect AI — Frontend ↔ Backend Setup & Integration Guide

**Document Version:** 3.0.0 (Conforming to Final Implementation Specification v2.3)  
**Target Stack:** React 19.x | Vite 8.x | TypeScript 5.x | Fastify 5.x | Supabase PostgreSQL & Auth  
**Target File:** `FRONTEND_BACKEND_SETUP_GUIDE.md`

---

## 1. Purpose

The purpose of this guide is to provide an exact, implementation-grade roadmap for connecting the existing **React 19 / Vite** frontend (`frontend/`) to the newly rebuilt **Fastify 5.x + TypeScript + Supabase** backend (`src/server.ts`).

This is an **implementation and setup guide**, not a high-level conceptual document. Following this guide sequentially from a fresh clone enables any engineer to:
1. Bootstrapping Supabase database schemas, Row-Level Security (RLS), and atomic RPC functions.
2. Configuring local, staging, and production environments without leaking server secrets into browser bundles.
3. Establishing centralized authentication via Supabase Auth (supporting anonymous guest sessions, email/password login, and seamless account upgrades without prompt data loss).
4. Wiring the React API client to Fastify using either the zero-CORS Vite reverse proxy (local development) or direct cross-origin gateway requests (production).
5. Executing synchronous and asynchronous 7-stage prompt compilation, prompt library management, authoritative quota tracking, and signed storage uploads.
6. Verifying end-to-end functionality using repeatable automated tests and smoke test scripts.

---

## 2. Architecture Overview

### 2.1 Complete System Architecture Diagram

```text
┌────────────────────────────────────────────────────────┐
│               React 19 + Vite Frontend                 │
│               http://localhost:5173                    │
│                                                        │
│  - Supabase Browser Client (@supabase/supabase-js)     │
│  - Centralized Auth Store (useAuthStore / Provider)    │
│  - Unified API Client (apiService.ts with Retry/Queue) │
│  - Zustand State Store (usePromptStore.ts)             │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ 1. HTTPS / Reverse Proxy
                            │ 2. Authorization: Bearer <Supabase-JWT>
                            │ 3. x-request-id: <UUIDv4>
                            ▼
┌────────────────────────────────────────────────────────┐
│             Trusted Gateway / Vite Proxy               │
│                                                        │
│  - Local: Vite Reverse Proxy (/api -> localhost:3000)  │
│  - Prod: TLS Termination / Nginx / Cloudflare CDN     │
│  - Strict CORS (@fastify/cors) & Helmet Headers        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Fastify 5.x Backend API                    │
│               http://localhost:3000                    │
│                                                        │
│  - Fastify Auth Hook (JWT verification via Supabase)   │
│  - Fastify Zod Type Provider (Strict Request Boundary) │
│  - Idempotency Engine (Concurrent Request De-dupe)     │
│  - 15 Legacy Express Compatibility Routes (/api/*)     │
│  - v1 Enterprise Routes (/api/v1/*)                    │
│  - Structured JSON Observability (Pino Logger)         │
└───────┬───────────────────┬───────────────────┬────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐
│  Pure Compiler  │ │  Double-Entry   │ │ Background Job │
│     Engine      │ │  Quota Ledger   │ │ Worker Daemon  │
│ 7-Stage AST     │ │ Atomic Credit   │ │ FOR UPDATE     │
│ Orchestrator    │ │ Reservations    │ │ SKIP LOCKED    │
└───────┬─────────┘ └────────┬────────┘ └───────┬────────┘
        │                    │                  │
        ├────────────────────┼──────────────────┘
        ▼                    ▼
┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐
│ Supabase        │ │ Supabase        │ │ External       │
│ PostgreSQL      │ │ Storage Buckets │ │ Providers      │
│ 18 Relational   │ │ Signed Uploads  │ │ Gemini Flash   │
│ Tables + RLS    │ │ & MIME Guard    │ │ Stripe / GitHub│
└─────────────────┘ └─────────────────┘ └────────────────┘
```

### 2.2 Layer Responsibilities

| Architectural Layer | Core Responsibility | Security Boundary |
| :--- | :--- | :--- |
| **React 19 Frontend** | Renders dynamic UI, manages client state, captures user prompt inputs, displays AST/artifacts. | Public (runs in untrusted user browser). Zero server secrets. |
| **Supabase Client (Browser)** | Manages login/signup/logout, maintains refresh token in localStorage, emits session events. | Uses only `VITE_SUPABASE_ANON_KEY` (public publishable key). |
| **API Client (`apiService.ts`)** | Attaches bearer JWTs, injects `x-request-id`, handles 401 refresh retries, normalizes errors. | Interceptor layer enforcing client-side resilience. |
| **Vite Proxy / Gateway** | Forwards `/api/*` and `/health` requests to backend on port 3000 without CORS friction. | Local dev reverse proxy. Production uses Nginx/CORS. |
| **Fastify API Server** | Authenticates tokens, authorizes routes, validates Zod payloads, checks double-entry quotas. | High-throughput perimeter. Enforces strict schema gates. |
| **Compiler Pipeline** | Pure deterministic 7-stage AST generation without DB or HTTP side effects. | Isolated npm package `@promptarchitect/compiler`. |
| **Supabase PostgreSQL** | Authoritative data store. 18 tables, atomic stored procedures, strict multi-tenant RLS. | Database level: tenant isolation enforced by `auth.uid()`. |
| **Background Worker** | Pulls async compilation jobs using `FOR UPDATE SKIP LOCKED`, maintains 15s heartbeats. | Asynchronous job executor with automatic lease recovery. |

---

## 3. Current Repository Discovery

*(Reference: [FRONTEND_BACKEND_DISCOVERY.md](file:///d:/prompt%20maker/FRONTEND_BACKEND_DISCOVERY.md))*

### 3.1 Known Facts
1. The backend has been completely refactored to **Fastify 5.x** with TypeScript, structured logging (Pino), and a 19-suite test suite (120 tests passing).
2. The Fastify server includes a dedicated compatibility module ([src/compatibility/legacyRoutes.ts](file:///d:/prompt%20maker/src/compatibility/legacyRoutes.ts)) exposing all 15 endpoints previously provided by the legacy Express server (`/api/prompts/*`, `/api/templates/*`, `/api/usage`, `/api/ingest/*`).
3. Internal workspace packages `@promptarchitect/contracts` and `@promptarchitect/compiler` are compiled using `npm run build:packages`.
4. The React 19 frontend uses Vite 8 with a development proxy in `frontend/vite.config.ts` forwarding `/api` and `/health` to `http://localhost:3000`.

### 3.2 Discrepancies & Items Needing Migration
1. **Mock Authentication in Frontend**: In [frontend/src/components/layout/Header.tsx](file:///d:/prompt%20maker/frontend/src/components/layout/Header.tsx), the login modal currently triggers a simulated 2-second `setTimeout` without contacting Supabase Auth.
2. **Missing Frontend Supabase Dependency**: The `frontend/package.json` file does not yet have `@supabase/supabase-js` installed.
3. **Client-Side Silent Fallback**: In [frontend/src/store/usePromptStore.ts](file:///d:/prompt%20maker/frontend/src/store/usePromptStore.ts), network errors during compilation trigger a client-side mock text generator, masking backend connection errors unless the status badge is monitored.
4. **Hardcoded Sidebar Data**: In [frontend/src/components/sandbox/GeminiSidebar.tsx](file:///d:/prompt%20maker/frontend/src/components/sandbox/GeminiSidebar.tsx), recent specifications are currently hardcoded mock items instead of fetching from `GET /api/prompts`.
5. **Pricing Checkout Links**: In [frontend/src/pages/PricingPage.tsx](file:///d:/prompt%20maker/frontend/src/pages/PricingPage.tsx), the "Upgrade to Pro" button links to `/sandbox` rather than initiating a Stripe checkout session.

---

## 4. Prerequisites

Before setting up the integrated stack, verify your host machine has the following tools installed:

| Tool | Version Requirement | Verification Command |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` or `v24.x` LTS | `node -v` (e.g. `v24.20.0`) |
| **npm** | `v10.x+` | `npm -v` |
| **Supabase CLI** | `v1.140.0+` (or Docker Desktop) | `npx supabase --version` |
| **Git** | Latest | `git --version` |
| **cURL** | Any modern version | `curl --version` |

---

## 5. Environment Strategy

To prevent credential leakage and environment poisoning, PromptArchitect AI enforces a strict 3-tier environment separation:

| Dimension | Local (`development`) | Staging (`staging`) | Production (`production`) |
| :--- | :--- | :--- | :--- |
| **Frontend Domain** | `http://localhost:5173` | `https://staging.promptarchitect.ai` | `https://promptarchitect.ai` |
| **Backend API URL** | `http://localhost:3000` | `https://api-staging.promptarchitect.ai`| `https://api.promptarchitect.ai` |
| **Supabase Project** | Local Docker (`127.0.0.1:54321`) | Cloud Staging Project (`proj-staging`) | Cloud Production Project (`proj-prod`) |
| **Auth Mode** | Anonymous + Email (Confirmation OFF) | Real Email Confirmation + OAuth | Strict Email Verification + Turnstile |
| **Stripe Gateway** | Stripe CLI local test forwarder | Stripe Test Mode (`sk_test_...`) | Stripe Live Mode (`sk_live_...`) |
| **AI Engine** | Gemini 1.5 Flash (or deterministic mock)| Gemini 1.5 Flash + Fallback Pro | Gemini 1.5 Flash + Tiered Failover |

> [!CAUTION]
> Never configure staging or production Supabase connection strings or secret keys inside local development `.env` files.

---

## 6. Environment Variables Design

### 6.1 Critical Vite Security Boundary
Vite automatically bundles any variable prefixed with `VITE_` into client-side JavaScript bundles served to the browser.
* **Allowed in `frontend/.env`**: Only public, non-privileged identifiers (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
* **Strictly Prohibited in Frontend**: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `AI_API_KEY`, `DATABASE_URL`.

### 6.2 Backend Environment Template (`.env.example`)
Located in repository root: [d:\prompt maker\.env.example](file:///d:/prompt%20maker/.env.example)

```env
# SERVER CONFIGURATION
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# SUPABASE CONNECTION (From Project Settings -> API)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# DIRECT POSTGRES POOLER (For migrations and direct queries)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# GOOGLE GEMINI AI
AI_API_KEY=your_gemini_api_key_here
AI_PRIMARY_MODEL=gemini-1.5-flash
AI_FALLBACK_MODEL=gemini-1.5-pro

# STRIPE BILLING (Optional in local dev)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_pro_monthly
STRIPE_DEV_PRICE_ID=price_dev_monthly

# STORAGE BUCKETS
STORAGE_BUCKET_ATTACHMENTS=prompt-attachments
STORAGE_BUCKET_AVATARS=user-avatars

# BACKGROUND WORKER DAEMON
WORKER_ID=compilation-worker-01
WORKER_POLL_INTERVAL_MS=2000
WORKER_LEASE_SECONDS=60
WORKER_STALE_CHECK_MS=60000
```

### 6.3 Frontend Environment Template (`frontend/.env.example`)
Located in: [d:\prompt maker\frontend\.env.example](file:///d:/prompt%20maker/frontend/.env.example)

```env
# Backend API Base URL
# - In development using Vite reverse proxy: /api
# - In staging/production: https://api.promptarchitect.ai/api
VITE_API_URL=/api

# Supabase Browser Client (Public / Anon Credentials)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## 7. Supabase Project Setup (Cloud or Local)

### Step 1 — Initialize or Provision Supabase Project

**Goal:** Establish the Supabase PostgreSQL database, Authentication engine, and Storage backend.

**Prerequisites:** Supabase CLI installed or a free Supabase cloud account.

**Files:**
- [supabase/migrations/20260906000001_initial_schema.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000001_initial_schema.sql)
- [supabase/migrations/20260906000002_rls_and_security.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000002_rls_and_security.sql)
- [supabase/migrations/20260906000003_quota_functions.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000003_quota_functions.sql)
- [supabase/migrations/20260906000004_job_and_worker_functions.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000004_job_and_worker_functions.sql)
- [supabase/seed.sql](file:///d:/prompt%20maker/supabase/seed.sql)

**Commands:**
*Option A: For Local Docker-based Supabase:*
```bash
npx supabase init
npx supabase start
```
*Option B: For Hosted Supabase Cloud:*
1. Create a project named `promptarchitect-ai` at [supabase.com](https://supabase.com).
2. Retrieve your `Project URL`, `anon publishable key`, and `service_role secret` from **Project Settings -> API**.

**Environment:** Copy credentials to root `.env`.

**Configuration:** Configure auth providers in dashboard:
- Enable Email provider.
- Enable Anonymous sign-ins.
- Set Site URL to `http://localhost:5173`.

**Implementation:**
Apply migrations 1 through 4 and `seed.sql` in strict order (see Section 9).

**Verification:**
```bash
npx supabase status
```

**Expected Result:**
```text
API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
anon key: eyJhbGciOi...
service_role key: eyJhbGciOi...
```

**Common Errors:**
- *Docker not running*: Ensure Docker Desktop is active before running `npx supabase start`.

**Security Check:** Confirm `service_role` key is **never** copied into `frontend/.env`.

**Rollback:**
```bash
npx supabase stop
```

---

## 8. Local Supabase Setup

### Step 2 — Reset Database and Verify Connectivity

**Goal:** Ensure local PostgreSQL has a clean slate and all schemas compile properly.

**Prerequisites:** Supabase container running.

**Files:** [supabase/migrations/](file:///d:/prompt%20maker/supabase/migrations)

**Commands:**
```bash
npx supabase db reset
```

**Environment:** `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`

**Configuration:** Default local Supabase port bindings.

**Implementation:**
The reset command drops `public`, applies all 4 migrations in numerical sequence, and executes `supabase/seed.sql`.

**Verification:**
```bash
npm run test:schema
```

**Expected Result:**
```text
✓ tests/schema.test.ts (5 tests)
Test Files 1 passed (1)
```

**Common Errors:**
- *Relation already exists*: `npx supabase db reset` cleanly drops and rebuilds all schemas.

**Security Check:** Verify that Row-Level Security is active on all 18 tables:
```bash
npm run test:rls
```

**Rollback:** Re-run `npx supabase db reset`.

---

## 9. Database Migration Setup

### Step 3 — Database Schema & Stored Procedures Audit

**Goal:** Apply and verify the 18 relational tables, RLS policies, and atomic quota procedures.

**Prerequisites:** Step 2 completed.

**Files:**
1. `supabase/migrations/20260906000001_initial_schema.sql` (Tables: users, plans, subscriptions, prompts, prompt_versions, blueprints, compilation_runs, compilation_jobs, compilation_attempts, quota_ledgers, idempotency_keys, audit_ledgers).
2. `supabase/migrations/20260906000002_rls_and_security.sql` (RLS policies for tenant isolation).
3. `supabase/migrations/20260906000003_quota_functions.sql` (RPC functions: `reserve_compilation_quota`, `commit_compilation_quota`, `refund_compilation_quota`, `recover_stale_quota_reservations`).
4. `supabase/migrations/20260906000004_job_and_worker_functions.sql` (RPC functions: `claim_next_compilation_job`, `worker_heartbeat`, `finalize_compilation_job`).
5. `supabase/seed.sql` (Subscription entitlements and 5 enterprise blueprints).

**Commands:**
```bash
npm run test:schema && npm run test:rls && npm run test:quota
```

**Verification Evidence:**
- Schema constraints: 18 tables verified.
- RLS isolation: User A cannot read User B's prompts.
- Quota functions: Double-entry reservation and commit tested under concurrency.

**Expected Result:** All tests pass with zero errors.

---

## 10. Backend Setup

### Step 4 — Build Packages and Start Fastify Backend

**Goal:** Compile workspace dependencies and run the Fastify API server on port 3000.

**Prerequisites:** Node.js 20+, root dependencies installed (`npm install`).

**Files:**
- [packages/contracts/](file:///d:/prompt%20maker/packages/contracts)
- [packages/compiler/](file:///d:/prompt%20maker/packages/compiler)
- [src/server.ts](file:///d:/prompt%20maker/src/server.ts)

**Commands:**
```bash
# 1. Build monorepo packages
npm run build:packages

# 2. Start Fastify server in development mode
npm run dev:fastify
```

**Environment:** Root [.env](file:///d:/prompt%20maker/.env) with `PORT=3000`, `HOST=0.0.0.0`, `ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000`.

**Implementation:**
The server boots Pino structured logger, mounts Helmet security headers, configures CORS for port 5173, and binds all route modules.

**Verification:**
```bash
curl -i http://localhost:3000/health
```

**Expected Result:**
```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"status":"ok","timestamp":"2026-09-07T...","uptime":1.24,"version":"3.0.0"}
```

**Common Errors:**
- *EADDRINUSE: :::3000*: Another process is holding port 3000. Kill it using PowerShell:
  `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force`

**Security Check:** Verify that `x-request-id` header is attached to every response.

**Rollback:** Press `Ctrl+C` to terminate the Fastify server.

---

## 11. Frontend Setup

### Step 5 — Configure Vite Proxy and Launch Frontend

**Goal:** Start the React 19 Vite dev server with proxy routing to Fastify.

**Prerequisites:** Fastify backend running on port 3000.

**Files:**
- [frontend/vite.config.ts](file:///d:/prompt%20maker/frontend/vite.config.ts)
- [frontend/.env](file:///d:/prompt%20maker/frontend/.env)

**Commands:**
```bash
npm run dev
```

**Environment:** `VITE_API_URL=/api` in `frontend/.env`.

**Configuration:** `frontend/vite.config.ts` proxy block:
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': { target: 'http://localhost:3000', changeOrigin: true },
    '/health': { target: 'http://localhost:3000', changeOrigin: true }
  }
}
```

**Verification:**
Open your browser or test with cURL:
```bash
curl -i http://localhost:5173/api/health
```

**Expected Result:**
```http
HTTP/1.1 200 OK
{"status":"ok","uptime":...,"version":"3.0.0"}
```

**Common Errors:**
- *ECONNREFUSED*: Fastify backend is not running on port 3000. Start it via `npm run dev:fastify`.

---

## 12. Supabase Frontend Client

### Step 6 — Install `@supabase/supabase-js` and Create Client Module

**Goal:** Provide a shared, type-safe Supabase client singleton for authentication in the browser.

**Prerequisites:** Step 5 completed.

**Files:**
- `frontend/package.json`
- `frontend/src/lib/supabase.ts` [NEW]

**Commands:**
```bash
npm --prefix frontend install @supabase/supabase-js
```

**Implementation (`frontend/src/lib/supabase.ts`):**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOi...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
```

**Verification:**
Test that `supabase.auth.getSession()` resolves in browser console without error.

**Security Check:** Confirm client uses only `VITE_SUPABASE_ANON_KEY`.

---

## 13. Authentication Setup

### Step 7 — Create Centralized Auth Store (`useAuthStore`)

**Goal:** Establish a single source of truth for user identity, preventing duplicate session queries across components.

**Prerequisites:** Step 6 completed.

**Files:**
- `frontend/src/store/useAuthStore.ts` [NEW]

**Implementation:**
```typescript
import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAnonymous: boolean;
  accessToken: string | null;
  initialize: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAnonymous: false,
  accessToken: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({
          session,
          user: session.user,
          accessToken: session.access_token,
          isAnonymous: session.user.is_anonymous || false,
          isLoading: false
        });
      } else {
        // Automatically start anonymous session for first-time guests
        await get().signInAnonymously();
      }
    } catch {
      set({ isLoading: false });
    }

    // Subscribe to auth state transitions
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user || null,
        accessToken: session?.access_token || null,
        isAnonymous: session?.user?.is_anonymous || false,
        isLoading: false
      });
    });
  },

  signInAnonymously: async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data?.session) {
        set({
          session: data.session,
          user: data.user,
          accessToken: data.session.access_token,
          isAnonymous: true,
          isLoading: false
        });
      }
    } catch (err) {
      console.warn('Anonymous sign-in unavailable, proceeding in guest mode:', err);
      set({ isLoading: false });
    }
  },

  signInWithEmail: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/sandbox` }
    });
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, accessToken: null, isAnonymous: false });
  }
}));
```

---

## 14. Anonymous Auth

### Step 8 — Anonymous Guest Journey

**Goal:** Enable immediate prompt compilation for first-time visitors without login friction.

```text
Visitor arrives at http://localhost:5173/sandbox
    ↓
useAuthStore.initialize() detects no existing session
    ↓
Calls supabase.auth.signInAnonymously()
    ↓
Supabase creates record in auth.users with is_anonymous = true
    ↓
User is granted 'free' quota (5 compilations / day)
    ↓
User compiles prompts and previews artifacts
```

**Security Rule:** The frontend **never** generates custom random guest UUIDs. It relies exclusively on Supabase anonymous credentials so the session can be converted to a permanent account seamlessly.

---

## 15. Account Upgrade

### Step 9 — Convert Anonymous Session to Permanent Account

**Goal:** Allow an anonymous user to register with an email and password without losing their previously compiled prompts.

```text
Anonymous user clicks "Save Spec" or "Sign In"
    ↓
Calls supabase.auth.updateUser({ email, password })
    ↓
Supabase sends verification email
    ↓
Same auth.users.id is retained!
    ↓
Foreign keys in public.prompts and public.compilation_runs remain intact!
```

---

## 16. Session Management

### Step 10 — Avoid Session Initialization Race Conditions

**Implementation Pattern:**
In `frontend/src/App.tsx`, invoke `useAuthStore.getState().initialize()` before mounting the routes. Show an ambient loader if `isLoading` is true during critical protected actions.

---

## 17. API Client Setup

### Step 11 — Enhance `frontend/src/services/api.ts`

**Goal:** Centralize JWT attachment, request timeouts, error normalization, and response correlation.

**Key Additions:**
1. **Dynamic Token Resolver**: Reads access token directly from `useAuthStore.getState().accessToken` (falls back to `dev_user_token` in local dev).
2. **Standard Headers**:
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'x-request-id': crypto.randomUUID(),
     'Authorization': `Bearer ${token}`
   }
   ```
3. **Normalized Error Model**:
   ```typescript
   export interface ApiError {
     code: string;
     message: string;
     statusCode: number;
     requestId?: string;
   }
   ```

---

## 18. JWT Propagation

### Step 12 — Bearer Header Verification Flow

```text
1. React component triggers action (e.g. apiService.savePrompt(data))
2. apiService injects 'Authorization: Bearer <JWT>'
3. Vite reverse proxy forwards request to Fastify (port 3000)
4. Fastify authPlugin extracts token from header
5. verifyToken(token) validates signature against Supabase JWT secret
6. Populates request.user with { id, email, role, tier }
7. Controller executes with verified tenant context
```

---

## 19. CORS & Gateway

### Step 13 — Cross-Origin Resource Sharing Verification

**Fastify Configuration in [src/app.ts](file:///d:/prompt%20maker/src/app.ts#L47-L63):**
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'Idempotency-Key']
});
```

---

## 20. Legacy API Compatibility

### Step 14 — Complete Legacy Endpoint Mapping Matrix

The Fastify server's compatibility layer ([src/compatibility/legacyRoutes.ts](file:///d:/prompt%20maker/src/compatibility/legacyRoutes.ts)) guarantees zero frontend breakage across all 15 endpoints:

| Endpoint Path | Method | Auth Level | Purpose | Target Service / Repository |
| :--- | :---: | :---: | :--- | :--- |
| `/api/health` | `GET` | Public | Server uptime and health status | Fastify Health Controller |
| `/api/prompts/analyze` | `POST` | Optional | Heuristic intent classification & parameter gaps | `@promptarchitect/compiler` |
| `/api/prompts/generate` | `POST` | Optional | Full 7-stage prompt compiler pipeline | `@promptarchitect/compiler` |
| `/api/prompts/improve` | `POST` | Optional | Red-team adversarial critique & optimization | `@promptarchitect/compiler` |
| `/api/prompts/save` | `POST` | **Bearer** | Saves compiled prompt blueprint to database | `PromptRepository.createPrompt` |
| `/api/prompts` | `GET` | **Bearer** | Lists paginated prompts for current user | `PromptRepository.listUserPrompts` |
| `/api/prompts/:id` | `GET` | **Bearer** | Retrieves prompt with complete version history | `PromptRepository.getPromptWithVersions` |
| `/api/prompts/:id` | `DELETE` | **Bearer** | Deletes prompt belonging to authenticated user | `PromptRepository.deletePrompt` |
| `/api/templates` | `GET` | Public | Returns enterprise reference blueprints catalog | `BlueprintRepository.listBlueprints` |
| `/api/templates/:id` | `GET` | Public | Returns single blueprint by ID or slug | `BlueprintRepository.getBlueprintBySlug` |
| `/api/ingest/github` | `POST` | Public | SSRF-guarded GitHub repo tree analysis | `SSRFValidator` + Octokit |
| `/api/ingest/icons` | `GET` | Public | Resolves tech stack vector SVG URLs | Iconify Design CDN |
| `/api/ingest/lint` | `POST` | Public | Validates text for grammatical/syntax defects | LanguageTool Ingestion Bridge |
| `/api/ingest/fixtures` | `GET` | Public | Injects strongly typed JSON sample models | MockData Ingestion Engine |
| `/api/usage` | `GET` | Optional / Bearer | Retrieves user's tier, usage count & daily limit | `QuotaRepository.getUserQuotaStatus` |

---

## 21. Compilation Integration

### Step 15 — Synchronous Compilation Pipeline

```text
User enters prompt in FloatingInputBar
    ↓
usePromptStore.runCompilation() invokes apiService.compilePrompt(...)
    ↓
POST /api/prompts/generate
    ↓
Compiler Pipeline:
  1. Intent Classifier (<25ms)
  2. Constraint Extractor (<40ms)
  3. Gap Isolator (<15s)
  4. Candidate v1 Synthesizer (<120ms)
  5. Adversarial Critique (<80ms)
  6. Heuristic Optimizer (Score >= 90)
  7. Target Adapter (.cursorrules / Antigravity skill)
    ↓
Returns 200 OK with promptA, promptB, nativeCode, diagnostic_score
    ↓
ClaudeArtifactPanel opens and displays verified specifications
```

---

## 22. Async Compilation Integration

### Step 16 — Long-Running Job Submission and Polling

For enterprise prompts or heavy multi-agent swarms:
1. **Submission**:
   `POST /api/v1/compilation/async` returns `202 Accepted` with `{"jobId":"...","status":"queued"}`.
2. **Polling**:
   Frontend polls `GET /api/v1/compilation/jobs/:id` every 2 seconds with exponential backoff.
3. **Terminal States**:
   `completed` (renders artifact), `failed` (displays error message), `cancelled`.

---

## 23. Prompt Library Integration

### Step 17 — Wire User Prompt Library

1. **Saving Prompts**:
   When user clicks "Save" in `ClaudeArtifactPanel`, call `apiService.savePrompt(...)`.
2. **Fetching Prompts**:
   In `GeminiSidebar`, replace hardcoded mock list with `apiService.fetchUserPrompts()`.
3. **Pagination**:
   Query parameters `?page=1&limit=20` prevent unbounded data transfer.

---

## 24. Usage & Quota Integration

### Step 18 — Authoritative Server-Side Quota Display

* The frontend must never calculate daily limits locally.
* On sandbox mount, call `apiService.fetchUsage()`.
* Render in Sandbox header: `"Quota: 4/100 remaining (Resets at 00:00 UTC)"`.

---

## 25. Storage Integration

### Step 19 — Signed Asset Uploads

To upload attachments or custom avatars:
1. Frontend calculates SHA-256 and calls `POST /api/v1/storage/upload-url`.
2. Fastify validates MIME type, size limit (10MB attachments, 5MB avatars), and generates presigned URL.
3. Frontend uploads directly to Supabase Storage via `PUT <presigned-url>`.
4. Fastify records metadata in `public.storage_objects`.

---

## 26. Subscription / Billing Integration

### Step 20 — Stripe Local Webhook Forwarding

1. Start Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/v1/billing/webhook
   ```
2. Copy webhook signing secret into root `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Trigger test event:
   ```bash
   stripe trigger customer.subscription.created
   ```
4. Fastify verifies signature using raw body and updates `public.subscriptions` tier.

---

## 27. Error Handling

### Step 21 — Normalized Client Error Handling Matrix

| HTTP Status | Backend Error Code | Meaning | Required Frontend Action |
| :---: | :--- | :--- | :--- |
| **400** | `VALIDATION_ERROR` | Payload failed Zod schema checks | Highlight invalid input field in UI. |
| **401** | `UNAUTHORIZED` | Missing, invalid, or expired JWT | Attempt session refresh; if failed, open Login modal. |
| **403** | `ACCOUNT_DELETION_IN_PROGRESS` | Account marked for deletion | Show read-only banner with cancellation option. |
| **403** | `FORBIDDEN` | Tenant access violation (RLS) | Display "You do not have permission to view this prompt". |
| **429** | `QUOTA_EXCEEDED` | Daily compilation limit reached | Show "Daily quota reached" badge with link to Upgrade. |
| **500** | `INTERNAL_SERVER_ERROR` | Unexpected backend failure | Display error with `x-request-id` for debugging. |

---

## 28. Rate Limit Handling

When Fastify returns HTTP 429:
- Read `Retry-After` response header.
- Disable the "Compile" button and show countdown timer.
- Do **not** retry expensive AI compilation requests automatically.

---

## 29. Request ID / Debugging

Every request generates a UUIDv4 attached in `x-request-id`.
* The client records this in error states.
* Engineers can immediately locate the matching server log in Pino structured output by grepping `reqId`.

---

## 30. Local End-to-End Setup (20-Step Smoke Test)

Execute this complete smoke test to prove 100% operational readiness:

1. `npx supabase start` -> Supabase running at `127.0.0.1:54321`.
2. `npx supabase db reset` -> 18 tables created, RLS enabled.
3. `npm run test:schema` -> Schema check PASSED ✓.
4. `npm run build:packages` -> Contracts and compiler built ✓.
5. `npm run dev:all` -> Fastify (3000) and Vite (5173) launched concurrently.
6. Open browser at `http://localhost:5173/sandbox`.
7. Verify status pill displays `🟢 Fastify Live (<10ms)`.
8. Type `"Build a high-throughput event streamer with Redis and Go"`.
9. Click **Compile** -> Observes 7-stage visual progress.
10. Verify DevTools Network: `POST /api/prompts/generate` returns 200 OK.
11. Confirm Claude Artifact panel displays Prompt A and Prompt B.
12. Click "Improve Spec" -> `POST /api/prompts/improve` returns 200 OK.
13. Test Template Catalog: Browse templates -> `GET /api/templates` returns 5 blueprints.
14. Load "Payment Reconciler" blueprint -> Loads without errors.
15. Check Quota: `GET /api/usage` returns valid tier and count.
16. Run Production Gates Audit: `npm run verify:gates` -> 6 gates PASSED ✓.
17. Run Full Test Suite: `npm test` -> 19 suites, 120 tests PASSED ✓.
18. Test Frontend Build: `npm --prefix frontend run build` -> 0 errors ✓.
19. Inspect `x-request-id` in response headers.
20. Confirm no `NaN`, `undefined`, or mock client fallbacks occurred.

---

## 31. Testing

### Run All Project Tests

```bash
# 1. Monorepo TypeScript & Bundle Builds
npm run build:packages
npm --prefix frontend run build

# 2. Complete 19-Suite Backend Test Suite (120 Tests)
npm test

# 3. Individual Test Domains
npm run test:contracts     # Draft-07 schemas & Ajv assertions
npm run test:compiler      # 7-stage pure compiler AST pipeline
npm run test:schema        # 18 Supabase tables and constraints
npm run test:rls           # Row-level security tenant isolation
npm run test:quota         # Double-entry quota reservations & stale recovery
npm run test:server        # Fastify plugins, CORS, raw body, Helmet
npm run test:auth          # Supabase JWT verification & dev tokens
npm run test:repositories  # Prompts, runs, and blueprints CRUD
npm run test:providers     # Gemini AI provider & fallback engine
npm run test:idempotency   # Concurrent request de-duplication
npm run test:compilation   # Sync & async compilation routes
npm run test:billing-storage # Stripe webhooks & signed storage URLs
npm run test:jobs          # Worker claiming SKIP LOCKED & heartbeats
npm run test:deletion      # Account deletion cascade
npm run test:compatibility # 15 legacy Express routes parity
npm run test:migration     # Legacy db.json migration & locking
npm run test:resilience    # Circuit breaker & primary-fallback AI
npm run test:gates         # Enterprise configuration cutover gates
npm run test:canary        # Zero-downtime canary deployment gateway
```

---

## 32. Staging Setup

### Staging Checklist
1. Create separate Supabase Staging project (`proj-staging`).
2. Set staging environment variables in host:
   ```env
   NODE_ENV=staging
   ALLOWED_ORIGINS=https://staging.promptarchitect.ai
   SUPABASE_URL=https://proj-staging.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ```
3. In `frontend/.env.staging`:
   ```env
   VITE_API_URL=https://api-staging.promptarchitect.ai/api
   VITE_SUPABASE_URL=https://proj-staging.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. Push migrations: `npx supabase db push`.

---

## 33. Production Setup

### Production Checklist
- [ ] Production Supabase project provisioned in target region.
- [ ] All 4 SQL migrations applied; `seed.sql` executed.
- [ ] Strict Row-Level Security verified on all 18 tables.
- [ ] Storage buckets (`prompt-attachments`, `user-avatars`) created with MIME filters.
- [ ] Supabase Authentication configured: Email provider ON, Site URL set to production domain.
- [ ] Cloudflare Turnstile bot protection enabled for signups.
- [ ] Fastify backend deployed behind reverse proxy with TLS certificate.
- [ ] Stripe live keys and webhook endpoints configured.
- [ ] Google Gemini production API key configured with rate quota alerts.
- [ ] Log aggregation configured for Pino JSON output.

---

## 34. Deployment

### Frontend (Static SPA on CDN)
Build with production flags:
```bash
npm --prefix frontend run build
```
Deploy the `frontend/dist` directory to Cloudflare Pages, Vercel, or AWS S3/CloudFront.

### Backend (Node.js LTS / Docker)
Run with production Fastify entrypoint:
```bash
npm run start:fastify
```

---

## 35. Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **never** embedded in frontend code or Git repositories.
- [ ] `STRIPE_SECRET_KEY` is restricted strictly to backend environment.
- [ ] Client-side state is never trusted for user roles, tiers, or quotas.
- [ ] `dev_user_token` is rejected automatically in staging and production (`authService.ts`).
- [ ] SSRF validator blocks private IPv4 ranges (10.0.0.0/8, 192.168.0.0/16, 127.0.0.1, 169.254.169.254).
- [ ] Storage presigned URLs expire within 3,600 seconds.

---

## 36. Troubleshooting

```text
Frontend request failed
        ↓
Can browser reach API?
        ├── NO → Check VITE_API_URL, CORS, and if Fastify is running on :3000
        └── YES
             ↓
        HTTP 401 Unauthorized?
             ├── YES → Check Supabase session, expired JWT, or missing Bearer prefix
             └── NO
                  ↓
        HTTP 403 Forbidden?
             ├── YES → Check RLS tenant policies or account deletion status
             └── NO
                  ↓
        HTTP 429 Quota Exceeded?
             ├── YES → Check daily compilations limit or AI budget in plan_entitlements
             └── NO
                  ↓
        HTTP 5xx Server Error?
             ├── YES → Locate matching request using x-request-id in Pino logs
             └── NO → Verify response JSON contract against Zod schema
```

---

## 37. Connection Checklist

```text
[x] Backend starts and accepts HTTP requests on port 3000
[x] Supabase local / cloud database running
[x] Database migrations 1-4 applied; seed.sql executed
[x] Row Level Security (RLS) enabled on all 18 tables
[x] Frontend starts on port 5173
[x] Vite reverse proxy forwards /api and /health to port 3000
[x] Frontend .env and .env.example created
[x] Root .env configured with ALLOWED_ORIGINS
[x] Visual status indicator shows Fastify Live status in UI
[x] Full backend test suite passes (19/19 suites, 120/120 tests)
[x] Frontend builds with zero TypeScript errors (2,440 modules)
[ ] Supabase Auth centralized store wired to real Supabase client
[ ] Anonymous sign-in creates valid Supabase session
[ ] Email magic link sign-in verified
[ ] Session persists across browser reload
[ ] Access token forwarded in Authorization header
[ ] Prompts saved to Supabase prompts table
[ ] Prompt library lists user prompts with pagination
[ ] Authoritative quota rendered in Sandbox header
[ ] Staging environment verified with isolated database
[ ] Production cutover checklist completed
```

---

## 38. Frontend ↔ Backend Connection Matrix

| Frontend Feature | Component | Wire Route | Auth | Supabase Resource | Backend Service | Automated Test |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **Health Check** | `FloatingWorkspaceNav` | `GET /api/health` | Public | None | Fastify Core | `server.test.ts` |
| **Prompt Compile** | `FloatingInputBar` | `POST /api/prompts/generate` | Optional | `compilation_runs` | `CompilationService` | `compilation.test.ts` |
| **Prompt Critique** | `ClaudeArtifactPanel` | `POST /api/prompts/improve` | Optional | Pure Compiler | `OptimizationService` | `compilation.test.ts` |
| **Template Catalog**| `SandboxShell` | `GET /api/templates` | Public | `blueprints` | `BlueprintRepository` | `repositories.test.ts` |
| **Save Prompt** | `ClaudeArtifactPanel` | `POST /api/prompts/save` | Bearer | `prompts` | `PromptRepository` | `repositories.test.ts` |
| **User Library** | `GeminiSidebar` | `GET /api/prompts` | Bearer | `prompts` | `PromptRepository` | `repositories.test.ts` |
| **User Quota** | `SandboxShell` | `GET /api/usage` | Bearer | `quota_ledgers` | `QuotaRepository` | `quota.test.ts` |
| **Presigned Upload**| Asset Uploader | `POST /api/v1/storage/upload-url`| Bearer | Storage Bucket | `StorageService` | `billing_storage.test.ts` |
| **Stripe Webhook** | Webhook Listener | `POST /api/v1/billing/webhook` | Stripe HMAC | `subscriptions` | `BillingService` | `billing_storage.test.ts` |

---

## 39. Final Verification

A clean checkout of this repository can be fully validated by executing:

```bash
# 1. Build monorepo packages
npm run build:packages

# 2. Verify all backend subsystems and legacy compatibility
npm test

# 3. Verify enterprise production cutover gates
npm run verify:gates

# 4. Verify frontend bundle and TypeScript types
npm --prefix frontend run build

# 5. Start both servers concurrently
npm run dev:all
```

**Verification Evidence:**
- All 19 backend test suites pass with 120/120 tests.
- All 6 production gates pass.
- Frontend builds 2,440 modules with zero TypeScript errors.
- Visual connection badge in the UI confirms live Fastify connectivity.
