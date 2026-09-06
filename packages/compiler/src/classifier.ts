/**
 * @promptarchitect/compiler
 * Stage 1: Intent & Domain Classifier
 * Classifies raw user input into one of 11 multi-domain archetypes.
 */
import type { TechnicalStack } from '@promptarchitect/contracts';

export interface DomainArchetype {
  id:
    | 'website'
    | 'coding'
    | 'debugging'
    | 'image'
    | 'video'
    | 'app'
    | 'agent'
    | 'research'
    | 'writing'
    | 'education'
    | 'general';
  label: string;
  icon: string;
  keywords: string[];
  defaultStack: TechnicalStack;
}

export const DOMAIN_ARCHETYPES: Record<string, DomainArchetype> = {
  website: {
    id: 'website',
    label: 'Web Application / SaaS',
    icon: '🌐',
    keywords: ['website', 'saas', 'landing', 'portal', 'dashboard', 'frontend', 'html', 'css', 'react', 'next.js', 'vue'],
    defaultStack: {
      frontend: ['React 19', 'Tailwind CSS', 'Lucide React'],
      backend: ['Node.js 24 LTS', 'Fastify 5.x', 'TypeScript'],
      database: ['Supabase PostgreSQL', 'Prisma ORM'],
      infra: ['Vercel', 'Docker Compose']
    }
  },
  coding: {
    id: 'coding',
    label: 'Backend Microservice / API',
    icon: '⚙️',
    keywords: ['api', 'microservice', 'backend', 'service', 'rest', 'graphql', 'grpc', 'redis', 'queue', 'kafka', 'worker', 'webhook'],
    defaultStack: {
      frontend: ['OpenAPI 3.1 Swagger UI'],
      backend: ['Node.js 24 LTS', 'Fastify 5.x', 'TypeScript'],
      database: ['Supabase PostgreSQL', 'Upstash Redis'],
      infra: ['Docker Compose', 'Kubernetes', 'BullMQ']
    }
  },
  app: {
    id: 'app',
    label: 'Mobile Application',
    icon: '📱',
    keywords: ['mobile', 'app', 'ios', 'android', 'react native', 'flutter', 'expo', 'swift', 'kotlin'],
    defaultStack: {
      frontend: ['React Native', 'Expo Router', 'NativeWind'],
      backend: ['Node.js 24 LTS', 'Fastify 5.x', 'TypeScript'],
      database: ['Supabase PostgreSQL'],
      infra: ['EAS Build', 'Sentry']
    }
  },
  debugging: {
    id: 'debugging',
    label: 'Bug Fix & Code Audit',
    icon: '🔍',
    keywords: ['debug', 'bug', 'fix', 'error', 'exception', 'crash', 'audit', 'race condition', 'memory leak', 'profiling'],
    defaultStack: {
      frontend: ['Browser DevTools'],
      backend: ['Node.js Inspector', 'TypeScript Strict'],
      database: ['EXPLAIN ANALYZE'],
      infra: ['OpenTelemetry', 'Pino Tracing']
    }
  },
  image: {
    id: 'image',
    label: 'Image / Creative Render',
    icon: '🎨',
    keywords: ['image', 'photo', 'cinematic', 'render', 'midjourney', 'dall-e', 'lighting', 'shot', 'portrait', 'octane'],
    defaultStack: {
      frontend: ['Canvas API', 'WebGL'],
      backend: ['Python Pillow', 'FastAPI'],
      database: ['Supabase Storage'],
      infra: ['Cloudflare Images']
    }
  },
  video: {
    id: 'video',
    label: 'Video & Animation',
    icon: '🎬',
    keywords: ['video', 'animation', 'ffmpeg', 'remotion', 'timeline', 'keyframes', 'motion graphics'],
    defaultStack: {
      frontend: ['Remotion', 'WebCodecs'],
      backend: ['FFmpeg', 'Node.js'],
      database: ['S3 Compatible Bucket'],
      infra: ['AWS Lambda GPU']
    }
  },
  agent: {
    id: 'agent',
    label: 'Autonomous AI Agent',
    icon: '🤖',
    keywords: ['agent', 'autonomous', 'bot', 'llm', 'langchain', 'langgraph', 'crewai', 'tools', 'mcp'],
    defaultStack: {
      frontend: ['Next.js Chat UI'],
      backend: ['Node.js 24 LTS', 'TypeScript'],
      database: ['pgvector (Supabase)'],
      infra: ['Docker', 'Temporal Workflow Engine']
    }
  },
  research: {
    id: 'research',
    label: 'Deep Technical Research',
    icon: '📚',
    keywords: ['research', 'benchmark', 'paper', 'literature', 'tradeoff', 'comparison', 'feasibility'],
    defaultStack: {
      frontend: ['Markdown Reports'],
      backend: ['Puppeteer / Cheerio', 'Node.js'],
      database: ['SQLite / Parquet'],
      infra: ['Local FileSystem']
    }
  },
  writing: {
    id: 'writing',
    label: 'Documentation & PRD',
    icon: '📝',
    keywords: ['writing', 'docs', 'prd', 'specification', 'rfc', 'manual', 'whitepaper'],
    defaultStack: {
      frontend: ['VitePress / Docusaurus'],
      backend: ['Markdown AST'],
      database: ['Git Repository'],
      infra: ['GitHub Pages']
    }
  },
  education: {
    id: 'education',
    label: 'Tutorial & Educational',
    icon: '🎓',
    keywords: ['learn', 'tutorial', 'teach', 'course', 'curriculum', 'exercise', 'quiz', 'beginner'],
    defaultStack: {
      frontend: ['Interactive Code Playground'],
      backend: ['Node.js Sandbox'],
      database: ['Supabase PostgreSQL'],
      infra: ['Docker Containers']
    }
  },
  general: {
    id: 'general',
    label: 'General Full-Stack Project',
    icon: '⚡',
    keywords: ['tool', 'utility', 'script', 'project', 'system'],
    defaultStack: {
      frontend: ['React 19', 'Tailwind CSS'],
      backend: ['Node.js 24 LTS', 'TypeScript'],
      database: ['Supabase PostgreSQL'],
      infra: ['Docker']
    }
  }
};

export interface ClassificationResult {
  category: DomainArchetype['id'];
  label: string;
  icon: string;
  confidence: number;
  defaultStack: TechnicalStack;
}

/**
 * Classifies raw user text into one of the 11 domain archetypes.
 */
export function classifyIntent(text = ''): ClassificationResult {
  const lower = text.toLowerCase().trim();
  if (!lower) {
    const def = DOMAIN_ARCHETYPES.general!;
    return {
      category: def.id,
      label: def.label,
      icon: def.icon,
      confidence: 0.5,
      defaultStack: def.defaultStack
    };
  }

  let bestMatch: string = 'website';
  let highestScore = 0;

  for (const [key, archetype] of Object.entries(DOMAIN_ARCHETYPES)) {
    let score = 0;
    for (const keyword of archetype.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length > 5 ? 2 : 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = key;
    }
  }

  const matched = DOMAIN_ARCHETYPES[bestMatch] || DOMAIN_ARCHETYPES.website!;
  const confidence = highestScore > 0 ? Math.min(0.99, 0.65 + highestScore * 0.08) : 0.6;

  return {
    category: matched.id,
    label: matched.label,
    icon: matched.icon,
    confidence,
    defaultStack: matched.defaultStack
  };
}
