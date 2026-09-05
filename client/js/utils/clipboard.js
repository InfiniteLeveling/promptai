/**
 * PromptArchitect AI — Clipboard & Toast Utility
 */

/**
 * Copies text to the user's clipboard and displays a visual toast.
 * @param {string} text - The raw text to copy
 * @param {string} [successMessage="Copied to clipboard!"] - Toast confirmation message
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
  if (!text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for non-secure contexts or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }

    showToast(successMessage);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    showToast('Failed to copy to clipboard', 'error');
    return false;
  }
}

/**
 * Displays a non-intrusive floating toast notification.
 * @param {string} message - Message to display
 * @param {'success'|'error'|'info'} [type='success'] - Toast type
 */
export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✓';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.style.transition = 'all 200ms ease-out';
    setTimeout(() => toast.remove(), 200);
  }, 2400);
}
