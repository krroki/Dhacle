/sc:implement --seq --validate --think-hard --wave-mode --delegate files
"320개 에러를 의존성 순서에 따라 완전히 해결하라. DB 테이블 생성부터 시작하여 연쇄 에러를 방지하며 체계적으로 해결한다."

# 🚨 320개 에러 완전 해결 지시서: 의존성 기반 체계적 해결

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 🔥🔥🔥 최우선 프로젝트 특화 규칙 (모든 지시서 필수) 🔥🔥🔥

### ⚠️ 경고: 이 섹션 미확인 시 프로젝트 파괴 가능성 90%

#### 📌 필수 확인 문서 체크리스트
```markdown
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (전체 읽기 필수)
- [ ] `/CLAUDE.md` 17-43행 - 자동 스크립트 절대 금지
- [ ] `/CLAUDE.md` 352-410행 - Supabase 클라이언트 패턴
- [ ] `/CLAUDE.md` 54-71행 - 절대 금지사항 목록
- [ ] `/docs/ERROR_BOUNDARY.md` - 에러 처리 표준 패턴
```

#### 🚫 프로젝트 금지사항 (절대 위반 불가)
```markdown
- [ ] 자동 변환 스크립트 생성 금지 (38개 스크립트 재앙 경험)
- [ ] 구식 Supabase 패턴 사용 금지 (createServerComponentClient 등)
- [ ] database.generated.ts 직접 import 금지
- [ ] any 타입 사용 금지
- [ ] fetch() 직접 호출 금지
- [ ] getSession() 사용 금지 (getUser() 사용)
- [ ] 임시방편 해결책 사용 금지 (주석 처리, TODO, 빈 배열 반환 등)
- [ ] 에러 발생 시 작업 진행 금지 (완전 해결 후 진행)
- [ ] 실제 테스트 없이 완료 보고 금지
```

## 📚 온보딩 섹션

### 작업 관련 경로
- 주요 문제 파일들:
  - `src/lib/youtube/client-helper.ts` - api_usage 테이블 관련
  - `src/lib/youtube/cache.ts` - 캐싱 관련 TODO
  - `src/app/api/user/naver-cafe/route.ts` - naver_cafe 테이블 관련
  - `src/app/api/youtube/analysis/route.ts` - 분석 테이블 관련
  - `src/lib/auth/AuthContext.tsx` - Silent failure 문제

### 현재 에러 상황 확인
```bash
# Pre-commit 검증 재실행하여 현재 상태 확인
node .husky/pre-commit-validation.js

# 실제 에러 수 확인
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l  # 99개 예상
grep -r "} catch (_error) {" src/ | wc -l  # 10개 예상
grep -r "^//" src/app/api/ --include="*.ts" | wc -l  # 17개 예상
```

## 📌 목적
Pre-commit hook에서 발견된 320개 에러를 **의존성 순서에 따라** 체계적으로 해결하여, 한 에러를 해결하면서 다른 에러를 만드는 도돌이표를 방지하고 완전히 해결한다.

## 🤖 실행 AI 역할
당신은 320개 에러를 해결하는 시니어 개발자입니다. **에러 간 의존성을 파악**하여 올바른 순서로 해결하고, 각 단계마다 검증하여 새로운 에러가 생기지 않도록 보장합니다.

## 📊 에러 의존성 그래프
```
DB 테이블 누락 (근본 원인)
    ├→ 주석 처리된 DB 호출 (17개)
    │   └→ 기능 미작동
    │       └→ TODO 추가 (89개)
    └→ Silent failure 추가 (10개)
        └→ 임시 처리 패턴 (52개)
            └→ 추가 TODO (142개)
```

## 📝 작업 내용 - 5 Phase 체계적 해결

### 🔴 Phase 1: DB 테이블 생성 (CRITICAL 우선)
**목표**: 누락된 모든 테이블 생성으로 근본 원인 해결

#### Step 1.1: 누락 테이블 식별
```bash
# 주석 처리된 테이블 찾기
grep -r "//.*from(" src/ --include="*.ts" | grep -E "(insert|select|update|delete)"
grep -r "//.*supabase" src/ --include="*.ts" | grep -E "from\("

# 구체적 테이블 목록 추출
echo "=== 누락된 테이블 목록 ==="
grep -r "TODO.*테이블" src/ --include="*.ts"
```

