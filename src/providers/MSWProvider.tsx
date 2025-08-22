'use client';

import { useEffect, useState } from 'react';

/**
 * MSW Provider Component
 * 개발 환경에서만 MSW를 활성화합니다.
 */
export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mocking_enabled, set_mocking_enabled] = useState(false);

  useEffect(() => {
    const enable_mocking = async () => {
      if (process.env.NODE_ENV !== 'development') {
        return;
      }

      // MSW는 개발 환경에서만 활성화
      const { worker } = await import('@/mocks/browser');

      // Service Worker 시작
      await worker.start({
        onUnhandledRequest: 'bypass', // 핸들러가 없는 요청은 실제 서버로 전달
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });

      set_mocking_enabled(true);
      console.log('🔧 MSW가 활성화되었습니다.');
    };

    enable_mocking();
  }, []);

  // 개발 환경이 아니거나 모킹이 아직 준비되지 않은 경우
  if (process.env.NODE_ENV !== 'development' || !mocking_enabled) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
