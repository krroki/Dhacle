# 🎠 메인 페이지 캐러셀 Peek 디자인 구현 지시서 (개선판)

## 📋 요구사항 명세

### 1. 목표
메인 페이지 상단 HeroCarousel을 중앙 집중형 Peek 캐러셀로 변경
- **데스크톱**: 1220 x 450px 고정 크기
- **모바일**: 360 x 240px 고정 크기  
- **태블릿**: 768 x 320px 고정 크기
- **디자인**: 중앙에 메인 슬라이드, 양쪽에 부분적으로 보이는 슬라이드 (Peek 효과)
- **스타일**: 모든 슬라이드에 라운드 처리 (rounded-lg)
- **기능**: 무한 루프 유지, 자동 재생 4초 간격

### 2. 현재 상태 분석
- **컴포넌트 위치**: `src/components/features/home/HeroCarousel/`
- **현재 크기**: 반응형 높이 (h-[300px] md:h-[400px] lg:h-[500px])
- **라이브러리**: embla-carousel (shadcn/ui carousel 래퍼 사용)
- **슬라이드 개수**: 6개 (YouTube 3개, 이미지 3개)

### 3. 변경 영향 범위
- ✅ **직접 영향**: HeroCarousel 컴포넌트 자체
- ⚠️ **간접 영향**: 메인 페이지 레이아웃 (여백 조정 필요)
- ✅ **영향 없음**: 다른 페이지의 캐러셀 (독립적 구현)

## 🛠 구현 단계

### Phase 1: 캐러셀 옵션 설정 (embla-carousel)

#### 1.1 HeroCarousel/index.tsx 수정
```typescript
// 변경 전
const [emblaRef, emblaApi] = useEmblaCarousel(
  { 
    loop: true,
    duration: 25
  },
  [Autoplay({ delay: 5000, stopOnInteraction: false })]
)

// 변경 후
const [emblaRef, emblaApi] = useEmblaCarousel(
  { 
    loop: true,
    duration: 25,
    align: 'center',      // 중앙 정렬 추가
    containScroll: false  // 스크롤 제한 해제 (peek 효과)
  },
  [Autoplay({ delay: 4000, stopOnInteraction: false })]
)
```

### Phase 2: 컨테이너 크기 및 레이아웃 조정

#### 2.1 HeroCarousel/index.tsx - 컨테이너 스타일
```typescript
// 변경 후  
<div className="relative w-full max-w-[1920px] mx-auto">
  <div className="overflow-hidden"> {/* 항상 overflow hidden 유지 */}
    <div 
      className="flex"
      ref={emblaRef}
    >
```

#### 2.2 슬라이드 너비 조정 (Peek 효과)
```css
/* globals.css에 추가 */
.embla__slide {
  flex: 0 0 85%; /* 모바일: 85% 너비 */
  min-width: 0;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

@media (min-width: 768px) {
  .embla__slide {
    flex: 0 0 80%; /* 태블릿: 80% 너비 */
  }
}

@media (min-width: 1024px) {
  .embla__slide {
    flex: 0 0 75%; /* 데스크톱: 75% 너비 */
  }
}
```

### Phase 3: 고정 크기 적용

#### 3.1 HeroSlide.tsx - 슬라이드 크기 변경
```typescript
// 변경 후
<Link 
  href={slide.link}
  className="
    relative block w-full overflow-hidden group rounded-lg
    h-[240px]              /* 모바일: 240px 높이 */
    sm:h-[320px]           /* 태블릿: 320px 높이 */
    lg:h-[450px]           /* 데스크톱: 450px 높이 */
  "
>
  {/* 이미지 컨텐츠 - 컨테이너 없이 직접 렌더링 */}
```

#### 3.2 이미지 aspect ratio 처리
```typescript
// Image 컴포넌트 수정 - 레터박스 없이 이미지만 표시
<Image
  src={...}
  alt={slide.alt}
  fill
  className="
    object-cover           /* 모든 뷰포트에서 cover로 꽉 채움 */
    object-center          /* 중앙 정렬 */
  "
  priority
  sizes="(max-width: 640px) 360px, (max-width: 1024px) 768px, 1220px"
/>
```

### Phase 4: 네비게이션 버튼 위치 조정

#### 4.1 이전/다음 버튼 위치
```typescript
// HeroCarousel/index.tsx
<button
  onClick={() => emblaApi?.scrollPrev()}
  className="
    absolute top-1/2 -translate-y-1/2 z-10
    left-4 sm:left-8 lg:left-[5%]    /* 반응형 위치 조정 */
    ...
  "
>

<button
  onClick={() => emblaApi?.scrollNext()}
  className="
    absolute top-1/2 -translate-y-1/2 z-10
    right-4 sm:right-8 lg:right-[5%]  /* 반응형 위치 조정 */
    ...
  "
>
```

