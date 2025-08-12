# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔴 테스트 계정 정보 (MUST USE FOR TESTING)

**카카오 로그인 테스트 계정**:
```
ID: glemfkcl@naver.com
PW: dhfl9909
```
⚠️ **중요**: 인증 화면이 나타나면 사용자가 직접 인증하므로 잠시 대기 필요

## 🔴 최우선 원칙 업데이트 (2025-01-09)

### 기존: Context 없는 AI 가정 (비효율적)
~~모든 문서를 Context 없는 AI가 읽어도 이해하도록~~ → **폐기**

### 신규: Context 활용 전략 (효율적)
1. **Developer AI 온보딩 먼저** (`docs/developer-ai-onboarding.md`)
2. **Context 활용하여 간결한 지시** (500줄→50줄)
3. **불명확한 부분만 상세 설명**

### 🚨 문서 관리 절대 규칙 (PM-AI-Framework.md:14)
1. **새 문서 생성 금지**: 기존 문서가 있으면 반드시 수정
2. **문서 연속성 유지**: 생성된 문서는 계속 업데이트
3. **작업 지시서 위치**: `docs/tasks/active/` 폴더에만 생성
4. **Context 잃어도 추적 가능**: PROJECT-INDEX.md가 모든 문서 위치 안내

### 📁 파일 생성 시 필수 후속 조치 (2025-01-09 추가)

#### 새 파일 생성 후 반드시:
- [ ] **구버전 정리**: 기존 파일 삭제 또는 deprecated로 이동
- [ ] **참조 업데이트**: 새 파일 참조하는 모든 문서 수정
- [ ] **파일 구조 확인**: `ls -la`로 최종 상태 검증
- [ ] **하나의 정식 버전만 유지**: v2, v3, backup 같은 중복 금지

### 📝 작업 지시서 작성 원칙 - Context Zero 보완 (2025-01-09)

#### Context Zero + Context 활용 통합 전략
1. **즉시 실행 스크립트 제공** - 새 세션 AI가 현재 상태 파악 가능
2. **Context 활용 효율화** - Developer AI 학습 후 간결한 지시
3. **완전한 실패 대비** - 모든 에러 시나리오와 해결법 포함

#### 필수 포함 요소:
1. **즉시 실행 스크립트** (템플릿 최상단)
   ```bash
   cd C:\My_Claude_Project\9.Dhacle
   git status --short  # ⚠️ 사용자 확인 후 실행
   npx tsc --noEmit 2>&1 | head -20
   ```

2. **프로젝트 기본 정보**
   - 프로젝트명: 디하클 (Dhacle)
   - 목적: YouTube Shorts 크리에이터 교육 플랫폼
   - 기술 스택 및 버전 명시

3. **작업 완료 JSON 보고**
   - task_id, status, verification 필수
   - 증거 파일 경로 포함

4. **Git 작업 주의사항**
   - ⚠️ **모든 git 명령은 반드시 사용자 확인 후 실행**
   - git commit, push, reset 등 특히 주의

#### 템플릿 위치:
- `docs/tasks/templates/task-template.md` - 통합 템플릿 v3.0

### 🚫 금지된 애매한 표현 (2025-01-09 추가)

**절대 사용 금지** - 이런 표현을 쓰면 AI가 수행하지 않음:
- ❌ "필요시" → ✅ "반드시"
- ❌ "가능하면" → ✅ "예외 없이"
- ❌ "적절히" → ✅ "다음 10가지 모두"
- ❌ "확인" → ✅ "실행하고 테스트하고 스크린샷 찍고 로그 수집"
- ❌ "고려" → ✅ "구현"
- ❌ "검토" → ✅ "수행"

**올바른 지시 예시**:
- ❌ "필요시 테스트 수행"
- ✅ "반드시 다음 5가지 테스트 모두 수행하고 증거 제출"

### 🎭 PM AI와 Developer AI 역할 분리 (2025-01-09 추가)

#### Developer AI 책임
- **구현**: 작업 지시서에 따른 코드 구현
- **테스트**: 단위 테스트 및 타입 체크
- **보고**: JSON 형식 완료 보고

