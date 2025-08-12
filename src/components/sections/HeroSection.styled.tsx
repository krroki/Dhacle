'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import styled from 'styled-components';
import { 
  StripeButton, 
  StripeTypography, 
  StripeGradient 
} from '@/components/design-system';
import { theme, colors, spacing, media } from '@/components/design-system/common';

// Styled components
const HeroContainer = styled(StripeGradient)`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    180deg, 
    ${colors.neutral.white}00 0%, 
    ${colors.neutral.white}40 50%, 
    ${colors.neutral.white}80 100%
  );
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 0 ${spacing['4']};
  max-width: 80rem;
  margin: 0 auto;
  
  ${media.sm} {
    padding: 0 ${spacing['6']};
  }
  
  ${media.lg} {
    padding: 0 ${spacing['8']};
  }
`;

const Title = styled(StripeTypography)`
  margin-bottom: ${spacing['6']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const StatsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing['8']};
  margin-bottom: ${spacing['8']};
  
  ${media.sm} {
    flex-direction: row;
  }
`;

const StatBox = styled.div`
  text-align: center;
`;

const StatLabel = styled(StripeTypography)`
  margin-bottom: ${spacing['2']};
`;

const StatValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${spacing['1']};
`;

const StatNumber = styled(StripeTypography)`
  font-weight: ${theme.typography.fontWeight.bold};
`;

const Divider = styled.div`
  display: none;
  width: 1px;
  height: 3rem;
  background-color: ${colors.neutral.gray['200']};
  
  ${media.sm} {
    display: block;
  }
`;

const ButtonContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing['4']};
  margin-bottom: ${spacing['16']};
  
  ${media.sm} {
    flex-direction: row;
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: ${spacing['8']};
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
`;

const ChevronIcon = styled(ChevronDown)`
  color: ${colors.text.primary.light};
`;

const DecorativeElements = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const GradientOrb = styled.div<{ position: 'top-left' | 'bottom-right' }>`
  position: absolute;
  width: 20rem;
  height: 20rem;
  border-radius: 50%;
  filter: blur(48px);
  opacity: 0.2;
  
  ${props => props.position === 'top-left' ? `
    top: -10rem;
    left: -10rem;
    background: radial-gradient(circle, ${colors.primary.blue.default}, transparent);
  ` : `
    bottom: -10rem;
    right: -10rem;
    background: radial-gradient(circle, ${colors.primary.lightBlue}, transparent);
  `}
`;

export function HeroSection() {
  const [studentCount, setStudentCount] = useState(10200);
  const [totalRevenue, setTotalRevenue] = useState(42.0);

  // Animate counters on mount
  useEffect(() => {
    // Animate student count
    const studentInterval = setInterval(() => {
      setStudentCount(prev => {
        if (prev >= 10342) {
          clearInterval(studentInterval);
          return 10342;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 50);

    // Animate revenue
    const revenueInterval = setInterval(() => {
      setTotalRevenue(prev => {
        if (prev >= 42.3) {
          clearInterval(revenueInterval);
          return 42.3;
        }
        return Math.min(prev + 0.1, 42.3);
      });
    }, 100);

    return () => {
      clearInterval(studentInterval);
      clearInterval(revenueInterval);
    };
  }, []);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <HeroContainer variant="hero" animated>
      {/* Background overlay for better text readability */}
      <BackgroundOverlay />

      {/* Main content container */}
      <ContentContainer>
        {/* Main title with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Title variant="h1" color="primary">
            유튜브로 월 1000만원,
            <br />
            우리가 증명합니다
          </Title>
        </motion.div>

        {/* Statistics section */}
        <StatsContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {/* Student count */}
          <StatBox>
            <StatLabel variant="caption" color="muted">
              현재 수강생
            </StatLabel>
            <StatValue>
              <StatNumber variant="h3" color="primary">
                {studentCount.toLocaleString('ko-KR')}
              </StatNumber>
              <StripeTypography variant="body" color="muted">
                명
              </StripeTypography>
            </StatValue>
          </StatBox>

          {/* Divider */}
          <Divider />

          {/* Total revenue */}
          <StatBox>
            <StatLabel variant="caption" color="muted">
              총 수익
            </StatLabel>
            <StatValue>
              <StatNumber variant="h3" color="primary">
                ₩{totalRevenue.toFixed(1)}
              </StatNumber>
              <StripeTypography variant="body" color="muted">
                억
              </StripeTypography>
            </StatValue>
          </StatBox>
        </StatsContainer>

        {/* CTA Buttons */}
        <ButtonContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <StripeButton 
            variant="primary" 
            size="lg"
            onClick={() => console.log('무료 체험 시작하기 클릭')}
          >
            무료 체험 시작하기
          </StripeButton>
          <StripeButton 
            variant="secondary" 
            size="lg"
            onClick={() => console.log('성공 사례 보기 클릭')}
          >
            성공 사례 보기
          </StripeButton>
        </ButtonContainer>

        {/* Scroll indicator */}
        <ScrollIndicator
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          onClick={scrollToNext}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <ChevronIcon size={32} />
          </motion.div>
        </ScrollIndicator>
      </ContentContainer>

      {/* Decorative elements */}
      <DecorativeElements>
        {/* Top-left gradient orb */}
        <GradientOrb position="top-left" />
        {/* Bottom-right gradient orb */}
        <GradientOrb position="bottom-right" />
      </DecorativeElements>
    </HeroContainer>
  );
}