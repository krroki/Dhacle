/sc:troubleshoot --seq --validate --think --c7
"타입 시스템 전면 복구 - database.generated.ts 구조 변경 대응"

# 🚨 타입 시스템 전면 복구 지시서

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

### 🔥 실제 코드 패턴 확인 (v17.0 신규)
```bash
# 타입 생성 상태 확인
echo "=== 타입 파일 크기 확인 ==="
wc -l src/types/database.generated.ts
# 결과: 3162줄 (정상 생성됨)

# Tables import 패턴 확인
echo "=== Tables import 패턴 확인 ==="
grep -r "import.*Tables.*from" src/ --include="*.ts" --include="*.tsx"
# 결과: src/types/index.ts에서만 import 시도

# 필드명 불일치 확인
echo "=== naver_cafe_member_url 사용 파일 확인 ==="
grep -r "naver_cafe_member_url" src/ --include="*.ts" --include="*.tsx" | wc -l
# 결과: 3개 파일에서 사용 중

# 타입 오류 현황
echo "=== 현재 타입 오류 수 ==="
npm run types:check 2>&1 | grep "error TS" | wc -l
# 결과: 15개 에러
```

## 📌 목적
Supabase CLI로 새로 생성된 database.generated.ts의 구조 변경으로 인한 타입 시스템 전면 복구

## 🤖 실행 AI 역할
타입 시스템 복구 전문가로서 다음을 수행:
1. 제네릭 타입 변경 대응
2. View 필드명 불일치 해결
3. 타입 정의 재구성
4. 0개의 any 타입 보장

## 📝 작업 내용

### Phase 1: Tables 제네릭 타입 대응 (30분)

#### 1.1 src/types/index.ts 수정
```typescript
// ❌ 기존 코드 (제거)
import type { Database, Tables, TablesInsert, TablesUpdate } from './database.generated';

// ✅ 새로운 코드
import type { Database } from './database.generated';

// Tables 타입을 제네릭으로 사용하는 헬퍼 타입 정의
type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];
type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];
```

#### 1.2 기존 타입 정의 유지
```typescript
// 기존 코드 그대로 유지 (이미 올바르게 작동 중)
export type DBUser = Tables<'users'>;
export type DBCommunityPost = Tables<'community_posts'>;
// ... 나머지 타입들도 동일
```

### Phase 2: profiles View 필드명 수정 (20분)

#### 2.1 필드 매핑 확인
```bash
# profiles View의 실제 필드 확인
grep -A 20 "profiles: {" src/types/database.generated.ts
# cafe_member_url로 변경됨 확인
```

#### 2.2 파일별 수정

**src/app/api/admin/verify-cafe/route.ts**:
```typescript
// ❌ 기존 (80, 88, 131, 140행)
profile.naver_cafe_verified
profile.naver_cafe_nickname
profile.naver_cafe_member_url

// ✅ 수정 - View 필드명에 맞춤
profile.cafe_member_url // View의 실제 필드명
// 또는 users 테이블 직접 조회로 변경
const { data: user } = await supabase
  .from('users')
  .select('naver_cafe_verified, naver_cafe_nickname, naver_cafe_member_url')
  .eq('id', userId)
  .single();
```

**src/app/api/user/naver-cafe/route.ts**:
```typescript
// 58, 65, 66, 67행 동일하게 수정
// profiles View 대신 users 테이블 직접 조회
```

**src/app/mypage/profile/page.tsx**:
```typescript
// 108, 109행
// ❌ 기존
profile.naver_cafe_member_url

// ✅ 수정
profile.cafe_member_url
// 또는 별도로 users 테이블에서 조회
```

### Phase 3: AlertRule 타입 정리 (25분)

#### 3.1 중복 타입 정의 제거

**src/components/features/tools/youtube-lens/AlertRules.tsx**:
```typescript
// ❌ 로컬 정의 제거 (55-63행)
interface AlertRule { ... }

// ✅ 중앙 타입 import
import type { Tables } from '@/types';

// DB 테이블과 일치하는 타입 사용
type AlertRule = Tables<'yl_alert_rules'>;
```

