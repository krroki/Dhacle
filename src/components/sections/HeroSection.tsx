'use client';

import {
  StripeButton,
  StripeTypography,
  StripeGradient,
} from '@/components/design-system';
import { useEffect, useState } from 'react';
import content from '../../../content-map.complete.json';

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <StripeGradient 
      variant="primary" 
      animated 
      intensity="medium"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-primary/80">{content.extracted.hero.badge}</span>
          </div>

          {/* Headline */}
          <StripeTypography variant="h1" color="dark" className="mb-6">
            {content.extracted.hero.title.split('\n')[0]}
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              {content.extracted.hero.title.split('\n')[1]}
            </span>
          </StripeTypography>

          {/* Subheadline */}
          <StripeTypography variant="body" color="light" className="mb-8 max-w-2xl mx-auto text-xl">
            {content.extracted.hero.subtitle}
          </StripeTypography>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <StripeButton variant="gradient" size="lg" className="min-w-[200px]">
              {content.extracted.hero.cta.primary}
            </StripeButton>
            <StripeButton variant="secondary" size="lg" className="min-w-[200px]">
              {content.extracted.hero.cta.secondary}
            </StripeButton>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{content.extracted.hero.stats.users}</div>
              <div className="text-sm text-primary/60">활성 사용자</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{content.extracted.hero.stats.videosProcessed}</div>
              <div className="text-sm text-primary/60">처리된 영상</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{content.extracted.hero.stats.avgTimeSaved}</div>
              <div className="text-sm text-primary/60">시간 절감</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{content.extracted.hero.stats.satisfaction}</div>
              <div className="text-sm text-primary/60">만족도</div>
            </div>
          </div>
        </div>
      </div>

    </StripeGradient>
  );
}