# 📝 디하클 지시서 템플릿 (Instruction Template)

*Claude Code에게 정확한 지시를 생성하기 위한 메타-템플릿*

---

## 🔴 필수: 모든 지시서에 반드시 포함
**모든 지시서 생성 시 다음 문구 필수 포함:**
- "TypeScript any 타입 절대 사용 금지"
- "타입을 제대로 정의하거나 unknown을 쓰고 타입 가드를 쓸 것"

---

## 🎯 사용법
```
"[작업 내용] 구현하고 싶어. INSTRUCTION_TEMPLATE.md 읽고 지시서 작성해줘"
```

---

## ⚠️ 핵심 원칙: 실제 구현 검증 > 문서 신뢰
**문서는 거짓일 수 있음!** 문서가 ✅라고 표시되어도 실제 파일이 없거나 제대로 작동하지 않을 수 있습니다.
항상 다음 순서로 검증:
1. **실제 파일 존재 확인** (`test -f` 또는 Read)
2. **실제 동작 테스트** (API 호출, 로직 실행)
3. **그 다음에 문서 확인** (참고용으로만)

---

## 🔄 한국어 → 영어 매핑 가이드

| 한국어 | 영어 (파일/API) | 위치 예시 |
|--------|----------------|----------|
| 폴더 | folders | /api/youtube/folders |
| 즐겨찾기 | favorites | /api/youtube/favorites |
| 컬렉션 | collections | /api/youtube/collections |
| 댓글 | comments | /api/community/comments |
| 프로필 | profile | /api/user/profile |
| 수익 인증 | revenue-proof | /api/revenue-proof |
| 강의 | courses | /api/courses |
| 인기 Shorts | popular | /api/youtube/popular |
| 지표 | metrics | /api/youtube/metrics |
| 검색 | search | /api/youtube/search |

**찾는 방법**: `grep -r "한국어키워드\|영어키워드" src/app/api`

---

## 🚀 작업별 SC 명령어 & 플래그 매핑

| 작업 유형 | SC 명령어 | 필수 플래그 | 선택 플래그 |
|----------|----------|------------|------------|
| **UI 컴포넌트** | `/sc:implement` | `--seq --validate --c7` | `--magic` |
| **API 연결** | `/sc:implement` | `--seq --validate --think` | `--delegate` |
| **페이지 생성** | `/sc:build` | `--seq --validate --c7 --magic` | `--wave-mode` |
| **버그 수정** | `/sc:fix` | `--seq --validate --think` | `--introspect` |
| **리팩토링** | `/sc:improve` | `--seq --validate --think-hard` | `--loop` |
| **문서 분석** | `/sc:analyze` | `--seq --ultrathink --delegate` | `--uc` |

---

## 🔍 에러 디버깅 가이드

### HTTP 에러별 체크리스트
| 에러 | 확인 사항 | 해결 방법 |
|------|----------|----------|
| **500** | 1. 서버 로그 확인<br>2. DB 연결 상태<br>3. 환경변수 설정 | `npm run dev` 콘솔 확인<br>`console.error()` 추가<br>`.env.local` 체크 |
| **401** | 1. 세션 체크 방식<br>2. 쿠키 전달 여부<br>3. getUser vs getSession | `api-client.ts` 사용 확인<br>`credentials: 'same-origin'`<br>getUser() 통일 |
| **404** | 1. 라우트 파일 존재<br>2. 경로 오타<br>3. HTTP 메서드 | `test -f` 로 파일 확인<br>대소문자 체크<br>GET/POST/PUT/DELETE |
| **400** | 1. 요청 데이터 형식<br>2. 필수 필드 누락<br>3. 타입 불일치 | Zod 스키마 확인<br>Request body 로깅<br>TypeScript 타입 체크 |

---

## 🆕 새 기능 추가 패턴

### Step 1: 데이터베이스 (필요시)
```sql
-- supabase/migrations/[timestamp]_[feature_name].sql
CREATE TABLE IF NOT EXISTS [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);
-- RLS 정책 필수!
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
```

### Step 2: API Route
```typescript
// src/app/api/[domain]/[feature]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'User not authenticated' }),
      { status: 401 }
    );
  }
  // 비즈니스 로직
}
```

