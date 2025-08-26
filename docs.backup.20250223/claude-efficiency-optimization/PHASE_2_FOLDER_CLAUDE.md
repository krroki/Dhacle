/sc:implement --seq --validate --delegate folders --c7
"Phase 2: 12개 폴더별 CLAUDE.md 구현"

# Phase 2: 폴더별 CLAUDE.md 구현

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙
- [ ] Phase 1 분석 보고서 - 우선순위 확인
- [ ] 각 폴더의 기존 파일 구조

## 📌 Phase 정보
- **Phase 번호**: 2/4
- **선행 조건**: Phase 1 완료
- **예상 시간**: 3시간
- **우선순위**: CRITICAL
- **작업 범위**: 12개 CLAUDE.md 파일 생성/개선

## 🎯 Phase 목표
1. 12개 폴더별 CLAUDE.md 생성
2. 5W1H 구조 적용
3. Quick Reference 섹션 추가
4. Tool Usage Matrix 구현

## 📝 작업 내용

### 폴더별 CLAUDE.md 템플릿
```markdown
# 📂 [폴더명] 개발 가이드

## 🎯 5W1H 분석
- **What**: [이 폴더의 역할]
- **Why**: [왜 필요한가]
- **When**: [언제 사용되는가]
- **Where**: [프로젝트 내 위치]
- **Who**: [누가 사용하는가]
- **How**: [어떻게 동작하는가]

## 📁 폴더 구조
\`\`\`
[폴더]/
├── [주요 파일 1]     # [용도]
├── [주요 파일 2]     # [용도]
└── [하위 폴더]/      # [용도]
\`\`\`

## 🎯 Quick Reference
### 가장 자주 사용하는 패턴 (복사용)
\`\`\`typescript
// 패턴 1: [설명]
[코드]

// 패턴 2: [설명]
[코드]
\`\`\`

## 🛠️ Tool Usage Matrix
| 작업 | 도구/라이브러리 | 사용법 | NPM Script |
|------|----------------|--------|------------|
| [작업1] | [도구] | [사용법] | npm run [스크립트] |

## 🔗 의존성 관계
### Dependencies (이 폴더가 사용)
- [경로]: [용도]

### Dependents (이 폴더를 사용)
- [경로]: [용도]

### ⚠️ 순환 의존 방지
- [규칙 1]
- [규칙 2]

## 🚀 작업 시나리오
### 새 [기능] 추가 시
1. ✅ [단계 1]
2. ✅ [단계 2]
3. ✅ [단계 3]

## ❌ 자주 발생하는 에러 & 즉시 해결법
| 에러 | 원인 | 해결 |
|------|------|------|
| [에러1] | [원인] | [해결법] |
```

### 구현 순서 (우선순위별)

#### 1. src/app/api/CLAUDE.md
```markdown
# 📂 API Routes 개발 가이드

## 🎯 5W1H 분석
- **What**: Next.js API Route 핸들러들
- **Why**: 서버사이드 비즈니스 로직 처리
- **When**: 클라이언트가 데이터 요청 시
- **Where**: /api/* 경로로 접근
- **Who**: Client Components, React Query hooks
- **How**: NextResponse.json()으로 응답

## 📁 폴더 구조
\`\`\`
src/app/api/
├── auth/           # 인증 관련 API
│   ├── login/
│   └── logout/
├── youtube/        # YouTube 관련 API
│   ├── search/
│   └── popular/
└── user/          # 사용자 관련 API
\`\`\`

## 🎯 Quick Reference
### 가장 자주 사용하는 패턴 (복사용)
\`\`\`typescript
// 1. 인증된 GET 요청
export async function GET(): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // 로직
}

// 2. Zod 검증 POST
export async function POST(request: Request): Promise<NextResponse> {
  const validation = await validateRequestBody(request, schema);
  if (!validation.success) return createValidationErrorResponse(validation.error);
  // 로직
}
\`\`\`

## 🛠️ Tool Usage Matrix
| 작업 | 도구/라이브러리 | 사용법 | NPM Script |
|------|----------------|--------|------------|
| 검증 | Zod v4 | validateRequestBody() | npm run verify:api |
| 인증 | Supabase Auth | getUser() | - |
| 타입 체크 | TypeScript | tsc | npm run types:check |
| 테스트 | Vitest | vitest | npm run test |

## 🔗 의존성 관계
### Dependencies (이 폴더가 사용)
- `/lib/supabase/`: Supabase 클라이언트
- `/lib/security/`: 검증 스키마
- `/types/`: TypeScript 타입

### Dependents (이 폴더를 사용)
- `/hooks/queries/`: React Query 훅
- `/components/`: Client Components

### ⚠️ 순환 의존 방지
- API Route는 컴포넌트를 import 금지
- 타입만 공유, 로직은 분리

## 🚀 작업 시나리오
### 새 API 엔드포인트 추가 시
1. ✅ \`src/app/api/[domain]/[action]/route.ts\` 생성
2. ✅ 인증 체크 추가 (필수)
3. ✅ Zod 스키마 정의
4. ✅ 에러 처리 구현
5. ✅ \`/docs/WIREFRAME.md\` 업데이트
6. ✅ 테스트 작성

## ❌ 자주 발생하는 에러 & 즉시 해결법
| 에러 | 원인 | 해결 |
|------|------|------|
| \`PKCE flow error\` | auth-helpers 사용 | \`createSupabaseRouteHandlerClient()\` 사용 |
| \`undefined env vars\` | process.env 직접 접근 | \`import { env } from '@/env'\` |
| \`Type 'Response' is not assignable\` | new Response() 사용 | \`NextResponse.json()\` 사용 |
| \`401 Unauthorized\` | getSession() 사용 | \`getUser()\` 사용 |
```

#### 2-12. 나머지 폴더들도 동일한 형식으로 구현
[각 폴더별로 특화된 내용으로 CLAUDE.md 생성]

## ✅ Phase 완료 조건
- [ ] 12개 폴더 모두 CLAUDE.md 생성
- [ ] 5W1H 섹션 완성
- [ ] Quick Reference 코드 포함
- [ ] Tool Usage Matrix 작성
- [ ] 의존성 관계 명시
- [ ] 에러 해결법 포함

## 🔄 롤백 절차
```bash
# 생성된 CLAUDE.md 파일들 제거
find src -name "CLAUDE.md" -type f -exec rm {} \;
find scripts -name "CLAUDE.md" -type f -exec rm {} \;
find tests -name "CLAUDE.md" -type f -exec rm {} \;
```

## → 다음 Phase
- **파일**: PHASE_3_TECH_STACK.md
- **선행 조건**: 12개 CLAUDE.md 파일 생성 완료