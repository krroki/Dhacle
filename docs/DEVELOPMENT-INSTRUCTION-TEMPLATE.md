# 🎯 개발 지시서 마스터 템플릿 v5.0

> 템플릿 기반 개발 + AI 협업 2단계 질문 시스템을 통합한 차세대 개발 지시서

## 🚀 30초 빠른 시작

### 초고속 지시서 (복사용)
```markdown
"[작업명] 만들어줘"

/sc:implement --seq --validate --c7
- 위치: /app/[폴더]/page.tsx
- UI: shadcn/ui + Tailwind
- 데이터: Supabase
- 폼: React Hook Form + Zod
- 상태: Zustand (필요시)
- 템플릿: AI가 자동 검색 후 제시

필수 기능:
1. ______
2. ______
3. ______

검증: TypeScript 에러 0, 빌드 성공, 반응형
```

### 자동 완성 예시
- **"로그인 폼"** → 템플릿 자동 완성
- **"강의 목록"** → 템플릿 자동 완성  
- **"결제 페이지"** → 템플릿 자동 완성

---

## 🎨 템플릿 기반 개발 프로세스 (NEW in v5.0)

### Phase 1: AI 자동 템플릿 검색
**목적**: 요구사항 분석 후 적합한 무료 템플릿 3-5개 자동 검색

```markdown
## 템플릿 검색 결과

| 옵션 | 템플릿명 | 출처 | 프로젝트 일치도 | 라이선스 |
|------|---------|------|----------------|----------|
| 1 | [템플릿명] | [URL] | 85% | MIT (무료) |
| 2 | [템플릿명] | [URL] | 72% | MIT (무료) |
| 3 | [템플릿명] | [URL] | 68% | Apache 2.0 |

**일치도 평가 기준:**
- 90-100%: 즉시 사용 가능, 최소 수정
- 70-89%: 적합, 일부 수정 필요
- 50-69%: 사용 가능, 상당한 수정 필요
- 50% 미만: 참고용, 재작성 권장
```

### Phase 2: 프로젝트 스펙 일치 검증
```markdown
## 필수 체크리스트 (모두 충족해야 함)
- [ ] Next.js 15.4.6 호환
- [ ] TypeScript 지원
- [ ] Tailwind CSS 사용
- [ ] shadcn/ui 컴포넌트 활용 가능
- [ ] Supabase 연동 가능
- [ ] 반응형 디자인 구현
- [ ] Server Component 구조 지원
- [ ] 무료 라이선스 (MIT, Apache 2.0 등)
```

### Phase 3: 템플릿 적용 & 수정
```markdown
1. 선택된 템플릿 기반 구조 생성
2. 프로젝트 요구사항에 맞게 수정
   - 한국어 텍스트 변경
   - Supabase 데이터 연동
   - 디자인 토큰 적용
   - 불필요한 기능 제거
3. 타입 정의 추가
4. Server/Client 컴포넌트 분리
```

### 검증된 무료 템플릿 소스 (2025.01 기준)
```markdown
**컴포넌트 라이브러리**
- shadcn/ui - https://ui.shadcn.com (최우선)
- HyperUI - https://hyperui.dev
- Flowbite - https://flowbite.com/blocks
- DaisyUI - https://daisyui.com
- Preline - https://preline.co (무료 버전)

**풀 템플릿**
- Vercel Templates - https://vercel.com/templates
- Next.js Examples - https://github.com/vercel/next.js/tree/canary/examples
- TailwindUI - https://tailwindui.com (무료 섹션만)

**페이지별 추천 검색어**
| 페이지 유형 | 검색어 | 추천 소스 |
|------------|--------|----------|
| 랜딩 | "SaaS landing hero" | HyperUI, Flowbite |
| 강의 상세 | "course detail sidebar" | TailGrids, Preline |
| 대시보드 | "admin dashboard" | shadcn/ui, Windmill |
| 로그인 | "auth form modal" | shadcn/ui, DaisyUI |
| 결제 | "checkout form" | Flowbite, Stripe |
```

## 🤖 AI 2단계 질문 시스템

### 📋 Phase 1: 지시서 작성 단계 (PM AI)
**목적**: 비즈니스 요구사항 명확화

