# 🛡️ 보안 구현 가이드

*Wave 0-3 완료된 보안 시스템, RLS 정책, Rate Limiting, 입력 검증*

---

## 🛑 보안 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **세션 체크 없는 API → 중단**
- **getSession() 사용 → 중단**
- **입력 검증 없음 → 중단**
- **보안 헤더 없음 → 중단**

### 2️⃣ MUST - 필수 행동
```typescript
// 모든 API 세션 검사 필수
const { data: { user } } = await supabase.auth.getUser();
if (!user) return 401;

// Zod 입력 검증 필수
const validation = await validateRequestBody(request, schema);
if (!validation.success) return 400;

// XSS 방지 필수
const sanitized = sanitizeRichHTML(userInput);

// Rate Limiting 필수
const limited = await rateLimiter.check(request, 'api');
if (limited) return 429;
```

### 3️⃣ CHECK - 검증 필수
```bash
# 보안 테스트
npm run security:test
# RLS 정책 확인
node scripts/verify-with-service-role.js
# 실제 API 테스트
curl -X POST http://localhost:3000/api/endpoint
```

## 🚫 보안 any 타입 금지
- Zod 스키마 정확한 타입
- 에러 응답 타입 정의
- 사용자 입력 unknown → 검증 후 타입

---

## 🚨 보안 Wave 현황

| Wave | 상태 | 구현 내용 |
|------|------|----------|
| Wave 0 | ✅ 완료 | 기본 RLS 정책, 환경변수 보호 |
| Wave 1 | ✅ 완료 | 인증 통합, 세션 체크 100% |
| Wave 2 | ✅ 완료 | 21개 테이블 RLS 정책 작성 |
| Wave 3 | ✅ 완료 | Rate Limiting, Zod 검증, XSS 방지 |

---

## 🔐 인증 골든룰

### 1. **모든 API는 세션 검사 필수**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json(
    { error: 'User not authenticated' },
    { status: 401 }
  );
}
```

### 2. **getUser() 사용** (getSession() 금지)
- `getUser()`: 서버에서 토큰 검증 ✅
- `getSession()`: 클라이언트 토큰 신뢰 ❌

### 3. **401 에러 표준 형식 준수**
```json
{ "error": "User not authenticated" }
```

### 4. **userId는 세션에서만 추출**
```typescript
// ❌ 금지 - 조작 가능
const userId = request.nextUrl.searchParams.get('userId');

// ✅ 올바름 - 세션에서 추출
const userId = user.id;
```

---

## ⚡ Rate Limiting (자동 활성화)

### 설정 (`src/lib/security/rate-limiter.ts`)
```typescript
const rateLimits = {
  // IP 기반 일반 API
  api: {
    windowMs: 60 * 1000,     // 1분
    max: 60,                  // 60회
  },
  
  // 인증 엔드포인트
  auth: {
    windowMs: 15 * 60 * 1000, // 15분
    max: 5,                    // 5회
  },
  
  // 파일 업로드
  upload: {
    windowMs: 60 * 60 * 1000, // 1시간
    max: 10,                   // 10회
  }
};
```

### 사용 예시
```typescript
import { rateLimiter } from '@/lib/security/rate-limiter';

export async function POST(request: Request) {
  // Rate limiting 체크
  const limited = await rateLimiter.check(request, 'api');
  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // 비즈니스 로직...
}
```

---

## 🔍 입력 검증 (Zod)

### 스키마 정의
```typescript
import { z } from 'zod';

// 게시글 생성 스키마
export const createPostSchema = z.object({
  title: z.string()
    .min(1, '제목은 필수입니다')
    .max(200, '제목은 200자 이내여야 합니다'),
  content: z.string()
    .min(1, '내용은 필수입니다')
    .max(10000, '내용은 10000자 이내여야 합니다'),
  tags: z.array(z.string())
    .max(5, '태그는 최대 5개까지 가능합니다')
    .optional(),
  isPublic: z.boolean().default(false)
});

// 이메일 검증
export const emailSchema = z.string()
  .email('올바른 이메일 형식이 아닙니다')
  .toLowerCase();

// 전화번호 검증
export const phoneSchema = z.string()
  .regex(/^010-\d{4}-\d{4}$/, '010-XXXX-XXXX 형식이어야 합니다');
```

### API Route에서 사용
```typescript
import { validateRequestBody } from '@/lib/security/validation-schemas';
import { createPostSchema } from './schemas';

export async function POST(request: Request) {
  // 입력 검증
  const validation = await validateRequestBody(request, createPostSchema);
  if (!validation.success) {
    return createValidationErrorResponse(validation.error);
  }
  
  // 검증된 데이터 사용
  const { title, content, tags } = validation.data;
  
  // DB 저장...
}
```

### 에러 응답 헬퍼
```typescript
import { ZodError } from 'zod';

export function createValidationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      issues: error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    },
    { status: 400 }
  );
}
```

---

## 🧹 XSS 방지 (DOMPurify)

### HTML 컨텐츠 정화
```typescript
import { sanitizeRichHTML, sanitizeURL } from '@/lib/security/sanitizer';

