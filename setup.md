# PromptArchitect AI — Enterprise Backend Setup & Configuration Guide

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](file:///d:/prompt%20maker/package.json)
[![Node](https://img.shields.io/badge/node-20.x%20%7C%2024.x%20LTS-green.svg)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/fastify-5.x-black.svg)](https://fastify.dev/)
[![Supabase](https://img.shields.io/badge/database-Supabase%20Postgres-emerald.svg)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)

---

## ⚡ Quick Briefing (TL;DR)

Get the PromptArchitect AI backend running locally in **3 steps**:

```bash
# 1. Install dependencies & build packages
npm install && npm run build:packages

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase & AI keys

# 3. Start Fastify server and async worker (separate terminals)
npm run dev:fastify   # Terminal 1: API Server on http://localhost:3000
npm run worker        # Terminal 2: Background Compilation Worker
```

> [!NOTE]
> Ensure you have applied the Supabase migrations in [Step 3](#step-3-execute-supabase-database-migrations) before starting the server.

---

## 🏗️ Architecture at a Glance

| Component | Technology | Role |
| :--- | :--- | :--- |
| **API Gateway** | [Fastify 5.x](file:///d:/prompt%20maker/src/server.ts) | High-throughput REST API with Zod validation, Pino logging, Helmet & strict CORS |
| **Compiler Engine** | `@promptarchitect/compiler` | Pure, deterministic 7-stage AST orchestration pipeline |
| **Type Contracts** | `@promptarchitect/contracts` | Shared TypeScript types, Draft-07 JSON schemas, & Ajv validators |
| **Database** | Supabase PostgreSQL | 18 tables, strict Row-Level Security (RLS), atomic RPCs & double-entry quota ledger |
| **Queue & Worker** | [Worker Runner](file:///d:/prompt%20maker/src/modules/jobs/workerRunner.ts) | Postgres `FOR UPDATE SKIP LOCKED` polling queue with heartbeat leases |
| **Legacy Adapter** | Express Compatibility Layer | 100% backward-compatible support for all 15 `/api/*` frontend endpoints |

### Repository Structure

```
prompt-maker/
├── packages/
│   ├── contracts/            <- Shared TypeScript interfaces & JSON schemas
│   └── compiler/             <- 7-stage pure compiler AST pipeline
├── src/
│   ├── app.ts                <- Fastify application builder & middleware
│   ├── server.ts             <- Fastify HTTP server entrypoint (Port 3000)
│   ├── modules/
│   │   ├── auth/             <- Supabase JWT verification & guest handling
│   │   ├── billing/          <- Stripe subscriptions & webhook handler
│   │   ├── blueprints/       <- Enterprise template blueprints repository
│   │   ├── compilation/      <- Sync & async compilation runs
│   │   ├── jobs/             <- Background worker daemon (workerRunner.ts)
│   │   └── storage/          <- Supabase Storage signed URLs & MIME guard
│   ├── compatibility/        <- Legacy Express /api route compatibility layer
│   └── infrastructure/       <- Supabase client, Pino logger, SSRF filter
├── supabase/
│   ├── migrations/           <- 4 production SQL migration scripts
│   └── seed.sql              <- Plans, entitlements & enterprise blueprints
├── scripts/
│   ├── migrate-legacy.ts     <- Legacy db.json to Supabase migration runner
│   ├── verify-migration.ts   <- SHA-256 data integrity verification runner
│   └── verify-production-gates.ts <- 6-gate enterprise configuration validator
└── tests/                    <- 19 Vitest test suites (120 tests)
```

---

## 📋 Prerequisites

| Prerequisite | Required Version | Verification Command / Link |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` or `v24.x` LTS | `node -v` (e.g., `v24.20.0`) |
| **npm** | `v10.x+` | `npm -v` |
| **Supabase** | Cloud or Local Docker | [supabase.com](https://supabase.com) or `npx supabase start` |
| **Google Gemini Key** | *(Recommended for live LLM)* | [Google AI Studio](https://aistudio.google.com/) |
| **Git** | Latest | `git --version` |

---

## 🚀 Setup Steps

### Step 1: Install Monorepo Dependencies

Run from the root directory:

```bash
npm install
```

---

### Step 2: Configure Environment Variables (`.env`)

Create your `.env` file from [.env.example](file:///d:/prompt%20maker/.env.example):

```bash
cp .env.example .env
```

#### Environment Variables Reference

| Variable | Description | Required? | Example / Default |
| :--- | :--- | :---: | :--- |
| `PORT` | API server port | Yes | `3000` |
| `HOST` | Network interface binding | Yes | `0.0.0.0` |
| `NODE_ENV` | Runtime environment | Yes | `development` |
| `LOG_LEVEL` | Pino log level | Yes | `info` |
| `ALLOWED_ORIGINS` | Comma-delimited CORS origins | Yes | `http://localhost:5173,http://localhost:3000` |
| `SUPABASE_URL` | Supabase project URL | **Yes** | `https://your-project-ref.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase publishable anonymous key | **Yes** | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase private server-side key | **Yes** | `eyJhbGciOi...` |
| `DATABASE_URL` | Supabase PostgreSQL direct pooler URI | Optional | `postgresql://postgres...` |
| `AI_API_KEY` | Google Gemini API key (falls back to mock if empty) | Optional | `AIzaSy...` |
| `AI_PRIMARY_MODEL` | Primary Gemini model | Yes | `gemini-1.5-flash` |
| `AI_FALLBACK_MODEL` | Failover Gemini model | Yes | `gemini-1.5-pro` |
| `STORAGE_BUCKET_ATTACHMENTS`| Bucket name for prompt attachments | Yes | `prompt-attachments` |
| `STORAGE_BUCKET_AVATARS` | Bucket name for avatars | Yes | `user-avatars` |
| `WORKER_ID` | Identifier for current worker node | Yes | `compilation-worker-01` |
| `WORKER_POLL_INTERVAL_MS` | Job queue polling rate | Yes | `2000` |
| `STRIPE_SECRET_KEY` | Stripe secret key for billing | Optional | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Optional | `whsec_...` |

> [!IMPORTANT]
> **Security Guardrail:** Never expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to client-side code or browser bundles!

---

### Step 3: Execute Supabase Database Migrations

Run the SQL scripts in the [supabase/migrations](file:///d:/prompt%20maker/supabase/migrations) directory **in numerical order**:

| Sequence | Script | Purpose |
| :---: | :--- | :--- |
| **1** | [20260906000001_initial_schema.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000001_initial_schema.sql) | Creates 18 tables, triggers, user sync, and audit ledgers |
| **2** | [20260906000002_rls_and_security.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000002_rls_and_security.sql) | Enables Row-Level Security (RLS) & tenant isolation policies |
| **3** | [20260906000003_quota_functions.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000003_quota_functions.sql) | Atomic double-entry quota reservation, commit & refund RPCs |
| **4** | [20260906000004_job_and_worker_functions.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000004_job_and_worker_functions.sql) | `claim_next_compilation_job` (SKIP LOCKED) & worker heartbeats |
| **5** | [seed.sql](file:///d:/prompt%20maker/supabase/seed.sql) | Seeds subscription tiers (free, pro, dev) & 5 enterprise blueprints |

#### Execution Methods:
* **Option A (Supabase Web Dashboard):** Paste each file into **SQL Editor** -> Click **Run**.
* **Option B (Supabase CLI):**
  ```bash
  npx supabase link --project-ref your-project-ref
  npx supabase db push
  ```

---

### Step 4: Configure Supabase Authentication

1. Open **Supabase Dashboard** -> **Authentication** -> **Providers**.
2. **Email Provider:** Enable Email. *(Tip: Uncheck "Confirm email" during development for instant login)*.
3. **Anonymous Sign-Ins:** Enable **"Allow anonymous sign-ins"** *(enables immediate prompt testing for guests)*.
4. **URL Configuration:** Set Site URL to `http://localhost:5173`.

---

### Step 5: Create Supabase Storage Buckets

Under **Supabase Dashboard** -> **Storage**, create two buckets:

| Bucket Name | Visibility | Allowed MIME Types | File Size Limit |
| :--- | :---: | :--- | :---: |
| `prompt-attachments` | **Private** | `image/png, image/jpeg, image/webp, application/pdf, text/plain` | 10 MB |
| `user-avatars` | **Public** | `image/png, image/jpeg, image/webp` | 5 MB |

---

### Step 6: Build Monorepo Packages

Build the internal contracts and pure compiler workspace packages:

```bash
npm run build:packages
```
*Outputs compiled bundles into `packages/contracts/dist/` and `packages/compiler/dist/`.*

---

### Step 7: Run Test Suite Verification

Run the full Vitest test suite across all 19 test domains:

```bash
npm test
```
*Expected: 19 test suites passing (120/120 tests).*

---

### Step 8: Run Production Gates Audit

Run the automated 6-gate architectural validator:

```bash
npm run verify:gates
```

```
======================================================
 PROMPTARCHITECT AI — PRODUCTION CONFIGURATION GATES
======================================================
[Gate 1] Pure Compiler Domain Isolation: PASSED ✓
[Gate 2] Canonical Schema Validation:     PASSED ✓
[Gate 3] SSRF Defense & IP Guardrails:    PASSED ✓
[Gate 4] Storage Executable & Size:       PASSED ✓
[Gate 5] Quota Double-Entry Reservations: PASSED ✓
[Gate 6] Worker Claiming & Lease:         PASSED ✓
======================================================
OVERALL STATUS: READY FOR CUTOVER ✓
```

---

### Step 9: Migrate Legacy Data *(Optional: Upgrading from `db.json`)*

If migrating existing data from legacy `server/data/db.json`:

```bash
# 1. Execute deterministic migration
npm run migrate:legacy

# 2. Verify SHA-256 data integrity
npm run verify:legacy
```

---

### Step 10: Start Fastify Backend Server

Run the server on port `3000`:

```bash
# Development Mode (auto-reload on save)
npm run dev:fastify

# Production Mode
npm run start:fastify
```
*Listening at `http://0.0.0.0:3000`.*

---

### Step 11: Start the Background Compilation Worker

In a separate terminal, start the queue worker daemon:

```bash
npm run worker
```
*Monitors the queue with `claim_next_compilation_job()`, executes the 7-stage compiler pipeline, and sends 15s heartbeats.*

---

### Step 12: Connect the Frontend Client

The React 19 client is located in [frontend/](file:///d:/prompt%20maker/frontend).

1. Ensure `frontend/.env` has:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. Start the frontend:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:5173`.

---

### Step 13: Verify API Endpoints (cURL Cheat Sheet)

<details open>
<summary><strong>Click to expand cURL verification commands</strong></summary>

#### 1. Health Check
```bash
curl -i http://localhost:3000/health
# Expected: 200 OK -> {"status":"ok","uptime":...,"version":"3.0.0"}
```

#### 2. Get Blueprints / Templates
```bash
curl -i http://localhost:3000/api/templates
# Expected: 200 OK -> List of enterprise blueprints
```

#### 3. Get User Usage & Quota
```bash
curl -i http://localhost:3000/api/usage
# Expected: 200 OK -> {"success":true,"data":{"used":0,"limit":100,"remaining":100}}
```

#### 4. Synchronous Compilation Pipeline
```bash
curl -i -X POST http://localhost:3000/api/v1/compilation/sync \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Build a SaaS billing dashboard with Stripe and React","selectedChips":["react","typescript"],"targetAgent":"antigravity"}'
# Expected: 200 OK -> Canonical compiled spec and score
```

#### 5. Submit Asynchronous Compilation Job
```bash
curl -i -X POST http://localhost:3000/api/v1/compilation/async \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Synthesize microservices architecture","targetAgent":"cursor"}'
# Expected: 202 Accepted -> {"jobId":"...","status":"queued"}
```

</details>

---

### Step 14: Stripe Billing & Webhook Setup *(Optional)*

To test subscription checkout and webhooks locally:

```bash
# 1. Listen & forward webhooks
stripe listen --forward-to localhost:3000/api/v1/billing/webhook

# 2. Add returned secret to .env:
# STRIPE_WEBHOOK_SECRET=whsec_xxx

# 3. Trigger test events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.deleted
```

---

## 🩺 Troubleshooting Matrix

| Issue | Root Cause | Instant Fix |
| :--- | :--- | :--- |
| **`EADDRINUSE: :::3000`** | Another process is holding port 3000 | **PowerShell:** `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess \| Stop-Process -Force`<br>or set `PORT=3001` in `.env`. |
| **`401 Unauthorized` / `JWT expired`** | Invalid or expired Supabase credentials | Verify `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in `.env` without extra spaces or linebreaks. |
| **`relation already exists`** | Partial or dirty schema state | In Supabase SQL Editor run:<br>`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`<br>Then re-run migrations in order. |
| **Gemini AI key invalid** | Missing or incorrect `AI_API_KEY` | Set valid key in `.env`. *(Development will use mock AI if empty).* |
| **Browser CORS Error** | Origin not whitelisted | Add client URL to `ALLOWED_ORIGINS` in `.env` (e.g. `http://localhost:5173`). |

---

## 📑 Complete CLI Command Reference

| Command | Action |
| :--- | :--- |
| `npm install` | Install all monorepo dependencies |
| `npm run build:packages` | Build `@promptarchitect/contracts` and `@promptarchitect/compiler` |
| `npm test` | Run complete 19-suite Vitest verification (120 tests) |
| `npm run verify:gates` | Execute the 6 production configuration gates audit |
| `npm run dev:fastify` | Launch Fastify API server with hot-reload (Port 3000) |
| `npm run start:fastify` | Launch Fastify API server in production mode |
| `npm run worker` | Launch background asynchronous compilation queue daemon |
| `npm run dev` | Launch Vite React 19 frontend development server (Port 5173) |
| `npm run migrate:legacy` | Perform atomic migration from `db.json` into Supabase |
| `npm run verify:legacy` | Verify migrated data integrity against source SHA-256 |
