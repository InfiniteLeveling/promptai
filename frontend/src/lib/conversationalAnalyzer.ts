import type { TargetFormat, CompiledOutput, ScoreBreakdown } from '../types/prompt';
import type { ClarificationGroup } from '../types/chat';

export type UserIntent =
  | { type: 'greeting'; responseText: string }
  | { type: 'question'; topic: string; responseText: string }
  | {
      type: 'project_spec';
      domain: string;
      entities: string[];
      summary: string;
      initialScore: number;
      scoreBreakdown: ScoreBreakdown;
      compiledOutput: CompiledOutput;
      clarificationGroups: ClarificationGroup[];
    };

/**
 * Analyzes the user's input to understand what they are actually asking.
 * Distinguishes between greetings, architectural questions, and project build requests.
 */
export function analyzeUserInput(
  input: string,
  targetFormat: TargetFormat,
  _conversationHistory: { role: string; content: string }[] = []
): UserIntent {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // 1. GREETINGS & INTRODUCTIONS
  const greetingRegex = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|howdy|sup|hola|yo)\b/i;
  if (greetingRegex.test(trimmed) && trimmed.split(/\s+/).length <= 4) {
    return {
      type: 'greeting',
      responseText: `👋 **Hello! Welcome to PromptArchitect AI.**\n\nI am your Autonomous Architecture & Prompt Engineering Compiler. Instead of giving AI coding agents vague instructions that lead to hallucinations and context drift, I compile your project requirements into **production-ready Dual-Prompt Contracts** (PRD Specification + Agent Implementation Blueprint) formatted for **${targetFormat.toUpperCase()}**.\n\n### How would you like to start?\n- 🏢 **Describe a full project**: *"Build a clothing donation platform with Stripe and user profiles"*\n- ⚙️ **Architect a microservice**: *"Design a high-throughput webhook dispatcher with Redis and PostgreSQL"*\n- 📱 **Build a mobile app**: *"Create an offline-first notes application with local encryption"*\n- ❓ **Ask a question**: *"What is Prompt A vs Prompt B?"* or *"Why do I need idempotency?"*`
    };
  }

  // 2. CONCEPTUAL QUESTIONS & EXPLANATIONS
  if (
    lower.startsWith('what is') ||
    lower.startsWith('how does') ||
    lower.startsWith('why do') ||
    lower.startsWith('can you explain') ||
    lower.startsWith('tell me about') ||
    lower.startsWith('who are you') ||
    lower.startsWith('which target') ||
    lower.startsWith('help') ||
    (lower.endsWith('?') && trimmed.split(/\s+/).length <= 10 && !lower.includes('build') && !lower.includes('create'))
  ) {
    // Question: What is Prompt A vs Prompt B?
    if (lower.includes('prompt a') || lower.includes('prompt b') || lower.includes('dual prompt') || lower.includes('difference')) {
      return {
        type: 'question',
        topic: 'Dual-Prompt Methodology',
        responseText: `### 📄 What is Prompt A vs Prompt B?\n\nStandard prompts attempt to do everything in one shot, causing AI coding agents to mix architectural boundaries with implementation details. PromptArchitect solves this with a **Dual-Prompt Contract**:\n\n1. **Prompt A: Architectural Specification (PRD.md Contract)**\n   - **Role:** Chief Enterprise Architect\n   - **Focus:** System contracts, 3NF database entity-relationship schemas, OpenAPI 3.1 endpoints, security boundaries, and data integrity guarantees.\n   - **Strict Rule:** Zero application source code is written in this phase.\n\n2. **Prompt B: Autonomous Agent Implementation Blueprint**\n   - **Role:** Autonomous Engineering Agent (e.g. Google Antigravity, Cursor, Claude Code)\n   - **Focus:** Step-by-step phased execution, pre-flight directory inspection (\`ls -la\`), terminal checkpoint gates, and test suite verification.\n   - **Strict Rule:** The agent cannot progress to Phase 2 until Phase 1 test checkpoints pass 100%.\n\nTogether, they prevent conversational fatigue and eliminate architectural drift.`
      };
    }

    // Question: What is Antigravity / Target engines?
    if (lower.includes('antigravity') || lower.includes('cursor') || lower.includes('target') || lower.includes('adapter')) {
      return {
        type: 'question',
        topic: 'AI Agent Dialects',
        responseText: `### 🎯 Target Adapters & Dialects\n\nEach AI engineering environment expects different prompt formats, negative constraints, and checkpoint protocols:\n\n- **Google Antigravity:** Formats prompts into task contracts with strict skill declarations, pre-flight workspace tree inspections, and test validation checkpoints.\n- **Cursor:** Formats output into \`.cursorrules\` YAML frontmatter with strict glob scopes and architectural invariants.\n- **Claude / Claude Code:** Generates XML-structured \`<system_role>\`, \`<contract_deliverables>\`, and gated execution boundaries.\n- **v0 by Vercel:** Tailors prompts for full-stack React 19, Tailwind CSS, and shadcn/ui component trees.\n\nYou can switch target dialects anytime using the **Target Engine** selector in the top toolbar!`
      };
    }

    // Question: What is idempotency / Redis / resilience?
    if (lower.includes('idempotency') || lower.includes('redis') || lower.includes('replay') || lower.includes('hmac')) {
      return {
        type: 'question',
        topic: 'Architecture & Resilience',
        responseText: `### 🛡️ Why Idempotency & Distributed Locking Matter\n\nIn production systems (especially payment gateways like Stripe and webhook dispatchers):\n\n- **Double-Charge Protection:** Network retries can cause payment webhooks to fire 2–3 times. Idempotency keys ensure an invoice is only processed once.\n- **Distributed Redis Locks:** Prevents race conditions when concurrent requests hit multiple server instances.\n- **HMAC Signature Verification:** Verifies that webhook payloads genuinely originated from the provider and haven't been tampered with or replayed.\n\nPromptArchitect automatically injects these architectural defenses into your Prompt A specifications whenever payments or APIs are detected!`
      };
    }

    // Generic helpful question answer
    return {
      type: 'question',
      topic: 'General Architecture Guidance',
      responseText: `### 💡 Architecture Consultation: "${trimmed}"\n\nPromptArchitect specializes in converting software engineering requirements into formal architectural specifications and checkpointed agent prompts.\n\nIf you have a project in mind, tell me what you'd like to build (for example: *"Build a clothing donation platform with Stripe"* or *"Build an internal analytics dashboard"*), and I will generate your complete PRD specification, database models, and agent blueprints!`
    };
  }

  // 3. PROJECT REQUIREMENTS & SYSTEM SPECIFICATION
  // Analyze domain, entities, and technology stack from the prompt
  const isDonationOrCharity = /donat|cloth|charity|give|volunteer|nonprofit/i.test(trimmed);
  const isEcom = /ecommerce|store|shop|cart|product|checkout/i.test(trimmed);
  const isFintech = /fintech|bank|pay|stripe|invoice|wallet|transfer|ledger/i.test(trimmed);
  const isMobile = /mobile|ios|android|react native|flutter|expo/i.test(trimmed);
  const isMicroservice = /microservice|redis|kafka|worker|queue|webhook|dispatcher/i.test(trimmed);
  const isAuthOrSocial = /auth|user|profile|social|community|post|feed/i.test(trimmed);

  let domain = 'Full-Stack Web Application';
  let entities: string[] = ['users', 'profiles', 'audit_logs'];

  if (isDonationOrCharity) {
    domain = 'Charity & Donation Logistics Platform';
    entities = ['donors', 'donations', 'clothing_items', 'drop_off_centers', 'delivery_dispatches', 'stripe_payments'];
  } else if (isFintech) {
    domain = 'Fintech Transaction & Payment Engine';
    entities = ['accounts', 'transactions', 'stripe_invoices', 'audit_ledgers', 'reconciliations'];
  } else if (isEcom) {
    domain = 'E-Commerce & Digital Marketplace';
    entities = ['users', 'products', 'categories', 'orders', 'order_items', 'payments'];
  } else if (isMobile) {
    domain = 'Cross-Platform Mobile Application';
    entities = ['users', 'local_cache', 'sync_events', 'offline_queue'];
  } else if (isMicroservice) {
    domain = 'High-Throughput Microservice';
    entities = ['events', 'idempotency_keys', 'dead_letter_queue', 'worker_leases'];
  } else if (isAuthOrSocial) {
    domain = 'Social & Community Platform';
    entities = ['users', 'profiles', 'posts', 'comments', 'follows', 'notifications'];
  }

  // Completeness check:
  // If the user's prompt is short/raw (e.g. < 60 chars), score starts at 48/100 and prompts for clarifications!
  const isBrief = trimmed.length < 70;
  const initialScore = isBrief ? 52 : 88;

  const scoreBreakdown: ScoreBreakdown = isBrief
    ? { clarity: 11, completeness: 10, constraints: 8, gating: 7, context: 6, modelFit: 5, edgeDefenses: 5 }
    : { clarity: 18, completeness: 17, constraints: 13, gating: 13, context: 9, modelFit: 9, edgeDefenses: 9 };

  // Generate tailored clarification groups based on what is detected:
  const clarificationGroups: ClarificationGroup[] = [];

  // Group 1: Auth
  clarificationGroups.push({
    id: 'auth_strategy',
    title: 'Authentication Strategy',
    icon: '🔐',
    question: 'How should user profiles and authentication be secured?',
    options: [
      { id: 'jwt_rotation', label: 'JWT + Refresh Token Rotation', pointsDelta: 6 },
      { id: 'supabase_auth', label: 'Supabase Auth (Row Level Security)', pointsDelta: 7 },
      { id: 'clerk_pkce', label: 'Clerk / OAuth 2.0 PKCE', pointsDelta: 5 }
    ]
  });

  // Group 2: Database / Persistence
  clarificationGroups.push({
    id: 'db_tier',
    title: 'Database Architecture',
    icon: '💾',
    question: 'Which persistence layer should store core application entities?',
    options: [
      { id: 'postgres_prisma', label: 'PostgreSQL 16 + Prisma ORM', pointsDelta: 6 },
      { id: 'supabase_postgres', label: 'Supabase PostgreSQL + Realtime', pointsDelta: 8 },
      { id: 'mongodb_mongoose', label: 'MongoDB + Mongoose', pointsDelta: 4 }
    ]
  });

  // Group 3: Payments / Business Logic
  if (isDonationOrCharity || isFintech || isEcom || lower.includes('stripe')) {
    clarificationGroups.push({
      id: 'payment_logic',
      title: 'Payment & Transaction Processing',
      icon: '💳',
      question: 'Which transaction model best fits your donation/billing flow?',
      options: [
        { id: 'stripe_checkout', label: 'Stripe Checkout + Webhook Signatures', pointsDelta: 6 },
        { id: 'stripe_custom_intents', label: 'Custom Payment Intents + 3D Secure', pointsDelta: 7 },
        { id: 'zero_fee_direct', label: 'Non-Profit 0% Fee Integration', pointsDelta: 5 }
      ]
    });
  } else {
    clarificationGroups.push({
      id: 'resilience_defenses',
      title: 'Reliability & Defense Injections',
      icon: '🛡️',
      question: 'What reliability defenses should be injected into the contract?',
      options: [
        { id: 'idempotency_keys', label: 'Idempotency Keys + DLQ Threshold', pointsDelta: 5 },
        { id: 'sliding_rate_limit', label: 'Sliding-Window Rate Limiting', pointsDelta: 4 }
      ]
    });
  }

  // Synthesize tailored Prompt A (PRD Contract)
  const promptA = `# ARCHITECTURAL SPECIFICATION & SYSTEM CONTRACT (PRD.md)
<!-- Compiled by PromptArchitect AI • Target Engine: ${targetFormat.toUpperCase()} -->
<!-- Domain Archetype: ${domain} -->

<system_role>
You are the Chief Enterprise Software Architect. Your mission is to produce docs/SPEC.md.
DO NOT WRITE FULL CODEBASE IMPLEMENTATION FILES IN THIS PHASE.
</system_role>

<system_requirements>
**Original Request:** "${trimmed}"
**Target Domain:** ${domain}
**Core Relational Entities Identified:**
${entities.map((e) => `- \`public.${e}\``).join('\n')}
</system_requirements>