// 리치 텍스트 정화
const safeContent = sanitizeRichHTML(userInput);
// 허용: <p>, <strong>, <em>, <a>, <ul>, <li> 등
// 제거: <script>, onclick, onerror 등

// URL 검증 및 정화
const safeUrl = sanitizeURL(userInput);
// 허용: http://, https://, mailto:
// 제거: javascript:, data:, vbscript:
```

### 설정 옵션
```typescript
// 커스텀 설정
const customSanitize = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: { html: true }
  });
};
```

---

## 🔒 RLS 정책 적용

### 21개 테이블 정책 (Wave 2)
```bash
# 모든 Wave RLS 적용
npm run security:apply-rls-all

# Dry-run 모드 (미리보기)
npm run security:apply-rls-dry

# 특정 Wave만 적용
npm run security:apply-rls-wave2
```

### 기본 RLS 템플릿
```sql
-- 1. RLS 활성화
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- 2. 자신의 데이터만 접근
CREATE POLICY "users_own_data" ON table_name
  FOR ALL USING (auth.uid() = user_id);

-- 3. 공개 데이터 조회
CREATE POLICY "public_read" ON table_name
  FOR SELECT USING (is_public = true);

-- 4. 인증된 사용자만 생성
CREATE POLICY "authenticated_insert" ON table_name
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

---

## 🗑️ TTL 데이터 정책

### 자동 정리 설정
```bash
# 30일 이상 데이터 정리
npm run security:ttl

# Dry-run 모드
npm run security:ttl-dry

# 강제 삭제
npm run security:ttl-force
```

### TTL 정책 예시
```sql
-- 30일 이상된 로그 삭제
DELETE FROM logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- 90일 이상된 임시 데이터 삭제
DELETE FROM temp_data 
WHERE created_at < NOW() - INTERVAL '90 days';

-- 1년 이상된 비활성 계정 처리
UPDATE users 
SET status = 'inactive' 
WHERE last_login < NOW() - INTERVAL '1 year';
```

---

## 🔐 비밀키 스캔

### 스캔 실행
```bash
# 프로젝트 전체 스캔
node scripts/security/scan-secrets.js

# 결과 예시
🔍 Scanning for secrets...
❌ CRITICAL: API key found in src/config.ts:15
⚠️  HIGH: Hardcoded password in test/fixtures.js:23
✅ No secrets found in production code
```

### 탐지 패턴
- API 키: `api[_-]?key`
- JWT: `eyJ[A-Za-z0-9-_]+`
- AWS: `AKIA[0-9A-Z]{16}`
- DB URL: `postgres://`, `mysql://`
- 비밀번호: `password\s*=\s*["'][^"']+["']`

---

## 🧪 보안 테스트

### 전체 테스트 실행
```bash
# 모든 보안 테스트
npm run security:test

# 상세 모드
npm run security:test-verbose

# 통합 보안 작업
npm run security:complete  # RLS + TTL + 테스트
```

### 테스트 항목
- [ ] 인증 우회 시도
- [ ] SQL Injection 방어
- [ ] XSS 방어
- [ ] CSRF 방어
- [ ] Rate Limiting 동작
- [ ] RLS 정책 적용
- [ ] 민감정보 노출

---

## 📋 보안 체크리스트

### API Route
- [ ] 세션 체크 구현
- [ ] 입력 검증 (Zod)
- [ ] Rate Limiting 적용
- [ ] 에러 메시지 점검

### 데이터베이스
- [ ] RLS 정책 활성화
- [ ] 인덱스 최적화
- [ ] 백업 전략 수립
- [ ] 트랜잭션 처리

### Frontend
- [ ] XSS 방지 적용
- [ ] 민감정보 숨김
- [ ] HTTPS 강제
- [ ] CSP 헤더 설정

### 환경변수
- [ ] 하드코딩 제거
- [ ] env.ts 사용
- [ ] 프로덕션 분리
- [ ] 정기 로테이션

---

## 🚨 보안 사고 대응

### 1. 즉시 조치
```bash
# 의심 계정 차단
UPDATE users SET status = 'blocked' WHERE id = 'suspect_id';

# Rate Limiting 강화
npm run security:enhance-rate-limit

# 로그 수집
npm run security:collect-logs
```

### 2. 분석 및 복구
- 침해 범위 파악
- 영향받은 데이터 확인
- 백업에서 복구
- 보안 패치 적용

### 3. 재발 방지
- 취약점 분석
- 보안 정책 강화
- 모니터링 강화
- 정기 감사 실시

---

## 📁 관련 파일

- Rate Limiter: `/src/lib/security/rate-limiter.ts`
- Validation: `/src/lib/security/validation-schemas.ts`
- Sanitizer: `/src/lib/security/sanitizer.ts`
- RLS 적용: `/scripts/security/apply-rls-improved.js`
- 비밀키 스캔: `/scripts/security/scan-secrets.js`

---

*보안 작업 시 이 문서를 우선 참조하세요.*