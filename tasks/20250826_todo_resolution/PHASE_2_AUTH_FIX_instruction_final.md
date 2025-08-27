/sc:troubleshoot --seq --validate --think
"Phase 2 AUTH 구현 중 발생한 3가지 문제를 완전히 해결하여 배포된 사이트에서 네이버 카페 인증 기능이 완벽하게 작동하도록 수정"

# Phase 2 AUTH 완전 작동 수정 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 🔥🔥🔥 최우선 프로젝트 특화 규칙

### ⚠️ 경고: 이 섹션 미확인 시 프로젝트 파괴 가능성 90%

#### 📌 필수 확인 문서 체크리스트
```markdown
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (전체 읽기 필수)
- [ ] `/CLAUDE.md` 17-43행 - 자동 스크립트 절대 금지
- [ ] `/CLAUDE.md` 352-410행 - Supabase 클라이언트 패턴
- [ ] `/src/app/api/CLAUDE.md` - API Route 표준 패턴
- [ ] `/docs/ERROR_BOUNDARY.md` - 에러 처리 표준 패턴
```

#### 🚫 프로젝트 금지사항 (절대 위반 불가)
```markdown
- [ ] 자동 변환 스크립트 생성 금지 (38개 스크립트 재앙 경험)
- [ ] 구식 Supabase 패턴 사용 금지 (createServerComponentClient 등)
- [ ] database.generated.ts 직접 import 금지 (@/types에서만)
- [ ] any 타입 사용 금지
- [ ] fetch() 직접 호출 금지
- [ ] getSession() 사용 금지 (getUser() 사용)
- [ ] 임시방편 해결책 사용 금지 (주석 처리, TODO, 빈 배열 반환 등)
- [ ] 에러 발생 시 작업 진행 금지 (완전 해결 후 진행)
- [ ] 실제 테스트 없이 완료 보고 금지
```

## 📚 온보딩 섹션

### 작업 관련 경로
- 페이지: `src/app/mypage/profile/page.tsx`
- API (관리자): `src/app/api/admin/verify-cafe/route.ts`
- API (사용자): `src/app/api/user/naver-cafe/route.ts`
- 타입 정의: `src/types/database.generated.ts`
- DB 마이그레이션: `supabase/migrations/20250109000008_naver_cafe_nickname.sql`
- 인증 헬퍼: `src/lib/api-auth.ts`

### 프로젝트 컨텍스트 확인
```bash
# 기술 스택 확인
cat package.json | grep -A 5 "dependencies"
# Next.js 15.4.6, Supabase 2.46.2, React 19.0.0

# 프로젝트 구조 확인  
ls -la src/app/api/admin/
ls -la src/app/mypage/profile/

# 최신 변경사항 확인
cat /docs/PROJECT.md | grep -A 10 "Phase 2"
```

### 🔥 실제 코드 패턴 확인 (v17.0 신규)
```bash
# API 클라이언트 패턴 확인
grep -r "createSupabaseRouteHandlerClient" src/ --include="*.ts" | wc -l
# 결과: 10개 파일에서 사용 중

# 현재 사용 중인 import 패턴 확인
grep -r "import.*from '@/lib/supabase/server-client'" src/ | head -5
# 확인: 올바른 패턴 사용 중

# 금지 패턴 사용 여부 확인
grep -r ": any" src/app/api/ --include="*.ts" | grep -v "//"
# 결과: 0개 (문제 없음)

# requireAuth 패턴 확인
grep -r "requireAuth" src/lib/ --include="*.ts"
# src/lib/api-auth.ts:31:export async function requireAuth
```

## 📌 목적
Phase 2 AUTH 구현이 80% 완료되었으나 실제 작동하지 않는 3가지 문제를 완전히 수정하여 배포 사이트에서 네이버 카페 인증 기능이 100% 작동하도록 함

## 🤖 실행 AI 역할
1. 주석 처리된 코드를 실제 작동하는 코드로 복원
2. DB 스키마와 코드의 필드명 불일치 문제 해결
3. 실제 배포 환경에서 즉시 테스트 가능한 기능 구현
4. 모든 수정사항에 대한 타입 안전성 보장

## 📝 작업 내용

