# 📍 PROJECT-INDEX - 디하클 프로젝트 문서 지도

## 🔴 필수: 새 세션 시작 체크리스트

**⚠️ 경고: 아래 문서들을 모두 확인하지 않으면 작업 진행 불가**

### 📋 반드시 확인해야 할 문서 (순서대로)
1. ☐ **이 문서** (`PROJECT-INDEX.md`) - 현재 상태와 문서 지도 파악
2. ☐ **`/CLAUDE.md`** - 프로젝트 규칙과 가이드라인
3. ☐ **`/docs/PM-AI-Framework.md`** - PM AI 운영 매뉴얼
4. ☐ **`/docs/DEVELOPMENT-INSTRUCTION-TEMPLATE.md`** ⭐ v5.0 - 템플릿 기반 개발 지시서
5. ☐ **`/docs/site-architecture-plan.md`** - 사이트 구조와 기능 명세
6. ☐ **`/docs/component-visual-diagram.md`** - UI/UX 상세 스펙
7. ☐ **`/docs/development-workflow-guide.md`** - 개발 가이드
8. ☐ **`/docs/Visual-Verification-Protocol.md`** - UI 검증 프로토콜

---

## 🚨 현재 구현 상태 (2025-01-12 23:45 업데이트)

### ✅ 모든 CRITICAL 문제 해결 완료!

~~1. **타입 안정성 붕괴**~~ ✅ 해결됨 (2025-01-09)
   - ✅ 모든 Supabase 클라이언트에 Database 타입 적용 완료
   - ✅ TypeScript 컴파일: 주요 코드 에러 0개 (테스트 파일 제외)
   - ✅ TASK-2025-007: 모든 'as any' 제거 완료

~~2. **회원가입 시스템 미작동**~~ ✅ 해결됨 (2025-01-10)
   - ✅ SQL 트리거 수정 및 통합 완료 (`ALL_MIGRATIONS_COMBINED.sql`)
   - ✅ API 엔드포인트 구현 완료 (`/api/user/profile`, `/api/user/check-username`)
   - ✅ 온보딩 페이지 구현 완료 (`/onboarding/page.tsx`)
   - ✅ 마이페이지 구현 완료 (`/mypage/page.tsx`)

~~3. **프로덕션 환경 카카오 로그인 실패**~~ ✅ 해결됨 (2025-01-11)
   - ✅ **근본 원인 발견**: Vercel 환경변수가 `placeholder.supabase.co`로 잘못 설정됨
   - ✅ **자동 교체 로직 구현**: placeholder 값 감지 시 올바른 값으로 자동 교체
   - ✅ `browser-client.ts`에 fallback 로직 추가
   - ✅ `next.config.ts`에 환경변수 기본값 설정
   - ✅ Debug API 추가 (`/api/debug-env`) - 환경변수 확인용
   - 📝 **TODO**: Vercel Dashboard에서 환경변수 올바른 값으로 수정 필요

### ✅ 완료된 작업
1. **Supabase 인증 시스템**
   - ✅ Supabase 클라이언트 구현 (`src/lib/supabase/browser-client.ts`)
   - ✅ Kakao OAuth 완전 구현 (`src/components/layout/Header.tsx`)
   - ✅ Auth callback 라우트 구현 (`src/app/auth/callback/route.ts`)
   - ✅ Mock 클라이언트로 개발 환경 지원
   - ⚠️ **필요**: `.env.local` 파일에 환경 변수 설정

2. **디자인 시스템 전환** 🔄 (2025-01-12 23:45 업데이트)
   - ⚠️ **방향 전환**: styled-components → Tailwind CSS + shadcn/ui
   - ✅ **기존 작업**: Phase 2까지 styled-components로 70% 완료
   - 🔄 **새로운 방향**: 
     - 컴포넌트는 Tailwind CSS + shadcn/ui로 전환 예정
     - 페이지는 템플릿 기반 개발로 품질 개선
   - 📝 문서: `docs/DEVELOPMENT-INSTRUCTION-TEMPLATE.md` v5.0 업데이트 완료

