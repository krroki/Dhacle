아# TASK-2025-011: MainCarousel 성능 최적화

## 📌 메타데이터
- **작업 ID**: TASK-2025-011
- **예상 소요시간**: 30분
- **담당**: Developer AI
- **우선순위**: HIGH
- **상태**: 대기중
- **의존성**: TASK-2025-008 (DOM 조작 수정 필수)
- **작성일**: 2025-01-10

## 🚨 TASK-006과의 차이점
- **TASK-006**: UI 품질 개선 (FastCampus 스타일, 링크 연결)
- **TASK-011**: 성능 최적화 (메모리 누수, 렌더링 최적화) ← 이 작업

## 🎯 작업 목표
MainCarousel 컴포넌트의 성능 문제 해결 및 최적화

## 📝 구현 지시사항

### 1. setInterval 메모리 누수 해결
```typescript
// src/components/sections/MainCarousel.tsx

// ❌ 현재 문제 코드 (Line 29-34):
useEffect(() => {
  if (!isPlaying) return;
  const interval = setInterval(nextSlide, 5000);
  return () => clearInterval(interval);
}, [isPlaying, nextSlide]); // nextSlide이 변경될 때마다 재생성

// ✅ 수정 방법 1: useRef 활용
const slideIndexRef = useRef(currentSlide);
slideIndexRef.current = currentSlide;

const nextSlide = useCallback(() => {
  setCurrentSlide((slideIndexRef.current + 1) % carouselSlides.length);
}, []); // 의존성 제거

// ✅ 수정 방법 2: 함수형 업데이트
const nextSlide = useCallback(() => {
  setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
}, []); // 의존성 없음
```

### 2. 이미지 최적화
```typescript
// src/components/sections/MainCarousel.tsx

import Image from 'next/image';

// 이미지 프리로딩
useEffect(() => {
  // 다음 슬라이드 이미지 프리로드
  const nextIndex = (currentSlide + 1) % carouselSlides.length;
  const img = new Image();
  img.src = getSlideImage(carouselSlides[nextIndex]);
}, [currentSlide]);

// Next.js Image 컴포넌트 활용
<div style={{ position: 'relative', width: '100%', height: '100%' }}>
  <Image
    src={getSlideImage(carouselSlides[currentSlide])}
    alt={carouselSlides[currentSlide].title}
    fill
    priority={currentSlide === 0} // 첫 이미지는 우선 로드
    sizes="100vw"
    style={{ objectFit: 'cover' }}
  />
</div>
```

### 3. React.memo로 리렌더링 최적화
```typescript
// 슬라이드 컨트롤 버튼 메모이제이션
const SlideControl = React.memo(({ 
  direction, 
  onClick, 
  ariaLabel 
}: SlideControlProps) => {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  
  return (
    <button
      onClick={onClick}
      style={carouselStyles.controlButton}
      aria-label={ariaLabel}
    >
      <Icon size={24} />
    </button>
  );
});

// 인디케이터 메모이제이션
const SlideIndicators = React.memo(({ 
  total, 
  current, 
  onSelect 
}: IndicatorProps) => {
  return (
    <div style={carouselStyles.indicators}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          style={{
            ...carouselStyles.indicator,
            ...(index === current && carouselStyles.indicatorActive)
          }}
          aria-label={`슬라이드 ${index + 1}`}
        />
      ))}
    </div>
  );
});
```

### 4. 애니메이션 최적화
```typescript
// GPU 가속 활용
const slideAnimation = {
  initial: { opacity: 0, transform: 'translateX(100px)' },
  animate: { opacity: 1, transform: 'translateX(0)' },
  exit: { opacity: 0, transform: 'translateX(-100px)' },
  transition: { 
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1] // cubic-bezier
  }
};

// will-change 속성 추가
style={{
  willChange: 'transform, opacity',
  transform: 'translateZ(0)' // GPU 레이어 강제
}}
```

### 5. 디바운스/쓰로틀 적용
```typescript
// src/hooks/useThrottle.ts
export const useThrottle = (callback: Function, delay: number) => {
  const lastCall = useRef(0);
  
  return useCallback((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  }, [callback, delay]);
};

// 적용:
const throttledNext = useThrottle(nextSlide, 500);
const throttledPrev = useThrottle(prevSlide, 500);
```

## ✅ 완료 기준
- [ ] setInterval 메모리 누수 해결
- [ ] 이미지 프리로딩 구현
- [ ] React.memo 적용
- [ ] GPU 가속 최적화
- [ ] 불필요한 리렌더링 제거

## 🔍 검증 명령어
```bash
# React DevTools Profiler로 성능 측정
npm run dev
# 1. React DevTools > Profiler 탭
# 2. Record 시작 → 슬라이드 전환 → Stop
# 3. 렌더링 시간 확인 (목표: <16ms)

# 메모리 누수 확인
# 1. Chrome DevTools > Memory 탭
# 2. Heap snapshot 촬영
# 3. 5분 후 다시 촬영
# 4. 메모리 증가량 확인 (목표: <5MB)
```

## 📊 예상 결과
- 슬라이드 전환 시간 50% 단축
- 메모리 사용량 30% 감소
- CPU 사용률 40% 감소
- 60fps 유지

## ⚡ 성능 목표
- First Contentful Paint: <1.8s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- 슬라이드 전환: <16ms (60fps)

---
*검증 프로토콜: Chrome DevTools Performance 탭에서 60fps 유지 확인*