### 🎯 문제 1: 프로필 페이지 네이버 카페 업데이트 미작동
**파일**: `src/app/mypage/profile/page.tsx`
**위치**: 171-177번 라인, 221-224번 라인

#### 현재 상태 (❌ 작동 안함)
```typescript
// 169-178번 라인 - 네이버 카페 연동 시 업데이트
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

// 221-224번 라인 - 네이버 카페 연동 해제
const { error } = await supabase
  .from('profiles')
  .update({
    // naverCafeVerified: false,
    // naverCafeVerifiedAt: null,
  })
  .eq('id', user.id);
```

#### 수정 방안 (✅ 완전 작동)
```typescript
// 169-178번 라인 수정
const { error: update_error } = await supabase
  .from('profiles')
  .update({
    naver_cafe_nickname: cafeNickname,
    cafe_member_url: cafeMemberUrl,
    naver_cafe_verified: true,
    naver_cafe_verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  .eq('id', user.id);

// 221-224번 라인 수정
const { error } = await supabase
  .from('profiles')
  .update({
    naver_cafe_verified: false,
    naver_cafe_verified_at: null,
    updated_at: new Date().toISOString()
  })
  .eq('id', user.id);
```

### 🎯 문제 2: 관리자 검증 시스템 필드명 불일치
**파일**: `src/app/api/admin/verify-cafe/route.ts`
**위치**: 121번, 172번 라인
**원인**: DB 테이블에는 `rejection_reason` 필드만 존재하지만 코드에서 `verification_note` 사용

#### 현재 상태 (❌ DB 저장 실패)
```typescript
// 121번 라인 - 승인 시
verification_note: reason || '관리자 승인',

// 172번 라인 - 거부 시
verification_note: reason || '관리자 거부',
```

#### 수정 방안 (✅ DB 저장 성공)
```typescript
// 121번 라인 수정 - 승인 시
rejection_reason: approved ? null : (reason || '관리자 승인'),

// 172번 라인 수정 - 거부 시
rejection_reason: reason || '관리자 거부',
```

### 🎯 문제 3: 관리자 알림 시스템 미구현 (TODO 해결)
**파일**: `src/app/api/user/naver-cafe/route.ts`
**위치**: 183번 라인

#### 현재 상태 (⚠️ TODO로 남아있음)
```typescript
// TODO: Phase 6에서 관리자에게 알림 전송 구현
```

#### 수정 방안 (✅ 간단한 로깅으로 대체)
```typescript
// 관리자 알림은 Phase 6에서 구현 예정
// 현재는 로그로 기록하여 관리자가 확인 가능하도록 함
console.log('[ADMIN_NOTIFICATION] 네이버 카페 인증 요청:', {
  userId: user.id,
  nickname,
  memberUrl,
  requestedAt: new Date().toISOString()
});
// 추후 알림 시스템 구현 시 이 로그를 실제 알림으로 대체
```

### 🎯 추가 작업: DB 타입 재생성
```bash
# Supabase 타입 재생성 (필수)
npx supabase gen types typescript --local > src/types/database.generated.ts

# 생성된 타입 확인
grep -A 20 "naver_cafe_verifications" src/types/database.generated.ts
```

## ✅ 완료 조건
- [ ] 기능 완전 작동 (빌드 성공이 아닌 실제 동작)
- [ ] 타입 안정성 (any 타입 0개)
- [ ] 프로젝트 규칙 준수
- [ ] 모든 주석 처리된 코드 복원
- [ ] DB 필드명 일치

## 🎯 7단계 실제 작동 검증 시나리오

### ✅ 시나리오 1: UI 렌더링 검증
```bash
# 🔴 필수 검증
- [ ] 프로필 페이지가 에러 없이 로드되는가?
- [ ] 네이버 카페 연동 섹션이 표시되는가?
- [ ] 입력 필드가 정상 렌더링되는가?
```

### ✅ 시나리오 2: 사용자 인터랙션 검증
```bash
# 🔴 필수 검증
- [ ] 네이버 카페 닉네임 입력 가능한가?
- [ ] URL 입력 가능한가?
- [ ] 연동 버튼 클릭이 작동하는가?
```

