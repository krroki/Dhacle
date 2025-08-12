import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme, colors, spacing, typography, borderRadius, shadows } from '@/components/design-system/common';

export const SliderSection = styled.section`
  padding: ${spacing[16]} ${spacing[4]};
  background: linear-gradient(180deg, ${colors.neutral.offWhite} 0%, ${colors.neutral.white} 100%);
  position: relative;
  overflow: hidden;
`;

export const SliderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${spacing[12]};
`;

export const TitleWrapper = styled(motion.div)``;

export const SubtitleWrapper = styled.div`
  margin-top: ${spacing[2]};
`;

export const SliderWrapper = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;
`;

export const SlideContainer = styled(motion.div)`
  position: absolute;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${spacing[4]};
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  margin-bottom: ${spacing[4]};
`;

export const Avatar = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.full};
  overflow: hidden;
  border: 2px solid ${colors.primary.blue.default};
`;

export const UserDetails = styled.div`
  flex: 1;
`;

export const UserName = styled.div`
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
`;

export const VerifiedBadge = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: ${colors.primary.blue.default};
  border-radius: ${borderRadius.full};
  color: ${colors.neutral.white};
  font-size: 12px;
`;

export const UserDate = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[1]};
  color: ${colors.text.primary.light};
  font-size: ${typography.fontSize.sm};
  margin-top: ${spacing[1]};
`;

export const AmountDisplay = styled.div`
  margin-bottom: ${spacing[4]};
`;

export const AmountLabel = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.primary.light};
  margin-bottom: ${spacing[1]};
`;

export const AmountValue = styled(motion.div)`
  font-size: 28px;
  font-weight: ${typography.fontWeight.bold};
  background: linear-gradient(135deg, ${colors.primary.blue.default} 0%, ${colors.primary.blue.hover} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const CourseInfo = styled.div`
  padding-top: ${spacing[3]};
  border-top: 1px solid ${colors.neutral.gray['200']};
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
`;

export const CourseIcon = styled.div`
  color: ${colors.text.primary.light};
  display: flex;
  align-items: center;
`;

export const CourseName = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.primary.default};
  line-height: 1.4;
`;

export const ProgressDots = styled.div`
  display: flex;
  justify-content: center;
  gap: ${spacing[2]};
  margin-top: ${spacing[8]};
`;

export const Dot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: ${borderRadius.full};
  border: none;
  background: ${props => props.$active ? colors.primary.blue.default : colors.neutral.gray['300']};
  cursor: pointer;
  transition: all 200ms ease;
  padding: 0;
  
  &:hover {
    transform: scale(1.2);
  }
`;

export const BackgroundDecoration = styled.div`
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, ${colors.primary.lightBlue}20 0%, transparent 70%);
  pointer-events: none;
`;