### Phase 5: 반응형 처리 개선

#### 5.1 미디어 쿼리 기반 스타일
```css
/* globals.css 추가 */
@layer components {
  .hero-carousel-container {
    @apply relative w-full;
  }
  
  @media (min-width: 768px) {
    .hero-carousel-container {
      max-width: 1920px;
      margin: 0 auto;
    }
  }
  
  .hero-carousel-slide {
    transition: opacity 0.3s, transform 0.3s;
  }
  
  /* 모든 슬라이드 동일한 불투명도 - 투명도 효과 제거 */
  .hero-carousel-slide {
    opacity: 1;
    transition: transform 0.3s ease;
  }
  
  /* 선택된 슬라이드만 약간 확대 */
  .hero-carousel-slide.is-selected {
    transform: scale(1.02);
  }
  
  .hero-carousel-slide:not(.is-selected) {
    transform: scale(0.98);
  }
}
```

### Phase 6: 슬라이드 상태 관리 및 라운드 처리

#### 6.1 현재 슬라이드 추적 및 스타일 적용
```typescript
// HeroCarousel/index.tsx
const [selectedIndex, setSelectedIndex] = useState(0);

useEffect(() => {
  if (!emblaApi) return;
  
  const onSelect = () => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  };
  
  emblaApi.on('select', onSelect);
  onSelect();
  
  return () => {
    emblaApi.off('select', onSelect);
  };
}, [emblaApi]);

// 슬라이드에 상태 전달 및 라운드 처리
{carouselItems.map((slide, index) => (
  <div 
    key={slide.id}
    className={cn(
      "hero-carousel-slide rounded-lg overflow-hidden", // 라운드 처리 추가
      selectedIndex === index && "is-selected"
    )}
  >
    <HeroSlide slide={slide} index={index} />
  </div>
))}
```

#### 6.2 슬라이드 컴포넌트 라운드 처리
```typescript
// HeroSlide.tsx 수정
export function HeroSlide({ slide, index }: HeroSlideProps) {
  return (
    <Link 
      href={slide.link}
      className="
        relative block w-full overflow-hidden group 
        rounded-lg  /* 모든 슬라이드에 라운드 처리 */
        h-[240px] sm:h-[320px] lg:h-[450px]
      "
    >
      <Image
        src={...}
        alt={slide.alt}
        fill
        className="object-cover object-center"
        priority={index < 3} // 처음 3개만 priority
        sizes="(max-width: 640px) 360px, (max-width: 1024px) 768px, 1220px"
      />
    </Link>
  );
}
```

### Phase 7: 에러 처리 및 성능 최적화

#### 7.1 에러 처리
```typescript
// 이미지 로드 에러 처리
const [imageError, setImageError] = useState<Record<string, boolean>>({});

const handleImageError = (slideId: string) => {
  setImageError(prev => ({ ...prev, [slideId]: true }));
};

// HeroSlide.tsx에서
<Image
  src={imageError[slide.id] ? '/images/placeholder.jpg' : imageSrc}
  onError={() => handleImageError(slide.id)}
  // ...
/>
```

#### 7.2 성능 최적화
```typescript
// 이미지 프리로드 최적화
useEffect(() => {
  // viewport에 가까운 슬라이드만 프리로드
  const preloadNearbyImages = () => {
    const currentIndex = emblaApi?.selectedScrollSnap() ?? 0;
    const imagesToPreload = [
      carouselItems[currentIndex - 1],
      carouselItems[currentIndex],
      carouselItems[currentIndex + 1]
    ].filter(Boolean);
    
    imagesToPreload.forEach(item => {
      if (item) {
        const img = new Image();
        img.src = item.type === 'youtube' 
          ? getYouTubeThumbnail(item.src, 'max')
          : item.src;
      }
    });
  };
  
  if (emblaApi) {
    emblaApi.on('select', preloadNearbyImages);
    preloadNearbyImages();
  }
  
  return () => {
    emblaApi?.off('select', preloadNearbyImages);
  };
}, [emblaApi, carouselItems]);
```

## 🔍 검증 체크리스트

### 기능 검증
- [ ] 데스크톱에서 1220x450px 크기 확인
- [ ] 태블릿에서 768x320px 크기 확인
- [ ] 모바일에서 360x240px 크기 확인
- [ ] 중앙 슬라이드가 포커스되고 양쪽 슬라이드가 부분적으로 보임
- [ ] 무한 루프 정상 작동
- [ ] 자동 재생 4초 간격 유지
- [ ] 터치/스와이프 동작 정상
- [ ] 키보드 네비게이션 작동

### 디자인 검증
- [ ] 이미지/YouTube 썸네일 레터박스 없이 꽉 차게 표시
- [ ] 모든 슬라이드 라운드 처리 (rounded-lg) 적용
- [ ] 슬라이드 전환 애니메이션 부드러움
- [ ] 네비게이션 버튼 위치 적절함
- [ ] 자동 재생 4초 간격 확인