### ✅ 시나리오 3: 데이터 플로우 검증
```bash
# 🔴 필수 검증
- [ ] API 호출이 성공하는가? (200/201)
- [ ] 프로필이 업데이트되는가?
- [ ] DB에 데이터가 저장되는가?
```

### ✅ 시나리오 4: 에러 처리 검증
```bash
# 🔴 필수 검증
- [ ] 잘못된 URL 입력 시 에러 메시지가 표시되는가?
- [ ] 중복 닉네임 시 적절한 알림이 뜨는가?
- [ ] 네트워크 오류 시 처리되는가?
```

### ✅ 시나리오 5: 관리자 검증 시스템
```bash
# 🔴 필수 검증
- [ ] 관리자가 인증 요청을 볼 수 있는가?
- [ ] 승인/거부가 정상 작동하는가?
- [ ] rejection_reason이 DB에 저장되는가?
```

### ✅ 시나리오 6: 전체 플로우 검증
```bash
# 실제 명령어 실행
npm run dev
# 브라우저: http://localhost:3000/mypage/profile

# 테스트 순서:
1. 프로필 페이지 접속
2. 네이버 카페 연동 섹션 확인
3. 닉네임: "테스트유저123" 입력
4. URL: "https://cafe.naver.com/MemberInfo.nhn?memberid=test123" 입력
5. 연동 버튼 클릭
6. 성공 메시지 확인
7. DB 확인 (Supabase Dashboard)
   - profiles 테이블: naver_cafe_nickname 저장 확인
   - naver_cafe_verifications 테이블: 요청 기록 확인
```

### ✅ 시나리오 7: 배포 환경 검증
```bash
# Vercel 배포 후
- [ ] 배포된 사이트에서 프로필 페이지 접속
- [ ] 네이버 카페 연동 기능 작동
- [ ] 관리자 검증 시스템 작동
```

## 🔴 필수 검증 명령어
```bash
# 1. 타입 체크 (수정 즉시)
npm run types:check
# Expected: 0 errors

# 2. Biome 린트
npx biome check src/app/api/
npx biome check src/app/mypage/profile/
# Expected: No issues found

# 3. 빌드 테스트
npm run build
# Expected: Build successful

# 4. 실제 작동 테스트
npm run dev
# 브라우저에서 직접 테스트

# 5. DB 확인
# Supabase Dashboard에서:
# - profiles 테이블 확인
# - naver_cafe_verifications 테이블 확인
```

## 🔄 롤백 계획
```bash
# 실패 시 롤백 명령어
git status # 변경 파일 확인
git diff # 변경 내용 확인

# 문제 발생 시
git checkout -- src/app/mypage/profile/page.tsx
git checkout -- src/app/api/admin/verify-cafe/route.ts

# 또는 커밋 후 문제 발생 시
git reset --hard HEAD~1
npm install
```

## 🚨 주의사항
1. **절대 자동 스크립트로 일괄 변경 금지** - 각 파일 수동 수정
2. **수정 즉시 타입 체크** - `npm run types:check`
3. **주석 해제 시 정확한 필드명 사용** - snake_case 준수
4. **DB 스키마와 코드 필드명 일치 확인** - rejection_reason 사용
5. **TODO는 제거하지 말고 로그로 대체** - Phase 6 구현 예정 명시

## 📊 예상 결과
✅ **즉시 효과**:
- 프로필 페이지에서 네이버 카페 연동 정상 작동
- 관리자 검증 시스템 정상 작동
- 모든 데이터가 DB에 정확히 저장
- 배포 사이트에서 실제 사용 가능

✅ **기술적 개선**:
- 타입 안전성 100%
- any 타입 0개
- 모든 TODO 처리 완료 (로그 또는 구현)
- 코드와 DB 스키마 100% 일치

## 📁 관련 문서
- API Route 패턴: `/src/app/api/CLAUDE.md`
- Supabase 패턴: `/src/lib/supabase/CLAUDE.md`
- 프로젝트 현황: `/docs/PROJECT.md`
- 반복 실수 방지: `/docs/CONTEXT_BRIDGE.md`

---

*이 지시서를 정확히 따르면 Phase 2 AUTH 기능이 100% 작동합니다.*
*작업 완료 후 반드시 브라우저에서 실제 테스트를 수행하세요.*