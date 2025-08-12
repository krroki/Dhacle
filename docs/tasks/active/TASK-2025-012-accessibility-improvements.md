# TASK-2025-012: 접근성 개선 - 키보드 네비게이션 및 ARIA

## 📌 메타데이터
- **작업 ID**: TASK-2025-012
- **예상 소요시간**: 30분
- **담당**: Developer AI
- **우선순위**: MEDIUM
- **상태**: 대기중
- **의존성**: 없음
- **작성일**: 2025-01-10

## 🎯 작업 목표
WCAG 2.1 AA 기준 충족을 위한 키보드 네비게이션 및 스크린 리더 지원 구현

## 📝 구현 지시사항

### 1. MainCarousel 키보드 네비게이션
```typescript
// src/components/sections/MainCarousel.tsx

// 키보드 이벤트 핸들러 추가
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowLeft':
      prevSlide();
      break;
    case 'ArrowRight':
      nextSlide();
      break;
    case ' ':
    case 'Enter':
      // 스페이스바/엔터로 재생/일시정지 토글
      if (e.target === document.activeElement) {
        e.preventDefault();
        togglePlayPause();
      }
      break;
    case 'Escape':
      // ESC로 자동 재생 중지
      setIsPlaying(false);
      break;
  }
}, [nextSlide, prevSlide, togglePlayPause]);

useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleKeyDown]);

// 포커스 트랩 구현
<div
  role="region"
  aria-label="이미지 캐러셀"
  aria-roledescription="carousel"
  aria-live="polite"
  tabIndex={0}
  onFocus={() => setIsPlaying(false)} // 포커스 시 자동 재생 중지
>
```

### 2. ARIA 레이블 및 상태 추가
```typescript
// 현재 슬라이드 상태 알림
<div className="sr-only" aria-live="polite" aria-atomic="true">
  {`${carouselSlides.length}개 중 ${currentSlide + 1}번째 슬라이드: ${carouselSlides[currentSlide].title}`}
</div>

// 버튼에 상태 정보 추가
<button
  aria-label={`${isPlaying ? '일시정지' : '재생'} (현재 ${isPlaying ? '자동 재생 중' : '정지됨'})`}
  aria-pressed={isPlaying}
>

// 인디케이터 개선
<button
  role="tab"
  aria-selected={index === currentSlide}
  aria-label={`${index + 1}번째 슬라이드로 이동`}
  aria-controls={`slide-${index}`}
/>
```

### 3. NavigationBar 접근성 개선
```typescript
// src/components/NavigationBar.tsx

// Skip to main content 링크 추가
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white p-2 rounded"
>
  본문 바로가기
</a>

// 드롭다운 메뉴 키보드 지원
const [isMenuOpen, setIsMenuOpen] = useState(false);

<button
  aria-expanded={isMenuOpen}
  aria-haspopup="true"
  aria-controls="dropdown-menu"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsMenuOpen(!isMenuOpen);
    }
  }}
>
  카테고리
</button>

// 메뉴 아이템 포커스 관리
const menuItemsRef = useRef<HTMLElement[]>([]);
const [focusedIndex, setFocusedIndex] = useState(-1);

useEffect(() => {
  if (isMenuOpen && focusedIndex >= 0) {
    menuItemsRef.current[focusedIndex]?.focus();
  }
}, [focusedIndex, isMenuOpen]);
```

### 4. 포커스 스타일 개선
```typescript
// src/styles/globals.css

/* 포커스 표시자 스타일 */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 키보드 사용자를 위한 포커스 표시 */
.focus-visible:focus:not(:focus-visible) {
  outline: none;
}

/* 스킵 링크 스타일 */
.sr-only:focus {
  position: absolute;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### 5. 접근성 유틸리티 훅 생성
```typescript
// src/hooks/useAccessibility.ts

export const useFocusTrap = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    return () => element.removeEventListener('keydown', handleTabKey);
  }, [ref]);
};

// 사용자 선호 감지
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};
```

## ✅ 완료 기준
- [ ] 모든 인터랙티브 요소 키보드로 접근 가능
- [ ] Tab 키 순서 논리적
- [ ] 포커스 표시 명확
- [ ] ARIA 레이블 적절히 설정
- [ ] 스크린 리더 테스트 통과

## 🔍 검증 명령어
```bash
# axe DevTools 설치 후 검사
npm run dev
# Chrome Extension: axe DevTools 실행
# 접근성 이슈 0개 목표

# 키보드만으로 네비게이션 테스트
# 1. Tab 키로 모든 요소 접근
# 2. Enter/Space로 버튼 동작
# 3. Arrow 키로 캐러셀 제어
# 4. Escape로 자동 재생 중지

# 스크린 리더 테스트 (NVDA/JAWS)
```

## 📊 예상 결과
- WCAG 2.1 AA 준수
- Lighthouse 접근성 점수 95점 이상
- 키보드 사용자 경험 개선
- 스크린 리더 호환성 확보

---
*검증 프로토콜: axe DevTools로 접근성 이슈 0개 확인*