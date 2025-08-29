# 📋 Claude AI 작업 네비게이터

*디하클(Dhacle) 프로젝트 AI 작업 지침 - 작업 위치별 상세 가이드 제공*

---

## 🛑 STOP & ACT 규칙 (임시방편 = 프로젝트 파괴)

### ⚠️ 절대 규칙 - 위반 시 작업 즉시 중단
**"대충 처리 = 2주간 에러 디버깅"**

#### 🔴 즉시 중단 신호
| 발견 시 | ❌ 절대 금지 | ✅ 유일한 해결책 |
|----------|--------------|--------------|
| 테이블 누락 | 주석 처리, TODO | CREATE TABLE SQL 작성 → 즉시 실행 |
| 타입 없음 | any, unknown 대충 사용 | 정확한 타입 확인 후 정의 |
| API 미구현 | 빈 배열/null 반환 | 완전한 구현 후에만 진행 |
| 함수 미구현 | TODO, 빈 함수 | 완전히 구현하거나 삭제 |
| 에러 발생 | try-catch로 숨기기 | 근본 원인 해결 |
| any 타입 | 그대로 두기 | 즉시 제거 (biome 에러) |

### 🔥 핵심 원칙
1. **임시방편 발견 = 즉시 중단**
2. **하나 수정 시 주변 코드 확인 필수**
3. **실제 작동 확인 없이 작업 완료 금지**
4. **검증 실패 시 다음 작업 진행 금지**

### 🚫 코드 자동 변환 스크립트 절대 금지
**❌ 절대 금지: 코드를 일괄 변경하는 자동 스크립트 생성**
- 2025년 1월, 38개 자동 스크립트로 인한 "에러 지옥" 경험
- 검증 스크립트(verify-*.js)만 허용, 수정은 수동으로

### ⚡ 3단계 필수 프로세스
```bash
1. STOP - 문제 발견 시 즉시 중단
2. FIX - 완전한 해결 (임시방편 금지)
3. VERIFY - 실제 작동 확인
   npm run verify:parallel
   npm run types:check
```

---

## 🏗️ 새 기능 구현 = 테이블 먼저 생성 (필수 워크플로우)

### ⚡ 기능 구현 정석 프로세스
**"기능 구현하려면 테이블부터 만들고 시작해라"**

#### 1️⃣ 기능 기획 → 즉시 테이블 설계
```yaml
예시: "댓글 기능 추가"
  1. 필요 테이블: comments, comment_likes  
  2. 관계 정의: users ← comments → posts
  3. RLS 정책: 작성자만 수정/삭제
```

#### 2️⃣ 테이블 SQL 작성 및 실행 (한 번에!)
```bash
# 테이블 생성 SQL 작성과 동시에 실행
cat > migrations/$(date +%Y%m%d)_create_comments.sql << 'EOF'
-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 필수 (생략하면 Database Agent가 차단!)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- 인덱스 (조회 성능)
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
EOF

# 즉시 실행 (테이블 없으면 어차피 코드 못짬)
node scripts/supabase-sql-executor.js --method pg --file migrations/$(ls -t migrations/*.sql | head -1)

# 타입 생성 (TypeScript 타입 자동 생성)
npm run types:generate

# 검증
node scripts/verify-with-service-role.js
```

#### 3️⃣ 이제 API/UI 구현 시작
```typescript
// ✅ 이제 테이블이 있으니 안전하게 구현
import { Database } from '@/types/database.generated';

type Comment = Database['public']['Tables']['comments']['Row'];

// API 구현
export async function POST(req: Request) {
  const { content, post_id } = await req.json();
  
  // 테이블이 이미 있으니 에러 없음!
  const { data, error } = await supabase
    .from('comments')
    .insert({ content, post_id, user_id });
}
```

### 🚨 테이블 없이 기능 구현 시도 = 즉시 차단
```typescript
// ❌ Database Agent가 차단하는 패턴
await supabase.from('new_table').select(); // 테이블 없음 → STOP!

// ❌ 임시방편 금지
// TODO: 나중에 테이블 생성 → 절대 금지!
const data = []; // 임시 데이터 → 차단!

// ✅ 올바른 순서
// 1. 테이블 SQL 작성
// 2. 즉시 실행
// 3. 타입 생성
// 4. 구현 시작
```

### 📁 관련 폴더별 CLAUDE.md 워크플로우
| 단계 | 작업 | 참조 문서 | 자동 Agent |
|-----|------|----------|-----------|
| 1. 테이블 설계 | SQL 작성 | `/supabase/migrations/CLAUDE.md` | Database Agent |
| 2. SQL 실행 | 명령 실행 | `/scripts/CLAUDE.md` | Script Agent |
| 3. 타입 생성 | types:generate | `/src/types/CLAUDE.md` | Type Agent |
| 4. API 구현 | Route 생성 | `/src/app/api/CLAUDE.md` | API Route Agent |
| 5. UI 구현 | Component | `/src/components/CLAUDE.md` | Component Agent |

