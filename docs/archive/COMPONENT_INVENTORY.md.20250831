# 🧩 컴포넌트 인벤토리 (Component Inventory)

*목적: 재사용 가능한 컴포넌트 목록*
*핵심 질문: "이미 만들어진 컴포넌트 있나?"*
*업데이트: 2025-02-01 - 시스템 컴포넌트 추가*

> **구현 상태 범례**:
> - ✅ 완료: 완전히 구현되고 테스트됨
> - ⚠️ 부분: 기본 기능만 구현됨
> - ❌ 미구현: 아직 구현되지 않음

---

## 🔧 시스템 컴포넌트 (2025-02-01 추가)

### 에러 처리
- **ErrorBoundary** (`src/components/ErrorBoundary.tsx`)
  - 목적: React 컴포넌트 에러 격리 및 복구
  - 라이브러리: react-error-boundary v4.1.2
  - 사용: app/layout.tsx에서 전역 적용
  - 특징: 개발/프로덕션 환경 분기, 에러 복구 UI
  
### 성능 모니터링
- **WebVitals** (`src/components/WebVitals.tsx`)
  - 목적: Core Web Vitals 실시간 모니터링
  - 라이브러리: @vercel/analytics v1.5.0
  - 메트릭: LCP, FID, CLS, FCP, TTFB
  - 자동 Vercel Analytics 전송

### Provider 컴포넌트
- **Providers** (`src/components/providers/Providers.tsx`)
  - 목적: 전역 Provider 관리
  - 포함 Provider:
    - QueryClientProvider (React Query)
    - SessionProvider (NextAuth)
    - ThemeProvider (next-themes)
  - 설정: 캐싱 전략, 재시도 로직

### 지연 로딩 컴포넌트
- **LazyYouTubeLens** (`src/components/lazy/index.tsx`)
- **LazyRevenueProof** (`src/components/lazy/index.tsx`)
  - 목적: 초기 번들 크기 감소
  - 구현: React.lazy + Suspense
  - 효과: 10KB+ 번들 크기 감소

---

## 📦 UI 라이브러리 컴포넌트 (shadcn/ui)

