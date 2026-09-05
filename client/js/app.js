/**
 * PromptArchitect AI — Frontend Sandbox Application Coordinator
 */

import { store } from './state.js';
import { ScoreMeter } from './components/score-meter.js';
import { ClarificationChips } from './components/clarification-chips.js';
import { TargetSelector } from './components/target-selector.js';
import { PromptViewer } from './components/prompt-viewer.js';
import { showToast } from './utils/clipboard.js';

class App {
  constructor() {
    this.mockSpecs = [];
    this.scoreMeter = null;
    this.clarificationChips = null;
    this.targetSelector = null;
    this.promptViewer = null;

    this.init();
  }

  async init() {
    // 1. Initialize UI Components
    this.scoreMeter = new ScoreMeter('score-meter-mount');
    this.promptViewer = new PromptViewer('prompt-viewer-mount');

    this.clarificationChips = new ClarificationChips('clarification-chips-mount', {
      onSelectionChange: (selected) => this.handleChipSelection(selected),
      onGenerate: (selected, isBypass) => this.compilePrompt(selected, isBypass)
    });

    this.targetSelector = new TargetSelector('target-selector-mount', {
      initialTarget: store.getState().targetAgent,
      onTargetChange: (target) => this.handleTargetChange(target)
    });

    // 2. Load Mock Specifications
    await this.loadMockSpecs();

    // 3. Attach UI Event Listeners
    this.attachDomListeners();

    // 4. Check initial sample (default to Clothing Donation)
    const initialSample = this.mockSpecs[0];
    if (initialSample) {
      this.loadSampleSpec(initialSample.id);
    }
  }

