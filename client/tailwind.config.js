/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          void: '#050816',
          dark: '#0A1024',
          surface: '#101A32',
          card: '#14203E',
          cardHover: '#1B2B52',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(34, 211, 238, 0.3)',
          cyan: '#22D3EE',
          violet: '#8B5CF6',
          magenta: '#F43F5E',
          emerald: '#10B981',
          gold: '#F59E0B',
          muted: '#94A3B8',
          text: '#F8FAFC',
        },
      },
      fontFamily: {
        space: ['"Space Grotesk"', 'Sora', 'sans-serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.35)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-magenta': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'hud': 'inset 0 0 15px rgba(34, 211, 238, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'orbital': 'orbital 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        orbital: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
