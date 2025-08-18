# 📋 Claude AI 작업 지침서

*목적: AI가 디하클(Dhacle) 프로젝트 작업 시 따라야 할 규칙과 프로세스*
*업데이트: 새로운 작업 패턴이나 금지사항 발견 시에만*

> **13개 핵심 문서 체계**:
> - 🤖 AI 작업 지침: `/CLAUDE.md` (이 문서)
> - 📊 프로젝트 현황: `/docs/PROJECT.md`
> - 🗺️ 프로젝트 구조: `/docs/CODEMAP.md`
> - ✅ 작업 검증: `/docs/CHECKLIST.md`
> - 📖 문서 가이드: `/docs/DOCUMENT_GUIDE.md`
> - 🎯 지시 템플릿: `/docs/INSTRUCTION_TEMPLATE.md`
> - 🔄 사용자 플로우: `/docs/FLOWMAP.md`
> - 🔌 UI-API 연결: `/docs/WIREFRAME.md`
> - 🧩 컴포넌트 목록: `/docs/COMPONENT_INVENTORY.md`
> - 📍 라우트 구조: `/docs/ROUTE_SPEC.md`
> - 💾 상태 관리: `/docs/STATE_FLOW.md`
> - 📦 데이터 모델: `/docs/DATA_MODEL.md`
> - 🚨 에러 처리: `/docs/ERROR_BOUNDARY.md`

---

## ✅ 필수 행동 지침

### 1. 작업 전 확인사항
- **반드시** 기존 파일을 Read로 먼저 읽기
- 작업 지시사항 **정확히** 파악하기
- 사용자와 협의 없이 **임의로** 파일 생성/수정 금지
- **중복 체크 필수**: 새 컴포넌트/요소 생성 전 기존 파일 확인
- **생성 이유 설명**: 새로운 요소 생성 시 반드시 사용자에게 이유와 목적 설명
- **보안 현황**: Wave 0-3 완료 ✅, Rate Limiting/Zod/XSS 방지 구현 완료

### 2. 코드 작성 규칙
- **API 호출**: `/src/lib/api-client.ts`의 함수 사용 (`apiGet`, `apiPost`, `apiPut`, `apiDelete`) - **Wave 1 100% 적용**
- **컴포넌트**: shadcn/ui 컴포넌트 우선 사용
- **스타일링**: Tailwind CSS 클래스만 사용 (인라인 스타일 금지)
- **타입**: TypeScript strict mode 준수, any 타입 절대 금지
- **구조**: Server Component 기본, 필요시만 'use client'

### 3. 🔐 보안 자동 적용 규칙 (필수)

#### 새 API Route 생성 시
```typescript
// ⚡ 모든 API Route 최상단에 필수
const supabase = createRouteHandlerClient({ cookies });
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return new Response(
    JSON.stringify({ error: 'User not authenticated' }),
    { status: 401 }
  );
}
```

#### 새 테이블 생성 시
```sql
-- ⚡ 테이블 생성 직후 즉시 적용
ALTER TABLE 테이블명 ENABLE ROW LEVEL SECURITY;

-- 기본 정책 (사용자 본인 데이터만)
CREATE POLICY "테이블명_select_own" ON 테이블명
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "테이블명_insert_own" ON 테이블명
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "테이블명_update_own" ON 테이블명
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "테이블명_delete_own" ON 테이블명
  FOR DELETE USING (user_id = auth.uid());
```

#### API 엔드포인트 입력 검증
```typescript
// ⚡ Zod 스키마 필수 적용
import { validateRequestBody } from '@/lib/security/validation-schemas';

const validation = await validateRequestBody(request, schema);
if (!validation.success) {
  return createValidationErrorResponse(validation.error);
}
```

#### 사용자 입력 XSS 방지
```typescript
// ⚡ HTML 컨텐츠 정화 필수
import { sanitizeRichHTML } from '@/lib/security/sanitizer';

const safeContent = sanitizeRichHTML(userInput);
```

### 4. 파일 작업 규칙
- 새 파일 생성보다 기존 파일 수정 우선
- 문서 파일(*.md, README) 임의 생성 금지
- 환경 변수 하드코딩 금지
- **폴더 구조 준수**: CODEMAP.md 참조
- **파일명 규칙**: 컴포넌트는 PascalCase, 기타 파일은 kebab-case

---

## 🔐 인증 프로토콜 (Authentication Protocol v2.0) - Wave 1 완료 ✅

