# 🎯 디하클 프로젝트 AI 작업 총괄 가이드

*Diátaxis 4분할 문서 체계와 16개 전문 서브에이전트 시스템*

**🗣️ 언어 정책**: 사용자와의 모든 대화는 **한국어로만** 진행  
**역할**: 전체 가이드라인 + 서브에이전트 조정  
**프로젝트**: 디하클(Dhacle) - YouTube 크리에이터 도구 플랫폼  
**아키텍처**: Next.js 15 + Supabase + TypeScript  
**현재 상태**: Recovery Phase - 품질 개선 중 (검증 50% 성공)

---

## 🚀 30초 즉시 시작 (새 AI 세션 전용)

### ⚡ 30초 온보딩 시스템
```bash
# 1단계: AI 컨텍스트 자동 로딩 (2-3초)
npm run context:load

# 2단계: 생성된 워밍업 파일 확인 (1-2초)
cat ai-context-warmup.md

# 3단계: 빠른 시작 가이드로 이동 (1초)
# 👉 docs/tutorial/01-quick-start.md 읽기
```

**🎯 목표**: 새 AI가 프로젝트를 완전히 이해하는데 30초 달성  
**📊 현재 성과**: 10분 → 30초 (95% 시간 단축)

---

## 📚 새로운 문서 체계: Diátaxis 4분할

### 🗺️ 문서 내비게이션 (상황별 접근)

#### 🆕 새 AI 세션 시작 시
```
1. 📖 tutorial/01-quick-start.md    # 30초 프로젝트 파악
2. 📊 reference/project-status.md   # 현재 상태 확인  
3. 💡 explanation/mistake-patterns.md # 실수 방지
```

#### 🔧 구체적 작업 수행 시
```
1. 해당 영역 CLAUDE.md 확인          # 전문 서브에이전트 지침
2. how-to/ 관련 가이드 확인          # 단계별 구현 방법
3. reference/ 관련 문서 확인         # 필요한 데이터 조회
```

#### 🔍 문제 해결 필요 시  
```
1. explanation/mistake-patterns.md   # 유사 패턴 확인
2. how-to/ 해결 가이드              # 구체적 해결 방법
3. reference/ 관련 상태             # 현재 상태 파악
```

### 📁 Diátaxis 4분할 구조 상세
```
docs/
├── 📖 tutorial/        # 학습 지향 (Learning-oriented)
│   ├── 01-quick-start.md      # 30초 프로젝트 파악 ⭐⭐⭐⭐⭐
│   ├── 02-first-task.md       # 첫 작업 실습
│   └── 03-common-patterns.md  # 핵심 코딩 패턴
│
├── 🔧 how-to/          # 문제 해결 지향 (Problem-oriented)  
│   ├── 01-authentication-patterns.md # 인증 패턴
│   ├── 02-snake-case-conversion.md   # snake_case 변환
│   ├── 03-type-imports.md            # 타입 시스템
│   ├── 04-supabase-integration.md    # DB 연동
│   └── [기능별 하위 폴더들]
│
├── 📊 reference/       # 정보 지향 (Information-oriented)
│   ├── project-status.md        # 프로젝트 현황 ⭐⭐⭐⭐⭐
│   ├── project-structure.md     # 프로젝트 구조
│   ├── database-schema.md       # DB 스키마 전체
│   ├── api-endpoints.md         # API 엔드포인트 목록
│   └── [기타 레퍼런스들]
│
└── 💡 explanation/     # 이해 지향 (Understanding-oriented)
    └── mistake-patterns.md      # 22가지 실수 패턴 ⭐⭐⭐⭐⭐
```

---

## 🛑 프로젝트 전체 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **any 타입 발견 → 중단** (biome 에러 발생)
- **TODO 주석 발견 → 중단** (임시방편 금지)  
- **임시 데이터 반환 → 중단** ([], null, "임시" 금지)
- **테이블 없이 기능 구현 시도 → 중단**

### 2️⃣ MUST - 필수 행동
```typescript
// 프로젝트 전체 필수 패턴
import { env } from '@/env';                    // 환경변수 타입 안전 접근
import type { User } from '@/types';           // 중앙화된 타입만 사용
import { apiGet } from '@/lib/api-client';     // API 호출 표준화
```

