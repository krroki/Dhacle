'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';

type VariantType = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'code';
type ColorType = 'primary' | 'dark' | 'light' | 'muted' | 'inverse';

interface StripeTypographyProps {
  variant?: VariantType;
  color?: ColorType;
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

export function StripeTypography({ 
  variant = 'body',
  color = 'primary',
  children,
  className = '',
  as,
  style: customStyle
}: StripeTypographyProps) {
  const { theme } = useTheme();
  
  const variantStyles: Record<VariantType, React.CSSProperties> = {
    h1: {
      fontSize: theme.typography.fontSize['5xl'],
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.tight,
      letterSpacing: theme.typography.letterSpacing.tight,
    },
    h2: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.tight,
      letterSpacing: theme.typography.letterSpacing.tight,
    },
    h3: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: theme.typography.lineHeight.normal,
    },
    h4: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: theme.typography.lineHeight.normal,
    },
    body: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.relaxed,
    },
    caption: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.normal,
    },
    code: {
      fontFamily: theme.typography.fontFamily.mono,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.normal,
    }
  };
  
  const colorMap = {
    primary: theme.colors.text.primary.default,
    dark: theme.colors.text.primary.dark,
    light: theme.colors.text.primary.light,
    muted: theme.colors.neutral.gray['500'],
    inverse: theme.colors.text.inverse,
  };
  
  const defaultTags: Record<VariantType, keyof React.JSX.IntrinsicElements> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    caption: 'span',
    code: 'code',
  };
  
  const Component = as || defaultTags[variant];
  
  const styles: React.CSSProperties = {
    ...variantStyles[variant],
    color: colorMap[color],
    fontFamily: variant === 'code' 
      ? theme.typography.fontFamily.mono 
      : theme.typography.fontFamily.base,
    margin: 0,
    ...customStyle, // Apply custom styles last to allow overrides
  };
  
  return (
    <Component className={className} style={styles}>
      {children}
    </Component>
  );
}