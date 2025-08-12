/**
 * Button components using styled-components
 * SSR-safe, direct token usage from theme.deep.json
 */

import styled, { css, keyframes } from 'styled-components';
import { colors, typography, spacing, effects, borderRadius, focusRing } from './common';

// Loading animation
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Base button styles
const baseButton = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${typography.fontFamily.base};
  font-weight: ${typography.fontWeight.medium};
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
  white-space: nowrap;
  user-select: none;
  text-decoration: none;
  
  ${focusRing}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Size variants
const sizeVariants = {
  sm: css`
    padding: ${spacing['2']} ${spacing['3']};
    font-size: ${typography.fontSize.sm};
    border-radius: ${borderRadius.md};
  `,
  md: css`
    padding: ${spacing['3']} ${spacing['4']};
    font-size: ${typography.fontSize.base};
    border-radius: ${borderRadius.md};
  `,
  lg: css`
    padding: ${spacing['4']} ${spacing['6']};
    font-size: ${typography.fontSize.lg};
    border-radius: ${borderRadius.lg};
  `,
};

// Primary Button
export const PrimaryButton = styled.button<{
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}>`
  ${baseButton}
  ${props => sizeVariants[props.size || 'md']}
  
  background-color: ${colors.primary.blue.default};
  color: ${colors.neutral.white};
  box-shadow: ${effects.shadows.button.default};
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  &:hover:not(:disabled) {
    background-color: ${colors.primary.blue.hover};
    box-shadow: ${effects.shadows.button.hover};
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    background-color: ${colors.primary.blue.active};
    transform: translateY(0);
  }
  
  ${props => props.loading && css`
    color: transparent;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid ${colors.neutral.white};
      border-top-color: transparent;
      border-radius: 50%;
      animation: ${spin} 0.6s linear infinite;
    }
  `}
`;

// Secondary Button
export const SecondaryButton = styled.button<{
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}>`
  ${baseButton}
  ${props => sizeVariants[props.size || 'md']}
  
  background-color: ${colors.neutral.white};
  color: ${colors.text.primary.default};
  border: 1px solid ${colors.neutral.gray['200']};
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  &:hover:not(:disabled) {
    background-color: ${colors.neutral.gray['50']};
    border-color: ${colors.neutral.gray['300']};
  }
  
  &:active:not(:disabled) {
    background-color: ${colors.neutral.gray['100']};
  }
  
  ${props => props.loading && css`
    color: transparent;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid ${colors.primary.blue.default};
      border-top-color: transparent;
      border-radius: 50%;
      animation: ${spin} 0.6s linear infinite;
    }
  `}
`;

// Ghost Button
export const GhostButton = styled.button<{
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}>`
  ${baseButton}
  ${props => sizeVariants[props.size || 'md']}
  
  background-color: transparent;
  color: ${colors.text.primary.default};
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  &:hover:not(:disabled) {
    background-color: ${colors.neutral.gray['50']};
  }
  
  &:active:not(:disabled) {
    background-color: ${colors.neutral.gray['100']};
  }
`;

// Gradient Button
export const GradientButton = styled.button<{
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}>`
  ${baseButton}
  ${props => sizeVariants[props.size || 'md']}
  
  background: linear-gradient(135deg, ${colors.primary.blue.default} 0%, ${colors.primary.lightBlue} 100%);
  color: ${colors.neutral.white};
  box-shadow: ${effects.shadows.button.default};
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  &:hover:not(:disabled) {
    box-shadow: ${effects.shadows.button.hover};
    transform: translateY(-1px);
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, ${colors.primary.blue.hover} 0%, ${colors.primary.lightBlue} 100%);
      opacity: 0;
      transition: opacity 200ms ease;
    }
    
    &:hover::before {
      opacity: 1;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// Icon Button
export const IconButton = styled.button<{
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}>`
  ${baseButton}
  
  width: ${props => {
    switch (props.size) {
      case 'sm': return '32px';
      case 'lg': return '48px';
      default: return '40px';
    }
  }};
  
  height: ${props => {
    switch (props.size) {
      case 'sm': return '32px';
      case 'lg': return '48px';
      default: return '40px';
    }
  }};
  
  padding: 0;
  border-radius: ${borderRadius.full};
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return css`
          background-color: ${colors.primary.blue.default};
          color: ${colors.neutral.white};
          
          &:hover:not(:disabled) {
            background-color: ${colors.primary.blue.hover};
          }
        `;
      case 'secondary':
        return css`
          background-color: ${colors.neutral.white};
          color: ${colors.text.primary.default};
          border: 1px solid ${colors.neutral.gray['200']};
          
          &:hover:not(:disabled) {
            background-color: ${colors.neutral.gray['50']};
          }
        `;
      default:
        return css`
          background-color: transparent;
          color: ${colors.text.primary.default};
          
          &:hover:not(:disabled) {
            background-color: ${colors.neutral.gray['50']};
          }
        `;
    }
  }}
`;

// Backwards compatibility wrapper for StripeButton
export const StripeButton = styled(PrimaryButton)<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
}>`
  ${props => {
    if (props.variant === 'secondary') {
      return css`
        background-color: ${colors.neutral.white};
        color: ${colors.text.primary.default};
        border: 1px solid ${colors.neutral.gray['200']};
        
        &:hover:not(:disabled) {
          background-color: ${colors.neutral.gray['50']};
          border-color: ${colors.neutral.gray['300']};
        }
      `;
    }
    if (props.variant === 'ghost') {
      return css`
        background-color: transparent;
        color: ${colors.text.primary.default};
        box-shadow: none;
        
        &:hover:not(:disabled) {
          background-color: ${colors.neutral.gray['50']};
        }
      `;
    }
    if (props.variant === 'gradient') {
      return css`
        background: linear-gradient(135deg, ${colors.primary.blue.default} 0%, ${colors.primary.lightBlue} 100%);
      `;
    }
    // Default is primary (already styled in PrimaryButton)
    return '';
  }}
`;