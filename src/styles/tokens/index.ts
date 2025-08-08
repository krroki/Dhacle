/**
 * Design Token System
 * 
 * This is the single source of truth for all design tokens in the application.
 * Based on Stripe's design system with TripAdvisor's structural patterns.
 * 
 * @source docs/analysis/stripe-design-system.json
 * @source docs/analysis/hybrid-implementation-plan.json
 */

// Export all token modules
export * from './colors';
export * from './typography';
export * from './effects';

// Re-export main token objects for convenience
export { colors } from './colors';
export { typography, typographyStyles } from './typography';
export { effects } from './effects';

// Import all tokens for unified theme object
import { colors } from './colors';
import { typography, typographyStyles } from './typography';
import { effects } from './effects';

/**
 * Unified theme object containing all design tokens
 * Use this for theme providers and styled-components
 */
export const theme = {
  colors,
  typography,
  typographyStyles,
  effects,
} as const;

/**
 * Theme type for TypeScript support
 */
export type Theme = typeof theme;

/**
 * Utility function to get nested theme values
 * @example getThemeValue('colors.primary.main') => '#635BFF'
 */
export const getThemeValue = (path: string): any => {
  const keys = path.split('.');
  let value: any = theme;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Theme token not found: ${path}`);
      return undefined;
    }
  }
  
  return value;
};

/**
 * CSS custom properties generator
 * Converts theme tokens to CSS variables
 */
export const generateCSSVariables = (): string => {
  const cssVars: string[] = [];
  
  // Generate color variables
  Object.entries(colors).forEach(([category, values]) => {
    if (typeof values === 'object' && !Array.isArray(values)) {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          cssVars.push(`--color-${category}-${key}: ${value};`);
        } else if (typeof value === 'object') {
          // Handle nested color objects
          Object.entries(value as any).forEach(([subKey, subValue]) => {
            cssVars.push(`--color-${category}-${key}-${subKey}: ${subValue};`);
          });
        }
      });
    }
  });
  
  // Generate spacing variables
  Object.entries(effects.spacing).forEach(([key, value]) => {
    cssVars.push(`--spacing-${key}: ${value};`);
  });
  
  // Generate border radius variables
  Object.entries(effects.borderRadius).forEach(([key, value]) => {
    cssVars.push(`--radius-${key}: ${value};`);
  });
  
  // Generate animation duration variables
  Object.entries(effects.animation.duration).forEach(([key, value]) => {
    cssVars.push(`--duration-${key}: ${value};`);
  });
  
  return `:root {\n  ${cssVars.join('\n  ')}\n}`;
};

// Export default theme for convenience
export default theme;