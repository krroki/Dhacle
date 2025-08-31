### **[D-SPEC v1.1] EPIC-01: 사용자 인증 및 채널 생성**

#### **I. 개요 및 목표 (Overview & Goals)**

*   **1.1. 기능 정의:** 신규 사용자가 서비스에 처음 방문했을 때, 익숙하고 안전한 소셜 로그인(카카오, 구글)을 통해 즉시 회원가입 및 로그인을 완료하고, 서비스의 핵심 단위인 '채널'을 생성하는 첫 사용자 경험(First User Experience)을 구축한다.
*   **1.2. 사용자 스토리 (User Stories):**
    *   "As a 신규 사용자, I want to use my existing social account (Kakao/Google) to sign up, so that I can avoid the hassle of filling out a form and start using the service immediately."
    *   "As a 최초 로그인 사용자, I want to be guided to create my first workspace ('Channel'), so that I can understand the basic structure of the service and what to do next."
*   **1.3. 비즈니스 목표 및 KPI:**
    *   **비즈니스 목표:** 회원가입 과정의 이탈률을 최소화하고, 신규 사용자가 서비스의 핵심 가치를 경험하기 위한 첫 단계를 성공적으로 완료하도록 한다.
    *   **KPI:**
        *   `회원가입 전환율 (Sign-up Conversion Rate)`: 로그인 페이지 방문자 중 회원가입을 완료하는 비율 (목표: 80% 이상)
        *   `온보딩 완료율 (Onboarding Completion Rate)`: 회원가입을 완료한 사용자 중 첫 '채널' 생성을 완료하는 비율 (목표: 95% 이상)

#### **II. 핵심 사용자 플로우 (User Flow)**

1.  **(비로그인 상태)** 사용자가 보호된 경로(`/dashboard`)에 접근 시, `/auth/login` 페이지로 리다이렉트된다.
2.  **(`/auth/login` 페이지)** 사용자는 '카카오로 시작하기' 또는 **'구글로 시작하기'** 버튼을 선택한다.
3.  **(OAuth 프로세스)** 각 소셜 플랫폼의 인증 화면으로 이동하여 인증을 완료한다.
4.  **(콜백 처리)** `/auth/callback`으로 리다이렉트되며, 백엔드는 받은 코드로 세션을 생성한다.
5.  **(사용자 상태 확인)** 시스템은 `users` 테이블과 `channels` 테이블을 조회하여 사용자의 상태를 확인한다.
    *   **Case A (기존 사용자 + 채널 보유):** `/dashboard`로 리다이렉트.
    *   **Case B (신규 가입 또는 채널 미보유):** `/onboarding` 페이지로 리다이렉트.
6.  **(`/onboarding` 페이지)** 사용자는 안내에 따라 '채널 이름'을 입력하고, 선택적으로 '벤치마킹 URL'을 입력한 후 '시작하기' 버튼을 누른다.
7.  **(채널 생성)** 채널 정보가 DB에 저장된 후, `/dashboard`로 리다이렉트된다.

#### **III. 시스템 아키텍처 (System Architecture)**

*   **인증 핵심:** **`Supabase Auth`**를 유일한 인증 공급자로 사용한다. 카카오와 구글 로그인은 Supabase Auth의 'OAuth Providers' 기능을 통해 통합 관리한다. 이는 직접 OAuth 2.0 흐름을 구현하는 복잡성과 보안 리스크를 Supabase에 위임하는, 업계 최고의 베스트 프랙티스이다.
*   **세션 관리:** **`@supabase/ssr`** 라이브러리를 사용하여, Next.js Middleware, 서버 컴포넌트, 클라이언트 컴포넌트, API Routes 전반에 걸쳐 일관되고 안전한 세션 관리를 구현한다.
*   **데이터 흐름:**
    1.  클라이언트가 소셜 로그인 버튼 클릭.
    2.  Supabase Auth의 `signInWithOAuth` 함수 호출.
    3.  인증 성공 후 `/auth/callback`으로 리다이렉트.
    4.  `route.ts`가 `code`를 세션으로 교환.
    5.  사용자 정보(메타데이터)를 `users` 테이블에 `INSERT ON CONFLICT DO UPDATE`로 동기화. (신규 사용자는 생성, 기존 사용자는 프로필 사진 등 업데이트)
    6.  `middleware.ts`가 사용자의 채널 보유 여부를 확인하고 적절한 페이지로 리다이렉트.

