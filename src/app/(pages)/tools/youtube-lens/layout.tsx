'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';

export default function YouTubeLensLayout({ children }: { children: React.ReactNode }) {
  const [query_client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            gcTime: 5 * 60 * 1000, // 5분 (이전 cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Hydration-safe devtools rendering
  const [showDevtools, setShowDevtools] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 실행, hydration mismatch 방지
    if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
      setShowDevtools(true);
    }
  }, []);

  return (
    <QueryClientProvider client={query_client}>
      {children}
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
