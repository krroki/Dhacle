# 🚀 Claude Code 개발 완수 가이드 - 비개발자용

## 📌 시작하기 전에

### 프로젝트 개요
- **프로젝트명**: 유튜브 수익화 교육 플랫폼
- **주요 문서**: 
  - `docs/site-architecture-plan.md` - 사이트 구조 설계서
  - `docs/component-visual-diagram.md` - UI 컴포넌트 상세 명세
- **기술 스택**: Next.js, TypeScript, Tailwind CSS, Supabase

### Claude Code 사용 팁
1. 각 명령은 **복사-붙여넣기**로 정확히 입력
2. 한 번에 하나의 작업만 지시
3. 결과 확인 후 다음 단계 진행
4. 오류 발생시 "이전 작업을 되돌려주세요" 요청

## 🚨 빌드 실패 방지 체크리스트 (코드 작성 전 필독!)

### 반드시 피해야 할 코드 패턴
```typescript
// ❌ 이런 코드는 Vercel 빌드 실패!
1. any 타입: const data: any = {}
2. 미사용 변수: const [data, setData] = useState() // data 미사용
3. 미사용 import: import { useEffect } from 'react' // 사용 안함
4. img 태그: <img src="/photo.jpg" />
5. Storybook import: import { Meta } from '@storybook/react'
6. catch error 미사용: } catch (error) { console.log('fail') }

// ✅ 올바른 코드 패턴
1. 정확한 타입: const data: UserData = {}
2. 미사용 표시: const [, setData] = useState()
3. 필요한 것만: import { useState } from 'react'
4. Next Image: <Image src="/photo.jpg" alt="" width={100} height={100} />
5. Storybook 제거: 별도 폴더 또는 삭제
6. error 제거: } catch { console.log('fail') }
```

### 코드 작성 후 필수 실행
```bash
# 반드시 이 순서대로!
1. npx tsc --noEmit  # TypeScript 에러 체크
2. npm run lint      # ESLint 에러 체크
3. npm run build     # 빌드 테스트 (가장 중요!)
```

---

## 📋 전체 개발 로드맵

```
Phase 1: 기초 설정 (1-2일)
├── 환경 설정
├── 데이터베이스 연결
└── 인증 시스템

Phase 2: 메인 페이지 (2-3일)
├── 레이아웃 구성
├── Hero 섹션
├── 수익인증 슬라이더
└── 강의 카드

Phase 3: 핵심 기능 (3-4일)
├── 강의 시스템
├── 도구 페이지
├── 커뮤니티
└── 랭킹 시스템

Phase 4: 마무리 (1-2일)
├── 마이페이지
├── 관리자 페이지
└── 최종 테스트
```

---

## 🛠️ Phase 1: 기초 설정

### Step 1-1: 프로젝트 초기화 및 환경 설정

**작업 설명**: 프로젝트 기본 구조를 설정하고 필요한 패키지를 설치합니다.

**Claude Code 명령어**:
```
/sc:implement --sequential --c7

프로젝트 초기 설정이 필요합니다. 다음 작업을 수행해주세요:

1. package.json 확인 후 필요한 패키지 추가 설치:
   - framer-motion (애니메이션)
   - @supabase/supabase-js (✅ 이미 설치됨)
   - react-hook-form (폼 관리)
   - recharts (차트)
   - date-fns (날짜 처리)
   
2. 프로젝트 폴더 구조 생성:
   - src/components/layout (레이아웃 컴포넌트)
   - src/components/sections (페이지 섹션)
   - src/components/features (기능 컴포넌트)
   - src/lib/supabase (✅ 이미 생성됨 - browser-client.ts 존재)
   - src/hooks (커스텀 훅)
   - src/types (TypeScript 타입)
   - public/images (이미지 자산)

3. 환경 변수 파일(.env.local) 템플릿 생성:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - KAKAO_CLIENT_ID
   - KAKAO_CLIENT_SECRET

npm install 명령으로 패키지를 설치하고, 폴더 구조를 생성해주세요.
```

### Step 1-2: Supabase 데이터베이스 설정

