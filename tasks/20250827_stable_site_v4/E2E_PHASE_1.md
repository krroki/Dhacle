/sc:implement --e2e --validate
"Phase 1: 인증 TODO 5개 - 로그인부터 작동하게"

# Phase 1: 인증 TODO 해결

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 🎬 사용자 시나리오
1. 사용자가 "로그인" 클릭
2. 카카오 로그인 완료
3. /mypage/profile 접속
4. "네이버 카페 인증" 클릭
5. URL & 닉네임 입력 → "인증 요청"
6. DB에 저장 → "요청 접수" 토스트

## 현재 TODO 5개
```bash
grep -r "TODO" src/ | grep -i "auth\|login\|session\|카페\|인증" | head -5
```

1. 네이버 카페 인증 API (src/app/api/user/naver-cafe/route.ts)
2. 세션 체크 미들웨어 (src/lib/auth/session.ts)
3. 관리자 인증 승인 (src/app/api/admin/verify-cafe/route.ts)
4. 로그인 콜백 처리 (src/app/auth/callback/route.ts)
5. 프로필 초기 설정 (src/app/api/user/init-profile/route.ts)

---

## TODO 1: 네이버 카페 인증 API

### 현재 문제
```typescript
// src/app/api/user/naver-cafe/route.ts
export async function POST(request: NextRequest) {
  // TODO: Implement Naver Cafe verification
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
```

### 해결
```typescript
export async function POST(request: NextRequest) {
  // 인증 확인
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 데이터 받기
  const { cafeMemberUrl, cafeNickname } = await request.json();
  
  // DB 업데이트
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      cafe_member_url: cafeMemberUrl,
      naver_cafe_nickname: cafeNickname,
      naver_cafe_verified: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);
    
  if (error) throw error;
  
  return NextResponse.json({ 
    success: true,
    message: '인증 요청이 접수되었습니다'
  });
}
```

### 검증
```bash
# 브라우저 테스트
1. /mypage/profile 접속
2. "네이버 카페 인증" 클릭
3. URL: https://cafe.naver.com/dinohighclass
4. 닉네임: TestUser
5. "인증 요청" 클릭
6. Network 탭 → 200 OK
7. Supabase Dashboard → profiles 테이블 확인
```

---

## TODO 2: 세션 체크 미들웨어

### 현재 문제
```typescript
// src/lib/auth/session.ts
export async function requireAuth(request: NextRequest) {
  // TODO: Implement session check
  return null;
}
```

### 해결
```typescript
export async function requireAuth(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}
```

### 검증
```bash
# 시크릿 모드에서 테스트
1. /mypage 접속 → 로그인 페이지로 리다이렉트
2. 로그인 완료 → /mypage 접속 성공
```

---

## TODO 3: 관리자 승인 API

### 현재 문제
```typescript
// src/app/api/admin/verify-cafe/route.ts
export async function PUT(request: NextRequest) {
  // TODO: Implement admin approval
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
```

### 해결
```typescript
export async function PUT(request: NextRequest) {
  // 관리자 권한 확인
  const user = await requireAuth(request);
  const isAdmin = await checkAdminRole(user?.id);
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 승인 처리
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
}
```

### 검증
```bash
# 관리자 계정으로
1. /admin 대시보드 접속
2. 인증 요청 목록 확인
3. "승인" 버튼 클릭
4. DB → naver_cafe_verified = true 확인
```

---

## TODO 4 & 5: 로그인 콜백 & 프로필 초기화

### 빠른 구현
```typescript
// src/app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  // 로그인 후 프로필 자동 생성
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    // 프로필 없으면 생성
    await createProfileIfNotExists(session.user.id);
  }
  
  return NextResponse.redirect('/mypage/profile');
}

// src/app/api/user/init-profile/route.ts
export async function POST(request: NextRequest) {
  // 랜덤 닉네임 생성 등
  const randomNickname = generateRandomNickname();
  // ... 구현
}
```

---

## ✅ Phase 1 완료 조건

### TODO 해결
- [ ] 네이버 카페 인증 API 완성
- [ ] 세션 체크 작동
- [ ] 관리자 승인 기능
- [ ] 로그인 콜백 처리
- [ ] 프로필 초기화

### E2E 테스트
- [ ] 로그인 → 프로필 자동 생성
- [ ] 네이버 카페 인증 요청 성공
- [ ] 관리자 승인 프로세스 작동
- [ ] 인증 배지 표시

### 증거
- [ ] 로그인 플로우 영상
- [ ] 인증 요청 스크린샷
- [ ] DB 데이터 스크린샷

---

## → Phase 2로

Phase 1 완료 확인:
- [ ] 인증 TODO 5개 해결
- [ ] 실제 작동 확인
- [ ] 증거 수집

다음 단계:
```bash
cat E2E_PHASE_2-5.md
```

---

*Phase 1: 인증 TODO*
*목표: 로그인부터 인증까지 작동*
*시간: 3시간*