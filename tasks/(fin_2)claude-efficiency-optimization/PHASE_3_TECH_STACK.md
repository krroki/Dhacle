/sc:implement --seq --validate --c7
"Phase 3: 기술 스택 문서화 시스템 구축"

# Phase 3: 기술 스택 문서 3개 생성

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙
- [ ] Phase 1 분석 보고서 - Dependencies & Scripts 분류
- [ ] `package.json` - 최신 상태 확인

## 📌 Phase 정보
- **Phase 번호**: 3/4
- **선행 조건**: Phase 1 완료 (Phase 2와 병렬 가능)
- **예상 시간**: 2시간
- **우선순위**: HIGH
- **작업 범위**: 3개 신규 문서 생성

## 🎯 Phase 목표
1. TECH_STACK.md - 마스터 가이드 생성
2. TOOL_DECISION_TREE.md - 의사결정 트리 생성
3. NPM_SCRIPTS_GUIDE.md - 119개 스크립트 정리

## 📝 작업 내용

### 1. docs/TECH_STACK.md 생성
```markdown
# 🛠️ 기술 스택 마스터 가이드

## 🎯 Tool Selection Matrix (작업별 도구 선택)

| 작업 유형 | 우선 사용 | 대안 도구 | NPM 명령어 | 파일 위치 |
|----------|----------|----------|-----------|----------|
| **컴포넌트 테스트** | Vitest | Testing Library | \`npm run test\` | \`/src/**/*.test.tsx\` |
| **E2E 테스트** | Playwright | - | \`npm run e2e\` | \`/tests/e2e/\` |
| **API 모킹** | MSW | - | - | \`/src/mocks/\` |
| **상태 관리(서버)** | TanStack Query v5 | - | - | \`/src/hooks/queries/\` |
| **상태 관리(클라이언트)** | Zustand v5 | - | - | \`/src/store/\` |
| **폼 처리** | React Hook Form + Zod | - | - | - |
| **환경변수** | T3 Env | - | - | \`/src/env.ts\` |
| **애니메이션** | Framer Motion v12 | - | - | - |
| **캐러셀** | Embla Carousel | - | - | - |
| **리치 에디터** | Tiptap v3 | - | - | - |
| **XSS 방지** | DOMPurify | - | - | - |
| **날짜 처리** | date-fns v4 | - | - | - |
| **리스트 최적화** | React Window | - | - | - |
| **번들 분석** | Bundle Analyzer | - | \`npm run analyze\` | - |

## 📦 Dependencies by Category (108개)

### UI Framework (3개)
- react: ^19.0.0
- react-dom: ^19.0.0
- next: ^15.4.6

### UI Components (15개)
- @radix-ui/*: 모든 Radix UI 컴포넌트
- embla-carousel-react: 캐러셀
- framer-motion: 애니메이션

[... 모든 카테고리별 정리]

## 🔧 Version Compatibility Matrix
| 패키지 | 현재 버전 | 호환 버전 | 주의사항 |
|--------|----------|----------|----------|
| Next.js | 15.4.6 | 15.x | App Router 필수 |
| React | 19.0.0 | 19.x | Server Components |
| TypeScript | 5.8.3 | >=5.0 | strict mode |
```

### 2. docs/TOOL_DECISION_TREE.md 생성
```markdown
# 🔄 도구 선택 의사결정 트리

## "테스트를 작성해야 할 때"
\`\`\`mermaid
graph TD
    A[테스트 필요] --> B{테스트 유형?}
    B -->|컴포넌트| C[Vitest + Testing Library]
    B -->|E2E| D[Playwright]
    B -->|API| E[MSW]
    B -->|성능| F[Playwright + Vercel Analytics]
    
    C --> G[npm run test]
    D --> H[npm run e2e]
    E --> I[Mock 설정]
    F --> J[npm run perf:test]
\`\`\`

## "상태 관리가 필요할 때"
\`\`\`mermaid
graph TD
    A[상태 관리 필요] --> B{데이터 소스?}
    B -->|서버 데이터| C[TanStack Query v5]
    B -->|클라이언트 상태| D[Zustand v5]
    
    C --> E{캐싱 필요?}
    E -->|Yes| F[staleTime 설정]
    E -->|No| G[기본 설정]
    
    D --> H{상태 유형?}
    H -->|폼| I[React Hook Form]
    H -->|URL| J[useSearchParams]
    H -->|전역| K[Zustand Store]
\`\`\`

## "UI 컴포넌트가 필요할 때"
\`\`\`mermaid
graph TD
    A[UI 컴포넌트 필요] --> B{shadcn/ui에 있나?}
    B -->|Yes| C[바로 사용]
    B -->|No| D{컴포넌트 유형?}
    
    D -->|애니메이션| E[Framer Motion v12]
    D -->|캐러셀| F[Embla Carousel]
    D -->|에디터| G[Tiptap v3]
    D -->|날짜| H[shadcn Calendar + date-fns]
    D -->|기타| I[직접 구현]
\`\`\`
```

