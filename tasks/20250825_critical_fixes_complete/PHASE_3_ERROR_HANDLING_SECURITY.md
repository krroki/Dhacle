/sc:improve --seq --validate --think --persona-security
"Phase 3: 에러 처리 개선 및 보안 강화 - Silent failures 제거, API 보호, RLS 적용"

# Phase 3: 에러 처리 개선 및 보안 강화

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- API Routes: `src/app/api/*/route.ts`
- 미보호 routes:
  - `src/app/api/youtube/webhook/route.ts`
  - `src/app/auth/callback/route.ts`
- 에러 처리: 전체 catch 블록 (231개)
- RLS 미적용 테이블:
  - user_roles
  - course_badges_extended
  - user_certificates
  - course_reviews (확인 필요)

### 프로젝트 컨텍스트 확인
```bash
# Silent failures 확인
grep -r "catch.*{" src/ --include="*.ts" --include="*.tsx" | wc -l  # 231개

# 미보호 routes 확인
node scripts/verify-auth-implementation.js | grep "Unprotected"

# RLS 상태 확인
node scripts/verify-database.js | grep "RLS"
```

## 📌 목적
모든 에러를 적절히 처리하고, API 보안을 완성하며, 데이터베이스 보안을 강화

## 🤖 실행 AI 역할
보안 전문가 및 에러 처리 아키텍트로서 프로젝트의 모든 보안 취약점과 에러 처리 문제를 해결

## 📝 작업 내용

### 1단계: Silent Failures 제거 (231개 → <10개)

#### 1.1 에러 처리 유틸리티 생성
```typescript
// src/lib/error-handler.ts
import { logger } from '@/lib/logger';
import { toast } from '@/hooks/use-toast';

export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, context?: string): void {
  // 에러 타입 체크
  if (error instanceof AppError) {
    logger.error(`[${context}] AppError:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });
    
    // 사용자에게 보여줄 메시지
    if (typeof window !== 'undefined') {
      toast.error(error.message);
    }
    return;
  }

  if (error instanceof Error) {
    logger.error(`[${context}] Error:`, {
      message: error.message,
      stack: error.stack,
    });
    
    if (typeof window !== 'undefined') {
      toast.error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    return;
  }

  // Unknown error
  logger.error(`[${context}] Unknown error:`, error);
  if (typeof window !== 'undefined') {
    toast.error('알 수 없는 오류가 발생했습니다.');
  }
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
```

#### 1.2 모든 catch 블록 수정 패턴
```typescript
// 현재 (잘못됨) - Silent failure
try {
  // ... code
} catch {}

// 또는
try {
  // ... code
} catch (e) {}

// 수정 후 - 적절한 에러 처리
import { handleError } from '@/lib/error-handler';

try {
  // ... code
} catch (error) {
  handleError(error, 'ComponentName.functionName');
  // 필요한 경우 재throw
  throw error;
}

// API Route에서
try {
  // ... code
} catch (error) {
  logger.error('API Error:', error);
  return NextResponse.json(
    { 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    },
    { status: 500 }
  );
}
```

#### 1.3 React 컴포넌트 에러 처리
```typescript
// 비동기 함수에서
const handleSubmit = async (data: FormData) => {
  try {
    setLoading(true);
    const result = await apiCall(data);
    // 성공 처리
  } catch (error) {
    handleError(error, 'FormComponent.handleSubmit');
    // UI 상태 복구
    setLoading(false);
  }
};

// useEffect에서
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await loadData();
      setData(data);
    } catch (error) {
      handleError(error, 'Component.useEffect.fetchData');
      setError(true);
    }
  };
  
  fetchData();
}, []);
```

### 2단계: 미보호 API Routes 보호 (2개)

#### 2.1 `src/app/api/youtube/webhook/route.ts` 수정
```typescript
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { env } from '@/env';

// Webhook은 YouTube에서 호출하므로 다른 인증 방식 사용
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Webhook 서명 검증
    const signature = request.headers.get('x-hub-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // 시크릿 확인
    const secret = env.YOUTUBE_WEBHOOK_SECRET;
    if (!secret) {
      logger.error('YouTube webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // 서명 검증
    const body = await request.text();
    const expectedSignature = `sha1=${crypto
      .createHmac('sha1', secret)
      .update(body)
      .digest('hex')}`;

    if (signature !== expectedSignature) {
      logger.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Webhook 처리
    const data = JSON.parse(body);
    // ... webhook 로직

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET은 YouTube의 검증 요청
export async function GET(request: NextRequest): Promise<NextResponse> {
  // hub.challenge 파라미터 반환 (YouTube 검증)
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('hub.challenge');
  
  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
}
```

#### 2.2 `src/app/auth/callback/route.ts` 수정
```typescript
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Auth callback은 Supabase에서 호출하므로 requireAuth 불필요
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';

    if (!code) {
      logger.warn('Auth callback without code');
      return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin));
    }

    const supabase = await createSupabaseRouteHandlerClient();
    
    // 코드 교환
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    // 세션 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('No user after code exchange');
      return NextResponse.redirect(new URL('/login?error=no_user', requestUrl.origin));
    }

    logger.info('Successful auth callback', { userId: user.id });

    // 리다이렉트
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    logger.error('Auth callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=callback_failed', request.url)
    );
  }
}
```

### 3단계: RLS 정책 적용 (4개 테이블)

#### 3.1 RLS 정책 SQL 생성
```sql
-- supabase/migrations/20250825_apply_missing_rls.sql

-- user_roles 테이블 RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 역할만 조회 가능
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- 관리자만 역할 생성/수정 가능
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- course_badges_extended 테이블 RLS
ALTER TABLE course_badges_extended ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 배지만 조회
CREATE POLICY "Users can view own badges" ON course_badges_extended
  FOR SELECT USING (user_id = auth.uid());

