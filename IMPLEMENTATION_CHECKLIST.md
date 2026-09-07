# PromptArchitect AI — Implementation Checklist

**Target System:** PromptArchitect AI  
**Document Purpose:** Interactive milestone and step-by-step checklist for tracking implementation progress from zero to production.

---

## 🏁 Phase 1: Environment & Repository Audit (Milestone M0 - M1)
- [ ] Open Windows PowerShell at `d:\prompt maker`
- [x] Verify Node.js version is 20+ LTS: `node -v`
- [x] Verify npm version is 10+: `npm -v`
- [x] Verify Git is installed: `git -v`
- [x] Confirm workspace files exist (`frontend/`, `src/`, `supabase/`, `packages/`)
- [x] Review [REPOSITORY_DISCOVERY_REPORT.md](file:///d:/prompt%20maker/REPOSITORY_DISCOVERY_REPORT.md)

---

## 📦 Phase 2: Dependency Installation & Workspace Build (Milestone M2 - M4)
- [x] Run `npm install` in project root (`d:\prompt maker`)
- [x] Run `npm run build:packages` to compile `@promptarchitect/contracts` and `@promptarchitect/compiler`
- [x] Verify `packages/contracts/dist/` exists
- [x] Verify `packages/compiler/dist/` exists

---

## 🗄️ Phase 3: Supabase Database & Migrations (Milestone M2 - M3)
- [ ] Create Supabase project (hosted cloud at [supabase.com](https://supabase.com) or local `supabase start`)
- [ ] Copy `Project URL`, `anon publishable key`, and `service_role secret key`
- [ ] Populate root `d:\prompt maker\.env` with Supabase keys
- [ ] Execute Migration 1 in Supabase SQL Editor: `20260906000001_initial_schema.sql` (18 tables)
- [ ] Execute Migration 2 in Supabase SQL Editor: `20260906000002_rls_and_security.sql` (RLS policies)
- [ ] Execute Migration 3 in Supabase SQL Editor: `20260906000003_quota_functions.sql` (RPC functions)
- [ ] Execute Migration 4 in Supabase SQL Editor: `20260906000004_job_and_worker_functions.sql` (Queue RPCs)
- [ ] Execute Seed script in Supabase SQL Editor: `seed.sql` (Plans and enterprise blueprints)
- [ ] Verify all 18 tables visible in Supabase Table Editor

---

## 🔐 Phase 4: Supabase Auth & Storage Buckets
- [ ] In Supabase Dashboard -> Authentication -> Providers: verify Email is ON
- [ ] In Supabase Dashboard -> Authentication -> Providers: toggle "Allow anonymous sign-ins" to ON
- [ ] In Supabase Dashboard -> Authentication -> URL Configuration: verify Site URL is `http://localhost:5173`
- [ ] In Supabase Dashboard -> Storage: create private bucket `prompt-attachments`
- [ ] In Supabase Dashboard -> Storage: create public bucket `user-avatars`

---

## 🌐 Phase 5: Frontend Environment Configuration
- [ ] Verify `d:\prompt maker\frontend\.env` has `VITE_API_URL=/api`
- [ ] Paste `VITE_SUPABASE_URL` into `frontend/.env`
- [ ] Paste `VITE_SUPABASE_ANON_KEY` into `frontend/.env`
- [ ] Verify `frontend/vite.config.ts` proxies `/api` and `/health` to `http://localhost:3000`

---

## 🚀 Phase 6: Local Full-Stack Launch (Milestone M5 - M7)
- [ ] Run `npm run dev:all` in PowerShell (or separate terminals: `npm run dev:fastify` & `npm run dev`)
- [ ] Verify Fastify logs listening on `http://0.0.0.0:3000`
- [ ] Verify Vite logs ready on `http://localhost:5173`
- [ ] Open `http://localhost:5173/sandbox` in browser
- [ ] Verify top navigation bar shows `🟢 Fastify Live (<10ms)`

---

## 🧠 Phase 7: First Compilation Verification (Milestone M8)
- [ ] Type prompt: `"Build a SaaS subscription billing dashboard with Stripe and React"`
- [ ] Click **Compile** button
- [ ] Verify visual 7-stage progress completes
- [ ] Verify Claude Artifact Panel slides open with Prompt A and Prompt B
- [ ] Check browser DevTools Network tab (`F12`): verify `POST /api/prompts/generate` returned `200 OK`
- [ ] Verify `x-request-id` header is attached in response

---

## ⚙️ Phase 8: Background Worker Daemon (Milestone M12)
- [ ] Open separate PowerShell window
- [ ] Run `npm run worker`
- [ ] Verify worker starts with `compilation-worker-01`
- [ ] Observe periodic heartbeat pings in terminal

---

## 💾 Phase 9: Legacy Data Migration (Milestone M14)
- [ ] Confirm `server/data/db.json` is intact
- [ ] Run `npm run migrate:legacy`
- [ ] Confirm `scripts/migration-report.json` generated
- [ ] Run `npm run verify:legacy`
- [ ] Confirm terminal shows `Migration verified 100% valid!`

---

## 🧪 Phase 10: Automated Test Verification (Milestone M15)
- [ ] Run complete 19-suite test run: `npm test`
- [ ] Verify all 120 tests pass
- [ ] Run 6-gate enterprise production audit: `npm run verify:gates`
- [ ] Confirm terminal shows `OVERALL STATUS: READY FOR CUTOVER ✓`
- [ ] Run frontend bundle build: `npm --prefix frontend run build`
- [ ] Confirm 2,440 modules transform with 0 errors

---

## 🏢 Phase 11: Staging Readiness (Milestone M16)
- [ ] Provision isolated Supabase staging project (`proj-staging`)
- [ ] Configure staging environment variables on host
- [ ] Verify staging database has migrations applied
- [ ] Test cross-origin requests from `staging.promptarchitect.ai`

---

## 🚀 Phase 12: Production Cutover (Milestone M17 - M18)
- [ ] Provision isolated Supabase production project (`proj-prod`)
- [ ] Apply SQL migrations and verify RLS policies
- [ ] Configure production Stripe live keys and webhook endpoint
- [ ] Configure production Gemini API keys with quota alarms
- [ ] Deploy Fastify backend container behind TLS reverse proxy
- [ ] Deploy frontend static assets to CDN
- [ ] Verify live canary traffic and error rates
