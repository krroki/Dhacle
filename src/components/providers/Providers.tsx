'use client';

import { ThemeProvider } from 'next-themes';
import { type ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { LayoutProvider } from '@/lib/layout/LayoutContext';
import { useLayoutStore } from '@/store/layout';

interface ProvidersProps {
  children: ReactNode;
}

function DynamicPaddingProvider({ children }: { children: ReactNode }) {
  const { isBannerClosed } = useLayoutStore();
  const [is_scrolled, set_is_scrolled] = useState(false);

  useEffect(() => {
    const handle_scroll = () => {
      set_is_scrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handle_scroll);
    handle_scroll(); // 초기값 설정

    return () => window.removeEventListener('scroll', handle_scroll);
  }, []);

  useEffect(() => {
    const update_padding = () => {
      const banner_height = isBannerClosed ? 0 : 48;
      const header_height = is_scrolled ? 40 : 80;
      const total_height = banner_height + header_height;

      // Main content padding 동적 조정
      const main_content = document.querySelector('.flex.min-h-screen');
      if (main_content) {
        (main_content as HTMLElement).style.paddingTop = `${total_height}px`;
      }
    };

    update_padding();
  }, [isBannerClosed, is_scrolled]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={true}
    >
      <AuthProvider>
        <LayoutProvider>
          <DynamicPaddingProvider>{children}</DynamicPaddingProvider>
        </LayoutProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
