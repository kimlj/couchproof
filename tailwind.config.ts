import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          400: '#94a3b8',
          300: '#cbd5e1',
        },
        cyan: {
          500: '#06b6d4',
          400: '#22d3ee',
        },
        purple: {
          500: '#a855f7',
        },
        pink: {
          500: '#ec4899',
        },
        red: {
          500: '#ef4444',
          400: '#f87171',
        },
      },
      backdropBlur: {
        xl: '24px',
      },
      padding: {
        safe: 'env(safe-area-inset-bottom)',
      },
      margin: {
        safe: 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
};

export default config;
