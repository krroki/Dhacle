# Vercel 환경 변수 설정 가이드

## 🚨 문제 상황
dhacle.com에서 로그인 시 `placeholder.supabase.co`로 리다이렉트되는 문제가 발생했습니다.
이는 Vercel에 Supabase 환경 변수가 설정되지 않아서 발생하는 문제입니다.

## ✅ 해결 방법

### 1. Vercel Dashboard 접속
1. https://vercel.com 로그인
2. dhacle 프로젝트 선택

### 2. 환경 변수 설정
1. Settings 탭 클릭
2. 왼쪽 메뉴에서 "Environment Variables" 선택
3. 다음 환경 변수들을 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://golbwnsytwbyoneucunx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbGJ3bnN5dHdieW9uZXVjdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI1MTYsImV4cCI6MjA3MDE0ODUxNn0.8EaDU4a1-FuCeWuRtK0fzxrRDuMvNwoB0a0qALDm6iM
```

### 3. 환경 선택
각 환경 변수에 대해 다음 옵션을 모두 체크:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. 재배포
환경 변수 저장 후:
1. Deployments 탭으로 이동
2. 최신 배포 옆의 "..." 메뉴 클릭
3. "Redeploy" 선택
4. "Use existing Build Cache" 체크 해제
5. "Redeploy" 버튼 클릭

## 📝 중요 사항

### Supabase Dashboard 설정 확인
Supabase Dashboard에서도 카카오 OAuth 설정이 되어있는지 확인:

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. Authentication → Providers → Kakao
4. 다음 설정 확인:
   - Enabled: ON
   - Client ID: (카카오 개발자 센터에서 받은 REST API 키)
   - Client Secret: (카카오 개발자 센터에서 받은 Client Secret)
   - Redirect URL: `https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback`

### 카카오 개발자 센터 설정
1. https://developers.kakao.com 접속
2. 애플리케이션 선택
3. 앱 설정 → 플랫폼 → Web 사이트 도메인에 추가:
   - `https://dhacle.com`
   - `https://www.dhacle.com`
   - `https://golbwnsytwbyoneucunx.supabase.co`

4. 카카오 로그인 → Redirect URI에 추가:
   - `https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback`

## 🔍 검증 방법

### 1. 브라우저 콘솔 확인
1. dhacle.com 접속
2. F12 (개발자 도구) 열기
3. Console 탭에서 에러 메시지 확인
4. "CRITICAL: Supabase environment variables are not configured" 에러가 나타나면 환경 변수 미설정

### 2. Network 탭 확인
1. Network 탭 열기
2. 로그인 버튼 클릭
3. authorize 요청의 URL 확인
4. `golbwnsytwbyoneucunx.supabase.co`가 포함되어야 정상

## 🚀 로컬 테스트
```bash
# 로컬에서 production 환경 변수로 테스트
npm run build
npm run start
```

## 📞 추가 지원
문제가 지속되면 다음 정보와 함께 문의:
- Vercel 배포 로그
- 브라우저 콘솔 에러 메시지
- Network 탭의 실패한 요청 정보