# 📋 Claude AI 작업 네비게이터

*디하클(Dhacle) 프로젝트 AI 작업 지침 - 작업 위치별 상세 가이드 제공*

---

## 🛑 STOP & ACT 규칙 (임시방편 절대 금지)

### ⚠️ 문제 발견 시 즉시 행동 원칙
**"주석 처리하고 넘어가기" = 프로젝트 파괴**

#### 필수 행동 패턴
| 문제 발견 | ❌ 금지된 회피 | ✅ 필수 행동 |
|----------|--------------|------------|
| 테이블 누락 | 주석 처리 | CREATE TABLE SQL 작성 → 실행 |
| 타입 없음 | any 사용 | src/types/index.ts에 타입 정의 추가 |
| API 미구현 | 빈 배열 반환 | 완전한 API 구현 |
| 함수 미구현 | TODO 주석 | 즉시 함수 구현 |
| 에러 발생 | Silent fail | 에러 처리 및 복구 로직 구현 |

### 🚫 코드 자동 변환 스크립트 절대 금지
**❌ 절대 금지: 코드를 일괄 변경하는 자동 스크립트 생성**
- 2025년 1월, 38개 자동 스크립트로 인한 "에러 지옥" 경험
- 검증 스크립트(verify-*.js)만 허용, 수정은 수동으로

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

## 🔗 14개 핵심 문서 체계

> **필독 순서대로 확인**:
> 1. 🔥 `/docs/CONTEXT_BRIDGE.md` - **최우선!** 반복 실수 패턴 + 예방책
> 2. 📊 `/docs/PROJECT.md` - 프로젝트 현황 (Phase 1-4 완료)
> 3. 🗺️ `/docs/CODEMAP.md` - 프로젝트 구조
> 4. ✅ `/docs/CHECKLIST.md` - 작업 검증 (12개 검증 스크립트)
> 5. 📖 `/docs/DOCUMENT_GUIDE.md` - 문서 작성 가이드
> 6. 🎯 `/docs/INSTRUCTION_TEMPLATE.md` - 지시 템플릿
> 7. 🔄 `/docs/FLOWMAP.md` - 사용자 플로우
> 8. 🔌 `/docs/WIREFRAME.md` - UI-API 연결
> 9. 🧩 `/docs/COMPONENT_INVENTORY.md` - 컴포넌트 목록
> 10. 📍 `/docs/ROUTE_SPEC.md` - 라우트 구조
> 11. 💾 `/docs/STATE_FLOW.md` - 상태 관리 (React Query + Zustand)
> 12. 📦 `/docs/DATA_MODEL.md` - 데이터 모델
> 13. 🚨 `/docs/ERROR_BOUNDARY.md` - HTTP 에러 처리
> 14. 🎯 `/docs/INSTRUCTION_TEMPLATE_v16.md` - 최신 템플릿

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