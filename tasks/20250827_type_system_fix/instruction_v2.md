/sc:troubleshoot --seq --validate --think --c7
"타입 시스템 전면 복구 - database.generated.ts 구조 변경 대응 v2"

# 🚨 타입 시스템 전면 복구 지시서 v2 (검증된 버전)

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- 타입 정의: `src/types/index.ts`
- 생성된 타입: `src/types/database.generated.ts`
- 영향받는 컴포넌트: `src/components/features/tools/youtube-lens/AlertRules.tsx`
- 영향받는 API: `src/app/api/admin/verify-cafe/route.ts`, `src/app/api/user/naver-cafe/route.ts`
- 영향받는 페이지: `src/app/mypage/profile/page.tsx`

### 프로젝트 컨텍스트 확인
```bash
# 기술 스택 확인
cat package.json | grep -A 5 "dependencies"

# 프로젝트 구조 확인  
ls -la src/

# 최신 변경사항 확인
cat /docs/PROJECT.md | grep -A 10 "최근 변경"
```

### 🔥 실제 코드 패턴 확인 (검증 완료)
```bash
# 타입 생성 상태 확인
echo "=== 타입 파일 크기 확인 ==="
wc -l src/types/database.generated.ts
# 확인 결과: 3162줄 (정상)

# Tables export 확인
echo "=== Tables 타입 export 확인 ==="
grep "^export type Tables" src/types/database.generated.ts
# 확인 결과: 제네릭 타입으로 export됨 (3045행)

# 실제 테이블명 확인
echo "=== alert 테이블 확인 ==="
grep "alert_rules: {" src/types/database.generated.ts
# 확인 결과: alert_rules (yl_ 접두사 없음!)

# View와 Table 필드 차이 확인
echo "=== profiles View vs users Table ==="
grep -A 10 "profiles: {" src/types/database.generated.ts
# 확인 결과: View에는 cafe_member_url만, Table에는 naver_cafe_* 필드들 존재
```

## 📌 목적
Supabase CLI로 새로 생성된 database.generated.ts의 제네릭 타입 구조 변경에 대응하여 타입 시스템 전면 복구

## 🤖 실행 AI 역할
타입 시스템 복구 전문가로서 다음을 수행:
1. 제네릭 타입 import 수정
2. View vs Table 필드명 불일치 해결
3. 타입 정의 통일
4. any 타입 완전 제거

## 📝 작업 내용

### Phase 1: Tables 제네릭 타입 대응 (20분)

#### 1.1 src/types/index.ts 수정
```typescript
// ✅ 올바른 import (이미 제네릭으로 export됨)
import type { Database, Tables, TablesInsert, TablesUpdate } from './database.generated';

// 기존 export 유지
export type { Database } from './database.generated';

// ❌ 헬퍼 타입 재정의 불필요 (이미 export됨)
// type Tables<T> = ... // 삭제!

// 기존 타입 정의는 그대로 유지 (이미 올바름)
export type DBUser = Tables<'users'>;
export type DBCommunityPost = Tables<'community_posts'>;
export type DBCommunityComment = Tables<'community_comments'>;
export type DBCommunityLike = Tables<'community_likes'>;
export type DBRevenueProof = Tables<'revenue_proofs'>;
export type DBUserApiKey = Tables<'user_api_keys'>;
export type DBProfile = Tables<'profiles'>; // View
```

#### 1.2 import 오류 해결
만약 import 오류가 발생한다면:
```typescript
// Plan A: 직접 import
import type { Database, Tables, TablesInsert, TablesUpdate } from './database.generated';

// Plan B: import 실패 시 type alias 생성
import type { Database } from './database.generated';

// database.generated.ts의 실제 구조 활용
type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];
type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];
```

### Phase 2: profiles View vs users Table 불일치 해결 (25분)

#### 2.1 실제 필드 확인
```bash
# profiles View 필드
grep -A 20 "profiles: {" src/types/database.generated.ts
# 결과: cafe_member_url (O), naver_cafe_* (X)

# users Table 필드  
grep -A 30 "users: {" src/types/database.generated.ts
# 결과: cafe_member_url (O), naver_cafe_* (O)
```