#### **IV. 데이터베이스 스키마 (Database Schema)**

*   **핵심 원칙:** 기존 스키마를 최대한 활용하고, 신규 기능에 필요한 최소한의 변경사항만 적용한다.
*   **`users` 테이블 검토 및 개선 제안:**
    *   `channel_name`, `channel_url` 컬럼은 **제거하는 것을 권장**. 한 명의 사용자가 여러 채널을 가질 수 있으므로, 이 정보는 `channels` 테이블에 있어야 논리적으로 올바르다.
    *   **신규 컬럼 `onboarding_completed` (boolean, default: false) 추가:** 사용자가 온보딩(최초 채널 생성)을 완료했는지 여부를 추적하기 위한 플래그. `middleware.ts`가 이 값을 보고 리다이렉트 여부를 결정한다.
*   **`channels` 테이블 (기존 테이블 활용):**
    *   `id` (PK, UUID), `owner_user_id` (FK -> users.id), `channel_name` (TEXT), `created_at` 등 핵심 컬럼을 그대로 사용한다.
    *   온보딩 과정에서 `benchmark_url` (TEXT, nullable)을 추가로 받을 수 있도록 준비한다.
*   **RLS 정책:**
    *   `users` 테이블: 사용자는 자신의 정보만 `SELECT` 및 `UPDATE` 할 수 있다.
    *   `channels` 테이블: 사용자는 자신이 소유한(`owner_user_id = auth.uid()`) 채널만 `SELECT`, `INSERT`, `UPDATE`, `DELETE` 할 수 있다.

#### **V. API 계약 (API Contracts)**

*   **API 설계 원칙:** 인증 관련 로직은 Supabase가 처리하므로, 우리는 '온보딩 완료'와 관련된 비즈니스 로직 API만 구현하면 된다.
*   **`POST /onboarding/complete` (Next.js Server Action)**
    *   **역할:** 온보딩 과정에서 채널 생성을 처리.
    *   **보호:** `requireAuth()` 헬퍼 또는 동등한 서버 측 세션 검증 필수.
    *   **Request Body (`Zod` 스키마 `onboardingSchema`):**
        ```typescript
        {
          channelName: z.string().min(2, "채널 이름은 2자 이상이어야 합니다."),
          benchmarkUrl: z.string().url("유효한 URL을 입력해주세요.").optional().or(z.literal(''))
        }
        ```
    *   **서버 로직:**
        1.  입력값 유효성 검사.
        2.  `channels` 테이블에 새로운 채널 레코드 `INSERT`.
        3.  `users` 테이블의 `onboarding_completed` 플래그를 `true`로 `UPDATE`.
        4.  성공 시 `redirect('/dashboard')` 호출.
*   **`/auth/callback/route.ts` (Next.js Route Handler):**
    *   **역할:** Supabase OAuth 콜백을 처리하고 세션을 생성하는 유일한 경로.
    *   **구현:** `@supabase/ssr`의 공식 문서에 따라 `createRouteHandlerClient`를 사용하여 구현.

#### **VI. 프론트엔드 구현 명세 (Frontend Specification)**

*   **폴더 구조:**
    *   `app/auth/login/page.tsx`
    *   `app/onboarding/page.tsx`