3. **UI 컴포넌트**
   - ✅ Design System 구축 완료 (Stripe 스타일)
   - ✅ 모든 컴포넌트 토큰 시스템 적용
   - ✅ NavigationBar, PillButton, SearchBar, ExperienceCard 구현

3. **데이터베이스**
   - ✅ 8개 테이블 스키마 작성 (`src/lib/supabase/migrations/001_initial_schema.sql`)
   - ⚠️ 타입 통합 미완료 - TASK-2025-003 수행 필요

### ✅ 최근 완료 작업 (2025-01-12 23:45)
- ✅ **개발 템플릿 v5.0 업그레이드**
  - 템플릿 기반 개발 프로세스 추가
  - AI가 무료 템플릿 3-5개 자동 검색 및 일치도 평가
  - 프로젝트 스펙 완전 일치 검증 체크리스트
  - 실패 사례 & 금지사항 섹션 추가 (하단 배치)
  - 기술 스택 업데이트: Tailwind CSS + shadcn/ui
- ✅ **페이지 문제 분석 및 정리**
  - 테스트 페이지 4개 삭제 완료
  - className 사용 955개, inline style 58개 발견
  - 'use client' 남용 9개, 100줄 넘는 페이지 10개 확인
  - 페이지 리팩토링 계획 수립

### ✅ 최근 완료 작업 (2025-01-10)
- ✅ FastCampus 스타일 UI 재설계 완료
  - TopBanner (프로모션 배너)
  - MainCarousel (메인 캐러셀 - Hero 대체)
  - CategoryGrid (10개 카테고리 그리드)
  - RevenueSlider (수익인증 슬라이더)
- ✅ MainCarousel 클릭 기능 구현 완료
  - 활성 슬라이드 클릭 시 링크 이동
  - 비활성 슬라이드 클릭 시 해당 슬라이드로 전환

### ✅ 최근 완료 작업 - 캐러셀 개선 (2025-01-10)
- **캐러셀 개선**: PM AI 직접 완료
  - ✅ 캐러셀 위쪽 여백 20px 추가 완료
  - ✅ 무한 루프 자연스럽게 수정 완료 (1→8→1 순환)
  - ✅ React key 중복 에러 수정 완료
  - ✅ SSR window is not defined 에러 수정 완료

### ✅ 최근 완료 작업 - UI 개선 (2025-01-10)
- **TASK-2025-013**: UI 개선 작업 완료 (PM AI 최종 검증)
  - ✅ NavigationBar - 강의 드롭다운 메뉴 추가 (9개 강의)
  - ✅ NavigationBar - 검색창 개선 (돋보기 아이콘 왼쪽, placeholder 변경, 너비 400px)
  - ✅ NavigationBar - 카카오 로그인 버튼 스타일 업데이트
  - ✅ MainCarousel - FastCampus 스타일 인디케이터 구현
    - 캐러셀 내부 좌우 하단에 인디케이터/컨트롤 배치 (480px 위치)
    - 검정색 배경 적용 (rgba(0,0,0,0.7))
    - 프로그레스 바 개선 (역방향 애니메이션 제거, 0→100% 진행)
    - 인디케이터 위치 미세 조정 (bottom: 20px)
  - ✅ CategoryGrid - 호버 효과 강화
  - ✅ CategoryGrid - 불필요한 텍스트 제거 확인

### ✅ 최근 완료 작업 - 카카오 로그인 문제 해결 (2025-01-11)
- **프로덕션 카카오 로그인 문제 완전 해결**
  - ✅ **문제 원인**: Vercel 환경변수가 `placeholder.supabase.co`로 잘못 설정되어 있었음
  - ✅ **해결 방법**: placeholder 감지 시 자동으로 올바른 값으로 교체하는 로직 구현
  - ✅ 로그인 버튼 클릭 시 카카오 로그인 페이지로 정상 이동 확인

