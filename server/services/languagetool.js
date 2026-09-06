/**
 * LanguageTool Public API Service
 * Natural language grammar, spelling, and phrasing linter.
 */

const LANGUAGETOOL_API_URL = 'https://api.languagetool.org/v2/check';

/**
 * Checks text for grammar errors and spelling typos.
 * @param {string} text
 * @returns {Promise<{ hasErrors: boolean, matches: Array<object>, suggestedText: string }>}
 */
export async function checkGrammar(text) {
  if (!text || typeof text !== 'string' || text.length < 5) {
    return { hasErrors: false, matches: [], suggestedText: text };
  }

  try {
    const params = new URLSearchParams({
      text: text.slice(0, 1000), // Bounded sample for performance
      language: 'en-US'
    });

    const res = await fetch(LANGUAGETOOL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!res.ok) {
      return { hasErrors: false, matches: [], suggestedText: text };
    }

    const data = await res.json();
    const matches = (data.matches || []).map(m => ({
      message: m.message,
      short_message: m.shortMessage,
      offset: m.offset,
      length: m.length,
      replacements: (m.replacements || []).slice(0, 3).map(r => r.value),
      rule: m.rule?.id
    }));

    return {
      hasErrors: matches.length > 0,
      matches,
      suggestedText: text
    };
  } catch (err) {
    console.warn(`[LanguageTool] Check failed (${err.message}). Continuing with raw text.`);
    return { hasErrors: false, matches: [], suggestedText: text };
  }
}

export default {
  checkGrammar
};