### Step 3: UI 컴포넌트
```typescript
// src/components/features/[FeatureName].tsx
'use client';
import { apiPost } from '@/lib/api-client';

export function FeatureName() {
  // shadcn/ui 컴포넌트 사용
  // api-client.ts로 API 호출
}
```

---

## 📋 3단계 지시서 템플릿 (순서 중요!)

### 🔴 Phase 1: Implementation Verification (실제 구현 검증)
```markdown
## 실제 구현 검증 (문서보다 코드가 진실!)
다음 파일/기능이 실제로 존재하고 작동하는지 확인:

1. **파일 존재 확인**
   - test -f "src/app/api/[작업]/route.ts" 
   - test -f "src/components/[작업].tsx"
   - 관련 파일들 실제 Read로 내용 확인

2. **API 동작 테스트** (있는 경우)
   - 정상 케이스: 유효한 입력 → 200 응답 + 올바른 데이터
   - 인증 테스트: 로그인 상태 → 200, 로그아웃 → 401
   - 에러 케이스: 잘못된 입력 → 400 + 명확한 에러 메시지

3. **UI 동작 테스트** (있는 경우)  
   - 버튼 클릭 → 실제 API 호출 발생?
   - 로딩 중 → 스피너/스켈레톤 표시?
   - 에러 발생 → 사용자 친화적 메시지?
   - 성공 시 → 적절한 피드백?

실제 동작하지 않으면 문서가 뭐라고 하든 ❌
```

### 🔵 Phase 2: Document Reference (문서 참조 - 맥락 파악용)
```markdown
## 문서 참조 (참고용, 맹신 금지!)
13개 문서에서 필요한 섹션만 선택적으로 확인:

1. **WIREFRAME.md** → 작업별 섹션 찾기
   - YouTube lens 작업: "## YouTube Lens" 섹션
   - 강의 작업: "## 강의 시스템" 섹션
   - 커뮤니티 작업: "## 커뮤니티" 섹션
   - 찾을 수 없으면: grep -n "작업키워드" docs/WIREFRAME.md

2. **COMPONENT_INVENTORY.md** → 컴포넌트 카테고리
   - "### shadcn/ui 컴포넌트" (28개 기본)
   - "### 레이아웃 컴포넌트" (Header, Sidebar 등)
   - "### 기능 컴포넌트" (HeroCarousel, CourseGrid 등)
   - 찾을 수 없으면: grep -r "Button\|Card\|Form" src/components

3. **ROUTE_SPEC.md** → 라우트 테이블에서 행 찾기
   - 형식: | /경로 | 설명 | 인증 | 가드 |
   - 예: /tools/youtube-lens, /mypage, /admin
   - 찾을 수 없으면: grep "작업페이지" docs/ROUTE_SPEC.md

4. **STATE_FLOW.md** → 상태 관리 패턴
   - "### YouTube Lens 상태 흐름"
   - "### 인증 상태 흐름"
   - "### 글로벌 상태 (Zustand)"
   - 찾을 수 없으면: 기본 패턴 사용 (loading/error/data)

5. **ERROR_BOUNDARY.md** → 에러 처리 전략
   - "### 401 Unauthorized 처리"
   - "### 404 Not Found 처리"
   - "### 500 Server Error 처리"
   - 찾을 수 없으면: 401→로그인, 기타→토스트

6. **DATA_MODEL.md** → 타입 정의
   - "### YouTube 도메인 타입"
   - "### 사용자 도메인 타입"
   - "### API 응답 타입"
   - 찾을 수 없으면: src/lib/types/*.ts 참조

7. **FLOWMAP.md** → 네비게이션 경로
   - "로그인 필요 시: /auth/login → [원래 페이지]"
   - "온보딩: /onboarding → /mypage"
   - 찾을 수 없으면: Header.tsx의 네비게이션 참조

나머지 문서는 필요시만:
- PROJECT.md → 현재 이슈 확인
- CODEMAP.md → 파일 위치 찾기
- CHECKLIST.md → 최종 검증 체크리스트
- DOCUMENT_GUIDE.md → 문서 업데이트 가이드
- CLAUDE.md → AI 작업 규칙
- 이 문서 (INSTRUCTION_TEMPLATE.md)
```

