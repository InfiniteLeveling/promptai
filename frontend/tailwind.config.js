/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#10131a",
        "surface-container-lowest": "#0b0e14",
        "surface-container-low": "#191c22",
        "surface-container": "#1d2026",
        "surface-container-high": "#272a31",
        "surface-container-highest": "#32353c",
        "on-surface": "#e0e2eb",
        "on-surface-variant": "#c7c4d7",
        "outline": "#908fa0",
        "outline-variant": "#464554",
        "primary": "#c0c1ff",
        "primary-container": "#8083ff",
        "secondary": "#d0bcff",
        "secondary-container": "#571bc1",
        "tertiary": "#4cd7f6",
        "tertiary-container": "#009eb9",
        "error": "#ffb4ab",
      },
      fontFamily: {
        "display-hero": ["Outfit", "sans-serif"],
        "headline-lg": ["Outfit", "sans-serif"],
        "headline-md": ["Outfit", "sans-serif"],
        "headline-sm": ["Outfit", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "code-sm": ["JetBrains Mono", "monospace"],
        "code-md": ["JetBrains Mono", "monospace"],
        "label-caps": ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-primary": "0 0 35px -6px rgba(128, 131, 255, 0.35)",
        "glow-cyan": "0 0 25px -4px rgba(76, 215, 246, 0.4)",
      }
    },
  },
  plugins: [],
}