---

## 🤖 Active Agents (Direct Tool Integration)

**⚡ CRITICAL: 모든 Edit, Write, MultiEdit 작업 시 해당 전문 서브에이전트의 품질 기준을 즉시 적용하세요.**

### 🎯 서브에이전트 자동 활성화 매트릭스
| 작업 유형 | 활성화되는 Agent | 자동 수행 작업 | 폴더별 CLAUDE.md |
|----------|-----------------|--------------|------------------|
| **새 기능 기획** | Database Agent | 테이블 SQL 템플릿 생성 | `/supabase/migrations/CLAUDE.md` |
| **테이블 생성** | Database Agent | RLS 정책 강제, 타입 생성 안내 | `/supabase/migrations/CLAUDE.md` |
| **any 타입 발견** | Type Agent | 즉시 제거, @/types 이동 | `/src/types/CLAUDE.md` |
| **API 생성** | API Route Agent | 세션 체크 추가, snake_case | `/src/app/api/CLAUDE.md` |
| **컴포넌트 생성** | Component Agent | shadcn/ui 확인 | `/src/components/CLAUDE.md` |
| **React Query** | Query Agent | api-client 패턴 | `/src/hooks/CLAUDE.md` |

**🛑 MANDATORY WORKFLOW:**
1. **컴포넌트 파일** (src/components/**) → shadcn/ui 우선, any 타입 차단, Server Component 기본
2. **API 파일** (src/app/api/**) → 인증 검사 필수, snake_case 변환, Supabase 패턴
3. **타입 파일** (*.ts, *.tsx) → any 타입 즉시 제거, @/types 중앙화
4. **보안 관련** (auth, security) → RLS 정책, env.ts 사용, XSS 방지
5. **데이터베이스** (SQL, migration) → RLS 필수, 타입 생성, 검증 실행
6. **React Query** (src/hooks/**) → 15개 훅 패턴, api-client 강제
7. **페이지** (src/app/(pages)**) → Server Component, force-dynamic
8. **라이브러리** (src/lib/**) → env.ts, api-client, utils 패턴
9. **테스트** (e2e/, *.test.ts) → 런타임 에러 감지, 80% 커버리지
10. **스크립트** (scripts/**) → verify-*.js만 허용, fix-*.js 금지
11. **문서** (docs/, *.md) → 14개 체계, CONTEXT_BRIDGE.md 우선
12. **모든 작업** → Quality Gates, 임시방편 금지, 검증 필수

### API Route Agent
Direct tool 작업 시 자동 활성화: Edit, Write, MultiEdit (src/app/api/**)
- **인증 패턴**: 모든 API Route에 세션 검사 강제 실행
- **타입 안전성**: any 타입 즉시 차단 및 수정
- **snake_case 변환**: DB 경계에서 자동 변환 적용
- **Supabase 통합**: 프로젝트 표준 패턴 강제 준수

### Component Agent  
Direct tool 작업 시 자동 활성화: Edit, Write, MultiEdit (src/components/**)
- **shadcn/ui 우선**: 기존 컴포넌트 확인 후 사용 강제
- **Server Component 기본**: 'use client' 최소화
- **Tailwind CSS**: styled-components 등 대체 스타일링 차단
- **프로젝트 패턴**: 기존 컴포넌트 일관성 유지

### Type Agent
Direct tool 작업 시 자동 활성화: Edit, Write, MultiEdit (*.ts, *.tsx)
- **any 타입 절대 차단**: 발견 즉시 수정 또는 작업 중단
- **@/types 중앙화**: database.generated 직접 import 금지
- **타입 생성**: DB 변경 시 자동 타입 업데이트 실행
- **biome 규칙**: TypeScript strict 모드 강제 준수

### Security Agent
Direct tool 작업 시 자동 활성화: Edit, Write (security, auth 관련)
- **RLS 정책**: 새 테이블 생성 시 즉시 RLS 정책 생성
- **환경변수**: process.env 직접 접근 차단, env.ts 사용 강제
- **XSS 방지**: innerHTML 직접 사용 차단, DOMPurify 강제
- **Wave 보안**: 0-3 Wave 보안 기준 자동 적용

### Database Agent
Direct tool 작업 시 자동 활성화: Edit, Write (migration, SQL 파일)
- **RLS 필수**: 테이블 생성과 동시에 RLS 정책 적용
- **타입 생성**: SQL 변경 후 자동으로 npm run types:generate 실행
- **검증**: 모든 DB 변경 후 verify-with-service-role.js 실행
- **22개 테이블**: 기존 테이블과 일관성 유지

### Query Agent
Direct tool 작업 시 자동 활성화: Edit, Write (src/hooks/**)
- **React Query 패턴**: 15개 구현된 훅 패턴 준수
- **api-client.ts**: 직접 fetch 차단, api-client 함수만 허용
- **캐싱 전략**: 적절한 staleTime, gcTime 설정 강제
- **타입 안전성**: useQuery, useMutation 타입 파라미터 필수

### Test Agent  
Direct tool 작업 시 자동 활성화: Edit, Write (테스트 파일)
- **런타임 에러 감지**: global-setup.ts 패턴 적용
- **E2E 자동화**: Playwright 설정 최적화
- **80% 커버리지**: 핵심 기능 테스트 강제 적용
- **자동 아카이브**: 임시 테스트 파일 자동 정리

### Page Agent
Direct tool 작업 시 자동 활성화: Edit, Write (src/app/(pages)/**)
- **Server Component**: 기본값으로 강제 적용
- **force-dynamic**: 환경변수 사용 시 자동 추가
- **App Router**: Next.js 13+ 패턴 강제 준수
- **라우팅**: 프로젝트 라우팅 구조 일관성 유지

### Library Agent
Direct tool 작업 시 자동 활성화: Edit, Write (src/lib/**)
- **env.ts**: 환경변수 타입 안전 접근 강제
- **api-client.ts**: 내부 API 호출 표준화
- **utils.ts**: cn() 등 유틸리티 함수 일관성
- **Supabase**: 프로젝트 클라이언트 패턴 준수

### Script Agent
Direct tool 작업 시 자동 활성화: Edit, Write (scripts/**)
- **검증만 허용**: verify-*.js만 생성 허용
- **자동 수정 금지**: fix-*.js 생성 시 즉시 차단
- **SQL 실행**: supabase-sql-executor.js 패턴 준수
- **38개 스크립트 교훈**: 2025년 1월 에러 지옥 방지

### Documentation Agent  
Direct tool 작업 시 자동 활성화: Edit, Write (docs/**, *.md)
- **14개 문서 체계**: 기존 문서 구조 유지
- **CONTEXT_BRIDGE.md**: 반복 실수 패턴 업데이트
- **중복 방지**: 문서 간 내용 중복 차단
- **최신 정보**: 최신 7개 변경사항만 유지

### PM Dhacle (Total Coordinator)
Direct tool 작업 시 항상 활성화: 모든 도구 사용 시
- **Quality Gates**: 모든 작업 후 검증 스크립트 실행 강제
- **컨텍스트 관리**: 11개 전문 에이전트 조정
- **작업 흐름**: API → Type → Component → Test 순서 강제
- **에러 제로**: 임시방편 코드 발견 시 즉시 작업 중단

---

## 📁 폴더별 상세 지침 맵

**작업 위치에 따라 해당 폴더의 CLAUDE.md를 우선 확인하세요.**

| 작업 영역 | 파일 위치 | 주요 내용 | 핵심 규칙 |
|----------|----------|----------|----------|
| **API Routes** | [/src/app/api/CLAUDE.md](src/app/api/CLAUDE.md) | API 패턴, 인증, 에러 처리 | 모든 Route 세션 검사 필수 |
| **페이지** | [/src/app/(pages)/CLAUDE.md](src/app/(pages)/CLAUDE.md) | Server Component, 라우팅 | Server Component 우선 |
| **컴포넌트** | [/src/components/CLAUDE.md](src/components/CLAUDE.md) | shadcn/ui, Tailwind CSS | shadcn/ui 우선 사용 |
| **타입 시스템** | [/src/types/CLAUDE.md](src/types/CLAUDE.md) | TypeScript, 타입 관리 | @/types에서만 import |
| **React Query** | [/src/hooks/CLAUDE.md](src/hooks/CLAUDE.md) | 쿼리 훅, 캐싱 전략 | 15개 구현된 훅 활용 |
| **Supabase** | [/src/lib/supabase/CLAUDE.md](src/lib/supabase/CLAUDE.md) | 클라이언트 패턴, RLS | 프로젝트 표준 패턴 준수 |
| **라이브러리** | [/src/lib/CLAUDE.md](src/lib/CLAUDE.md) | 환경변수, API 클라이언트 | env.ts 타입 안전 사용 |
| **보안** | [/src/lib/security/CLAUDE.md](src/lib/security/CLAUDE.md) | RLS, 검증, XSS 방지 | Wave 0-3 완료 상태 |
| **스크립트** | [/scripts/CLAUDE.md](scripts/CLAUDE.md) | 검증, SQL 실행 | 자동 수정 스크립트 금지 |
| **문서** | [/docs/CLAUDE.md](docs/CLAUDE.md) | 14개 핵심 문서 체계 | CONTEXT_BRIDGE.md 최우선 |
| **테스트** | [/tests/CLAUDE.md](tests/CLAUDE.md) | Vitest, MSW, Playwright | 80% 커버리지 목표 |

---

## 🔗 15개 핵심 문서 체계

> **필독 순서대로 확인**:
> 1. 🔥 `/docs/CONTEXT_BRIDGE.md` - **최우선!** 반복 실수 패턴 + 예방책
> 2. 📊 `/docs/PROJECT.md` - 프로젝트 현황 (Phase 1-4 완료)
> 3. 🗺️ `/docs/CODEMAP.md` - 프로젝트 구조
> 4. ✅ `/docs/CHECKLIST.md` - 작업 검증 (12개 검증 스크립트)
> 5. 📖 `/docs/DOCUMENT_GUIDE.md` - 문서 작성 가이드
> 6. 🎯 `/docs/INSTRUCTION_TEMPLATE_E2E.md` - **최종 E2E 지시 템플릿 **
> 7. 🔄 `/docs/FLOWMAP.md` - 사용자 플로우
> 8. 🔌 `/docs/WIREFRAME.md` - UI-API 연결
> 9. 🧩 `/docs/COMPONENT_INVENTORY.md` - 컴포넌트 목록
> 10. 📍 `/docs/ROUTE_SPEC.md` - 라우트 구조
> 11. 💾 `/docs/STATE_FLOW.md` - 상태 관리 (React Query + Zustand)
> 12. 📦 `/docs/DATA_MODEL.md` - 데이터 모델
> 13. 🚨 `/docs/ERROR_BOUNDARY.md` - HTTP 에러 처리
> 14. 🎭 `/docs/PLAYWRIGHT_USAGE.md` - **E2E 테스트 가이드** (2025-08-27 추가)


---

## 🚀 빠른 시작 가이드

### 1️⃣ 작업 시작 전
- [ ] 작업 위치 확인 → 해당 폴더 CLAUDE.md 읽기
- [ ] `/docs/CONTEXT_BRIDGE.md` 확인 (반복 실수 방지)
- [ ] 기존 파일 Read로 먼저 읽기

### 2️⃣ 코드 작성 시
- [ ] 폴더별 CLAUDE.md 패턴 준수
- [ ] any 타입 절대 금지
- [ ] 임시방편 코드 작성 금지

### 3️⃣ 작업 완료 후
- [ ] `npm run verify:parallel` 실행
- [ ] 타입 체크 통과 확인
- [ ] 빌드 성공 확인

---

## ⚡ 긴급 대응 가이드

### Vercel 빌드 실패 시
1. Vercel Dashboard에서 빌드 커밋 확인
2. 로컬과 동일한지 확인: `git log --oneline -1`
3. DB 테이블 오류: `node scripts/verify-with-service-role.js`
4. TypeScript 오류: 각 파일 수동 수정 (자동 스크립트 금지!)

### 보안 현황
- Wave 0-3: 완료 ✅
- RLS 정책: 21개 테이블 SQL 작성 완료
- Rate Limiting, Zod, XSS 방지: 구현 완료

### 🤖 서브에이전트 시스템 (2025-08-28 활성화)
- **16개 전문 에이전트**: pm-dhacle + 15개 전문 에이전트 구축 완료
- **자동 활성화**: Edit/Write/MultiEdit 시 파일 패턴 매칭으로 자동 활성화
- **즉시 차단**: any 타입, 임시방편 코드, TODO 주석, 빈 함수
- **품질 향상**: 반복 실수 40-50% → 5% 이하 목표
- **Task 도구 사용 시 주의**: `analyzer`가 아닌 `general-purpose` 사용 (CONTEXT_BRIDGE.md #19 참조)

---

## 📋 검증 명령어

```bash
# 병렬 검증 (가장 빠름)
npm run verify:parallel

# 타입 시스템
npm run types:check

# 보안 테스트
npm run security:test

# SQL 실행 (필요시)
node scripts/supabase-sql-executor.js --method pg --file <SQL파일>
```

---

## 💬 커뮤니케이션

- 작업 전 의도 설명
- 중요 변경사항 사전 협의
- 에러 발생 시 즉시 보고
- 한국어로 명확한 소통

---

*각 폴더별 상세 지침은 해당 CLAUDE.md 파일을 참조하세요.*