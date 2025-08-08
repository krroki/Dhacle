'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { cn } from '@/lib/utils';

interface StripeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated' | 'gradient';
  gradientType?: 'primary' | 'stripe' | 'hero';
}

export function StripeCard({ 
  children, 
  className = '',
  hoverable = true,
  elevation = 'md',
  padding = 'md',
  variant = 'default',
  gradientType = 'primary',
  onClick,
  style,
  ...props
}: StripeCardProps) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Get elevation shadow
  const getElevation = () => {
    switch (elevation) {
      case 'none': return 'none';
      case 'sm': return theme.effects.shadows.card.default;
      case 'md': return theme.effects.shadows.card.default;
      case 'lg': return theme.effects.shadows.button.hover;
      case 'xl': return theme.effects.shadows.large;
      default: return theme.effects.shadows.card.default;
    }
  };
  
  // Get padding values
  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return theme.spacing['4'];
      case 'md': return theme.spacing['6'];
      case 'lg': return theme.spacing['8'];
      default: return theme.spacing['6'];
    }
  };
  
  // Get variant styles
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'bordered':
        return {
          backgroundColor: theme.colors.neutral.white,
          border: `1px solid ${theme.colors.neutral.gray['200']}`,
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.neutral.white,
          boxShadow: theme.effects.shadows.large,
        };
      case 'gradient':
        return {
          background: theme.gradients[gradientType] || theme.gradients.primary,
          color: theme.colors.neutral.white,
        };
      default:
        return {
          backgroundColor: theme.cards.default.backgroundColor,
        };
    }
  };
  
  const cardStyles: React.CSSProperties = {
    ...getVariantStyles(),
    borderRadius: theme.cards.default.borderRadius,
    padding: getPadding(),
    boxShadow: hoverable && isHovered 
      ? theme.cards.hover.boxShadow 
      : getElevation(),
    transform: hoverable && isHovered 
      ? theme.cards.hover.transform 
      : theme.effects.transforms.translateY.default,
    transition: theme.cards.default.transition,
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };
  
  return (
    <div
      className={cn('stripe-card', className)}
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}