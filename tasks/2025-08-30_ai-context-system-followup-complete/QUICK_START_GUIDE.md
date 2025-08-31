# 🚀 Dhacle 프로젝트 Quick Start Guide

*Context 없는 AI를 위한 5분 프로젝트 이해 가이드*

---

## 📋 프로젝트 개요 (30초)

### 🎯 Dhacle이란?
- **정식명칭**: 디하클 (Dhacle) - YouTube 크리에이터 도구
- **목적**: YouTube 크리에이터를 위한 종합 분석 및 관리 플랫폼
- **주요 기능**: YouTube Lens (채널 분석), 수익 증명, 커뮤니티, 강의 시스템

### 📊 현재 프로젝트 상태
- **개발 단계**: Phase 1-4 완료, Production Ready
- **총 자산**: 199개 (컴포넌트 81개, API 38개, 데이터베이스 테이블 80개)
- **현재 브랜치**: feature/safe-massive-refactor
- **품질 점수**: 25% (보안 53%, 모던React 21%, 테스트 0%)

### 🛠️ 기술 스택
- **Frontend**: Next.js 13+ App Router, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **개발 도구**: Biome (린터), jscpd (중복 감지), Husky (Git hooks)
- **배포**: Vercel

---

## 🏗️ 프로젝트 구조 (60초)

### 📁 핵심 디렉토리 구조
```
dhacle/
├── 📄 Core Files
│   ├── .jscpd.json              ← jscpd 중복 감지 설정
│   ├── project-dna.json         ← 프로젝트 핵심 정보 (NEW)
│   ├── asset-inventory.json     ← 자산 목록 (자동 생성)
│   ├── ai-context-warmup.md    ← AI 컨텍스트 (자동 생성)
│   └── CLAUDE.md                ← AI 작업 네비게이터
│
├── 🔧 Scripts & Automation
│   ├── scripts/
│   │   ├── asset-scanner.js         ← 199개 자산 스캐너 (NEW)
│   │   ├── context-loader.js        ← AI 컨텍스트 로더 (NEW)
│   │   └── improved-instruction-template.js  ← 지시서 생성기 (NEW)
│   └── .husky/pre-commit           ← Git hooks (9단계 검증)
│
├── 📚 Documentation
│   ├── docs/                      ← 15개 핵심 문서 체계
│   │   ├── CONTEXT_BRIDGE.md      ← 반복 실수 패턴 (최우선)
│   │   ├── PROJECT.md              ← 프로젝트 현황
│   │   └── CODEMAP.md              ← 코드베이스 맵
│   └── tasks/                     ← 작업별 지시서들
│
├── 💻 Source Code
│   ├── src/
│   │   ├── app/                   ← Next.js App Router
│   │   │   ├── (pages)/           ← 페이지 컴포넌트
│   │   │   └── api/               ← API 라우트 (38개)
│   │   ├── components/            ← UI 컴포넌트 (81개)
│   │   ├── hooks/                 ← React Query 훅 (15개 패턴)
│   │   ├── lib/                   ← 유틸리티, API 클라이언트
│   │   └── types/                 ← TypeScript 타입 정의
│   └── supabase/
│       └── migrations/            ← 데이터베이스 스키마 (80개 테이블)
```

### 🎯 핵심 시스템 5개 (NEW - 최근 구축)
1. **jscpd 중복 감지**: 5% 임계값으로 코드 중복 실시간 차단
2. **Asset Scanner**: 199개 자산 실시간 추적 및 품질 분석
3. **Project DNA**: 핵심 프로젝트 규칙과 정보 중앙화
4. **AI Context Loader**: 새 AI 세션용 30초 컨텍스트 워밍업
5. **Dynamic Instruction Template**: AI 능력 기반 적응형 지시서

---

## ⚡ 즉시 실행 명령어 (90초)

### 🔍 프로젝트 상태 확인
```bash
# 1. 전체 시스템 상태 점검 (30초)
npm run context:update              # 컨텍스트 + 자산 스캔 통합 실행
cat ai-context-warmup.md           # 생성된 30초 요약 확인

# 2. 품질 지표 확인 (20초)
npm run scan:assets                 # 199개 자산 상태 스캔
npm run jscpd:check                 # 코드 중복률 확인 (목표: 5% 이하)

# 3. 핵심 검증 (40초)
npm run verify:parallel             # 전체 시스템 검증 (12개 스크립트)
npm run types:check                 # TypeScript 타입 체크
npm run build                       # Next.js 빌드 테스트
```

