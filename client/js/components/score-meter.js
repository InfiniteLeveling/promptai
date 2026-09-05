/**
 * PromptArchitect AI — 100-Point Radial Score Gauge HUD Component
 */

const CIRCUMFERENCE = 2 * Math.PI * 50; // r = 50 -> ~314.16

const RUBRIC_DIMENSIONS = [
  { key: 'goal_clarity', name: 'Goal Clarity', max: 20 },
  { key: 'requirements_completeness', name: 'Requirements', max: 20 },
  { key: 'context_environment', name: 'Context & Env', max: 15 },
  { key: 'technical_constraints', name: 'Constraints', max: 15 },
  { key: 'technical_specificity', name: 'Specificity', max: 10 },
  { key: 'output_formatting', name: 'Formatting', max: 10 },
  { key: 'acceptance_criteria', name: 'Acceptance', max: 10 }
];

export class ScoreMeter {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentScore = 0;
    this.animationTimer = null;
    this.renderSkeleton();
  }

  renderSkeleton() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="score-hud-container">
        <div class="score-gauge-card">
          <div class="radial-gauge-wrapper">
            <svg class="radial-gauge-svg" viewBox="0 0 120 120">
              <circle class="gauge-bg-circle" cx="60" cy="60" r="50"></circle>
              <circle id="gauge-circle-fill" class="gauge-progress-circle" cx="60" cy="60" r="50"
                stroke-dasharray="${CIRCUMFERENCE}"
                stroke-dashoffset="${CIRCUMFERENCE}"
                stroke="var(--status-danger)"></circle>
            </svg>
            <div class="gauge-center-text">
              <span id="gauge-number" class="gauge-score-number">0</span>
              <span class="gauge-score-label">/ 100 PTS</span>
            </div>
          </div>
          <div class="score-meta-info">
            <div id="score-badge" class="score-status-badge danger">
              <span>●</span> <span id="score-badge-text">READY FOR ANALYSIS</span>
            </div>
            <p id="score-meta-desc" class="score-meta-desc">
              Type or select a sample idea to evaluate architectural completeness.
            </p>
          </div>
        </div>

        <div class="card-header" style="margin-top: 1rem; margin-bottom: 0.5rem;">
          <span class="card-title" style="font-size: 0.9375rem;">
            📊 Diagnostic Rubric Breakdown
          </span>
          <span id="rubric-spec-id" style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);"></span>
        </div>

        <div id="rubric-bars-grid" class="rubric-bars-grid">
          ${RUBRIC_DIMENSIONS.map(dim => `
            <div class="rubric-bar-item">
              <div class="rubric-bar-header">
                <span class="rubric-bar-name">${dim.name}</span>
                <span id="bar-val-${dim.key}">0/${dim.max}</span>
              </div>
              <div class="rubric-bar-track">
                <div id="bar-fill-${dim.key}" class="rubric-bar-fill" style="width: 0%;"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div id="deficiencies-container" class="hidden" style="margin-top: 1rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--status-danger); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
            ⚠️ Identified Architectural Gaps
          </div>
          <ul id="deficiencies-list" style="list-style: none; display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.8125rem; color: var(--text-secondary);">
          </ul>
        </div>
      </div>
    `;
  }

  update(targetScore, breakdown = null, deficiencies = [], specId = '') {
    const circle = document.getElementById('gauge-circle-fill');
    const numberEl = document.getElementById('gauge-number');
    const badge = document.getElementById('score-badge');
    const badgeText = document.getElementById('score-badge-text');
    const metaDesc = document.getElementById('score-meta-desc');
    const specIdEl = document.getElementById('rubric-spec-id');

    if (!circle || !numberEl) return;

    if (specId && specIdEl) {
      specIdEl.textContent = `ID: ${specId.slice(0, 8)}...`;
    }

    // Determine status color and text
    let strokeColor = 'var(--status-danger)';
    let badgeClass = 'danger';
    let statusText = 'CRITICAL DEFICIENCY';
    let descText = 'High ambiguity. Autonomous agents will fail or hallucinate structure.';

    if (targetScore >= 85) {
      strokeColor = 'var(--status-success)';
      badgeClass = 'success';
      statusText = 'PRODUCTION READY';
      descText = 'Architecturally complete with strict boundary conditions and acceptance gates.';
    } else if (targetScore >= 50) {
      strokeColor = 'var(--status-warning)';
      badgeClass = 'warning';
      statusText = 'PARTIAL SPECIFICATION';
      descText = 'Core intent detected, but missing persistence or state constraints.';
    }

    // Update Progress Circle Stroke & Offset
    circle.style.stroke = strokeColor;
    const targetOffset = CIRCUMFERENCE - (targetScore / 100) * CIRCUMFERENCE;
    circle.style.strokeDashoffset = targetOffset;

    // Update Badges
    badge.className = `score-status-badge ${badgeClass}`;
    badgeText.textContent = statusText;
    metaDesc.textContent = descText;

    // Animate Number Counter
    if (this.animationTimer) clearInterval(this.animationTimer);

    const start = this.currentScore;
    const duration = 500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const val = Math.round(start + (targetScore - start) * eased);
      numberEl.textContent = val;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.currentScore = targetScore;
      }
    };
    requestAnimationFrame(animate);

    // Update 7 Rubric Breakdown Micro-Bars
    if (breakdown) {
      RUBRIC_DIMENSIONS.forEach(dim => {
        const val = breakdown[dim.key] || 0;
        const pct = Math.min((val / dim.max) * 100, 100);
        const valEl = document.getElementById(`bar-val-${dim.key}`);
        const fillEl = document.getElementById(`bar-fill-${dim.key}`);

        if (valEl) valEl.textContent = `${val}/${dim.max}`;
        if (fillEl) {
          fillEl.style.width = `${pct}%`;
          fillEl.style.background = targetScore >= 85 ? 'var(--status-success)' : targetScore >= 50 ? 'var(--primary-500)' : 'var(--status-danger)';
        }
      });
    }

    // Update Deficiencies List
    const defContainer = document.getElementById('deficiencies-container');
    const defList = document.getElementById('deficiencies-list');
    if (defContainer && defList) {
      if (deficiencies && deficiencies.length > 0 && targetScore < 85) {
        defContainer.classList.remove('hidden');
        defList.innerHTML = deficiencies.map(def => `
          <li style="display: flex; align-items: flex-start; gap: 0.5rem;">
            <span style="color: var(--status-danger);">•</span>
            <span>${def}</span>
          </li>
        `).join('');
      } else {
        defContainer.classList.add('hidden');
      }
    }
  }
}