  async loadMockSpecs() {
    try {
      const response = await fetch('../tests/mocks/sampleSpecs.json');
      if (response.ok) {
        this.mockSpecs = await response.json();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.warn('Could not load sampleSpecs.json via fetch (likely file:// protocol). Using embedded fallback.', err);
      // Inline robust fallback to ensure zero-network file:// sandbox compatibility
      this.mockSpecs = [
        {
          id: 'clothing-donation',
          title: 'Clothing Donation Platform',
          category: 'website',
          raw_input: 'Build a clothing donation platform with HTML, CSS, and JS',
          diagnostic_score: 42,
          score_breakdown: {
            goal_clarity: 14, requirements_completeness: 6, context_environment: 8,
            technical_constraints: 4, technical_specificity: 4, output_formatting: 4, acceptance_criteria: 2
          },
          deficiencies: [
            'Missing database and state persistence strategy',
            'No user roles or authorization defined (Donor vs Charity Admin)',
            'Undefined clothing category taxonomy and donation status workflow'
          ],
          clarification_chips: [
            {
              id: 'chip_auth', question: 'Authentication Strategy',
              options: ['Local Storage / Demo Mode', 'Firebase Auth', 'JWT + Node Backend']
            },
            {
              id: 'chip_db', question: 'Data Persistence',
              options: ['In-Memory Mock State', 'IndexedDB / LocalStorage', 'REST API + SQLite']
            },
            {
              id: 'chip_workflow', question: 'Donation Workflow',
              options: ['Simple Form Submission', 'Multi-Step Donor Wizard with Tracking']
            }
          ],
          final_score: 94,
          final_score_breakdown: {
            goal_clarity: 20, requirements_completeness: 19, context_environment: 14,
            technical_constraints: 14, technical_specificity: 9, output_formatting: 9, acceptance_criteria: 9
          },
          deliverables: {
            antigravity: {
              prompt_a: '<!-- PROMPT A: ARCHITECTURAL SPECIFICATION PROMPT -->\n<system_context>\nYou are an elite Systems Architect operating in Architectural Planning Mode.\nYour objective is to produce a complete, deterministic PRD and Canonical RequirementSpec for a Community Clothing Donation Platform.\nDO NOT create application code or run modifying commands during this step.\n</system_context>\n\n<architectural_guidelines>\n1. Target Stack: Pure HTML5, Vanilla CSS3 (Custom Properties), ES6+ Modules, IndexedDB persistence.\n2. Security Boundary: Strict input sanitization; zero external framework dependencies.\n3. Data Models: Define DonationItem (id, donorName, category, condition, status, timestamp) and CharityProfile schemas.\n4. Deliverables Required: Output CanonicalRequirementSpec JSON and PRD.md.\n</architectural_guidelines>',
              prompt_b: '<!-- PROMPT B: ANTIGRAVITY IMPLEMENTATION PROMPT -->\n<task_directive>\nYou are an autonomous software engineering agent executing Phase-by-Phase implementation of the Community Clothing Donation Platform.\nFollow strict atomic milestones with terminal checkpoints.\n</task_directive>\n\n<execution_protocol>\nStep 1: Inspect repository directory tree and confirm zero build tools exist.\nStep 2: Implement client/index.html with semantic markup (Donor View + Admin Dashboard).\nStep 3: Implement client/css/style.css with responsive flex/grid and glassmorphic card tokens.\nStep 4: Implement client/js/db.js wrapping IndexedDB with Promise-based CRUD.\nStep 5: Verify donation creation, state persistence, and role switching using browser verification tools.\nStep 6: Ensure zero console errors and full keyboard navigation.\n</execution_protocol>'
            },
            cursor: {
              cursorrules: '# .cursorrules for Clothing Donation Platform\n- Always use Vanilla JavaScript (ES6+ Modules) and Vanilla CSS3 Custom Properties.\n- Prohibited: Do NOT install or suggest TailwindCSS, React, or heavy utility libraries.\n- Ensure all persistent state uses the IndexedDB wrapper in `client/js/db.js`.\n- Write semantic HTML with explicit `id` attributes on all buttons and form controls.\n- Add JSDoc comments on all exported functions with @param and @returns tags.'
            }
          }
        },
        {
          id: 'saas-analytics',
          title: 'Real-Time SaaS Analytics Dashboard',
          category: 'app',
          raw_input: 'Build a real-time SaaS product analytics dashboard with metrics and charts',
          diagnostic_score: 54,
          score_breakdown: {
            goal_clarity: 16, requirements_completeness: 8, context_environment: 10,
            technical_constraints: 6, technical_specificity: 6, output_formatting: 4, acceptance_criteria: 4
          },
          deficiencies: [
            'No data ingestion protocol or WebSocket specification defined',
            'Undefined aggregation window (real-time vs 1h vs 24h buckets)',
            'Missing tenant isolation and API key authorization model'
          ],
          clarification_chips: [
            { id: 'chip_transport', question: 'Data Streaming Transport', options: ['Server-Sent Events (SSE)', 'WebSockets', 'Polling (REST 5s)'] },
            { id: 'chip_charts', question: 'Data Visualization Layer', options: ['Canvas / SVG Native', 'Chart.js Lightweight', 'D3.js Custom'] },
            { id: 'chip_db', question: 'Telemetry Storage Engine', options: ['ClickHouse OLAP', 'PostgreSQL TimescaleDB', 'In-Memory Redis Ring'] }
          ],
          final_score: 96,
          final_score_breakdown: {
            goal_clarity: 20, requirements_completeness: 20, context_environment: 15,
            technical_constraints: 14, technical_specificity: 9, output_formatting: 9, acceptance_criteria: 9
          },
          deliverables: {
            antigravity: {
              prompt_a: '<!-- PROMPT A: SAAS ANALYTICS SYSTEM ARCHITECTURE -->\n<system_directive>\nDefine real-time telemetry schema (TenantId, EventType, TimestampNano, LatencyMs, Metadata) and Fastify SSE pipeline specifications before coding.\n</system_directive>',
              prompt_b: '<!-- PROMPT B: ANTIGRAVITY SAAS ANALYTICS IMPLEMENTATION -->\n<task_directive>\nPhase 1: Build SSE server emitting 50 events/sec.\nPhase 2: Build high-performance Canvas line renderer.\nPhase 3: Connect stream and verify zero memory leak after 5 minutes of continuous streaming.\n</task_directive>'
            }
          }
        },
        {
          id: 'midjourney-portrait',
          title: 'Cinematic Cyberpunk Studio Portrait',
          category: 'image',
          raw_input: 'Cyberpunk girl portrait in neon rain',
          diagnostic_score: 30,
          score_breakdown: {
            goal_clarity: 10, requirements_completeness: 4, context_environment: 6,
            technical_constraints: 4, technical_specificity: 2, output_formatting: 2, acceptance_criteria: 2
          },
          deficiencies: [
            'Missing camera model, focal length, and aperture (f-stop)',
            'Undefined lighting ratios and color temperature (Kelvin)',
            'Missing Midjourney parameters (--ar, --v, --stylize, --chaos, negative tokens)'
          ],
          clarification_chips: [
            { id: 'chip_lens', question: 'Camera Lens & Aperture', options: ['85mm f/1.4 Portrait Prime', '35mm f/1.8 Cinematic Street', 'Anamorphic 50mm T2.0'] },
            { id: 'chip_lighting', question: 'Lighting Atmosphere', options: ['Volumetric Neon Rim Lighting with Fog', 'Split High-Contrast Chiaroscuro', 'Golden Hour Dappled Sun'] },
            { id: 'chip_aspect', question: 'Aspect Ratio Flag', options: ['--ar 16:9 (Cinematic Landscape)', '--ar 9:16 (Mobile Story)', '--ar 4:5 (Instagram Portrait)'] }
          ],
          final_score: 98,
          final_score_breakdown: {
            goal_clarity: 20, requirements_completeness: 20, context_environment: 15,
            technical_constraints: 15, technical_specificity: 10, output_formatting: 9, acceptance_criteria: 9
          },
          deliverables: {
            midjourney: {
              prompt_a: '<!-- MIDJOURNEY COMPOSITION SPECIFICATION -->\nSubject: 26-year-old female cyber-operative\nOptics: Shot on Hasselblad H6D-100c, 85mm f/1.4 lens\nLighting: Volumetric electric magenta and cyan neon rim lighting',
              prompt_b: 'A cinematic editorial portrait of a 26-year-old female cyber-operative in rain-soaked Neo-Shinjuku, subtle iridescent titanium neural ear cuffs, translucent waterproof high-collar techwear jacket, water droplets glistening on textured skin, natural pores, shot on Hasselblad H6D-100c, 85mm f/1.4 lens, shallow depth of field, delicate volumetric cyan and magenta neon rim lighting, kodak portra 400 color grading --ar 16:9 --v 6.0 --style raw --stylize 250 --no plastic skin, cartoon, anime, illustration, 3d render, oversaturated'
            }
          }
        }
      ];
    }
  }

  attachDomListeners() {
    // 1. Textarea Input Listener
    const inputArea = document.getElementById('input-raw-idea');
    if (inputArea) {
      inputArea.addEventListener('input', (e) => {
        const text = e.target.value.trim();
        this.handleCustomTextInput(text);
      });
    }

    // 2. Sample Chips Click
    const sampleChips = document.querySelectorAll('.sample-chip');
    sampleChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const sampleId = e.currentTarget.getAttribute('data-sample-id');
        this.loadSampleSpec(sampleId);
      });
    });

    // 3. Theme Toggle Button
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const currentTheme = store.getState().theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        store.setState({ theme: newTheme });
        themeBtn.textContent = newTheme === 'dark' ? '🌙 Dark' : '☀️ Light';
        showToast(`Theme switched to ${newTheme} mode`, 'info');
      });
      // Set initial button label
      themeBtn.textContent = store.getState().theme === 'dark' ? '🌙 Dark' : '☀️ Light';
    }

    // 4. Ingestion Tabs (Text, Screenshot, GitHub)
    const tabBtns = document.querySelectorAll('.ingest-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.getAttribute('data-mode');
        tabBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.handleIngestModeChange(mode);
      });
    });
  }

  loadSampleSpec(sampleId) {
    const spec = this.mockSpecs.find(s => s.id === sampleId);
    if (!spec) return;

    store.setState({
      activeSampleId: sampleId,
      currentSpec: spec,
      rawInput: spec.raw_input,
      diagnosticScore: spec.diagnostic_score,
      scoreBreakdown: spec.score_breakdown,
      selectedChips: {}
    });

    // Update Input Area
    const inputArea = document.getElementById('input-raw-idea');
    if (inputArea) inputArea.value = spec.raw_input;

    // Update Score Meter
    this.scoreMeter.update(
      spec.diagnostic_score,
      spec.score_breakdown,
      spec.deficiencies,
      spec.canonical_spec?.spec_id || spec.id
    );

    // Update Clarification Chips Deck
    this.clarificationChips.reset();
    this.clarificationChips.render(spec.clarification_chips);

    // Reset Viewer
    this.promptViewer.renderEmpty();
  }

  handleCustomTextInput(text) {
    if (!text) {
      this.scoreMeter.update(0, null, []);
      this.clarificationChips.render([]);
      this.promptViewer.renderEmpty();
      return;
    }

    // Heuristic client-side scoring for custom text
    const words = text.split(/\s+/).filter(Boolean).length;
    let score = Math.min(words * 4, 38); // Base length score up to 38
    let defs = ['Vague intent; project boundaries undeclared'];

    if (text.toLowerCase().includes('html') || text.toLowerCase().includes('python') || text.toLowerCase().includes('react')) {
      score += 15;
    } else {
      defs.push('No programming language or runtime specified');
    }

    if (!text.toLowerCase().includes('database') && !text.toLowerCase().includes('storage')) {
      defs.push('Missing database/persistence architecture');
    } else {
      score += 10;
    }

    const mockBreakdown = {
      goal_clarity: Math.round(score * 0.3),
      requirements_completeness: Math.round(score * 0.2),
      context_environment: Math.round(score * 0.15),
      technical_constraints: Math.round(score * 0.15),
      technical_specificity: Math.round(score * 0.1),
      output_formatting: Math.round(score * 0.05),
      acceptance_criteria: Math.round(score * 0.05)
    };

    this.scoreMeter.update(score, mockBreakdown, defs, 'custom-draft');

    // Surface generic dynamic clarification chips for custom input
    this.clarificationChips.render([
      {
        id: 'chip_runtime',
        question: 'Target Runtime Stack',
        options: ['Vanilla ES6+ Web', 'Node.js Express', 'Python FastAPI', 'Next.js']
      },
      {
        id: 'chip_storage',
        question: 'Persistence Strategy',
        options: ['LocalStorage / In-Memory', 'PostgreSQL / Prisma', 'MongoDB Atlas', 'None']
      }
    ]);
  }

  handleChipSelection(selected) {
    store.setState({ selectedChips: selected });
    const count = Object.keys(selected).length;
    const currentScore = store.getState().diagnosticScore || 40;
    const prospectiveScore = Math.min(currentScore + count * 15, 88);

    // Update gauge dynamically
    this.scoreMeter.update(
      prospectiveScore,
      store.getState().scoreBreakdown,
      store.getState().currentSpec?.deficiencies || []
    );
  }

  compilePrompt(selectedChips, isBypass = false) {
    const spec = store.getState().currentSpec || this.mockSpecs[0];
    const targetAgent = store.getState().targetAgent || 'antigravity';
    const finalScore = spec.final_score || 94;

    showToast(isBypass ? '⚡ Compiled with safe defaults!' : '🚀 Master Prompt compiled & verified!');

    // Elevate score meter to production ready
    this.scoreMeter.update(
      finalScore,
      spec.final_score_breakdown,
      [],
      spec.canonical_spec?.spec_id || spec.id
    );

    // Render Deliverables
    const deliverables = spec.deliverables?.[targetAgent] || spec.deliverables?.antigravity;
    this.promptViewer.render(deliverables, targetAgent, finalScore);

    // Scroll smoothly to output
    const stage = document.getElementById('prompt-viewer-mount');
    if (stage) {
      stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleTargetChange(target) {
    store.setState({ targetAgent: target });
    const spec = store.getState().currentSpec;
    if (spec && this.promptViewer.currentData) {
      const deliverables = spec.deliverables?.[target] || spec.deliverables?.antigravity;
      this.promptViewer.render(deliverables, target, spec.final_score || 94);
      showToast(`Target switched to ${target.toUpperCase()}`, 'info');
    }
  }

  handleIngestModeChange(mode) {
    store.setState({ ingestMode: mode });
    const inputArea = document.getElementById('input-raw-idea');
    if (!inputArea) return;

    if (mode === 'screenshot') {
      inputArea.placeholder = 'Drag & drop a UI screenshot or wireframe image here, or describe the visual layout...';
      showToast('Vision Ingestion Mode: Drop an image or describe visual hierarchy', 'info');
    } else if (mode === 'github') {
      inputArea.placeholder = 'Enter a public GitHub repository URL (e.g. https://github.com/owner/repo) to analyze dependencies...';
      showToast('GitHub Context Mode: Enter repo URL to extract tree & schemas', 'info');
    } else {
      inputArea.placeholder = 'Describe your idea in natural language (e.g., "Build a clothing donation platform with HTML, CSS, and JS")...';
    }
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.__promptArchitectApp = new App();
});
