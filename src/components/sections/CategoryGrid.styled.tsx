'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { 
  Cpu, 
  Palette, 
  Video, 
  Code, 
  PenTool, 
  Film, 
  TrendingUp, 
  Brush, 
  Briefcase, 
  Grid 
} from 'lucide-react';
import { StripeTypography } from '@/components/design-system';
import { theme, colors, spacing, borderRadius, media } from '@/components/design-system/common';

interface Category {
  id: number;
  name: string;
  subname: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}

const categories: Category[] = [
  { id: 1, name: 'AI TECH', subname: 'AI 기술', icon: <Cpu size={28} />, link: '/category/ai-tech', color: '#6366F1' },
  { id: 2, name: 'AI CREATIVE', subname: 'AI 창작', icon: <Palette size={28} />, link: '/category/ai-creative', color: '#8B5CF6' },
  { id: 3, name: '쇼츠/릴스', subname: '영상', icon: <Video size={28} />, link: '/category/shorts', color: '#EC4899' },
  { id: 4, name: '개발/데이터', subname: '코딩', icon: <Code size={28} />, link: '/category/development', color: '#3B82F6' },
  { id: 5, name: '디자인', subname: '그래픽', icon: <PenTool size={28} />, link: '/category/design', color: '#F59E0B' },
  { id: 6, name: '영상/3D', subname: '편집', icon: <Film size={28} />, link: '/category/video-3d', color: '#EF4444' },
  { id: 7, name: '금융/투자', subname: '수익', icon: <TrendingUp size={28} />, link: '/category/finance', color: '#10B981' },
  { id: 8, name: '드로잉', subname: '아트', icon: <Brush size={28} />, link: '/category/drawing', color: '#F97316' },
  { id: 9, name: '비즈니스', subname: '전략', icon: <Briefcase size={28} />, link: '/category/business', color: '#06B6D4' },
  { id: 10, name: '전체보기', subname: '더보기', icon: <Grid size={28} />, link: '/courses/all', color: '#6B7280' }
];

// Styled components
const CategorySection = styled.div`
  padding: ${spacing[10]} ${spacing[6]};
  background-color: ${colors.neutral.white};
`;

const CategoryContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const CategoryGridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing[4]};
  
  ${media.md} {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const CategoryCard = styled(motion.a)<{ $hoverColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${spacing[6]};
  background-color: ${colors.neutral.white};
  border-radius: ${borderRadius.lg};
  border: 1px solid ${colors.neutral.gray['200']};
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  will-change: transform, box-shadow;
  
  &:hover {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.$hoverColor};
    transform: translateY(-2px);
  }
`;

const IconContainer = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.$color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[3]};
  color: ${props => props.$color};
`;

const CategoryName = styled(StripeTypography)`
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${spacing[1]};
`;

const CategorySubname = styled(StripeTypography)`
  font-size: 12px;
`;

export function CategoryGrid() {
  return (
    <CategorySection>
      <CategoryContainer>
        <CategoryGridWrapper>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              href={category.link}
              $hoverColor={category.color}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              {/* Icon Container */}
              <IconContainer $color={category.color}>
                {category.icon}
              </IconContainer>

              {/* Category Name */}
              <CategoryName 
                variant="body" 
                color="dark"
              >
                {category.name}
              </CategoryName>

              {/* Category Subname */}
              <CategorySubname 
                variant="caption" 
                color="muted"
              >
                {category.subname}
              </CategorySubname>
            </CategoryCard>
          ))}
        </CategoryGridWrapper>
      </CategoryContainer>
    </CategorySection>
  );
}