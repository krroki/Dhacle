/sc:implement --seq --validate --evidence --db-first --e2e
"Phase 1: 인증 관련 TODO 5개 해결 - 로그인부터 작동하게"

# Phase 1: 인증 관련 TODO (5개)

## ⚠️ 3-Strike Rule
같은 파일 3번 수정 = 즉시 중단 → 근본 원인 파악 필수

## 🎯 목표
사용자가 로그인 → 프로필 설정 → 네이버 카페 인증까지 완료

---

## 📋 TODO 목록 (우선순위순)

### 현재 TODO 파악
```bash
# 인증 관련 TODO 찾기
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | grep -i "auth\|login\|session\|카페\|인증"
```

### 우선순위 TODO 5개
1. **네이버 카페 인증 API 구현** (src/app/api/user/naver-cafe/route.ts)
2. **세션 체크 미들웨어** (src/lib/auth/session.ts)
3. **관리자 인증 승인 API** (src/app/api/admin/verify-cafe/route.ts)
4. **로그인 콜백 처리** (src/app/auth/callback/route.ts)
5. **프로필 초기 설정** (src/app/api/user/init-profile/route.ts)

---

## 🔍 TODO 1: 네이버 카페 인증 API

### 🎬 사용자 시나리오
```
1. 사용자가 "네이버 카페 인증" 버튼 클릭
2. → URL 입력: https://cafe.naver.com/dinohighclass
3. → 닉네임 입력
4. → "인증 요청" 클릭
5. → DB에 저장 & "요청 접수" 토스트
```

### ✅ 진행 조건
- [ ] DB 테이블 확인 (profiles vs users)
- [ ] cafe_member_url 필드 위치 확인
- [ ] Zod 스키마 준비

### 🔧 작업

#### Step 1: DB 구조 확인
```bash
# 네이버 카페 필드 위치 확인
grep -n "cafe_member_url\|naver_cafe" src/types/database.generated.ts

# 인증 테이블 존재 확인
grep -n "naver_cafe_verifications" src/types/database.generated.ts
```

#### Step 2: API 구현
```typescript
// src/app/api/user/naver-cafe/route.ts
// TODO 제거하고 실제 구현

import { naverCafeVerificationSchema } from '@/lib/security/validation-schemas';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = naverCafeVerificationSchema.parse(body);
    
    const supabase = await createSupabaseServerClient();
    
    // profiles 테이블 업데이트
    const { error } = await supabase
      .from('profiles')  // DB 확인 후 정확한 테이블
      .update({
        cafe_member_url: validatedData.cafeMemberUrl,
        naver_cafe_nickname: validatedData.cafeNickname,
        naver_cafe_verified: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: '인증 요청이 접수되었습니다'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 🧪 검증
```bash
# 1. API 테스트
npm run dev
# Postman 또는 curl로 테스트

# 2. 브라우저 테스트
- [ ] 프로필 페이지 접속
- [ ] 네이버 카페 인증 클릭
- [ ] URL & 닉네임 입력
- [ ] 제출 → 토스트 확인
- [ ] DB 확인 (Supabase Dashboard)
```

---

## 🔍 TODO 2: 세션 체크 미들웨어

### 🎬 사용자 시나리오
```
1. 로그인하지 않은 사용자가 /mypage 접속
2. → 자동으로 /login으로 리다이렉트
3. → 로그인 후 원래 페이지로 복귀
```

### ✅ 진행 조건
- [ ] middleware.ts 파일 확인
- [ ] 보호된 경로 목록 정의
- [ ] 리다이렉트 로직 준비

### 🔧 작업
```typescript
// src/middleware.ts 또는 src/lib/auth/session.ts
// TODO 제거하고 실제 구현

export async function requireAuth(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}

// 보호된 경로 체크
const protectedPaths = ['/mypage', '/admin', '/tools'];
```

### 🧪 검증
```bash
# 브라우저 시크릿 모드에서 테스트
- [ ] /mypage 접속 → /login 리다이렉트
- [ ] 로그인 → /mypage 접속 성공
- [ ] 세션 만료 시뮬레이션
```

---

## 🔍 TODO 3: 관리자 인증 승인 API

### 🎬 사용자 시나리오
```
1. 관리자가 대시보드에서 "승인" 버튼 클릭
2. → profiles.naver_cafe_verified = true 업데이트
3. → "승인 완료" 토스트
4. → 사용자 프로필에 인증 배지 표시
```

### ✅ 진행 조건
- [ ] 관리자 권한 체크 로직
- [ ] profiles 테이블 업데이트 권한
- [ ] 승인 이력 테이블 확인

### 🔧 작업
```typescript
// src/app/api/admin/verify-cafe/route.ts
// TODO 제거하고 실제 구현

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    const isAdmin = await checkAdminRole(user?.id);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { userId, approved } = await request.json();
    
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        naver_cafe_verified: approved,
        naver_cafe_verified_at: approved ? new Date().toISOString() : null
      })
      .eq('id', userId);
      
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 🧪 검증
```bash
# 관리자 계정으로 테스트
- [ ] 관리자 대시보드 접속
- [ ] 인증 요청 목록 표시
- [ ] 승인 버튼 클릭
- [ ] DB 업데이트 확인
- [ ] 사용자 프로필에 배지 표시
```

---

## 🔍 TODO 4 & 5: 로그인 콜백 & 프로필 초기화

### 🎬 사용자 시나리오
```
1. 신규 사용자 카카오 로그인
2. → 자동으로 profiles 레코드 생성
3. → 랜덤 닉네임 자동 생성
4. → /mypage/profile로 리다이렉트
```

### 🔧 빠른 구현
```typescript
// src/app/auth/callback/route.ts
// 로그인 후 프로필 자동 생성

// src/app/api/user/init-profile/route.ts
// 프로필 초기 데이터 설정
```

---

## ⛔ 즉시 중단 신호

1. **TODO 주석 남기기** → 완전히 구현
2. **any 타입 사용** → 정확한 타입 정의
3. **빈 응답 반환** → 실제 데이터 반환
4. **테스트 없이 다음 TODO** → 각 TODO별 E2E 테스트

---

## 📋 Phase 1 완료 조건

```yaml
TODO_해결:
  - [ ] 네이버 카페 인증 API 완성
  - [ ] 세션 체크 작동
  - [ ] 관리자 승인 기능
  - [ ] 로그인 콜백 처리
  - [ ] 프로필 초기화

E2E_테스트:
  - [ ] 로그인 → 프로필 생성
  - [ ] 네이버 카페 인증 요청
  - [ ] 관리자 승인 프로세스
  - [ ] 인증 배지 표시

증거:
  - [ ] 각 기능 작동 영상
  - [ ] Network 탭 스크린샷
  - [ ] DB 데이터 스크린샷
```

---

## → 다음 Phase

```bash
# Phase 1 완료 확인
- 인증 TODO: 5개 해결
- 실제 작동: 확인됨

# Phase 2로 진행
cat PHASE_2_PROFILE_TODO.md
```

---

*Phase 1: 인증 관련 TODO*
*핵심: 로그인부터 인증까지 완전 작동*
*시간: 3시간 예상*