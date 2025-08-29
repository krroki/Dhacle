# 🔌 UI-API 연결 명세 (Wireframe)

_목적: 프론트엔드-백엔드 연결 상태 추적_
_핵심 질문: "이 버튼이 어떤 API를 호출하지?"_
_업데이트: 2025-01-31 - DOCUMENT_GUIDE 지침 반영_

> **구현 상태 범례**:
>
> - ✅ 완료: UI와 API 연결 완료
> - ⚠️ 부분: UI는 있으나 API 연결 미완성 또는 타입 오류
> - ❌ 미구현: UI 또는 API 없음
> - 🔴 차단: TypeScript 오류로 빌드 실패

## ⚠️ 현재 주요 이슈 (2025-01-31 업데이트)

### ✅ 해결됨: snake_case/camelCase 변환 시스템
- **API 경계 자동 변환** - `src/lib/api-client.ts`에서 처리
- **React 예약어 보호** - `src/lib/utils/case-converter.ts` 구현
- **Pre-commit 검증** - `.husky/pre-commit`에 snake_case 차단

### ✅ Wave 3 완료: TypeScript 타입 오류 대폭 감소
- **해결된 파일**: courses.ts, collections-server.ts, client-helper.ts, type-mappers.ts
- **해결된 에러**: 104개 (117개 → 13개, 89% 해결)
- **주요 수정사항**:
  - 테이블명 불일치 해결 (collectionItems → collection_items)
  - 타입 불일치 해결 (null → undefined 변환)
  - Course 타입 매핑 개선

### ⚠️ 남은 타입 오류 (13개)
- **타입 불일치** - 일부 함수 시그니처 불일치
- **any 타입** - 6개 any 타입 사용 중 (추후 개선 필요)

### 미구현 테이블 (DB에 없음)
- `alert_rules` - 알림 규칙
- `proof_likes` - 수익인증 좋아요
- `proof_comments` - 수익인증 댓글
- `naver_cafe_verifications` - 네이버 카페 인증
- `subscription_logs` - YouTube 구독 로그
- `channel_subscriptions` - YouTube 채널 구독

---

## 🚨 E2E 테스트 에러 감지 시스템
*추가: 2025-01-31*

### 테스트 페이지 및 헬퍼
| 경로 | 용도 | 구현 상태 | 에러 감지 |
|------|------|----------|----------|
| `/test-error` | 에러 발생 테스트 페이지 | ✅ | ✅ |
| `/e2e/helpers/error-detector.ts` | 에러 감지 클래스 | ✅ | - |
| `/e2e/error-safe-example.spec.ts` | 에러 감지 테스트 예시 | ✅ | ✅ |
| `/e2e/error-detection-validation.spec.ts` | 검증 테스트 | ✅ | ✅ |

### 에러 감지 포인트
| 감지 타입 | 리스너 | 트리거 | 처리 |
|----------|--------|--------|------|
| Console Error | `page.on('console')` | console.error() | 즉시 테스트 중단 |
| Page Error | `page.on('pageerror')` | JavaScript 런타임 에러 | 즉시 테스트 중단 |
| Web Error | `context.on('weberror')` | 브라우저 레벨 에러 | 즉시 테스트 중단 |
| Next.js Overlay | `[data-nextjs-dialog]` | 개발 모드 에러 | 에러 추출 후 중단 |
| Error Boundary | `[role="alert"]` | React 에러 | 메시지 추출 후 중단 |

---

## 📋 전체 API 엔드포인트 목록

### 인증 관련 (3개)

| 엔드포인트         | 메서드 | 용도            | 인증 | 구현 |
| ------------------ | ------ | --------------- | ---- | ---- |
| `/auth/callback`   | GET    | OAuth 콜백 처리 | ❌   | ✅   |
| `/api/auth/logout` | POST   | 로그아웃        | ✅   | ⚠️   |
| `/api/auth/test-login` | POST   | 개발자 테스트 로그인 (localhost 전용) | ❌   | ✅   |

### 사용자 관련 (8개)

