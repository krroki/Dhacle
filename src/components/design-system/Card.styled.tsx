/**
 * Card components using styled-components
 * SSR-safe, direct token usage from theme.deep.json
 */

import styled, { css } from 'styled-components';
import { colors, spacing, effects, borderRadius, cardShadow } from './common';

// Base card styles
const baseCard = css`
  background-color: ${colors.neutral.white};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  transition: all 200ms ease;
`;

// Default Card
export const Card = styled.div<{
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}>`
  ${baseCard}
  ${cardShadow}
  
  padding: ${props => {
    switch (props.padding) {
      case 'none': return '0';
      case 'sm': return spacing['3'];
      case 'lg': return spacing['8'];
      default: return spacing['6'];
    }
  }};
  
  ${props => props.hoverable && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
    }
  `}
`;

// Bordered Card
export const BorderedCard = styled(Card)`
  box-shadow: none;
  border: 1px solid ${colors.neutral.gray['200']};
  
  &:hover {
    border-color: ${colors.neutral.gray['300']};
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  }
`;

// Elevated Card
export const ElevatedCard = styled(Card)<{
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
}>`
  ${props => {
    switch (props.elevation) {
      case 'sm':
        return css`box-shadow: 0 1px 3px rgba(0,0,0,0.12);`;
      case 'lg':
        return css`box-shadow: ${effects.shadows.large};`;
      case 'xl':
        return css`box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);`;
      default:
        return css`box-shadow: ${effects.shadows.card.default};`;
    }
  }}
`;

// Gradient Card
export const GradientCard = styled(Card)<{
  gradient?: 'primary' | 'stripe' | 'hero';
}>`
  position: relative;
  background: ${props => {
    switch (props.gradient) {
      case 'stripe':
        return `linear-gradient(135deg, ${colors.primary.blue.default} 0%, ${colors.primary.lightBlue} 100%)`;
      case 'hero':
        return `linear-gradient(180deg, ${colors.primary.darkBlue} 0%, ${colors.primary.blue.default} 100%)`;
      default:
        return `linear-gradient(135deg, ${colors.primary.blue.default} 0%, ${colors.primary.lightBlue} 100%)`;
    }
  }};
  color: ${colors.neutral.white};
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
  }
`;

// Interactive Card (for course cards, etc.)
export const InteractiveCard = styled(Card)`
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(99, 91, 255, 0.05) 100%);
    opacity: 0;
    transition: opacity 200ms ease;
  }
  
  &:hover {
    transform: translateY(-4px);
    
    &::after {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

// Card Header
export const CardHeader = styled.div<{
  bordered?: boolean;
}>`
  padding: ${spacing['4']} ${spacing['6']};
  
  ${props => props.bordered && css`
    border-bottom: 1px solid ${colors.neutral.gray['200']};
  `}
`;

// Card Body
export const CardBody = styled.div`
  padding: ${spacing['6']};
`;

// Card Footer
export const CardFooter = styled.div<{
  bordered?: boolean;
}>`
  padding: ${spacing['4']} ${spacing['6']};
  
  ${props => props.bordered && css`
    border-top: 1px solid ${colors.neutral.gray['200']};
  `}
`;

// Backwards compatibility wrapper for StripeCard
export const StripeCard = styled(Card)<{
  variant?: 'default' | 'bordered' | 'elevated' | 'gradient';
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}>`
  ${props => {
    if (props.variant === 'bordered') {
      return css`
        box-shadow: none;
        border: 1px solid ${colors.neutral.gray['200']};
        
        &:hover {
          border-color: ${colors.neutral.gray['300']};
        }
      `;
    }
    if (props.variant === 'gradient') {
      return css`
        background: linear-gradient(135deg, ${colors.primary.blue.default} 0%, ${colors.primary.lightBlue} 100%);
        color: ${colors.neutral.white};
      `;
    }
    if (props.elevation) {
      switch (props.elevation) {
        case 'none':
          return css`box-shadow: none;`;
        case 'sm':
          return css`box-shadow: 0 1px 3px rgba(0,0,0,0.12);`;
        case 'lg':
          return css`box-shadow: ${effects.shadows.large};`;
        case 'xl':
          return css`box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);`;
        default:
          return css`box-shadow: ${effects.shadows.card.default};`;
      }
    }
    return '';
  }}
`;