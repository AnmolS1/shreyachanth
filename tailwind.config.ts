import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // We ship our own reset in globals.css — Tailwind's Preflight would conflict
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // ── Brand palette (mirrors prototype :root tokens 1:1) ──────────────
        ink: 'var(--ink)',
        surface: 'var(--surface)',
        elevated: 'var(--elevated)',
        hairline: 'var(--hairline)',
        // text
        primary: 'var(--text)',
        muted: 'var(--muted)',
        'muted-elevated': 'var(--color-text-muted-elevated)',
        faint: 'var(--faint)',
        // accent — champagne gold is the ONLY warmth
        gold: 'var(--gold)',
        champagne: 'var(--gold)',       // alias used in ARIA/skip-nav patterns
        'gold-soft': 'var(--gold-soft)',
        'gold-line': 'var(--gold-line)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        // alias — token name in CLAUDE.md is --font-grotesk
        grotesk: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      maxWidth: {
        container: 'var(--maxw)',
      },
      transitionTimingFunction: {
        signature: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        standard: '560ms',
        fast: '320ms',
      },
      backgroundImage: {
        'gold-sheen': 'var(--gold-sheen)',
      },
    },
  },
  plugins: [],
} satisfies Config
