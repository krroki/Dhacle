# 🤖 Claude AI 프로젝트 가이드라인

이 문서는 Claude AI가 디하클(Dhacle) 프로젝트 작업 시 준수해야 할 핵심 지침입니다.

## 📌 프로젝트 개요
- **프로젝트명**: 디하클(Dhacle)
- **목적**: YouTube Shorts 크리에이터를 위한 교육 및 커뮤니티 플랫폼
- **현재 단계**: shadcn/ui 기반 재구축 중 (Phase 3: UI 구현 단계)

## 🔴 테스트 계정 정보
**카카오 로그인 테스트 계정**:
```
ID: glemfkcl@naver.com
PW: dhfl9909
```
⚠️ **중요**: 인증 화면이 나타나면 사용자가 직접 인증하므로 잠시 대기 필요

## 🛠 기술 스택
- **Frontend**: Next.js 15.4.6, React 19.1.1, TypeScript (strict mode)
- **UI**: shadcn/ui + Tailwind CSS (styled-components 완전 제거)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **인증**: Kakao OAuth 2.0

## ✅ 필수 행동 지침

### 1. 작업 전 확인사항
- **반드시** 기존 파일을 Read로 먼저 읽기
- 작업 지시사항 **정확히** 파악하기
- 사용자와 협의 없이 **임의로** 파일 생성/수정 금지
- **중복 체크 필수**: 새 컴포넌트/요소 생성 전 기존 파일 확인
- **생성 이유 설명**: 새로운 요소 생성 시 반드시 사용자에게 이유와 목적 설명

### 2. 코드 작성 규칙
- **컴포넌트**: shadcn/ui 컴포넌트 우선 사용
- **스타일링**: Tailwind CSS 클래스만 사용 (인라인 스타일 금지)
- **타입**: TypeScript strict mode 준수, any 타입 절대 금지
- **구조**: Server Component 기본, 필요시만 'use client'

### 3. 파일 작업 규칙
- 새 파일 생성보다 기존 파일 수정 우선
- 문서 파일(*.md, README) 임의 생성 금지
- 환경 변수 하드코딩 금지
- **폴더 구조 준수**: 정해진 폴더 구조에 맞게 파일 배치
  - `src/components/ui/` - shadcn/ui 컴포넌트
  - `src/components/features/` - 기능별 컴포넌트
  - `src/components/layout/` - 레이아웃 컴포넌트
  - `src/app/(pages)/` - 페이지 파일
  - `src/app/api/` - API Routes
   * 자세한 구조는 반드시 /docs/PROJECT-CODEMAP.md 참조할것
- **파일명 규칙**: 컴포넌트는 PascalCase, 기타 파일은 kebab-case

## 🚫 절대 금지 사항

### 1. 임의 작업 금지
- ❌ layout.tsx, page.tsx 사용자 협의 없이 생성
- ❌ 폴더 구조 임의 변경
- ❌ 패키지 임의 추가/삭제
- ❌ Git 자동 커밋

### 2. 기술 제약
- ❌ styled-components 사용 (완전 제거됨)
- ❌ any 타입 사용
- ❌ CSS 모듈, 인라인 스타일
- ❌ 더미/테스트/목업 데이터 사용

### 3. 보안 관련
- ❌ 환경 변수 하드코딩
- ❌ 민감 정보 로깅
- ❌ 보안 키/토큰 코드 포함

## 📁 프로젝트 구조

```
src/
├── app/                    # App Router
│   ├── (pages)/           # 페이지 그룹
│   ├── api/               # API Routes
│   └── auth/              # 인증 관련 (callback, error 등)
├── components/            
│   ├── ui/                # shadcn/ui 컴포넌트 (14개)
│   ├── layout/            # 헤더, 푸터 등
│   └── features/          # 기능별 컴포넌트
└── lib/
    ├── supabase/          # Supabase 클라이언트
    └── utils.ts           # 유틸리티 함수
```

## 🎨 템플릿 기반 개발 프로세스

