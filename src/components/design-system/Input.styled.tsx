/**
 * Input and Form components using styled-components
 * SSR-safe, direct token usage from theme.deep.json
 */

import styled, { css } from 'styled-components';
import { colors, typography, spacing, borderRadius, focusRing } from './common';

// Base input styles
const baseInput = css`
  width: 100%;
  padding: ${spacing['3']} ${spacing['4']};
  font-family: ${typography.fontFamily.base};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.normal};
  line-height: ${typography.lineHeight.normal};
  color: ${colors.text.primary.default};
  background-color: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.gray['200']};
  border-radius: ${borderRadius.md};
  transition: all 200ms ease;
  
  ${focusRing}
  
  &::placeholder {
    color: ${colors.neutral.gray['400']};
  }
  
  &:hover:not(:disabled) {
    border-color: ${colors.neutral.gray['300']};
  }
  
  &:focus {
    border-color: ${colors.primary.blue.default};
    outline: none;
  }
  
  &:disabled {
    background-color: ${colors.neutral.gray['50']};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Text Input
export const Input = styled.input<{
  hasError?: boolean;
  size?: 'sm' | 'md' | 'lg';
}>`
  ${baseInput}
  
  ${props => props.size === 'sm' && css`
    padding: ${spacing['2']} ${spacing['3']};
    font-size: ${typography.fontSize.sm};
  `}
  
  ${props => props.size === 'lg' && css`
    padding: ${spacing['4']} ${spacing['5']};
    font-size: ${typography.fontSize.lg};
  `}
  
  ${props => props.hasError && css`
    border-color: #ED5E5E;
    
    &:focus {
      border-color: #ED5E5E;
    }
  `}
`;

// Textarea
export const Textarea = styled.textarea<{
  hasError?: boolean;
  size?: 'sm' | 'md' | 'lg';
}>`
  ${baseInput}
  resize: vertical;
  min-height: 100px;
  
  ${props => props.size === 'sm' && css`
    padding: ${spacing['2']} ${spacing['3']};
    font-size: ${typography.fontSize.sm};
  `}
  
  ${props => props.size === 'lg' && css`
    padding: ${spacing['4']} ${spacing['5']};
    font-size: ${typography.fontSize.lg};
  `}
  
  ${props => props.hasError && css`
    border-color: #ED5E5E;
    
    &:focus {
      border-color: #ED5E5E;
    }
  `}
`;

// Select
export const Select = styled.select<{
  hasError?: boolean;
  size?: 'sm' | 'md' | 'lg';
}>`
  ${baseInput}
  cursor: pointer;
  
  ${props => props.size === 'sm' && css`
    padding: ${spacing['2']} ${spacing['3']};
    font-size: ${typography.fontSize.sm};
  `}
  
  ${props => props.size === 'lg' && css`
    padding: ${spacing['4']} ${spacing['5']};
    font-size: ${typography.fontSize.lg};
  `}
  
  ${props => props.hasError && css`
    border-color: #ED5E5E;
    
    &:focus {
      border-color: #ED5E5E;
    }
  `}
`;

// Checkbox
export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${colors.primary.blue.default};
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Radio
export const Radio = styled.input.attrs({ type: 'radio' })`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${colors.primary.blue.default};
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Form Group
export const FormGroup = styled.div`
  margin-bottom: ${spacing['6']};
`;

// Form Label
export const FormLabel = styled.label<{ required?: boolean }>`
  display: block;
  margin-bottom: ${spacing['2']};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.text.primary.default};
  
  ${props => props.required && css`
    &::after {
      content: ' *';
      color: #ED5E5E;
    }
  `}
`;

// Form Helper Text
export const FormHelperText = styled.span<{ hasError?: boolean }>`
  display: block;
  margin-top: ${spacing['1']};
  font-size: ${typography.fontSize.sm};
  color: ${props => props.hasError ? '#ED5E5E' : colors.neutral.gray['500']};
`;

// Input Group (for icons, addons, etc.)
export const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Input Addon
export const InputAddon = styled.div<{ position?: 'left' | 'right' }>`
  position: absolute;
  ${props => props.position === 'right' ? 'right: 0' : 'left: 0'};
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 ${spacing['3']};
  color: ${colors.neutral.gray['500']};
  pointer-events: none;
`;

// Backwards compatibility wrapper for StripeInput
export const StripeInput = Input;
export const StripeTextarea = Textarea;