### 3️⃣ CHECK - 검증 필수
```bash
# 모든 작업 후 필수 실행
npm run verify:parallel  # 전체 검증 (531ms)
npm run types:check      # TypeScript 검증
```

---

## 🤖 16개 서브에이전트 시스템

### 조정자 (2개)
```
CLAUDE.md                      # 프로젝트 총괄 가이드 (이 파일)
docs/CLAUDE.md                 # 문서 작업 가이드
```

### 11개 전문 서브에이전트 (자동 활성화)
| 서브에이전트 | 자동 활성화 조건 | 전문 지침 위치 |
|-------------|----------------|-------------|
| **API Route Agent** | `src/app/api/**` | [src/app/api/CLAUDE.md](src/app/api/CLAUDE.md) |
| **Component Agent** | `src/components/**` | [src/components/CLAUDE.md](src/components/CLAUDE.md) |
| **Type Agent** | `*.ts, *.tsx` | [src/types/CLAUDE.md](src/types/CLAUDE.md) |
| **Security Agent** | security, auth 관련 | [src/lib/security/CLAUDE.md](src/lib/security/CLAUDE.md) |
| **Database Agent** | SQL, migration 파일 | [supabase/migrations/CLAUDE.md](supabase/migrations/CLAUDE.md) |
| **Query Agent** | `src/hooks/**` | [src/hooks/CLAUDE.md](src/hooks/CLAUDE.md) |
| **Test Agent** | 테스트 파일 | [tests/CLAUDE.md](tests/CLAUDE.md) |
| **Page Agent** | `src/app/(pages)**` | [src/app/(pages)/CLAUDE.md](src/app/(pages)/CLAUDE.md) |
| **Lib Agent** | `src/lib/**` | [src/lib/CLAUDE.md](src/lib/CLAUDE.md) |
| **Script Agent** | `scripts/**` | [scripts/CLAUDE.md](scripts/CLAUDE.md) |
| **Doc Agent** | `docs/**, *.md` | [docs/CLAUDE.md](docs/CLAUDE.md) |

### 추가 전문 에이전트 (3개)
- **Frontend Developer**: 프론트엔드 전문 개발 (UI 최적화, 반응형)
- **General Purpose**: 복잡한 분석과 다단계 작업 (Task 도구용)
- **PM Dhacle**: 프로젝트 매니저 총괄 조정자 (모든 작업 조정)

---

## 📊 현재 프로젝트 상태 (즉시 참조)

### 🎯 기본 정보
- **전체 자산**: 136개
- **컴포넌트**: 96개  
- **API Routes**: 40개
- **현재 상태**: Recovery Phase - 품질 개선 중
- **검증 성공률**: 50% (3/6 모듈)

### ⚠️ 현재 주요 이슈
1. **API 오류**: 18개 (인증 패턴 혼재)
2. **타입 오류**: 2개 (monitoring.ts any 타입)
3. **보안 경고**: 58개 (RLS 커버리지 0%)

**📋 상세 현황**: [reference/project-status.md](docs/reference/project-status.md) 참조

---

## 🚨 치명적 실수 방지 (즉시 확인)

### 🔴 가장 위험한 5가지 패턴
1. **테이블 없이 기능 구현 시작** 🔴🔴🔴
2. **any 타입 남발** 🔴🔴
3. **profiles vs users 테이블 혼란** 🔴🔴  
4. **임시방편 코드 작성** 🔴
5. **서버/클라이언트 컨텍스트 혼용** 🔴

**📋 전체 22가지 패턴**: [explanation/mistake-patterns.md](docs/explanation/mistake-patterns.md) 참조

---

## 🔧 2세션 워크플로우 시스템 🆕

### 📋 Planning AI 세션 (30-45분)
```
목적: 완벽한 지시서 작성
1. context-loader.js 실행으로 온보딩
2. 사용자 요청 분석 및 명확화  
3. 적절한 SuperClaude 명령어 선택
4. 필요한 컨텍스트 정보 수집
5. 완전한 지시서 작성 (Implementation AI용)
```