| 엔드포인트                    | 메서드          | 용도               | 인증 | 구현 |
| ----------------------------- | --------------- | ------------------ | ---- | ---- |
| `/api/user/profile`           | GET/PUT         | 프로필 관리        | ✅   | ✅   |
| `/api/user/api-keys`          | GET/POST/DELETE | API 키 관리        | ✅   | ✅   |
| `/api/user/init-profile`      | POST            | 프로필 초기화      | ✅   | ✅   |
| `/api/user/generate-username` | POST            | 사용자명 생성      | ✅   | ✅   |
| `/api/user/generate-nickname` | POST            | 닉네임 생성        | ✅   | ✅   |
| `/api/user/check-username`    | POST            | 사용자명 중복 체크 | ❌   | ✅   |
| `/api/user/naver-cafe`        | GET/POST        | 네이버 카페 연동   | ✅   | ⚠️   |

### YouTube 관련 (13개)

| 엔드포인트                       | 메서드              | 용도           | 인증 | 구현 |
| -------------------------------- | ------------------- | -------------- | ---- | ---- |
| `/api/youtube/search`            | POST                | 비디오 검색    | ✅   | ✅   |
| `/api/youtube/popular`           | GET                 | 인기 영상      | ✅   | ✅   |
| `/api/youtube/analysis`          | POST                | 영상 분석      | ✅   | ✅   |
| `/api/youtube/metrics`           | GET                 | 메트릭 조회    | ✅   | ✅   |
| `/api/youtube/batch`             | POST                | 일괄 처리      | ✅   | ✅   |
| `/api/youtube/webhook`           | POST                | 웹훅 처리      | ❌   | ✅   |
| `/api/youtube/validate-key`      | POST                | API 키 검증    | ✅   | ✅   |
| `/api/youtube/subscribe`         | POST                | 구독 관리      | ✅   | ✅   |
| `/api/youtube/collections`       | GET/POST            | 컬렉션 관리    | ✅   | ✅   |
| `/api/youtube/collections/items` | GET/POST/DELETE     | 컬렉션 아이템  | ✅   | ✅   |
| `/api/youtube/favorites`         | GET/POST            | 즐겨찾기       | ✅   | ✅   |
| `/api/youtube/favorites/[id]`    | GET/PUT/DELETE      | 즐겨찾기 상세  | ✅   | ✅   |
| `/api/youtube/folders`           | GET/POST/PUT/DELETE | 채널 폴더 관리 | ✅   | ✅   |

### 수익인증 관련 (8개)

| 엔드포인트                        | 메서드         | 용도          | 인증 | 구현 |
| --------------------------------- | -------------- | ------------- | ---- | ---- |
| `/api/revenue-proof`              | GET/POST       | 수익인증 CRUD | ⚠️   | ✅   |
| `/api/revenue-proof/[id]`         | GET/PUT/DELETE | 수익인증 상세 | ⚠️   | ✅   |
| `/api/revenue-proof/[id]/like`    | POST/DELETE    | 좋아요        | ✅   | ✅   |
| `/api/revenue-proof/[id]/comment` | GET/POST       | 댓글          | ⚠️   | ✅   |
| `/api/revenue-proof/[id]/report`  | POST           | 신고          | ✅   | ✅   |
| `/api/revenue-proof/my`           | GET            | 내 수익인증   | ✅   | ✅   |
| `/api/revenue-proof/ranking`      | GET            | 랭킹          | ❌   | ✅   |
| `/api/revenue-proof/seed`         | POST           | 시드 데이터   | ❌   | ✅   |

### 커뮤니티 관련 (2개)

| 엔드포인트                  | 메서드         | 용도        | 인증 | 구현 |
| --------------------------- | -------------- | ----------- | ---- | ---- |
| `/api/community/posts`      | GET/POST       | 게시글 관리 | ⚠️   | ✅   |
| `/api/community/posts/[id]` | GET/PUT/DELETE | 게시글 상세 | ⚠️   | ✅   |

### 결제 관련 (3개)

| 엔드포인트                   | 메서드 | 용도      | 인증 | 구현 |
| ---------------------------- | ------ | --------- | ---- | ---- |
| `/api/payment/create-intent` | POST   | 결제 생성 | ✅   | ✅   |
| `/api/payment/confirm`       | POST   | 결제 확인 | ✅   | ✅   |
| `/api/payment/fail`          | POST   | 결제 실패 | ✅   | ✅   |

### 기타 API (4개)

| 엔드포인트              | 메서드 | 용도        | 인증 | 구현 |
| ----------------------- | ------ | ----------- | ---- | ---- |
| `/api/health`           | GET    | 헬스 체크   | ❌   | ✅   |
| `/api/upload`           | POST   | 파일 업로드 | ✅   | ✅   |
| `/api/coupons/validate` | POST   | 쿠폰 검증   | ✅   | ✅   |
| `/api/debug/env-check`  | GET    | 환경 체크   | ❌   | ✅   |