```markdown
## 🔍 스마트 질문 (문서 분석 후 필요한 것만)

**이미 파악된 정보** (PROJECT-CODEMAP.md 기반):
✅ 기술 스택: Next.js 15.4.6, TypeScript, Supabase, shadcn/ui
✅ UI 스타일: FastCampus + Stripe 디자인 시스템
✅ 인증: Kakao OAuth 2.0 (구현 완료)
✅ 파일 구조: /app, /components, /lib 구조 확정

**추가 확인 필요** (최대 3-5개):
1. [ ] 이 기능의 우선순위? (긴급/보통/여유)
2. [ ] 특수 케이스 처리? (예: ______)
3. [ ] 성공 지표? (예: ______)
```

### 🔧 Phase 2: 개발 단계 (Developer AI)
**목적**: 기술적 세부사항 확정

```markdown
## 💻 개발 중 질문 우선순위

**🔴 즉시 질문 (작업 중단)**
- 보안 관련 결정
- 데이터 구조 변경
- 비용 발생 기능

**🟡 선택적 질문 (기본값 제공)**
- 캐싱 전략 (기본: 5분)
- 페이지네이션 (기본: 20개)
- 애니메이션 (기본: 300ms)

**🟢 질문 없이 진행**
- 코드 포맷팅
- 변수명
- 주석 스타일
```

---

## 📋 전체 마스터 템플릿 v4.0

```markdown
# 🎯 [기능명] 구현 지시서

## 0️⃣ 프로젝트 컨텍스트 (필수!)
**온보딩 문서 읽었나요?**
- [ ] docs/PROJECT-CODEMAP.md 읽음 (필수)
- [ ] docs/PROJECT.md 읽음 (현황 파악)

**프로젝트 정보** (자동 완성됨)
- 프로젝트명: 디하클
- 프로젝트 경로: C:\My_Claude_Project\9.Dhacle
- 주요 기술: Next.js 15.4.6, TypeScript, Supabase, Tailwind CSS, shadcn/ui
- UI 방향: Tailwind CSS + shadcn/ui (재구축 완료)
- 현재 Phase: 3 (UI 재구축 진행 중)

## 🤖 AI 스마트 질문 섹션

### PM AI 질문 (지시서 작성 시)
**다음 중 문서에서 확인 안 되는 항목만 답변:**
1. [ ] 비즈니스 규칙: _______
2. [ ] 우선순위: 긴급(1-2일) / 보통(3-5일) / 여유(1주+)
3. [ ] 특수 요구사항: _______

### Developer AI 질문 템플릿 (개발 중 자동 생성)
```typescript
if (불명확한_부분) {
  질문("에러 표시 방식?", ["토스트", "모달", "인라인"], 기본값: "토스트");
}
if (성능_트레이드오프) {
  질문("무한스크롤 vs 페이지네이션?", 기본값: "페이지네이션");
}
```

## 1️⃣ 기본 정보 (필수)

### 작업 복잡도 자동 예측 (NEW!)
```javascript
복잡도 = {
  simple: "1-3시간", // 단일 컴포넌트, CRUD
  moderate: "4-8시간", // 다중 컴포넌트, API 연동
  complex: "1-3일", // 시스템 통합, 복잡한 로직
  enterprise: "3일+", // 대규모 기능, 아키텍처 변경
}
```

**작업 유형을 선택하세요:**
- [ ] 폼/입력 (회원가입, 로그인, 프로필 수정 등) → 복잡도: simple-moderate
- [ ] 목록/테이블 (강의 목록, 검색 결과, 랭킹 등) → 복잡도: moderate
- [ ] 상세 페이지 (강의 상세, 프로필 상세 등) → 복잡도: moderate
- [ ] 대시보드 (관리자, 마이페이지 등) → 복잡도: complex
- [ ] 결제/구매 (Stripe, 토스페이먼츠 등) → 복잡도: complex
- [ ] 실시간 기능 (채팅, 알림 등) → 복잡도: complex-enterprise
- [ ] 파일 업로드 (이미지, 동영상 등) → 복잡도: moderate
- [ ] 인증/권한 (로그인, 권한 체크 등) → 복잡도: moderate-complex

## 2️⃣ SuperClaude 명령어
```bash
# 기본 명령어
/sc:implement --seq --validate --c7