#### 2.2 파일별 수정 전략

**src/app/api/admin/verify-cafe/route.ts** (80, 88, 131, 140행):
```typescript
// ❌ 현재 오류 코드
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);

// profile.naver_cafe_verified // View에 없는 필드!

// ✅ 해결책: users 테이블 직접 조회
const { data: user } = await supabase
  .from('users')
  .select('id, email, naver_cafe_verified, naver_cafe_nickname, naver_cafe_member_url, cafe_member_url')
  .eq('id', userId)
  .single();

// 이제 모든 필드 사용 가능
if (user.naver_cafe_verified) { ... }
```

**src/app/api/user/naver-cafe/route.ts** (58, 65, 66, 67행):
```typescript
// ❌ 현재 오류 코드
const { data: profile } = await supabase
  .from('profiles')
  .select('*');

// ✅ 해결책: users 테이블 직접 조회
const { data: user } = await supabase
  .from('users')
  .select('naver_cafe_verified, naver_cafe_nickname, naver_cafe_member_url, naver_cafe_verified_at')
  .eq('id', userId)
  .single();
```

**src/app/mypage/profile/page.tsx** (108, 109행):
```typescript
// ❌ 현재 오류 코드
profile.naver_cafe_member_url // Did you mean 'cafe_member_url'?

// ✅ 해결책 1: View 필드 사용
profile.cafe_member_url

// ✅ 해결책 2: users 테이블에서 추가 데이터 조회
const { data: userData } = await supabase
  .from('users')
  .select('naver_cafe_member_url')
  .eq('id', user.id)
  .single();

// 두 데이터 병합
const fullProfile = {
  ...profile,
  naver_cafe_member_url: userData?.naver_cafe_member_url
};
```

### Phase 3: AlertRule 타입 통일 (20분)

#### 3.1 실제 테이블명 확인
```bash
grep "alert" src/types/database.generated.ts | grep -E "^\s+[a-z_]+: {"
# 결과: alert_rules (yl_ 접두사 없음!)
```

#### 3.2 컴포넌트 타입 수정

**src/components/features/tools/youtube-lens/AlertRules.tsx**:
```typescript
// ❌ 로컬 인터페이스 제거 (중복 정의)
interface AlertRule { ... } // 삭제!

// ✅ 올바른 import 및 타입 정의
import type { Tables } from '@/types';

// 실제 테이블명 사용 (yl_ 없음!)
type DBAlertRule = Tables<'alert_rules'>;

// 컴포넌트용 타입 (필요시 확장)
interface AlertRule extends DBAlertRule {
  // 추가 필드 없음
}

// Props 타입
interface AlertRulesProps {
  channelId: string; // required prop
}
```

#### 3.3 channel_id nullable 처리
```typescript
export default function AlertRules({ channelId }: AlertRulesProps) {
  const [rules, setRules] = useState<DBAlertRule[]>([]);

  // 규칙 생성 시 channel_id 보장
  const createRule = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const newRule = {
      channel_id: channelId, // Props에서 받은 값 (non-null)
      rule_type: newRuleType,
      condition: 'greater_than' as const,
      metric: 'view_count',
      name: `Alert for ${channelId}`,
      user_id: user.user.id,
      is_active: true,
      threshold_value: { value: Number(thresholdValue), operator }
    };

    const { data, error } = await supabase
      .from('alert_rules')
      .insert(newRule)
      .select()
      .single();

    if (data) {
      setRules([...rules, data]);
    }
  };
}
```

### Phase 4: any 타입 제거 및 최종 검증 (15분)

#### 4.1 any 타입 검색 및 제거
```bash
# any 타입 검색
echo "=== any 타입 검색 ==="
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "// " | grep -v "/\*"

# as any 캐스팅 검색
echo "=== as any 캐스팅 검색 ==="
grep -r "as any" src/ --include="*.ts" --include="*.tsx" | grep -v "// " | grep -v "/\*"

# 발견 시 즉시 수정
# 예: const data: any → const data: unknown 또는 구체적 타입
```

