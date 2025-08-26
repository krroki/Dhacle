/sc:implement --seq --validate --think
"Phase 1: API 보안 긴급 조치 - 모든 API Route에 requireAuth 적용"

# 🚨 Phase 1: API 보안 긴급 조치 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- API Routes: `src/app/api/*/route.ts`
- 인증 함수: `src/lib/api-auth.ts`
- 타입 정의: `src/types/index.ts`

### 프로젝트 컨텍스트 확인
```bash
# API 라우트 개수 확인
find src/app/api -name "route.ts" -type f | wc -l

# requireAuth 사용 현황 확인
grep -r "requireAuth" src/app/api/ | wc -l

# getSession 사용 현황 확인  
grep -r "getSession" src/ | wc -l
```

## 📌 목적
**0% 보호 상태인 모든 API 라우트에 인증 보호 적용**
- 현재: 30개 API 라우트 무방비 상태
- 목표: 100% requireAuth 적용

## 🤖 실행 AI 역할
보안 전문가로서 모든 API 엔드포인트에 인증 및 권한 검사를 구현

## 📝 작업 내용

### Step 1: requireAuth 함수 확인 및 개선
```typescript
// src/lib/api-auth.ts 확인
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function requireAuth(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// 권한 체크 함수 추가
export async function requireRole(request: NextRequest, requiredRole: string) {
  const user = await requireAuth(request);
  if (!user) return null;
  
  // user_roles 테이블에서 권한 확인
  const supabase = createSupabaseServerClient();
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (role?.role !== requiredRole) {
    return null;
  }
  
  return user;
}
```

### Step 2: 모든 API Route 파일 수정

#### 2.1 YouTube API Routes
```typescript
// src/app/api/youtube/analysis/route.ts
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Step 1: 인증 체크 (필수!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to YouTube analysis API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Step 2: Rate limiting 체크
    // ... existing rate limit logic
    
    // Step 3: 기존 비즈니스 로직
    // ... existing implementation
    
  } catch (error) {
    logger.error('YouTube analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2.2 Revenue Proof Routes
```typescript
// src/app/api/revenue-proof/route.ts
export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  // ... existing logic
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  // ... existing logic
}
```

#### 2.3 Admin Routes (특별 권한 필요)
```typescript
// src/app/api/admin/*/route.ts
import { requireRole } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  // Admin 권한 필수
  const user = await requireRole(request, 'admin');
  if (!user) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  // ... admin logic
}
```

### Step 3: getSession을 getUser로 마이그레이션

```typescript
// Before (보안 취약)
const session = await getSession();
const userId = session?.user?.id;

// After (보안 강화)
const supabase = createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id;
```

### Step 4: 체크리스트 기반 검증

모든 API Route 파일 확인:
```bash
# API Route 파일 목록 생성
find src/app/api -name "route.ts" -type f > api-routes.txt

# 각 파일에 requireAuth 적용 확인
while read file; do
  if ! grep -q "requireAuth" "$file"; then
    echo "❌ Missing auth: $file"
  else
    echo "✅ Protected: $file"
  fi
done < api-routes.txt
```

## ✅ 완료 조건
- [ ] 30개 모든 API Route에 requireAuth 적용
- [ ] getSession 15개 모두 getUser로 변경
- [ ] Admin route에 requireRole 적용
- [ ] 401/403 응답 표준화
- [ ] 로깅 추가 완료

## 📋 QA 테스트 시나리오

### 정상 플로우
1. 로그인한 사용자 → API 호출 → 200 OK
2. Admin 사용자 → Admin API → 200 OK

### 실패 시나리오
1. 미인증 사용자 → API 호출 → 401 Unauthorized
2. 일반 사용자 → Admin API → 403 Forbidden
3. 만료된 토큰 → API 호출 → 401 Unauthorized

### 성능 측정
- 인증 체크 추가 후 응답 시간 < 50ms 추가
- 전체 API 응답 시간 < 500ms 유지

## 🔄 롤백 계획
```bash
# 실패 시 이전 커밋으로 롤백
git stash
git checkout HEAD~1

# 부분 롤백 (특정 파일만)
git checkout HEAD -- src/app/api/[문제파일]/route.ts
```

## 🔍 검증 명령
```bash
# Phase 1 완료 검증
npm run verify:security

# requireAuth 적용 확인
grep -r "requireAuth" src/app/api/ | wc -l
# Expected: 30+

# getSession 제거 확인
grep -r "getSession" src/ | wc -l
# Expected: 0

# 빌드 테스트
npm run build
```

---

**⚠️ 주의사항**
1. 임시방편 금지: 모든 Route 완전 구현
2. Silent failure 금지: 모든 에러 로깅
3. any 타입 금지: 명확한 타입 정의

**예상 작업 시간**: 4-6시간
**다음 Phase**: [Phase 2 - 타입 시스템 복구](./PHASE_2_TYPE_SYSTEM_RECOVERY.md)