#### Step 1.2: SQL 마이그레이션 생성
`supabase/migrations/20250825_fix_missing_tables.sql` 생성:
```sql
-- api_usage 테이블 (YouTube API 사용량 추적)
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  quota_used INTEGER DEFAULT 1,
  response_time INTEGER,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- subscriptions 테이블 (YouTube 구독 관리)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_title TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, channel_id)
);

-- naver_cafe_members 테이블 (네이버 카페 회원)
CREATE TABLE IF NOT EXISTS naver_cafe_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_member_id TEXT UNIQUE NOT NULL,
  nickname TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- youtube_analysis_cache 테이블 (분석 캐시)
CREATE TABLE IF NOT EXISTS youtube_analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT UNIQUE NOT NULL,
  analysis_data JSONB,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- RLS 정책 추가
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE naver_cafe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_analysis_cache ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "Users can view own api usage" ON api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own naver cafe membership" ON naver_cafe_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view youtube analysis cache" ON youtube_analysis_cache
  FOR SELECT USING (true);
```

#### Step 1.3: 테이블 생성 실행
```bash
# SQL 실행
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/20250825_fix_missing_tables.sql

# 테이블 생성 확인
node scripts/verify-with-service-role.js
```

### 🔴 Phase 2: 주석 해제 및 DB 호출 복원

#### Step 2.1: 주석 처리된 코드 복원
`src/lib/youtube/client-helper.ts` 수정:
```typescript
// 주석 해제 전
// TODO: api_usage 테이블이 없으므로 임시로 주석 처리
// const { error: usageError } = await supabase
//   .from('api_usage')
//   .insert({...

// 주석 해제 후
const { error: usageError } = await supabase
  .from('api_usage')
  .insert({
    user_id: userId,
    api_key_id: apiKeyId,
    endpoint: 'youtube.search',
    quota_used: 100,
    response_time: Date.now() - startTime,
    status_code: 200
  });

if (usageError) {
  console.error('API usage tracking error:', usageError);
  // 에러가 있어도 API 호출은 계속 진행
}
```

#### Step 2.2: naver-cafe 라우트 복원
`src/app/api/user/naver-cafe/route.ts` 수정:
```typescript
// 주석 해제하고 적절한 에러 처리 추가
const { data: existingMember, error: checkError } = await supabase
  .from('naver_cafe_members')
  .select('*')
  .eq('cafe_member_id', cafeMemberId)
  .single();

if (checkError && checkError.code !== 'PGRST116') {
  // PGRST116: 레코드 없음 (정상)
  // 다른 에러는 처리
  return NextResponse.json(
    { error: '회원 확인 중 오류가 발생했습니다.' },
    { status: 500 }
  );
}
```

### 🔴 Phase 3: Silent Failure 수정

#### Step 3.1: catch 블록 수정
`src/lib/auth/AuthContext.tsx` 수정:
```typescript
// 수정 전
} catch (_error) {
  // Silent failure
}

// 수정 후
} catch (error) {
  console.error('Auth context error:', error);
  
  // 사용자에게 피드백
  if (error instanceof Error) {
    toast.error(`인증 오류: ${error.message}`);
  }
  
  // 상태 초기화
  setUser(null);
  setIsLoading(false);
}
```

#### Step 3.2: 모든 Silent failure 패턴 수정
```bash
# Silent failure 위치 찾기
grep -r "} catch (_error) {" src/ --include="*.ts" --include="*.tsx"

# 각 파일에서 적절한 에러 처리로 교체
# 1. 로깅 추가
# 2. 사용자 피드백 (toast, alert 등)
# 3. 적절한 fallback 동작
```

### 🔴 Phase 4: TODO 구현

#### Step 4.1: 우선순위별 TODO 분류
```bash
# TODO 목록 추출 및 분류
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" > todo-list.txt

# 카테고리별 분류
# - DB 관련 TODO (이미 Phase 1에서 해결)
# - API 관련 TODO
# - UI 관련 TODO
# - 로직 관련 TODO
```

#### Step 4.2: TODO 구현
각 TODO를 실제 구현으로 교체:
```typescript
// 예시: src/lib/logger.ts
// TODO: Sentry.captureException(error);

// 구현
import * as Sentry from '@sentry/nextjs';

export function logError(error: Error, context?: Record<string, any>) {
  console.error('Error:', error, context);
  
  // Production에서만 Sentry로 전송
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context
    });
  }
}
```

### 🔴 Phase 5: 임시 처리 제거

#### Step 5.1: 임시 키워드 제거
```bash
# 임시 처리 패턴 찾기
grep -r "임시" src/ --include="*.ts" --include="*.tsx"
grep -r "temporary" src/ --include="*.ts" --include="*.tsx" -i
grep -r "FIXME" src/ --include="*.ts" --include="*.tsx"
```

#### Step 5.2: 완전한 구현으로 교체
각 임시 처리를 영구적 해결책으로 교체

## ✅ 완료 조건

### 🔴 Phase별 검증 Gate (필수)

