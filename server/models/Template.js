/**
 * Enterprise Prompt Template Catalog Model & Seed Data
 * Curated, enterprise-grade architecture blueprints across major industry domains.
 */

export const ENTERPRISE_TEMPLATES = [
  {
    id: 'tpl_payment_reconciler',
    title: 'Distributed Payment Reconciler Microservice',
    category: 'coding',
    domain: 'Fintech / Payments',
    summary: 'High-throughput reconciliation engine with Stripe webhook signature verification, distributed Redis locking, atomic transactions, and automated settlement audit trails.',
    recommended_agent: 'antigravity',
    diagnostic_score: 100,
    default_stack: ['Node.js', 'Express.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Stripe API'],
    canonical_spec: {
      category: 'coding',
      objective: 'Architect an enterprise-grade distributed payment reconciliation microservice handling Stripe webhook events with idempotent deduplication and zero double-charge guarantee.',
      technical_stack: {
        runtime: 'Node.js v20+ LTS',
        language: 'TypeScript 5.x',
        framework: 'Express.js',
        database: 'PostgreSQL 16 with Prisma ORM',
        cache: 'Redis 7 (Distributed Redlock)',
        validation: 'Zod'
      },
      functional_requirements: [
        'Raw body capture for Stripe HMAC-SHA256 signature verification',
        'Distributed Redis lock on invoice ID with 10-second auto-expiry',
        'Idempotent webhook ledger with processed event IDs',
        'PostgreSQL Serializable transaction isolation for account balance updates',
        'Dead-letter queue (DLQ) with exponential backoff retry on webhook failure'
      ],
      constraints: [
        'Zero tolerance for untyped or loose any definitions',
        'All database queries must use parameterized statements or Prisma models',
        'Every financial transaction must record double-entry accounting records'
      ]
    },
    prompt_a: `# PRD & System Contract: Distributed Payment Reconciler Microservice

## System Mandate
You are the Principal Fintech Architect designing an enterprise-grade payment reconciliation microservice.
CRITICAL MANDATE: Output architectural specifications, 3NF schema contracts, and terminal gates ONLY. DO NOT generate application implementation code in this phase.

## OpenAPI 3.1 & Invariant Contracts
- POST /api/webhooks/stripe: Handles checkout.session.completed, invoice.paid, charge.refunded.
- GET /api/reconcile/ledger: Real-time settlement audit status with pagination.

## 3NF Relational Database Schema
- \`Account\` (id UUID PK, user_id UUID, balance_cents BIGINT NOT NULL, currency VARCHAR(3))
- \`WebhookEvent\` (id UUID PK, stripe_event_id VARCHAR(255) UNIQUE, event_type VARCHAR(100), processed_at TIMESTAMP)
- \`LedgerEntry\` (id UUID PK, account_id UUID FK, amount_cents BIGINT, direction ENUM('DEBIT','CREDIT'), idempotency_key VARCHAR(255) UNIQUE)

## Terminal Checkpoint Gates
- Gate 1: Replay attack defense verification (HMAC signature mismatch throws HTTP 400).
- Gate 2: Idempotency deduplication test (Duplicate stripe_event_id returns HTTP 200 without double-entry mutation).`,
    prompt_b: `# Autonomous Implementation Blueprint: Payment Reconciler

## Phase 1: Environment & Cryptographic Invariants
- Install @stripe/stripe-node, ioredis, @prisma/client, zod.
- Configure express.raw() webhook middleware before body-parser.
- Gate: Run \`npm test -- test/crypto.test.ts\` verifying signature validation.

## Phase 2: Distributed Lock & Idempotency Pipeline
- Implement Redis Redlock pattern on lock:invoice:{id}.
- Run \`npx autocannon -c 50 -d 5 http://localhost:3000/api/webhooks/stripe\` verifying zero race-condition duplicates.`
  },
  {
    id: 'tpl_saas_multi_tenant',
    title: 'Multi-Tenant B2B SaaS Platform Core',
    category: 'website',
    domain: 'B2B Enterprise SaaS',
    summary: 'Full-stack enterprise application with PostgreSQL Row-Level Security (RLS), organization workspace switching, role-based access control (RBAC), and team seat management.',
    recommended_agent: 'cursor',
    diagnostic_score: 98,
    default_stack: ['Next.js 15 (App Router)', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Prisma', 'NextAuth / Supabase'],
    canonical_spec: {
      category: 'website',
      objective: 'Build a production-grade multi-tenant B2B SaaS platform core with strict organization-level data isolation, role-based permissions (Owner, Admin, Member), and invitation workflows.',
      technical_stack: {
        frontend: 'Next.js 15 App Router with React 19',
        styling: 'Tailwind CSS with Dark Mode',
        backend: 'Next.js Server Actions & Route Handlers',
        database: 'PostgreSQL with Row Level Security',
        auth: 'Session-based JWT authentication with tenant claim'
      }
    },
    prompt_a: `# PRD: Multi-Tenant B2B SaaS Platform Core
## Core Mandate:
Enforce multi-tenant data isolation at the database layer. No user query may execute without an active organization_id filter.`,
    prompt_b: `# Autonomous Execution Checklist: Multi-Tenant SaaS
## Phase 1: Tenant Context Middleware
- Implement tenant resolver from subdomain or session claims.
- Verify tenant isolation with automated integration test.`
  },
  {
    id: 'tpl_mobile_offline_sync',
    title: 'Offline-First Mobile Sync Engine',
    category: 'app',
    domain: 'Mobile / Offline First',
    summary: 'Local-first mobile architecture utilizing embedded SQLite, Conflict-Free Replicated Data Types (CRDTs), and optimistic background synchronization.',
    recommended_agent: 'claude',
    diagnostic_score: 96,
    default_stack: ['React Native', 'Expo', 'TypeScript', 'SQLite / WatermelonDB', 'Zustand'],
    canonical_spec: {
      category: 'app',
      objective: 'Architect an offline-first mobile sync engine allowing users to read and modify critical data without network connectivity, resolving sync conflicts via vector clocks.',
      technical_stack: {
        mobile: 'React Native 0.76+ with Expo',
        local_db: 'Expo SQLite / WatermelonDB',
        state: 'Zustand offline storage middleware',
        sync_protocol: 'Bi-directional JSON sync with revision hashes'
      }
    },
    prompt_a: `<role>Senior Mobile Systems Architect</role>
<system_constraints>
1. All UI write operations MUST commit to local SQLite immediately within 16ms.
2. Background sync tasks MUST retry with exponential backoff on network drop.
</system_constraints>`,
    prompt_b: `<terminal_checkpoint_gates>
Gate 1: Verify offline create, read, update operations with Network disabled.
Gate 2: Verify conflict resolution when reconnected to remote server.
</terminal_checkpoint_gates>`
  },
  {
    id: 'tpl_cyber_dashboard',
    title: 'Cyber-Obsidian WebGL Telemetry Dashboard',
    category: 'image',
    domain: 'Analytics & Visualization',
    summary: 'High-performance real-time telemetry dashboard featuring 60fps WebGL particle graphs, dark glassmorphic styling, and sub-10ms data updates.',
    recommended_agent: 'v0',
    diagnostic_score: 98,
    default_stack: ['React 19', 'Tailwind CSS', 'Three.js / Lucide React', 'Zustand'],
    canonical_spec: {
      category: 'image',
      objective: 'Create a state-of-the-art cyber-obsidian telemetry dashboard with real-time particle graphs, glassmorphic metric cards, and responsive sidebar navigation.',
      technical_stack: {
        framework: 'React 19',
        styling: 'Tailwind CSS v3 (Arbitrary dark hues, backdrop-blur-xl)',
        icons: 'lucide-react'
      }
    },
    prompt_a: `Create a single-file React 19 Cyber-Obsidian Telemetry Dashboard with Tailwind CSS.
Use dark slate #0B0F17 backgrounds, vibrant violet #8B5CF6 glow accents, and glassmorphic panels.`,
    prompt_b: `Include strongly typed mock telemetry feeds: CPU utilization, Memory pressure, Network IOPS, and Active WebSocket Connections.`
  },
  {
    id: 'tpl_autonomous_agent',
    title: 'Autonomous Terminal Coding Agent Blueprint',
    category: 'agent',
    domain: 'AI Agents & Automation',
    summary: 'Full-capability autonomous software engineering agent configuration with self-healing test loops, tool-use boundaries, and git checkpoint protection.',
    recommended_agent: 'antigravity',
    diagnostic_score: 100,
    default_stack: ['Node.js', 'Antigravity IDE', 'Git', 'Vitest / Jest'],
    canonical_spec: {
      category: 'agent',
      objective: 'Author an autonomous agent specification that prevents hallucinations, enforces step-by-step phase gates, and mandates automated test execution before advancing.',
      technical_stack: {
        runtime: 'Antigravity IDE Agentic Engine',
        tools: ['run_command', 'replace_file_content', 'view_file']
      }
    },
    prompt_a: `# System Role: Autonomous Principal Software Engineer
Execute tasks strictly sequentially. Never modify code before establishing an approved Implementation Plan.`,
    prompt_b: `# Execution Loop:
1. Research & Inspect.
2. Formulate Plan.
3. Execute atomic edits.
4. Run terminal verification test.
5. If tests fail, invoke \`git checkout -- .\` and correct strategy.`
  }
];

export default ENTERPRISE_TEMPLATES;