**✅ 부분 완료**: Supabase 클라이언트는 이미 구현되어 있습니다.
- `src/lib/supabase/browser-client.ts` 파일 존재
- Mock 클라이언트로 개발 가능
- **필요한 작업**: .env.local 파일에 환경 변수만 추가하면 됩니다.

**Claude Code 명령어**:
```
/sc:implement --sequential

Supabase 데이터베이스 테이블 스키마만 생성하면 됩니다.
(클라이언트는 이미 구현됨)

2. src/lib/supabase/schema.sql 파일 생성:
   - users 테이블 (사용자 정보)
   - courses 테이블 (강의 정보)
   - revenue_certifications 테이블 (수익인증)
   - rankings 테이블 (랭킹)
   - communities 테이블 (커뮤니티 게시글)

3. src/types/database.ts 파일 생성:
   - 데이터베이스 타입 정의
   - Supabase 자동 생성 타입 통합

docs/site-architecture-plan.md의 데이터베이스 스키마 섹션을 참고하여 구현해주세요.
```

### Step 1-3: 카카오 인증 시스템 구현

**✅ 완료**: 카카오 로그인 기능이 이미 완전히 구현되어 있습니다!

**이미 구현된 내용**:
- ✅ `src/app/auth/callback/route.ts` - Auth callback 라우트 구현됨
- ✅ `src/components/layout/Header.tsx` - Kakao 로그인 버튼 구현됨
- ✅ Supabase Auth와 Kakao OAuth 연동 완료
- ✅ 로그인/로그아웃 기능 작동

**필요한 설정**:
```
.env.local 파일에 아래 환경 변수만 추가:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

Supabase Dashboard에서 Kakao Provider 활성화:
1. Authentication → Providers → Kakao 활성화
2. Client ID와 Secret 입력
```

---

## 🏠 Phase 2: 메인 페이지 구현

### Step 2-1: 메인 페이지 기본 구조

**작업 설명**: 메인 페이지의 전체 레이아웃을 구성합니다.

**Claude Code 명령어**:
```
/sc:build --sequential --magic

src/app/page.tsx를 전면 수정해주세요.

docs/site-architecture-plan.md와 docs/component-visual-diagram.md를 참고하여 
메인 페이지를 다음 구조로 구현해주세요:

1. NavigationBar 컴포넌트
2. HeroSection 컴포넌트 
3. RevenueSlider 컴포넌트
4. FeaturedCourses 컴포넌트
5. SuccessStories 컴포넌트
6. ToolsPreview 컴포넌트
7. CommunityFeed 컴포넌트
8. Footer 컴포넌트

각 섹션은 별도 컴포넌트로 분리하고, 
모바일 반응형 디자인을 적용해주세요.
Tailwind CSS와 Framer Motion을 활용한 애니메이션을 추가해주세요.
```

### Step 2-2: Hero 섹션 구현

**작업 설명**: 방문자의 첫인상을 결정하는 Hero 섹션을 구현합니다.

**Claude Code 명령어**:
```
/sc:implement --magic --sequential

src/components/sections/HeroSection.tsx를 생성해주세요.

docs/component-visual-diagram.md의 Hero Section 명세를 참고하여:

1. 동적 타이틀: "유튜브로 월 1000만원, 우리가 증명합니다"
2. 실시간 수강생 수 카운터 애니메이션
3. CTA 버튼 2개:
   - "무료 체험 시작하기" (그라데이션 배경)
   - "성공 사례 보기" (아웃라인 스타일)
4. 배경: 수익 인증 모자이크 이미지 또는 비디오
5. 스크롤 유도 애니메이션 (아래 화살표 바운스)

Framer Motion으로 다음 애니메이션 구현:
- 텍스트 페이드인 (0.8초)
- 카운터 숫자 증가 (2초)
- CTA 버튼 슬라이드업 (1초)

색상은 다음을 사용:
- Primary: #635BFF
- Dark: #0A2540
- Light: #00D4FF
```

### Step 2-3: 실시간 수익인증 슬라이더

**작업 설명**: 수강생들의 수익인증을 보여주는 슬라이더를 구현합니다.

