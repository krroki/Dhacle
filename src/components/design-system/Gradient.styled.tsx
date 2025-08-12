/**
 * Gradient Component - Styled Components Based
 * SSR-safe gradient backgrounds with theme integration
 */

import styled, { css, keyframes } from 'styled-components';
import { theme, colors } from './common';

// Animation for gradient movement
const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Base gradient styles
const gradientBase = css`
  position: relative;
  overflow: hidden;
`;

const gradientStyles = {
  primary: css`
    background: linear-gradient(
      135deg,
      ${colors.primary.blue.default} 0%,
      ${colors.primary.lightBlue} 50%,
      ${colors.primary.lightBlue} 100%
    );
    background-size: 200% 200%;
    animation: ${gradientMove} 15s ease infinite;
  `,
  stripe: css`
    background: linear-gradient(
      135deg,
      #635bff 0%,
      #0073e6 25%,
      #00d4ff 50%,
      #635bff 100%
    );
    background-size: 400% 400%;
    animation: ${gradientMove} 20s ease infinite;
  `,
  hero: css`
    background: linear-gradient(
      135deg,
      ${colors.neutral.offWhite} 0%,
      ${colors.primary.lightBlue} 25%,
      ${colors.primary.lightBlue} 75%,
      ${colors.neutral.offWhite} 100%
    );
    background-size: 200% 200%;
    animation: ${gradientMove} 25s ease infinite;
  `,
  subtle: css`
    background: linear-gradient(
      135deg,
      ${colors.neutral.white} 0%,
      ${colors.neutral.offWhite} 50%,
      ${colors.neutral.gray['50']} 100%
    );
  `,
};

interface StripeGradientProps {
  variant?: keyof typeof gradientStyles;
  animated?: boolean;
  blur?: boolean;
  opacity?: number;
  height?: string;
  className?: string;
}

export const StripeGradient = styled.div<StripeGradientProps>`
  ${gradientBase}
  ${props => props.variant && gradientStyles[props.variant]}
  
  ${props => props.height && css`
    height: ${props.height};
  `}
  
  ${props => props.opacity && css`
    opacity: ${props.opacity};
  `}
  
  ${props => props.blur && css`
    filter: blur(100px);
  `}
  
  ${props => !props.animated && css`
    animation: none !important;
  `}
`;

StripeGradient.defaultProps = {
  variant: 'primary',
  animated: true,
  blur: false,
  opacity: 1,
};

// Gradient overlay for text
export const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    ${colors.neutral.white} 100%
  );
  pointer-events: none;
`;

// Gradient text effect
export const GradientText = styled.span<{ gradient?: 'primary' | 'stripe' }>`
  background: ${props => props.gradient === 'stripe' 
    ? 'linear-gradient(135deg, #635bff 0%, #0073e6 50%, #00d4ff 100%)'
    : `linear-gradient(135deg, ${colors.primary.blue.default} 0%, ${colors.primary.lightBlue} 100%)`
  };
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
`;