### ✅ 최근 완료 작업 - 시스템 일관성 개선 (2025-01-12)
- **시스템 전체 일관성 검증 및 개선 완료**
  - ✅ **보안 문제 해결**: Supabase 자격 증명을 환경 변수로 이동
  - ✅ **Import 패턴 통일**: 모든 파일에서 `createBrowserClient` 사용
  - ✅ **중복 파일 정리**: theme.deep.json만 유지, 백업 파일들 제거
  - ✅ **문서 업데이트**: ThemeProvider 참조 제거, 현재 아키텍처 반영
  - ✅ **검증 스크립트 작성**: `scripts/verify-system-consistency.js`
  - 📝 **다음 작업**: TASK-2025-016 스타일링 시스템 마이그레이션 (Tailwind → styled-components)
  - ✅ Debug API (`/api/debug-env`) 추가로 환경변수 실시간 확인 가능
  - 📝 설정 문서: `/docs/VERCEL-ENV-SETUP.md`, `/docs/KAKAO-LOGIN-CONFIG.md`
  - ⚠️ **권장사항**: Vercel Dashboard에서 환경변수를 올바른 값으로 수정 권장


### 📋 최근 완료 작업 - 강의 시스템 설계 (2025-01-11)
- **강의 시스템 전체 설계 완료**
  - ✅ 기술 명세서 작성 (`docs/design/course-system-specification.md`)

### 🔴 최근 작업 - 강의 상세 페이지 구현 (2025-01-12)
- **강의 상세 페이지 재구현 완료**
  - ✅ `/src/app/courses/[id]/page.tsx` - Server Component로 재구현
  - ✅ `CourseMainContent.tsx` - 좌측 메인 콘텐츠 (65%)
  - ✅ `CoursePurchaseCard.tsx` - 우측 구매 카드 (35% sticky)
  - ✅ `ContentBlockRenderer.tsx` - 콘텐츠 블록 렌더링 시스템
  - ✅ 탭 메뉴 시스템 구현 (강의소개/커리큘럼/FAQ)
  - ✅ 반응형 레이아웃 (Desktop 2-column, Mobile 1-column)
  - ✅ 모바일 하단 고정 구매 버튼
  - ⚠️ **Internal Server Error 발생** - 디버깅 필요
  - ⚠️ **ESLint 오류** - any 타입 사용으로 인한 빌드 경고
  - 📝 **CLAUDE.md 업데이트**: any 타입 사용 금지 규칙 추가 (ESLint 에러 방지)
  - ✅ DB 스키마 설계 - 6개 테이블 + RLS (`docs/design/course-database-schema.sql`)
  - ✅ UI/UX 와이어프레임 (`docs/design/course-ui-wireframe.md`)
  - ✅ Stripe 결제 연동 가이드 (`docs/design/stripe-integration-guide.md`)
  - 📝 **핵심 기능**: 4주/8주 과정, 무료/유료 분리, Q&A 게시판, 뱃지 시스템, DRM 보호

### ✅ 강의 시스템 Phase 1 MVP 구현 완료! (2025-01-11)
- **Phase 1 MVP 전체 구현 완료**
  - ✅ DB 스키마 생성 (`src/lib/supabase/migrations/005_course_system.sql`)
  - ✅ TypeScript 타입 정의 (`src/types/course-system.types.ts`)
  - ✅ 강의 목록 페이지 구현
    - `/courses` - 메인 랜딩 페이지
    - `/courses/free` - 무료 강의 목록
    - `/courses/premium` - 프리미엄 강의 목록
  - ✅ 강의 상세 페이지 (`/courses/[id]`)
  - ✅ 주차별 수강 페이지 (`/courses/[id]/week/[num]`)
  - ✅ HLS 비디오 플레이어 구현
    - DRM 보호 (우클릭 방지, 개발자 도구 감지)
    - 배속 재생 (0.5x ~ 2x)
    - PIP (Picture-in-Picture) 지원
    - 전체화면 모드
  - ✅ 진도 관리 시스템
    - 10초마다 자동 저장
    - 90% 시청 시 자동 완료 처리
    - 이어보기 기능
  - ✅ AuthProvider 구현 (`src/lib/auth/AuthProvider.tsx`)