# 복잡도별 추천 플래그
simple: --validate
moderate: --seq --validate --c7
complex: --seq --validate --evidence --think-hard --c7
enterprise: --seq --validate --evidence --ultrathink --delegate files --c7 --magic
```

## 3️⃣ 의존성 체크리스트 (NEW!)
**이 작업 시작 전 필요한 것들:**
- [ ] 인증 시스템 (✅ 이미 구현됨)
- [ ] DB 테이블: _______
- [ ] API 엔드포인트: _______
- [ ] 환경 변수: _______
- [ ] 외부 서비스 설정: _______

## 4️⃣ 5W1H 명세

**WHO (누가)**: 
- [ ] 모든 사용자
- [ ] 로그인한 사용자만
- [ ] 관리자만
- [ ] 특정 권한 사용자 (구체적으로: ______)

**WHAT (무엇을)**: 
[구체적인 기능 설명. 예: 이메일과 비밀번호로 로그인하는 폼]

**WHERE (어디에)**: 
- 페이지 경로: /app/[경로]/page.tsx
- 컴포넌트 위치: /components/[폴더]/[파일명].tsx
- API 경로: /app/api/[경로]/route.ts

**WHEN (언제)**: 
- [ ] 페이지 로드 시
- [ ] 버튼 클릭 시
- [ ] 폼 제출 시
- [ ] 스크롤 시
- [ ] 특정 조건 충족 시 (구체적으로: ______)

**WHY (왜)**: 
[비즈니스 목적. 예: 사용자 인증을 통해 개인화된 서비스 제공]

**HOW (어떻게)**: 
아래 상세 스펙 참조

## 5️⃣ 기술 스택 선택

### 📦 자동 선택된 라이브러리 (프로젝트 기준)
```yaml
기본 스택 (PROJECT-CODEMAP 기반):
  UI: Tailwind CSS + shadcn/ui
  상태관리: Zustand + Context API
  데이터: Supabase + TanStack Query
  폼: React Hook Form + Zod
  인증: Kakao OAuth (구현 완료)