### 성능 검증
- [ ] 이미지 로딩 최적화 (priority, sizes 속성)
- [ ] 모바일 성능 저하 없음 (60fps 유지)
- [ ] 메모리 누수 없음
- [ ] Lighthouse 점수 90점 이상

## ⚠️ 주의사항

### 1. 이미지 비율 처리 전략
- **YouTube 썸네일**: 16:9 비율 → object-cover로 크롭
- **커스텀 이미지**: 다양한 비율 → object-cover로 통일
- **레터박스 금지**: 빈 공간 없이 이미지로 꽉 채움
- **크롭 포인트**: object-position: center로 중앙 기준 크롭
- **주의**: 이미지 중요 부분이 잘릴 수 있으므로 중앙 정렬 필수

### 2. 브라우저 호환성
- **모던 브라우저**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **모바일**: iOS Safari 14+, Chrome Mobile 90+
- **Fallback**: IE11 미지원, 폴리필 불필요

### 3. 성능 최적화
- **이미지 로딩**: 
  - 첫 3장 priority 속성 적용
  - 나머지 lazy loading
  - WebP 포맷 우선 사용 권장
- **렌더링 최적화**:
  - will-change: transform 슬라이드에 적용
  - GPU 가속 활용
- **번들 크기**: embla-carousel 약 25KB (gzipped)

### 4. 모바일 터치 영역
- 작은 화면에서도 스와이프 가능하도록 충분한 터치 영역 확보
- 네비게이션 버튼 크기 최소 44x44px 유지

### 5. 접근성
- 키보드 네비게이션 지원 (좌우 화살표)
- 스크린 리더 지원 (aria-label, role="region")
- 포커스 표시 명확히 (focus-visible)

### 6. 에러 처리
- 이미지 로드 실패 시 대체 이미지 표시
- YouTube 썸네일 로드 실패 시 기본 썸네일 사용
- 캐러셀 초기화 실패 시 정적 이미지 표시

## 📊 예상 작업 시간
- **Phase 1-2**: 30분 (캐러셀 옵션 및 레이아웃)
- **Phase 3-4**: 45분 (크기 조정 및 네비게이션)
- **Phase 5-6**: 30분 (반응형 및 상태 관리, 라운드 처리)
- **Phase 7**: 20분 (에러 처리 및 성능 최적화)
- **테스트 및 디버깅**: 45분
- **총 예상 시간**: 2시간 50분

## 🔄 롤백 계획

### 즉시 롤백 가능한 변경사항
1. Git 이전 커밋으로 복원
2. 백업된 원본 컴포넌트 파일 복원
3. CSS 변경사항만 되돌리기 (globals.css)

### 단계별 롤백
```bash
# 1. 현재 작업 백업
git stash

# 2. 이전 버전으로 복원
git checkout HEAD~1 -- src/components/features/home/HeroCarousel/

# 3. 필요시 특정 파일만 복원
git checkout HEAD~1 -- src/app/globals.css
```

## 🚀 배포 전 체크리스트

### 개발 환경 테스트
```bash
# 1. 빌드 확인
npm run build

# 2. TypeScript 체크
npx tsc --noEmit

# 3. Lint 체크
npm run lint

# 4. 로컬 테스트
npm run dev
```

### 크로스 브라우저 테스트
- [ ] Chrome (Desktop/Mobile)
- [ ] Safari (Desktop/Mobile) 
- [ ] Firefox (Desktop)
- [ ] Edge (Desktop)
- [ ] Samsung Internet (Mobile)

### 디바이스별 테스트
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)

## 📝 참고 자료
- [Embla Carousel - Center Mode](https://www.embla-carousel.com/examples/predefined/#center)
- [Embla Carousel - Variable Widths](https://www.embla-carousel.com/examples/predefined/#variable-widths)
- [shadcn/ui Carousel](https://ui.shadcn.com/docs/components/carousel)

## 📋 결정사항 요약

### 확정된 사항
1. **크기**: 데스크톱 1220x450px, 태블릿 768x320px, 모바일 360x240px
2. **레터박스 제거**: 모든 이미지 object-cover로 꽉 채움
3. **투명도 효과 없음**: 모든 슬라이드 동일한 불투명도
4. **자동 재생**: 4초 간격
5. **라운드 처리**: 모든 슬라이드 rounded-lg

### 기술적 개선사항
1. CSS 구현 방법 수정 (.embla__slide 클래스 사용)
2. overflow: hidden 유지 (안전성)
3. 성능 최적화 및 에러 처리 추가
4. 브라우저 호환성 및 롤백 계획 포함

---

*작성일: 2025-01-14*
*수정일: 2025-01-14*
*작성자: Claude AI Assistant*