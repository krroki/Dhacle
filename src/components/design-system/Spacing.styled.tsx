/**
 * Spacing utilities using styled-components
 * SSR-safe, direct token usage from theme.deep.json
 */

import styled from 'styled-components';
import { spacing } from './common';

// Dynamic spacer component
export const Spacer = styled.div<{
  size?: keyof typeof spacing;
  horizontal?: boolean;
}>`
  ${props => props.horizontal ? `
    width: ${spacing[props.size || '4']};
    height: 1px;
    display: inline-block;
  ` : `
    height: ${spacing[props.size || '4']};
    width: 100%;
  `}
`;

// Padding utilities
export const Padding = styled.div<{
  all?: keyof typeof spacing;
  x?: keyof typeof spacing;
  y?: keyof typeof spacing;
  top?: keyof typeof spacing;
  right?: keyof typeof spacing;
  bottom?: keyof typeof spacing;
  left?: keyof typeof spacing;
}>`
  ${props => props.all && `padding: ${spacing[props.all]};`}
  ${props => props.x && `padding-left: ${spacing[props.x]}; padding-right: ${spacing[props.x]};`}
  ${props => props.y && `padding-top: ${spacing[props.y]}; padding-bottom: ${spacing[props.y]};`}
  ${props => props.top && `padding-top: ${spacing[props.top]};`}
  ${props => props.right && `padding-right: ${spacing[props.right]};`}
  ${props => props.bottom && `padding-bottom: ${spacing[props.bottom]};`}
  ${props => props.left && `padding-left: ${spacing[props.left]};`}
`;

// Margin utilities
export const Margin = styled.div<{
  all?: keyof typeof spacing;
  x?: keyof typeof spacing;
  y?: keyof typeof spacing;
  top?: keyof typeof spacing;
  right?: keyof typeof spacing;
  bottom?: keyof typeof spacing;
  left?: keyof typeof spacing;
  auto?: boolean;
}>`
  ${props => props.auto && 'margin: 0 auto;'}
  ${props => props.all && `margin: ${spacing[props.all]};`}
  ${props => props.x && `margin-left: ${spacing[props.x]}; margin-right: ${spacing[props.x]};`}
  ${props => props.y && `margin-top: ${spacing[props.y]}; margin-bottom: ${spacing[props.y]};`}
  ${props => props.top && `margin-top: ${spacing[props.top]};`}
  ${props => props.right && `margin-right: ${spacing[props.right]};`}
  ${props => props.bottom && `margin-bottom: ${spacing[props.bottom]};`}
  ${props => props.left && `margin-left: ${spacing[props.left]};`}
`;

// Box component with padding and margin
export const Box = styled.div<{
  p?: keyof typeof spacing;
  px?: keyof typeof spacing;
  py?: keyof typeof spacing;
  pt?: keyof typeof spacing;
  pr?: keyof typeof spacing;
  pb?: keyof typeof spacing;
  pl?: keyof typeof spacing;
  m?: keyof typeof spacing;
  mx?: keyof typeof spacing;
  my?: keyof typeof spacing;
  mt?: keyof typeof spacing;
  mr?: keyof typeof spacing;
  mb?: keyof typeof spacing;
  ml?: keyof typeof spacing;
}>`
  ${props => props.p && `padding: ${spacing[props.p]};`}
  ${props => props.px && `padding-left: ${spacing[props.px]}; padding-right: ${spacing[props.px]};`}
  ${props => props.py && `padding-top: ${spacing[props.py]}; padding-bottom: ${spacing[props.py]};`}
  ${props => props.pt && `padding-top: ${spacing[props.pt]};`}
  ${props => props.pr && `padding-right: ${spacing[props.pr]};`}
  ${props => props.pb && `padding-bottom: ${spacing[props.pb]};`}
  ${props => props.pl && `padding-left: ${spacing[props.pl]};`}
  
  ${props => props.m && `margin: ${spacing[props.m]};`}
  ${props => props.mx && `margin-left: ${spacing[props.mx]}; margin-right: ${spacing[props.mx]};`}
  ${props => props.my && `margin-top: ${spacing[props.my]}; margin-bottom: ${spacing[props.my]};`}
  ${props => props.mt && `margin-top: ${spacing[props.mt]};`}
  ${props => props.mr && `margin-right: ${spacing[props.mr]};`}
  ${props => props.mb && `margin-bottom: ${spacing[props.mb]};`}
  ${props => props.ml && `margin-left: ${spacing[props.ml]};`}
`;

// Inline spacing wrapper
export const InlineSpace = styled.span<{
  gap?: keyof typeof spacing;
}>`
  display: inline-flex;
  gap: ${props => spacing[props.gap || '2']};
  align-items: center;
`;

// Vertical spacing stack
export const VStack = styled.div<{
  spacing?: keyof typeof spacing;
  align?: 'start' | 'center' | 'end' | 'stretch';
}>`
  display: flex;
  flex-direction: column;
  gap: ${props => spacing[props.spacing || '4']};
  align-items: ${props => {
    switch (props.align) {
      case 'start': return 'flex-start';
      case 'center': return 'center';
      case 'end': return 'flex-end';
      case 'stretch': return 'stretch';
      default: return 'stretch';
    }
  }};
`;

// Horizontal spacing stack
export const HStack = styled.div<{
  spacing?: keyof typeof spacing;
  align?: 'top' | 'center' | 'bottom' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: row;
  gap: ${props => spacing[props.spacing || '4']};
  align-items: ${props => {
    switch (props.align) {
      case 'top': return 'flex-start';
      case 'center': return 'center';
      case 'bottom': return 'flex-end';
      case 'stretch': return 'stretch';
      default: return 'center';
    }
  }};
  justify-content: ${props => {
    switch (props.justify) {
      case 'start': return 'flex-start';
      case 'center': return 'center';
      case 'end': return 'flex-end';
      case 'between': return 'space-between';
      case 'around': return 'space-around';
      default: return 'flex-start';
    }
  }};
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
`;