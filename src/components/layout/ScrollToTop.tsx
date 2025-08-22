'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [is_visible, set_is_visible] = useState(false);

  useEffect(() => {
    const toggle_visibility = () => {
      set_is_visible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggle_visibility, { passive: true });
    return () => window.removeEventListener('scroll', toggle_visibility);
  }, []);

  const scroll_to_top = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      size="icon"
      onClick={scroll_to_top}
      className={cn(
        'fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-[900] rounded-full shadow-lg transition-all duration-300',
        is_visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      )}
      aria-label="맨 위로 가기"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
