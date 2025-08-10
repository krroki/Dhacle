// Spacing token system from theme.deep.json
import theme from '../../../theme.deep.json';

export const spacing = theme.spacing as {
  [key: string]: string;
};

// Convenience exports
export const space = spacing;

// Common spacing values
export const spacingScale = {
  xs: spacing['1'],    // 4px
  sm: spacing['2'],    // 8px
  md: spacing['4'],    // 16px
  lg: spacing['6'],    // 24px
  xl: spacing['8'],    // 32px
  '2xl': spacing['12'], // 48px
  '3xl': spacing['16'], // 64px
} as const;

export default spacing;