*   **컴포넌트 분리:**
    *   `components/auth/LoginButtons.tsx`:
        *   **역할:** 카카오와 구글 로그인 버튼을 포함하는 클라이언트 컴포넌트.
        *   **로직:** Supabase 클라이언트(`createBrowserClient`)를 생성하고, 각 버튼의 `onClick` 이벤트에서 `supabase.auth.signInWithOAuth(...)`를 호출.
    *   `components/onboarding/OnboardingForm.tsx`:
        *   **역할:** 채널 이름과 벤치마킹 URL을 입력받는 클라이언트 컴포넌트.
        *   **상태 관리:** `React Hook Form`과 `zodResolver`를 사용하여 폼 상태 및 실시간 유효성 검사 구현.
        *   **데이터 처리:** 폼 제출 시, 위에서 정의한 `completeOnboarding` 서버 액션을 호출. `useTransition` 훅을 사용하여 서버 액션 처리 중 로딩 상태를 버튼에 표시.
*   **기존 카카오 로그인 검토 및 신규 구글 로그인 추가:**
    *   **(지시)** `LoginButtons.tsx` 컴포넌트에서 기존 카카오 로그인 구현 방식을 검토한다. Supabase의 표준 `signInWithOAuth({ provider: 'kakao' })`를 사용하고 있는지 확인.
    *   **(지시)** 동일한 패턴으로 **구글 로그인 버튼을 추가**한다. `provider` 옵션만 `'google'`로 변경하면 된다.
    *   **(지시)** Supabase 대시보드의 'Authentication' > 'Providers' 섹션에서 **'Google' 제공자가 활성화**되어 있고, 클라이언트 ID와 시크릿 키가 올바르게 설정되었는지 확인해야 한다. (이 부분은 개발자가 직접 할 수 없으므로, 대표님께 확인을 요청하는 안내 문구를 주석으로 남겨야 함)

#### **VII. 리스크 및 엣지 케이스 (Risks & Edge Cases)**

*   **리스크 1: 소셜 로그인 정보의 불일치.**
    *   **상황:** 사용자가 카카오톡 이메일과 구글 이메일이 다른 상태에서 각각 따로 로그인하는 경우, `users` 테이블에 두 개의 다른 계정이 생성될 수 있다.
    *   **대응 (Supabase 기본 정책):** Supabase Auth는 이메일 주소를 기준으로 계정을 연결하므로, 동일 이메일이라면 자동으로 연결된다. 이메일이 다르면 별개 계정으로 생성되는 것이 표준 동작이며, 이는 허용한다.
*   **엣지 케이스 1: 온보딩 과정 중 이탈.**
    *   **상황:** 사용자가 회원가입은 했지만, 채널 생성을 완료하지 않고 창을 닫는 경우.
    *   **대응:** `users.onboarding_completed` 플래그가 `false`인 상태로 남게 된다. `middleware.ts`는 다음에 이 사용자가 접속했을 때, 다시 `/onboarding` 페이지로 보내 채널 생성을 완료하도록 강제해야 한다.
*   **엣지 케이스 2: OAuth 인증 실패.**
    *   **상황:** 사용자가 구글/카카오 인증 팝업에서 '취소'를 누르거나, 인증에 실패하는 경우.
    *   **대응:** Supabase는 이런 경우 `/auth/login?error=access_denied` 와 같이 에러 쿼리 파라미터와 함께 로그인 페이지로 리다이렉트시킨다. 프론트엔드는 이 쿼리 파라미터를 감지하여 `shadcn/ui Sonner`를 사용해 "인증이 취소되었습니다." 와 같은 사용자 친화적인 메시지를 표시해야 한다.

#### **VIII. 향후 고려사항 (Future Considerations)**

*   **8.1. 이번 버전에서는 제외된 기능:**
    *   이메일/비밀번호 방식의 회원가입.
    *   온보딩 과정에서 여러 개의 채널을 한 번에 생성하는 기능.
*   **8.2. 다음 버전 로드맵:**
    *   사용자가 '채널 관리' 페이지에서 새로운 채널을 추가하거나 기존 채널을 삭제/수정하는 기능.
    *   팀 기능 도입 시, 다른 사용자를 내 채널의 멤버로 초대하는 기능.