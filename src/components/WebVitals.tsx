'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { apiPost } from '@/lib/api-client';

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
        const gtag = window.gtag as any;
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
          console.error('Failed to send vitals to analytics:', error);
        });
      }
      
      // 개발 환경에서 콘솔 출력
      if (process.env.NODE_ENV === 'development') {
        const color = metric.rating === 'good' ? '#0CCE6B' : metric.rating === 'needs-improvement' ? '#FFA400' : '#FF4E42';
        console.log(
          `%c ${metric.name} %c ${metric.value.toFixed(2)} %c ${metric.rating}`,
          'background: #222; color: #bada55; padding: 2px 8px;',
          `background: ${color}; color: white; padding: 2px 8px;`,
          'background: #222; color: white; padding: 2px 8px;'
        );
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