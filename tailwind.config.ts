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
        // Backgrounds
        background: '#111827', // Dark charcoal
        'bg-secondary': '#1E293B', // Deep blue
        
        // Text
        primary: '#E2E8F0', // Off-white
        secondary: '#94A3B8', // Muted gray
        
        // Accent Colors
        accent: {
          DEFAULT: '#EC4899', // Magenta (CTA buttons)
          hover: '#DB2777', // Darker magenta for hover
        },
        green: '#34D399', // Green for active states
        
        // UI Elements
        border: 'rgba(255, 255, 255, 0.1)',
        'card-bg': 'rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(90deg, #4F46E5 0%, #EC4899 100%)',
        'gradient-radial': 'radial-gradient(circle at top left, rgba(79, 70, 229, 0.2), transparent 40%)',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, #4F46E5 0deg, #EC4899 120deg, #34D399 240deg, #4F46E5 360deg)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        slideUp: {
          '0%': {
            transform: 'translateY(100px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
      },
      fontFamily: {
        sans: ['General Sans', 'SUIT', 'Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;