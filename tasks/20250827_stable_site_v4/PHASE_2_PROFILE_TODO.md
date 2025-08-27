/sc:implement --seq --validate --evidence --db-first --e2e
"Phase 2: 프로필 관련 TODO 8개 해결 - 프로필 완전 작동"

# Phase 2: 프로필 관련 TODO (8개)

## ⚠️ 3-Strike Rule
같은 파일 3번 수정 = 즉시 중단 → 근본 원인 파악 필수

## 🎯 목표
사용자가 프로필 편집 → 저장 → 표시까지 완벽하게 작동

---

## 📋 TODO 목록 (우선순위순)

### 현재 TODO 파악
```bash
# 프로필 관련 TODO 찾기
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | grep -i "profile\|프로필\|nickname\|bio"
```

### 우선순위 TODO 8개
1. **프로필 업데이트 API** (src/app/api/user/profile/route.ts)
2. **랜덤 닉네임 생성** (src/app/api/user/generate-nickname/route.ts)
3. **프로필 페이지 데이터 표시** (src/app/mypage/profile/page.tsx)
4. **아바타 업로드** (src/components/profile/AvatarUpload.tsx)
5. **작업 유형 선택** (work_type 필드)
6. **소개글 편집** (bio 필드)
7. **소셜 링크 추가** (social_links JSON)
8. **프로필 공개 설정** (is_public 필드)

---

## 🔍 TODO 1: 프로필 업데이트 API

### 🎬 사용자 시나리오
```
1. 사용자가 프로필 편집 폼 작성
2. → "저장" 버튼 클릭
3. → DB 업데이트
4. → "프로필이 업데이트되었습니다" 토스트
5. → 페이지 새로고침 후에도 유지
```

### ✅ 진행 조건
- [ ] profiles 테이블 필드 확인
- [ ] Zod 검증 스키마 준비
- [ ] 업데이트 가능 필드 목록 정의

### 🔧 작업

#### Step 1: DB 필드 확인
```bash
# profiles 테이블 구조 확인
cat src/types/database.generated.ts | grep -A 50 "profiles:"

# 업데이트 가능 필드 목록
# - username, display_name, bio
# - work_type, avatar_url, social_links
# - is_public, theme_preference
```

#### Step 2: API 구현
```typescript
// src/app/api/user/profile/route.ts
// TODO 제거하고 실제 구현

import { profileUpdateSchema } from '@/lib/security/validation-schemas';

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);
    
    const supabase = await createSupabaseServerClient();
    
    // 프로필 업데이트
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      data,
      message: '프로필이 업데이트되었습니다'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 🧪 검증
```bash
# 브라우저 테스트
- [ ] 프로필 페이지에서 편집
- [ ] 각 필드 수정
- [ ] 저장 → 토스트 확인
- [ ] 새로고침 → 데이터 유지
- [ ] DB 확인 (Supabase Dashboard)
```

---

## 🔍 TODO 2: 랜덤 닉네임 생성

### 🎬 사용자 시나리오
```
1. 신규 사용자 또는 "랜덤 생성" 버튼 클릭
2. → 재미있는 랜덤 닉네임 생성
3. → 즉시 표시
4. → 마음에 들면 저장
```

### 🔧 작업
```typescript
// src/app/api/user/generate-nickname/route.ts
// TODO 제거하고 실제 구현

const adjectives = ['멋진', '귀여운', '용감한', '신비한', '활발한'];
const nouns = ['판다', '호랑이', '독수리', '늑대', '여우'];
const numbers = Math.floor(Math.random() * 9999);

