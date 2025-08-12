# TASK-2025-009: Error Boundary 구현 및 에러 처리 체계 구축

## 📌 메타데이터
- **작업 ID**: TASK-2025-009
- **예상 소요시간**: 30분
- **담당**: Developer AI
- **우선순위**: HIGH
- **상태**: 대기중
- **의존성**: 없음
- **작성일**: 2025-01-10

## 🎯 작업 목표
React Error Boundary 구현하고 전역 에러 처리 체계 구축

## 📝 구현 지시사항

### 1. Error Boundary 컴포넌트 생성
```typescript
// src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
// styled-components 기반 디자인 시스템 (SSR 안전)
import { StripeCard, StripeTypography, StripeButton } from '@/components/design-system';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // TODO: 에러 리포팅 서비스 연동 (Sentry 등)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <StripeCard variant="bordered" className="p-8 m-8 text-center">
          <StripeTypography variant="h2" color="dark">
            문제가 발생했습니다
          </StripeTypography>
          <StripeTypography variant="body" color="muted" className="mt-4">
            {this.state.error?.message || '예기치 않은 오류가 발생했습니다.'}
          </StripeTypography>
          <StripeButton 
            variant="primary" 
            onClick={() => window.location.reload()}
            className="mt-6"
          >
            페이지 새로고침
          </StripeButton>
        </StripeCard>
      );
    }

    return this.props.children;
  }
}
```

### 2. Layout에 Error Boundary 적용
```typescript
// src/app/layout.tsx 수정

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* ⚠️ ThemeProvider 제거됨 - styled-components 기반으로 마이그레이션 완료 */}
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 3. 이미지 에러 처리 개선
```typescript
// src/components/sections/MainCarousel.tsx

const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

const handleImageError = (slideIndex: number) => {
  setImageErrors(prev => ({ ...prev, [slideIndex]: true }));
};

// 사용:
<div
  style={{
    backgroundImage: imageErrors[currentSlide] 
      ? `url('/images/placeholder.jpg')`
      : `url(${getSlideImage(carouselSlides[currentSlide])})`,
  }}
  onError={() => handleImageError(currentSlide)}
/>
```

### 4. API 에러 처리 훅 생성
```typescript
// src/hooks/useErrorHandler.ts

export const useErrorHandler = () => {
  const handleError = useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context}:`, error);
    
    // 사용자 친화적 메시지 표시
    if (error.message.includes('Network')) {
      toast.error('네트워크 연결을 확인해주세요');
    } else if (error.message.includes('Auth')) {
      toast.error('로그인이 필요합니다');
    } else {
      toast.error('문제가 발생했습니다. 잠시 후 다시 시도해주세요');
    }
  }, []);

  return { handleError };
};
```

## ✅ 완료 기준
- [ ] ErrorBoundary 컴포넌트 생성
- [ ] 전역 레이아웃에 적용
- [ ] 이미지 로드 에러 처리
- [ ] API 에러 처리 훅 구현
- [ ] 에러 발생 시 사용자 친화적 UI 표시

## 🔍 검증 명령어
```bash
# 개발 서버 실행
npm run dev

# 의도적 에러 발생 테스트:
# 1. 잘못된 이미지 경로 테스트
# 2. throw new Error('Test') 추가하여 ErrorBoundary 테스트
# 3. 네트워크 차단 후 API 호출 테스트
```

## 📊 예상 결과
- 예기치 않은 에러 발생 시 앱 크래시 방지
- 사용자 친화적 에러 메시지 표시
- 에러 복구 옵션 제공

---
*검증 프로토콜: 의도적 에러 발생시켜 ErrorBoundary 작동 확인*