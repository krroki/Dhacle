# 📱 Dhacle 카카오 로그인 설정 정보

## 🔐 환경 변수 (.env.local)
✅ **설정 완료** (2025-01-10)

```env
NEXT_PUBLIC_SUPABASE_URL=https://golbwnsytwbyoneucunx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbGJ3bnN5dHdieW9uZXVjdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI1MTYsImV4cCI6MjA3MDE0ODUxNn0.8EaDU4a1-FuCeWuRtK0fzxrRDuMvNwoB0a0qALDm6iM
```

## 🔗 Supabase 설정
- **프로젝트 URL**: https://golbwnsytwbyoneucunx.supabase.co
- **Callback URL**: https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback

### Supabase Dashboard에서 설정할 값들:
1. Authentication → Providers → Kakao 활성화
2. 다음 값 입력:
   - **Client ID (REST API Key)**: `511031d59e611bcf07a80b3e11acbdc5`
   - **Client Secret**: `xN7w9RtOiT8yOGMlZiy37ZClZotbnIeC`

## 🟨 카카오 개발자 센터 설정

### 앱 정보
- **앱 이름**: Dhacle
- **REST API Key**: `511031d59e611bcf07a80b3e11acbdc5`
- **Client Secret**: `xN7w9RtOiT8yOGMlZiy37ZClZotbnIeC`

### 필수 설정 체크리스트
1. ✅ Web 플랫폼 등록
   - 개발: http://localhost:3000
   - 프로덕션: https://dhacle.com (도메인 확정 시)

2. ✅ Redirect URI 등록
   - **필수**: `https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback`

3. ✅ 카카오 로그인 활성화
   - 제품 설정 → 카카오 로그인 → 활성화 ON

4. ✅ 동의 항목 설정
   - 프로필 정보: 필수 동의
   - 카카오계정(이메일): 선택 동의

## 🚀 적용 방법

### 1. 개발 서버 재시작 (환경 변수 적용)
```bash
# 현재 실행 중인 서버 종료
npx kill-port 3000

# 서버 재시작
npm run dev
```

### 2. 테스트
1. http://localhost:3000 접속
2. "카카오로 로그인" 버튼 클릭
3. 카카오 로그인 진행
4. 성공 시 홈으로 리다이렉트

## 📂 관련 파일
- `.env.local` - 환경 변수 (✅ 설정 완료)
- `src/app/page.tsx` - 카카오 로그인 핸들러 (✅ 구현 완료)
- `src/app/auth/callback/route.ts` - OAuth 콜백 처리 (✅ 구현 완료)
- `src/lib/supabase/browser-client.ts` - Supabase 클라이언트 (✅ 구현 완료)

## 🔴 중요 보안 참고사항
- **Client Secret은 절대 클라이언트 코드에 노출하지 마세요**
- Client Secret은 Supabase Dashboard에만 입력
- 프론트엔드에는 Supabase URL과 Anon Key만 사용

## 📅 업데이트 이력
- 2025-01-10: 실제 Supabase 프로젝트 및 카카오 앱 정보 연결 완료

---
*이 문서는 민감한 정보를 포함하고 있으므로 공개 저장소에 커밋하지 마세요.*