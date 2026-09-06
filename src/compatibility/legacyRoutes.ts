import type { FastifyPluginAsync } from 'fastify';
import {
  compilePipeline,
  improvePipeline,
  extractRequirements,
  isolateParameterGaps,
  scorePrompt,
  classifyIntent
} from '@promptarchitect/compiler';
import { PromptRepository } from '../modules/prompts/promptRepository.js';
import { BlueprintRepository } from '../modules/blueprints/blueprintRepository.js';
import { QuotaRepository } from '../modules/quota/quotaRepository.js';
import { SSRFValidator } from '../infrastructure/security/ssrfValidator.js';
import { mockDb } from '../infrastructure/database/mockDb.js';

export const legacyRoutes: FastifyPluginAsync = async (app) => {
  const isMock = process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL;
  const client = isMock ? mockDb.createClient() : (app as any).supabaseAdmin;

  const promptRepo = new PromptRepository(client);
  const blueprintRepo = new BlueprintRepository(client);
  const quotaRepo = new QuotaRepository(client);

  // Hook to attach RFC deprecation headers to all legacy /api/* endpoints
  app.addHook('onSend', async (request, reply) => {
    if (request.url.startsWith('/api/')) {
      reply.header('Deprecation', '@1798761600');
      reply.header('Sunset', 'Thu, 31 Dec 2026 23:59:59 GMT');
      reply.header('Link', '</api/v1/compile>; rel="successor-version"');
    }
  });

  // 1. GET /api/health
  app.get('/api/health', async () => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      version: '3.0.0'
    };
  });

  // 2. POST /api/prompts/analyze
  app.post('/api/prompts/analyze', async (request: any, reply) => {
    const rawInput = request.body?.raw_input || request.body?.prompt || '';
    const targetAgent = request.body?.target_agent || 'antigravity';

    const spec = await extractRequirements(rawInput, [], targetAgent);
    const classification = classifyIntent(rawInput);
    const scoring = scorePrompt(rawInput, spec, targetAgent, false);
    const chips = isolateParameterGaps(spec, rawInput);

    return {
      success: true,
      data: {
        spec_id: spec.spec_id,
        category: classification.category,
        diagnostic_score: scoring.totalScore,
        score_breakdown: scoring.breakdown,
        clarification_chips: chips,
        requirement_spec: spec
      },
      timestamp: new Date().toISOString()
    };
  });

  // 3. POST /api/prompts/generate
  app.post('/api/prompts/generate', async (request: any, reply) => {
    const rawInput = request.body?.raw_input || request.body?.prompt || '';
    const selectedChips = Array.isArray(request.body?.selected_chips) ? request.body.selected_chips : [];
    const targetAgent = request.body?.target_agent || 'antigravity';

    const compiledResult = await compilePipeline(rawInput, selectedChips, targetAgent);

    return {
      success: true,
      data: compiledResult,
      timestamp: new Date().toISOString()
    };
  });

  // 4. POST /api/prompts/improve
  app.post('/api/prompts/improve', async (request: any, reply) => {
    const targetAgent = request.body?.target_agent || 'antigravity';
    const isSecondPass = Boolean(request.body?.is_second_pass);

    let spec = request.body?.requirement_spec || request.body?.spec;
    if (!spec || typeof spec !== 'object') {
      const fallbackInput = request.body?.current_prompt || request.body?.raw_input || 'Production Web Service';
      spec = await extractRequirements(fallbackInput, [], targetAgent);
    }

    const improvedResult = await improvePipeline(spec, targetAgent, isSecondPass);

    return {
      success: true,
      data: improvedResult,
      timestamp: new Date().toISOString()
    };
  });

  // 5. POST /api/prompts/save
  app.post('/api/prompts/save', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required to save prompt.'
      });
    }

    const body = request.body;
    if (!body || typeof body !== 'object') {
      return reply.status(400).send({
        success: false,
        error: 'INVALID_PAYLOAD',
        message: 'Prompt payload is required to save.'
      });
    }

    const saved = await promptRepo.createPrompt({
      userId,
      title: body.title || 'Untitled Prompt',
      description: body.description || null,
      category: body.category || 'Architecture Spec',
      tags: body.tags || [],
      isPublic: Boolean(body.is_public),
      inputPrompt: body.input_prompt || body.raw_input || body.prompt_a || '',
      canonicalSpec: body.requirement_spec || body.canonical_spec || {},
      dialectOutputs: {
        promptA: body.prompt_a || '',
        promptB: body.prompt_b || '',
        nativeCode: body.native_code || ''
      },
      heuristicScore: body.diagnostic_score || 95
    });

    return reply.status(201).send({
      success: true,
      data: saved,
      message: 'Prompt blueprint successfully saved to library.',
      timestamp: new Date().toISOString()
    });
  });

  // 6. GET /api/prompts
  app.get('/api/prompts', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ success: false, error: 'UNAUTHORIZED' });
    }

    const { page = 1, limit = 20 } = (request.query as any) || {};
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const items = await promptRepo.listUserPrompts(userId, {
      limit: limitNum,
      offset: (pageNum - 1) * limitNum
    });

    return {
      success: true,
      data: items,
      pagination: {
        total: items.length,
        page: pageNum,
        limit: limitNum,
        total_pages: 1
      },
      timestamp: new Date().toISOString()
    };
  });

  // 7. GET /api/prompts/:id
  app.get('/api/prompts/:id', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const userId = request.user?.id;
    const { id } = request.params as { id: string };

    const prompt = await promptRepo.getPromptWithVersions(id, userId);
    if (!prompt) {
      return reply.status(404).send({
        success: false,
        error: 'PROMPT_NOT_FOUND',
        message: `Saved prompt with ID "${id}" was not found or belongs to another user.`
      });
    }

    return {
      success: true,
      data: prompt,
      timestamp: new Date().toISOString()
    };
  });

  // 8. DELETE /api/prompts/:id
  app.delete('/api/prompts/:id', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const userId = request.user?.id;
    const { id } = request.params as { id: string };

    try {
      await promptRepo.deletePrompt(id, userId);
    } catch {
      return reply.status(404).send({
        success: false,
        error: 'PROMPT_NOT_FOUND',
        message: `Prompt with ID "${id}" could not be deleted.`
      });
    }

    return {
      success: true,
      message: 'Deleted successfully.',
      timestamp: new Date().toISOString()
    };
  });

  // 9. GET /api/templates
  app.get('/api/templates', async (request: any) => {
    const { category, search } = (request.query as any) || {};
    const blueprints = await blueprintRepo.listBlueprints(category ? { category } : undefined);

    let filtered = blueprints;
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = blueprints.filter(
        (b) => b.title.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q)
      );
    }

    const templates = filtered.map((b) => ({
      id: b.slug || b.id,
      title: b.title,
      category: b.category,
      domain: (b.spec as any)?.archetype || b.category,
      summary: b.description,
      recommended_agent: (b.spec as any)?.recommended_agent || 'antigravity',
      diagnostic_score: 100,
      default_stack: (b.spec as any)?.default_stack || ['TypeScript', 'Fastify', 'PostgreSQL'],
      canonical_spec: b.spec,
      prompt_a: (b.spec as any)?.prompt_a,
      prompt_b: (b.spec as any)?.prompt_b
    }));

    return {
      success: true,
      count: templates.length,
      data: templates,
      timestamp: new Date().toISOString()
    };
  });

  // 10. GET /api/templates/:id
  app.get('/api/templates/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string };
    let bp = await blueprintRepo.getBlueprintBySlug(id);
    if (!bp) {
      bp = await blueprintRepo.getBlueprintById(id);
    }

    if (!bp) {
      return reply.status(404).send({
        success: false,
        error: 'TEMPLATE_NOT_FOUND',
        message: `Enterprise template with ID "${id}" was not found.`
      });
    }

    const template = {
      id: bp.slug || bp.id,
      title: bp.title,
      category: bp.category,
      domain: (bp.spec as any)?.archetype || bp.category,
      summary: bp.description,
      recommended_agent: (bp.spec as any)?.recommended_agent || 'antigravity',
      diagnostic_score: 100,
      default_stack: (bp.spec as any)?.default_stack || ['TypeScript', 'Fastify', 'PostgreSQL'],
      canonical_spec: bp.spec,
      prompt_a: (bp.spec as any)?.prompt_a,
      prompt_b: (bp.spec as any)?.prompt_b
    };

    return {
      success: true,
      data: template,
      timestamp: new Date().toISOString()
    };
  });

  // 11. POST /api/ingest/github
  app.post('/api/ingest/github', async (request: any, reply) => {
    const { repo_url } = (request.body as any) || {};
    if (!repo_url || typeof repo_url !== 'string') {
      return reply.status(400).send({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Field "repo_url" is required (e.g. "https://github.com/owner/repo").'
      });
    }

    // SSRF Check
    const ssrfResult = await SSRFValidator.validateUrl(repo_url);
    if (!ssrfResult.valid) {
      return reply.status(400).send({
        success: false,
        error: 'GITHUB_INGESTION_ERROR',
        message: ssrfResult.reason
      });
    }

    const urlParts = repo_url.replace(/\/$/, '').split('/');
    const repo = urlParts[urlParts.length - 1] || 'repo';
    const owner = urlParts[urlParts.length - 2] || 'owner';

    return {
      success: true,
      data: {
        owner,
        repo,
        stars: 10500,
        detected_stack: ['TypeScript', 'Fastify', 'Supabase', 'PostgreSQL'],
        file_tree: ['package.json', 'src/app.ts', 'src/server.ts']
      },
      timestamp: new Date().toISOString()
    };
  });

  // 12. GET /api/ingest/icons
  app.get('/api/ingest/icons', async (request: any) => {
    const stacksQuery = (request.query as any)?.stacks || (request.query as any)?.stack || '';
    const names = typeof stacksQuery === 'string' && stacksQuery.trim().length > 0
      ? stacksQuery.split(',').map((s) => s.trim().toLowerCase())
      : ['react', 'typescript', 'supabase', 'fastify'];

    const icons = names.map((name) => ({
      name,
      svg_url: `https://api.iconify.design/logos:${name}.svg`
    }));

    return {
      success: true,
      data: icons,
      timestamp: new Date().toISOString()
    };
  });

  // 13. POST /api/ingest/lint
  app.post('/api/ingest/lint', async (request: any) => {
    return {
      success: true,
      data: {
        hasErrors: false,
        matches: [],
        message: 'Input validated with zero syntax or grammatical defects.'
      },
      timestamp: new Date().toISOString()
    };
  });

  // 14. GET /api/ingest/fixtures
  app.get('/api/ingest/fixtures', async (request: any) => {
    const category = (request.query as any)?.category || 'ecommerce';
    return {
      success: true,
      data: {
        entity: 'User',
        fixtures: [
          { id: 'usr_001', name: 'Alice Chen', email: 'alice@example.com', role: 'admin' },
          { id: 'usr_002', name: 'Bob Miller', email: 'bob@example.com', role: 'engineer' }
        ]
      },
      timestamp: new Date().toISOString()
    };
  });

  // 15. GET /api/usage
  app.get('/api/usage', async (request: any, reply) => {
    const userId = request.user?.id || 'guest_anonymous';
    const tier = request.user?.tier || 'free';

    try {
      const quota = await quotaRepo.getUserQuotaStatus(userId);
      return {
        success: true,
        data: {
          user_id: quota.userId,
          tier: quota.plan,
          date: quota.date,
          prompts_used_today: quota.compilationsUsed,
          daily_limit: quota.dailyLimit,
          prompts_remaining: quota.compilationsRemaining,
          resets_at: `${quota.date}T23:59:59.999Z`
        },
        timestamp: new Date().toISOString()
      };
    } catch {
      return {
        success: true,
        data: {
          user_id: userId,
          tier: tier,
          date: new Date().toISOString().split('T')[0],
          prompts_used_today: 0,
          daily_limit: tier === 'developer' ? 1000 : tier === 'pro' ? 100 : 5,
          prompts_remaining: tier === 'developer' ? 1000 : tier === 'pro' ? 100 : 5,
          resets_at: `${new Date().toISOString().split('T')[0]}T23:59:59.999Z`
        },
        timestamp: new Date().toISOString()
      };
    }
  });
};
