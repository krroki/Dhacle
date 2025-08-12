# TASK-2025-008: DOM 직접 조작 제거 및 React 패턴 개선

## 📌 메타데이터
- **작업 ID**: TASK-2025-008
- **예상 소요시간**: 30분
- **담당**: Developer AI
- **우선순위**: HIGH
- **상태**: 대기중
- **의존성**: 없음
- **작성일**: 2025-01-10

## 🎯 작업 목표
React 외부에서 DOM을 직접 조작하는 안티패턴 제거하고 React 방식으로 리팩토링

## 📝 구현 지시사항

### 1. MainCarousel hover 상태 관리 개선
```typescript
// src/components/sections/MainCarousel.tsx:101-106

// ❌ 현재 문제 코드:
onMouseEnter={(e) => {
  e.currentTarget.style.background = 'linear-gradient(...)';
}}

// ✅ 수정 방법:
1. useState 추가:
   const [isHovered, setIsHovered] = useState(false);

2. 스타일 객체로 변경:
   style={{
     background: isHovered 
       ? 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%)'
       : 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)',
     transition: 'background 0.3s ease'
   }}
   onMouseEnter={() => setIsHovered(true)}
   onMouseLeave={() => setIsHovered(false)}
```

### 2. 인라인 스타일 추출
```typescript
// 버튼 스타일 객체 생성
const carouselStyles = {
  controlButton: {
    position: 'absolute' as const,
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '50%',
    // ... 나머지 스타일
  }
};

// 적용:
<button style={carouselStyles.controlButton}>
```

### 3. useCallback 최적화
```typescript
// 링크 처리 로직 훅으로 추출
const useCarouselNavigation = () => {
  const router = useRouter();
  
  return useCallback((link: string) => {
    if (link.startsWith('http')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      router.push(link);
    }
  }, [router]);
};
```

## ✅ 완료 기준
- [ ] DOM 직접 조작 코드 0개
- [ ] 모든 상태 React로 관리
- [ ] 스타일 객체 추출 완료
- [ ] 중복 코드 제거

## 🔍 검증 명령어
```bash
# DOM 조작 패턴 검색
grep -r "\.style\." src/ --include="*.tsx"
grep -r "currentTarget.style" src/ --include="*.tsx"

# React DevTools로 상태 변경 확인
npm run dev
# 브라우저에서 React DevTools 열어 상태 확인
```

## 📊 예상 결과
- React 렌더링 최적화 정상 작동
- 상태 관리 일관성 확보
- 코드 가독성 향상

---
*검증 프로토콜: hover 시 React DevTools에서 상태 변경 확인*