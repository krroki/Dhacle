# 📋 디하클 - 유튜브 수익화 교육 플랫폼 사이트 아키텍처 기획서

## 🔴 중요: 구현 현황
- **✅ Supabase 연동 완료** - 클라이언트 및 Mock 클라이언트 구현
- **✅ Kakao OAuth 인증 완료** - 로그인/로그아웃 완전 작동
- **⚠️ 환경 변수만 설정 필요** - .env.local 파일에 Supabase URL과 Key만 추가

## 🎯 프로젝트 개요

### 비즈니스 현황
- **강의 런칭**: 매주 2개씩 새로운 강의 출시
- **수강생 규모**: 약 10,000명
- **커뮤니티**: 카카오톡 오픈채팅 20개 이상 (각 4,000명)
- **플랫폼**: 네이버카페, YouTube, Instagram, Threads 운영

### 핵심 문제점
1. ❌ 계정 공유로 인한 수익 손실
2. ❌ CRM 관리의 어려움
3. ❌ 강의 분류/검색 어려움
4. ❌ 회원 관리 한계
5. ❌ 네이버 카페 기능 제약

### 목표
1. ✅ 체계적인 강의 관리 시스템
2. ✅ 메인 페이지에서 주력 강의 노출
3. ✅ 활발한 커뮤니티 구축
4. ✅ 유튜브 제작 도구 제공
5. ✅ 수익인증 및 랭킹 시스템

---

## 🏗️ 사이트 구조도

```
홈 (/)
├── 강의 (/courses)
│   ├── 전체 강의 목록 (/courses/all)
│   ├── 카테고리별 (/courses/category)
│   ├── 강의 상세 (/courses/[id])
│   └── 내 강의실 (/courses/my)
│
├── 도구 (/tools)
│   ├── TTS 커터 (/tools/tts-cutter)
│   ├── 스크립트 생성기 (/tools/script-generator)
│   ├── 키워드 분석기 (/tools/keyword-analyzer)
│   └── 썸네일 메이커 (/tools/thumbnail-maker)
│
├── 커뮤니티 (/community)
│   ├── 공지사항 (/community/notice)
│   ├── 자유게시판 (/community/board)
│   ├── 수익인증 (/community/revenue)
│   ├── 성공사례 (/community/success)
│   └── Q&A (/community/qna)
│
├── 랭킹 (/ranking)
│   ├── 주간 랭킹 (/ranking/weekly)
│   ├── 월간 랭킹 (/ranking/monthly)
│   └── 연간 랭킹 (/ranking/yearly)
│
├── 마이페이지 (/mypage)
│   ├── 프로필 (/mypage/profile)
│   ├── 내 강의 (/mypage/courses)
│   ├── 수익인증 관리 (/mypage/revenue)
│   └── 설정 (/mypage/settings)
│
└── 관리자 (/admin)
    ├── 회원 관리 (/admin/users)
    ├── 강의 관리 (/admin/courses)
    ├── 수익인증 관리 (/admin/revenue)
    └── 통계 대시보드 (/admin/dashboard)
```

---

## 📱 페이지별 컴포넌트 상세 기획

### 1️⃣ 메인 페이지 (/)

#### 섹션 구성

##### 1.1 Hero Section
**컴포넌트**: `HeroSection`
- **용도**: 방문자 첫인상, 핵심 가치 전달
- **구성 요소**:
  - 동적 타이틀: "유튜브로 월 1000만원, 우리가 증명합니다"
  - 실시간 수강생 수 카운터
  - CTA 버튼: "무료 체험 시작하기"
  - 배경: 성공 수강생들의 수익 인증 모자이크
- **UX 개선안**:
  - 🎯 3초 자동 재생 비디오 배경
  - 🎯 스크롤 유도 애니메이션
  - 🎯 모바일 최적화 레이아웃