### 🟢 Phase 3: Implementation & Testing (구현 및 테스트)
```markdown
## 구현 및 테스트
[작업 내용] 구현:

1. **구현 전 체크**
   - 기존 컴포넌트 재사용 가능? → COMPONENT_INVENTORY
   - API 이미 있음? → 실제 파일 확인 (문서 말고!)
   - 비슷한 패턴 있음? → 기존 코드 참조

2. **구현 중 필수사항**
   - shadcn/ui 컴포넌트 우선 사용
   - api-client.ts 래퍼 사용 (직접 fetch 금지)
   - TypeScript strict mode (any 금지)
   - 에러 처리 (try-catch, 401 리다이렉트)

3. **테스트 시나리오 (Positive + Negative)**
   ✅ Positive Cases (정상 동작):
   - API Key 있을 때 → 데이터 정상 로드
   - 로그인 상태 → 모든 기능 정상 작동
   - 유효한 입력 → 성공 응답 + UI 업데이트
   - 페이지네이션 → 다음 페이지 정상 로드
   
   ❌ Negative Cases (에러 처리):
   - API Key 없을 때 → 명확한 안내 메시지
   - 로그아웃 상태 → 401 → 로그인 리다이렉트
   - 잘못된 입력 → 400 + 구체적 에러 메시지
   - 네트워크 에러 → 재시도 옵션 제공
   - 빈 결과 → Empty State UI 표시

4. **문서 업데이트 (구현 후!)**
   - WIREFRAME.md → 실제 구현 상태 반영
   - COMPONENT_INVENTORY → 새 컴포넌트 추가
   - 다른 문서들 → 필요시만 업데이트
```

---

## 📱 반응형 디자인 가이드

### Tailwind 반응형 클래스
| 화면 크기 | Prefix | 기준 너비 | 사용 예시 |
|----------|--------|----------|----------|
| 모바일 | (기본) | < 640px | `text-sm p-2` |
| 태블릿 | `sm:` | ≥ 640px | `sm:text-base sm:p-4` |
| 노트북 | `md:` | ≥ 768px | `md:text-lg md:p-6` |
| 데스크톱 | `lg:` | ≥ 1024px | `lg:text-xl lg:p-8` |
| 대형 | `xl:` | ≥ 1280px | `xl:text-2xl xl:p-10` |

### 자주 사용하는 반응형 패턴
```tsx
// 모바일 우선 반응형 버튼
<Button className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3">
  클릭
</Button>

// 반응형 그리드
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 아이템들 */}
</div>

// 조건부 표시/숨김
<div className="hidden sm:block">데스크톱만 표시</div>
<div className="block sm:hidden">모바일만 표시</div>
```

---

## 📁 자주 사용하는 파일 경로 (외우기!)

### API Routes
```
/api/youtube/*         → src/app/api/youtube/*/route.ts
/api/user/*           → src/app/api/user/*/route.ts
/api/community/*      → src/app/api/community/*/route.ts
/api/auth/callback    → src/app/api/auth/callback/route.ts
```

### 페이지 파일
```
/tools/youtube-lens   → src/app/(pages)/tools/youtube-lens/page.tsx
/mypage              → src/app/(pages)/mypage/page.tsx
/admin/*             → src/app/(pages)/admin/*/page.tsx
/courses/*           → src/app/(pages)/courses/*/page.tsx
```

### 핵심 컴포넌트
```
Header               → src/components/layout/Header.tsx
Sidebar              → src/components/layout/Sidebar.tsx
api-client           → src/lib/api-client.ts
supabase             → src/lib/supabase/server.ts
```

---

## 🚀 특수 케이스 빠른 참조

### 실시간 기능 (WebSocket/SSE)
```typescript
// Supabase Realtime 사용
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()
const channel = supabase.channel('room1')
  .on('broadcast', { event: 'message' }, (payload) => {
    console.log(payload)
  })
  .subscribe()
```

### Zustand 상태 관리
```typescript
// src/store/[feature]Store.ts
import { create } from 'zustand'

export const useFeatureStore = create((set) => ({
  data: null,
  loading: false,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading })
}))
```

