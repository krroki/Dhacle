'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string
  ariaPressed?: boolean
  ariaExpanded?: boolean
  ariaDescribedBy?: string
  ariaHaspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  ariaControls?: string
  loading?: boolean
  loadingText?: string
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      className,
      disabled,
      ariaLabel,
      ariaPressed,
      ariaExpanded,
      ariaDescribedBy,
      ariaHaspopup,
      ariaControls,
      loading = false,
      loadingText = '처리 중...',
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        aria-expanded={ariaExpanded}
        aria-describedby={ariaDescribedBy}
        aria-haspopup={ariaHaspopup}
        aria-controls={ariaControls}
        aria-busy={loading}
        onClick={onClick}
        {...props}
      >
        {loading && (
          <span className="sr-only">{loadingText}</span>
        )}
        <span className={cn(loading && 'invisible')}>
          {children}
        </span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
      </button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'