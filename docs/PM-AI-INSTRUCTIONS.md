# PM-AI-INSTRUCTIONS.md - Developer AI 통제 템플릿

## 📋 범용 작업 템플릿 (모든 페이지/기능에 적용)

### 🚀 SuperClaude 명령어 활용
```markdown
# 페이지/기능 구현
/sc:implement [기능명] --seq --validate --uc
/sc:build [페이지명] --c7 --validate --playwright

# 분석/디버깅
/sc:analyze [대상] --think --seq --focus quality
/sc:troubleshoot [문제] --think-hard --delegate

# 품질 개선
/sc:improve [대상] --loop --iterations 3
/sc:cleanup [폴더] --safe-mode --validate

# 문서화
/sc:document [대상] --persona-scribe=ko --c7

# 작업 관리
/sc:task [작업명] --wave-mode --delegate
/sc:spawn [모드] --parallel --concurrency 5
```

### 플래그 사용 가이드
```markdown
--magic: UI/UX 질문 및 조언용 (전체 생성 X)
  예: "버튼 색상 추천?" "모달 베스트 프랙티스?"
  
--seq: 복잡한 로직 분석, 단계별 사고
--c7: 라이브러리 문서 참조 필요 시
--playwright: 실제 렌더링 테스트 필요 시
--validate: 각 단계 검증 강화
--uc: 토큰 절약 모드
--loop: 반복 개선 작업
--delegate: 대규모 파일 분석
--think/think-hard: 깊은 분석 필요 시
```

### 작업 유형별 권장 조합
- **페이지 작업**: `/sc:build` + `--validate --playwright`
- **디자인 질문**: `/sc:analyze` + `--magic` (조언용)
- **버그 수정**: `/sc:troubleshoot` + `--seq --think`
- **리팩토링**: `/sc:improve` + `--loop --validate`
- **대규모 분석**: `/sc:analyze` + `--delegate --wave-mode`

## 🔨 Developer AI 지시 템플릿

## 🔴 Step 0 범용 템플릿 (필수 - 모든 작업 시작 시 절대 빠뜨리지 마)

### Developer AI 완전한 지시문 시작 템플릿
```markdown
Developer AI야, 작업 전 최소 온보딩:

1. 프로젝트 기본 정보:
   - 프로젝트명: [프로젝트명]
   - 기술 스택: [스택 목록]
   - 디자인 시스템: [토큰 파일]

2. 중요 경로:
   - 컴포넌트: src/components/
   - 타입 정의: src/types/
   - API: src/app/api/
   - 페이지: src/app/

3. 핵심 규칙:
   - [기존컴포넌트] 반드시 재사용
   - [디자인토큰] 토큰만 사용
   - [Mock함수]() 사용
   - 새 컴포넌트 생성 절대 금지

⚠️ 경고: 또 개판 만들면 새 세션 열어서 처음부터 다시 시킨다.
[기존컴포넌트] 무시하면 즉시 중단.

이해했으면 다음 파일들 읽고 핵심 내용 요약해:
1. [관련 설계 문서]
2. [기존 컴포넌트 경로]
3. [타입 정의 경로]

읽은 후 다음 명령어 순서대로 실행:
1. 백업: cp [작업파일] [작업파일].backup
2. 확인: ls -la [관련폴더]/
3. 상태: cat [작업파일] | head -20
4. 검증: npx tsc --noEmit 2>&1 | head -10

모든 결과 보여주고, [기존컴포넌트] 파일 있는지 반드시 확인.
없으면 작업 중단하고 보고해.
```

### ⚡ PM AI 필수 체크리스트 (이거 안 하면 실패)
```
□ Step 0 템플릿 사용했나? (온보딩 + 협박 + 백업 + 검증)
□ [대괄호] 부분 실제 값으로 치환했나?
□ 기존 컴포넌트 재사용 강조했나?
□ 새 세션 협박 포함했나?
□ 백업 명령 포함했나?
□ TypeScript 검증 포함했나?
```

### 작업별 치환 가이드
```
[프로젝트명] → 디하클, 프로젝트명 등
[스택 목록] → Next.js, TypeScript, Supabase, Tailwind 등
[토큰 파일] → theme.deep.json, design-tokens.json 등
[기존컴포넌트] → SimpleCourseDetail, LoginForm, DashboardLayout 등
[디자인토큰] → theme.deep.json, tokens 등
[Mock함수] → mockSimpleCourse, mockUserData 등
[작업파일] → src/app/courses/[id]/page.tsx 등
[관련폴더] → src/components/courses/, src/components/auth/ 등
[관련 설계 문서] → docs/design/course-detail-page-ui-design.md 등
[기존 컴포넌트 경로] → src/components/courses/SimpleCourseDetail.tsx 등
[타입 정의 경로] → src/types/simple-course.types.ts 등
```

