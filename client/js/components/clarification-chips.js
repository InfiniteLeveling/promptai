/**
 * PromptArchitect AI — Dynamic Clarification Chips Component
 */

export class ClarificationChips {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onSelectionChange = options.onSelectionChange || (() => {});
    this.onGenerate = options.onGenerate || (() => {});
    this.selectedOptions = {};
  }

  render(chipGroups = []) {
    if (!this.container) return;

    if (!chipGroups || chipGroups.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚡</div>
          <div class="empty-state-text">
            No active prompt analysis. Type an idea above or pick a sample to generate instant clarification chips.
          </div>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="chips-deck-container">
        <div class="chips-deck-header">
          <span class="chips-deck-title">
            <span>🧩</span> Smart Clarification Deck
          </span>
          <span class="chips-timer-badge">⏱️ &lt; 15s recommended</span>
        </div>

        <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 0.5rem;">
          Select architectural options to eliminate ambiguity, or click the non-blocking escape hatch below.
        </p>

        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          ${chipGroups.map(group => `
            <div class="chip-group" data-group-id="${group.id}">
              <div class="chip-group-question">${group.question}</div>
              <div class="chip-options-row">
                ${group.options.map(opt => {
                  const isSelected = this.selectedOptions[group.id] === opt;
                  return `
                    <button class="choice-chip ${isSelected ? 'selected' : ''}"
                      data-group-id="${group.id}"
                      data-option-value="${opt}">
                      <span>${isSelected ? '✓' : '+'}</span>
                      <span>${opt}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="chip-action-footer">
          <button id="btn-bypass-chips" class="btn btn-ghost" title="Generate Master Prompt immediately with safe default constraints">
            ⚡ Generate with current info
          </button>
          <button id="btn-compile-prompt" class="btn btn-primary">
            🚀 Compile Master Prompt (${Object.keys(this.selectedOptions).length} selected)
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Chip Clicks
    const chips = this.container.querySelectorAll('.choice-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const groupId = btn.getAttribute('data-group-id');
        const optValue = btn.getAttribute('data-option-value');

        if (this.selectedOptions[groupId] === optValue) {
          delete this.selectedOptions[groupId];
        } else {
          this.selectedOptions[groupId] = optValue;
        }

        // Re-render chip styling
        const groupChips = this.container.querySelectorAll(`.choice-chip[data-group-id="${groupId}"]`);
        groupChips.forEach(c => {
          const isSelected = this.selectedOptions[groupId] === c.getAttribute('data-option-value');
          c.className = `choice-chip ${isSelected ? 'selected' : ''}`;
          c.querySelector('span:first-child').textContent = isSelected ? '✓' : '+';
        });

        // Update Compile Button counter
        const compileBtn = document.getElementById('btn-compile-prompt');
        if (compileBtn) {
          compileBtn.textContent = `🚀 Compile Master Prompt (${Object.keys(this.selectedOptions).length} selected)`;
        }

        this.onSelectionChange(this.selectedOptions);
      });
    });

    // Non-blocking Escape Hatch
    const bypassBtn = document.getElementById('btn-bypass-chips');
    if (bypassBtn) {
      bypassBtn.addEventListener('click', () => {
        this.onGenerate(this.selectedOptions, true);
      });
    }

    // Compile Button
    const compileBtn = document.getElementById('btn-compile-prompt');
    if (compileBtn) {
      compileBtn.addEventListener('click', () => {
        this.onGenerate(this.selectedOptions, false);
      });
    }
  }

  reset() {
    this.selectedOptions = {};
  }
}