#### Phase 1 완료 검증
```bash
# DB 테이블 존재 확인
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const tables = ['api_usage', 'subscriptions', 'naver_cafe_members', 'youtube_analysis_cache'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(table, ':', error ? '❌' : '✅');
  }
}
check();
"

# 기존 기능 테스트
npm run dev
# http://localhost:3000 접속하여 기본 기능 확인
```

#### Phase 2 완료 검증
```bash
# 주석 해제 확인
grep -r "^//" src/app/api/ --include="*.ts" | wc -l  # 0이어야 함

# API 테스트
curl http://localhost:3000/api/user/naver-cafe -X GET
# 200 응답 확인
```

#### Phase 3 완료 검증
```bash
# Silent failure 확인
grep -r "} catch (_error) {" src/ | wc -l  # 0이어야 함

# 에러 로깅 확인
npm run dev
# 개발자 도구 콘솔에서 에러 로깅 확인
```

#### Phase 4 완료 검증
```bash
# TODO 확인
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l  # 대폭 감소

# 기능 완전성 테스트
npm run dev
# 각 기능 실제 테스트
```

#### Phase 5 최종 검증
```bash
# Pre-commit 재실행
node .husky/pre-commit-validation.js

# 결과 확인
echo "=== 최종 에러 수 ==="
echo "CRITICAL: $(검증 결과)"  # 0개 예상
echo "HIGH: $(검증 결과)"      # 0개 예상
echo "MEDIUM: $(검증 결과)"    # 대폭 감소
```

## 📋 QA 테스트 시나리오

### 🔴 필수: 연쇄 에러 방지 테스트
```markdown
1. Phase 1 완료 후
   - [ ] 모든 API 엔드포인트 호출 → 500 에러 없음
   - [ ] DB 쿼리 실행 → 테이블 존재 에러 없음

2. Phase 2 완료 후
   - [ ] 주석 해제된 기능 테스트 → 정상 작동
   - [ ] 새로운 에러 발생 여부 → 없음

3. Phase 3 완료 후
   - [ ] 에러 발생 시나리오 → 적절한 에러 메시지
   - [ ] 콘솔 로그 확인 → Silent failure 없음

4. 전체 완료 후
   - [ ] npm run build → 성공
   - [ ] npm run types:check → 에러 0개
   - [ ] npm run verify:parallel → 모든 검증 통과
```

### 🔴 필수: 실제 기능 테스트
```markdown
# 브라우저에서 실제 테스트
1. YouTube Lens
   - [ ] 검색 → API 사용량 기록됨 (api_usage 테이블)
   - [ ] 구독 → subscriptions 테이블에 저장됨

2. 네이버 카페
   - [ ] 회원 인증 → naver_cafe_members 테이블 사용
   - [ ] 인증 상태 확인 → 정상 작동

3. YouTube 분석
   - [ ] 분석 실행 → youtube_analysis_cache 사용
   - [ ] 캐시 히트 → 성능 향상 확인
```

## 🔄 롤백 계획
```bash
# 실패 시 롤백
git stash  # 현재 변경사항 임시 저장
git checkout .  # 모든 변경 취소

# DB 롤백 (필요시)
-- 테이블 삭제 (역순)
DROP TABLE IF EXISTS youtube_analysis_cache CASCADE;
DROP TABLE IF EXISTS naver_cafe_members CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS api_usage CASCADE;

# 재시작
npm install
npm run dev
```

## 🚨 중요 주의사항

### ❌ 절대 하지 말아야 할 것
1. **Phase 순서 무시**: 반드시 1→2→3→4→5 순서 준수
2. **자동 스크립트 작성**: 수동으로 각 파일 수정
3. **검증 없이 다음 Phase 진행**: 각 Phase Gate 통과 필수
4. **임시방편 사용**: 완전한 해결만 허용

### ✅ 반드시 해야 할 것
1. **각 수정 후 테스트**: 새 에러 발생 즉시 확인
2. **의존성 확인**: 한 수정이 다른 부분에 영향 확인
3. **실제 브라우저 테스트**: 코드만이 아닌 실제 작동 확인
4. **Phase별 커밋**: 각 Phase 완료 시 커밋 (롤백 가능)

## 📊 예상 결과
- **시작**: 320개 에러 (CRITICAL 27, HIGH 99, MEDIUM 52, LOW 142)
- **Phase 1 후**: ~250개 (DB 관련 CRITICAL 해결)
- **Phase 2 후**: ~150개 (주석 해제로 기능 복원)
- **Phase 3 후**: ~100개 (Silent failure 해결)
- **Phase 4 후**: ~20개 (TODO 구현)
- **Phase 5 후**: 0~10개 (임시 처리 제거)
- **최종**: 0개 목표

---

*이 지시서를 따라 체계적으로 진행하면 도돌이표 없이 320개 에러를 완전히 해결할 수 있습니다.*