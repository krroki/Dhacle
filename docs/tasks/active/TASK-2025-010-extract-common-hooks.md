# TASK-2025-010: 공통 훅 추출 및 코드 중복 제거

## 📌 메타데이터
- **작업 ID**: TASK-2025-010
- **예상 소요시간**: 30분
- **담당**: Developer AI
- **우선순위**: MEDIUM
- **상태**: 대기중
- **의존성**: TASK-2025-008 (DOM 조작 수정 후 진행 권장)
- **작성일**: 2025-01-10

## 🎯 작업 목표
중복된 코드를 커스텀 훅으로 추출하여 재사용성 향상 및 유지보수성 개선

## 📝 구현 지시사항

### 1. 네비게이션 핸들러 훅 생성
```typescript
// src/hooks/useNavigationHandler.ts

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useNavigationHandler = () => {
  const router = useRouter();
  
  const handleNavigation = useCallback((link: string, e?: React.MouseEvent) => {
    // 이벤트 전파 중단 (옵션)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 외부 링크 vs 내부 라우팅 처리
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (link.startsWith('mailto:')) {
      window.location.href = link;
    } else {
      router.push(link);
    }
  }, [router]);
  
  return { handleNavigation };
};
```

### 2. MainCarousel 리팩토링
```typescript
// src/components/sections/MainCarousel.tsx

import { useNavigationHandler } from '@/hooks/useNavigationHandler';

export function MainCarousel() {
  const { handleNavigation } = useNavigationHandler();
  
  // 기존 중복 코드 제거:
  // Line 69-73 제거
  // Line 153-161 제거
  
  // 대체:
  onClick={(e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button')) {
      handleNavigation(carouselSlides[currentSlide].link);
    }
  }}
  
  // 버튼 클릭 (styled-components 기반):
  <StripeButton onClick={() => handleNavigation(carouselSlides[currentSlide].link)}>
    {carouselSlides[currentSlide].buttonText || '자세히 보기'}
  </StripeButton>
```

### 3. 애니메이션 설정 훅 생성
```typescript
// src/hooks/useAnimationConfig.ts

export const useAnimationConfig = () => {
  const slideAnimation = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.5 }
  };
  
  const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: (delay = 0) => ({ delay })
  };
  
  const hoverScale = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 300 }
  };
  
  return { slideAnimation, fadeInUp, hoverScale };
};
```

### 4. 로컬 스토리지 훅 생성
```typescript
// src/hooks/useLocalStorage.ts

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };
  
  return [storedValue, setValue] as const;
}
```

### 5. 미디어 쿼리 훅 생성
```typescript
// src/hooks/useMediaQuery.ts

import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
};

// 사용 예시:
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)');
```

## ✅ 완료 기준
- [ ] useNavigationHandler 훅 생성 및 적용
- [ ] MainCarousel 중복 코드 제거
- [ ] 애니메이션 설정 훅 생성
- [ ] 로컬 스토리지 훅 생성
- [ ] 미디어 쿼리 훅 생성
- [ ] 모든 훅 TypeScript 타입 완벽 지원

## 🔍 검증 명령어
```bash
# 중복 코드 검색
grep -r "window.open\|router.push" src/ --include="*.tsx"

# 훅 사용 확인
grep -r "useNavigationHandler\|useAnimationConfig" src/

# TypeScript 검증
npx tsc --noEmit
```

## 📊 예상 결과
- 코드 중복 80% 감소
- 유지보수성 대폭 향상
- 테스트 용이성 증가
- 일관된 동작 보장

---
*검증 프로토콜: 리팩토링 후 모든 네비게이션 기능 정상 작동 확인*