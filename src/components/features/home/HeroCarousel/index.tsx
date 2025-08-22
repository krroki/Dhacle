'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { carouselItems, preloadImages } from './data';
import { HeroSlide } from './HeroSlide';

const AUTOPLAY_DELAY = 4000; // 4초
const PROGRESS_INTERVAL = 50; // 50ms마다 업데이트

export function HeroCarousel() {
  const [api, set_api] = useState<CarouselApi>();
  const [current, set_current] = useState(0);
  const [count, set_count] = useState(0);
  const [is_autoplay_paused, set_is_autoplay_paused] = useState(false);
  const [selected_index, set_selected_index] = useState(0);

  const progress_interval = useRef<NodeJS.Timeout | null>(null);
  const autoplay_timeout = useRef<NodeJS.Timeout | null>(null);
  const progress_bar_ref = useRef<HTMLDivElement>(null);

  // 이미지 프리로드 최적화 (viewport에 가까운 슬라이드만)
  useEffect(() => {
    const preload_nearby_images = () => {
      const current_index = api?.selectedScrollSnap() ?? 0;
      const items_to_preload = [
        carouselItems[current_index - 1],
        carouselItems[current_index],
        carouselItems[current_index + 1],
      ].filter((item): item is (typeof carouselItems)[0] => Boolean(item));

      preloadImages(items_to_preload);
    };

    if (api) {
      api.on('select', preload_nearby_images);
      preload_nearby_images();

      return () => {
        api.off('select', preload_nearby_images);
      };
    }
    // API가 없을 때 처음 3개만 프리로드
    preloadImages(carouselItems.slice(0, 3));
    return undefined;
  }, [api]);

  // Carousel API 설정
  useEffect(() => {
    if (!api) {
      return;
    }

    set_count(api.scrollSnapList().length);
    set_current(api.selectedScrollSnap());

    const on_select = () => {
      set_current(api.selectedScrollSnap());
      set_selected_index(api.selectedScrollSnap());
      // 슬라이드 변경 시 프로그레스 리셋
      if (progress_bar_ref.current) {
        progress_bar_ref.current.style.setProperty('--progress-width', '0%');
      }
    };

    api.on('select', on_select);

    return () => {
      api.off('select', on_select);
    };
  }, [api]);

  // 다음 슬라이드로 이동
  const go_to_next = useCallback(() => {
    if (!api) {
      return;
    }
    api.scrollNext();
  }, [api]);

  // 이전 슬라이드로 이동
  const go_to_prev = useCallback(() => {
    if (!api) {
      return;
    }
    api.scrollPrev();
  }, [api]);

  // 자동재생 및 프로그레스바 관리
  useEffect(() => {
    if (!api || is_autoplay_paused) {
      // 일시정지 시 타이머 정리
      if (progress_interval.current) {
        clearInterval(progress_interval.current);
        progress_interval.current = null;
      }
      if (autoplay_timeout.current) {
        clearTimeout(autoplay_timeout.current);
        autoplay_timeout.current = null;
      }
      return;
    }

    // 프로그레스바 업데이트
    let local_progress = 0;
    progress_interval.current = setInterval(() => {
      local_progress += (100 * PROGRESS_INTERVAL) / AUTOPLAY_DELAY;

      if (local_progress >= 100) {
        // 100% 도달 시 다음 슬라이드로
        go_to_next();
        local_progress = 0;
      }

      // Set CSS variable for progress width
      if (progress_bar_ref.current) {
        progress_bar_ref.current.style.setProperty('--progress-width', `${local_progress}%`);
        progress_bar_ref.current.style.setProperty('--progress-duration', `${PROGRESS_INTERVAL}ms`);
      }
    }, PROGRESS_INTERVAL);

    // 클린업
    return () => {
      if (progress_interval.current) {
        clearInterval(progress_interval.current);
        progress_interval.current = null;
      }
      if (autoplay_timeout.current) {
        clearTimeout(autoplay_timeout.current);
        autoplay_timeout.current = null;
      }
    };
  }, [api, is_autoplay_paused, go_to_next]);

  // 마우스 호버 시 자동재생 일시정지
  const handle_mouse_enter = useCallback(() => {
    set_is_autoplay_paused(true);
  }, []);

  const handle_mouse_leave = useCallback(() => {
    set_is_autoplay_paused(false);
  }, []);

  // 키보드 네비게이션
  const handle_key_down = useCallback(
    (e: React.KeyboardEvent) => {
      if (!api) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go_to_prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go_to_next();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        // 스페이스바나 엔터로 자동재생 토글
        set_is_autoplay_paused((prev) => !prev);
      }
    },
    [api, go_to_next, go_to_prev]
  );

  // 모션 설정 체크 (접근성)
  const prefers_reduced_motion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // 자동재생이 비활성화되어야 하는 경우
  const should_disable_autoplay = prefers_reduced_motion;

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="메인 프로모션 캐러셀"
      aria-roledescription="carousel"
      onMouseEnter={handle_mouse_enter}
      onMouseLeave={handle_mouse_leave}
    >
      <Carousel
        setApi={set_api}
        className="w-full"
        opts={{
          align: 'center',
          loop: true,
          containScroll: false,
          duration: prefers_reduced_motion ? 0 : 30,
        }}
        onKeyDown={handle_key_down}
      >
        <CarouselContent className="-ml-0">
          {carouselItems.map((slide, index) => (
            <CarouselItem
              key={slide.id}
              className={cn('embla_Slide pl-0', selected_index === index && 'is-selected')}
              aria-label={`슬라이드 ${index + 1} / ${carouselItems.length}: ${slide.alt}`}
              aria-current={current === index ? 'true' : 'false'}
            >
              <div className="hero-carousel-slide w-full">
                <HeroSlide slide={slide} index={index} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* 커스텀 네비게이션 버튼 - 항상 표시, 무한 루프 */}
        <button
          onClick={go_to_prev}
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
          onClick={go_to_next}
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
      {!should_disable_autoplay && (
        <div ref={progress_bar_ref} className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            className="h-full bg-white transition-all ease-linear w-[var(--progress-width,0%)] duration-[var(--progress-duration,50ms)]"
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
              current === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
            )}
            onClick={() => {
              api?.scrollTo(index);
              if (progress_bar_ref.current) {
                progress_bar_ref.current.style.setProperty('--progress-width', '0%');
              }
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
        {is_autoplay_paused ? '자동 재생 일시정지됨' : '자동 재생 중'}
      </div>

      {/* 키보드 단축키 안내 (스크린리더용) */}
      <div className="sr-only">
        키보드 단축키: 왼쪽/오른쪽 화살표로 이동, 스페이스바로 자동재생 토글
      </div>
    </section>
  );
}