#### PM AI 책임  
- **계획**: 작업 지시서 작성 및 우선순위 관리
- **검증**: Developer AI 작업 결과 검증
- **문서 업데이트**: PROJECT-INDEX.md 진행 상태 업데이트
- **품질 관리**: 전체 프로젝트 품질 및 일정 관리

#### ❌ 역할 침범 금지
- Developer AI가 PROJECT-INDEX.md 수정 → **금지**
- PM AI가 직접 코드 구현 → **금지**
- 검증 없이 완료 처리 → **금지**

#### ❌ 절대 금지:
- 파일만 생성하고 끝
- task-template.md, task-template-v2.md 같은 중복
- 구버전 방치
- 참조 경로 불일치 방치

### 5W1H 필수 포함 원칙
- **WHO**: 누가 수행하는가? (PM AI, Developer AI, User)
- **WHAT**: 무엇을 해야 하는가? (구체적 파일명, 줄 번호, 코드)
- **WHERE**: 어디에 적용하는가? (정확한 경로: src/lib/supabase/browser-client.ts:32)
- **WHEN**: 언제 적용하는가? (작업 완료 후, 커밋 전, 배포 전)
- **WHY**: 왜 필요한가? (타입 안정성, 보안, 성능)
- **HOW**: 어떻게 수행하는가? (Edit 도구 사용 → npx tsc --noEmit)

### ❌ 잘못된 예시:
"타입 통합 필요"
"검증 수행"
"코드 개선"

### ✅ 올바른 예시:
"Developer AI는 src/lib/supabase/browser-client.ts 파일 32번째 줄의 createBrowserClient 함수에 <Database> 제네릭 타입을 추가하여 타입 안정성을 확보해야 함. 수정 후 npx tsc --noEmit 명령어로 컴파일 에러 0개 확인 필수"

## ⛔ PM AI 작업 검증 - 절대 규칙 (MANDATORY)

### 언제 적용하는가?
1. **개발자 AI 작업 완료 보고 시** → **반드시** 전체 검증
2. **새 기능 구현 완료 시** → **반드시** 해당 기능 검증
3. **데이터베이스 변경 시** → **반드시** DB 검증 체크리스트
4. **타입 정의 수정 시** → **반드시** 타입 안정성 검증
5. **배포 전** → **반드시** 전체 시스템 검증

### 강제 검증 체크리스트 (모든 항목 필수)
1. **작업 유형 파악**: Frontend/Backend/Database/Security
2. **10가지 필수 검증 수행** (하나라도 빠지면 FAIL):
   - [ ] 코드 실행 (npm run dev)
   - [ ] 타입 체크 (npx tsc --noEmit)
   - [ ] 린트 체크 (npm run lint)
   - [ ] 단위 테스트 (npm test)
   - [ ] e2e 테스트 (실제 시나리오)
   - [ ] Visual-Verification-Protocol.md 60개 항목 전부 체크
   - [ ] 스크린샷에서 요소 겹침, 정렬, 간격 문제 확인
   - [ ] API 테스트 (curl/Postman)
   - [ ] 에러 케이스 테스트
   - [ ] 성능 측정 (로딩 시간)
   - [ ] 보안 체크 (권한, 인증)
3. **증거 수집**: 모든 테스트 결과를 public/evidence/에 저장
4. **불일치 발견 시**: 즉시 STOP → 수정 지시서 생성

### 검증 실패 = 작업 실패
- **99% 완료 = 0% 완료**. 100% 아니면 FAIL
- 불일치 하나라도 발견 시 **즉시 STOP**
- "대체로 완료", "사용 가능" 같은 애매한 판단 **절대 금지**

### 작업 유형별 선택적 검증 체크리스트

#### Frontend 작업 검증 (15개 핵심 항목)
```bash
□ 컴포넌트 렌더링 확인: npm run dev → 실제 화면 확인
□ TypeScript 컴파일: npx tsc --noEmit (에러 0개)
□ 디자인 토큰 사용: theme.deep.json 토큰만 사용
□ 접근성: 키보드 네비게이션, ARIA 레이블
□ 반응형: 모바일/태블릿/데스크톱 확인
```