**Claude Code 명령어**:
```
/sc:implement --sequential

src/components/sections/RevenueSlider.tsx를 생성해주세요.

기능 요구사항:
1. 최근 24시간 수익인증 데이터 표시
2. 자동 슬라이드 (5초 간격)
3. 호버시 일시정지
4. 좌우 네비게이션 버튼

각 카드에 포함할 정보:
- 사용자 이름 (일부 마스킹: 김*훈)
- 수익 금액 (포맷팅: ₩1,234,000)
- 인증 날짜
- 수강한 강의 목록
- 인증 스크린샷 썸네일
- "자세히 보기" 버튼

Supabase에서 revenue_certifications 테이블 데이터를 
실시간으로 가져와 표시하도록 구현해주세요.
Mock 데이터로 먼저 UI를 완성한 후 실제 데이터 연동해주세요.
```

### Step 2-4: 강의 카드 그리드

**작업 설명**: 주력 강의를 보여주는 카드 컴포넌트를 구현합니다.

**Claude Code 명령어**:
```
/sc:implement --magic

src/components/features/CourseCard.tsx를 생성해주세요.

docs/component-visual-diagram.md의 CourseCard 명세 참고:

카드 구성 요소:
1. 썸네일 이미지 (16:9 비율)
2. 강의 제목
3. 강사 이름
4. 평점 (별 5개, 소수점 1자리)
5. 수강생 수
6. 가격 (할인가/정가 표시)
7. 배지 (NEW/BEST/HOT)

호버 효과:
- 카드 상승 (translateY(-8px))
- 그림자 증가
- 썸네일 확대 (scale(1.05))

src/components/sections/FeaturedCourses.tsx 생성:
- CourseCard 3개를 그리드로 배치
- "이번 주 HOT 강의 🔥" 제목
- 모바일: 1열, 태블릿: 2열, 데스크톱: 3열
```

---

## 💡 Phase 3: 핵심 기능 구현

### Step 3-1: 강의 목록 페이지

**작업 설명**: 전체 강의를 보여주는 페이지를 구현합니다.

**Claude Code 명령어**:
```
/sc:build --sequential --c7

src/app/courses/page.tsx를 생성해주세요.

페이지 구성:
1. 왼쪽: 필터 사이드바
   - 카테고리 체크박스
   - 가격 범위 슬라이더
   - 난이도 선택
   - 평점 필터
   
2. 오른쪽: 강의 카드 그리드
   - CourseCard 컴포넌트 재사용
   - 무한 스크롤 구현
   - 로딩시 스켈레톤 UI
   
3. 상단: 정렬 옵션
   - 인기순/최신순/가격순/평점순

Supabase courses 테이블과 연동하여 
실제 데이터를 표시하도록 구현해주세요.
필터링과 정렬은 서버사이드에서 처리해주세요.
```

### Step 3-2: 강의 상세 페이지

**작업 설명**: 개별 강의의 상세 정보를 보여주는 페이지를 구현합니다.

**Claude Code 명령어**:
```
/sc:implement --sequential

src/app/courses/[id]/page.tsx를 생성해주세요.

페이지 구성:
1. 상단: 비디오 플레이어 (YouTube 임베드)
2. 강의 정보:
   - 제목, 설명
   - 강사 프로필
   - 커리큘럼 (아코디언)
   - 수강평
   
3. 사이드바 (스티키):
   - 가격 정보
   - "수강신청" 버튼
   - 강의 특징
   - 환불 정책
   
4. 하단:
   - FAQ 섹션
   - 추천 강의

Dynamic Route를 사용하여 
강의 ID별로 데이터를 가져오도록 구현해주세요.
```

### Step 3-3: TTS 커터 도구

**작업 설명**: 유튜브 제작에 필요한 TTS 커터 도구를 구현합니다.

