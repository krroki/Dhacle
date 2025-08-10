# 🔍 카카오 로그인 문제 해결 가이드

## 현재 구현된 개선사항 (2025-01-11)

### 1. ✅ 에러 페이지 생성
- **위치**: `/src/app/auth/error/page.tsx`
- **기능**: 에러 코드와 설명을 친화적으로 표시
- **Suspense**: useSearchParams() 에러 해결

### 2. ✅ 상세 에러 처리
- **위치**: `/src/app/auth/callback/route.ts`
- **개선**: 에러 정보를 query parameter로 전달
- **로깅**: 각 단계별 상세 로그 추가

### 3. ✅ 디버그 API 생성
- **위치**: `/api/debug/kakao-auth`
- **접속**: https://dhacle.com/api/debug/kakao-auth
- **정보**: 환경 변수 및 설정 상태 확인

## 🚨 dhacle.com 로그인 문제 체크리스트

### Step 1: 브라우저에서 에러 확인
```javascript
// 1. dhacle.com/auth/error 페이지의 URL 파라미터 확인
// 예시: ?error=server_error&error_description=...

// 2. 개발자 도구 Console 확인
// F12 → Console 탭에서 에러 메시지 확인
```

### Step 2: 디버그 API로 환경 확인
```bash
# 브라우저에서 접속
https://dhacle.com/api/debug/kakao-auth

# 확인할 내용:
- supabase_config.url_configured: true여야 함
- supabase_config.key_configured: true여야 함
- supabase_config.is_correct_project: true여야 함
```

### Step 3: Vercel 로그 확인
```
1. https://vercel.com 로그인
2. dhacle 프로젝트 → Functions 탭
3. auth/callback 함수 로그 확인
4. "[Auth Callback]"로 시작하는 로그 찾기
```

### Step 4: Supabase Dashboard 확인
```
1. https://supabase.com/dashboard 로그인
2. Authentication → Providers → Kakao
3. 다음 설정 확인:
   - Enabled: ON
   - Client ID: 511031d59e611bcf07a80b3e11acbdc5
   - Client Secret: (설정되어 있어야 함)
```

### Step 5: 카카오 개발자 센터 확인
```
1. https://developers.kakao.com 로그인
2. Dhacle 앱 선택
3. 확인 사항:
   - 플랫폼 → Web → 사이트 도메인에 dhacle.com 등록
   - 카카오 로그인 → Redirect URI:
     https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback
```

## 🔧 일반적인 문제와 해결법

### 문제 1: "placeholder.supabase.co"로 리다이렉트
**원인**: Vercel 환경 변수 미설정
**해결**: 
```bash
# Vercel Dashboard에서 설정
NEXT_PUBLIC_SUPABASE_URL=https://golbwnsytwbyoneucunx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 문제 2: "access_denied" 에러
**원인**: 사용자가 로그인 취소
**해결**: 정상 동작, 에러 페이지에서 안내

### 문제 3: "server_error" 에러
**원인**: 
1. Supabase 설정 문제
2. 카카오 앱 설정 문제
3. 환경 변수 불일치

**해결**:
1. 위 Step 1-5 모두 확인
2. Vercel 재배포 (캐시 무시)

### 문제 4: 로그인 후 /onboarding으로 이동
**원인**: 신규 사용자로 프로필 미작성
**해결**: 정상 동작, 온보딩 완료 필요

## 📝 테스트 시나리오

### 로컬 테스트
```bash
# 1. 환경 변수 확인
cat .env.local

# 2. 개발 서버 실행
npm run dev

# 3. http://localhost:3000에서 테스트
```

### 프로덕션 테스트
```bash
# 1. 빌드 테스트
npm run build
npm run start

# 2. https://dhacle.com에서 테스트
```

## 🆘 추가 지원 필요 시

다음 정보와 함께 보고해주세요:
1. `/auth/error` 페이지의 전체 URL
2. `/api/debug/kakao-auth` 응답 JSON
3. Vercel Functions 로그 (auth/callback)
4. 브라우저 Console 에러 메시지
5. Network 탭의 실패한 요청

---
*작성일: 2025-01-11*