#### Backend 작업 검증 (20개 핵심 항목)
```bash
□ API 응답 테스트: curl 또는 Postman으로 실제 테스트
□ 에러 처리: 모든 예외 상황 처리 확인
□ 데이터 검증: Input validation 구현
□ 인증/인가: 권한 체크 로직 확인
□ 로깅: 적절한 로그 레벨과 내용
```

#### Database 작업 검증 (25개 핵심 항목)
```bash
□ 스키마 일치: migrations vs types 비교
□ RLS 정책: 각 역할별 실제 테스트
□ 인덱스: EXPLAIN ANALYZE로 성능 확인
□ 트리거/함수: 실제 데이터로 테스트
□ 타입 통합: Supabase 클라이언트 타입 확인
```

#### 전체 검증 항목
**상세 100+ 항목**: `docs/verification-protocol-complete.md` 참조

### 검증 프로토콜
- **상세 프로토콜**: `docs/verification-protocol-complete.md` 참조
- **불일치 발견**: `❌ FAIL - 수정 필수` 선언 후 중단
- **PM AI 역할**: 문제 발견 시 즉시 작업 지시서 생성 (`docs/tasks/active/`)

### 이전 AI들의 실수 기록
1. 작업 로그 뻥튀기 (줄 수 허위 보고)
2. 타입 통합 누락했는데 "사용 가능" 판단
3. 검증 항목 일부만 체크하고 통과 처리
4. 의존성, 보안, 성능 검증 완전 누락

**당신도 같은 실수를 반복할 것임. 반드시 전체 체크리스트 확인.**

## 🔴 필수 확인 사항 (MUST READ FIRST)

**새로운 세션 시작 시 반드시 읽어야 할 문서 순서:**

1. **`docs/PROJECT-INDEX.md`** 📍
   - 프로젝트 문서 지도 (모든 중요 문서 위치)
   - 작업 플로우 및 체크리스트
   - 현재 진행 중인 작업 목록

2. **`docs/PM-AI-Framework.md`** ⭐
   - PM AI 운영 매뉴얼

3. **`docs/Visual-Verification-Protocol.md`** 🚨
   - UI 작업 시 필수 검증 프로토콜
   - 3단계 검증: 코드 → 렌더링 → 시각적
   - "코드가 동작한다 ≠ UI가 완성됐다"

### 빠른 시작 명령어
```bash
# 1. 프로젝트 문서 확인
cat docs/PROJECT-INDEX.md

# 2. 현재 작업 확인
ls docs/tasks/active/*.md

# 3. 타입 검증 (가장 중요)
npx tsc --noEmit

# 4. 토큰 시스템 검증
node scripts/validate-tokens.js

# 5. 로컬 Supabase 테스트
npx supabase start
npx supabase db push
```

## 🔧 개발자 AI 자가 검증 프롬프트 (복사-붙여넣기용)

```
작업 완료 후 다음을 순서대로 실행하고 결과를 보고하세요:

1. 실제 파일 확인:
   - Read 도구로 수정한 파일 열어서 변경사항 확인
   - 주장한 줄 번호와 실제 줄 번호 일치 확인

2. TypeScript 컴파일:
   npx tsc --noEmit
   → 결과: "에러 0개" 또는 에러 내용 전체 복사

3. 로컬 테스트:
   npm run dev
   → 결과: 정상 실행 또는 에러 로그 전체 복사

4. 증거 수집:
   - 컴파일 결과 스크린샷
   - 실행 화면 스크린샷
   - 테스트 결과 로그

5. 최종 보고:
   ✅ PASS: 모든 검증 통과 (증거 첨부)
   ❌ FAIL: [실패 항목] - [이유] - [증거]
```

## Project Overview

**Project Name**: 디하클 (Dhacle)

This is a community platform for YouTube Shorts creators focused on education and resource sharing. The project aims to build an independent website that combines:
- Course introductions and educational content
- E-book sharing and distribution
- Open chat room links for community networking
- The intuitive information structure of https://passive.ai.kr/
- The premium design system and dynamic UX of https://stripe.com/

