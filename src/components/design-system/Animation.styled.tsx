/**
 * Animation utilities using styled-components
 * SSR-safe, direct token usage from theme.deep.json
 */

import styled, { css, keyframes } from 'styled-components';
import { effects } from './common';

// Keyframe animations
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const slideInUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInDown = keyframes`
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInLeft = keyframes`
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInRight = keyframes`
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const scaleIn = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

export const scaleOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
`;

export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

export const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

// Animation mixins
export const fadeInAnimation = css<{ duration?: string; delay?: string }>`
  animation: ${fadeIn} ${props => props.duration || effects.transitions.duration.fast} 
    ${effects.transitions.timing.easeInOut} ${props => props.delay || '0s'} both;
`;

export const slideUpAnimation = css<{ duration?: string; delay?: string }>`
  animation: ${slideInUp} ${props => props.duration || effects.transitions.duration.default} 
    ${effects.transitions.timing.bounce} ${props => props.delay || '0s'} both;
`;

export const scaleAnimation = css<{ duration?: string; delay?: string }>`
  animation: ${scaleIn} ${props => props.duration || effects.transitions.duration.fast} 
    ${effects.transitions.timing.easeInOut} ${props => props.delay || '0s'} both;
`;

// Animated wrapper components
export const FadeIn = styled.div<{
  duration?: string;
  delay?: string;
  whenVisible?: boolean;
}>`
  ${props => !props.whenVisible && fadeInAnimation}
  ${props => props.whenVisible && css`
    opacity: 0;
    transition: opacity ${props.duration || effects.transitions.duration.fast} 
      ${effects.transitions.timing.easeInOut} ${props.delay || '0s'};
    
    &.visible {
      opacity: 1;
    }
  `}
`;

export const SlideIn = styled.div<{
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: string;
  delay?: string;
  whenVisible?: boolean;
}>`
  ${props => {
    const animationMap = {
      up: slideInUp,
      down: slideInDown,
      left: slideInLeft,
      right: slideInRight,
    };
    const animation = animationMap[props.direction || 'up'];
    
    if (!props.whenVisible) {
      return css`
        animation: ${animation} ${props.duration || effects.transitions.duration.default} 
          ${effects.transitions.timing.bounce} ${props.delay || '0s'} both;
      `;
    }
    
    const transformMap = {
      up: 'translateY(30px)',
      down: 'translateY(-30px)',
      left: 'translateX(-30px)',
      right: 'translateX(30px)',
    };
    
    return css`
      opacity: 0;
      transform: ${transformMap[props.direction || 'up']};
      transition: all ${props.duration || effects.transitions.duration.default} 
        ${effects.transitions.timing.bounce} ${props.delay || '0s'};
      
      &.visible {
        opacity: 1;
        transform: translate(0);
      }
    `;
  }}
`;

export const Scale = styled.div<{
  duration?: string;
  delay?: string;
  hover?: boolean;
}>`
  ${props => !props.hover && scaleAnimation}
  ${props => props.hover && css`
    transition: transform ${props.duration || effects.transitions.duration.fast} 
      ${effects.transitions.timing.easeInOut};
    
    &:hover {
      transform: scale(1.05);
    }
  `}
`;

export const Rotate = styled.div<{
  duration?: string;
  continuous?: boolean;
}>`
  ${props => props.continuous && css`
    animation: ${rotate} ${props.duration || '2s'} linear infinite;
  `}
  ${props => !props.continuous && css`
    transition: transform ${props.duration || effects.transitions.duration.default} 
      ${effects.transitions.timing.easeInOut};
    
    &:hover {
      transform: rotate(360deg);
    }
  `}
`;

export const Pulse = styled.div<{
  duration?: string;
  continuous?: boolean;
}>`
  ${props => props.continuous && css`
    animation: ${pulse} ${props.duration || '2s'} ${effects.transitions.timing.easeInOut} infinite;
  `}
  ${props => !props.continuous && css`
    transition: transform ${props.duration || effects.transitions.duration.fast} 
      ${effects.transitions.timing.easeInOut};
    
    &:hover {
      transform: scale(1.05);
    }
  `}
`;

// Skeleton loader animation
export const Skeleton = styled.div<{
  width?: string;
  height?: string;
  rounded?: boolean;
}>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
  border-radius: ${props => props.rounded ? '9999px' : '4px'};
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
`;

// Transition utility
export const Transition = styled.div<{
  property?: string;
  duration?: string;
  easing?: string;
  delay?: string;
}>`
  transition: ${props => props.property || 'all'} 
    ${props => props.duration || effects.transitions.duration.fast} 
    ${props => props.easing || effects.transitions.timing.easeInOut} 
    ${props => props.delay || '0s'};
`;

// Hover effects wrapper
export const HoverEffect = styled.div<{
  scale?: number;
  shadow?: boolean;
  lift?: boolean;
}>`
  transition: all ${effects.transitions.duration.fast} ${effects.transitions.timing.easeInOut};
  cursor: pointer;
  
  &:hover {
    ${props => props.scale && `transform: scale(${props.scale});`}
    ${props => props.shadow && `box-shadow: ${effects.shadows.card.hover};`}
    ${props => props.lift && `transform: translateY(-4px);`}
  }
  
  &:active {
    transform: scale(0.98);
  }
`;