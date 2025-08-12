'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { theme } from '@/components/design-system/common';
import { carouselSlides, getSlideImage } from '@/data/carousel-data';
import styled from 'styled-components';

// Styled Components
const CarouselSection = styled.section`
  width: 100%;
  padding: 40px 0;
  background: ${theme.colors.neutral.white};
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  margin: 0;
  overflow: hidden;
`;

const SlideViewport = styled.div`
  position: relative;
  width: 100%;
  height: 423.42px; /* 패스트캠퍼스와 동일한 높이 */
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 280px;
  }
`;

const SlideTrack = styled.div<{ $translateX: number; $isTransitioning: boolean }>`
  display: flex;
  height: 100%;
  transform: translateX(${props => props.$translateX}px);
  transition: ${props => props.$isTransitioning ? 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none'};
`;

const SlideItem = styled.div<{ $isActive: boolean }>`
  flex: 0 0 1147.5px; /* 패스트캠퍼스와 동일한 너비 */
  height: 100%;
  margin: 0 12px; /* 간격 */
  position: relative;
  cursor: pointer;
  border-radius: 20px;
  overflow: hidden;
  opacity: 1; /* 투명도 제거 - 모든 슬라이드 100% 불투명 */
  transform: scale(${props => props.$isActive ? 1 : 0.95});
  transition: all 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  &:hover {
    transform: scale(${props => props.$isActive ? 1.02 : 0.97});
  }
  
  /* 하단 그라데이션 오버레이 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    pointer-events: none;
  }
  
  @media (max-width: 1024px) {
    flex: 0 0 85%;
  }
  
  @media (max-width: 768px) {
    flex: 0 0 90%;
    margin: 0 5px;
  }
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const YouTubeThumbnail = styled.div<{ $bgImage: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$bgImage});
  background-size: cover;
  background-position: center;
  position: relative;
  
  /* 고품질 이미지 렌더링 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
`;

const PlayIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.effects.transitions.duration.default};
  pointer-events: none;
  
  svg {
    width: 32px;
    height: 32px;
    color: ${theme.colors.neutral.white};
    margin-left: 4px;
  }
`;

const NavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$position === 'left' ? 'left: 40px;' : 'right: 40px;'}
  z-index: 10;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.effects.transitions.duration.default};
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: translateY(-50%) scale(1.1);
  }
  
  svg {
    width: 32px;
    height: 32px;
    color: ${theme.colors.neutral.white};
  }
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    ${props => props.$position === 'left' ? 'left: 16px;' : 'right: 16px;'}
    
    svg {
      width: 22px;
      height: 22px;
    }
  }
`;

const IndicatorWrapper = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(calc(-50% - 480px)); /* 캐러셀 내부 왼쪽 */
  display: flex;
  align-items: center;
  z-index: 10;
`;

const ControlsWrapper = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(calc(-50% + 480px)); /* 캐러셀 내부 오른쪽 */
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
`;

const PageIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  backdrop-filter: blur(8px);
  position: relative;
  min-width: 80px;
`;

const PageNumber = styled.span`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

const IndicatorButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.effects.transitions.duration.fast};
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: #ffffff;
  }
`;

const ProgressContainer = styled.div`
  position: absolute;
  bottom: 2px;
  left: 8px;
  right: 8px;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1px;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  background: #ffffff;
  width: ${props => props.$progress}%;
  transition: ${props => props.$progress === 0 ? 'none' : 'width 100ms linear'};
  border-radius: 1px;
