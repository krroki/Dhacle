'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { YouTubeEmbed } from './YouTubeEmbed';
import { useAuth } from '@/lib/auth/AuthContext';
import type { HeroSlide as HeroSlideType } from './types';

interface HeroSlideProps {
  slide: HeroSlideType;
}

export function HeroSlide({ slide }: HeroSlideProps) {
  const { user } = useAuth();
  
  // 로그인된 사용자는 /courses로, 아니면 원래 링크로
  const getCtaLink = () => {
    if (slide.ctaLink === '/auth/signup' && user) {
      return '/courses';
    }
    return slide.ctaLink;
  };
  
  // 로그인된 사용자는 다른 텍스트 표시
  const getCtaText = () => {
    if (slide.ctaLink === '/auth/signup' && user) {
      return '강의 둘러보기';
    }
    return slide.ctaText;
  };
  return (
    <div className="relative w-full h-[500px] md:h-[600px]">
      <div className="absolute inset-0">
        {slide.type === 'youtube' ? (
          <YouTubeEmbed videoId={slide.mediaUrl} title={slide.title} />
        ) : (
          <Image
            src={slide.mediaUrl}
            alt={slide.title}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      
      <div className="relative h-full container-responsive flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {slide.title}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            {slide.subtitle}
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
            <Link href={getCtaLink()}>{getCtaText()}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}