### 3. docs/NPM_SCRIPTS_GUIDE.md 생성
```markdown
# 📋 NPM Scripts 가이드 (119개)

## 🧪 테스트 명령어 (15개)
\`\`\`bash
npm run test               # Vitest 단위 테스트
npm run test:coverage      # 커버리지 리포트
npm run test:watch        # Watch 모드
npm run e2e               # Playwright E2E
npm run e2e:ui           # Playwright UI 모드
npm run e2e:debug        # 디버그 모드
\`\`\`

## ✅ 검증 명령어 (17개)
\`\`\`bash
npm run verify:parallel   # 모든 검증 병렬 실행 ⚡
npm run verify:api       # API Routes 검증
npm run verify:ui        # UI 컴포넌트 검증
npm run verify:types     # TypeScript 타입 검증
npm run verify:all       # 순차 실행
\`\`\`

## 🔒 보안 명령어 (5개)
\`\`\`bash
npm run security:test          # 보안 테스트
npm run security:apply-rls     # RLS 정책 적용
npm run security:scan-secrets  # 시크릿 스캔
npm run security:audit        # 의존성 감사
npm run security:headers      # 헤더 검증
\`\`\`

## 🎨 코드 품질 (8개)
\`\`\`bash
npm run lint:biome      # Biome 린팅
npm run format:biome    # Biome 포맷팅
npm run biome:ci       # CI용 체크
npm run lint:fix       # 자동 수정
\`\`\`

## 📦 빌드 & 분석 (10개)
\`\`\`bash
npm run build          # Next.js 빌드
npm run build:turbo    # Turbo 빌드
npm run analyze        # 번들 크기 분석
npm run analyze:client # 클라이언트 번들
npm run analyze:server # 서버 번들
\`\`\`

## 🗄️ 데이터베이스 (8개)
\`\`\`bash
npm run db:migrate     # 마이그레이션 실행
npm run db:seed       # 시드 데이터
npm run db:reset      # DB 초기화
npm run db:backup     # 백업 생성
\`\`\`

## 🧹 정리 명령어 (5개)
\`\`\`bash
npm run clean         # 캐시 정리
npm run clean:all    # 전체 정리
npm run clean:node   # node_modules 정리
\`\`\`

## 📊 분석 & 모니터링 (7개)
\`\`\`bash
npm run analyze:deps  # 의존성 분석
npm run analyze:size  # 크기 분석
npm run monitor      # 성능 모니터링
\`\`\`

## 🚀 개발 명령어 (4개)
\`\`\`bash
npm run dev          # 개발 서버
npm run dev:turbo   # Turbo 개발
npm run dev:debug   # 디버그 모드
npm start           # 프로덕션 시작
\`\`\`

## 💡 유틸리티 (나머지)
[... 나머지 스크립트 정리]

## 작업별 추천 조합
| 작업 | 명령어 순서 |
|------|------------|
| 개발 시작 | \`npm run dev\` |
| 커밋 전 | \`npm run verify:parallel\` → \`npm run build\` |
| 배포 전 | \`npm run security:test\` → \`npm run build\` → \`npm run e2e\` |
| 문제 해결 | \`npm run clean\` → \`npm install\` → \`npm run dev\` |
```

## ✅ Phase 완료 조건
- [ ] TECH_STACK.md 생성 (108개 dependencies 정리)
- [ ] TOOL_DECISION_TREE.md 생성 (의사결정 경로)
- [ ] NPM_SCRIPTS_GUIDE.md 생성 (119개 scripts 카테고리화)
- [ ] 모든 문서 상호 참조 연결
- [ ] 실제 package.json과 100% 일치

## 🔄 롤백 절차
```bash
# 생성된 문서 제거
rm docs/TECH_STACK.md
rm docs/TOOL_DECISION_TREE.md
rm docs/NPM_SCRIPTS_GUIDE.md
```

## → 다음 Phase
- **파일**: PHASE_4_VALIDATION.md
- **선행 조건**: Phase 2, 3 완료