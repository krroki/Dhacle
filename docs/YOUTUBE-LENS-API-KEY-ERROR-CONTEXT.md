# YouTube Lens API Key 저장 오류 현황 정리

## 🔴 현재 문제 상황

**배포 환경**: https://dhacle.com (Vercel 배포)
**문제 기능**: YouTube Lens API Key 저장 기능
**현재 상태**: API Key 검증은 성공하지만 저장 시 오류 발생

### 오류 진행 과정
1. ✅ "유효한 API key입니다" - 검증 성공
2. ❌ "Failed to save API key" - 저장 실패

## 📊 문제 해결 진행 상황

### Phase 1: 초기 오류 (해결됨)
- **오류**: "Failed to encrypt API key"
- **원인**: ENCRYPTION_KEY 환경 변수 미설정
- **해결**: 
  - Vercel에 ENCRYPTION_KEY 추가 (64자 hex 문자열)
  - API routes에 `export const dynamic = 'force-dynamic'` 추가
- **상태**: ✅ 해결 완료

### Phase 2: 현재 오류 (진행 중)
- **오류**: "Failed to save API key"
- **원인 추정**: 
  1. SUPABASE_SERVICE_ROLE_KEY 미설정 또는 잘못된 값
  2. user_api_keys 테이블 접근 권한 문제
  3. RLS(Row Level Security) 정책 문제

## 🔧 적용된 수정사항

### 1. 코드 수정
```typescript
// /src/app/api/user/api-keys/route.ts
// /src/app/api/youtube/validate-key/route.ts
export const dynamic = 'force-dynamic';  // 추가됨

// /src/lib/api-keys/crypto.ts
// 디버깅 로그 추가 (프로덕션에서 제거 필요)
console.log('[DEBUG] Environment check:', {...});
```

### 2. Vercel 환경 변수 설정 현황

| 환경 변수 | 설정 여부 | 상태 |
|----------|----------|------|
| ENCRYPTION_KEY | ✅ 설정됨 | 정상 작동 |
| NEXT_PUBLIC_SUPABASE_URL | ✅ 설정됨 | 정상 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ 설정됨 | 정상 |
| SUPABASE_SERVICE_ROLE_KEY | ❓ 확인 필요 | **문제 원인 가능성 높음** |

## 🎯 즉시 확인 필요 사항

### 1. Supabase Service Role Key 확인
```bash
# Supabase Dashboard에서 확인
1. https://app.supabase.com 접속
2. Settings → API
3. service_role (secret) 복사
4. Vercel에 설정 (Sensitive 활성화)
```

### 2. 데이터베이스 테이블 확인
```sql
-- user_api_keys 테이블이 존재하는지 확인
-- Supabase Dashboard → Table Editor에서 확인
```

### 3. RLS 정책 확인
```sql
-- user_api_keys 테이블의 RLS 정책 확인
-- 특히 INSERT, UPDATE 권한 확인
```

## 💡 다음 AI를 위한 작업 가이드

### 우선순위 1: Vercel 환경 변수 확인
1. Vercel Dashboard에서 SUPABASE_SERVICE_ROLE_KEY 확인
2. 값이 'your-supabase-service-role-key-here' 같은 placeholder인지 확인
3. 실제 키로 교체 필요

### 우선순위 2: 에러 로깅 강화
```typescript
// /src/lib/api-keys/index.ts의 saveUserApiKey 함수
// 86번, 102번 줄의 error를 더 상세히 로깅
if (error) {
  console.error('Supabase error details:', {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint
  });
  throw error;
}
```

### 우선순위 3: Supabase 테이블 스키마 생성
```sql
-- 테이블이 없다면 생성
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL DEFAULT 'youtube',
  api_key_masked TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_valid BOOLEAN DEFAULT true,
  validation_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  usage_today INTEGER DEFAULT 0,
  usage_date DATE,
  UNIQUE(user_id, service_name)
);

-- RLS 활성화
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "Users can manage their own API keys" ON user_api_keys
  FOR ALL USING (auth.uid() = user_id);
```

### 우선순위 4: Vercel Functions 로그 확인
```bash
# Vercel Dashboard에서
1. Functions 탭 접속
2. api/user/api-keys 함수 선택
3. Logs 확인
4. 실제 에러 메시지 확인
```

## 📁 관련 파일 목록

- `/src/app/api/user/api-keys/route.ts` - API 엔드포인트
- `/src/app/api/youtube/validate-key/route.ts` - 검증 엔드포인트
- `/src/lib/api-keys/index.ts` - 핵심 로직 (saveUserApiKey 함수)
- `/src/lib/api-keys/crypto.ts` - 암호화 로직
- `/.env.local` - 로컬 환경 변수
- `/.env.local.example` - 환경 변수 예시

## 🔑 핵심 정보

- **프로젝트**: 디하클(Dhacle) - YouTube Shorts 크리에이터 교육 플랫폼
- **기술 스택**: Next.js 15.4.6, Supabase, TypeScript
- **배포**: Vercel
- **문제 발생 위치**: 프로덕션 환경 (dhacle.com)
- **로컬 환경**: 정상 작동 (환경 변수 설정됨)

## ⚠️ 주의사항

1. 디버깅 코드가 crypto.ts에 추가되어 있음 (프로덕션에서 제거 필요)
2. ENCRYPTION_KEY 변경 시 기존 저장된 API Key 모두 사용 불가
3. Service Role Key는 절대 클라이언트에 노출되면 안 됨

## 🚀 최종 해결 예상 시나리오

1. **가장 가능성 높음**: SUPABASE_SERVICE_ROLE_KEY가 placeholder 값
   - 해결: Supabase에서 실제 키 복사 후 Vercel 설정

2. **두 번째 가능성**: user_api_keys 테이블 없음
   - 해결: 위의 SQL 스크립트로 테이블 생성

3. **세 번째 가능성**: RLS 정책 문제
   - 해결: RLS 정책 재설정 또는 Service Role Key 사용 확인

---

*이 문서는 2025-01-14 작성됨*
*작성자: Claude (이전 세션)*