**Claude Code 명령어**:
```
/sc:implement --sequential --c7

src/app/tools/tts-cutter/page.tsx를 생성해주세요.

기능 구현:
1. 오디오 파일 업로드 (드래그 앤 드롭)
2. 파형(Waveform) 시각화
3. 구간 선택 UI (시작점/끝점)
4. TTS 텍스트 입력
5. 음성 선택 (한국어 남/여)
6. 미리듣기 기능
7. 다운로드 기능

필요한 라이브러리:
- wavesurfer.js (파형 시각화)
- react-dropzone (파일 업로드)

백엔드 API 필요:
- /api/tools/tts-generate
- /api/tools/audio-process

docs/component-visual-diagram.md의 
TTS 커터 컴포넌트 명세를 참고해주세요.
```

### Step 3-4: 수익인증 시스템

**작업 설명**: 수익인증 작성 및 표시 시스템을 구현합니다.

**Claude Code 명령어**:
```
/sc:implement --sequential

다음 파일들을 생성해주세요:

1. src/app/community/revenue/page.tsx
   - 수익인증 갤러리 페이지
   - 그리드/리스트 뷰 전환
   - 필터 (기간별/강의별)

2. src/components/features/RevenueForm.tsx
   - 수익인증 작성 폼
   - 이미지 업로드
   - 강의 선택 (복수선택)
   - 금액 입력
   
3. src/components/features/RevenueCard.tsx
   - 수익인증 카드 컴포넌트
   - 좋아요/댓글 기능
   - 공유 기능

4. src/app/api/revenue/route.ts
   - 수익인증 CRUD API
   - 이미지 업로드 처리
   - 자동 검증 (OCR)

Supabase Storage를 사용하여 
이미지를 저장하도록 구현해주세요.
```

### Step 3-5: 랭킹 시스템

**작업 설명**: 수익 랭킹 대시보드를 구현합니다.

**Claude Code 명령어**:
```
/sc:implement --sequential --c7

src/app/ranking/page.tsx를 생성해주세요.

구성 요소:
1. 기간 선택 탭 (주간/월간/연간)
2. Top 10 리더보드
   - 순위, 프로필, 이름, 수익, 변동
   - 금/은/동 메달 아이콘
   
3. 내 순위 표시 (하이라이트)
4. 수익 추이 차트 (recharts 사용)
5. 배지 시스템:
   - 👑 수익왕 (1위 3회)
   - 🔥 핫 크리에이터 (급상승)
   - 💎 다이아몬드 (월 1000만원)

Supabase에서 rankings 테이블 데이터를 
집계하여 표시하도록 구현해주세요.
실시간 업데이트를 위해 Supabase Realtime을 활용해주세요.
```

---

## 🔧 Phase 4: 마무리 작업

### Step 4-1: 마이페이지

**작업 설명**: 사용자 개인 페이지를 구현합니다.

**Claude Code 명령어**:
```
/sc:implement --sequential

src/app/mypage/page.tsx와 하위 페이지들을 생성해주세요:

1. /mypage/profile - 프로필 수정
2. /mypage/courses - 내 수강 강의
3. /mypage/revenue - 내 수익인증 관리
4. /mypage/settings - 설정

각 페이지 구현:
- 탭 네비게이션
- 폼 유효성 검사 (react-hook-form)
- 성공/실패 토스트 메시지
- 로딩 상태 처리

인증된 사용자만 접근 가능하도록 
미들웨어에서 보호해주세요.
```

### Step 4-2: 관리자 대시보드

**작업 설명**: 관리자용 대시보드를 구현합니다.

**Claude Code 명령어**:
```
/sc:implement --sequential

src/app/admin/page.tsx를 생성해주세요.

관리자 기능:
1. 통계 대시보드
   - 가입자 수, 매출, 수익인증 수
   - 차트와 그래프
   
2. 회원 관리 (/admin/users)
   - 회원 목록, 검색, 필터
   - 권한 변경
   
3. 강의 관리 (/admin/courses)
   - 강의 등록/수정/삭제
   - 공개/비공개 설정
   
4. 수익인증 관리 (/admin/revenue)
   - 검증 대기 목록
   - 승인/거절 처리

role이 'admin'인 사용자만 접근 가능하도록 구현해주세요.
```

### Step 4-3: 최종 테스트 및 최적화

**작업 설명**: 전체 사이트를 테스트하고 최적화합니다.

