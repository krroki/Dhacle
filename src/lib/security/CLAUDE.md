# 🛡️ 보안 시스템 지침

*보안 전문가 - Security Agent 자동 활성화*

**자동 활성화**: security, auth 관련 파일 Edit/Write/MultiEdit 시  
**전문 분야**: RLS 정책, XSS 방지, Rate Limiting, 환경변수 보안

---

## 🛑 Security 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **RLS 없는 테이블 생성 → 중단**
- **innerHTML 직접 사용 → 중단** (XSS 위험)
- **환경변수 하드코딩 → 중단**
- **세션 검증 없는 API → 중단**
- **입력 검증 생략 → 중단**

### 2️⃣ MUST - 필수 행동
```typescript
// RLS 정책 즉시 추가 (필수)
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own records" ON new_table FOR ALL USING (auth.uid() = user_id);

// XSS 방지 필수
import { sanitizeRichHTML } from '@/lib/security/sanitizer';
const safeContent = sanitizeRichHTML(userInput);

// Zod 입력 검증 필수
import { validateRequestBody } from '@/lib/security/validation-schemas';
const validation = await validateRequestBody(request, schema);

// 환경변수 타입 안전 사용
import { env } from '@/env';  // process.env 직접 접근 금지
```

### 3️⃣ CHECK - 검증 필수
```bash
# 보안 검증 필수
npm run security:test                           # 보안 테스트
node scripts/verify-with-service-role.js        # RLS 정책 확인
npm run types:check                             # 타입 안전성 확인
```

## 🚫 Security any 타입 금지

### ❌ 발견된 문제: validation-schemas.ts
```typescript
// ❌ 절대 금지 - 보안 검증에서 any 타입
const userData: any = await request.json();

// ✅ 즉시 수정 - Zod 스키마로 타입 안전 검증
const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(18).max(120)
});
const validation = userSchema.safeParse(userData);
```

### 🛡️ 예방책
- **Zod 스키마**: 모든 사용자 입력에 구체적 스키마 정의
- **타입 가드**: unknown → 검증된 타입으로 변환
- **Security Agent 연계**: security 관련 파일 수정 시 자동 활성화

---

## 🚨 Security 필수 패턴

### 패턴 1: RLS 정책 즉시 적용 (테이블 생성 시)
```sql
-- ✅ 테이블 생성과 동시에 RLS 활성화 (필수)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화 (절대 생략 금지!)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 기본 정책 생성 (사용자별 접근 제어)
CREATE POLICY "Users can read own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 패턴 2: XSS 방지 (사용자 입력 처리)
```typescript
// ✅ 모든 사용자 입력에 XSS 방지 적용
import { sanitizeRichHTML } from '@/lib/security/sanitizer';

// 리치 에디터 콘텐츠
const safeContent = sanitizeRichHTML(userInput);
await supabase.from('posts').insert({ content: safeContent });

// HTML 렌더링 시
<div dangerouslySetInnerHTML={{ __html: sanitizeRichHTML(content) }} />

// ❌ 절대 금지 - innerHTML 직접 사용
// element.innerHTML = userInput;  // XSS 공격 위험!
```

### 패턴 3: 환경변수 보안 (하드코딩 방지)
```typescript
// ✅ 타입 안전 환경변수 사용
import { env } from '@/env';

const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const encryptionKey = env.ENCRYPTION_KEY;

// ❌ 절대 금지 - 하드코딩된 비밀값
// const key = "fc28f35efe5b90d34e54...";  // Git에 노출 위험!
// const token = "sk-proj-...";           // 보안 취약점!
```

---

## 📋 Security 검증 명령어

```bash
# 즉시 보안 검증
npm run security:test                    # Zod 스키마, XSS 방지 테스트
node scripts/verify-with-service-role.js # RLS 정책 동작 확인

# 상세 검증
npm run types:check                      # 환경변수 타입 안전성
npm run build                           # 환경변수 누락 체크

# RLS 정책 테스트
curl -X GET http://localhost:3000/api/posts  # 인증된 사용자만 접근
```

---

## 🎯 Security 성공 기준

- [ ] **RLS 정책**: 모든 사용자 테이블에 적용 (현재: 0% 커버리지)
- [ ] **XSS 방지**: innerHTML 사용 0개, sanitizeRichHTML 적용
- [ ] **환경변수 보안**: 하드코딩 0개, env.ts 사용
- [ ] **입력 검증**: Zod 스키마로 모든 API 입력 검증
- [ ] **Rate Limiting**: API 보호, 남용 방지

---

## ⚠️ Security 주의사항

### 자주 하는 실수
- **RLS 정책 생략**: 테이블 생성 후 RLS 정책 추가 잊음
- **innerHTML 직접 사용**: XSS 공격 경로 생성
- **환경변수 하드코딩**: Git에 민감정보 노출
- **입력 검증 신뢰**: 클라이언트 검증에만 의존

### 함정 포인트
- **서비스 역할 키**: 클라이언트에서 절대 사용 금지
- **CORS 설정**: 와일드카드 '*' 사용 금지
- **세션 토큰**: URL에 포함하지 말고 쿠키 사용
- **SQL 인젝션**: Supabase 쿼리도 parameterized 사용

---

## 📁 관련 파일

- **입력 검증**: [validation-schemas.ts](validation-schemas.ts)
- **XSS 방지**: [sanitizer.ts](sanitizer.ts)  
- **환경변수**: [/env.ts](../../../env.ts)
- **Rate Limiting**: [rate-limiter.ts](rate-limiter.ts)

---

*Security 작업 시 이 지침을 필수로 준수하세요. Security Agent가 자동으로 활성화되어 보안 규칙 위반을 즉시 차단합니다.*