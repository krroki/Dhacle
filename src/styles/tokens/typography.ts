/**
 * Typography tokens extracted from Stripe design system and hybrid implementation plan
 * @source docs/analysis/stripe-design-system.json
 * @source docs/analysis/hybrid-implementation-plan.json
 */

export const typography = {
  // Font families with Korean font support
  fontFamily: {
    primary: "sohne-var, 'Helvetica Neue', Arial, sans-serif",
    heading: "'Sohne-var', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Sohne-var', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'SF Mono', 'D2Coding', Monaco, Consolas, monospace",
  },
  
  // Font sizes from Stripe with responsive clamp values
  fontSize: {
    // Display sizes
    display: '94px',
    hero: 'clamp(48px, 8vw, 94px)',
    
    // Heading sizes
    h1: 'clamp(32px, 5vw, 56px)',
    h2: 'clamp(24px, 4vw, 32px)',
    h3: '24px',
    h4: '20px',
    h5: '18px',
    
    // Body sizes
    body: '16px',
    bodyLarge: '18px',
    bodySmall: '14px',
    
    // Utility sizes
    small: '14px',
    xs: '12px',
    tiny: '11px',
  },
  
  // Font weights from Stripe
  fontWeight: {
    bold: '700',
    semibold: '600',
    medium: '500',
    regular: '425',
    normal: '400',
    light: '300',
    thin: '200',
  },
  
  // Line heights for different contexts
  lineHeight: {
    none: '1',
    tight: '1.2',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },
  
  // Letter spacing for headings and body
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Text transforms
  textTransform: {
    none: 'none',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
  },
  
  // Text decoration
  textDecoration: {
    none: 'none',
    underline: 'underline',
    overline: 'overline',
    lineThrough: 'line-through',
  },
} as const;

// Typography style presets
export const typographyStyles = {
  hero: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.hero,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h1: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
  },
  h4: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
  },
  body: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
  },
  bodyLarge: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.relaxed,
  },
  bodySmall: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
  },
  caption: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  code: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
} as const;

// Type exports
export type TypographyToken = typeof typography;
export type TypographyStyle = keyof typeof typographyStyles;