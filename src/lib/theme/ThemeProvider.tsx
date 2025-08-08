'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { stripeTheme, getCSSVariables } from './theme';

// Enhanced theme context with helper functions
interface ThemeContextValue {
  theme: typeof stripeTheme;
  getToken: (path: string) => unknown;
  getCSSVar: (name: string) => string;
}

// Helper to get nested theme values
const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Helper functions for theme access
  const getToken = (path: string) => {
    return getNestedValue(stripeTheme as unknown as Record<string, unknown>, path);
  };

  const getCSSVar = (name: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(`--stripe-${name}`);
  };

  const contextValue: ThemeContextValue = {
    theme: stripeTheme,
    getToken,
    getCSSVar,
  };

  useEffect(() => {
    // Apply CSS variables to document root
    const cssVars = getCSSVariables();
    const root = document.documentElement;
    
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Remove dark theme classes
    document.body.classList.remove('dark');
    
    // Set Stripe-like body styles
    root.style.setProperty('--background', '#ffffff');
    root.style.setProperty('--foreground', stripeTheme.colors.text.primary.default);
  }, []);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}