## 🚨 CRITICAL: Design System Rules (MUST READ)

**⚠️ 2025-01-12 UPDATE: styled-components 마이그레이션 Phase 2 Priority 1 완료**
- **Phase 1**: 디자인 시스템 확장 완료 (Layout, Spacing, Animation) ✅
- **Phase 2 Priority 1**: 5/5 컴포넌트 마이그레이션 완료 ✅
  - TopBanner, HeroSection, MainCarousel, CategoryGrid, RevenueSlider
- **진행률**: 70% (13/37 파일 완료)
- **중요**: 모든 새 컴포넌트는 styled-components로 작성하세요!

**MANDATORY**: ALL styling MUST use theme.deep.json tokens through centralized design system

### ❌ NEVER DO THIS:
```tsx
// WRONG - Hardcoded colors
<div style={{ color: '#ffffff' }}>
<div className="text-white">

// WRONG - Inline styles without tokens  
<button style={{ backgroundColor: 'blue' }}>

// WRONG - Direct Tailwind without Stripe tokens
<div className="bg-blue-500">
```

### ✅ ALWAYS DO THIS:
```tsx
// CORRECT - Use design system components
import { StripeButton, StripeCard, StripeTypography } from '@/components/design-system'
import theme from 'theme.deep.json'

// Use components
<StripeButton variant="primary">Click me</StripeButton>
<StripeTypography variant="h2" color="dark">Title</StripeTypography>

// Access theme tokens when needed
<div style={{ color: theme.colors.text.primary.default }}>
```

### Design System Components (styled-components Based):

#### 📦 Location: `src/components/design-system/`
- **Typography.styled.tsx**: H1-H4, Body, Caption, Code, StripeTypography
- **Button.styled.tsx**: StripeButton with all variants
- **Card.styled.tsx**: StripeCard, BorderedCard, ElevatedCard
- **Input.styled.tsx**: Input, Textarea, Select, Checkbox, Radio
- **Layout.styled.tsx**: Container, Row, Column, Grid, Spacer
- **Gradient.styled.tsx**: StripeGradient with animations
- **common.ts**: Theme tokens, helper functions, mixins

#### Core Components:
- **StripeButton**: 
  - Variants: primary, secondary, ghost, gradient
  - Sizes: sm, md, lg
  - States: loading, disabled, hover
  - SSR-safe with styled-components
  
- **StripeCard**: 
  - Variants: default, bordered, elevated
  - Elevation levels: sm, md, lg, xl
  - Padding options: none, sm, md, lg
  - No ThemeProvider dependency
  
- **StripeTypography**:
  - Variants: h1, h2, h3, h4, body, caption, code
  - Colors: primary, dark, light, muted, inverse
  - Direct theme.deep.json token usage
  
- **StripeGradient**:
  - Variants: primary, stripe, hero, subtle
  - Animated with keyframes
  - SSR-safe implementation
  
- **StripeInput & StripeTextarea**:
  - Simple styled inputs without complex props
  - States: hasError, size options
  - Direct token usage

#### Theme System:
- **Token Usage**: Direct import from theme.deep.json
  - Import theme tokens directly from the JSON file
  - All components use tokens through styled-components
  - No ThemeProvider needed (SSR-safe approach)
  
- **Token Structure** (theme.deep.json):
  - Colors: primary, neutral, text, button tokens
  - Typography: fonts, sizes, weights, line heights
  - Spacing: 0-32 scale with px precision
  - Effects: shadows, transitions, transforms, opacity
  - Border radius: sm to full scale
  - Gradients: hero, primary, stripe patterns

## Tech Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS with theme.deep.json tokens
- **Design System**: Centralized components using Stripe tokens
- **Theme**: theme.deep.json (extracted from Stripe.com)
- **Animation**: Token-based transitions and transforms
- **Icons**: Heroicons or Feather Icons
- **Fonts**: Sohne-var (Stripe font), system fonts fallback

### Backend
- **Framework**: Python FastAPI
- **Audio Processing**: Python audio libraries for subtitle generation, silence detection and removal