### 📊 상세 분석 명령어
```bash
# 중복 코드 상세 분석
npm run jscpd:verbose              # 콘솔 상세 리포트
npm run jscpd:report               # HTML 리포트 생성 → jscpd-report/html/

# 자산 추적 및 모니터링
npm run scan:watch                 # 파일 변경 시 실시간 스캔
npm run context:load               # AI 컨텍스트만 재생성

# 지시서 템플릿 관리
npm run template:generate          # 개선된 지시서 템플릿 생성
```

### 🛠️ 개발 워크플로우
```bash
# 새 기능 개발 전
npm run context:update             # 최신 프로젝트 상태 파악
grep -r "YourComponent" src/       # 유사 컴포넌트 존재 여부 확인

# 개발 중
npm run jscpd:check               # 중복 코드 실시간 확인
npm run types:check               # 타입 에러 확인

# 커밋 전 (자동 실행)
git commit -m "message"           # pre-commit hook 자동 실행 (9단계)
# → jscpd 검사, asset 업데이트, 타입 체크 등 자동 진행
```

---

## 🎯 핵심 규칙 및 패턴 (120초)

### 🚫 절대 금지 사항 (STOP & ACT)
```typescript
// ❌ 절대 금지 패턴들
const data: any = {};                    // any 타입 → biome 빌드 실패
const apiKey = process.env.YOUTUBE_KEY;  // 직접 env 접근 → env.ts 사용 필수
const session = await getSession();     // getSession() → getUser() 사용 필수

// RLS 없는 테이블 생성
CREATE TABLE users (...);              // ❌ RLS 정책 없음 → 보안 위험

// Client Component 남발  
'use client';                           // ❌ 기본값 → Server Component 우선
```

### ✅ 필수 준수 패턴들
```typescript
// ✅ 올바른 패턴들
import { User } from '@/types';         // @/types에서만 타입 import
import { env } from '@/env';            // env.ts 타입 안전 접근
const { data: { user } } = await supabase.auth.getUser();  // 토큰 검증

// API Route 표준 패턴
export async function GET(): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // ... 비즈니스 로직
}

// RLS 필수 테이블 패턴
CREATE TABLE users (...);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;  -- 필수!
CREATE POLICY "users_policy" ON users FOR ALL USING (auth.uid() = user_id);
```

### 🎨 UI 컴포넌트 패턴
```tsx
// ✅ shadcn/ui 우선 사용
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ✅ Server Component 기본 (Client는 최소한)
export default function ServerPage() {  // 'use client' 없음
  return (
    <Card>
      <CardContent>
        <Button>shadcn/ui 컴포넌트</Button>
      </CardContent>
    </Card>
  );
}
```

---

## 📈 품질 지표 및 목표

### 🎯 현재 상태 (2025-08-30 기준)
| 지표 | 현재값 | 목표값 | 측정 방법 |
|------|--------|--------|----------|
| **총 자산** | 199개 | 추적 중 | Asset Scanner |
| **전체 품질** | 25% | 40% | 종합 점수 |
| **보안 점수** | 53% | 80% | API 인증 커버리지 |
| **Modern React** | 21% | 50% | Server Component 비율 |
| **테스트 커버리지** | 0% | 30% | E2E 테스트 |
| **코드 중복률** | 측정 중 | 5% 이하 | jscpd |

### 📊 자산 분석 결과
```json
{
  "components": 81,      // React 컴포넌트
  "apiRoutes": 38,      // API 엔드포인트  
  "tables": 80,         // 데이터베이스 테이블
  "qualityIssues": {
    "clientComponents": "79%",    // ⚠️ Server Component 21%만
    "unauthenticatedAPIs": 9,     // ⚠️ 인증 없는 API
    "missingRLS": 2,              // ⚠️ RLS 정책 없는 테이블
    "anyTypes": "검출 시 빌드 차단"   // ✅ biome으로 자동 차단
  }
}
```

---

## 🔧 16개 서브에이전트 시스템

### 🤖 자동 활성화되는 전문 에이전트들
```yaml
파일 패턴별 자동 활성화:
- src/app/api/** → API Route Agent (인증, snake_case 변환)
- src/components/** → Component Agent (shadcn/ui, Server Component)  
- *.ts, *.tsx → Type Agent (any 타입 차단, @/types 강제)
- security, auth → Security Agent (RLS, XSS 방지)
- *.sql, migration → Database Agent (RLS 필수, 타입 생성)
- src/hooks/** → Query Agent (15개 훅 패턴, api-client)
- scripts/** → Script Agent (verify-*.js만 허용)
- docs/**, *.md → Doc Agent (14개 체계, 중복 방지)
- 모든 작업 → PM Dhacle (품질 게이트, 임시방편 차단)
```