| 컴포넌트 | 파일 경로 | 용도 | 사용처 | 구현 상태 |
|----------|----------|------|--------|-----------|
| **Button** | `/src/components/ui/button.tsx` | 범용 버튼 컴포넌트 | 전체 프로젝트 (50+) | ✅ 완료 |
| **Card** | `/src/components/ui/card.tsx` | 카드 레이아웃 | 강의, 수익인증 카드 | ✅ 완료 |
| **Input** | `/src/components/ui/input.tsx` | 입력 필드 | 폼, 검색창 | ✅ 완료 |
| **Dialog** | `/src/components/ui/dialog.tsx` | 모달 다이얼로그 | 로그인, 설정 | ✅ 완료 |
| **Dropdown Menu** | `/src/components/ui/dropdown-menu.tsx` | 드롭다운 메뉴 | 프로필, 설정 | ✅ 완료 |
| **Carousel** | `/src/components/ui/carousel.tsx` | 이미지 슬라이더 | 메인 히어로, 강의 목록 | ✅ 완료 |
| **Tabs** | `/src/components/ui/tabs.tsx` | 탭 네비게이션 | 강의 상세, 마이페이지 | ✅ 완료 |
| **Toast** | `/src/components/ui/toast.tsx` | 알림 메시지 | 전체 앱 | ✅ 완료 |
| **Badge** | `/src/components/ui/badge.tsx` | 상태 표시 뱃지 | 강의, 사용자 프로필 | ✅ 완료 |
| **Sheet** | `/src/components/ui/sheet.tsx` | 사이드 패널 | 모바일 메뉴 | ✅ 완료 |
| **Label** | `/src/components/ui/label.tsx` | 폼 라벨 | 폼 입력 | ✅ 완료 |
| **Switch** | `/src/components/ui/switch.tsx` | 토글 스위치 | 설정 | ✅ 완료 |
| **Textarea** | `/src/components/ui/textarea.tsx` | 멀티라인 입력 | 게시글 작성 | ✅ 완료 |
| **Accordion** | `/src/components/ui/accordion.tsx` | 접을 수 있는 콘텐츠 | FAQ | ✅ 완료 |
| **Avatar** | `/src/components/ui/avatar.tsx` | 사용자 아바타 | 프로필, 댓글 | ✅ 완료 |
| **Alert** | `/src/components/ui/alert.tsx` | 경고/정보 메시지 | 시스템 메시지 | ✅ 완료 |
| **Aspect Ratio** | `/src/components/ui/aspect-ratio.tsx` | 비율 유지 컨테이너 | 이미지, 비디오 | ✅ 완료 |
| **Breadcrumb** | `/src/components/ui/breadcrumb.tsx` | 경로 표시 | 페이지 네비게이션 | ✅ 완료 |
| **Calendar** | `/src/components/ui/calendar.tsx` | 달력 컴포넌트 | 일정 관리 | ✅ 완료 |
| **Checkbox** | `/src/components/ui/checkbox.tsx` | 체크박스 | 다중 선택 | ✅ 완료 |
| **Collapsible** | `/src/components/ui/collapsible.tsx` | 접기/펼치기 | 콘텐츠 토글 | ✅ 완료 |
| **Command** | `/src/components/ui/command.tsx` | 명령 팔레트 | 검색, 명령 | ✅ 완료 |
| **Context Menu** | `/src/components/ui/context-menu.tsx` | 우클릭 메뉴 | 콘텐츠 작업 | ✅ 완료 |
| **Hover Card** | `/src/components/ui/hover-card.tsx` | 호버 정보 카드 | 툴팁 정보 | ✅ 완료 |
| **Menubar** | `/src/components/ui/menubar.tsx` | 메뉴바 | 상단 네비게이션 | ✅ 완료 |
| **Navigation Menu** | `/src/components/ui/navigation-menu.tsx` | 네비게이션 메뉴 | 메인 메뉴 | ✅ 완료 |
| **Popover** | `/src/components/ui/popover.tsx` | 팝오버 | 추가 정보 표시 | ✅ 완료 |
| **Progress** | `/src/components/ui/progress.tsx` | 진행률 표시 | 로딩, 업로드 | ✅ 완료 |
| **Radio Group** | `/src/components/ui/radio-group.tsx` | 라디오 버튼 그룹 | 단일 선택 | ✅ 완료 |
| **Scroll Area** | `/src/components/ui/scroll-area.tsx` | 스크롤 영역 | 긴 콘텐츠 | ✅ 완료 |
| **Select** | `/src/components/ui/select.tsx` | 셀렉트 박스 | 옵션 선택 | ✅ 완료 |
| **Separator** | `/src/components/ui/separator.tsx` | 구분선 | 콘텐츠 구분 | ✅ 완료 |
| **Skeleton** | `/src/components/ui/skeleton.tsx` | 스켈레톤 로더 | 로딩 상태 | ✅ 완료 |
| **Slider** | `/src/components/ui/slider.tsx` | 슬라이더 | 값 조절 | ✅ 완료 |
| **Table** | `/src/components/ui/table.tsx` | 테이블 | 데이터 표시 | ✅ 완료 |
| **Toggle** | `/src/components/ui/toggle.tsx` | 토글 버튼 | 상태 전환 | ✅ 완료 |
| **Toggle Group** | `/src/components/ui/toggle-group.tsx` | 토글 그룹 | 다중 토글 | ✅ 완료 |
| **Tooltip** | `/src/components/ui/tooltip.tsx` | 툴팁 | 도움말 | ✅ 완료 |
| **TipTap Editor** | `/src/components/ui/tiptap-editor.tsx` | 리치 텍스트 에디터 | 게시글 작성 | ✅ 완료 |
| **Sonner** | `/src/components/ui/sonner.tsx` | 토스트 알림 | 시스템 알림 | ✅ 완료 |
| **Toast** | `/src/components/ui/toast.tsx` | 토스트 컴포넌트 | 알림 표시 | ✅ 완료 |
| **useToast** | `/src/components/ui/use-toast.tsx` | 토스트 훅 | 토스트 제어 | ✅ 완료 |

---

## 🏗️ 레이아웃 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | Props | 구현 상태 |
|----------|----------|------|-------|-----------|
| **Header** | `/src/components/layout/Header.tsx` | 상단 헤더 | user?, scrolled | ✅ 완료 |
| **Footer** | `/src/components/layout/Footer.tsx` | 하단 푸터 | - | ✅ 완료 |
| **Sidebar** | `/src/components/layout/Sidebar.tsx` | 사이드바 네비게이션 | user, currentPath | ✅ 완료 |
| **MobileNav** | `/src/components/layout/MobileNav.tsx` | 모바일 네비게이션 | currentPath | ✅ 완료 |
| **TopBanner** | `/src/components/layout/TopBanner.tsx` | 상단 공지 배너 | message, link? | ✅ 완료 |
| **ProgressBar** | `/src/components/layout/ProgressBar.tsx` | 페이지 로딩 진행바 | - | ✅ 완료 |
| **ErrorBoundary** | `/src/components/ErrorBoundary.tsx` | 에러 격리 및 복구 UI | children | ✅ 완료 🆕 2025-08-23 |
| **Providers** | `/src/components/providers/Providers.tsx` | React Query 및 Theme Provider | children | ✅ 완료 🆕 2025-08-23 |