### 관리자 API (1개)

| 엔드포인트                | 메서드 | 용도          | 인증  | 구현 |
| ------------------------- | ------ | ------------- | ----- | ---- |
| `/api/admin/video/upload` | POST   | 비디오 업로드 | Admin | ✅   |

---

## 📄 페이지별 UI-API 연결

### 🔐 로그인 페이지 (/auth/login) (2025-08-29 추가)

| UI 컴포넌트          | 이벤트  | API 호출               | 응답 처리     | 에러 처리 | 구현 |
| -------------------- | ------- | ---------------------- | ------------- | --------- | ---- |
| 카카오 로그인 버튼   | onClick | OAuth 리다이렉트       | Supabase OAuth| -         | ✅   |
| 🧪 테스트 로그인 버튼 | onClick | POST /api/auth/test-login | /tools/youtube-lens 리다이렉트 | Toast | ✅   |

**테스트 로그인 특징**:
- localhost 환경에서만 표시
- 실제 Supabase 인증 사용
- 테스트 계정 자동 생성/관리
- YouTube API 키 자동 설정

---

### 🏠 홈페이지 (/)

| UI 컴포넌트          | 이벤트  | API 호출               | 응답 처리     | 에러 처리 | 구현 |
| -------------------- | ------- | ---------------------- | ------------- | --------- | ---- |
| HeroCarousel         | onMount | - (정적 데이터)        | 자동 슬라이드 | -         | ✅   |
| RevenueGallery       | onMount | GET /api/revenue-proof | 갤러리 렌더링 | 스켈레톤  | ✅   |
| InstructorCategories | onMount | - (정적 데이터)        | 카테고리 표시 | -         | ✅   |
| FreeCoursesCarousel  | onMount | - (정적 데이터)        | 캐러셀 표시   | -         | ✅   |
| NewCoursesCarousel   | onMount | - (정적 데이터)        | 캐러셀 표시   | -         | ✅   |
| FAQSection           | onClick | - (로컬 상태)          | 아코디언 토글 | -         | ✅   |

---

### 🎬 YouTube Lens (/tools/youtube-lens)

| UI 컴포넌트       | 이벤트   | API 호출                               | 응답 처리          | 에러 처리   | 구현 |
| ----------------- | -------- | -------------------------------------- | ------------------ | ----------- | ---- |
| ApiKeySetup       | onMount  | GET /api/user/api-keys                 | 키 상태 표시       | 설정 가이드 | ✅   |
| SearchBar         | onSubmit | POST /api/youtube/search               | VideoGrid 업데이트 | Toast 에러  | ✅   |
| 인기 Shorts 버튼  | onClick  | GET /api/youtube/popular               | VideoGrid 업데이트 | 400→API키   | ✅   |
| VideoCard 좋아요  | onClick  | POST /api/youtube/favorites            | 아이콘 변경        | Toast       | ✅   |
| FolderManager     | onMount  | GET /api/youtube/folders               | 폴더 목록 표시     | 스켈레톤    | ✅   |
| 폴더 생성         | onSubmit | POST /api/youtube/folders              | 목록 업데이트      | 검증 에러   | ✅   |
| 폴더 수정/삭제    | onClick  | PATCH/DELETE /api/youtube/folders/[id] | UI 업데이트        | Toast       | ✅   |
| CollectionManager | onMount  | GET /api/youtube/collections           | 컬렉션 목록        | 스켈레톤    | ✅   |
| 컬렉션 생성       | onSubmit | POST /api/youtube/collections          | 목록 업데이트      | 검증 에러   | ✅   |
| QuotaStatus       | onMount  | GET /api/youtube/metrics               | 할당량 표시        | -           | ✅   |
| VideoAnalyzer     | onSubmit | POST /api/youtube/analysis             | 분석 결과 표시     | 로딩 상태   | ✅   |
| API 키 검증       | onChange | POST /api/youtube/validate-key         | 검증 상태 표시     | 유효성 에러 | ✅   |
| **🆕 KeywordTrends** | onMount  | **GET /api/youtube-lens/keywords/trends** | **트렌드 표시**    | **스켈레톤** | **✅** |
| **키워드 분석**   | onClick  | **POST /api/youtube-lens/keywords/trends** | **분석 결과**     | **토스트**   | **✅** |

