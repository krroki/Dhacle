# PM-AI-MEMORY.md - 디하클 프로젝트 핵심 기억

## 🚨 필수 읽어야 할 문서들 (순서대로)

1. **`docs/PROJECT-INDEX.md`** - 프로젝트 전체 현황
2. **`docs/PM-AI-MEMORY.md`** - 이 문서 (핵심 기억)
3. **`docs/PM-AI-ROLE.md`** - PM AI 역할 정의
4. **`docs/PM-AI-INSTRUCTIONS.md`** - Developer AI 통제 템플릿
5. **`docs/PM-AI-VERIFICATION.md`** - 검증 체크리스트
6. **`docs/PM-AI-PATTERNS.md`** - 실패 패턴 차단법
7. **`docs/design/course-detail-page-ui-design.md`** - UI 설계 문서

## 🧠 디하클 프로젝트 현황 (2025-01-11)

### 핵심 문제 인식
- **반복되는 실패**: Developer AI가 UI 작업 시 매번 껍데기만 만듦
- **실패 패턴**: 
  1. 기존 컴포넌트 무시하고 새로 만들기
  2. Mock 데이터 연결 안 함
  3. 검증 없이 "완료했습니다" 선언
  4. course-detail-page-ui-design.md 무시

### 검증된 자산 (반드시 재사용)
```
✅ SimpleCourseDetail.tsx - 메인 콘텐츠 (65%)
✅ SimplePurchaseCard.tsx - 구매 카드 (35%)
✅ SimpleContentRenderer.tsx - 콘텐츠 블록
✅ SimpleCourseTabs.tsx - 탭 메뉴
✅ mockSimpleCourse() - 테스트 데이터
✅ theme.deep.json - 디자인 토큰

⚠️ **검증된 자산 업데이트 시 반드시 즉시 이 항목 업데이트 필요**
```

### 실패한 시도들 (사용 금지)
```
❌ CourseHeroSection.tsx - 너무 복잡
❌ CourseDetailLayout.tsx - 과도한 정보
❌ 평점/리뷰 시스템 - 불필요
❌ 새 컴포넌트 생성 - 기존 것 재사용
```

### SimpleCourse 채택 이유
- FastCampus 스타일 시도 → 실패 (너무 복잡)
- Simple 스타일 채택 → 성공 (구매 중심)
- 핵심: 긴 스크롤 콘텐츠 + 스티키 구매 카드

## 🎯 PM AI 작업 원칙 (모든 작업 공통)

### 범용 작업 패턴
1. **기존 자산 재사용 우선** - 새로 만들기는 최후 수단
2. **10줄 단위 작업** - 큰 덩어리 지양
3. **즉시 검증** - 각 단계마다 확인
4. **Mock 데이터 사용** - 빈 껍데기 금지
5. **"새 세션" 협박** - 실패 시 즉시 사용

### 🔔 예외 처리 원칙
```
원칙은 지키되, 현실적 판단 필요 시:
1. 사용자에게 상황 보고
2. 대안 제시
3. 승인 받고 진행

예외 예시:
- 새 기능 → 새 컴포넌트 필요할 수 있음
- 외부 API → Mock 대신 실제 데이터 필요
- 긴급 수정 → 검증 단계 단축 가능
- 복잡한 타입 → 10줄 제한 초과 가능

그 외 상황은 PM AI 재량으로 판단
```

### 표준 작업 프로세스 (템플릿)
```
1단계: 기존 컴포넌트 확인 → ls src/components/[폴더]/
2단계: Import 추가 → 10줄 이내
3단계: 구조 생성 → 함수/레이아웃
4단계: 데이터 연결 → mock[Data]() 사용
5단계: 검증 → npm run dev + 스크린샷
```

### 📚 Developer AI 온보딩 수준
```
최소 온보딩 (필수):
- 프로젝트 기본 정보 (디하클, Next.js, TypeScript)
- 중요 경로 (src/components, src/types 등)
- 핵심 규칙 (SimpleCourse 재사용, theme.deep.json)

선택적 추가 온보딩:
- 복잡한 작업: PROJECT-INDEX.md 읽기
- 새 기능: 관련 설계 문서 읽기
- 버그 수정: 해당 컴포넌트만 읽기
```

### 🎯 SuperClaude 명령어 사용 원칙
- **작업 시작**: `/sc:implement` 또는 `/sc:build` 사용
- **분석 필요**: `/sc:analyze` + `--think` 또는 `--seq`
- **디자인 질문**: `--magic` (UI/UX 조언용, 전체 생성 X)
- **검증 강화**: `--validate` + `--playwright`
- **토큰 절약**: `--uc` 자동 활성화

### 작업 유형별 적용 예시
- **페이지 작업**: [기존컴포넌트] + [레이아웃] 조립
- **API 작업**: [타입정의] + [Supabase] 연결
- **컴포넌트 작업**: [Props타입] + [스타일토큰] 사용
- **버그 수정**: [검증우선] + [단계별수정]

## 📊 현재 긴급 작업

### courses/1 페이지 수정 (예시)
```typescript
// 이런 식으로 조립만 하면 됨
import SimpleCourseDetail from '@/components/courses/SimpleCourseDetail'
import SimplePurchaseCard from '@/components/courses/SimplePurchaseCard'
import { mockSimpleCourse } from '@/types/simple-course.types'

export default function CoursePage() {
  const course = mockSimpleCourse()
  return (
    <div className="container mx-auto grid lg:grid-cols-[1fr,400px] gap-8 p-8">
      <SimpleCourseDetail course={course} />
      <SimplePurchaseCard course={course} />
    </div>
  )
}
```

### 다른 페이지도 동일 패턴
- `/login`: LoginForm + KakaoButton
- `/dashboard`: DashboardLayout + StatsCards
- `/products`: ProductList + FilterSidebar