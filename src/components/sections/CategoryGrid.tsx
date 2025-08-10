'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
import { useTheme } from '@/lib/theme/ThemeProvider';

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

export function CategoryGrid() {
  const { theme } = useTheme();

  // Media query handling with JavaScript
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ 
      padding: `${theme.spacing[12]} ${theme.spacing[4]}`,
      backgroundColor: theme.colors.neutral.white
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Category Grid - Title removed as requested */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
          gap: theme.spacing[4]
        }}>
          {categories.map((category, index) => (
            <motion.a
              key={category.id}
              href={category.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: theme.spacing[6],
                backgroundColor: theme.colors.neutral.white,
                borderRadius: theme.borderRadius.lg,
                border: `1px solid ${theme.colors.neutral.gray['200']}`,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = category.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = theme.colors.neutral.gray['200'];
              }}
            >
              {/* Icon Container */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: `${category.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.spacing[3],
                color: category.color
              }}>
                {category.icon}
              </div>

              {/* Category Name */}
              <StripeTypography 
                variant="body" 
                color="dark"
                className="font-semibold"
                style={{ marginBottom: theme.spacing[1] }}
              >
                {category.name}
              </StripeTypography>

              {/* Category Subname */}
              <StripeTypography 
                variant="caption" 
                color="muted"
                style={{ fontSize: '12px' }}
              >
                {category.subname}
              </StripeTypography>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}