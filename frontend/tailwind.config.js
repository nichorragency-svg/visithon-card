/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vt: {
          bg: '#05070A',
          surface: '#12141C',
          accent: '#5D3FD3',
          muted: '#94a3b8',
        },
      },
      keyframes: {
        vtIconBling: {
          '0%, 100%': {
            filter: 'brightness(1) drop-shadow(0 0 2px currentColor)',
            transform: 'scale(1)',
          },
          '50%': {
            filter: 'brightness(1.35) drop-shadow(0 0 14px currentColor)',
            transform: 'scale(1.07)',
          },
        },
        vtSearchGlow: {
          '0%, 100%': { color: 'rgb(244 114 182)', filter: 'drop-shadow(0 0 4px rgb(244 114 182))' },
          '33%': { color: 'rgb(167 139 250)', filter: 'drop-shadow(0 0 6px rgb(167 139 250))' },
          '66%': { color: 'rgb(103 232 249)', filter: 'drop-shadow(0 0 6px rgb(103 232 249))' },
        },
        /** Public card — icons cycle neon multi-color “blink”. */
        vtCardIconNeon: {
          '0%, 100%': {
            color: 'rgb(56 189 248)',
            filter: 'drop-shadow(0 0 6px rgb(56 189 248)) drop-shadow(0 0 14px rgb(168 85 247))',
          },
          '25%': {
            color: 'rgb(244 114 182)',
            filter: 'drop-shadow(0 0 8px rgb(244 114 182)) drop-shadow(0 0 16px rgb(34 211 238))',
          },
          '50%': {
            color: 'rgb(192 132 252)',
            filter: 'drop-shadow(0 0 8px rgb(192 132 252)) drop-shadow(0 0 14px rgb(52 211 153))',
          },
          '75%': {
            color: 'rgb(52 211 153)',
            filter: 'drop-shadow(0 0 8px rgb(52 211 153)) drop-shadow(0 0 16px rgb(251 191 36))',
          },
        },
        vtCardBorderShimmer: {
          '0%, 100%': { opacity: '0.45', borderColor: 'rgba(56, 189, 248, 0.35)' },
          '33%': { opacity: '0.75', borderColor: 'rgba(192, 132, 252, 0.45)' },
          '66%': { opacity: '0.55', borderColor: 'rgba(52, 211, 153, 0.35)' },
        },
        vtCardTitleShine: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'vt-icon-bling': 'vtIconBling 2.2s ease-in-out infinite',
        'vt-search-glow': 'vtSearchGlow 3s ease-in-out infinite',
        'vt-card-icon-neon': 'vtCardIconNeon 2.8s ease-in-out infinite',
        'vt-card-border-shimmer': 'vtCardBorderShimmer 4s ease-in-out infinite',
        'vt-card-title-shine': 'vtCardTitleShine 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
