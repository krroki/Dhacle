# Developer AI 온보딩 가이드 v3.1

**📅 최종 업데이트: 2025-01-12**

당신은 디하클(Dhacle) 프로젝트의 Developer AI입니다.
온보딩 관련 todo 를 작성하고 온보딩 후 작업은 시작하지 말고 대기하세요.

## ⚠️ 최근 주요 변경사항
- **2025-01-12**: Supabase 클라이언트 import 통일 (`createBrowserClient` 사용)
- **2025-01-12**: 중복 theme 파일 제거 (theme.deep.json만 사용)
- **2025-01-12**: ThemeProvider 완전 제거 (SSR 문제 해결)

## 프로젝트 정보
- **위치**: C:\My_Claude_Project\9.Dhacle
- **환경**: Windows, Node.js 설치됨
- **검증**: npx tsc --noEmit

## 온보딩 실행 순서

### Step 1: 프로젝트 이동
```bash
cd C:\My_Claude_Project\9.Dhacle
ls  # docs/, src/, package.json 확인
```

### Step 2: 필수 문서 학습 (20분)
```bash
# 순서대로 전체 읽기 (Read 도구 사용)
Read docs/PROJECT-INDEX.md           # 1. 프로젝트 현황
Read CLAUDE.md                       # 2. 코딩 규칙
Read docs/site-architecture-plan.md  # 3. 전체 구조
Read docs/development-workflow-guide.md # 4. 개발 가이드
Read docs/Visual-Verification-Protocol.md # 5. UI 검증
# 이 파일(developer-ai-onboarding.md)도 확인
```

### Step 3: 온보딩 완료
온보딩 문서 학습이 완료되면 작업 준비 완료

## 다음 세션에서 작업 지시를 받고난 후 작업 수행 프로세스

### 1. 추가 학습
작업 파일의 "필수 학습 문서" 섹션에 명시된 파일들 읽기

### 2. 학습 확인
작업 파일의 "학습 확인" 체크리스트 답변
- 각 질문에 구체적으로 답변
- 모르는 것은 다시 확인

### 3. 현재 상태 확인
```bash
# 수정 대상 파일 확인
Read [수정할 파일 경로]
# 이미 수정되었는지 확인
```

### 4. 구현
- Edit 도구로 코드 수정
- 작업 파일의 지시사항 정확히 따르기
- Context 활용 (이미 읽은 문서 참조)

### 5. 검증 (작업 유형별 필수)


# UI 작업: Visual Verification Protocol 적용
- Playwright MCP로 브라우저 확인:
  * mcp__playwright-stealth__playwright_navigate --url [URL은 PM AI가 제공]
  * mcp__playwright-stealth__playwright_screenshot --name evidence/task-xxx
- Visual-Verification-Protocol.md 체크리스트 수행
- 증거 수집은 PM AI 작업 지시서 참고

# DB 작업: 스키마 검증
- npx supabase db push  # 마이그레이션 적용
- npx supabase gen types typescript --local > src/types/database.types.ts