`;

export function MainCarousel() {
  const [currentSlide, setCurrentSlide] = useState(1); // 복제된 첫 번째 슬라이드부터 시작
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_DURATION = 7000; // 7초

  // 무한 루프를 위해 앞뒤에 슬라이드 복제
  const slides = [
    carouselSlides[carouselSlides.length - 1], // 마지막 슬라이드를 앞에 복제
    ...carouselSlides,
    carouselSlides[0], // 첫 번째 슬라이드를 뒤에 복제
  ];

  // 슬라이드 위치 계산
  const calculateTranslateX = () => {
    const slideWidth = 1147.5; // px
    const gap = 24; // px (margin 12px * 2)
    const totalWidth = slideWidth + gap;
    
    // viewport의 중앙에 현재 슬라이드를 위치시키기 위한 계산
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const centerOffset = (viewportWidth - slideWidth) / 2;
    
    return -(currentSlide * totalWidth) + centerOffset;
  };

  // 타이머 리셋 함수
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setCurrentSlide(prev => prev + 1);
      }, SLIDE_DURATION);
    }
  }, [isPlaying]);

  // 다음 슬라이드
  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentSlide(prev => prev + 1);
    resetTimer(); // 타이머 리셋
  }, [resetTimer]);

  // 이전 슬라이드
  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentSlide(prev => prev - 1);
    resetTimer(); // 타이머 리셋
  }, [resetTimer]);

  // 특정 슬라이드로 이동
  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setCurrentSlide(index + 1); // 복제된 슬라이드 때문에 +1
    resetTimer(); // 타이머 리셋
  }, [resetTimer]);

  // 자동 재생 토글
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // 무한 루프 처리
  useEffect(() => {
    if (currentSlide === slides.length - 1) {
      // 마지막 복제 슬라이드에 도달하면
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(1); // 실제 첫 번째 슬라이드로 점프
      }, 500); // 애니메이션 완료 후
    } else if (currentSlide === 0) {
      // 첫 번째 복제 슬라이드에 도달하면
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(slides.length - 2); // 실제 마지막 슬라이드로 점프
      }, 500);
    }
  }, [currentSlide, slides.length]);

  // 자동 재생 효과
  useEffect(() => {
    resetTimer();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resetTimer]);

  // 프로그레스 바 업데이트
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // 슬라이드가 변경될 때마다 progress를 0으로 리셋
    setProgress(0);
    
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          const next = prev + (100 / (SLIDE_DURATION / 100));
          if (next >= 100) {
            return 100; // 100에서 멈춤
          }
          return next;
        });
      }, 100);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentSlide, isPlaying, SLIDE_DURATION]);

  // 슬라이드 클릭 핸들러
  const handleSlideClick = (slide: typeof carouselSlides[0], index: number, realIndex: number) => {
    if (index === currentSlide) {
      // 현재 활성 슬라이드를 클릭한 경우에만 링크로 이동
      const targetLink = slide.type === 'youtube' ? slide.source : slide.link;
      
      if (!targetLink) return;
      
      if (targetLink.startsWith('http')) {
        window.open(targetLink, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = targetLink;
      }
    } else {
      // 비활성 슬라이드를 클릭하면 해당 슬라이드로 이동
      goToSlide(realIndex);
    }
  };

  return (
    <CarouselSection>
      <CarouselContainer>
        <SlideViewport>
          <SlideTrack $translateX={calculateTranslateX()} $isTransitioning={isTransitioning}>
            {slides.map((slide, index) => {
              // 실제 슬라이드 인덱스 계산 (복제 슬라이드 고려)
              const realIndex = index === 0 ? carouselSlides.length - 1 : 
                               index === slides.length - 1 ? 0 : 
                               index - 1;
              const isActive = index === currentSlide;
              
              return (
              <SlideItem
                key={`slide-${index}`}
                $isActive={isActive}
                onClick={() => handleSlideClick(slide, index, realIndex)}
              >
                {slide.type === 'youtube' ? (
                  <YouTubeThumbnail $bgImage={getSlideImage(slide)}>
                    <PlayIcon>
                      <Play />
                    </PlayIcon>
                  </YouTubeThumbnail>
                ) : (
                  <SlideImage 
                    src={getSlideImage(slide)} 
                    alt={`슬라이드 ${realIndex + 1}`}
                    loading="lazy"
                  />
                )}
              </SlideItem>
              );
            })}
          </SlideTrack>
          
          {/* FastCampus 스타일 인디케이터 - 중앙 캐러셀 좌측 하단 */}
          <IndicatorWrapper>
            <PageIndicator>
              <PageNumber>
                {String(
                  currentSlide === 0 ? carouselSlides.length :
                  currentSlide === slides.length - 1 ? 1 :
                  currentSlide
                ).padStart(2, '0')}
                {' / '}
                {String(carouselSlides.length).padStart(2, '0')}
              </PageNumber>
              <ProgressContainer>
                <ProgressBar $progress={progress} />
              </ProgressContainer>
            </PageIndicator>
          </IndicatorWrapper>
          
          {/* FastCampus 스타일 컨트롤 - 우측 하단 */}
          <ControlsWrapper>
            <IndicatorButton 
              onClick={(e) => { 
                e.stopPropagation(); 
                prevSlide(); 
              }}
              aria-label="이전 슬라이드"
            >
              <ChevronLeft />
            </IndicatorButton>
            
            <IndicatorButton 
              onClick={(e) => { 
                e.stopPropagation(); 
                nextSlide(); 
              }}
              aria-label="다음 슬라이드"
            >
              <ChevronRight />
            </IndicatorButton>
            
            <IndicatorButton 
              onClick={(e) => { 
                e.stopPropagation(); 
                togglePlayPause(); 
              }}
              aria-label={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? <Pause /> : <Play />}
            </IndicatorButton>
          </ControlsWrapper>
        </SlideViewport>
      </CarouselContainer>
    </CarouselSection>
  );
}