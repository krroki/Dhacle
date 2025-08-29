# YouTube Lens 로컬호스트 테스트 가이드

## 📋 개요
YouTube Lens 기능을 localhost에서 완전히 테스트할 수 있도록 설정하는 가이드입니다.

## 🔧 수정 완료된 이슈들 (2025-08-29)

### ✅ 1. YouTube API Response 파싱 버그 수정
- **문제**: `item.id.video_id` (snake_case)로 접근하려 했으나, YouTube API는 `item.id.videoId` (camelCase) 반환
- **위치**: `/src/lib/youtube/api-client.ts` (line 224, 230)
- **해결**: 올바른 속성명으로 수정 완료

### ✅ 2. API Key 자동 설정 보안 이슈 수정
- **문제**: 브라우저에서 직접 DB 접근 (보안 위반)
- **위치**: `/src/lib/youtube-api-auto-setup.ts`
- **해결**: API Route (`/api/user/api-keys`) 사용하도록 수정 완료

### ✅ 3. 검증된 사항
- API Route 인증 체크 정상 작동
- 에러 핸들링 적절함
- 타입 정의 올바름
- YouTube Data API v3 스펙 준수

## 🔧 필수 환경변수 설정

### 1. `.env.local` 파일에 추가해야 할 변수들

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url

# 테스트 계정 (개발 환경 전용)
TEST_ADMIN_EMAIL=test-admin@dhacle.com
TEST_ADMIN_PASSWORD=test1234567890!
# TEST_ADMIN_USER_ID는 자동 생성되므로 설정 불필요

# YouTube API (필수)
YOUTUBE_API_KEY=your_youtube_api_key
YT_ADMIN_KEY=your_admin_key

# 기타 필수 환경변수
JWT_SECRET=your_jwt_secret_at_least_32_characters
ENCRYPTION_KEY=your_64_character_encryption_key
NODE_ENV=development
```

### 2. Vercel 환경변수 설정
1. Vercel Dashboard 접속
2. Settings → Environment Variables
3. 위의 모든 변수를 "All Environments"로 추가
4. 특히 `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD` 확인

## 🚀 테스트 프로세스

### Step 1: 개발 서버 시작
```bash
npm run dev
```

### Step 2: 로그인 페이지 접속
```
http://localhost:3000/auth/login
```

### Step 3: 개발자 테스트 로그인
- 페이지 하단의 "🧪 개발자 테스트 로그인" 버튼 클릭
- 자동으로 테스트 계정이 생성/로그인됨
- YouTube Lens 페이지로 자동 리다이렉트

### Step 4: YouTube API Key 설정
- 최초 접속 시 API Key 설정 필요
- Settings → API Keys 페이지로 이동
- YouTube API Key 입력 (Google Cloud Console에서 발급)

### Step 5: YouTube Lens 기능 테스트
- 검색 기능 테스트
- 채널 폴더 관리
- 인기 Shorts 조회
- 트렌드 키워드 확인

## 🔍 문제 해결

### 1. 테스트 로그인 실패
**증상**: "테스트 로그인 실패" 알림
**해결**:
- `.env.local` 파일의 `SUPABASE_SERVICE_ROLE_KEY` 확인
- Supabase Dashboard에서 Email Auth 활성화 확인
- 콘솔 로그 확인

### 2. YouTube API 오류
**증상**: "API Key가 필요합니다" 메시지
**해결**:
- Google Cloud Console에서 YouTube Data API v3 활성화
- API Key 발급 및 등록
- 일일 할당량 확인 (10,000 units)

### 3. 세션 유지 문제
**증상**: 페이지 새로고침 시 로그아웃
**해결**:
- 브라우저 쿠키 설정 확인
- localhost에서 쿠키 차단 여부 확인
- 개발자 도구 → Application → Cookies 확인

## 📊 E2E 테스트 자동화

### Playwright 테스트 작성 예시

```typescript
// e2e/youtube-lens.test.ts
import { test, expect } from '@playwright/test';

test.describe('YouTube Lens E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 로그인
    await page.goto('http://localhost:3000/auth/login');
    await page.click('button:has-text("개발자 테스트 로그인")');
    await page.waitForURL('**/tools/youtube-lens');
  });

  test('YouTube 검색 기능', async ({ page }) => {
    // 검색 탭 클릭
    await page.click('button:has-text("검색")');
    
    // 검색어 입력
    await page.fill('input[placeholder*="검색"]', 'shorts');
    await page.click('button:has-text("검색")');
    
    // 결과 확인
    await expect(page.locator('.video-grid')).toBeVisible();
  });

  test('채널 폴더 관리', async ({ page }) => {
    // 채널 폴더 탭 클릭
    await page.click('button:has-text("채널 폴더")');
    
    // 새 폴더 생성
    await page.click('button:has-text("새 폴더")');
    await page.fill('input[name="folderName"]', '테스트 폴더');
    await page.click('button:has-text("생성")');
    
    // 폴더 확인
    await expect(page.locator('text=테스트 폴더')).toBeVisible();
  });
});
```

### 테스트 실행
```bash
# 모든 E2E 테스트 실행
npm run test:e2e

# YouTube Lens 테스트만 실행
npx playwright test youtube-lens
```

## 🔐 보안 주의사항

1. **프로덕션 배포 시**:
   - `TEST_ADMIN_*` 환경변수 제거
   - 테스트 로그인 버튼 자동 비활성화됨
   - `NODE_ENV=production` 확인

2. **API Key 관리**:
   - API Key를 코드에 하드코딩 금지
   - `.env.local` 파일은 `.gitignore`에 포함
   - Vercel 환경변수 사용

3. **테스트 계정**:
   - 개발 환경에서만 사용
   - 정기적으로 비밀번호 변경
   - 프로덕션 데이터 접근 제한

## 📝 체크리스트

- [ ] 모든 환경변수 설정 완료
- [ ] Supabase Email Auth 활성화
- [ ] YouTube Data API v3 활성화
- [ ] 테스트 로그인 성공
- [ ] YouTube Lens 페이지 접속 성공
- [ ] API Key 등록 완료
- [ ] 검색 기능 정상 작동
- [ ] 데이터 페칭 정상 작동

## 🆘 추가 지원

문제가 지속되면 다음 정보와 함께 보고해주세요:
- 브라우저 콘솔 로그
- 네트워크 탭 스크린샷
- 환경변수 설정 (민감정보 제외)
- 에러 메시지 전문

---

*최종 업데이트: 2025-08-29*