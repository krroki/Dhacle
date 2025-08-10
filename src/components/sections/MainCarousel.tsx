'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { carouselSlides, getSlideImage } from '@/data/carousel-data';
import styled from 'styled-components';
import { colors } from '@/styles/tokens/colors';
import { effects } from '@/styles/tokens/effects';

// Styled Components
const CarouselSection = styled.section`
  width: 100%;
  padding: 0;
  background: ${colors.neutral[0]}; /* 디자인 시스템 토큰 사용 */
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

const SlideTrack = styled.div<{ $translateX: number }>`
  display: flex;
  height: 100%;
  transform: translateX(${props => props.$translateX}px);
  transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: all ${effects.animation.duration.normal};
  pointer-events: none;
  
  svg {
    width: 32px;
    height: 32px;
    color: ${colors.neutral[0]};
    margin-left: 4px;
  }
`;

const NavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$position === 'left' ? 'left: 40px;' : 'right: 40px;'}
  z-index: 10;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${effects.animation.duration.normal};
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: translateY(-50%) scale(1.05);
  }
  
  svg {
    width: 28px;
    height: 28px;
    color: ${colors.neutral[0]};
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
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 30px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const PageIndicator = styled.span`
  color: ${colors.neutral[0]};
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
`;

const DotContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Dot = styled.button<{ $isActive: boolean }>`
  width: ${props => props.$isActive ? '32px' : '8px'};
  height: 8px;
  border-radius: 4px;
  border: none;
  background: ${props => props.$isActive ? colors.neutral[0] : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all ${effects.animation.duration.normal};
  padding: 0;
  
  &:hover {
    background: ${props => props.$isActive ? colors.neutral[0] : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const ControlButton = styled.button`
  margin-left: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${effects.animation.duration.fast};
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  svg {
    width: 16px;
    height: 16px;
    color: ${colors.neutral[0]};
  }
`;

export function MainCarousel() {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_DURATION = 7000; // 7초

  // 일반 캐러셀 - 무한 루프 제거
  const slides = carouselSlides;

  // 슬라이드 위치 계산
  const calculateTranslateX = () => {
    const slideWidth = 1147.5; // px
    const gap = 24; // px (margin 12px * 2)
    const totalWidth = slideWidth + gap;
    
    // viewport의 중앙에 현재 슬라이드를 위치시키기 위한 계산
    const viewportWidth = window.innerWidth || 1920;
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
        setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
      }, SLIDE_DURATION);
    }
  }, [isPlaying]);

  // 다음 슬라이드
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => {
      // When reaching the last slide (7), go to 0 (which shows slide 1)
      if (prev >= carouselSlides.length - 1) {
        return 0;
      }
      return prev + 1;
    });
    resetTimer(); // 타이머 리셋
  }, [resetTimer]);

  // 이전 슬라이드
  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => {
      // When at first slide (0), go to last slide (7)
      if (prev <= 0) {
        return carouselSlides.length - 1;
      }
      return prev - 1;
    });
    resetTimer(); // 타이머 리셋
  }, [resetTimer]);

  // 특정 슬라이드로 이동
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    resetTimer(); // 타이머 리셋
  }, [resetTimer]);

  // 자동 재생 토글
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // 자동 재생 효과
  useEffect(() => {
    resetTimer();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resetTimer]);

  // 슬라이드 클릭 핸들러
  const handleSlideClick = (slide: typeof carouselSlides[0], index: number) => {
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
      goToSlide(index);
    }
  };

  return (
    <CarouselSection>
      <CarouselContainer>
        <SlideViewport>
          <SlideTrack $translateX={calculateTranslateX()}>
            {slides.map((slide, index) => {
              const isActive = index === currentSlide;
              
              return (
              <SlideItem
                key={slide.id}
                $isActive={isActive}
                onClick={() => handleSlideClick(slide, index)}
              >
                {slide.type === 'youtube' ? (
                  <>
                    <YouTubeThumbnail $bgImage={getSlideImage(slide)} />
                    {isActive && (
                      <PlayIcon>
                        <Play fill="white" />
                      </PlayIcon>
                    )}
                  </>
                ) : (
                  <SlideImage 
                    src={getSlideImage(slide)} 
                    alt={`Slide ${slide.id}`}
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                    }}
                  />
                )}
              </SlideItem>
              );
            })}
          </SlideTrack>
          
          {/* Navigation Buttons */}
          <NavButton 
            $position="left" 
            onClick={(e) => { 
              e.stopPropagation(); 
              prevSlide(); 
            }} 
            aria-label="이전 슬라이드"
          >
            <ChevronLeft />
          </NavButton>
          <NavButton 
            $position="right" 
            onClick={(e) => { 
              e.stopPropagation(); 
              nextSlide(); 
            }} 
            aria-label="다음 슬라이드"
          >
            <ChevronRight />
          </NavButton>
          
          {/* Indicators */}
          <IndicatorWrapper>
            <PageIndicator>
              {String(currentSlide + 1).padStart(2, '0')} / {String(carouselSlides.length).padStart(2, '0')}
            </PageIndicator>
            <DotContainer>
              {carouselSlides.map((_, index) => (
                <Dot
                  key={index}
                  $isActive={index === currentSlide}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    goToSlide(index); 
                  }}
                  aria-label={`슬라이드 ${index + 1}`}
                />
              ))}
            </DotContainer>
            <ControlButton 
              onClick={(e) => { 
                e.stopPropagation(); 
                togglePlayPause(); 
              }}
              aria-label={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? <Pause /> : <Play />}
            </ControlButton>
          </IndicatorWrapper>
        </SlideViewport>
      </CarouselContainer>
    </CarouselSection>
  );
}