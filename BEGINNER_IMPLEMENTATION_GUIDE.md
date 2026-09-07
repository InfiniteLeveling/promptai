# PromptArchitect AI — Beginner Implementation Guide

**Document Purpose:** The step-by-step master guide for a complete beginner on Windows to set up, understand, connect, and run the PromptArchitect AI system from scratch.  
**Audience:** Complete beginners to Node.js, TypeScript, Fastify, Supabase, and React.  
**Primary Operating System:** Windows 10 / 11 (PowerShell).  
**Target File:** `BEGINNER_IMPLEMENTATION_GUIDE.md`

---

## 📖 Welcome! Read This First

Welcome to PromptArchitect AI! If you feel overwhelmed by backend jargon like "Fastify", "PostgreSQL", "RLS", or "JWT", take a deep breath. 

**This guide assumes zero prior backend experience.** Every single technical word will be explained in plain English before you use it. Every command is written for Windows PowerShell, and every step tells you:
1. What we are doing.
2. Why we are doing it.
3. Where to click or type.
4. What command to run.
5. What the screen should look like when it works.
6. What can go wrong and how to fix it.

> [!NOTE]
> **What is the "Project Root"?**  
> "Project root" simply means the main folder of the project on your computer that contains `package.json`.  
> In your workspace, this is: `d:\prompt maker`

---

## 🧠 Simple Glossary of Jargon

Before we begin, here are 8 terms you will encounter:

1. **Terminal / PowerShell**: A text window on your computer where you type commands to run programs instead of clicking icons.
2. **Environment Variable (`.env`)**: A setting or password stored in a simple text file outside of code so it stays secret.
3. **API (Application Programming Interface)**: A digital messenger that allows your frontend website to ask the backend server for information.
4. **Fastify**: A fast Node.js web server that listens for requests from the browser and sends back answers.
5. **Database (PostgreSQL)**: An organized digital filing cabinet with tables that permanently stores users, prompts, and plans.
6. **Supabase**: A cloud platform that provides PostgreSQL database, user logins (Auth), and file storage in one package.
7. **RLS (Row-Level Security)**: A database security lock that guarantees User A cannot see User B's private prompts.
8. **JWT (JSON Web Token)**: A temporary digital wristband given to a user when they log in to prove who they are.

---

## 🚦 Roadmap: The 3 Priority Buckets

To keep things stress-free, we divide our entire journey into three buckets:

* 🟢 **MUST DO NOW (Day 1 Local Development)**:
  - Install tools (Node.js, Git).
  - Configure environment files (`.env`).
  - Run database migrations on Supabase.
  - Start Fastify backend and Vite frontend.
  - Compile your first prompt and see verified blueprints.
* 🟡 **MUST DO BEFORE PRODUCTION (Week 1)**:
  - Centralize real Supabase Auth.
  - Test Row-Level Security (RLS).
  - Migrate legacy prompts from `db.json`.
  - Set up Stripe webhook secret and Upstash Redis.
* ⚪ **OPTIONAL / LATER (Future Scaling)**:
  - Multi-region storage replication.
  - Custom domain DNS & Cloudflare Turnstile setup.

---

## 🎯 Implementation Milestones (M0 to M18)

| Milestone | Goal | What It Proves |
| :---: | :--- | :--- |
| **M0** | Repository Understood | You know what files exist in the project. |
| **M1** | Development Tools Verified | Node.js, npm, and Git are installed on your Windows PC. |
| **M2** | Supabase Project Ready | A database project exists and credentials are in hand. |
| **M3** | Database Migrations Applied | All 18 tables, triggers, and quota functions are built. |
| **M4** | Monorepo Packages Compiled | Contracts and Compiler AST engine are compiled. |
| **M5** | Fastify Backend Running | Backend accepts HTTP requests on `http://localhost:3000`. |
| **M6** | Vite Frontend Running | Frontend website opens on `http://localhost:5173`. |
| **M7** | Frontend ↔ Backend Connected | Reverse proxy forwards `/api` requests without CORS errors. |
| **M8** | First Full Compilation | You type a prompt and receive Prompt A + Prompt B specs. |
| **M9** | Prompt Library Working | Prompts save to database and list in the sidebar. |
| **M10** | Quota System Verified | Double-entry quota ledger counts daily compilations. |
| **M11** | Storage Upload Working | Signed URLs upload attachments to Supabase Storage. |
| **M12** | Async Worker Running | Background worker daemon processes heavy jobs. |
| **M13** | Stripe Billing Verified | Webhooks simulate subscription tier upgrades. |
| **M14** | Legacy Data Migrated | Data in `server/data/db.json` is safely migrated. |
| **M15** | All 19 Test Suites Pass | Vitest verifies 120 tests with 100% pass rate. |
| **M16** | Staging Verified | Staging environment runs against isolated database. |
| **M17** | Production Cutover Ready | Production gates audit confirms ready for launch. |
| **M18** | Live Canary Deployment | System accepts live public traffic safely. |

