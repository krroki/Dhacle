/implement --wave-mode auto --validate --safe-mode --think-hard --delegate auto --seq --c7 "사이트 컨셉을 YouTube 크리에이터 
  도구 사이트로 전면 변경"

*너 아래 작업하다가 뻗어버렸어. 어디까지 진행했는지 명확하게 확인하고나서 작업 계속 진행해줘


● 🎯 디하클 대규모 리팩토링 완전 계획서

  컨셉 변경: YouTube 강의 플랫폼 → YouTube 크리에이터 도구 사이트
  
  
  🛡️ 절대 삭제/수정 금지 목록

  🔧 개발 시스템 (절대 금지!)

  # ❌ 절대 삭제 금지
  /scripts/                    # 검증 스크립트들
  /e2e/                       # E2E 테스트 환경
  /docs/                      # 14개 문서 시스템
  /playwright.config.ts       # 테스트 설정
  /biome.json                 # 린터 설정
  /tsconfig.json              # TypeScript 설정
  /tailwind.config.js         # 스타일 설정
  /next.config.ts             # Next.js 설정
  /package.json               # 패키지 설정
  /.husky/                    # Git 훅

  🏗️ 핵심 인프라 (절대 금지!)

  # ❌ 절대 삭제 금지
  /src/lib/supabase/          # Supabase 클라이언트들
  /src/lib/api-client.ts      # API 클라이언트 핵심
  /src/lib/utils.ts           # cn() 등 핵심 유틸
  /src/env.ts                 # 환경변수 타입 시스템
  /src/middleware.ts          # 미들웨어 (링크만 수정)
  /src/types/database.generated.ts  # DB 타입 (재생성되지만)

  # Provider 시스템
  /src/components/providers/  # React Query, Auth 등
  /src/lib/react-query.ts     # React Query 설정

  🧩 UI 시스템 (절대 금지!)

  # ❌ 절대 삭제 금지
  /src/components/ui/         # shadcn/ui 전체
  /src/components/layout/     # Header, Footer, Sidebar (링크만 수정)

  # 범용 컴포넌트들
  /src/components/features/home/shared/SectionTitle.tsx     # 범용
  /src/components/features/home/shared/LoadingSkeletons.tsx # HeroSkeleton 필요

  🔐 유지할 기능들 (절대 금지!)

  # ❌ 절대 삭제 금지
  /src/components/features/auth/          # 인증 시스템
  /src/components/features/tools/youtube-lens/  # 메인 도구

  # YouTube 관련 훅들
  /src/hooks/queries/useYouTube*.ts      # YouTube 관련만
  /src/hooks/queries/useAnalytics.ts     # 분석 기능

  # API 클라이언트 중 유지할 것
  /src/lib/youtube/                      # YouTube API 클라이언트들
  /src/lib/analytics/                    # 분석 기능들

  🗄️ 데이터베이스 유지 (절대 금지!)

  -- ❌ 절대 삭제 금지 테이블들
  users, user_api_keys, user_roles       -- 기본 사용자
  api_usage, analytics_logs              -- 사용량 추적
  alerts, adminnotifications             -- 알림 시스템

  -- YouTube 도구 관련 (전체 유지)
  yl_*, youtube_*, channel_subscriptions, channels
  videos, video_stats, webhookevents

  ---
  ✅ 수정된 안전한 8단계 계획

  Phase 0: 사전 안전 확인

  # 1. 백업 및 브랜치 생성
  git checkout -b feature/safe-massive-refactor
  git add -A && git commit -m "🛡️ 리팩토링 시작 전 완전 백업"

  # 2. 절대 금지 목록 재확인
  echo "🔍 절대 삭제 금지 목록 확인:"
  ls -la scripts/ docs/ src/components/ui/ src/lib/supabase/

  # 3. 링크 참조 사전 확인
  grep -r "courses\|community\|revenue-proof" src/components/layout/ --include="*.tsx"

  Phase 1-8: 기존 계획 + 금지 목록 준수

  각 단계에서 삭제 전 반드시 확인:
  # 매 삭제 전 체크
  echo "⚠️  삭제 대상이 금지 목록에 있는지 확인"
  echo "삭제할 파일: [파일명]"
  echo "금지 목록 확인 완료? [y/n]"

  ---
  📊 삭제 규모 분석 결과

  🗂️ 파일 삭제 대상

  - 수익인증 관련: 48개 파일
  - 강의 관련: 78개 파일 (718번 발생)
  - 커뮤니티 관련: 38개 파일 (231번 발생)
  - 총 삭제 파일: 164개

  🗄️ 데이터베이스 테이블 삭제 대상 (22개)

  강의 관련 (10개):
  course_announcements, course_badges_extended, course_enrollments
  course_progress_extended, course_qna, course_reviews, course_weeks
  courseprogressextended, courses, enrollments

  수익인증 관련 (6개):
  proof_comments, proof_likes, proof_reports
  revenue_certifications, revenue_proofs, revenues

  커뮤니티 관련 (5개):
  communities, community_comments, community_likes
  community_posts, comments

  기타 (1개):
  coupons

  ---
  🏗️ 새로운 사이트 구조

  🎯 새로운 메인 페이지 구성

  1. Hero Section - 무료특강 공지용 (HeroCarousel 유지)
  2. Featured Tools Section - 주요 도구들 큰 카드
  3. All Tools Grid - 모든 도구 그리드
  4. FAQ Section - 도구 사용법 FAQ

  🛠️ 유지할 도구들

  - ✅ YouTube Lens (디하클렌즈) - 완성됨
  - 🚧 Revenue Calculator - 구현 필요
  - 🚧 Thumbnail Maker - 구현 필요

  📁 새로운 라우팅 구조

  /                      → 도구 중심 메인
  /tools/youtube-lens    → YouTube Lens
  /tools/revenue-calculator → 수익 계산기
  /tools/thumbnail-maker → 썸네일 메이커
  /docs/get-api-key     → API 키 발급
  /privacy, /terms, /accessibility, /sitemap → 유지

  ---
  ⚡ 8단계 안전 삭제 계획

  ⚠️ 중요: 각 단계마다 완료 후 검증 필수!

  Phase 1: 페이지 접근 차단 (즉시 사용자 차단)

  1-1. 강의 페이지 차단
  # 다음 페이지들 전체 삭제
  rm -rf src/app/\(pages\)/courses

  1-2. 커뮤니티 페이지 차단
  rm -rf src/app/\(pages\)/community

  1-3. 수익인증 페이지 차단
  rm -rf src/app/\(pages\)/revenue-proof

  1-4. 결제/마이페이지 관련 페이지 차단
  rm -rf src/app/\(pages\)/payment
  rm src/app/\(pages\)/mypage/courses/page.tsx
  rm src/app/\(pages\)/mypage/achievements/page.tsx
  rm src/app/\(pages\)/mypage/wishlist/page.tsx

  검증:
  npm run build  # 빌드 에러 확인
  npm run dev    # 해당 페이지들 404 확인

  Phase 2: 메인 페이지 재구성

  2-1. 현재 메인 페이지 백업
  cp src/app/page.tsx src/app/page.tsx.backup

  2-2. 새로운 page.tsx 작성
  // 유지할 것들:
  // - HeroCarousel (무료특강용)
  // - FAQSection (도구 관련으로 수정)

  // 삭제할 것들:
  // - RevenueGalleryNew
  // - FreeCoursesCarousel  
  // - FreeCoursesSchedule
  // - NewCoursesCarousel
  // - EbookSection
  // - InstructorCategories

  // 새로 추가할 것들:
  // - FeaturedToolsSection
  // - AllToolsGrid

  검증:
  npm run dev  # 메인 페이지 정상 렌더링 확인

  Phase 3: 컴포넌트 삭제 (UI 레이어)

  3-1. 홈페이지 삭제 대상 컴포넌트들
  rm -rf src/components/features/home/FreeCoursesCarousel
  rm -rf src/components/features/home/FreeCoursesSchedule
  rm -rf src/components/features/home/NewCoursesCarousel
  rm -rf src/components/features/home/EbookSection
  rm -rf src/components/features/home/InstructorCategories
  rm -rf src/components/features/home/RevenueGallery
  rm -rf src/components/features/home/shared/CourseCard.tsx
  rm -rf src/components/features/home/shared/CourseCarousel.tsx

  3-2. 기능별 컴포넌트들
  rm -rf src/components/features/revenue-proof
  rm -rf src/components/features/payment

  검증:
  npm run types:check
  npm run build

  Phase 4: API Routes 삭제 (백엔드 레이어)

  4-1. 수익인증 API
  rm -rf src/app/api/revenue-proof

  4-2. 커뮤니티 API
  rm -rf src/app/api/community

  4-3. 결제 API
  rm -rf src/app/api/payment

  4-4. 기타 관련 API
  rm -rf src/app/api/coupons
  rm src/app/api/certificates/\*

  검증:
  npm run build
  npm run verify:api

  Phase 5: 데이터 레이어 정리

  5-1. React Query 훅들
  rm src/hooks/queries/useCourseQueries.ts
  rm src/hooks/queries/useCommunityQueries.ts
  rm src/hooks/queries/useCommunityPosts.ts
  rm src/hooks/queries/useRevenueProofQueries.ts
  rm src/hooks/queries/useRevenueProof.ts
  rm src/hooks/queries/useCertificates.ts

  5-2. API 클라이언트 함수들
  rm src/lib/api/courses.ts
  rm src/lib/api/revenue-proof.ts

  5-3. 더미 데이터
  # src/lib/dummy-data/home.ts에서 강의 관련 데이터 제거

  검증:
  npm run types:check

  Phase 6: 타입 시스템 정리

  6-1. types/index.ts 정리
  // 삭제할 타입들:
  // - Course, CourseCategory, CourseEnrollment 관련
  // - Community, CommunityPost 관련  
  // - RevenueProof 관련
  // - Payment 관련

  6-2. 검증 스키마 삭제
  rm src/lib/validations/revenue-proof.ts
  # src/lib/security/validation-schemas.ts에서 관련 스키마 제거

  검증:
  npm run types:check
  npx biome check src/types/

  Phase 7: 네비게이션 및 링크 정리

  7-1. Header.tsx 수정
  // 삭제할 메뉴들:
  // - 강의 관련 메뉴
  // - 커뮤니티 메뉴  
  // - 수익인증 메뉴

  // 새로 추가할 메뉴:
  // - 도구 메뉴 강화

  7-2. Footer.tsx 수정
  // 삭제된 페이지 링크들 제거

  7-3. 사이드바 및 모바일 네비게이션
  // Sidebar.tsx, MobileNav.tsx 링크 정리

  검증:
  npm run build
  npm run dev  # 모든 링크 정상 작동 확인

  Phase 8: 데이터베이스 정리 (마지막 단계)

  ⚠️ 반드시 백업 후 진행!

  8-1. 데이터베이스 백업
  # 중요 테이블 백업
  node scripts/backup-database.js

  8-2. 테이블 삭제 SQL 작성
  -- Phase8-delete-tables.sql
  DROP TABLE IF EXISTS course_announcements CASCADE;
  DROP TABLE IF EXISTS course_badges_extended CASCADE;
  DROP TABLE IF EXISTS course_enrollments CASCADE;
  -- ... (22개 테이블 모두)

  8-3. SQL 실행
  node scripts/supabase-sql-executor.js --method pg --file migrations/Phase8-delete-tables.sql

  8-4. 타입 재생성
  npm run types:generate

  최종 검증:
  npm run verify:parallel
  npm run build
  npm run test:e2e

  ---
  🚨 위험 요소 및 대응책

  ⚠️ 주요 위험 요소

  1. 순환 의존성 → 컴포넌트 간 import 체인
  2. 타입 연관성 → DB 타입 삭제 시 파급효과
  3. 라우팅 링크 → Header/Footer의 깨진 링크들
  4. 미들웨어 → middleware.ts 경로 설정

  🛡️ 대응 방법

  - 매 단계 검증 필수
  - 백업 철저히
  - 빌드 에러 즉시 해결
  - import 에러 추적

  ---
  ✅ 각 단계별 검증 명령어

  # 타입 체크
  npm run types:check

  # 빌드 테스트
  npm run build

  # 개발 서버 테스트
  npm run dev

  # E2E 테스트  
  npm run test:e2e

  # 완전 검증
  npm run verify:parallel

  # 보안 테스트
  npm run security:test

  ---
  📋 실행 전 필수 백업

  # 1. 전체 데이터베이스 백업
  node scripts/backup-database.js

  # 2. 중요 설정 파일들
  cp .env.local .env.local.backup
  cp package.json package.json.backup
  cp next.config.ts next.config.ts.backup

  # 3. Git 커밋
  git add -A
  git commit -m "✅ Phase 0: 대규모 리팩토링 시작 전 백업"