### 다크 모드 구현
```typescript
// next-themes 사용 (이미 설치됨)
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </Button>
  )
}
```

### 메모리 누수 체크
```typescript
// useEffect cleanup 필수
useEffect(() => {
  const subscription = subscribe()
  return () => {
    subscription.unsubscribe() // cleanup!
  }
}, [])
```

---

## 🏗️ 프로젝트 컨텍스트

### 기술 스택
- **Frontend**: Next.js 15.4.6, TypeScript, shadcn/ui, Tailwind
- **Backend**: Supabase (PostgreSQL), Next.js API Routes
- **State**: Zustand (global), useState (local), Supabase (server)
- **Auth**: Kakao OAuth 2.0 + Supabase Auth
- **Real-time**: Supabase Realtime (WebSocket)
- **Theme**: next-themes (다크 모드 지원)

### 핵심 원칙
1. **UI만 만들지 말것** → 반드시 백엔드 연결
2. **에러만 표시 금지** → 401은 로그인 리다이렉트
3. **컴포넌트 재사용** → COMPONENT_INVENTORY 확인
4. **일관성 유지** → Header/Sidebar 동기화

### 보안 필수사항
- 모든 API Route: 세션 검사 (user 체크)
- 클라이언트: api-client.ts 래퍼 사용
- 에러 응답: `{ error: string }` 형식

---

## 📌 작업 유형별 템플릿

### 1️⃣ UI 컴포넌트 생성
```
/sc:implement --seq --validate --c7 --magic

Phase 1: COMPONENT_INVENTORY.md에서 [컴포넌트명] 검색
Phase 2: 없으면 생성, 있으면 재사용
Phase 3: WIREFRAME.md에 API 연결 추가
```

### 2️⃣ API 엔드포인트 연결
```
/sc:implement --seq --validate --think

Phase 1: WIREFRAME.md에서 [페이지] 섹션 확인
Phase 2: DATA_MODEL.md 참조하여 타입 매핑
Phase 3: ERROR_BOUNDARY.md 에러 처리 적용
```

### 3️⃣ 새 페이지 생성
```
/sc:build --seq --validate --c7 --magic

Phase 1: ROUTE_SPEC.md에 라우트 추가
Phase 2: FLOWMAP.md에 네비게이션 추가
Phase 3: 모든 문서에 페이지 정보 추가
```

### 4️⃣ 버그 수정
```
/sc:fix --seq --validate --think

Phase 1: 관련 문서에서 ❌ 항목 찾기
Phase 2: ERROR_BOUNDARY.md 참조하여 수정
Phase 3: 구현 상태 ✅로 업데이트
```

---

## 🔥 즉시 사용 가능한 지시 예시 (구체적!)

### YouTube Lens 검색바 구현
```bash
/sc:implement --seq --validate --c7 --magic

Phase 1: 실제 파일 확인
- test -f "src/app/api/youtube/search/route.ts" && echo "API 있음" || echo "API 없음"
- test -f "src/components/features/SearchBar.tsx" && echo "컴포넌트 있음"
- Read src/app/(pages)/tools/youtube-lens/page.tsx

Phase 2: 문서 참조
- WIREFRAME.md → "## YouTube Lens" 섹션의 검색바 행
- COMPONENT_INVENTORY.md → "### 기능 컴포넌트" 에서 SearchBar
- STATE_FLOW.md → "### YouTube Lens 상태 흐름"

Phase 3: 구현
- API 없으면: src/app/api/youtube/search/route.ts 생성
- 컴포넌트 없으면: src/components/features/SearchBar.tsx 생성
- api-client.ts 사용: apiPost('/api/youtube/search', { query })

Phase 4: 테스트
✅ API Key 있을 때 → 검색 결과 표시
❌ API Key 없을 때 → "API Key 설정이 필요합니다" 메시지
❌ 로그아웃 상태 → 401 → 로그인 페이지로
```

### 로그인 401 에러 수정
```bash
/sc:fix --seq --validate --think

Phase 1: 실제 문제 파악
- Read src/app/api/auth/callback/route.ts
- grep -r "getSession\|getUser" src/app/api
- 세션 체크 방식 확인

Phase 2: 수정
- getSession() → getUser() 통일
- 에러 응답: { error: 'User not authenticated' }
- 401 응답 시 헤더: Content-Type: application/json

Phase 3: 검증
- 로그인 상태에서 API 호출 → 200
- 로그아웃 상태에서 API 호출 → 401
- 클라이언트에서 401 수신 → 로그인 리다이렉트
```