**Claude Code 명령어**:
```
/sc:analyze --focus performance --sequential

전체 프로젝트를 분석하고 최적화해주세요:

1. 성능 최적화:
   - 이미지 최적화 (next/image)
   - 번들 크기 최소화
   - 코드 스플리팅
   
2. SEO 최적화:
   - 메타 태그 추가
   - sitemap.xml 생성
   - robots.txt 설정
   
3. 보안 점검:
   - API 엔드포인트 보호
   - SQL 인젝션 방지
   - XSS 방지
   
4. 반응형 테스트:
   - 모바일 (375px)
   - 태블릿 (768px)
   - 데스크톱 (1440px)
   
5. 브라우저 호환성:
   - Chrome, Safari, Firefox
   - Edge 테스트

문제점을 발견하면 자동으로 수정해주세요.
```

---

## 🚀 배포 준비

### Step 5-1: 환경 변수 설정

**작업 설명**: 프로덕션 환경 변수를 설정합니다.

**Claude Code 명령어**:
```
/sc:implement

.env.production 파일을 생성하고 
배포에 필요한 환경 변수 템플릿을 작성해주세요.

Vercel 배포를 위한 설정:
1. vercel.json 파일 생성
2. 환경 변수 목록 문서화
3. 빌드 최적화 설정

README.md 파일 업데이트:
- 프로젝트 설명
- 설치 방법
- 환경 변수 설정 가이드
- 배포 방법
```

### Step 5-2: 배포

**작업 설명**: Vercel에 배포합니다.

**Claude Code 명령어**:
```
/sc:implement --sequential

Vercel 배포를 위한 최종 준비를 해주세요:

1. 빌드 테스트:
   - npm run build 실행
   - 에러 수정

2. 타입 체크:
   - npm run type-check
   - TypeScript 에러 수정

3. 린트 체크:
   - npm run lint
   - ESLint 에러 수정

4. 배포 체크리스트 문서 생성:
   - docs/deployment-checklist.md
   - 환경 변수 확인 사항
   - 데이터베이스 마이그레이션
   - DNS 설정
```

---

## 📌 자주 사용하는 명령어 모음

### 문제 해결
```
# 이전 작업 되돌리기
"이전 작업을 되돌려주세요"

# 에러 수정
"다음 에러를 수정해주세요: [에러 메시지]"

# 파일 확인
"[파일명]의 내용을 보여주세요"
```

### 기능 추가
```
# 컴포넌트 생성
"/sc:implement src/components/[컴포넌트명].tsx를 생성해주세요. [기능 설명]"

# API 엔드포인트 생성
"/sc:implement src/app/api/[경로]/route.ts를 생성해주세요. [API 설명]"

# 페이지 생성
"/sc:build src/app/[경로]/page.tsx를 생성해주세요. [페이지 설명]"
```

### 스타일링
```
# Tailwind 클래스 추가
"[컴포넌트]에 다음 스타일을 추가해주세요: [스타일 설명]"

# 애니메이션 추가
"Framer Motion으로 [애니메이션 설명]을 구현해주세요"

# 반응형 디자인
"모바일/태블릿/데스크톱 반응형 디자인을 적용해주세요"
```

---

## ⚠️ 주의사항

1. **한 번에 하나씩**: 각 Step을 완료한 후 다음으로 진행
2. **백업**: 중요한 변경 전 파일 백업
3. **테스트**: 각 기능 구현 후 브라우저에서 테스트
4. **문서 참조**: docs 폴더의 문서를 항상 참고
5. **순서 준수**: Phase 순서대로 진행

---

## 🆘 도움이 필요할 때

문제가 발생하면 다음 정보와 함께 질문하세요:
1. 현재 진행 중인 Step 번호
2. 에러 메시지 (있다면)
3. 시도한 명령어
4. 브라우저 콘솔 에러 (있다면)

예시:
```
"Step 2-3을 진행 중인데 다음 에러가 발생했습니다:
[에러 메시지]
사용한 명령어: [명령어]
어떻게 해결하나요?"
```

---

*이 가이드는 새로운 Claude Code 세션에서도 그대로 사용할 수 있습니다.*
*각 명령어는 필요한 모든 컨텍스트를 포함하고 있습니다.*