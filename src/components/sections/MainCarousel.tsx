'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StripeButton, StripeTypography } from '@/components/design-system';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { carouselSlides, getSlideImage } from '@/data/carousel-content';
import { useRouter } from 'next/navigation';

export function MainCarousel() {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        overflow: 'hidden',
        backgroundColor: theme.colors.neutral.gray['100']
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            // Don't navigate if clicking on controls
            const target = e.target as HTMLElement;
            if (target.closest('button')) return;
            
            const link = carouselSlides[currentSlide].link;
            if (link.startsWith('http')) {
              window.open(link, '_blank', 'noopener,noreferrer');
            } else {
              router.push(link);
            }
          }}
        >
          {/* Background Image */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundImage: `url(${getSlideImage(carouselSlides[currentSlide])})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.7)'
            }}
          />
          
          {/* Content Overlay */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)';
            }}
          >
            <div style={{ 
              textAlign: 'center', 
              maxWidth: '800px',
              padding: theme.spacing[8]
            }}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <StripeTypography 
                  variant="h1" 
                  color="inverse"
                  className="mb-4"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {carouselSlides[currentSlide].title}
                </StripeTypography>
              </motion.div>
              
              {carouselSlides[currentSlide].subtitle && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <StripeTypography 
                    variant="h3" 
                    color="inverse"
                    className="mb-8"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {carouselSlides[currentSlide].subtitle}
                  </StripeTypography>
                </motion.div>
              )}
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <StripeButton 
                  variant="primary" 
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = carouselSlides[currentSlide].link;
                    if (link.startsWith('http')) {
                      window.open(link, '_blank', 'noopener,noreferrer');
                    } else {
                      router.push(link);
                    }
                  }}
                >
                  {carouselSlides[currentSlide].buttonText || '자세히 보기'}
                </StripeButton>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prevSlide}
        style={{
          position: 'absolute',
          left: theme.spacing[4],
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease'
        }}
        aria-label="이전 슬라이드"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        style={{
          position: 'absolute',
          right: theme.spacing[4],
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease'
        }}
        aria-label="다음 슬라이드"
      >
        <ChevronRight size={24} />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        style={{
          position: 'absolute',
          bottom: theme.spacing[4],
          left: theme.spacing[4],
          backgroundColor: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
        aria-label={isPlaying ? '일시정지' : '재생'}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>

      {/* Indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: theme.spacing[4],
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[2],
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
          borderRadius: '20px'
        }}
      >
        <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
          {String(currentSlide + 1).padStart(2, '0')} / {String(carouselSlides.length).padStart(2, '0')}
        </span>
        <div style={{ display: 'flex', gap: theme.spacing[1] }}>
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === currentSlide ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}