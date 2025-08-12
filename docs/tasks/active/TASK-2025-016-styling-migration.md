# Task 2025-016: 스타일링 시스템 마이그레이션 (Tailwind → styled-components)

## 📋 작업 개요
- **작업 ID**: TASK-2025-016
- **작업 유형**: 리팩토링 / 시스템 통합
- **우선순위**: Critical
- **예상 소요 시간**: 2-3일
- **생성일**: 2025-01-12

## 🎯 목표
Tailwind CSS와 styled-components가 혼재된 현재 상태를 styled-components 단일 시스템으로 통합

## 📊 현재 상태 분석

### 혼재 현황
| 시스템 | 파일 수 | 사용량 | 위치 |
|--------|---------|--------|------|
| Tailwind CSS | 37개 | 737개 클래스 | 대부분의 컴포넌트 |
| styled-components | 8개 | 84개 사용 | design-system 폴더 |

### 영향받는 주요 파일
1. **sections 폴더** (Tailwind 집중)
   - HeroSection.tsx
   - MainCarousel.tsx
   - CategoryGrid.tsx
   - RevenueSlider.tsx
   - TopBanner.tsx

2. **design-system 폴더** (styled-components)
   - Button.styled.tsx
   - Card.styled.tsx
   - Typography.styled.tsx
   - Input.styled.tsx
   - Layout.styled.tsx
   - Gradient.styled.tsx

## 🚀 마이그레이션 전략

### Phase 1: 준비 (Day 1 Morning)
1. **디자인 시스템 확장**
   - [ ] Layout 컴포넌트 추가 (Container, Grid, Flex)
   - [ ] Spacing 유틸리티 추가
   - [ ] Animation 유틸리티 추가

2. **토큰 시스템 검증**
   - [ ] theme.deep.json 완전성 검증
   - [ ] 누락된 토큰 추가

### Phase 2: 컴포넌트 마이그레이션 (Day 1-2)

#### 우선순위 1: sections 폴더
```typescript
// Before (Tailwind)
<div className="flex items-center justify-between p-4 bg-white">

// After (styled-components)
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing[4]};
  background: ${theme.colors.background.default};
`;
```

#### 마이그레이션 순서
1. [ ] TopBanner.tsx
2. [ ] HeroSection.tsx
3. [ ] MainCarousel.tsx
4. [ ] CategoryGrid.tsx
5. [ ] RevenueSlider.tsx

#### 우선순위 2: 레이아웃 컴포넌트
1. [ ] Header.tsx
2. [ ] Footer.tsx
3. [ ] NavigationBar.tsx

#### 우선순위 3: 페이지 컴포넌트
1. [ ] app/page.tsx
2. [ ] app/courses/page.tsx
3. [ ] app/mypage/page.tsx
4. [ ] 기타 페이지들

### Phase 3: Tailwind 제거 (Day 2 Evening)
1. [ ] tailwind.config.ts 제거
2. [ ] postcss.config.mjs에서 Tailwind 제거
3. [ ] globals.css에서 Tailwind directives 제거
4. [ ] package.json에서 Tailwind 의존성 제거

### Phase 4: 검증 (Day 3)
1. [ ] 모든 페이지 시각적 검증
2. [ ] 반응형 디자인 테스트
3. [ ] 성능 측정
4. [ ] Storybook 업데이트

## 🛠️ 기술적 고려사항

### styled-components 장점
- SSR 완벽 지원
- 동적 스타일링 용이
- TypeScript 타입 안전성
- 컴포넌트 캡슐화

### 마이그레이션 도구
```typescript
// 공통 패턴 변환 헬퍼
const convertFlexClass = (className: string) => {
  const mapping = {
    'flex': 'display: flex;',
    'items-center': 'align-items: center;',
    'justify-between': 'justify-content: space-between;',
    'p-4': `padding: ${theme.spacing[4]};`,
    // ...더 많은 매핑
  };
  return mapping[className] || '';
};
```

## ⚠️ 위험 요소
1. **시각적 회귀**: 스타일 변경으로 인한 UI 깨짐
2. **성능 영향**: 런타임 스타일 생성
3. **번들 크기**: styled-components 추가 용량

## 📝 체크리스트

### 사전 준비
- [ ] 현재 UI 스크린샷 캡처
- [ ] 디자인 시스템 문서 업데이트
- [ ] 마이그레이션 가이드 작성

### 구현
- [ ] Phase 1 완료
- [ ] Phase 2 완료
- [ ] Phase 3 완료
- [ ] Phase 4 완료

### 검증
- [ ] TypeScript 컴파일 성공
- [ ] 빌드 성공
- [ ] 시각적 회귀 테스트
- [ ] 성능 벤치마크

## 📊 진행 상태
- **전체 진행률**: 0%
- **마이그레이션된 파일**: 0/37
- **제거된 Tailwind 클래스**: 0/737

## 🔗 관련 문서
- [System Consistency Analysis](../evidence/system-consistency-analysis-2025-01-12.md)
- [Design System Guide](../../design/stripe-integration-guide.md)

## 📌 참고사항
이 작업은 대규모 리팩토링이므로 단계적으로 진행하며, 각 단계마다 검증이 필요합니다.
급하게 진행하지 말고 체계적으로 진행해주세요.