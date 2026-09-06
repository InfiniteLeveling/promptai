/**
 * Google GenAI Service Wrapper using official @google/genai SDK
 * Implements Gemini 1.5 Flash structured JSON requirement analysis with resilient fallback.
 */
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

const SYSTEM_INSTRUCTION = `You are PromptArchitect AI — the Chief Enterprise Requirements Compiler and Master Prompt Architect.
Your task is to analyze raw, unstructured user inputs and synthesize a canonical specification adhering to CanonicalRequirementSpec draft-07 schema.
You MUST output strictly valid JSON matching this structure:
{
  "spec_id": "<UUID string>",
  "category": "<one of: website, coding, debugging, image, video, app, agent, research, writing, education, general>",
  "objective": "<Concise, professional 1-2 sentence mission statement>",
  "technical_stack": {
    "frontend": ["<framework/library>"],
    "backend": ["<framework/runtime>"],
    "database": ["<database system>"],
    "infra": ["<hosting/caching/queues>"]
  },
  "functional_requirements": [
    "<High-impact functional feature statement 1>",
    "<Feature statement 2>",
    "<Feature statement 3>"
  ],
  "constraints": [
    "<Strict negative constraint or performance SLA 1>",
    "<Security / RBAC constraint 2>",
    "<Data integrity or idempotency constraint 3>"
  ],
  "acceptance_criteria": [
    "<Measurable deterministic test gate 1>",
    "<Terminal verification condition 2>"
  ],
  "metadata": {
    "target_agent": "<target agent string>",
    "created_at": "<ISO timestamp>",
    "heuristic_score": <number between 70 and 95>
  }
}
Never output markdown code fences or conversational filler. Output raw JSON only.`;

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.ai = null;

    if (this.apiKey && this.apiKey !== 'your_gemini_api_key_here') {
      try {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        console.log(`[GeminiService] Initialized Google GenAI SDK with model "${this.modelName}".`);
      } catch (err) {
        console.warn(`[GeminiService] Failed to initialize Google GenAI SDK: ${err.message}. Fallback engine active.`);
      }
    } else {
      console.log('[GeminiService] GEMINI_API_KEY not configured. Running in deterministic heuristic mode.');
    }
  }

  /**
   * Analyzes raw user input and compiles it into a CanonicalRequirementSpec object.
   * @param {string} rawInput - Sanitized plain text or wrapped XML
   * @param {string} targetAgent - Target agent format (e.g. antigravity, cursor, claude)
   * @returns {Promise<object>} CanonicalRequirementSpec object
   */
  async analyzeRequirement(rawInput, targetAgent = 'antigravity') {
    if (this.ai) {
      try {
        const contents = `Target Agent: ${targetAgent}\nUser Requirements:\n<raw_user_input>\n${rawInput}\n</raw_user_input>`;

        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents,
          config: {
            responseMimeType: 'application/json',
            systemInstruction: SYSTEM_INSTRUCTION
          }
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          // Ensure spec_id and metadata are populated
          if (!parsed.spec_id) parsed.spec_id = uuidv4();
          if (!parsed.metadata) parsed.metadata = {};
          parsed.metadata.target_agent = targetAgent;
          parsed.metadata.created_at = new Date().toISOString();
          if (!parsed.metadata.heuristic_score) parsed.metadata.heuristic_score = 92;

          return parsed;
        }
      } catch (error) {
        console.warn(`[GeminiService] Live LLM call failed (${error.message}). Engaging deterministic fallback.`);
      }
    }

    // High-Fidelity Deterministic Fallback Engine
    return this.synthesizeDeterministicSpec(rawInput, targetAgent);
  }

  /**
   * Synthesizes a valid CanonicalRequirementSpec using heuristic domain detection.
   * @param {string} rawInput
   * @param {string} targetAgent
   * @returns {object} CanonicalRequirementSpec
   */
  synthesizeDeterministicSpec(rawInput, targetAgent) {
    const lower = rawInput.toLowerCase();
    let category = 'website';

    if (lower.includes('api') || lower.includes('microservice') || lower.includes('backend') || lower.includes('redis') || lower.includes('webhook')) {
      category = 'coding';
    } else if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android') || lower.includes('react native') || lower.includes('flutter')) {
      category = 'app';
    } else if (lower.includes('bug') || lower.includes('fix') || lower.includes('error') || lower.includes('debug')) {
      category = 'debugging';
    } else if (lower.includes('image') || lower.includes('art') || lower.includes('render') || lower.includes('midjourney')) {
      category = 'image';
    } else if (lower.includes('agent') || lower.includes('autonomous') || lower.includes('bot')) {
      category = 'agent';
    }

    const frontendStack = category === 'app' ? ['React Native', 'Expo'] : ['React 19', 'Tailwind CSS', 'Lucide React'];
    const backendStack = ['Node.js v20+', 'Express', 'TypeScript'];
    const databaseStack = lower.includes('mongo') ? ['MongoDB'] : ['PostgreSQL 16', 'Prisma ORM'];
    const infraStack = lower.includes('redis') ? ['Redis Redlock', 'Docker'] : ['Docker Compose', 'Vercel / Cloud Run'];

    return {
      spec_id: uuidv4(),
      category,
      objective: `Architect and deploy a production-grade ${category} platform: "${rawInput.slice(0, 120).trim()}" with strict end-to-end type safety, deterministic validation, and atomic deployment gates.`,
      technical_stack: {
        frontend: frontendStack,
        backend: backendStack,
        database: databaseStack,
        infra: infraStack
      },
      functional_requirements: [
        'Secure multi-role authentication with JWT and refresh token rotation',
        `Core domain workflow implementation matching: "${rawInput.slice(0, 100).trim()}"`,
        'Responsive client dashboard with real-time feedback and state management',
        'Normalized RESTful API endpoints with structured JSON responses and pagination'
      ],
      constraints: [
        'Zero loose "any" types; 100% strict TypeScript and Zod schema boundaries enforced',
        'Cryptographic replay protection and idempotency keys on all state-mutating requests',
        'Outlaw conversational hallucinations; agent must verify filesystem before creating files',
        'P95 latency bounded to < 120ms under simulated concurrent load'
      ],
      acceptance_criteria: [
        'Automated test suite (unit and integration) passes with >= 85% branch coverage',
        'Database migrations execute cleanly with zero orphaned foreign keys or missing indexes',
        'End-to-end smoke test verifies live endpoint connectivity with HTTP 200 OK'
      ],
      metadata: {
        target_agent: targetAgent,
        created_at: new Date().toISOString(),
        heuristic_score: 92
      }
    };
  }
}

export const geminiService = new GeminiService();
export default geminiService;