### 골든룰 (인증 관련 절대 준수)
1. **모든 클라이언트 fetch는 공용 래퍼 사용** ✅ Wave 1 100% 적용
   - `/src/lib/api-client.ts`의 `apiGet`, `apiPost`, `apiPut`, `apiDelete` 사용
   - 기본 옵션: `credentials: 'same-origin'`, `Content-Type: application/json`
   - 직접 `fetch()` 호출 금지 (외부 API 제외)

2. **서버 라우트는 세션 필수** ✅ Wave 1 95% 적용 (35/37 routes)
   - Route Handler 진입 시 세션 검사 → 없으면 `401` + `{ error: 'User not authenticated' }`
   - `userId`는 쿼리스트링으로 받지 말고 세션에서 파생
   - 세션 검사 템플릿:
   ```typescript
   const supabase = createRouteHandlerClient({ cookies });
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
     return new Response(
       JSON.stringify({ error: 'User not authenticated' }),
       { status: 401 }
     );
   }
   ```

3. **401 UX 처리**
   - 프론트는 401 수신 시 로그인 유도 (모달/리다이렉트)
   - "Failed to fetch" 문자열 노출 금지
   - 사용자 친화적 메시지: "인증이 필요합니다. 로그인 후 다시 시도해주세요."

4. **오리진/쿠키 불변식**
   - 로컬 개발: 반드시 `http://localhost:<port>`만 사용 (127.0.0.1 금지)
   - 프로덕션: HTTPS 필수, `NEXT_PUBLIC_SITE_URL` == 실제 접근 도메인
   - 세션 식별은 항상 쿠키 + 서버 검사

5. **기능 진입 전 인증 가드**
   - 컴렉션/폴더/즐겨찾기 등 사용자 데이터 의존 화면은 렌더 전 세션 체크
   - API 키 설정 화면은 인증 필수

### 인증 관련 Definition of Done - Wave 1 완료 ✅
- [x] 클라이언트가 **api-client만** 사용 (직정 fetch 없음) - 100% 완료
- [x] 신규/수정 Route가 **세션 검사 + JSON 에러 포맷** 준수 - 95% 완료
- [x] 401 수신 시 **로그인 유도 UX** 구현 - 완료
- [x] 로컬 실행 시 `localhost` 사용 (127.0.0.1 금지) - 완료

## 🛡️ 데이터 보호 프로토콜 (Data Protection v2.0) - Wave 2 완료 ✅

### RLS (Row Level Security) 정책 - 적용 대기
1. **21개 테이블 SQL 작성 완료** ✅
   - YouTube Lens 테이블 11개
   - 사용자 데이터 테이블 4개
   - 커뮤니티 테이블 3개
   - 강의/기타 테이블 3개
   - **적용 방법**: Supabase Dashboard에서 수동 실행 필요
   - **파일 위치**: `supabase/migrations/20250123000002_wave2_security_rls.sql`

2. **캐싱 정책 구현 완료** ✅
   - 개인 데이터: `Cache-Control: no-store` 적용
   - 공개 데이터: 5분 캐싱 허용
   - 보안 헤더: XSS, Clickjacking 방지
   - **미들웨어**: `src/middleware.ts` 자동 활성화

3. **비밀키 스캔 도구 사용** ✅
   ```bash
   # 프로젝트 전체 비밀키 스캔
   node scripts/security/scan-secrets.js
   ```
   - API 키, JWT, DB URL 탐지
   - 하드코딩된 비밀번호 검출
   - CRITICAL/HIGH 이슈 즉시 수정

### 데이터 보호 Definition of Done - Wave 2 완료 ✅
- [x] RLS 정책 SQL 작성 - 21개 테이블 100% 완료
- [x] 캐싱 정책 미들웨어 구현 - 완료
- [x] 비밀키 스캔 도구 구현 - 완료
- [ ] RLS 정책 프로덕션 적용 - 대기 중

## 🚀 고급 보안 프로토콜 (Advanced Security v3.0) - Wave 3 완료 ✅

### Rate Limiting 정책
1. **적용 방법**: 미들웨어 자동 활성화
   - IP 기반 일반 API: 분당 60회 제한
   - 인증 엔드포인트: 15분당 5회 제한
   - 파일 업로드: 시간당 10회 제한
   - **위치**: `src/lib/security/rate-limiter.ts`

