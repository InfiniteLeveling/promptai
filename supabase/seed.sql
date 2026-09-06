-- ==============================================================================
-- PromptArchitect AI - Seed Data
-- Seed: supabase/seed.sql
-- ==============================================================================

-- 1. Populate Plan Entitlements (Version 2026-Q3-v1)
INSERT INTO public.plan_entitlements (
    plan, version, daily_compilations, daily_ai_budget_usd,
    max_input_size_bytes, max_output_tokens, max_concurrency, allowed_models,
    feature_flags, effective_from
) VALUES 
(
    'free',
    '2026-Q3-v1',
    5,
    0.2500,
    4096,
    4096,
    1,
    ARRAY['production-primary'],
    '{"advanced_critique": false, "soc2_audit": false}'::jsonb,
    TIMEZONE('utc', NOW())
),
(
    'pro',
    '2026-Q3-v1',
    100,
    5.0000,
    32768,
    16384,
    3,
    ARRAY['production-primary', 'production-fallback'],
    '{"advanced_critique": true, "soc2_audit": false}'::jsonb,
    TIMEZONE('utc', NOW())
),
(
    'developer',
    '2026-Q3-v1',
    1000,
    50.0000,
    131072,
    32768,
    10,
    ARRAY['production-primary', 'production-fallback'],
    '{"advanced_critique": true, "soc2_audit": true}'::jsonb,
    TIMEZONE('utc', NOW())
)
ON CONFLICT (plan, version) DO UPDATE
SET daily_compilations = EXCLUDED.daily_compilations,
    daily_ai_budget_usd = EXCLUDED.daily_ai_budget_usd,
    max_input_size_bytes = EXCLUDED.max_input_size_bytes,
    max_output_tokens = EXCLUDED.max_output_tokens,
    max_concurrency = EXCLUDED.max_concurrency,
    allowed_models = EXCLUDED.allowed_models,
    feature_flags = EXCLUDED.feature_flags;

