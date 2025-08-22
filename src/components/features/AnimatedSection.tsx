'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  fadeInLeft,
  fadeInRight,
  fadeInUp,
  scaleIn,
  useScrollAnimation,
} from '@/hooks/use-scroll-animation';

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn';
  className?: string;
  delay?: number;
}

const animation_variants = {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
};

export function AnimatedSection({
  children,
  animation = 'fadeInUp',
  className = '',
  delay = 0,
}: AnimatedSectionProps) {
  const { ref, controls } = useScrollAnimation();

  const variants = animation_variants[animation];

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={variants}
      className={className}
      style={delay > 0 ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </motion.div>
  );
}

// Example usage component for the main page
export function HeroSectionAnimated() {
  return (
    <div className="container-responsive py-20">
      <AnimatedSection animation="fadeInUp" className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          YouTube Shorts의 <span className="text-primary">성공 비결</span>
        </h1>
      </AnimatedSection>

      <AnimatedSection animation="fadeInUp" delay={0.2} className="text-center mb-12">
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          체계적인 교육과 실전 노하우로 당신도 성공적인 크리에이터가 될 수 있습니다
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <AnimatedSection animation="fadeInLeft" delay={0.3}>
          <div className="p-6 bg-card rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">체계적인 커리큘럼</h3>
            <p className="text-muted-foreground">
              입문부터 고급까지 단계별로 구성된 전문 교육 과정
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="scaleIn" delay={0.4}>
          <div className="p-6 bg-card rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">실전 노하우</h3>
            <p className="text-muted-foreground">성공한 크리에이터들의 검증된 전략과 팁 공유</p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fadeInRight" delay={0.5}>
          <div className="p-6 bg-card rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">커뮤니티 지원</h3>
            <p className="text-muted-foreground">함께 성장하는 크리에이터 네트워크와 멘토링</p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