2. **입력 검증 (Zod)** ✅
   - 모든 API Route에 Zod 스키마 적용
   - **사용법**:
   ```typescript
   import { validateRequestBody, createPostSchema } from '@/lib/security/validation-schemas';
   
   const validation = await validateRequestBody(request, createPostSchema);
   if (!validation.success) {
     return createValidationErrorResponse(validation.error);
   }
   ```

3. **XSS 방지** ✅
   - DOMPurify 기반 정화 함수 사용
   - **사용법**:
   ```typescript
   import { sanitizeRichHTML, sanitizeURL } from '@/lib/security/sanitizer';
   
   const safeContent = sanitizeRichHTML(userInput);
   const safeUrl = sanitizeURL(urlInput);
   ```

### 고급 보안 Definition of Done - Wave 3 완료 ✅
- [x] Rate Limiting 시스템 구현 - 완료
- [x] Zod 입력 검증 13개 스키마 - 완료
- [x] XSS 방지 DOMPurify 통합 - 완료
- [x] 보안 사용 예제 작성 - 완료

## 🔧 추가 보안 도구 (2025-01-24 구현) ✅

### RLS 정책 자동 적용
```bash
# pg 패키지 설치 필요
npm install pg

# 개선된 RLS 적용 (트랜잭션 기반)
npm run security:apply-rls-all     # 모든 Wave RLS 적용
npm run security:apply-rls-dry     # Dry-run 모드
npm run security:apply-rls-wave2   # Wave 2만 적용
```

### TTL 데이터 보관 정책
```bash
# 30일 이상 된 데이터 자동 정리
npm run security:ttl       # TTL 정책 실행
npm run security:ttl-dry   # Dry-run 모드
npm run security:ttl-force # 강제 삭제
```

### 보안 테스트 자동화
```bash
# 전체 보안 테스트 (Wave 0-3)
npm run security:test         # 기본 테스트
npm run security:test-verbose # 상세 모드

# 통합 보안 작업
npm run security:complete # RLS + TTL + 테스트
```

---

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

---

## 📁 프로젝트 구조

> 프로젝트 폴더 구조는 `/docs/CODEMAP.md` 참조

---

## 🎨 템플릿 기반 개발

필요시 shadcn/ui, HyperUI 등에서 적합한 템플릿 검색 후 프로젝트 요구사항에 맞게 수정 적용

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

## 🔧 작업 프로세스 (3단계 검증 시스템)

### 📋 Phase 1: Pre-Flight Check (작업 전)
1. **문서 확인**:
   - `/docs/FLOWMAP.md` - 사용자 플로우 확인
   - `/docs/WIREFRAME.md` - UI-API 연결 확인
   - `/docs/COMPONENT_INVENTORY.md` - 재사용 컴포넌트 확인
2. **현재 상태 파악**:
   - `/docs/PROJECT.md` - 현재 이슈 확인
   - `/docs/ROUTE_SPEC.md` - 라우트 구조 확인
3. **데이터 모델 확인**:
   - `/docs/DATA_MODEL.md` - 타입 매핑 확인
   - `/docs/STATE_FLOW.md` - 상태 관리 확인

### 🔨 Phase 2: Implementation (작업 중)
1. 요구사항 명확히 확인
2. 기존 코드/패턴 분석
3. shadcn/ui 컴포넌트 활용 방안 검토
4. 구현 후 타입 체크
5. 빌드 테스트
6. **문서 실시간 업데이트**:
   - 새 컴포넌트 → COMPONENT_INVENTORY.md
   - 새 라우트 → ROUTE_SPEC.md
   - API 연결 → WIREFRAME.md

### ✅ Phase 3: Post-Flight Validation (작업 후)
1. **에러 처리 확인**: `/docs/ERROR_BOUNDARY.md` 기준 준수
2. **체크리스트 검증**: `/docs/CHECKLIST.md` 모든 항목 확인
3. **문서 최종 업데이트**: 구현 상태 표시 (✅/⚠️/❌)

### 2. 문제 해결 시
1. 에러 메시지 정확히 분석
2. 관련 파일 Read로 확인
3. 최소한의 수정으로 해결
4. 부수 효과 확인

### 3. 빌드 전 체크리스트
> 체크리스트는 `/docs/CHECKLIST.md` 참조

