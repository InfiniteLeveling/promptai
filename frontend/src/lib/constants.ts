import type { Archetype, ClarificationChip } from '../types/prompt';

export const ARCHETYPES: Archetype[] = [
  {
    id: 'saas',
    name: 'SaaS Web App',
    iconName: 'Globe',
    description: 'Multi-tenant cloud platform with auth, billing, and relational schema',
    samplePrompt: `Build a multi-tenant webhook dispatcher microservice in TypeScript with PostgreSQL 16 and Redis Streams. It must handle 15k req/sec with <10ms p99 latency. Enforce HMAC-SHA256 signature verification with a 5-minute replay window, and retry with exponential backoff on 5xx failures.`,
    defaultChips: ['chip-ts', 'chip-pg-idx', 'chip-hmac', 'chip-coverage']
  },
  {
    id: 'microservice',
    name: 'Event Microservice',
    iconName: 'Cpu',
    description: 'High-throughput event queue consumer with distributed idempotency',
    samplePrompt: `Design an event-driven payment reconciliation worker in Go using AWS SQS and DynamoDB. Requires idempotency keys calculated from SHA-256(order_id + amount), dead letter queue threshold of 3 retries, and Prometheus metrics for ingest latency.`,
    defaultChips: ['chip-redis-lock', 'chip-coverage', 'chip-hmac']
  },
  {
    id: 'mobile',
    name: 'React Native Mobile',
    iconName: 'Smartphone',
    description: 'Offline-first mobile application with encrypted local SQLite',
    samplePrompt: `Develop a cross-platform React Native offline-first encrypted notes app using WatermelonDB and SQLite with AES-256-GCM encryption. Must include biometrics authentication (FaceID/Fingerprint) and background sync upon internet reconnection.`,
    defaultChips: ['chip-ts', 'chip-coverage']
  },
  {
    id: 'canvas',
    name: '3D WebGL Canvas',
    iconName: 'Box',
    description: 'Interactive Three.js physics & shader visualizer',
    samplePrompt: `Create an interactive WebGL 3D solar system visualizer using Three.js and GLSL shaders. Orbits must adhere to Kepler's laws of planetary motion, with realistic particle ring systems, bloom post-processing, and smooth camera tweening.`,
    defaultChips: ['chip-ts', 'chip-perf-budget']
  }
];

export const AVAILABLE_CHIPS: ClarificationChip[] = [
  {
    id: 'chip-ts',
    label: '+ Strict TypeScript',
    text: 'Must enforce TypeScript strict mode with zero any types and Zod boundary validation.',
    deltaPoints: 5,
    category: 'architecture'
  },
  {
    id: 'chip-redis-lock',
    label: '+ Redis Distributed Lock',
    text: 'Include Redis distributed locking (Redlock algorithm) with 30-second TTL on worker queues.',
    deltaPoints: 5,
    category: 'performance'
  },
  {
    id: 'chip-pg-idx',
    label: '+ Compound DB Indexes',
    text: 'Database schema requires compound indexes on (tenant_id, created_at DESC) and (idempotency_key).',
    deltaPoints: 5,
    category: 'database'
  },
  {
    id: 'chip-coverage',
    label: '+ 85% Test Coverage Gate',
    text: 'Unit and integration tests must achieve >=85% branch coverage before completing phase.',
    deltaPoints: 5,
    category: 'testing'
  },
  {
    id: 'chip-hmac',
    label: '+ HMAC Replay Defense',
    text: 'Enforce HMAC-SHA256 signature verification with 5-minute replay window buffer and nonce cache.',
    deltaPoints: 5,
    category: 'security'
  },
  {
    id: 'chip-perf-budget',
    label: '+ 60 FPS Frame Budget',
    text: 'Limit draw calls to under 50 per frame and maintain 60 FPS frame timing budget on mobile devices.',
    deltaPoints: 4,
    category: 'performance'
  }
];

export const TARGET_AGENT_DETAILS = {
  twoprompt: {
    name: "Two-Prompt Vibe Framework",
    badge: "Dual-Stage Pipeline",
    extension: "md",
    description: "Separates Architectural Spec (Prompt A) from Step-by-Step Gated Execution (Prompt B)."
  },
  antigravity: {
    name: "Google Antigravity",
    badge: "Skill & Task Markdown",
    extension: "md",
    description: "Generates .agents/skills task files with mandatory pre-flight tree inspection and terminal checkpoints."
  },
  cursor: {
    name: "Cursor IDE (.mdc)",
    badge: "Glob Pattern Rules",
    extension: "mdc",
    description: "MDC frontmatter schema with targeted file globs, architectural constraints, and linter checkpoints."
  },
  claude: {
    name: "Claude Code XML",
    badge: "Anthropic Semantic Tags",
    extension: "xml",
    description: "XML containment tags (<context>, <system_constraints>, <instructions>, <output_format>)."
  },
  v0: {
    name: "v0 (Vercel)",
    badge: "React & Tailwind",
    extension: "tsx",
    description: "Component-first specifications tailored for v0 isolated React UI synthesis with Lucide icons."
  },
  midjourney: {
    name: "Midjourney v6",
    badge: "Optics & Lighting Flags",
    extension: "txt",
    description: "Cinematic camera optics, lighting parameters, and negative prompt syntax (--ar 16:9 --style raw)."
  }
};