---

## 🎨 홈페이지 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | API 연결 | 구현 상태 |
|----------|----------|------|----------|-----------|
| **HeroCarousel** | `/src/components/features/home/HeroCarousel/` | 메인 히어로 섹션 | ❌ (정적) | ✅ 완료 |
| **RevenueGallery** | `/src/components/features/home/RevenueGallery/` | 수익인증 갤러리 | GET /api/revenue-proof | ✅ 완료 |
| **RevenueGalleryNew** | `/src/components/features/home/RevenueGallery/RevenueGalleryNew.tsx` | 새 수익인증 갤러리 | GET /api/revenue-proof | ✅ 완료 |
| **InstructorCategories** | `/src/components/features/home/InstructorCategories/` | 강사 카테고리 | ❌ (정적) | ✅ 완료 |
| **FreeCoursesCarousel** | `/src/components/features/home/FreeCoursesCarousel/` | 무료 강의 캐러셀 | ❌ (정적) | ✅ 완료 |
| **NewCoursesCarousel** | `/src/components/features/home/NewCoursesCarousel/` | 신규 강의 캐러셀 | ❌ (정적) | ✅ 완료 |
| **FreeCoursesSchedule** | `/src/components/features/home/FreeCoursesSchedule/` | 무료 강의 일정 | ❌ (정적) | ✅ 완료 |
| **EbookSection** | `/src/components/features/home/EbookSection/` | 전자책 섹션 | ❌ (정적) | ✅ 완료 |
| **FAQSection** | `/src/components/features/home/FAQSection/` | FAQ 섹션 | ❌ (정적) | ✅ 완료 |

---

## 💰 수익인증 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | API 연결 | 구현 상태 |
|----------|----------|------|----------|-----------|
| **RevenueProofCard** | `/src/components/features/revenue-proof/RevenueProofCard.tsx` | 수익인증 카드 | - | ✅ 완료 |
| **RevenueProofDetail** | `/src/components/features/revenue-proof/RevenueProofDetail.tsx` | 수익인증 상세 뷰 | GET /api/revenue-proof/[id] | ✅ 완료 |
| **FilterBar** | `/src/components/features/revenue-proof/FilterBar.tsx` | 필터링 바 | - | ✅ 완료 |
| **RankingDashboard** | `/src/components/features/revenue-proof/RankingDashboard.tsx` | 랭킹 대시보드 | GET /api/revenue-proof/ranking | ✅ 완료 |
| **LiveRankingSidebar** | `/src/components/features/revenue-proof/LiveRankingSidebar.tsx` | 실시간 랭킹 사이드바 | GET /api/revenue-proof/ranking | ✅ 완료 |

---

## 🎬 YouTube Lens 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | API 연결 | 구현 상태 |
|----------|----------|------|----------|-----------|
| **SearchBar** | `/src/components/features/tools/youtube-lens/components/SearchBar.tsx` | 검색 바 | POST /api/youtube/search | ✅ 완료 |
| **VideoCard** | `/src/components/features/tools/youtube-lens/components/VideoCard.tsx` | 비디오 카드 | - | ✅ 완료 |
| **VideoGrid** | `/src/components/features/tools/youtube-lens/components/VideoGrid.tsx` | 비디오 그리드 | - | ✅ 완료 |
| **QuotaStatus** | `/src/components/features/tools/youtube-lens/components/QuotaStatus.tsx` | API 할당량 상태 | GET /api/youtube/metrics | ✅ 완료 |
| **SetupGuide** | `/src/components/features/tools/youtube-lens/components/SetupGuide.tsx` | 설정 가이드 | - | ✅ 완료 |
| **YouTubeLensErrorBoundary** | `/src/components/features/tools/youtube-lens/components/YouTubeLensErrorBoundary.tsx` | 에러 바운더리 | - | ✅ 완료 |
| **ApiKeySetup** | `/src/components/features/tools/youtube-lens/components/ApiKeySetup.tsx` | API 키 설정 | POST /api/user/api-keys | ✅ 완료 |
| **EnvironmentChecker** | `/src/components/features/tools/youtube-lens/components/EnvironmentChecker.tsx` | 환경 체커 | GET /api/debug/env-check | ✅ 완료 |
| **CollectionManager** | `/src/components/features/tools/youtube-lens/components/CollectionManager.tsx` | 컬렉션 관리 | GET/POST /api/youtube/collections | ✅ 완료 |
| **FavoritesManager** | `/src/components/features/tools/youtube-lens/components/FavoritesManager.tsx` | 즐겨찾기 관리 | GET/POST /api/youtube/favorites | ✅ 완료 |
| **FolderTree** | `/src/components/features/tools/youtube-lens/components/FolderTree.tsx` | 폴더 트리 | - | ✅ 완료 |
| **MetricsDisplay** | `/src/components/features/tools/youtube-lens/components/MetricsDisplay.tsx` | 메트릭 표시 | GET /api/youtube/metrics | ✅ 완료 |
| **VideoAnalyzer** | `/src/components/features/tools/youtube-lens/components/VideoAnalyzer.tsx` | 비디오 분석 | POST /api/youtube/analysis | ✅ 완료 |
| **🆕 KeywordTrends** | `/src/components/features/tools/youtube-lens/KeywordTrends.tsx` | **키워드 트렌드 대시보드** | GET/POST /api/youtube-lens/keywords/trends | **✅ 완료** 🆕 2025-08-28 |