---

### 💰 수익인증 (/revenue-proof)

| UI 컴포넌트        | 이벤트   | API 호출                             | 응답 처리         | 에러 처리   | 구현 |
| ------------------ | -------- | ------------------------------------ | ----------------- | ----------- | ---- |
| 수익인증 목록      | onMount  | GET /api/revenue-proof               | 카드 그리드 표시  | 무한 스크롤 | ✅   |
| FilterBar          | onChange | GET /api/revenue-proof?filter=...    | 목록 필터링       | -           | ✅   |
| RevenueProofCard   | -        | -                                    | Props 데이터 표시 | -           | ✅   |
| 좋아요 버튼        | onClick  | POST /api/revenue-proof/[id]/like    | 카운트 업데이트   | 401→로그인  | ✅   |
| LiveRankingSidebar | onMount  | GET /api/revenue-proof/ranking       | 랭킹 표시         | 캐싱        | ✅   |
| 수익인증 작성      | onSubmit | POST /api/revenue-proof              | 성공→목록         | 검증 에러   | ✅   |
| 댓글 작성          | onSubmit | POST /api/revenue-proof/[id]/comment | 댓글 추가         | 401→로그인  | ✅   |
| 신고 버튼          | onClick  | POST /api/revenue-proof/[id]/report  | Toast 성공        | -           | ✅   |

---

### 👤 마이페이지 (/mypage)

| UI 컴포넌트       | 이벤트   | API 호출                         | 응답 처리     | 에러 처리    | 구현 |
| ----------------- | -------- | -------------------------------- | ------------- | ------------ | ---- |
| 프로필 정보       | onMount  | GET /api/user/profile            | 정보 표시     | 401→로그인   | ✅   |
| 프로필 수정 폼    | onSubmit | PUT /api/user/profile            | Toast 성공    | 검증 에러    | ✅   |
| 닉네임 생성       | onClick  | POST /api/user/generate-nickname | 닉네임 표시   | -            | ✅   |
| 사용자명 생성     | onClick  | POST /api/user/generate-username | 사용자명 표시 | -            | ✅   |
| 사용자명 중복체크 | onChange | POST /api/user/check-username    | 중복 메시지   | -            | ✅   |
| 내 수익인증       | onMount  | GET /api/revenue-proof/my        | 목록 표시     | 페이지네이션 | ✅   |
| 네이버 카페 연동  | onSubmit | POST /api/user/naver-cafe        | 연동 상태     | 에러 메시지  | ✅   |
| 뱃지 목록         | onMount  | GET /api/user/badges             | 뱃지 표시     | 스켈레톤     | ✅   |
| 강의 수강 현황    | onMount  | GET /api/user/courses            | 진행률 표시   | 페이지네이션 | ✅   |

---

### 💬 커뮤니티 (/community)

| UI 컴포넌트 | 이벤트   | API 호출                         | 응답 처리     | 에러 처리    | 구현 |
| ----------- | -------- | -------------------------------- | ------------- | ------------ | ---- |
| 게시글 목록 | onMount  | GET /api/community/posts         | 테이블 렌더링 | 페이지네이션 | ✅   |
| 게시글 작성 | onSubmit | POST /api/community/posts        | 목록 갱신     | 401→로그인   | ✅   |
| 게시글 상세 | onClick  | GET /api/community/posts/[id]    | 상세 표시     | 404→목록     | ✅   |
| 게시글 수정 | onSubmit | PUT /api/community/posts/[id]    | Toast 성공    | 권한 체크    | ✅   |
| 게시글 삭제 | onClick  | DELETE /api/community/posts/[id] | 목록 갱신     | 권한 체크    | ✅   |

---

### 💳 결제 (/payment)

| UI 컴포넌트    | 이벤트    | API 호출                        | 응답 처리         | 에러 처리   | 구현 |
| -------------- | --------- | ------------------------------- | ----------------- | ----------- | ---- |
| 쿠폰 입력      | onSubmit  | POST /api/coupons/validate      | 할인 적용         | 유효성 에러 | ✅   |
| 결제 생성      | onClick   | POST /api/payment/create-intent | TossPayments 위젯 | 실패 처리   | ✅   |
| 결제 성공 콜백 | onSuccess | POST /api/payment/confirm       | /payment/success  | -           | ✅   |
| 결제 실패 콜백 | onFail    | POST /api/payment/fail          | /payment/fail     | 에러 표시   | ✅   |

