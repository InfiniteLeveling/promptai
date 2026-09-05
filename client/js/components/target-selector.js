/**
 * PromptArchitect AI — Target AI Agent Selector Component
 */

const TARGET_AGENTS = [
  { id: 'antigravity', label: 'Google Antigravity', badge: 'Two-Prompt' },
  { id: 'cursor', label: 'Cursor', badge: '.cursorrules' },
  { id: 'claude_code', label: 'Claude Code', badge: 'XML Prompt' },
  { id: 'v0', label: 'v0', badge: 'UI Blueprint' },
  { id: 'midjourney', label: 'Midjourney', badge: 'v6 Flags' }
];

export class TargetSelector {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.selectedTarget = options.initialTarget || 'antigravity';
    this.onTargetChange = options.onTargetChange || (() => {});
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="target-selector" role="radiogroup" aria-label="Target AI Agent">
        ${TARGET_AGENTS.map(agent => {
          const isActive = agent.id === this.selectedTarget;
          return `
            <button class="target-pill ${isActive ? 'active' : ''}"
              data-target-id="${agent.id}"
              role="radio"
              aria-checked="${isActive}"
              title="Target: ${agent.label}">
              <span>${agent.label}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const pills = this.container.querySelectorAll('.target-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-target-id');
        this.setTarget(targetId);
      });
    });
  }

  setTarget(targetId) {
    this.selectedTarget = targetId;
    const pills = this.container.querySelectorAll('.target-pill');
    pills.forEach(p => {
      const isActive = p.getAttribute('data-target-id') === targetId;
      p.className = `target-pill ${isActive ? 'active' : ''}`;
      p.setAttribute('aria-checked', isActive);
    });

    this.onTargetChange(targetId);
  }
}