---

# 🛠️ Phase-by-Phase Step Instructions

---

## Phase 1 — Repository Audit

### Step 1 — Open Project and Check Your Tools

**WHAT ARE WE DOING?**  
We are opening Windows PowerShell in the project folder and checking that Node.js, npm, and Git are installed.

**WHY ARE WE DOING IT?**  
Node.js runs our JavaScript server, npm installs code packages, and Git manages code history. Without them, nothing can run.

**WHERE DO I DO IT?**  
In Windows PowerShell.

**WHAT DO I CLICK?**  
Press the `Windows Key`, type `PowerShell`, and open **Windows PowerShell** (or open the integrated terminal in Antigravity / VS Code by pressing ``Ctrl + ` ``).

**WHAT COMMAND DO I RUN?**  
First, ensure you are in the project folder:
```powershell
cd "d:\prompt maker"
```
Next, check your versions:
```powershell
node -v
npm -v
git -v
```

**WHAT SHOULD I SEE?**  
```text
v20.x.x (or v24.x.x)
10.x.x
git version 2.x.x.windows.x
```

**HOW DO I KNOW IT WORKED?**  
You see version numbers printed without any red error text.

**WHAT CAN GO WRONG?**  
- Error: `'node' is not recognized as an internal or external command`.
- **HOW DO I FIX IT?** Download and install Node.js 20 or 24 LTS from [nodejs.org](https://nodejs.org/). Check the box "Automatically install necessary tools". Restart your terminal.

---

## Phase 2 — Install Required Packages

### Step 2 — Install Project Dependencies & Build Workspace

**WHAT ARE WE DOING?**  
We are telling npm to read `package.json` and download all required libraries into `node_modules`, then compile the internal compiler engine.

**WHY ARE WE DOING IT?**  
The compiler engine (`@promptarchitect/compiler`) must be compiled into JavaScript before Fastify or Vitest can use it.

**WHERE DO I DO IT?**  
Project root (`d:\prompt maker`).

**WHAT COMMAND DO I RUN?**  
```powershell
npm install
npm run build:packages
```

**WHAT SHOULD I SEE?**  
```text
added 800+ packages in 15s
> @promptarchitect/contracts build
> @promptarchitect/compiler build
```

**HOW DO I KNOW IT WORKED?**  
Two folders exist with built files:
- `d:\prompt maker\packages\contracts\dist\`
- `d:\prompt maker\packages\compiler\dist\`

**WHAT CAN GO WRONG?**  
- If you see `npm ERR! ERESOLVE`, run: `npm install --legacy-peer-deps`.

---

## Phase 3 — Create Supabase Project

### Step 3 — Set Up Your Supabase Cloud Database

**WHAT ARE WE DOING?**  
We are creating a free hosted database project on Supabase to store our users, prompts, and subscriptions.

**WHY ARE WE DOING IT?**  
Supabase gives us a real PostgreSQL database with user authentication built-in, saving us weeks of server configuration.

**WHERE DO I DO IT?**  
In your web browser at [supabase.com](https://supabase.com).

**WHAT DO I CLICK?**  
1. Open [https://supabase.com](https://supabase.com) and click **Start your project** (or Sign In).
2. Click **New Project**.
3. Choose an Organization.
4. **Name**: `promptarchitect-ai`.
5. **Database Password**: Enter a strong password (save this in a password manager!).
6. **Region**: Select a region close to you (e.g. `East US` or `West Europe`).
7. Click **Create new project**. Wait 2 minutes for it to provision.

**WHERE DO I FIND THE KEYS?**  
1. In the left navigation bar of Supabase, click the ⚙️ **Project Settings** gear icon at the bottom.
2. Click **API**.
3. Copy these 3 values:
   - **Project URL** (e.g. `https://xyzproject.supabase.co`)
   - **anon public key** (starts with `eyJhbGci...`)
   - **service_role secret key** (starts with `eyJhbGci...`)

> [!CRITICAL]
> **The Golden Security Rule:**  
> The `service_role` key can bypass all security rules. **NEVER** put the `service_role` key in `frontend/.env` or share it in public chats!

---

## Phase 4 — Configure Backend Environment

### Step 4 — Fill in the Root `.env` File

**WHAT ARE WE DOING?**  
We are configuring our backend server with the database keys we just obtained.

**WHY ARE WE DOING IT?**  
The backend server reads this file on startup to connect to Supabase.

**WHERE DO I DO IT?**  
In the file: `d:\prompt maker\.env`

**WHAT DO I PASTE?**  
Open `d:\prompt maker\.env` in your editor and ensure these lines are filled:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Paste your real values from Supabase Project Settings -> API:
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Google Gemini API Key from https://aistudio.google.com
# (Leave empty if you don't have one yet; backend uses mock generator!)
AI_API_KEY=
AI_PRIMARY_MODEL=gemini-1.5-flash
AI_FALLBACK_MODEL=gemini-1.5-pro

# Storage Buckets
STORAGE_BUCKET_ATTACHMENTS=prompt-attachments
STORAGE_BUCKET_AVATARS=user-avatars

# Background Worker
WORKER_ID=compilation-worker-01
WORKER_POLL_INTERVAL_MS=2000
WORKER_LEASE_SECONDS=60
WORKER_STALE_CHECK_MS=60000
```

**HOW DO I KNOW IT WORKED?**  
Save the file. There are no trailing spaces or quotes around values.

---

## Phase 5 — Run Database Migrations

### Step 5 — Apply the 5 SQL Migration Scripts in Order

**WHAT ARE WE DOING?**  
We are running 5 SQL scripts that automatically build all 18 tables, security rules, and stored procedures in your Supabase database.

**WHY ARE WE DOING IT?**  
Rather than clicking around manually to create 18 tables, database migrations create everything automatically and accurately in seconds.

**WHERE DO I DO IT?**  
In the Supabase Web Dashboard -> **SQL Editor**.

**WHAT DO I CLICK?**  
1. In your Supabase project dashboard, click **SQL Editor** (icon looks like a terminal `>_` on the left).
2. Click **New query**.
3. Open each file below in your local editor, copy the entire text, paste it into the SQL Editor, and click **Run**:

| Run Order | Local File to Copy & Paste | What It Builds |
| :---: | :--- | :--- |
| **1** | [supabase/migrations/20260906000001_initial_schema.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000001_initial_schema.sql) | 18 tables, triggers, user profile sync |
| **2** | [supabase/migrations/20260906000002_rls_and_security.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000002_rls_and_security.sql) | Row-Level Security tenant protection |
| **3** | [supabase/migrations/20260906000003_quota_functions.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000003_quota_functions.sql) | Double-entry quota credit functions |
| **4** | [supabase/migrations/20260906000004_job_and_worker_functions.sql](file:///d:/prompt%20maker/supabase/migrations/20260906000004_job_and_worker_functions.sql) | Background worker queue functions |
| **5** | [supabase/seed.sql](file:///d:/prompt%20maker/supabase/seed.sql) | Seeds plans (free/pro/dev) & 5 blueprints |

**WHAT SHOULD I SEE?**  
After clicking **Run** on each script, Supabase displays:
`Success. No rows returned.`

**HOW DO I KNOW IT WORKED?**  
Click **Table Editor** on the left menu. You will see 18 tables listed: `users`, `plans`, `prompts`, `blueprints`, `quota_ledgers`, etc.!

---

## Phase 6 — Configure Supabase Auth & Storage

### Step 6 — Enable Anonymous Login & Storage Buckets

**WHAT ARE WE DOING?**  
Enabling guest testing so users can compile prompts immediately without signing up, and creating storage folders for attachments.

**WHERE DO I DO IT?**  
In Supabase Dashboard.

**WHAT DO I CLICK FOR AUTH?**  
1. Click **Authentication** on the left menu -> **Providers**.
2. Under **Email**, verify it is turned **ON**.
3. Under **Anonymous Sign-Ins**, toggle it to **ON**.
4. In **URL Configuration**, ensure Site URL is `http://localhost:5173`.

**WHAT DO I CLICK FOR STORAGE?**  
1. Click **Storage** on the left menu.
2. Click **New bucket**.
3. Name: `prompt-attachments` -> Public: **OFF** (Private) -> Save.
4. Click **New bucket**.
5. Name: `user-avatars` -> Public: **ON** -> Save.

---

## Phase 7 — Configure Frontend Environment

### Step 7 — Set Up `frontend/.env`

**WHAT ARE WE DOING?**  
Setting up the browser configuration file so the React website knows where the backend and database are.

**WHERE DO I DO IT?**  
In file: `d:\prompt maker\frontend\.env`

**WHAT DO I PASTE?**  
```env
# Tells the frontend to send requests through Vite's local proxy
VITE_API_URL=/api

# Paste your public Supabase URL and public anon key:
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Phase 8 — Start the Servers (The Magic Moment!)

### Step 8 — Run Backend & Frontend Concurrently

**WHAT ARE WE DOING?**  
We are starting both the Fastify API server and the Vite React frontend using a single command.

**WHERE DO I DO IT?**  
In Windows PowerShell at `d:\prompt maker`.

**WHAT COMMAND DO I RUN?**  
```powershell
npm run dev:all
```

*(Alternatively, you can open two separate PowerShell windows and run `npm run dev:fastify` in Window 1, and `npm run dev` in Window 2).*

**WHAT SHOULD I SEE?**  
```text
[server] {"level":30,"msg":"PromptArchitect Fastify Server listening at http://0.0.0.0:3000"}
[client]   VITE v8.2.2  ready in 420 ms
[client]   ➜  Local:   http://localhost:5173/
[client]   ➜  Network: use --host to expose
```

**HOW DO I KNOW IT WORKED?**  
1. Open your browser and go to: `http://localhost:5173/sandbox`.
2. Look at the top bar: you will see a glowing pill badge:
   `🟢 Fastify Live (<10ms)`!

> [!TIP]
> **STOP POINT — LOCAL SERVERS RUNNING**  
> Do not continue until:
> [x] Fastify server says listening on port 3000.
> [x] Vite frontend says ready on port 5173.
> [x] Browser opens `http://localhost:5173/sandbox`.
> [x] Status badge says `🟢 Fastify Live`.

---

## Phase 9 — Compile Your First Prompt!

### Step 9 — Run the 7-Stage Compiler Pipeline

**WHAT ARE WE DOING?**  
We are typing a software idea, clicking Compile, and letting the 7-stage engine create an enterprise architecture specification.

**WHERE DO I DO IT?**  
In your browser at `http://localhost:5173/sandbox`.

**WHAT DO I CLICK?**  
1. In the input box at the bottom, type:
   `"Build a SaaS subscription billing dashboard with Stripe and React"`
2. Click the **Compile** button (or press `Enter`).

**WHAT SHOULD I SEE?**  
1. The screen visualizes the 7 stages progressing:
   *Stage 1 Ingestion -> Stage 2 Constraints -> Stage 3 Gap Analysis -> Stage 4 Synthesis -> Stage 5 Adversarial Critique -> Stage 6 Optimization -> Stage 7 Target Formatting.*
2. The **Claude Artifact Panel** automatically slides open on the right.
3. You see:
   - **Diagnostic Score**: e.g. `96/100 Quality DNA`.
   - **Prompt A (System PRD)**: Complete architecture, schemas, and contract rules.
   - **Prompt B (Implementation Checklist)**: Atomic terminal checklist with test checkpoints.
   - **Target Dialect**: Formatted for Google Antigravity, Cursor, or Claude Code.

**HOW DO I KNOW IT WORKED?**  
Press `F12` in your browser -> click **Network** tab -> find `generate`. You will see `Status: 200 OK` with response headers containing `x-request-id` from your Fastify server!

---

## Phase 10 — Run Background Worker

### Step 10 — Start the Async Job Daemon

**WHAT ARE WE DOING?**  
We are running the background queue worker that processes heavy multi-agent jobs.

**WHY ARE WE DOING IT?**  
Long prompt runs shouldn't block user HTTP connections; they are processed asynchronously in the background.

**WHERE DO I DO IT?**  
In a second Windows PowerShell window at `d:\prompt maker`.

**WHAT COMMAND DO I RUN?**  
```powershell
npm run worker
```

**WHAT SHOULD I SEE?**  
```text
{"level":30,"workerId":"compilation-worker-01","pollIntervalMs":2000,"msg":"PromptArchitect Compilation Worker started"}
```

**HOW DO I KNOW IT WORKED?**  
The worker logs heartbeat pings every few seconds. If a job is queued, it claims it with PostgreSQL `SKIP LOCKED` and compiles it.

---

## Phase 11 — Migrate Legacy Data (db.json)

### Step 11 — Safely Migrate Legacy db.json Data

**WHAT ARE WE DOING?**  
Migrating old prompts and templates from `server/data/db.json` into Supabase PostgreSQL.

**WHY ARE WE DOING IT?**  
So legacy user prompts aren't lost when moving to the database.

**WHERE DO I DO IT?**  
In Windows PowerShell at `d:\prompt maker`.

**WHAT COMMAND DO I RUN?**  
```powershell
npm run migrate:legacy
npm run verify:legacy
```

**WHAT SHOULD I SEE?**  
```text
{"msg":"Legacy db.json migration completed successfully"}
Migration verified 100% valid!
```

---

## Phase 12 — Run the 19 Automated Test Suites

### Step 12 — Verify 100% System Correctness

**WHAT ARE WE DOING?**  
Running 120 automated tests that check every subsystem: RLS security, quotas, server routes, compiler, and resilience.

**WHERE DO I DO IT?**  
In Windows PowerShell at `d:\prompt maker`.

**WHAT COMMAND DO I RUN?**  
```powershell
npm test
```

**WHAT SHOULD I SEE?**  
```text
✓ tests/schema.test.ts (5 tests)
✓ tests/rls.test.ts (5 tests)
✓ tests/quota.test.ts (6 tests)
✓ tests/server.test.ts (8 tests)
✓ tests/auth.test.ts (6 tests)
✓ tests/repositories.test.ts (9 tests)
✓ tests/compilation.test.ts (6 tests)
✓ tests/compatibility.test.ts (15 tests)
...
All 19 test suites passed (120 tests)!
```

---

# 🩺 Beginner Troubleshooting Guide

| Problem | Cause | Exact Fix |
| :--- | :--- | :--- |
| **`EADDRINUSE: :::3000`** | Another program or previous server is holding port 3000. | In PowerShell run:<br>`Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess \| Stop-Process -Force` |
| **Status badge says `Offline Fallback`** | Fastify backend is not running. | Run `npm run dev:fastify` in terminal. |
| **`401 Unauthorized` on API call** | Missing or incorrect Supabase key in `.env`. | Check `SUPABASE_ANON_KEY` in `.env` for missing characters. |
| **`npm error code ETARGET`** | Package version mismatch (e.g. `@fastify/type-provider-zod`). | Correct version in `package.json` to `"^1.0.0"` and run `npm install`. |
| **`relation already exists` on migration** | Table was partially created earlier. | In Supabase SQL Editor run:<br>`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`<br>Then re-run the 5 migration scripts. |
| **Browser CORS Error** | `ALLOWED_ORIGINS` in `.env` doesn't match browser URL. | Ensure `.env` has:<br>`ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000` |

---

# 📋 Beginner Command Cheat Sheet

All commands are run from the project root folder (`d:\prompt maker`) in Windows PowerShell:

```powershell
# 1. Install all code libraries
npm install

# 2. Build internal compiler packages
npm run build:packages

# 3. Start backend and frontend together
npm run dev:all

# 4. Start background worker (separate terminal)
npm run worker

# 5. Run full test verification
npm test

# 6. Migrate legacy data from db.json
npm run migrate:legacy
```

---

# ⚡ First Day Setup — Follow These Steps in Order

If you only have **15 minutes today**, do these 6 steps in order:

```text
1. Open PowerShell -> cd "d:\prompt maker"
2. Run: npm install && npm run build:packages
3. Create free project on supabase.com -> Copy Project URL & keys
4. Paste keys into d:\prompt maker\.env
5. Paste 5 SQL scripts into Supabase SQL Editor -> Click Run
6. Run: npm run dev:all -> Open http://localhost:5173/sandbox
```

**Congratulations! You now have a production-grade AI prompt compiler running locally on your machine!**