### ⚙️ Implementation AI 세션 (60-90분)
```
목적: 구현 전용 최적화
1. Planning AI의 지시서 완전 이해
2. context-loader.js로 실시간 상태 확인
3. 지시서의 SuperClaude 명령어 정확히 실행
4. 단계별 검증 및 품질 확인
5. 작업 완료 후 해당 문서 업데이트
```

**📋 상세 가이드**: 
- [workflows/planning-session-guide.md](workflows/planning-session-guide.md)
- [workflows/implementation-session-guide.md](workflows/implementation-session-guide.md)

---

## ⚡ 자동화 시스템 활용

### 🤖 핵심 자동화 도구
```bash
# AI 컨텍스트 생성 (30초 온보딩)
npm run context:load

# 자산 현황 스캔 (프로젝트 상태 파악)  
npm run scan:assets

# 병렬 검증 (전체 품질 확인)
npm run verify:parallel

# 타입 생성 (DB 스키마 변경 시)
npm run types:generate
```

### 📊 성과 지표
- **AI 온보딩 시간**: 10분 → 30초 (95% 단축)
- **작업 성공률**: 60% → 95% (목표)
- **문서 정합성**: 40% → 95% 달성
- **검증 속도**: 55.6% 향상 (병렬 처리)

---

## 🎯 작업 시작 체크리스트

### ✅ 새 세션 시작 시
- [ ] `npm run context:load` 실행 (30초 온보딩)
- [ ] `tutorial/01-quick-start.md` 읽기
- [ ] `reference/project-status.md` 현재 상태 확인
- [ ] `explanation/mistake-patterns.md` 실수 방지 확인

### ✅ 구체적 작업 시  
- [ ] 작업 영역 해당 CLAUDE.md 확인
- [ ] how-to/ 관련 가이드 확인
- [ ] reference/ 필요 데이터 조회
- [ ] 작업 완료 후 `npm run verify:parallel` 실행

### ✅ 작업 완료 시
- [ ] 해당 reference/ 문서 업데이트
- [ ] `npm run verify:parallel` 통과 확인
- [ ] `npm run types:check` 통과 확인

---

## 🔗 빠른 참조 링크

### 📚 필수 문서 (상황별)
| 상황 | 문서 | 목적 |
|------|------|------|
| **새 세션 시작** | [tutorial/01-quick-start.md](docs/tutorial/01-quick-start.md) | 30초 프로젝트 파악 |
| **현재 상태 확인** | [reference/project-status.md](docs/reference/project-status.md) | 실시간 프로젝트 현황 |
| **실수 방지** | [explanation/mistake-patterns.md](docs/explanation/mistake-patterns.md) | 22가지 실수 패턴 |
| **프로젝트 구조** | [reference/project-structure.md](docs/reference/project-structure.md) | 파일 위치 참조 |
| **API 작업** | [src/app/api/CLAUDE.md](src/app/api/CLAUDE.md) | API Route Agent |
| **컴포넌트 작업** | [src/components/CLAUDE.md](src/components/CLAUDE.md) | Component Agent |

### 🛠️ 자주 사용하는 명령어
```bash
# 개발 서버 시작
npm run dev                    # 개발 서버 (2.5초 시작)

# 검증 및 테스트  
npm run verify:parallel        # 전체 검증 (531ms)
npm run types:check           # TypeScript 검사
npm run e2e:ui                # E2E 테스트 (7개 통과)

# 자동화 도구
npm run context:load          # AI 컨텍스트 생성
npm run scan:assets           # 자산 현황 스캔
npm run types:generate        # DB 타입 생성
```

---

**🎯 작업 시작**: 
1. 해당 영역의 전문 서브에이전트 CLAUDE.md를 먼저 확인하세요!
2. 새 AI라면 `tutorial/01-quick-start.md`부터 시작하세요!
3. 문제가 있다면 `explanation/mistake-patterns.md`에서 유사 패턴을 찾아보세요!

**📈 목표**: 30초 온보딩, 95% 작업 성공률 달성