### Infrastructure
- **Database**: Supabase (PostgreSQL-based)
- **Authentication**: Kakao OAuth 2.0
- **Frontend Deployment**: Vercel
- **Backend Deployment**: AWS Lambda or Naver Cloud Functions
- **Storage**: Supabase Storage for file uploads

## Development Commands

```bash
# Frontend (Next.js)
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run lint            # Run linter

# Backend (FastAPI)
pip install -r requirements.txt    # Install Python dependencies
uvicorn main:app --reload         # Start development server with auto-reload

# Database (Supabase)
npx supabase init       # Initialize Supabase project
npx supabase start      # Start local Supabase
npx supabase db push    # Push schema changes
```

## Architecture Overview

### Frontend Structure
```
/src
  /components       # Reusable UI components following Stripe design system
    /design-system # styled-components based (SSR-safe, NO ThemeProvider)
      Typography.styled.tsx  # All typography components
      Button.styled.tsx      # Button components
      Card.styled.tsx        # Card components
      Input.styled.tsx       # Form elements
      Layout.styled.tsx      # Layout utilities
      Gradient.styled.tsx    # Gradient backgrounds
      common.ts             # Theme tokens and helpers
      index.ts              # Central exports
    /ui            # Base components (Button, Card, Input, etc.)
    /sections      # Page sections (Hero, Features, Pricing, etc.)
    /layouts       # Layout components (Header, Footer, etc.)
  /pages           # Next.js pages
    /design-system # Showcase page for all components
  /lib             # Utility functions and API clients
    /theme         # Theme management system
      ThemeProvider.tsx  # Enhanced theme context with helpers
      theme.ts          # Token exports from theme.deep.json
    /supabase      # Supabase client configuration
    /kakao         # Kakao OAuth integration
  /styles          # Global styles and Tailwind config
  /hooks           # Custom React hooks
  /types           # TypeScript type definitions
```

### Backend Structure
```
/app
  /api             # API endpoints
    /auth          # Kakao authentication endpoints
    /subtitle      # Subtitle generation endpoints
    /courses       # Course management endpoints
    /ebooks        # E-book management endpoints
    /community     # Community links and chat room endpoints
    /admin         # Admin CMS endpoints
  /services        # Business logic
    /audio         # Audio processing and silence detection
    /subtitle      # Subtitle generation logic
    /srt           # SRT file generation
  /models          # Database models
  /utils           # Utility functions
```

## Key Features to Implement

### 1. Subtitle Generator (자막 생성기)
- Accept audio files (mp3, m4a, wav)
- Process audio for speech-to-text conversion
- Detect and remove silence sections
- Generate .srt subtitle files
- Provide download links

### 2. Authentication System
- Kakao OAuth 2.0 integration
- User profile management
- Session handling with Supabase Auth

### 3. Content Management
- Admin panel for managing:
  - Course introductions and descriptions
  - E-books (PDF files) for sharing
  - Open chat room links
  - Announcements
  - FAQs
  - Community resources

### 4. Design System Implementation
Following Stripe's design principles:
- Dynamic gradients with mouse/scroll interaction
- Generous whitespace and 12-column grid system
- Scroll-triggered animations (fade-in, slide-up)
- Hover effects with subtle scale and shadow changes
- Skeleton UI for loading states

## Color System (Deprecated - See theme.json)
**Note**: All color values are now managed through `theme.json`. The values below are for reference only.

The design system uses a comprehensive token-based approach with:
- **Background colors**: Default, subtle, elevated, and overlay variants
- **Text colors**: Primary, secondary, muted, and inverted options
- **Accent colors**: Primary and secondary with hover/active states
- **Gradients**: Dynamic gradients using accent color tokens
- **Surface colors**: Card backgrounds with hover and active states

To view or modify colors, edit `theme.json` in the project root.

## Page Structure

