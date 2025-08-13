'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getYouTubeThumbnail } from './data';
import type { CarouselItem } from './data';

interface HeroSlideProps {
  slide: CarouselItem;
}

export function HeroSlide({ slide }: HeroSlideProps) {
  return (
    <Link 
      href={slide.link}
      className="relative block w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden group"
      aria-label={slide.alt}
    >
      {/* 이미지/YouTube 썸네일 표시 */}
      <Image
        src={slide.type === 'youtube' 
          ? getYouTubeThumbnail(slide.src, 'max') 
          : slide.src
        }
        alt={slide.alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
        sizes="100vw"
      />
      
      {/* 그라데이션 오버레이 - 호버 시 약간 밝아짐 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all duration-300" />
      
      {/* YouTube 아이콘 표시 (YouTube 비디오인 경우) */}
      {slide.type === 'youtube' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 bg-red-600/90 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
            <svg 
              className="w-10 h-10 text-white ml-1" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </Link>
  );
}