```

### 추가 라이브러리 선택
#### 폼/입력 작업 시:
- [x] React Hook Form (자동 선택)
- [x] Zod (자동 선택)
- [ ] React-Dropzone (파일 업로드 필요 시)
- [ ] React-Select (고급 셀렉트박스 필요 시)

#### 목록/테이블 작업 시:
- [x] TanStack Query (자동 선택)
- [ ] TanStack Table (테이블 필요 시)
- [ ] React-Window (가상 스크롤 필요 시)

#### 결제 시스템:
- [ ] Stripe
- [ ] 토스페이먼츠
- [ ] 포트원(아임포트)

## 6️⃣ UI/UX 상세 스펙

### 레이아웃
- [ ] 전체 너비 (Full Width)
- [ ] 컨테이너 (max-w-7xl)
- [ ] 2단 레이아웃 (좌: 콘텐츠 65%, 우: 사이드바 35%)
- [ ] 모달/팝업

### 반응형 브레이크포인트 (디하클 표준)
- 모바일: < 768px
- 태블릿: 768px - 1024px
- 데스크톱: > 1024px

### 디자인 시스템 (자동 적용)
- Tailwind CSS 유틸리티 클래스
- shadcn/ui 컴포넌트
- 다크모드 지원 (선택)

## 7️⃣ 데이터 & API

### Supabase 테이블 (8개 기본 테이블)
- [x] users (인증 완료)
- [x] profiles (프로필 시스템)
- [ ] courses (강의 시스템)
- [ ] course_enrollments
- [ ] course_progress
- [ ] revenues
- [ ] badges
- [ ] 추가 필요: _______

### API 엔드포인트 패턴
```typescript
// 디하클 표준 API 패턴
GET    /api/[resource]          // 목록 조회
GET    /api/[resource]/[id]     // 상세 조회
POST   /api/[resource]          // 생성
PUT    /api/[resource]/[id]     // 수정
DELETE /api/[resource]/[id]     // 삭제
POST   /api/[resource]/[action] // 특수 액션
```

### 데이터 검증 규칙 예시
```typescript
// 디하클 표준 검증 규칙
const validationSchema = z.object({
  // 기본 필드
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "8자 이상 입력해주세요")
    .regex(/[A-Z]/, "대문자 포함")
    .regex(/[a-z]/, "소문자 포함")
    .regex(/[0-9]/, "숫자 포함")
    .regex(/[^A-Za-z0-9]/, "특수문자 포함"),
  
  // 디하클 특화 필드
  youtubeUrl: z.string().url().includes("youtube.com"),
  revenue: z.number().min(0).max(100000000),
  shortsDuration: z.number().min(15).max(60),
});
```

## 8️⃣ 테스트 시나리오 (자동 생성)

### 자동 생성되는 테스트 케이스
```typescript
// 작업 유형별 자동 테스트
const testScenarios = {
  form: [
    "유효한 데이터 제출 → 성공",
    "필수 필드 비움 → 에러 메시지",
    "잘못된 형식 → 검증 에러",
    "네트워크 에러 → 재시도 옵션",
  ],
  list: [
    "초기 로딩 → 스켈레톤 UI",
    "데이터 로드 → 목록 표시",
    "빈 결과 → Empty State",
    "페이지네이션 → 다음 페이지",
  ],
  payment: [
    "결제 성공 → 완료 페이지",
    "결제 실패 → 에러 처리",
    "결제 취소 → 이전 페이지",
  ]
};
```

## 9️⃣ 성능 벤치마크 (NEW!)

### 목표 성능 지표
```yaml
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
TTI (Time to Interactive): < 3.5s
Bundle Size: < 200KB per route
```

## 🔟 보안 체크리스트 (NEW!)

### 필수 보안 검증
- [ ] XSS 방지 (React 자동 처리)
- [ ] SQL Injection 방지 (Supabase RLS)
- [ ] CSRF 보호 (Next.js 자동)
- [ ] 민감 정보 노출 방지
- [ ] Rate Limiting 적용
- [ ] 입력값 검증 (Zod)

## 🔄 롤백 계획 (NEW!)

### 문제 발생 시 대응
```markdown
1. 즉시 롤백 가능: Git revert
2. DB 변경 시: Migration 롤백 스크립트
3. 배포 롤백: Vercel 이전 버전 복원
4. 긴급 핫픽스: 별도 브랜치에서 수정
```

## ⚡ 구현 순서 (최적화됨)

### 표준 개발 플로우
```mermaid
1. UI 구조 → 2. 더미 데이터 → 3. 상태 관리 → 
4. API 연동 → 5. 에러 처리 → 6. 최적화 → 7. 테스트
```

1. **UI 컴포넌트 생성** (shadcn/ui + Tailwind)
2. **더미 데이터로 UI 테스트**
3. **상태 관리 설정** (Zustand/Context)
4. **폼 & 검증** (React Hook Form + Zod)
5. **API 연동** (Supabase + TanStack Query)
6. **에러 처리 & 로딩 상태**
7. **반응형 & 접근성**
8. **성능 최적화**
9. **테스트 & 검증**

## ✅ 검증 체크리스트

### 필수 검증 (자동 실행)
```bash
# Developer AI가 자동으로 실행
npx tsc --noEmit         # TypeScript 체크
npm run build            # 빌드 테스트
npm run lint             # 린트 체크
```

### 수동 검증
- [ ] 반응형 디자인 (3개 브레이크포인트)
- [ ] 에러 케이스 (네트워크, 권한, 입력값)
- [ ] 접근성 (키보드, 스크린리더)
- [ ] 성능 (LCP < 2.5s)

## 📝 추가 요구사항
[특별한 요구사항이 있다면 여기에 작성]

## 🤝 AI 협업 프로토콜

### PM AI → Developer AI 핸드오프
```yaml
전달 내용:
  - 완성된 지시서
  - 우선순위
  - 마감일
  - 특수 요구사항
```

### Developer AI → PM AI 피드백
```yaml
보고 내용:
  - 구현 완료율
  - 발견된 이슈
  - 추가 질문
  - 테스트 결과
```
```

---

## 💬 실제 사용 예시 (v4.0)