### Home Page (/)
1. **Hero Section**: Dynamic gradient background, headline "유튜브로 월 1000만원, 우리가 증명합니다", CTA button [커뮤니티 참여하기]
2. **Social Proof**: "N사 공식 카페 회원 00,000명이 함께합니다" with community logos
3. **Feature 1**: Course Introduction "전문가의 노하우를 배우세요" (left text, right mockup)
4. **Feature 2**: E-book Sharing "성공한 크리에이터들의 노하우 전자책" (left mockup, right text)
5. **Feature 3**: Subtitle Generator "간편한 자막 생성 도구" (left text, right mockup)
6. **Community Section**: "함께 성장하는 크리에이터 커뮤니티" with card layout - [오픈 채팅방], [FAQ], [쇼츠 제작 꿀팁]
7. **Pricing Section**: "모든 자료는 현재 무료로 제공됩니다" with future course teaser
8. **Final CTA**: "지금 바로 디하클과 함께 당신의 채널을 성장시키세요"

## Development Priorities

### Sprint 1: Foundation (2-3 days)
- Set up Next.js with TypeScript
- Implement Stripe-inspired design system components
- Configure Tailwind CSS with custom theme

### Sprint 2: Core Features (3-4 days)
- Build page layouts using passive.ai.kr structure
- Implement Kakao OAuth authentication
- Create subtitle generator (frontend + backend)
- Set up course introduction pages
- Implement e-book sharing system

### Sprint 3: Content & Testing (2 days)
- Build admin CMS for content management
- Add customer support chat integration
- Test responsive design across devices

### Sprint 4: Deployment (1 day)
- Deploy frontend to Vercel
- Deploy backend to serverless environment
- Configure domain and SSL

## Design System (Token-Based Architecture)

### Overview
The entire design system is now driven by a Single Source of Truth: `theme.json`. This file contains all visual design tokens extracted from Stripe.com using Playwright automation.

### Token Structure
- **Colors**: Background, text, accent, border, and surface colors with variants
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale from 0 to 64 units
- **Shadows**: Multiple shadow levels including glow effects
- **Animation**: Durations and easing functions
- **Border Radius**: Consistent corner radius scale
- **Opacity & Blur**: Standardized transparency and blur values

### Usage Guidelines
1. **No Hardcoded Values**: Never hardcode color, spacing, or other style values
2. **Token-First**: Always use Tailwind utility classes that reference tokens
3. **Consistency**: The theme.json file is the only source for design values
4. **Updates**: To modify the design system, update theme.json and Tailwind will automatically reflect changes

### Token Update Process
1. Modify values in `theme.json`
2. Tailwind configuration automatically loads the updated tokens
3. All components using those tokens will update automatically
4. No need to search and replace hardcoded values

## ⚠️ Git 작업 관련 절대 규칙

**모든 git 작업은 반드시 사용자 확인 후 실행:**
- `git add` - 파일 추가 전 확인
- `git commit` - 커밋 메시지와 내용 확인
- `git push` - 원격 저장소 푸시 전 확인
- `git reset` - 되돌리기 전 반드시 확인
- `git checkout` - 브랜치 변경이나 파일 복원 전 확인
- `git merge` - 병합 전 충돌 가능성 확인

**자동 실행 금지 명령:**
```bash
# ❌ 절대 자동 실행 금지
git push origin main
git reset --hard
git force push

# ✅ 사용자 확인 후에만 실행
# "사용자님, git push를 실행해도 될까요?"
```

## 🚨 코드 작성 시 필수 체크리스트 (Vercel 빌드 실패 방지)

### ❌ 절대 하지 말아야 할 것들 (빌드 실패 원인)
1. **`any` 타입 사용 절대 금지 - ESLint 에러 발생**
   ```typescript
   // ❌ 잘못됨 - ESLint 에러 발생
   const data: any = {};
   const handleClick = (item: any) => {};
   const items: any[] = [];
   
   // ✅ 올바름 - 구체적인 타입 사용
   const data: Record<string, unknown> = {};
   const handleClick = (item: { id: string; name: string }) => {};
   const items: string[] = [];
   
   // ✅ 타입을 모를 때는 unknown 사용 후 타입 가드
   const data: unknown = fetchData();
   if (typeof data === 'object' && data !== null) {
     // 타입 체크 후 사용
   }
   
   // ✅ 복잡한 타입은 interface나 type 정의
   interface CourseItem {
     id: string;
     title: string;
     price: number;
   }
   const items: CourseItem[] = [];
   ```
   
   **⚠️ 중요**: TypeScript에서 `any` 타입을 사용하면 ESLint가 에러를 발생시킵니다.
   - 항상 구체적인 타입을 정의하세요
   - 타입을 모를 때는 `unknown`을 사용하고 타입 가드로 체크하세요
   - 복잡한 객체는 interface나 type으로 명확히 정의하세요

