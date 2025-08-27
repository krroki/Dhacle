/sc:implement --seq --validate --think
"Phase 2: 인증/프로필 시스템 완성 - randomNickname과 네이버 카페 인증"

# Phase 2: 인증/프로필 시스템 완성

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📌 Phase 정보
- Phase 번호: 2/6
- 예상 시간: 2일
- 우선순위: 🔴 CRITICAL
- 선행 조건: Phase 1 완료 (DB 필드 추가)

## 🎯 Phase 목표
1. randomNickname 생성 시스템 구현
2. 네이버 카페 인증 API 구현
3. 프로필 관리 기능 완성
4. 관리자 검증 시스템 구축

## 📝 작업 내용

### 1️⃣ RandomNickname 생성 시스템

#### API Route 수정
```typescript
// src/app/api/user/init-profile/route.ts 수정
// 183번 줄 수정 - needsInitialization 로직
needsInitialization: !profile.random_nickname  // 실제 필드 사용

// randomNickname 생성 로직 추가
const generateRandomNickname = () => {
  const adjectives = ['행복한', '즐거운', '신나는', '멋진', '용감한'];
  const nouns = ['판다', '코알라', '펭귄', '고양이', '강아지'];
  const number = Math.floor(Math.random() * 9999);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${number}`;
};
```

#### Auth Callback 수정
```typescript
// src/app/auth/callback/route.ts 수정
// 99번, 147번 줄 - randomNickname 필드 활성화
.select('id, random_nickname, naver_cafe_verified')  // 실제 필드 사용

// 신규 사용자 시 randomNickname 생성
if (!profile.random_nickname) {
  await supabase.from('profiles').update({
    random_nickname: generateRandomNickname()
  }).eq('id', user.id);
}
```

### 2️⃣ 네이버 카페 인증 시스템

#### 인증 API 구현
```typescript
// src/app/api/user/naver-cafe/route.ts 완전 재구현
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { cafeMemberUrl, cafeNickname } = await request.json();

  // 관리자 수동 검증 대기 상태로 저장
  const { error } = await supabase
    .from('profiles')
    .update({
      cafe_member_url: cafeMemberUrl,
      naver_cafe_nickname: cafeNickname,
      naver_cafe_verified: false  // 관리자 검증 대기
    })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 관리자에게 알림 전송 (TODO: Phase 6에서 구현)
  
  return NextResponse.json({ 
    success: true,
    message: '인증 요청이 접수되었습니다. 관리자 검증을 기다려주세요.'
  });
}
```

### 3️⃣ 관리자 검증 시스템

#### 관리자 인증 승인 API
```typescript
// src/app/api/admin/verify-cafe/route.ts 생성
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 관리자 권한 체크
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user?.id)
    .single();
  
  if (!adminProfile?.is_admin) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { userId, approved, reason } = await request.json();

  const updateData = {
    naver_cafe_verified: approved,
    naver_cafe_verified_at: approved ? new Date().toISOString() : null
  };

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

### 4️⃣ 프로필 페이지 수정

#### 프로필 표시 수정
```typescript
// src/app/mypage/profile/page.tsx 수정
// TODO 주석 제거 및 실제 필드 사용

// 52-53번 줄 주석 제거
const randomNickname = profile?.random_nickname || null;
const naverCafeVerified = profile?.naver_cafe_verified || false;

// 333-334번 줄 - 실제 필드 표시
<span className="text-gray-600">{profile?.random_nickname || '미설정'}</span>

// 362-391번 줄 - 네이버 카페 인증 상태 표시
{profile?.naver_cafe_verified ? (
  <div className="flex items-center gap-2">
    <Check className="w-5 h-5 text-green-500" />
    <span>인증 완료</span>
    <span className="text-sm text-gray-500">
      {profile.naver_cafe_nickname}
    </span>
  </div>
) : (
  <Button onClick={() => setShowNaverCafeModal(true)}>
    인증하기
  </Button>
)}
```

### 5️⃣ 프로필 API 수정

```typescript
// src/app/api/user/profile/route.ts 수정
// 63, 90, 107, 158, 178번 줄 - work_type 필드 활성화

// GET 메서드
const profile = {
  ...profileData,
  work_type: profileData.work_type  // 실제 필드 사용
};

// POST/PATCH 메서드
const updateData = {
  ...otherData,
  work_type: workType  // 실제 필드 사용
};
```

## ✅ 완료 조건

### 🔴 필수 완료 조건
```bash
# 1. 타입 체크
npm run types:check  # 에러 0개

# 2. 빌드 성공
npm run build

# 3. 실제 브라우저 테스트
npm run dev
# http://localhost:3000/mypage/profile
- [ ] 랜덤 닉네임 표시 확인
- [ ] 네이버 카페 인증 버튼 작동
- [ ] 프로필 수정 저장 성공

# 4. API 테스트
- [ ] POST /api/user/naver-cafe → 200 응답
- [ ] GET /api/user/profile → 모든 필드 포함
- [ ] PATCH /api/user/profile → 업데이트 성공
```

### 🟡 권장 완료 조건
- [ ] 랜덤 닉네임 중복 체크
- [ ] 네이버 카페 URL 유효성 검증
- [ ] 관리자 대시보드 UI

## 🔄 롤백 계획
```bash
# API 파일 원복
git checkout -- src/app/api/user/init-profile/route.ts
git checkout -- src/app/api/user/naver-cafe/route.ts
git checkout -- src/app/api/user/profile/route.ts
git checkout -- src/app/auth/callback/route.ts
git checkout -- src/app/mypage/profile/page.tsx
```

## → 다음 Phase
- 파일: [PHASE_3_PAYMENT.md](./PHASE_3_PAYMENT.md)
- 내용: 결제 시스템 활성화