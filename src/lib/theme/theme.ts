import themeTokens from '../../../theme.deep.json';

// Type-safe theme object
export const stripeTheme = themeTokens;

// Export individual theme sections for easy access
export const colors = themeTokens.colors;
export const typography = themeTokens.typography;
export const spacing = themeTokens.spacing;
export const effects = themeTokens.effects;
export const borderRadius = themeTokens.borderRadius;
export const buttons = themeTokens.buttons;
export const cards = themeTokens.cards;
export const gradients = themeTokens.gradients;

// CSS Variables mapping for runtime theming
export const getCSSVariables = () => {
  return {
    // Primary Colors
    '--stripe-blue-default': colors.primary.blue.default,
    '--stripe-blue-hover': colors.primary.blue.hover,
    '--stripe-blue-active': colors.primary.blue.active,
    '--stripe-dark-blue': colors.primary.darkBlue,
    '--stripe-light-blue': colors.primary.lightBlue,
    
    // Neutral Colors
    '--stripe-white': colors.neutral.white,
    '--stripe-off-white': colors.neutral.offWhite,
    '--stripe-gray-50': colors.neutral.gray['50'],
    '--stripe-gray-100': colors.neutral.gray['100'],
    '--stripe-gray-200': colors.neutral.gray['200'],
    '--stripe-gray-300': colors.neutral.gray['300'],
    '--stripe-gray-400': colors.neutral.gray['400'],
    '--stripe-gray-500': colors.neutral.gray['500'],
    '--stripe-gray-600': colors.neutral.gray['600'],
    '--stripe-gray-700': colors.neutral.gray['700'],
    '--stripe-gray-800': colors.neutral.gray['800'],
    '--stripe-gray-900': colors.neutral.gray['900'],
    
    // Text Colors
    '--stripe-text-primary': colors.text.primary.default,
    '--stripe-text-dark': colors.text.primary.dark,
    '--stripe-text-light': colors.text.primary.light,
    '--stripe-text-inverse': colors.text.inverse,
    
    // Typography
    '--stripe-font-base': typography.fontFamily.base,
    '--stripe-font-mono': typography.fontFamily.mono,
    
    // Shadows
    '--stripe-shadow-dropdown': effects.shadows.dropdown,
    '--stripe-shadow-card': effects.shadows.card.default,
    '--stripe-shadow-card-hover': effects.shadows.card.hover,
    '--stripe-shadow-button': effects.shadows.button.default,
    '--stripe-shadow-button-hover': effects.shadows.button.hover,
    '--stripe-shadow-large': effects.shadows.large,
    
    // Transitions
    '--stripe-transition-fast': `${effects.transitions.duration.fast} ${effects.transitions.timing.easeInOut}`,
    '--stripe-transition-default': `${effects.transitions.duration.default} ${effects.transitions.timing.easeInOut}`,
    '--stripe-transition-slow': `${effects.transitions.duration.slow} ${effects.transitions.timing.easeInOut}`,
    
    // Border Radius
    '--stripe-radius-sm': borderRadius.sm,
    '--stripe-radius-default': borderRadius.default,
    '--stripe-radius-md': borderRadius.md,
    '--stripe-radius-lg': borderRadius.lg,
    '--stripe-radius-xl': borderRadius.xl,
    '--stripe-radius-full': borderRadius.full,
  };
};

export default stripeTheme;