'use client';

import NProgress from 'nprogress';
import { useEffect } from 'react';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
});

export function ProgressBar() {
  useEffect(() => {
    NProgress.done();
    return () => {
      NProgress.start();
    };
  }, []);

  return null;
}

export function ScrollProgressBar() {
  useEffect(() => {
    const update_scroll_progress = () => {
      const scroll_top = window.scrollY;
      const doc_height = document.documentElement.scrollHeight - window.innerHeight;
      const scroll_percent = doc_height > 0 ? (scroll_top / doc_height) * 100 : 0;

      // Update CSS variable for scroll progress
      document.documentElement.style.setProperty('--scroll-progress', `${scroll_percent}%`);
    };

    window.addEventListener('scroll', update_scroll_progress, { passive: true });
    return () => window.removeEventListener('scroll', update_scroll_progress);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
      <div className="h-full bg-primary transition-all duration-150 ease-out w-[var(--scroll-progress,0%)]" />
    </div>
  );
}
