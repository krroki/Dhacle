import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { colors } from '../styles/tokens/colors';
import { effects } from '../styles/tokens/effects';
import { typography } from '../styles/tokens/typography';

// Type definitions
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'cta';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

// Size configurations using tokens
const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: '8px 16px',
    fontSize: typography.fontSize.small,
    minHeight: '32px',
  },
  md: {
    padding: '12px 24px',
    fontSize: typography.fontSize.body,
    minHeight: '40px',
  },
  lg: {
    padding: '16px 32px',
    fontSize: typography.fontSize.h4,
    minHeight: '48px',
  }
};

// Variant configurations using tokens
const getVariantStyles = (variant: ButtonVariant): React.CSSProperties => {
  const baseTransition = `all ${effects.animation.duration.fast} ${effects.animation.easing.smooth}`;
  
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary.main,
        color: colors.neutral[0],
        border: 'none',
        boxShadow: effects.shadows.sm,
      };
    case 'secondary':
      return {
        backgroundColor: 'transparent',
        color: colors.primary.main,
        border: `1px solid ${colors.primary.main}`,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        color: colors.neutral[700],
        border: 'none',
      };
    case 'cta':
      return {
        background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`,
        color: colors.neutral[0],
        border: 'none',
        boxShadow: effects.shadows.md,
        fontWeight: typography.fontWeight.medium,
      };
    default:
      return {};
  }
};

// Hover styles for each variant
const getHoverStyles = (variant: ButtonVariant): React.CSSProperties => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary.dark,
        boxShadow: effects.shadows.md,
      };
    case 'secondary':
      return {
        backgroundColor: colors.primary.main,
        color: colors.neutral[0],
      };
    case 'ghost':
      return {
        backgroundColor: colors.neutral[50],
      };
    case 'cta':
      return {
        boxShadow: effects.shadows.lg,
        transform: 'translateY(-2px)',
      };
    default:
      return {};
  }
};

// Main component with forwardRef
export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    children, 
    loading = false,
    fullWidth = false,
    disabled = false,
    style,
    onMouseEnter,
    onMouseLeave,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    // Base styles
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: effects.borderRadius.pill, // Key pill shape
      fontFamily: typography.fontFamily.body,
      fontWeight: typography.fontWeight.medium,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: `all ${effects.animation.duration.fast} ${effects.animation.easing.smooth}`,
      outline: 'none',
      position: 'relative',
      whiteSpace: 'nowrap',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.5 : loading ? 0.7 : 1,
      pointerEvents: loading ? 'none' : 'auto',
      ...sizeStyles[size],
      ...getVariantStyles(variant),
      ...(isHovered && !disabled && !loading ? getHoverStyles(variant) : {}),
      ...style,
    };
    
    // Active styles
    const handleMouseDown = () => {
      if (!disabled && !loading && variant === 'primary') {
        setIsHovered(false);
      }
    };
    
    const handleMouseUp = () => {
      if (!disabled && !loading && variant === 'primary') {
        setIsHovered(true);
      }
    };
    
    return (
      <button
        ref={ref}
        style={baseStyles}
        disabled={disabled}
        onMouseEnter={(e) => {
          setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeave?.(e);
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {loading ? (
          <span>Loading...</span>
        ) : (
          children
        )}
      </button>
    );
  }
);

PillButton.displayName = 'PillButton';

export default PillButton;