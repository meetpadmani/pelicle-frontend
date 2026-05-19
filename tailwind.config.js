/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Primary ─────────────────────────────────── */
        'deep-forest':    '#0d3d2c',
        'warm-ivory':     '#f5f0e8',
        'stone-gray':     '#D9D9D6',
        'midnight-navy':  '#0D1B2A',
        'jet-black':      '#0a1f14',
        'text-dark':      '#0a1f14',
        'text-muted':     '#7a9a82',

        /* ── Neutral ─────────────────────────────────── */
        'light-beige':    '#EDE8DF',
        'cool-taupe':     '#7a9a82',
        'charcoal':       '#0a1f14',

        /* ── Accent ──────────────────────────────────── */
        'olive-green':    '#0d3d2c',
        'sandalwood':     '#c9a55a',
        'gold':           '#c9a55a',
        'dusty-blue':     '#607D8B',
        'sage-green':     '#7a9a82',

        /* ── Backward-compat aliases for existing classes */
        brand: {
          50:  '#f0f4ee',
          100: '#dde8da',
          200: '#b8d1b2',
          300: '#A7B897',   /* sage-green */
          400: '#6B7A4D',   /* olive-green */
          500: '#6B7A4D',   /* olive-green */
          600: '#0F1F17',   /* deep-forest */
          700: '#0d1a13',
          800: '#0a140f',
          900: '#070e0a',
          950: '#030705',
        },
        dark: {
          900: '#111111',
          800: '#0F1F17',
          700: '#2B2B2B',
          600: '#3a3a3a',
          500: '#4a4a4a',
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body:    ['"Outfit"', 'sans-serif'],
        /* backward compat */
        sans:    ['"Outfit"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
        shimmer:      'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        slideDown: { from: { transform: 'translateY(-10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        scaleIn:   { from: { transform: 'scale(0.95)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'soft':  '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card':  '0 1px 3px rgba(0,0,0,0.04), 0 20px 25px -5px rgba(0,0,0,0.06)',
        'brand': '0 4px 14px 0 rgba(107,122,77,0.30)',
      },
    },
  },
  plugins: [],
};
// Trigger reload