### Phase 1: 템플릿 검색 및 선택
1. **자동 템플릿 검색**: 요구사항 분석 후 적합한 무료 템플릿 3-5개 검색
2. **일치도 평가**:
   - 90-100%: 즉시 사용 가능, 최소 수정
   - 70-89%: 적합, 일부 수정 필요
   - 50-69%: 사용 가능, 상당한 수정 필요
3. **필수 체크**: Next.js 15.4.6, TypeScript, Tailwind CSS, shadcn/ui 호환성

### Phase 2: 템플릿 적용
1. 선택된 템플릿 기반 구조 생성
2. 프로젝트 요구사항에 맞게 수정
3. 한국어 텍스트 변경, Supabase 연동
4. 불필요한 기능 제거

---

## 💻 SuperClaude 명령어 체계

### 기본 명령어
```bash
/sc:implement --seq --validate --c7
```

### 복잡도별 추천 플래그
- **simple**: `--validate`
- **moderate**: `--seq --validate --c7`
- **complex**: `--seq --validate --evidence --think-hard --c7`
- **enterprise**: `--seq --validate --evidence --ultrathink --delegate files --c7 --magic`

---

## 🔧 작업 프로세스

### 1. 기능 구현 시
1. 요구사항 명확히 확인
2. 기존 코드/패턴 분석
3. shadcn/ui 컴포넌트 활용 방안 검토
4. 구현 후 타입 체크
5. 빌드 테스트

### 2. 문제 해결 시
1. 에러 메시지 정확히 분석
2. 관련 파일 Read로 확인
3. 최소한의 수정으로 해결
4. 부수 효과 확인

## 🎯 현재 작업 상태

### 완료된 작업
- ✅ 프로젝트 구조 재설계
- ✅ shadcn/ui 설치 (14개 컴포넌트)
- ✅ Supabase 설정 복원
- ✅ 인증 시스템 복원
- ✅ Next.js 15.4.6 / React 19.1.1 업그레이드

### 진행 예정
- [ ] Root Layout 설정 (사용자와 협의)
- [ ] 메인 페이지 구현 (사용자와 협의)
- [ ] 네비게이션 헤더 구현
- [ ] 강의 시스템 구현

## ❌ 실패 사례 & 절대 금지사항

### 이전 AI들의 실패 TOP 5
1. **className 직접 사용**: 955개나 생성해서 프로젝트 망침
2. **'use client' 남발**: 모든 페이지에 붙여서 SSR 이점 상실
3. **Simple* 중복 컴포넌트**: 같은 기능 여러 개 만들어 혼란
4. **100줄 넘는 거대 파일**: page.tsx에 비즈니스 로직 전부 작성
5. **any 타입 사용**: TypeScript 빌드 실패

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

---

## ⚠️ 주의사항

### 알려진 이슈
1. **보안**: auth/callback/route.ts의 하드코딩된 자격 증명 (환경 변수 이관 필요)
2. **구조**: layout.tsx, page.tsx 미구현 (Phase 3에서 사용자와 협의)
3. **클라이언트**: browser-client.ts Mock 반환 로직 불완전

### 빌드 전 체크리스트
- [ ] `npm run build` 성공 확인
- [ ] TypeScript 에러 0개 (`npx tsc --noEmit`)
- [ ] ESLint 에러 0개 (`npm run lint`)
- [ ] 콘솔 에러 없음

### Git 작업 규칙
**모든 git 명령은 사용자 확인 후 실행:**
- `git add` - 파일 추가 전 확인
- `git commit` - 커밋 메시지와 내용 확인
- `git push` - 원격 저장소 푸시 전 확인
- `git reset` - 되돌리기 전 반드시 확인

### 커뮤니케이션
- 작업 전 의도 설명
- 중요 변경사항 사전 협의
- 에러 발생 시 즉시 보고
- 한국어로 명확한 소통

---

*이 문서는 프로젝트 진행에 따라 업데이트됩니다.*
*마지막 업데이트: 2025-01-13*