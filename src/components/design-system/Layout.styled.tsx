/**
 * Layout components using styled-components
 * SSR-safe, direct token usage from theme.deep.json
 */

import styled from 'styled-components';
import { spacing, media, colors } from './common';

// Container with max-width
export const Container = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${spacing['4']};
  
  ${media.md} {
    padding: 0 ${spacing['6']};
  }
  
  ${media.lg} {
    padding: 0 ${spacing['8']};
  }
`;

// Main content area
export const Main = styled.main`
  min-height: 100vh;
  width: 100%;
`;

// Section wrapper
export const Section = styled.section`
  padding: ${spacing['12']} 0;
  
  ${media.md} {
    padding: ${spacing['16']} 0;
  }
  
  ${media.lg} {
    padding: ${spacing['20']} 0;
  }
`;

// Grid layout
export const Grid = styled.div<{
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: string;
}>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 1}, 1fr);
  gap: ${props => props.gap || spacing['6']};
  
  ${media.md} {
    grid-template-columns: repeat(${props => Math.min(props.columns || 2, 2)}, 1fr);
  }
  
  ${media.lg} {
    grid-template-columns: repeat(${props => props.columns || 3}, 1fr);
  }
`;

// Flex layout
export const Flex = styled.div<{
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => {
    switch (props.align) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'stretch': return 'stretch';
      default: return 'center';
    }
  }};
  justify-content: ${props => {
    switch (props.justify) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'between': return 'space-between';
      case 'around': return 'space-around';
      default: return 'center';
    }
  }};
  gap: ${props => props.gap || '0'};
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
`;

// Stack layout (vertical spacing)
export const Stack = styled.div<{ spacing?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.spacing || spacing['4']};
`;

// Divider
export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${colors.neutral.gray['200']};
  margin: ${spacing['8']} 0;
`;