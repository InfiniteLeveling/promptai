/**
 * Iconify Vector Badges & Tech Stack Icon Lookup
 * Fetches verified vector SVG icons for architecture diagrams and preview cards.
 */

export const TECH_ICON_MAP = {
  'react': 'logos:react',
  'react 19': 'logos:react',
  'next': 'logos:nextjs-icon',
  'next.js': 'logos:nextjs-icon',
  'vue': 'logos:vue',
  'tailwind': 'logos:tailwindcss-icon',
  'tailwindcss': 'logos:tailwindcss-icon',
  'node': 'logos:nodejs-icon',
  'node.js': 'logos:nodejs-icon',
  'express': 'skill-icons:expressjs-dark',
  'express.js': 'skill-icons:expressjs-dark',
  'fastify': 'simple-icons:fastify',
  'typescript': 'logos:typescript-icon',
  'javascript': 'logos:javascript',
  'postgres': 'logos:postgresql',
  'postgresql': 'logos:postgresql',
  'postgresql 16': 'logos:postgresql',
  'prisma': 'logos:prisma',
  'mongodb': 'logos:mongodb-icon',
  'redis': 'logos:redis',
  'docker': 'logos:docker-icon',
  'kubernetes': 'logos:kubernetes',
  'stripe': 'logos:stripe',
  'graphql': 'logos:graphql',
  'python': 'logos:python',
  'vercel': 'logos:vercel-icon'
};

/**
 * Resolves Iconify SVG URL for a technology name.
 * @param {string} stackName
 * @returns {{ name: string, icon_id: string, svg_url: string }}
 */
export function getTechIcon(stackName) {
  const clean = (stackName || '').trim().toLowerCase();
  const iconId = TECH_ICON_MAP[clean] || 'lucide:code-2';
  const svgUrl = `https://api.iconify.design/${iconId.replace(':', '/')}.svg`;

  return {
    name: stackName,
    icon_id: iconId,
    svg_url: svgUrl
  };
}

/**
 * Resolves a list of tech stack names into icons.
 * @param {Array<string>|string} stacks
 * @returns {Array<object>}
 */
export function resolveTechIcons(stacks) {
  const list = Array.isArray(stacks)
    ? stacks
    : (stacks || '').split(',').map(s => s.trim()).filter(Boolean);

  return list.map(getTechIcon);
}

export default {
  getTechIcon,
  resolveTechIcons,
  TECH_ICON_MAP
};