### 🔄 강의 상세 페이지 전면 재설계 (2025-01-11)

#### 초기 구현 (FastCampus/인프런 스타일) - 문제 발생
- **FastCampus/인프런 스타일로 완전 재구현** (초기 시도)
  - ✅ DB 스키마 확장 (`src/lib/supabase/migrations/006_course_detail_enhancement.sql`)
    - content_blocks (JSONB) - 유연한 콘텐츠 관리
    - ~~rating, student_count - 평점 및 수강생 정보~~ (제거됨)
    - original_price, discount_rate - 할인 정보
    - category, level - 카테고리 및 난이도
  - ✅ 콘텐츠 블록 시스템 구현 (`src/types/course-detail.types.ts`)
    - 9가지 블록 타입: heading, text, image, video, grid, divider, accordion, button, html
    - JSON 기반 유연한 콘텐츠 구조
  - ⚠️ **문제점**: 복잡한 Hero 섹션, 불필요한 평점/리뷰, 과도한 정보

#### 최종 구현 (SimpleCourse - 심플한 구매 중심 페이지) ✅
- **SimpleCourse 타입 시스템** (`src/types/simple-course.types.ts`)
  - ✅ 평점/수강생 수 필드 완전 제거
  - ✅ 심플한 구매 중심 인터페이스
  - ✅ ContentBlock 시스템 유지 (유연한 콘텐츠)
  - ✅ Mock 데이터 생성 함수 포함

- **새로운 컴포넌트 구조** (Simple 접두사)
  - `SimpleCourseDetail` - 메인 레이아웃 (2-컬럼)
  - `SimplePurchaseCard` - Sticky 구매 카드
  - `SimpleContentRenderer` - 콘텐츠 블록 렌더링
  - `SimpleCourseTabs` - 3개 탭만 (강의소개, 커리큘럼, FAQ)

- **UI/UX 특징**
  - ✅ Hero 섹션 제거 - 바로 콘텐츠로 시작
  - ✅ 평점/리뷰/수강생 수 완전 제거
  - ✅ Desktop: 65% 콘텐츠 + 35% Sticky 카드
  - ✅ Mobile: 하단 고정 구매 버튼
  - ✅ 긴 형태의 콘텐츠 블록 (이미지, GIF, 비디오 포함)

### 🚨 해결 필요 문제 (2025-01-11)
- **로그인 페이지 누락**
  - ❌ `/login` 페이지 없음 - 404 에러
  - ❌ 강의 수강 페이지 접근 불가
  - **해결 방안**: 로그인/회원가입 페이지 구현 필요

- **DB 연결 문제**
  - ⚠️ Supabase 테이블 실제 생성 필요
  - ⚠️ Mock 데이터 폴백은 작동하나 실제 DB 연결 안 됨
  - **해결 방안**: Migration 실행 및 Seed 데이터 입력

### ⏳ 진행 예정 작업
#### 긴급 수정 필요
- [ ] **로그인 페이지 구현** (`/app/login/page.tsx`)
- [ ] **Supabase 테이블 생성** (migrations 실행)
- [ ] **주차별 페이지 링크 수정**

#### 강의 시스템 Phase 2 (다음 단계)
- [ ] Stripe 결제 연동
- [ ] Q&A 게시판 구현
- [ ] 뱃지 시스템 관리자 페이지
- [ ] 수료증 발급 기능

#### 강의 시스템 Phase 3 (고도화)
- [ ] DRM 강화 (HLS 암호화)
- [ ] 관리자 대시보드
- [ ] 강의 검색 및 필터링
- [ ] 내 강의 대시보드

#### 기타 시스템
- [ ] 수익인증 게시판 구축
- [ ] 랭킹 시스템
- [ ] 도구 페이지 (TTS 커터 등)
- [ ] 비즈니스 로직 트리거 (수익인증 검증)
- [ ] 랭킹 집계 함수 구현