#### 3.2 channel_id nullable 처리
```typescript
// DB 스키마에서 channel_id가 nullable이므로
interface AlertRulesProps {
  channelId: string; // Props는 required
}

// 컴포넌트 내부에서 처리
const createRule = async () => {
  const newRule = {
    channel_id: channelId, // Props에서 받은 값
    // ... 나머지 필수 필드들
    condition: 'greater_than',
    metric: 'view_count',
    name: `Alert for ${channelId}`,
    user_id: user.id
  };
};
```

### Phase 4: 타입 검증 및 정리 (15분)

#### 4.1 any 타입 제거
```bash
# any 타입 검색 및 제거
grep -r ": any" src/types/ --include="*.ts"
grep -r "as any" src/ --include="*.ts" --include="*.tsx"
```

#### 4.2 빌드 검증
```bash
npm run types:check
npm run build
```

## ✅ 완료 조건
- [ ] 타입 에러 0개 (현재 15개 → 0개)
- [ ] any 타입 0개
- [ ] database.generated.ts는 수정하지 않음
- [ ] 모든 import가 @/types에서만
- [ ] npm run build 성공

## 📋 QA 테스트 시나리오

### 정상 플로우
1. 프로필 페이지 접속
   - [ ] 카페 회원 URL 정상 표시
   - [ ] 에러 없이 로드

2. YouTube Lens 알림 규칙
   - [ ] 규칙 생성 성공
   - [ ] 규칙 목록 표시
   - [ ] channel_id 정상 처리

3. 관리자 카페 인증
   - [ ] API 호출 성공
   - [ ] 데이터 정상 반환

### 실패 시나리오
1. 타입 불일치 → 컴파일 에러로 사전 차단
2. nullable 처리 → 적절한 기본값 제공

### 성능 측정
- 타입 체크 시간: < 10초
- 빌드 시간: < 60초

## 🔄 롤백 계획
```bash
# 실패 시 롤백 명령어
git stash
git checkout HEAD -- src/types/index.ts
git checkout HEAD -- src/app/api/admin/verify-cafe/route.ts
git checkout HEAD -- src/app/api/user/naver-cafe/route.ts
git checkout HEAD -- src/app/mypage/profile/page.tsx
git checkout HEAD -- src/components/features/tools/youtube-lens/AlertRules.tsx

# 타입 재생성
npm run types:generate
```

## 🚨 주의사항

### 절대 금지
1. **database.generated.ts 수정 금지** - 자동 생성 파일
2. **any 타입 사용 금지** - biome 에러 발생
3. **임시방편 해결 금지** - TODO, 주석 처리 등
4. **@ts-ignore 사용 금지**

### 필수 확인
1. **profiles View vs users Table 구분**
   - View: 제한된 필드 (cafe_member_url)
   - Table: 전체 필드 (naver_cafe_*)
2. **nullable 타입 처리**
   - DB에서 nullable → TypeScript에서도 nullable
   - 필수값은 컴포넌트 Props에서 보장

## 📊 예상 결과

### Before
- TypeScript 에러: 15개
- any 타입: 존재
- 빌드: 실패

### After
- TypeScript 에러: 0개
- any 타입: 0개
- 빌드: 성공
- 모든 기능 정상 작동

## 🎯 핵심 체크포인트

- [ ] **Step 0**: CONTEXT_BRIDGE.md 확인 완료
- [ ] **Step 1**: Tables 제네릭 타입 헬퍼 정의
- [ ] **Step 2**: profiles View 필드명 수정
- [ ] **Step 3**: AlertRule 타입 통일
- [ ] **Step 4**: any 타입 제거
- [ ] **Step 5**: npm run types:check 통과
- [ ] **Step 6**: npm run build 성공
- [ ] **Step 7**: 브라우저에서 실제 테스트

---

*이 지시서를 따라 작업하면 타입 시스템이 완전히 복구됩니다.*
*임시방편 없이 근본적인 해결을 보장합니다.*