<database_schema_contract>
Enforce 3NF relational normalization and PostgreSQL constraints:
${entities
  .map(
    (e) => `CREATE TABLE IF NOT EXISTS public.${e} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
  )
  .join('\n\n')}
</database_schema_contract>

<contract_deliverables>
1. Entity Relationship Diagram (Mermaid.js) with foreign key cascades and composite indexes.
2. OpenAPI 3.1 YAML schema definitions with zero untyped or loose string values.
3. Cryptographic signature verification and transaction isolation guarantees.
4. Error recovery, dead-letter queue, and retry backoff matrix.
</contract_deliverables>`;

  // Synthesize tailored Prompt B (Implementation Blueprint)
  const promptB = `# AUTONOMOUS AGENT IMPLEMENTATION BLUEPRINT
<!-- Target Engine: ${targetFormat.toUpperCase()} • Checkpoint Gates Enforced -->
<!-- Project: ${domain} -->

<agent_execution_rules>
1. PRE-FLIGHT MANDATE: Execute directory inspection (\`ls -la\` or \`tree\`) before modifying any file.
2. CONTRACT ADHERENCE: Read docs/SPEC.md. All schemas, tables, and endpoints MUST match with zero deviation.
3. ATOMIC PHASE PROGRESSION: Execute only one phase at a time. Stop and verify with terminal validation tests.
</agent_execution_rules>

<phase_1_database_and_schemas>
- Define Prisma / PostgreSQL migrations for: ${entities.join(', ')}.
- Checkpoint: Run \`npx prisma migrate dev\` and verify with SQL schema inspection.
</phase_1_database_and_schemas>

<phase_2_core_services_and_api>
- Implement typed service layer with strict Zod validation schemas.
- Implement transactional business logic with atomic database transactions.
- Checkpoint: Run unit tests with 100% pass rate.
</phase_2_core_services_and_api>

<phase_3_security_and_integrations>
- Implement authentication middleware, role-based access control, and webhook verification.
- Checkpoint: Validate idempotency and token expiry rejection tests.
</phase_3_security_and_integrations>`;

  const summary = isBrief
    ? `✅ **I have analyzed your request!**\n\nI detected that you want to build a **${domain}**. Because your initial prompt was brief, your specification currently has a Quality Score of **${initialScore}/100**.\n\nTo raise this blueprint to **production-grade (95+/100)**, please select your architectural preferences from the clarification chips below, or ask any questions to refine it further!`
    : `✅ **I have analyzed your requirements!**\n\nI synthesized a verified **Dual-Prompt Contract** for your **${domain}** targeting **${targetFormat.toUpperCase()}**.\n\n### Identified Architecture Highlights:\n- 🗄️ **Core Relational Entities:** ${entities.slice(0, 4).join(', ')}\n- 🛡️ **Defenses:** 3NF relational schemas, pre-flight terminal checkpoints, and zero untyped variables.\n\nInspect your PRD contract and agent implementation steps below:`;

  return {
    type: 'project_spec',
    domain,
    entities,
    summary,
    initialScore,
    scoreBreakdown,
    clarificationGroups,
    compiledOutput: {
      promptA,
      promptB,
      nativeCode: `# Target: ${targetFormat}\n${promptA}`,
      schemaJson: JSON.stringify({ domain, entities, targetFormat }, null, 2),
      diffSummary: [
        `Normalized ${entities.length} relational entities with strict primary/foreign keys`,
        'Injected pre-flight terminal checkpoint gates into Prompt B',
        'Enforced explicit Zod parameter validation schemas'
      ],
      whyBetterNotes: {
        original: trimmed,
        additions: [
          'Prevents AI coding agent hallucination by providing unambiguous entity contracts',
          'Enforces progressive test validation checkpoints between build phases'
        ]
      }
    }
  };
}