### 스마트 질문이 적용된 대화
```markdown
사용자: "수익인증 게시판 만들어줘"

PM AI: "PROJECT-CODEMAP 분석 완료. 다음 2가지만 확인 필요:
1. 수익 검증 방식?
   □ 스크린샷만 (빠름)
   □ YouTube API 검증 (정확)
2. 가짜 신고 처리?
   □ 3회 자동 숨김
   □ 관리자 검토"

사용자: "YouTube API, 3회 자동"

PM AI: "[지시서 v4.0 생성 완료]"

--- 개발 시작 ---

Developer AI: "구현 중 확인:
무한스크롤 적용할까요? (기본: 페이지네이션)
[Enter로 기본값 선택]"

사용자: [Enter]

Developer AI: "[페이지네이션으로 구현 계속]"
```

---

## 🎯 케이스별 빠른 템플릿 (v4.0 업데이트)

### 1️⃣ 로그인 페이지 (디하클 누락 기능)
```markdown
작업: 로그인 페이지 긴급 구현
복잡도: moderate (4-6시간)
명령어: /sc:implement --seq --validate --c7

이미 구현된 것:
- Kakao OAuth (Header.tsx)
- Supabase Auth 설정

새로 필요한 것:
- /app/login/page.tsx 생성
- 이메일/비밀번호 폼
- 카카오 로그인 통합
- 로그인 후 리다이렉트

우선순위: 🔴 긴급 (다른 기능 블로킹)
```

### 2️⃣ 수익인증 게시판
```markdown
작업: 수익인증 시스템
복잡도: complex (2-3일)
명령어: /sc:implement --seq --validate --evidence --think-hard --c7

주요 기능:
- YouTube 수익 스크린샷 업로드
- 자동 검증 (OCR or API)
- 월별 랭킹
- 신고 시스템

기술 스택:
- Supabase Storage (이미지)
- TanStack Query (목록)
- Zustand (필터 상태)
```

---

## ⚠️ 실패 사례 & 절대 금지사항 (하단 배치)

### 이전 AI들의 실패 TOP 5
```markdown
1. ❌ className 직접 사용 → 955개나 생성해서 프로젝트 망침
2. ❌ 'use client' 남발 → 모든 페이지에 붙여서 SSR 이점 상실
3. ❌ Simple* 중복 컴포넌트 → 같은 기능 여러 개 만들어 혼란
4. ❌ 100줄 넘는 거대 파일 → page.tsx에 비즈니스 로직 전부 작성
5. ❌ any 타입 사용 → TypeScript 빌드 실패
```

### 절대 하지 말아야 할 코드 패턴
```typescript
// ❌❌❌ 절대 금지
className="bg-blue-500 text-white"  // Tailwind 직접 사용 금지
style={{ color: 'red' }}            // 인라인 스타일 금지
const data: any = {}                // any 타입 금지
'use client'                        // 페이지 최상단에 무조건 사용 금지

// ✅✅✅ 올바른 방법
<Button variant="primary">          // shadcn/ui 컴포넌트 사용
const data: CourseType = {}         // 명확한 타입 정의
// Server Component가 기본         // 필요한 곳만 Client Component
```

### 프로젝트 스펙 절대 준수 사항
```markdown
⚠️ 변경 금지 사항:
- Next.js 15.4.6 (다른 버전 X)
- Tailwind + shadcn/ui (styled-components 새로 추가 X)
- Supabase (Firebase나 MongoDB 제안 X)
- Vercel 배포 (AWS나 Netlify 제안 X)

⚠️ 구조 준수:
- /app → 페이지 (Server Component 기본)
- /components → 컴포넌트 (Client Component 허용)
- 파일당 100줄 제한
- 비즈니스 로직은 hooks/나 utils/로 분리
```

### 실패하면 생기는 일
```markdown
1. TypeScript 빌드 실패 → Vercel 배포 불가
2. 'use client' 남발 → SEO 망가짐, 속도 느려짐
3. className 직접 사용 → 디자인 일관성 깨짐
4. 100줄 넘는 파일 → 유지보수 지옥
5. any 타입 → 런타임 에러 폭탄
```

**경고**: 위 실수를 반복하면 프로젝트가 또 다시 "개판"이 됩니다!