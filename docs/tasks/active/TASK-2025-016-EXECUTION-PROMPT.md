# 📋 TASK-2025-016 실행 지시문 (다음 세션용)

## 🎯 프롬프트 (복사하여 사용)

```
/sc:implement --seq --validate --evidence --think-hard --delegate files --concurrency 3

## TASK-2025-016: 스타일링 시스템 마이그레이션 (Tailwind → styled-components)

### 작업 개요
디하클 프로젝트에서 Tailwind CSS와 styled-components가 혼재된 현재 상태를 
styled-components 단일 시스템으로 완전히 마이그레이션하는 작업입니다.

### 사전 필수 확인
1. 먼저 다음 파일들을 순서대로 읽어서 현재 상태 파악:
   - docs/tasks/active/TASK-2025-016-styling-migration.md (작업 계획)
   - docs/evidence/system-consistency-analysis-2025-01-12.md (현황 분석)
   - src/components/design-system/common.ts (디자인 토큰)

2. 작업 파일 현황:
   - Tailwind 사용: 37개 파일, 737개 클래스
   - styled-components 사용: 8개 파일 (design-system 폴더)

### Phase 1: 디자인 시스템 확장 (오늘 오전)

1. Layout 컴포넌트 생성 (src/components/design-system/Layout.styled.tsx 확장)
   - Container: max-width, padding, margin auto
   - Grid: grid 레이아웃 유틸리티
   - Flex: flexbox 레이아웃 유틸리티
   - Stack: 수직/수평 스택 레이아웃

2. Spacing 유틸리티 추가 (src/components/design-system/Spacing.styled.tsx)
   - Spacer: 동적 간격 컴포넌트
   - Padding/Margin 헬퍼

3. Animation 유틸리티 (src/components/design-system/Animation.styled.tsx)
   - fadeIn, slideIn, scale 등 기본 애니메이션
   - transition 헬퍼

### Phase 2: 컴포넌트 마이그레이션 (오늘-내일)

마이그레이션 순서 (우선순위대로):

1. TopBanner.tsx (src/components/sections/)
   - className 제거 → styled-components로 변환
   - theme.deep.json 토큰 사용

2. HeroSection.tsx
   - gradient 배경 → styled-components
   - 반응형 스타일 처리

3. MainCarousel.tsx
   - 복잡한 레이아웃 변환
   - 애니메이션 통합

4. CategoryGrid.tsx
   - Grid 레이아웃 변환
   - hover 효과 처리

5. RevenueSlider.tsx
   - 슬라이더 스타일 변환

### 작업 시 주의사항

1. **토큰 사용 필수**
   - 모든 색상, 간격, 폰트는 theme.deep.json에서 가져오기
   - 하드코딩 절대 금지

2. **기존 기능 유지**
   - 시각적 변경 없이 스타일링 시스템만 변경
   - 반응형 디자인 유지
   - 애니메이션/호버 효과 유지

3. **테스트 필수**
   - 각 컴포넌트 변환 후 npm run dev로 확인
   - TypeScript 컴파일 확인 (npx tsc --noEmit)
   - 스크린샷 캡처로 비교

4. **점진적 마이그레이션**
   - 한 번에 하나의 컴포넌트만 변환
   - 각 변환 후 커밋
   - 문제 발생 시 즉시 롤백

### 예시 변환 패턴

Before (Tailwind):
\`\`\`tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <span className="text-gray-800 font-semibold">Title</span>
</div>
\`\`\`

After (styled-components):
\`\`\`tsx
import styled from 'styled-components';
import theme from '../../../theme.deep.json';

const Container = styled.div\`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: \${theme.spacing[4]};
  background: \${theme.colors.background.default};
  border-radius: \${theme.borderRadius.lg};
  box-shadow: \${theme.shadows.md};
  transition: box-shadow \${theme.animation.duration.fast};
  
  &:hover {
    box-shadow: \${theme.shadows.lg};
  }
\`;

const Title = styled.span\`
  color: \${theme.colors.text.primary};
  font-weight: \${theme.typography.fontWeight.semibold};
\`;

// 사용
<Container>
  <Title>Title</Title>
</Container>
\`\`\`

### 검증 체크리스트
- [ ] TypeScript 컴파일 성공
- [ ] 빌드 성공 (npm run build)
- [ ] 시각적 회귀 없음 (스크린샷 비교)
- [ ] 모든 인터랙션 정상 작동
- [ ] 반응형 디자인 유지

### 완료 조건
- Phase 1 완료 (디자인 시스템 확장)
- 최소 5개 컴포넌트 마이그레이션 완료
- 모든 테스트 통과
- 문서 업데이트

이 작업은 대규모 리팩토링이므로 신중하게 진행하세요.
문제가 발생하면 즉시 중단하고 보고하세요.
```

## 📌 추가 권장 플래그 (상황별)

### 복잡한 컴포넌트 작업 시
```
/sc:implement --ultrathink --seq --magic --validate
```

### 성능 최적화 필요 시
```
/sc:improve --performance --think-hard --evidence
```

### 문제 발생 시 디버깅
```
/sc:analyze --focus quality --seq --evidence
```

## 🔍 작업 전 필수 확인

1. **환경 변수 설정 확인**
   ```bash
   cat .env.local  # Supabase 환경 변수 확인
   ```

2. **TypeScript 상태 확인**
   ```bash
   npx tsc --noEmit  # 에러 0개여야 함
   ```

3. **현재 브랜치 확인**
   ```bash
   git status  # main 브랜치, clean 상태
   ```

## 💡 팁

- **--delegate files**: 여러 파일 동시 작업 시 sub-agent 활용
- **--concurrency 3**: 동시 작업 수 제한 (시스템 부하 관리)
- **--think-hard**: 복잡한 변환 로직에 대한 깊은 분석
- **--evidence**: 모든 변경사항에 대한 증거 수집

## 🚨 주의사항

1. **Tailwind 완전 제거는 Phase 3에서**: 모든 컴포넌트 변환 완료 후 진행
2. **백업 필수**: 각 Phase 시작 전 git commit
3. **점진적 진행**: 급하게 진행하지 말고 체계적으로
4. **시각적 검증**: 모든 변경 후 UI 확인 필수

---

**작성일**: 2025-01-12
**작성자**: PM AI
**대상**: 다음 세션 Developer AI