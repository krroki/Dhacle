'use client';

import { ThemeProvider } from 'next-themes';
import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { LayoutProvider } from '@/lib/layout/LayoutContext';
import { useLayoutStore } from '@/store/layout';
import { env } from '@/env';

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 1 minute
            staleTime: 60 * 1000,
            // Garbage collection after 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests 3 times with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Don't refetch on window focus by default
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: 'always',
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
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
      {env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