-- 2. Populate Curated Enterprise Blueprints
INSERT INTO public.blueprints (slug, title, description, category, complexity, spec)
VALUES
(
    'tpl_payment_reconciler',
    'Distributed Payment Reconciler Microservice',
    'High-throughput reconciliation engine with Stripe webhook signature verification, distributed Redis locking, atomic transactions, and automated settlement audit trails.',
    'coding',
    'Enterprise',
    '{
        "category": "coding",
        "objective": "Architect an enterprise-grade distributed payment reconciliation microservice handling Stripe webhook events with idempotent deduplication and zero double-charge guarantee.",
        "technical_stack": {
            "runtime": "Node.js 24 LTS",
            "language": "TypeScript 5.x",
            "framework": "Fastify 5.x",
            "database": "Supabase PostgreSQL with Prisma ORM",
            "cache": "Upstash Redis",
            "validation": "Zod"
        },
        "functional_requirements": [
            "Raw body capture for Stripe HMAC-SHA256 signature verification",
            "Distributed Redis lock on invoice ID with 10-second auto-expiry",
            "Idempotent webhook ledger with processed event IDs",
            "PostgreSQL Serializable transaction isolation for account balance updates",
            "Dead-letter queue (DLQ) with exponential backoff retry on webhook failure"
        ],
        "constraints": [
            "Zero tolerance for untyped or loose any definitions",
            "All database queries must use parameterized statements or Prisma models",
            "Every financial transaction must record double-entry accounting records"
        ],
        "acceptance_criteria": [
            "Replay attack defense verification (HMAC signature mismatch throws HTTP 400)",
            "Idempotency deduplication test (Duplicate stripe_event_id returns HTTP 200 without double-entry mutation)"
        ],
        "metadata": {
            "target_agent": "antigravity",
            "heuristic_score": 100
        }
    }'::jsonb
),
(
    'tpl_saas_multi_tenant',
    'Multi-Tenant B2B SaaS Platform Core',
    'Full-stack enterprise application with PostgreSQL Row-Level Security (RLS), organization workspace switching, role-based access control (RBAC), and team seat management.',
    'website',
    'Advanced',
    '{
        "category": "website",
        "objective": "Build a production-grade multi-tenant B2B SaaS platform core with strict organization-level data isolation, role-based permissions (Owner, Admin, Member), and invitation workflows.",
        "technical_stack": {
            "frontend": ["Next.js 15 App Router", "React 19"],
            "styling": ["Tailwind CSS with Dark Mode"],
            "backend": ["Fastify 5.x", "TypeScript"],
            "database": ["Supabase PostgreSQL with Row Level Security"],
            "auth": ["Supabase Auth with organization claims"]
        },
        "functional_requirements": [
            "Organization workspace switching with subdomain resolution",
            "Role-Based Access Control (Owner, Admin, Member)",
            "Audit trail for team membership mutations"
        ],
        "constraints": [
            "Zero cross-tenant data leakage",
            "All queries must enforce organization_id filtering via RLS"
        ],
        "acceptance_criteria": [
            "Tenant isolation automated test verifies User A cannot read Tenant B data",
            "Session expiration forces clean re-authentication"
        ],
        "metadata": {
            "target_agent": "cursor",
            "heuristic_score": 98
        }
    }'::jsonb
),
(
    'tpl_mobile_offline_sync',
    'Offline-First Mobile Sync Engine',
    'Local-first mobile architecture utilizing embedded SQLite, Conflict-Free Replicated Data Types (CRDTs), and optimistic background synchronization.',
    'app',
    'Advanced',
    '{
        "category": "app",
        "objective": "Architect an offline-first mobile sync engine allowing users to read and modify critical data without network connectivity, resolving sync conflicts via vector clocks.",
        "technical_stack": {
            "mobile": ["React Native with Expo"],
            "local_db": ["Expo SQLite", "WatermelonDB"],
            "backend": ["Node.js 24 LTS", "Fastify"],
            "sync_protocol": ["Bi-directional JSON sync with revision hashes"]
        },
        "functional_requirements": [
            "Local optimistic state mutation within 16ms",
            "Background synchronization worker with exponential backoff",
            "Conflict resolution strategy via vector clocks"
        ],
        "constraints": [
            "Offline write queue persisted durably across app restarts",
            "Zero data loss during unexpected network drop"
        ],
        "acceptance_criteria": [
            "Verify offline create, read, update operations with network disabled",
            "Verify automated synchronization when network connectivity restores"
        ],
        "metadata": {
            "target_agent": "claude",
            "heuristic_score": 96
        }
    }'::jsonb
),
(
    'tpl_cyber_dashboard',
    'Cyber-Obsidian WebGL Telemetry Dashboard',
    'High-performance real-time telemetry dashboard featuring 60fps WebGL particle graphs, dark glassmorphic styling, and sub-10ms data updates.',
    'image',
    'Intermediate',
    '{
        "category": "image",
        "objective": "Create a state-of-the-art cyber-obsidian telemetry dashboard with real-time particle graphs, glassmorphic metric cards, and responsive sidebar navigation.",
        "technical_stack": {
            "framework": ["React 19", "Three.js"],
            "styling": ["Tailwind CSS (Dark Slate, Vibrant Neon Glow)"],
            "icons": ["Lucide React"],
            "state": ["Zustand"]
        },
        "functional_requirements": [
            "Real-time mock telemetry feeds: CPU, Memory, Network IOPS, WebSockets",
            "Interactive WebGL canvas with particle flow velocity",
            "Configurable metric thresholds with alert animations"
        ],
        "constraints": [
            "Consistent 60fps rendering without UI thread blocking",
            "Responsive layout supporting desktop and tablet viewports"
        ],
        "acceptance_criteria": [
            "Lighthouse performance score >= 95",
            "Zero layout shifts during live telemetry stream"
        ],
        "metadata": {
            "target_agent": "v0",
            "heuristic_score": 98
        }
    }'::jsonb
),
(
    'tpl_autonomous_agent',
    'Autonomous Terminal Coding Agent Blueprint',
    'Full-capability autonomous software engineering agent configuration with self-healing test loops, tool-use boundaries, and git checkpoint protection.',
    'agent',
    'Enterprise',
    '{
        "category": "agent",
        "objective": "Author an autonomous agent specification that prevents hallucinations, enforces step-by-step phase gates, and mandates automated test execution before advancing.",
        "technical_stack": {
            "runtime": ["Antigravity IDE Agentic Engine", "Node.js 24 LTS"],
            "tools": ["run_command", "replace_file_content", "view_file"],
            "vcs": ["Git"]
        },
        "functional_requirements": [
            "Directory tree inspection before file creation",
            "Single phase progression with automated test gating",
            "Autonomous rollback on test failure via git reset"
        ],
        "constraints": [
            "Never introduce placeholder code or TODO comments",
            "All edits must be covered by automated test suites"
        ],
        "acceptance_criteria": [
            "Agent terminates task immediately upon any unhandled exception",
            "Verification gates confirm 100% test pass before completion"
        ],
        "metadata": {
            "target_agent": "antigravity",
            "heuristic_score": 100
        }
    }'::jsonb
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    complexity = EXCLUDED.complexity,
    spec = EXCLUDED.spec,
    updated_at = TIMEZONE('utc', NOW());
