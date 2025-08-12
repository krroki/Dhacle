/**
 * Common utilities and theme imports for design system v2
 */

import stripeTheme from '../../../theme.deep.json';
import { css } from 'styled-components';

// Direct theme access
export const theme = stripeTheme;
export const colors = stripeTheme.colors;
export const typography = stripeTheme.typography;
export const spacing = stripeTheme.spacing;
export const effects = stripeTheme.effects;
export const borderRadius = stripeTheme.borderRadius;

// Helper functions
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = colors;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`Color token not found: ${path}`);
      return '#000000';
    }
  }
  
  return value;
};

// Common mixins
export const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${colors.primary.blue.default};
    outline-offset: 2px;
  }
`;

export const hoverScale = css`
  transition: transform 200ms ease;
  &:hover {
    transform: scale(1.02);
  }
`;

export const cardShadow = css`
  box-shadow: ${effects.shadows.card.default};
  transition: box-shadow 200ms ease;
  
  &:hover {
    box-shadow: ${effects.shadows.card.hover};
  }
`;

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const media = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};