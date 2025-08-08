/**
 * Color tokens extracted from Stripe design system and hybrid implementation plan
 * @source docs/analysis/stripe-design-system.json
 * @source docs/analysis/hybrid-implementation-plan.json
 */

export const colors = {
  // Brand colors from Stripe
  brand: {
    primary: 'rgb(99, 91, 255)',      // Stripe purple
    secondary: 'rgb(10, 37, 64)',     // Stripe dark blue
    accent: 'rgb(21, 190, 83)',       // Stripe green
  },
  
  // Primary colors from hybrid plan
  primary: {
    main: '#635BFF',
    light: '#9966FF',
    dark: '#0A2540',
    contrast: '#FFFFFF',
  },
  
  // Secondary colors for success states
  secondary: {
    main: '#00D924',
    light: '#15BE53',
    dark: '#0A2540',
  },
  
  // Neutral palette from Stripe
  neutral: {
    0: 'rgb(255, 255, 255)',       // white
    50: 'rgb(246, 249, 252)',      // lightest gray
    100: 'rgb(231, 236, 241)',
    200: 'rgb(173, 189, 204)',
    300: 'rgb(114, 127, 150)',
    400: 'rgb(98, 120, 141)',
    500: 'rgb(66, 84, 102)',
    600: 'rgb(63, 75, 102)',
    700: 'rgb(46, 58, 85)',
    800: 'rgb(11, 37, 64)',
    900: 'rgb(10, 37, 64)',        // darkest (black)
  },
  
  // Semantic colors for states
  semantic: {
    success: '#00D924',
    warning: '#F5A623',
    error: '#ED5E5E',
    info: '#0073E6',
  },
  
  // Kakao brand color for OAuth
  kakao: {
    default: '#FEE500',
    hover: '#FDD835',
    text: '#191919',
  },
  
  // Category colors for TripAdvisor-style cards
  categories: {
    education: 'rgb(99, 91, 255)',    // stripe-purple
    template: 'rgb(0, 115, 230)',     // stripe-blue
    audio: 'rgb(21, 190, 83)',        // stripe-green
    subtitle: 'rgb(255, 146, 86)',    // stripe-orange
    analytics: 'rgb(191, 48, 106)',   // stripe-pink
    community: 'rgb(75, 0, 130)',     // stripe-indigo
  },
  
  // Gradients from Stripe
  gradients: {
    primary: 'linear-gradient(90deg, rgb(191, 48, 106) 0%, rgb(172, 47, 146) 100%)',
    secondary: 'linear-gradient(90deg, rgb(0, 115, 230) -50%, rgb(61, 201, 201))',
    tertiary: 'linear-gradient(90deg, rgb(61, 201, 201) -50%, rgb(12, 194, 255))',
    overlay: 'radial-gradient(66.35% 66.35% at 50% 50%, rgba(255, 255, 255, 0.9) 0px, rgba(255, 255, 255, 0) 100%)',
  },
} as const;

// Type-safe color getter helper
export type ColorToken = typeof colors;
export type ColorPath = keyof ColorToken | `${keyof ColorToken}.${string}`;

export const getColor = (path: ColorPath): string => {
  const keys = path.split('.');
  let value: any = colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color token not found: ${path}`);
      return '#000000';
    }
  }
  
  return value as string;
};