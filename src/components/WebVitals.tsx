'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { apiPost } from '@/lib/api-client';
// Note: Using process.env directly in client component since NODE_ENV is available on both client and server
import { logger } from '@/lib/logger';

/**
 * Core Web Vitals 측정 컴포넌트
 * - LCP (Largest Contentful Paint): 페이지 로딩 성능
 * - INP (Interaction to Next Paint): 인터랙션 응답성 (FID 대체)
 * - CLS (Cumulative Layout Shift): 시각적 안정성
 * - FCP (First Contentful Paint): 첫 콘텐츠 렌더링
 * - TTFB (Time to First Byte): 서버 응답 시간
 */
export function WebVitals() {
  useEffect(() => {
    const sendToAnalytics = (metric: Metric) => {
      // Google Analytics로 전송 (gtag이 있는 경우)
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as { gtag: (command: string, action: string, options?: Record<string, unknown>) => void }).gtag;
        gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_label: metric.id,
          non_interaction: true,
        });
      }
      
      // 커스텀 엔드포인트로 전송
      if (process.env.NODE_ENV === 'production') {
        apiPost('/api/analytics/vitals', {
          metric: metric.name,
          value: metric.value,
          id: metric.id,
          rating: metric.rating,
          navigationType: metric.navigationType,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }).catch((error) => {
          logger.error('Failed to send vitals to analytics', error);
        });
      }
      
      // 개발 환경에서 상세 콘솔 출력
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Web Vitals: ${metric.name}`, {
          operation: 'web-vitals',
          metadata: {
            metric: metric.name,
            value: metric.value.toFixed(2),
            rating: metric.rating,
            id: metric.id
          }
        });
      }
    };
    
    // Core Web Vitals 측정
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics); // FID를 대체하는 새로운 지표
  }, []);
  
  return null;
}