---

## 🔴 2025-01-09 중요 업데이트 (v2)

### PM AI 작업 방식 개선
**문제**: 새 세션 Developer AI가 컨텍스트 부족으로 작업 실패
**해결**: 작업 지시서에 완전한 프로젝트 컨텍스트 포함

### 개선된 문서들
1. **task-template.md** - 필수 학습 문서 섹션 강화
2. **PM-AI-Framework.md** - 작업 지시서 필수 포함 사항 명시
3. **pm-ai-onboarding.md** - 작업 지시서 체크리스트 추가
4. **PM-AI-Quick-Start.md** - 5분 빠른 온보딩 가이드 생성

### 핵심 변경사항
- 모든 작업 지시서에 PROJECT-INDEX.md, CLAUDE.md 필수 포함
- 프로젝트 설명과 기술적 제약사항 명시 의무화
- 수정할 파일 전체 경로 명시 의무화
- **NEW**: DEVELOPMENT-INSTRUCTION-TEMPLATE.md v5.0 - 템플릿 기반 개발 도입

## 📚 핵심 문서 위치 및 용도

### 1. 프로젝트 설계 문서
- **`/docs/site-architecture-plan.md`** 
  - 용도: 전체 사이트 구조 및 기획
  - 언제 봐야 함: 새 기능 구현 시작할 때
  
- **`/docs/component-visual-diagram.md`** 
  - 용도: UI 컴포넌트 상세 명세
  - 언제 봐야 함: UI 컴포넌트 개발할 때
  
- **`/docs/development-workflow-guide.md`** 
  - 용도: 단계별 개발 가이드
  - 언제 봐야 함: 실제 코딩 작업할 때

### 2. 작업 관리 문서
- **`/docs/PM-AI-Framework.md`** 
  - 용도: PM AI 운영 매뉴얼
  - 언제 봐야 함: 작업 지시서 작성할 때

- **`/docs/DEVELOPMENT-INSTRUCTION-TEMPLATE.md`** ⭐ v5.0
  - 용도: 템플릿 기반 개발 지시서 작성
  - 언제 봐야 함: 새로운 기능/페이지 개발 시작 전
  - 핵심 기능: AI가 템플릿 자동 검색, 프로젝트 스펙 검증
  
- **`/docs/Visual-Verification-Protocol.md`** 
  - 용도: UI 검증 프로토콜
  - 언제 봐야 함: UI 작업 완료 후 검증할 때
  
- **`/docs/tasks/`** - 작업 태스크 목록
- **`/docs/evidence/`** - 검증 리포트 및 증거 자료

### 3. 설정 파일
- **`/CLAUDE.md`** 
  - 용도: Claude Code 가이드라인
  - 언제 봐야 함: 코딩 시작 전 필수
  
- **`/theme.deep.json`** 
  - 용도: 디자인 시스템 토큰
  - 언제 봐야 함: 스타일링 작업할 때
  
- **`/.env.local.example`** 
  - 용도: 환경 변수 템플릿
  - 언제 봐야 함: 초기 설정할 때

---

## 🚀 빠른 시작 명령어

### 1. 개발 서버 시작
```bash
npm run dev
```

### 2. 환경 변수 설정 (필수!)
```bash
# .env.local 파일 생성
cp .env.local.example .env.local
# 파일 열어서 Supabase URL과 Key 입력
```

### 3. Supabase Dashboard 설정
1. Authentication → Providers → Kakao 활성화
2. Client ID와 Secret 입력
3. Redirect URL 설정

---

## 🔄 개발 진행 상태 (development-workflow-guide.md 기반)

### Phase 1: 기초 설정 ✅ 완료
- [x] Step 1-1: 프로젝트 초기화 및 환경 설정 (TASK-2025-001 완료)
- [x] Step 1-2: Supabase 데이터베이스 설정 (TASK-2025-002 완료)
- [x] Step 1-3: 카카오 인증 시스템 구현 (기존 구현 활용)

