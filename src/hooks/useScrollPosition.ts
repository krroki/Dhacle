import { useState, useEffect, useCallback } from 'react';

export interface ScrollPosition {
  x: number;
  y: number;
  isScrolled: boolean;
  scrollDirection: 'up' | 'down' | null;
}

interface UseScrollPositionProps {
  threshold?: number;
  throttleMs?: number;
}

export const useScrollPosition = ({
  threshold = 50,
  throttleMs = 100
}: UseScrollPositionProps = {}): ScrollPosition => {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    isScrolled: false,
    scrollDirection: null
  });

  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const currentScrollX = window.scrollX;
    
    let direction: 'up' | 'down' | null = null;
    if (currentScrollY > lastScrollY) {
      direction = 'down';
    } else if (currentScrollY < lastScrollY) {
      direction = 'up';
    }

    setScrollPosition({
      x: currentScrollX,
      y: currentScrollY,
      isScrolled: currentScrollY > threshold,
      scrollDirection: direction
    });

    setLastScrollY(currentScrollY);
  }, [lastScrollY, threshold]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let isThrottled = false;

    const throttledHandleScroll = () => {
      if (isThrottled) return;

      handleScroll();
      isThrottled = true;

      timeoutId = setTimeout(() => {
        isThrottled = false;
      }, throttleMs);
    };

    // Initial scroll position
    handleScroll();

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [handleScroll, throttleMs]);

  return scrollPosition;
};