### 4. 데이터베이스 테이블 검증 (2025-01-29 추가)
1. 테이블 상태 확인: `node scripts/verify-with-service-role.js`
2. 누락된 테이블 검사: `node scripts/check-missing-tables.js`
3. 반드시 21개 테이블 100% 생성 확인
> 
> **추가 검증 문서**:
> - UI 완성도: `/docs/WIREFRAME.md` 모든 연결 ✅ 확인
> - 라우트 보호: `/docs/ROUTE_SPEC.md` 인증 체크 확인
> - 에러 처리: `/docs/ERROR_BOUNDARY.md` 401 처리 확인

---

## ❌ 절대 금지 패턴

```typescript
// 금지 → 올바른 방법
className="..." → shadcn/ui 컴포넌트 사용
style={{...}} → Tailwind 클래스 사용
any 타입 → 명확한 타입 정의
'use client' 남발 → Server Component 기본, 필요시만 Client
```

---

## 📝 Git 작업 규칙

> Git 작업 규칙과 커밋 메시지 규칙은 `/docs/CHECKLIST.md` 참조

---

## 🔄 Supabase 마이그레이션 관리

> Supabase 마이그레이션 관리 방법은 `/docs/PROJECT.md`의 마이그레이션 섹션 참조

---

## 💬 커뮤니케이션

- 작업 전 의도 설명
- 중요 변경사항 사전 협의
- 에러 발생 시 즉시 보고
- 한국어로 명확한 소통

---

## 🧪 dhacle.com 사이트에서 실제 기능 테스트 할 때 반드시 참고 할 내용

### 배포 환경 정보
- **프로덕션 URL**: https://dhacle.com
- **호스팅**: Vercel (자동 배포 설정됨)
- **데이터베이스**: Supabase (golbwnsytwbyoneucunx)

### 로그인 버튼은 button has text '카카오' 로 찾을 것.

### 테스트 계정 (카카오 로그인)
```
ID: glemfkcl@naver.com
PW: dhfl9909
```
*주의: 사용자의 실제 인증이 필요하므로 로그인 버튼 클릭후에는 잠시 (1분) 대기해야하며 로그인이 완료되면 실제 테스트할 페이지로 다시 이동하여 테스트 진행할것.

### YouTube Lens 테스트 절차
1. **사이트의 로그인 페이지 접속**: https://dhacle.com/auth/login
2. **카카오 로그인**: 위 테스트 계정 사용
3. **YouTube Lens 페이지**: `/tools/youtube-lens` 이동
4. **기능별 테스트**:
   - 인기 Shorts 조회
   - 채널 폴더 관리
   - 컬렉션 생성/조회
   - 비디오 저장

### 테스트 시 확인 사항
- [ ] 로컬 개발 환경 테스트 (`npm run dev`)
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] **프로덕션 배포 후 실제 사이트에서 테스트**
- [ ] 브라우저 콘솔 에러 확인
- [ ] Network 탭에서 API 응답 확인
- [ ] 보안 테스트 실행 (`npm run security:test`) - 현재 38%, 목표 100%

---

## ⚠️ 주의사항

### 알려진 이슈
1. **보안**: auth/callback/route.ts의 하드코딩된 자격 증명 (환경 변수 이관 필요)
2. **구조**: 일부 layout.tsx, page.tsx 미구현 상황 있음 (사용자와 협의)
3. **클라이언트**: browser-client.ts Mock 반환 로직 불완전

### 해결된 이슈 (2025-01-22)
1. ✅ **API 키 Import 오류**: createServerClient 사용으로 통일
2. ✅ **에러 메시지 불명확**: 상세한 에러 로깅 추가
3. ✅ **saveSearchHistory 누락**: 함수 호출 주석 처리
4. ✅ **YouTube Lens 인증 문제**: api-client 래퍼로 credentials 자동 포함
5. ✅ **Wave 1 보안 강화**: 세션 검사 95%, api-client 100% 적용 완료
6. ✅ **데이터베이스 테이블 검증**: 21개 테이블 100% 생성 확인 (2025-01-29)

### 진행 중인 이슈 (2025-01-29)
1. ⚠️ **YouTube Lens API 오류**: 400/404/500 에러 발생 (긴급)
2. ⚠️ **보안 테스트 성공률**: 38% - Rate Limiting, XSS 방지 미작동
3. ⚠️ **일부 컴포넌트 직접 fetch**: api-client 전환 필요 (15% 미적용)

---

*이 문서는 AI 작업 지침서입니다. 프로젝트 상태는 `/docs/PROJECT.md` 참조*