##### 1.2 실시간 수익 인증 슬라이더
**컴포넌트**: `RevenueSlider`
- **용도**: 사회적 증명, 신뢰도 구축
- **구성 요소**:
  - 최근 24시간 수익인증 캐러셀
  - 수익금액 하이라이트
  - 수강생 프로필 미니 카드
- **UX 개선안**:
  - 🎯 자동 슬라이드 + 호버시 정지
  - 🎯 금액별 색상 그라데이션
  - 🎯 "지금 바로 시작" 플로팅 버튼

##### 1.3 이번 주 HOT 강의
**컴포넌트**: `FeaturedCourses`
- **용도**: 주력 강의 홍보
- **구성 요소**:
  - 3개 강의 카드 그리드
  - 할인율 배지
  - 수강생 수 실시간 표시
  - 평점 및 리뷰 수
- **UX 개선안**:
  - 🎯 "마감임박" 카운트다운 타이머
  - 🎯 호버시 강의 미리보기
  - 🎯 원클릭 장바구니 담기

##### 1.4 성공 스토리 비디오
**컴포넌트**: `SuccessStories`
- **용도**: 감정적 연결, 동기부여
- **구성 요소**:
  - YouTube 임베드 플레이어
  - 수강생 인터뷰 3개
  - Before/After 수익 비교
- **UX 개선안**:
  - 🎯 썸네일 호버시 미리보기
  - 🎯 관련 강의 바로가기 링크
  - 🎯 공유하기 기능

##### 1.5 도구 모음 프리뷰
**컴포넌트**: `ToolsPreview`
- **용도**: 부가가치 어필
- **구성 요소**:
  - 4개 주요 도구 아이콘
  - 간단한 설명
  - "무료 사용하기" 버튼
- **UX 개선안**:
  - 🎯 인터랙티브 데모
  - 🎯 사용법 GIF 애니메이션
  - 🎯 "신규" 배지

##### 1.6 실시간 커뮤니티 피드
**컴포넌트**: `CommunityFeed`
- **용도**: 활발한 커뮤니티 증명
- **구성 요소**:
  - 최신 게시글 5개
  - 인기 질문 3개
  - 오늘의 베스트 수익인증
- **UX 개선안**:
  - 🎯 실시간 업데이트 애니메이션
  - 🎯 카테고리별 필터
  - 🎯 좋아요/댓글 수 표시

---

### 2️⃣ 강의 페이지 (/courses)

#### 컴포넌트 구성

##### 2.1 강의 필터 사이드바
**컴포넌트**: `CourseFilter`
- **구성 요소**:
  - 카테고리 체크박스
  - 가격 범위 슬라이더
  - 난이도 선택
  - 평점 필터
  - 정렬 옵션
- **UX 개선안**:
  - 🎯 선택 결과 실시간 반영
  - 🎯 필터 초기화 버튼
  - 🎯 인기 필터 조합 프리셋

##### 2.2 강의 카드 그리드
**컴포넌트**: `CourseGrid`
- **구성 요소**:
  - 썸네일 이미지
  - 강의 제목
  - 강사 정보
  - 가격 및 할인
  - 수강생 수
  - 평점
- **UX 개선안**:
  - 🎯 무한 스크롤
  - 🎯 스켈레톤 로딩
  - 🎯 퀵뷰 모달

##### 2.3 강의 상세 페이지
**컴포넌트**: `CourseDetail`
- **구성 요소**:
  - 비디오 플레이어
  - 커리큘럼 아코디언
  - 강사 프로필
  - 수강평 섹션
  - FAQ
  - 수강신청 스티키 바
- **UX 개선안**:
  - 🎯 진도율 표시
  - 🎯 북마크 기능
  - 🎯 모바일 PIP 모드

---

### 3️⃣ 도구 페이지 (/tools)

#### 핵심 도구 컴포넌트

##### 3.1 TTS 커터
**컴포넌트**: `TTSCutter`
- **기능**:
  - 오디오 파일 업로드
  - 파형 시각화
  - 구간 선택 및 자르기
  - TTS 삽입 포인트 지정
  - 내보내기
