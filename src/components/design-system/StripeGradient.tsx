'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { cn } from '@/lib/utils';

interface StripeGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'stripe' | 'hero' | 'custom';
  direction?: 'to-t' | 'to-b' | 'to-l' | 'to-r' | 'to-tl' | 'to-tr' | 'to-bl' | 'to-br';
  intensity?: 'light' | 'medium' | 'strong';
  animated?: boolean;
  customColors?: string[];
  blur?: boolean;
  overlay?: boolean;
}

export function StripeGradient({
  children,
  variant = 'primary',
  direction = 'to-br',
  intensity = 'medium',
  animated = false,
  customColors,
  blur = false,
  overlay = false,
  className = '',
  style,
  ...props
}: StripeGradientProps) {
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  // Handle mouse movement for animated gradients
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!animated) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Get gradient based on variant
  const getGradient = () => {
    if (variant === 'custom' && customColors) {
      return `linear-gradient(${getDirection()}, ${customColors.join(', ')})`;
    }
    
    switch (variant) {
      case 'stripe':
        return theme.gradients.stripe;
      case 'hero':
        return theme.gradients.hero;
      case 'primary':
      default:
        return theme.gradients.primary;
    }
  };

  // Convert direction to CSS gradient direction
  const getDirection = () => {
    const directions: Record<string, string> = {
      'to-t': 'to top',
      'to-b': 'to bottom',
      'to-l': 'to left',
      'to-r': 'to right',
      'to-tl': 'to top left',
      'to-tr': 'to top right',
      'to-bl': 'to bottom left',
      'to-br': 'to bottom right',
    };
    return directions[direction] || 'to bottom right';
  };

  // Get intensity opacity
  const getIntensity = () => {
    switch (intensity) {
      case 'light': return theme.effects.opacity['30'];
      case 'strong': return theme.effects.opacity['90'];
      case 'medium':
      default: return theme.effects.opacity['60'];
    }
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  const gradientStyles: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: getGradient(),
    opacity: getIntensity(),
    transition: animated ? `all ${theme.effects.transitions.duration.slow} ${theme.effects.transitions.timing.easeInOut}` : 'none',
    filter: blur ? 'blur(40px)' : 'none',
    transform: animated ? `translate(${mousePosition.x - 50}%, ${mousePosition.y - 50}%) scale(1.5)` : 'none',
    pointerEvents: 'none',
  };

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, transparent 0%, ${theme.colors.primary.darkBlue}20 50%, ${theme.colors.primary.darkBlue}40 100%)`,
    opacity: animated ? 1 : 0,
    transition: `opacity ${theme.effects.transitions.duration.default} ${theme.effects.transitions.timing.easeInOut}`,
    pointerEvents: 'none',
  };

  return (
    <div
      className={cn('stripe-gradient', className)}
      style={containerStyles}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <div className="stripe-gradient__background" style={gradientStyles} />
      {overlay && animated && (
        <div className="stripe-gradient__overlay" style={overlayStyles} />
      )}
      {children && (
        <div className="stripe-gradient__content" style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      )}
    </div>
  );
}