-- 시스템만 배지 생성 가능 (서비스 역할 사용)
CREATE POLICY "System can create badges" ON course_badges_extended
  FOR INSERT WITH CHECK (false);

-- user_certificates 테이블 RLS
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 인증서만 조회
CREATE POLICY "Users can view own certificates" ON user_certificates
  FOR SELECT USING (user_id = auth.uid());

-- 공개 인증서는 모두 조회 가능
CREATE POLICY "Public certificates viewable by all" ON user_certificates
  FOR SELECT USING (is_public = true);

-- 시스템만 인증서 생성 가능
CREATE POLICY "System can create certificates" ON user_certificates
  FOR INSERT WITH CHECK (false);

-- course_reviews 테이블 RLS (존재하는 경우)
ALTER TABLE IF EXISTS course_reviews ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 리뷰 조회 가능
CREATE POLICY "Reviews are public" ON course_reviews
  FOR SELECT USING (true);

-- 인증된 사용자만 리뷰 작성 가능
CREATE POLICY "Authenticated users can create reviews" ON course_reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 작성자만 자신의 리뷰 수정/삭제 가능
CREATE POLICY "Users can manage own reviews" ON course_reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews" ON course_reviews
  FOR DELETE USING (user_id = auth.uid());
```

#### 3.2 RLS 정책 적용 스크립트
```bash
# RLS 적용 실행
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/20250825_apply_missing_rls.sql

# 적용 확인
node scripts/verify-database.js | grep "RLS"
```

### 4단계: 로깅 시스템 개선

#### 4.1 `src/lib/logger.ts` 업데이트
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...context,
    };
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    console.error(this.formatMessage('error', message, errorContext));
  }
}

export const logger = new Logger();
```

## ✅ 완료 조건

### 필수 체크리스트
- [ ] Silent failures < 10개
  ```bash
  # 적절한 에러 처리가 있는 catch 블록만 허용
  grep -r "catch.*{" src/ --include="*.ts" --include="*.tsx" | grep -v "handleError\|logger\|console" | wc -l  # <10 expected
  ```
- [ ] 모든 API routes 보호
  ```bash
  node scripts/verify-auth-implementation.js  # 0 unprotected expected
  ```
- [ ] RLS 100% 적용
  ```bash
  node scripts/verify-database.js | grep "RLS" | grep "미적용"  # 0 expected
  ```
- [ ] 보안 검증 통과
  ```bash
  npm run verify:security  # All pass expected
  ```

### 품질 기준
- [ ] 모든 에러 로깅
- [ ] 사용자 친화적 에러 메시지
- [ ] 보안 취약점 없음
- [ ] 로그에 민감정보 없음

## 📋 QA 테스트 시나리오

### 에러 처리 테스트
```typescript
// 1. 네트워크 에러 시뮬레이션
// DevTools > Network > Offline
// 각 기능 테스트하여 적절한 에러 메시지 확인

// 2. API 에러 응답 테스트
// 401, 403, 404, 500 에러 각각 확인

// 3. 폼 검증 에러
// 잘못된 입력으로 폼 제출
```

### 보안 테스트
```bash
# 1. 인증 없이 API 호출
curl http://localhost:3000/api/user/profile
# Expected: 401 Unauthorized

# 2. 다른 사용자 데이터 접근 시도
# 로그인 후 다른 사용자 ID로 요청

# 3. SQL Injection 시도
curl "http://localhost:3000/api/search?q='; DROP TABLE users;--"
# Expected: 정상 처리 (파라미터화된 쿼리)

# 4. XSS 시도
# 폼에 <script>alert('XSS')</script> 입력
# Expected: 이스케이프 처리
```

### RLS 테스트
```sql
-- Supabase Dashboard > SQL Editor
-- 다른 사용자로 로그인 후

-- 다른 사용자 데이터 조회 시도
SELECT * FROM user_roles WHERE user_id = 'other-user-id';
-- Expected: 0 rows

-- 자신의 데이터만 조회 가능
SELECT * FROM user_roles WHERE user_id = auth.uid();
-- Expected: 자신의 데이터만
```

## 🔄 롤백 계획

### 실패 시 롤백
```bash
# 에러 처리 롤백
git checkout -- src/lib/error-handler.ts
git checkout -- src/lib/logger.ts

# API 보안 롤백
git checkout -- src/app/api/youtube/webhook/route.ts
git checkout -- src/app/auth/callback/route.ts

# RLS 롤백 (주의: 데이터베이스 변경)
# RLS 정책 제거 SQL 실행
```

## 🚨 주의사항

### 절대 금지
- ❌ 빈 catch 블록
- ❌ console.log만으로 에러 처리
- ❌ 민감정보 로깅
- ❌ 에러 무시

### 필수 수행
- ✅ 모든 에러 로깅
- ✅ 사용자 친화적 메시지
- ✅ 보안 검증
- ✅ RLS 정책 테스트

## 📊 예상 결과

### Before
```
Silent failures: 231개
미보호 routes: 2개
RLS 미적용: 4개 테이블
보안 검증: 실패
```

### After
```
Silent failures: <10개
미보호 routes: 0개 (의도적 예외 제외)
RLS 미적용: 0개
보안 검증: 통과
```

## 🎯 최종 검증

### 전체 시스템 검증
```bash
# 1. 병렬 검증
npm run verify:parallel
# Expected: 8/8 checks passed

# 2. 빌드 테스트
npm run build
# Expected: Success

# 3. 프로덕션 준비도
npm run verify:all
# Expected: All green
```

---

**⚠️ 최종 Phase**: 이 작업이 완료되면 모든 Critical Fixes가 해결됩니다!
**🎯 목표**: 프로덕션 준비도 100% 달성