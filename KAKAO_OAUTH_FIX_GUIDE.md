# 🚨 카카오 로그인 긴급 수정 가이드

## 문제 현황
- **증상**: 카카오 로그인 시 "요청한 리소스를 찾을 수 없습니다" 알림
- **원인**: OAuth 리다이렉트 URI 불일치
- **현재 상태**: `session=expired` 즉시 발생

## 🔧 수정 절차

### 1단계: 카카오 개발자 콘솔 설정
```
1. https://developers.kakao.com 접속 → 로그인
2. 애플리케이션 선택 (디하클 앱)
3. 제품 설정 > 카카오 로그인 > Redirect URI 수정

✅ 추가해야 할 URI:
- https://dhacle.com/auth/callback
- https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback

⚠️ 중요: 두 URI 모두 추가 필요!
```

### 2단계: Supabase Dashboard 확인
```
1. https://supabase.com/dashboard 접속
2. 디하클 프로젝트 > Authentication > Providers
3. Kakao 설정에서 다음 확인:

Site URL: https://dhacle.com
Redirect URLs: https://dhacle.com/auth/callback

✅ 위 설정이 정확한지 확인
```

### 3단계: 환경변수 확인 (이미 올바름)
```bash
# .env.local - 현재 설정 올바름
NEXT_PUBLIC_SUPABASE_URL=https://golbwnsytwbyoneucunx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # 로컬용
```

### 4단계: 프로덕션 환경변수 설정
```bash
# Vercel Dashboard에서 환경변수 확인/수정
NEXT_PUBLIC_SITE_URL=https://dhacle.com  # 프로덕션용으로 변경
```

## 🧪 테스트 절차

### 1. 로컬 테스트
```bash
# 1. 환경변수 확인
cat .env.local

# 2. 개발 서버 재시작
npm run dev

# 3. 카카오 로그인 테스트
open http://localhost:3000/auth/login
```

### 2. 프로덕션 테스트
```bash
# 1. Vercel 재배포
vercel --prod

# 2. 카카오 로그인 테스트
open https://dhacle.com/auth/login
```

## 🔍 문제 해결 확인

### 성공 시 플로우
```
1. 카카오 로그인 버튼 클릭
2. 카카오 인증 페이지로 이동
3. 로그인 후 https://dhacle.com/auth/callback으로 리다이렉트
4. 새 사용자: /onboarding으로, 기존 사용자: /로 이동
```

### 실패 시 증상
```
❌ session=expired 즉시 발생
❌ "요청한 리소스를 찾을 수 없습니다" 알림
❌ 카카오 인증 페이지로 이동하지 않음
```

## 📞 긴급 연락처
- 카카오 개발자 지원: https://devtalk.kakao.com
- Supabase 지원: https://supabase.com/support

---
**⚠️ 주의사항**: 
- 카카오 개발자 콘솔 설정 변경 후 최대 10분 대기
- Vercel 환경변수 변경 후 재배포 필수
- 두 URI를 모두 등록해야 정상 작동