---

## 🔐 인증 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | API 연결 | 구현 상태 |
|----------|----------|------|----------|-----------|
| **KakaoLoginButton** | `/src/components/features/auth/KakaoLoginButton.tsx` | 카카오 로그인 버튼 | GET /auth/callback | ✅ 완료 |
| **AuthProvider** | `/src/lib/auth/AuthProvider.tsx` | 인증 프로바이더 | - | ✅ 완료 |
| **AuthContext** | `/src/lib/auth/AuthContext.tsx` | 인증 컨텍스트 | - | ✅ 완료 |

---

## 📚 강의 관련 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | API 연결 | 구현 상태 |
|----------|----------|------|----------|-----------|
| **VideoPlayer** | `/src/app/learn/[courseId]/[lessonId]/components/VideoPlayer.tsx` | 비디오 플레이어 | - | ✅ 완료 |
| **CourseCard** | (인라인 구현) | 강의 카드 | - | ✅ 완료 |
| **CourseList** | (인라인 구현) | 강의 목록 | - | ✅ 완료 |
| **CourseDetail** | (인라인 구현) | 강의 상세 | - | ✅ 완료 |
| **CourseGrid** | (인라인 구현) | 강의 그리드 | - | ✅ 완료 |

---

## 💬 커뮤니티 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | API 연결 | 구현 상태 |
|----------|----------|------|----------|-----------|
| **PostList** | (인라인 구현) | 게시글 목록 | GET /api/community/posts | ✅ 완료 |
| **PostCard** | (인라인 구현) | 게시글 카드 | - | ✅ 완료 |
| **PostEditor** | (인라인 구현) | 게시글 에디터 | POST /api/community/posts | ✅ 완료 |
| **CommentSection** | (인라인 구현) | 댓글 섹션 | GET/POST /api/revenue-proof/[id]/comment | ✅ 완료 |

---

## 🛠️ 도구 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | API 연결 | 구현 상태 |
|----------|----------|------|----------|-----------|
| **RevenueCalculator** | (인라인 구현) | 수익 계산기 | - | ✅ 완료 |
| **ThumbnailMaker** | (인라인 구현) | 썸네일 메이커 | - | ✅ 완료 |

---

## 💳 결제 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | API 연결 | 구현 상태 |
|----------|----------|------|----------|-----------|
| **PaymentWidget** | (인라인 구현) | 결제 위젯 | POST /api/payment/create-intent | ✅ 완료 |
| **PaymentResult** | (인라인 구현) | 결제 결과 | POST /api/payment/confirm | ✅ 완료 |
| **PaymentMethodSelector** | (인라인 구현) | 결제 수단 선택 | - | ✅ 완료 |

---

## 👤 사용자 프로필 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | API 연결 | 구현 상태 |
|----------|----------|------|----------|-----------|
| **ProfileForm** | (인라인 구현) | 프로필 편집 폼 | GET/PUT /api/user/profile | ✅ 완료 |
| **BadgeDisplay** | (인라인 구현) | 뱃지 표시 | - | ✅ 완료 |
| **AchievementList** | (인라인 구현) | 성취 목록 | - | ✅ 완료 |

---

## 🎛️ 관리자 컴포넌트

