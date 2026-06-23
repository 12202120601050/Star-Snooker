import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Star Snooker Academy brand: red balls, gold cue, felt green, on black.
        gold: {
          DEFAULT: '#f2b01e',
          light: '#ffd75e',
          deep: '#c98a12',
        },
        red: {
          DEFAULT: '#e01f26',
          light: '#ff4d4f',
          deep: '#9e0f14',
        },
        felt: {
          DEFAULT: '#1f8a4c',
          deep: '#0f5a30',
        },
        ink: {
          DEFAULT: '#0a0a0b',
          2: '#111114',
          3: '#1a1a1f',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Oswald', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      maxWidth: {
        content: '1120px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        shimmer: 'shimmer 5s linear infinite',
        glow: 'glowPulse 2.6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(18px)' },
          '50%': { opacity: '0.85', filter: 'blur(26px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