### 실제 사용 예시:
```
# courses 페이지 작업 시
1. src/components/courses/SimpleCourseDetail.tsx
2. src/types/simple-course.types.ts
3. docs/design/course-detail-page-ui-design.md

# 인증 페이지 작업 시
1. src/components/auth/LoginForm.tsx
2. src/types/auth.types.ts
3. docs/design/auth-flow.md
```

### 단계별 지시 템플릿 (10줄 단위)

#### 📋 범용 템플릿:
```
STEP [현재]/[총]: [작업명]
파일: [경로]
라인: [범위]
코드:
[10줄 이내 코드]

다른 거 하지 마. 완료하면 전체 파일 보여줘.
```

#### 🎯 실제 적용 예시 (패턴 학습용)
##### 예시 1: 페이지 작업 (5단계 패턴)
```
STEP 1/5: Import만 추가
파일: src/app/courses/[id]/page.tsx
라인: 1-3
코드:
import SimpleCourseDetail from '@/components/courses/SimpleCourseDetail'
import SimplePurchaseCard from '@/components/courses/SimplePurchaseCard'
import { mockSimpleCourse } from '@/types/simple-course.types'

다른 거 하지 마. 완료하면 전체 파일 보여줘.
```

```
STEP 2/5: 컴포넌트 함수 생성
라인: 5-10
코드:
export default function CoursePage() {
  const course = mockSimpleCourse()
  return null
}

완료하면 TypeScript 컴파일: npx tsc --noEmit
```

```
STEP 3/5: 레이아웃 추가
라인: 7 (return 부분)
코드:
return (
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8 py-8">
    </div>
  </div>
)

완료하면 npm run dev 실행
```

```
STEP 4/5: SimpleCourse 컴포넌트 추가
그리드 안에 추가:
<SimpleCourseDetail course={course} />
<SimplePurchaseCard course={course} />

완료하면 브라우저 콘솔에서:
document.querySelector('h1')?.textContent
```

```
STEP 5/5: 최종 검증
localhost:3000/[페이지경로] 스크린샷 찍어.
다음 체크:
□ 좌측 콘텐츠 있음?
□ 우측 구매 카드 있음?
□ 탭 3개 보임?
□ Mock 데이터 표시됨?
```

##### 예시 2: API 작업 (4단계 패턴)
```
STEP 1/4: Import 추가
파일: src/app/api/[endpoint]/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

STEP 2/4: 함수 생성
export async function GET() {
  const supabase = createServerClient()
  return NextResponse.json({ data: [] })
}

STEP 3/4: 로직 구현
const { data, error } = await supabase.from('[table]').select('*')
if (error) return NextResponse.json({ error }, { status: 500 })

STEP 4/4: 테스트
curl http://localhost:3000/api/[endpoint]
```

##### 예시 3: 컴포넌트 작업 (3단계 패턴)
```
STEP 1/3: Props 타입 정의
interface [Component]Props {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

STEP 2/3: 컴포넌트 구조
export function [Component]({ variant = 'primary', children }: [Component]Props) {
  return <div className={styles[variant]}>{children}</div>
}

STEP 3/3: 스타일/테스트
npm run dev && npx tsc --noEmit
```

### 검증 명령 템플릿
```
다음 3개 모두 실행하고 결과 보여줘:

1. TypeScript 체크:
   npx tsc --noEmit
   (에러 0개여야 함)

2. 브라우저 콘솔:
   const checks = {
     title: document.querySelector('h1')?.textContent,
     tabs: document.querySelectorAll('[class*="tab"]').length,
     content: document.querySelector('[class*="content"]')?.children.length > 0,
     purchase: !!document.querySelector('[class*="purchase"]')
   }
   console.table(checks)

3. 스크린샷:
   npx playwright screenshot http://localhost:3000/courses/1 verify.png
```

### 실패 시 협박 템플릿
```
1차 경고:
"SimpleCourseDetail 안 썼네? 다시 해."

2차 경고:
"또 새로 만들었어? 경고했는데? 
git reset --hard HEAD
마지막 기회다."

3차 경고:
"3번 경고했는데도 안 듣네?
새 세션 열어서 처음부터 다시 할까?
아니면 SimpleCourseDetail.tsx 쓸래?"

최종:
"새 세션 연다. 너는 끝이다."
```

### 롤백 명령
```bash
# 작업 전 백업
git stash
# 또는
cp src/app/courses/[id]/page.tsx backup.tsx

# 실패 시 롤백
git stash pop
# 또는
mv backup.tsx src/app/courses/[id]/page.tsx

"다시. SimpleCourseDetail만 써."
```