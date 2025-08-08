'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { cn } from '@/lib/utils';

interface StripeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled' | 'ghost';
  fullWidth?: boolean;
}

export const StripeInput = React.forwardRef<HTMLInputElement, StripeInputProps>(
  (
    {
      label,
      error,
      success = false,
      hint,
      icon,
      iconPosition = 'left',
      size = 'md',
      variant = 'default',
      fullWidth = false,
      className,
      style,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [focused, setFocused] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id || `stripe-input-${generatedId}`;

    // Size styles
    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return {
            padding: `${theme.spacing['2']} ${theme.spacing['3']}`,
            fontSize: theme.typography.fontSize.sm,
          };
        case 'lg':
          return {
            padding: `${theme.spacing['4']} ${theme.spacing['5']}`,
            fontSize: theme.typography.fontSize.lg,
          };
        case 'md':
        default:
          return {
            padding: `${theme.spacing['3']} ${theme.spacing['4']}`,
            fontSize: theme.typography.fontSize.base,
          };
      }
    };

    // Variant styles
    const getVariantStyles = (): React.CSSProperties => {
      const baseVariantStyles = {
        default: {
          backgroundColor: theme.colors.neutral.white,
          border: `1px solid ${
            error
              ? theme.colors.primary.lightBlue
              : success
              ? theme.colors.primary.blue.default
              : focused
              ? theme.colors.primary.blue.default
              : theme.colors.neutral.gray['300']
          }`,
          borderRadius: theme.borderRadius.default,
        },
        outlined: {
          backgroundColor: 'transparent',
          border: `2px solid ${
            error
              ? theme.colors.primary.lightBlue
              : success
              ? theme.colors.primary.blue.default
              : focused
              ? theme.colors.primary.blue.default
              : theme.colors.neutral.gray['300']
          }`,
          borderRadius: theme.borderRadius.default,
        },
        filled: {
          backgroundColor: theme.colors.neutral.gray['50'],
          border: `1px solid transparent`,
          borderBottom: `2px solid ${
            error
              ? theme.colors.primary.lightBlue
              : success
              ? theme.colors.primary.blue.default
              : focused
              ? theme.colors.primary.blue.default
              : theme.colors.neutral.gray['400']
          }`,
          borderRadius: `${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0`,
        },
        ghost: {
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${
            error
              ? theme.colors.primary.lightBlue
              : success
              ? theme.colors.primary.blue.default
              : focused
              ? theme.colors.primary.blue.default
              : theme.colors.neutral.gray['300']
          }`,
          borderRadius: '0',
        },
      };

      return baseVariantStyles[variant] || baseVariantStyles.default;
    };

    const inputStyles: React.CSSProperties = {
      ...getSizeStyles(),
      ...getVariantStyles(),
      width: fullWidth ? '100%' : 'auto',
      fontFamily: theme.typography.fontFamily.base,
      fontWeight: theme.typography.fontWeight.normal,
      color: theme.colors.text.primary.default,
      transition: `all ${theme.effects.transitions.duration.default} ${theme.effects.transitions.timing.easeInOut}`,
      outline: 'none',
      opacity: disabled ? theme.effects.opacity['50'] : theme.effects.opacity['100'],
      cursor: disabled ? 'not-allowed' : 'text',
      paddingLeft: icon && iconPosition === 'left' ? `calc(${theme.spacing['8']} + ${theme.spacing['2']})` : undefined,
      paddingRight: icon && iconPosition === 'right' ? `calc(${theme.spacing['8']} + ${theme.spacing['2']})` : undefined,
      ...style,
    };

    const labelStyles: React.CSSProperties = {
      display: 'block',
      marginBottom: theme.spacing['2'],
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary.default,
      fontFamily: theme.typography.fontFamily.base,
    };

    const hintStyles: React.CSSProperties = {
      marginTop: theme.spacing['1'],
      fontSize: theme.typography.fontSize.xs,
      color: error
        ? theme.colors.primary.lightBlue
        : success
        ? theme.colors.primary.blue.default
        : theme.colors.text.primary.light,
      fontFamily: theme.typography.fontFamily.base,
    };

    const iconStyles: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.colors.neutral.gray['400'],
      ...(iconPosition === 'left'
        ? { left: theme.spacing['3'] }
        : { right: theme.spacing['3'] }),
    };

    return (
      <div className={cn('stripe-input-wrapper', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} style={labelStyles}>
            {label}
            {required && (
              <span style={{ color: theme.colors.primary.lightBlue, marginLeft: theme.spacing['1'] }}>
                *
              </span>
            )}
          </label>
        )}
        <div style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
          {icon && <div style={iconStyles}>{icon}</div>}
          <input
            ref={ref}
            id={inputId}
            className={cn('stripe-input', className)}
            style={inputStyles}
            disabled={disabled}
            required={required}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-invalid={!!error}
            aria-describedby={hint || error ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {(hint || error) && (
          <div id={`${inputId}-hint`} style={hintStyles}>
            {error || hint}
          </div>
        )}
      </div>
    );
  }
);

StripeInput.displayName = 'StripeInput';

// Additional form components
export const StripeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
    hint?: string;
    fullWidth?: boolean;
  }
>(({ label, error, hint, fullWidth, className, style, disabled, required, id, ...props }, ref) => {
  const { theme } = useTheme();
  const [focused, setFocused] = React.useState(false);
  const generatedId = React.useId();
  const textareaId = id || `stripe-textarea-${generatedId}`;

  const textareaStyles: React.CSSProperties = {
    padding: `${theme.spacing['3']} ${theme.spacing['4']}`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.base,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.primary.default,
    backgroundColor: theme.colors.neutral.white,
    border: `1px solid ${
      error
        ? theme.colors.primary.lightBlue
        : focused
        ? theme.colors.primary.blue.default
        : theme.colors.neutral.gray['300']
    }`,
    borderRadius: theme.borderRadius.default,
    width: fullWidth ? '100%' : 'auto',
    minHeight: '120px',
    resize: 'vertical',
    transition: `all ${theme.effects.transitions.duration.default} ${theme.effects.transitions.timing.easeInOut}`,
    outline: 'none',
    opacity: disabled ? theme.effects.opacity['50'] : theme.effects.opacity['100'],
    cursor: disabled ? 'not-allowed' : 'text',
    ...style,
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: theme.spacing['2'],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary.default,
    fontFamily: theme.typography.fontFamily.base,
  };

  const hintStyles: React.CSSProperties = {
    marginTop: theme.spacing['1'],
    fontSize: theme.typography.fontSize.xs,
    color: error ? theme.colors.primary.lightBlue : theme.colors.text.primary.light,
    fontFamily: theme.typography.fontFamily.base,
  };

  return (
    <div className={cn('stripe-textarea-wrapper', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={textareaId} style={labelStyles}>
          {label}
          {required && (
            <span style={{ color: theme.colors.primary.lightBlue, marginLeft: theme.spacing['1'] }}>
              *
            </span>
          )}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn('stripe-textarea', className)}
        style={textareaStyles}
        disabled={disabled}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${textareaId}-hint` : undefined}
        {...props}
      />
      {(hint || error) && (
        <div id={`${textareaId}-hint`} style={hintStyles}>
          {error || hint}
        </div>
      )}
    </div>
  );
});

StripeTextarea.displayName = 'StripeTextarea';