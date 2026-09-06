/**
 * Stage 1: Intent & Domain Classifier
 * Classifies raw user input into one of 11 multi-domain archetypes.
 */

export const DOMAIN_ARCHETYPES = {
  website: {
    id: 'website',
    label: 'Web Application / SaaS',
    icon: '🌐',
    keywords: ['website', 'saas', 'landing', 'portal', 'dashboard', 'frontend', 'html', 'css', 'react', 'next.js', 'vue'],
    defaultStack: {
      frontend: ['React 19', 'Tailwind CSS', 'Lucide React'],
      backend: ['Node.js v20+', 'Express', 'TypeScript'],
      database: ['PostgreSQL 16', 'Prisma ORM'],
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
      backend: ['Node.js v20+', 'Fastify / Express', 'TypeScript'],
      database: ['PostgreSQL 16', 'Redis Redlock'],
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
      backend: ['Node.js v20+', 'Express', 'TypeScript'],
      database: ['PostgreSQL 16', 'Supabase'],
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
      infra: ['OpenTelemetry', 'Winston Tracing']
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
      database: ['AWS S3'],
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
      backend: ['Node.js / Python', '@google/genai'],
      database: ['Vector DB (Pinecone/pgvector)'],
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
      database: ['PostgreSQL'],
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
      backend: ['Node.js v20+', 'TypeScript'],
      database: ['PostgreSQL 16'],
      infra: ['Docker']
    }
  }
};

/**
 * Classifies raw user text into one of the 11 domain archetypes.
 * @param {string} text
 * @returns {{ category: string, label: string, icon: string, confidence: number, defaultStack: object }}
 */
export function classifyIntent(text = '') {
  const lower = text.toLowerCase().trim();
  if (!lower) {
    const def = DOMAIN_ARCHETYPES.general;
    return { category: def.id, label: def.label, icon: def.icon, confidence: 0.5, defaultStack: def.defaultStack };
  }

  let bestMatch = 'website';
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

  const matched = DOMAIN_ARCHETYPES[bestMatch] || DOMAIN_ARCHETYPES.website;
  const confidence = highestScore > 0 ? Math.min(0.99, 0.65 + highestScore * 0.08) : 0.6;

  return {
    category: matched.id,
    label: matched.label,
    icon: matched.icon,
    confidence,
    defaultStack: matched.defaultStack
  };
}

export default {
  classifyIntent,
  DOMAIN_ARCHETYPES
};
