'use client';

import React from 'react';
import { stripeTheme } from '@/lib/theme/theme';
import { cn } from '@/lib/utils';

interface StripeSectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'dark' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const paddingMap = {
  sm: stripeTheme.spacing[12], // 48px
  md: stripeTheme.spacing[16], // 64px  
  lg: stripeTheme.spacing[24], // 96px
  xl: stripeTheme.spacing[32], // 128px
};

const variantStyles = {
  default: {
    backgroundColor: stripeTheme.colors.neutral.white
  },
  subtle: {
    backgroundColor: stripeTheme.colors.neutral.offWhite
  },
  dark: {
    backgroundColor: stripeTheme.colors.primary.darkBlue
  },
  gradient: {
    background: stripeTheme.gradients.hero
  }
};

export function StripeSection({ 
  children, 
  className,
  variant = 'default',
  padding = 'lg'
}: StripeSectionProps) {
  const paddingValue = paddingMap[padding];
  const styles = variantStyles[variant];
  
  return (
    <section 
      className={cn("relative", className)}
      style={{
        ...styles,
        paddingTop: paddingValue,
        paddingBottom: paddingValue,
      }}
    >
      {children}
    </section>
  );
}

interface StripeContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const containerSizes = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  full: '100%'
};

export function StripeContainer({
  children,
  className,
  size = 'xl'
}: StripeContainerProps) {
  return (
    <div 
      className={cn("mx-auto", className)}
      style={{
        maxWidth: containerSizes[size],
        paddingLeft: stripeTheme.spacing[6],
        paddingRight: stripeTheme.spacing[6],
      }}
    >
      {children}
    </div>
  );
}