- **UX 개선안**:
  - 🎯 드래그 앤 드롭 업로드
  - 🎯 키보드 단축키
  - 🎯 실시간 미리듣기

##### 3.2 스크립트 생성기
**컴포넌트**: `ScriptGenerator`
- **기능**:
  - 템플릿 선택
  - AI 기반 자동 생성
  - 편집기
  - 글자수/예상시간 계산
- **UX 개선안**:
  - 🎯 자동 저장
  - 🎯 버전 히스토리
  - 🎯 협업 기능

##### 3.3 키워드 분석기
**컴포넌트**: `KeywordAnalyzer`
- **기능**:
  - 검색량 조회
  - 경쟁도 분석
  - 연관 키워드
  - 트렌드 그래프
- **UX 개선안**:
  - 🎯 실시간 업데이트
  - 🎯 엑셀 내보내기
  - 🎯 즐겨찾기

---

### 4️⃣ 커뮤니티 페이지 (/community)

#### 게시판 컴포넌트

##### 4.1 수익인증 게시판
**컴포넌트**: `RevenueBoard`
- **구성 요소**:
  - 인증 양식 (금액, 스크린샷, 강의 선택)
  - 갤러리/리스트 뷰 전환
  - 좋아요/댓글
  - 월별 통계
- **UX 개선안**:
  - 🎯 이미지 자동 검증
  - 🎯 수익 그래프 생성
  - 🎯 배지 시스템

##### 4.2 Q&A 게시판
**컴포넌트**: `QABoard`
- **구성 요소**:
  - 질문 작성 폼
  - 카테고리 태그
  - 베스트 답변 선택
  - 전문가 답변 표시
- **UX 개선안**:
  - 🎯 유사 질문 추천
  - 🎯 실시간 알림
  - 🎯 포인트 보상

---

### 5️⃣ 랭킹 페이지 (/ranking)

#### 랭킹 대시보드
**컴포넌트**: `RankingDashboard`
- **구성 요소**:
  - Top 10 리더보드
  - 기간 선택 탭
  - 수익 차트
  - 뱃지/보상 표시
  - 내 순위 하이라이트
- **UX 개선안**:
  - 🎯 실시간 순위 변동
  - 🎯 프로필 호버 카드
  - 🎯 축하 애니메이션

---

## 🎨 UI/UX 디자인 시스템

### 색상 팔레트
```scss
// Primary Colors
$primary-blue: #635BFF;      // 메인 브랜드 색상
$primary-dark: #0A2540;      // 텍스트, 강조
$primary-light: #00D4FF;     // 액센트, 하이라이트

// Semantic Colors  
$success: #00D68F;           // 수익인증, 성공
$warning: #FFB800;           // 주목, 할인
$danger: #FF5630;            // 마감임박, 에러

// Neutral Colors
$gray-900: #1A1A1A;         // 제목
$gray-600: #666666;         // 본문
$gray-300: #E5E5E5;         // 테두리
$gray-100: #F5F5F5;         // 배경
```

### 타이포그래피
```scss
// Font Family
$font-primary: 'Pretendard', -apple-system, sans-serif;
$font-mono: 'JetBrains Mono', monospace;

// Font Sizes
$text-xs: 12px;     // 캡션, 라벨
$text-sm: 14px;     // 부가정보
$text-base: 16px;   // 본문
$text-lg: 18px;     // 소제목
$text-xl: 24px;     // 제목
$text-2xl: 32px;    // 섹션 제목
$text-3xl: 48px;    // 히어로 제목
```

### 컴포넌트 스타일 가이드