# API 작업: 엔드포인트 검증
- curl 또는 브라우저에서 직접 호출
- URL과 포트는 PM AI 작업 지시서 참고
- 에러 케이스는 PM AI 작업 지시서 참고
```

### 6. 완료 보고 (PM AI에게)
```json
{
  "task_id": "TASK-[번호]",
  "status": "completed|failed",
  "files_modified": ["파일 목록"],
  "type_errors": 0,
  "verification": {
    "type": "UI|DB|API|General",
    "protocol_applied": true,
    "checklist_completed": ["검증 항목들"],
    "evidence": ["스크린샷 경로", "테스트 결과"]
  },
  "issues": ["문제 있으면 나열"]
}
```

**중요**: 
- Developer AI는 구현과 검증 프로토콜 수행
- PROJECT-INDEX.md 업데이트는 PM AI가 최종 검증 후 수행

## 핵심 규칙

### 코딩 규칙
- **스타일링**: theme.deep.json 토큰만 사용
- **하드코딩 금지**: 색상, 크기 등 직접 입력 금지
- **타입 안전**: TypeScript 엄격 모드 준수
- **컨벤션**: 기존 코드 패턴 따르기

### 검증 규칙
- 모든 수정 후 타입 체크 필수
- UI 작업은 Visual-Verification-Protocol 적용
- 실제 동작 확인 필수 (로그만 믿지 말 것)

## 온보딩 완료 보고
```
Developer AI 온보딩 완료
- 위치: C:\My_Claude_Project\9.Dhacle
- 학습: 필수 문서 5개 완료
- 타입 체크: npx tsc --noEmit 정상
- 준비 완료: 작업 지시 대기 중
```

## 코드 패턴 참고 위치 가이드

### 자주 사용하는 패턴 찾기
```bash
# UI 컴포넌트 패턴 (⚠️ 2025-01-12 업데이트)
- styled-components: src/components/design-system/*.styled.tsx
- SSR-safe 디자인 시스템: Typography, Button, Card, Input, Layout, Gradient
- 토큰 직접 사용: theme.deep.json을 common.ts에서 import
- ❌ ThemeProvider 사용 금지 (SSR 문제)

# API 패턴
- Route Handler: src/app/api/auth/callback/route.ts
- Supabase 클라이언트: src/lib/supabase/server-client.ts
- 에러 처리: callback/route.ts의 try-catch 패턴

# DB 패턴
- 마이그레이션: src/lib/supabase/migrations/001_initial_schema.sql
- RLS 정책: 001_initial_schema.sql의 POLICY 예시들
- 타입 정의: src/types/database.types.ts

# 상태 관리 패턴
- React Hooks: src/hooks/useScrollPosition.ts
- ❌ ThemeProvider 사용 금지 (제거됨)
```

### 패턴 검색 명령어
```bash
# 특정 패턴 찾기
grep -r "styled" src/components/  # styled-components 사용 예시
grep -r "useEffect" src/  # React Hook 패턴
grep -r "supabase" src/  # Supabase 사용 패턴
grep -r "async function" src/app/api/  # API 핸들러 패턴

# import 패턴 확인
grep -r "^import.*from '@/'" src/  # 절대 경로 import
grep -r "^import.*from '\.\./'" src/  # 상대 경로 import
```

## 도메인 용어 사전

### 프로젝트 핵심 용어
- **디하클 (Dhacle)**: 프로젝트명, YouTube Shorts 크리에이터 교육 플랫폼
- **수익인증**: 크리에이터가 수익 스크린샷을 공유하는 기능
- **쇼츠 (Shorts)**: YouTube의 60초 이하 세로 동영상
- **크리에이터**: YouTube 콘텐츠 제작자
- **TTS 커터**: Text-to-Speech 음성을 자르는 도구
- **템플릿**: 쇼츠 제작용 미리 만들어진 구성

### 기술 용어
- **토큰 시스템**: theme.deep.json 기반 디자인 시스템
- **Mock 모드**: Supabase 없이 개발하는 모드
- **RLS (Row Level Security)**: Supabase의 행 수준 보안
- **App Router**: Next.js 14의 새로운 라우팅 시스템

## 기술 스택 Quick Reference

### Next.js 14 App Router
```bash
# 페이지: src/app/[경로]/page.tsx
# API: src/app/api/[경로]/route.ts
# 레이아웃: src/app/[경로]/layout.tsx
# 동적 라우트: src/app/[param]/page.tsx
```

### Supabase
```bash
# 클라이언트 생성
- Browser: createBrowserClient() from '@/lib/supabase/browser-client'
- Server: createServerClient() from '@/lib/supabase/server-client'

# 기본 쿼리
.from('table').select('*')
.from('table').insert({})
.from('table').update({}).eq('id', id)
.from('table').delete().eq('id', id)

# RLS 확인
.from('table').select('*').single()  # 권한 없으면 에러
```

### TypeScript + Supabase 타입
```bash
# 타입 import
import { Database } from '@/types/database.types'

# 테이블 타입
type TableName = Database['public']['Tables']['table_name']['Row']

# 클라이언트 타입
createBrowserClient<Database>()  # 제네릭 필수
```

### Styled Components + 토큰
```bash
# 토큰 import
import { colors, effects, typography } from '@/styles/tokens/[category]'

# 사용 예시
color: ${colors.neutral[700]};  # ✅ 올바름
color: #333333;  # ❌ 하드코딩 금지

# 애니메이션
transition: all ${effects.animation.duration.fast};
```

## 자주 하는 실수 방지
1. ❌ 문서 안 읽고 추측 → ✅ 문서 먼저 읽기
2. ❌ 하드코딩 → ✅ theme.deep.json 토큰 사용
3. ❌ 타입 체크 생략 → ✅ 항상 npx tsc --noEmit
4. ❌ "아마 될 것" → ✅ 실제 실행해서 확인
5. ❌ 새 패턴 만들기 → ✅ 기존 코드 패턴 찾아서 따르기
6. ❌ any 타입 사용 → ✅ Database 타입 활용

## 긴급 상황 대응

### 타입 에러가 해결 안 될 때
```bash
# 타입 재생성
npx supabase gen types typescript --local > src/types/database.types.ts
# VSCode 재시작
# TypeScript 서버 재시작: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Supabase 연결 안 될 때
```bash
# Mock 모드 활성화
echo "NEXT_PUBLIC_USE_MOCK_SUPABASE=true" >> .env.local
```

---
*작성일: 2025-01-09*
*버전: 1.1*
*개선: 코드 패턴 위치 가이드, 도메인 용어, Quick Reference 추가*