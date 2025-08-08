/**
 * Effects tokens extracted from Stripe design system and hybrid implementation plan
 * @source docs/analysis/stripe-design-system.json
 * @source docs/analysis/hybrid-implementation-plan.json
 */

export const effects = {
  // Shadows from Stripe design system
  shadows: {
    // Base shadows
    sm: 'rgba(50, 50, 93, 0.25) 0px 2px 4px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px',
    md: 'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px',
    lg: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
    xl: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px',
    
    // Simplified shadows from hybrid plan
    simple: {
      sm: '0 2px 4px rgba(0,0,0,0.08)',
      md: '0 4px 8px rgba(0,0,0,0.12)',
      lg: '0 8px 24px rgba(0,0,0,0.16)',
      xl: '0 24px 48px rgba(0,0,0,0.24)',
    },
    
    // Special shadows
    stripe: 'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px',
    hover: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px',
    focus: '0 0 0 3px rgba(99, 91, 255, 0.1)',
    inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Border radius values
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    pill: '9999px',
    searchBar: '28px',  // TripAdvisor-style search bar
    card: '8px',        // Default card radius
    button: '4px',      // Default button radius
  },
  
  // Blur effects for glassmorphism
  blur: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    backdrop: 'blur(8px)',  // For navigation backdrop
  },
  
  // Opacity values
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    25: '0.25',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    75: '0.75',
    80: '0.8',
    90: '0.9',
    95: '0.95',
    100: '1',
  },
  
  // Transitions and animations
  animation: {
    // Duration values
    duration: {
      instant: '100ms',
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
      slowest: '1000ms',
    },
    
    // Easing functions
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // Common transitions
    transition: {
      all: 'all 250ms ease',
      colors: 'background-color 250ms ease, border-color 250ms ease, color 250ms ease',
      opacity: 'opacity 250ms ease',
      shadow: 'box-shadow 250ms ease',
      transform: 'transform 250ms ease',
    },
  },
  
  // Transform utilities
  transform: {
    scale: {
      0: 'scale(0)',
      50: 'scale(0.5)',
      75: 'scale(0.75)',
      90: 'scale(0.9)',
      95: 'scale(0.95)',
      100: 'scale(1)',
      105: 'scale(1.05)',
      110: 'scale(1.1)',
      125: 'scale(1.25)',
      150: 'scale(1.5)',
    },
    rotate: {
      0: 'rotate(0deg)',
      45: 'rotate(45deg)',
      90: 'rotate(90deg)',
      180: 'rotate(180deg)',
      '-45': 'rotate(-45deg)',
      '-90': 'rotate(-90deg)',
      '-180': 'rotate(-180deg)',
    },
    translate: {
      hover: 'translateY(-2px)',
      active: 'translateY(1px)',
    },
  },
  
  // Spacing scale (based on 8px unit)
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
    40: '160px',
    48: '192px',
    56: '224px',
    64: '256px',
  },
  
  // Z-index scale
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    60: '60',
    70: '70',
    80: '80',
    90: '90',
    100: '100',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    backdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
    toast: '1080',
    max: '9999',
  },
} as const;

// Type exports
export type EffectsToken = typeof effects;
export type ShadowLevel = keyof typeof effects.shadows;
export type BorderRadiusSize = keyof typeof effects.borderRadius;
export type AnimationDuration = keyof typeof effects.animation.duration;
export type AnimationEasing = keyof typeof effects.animation.easing;