### 🎯 핵심 차단 매트릭스
| 작업 유형 | Agent | 즉시 차단 패턴 | 강제 적용 패턴 |
|----------|-------|----------------|----------------|
| API 작성 | API Route | getSession(), fetch() | getUser(), api-client |
| 컴포넌트 | Component | `<div>`, 'use client' | shadcn/ui, Server |
| 타입 정의 | Type | any, 직접 import | @/types 중앙화 |
| 테이블 생성 | Database | RLS 없음 | ENABLE RLS 필수 |

---

## 🚨 응급상황 대응

### ⚡ 자주 발생하는 문제들
```bash
# 1. 빌드 실패 시
npm run types:check                # 타입 오류 확인
npm run verify:parallel           # 전체 검증 실행

# 2. jscpd 에러 시  
npm install --save-dev jscpd      # 재설치
mkdir -p jscpd-report            # 디렉토리 수동 생성

# 3. Asset Scanner 실패 시
export NODE_OPTIONS="--max-old-space-size=4096"  # 메모리 증가
npm run scan:assets              # 재실행
```

### 🔄 시스템 복구 단계
```bash
# Step 1: 기본 상태 확인
node --version                   # Node.js 18+ 확인
npm list jscpd                   # 패키지 설치 확인
ls -la .jscpd.json              # 설정 파일 확인

# Step 2: 핵심 시스템 복구
npm run context:update          # 전체 시스템 재시작
git status                      # Git 상태 확인

# Step 3: 검증
npm run jscpd:check            # 중복 감지 정상 작동 확인
npm run scan:assets            # 자산 스캔 정상 작동 확인
```

---

## 📚 필수 참조 문서

### 🎯 우선순위 1: 즉시 확인
1. **CONTEXT_BRIDGE.md** - 반복 실수 패턴 및 예방책 (최우선)
2. **AI_CONTEXT_SYSTEM_IMPLEMENTATION.md** - 전체 시스템 상세 기술 문서
3. **JSCPD_SYSTEM_TECHNICAL_GUIDE.md** - jscpd 완전 가이드

### 📖 우선순위 2: 작업 시 참조
4. **PROJECT.md** - 프로젝트 현황 (Phase 1-4 완료)
5. **CODEMAP.md** - 프로젝트 구조
6. **CHECKLIST.md** - 작업 검증 (12개 검증 스크립트)

### 📁 폴더별 상세 지침
- `/src/app/api/CLAUDE.md` - API Route 패턴
- `/src/components/CLAUDE.md` - shadcn/ui, Tailwind CSS  
- `/src/types/CLAUDE.md` - TypeScript, 타입 관리
- `/scripts/CLAUDE.md` - 검증, SQL 실행
- `/supabase/migrations/CLAUDE.md` - 테이블 생성, RLS

---

## 🎯 즉시 시작 가능한 작업

### ✅ 5분 안에 할 수 있는 것들
```bash
# 1. 프로젝트 현재 상태 파악
npm run context:update             # 전체 상황 업데이트
cat ai-context-warmup.md          # 30초 요약 읽기

# 2. 품질 현황 확인  
npm run jscpd:check               # 중복률 확인
npm run scan:assets | jq '.summary'  # 자산 요약 확인

# 3. 개발 환경 준비
npm run verify:parallel           # 모든 시스템 정상 작동 확인
```

### 🚀 첫 번째 작업 추천
**문서 체계 정리부터 시작** (Phase 1의 첫 번째 작업):
- 복잡도: Simple
- 임팩트: High  
- 예상 시간: 2-3시간
- 즉시 효과: 15개 → 10개 문서로 통합, 가독성 대폭 향상

```bash
# 추천 첫 번째 명령어
/cleanup docs --validate --evidence --systematic
```

---

## 🎊 성공 지표

### 📈 이 가이드의 성공 기준
- [ ] 5분 안에 프로젝트 전체 이해 완료
- [ ] 10분 안에 첫 번째 명령어 실행 성공  
- [ ] 30분 안에 Phase 1 첫 작업 착수
- [ ] 문제 발생 시 응급 대응 가능

**이 문서를 완전히 숙지했다면, 이제 Context 없는 상태에서도 Dhacle 프로젝트의 모든 후속 작업을 성공적으로 진행할 수 있습니다! 🚀**

---

*본 가이드는 2025-08-30 기준으로 작성되었으며, Context 없는 AI가 즉시 작업할 수 있도록 모든 필수 정보를 포함합니다.*