| 컴포넌트 | 파일 경로 | 용도 | API 연결 | 구현 상태 |
|----------|----------|------|----------|-----------|
| **CourseManager** | (인라인 구현) | 강의 관리 | - | ✅ 완료 |
| **VideoUploader** | (인라인 구현) | 비디오 업로더 | POST /api/admin/video/upload | ✅ 완료 |
| **UserManager** | (인라인 구현) | 사용자 관리 | - | ✅ 완료 |

---

## 📊 통계

### 구현 상태별 집계 (2025-08-28 업데이트)
- ✅ **완료**: 122개 (100%) - 1개 추가 ✨
- ⚠️ **부분 구현**: 0개 (0%)
- ❌ **미구현**: 0개 (0%)

### 카테고리별 분포
- **UI 라이브러리**: 41개
- **레이아웃**: 8개
- **홈페이지**: 9개
- **수익인증**: 5개
- **YouTube Lens**: 14개 (+1개 KeywordTrends) ✨
- **인증**: 3개
- **강의**: 5개
- **커뮤니티**: 4개
- **도구**: 2개
- **결제**: 3개
- **프로필**: 3개
- **관리자**: 3개
- **인라인 구현**: 23개

### API 연결 현황
- **API 연결됨**: 31개 컴포넌트
- **정적 데이터**: 16개 컴포넌트
- **Props로 데이터 받음**: 73개 컴포넌트

---

## 📊 컴포넌트 재사용 매트릭스

### 높은 재사용성 (10+ 사용)
- **Button**: 모든 액션 (50+ 사용)
- **Card**: 목록 아이템 (30+ 사용)
- **Input**: 모든 폼 (25+ 사용)
- **Toast**: 모든 알림 (20+ 사용)
- **Dialog**: 모달 팝업 (15+ 사용)

### 중간 재사용성 (5-10 사용)
- **Select**: 필터/정렬 (8 사용)
- **Skeleton**: 로딩 상태 (7 사용)
- **Avatar**: 프로필 표시 (6 사용)
- **Badge**: 상태 표시 (6 사용)
- **Tabs**: 콘텐츠 구분 (5 사용)

### 낮은 재사용성 (1-5 사용)
- **VideoPlayer**: 강의 시청만 (1 사용)
- **PaymentMethodSelector**: 결제만 (1 사용)
- **HeroCarousel**: 홈페이지만 (1 사용)
- **TipTap Editor**: 게시글 작성만 (2 사용)

---

## 🚨 컴포넌트 생성 규칙

### 재사용 체크리스트
1. **기존 컴포넌트 확인**: 이 문서에서 검색
2. **shadcn/ui 우선**: 기본 컴포넌트 활용
3. **Props 설계**: 확장 가능하게
4. **API 연결**: WIREFRAME.md 참조
5. **문서 업데이트**: 생성 후 이 문서에 추가

### 네이밍 규칙
- **컴포넌트 파일**: `PascalCase.tsx` (예: `VideoPlayer.tsx`)
- **폴더명**: `kebab-case` (예: `youtube-lens`)
- **페이지 컴포넌트**: `page.tsx` (Next.js 규칙)
- **레이아웃**: `layout.tsx` (Next.js 규칙)

### 폴더 구조
```
/src/components/
├── ui/              # shadcn/ui 컴포넌트
├── layout/          # 레이아웃 컴포넌트  
└── features/        # 기능별 컴포넌트
    ├── home/        # 홈페이지
    ├── auth/        # 인증
    ├── revenue-proof/ # 수익인증
    └── tools/       # 도구
        └── youtube-lens/ # YouTube Lens
```

---

## 📝 참고사항

### 인라인 구현 컴포넌트
일부 컴포넌트는 페이지 파일 내에 직접 구현되어 있으며, 재사용성이 높아지면 별도 파일로 분리할 예정입니다.

### 컴포넌트 성능 최적화
- **React.memo**: 자주 렌더링되는 컴포넌트에 적용
- **useMemo/useCallback**: 복잡한 계산이나 콜백에 사용
- **Code Splitting**: 큰 컴포넌트는 dynamic import 활용
- **Lazy Loading**: 이미지와 무거운 컴포넌트에 적용

### 접근성 체크리스트
- **ARIA 라벨**: 모든 인터랙티브 요소에 적용
- **키보드 네비게이션**: Tab, Enter, Escape 키 지원
- **스크린 리더**: 의미있는 텍스트 제공
- **색상 대비**: WCAG 2.1 AA 기준 충족

---

*이 문서는 컴포넌트 추가/수정/삭제 시 즉시 업데이트되어야 합니다.*