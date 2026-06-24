import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          light: '#ffe7a0',
          deep: '#a07810',
          bright: '#f2b01e',
        },
        emerald: {
          DEFAULT: '#0d5c2e',
          light: '#1a8a4c',
          deep: '#052f16',
          mid: '#0f6e37',
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
          DEFAULT: '#050507',
          2: '#0a0a0d',
          3: '#111117',
          4: '#1a1a22',
          5: '#222230',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Oswald', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      maxWidth: {
        content: '1180px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite 2s',
        marquee: 'marquee 30s linear infinite',
        shimmer: 'shimmer 4s linear infinite',
        glow: 'glowPulse 2.6s ease-in-out infinite',
        'glow-gold': 'glowGold 3s ease-in-out infinite',
        'spin-slow': 'spin 25s linear infinite',
        'spin-reverse': 'spinReverse 20s linear infinite',
        'border-spin': 'borderSpin 4s linear infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'spotlight-pan': 'spotlightPan 8s ease-in-out infinite',
        'scale-pulse': 'scalePulse 4s ease-in-out infinite',
        'particle-drift': 'particleDrift 15s ease-in-out infinite',
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
          '0%, 100%': { opacity: '0.4', filter: 'blur(18px)' },
          '50%': { opacity: '0.9', filter: 'blur(30px)' },
        },
        glowGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.25), 0 0 60px rgba(212,175,55,0.08)' },
          '50%': { boxShadow: '0 0 50px rgba(212,175,55,0.5), 0 0 120px rgba(212,175,55,0.18)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        spotlightPan: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        scalePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        spinReverse: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        borderSpin: {
          from: { '--border-angle': '0deg' } as Record<string, string>,
          to: { '--border-angle': '360deg' } as Record<string, string>,
        },
        particleDrift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translate(var(--tx, 100px), var(--ty, -200px)) rotate(360deg)', opacity: '0' },
        },
      },
      backgroundImage: {
        'felt-texture': "radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)",
        'gold-gradient': 'linear-gradient(135deg, #a07810 0%, #d4af37 40%, #ffe7a0 60%, #d4af37 80%, #a07810 100%)',
        'luxury-gradient': 'linear-gradient(135deg, #050507 0%, #0a0a0d 50%, #111117 100%)',
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,92,46,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
