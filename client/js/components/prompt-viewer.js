/**
 * PromptArchitect AI — Two-Prompt Split Stage & Deliverables Viewer
 */

import { copyToClipboard } from '../utils/clipboard.js';

export class PromptViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentData = null;
    this.renderEmpty();
  }

  renderEmpty() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📄</div>
        <div class="empty-state-text">
          Master Prompt Deliverables will compile here once you complete the clarification step or click the escape hatch.
        </div>
      </div>
    `;
  }

  render(deliverables, targetAgent = 'antigravity', finalScore = 94) {
    if (!this.container) return;

    this.currentData = { deliverables, targetAgent, finalScore };

    // Format based on target agent
    if (targetAgent === 'antigravity') {
      const promptA = deliverables?.prompt_a || '<!-- Generating Prompt A... -->';
      const promptB = deliverables?.prompt_b || '<!-- Generating Prompt B... -->';

      const tokensA = Math.round(promptA.length / 4);
      const tokensB = Math.round(promptB.length / 4);

      this.container.innerHTML = `
        <div class="card-header" style="margin-bottom: var(--space-4);">
          <div>
            <span class="card-title">
              🚀 Compiled Two-Prompt Architecture Package
            </span>
            <span style="font-size: var(--text-xs); color: var(--text-secondary);">
              Target: <strong style="color: var(--primary-400);">Google Antigravity</strong> • Verified Score: <strong style="color: var(--status-success);">${finalScore}/100</strong>
            </span>
          </div>
          <button id="btn-copy-all" class="btn btn-primary" style="padding: 0.45rem 1rem;">
            📋 Copy Full Package
          </button>
        </div>

        <div class="two-prompt-stage">
          <!-- Pane A: Architectural Spec -->
          <div class="prompt-pane pane-spec">
            <div class="pane-header">
              <div class="pane-title">
                <span class="badge-tag spec">PROMPT A</span>
                <span>Architectural Specification</span>
              </div>
              <div class="pane-actions">
                <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);">
                  ~${tokensA} tokens
                </span>
                <button id="btn-copy-pane-a" class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
                  Copy
                </button>
              </div>
            </div>
            <pre class="code-viewer"><code id="code-pane-a">${this.escapeHtml(promptA)}</code></pre>
          </div>

          <!-- Pane B: Implementation Prompt -->
          <div class="prompt-pane pane-impl">
            <div class="pane-header">
              <div class="pane-title">
                <span class="badge-tag impl">PROMPT B</span>
                <span>Agent Implementation Blueprint</span>
              </div>
              <div class="pane-actions">
                <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);">
                  ~${tokensB} tokens
                </span>
                <button id="btn-copy-pane-b" class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
                  Copy
                </button>
              </div>
            </div>
            <pre class="code-viewer"><code id="code-pane-b">${this.escapeHtml(promptB)}</code></pre>
          </div>
        </div>
      `;

      this.attachAntigravityListeners(promptA, promptB);
    } else {
      // Single Target Output (Cursor, Claude Code, Midjourney, etc.)
      const content = deliverables?.cursorrules || deliverables?.prompt_b || deliverables?.prompt_a || JSON.stringify(deliverables, null, 2);
      const tokens = Math.round(content.length / 4);

      this.container.innerHTML = `
        <div class="card-header" style="margin-bottom: var(--space-4);">
          <div>
            <span class="card-title">
              🚀 Compiled Target Deliverable: ${targetAgent.toUpperCase()}
            </span>
            <span style="font-size: var(--text-xs); color: var(--text-secondary);">
              Verified Score: <strong style="color: var(--status-success);">${finalScore}/100</strong>
            </span>
          </div>
          <button id="btn-copy-single" class="btn btn-primary" style="padding: 0.45rem 1rem;">
            📋 Copy Deliverable
          </button>
        </div>

        <div class="prompt-pane pane-impl" style="width: 100%;">
          <div class="pane-header">
            <div class="pane-title">
              <span class="badge-tag impl">${targetAgent.toUpperCase()}</span>
              <span>Production Artifact</span>
            </div>
            <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);">
              ~${tokens} tokens
            </span>
          </div>
          <pre class="code-viewer"><code>${this.escapeHtml(content)}</code></pre>
        </div>
      `;

      const singleCopyBtn = document.getElementById('btn-copy-single');
      if (singleCopyBtn) {
        singleCopyBtn.addEventListener('click', () => {
          copyToClipboard(content, `Copied ${targetAgent} deliverable to clipboard!`);
        });
      }
    }
  }

  attachAntigravityListeners(promptA, promptB) {
    const copyABtn = document.getElementById('btn-copy-pane-a');
    if (copyABtn) {
      copyABtn.addEventListener('click', () => {
        copyToClipboard(promptA, 'Copied Prompt A (Architectural Spec) to clipboard!');
      });
    }

    const copyBBtn = document.getElementById('btn-copy-pane-b');
    if (copyBBtn) {
      copyBBtn.addEventListener('click', () => {
        copyToClipboard(promptB, 'Copied Prompt B (Agent Implementation) to clipboard!');
      });
    }

    const copyAllBtn = document.getElementById('btn-copy-all');
    if (copyAllBtn) {
      copyAllBtn.addEventListener('click', () => {
        const full = `${promptA}\n\n========================================\n\n${promptB}`;
        copyToClipboard(full, 'Copied complete Two-Prompt Package to clipboard!');
      });
    }
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
