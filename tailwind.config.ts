import type { Config } from 'tailwindcss';
import stripeTheme from './theme.deep.json';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors from Stripe
        'stripe-blue': stripeTheme.colors.primary.blue.default,
        'stripe-blue-hover': stripeTheme.colors.primary.blue.hover,
        'stripe-blue-active': stripeTheme.colors.primary.blue.active,
        'stripe-darkBlue': stripeTheme.colors.primary.darkBlue,
        'stripe-lightBlue': stripeTheme.colors.primary.lightBlue,
        
        // Neutral palette
        white: stripeTheme.colors.neutral.white,
        offWhite: stripeTheme.colors.neutral.offWhite,
        gray: stripeTheme.colors.neutral.gray,
        
        // Text colors
        'text-primary': stripeTheme.colors.text.primary.default,
        'text-primary-dark': stripeTheme.colors.text.primary.dark,
        'text-primary-light': stripeTheme.colors.text.primary.light,
        'text-inverse': stripeTheme.colors.text.inverse,
        
        // Button colors
        button: {
          primary: {
            bg: {
              DEFAULT: stripeTheme.colors.button.primary.background.default,
              hover: stripeTheme.colors.button.primary.background.hover,
            },
            text: {
              DEFAULT: stripeTheme.colors.button.primary.text.default,
              hover: stripeTheme.colors.button.primary.text.hover,
            },
          },
          secondary: {
            bg: {
              DEFAULT: stripeTheme.colors.button.secondary.background.default,
              hover: stripeTheme.colors.button.secondary.background.hover,
            },
            text: {
              DEFAULT: stripeTheme.colors.button.secondary.text.default,
              hover: stripeTheme.colors.button.secondary.text.hover,
            },
          },
        },
      },
      fontFamily: {
        sans: stripeTheme.typography.fontFamily.base.split(',').map(f => f.trim()),
        mono: stripeTheme.typography.fontFamily.mono.split(',').map(f => f.trim()),
      },
      fontSize: stripeTheme.typography.fontSize,
      fontWeight: stripeTheme.typography.fontWeight,
      lineHeight: stripeTheme.typography.lineHeight,
      letterSpacing: stripeTheme.typography.letterSpacing,
      spacing: stripeTheme.spacing,
      borderRadius: stripeTheme.borderRadius,
      boxShadow: {
        ...stripeTheme.effects.shadows,
        'card-default': stripeTheme.effects.shadows.card.default,
        'card-hover': stripeTheme.effects.shadows.card.hover,
        'button-default': stripeTheme.effects.shadows.button.default,
        'button-hover': stripeTheme.effects.shadows.button.hover,
      },
      backgroundImage: {
        'gradient-hero': stripeTheme.gradients.hero,
        'gradient-primary': stripeTheme.gradients.primary,
        'gradient-stripe': stripeTheme.gradients.stripe,
      },
      transitionDuration: stripeTheme.effects.transitions.duration,
      transitionTimingFunction: stripeTheme.effects.transitions.timing,
      opacity: stripeTheme.effects.opacity,
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-hover': 'scaleHover 0.2s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideUp: {
          '0%': {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        scaleHover: {
          '0%': {
            transform: stripeTheme.effects.transforms.scale.default,
          },
          '100%': {
            transform: stripeTheme.effects.transforms.scale.hover,
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
    },
  },
  plugins: [],
};

export default config;