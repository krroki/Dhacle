/**
 * Typography components using styled-components
 * SSR-safe, direct token usage from theme.deep.json
 */

import styled, { css } from 'styled-components';
import { colors, typography, media } from './common';

// Base typography styles
const baseTypography = css`
  margin: 0;
  padding: 0;
  font-family: ${typography.fontFamily.base};
`;

// H1 - Main headings
export const H1 = styled.h1<{ color?: 'primary' | 'dark' | 'light' | 'muted' | 'inverse' }>`
  ${baseTypography}
  font-size: ${typography.fontSize['5xl']};
  font-weight: ${typography.fontWeight.bold};
  line-height: ${typography.lineHeight.tight};
  letter-spacing: ${typography.letterSpacing.tight};
  color: ${props => {
    switch (props.color) {
      case 'dark': return colors.text.primary.dark;
      case 'light': return colors.text.primary.light;
      case 'muted': return colors.neutral.gray['500'];
      case 'inverse': return '#ffffff';
      default: return colors.text.primary.default;
    }
  }};
  
  ${media.md} {
    font-size: 4rem; /* 64px - Stripe's h1 size */
  }
`;

// H2 - Section headings
export const H2 = styled.h2<{ color?: 'primary' | 'dark' | 'light' | 'muted' | 'inverse' }>`
  ${baseTypography}
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.bold};
  line-height: ${typography.lineHeight.tight};
  letter-spacing: ${typography.letterSpacing.tight};
  color: ${props => {
    switch (props.color) {
      case 'dark': return colors.text.primary.dark;
      case 'light': return colors.text.primary.light;
      case 'muted': return colors.neutral.gray['500'];
      case 'inverse': return '#ffffff';
      default: return colors.text.primary.default;
    }
  }};
  
  ${media.md} {
    font-size: ${typography.fontSize['5xl']};
  }
`;

// H3 - Sub-section headings
export const H3 = styled.h3<{ color?: 'primary' | 'dark' | 'light' | 'muted' | 'inverse' }>`
  ${baseTypography}
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.semibold};
  line-height: ${typography.lineHeight.normal};
  color: ${props => {
    switch (props.color) {
      case 'dark': return colors.text.primary.dark;
      case 'light': return colors.text.primary.light;
      case 'muted': return colors.neutral.gray['500'];
      case 'inverse': return '#ffffff';
      default: return colors.text.primary.default;
    }
  }};
  
  ${media.md} {
    font-size: ${typography.fontSize['4xl']};
  }
`;

// H4 - Small headings
export const H4 = styled.h4<{ color?: 'primary' | 'dark' | 'light' | 'muted' | 'inverse' }>`
  ${baseTypography}
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.semibold};
  line-height: ${typography.lineHeight.normal};
  color: ${props => {
    switch (props.color) {
      case 'dark': return colors.text.primary.dark;
      case 'light': return colors.text.primary.light;
      case 'muted': return colors.neutral.gray['500'];
      case 'inverse': return '#ffffff';
      default: return colors.text.primary.default;
    }
  }};
`;

// Body text
export const Body = styled.p<{ 
  size?: 'sm' | 'base' | 'lg';
  color?: 'primary' | 'dark' | 'light' | 'muted' | 'inverse';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}>`
  ${baseTypography}
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return typography.fontSize.sm;
      case 'lg': return typography.fontSize.lg;
      default: return typography.fontSize.base;
    }
  }};
  font-weight: ${props => {
    switch (props.weight) {
      case 'medium': return typography.fontWeight.medium;
      case 'semibold': return typography.fontWeight.semibold;
      case 'bold': return typography.fontWeight.bold;
      default: return typography.fontWeight.normal;
    }
  }};
  line-height: ${typography.lineHeight.relaxed};
  color: ${props => {
    switch (props.color) {
      case 'dark': return colors.text.primary.dark;
      case 'light': return colors.text.primary.light;
      case 'muted': return colors.neutral.gray['500'];
      case 'inverse': return '#ffffff';
      default: return colors.text.primary.default;
    }
  }};
`;

// Caption text
export const Caption = styled.span<{ color?: 'primary' | 'dark' | 'light' | 'muted' | 'inverse' }>`
  ${baseTypography}
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.normal};
  line-height: ${typography.lineHeight.normal};
  color: ${props => {
    switch (props.color) {
      case 'dark': return colors.text.primary.dark;
      case 'light': return colors.text.primary.light;
      case 'muted': return colors.neutral.gray['500'];
      case 'inverse': return '#ffffff';
      default: return colors.text.primary.default;
    }
  }};
`;

// Code text
export const Code = styled.code`
  ${baseTypography}
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.normal};
  background-color: ${colors.neutral.gray['50']};
  padding: 2px 6px;
  border-radius: 4px;
  color: ${colors.text.primary.default};
`;

// Label text (for forms)
export const Label = styled.label<{ required?: boolean }>`
  ${baseTypography}
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.text.primary.default};
  display: block;
  margin-bottom: 4px;
  
  ${props => props.required && css`
    &::after {
      content: ' *';
      color: #ED5E5E;
    }
  `}
`;

// Link text
export const Link = styled.a<{ underline?: boolean }>`
  ${baseTypography}
  font-size: inherit;
  color: ${colors.primary.blue.default};
  text-decoration: ${props => props.underline ? 'underline' : 'none'};
  cursor: pointer;
  transition: color 200ms ease;
  
  &:hover {
    color: ${colors.primary.blue.hover};
    text-decoration: underline;
  }
  
  &:active {
    color: ${colors.primary.blue.active};
  }
`;

// Backwards compatibility wrapper for StripeTypography
export const StripeTypography = styled.div<{
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'code';
  color?: 'primary' | 'dark' | 'light' | 'muted' | 'inverse';
}>`
  ${props => {
    switch (props.variant) {
      case 'h1':
        return css`
          font-size: ${typography.fontSize['5xl']};
          font-weight: ${typography.fontWeight.bold};
          line-height: ${typography.lineHeight.tight};
        `;
      case 'h2':
        return css`
          font-size: ${typography.fontSize['4xl']};
          font-weight: ${typography.fontWeight.bold};
          line-height: ${typography.lineHeight.tight};
        `;
      case 'h3':
        return css`
          font-size: ${typography.fontSize['3xl']};
          font-weight: ${typography.fontWeight.semibold};
          line-height: ${typography.lineHeight.normal};
        `;
      case 'h4':
        return css`
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.semibold};
          line-height: ${typography.lineHeight.normal};
        `;
      case 'caption':
        return css`
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.normal};
        `;
      case 'code':
        return css`
          font-family: ${typography.fontFamily.mono};
          font-size: ${typography.fontSize.sm};
        `;
      default:
        return css`
          font-size: ${typography.fontSize.base};
          font-weight: ${typography.fontWeight.normal};
          line-height: ${typography.lineHeight.relaxed};
        `;
    }
  }}
  
  color: ${props => {
    switch (props.color) {
      case 'dark': return colors.text.primary.dark;
      case 'light': return colors.text.primary.light;
      case 'muted': return colors.neutral.gray['500'];
      case 'inverse': return '#ffffff';
      default: return colors.text.primary.default;
    }
  }};
  
  font-family: ${props => props.variant === 'code' ? typography.fontFamily.mono : typography.fontFamily.base};
  margin: 0;
  padding: 0;
`;