2. **Storybook import 금지**
   ```typescript
   // ❌ 잘못됨 - 빌드 실패
   import { Meta } from '@storybook/react';
   
   // ✅ Storybook 파일은 별도 관리 또는 제거
   ```

3. **미사용 변수/import 금지**
   ```typescript
   // ❌ 잘못됨
   import { useState, useEffect } from 'react'; // useEffect 미사용
   const [data, setData] = useState(); // data 미사용
   
   // ✅ 올바름
   import { useState } from 'react';
   const [, setData] = useState(); // 미사용 표시
   ```

4. **catch 블록 error 변수**
   ```typescript
   // ❌ 잘못됨
   } catch (error) { // error 미사용
     console.log('Error occurred');
   }
   
   // ✅ 올바름
   } catch { // error 변수 제거
     console.log('Error occurred');
   }
   // 또는
   } catch (error) {
     console.error('Error:', error); // error 사용
   }
   ```

5. **React unescaped entities**
   ```typescript
   // ❌ 잘못됨
   <p>Don't use quotes like "this"</p>
   
   // ✅ 올바름
   <p>Don&apos;t use quotes like &quot;this&quot;</p>
   // 또는
   <p>{`Don't use quotes like "this"`}</p>
   ```

6. **img 태그 대신 Next.js Image 사용**
   ```typescript
   // ❌ 잘못됨
   <img src="/image.jpg" alt="..." />
   
   // ✅ 올바름
   import Image from 'next/image';
   <Image src="/image.jpg" alt="..." width={100} height={100} />
   ```

### ✅ 코드 작성 전 필수 확인 사항

1. **빌드 테스트 먼저 실행**
   ```bash
   npm run build  # 배포 전 반드시 실행
   ```

2. **타입 체크**
   ```bash
   npx tsc --noEmit  # TypeScript 에러 확인
   ```

3. **ESLint 체크**
   ```bash
   npm run lint  # ESLint 에러/경고 확인
   ```

### 📝 개발 시 권장 사항

1. **타입 정의 우선**
   - 모든 함수 파라미터와 리턴 타입 명시
   - interface/type 사전 정의
   - any 대신 unknown 사용 후 타입 가드

2. **import 정리**
   - VS Code의 "Organize Imports" 기능 활용
   - 미사용 import 자동 제거

3. **빌드 전 체크리스트**
   - [ ] `npm run build` 성공 확인
   - [ ] TypeScript 에러 0개
   - [ ] ESLint 에러 0개
   - [ ] 콘솔 에러 없음
   - [ ] 모든 이미지 Next/Image 사용

## Important Notes

1. **Korean Context**: This project is primarily for Korean users. Ensure proper Korean language support and cultural considerations.

2. **Reference Sites**: Always refer to:
   - Structure: https://passive.ai.kr/
   - Design/UX: https://stripe.com/

3. **Performance**: Prioritize fast loading times with SSR/SSG in Next.js

4. **Accessibility**: Ensure WCAG compliance for all interactive elements

5. **Mobile-First**: Design and test for mobile devices as primary platform

## API Integration Points

- Kakao OAuth API for authentication
- Supabase REST API for database operations
- Channel Talk or Kakao Channel for customer support (floating chat button in bottom-right)
- File upload APIs for e-book and audio file management

## Header Navigation Structure

- **Left**: Text logo "디하클"
- **Center**: Navigation links - [툴박스], [자료실], [커뮤니티]
- **Right**: [카카오 로그인] button (changes to '마이페이지' and profile icon after login)
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.