export async function GET(): Promise<NextResponse> {
  const nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${numbers}`;
  
  return NextResponse.json({ nickname });
}
```

### 🧪 검증
```bash
# API 테스트
- [ ] /api/user/generate-nickname 호출
- [ ] 랜덤 닉네임 반환
- [ ] 중복되지 않는 닉네임
```

---

## 🔍 TODO 3: 프로필 페이지 데이터 표시

### 🎬 사용자 시나리오
```
1. /mypage/profile 접속
2. → 모든 프로필 정보 표시
3. → 편집 모드 전환
4. → 실시간 미리보기
```

### ✅ 진행 조건
- [ ] React Query 훅 확인
- [ ] 프로필 데이터 구조 파악
- [ ] UI 컴포넌트 준비

### 🔧 작업
```typescript
// src/app/mypage/profile/page.tsx
// Line 52-53 TODO 제거

// 실제 데이터 사용
const randomNickname = profile?.random_nickname || '미설정';
const naverCafeVerified = profile?.naver_cafe_verified || false;

// Line 333-334 표시
<div className="flex justify-between">
  <span>랜덤 닉네임</span>
  <span>{randomNickname}</span>
</div>

// Line 372-380 인증 배지
{naverCafeVerified ? (
  <Badge className="bg-green-100">인증 완료</Badge>
) : (
  <Badge className="bg-yellow-100">미인증</Badge>
)}
```

### 🧪 검증
```bash
# 브라우저 테스트
- [ ] 프로필 페이지 로드
- [ ] 모든 필드 데이터 표시
- [ ] 인증 배지 올바른 상태
- [ ] 편집 모드 작동
```

---

## 🔍 TODO 4-8: 나머지 프로필 기능

### 빠른 구현 체크리스트

#### TODO 4: 아바타 업로드
```typescript
// Supabase Storage 활용
// 이미지 리사이징
// 미리보기 제공
```

#### TODO 5: 작업 유형 선택
```typescript
// work_type: 'student' | 'employee' | 'freelancer' | 'business' | 'other'
// 드롭다운 선택
```

#### TODO 6: 소개글 편집
```typescript
// bio 필드
// 최대 500자
// 마크다운 지원 (선택)
```

#### TODO 7: 소셜 링크
```typescript
// social_links JSON 필드
// { twitter: '', instagram: '', github: '' }
```

#### TODO 8: 공개 설정
```typescript
// is_public boolean
// 프로필 공개/비공개
```

---

## ⛔ 즉시 중단 신호

1. **프로필 데이터 null 반환** → DB 연결 확인
2. **필드명 불일치** → database.generated.ts 재확인
3. **권한 오류** → RLS 정책 확인
4. **업데이트 실패** → 필드 타입 확인

---

## 📋 Phase 2 완료 조건

```yaml
TODO_해결:
  - [ ] 프로필 업데이트 API 완성
  - [ ] 랜덤 닉네임 생성 작동
  - [ ] 프로필 페이지 완전 표시
  - [ ] 아바타 업로드 기능
  - [ ] 작업 유형 선택
  - [ ] 소개글 편집
  - [ ] 소셜 링크 추가
  - [ ] 공개 설정 토글

E2E_테스트:
  - [ ] 프로필 전체 편집 → 저장
  - [ ] 이미지 업로드 → 표시
  - [ ] 랜덤 닉네임 → 적용
  - [ ] 새로고침 → 데이터 유지

증거:
  - [ ] 프로필 편집 전/후 스크린샷
  - [ ] Network 탭 API 호출
  - [ ] DB 업데이트 확인
```

---

## 🔄 실패 시 프로토콜

### 프로필 데이터가 없을 때
```bash
# 1. DB 확인
- profiles 테이블에 레코드 있는가?
- user_id 매칭되는가?

# 2. RLS 정책 확인
- SELECT 권한 있는가?
- UPDATE 권한 있는가?

# 3. 세션 확인
- 로그인 상태인가?
- 세션 만료되지 않았는가?
```

---

## → 다음 Phase

```bash
# Phase 2 완료 확인
- 프로필 TODO: 8개 해결
- 실제 작동: 확인됨

# Phase 3로 진행
cat PHASE_3_YOUTUBE_TODO.md
```

---

*Phase 2: 프로필 관련 TODO*
*핵심: 프로필 편집부터 표시까지 완전 작동*
*시간: 4시간 예상*