---

## 📊 문서 참조 우선순위

1. **작업 시작**: ROUTE_SPEC → FLOWMAP → WIREFRAME
2. **구현 중**: COMPONENT_INVENTORY → STATE_FLOW → DATA_MODEL
3. **에러 처리**: ERROR_BOUNDARY → CHECKLIST
4. **검증**: CHECKLIST → 모든 문서 ❌ 항목

---

## 🔎 찾을 수 없을 때 검색 패턴

### 파일/기능 찾기 명령어
```bash
# API 엔드포인트 찾기
grep -r "폴더\|folder" src/app/api
find src/app/api -name "*folder*"

# 컴포넌트 찾기  
grep -r "Button\|Card\|Modal" src/components
find src/components -name "*.tsx" | xargs grep "export"

# 타입 정의 찾기
grep -r "interface.*Video\|type.*Video" src/lib/types

# 에러 메시지로 위치 찾기
grep -r "User not authenticated" src/

# 비슷한 기능 찾기 (패턴 복사용)
grep -r "POST.*request.*json" src/app/api
```

---

## 🎯 패턴 복사할 곳 (유사 기능 참조)

| 구현하려는 기능 | 참고할 기존 기능 | 파일 위치 |
|----------------|-----------------|-----------|
| 새 API 엔드포인트 | /api/youtube/favorites | src/app/api/youtube/favorites/route.ts |
| 목록 컴포넌트 | CourseGrid | src/components/features/CourseGrid.tsx |
| 모달 다이얼로그 | 로그인 모달 | src/components/auth/LoginModal.tsx |
| 폼 처리 | 프로필 수정 | src/app/(pages)/mypage/profile/page.tsx |
| 데이터 테이블 | 수익 인증 목록 | src/app/(pages)/revenue-proofs/page.tsx |
| 무한 스크롤 | RevenueGallery | src/components/features/RevenueGallery.tsx |
| 검색 기능 | YouTube 검색 | src/app/api/youtube/search/route.ts |

---

## ⚡ 성능 문제 디버깅

### 측정 도구
```bash
# 번들 사이즈 분석
npm run build
# .next/build-manifest.json 확인

# API 응답 시간 측정
console.time('API Call');
await apiGet('/api/...');
console.timeEnd('API Call');

# React 컴포넌트 리렌더링
React DevTools Profiler 사용
```

### 일반적인 성능 문제와 해결
| 문제 | 원인 | 해결 방법 |
|------|------|----------|
| 느린 목록 로딩 | 데이터 과다 | 페이지네이션, 가상 스크롤 |
| 큰 번들 사이즈 | 불필요한 import | Dynamic import, tree shaking |
| 잦은 리렌더링 | 상태 관리 문제 | useMemo, useCallback |
| 느린 이미지 | 최적화 안 됨 | next/image, lazy loading |

---

## 🧪 작업 검증 명령어

### 필수 실행 명령어
```bash
# TypeScript 체크
npx tsc --noEmit

# 빌드 테스트
npm run build

# 개발 서버에서 테스트
npm run dev
# 브라우저: http://localhost:3000

# API 테스트 (curl)
curl -X POST http://localhost:3000/api/youtube/folders \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트"}'
```

---

## ⚠️ Claude Code 함정 회피

| 함정 | 회피 방법 |
|------|----------|
| UI만 구현 | WIREFRAME.md API 연결 강제 |
| 에러만 표시 | ERROR_BOUNDARY.md 리다이렉트 |
| 복사-붙여넣기 | COMPONENT_INVENTORY.md 재사용 |
| 일관성 없음 | Header/Sidebar 동기화 체크 |
| 타입 에러 무시 | TypeScript strict mode 준수 |
| 테스트 없이 완료 | npm run build 필수 실행 |

---

*이 템플릿으로 Claude Code에게 정확한 지시 생성 가능 - 95%+ 성공률 목표*