#### 4.2 단계별 검증
```bash
# 1. TypeScript 타입 체크
npm run types:check

# 2. Biome 린터 체크
npx biome check src/

# 3. 빌드 테스트
npm run build
```

## ✅ 완료 조건

### 필수 체크리스트
- [ ] TypeScript 에러 0개 (현재 15개 → 0개)
- [ ] any 타입 0개
- [ ] import 오류 0개
- [ ] database.generated.ts 수정 없음 (자동 생성 파일)
- [ ] 모든 import가 @/types에서
- [ ] npm run build 성공

### 검증 명령어
```bash
# 모든 검증을 한 번에
npm run verify:parallel
```

## 📋 QA 테스트 시나리오

### 1. 개발 서버 실행
```bash
npm run dev
# http://localhost:3000 접속
```

### 2. 기능별 테스트

#### 프로필 페이지
1. `/mypage/profile` 접속
2. 카페 회원 URL 표시 확인
3. 콘솔 에러 없음 확인

#### YouTube Lens 알림
1. YouTube Lens 페이지 접속
2. 알림 규칙 생성 버튼 클릭
3. 규칙 생성 성공
4. 규칙 목록 정상 표시

#### 관리자 카페 인증
1. 관리자 페이지 접속
2. 카페 인증 API 호출
3. 응답 데이터 확인

### 3. 개발자 도구 확인
- Console: 에러 0개
- Network: API 200/201 응답
- React DevTools: 상태 정상

## 🔄 롤백 계획

```bash
# 변경사항 임시 저장
git stash

# 파일별 롤백 (필요시)
git checkout HEAD -- src/types/index.ts
git checkout HEAD -- src/app/api/admin/verify-cafe/route.ts
git checkout HEAD -- src/app/api/user/naver-cafe/route.ts
git checkout HEAD -- src/app/mypage/profile/page.tsx
git checkout HEAD -- src/components/features/tools/youtube-lens/AlertRules.tsx

# 타입 재생성 (최후 수단)
npm run types:generate
```

## 🚨 핵심 주의사항

### ✅ 반드시 확인
1. **alert_rules** 테이블 (yl_ 접두사 없음!)
2. **profiles View** vs **users Table** 구분
3. **Tables 타입은 이미 export됨** (재정의 불필요)
4. **nullable 필드는 TypeScript에서도 nullable**

### ❌ 절대 금지
1. **database.generated.ts 수정** (자동 생성 파일)
2. **any 타입 사용** (biome 에러)
3. **임시방편** (TODO, 주석 처리)
4. **@ts-ignore 사용**

## 📊 예상 결과

### Before (현재)
- TypeScript 에러: 15개
- 주요 문제: Tables import 실패, 필드명 불일치, 타입 중복
- 빌드: 실패

### After (목표)
- TypeScript 에러: 0개
- any 타입: 0개
- 모든 기능 정상 작동
- 빌드: 성공

## 🎯 단계별 실행 체크포인트

- [ ] **Phase 0**: `/docs/CONTEXT_BRIDGE.md` 읽기
- [ ] **Phase 1**: Tables 타입 import 수정
- [ ] **Phase 2**: View/Table 필드 불일치 해결
- [ ] **Phase 3**: AlertRule 타입 통일 (alert_rules 사용)
- [ ] **Phase 4**: any 타입 제거
- [ ] **Phase 5**: `npm run types:check` 성공
- [ ] **Phase 6**: `npm run build` 성공
- [ ] **Phase 7**: 브라우저 실제 테스트 완료

---

## 📝 변경 로그

### v2 (2025-08-27) - 검증된 버전
- ✅ 테이블명 수정: ~~yl_alert_rules~~ → **alert_rules**
- ✅ Tables 타입 import 방식 수정
- ✅ profiles View vs users Table 구분 명확화
- ✅ 실제 DB 스키마와 100% 일치 확인

### v1 (2025-08-27) - 초기 버전
- 초기 지시서 작성

---

*이 지시서는 실제 데이터베이스 구조를 완전히 검증한 후 작성되었습니다.*
*임시방편 없이 근본적인 해결을 보장합니다.*