---

### ⚙️ 설정 (/settings)

| UI 컴포넌트 | 이벤트   | API 호출                       | 응답 처리    | 에러 처리   | 구현 |
| ----------- | -------- | ------------------------------ | ------------ | ----------- | ---- |
| API 키 목록 | onMount  | GET /api/user/api-keys         | 키 목록 표시 | -           | ✅   |
| API 키 추가 | onSubmit | POST /api/user/api-keys        | 목록 갱신    | 검증 에러   | ✅   |
| API 키 삭제 | onClick  | DELETE /api/user/api-keys      | 목록 갱신    | 확인 모달   | ✅   |
| API 키 검증 | onChange | POST /api/youtube/validate-key | 유효성 표시  | 에러 메시지 | ✅   |

---

### 🎛️ 관리자 (/admin)

| UI 컴포넌트   | 이벤트   | API 호출                     | 응답 처리     | 에러 처리   | 구현 |
| ------------- | -------- | ---------------------------- | ------------- | ----------- | ---- |
| 비디오 업로드 | onSubmit | POST /api/admin/video/upload | 업로드 진행률 | 실패 재시도 | ✅   |

---

## 🔄 데이터 플로우

### 표준 데이터 플로우

```
User Action
    ↓
UI Event Handler
    ↓
api-client.ts (공통 래퍼)
    ↓
API Route Handler
    ↓
Supabase Query
    ↓
Response Processing
    ↓
State Update (Zustand/Local)
    ↓
UI Re-render
```

### 인증 플로우

```
Protected Action
    ↓
Session Check
    ↓
401 Response
    ↓
Redirect to Login
    ↓
OAuth Flow
    ↓
Return to Original Page
```

---

## 📊 API 사용 통계

### 가장 많이 사용되는 API

1. **GET /api/revenue-proof** - 홈, 수익인증 페이지 (2곳)
2. **GET /api/user/profile** - 마이페이지, 헤더 (2곳)
3. **GET /api/youtube/popular** - YouTube Lens 메인
4. **POST /api/youtube/search** - YouTube Lens 검색

### 인증이 필요한 API

- **100% 인증**: 사용자 관련 (8개)
- **100% 인증**: YouTube 관련 (11/12개, webhook 제외)
- **부분 인증**: 수익인증 관련 (5/8개)
- **부분 인증**: 커뮤니티 관련 (쓰기만 인증)

---

## 🛡️ 에러 처리 패턴

### 공통 에러 처리

| 에러 코드 | 처리 방법                              | UI 표시                | 업데이트 |
| --------- | -------------------------------------- | ---------------------- | -------- |
| 401       | API키/인증 구분 → 적절한 안내         | Toast/리다이렉트       | ✅ 2025-02-02 |
| 400       | API키 문제 → 설정 안내                | Toast + API키 설정 UI  | ✅ 2025-02-02 |
| 403       | 권한 없음 메시지                      | Toast 에러             | -        |
| 404       | 목록 페이지로 이동                    | Toast 경고             | -        |
| 422       | 검증 에러 표시                        | 폼 에러 메시지         | -        |
| 500       | 재시도 버튼 표시                      | Toast 에러             | -        |

### 로딩 상태 처리

- **스켈레톤**: 목록형 데이터
- **스피너**: 단일 데이터
- **프로그레스 바**: 파일 업로드
- **Disabled 상태**: 폼 제출 중

---

## 🚨 개선 필요 사항

### 긴급 (Phase 1)

- [x] 401 에러 처리 개선 - API키와 인증 문제 구분 ✅ (2025-02-02)
- [ ] api-client.ts 100% 적용 (현재 85%)
- [ ] 로딩 상태 일관성 확보

### 중요 (Phase 2)

- [ ] 낙관적 업데이트 (좋아요, 즐겨찾기)
- [ ] 캐싱 전략 구현 (랭킹, 인기 영상)
- [ ] 실시간 업데이트 (WebSocket)

### 개선 (Phase 3)

- [ ] 오프라인 지원
- [ ] PWA 기능
- [ ] 에러 재시도 로직

---

_이 문서는 UI 작업 시 API 연결 확인을 위한 필수 참조 문서입니다._