#### 버튼
```scss
.btn {
  // Primary
  &-primary {
    background: linear-gradient(135deg, $primary-blue, $primary-light);
    box-shadow: 0 4px 14px rgba(99, 91, 255, 0.4);
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 7px 20px rgba(99, 91, 255, 0.5);
    }
  }
  
  // Secondary
  &-secondary {
    background: white;
    border: 2px solid $primary-blue;
    color: $primary-blue;
  }
  
  // Sizes
  &-lg { padding: 16px 32px; font-size: 18px; }
  &-md { padding: 12px 24px; font-size: 16px; }
  &-sm { padding: 8px 16px; font-size: 14px; }
}
```

#### 카드
```scss
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }
  
  &-featured {
    border: 2px solid $primary-blue;
    position: relative;
    
    &::before {
      content: 'HOT';
      position: absolute;
      top: -12px;
      right: 20px;
      background: $warning;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
  }
}
```

---

## 📊 데이터베이스 스키마

### 주요 테이블 구조

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100),
  phone VARCHAR(20),
  role ENUM('student', 'instructor', 'admin'),
  created_at TIMESTAMP,
  last_login TIMESTAMP
);

-- 강의 테이블
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  instructor_id UUID REFERENCES users(id),
  price DECIMAL(10, 2),
  discount_rate INT,
  thumbnail_url VARCHAR(500),
  video_url VARCHAR(500),
  category VARCHAR(50),
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 수익인증 테이블
CREATE TABLE revenue_certifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2),
  screenshot_url VARCHAR(500),
  courses JSON, -- 수강한 강의 ID 배열
  description TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

-- 랭킹 테이블
CREATE TABLE rankings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  period_type ENUM('weekly', 'monthly', 'yearly'),
  period_date DATE,
  total_revenue DECIMAL(10, 2),
  rank INT,
  created_at TIMESTAMP
);
```

---

## 🚀 구현 우선순위

### Phase 1 (MVP - 2주)
1. ✅ **[완료]** 인증 시스템 (카카오 로그인) - Supabase Auth 연동 완료
2. ⏳ 메인 페이지
3. ⏳ 강의 목록/상세
4. ⏳ 수익인증 기본 기능

### Phase 2 (핵심 기능 - 3주)
1. ⏳ 도구 페이지 (TTS 커터 우선)
2. ⏳ 커뮤니티 게시판
3. ⏳ 랭킹 시스템
4. ⏳ 마이페이지

### Phase 3 (고도화 - 4주)
1. ⏳ 관리자 대시보드
2. ⏳ 고급 도구 추가
3. ⏳ 알림 시스템
4. ⏳ 분석/통계 기능

---

## 📈 성공 지표 (KPI)

### 비즈니스 지표
- **계정 공유 감소율**: 80% 감소 목표
- **월 활성 사용자(MAU)**: 8,000명 목표
- **강의 완주율**: 70% 이상
- **수익인증 참여율**: 일일 100건 이상

### 기술 지표
- **페이지 로딩 속도**: 2초 이내
- **모바일 반응형**: 100% 지원
- **업타임**: 99.9% 이상
- **동시 접속자**: 1,000명 지원

---

## 🔧 기술 스택 권장사항

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State**: Zustand + React Query
- **Animation**: Framer Motion

### Backend
- **Database**: Supabase (PostgreSQL) ✅ 클라이언트 구현 완료
- **Auth**: Supabase Auth + 카카오 OAuth ✅ 완전 구현됨
- **Storage**: Supabase Storage
- **API**: Next.js API Routes

### DevOps
- **Hosting**: Vercel
- **CDN**: Cloudflare
- **Monitoring**: Vercel Analytics
- **CI/CD**: GitHub Actions

---

## 📝 다음 단계

1. **디자인 시안 작성**
   - Figma 와이어프레임
   - 컴포넌트 라이브러리
   - 프로토타입

2. **개발 환경 구축**
   - 프로젝트 초기화
   - 데이터베이스 설정
   - 인증 시스템 구현

3. **MVP 개발**
   - Phase 1 기능 구현
   - 테스트 및 피드백
   - 반복 개선

---

*이 문서는 지속적으로 업데이트되며, 개발 진행 상황에 따라 수정될 수 있습니다.*