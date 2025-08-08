'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { cn } from '@/lib/utils';

interface StripeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function StripeButton({ 
  variant = 'primary', 
  size = 'md',
  children, 
  onClick,
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}: StripeButtonProps) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  
  const sizeStyles = {
    sm: { 
      padding: `${theme.spacing['2']} ${theme.spacing['3']}`,
      fontSize: theme.typography.fontSize.sm,
      borderRadius: theme.borderRadius.sm,
    },
    md: { 
      padding: `${theme.spacing['3']} ${theme.spacing['4']}`,
      fontSize: theme.typography.fontSize.base,
      borderRadius: theme.borderRadius.default,
    },
    lg: { 
      padding: `${theme.spacing['4']} ${theme.spacing['6']}`,
      fontSize: theme.typography.fontSize.lg,
      borderRadius: theme.borderRadius.md,
    }
  };
  
  const baseStyles: React.CSSProperties = {
    fontFamily: theme.typography.fontFamily.base,
    fontWeight: theme.typography.fontWeight.medium,
    transition: `all ${theme.effects.transitions.duration.default} ${theme.effects.transitions.timing.easeInOut}`,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? theme.effects.opacity['50'] : theme.effects.opacity['100'],
    border: 'none',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing['2'],
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    ...sizeStyles[size]
  };
  
  const variantStyles = {
    primary: {
      backgroundColor: isHovered && !disabled && !loading
        ? theme.buttons.primary.hover.backgroundColor 
        : theme.buttons.primary.default.backgroundColor,
      color: theme.buttons.primary.default.color,
      boxShadow: isHovered && !disabled && !loading
        ? theme.buttons.primary.hover.boxShadow
        : theme.buttons.primary.default.boxShadow || 'none',
      transform: isHovered && !disabled && !loading
        ? theme.buttons.primary.hover.transform
        : 'none',
    },
    secondary: {
      backgroundColor: isHovered && !disabled && !loading
        ? theme.buttons.secondary.hover.backgroundColor
        : theme.buttons.secondary.default.backgroundColor,
      color: theme.buttons.secondary.default.color,
      border: theme.buttons.secondary.default.border,
      borderColor: isHovered && !disabled && !loading
        ? theme.buttons.secondary.hover.borderColor
        : undefined,
    },
    ghost: {
      backgroundColor: isHovered && !disabled && !loading
        ? `${theme.colors.neutral.gray['100']}`
        : 'transparent',
      color: theme.colors.text.primary.default,
      border: 'none',
    },
    gradient: {
      background: theme.gradients.primary,
      color: theme.colors.neutral.white,
      border: 'none',
      transform: isHovered && !disabled && !loading
        ? theme.effects.transforms.translateY.hover
        : theme.effects.transforms.translateY.default,
      boxShadow: isHovered && !disabled && !loading
        ? theme.effects.shadows.button.hover
        : 'none',
    }
  };
  
  return (
    <button
      className={cn('stripe-button', className)}
      style={{
        ...baseStyles,
        ...(variantStyles[variant as keyof typeof variantStyles] || variantStyles.primary)
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            border: `2px solid ${variant === 'primary' ? theme.colors.primary.darkBlue : theme.colors.neutral.white}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      <span style={{ opacity: loading ? 0 : 1, display: 'flex', alignItems: 'center', gap: theme.spacing['2'] }}>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </span>
    </button>
  );
}