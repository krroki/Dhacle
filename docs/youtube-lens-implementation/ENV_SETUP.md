# YouTube Lens Delta System - 환경변수 설정 가이드

## 필수 환경변수

### 1. 로컬 개발 환경 (.env.local)

```env
# YouTube API Keys
YT_ADMIN_KEY=your_admin_youtube_api_key_here
# 관리자용 API 키 - 통계 수집 및 배치 작업용

# Admin Configuration
ADMIN_EMAIL=glemfkcl@naver.com
# 관리자 이메일 - 관리자 권한 체크용

# Supabase (기존 설정 유지)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Vercel 프로덕션 환경

Vercel Dashboard에서 설정:
1. https://vercel.com/[your-team]/dhacle/settings/environment-variables
2. 다음 변수들 추가:
   - `YT_ADMIN_KEY` - YouTube Admin API Key
   - `ADMIN_EMAIL` - glemfkcl@naver.com
   - 기타 Supabase 관련 키들 (이미 설정됨)

### 3. 환경변수 용도

| 변수명 | 용도 | 사용처 |
|--------|------|--------|
| YT_ADMIN_KEY | YouTube 통계 수집 | Edge Functions, 배치 작업 |
| ADMIN_EMAIL | 관리자 권한 확인 | 채널 승인 콘솔 |
| 사용자 API 키 | 검색 기능 | 기존 검색 기능 (DB 저장) |

## 설정 확인 방법

```bash
# 로컬에서 확인
npm run dev
# 콘솔에서 process.env 확인

# Vercel에서 확인
vercel env pull
```

## 보안 주의사항

- ❌ 절대 Git에 커밋하지 마세요
- ❌ 클라이언트 사이드에 노출하지 마세요
- ✅ NEXT_PUBLIC_ 접두사가 없는 변수는 서버에서만 접근 가능
- ✅ Vercel 환경변수는 암호화되어 저장됨

## 문제 해결

### ADMIN_EMAIL이 인식되지 않을 때
1. `.env.local` 파일 확인
2. Vercel 환경변수 설정 확인
3. 서버 재시작 (`npm run dev`)
4. Vercel 재배포 트리거

### YT_ADMIN_KEY 할당량 초과 시
1. Google Cloud Console에서 할당량 확인
2. 배치 주기 조정 (6시간 → 12시간)
3. 캐싱 강화