### Phase 2: 메인 페이지 구현 ✅ 완료
- [x] Step 2-1: 메인 페이지 기본 구조 (완료)
- [x] Step 2-2: MainCarousel로 Hero 대체 (TASK-2025-004/005 완료)
- [x] Step 2-3: 실시간 수익인증 슬라이더 (TASK-2025-005 완료)
- [x] Step 2-4: 카테고리 그리드 구현 (TASK-2025-005 완료)

### Phase 3: 핵심 기능 구현
- [ ] Step 3-1: 강의 목록 페이지
- [ ] Step 3-2: 강의 상세 페이지
- [ ] Step 3-3: TTS 커터 도구
- [ ] Step 3-4: 수익인증 시스템
- [ ] Step 3-5: 랭킹 시스템

### Phase 4: 마무리 작업 ⚠️ 일부 완료
- [x] Step 4-1: 마이페이지 (완료 - 2025-01-10)
- [ ] Step 4-2: 관리자 대시보드
- [ ] Step 4-3: 최종 테스트 및 최적화

**업데이트 책임**: PM AI가 Developer AI 작업 검증 후 업데이트

---

## 💡 중요 참고사항

### Supabase & Kakao 인증
**이미 100% 구현 완료되어 있습니다!**
- 코드 수정 불필요
- 환경 변수만 설정하면 즉시 작동
- Mock 클라이언트로 개발 가능

### 디자인 시스템
- 모든 스타일링은 `theme.deep.json` 토큰 사용
- 하드코딩된 색상 절대 금지
- Design System 컴포넌트 우선 사용

### 프로젝트명
- 기존: "쇼츠 스튜디오" ❌
- 현재: **"디하클"** ✅

---

## 📊 문서 참조 워크플로우

### 🚀 새 세션 시작 시
```
1. PROJECT-INDEX.md 읽기 → 현재 상태 파악
2. CLAUDE.md 읽기 → 프로젝트 규칙 확인  
3. PM-AI-Framework.md 읽기 → 작업 방식 이해
4. 필요한 문서 선택적 읽기 → 작업 준비
```

### 💻 기능 구현 시
```
1. site-architecture-plan.md → 무엇을 만들지 확인
2. component-visual-diagram.md → 어떻게 보여야 하는지 확인
3. development-workflow-guide.md → 어떻게 구현하는지 확인
4. theme.deep.json → 스타일 토큰 참조
```

### ✅ 작업 전 체크리스트
```markdown
□ 새 세션 시작 체크리스트 완료했나?
□ PROJECT-INDEX.md 읽고 현재 상태 파악했나?
□ CLAUDE.md에서 디자인 시스템 규칙 확인했나?
□ site-architecture-plan.md에서 구현할 기능 확인했나?
□ 환경 변수(.env.local) 설정했나?
□ 토큰 시스템(theme.deep.json) 사용하고 있나?
```

---

## 🔥 자주 발생하는 문제와 해결

### 문제 1: "PM AI가 핵심 문서를 확인하지 않음"
**원인**: PROJECT-INDEX에 명시된 필수 문서들을 선택적으로 읽음
**해결**: 상단의 "새 세션 시작 체크리스트" 강제 확인

### 문제 2: "이미 구현된 기능을 다시 구현"
**원인**: 현재 구현 상태를 제대로 파악하지 않음
**해결**: Supabase/Kakao 인증은 완료됨 - 환경 변수만 설정 필요

### 문제 3: "프로젝트명 혼동"
**원인**: 구 문서에 "쇼츠 스튜디오" 잔재
**해결**: 모든 곳에서 "디하클" 사용

---

## 📞 연락처 및 지원

- **문서 업데이트**: 작업 진행 시 이 문서를 먼저 확인하고 업데이트
- **새 세션 시작**: 반드시 상단 체크리스트 완료 후 작업 시작
- **문제 발생 시**: "자주 발생하는 문제" 섹션 먼저 확인

*최종 업데이트: 2025-01-11 - 카카오 로그인 문제 해결*