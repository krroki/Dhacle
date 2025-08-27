/sc:troubleshoot --seq --validate --think
"Phase 2 AUTH 구현 중 발생한 3가지 문제를 완전히 해결하여 배포된 사이트에서 네이버 카페 인증 기능이 완벽하게 작동하도록 수정"

# Phase 2 AUTH 완전 작동 수정 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- 페이지: `src/app/mypage/profile/page.tsx`
- API: `src/app/api/admin/verify-cafe/route.ts`
- API: `src/app/api/user/naver-cafe/route.ts`
- 타입: `src/types/database.generated.ts`
- DB 마이그레이션: `supabase/migrations/20250109000008_naver_cafe_nickname.sql`

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
# API 클라이언트 패턴 확인
grep -r "createSupabaseRouteHandlerClient" src/ --include="*.ts" | head -5

# 현재 사용 중인 import 패턴 확인
grep -r "import.*from '@/lib/supabase'" src/ | head -5

# 금지 패턴 사용 여부 확인
grep -r ": any" src/app/api/ --include="*.ts" | grep -v "//"

# 기존 구현 확인
ls -la src/app/api/admin/verify-cafe/
cat src/app/api/admin/verify-cafe/route.ts | head -50
```

## 📌 목적
Phase 2 AUTH 구현 중 80% 완료되었으나 실제 작동하지 않는 3가지 문제를 완전히 수정하여:
1. 네이버 카페 인증이 프로필 페이지에서 정상 업데이트 되도록
2. 관리자 검증 시스템이 정확한 필드로 작동하도록
3. 배포 사이트에서 완벽하게 작동하도록

## 🤖 실행 AI 역할
- 주석 처리된 코드를 실제 작동하는 코드로 복원
- 필드명 불일치 문제를 DB 스키마와 일치시켜 수정
- 실제 배포 환경에서 작동 확인 가능한 기능 구현

## 📝 작업 내용

### 1️⃣ 프로필 페이지 주석 해제 및 수정
**파일**: `src/app/mypage/profile/page.tsx`
**라인**: 171-177 (주석 처리된 부분)

**현재 코드** (문제):
```typescript
// 169-178번 라인
const { error: update_error } = await supabase
  .from('profiles')
  .update({
    // TODO: profiles 테이블에 네이버 카페 관련 필드 추가 필요
    // naver_cafe_nickname: cafeNickname,
    // naver_cafe_nickname: cafeNickname,
    // cafe_member_url: cafeMemberUrl, // TODO: 테이블에 필드 추가 필요
    // naver_cafe_verified: true,
    // naver_cafe_verified_at: new Date().toISOString(),
  })
  .eq('id', user.id);
```

**수정 후** (해결):
```typescript
const { error: update_error } = await supabase
  .from('profiles')
  .update({
    naver_cafe_nickname: cafeNickname,
    cafe_member_url: cafeMemberUrl,
    naver_cafe_verified: true,
    naver_cafe_verified_at: new Date().toISOString(),
  })
  .eq('id', user.id);
```

**추가로 221-224번 라인도 수정**:
```typescript
// 현재 (주석 처리됨)
const { error } = await supabase
  .from('profiles')
  .update({
    // naverCafeVerified: false,
    // naverCafeVerifiedAt: null,
  })
  .eq('id', user.id);

// 수정 후
const { error } = await supabase
  .from('profiles')
  .update({
    naver_cafe_verified: false,
    naver_cafe_verified_at: null,
  })
  .eq('id', user.id);
```

### 2️⃣ 필드명 불일치 수정
**파일**: `src/app/api/admin/verify-cafe/route.ts`
**문제**: DB 테이블에는 `rejection_reason` 필드만 존재하지만 코드에서 `verification_note` 사용

**수정 위치 1** (121번 라인):
```typescript
// 현재 (잘못된 필드명)
verification_note: reason || '관리자 승인',

// 수정 후 (정확한 필드명)
rejection_reason: reason || '관리자 승인',
```

**수정 위치 2** (172번 라인):
```typescript
// 현재 (잘못된 필드명)
verification_note: reason || '관리자 거부',

// 수정 후 (정확한 필드명)
rejection_reason: reason || '관리자 거부',
```

### 3️⃣ DB 타입 생성 업데이트
**명령어 실행**:
```bash
# Supabase 타입 재생성
npx supabase gen types typescript --local > src/types/database.generated.ts
```

## ✅ 완료 조건
- [ ] 기능 완전 작동 (빌드 성공이 아닌 실제 동작)
- [ ] 타입 안정성 (any 타입 0개)
- [ ] 프로젝트 규칙 준수
- [ ] 테스트 통과
- [ ] 문서 업데이트

## 📋 QA 테스트 시나리오

### 정상 플로우
1. 프로필 페이지 접속
2. 네이버 카페 닉네임 입력
3. 카페 URL 입력
4. 연동 버튼 클릭
5. 프로필 업데이트 확인
6. DB에서 데이터 저장 확인

### 실패 시나리오
1. 잘못된 URL 입력 → 에러 메시지 표시
2. 중복 닉네임 입력 → 중복 알림
3. 권한 없는 사용자 → 403 에러

### 성능 측정
- API 응답 시간 < 500ms
- 페이지 로드 < 3초

## 🔄 롤백 계획
```bash
# 실패 시 롤백 명령어
git reset --hard HEAD~1
npm install
# DB는 이미 생성된 테이블 유지 (롤백 불필요)
```

## 🔴 필수 검증 (하나라도 실패 시 작업 중단):
### 1. 빌드 및 타입 체크
```bash
npm run build # 성공해야 함
npm run types:check # 에러 0개여야 함
npx biome check src/app/api/ # 통과해야 함
```

### 2. 실제 작동 테스트
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 브라우저 테스트 (http://localhost:3000)
# - 프로필 페이지 접속
# - 네이버 카페 연동 테스트
# - 개발자 도구 Console → 에러 0개
# - Network 탭 → API 호출 성공 (200/201)

# 3. DB 확인
# Supabase 대시보드에서:
# - profiles 테이블에 naver_cafe_nickname 저장 확인
# - naver_cafe_verifications 테이블 데이터 확인
```

### 3. 프로젝트 규칙 준수
- [ ] any 타입 사용 0개
- [ ] getUser() 사용 (getSession() 금지)
- [ ] @/types에서만 import
- [ ] 임시방편 코드 0개

## 🚨 주의사항
1. **절대 자동 스크립트로 일괄 변경 금지**
2. **각 파일 수정 후 즉시 타입 체크**
3. **주석 해제 시 정확한 필드명 사용**
4. **DB 스키마와 코드 필드명 일치 확인**

## 📊 예상 결과
- 프로필 페이지에서 네이버 카페 연동 정상 작동
- 관리자 검증 시스템 정상 작동
- 모든 데이터가 DB에 정확히 저장
- 배포 사이트에서 실제 사용 가능