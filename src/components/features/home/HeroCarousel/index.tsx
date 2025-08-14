'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { HeroSlide } from './HeroSlide';
import { carouselItems, preloadImages } from './data';

const AUTOPLAY_DELAY = 4000; // 4초
const PROGRESS_INTERVAL = 50; // 50ms마다 업데이트

export function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const autoplayTimeout = useRef<NodeJS.Timeout | null>(null);

  // 이미지 프리로드 최적화 (viewport에 가까운 슬라이드만)
  useEffect(() => {
    const preloadNearbyImages = () => {
      const currentIndex = api?.selectedScrollSnap() ?? 0;
      const itemsToPreload = [
        carouselItems[currentIndex - 1],
        carouselItems[currentIndex],
        carouselItems[currentIndex + 1]
      ].filter(Boolean);
      
      preloadImages(itemsToPreload);
    };
    
    if (api) {
      api.on('select', preloadNearbyImages);
      preloadNearbyImages();
      
      return () => {
        api.off('select', preloadNearbyImages);
      };
    } else {
      // API가 없을 때 처음 3개만 프리로드
      preloadImages(carouselItems.slice(0, 3));
    }
  }, [api]);

  // Carousel API 설정
  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
      setSelectedIndex(api.selectedScrollSnap());
      setProgress(0); // 슬라이드 변경 시 프로그레스 리셋
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // 다음 슬라이드로 이동
  const goToNext = useCallback(() => {
    if (!api) return;
    api.scrollNext();
  }, [api]);

  // 이전 슬라이드로 이동
  const goToPrev = useCallback(() => {
    if (!api) return;
    api.scrollPrev();
  }, [api]);

  // 자동재생 및 프로그레스바 관리
  useEffect(() => {
    if (!api || isAutoplayPaused) {
      // 일시정지 시 타이머 정리
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      if (autoplayTimeout.current) {
        clearTimeout(autoplayTimeout.current);
        autoplayTimeout.current = null;
      }
      return;
    }

    // 프로그레스바 업데이트
    let localProgress = 0;
    progressInterval.current = setInterval(() => {
      localProgress += (100 * PROGRESS_INTERVAL) / AUTOPLAY_DELAY;
      
      if (localProgress >= 100) {
        // 100% 도달 시 다음 슬라이드로
        goToNext();
        localProgress = 0;
      }
      
      setProgress(localProgress);
    }, PROGRESS_INTERVAL);

    // 클린업
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      if (autoplayTimeout.current) {
        clearTimeout(autoplayTimeout.current);
        autoplayTimeout.current = null;
      }
    };
  }, [api, current, isAutoplayPaused, goToNext]);

  // 마우스 호버 시 자동재생 일시정지
  const handleMouseEnter = useCallback(() => {
    setIsAutoplayPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsAutoplayPaused(false);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!api) return;
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      // 스페이스바나 엔터로 자동재생 토글
      setIsAutoplayPaused(prev => !prev);
    }
  }, [api, goToNext, goToPrev]);

  // 모션 설정 체크 (접근성)
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // 자동재생이 비활성화되어야 하는 경우
  const shouldDisableAutoplay = prefersReducedMotion;

  return (
    <section 
      className="relative w-full max-w-[1920px] mx-auto overflow-hidden"
      aria-label="메인 프로모션 캐러셀"
      aria-roledescription="carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: 'center',
          loop: true,
          containScroll: false,
          duration: prefersReducedMotion ? 0 : 30,
        }}
        onKeyDown={handleKeyDown}
      >
        <CarouselContent className="-ml-0">
          {carouselItems.map((slide, index) => (
            <CarouselItem 
              key={slide.id} 
              className={cn(
                "embla__slide pl-0",
                selectedIndex === index && "is-selected"
              )}
              aria-label={`슬라이드 ${index + 1} / ${carouselItems.length}: ${slide.alt}`}
              aria-current={current === index ? 'true' : 'false'}
            >
              <div className="hero-carousel-slide rounded-lg overflow-hidden">
                <HeroSlide slide={slide} index={index} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* 커스텀 네비게이션 버튼 - 항상 표시, 무한 루프 */}
        <button
          onClick={goToPrev}
          className="absolute left-4 sm:left-8 lg:left-[5%] top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30 text-white transition-all duration-300 flex items-center justify-center z-10"
          aria-label="이전 슬라이드"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 sm:right-8 lg:right-[5%] top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30 text-white transition-all duration-300 flex items-center justify-center z-10"
          aria-label="다음 슬라이드"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </Carousel>
      
      {/* 프로그레스바 */}
      {!shouldDisableAutoplay && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div 
            className="h-full bg-white transition-all ease-linear"
            style={{ 
              width: `${progress}%`,
              transitionDuration: `${PROGRESS_INTERVAL}ms`
            }}
            aria-hidden="true"
          />
        </div>
      )}
      
      {/* 도트 인디케이터 */}
      <div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10"
        role="tablist"
        aria-label="슬라이드 선택"
      >
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-2 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent',
              current === index 
                ? 'w-8 bg-white' 
                : 'w-2 bg-white/50 hover:bg-white/70'
            )}
            onClick={() => {
              api?.scrollTo(index);
              setProgress(0);
            }}
            role="tab"
            aria-selected={current === index}
            aria-label={`슬라이드 ${index + 1}로 이동`}
            aria-controls={`slide-${index + 1}`}
          />
        ))}
      </div>
      
      {/* 자동재생 상태 표시 (스크린리더용) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isAutoplayPaused ? '자동 재생 일시정지됨' : '자동 재생 중'}
      </div>
      
      {/* 키보드 단축키 안내 (스크린리더용) */}
      <div className="sr-only">
        키보드 단축키: 왼쪽/오른쪽 화살표로 이동, 스페이스바로 자동재생 토글
      </div>
    </section>
  );
}