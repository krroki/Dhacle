# 🔧 Supabase + Kakao OAuth 설정 가이드

## ⚠️ Invalid API Key 에러 해결

### 문제 상황
- 에러: `Invalid API key`
- 원인: Supabase Dashboard에서 Kakao Provider 설정이 누락되었거나 잘못됨

## 📋 필수 설정 체크리스트

### 1. Supabase Dashboard 설정 ✅

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 로그인
   - 프로젝트 선택: `golbwnsytwbyoneucunx`

2. **Authentication → Providers → Kakao 설정**
   ```
   Enabled: ON (토글 활성화)
   
   Client ID (required):
   511031d59e611bcf07a80b3e11acbdc5
   
   Client Secret (required):
   xN7w9RtOiT8yOGMlZiy37ZClZotbnIeC
   
   Redirect URL (자동 생성됨):
   https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback
   ```

3. **저장 버튼 클릭** (매우 중요!)

### 2. 카카오 개발자 센터 설정 ✅

1. **https://developers.kakao.com 로그인**

2. **Dhacle 앱 선택 → 앱 설정**

3. **플랫폼 → Web 사이트 도메인 추가**
   ```
   http://localhost:3000
   https://dhacle.com
   https://www.dhacle.com
   https://golbwnsytwbyoneucunx.supabase.co
   ```

4. **카카오 로그인 → Redirect URI 설정**
   ```
   https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback
   ```
   ⚠️ 정확히 일치해야 함!

5. **카카오 로그인 → 활성화 설정**
   - 활성화 상태: ON

6. **카카오 로그인 → 동의항목**
   - 프로필 정보: 필수 동의
   - 카카오계정(이메일): 선택 동의

### 3. Vercel 환경 변수 ✅

**Vercel Dashboard → Settings → Environment Variables**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://golbwnsytwbyoneucunx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbGJ3bnN5dHdieW9uZXVjdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI1MTYsImV4cCI6MjA3MDE0ODUxNn0.8EaDU4a1-FuCeWuRtK0fzxrRDuMvNwoB0a0qALDm6iM
```

각 변수에 대해:
- ✅ Production
- ✅ Preview  
- ✅ Development

## 🔍 디버깅 방법

### 1. Supabase 연결 테스트
```
https://dhacle.com/api/test-supabase
```
- `health_check.ok: true` 확인
- `session_check.success: true` 확인

### 2. 환경 변수 확인
```
https://dhacle.com/api/debug/kakao-auth
```
- `supabase_config.url_configured: true`
- `supabase_config.key_configured: true`
- `supabase_config.is_correct_project: true`

### 3. Vercel Functions 로그
1. Vercel Dashboard → Functions
2. `auth/callback` 함수 선택
3. `[Auth Callback]` 로그 확인

## 🚨 중요 사항

### Invalid API Key 에러가 계속 발생하면:

1. **Supabase Dashboard에서 새 Anon Key 발급**
   - Settings → API → Project API keys
   - `anon public` 키 복사
   - Vercel 환경 변수 업데이트

2. **Supabase 프로젝트 URL 확인**
   - Settings → General → Project URL
   - `https://golbwnsytwbyoneucunx.supabase.co` 맞는지 확인

3. **Kakao Provider 재설정**
   - Authentication → Providers → Kakao
   - 설정 삭제 후 다시 입력
   - 저장 버튼 반드시 클릭

## 📝 테스트 순서

1. Supabase Dashboard에서 Kakao Provider 설정 확인
2. 카카오 개발자 센터에서 Redirect URI 확인  
3. Vercel 재배포 (Redeploy without cache)
4. https://dhacle.com 에서 카카오 로그인 테스트
5. 에러 발생 시 Vercel Functions 로그 확인

## 🔗 관련 문서
- `/docs/KAKAO-LOGIN-CONFIG.md` - 카카오 앱 설정 정보
- `/docs/VERCEL-ENV-SETUP.md` - Vercel 환경 변수 설정
- `/docs/KAKAO-LOGIN-TROUBLESHOOTING.md` - 문제 해결 가이드

---
*작성일: 2025-01-11*
*문제: Invalid API Key 에러 해결*