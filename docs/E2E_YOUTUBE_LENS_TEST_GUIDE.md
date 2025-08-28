# YouTube Lens E2E 테스트 가이드

## 📋 개요
YouTube Lens 기능의 완전한 E2E 테스트를 위한 실제 카카오 OAuth 로그인과 프로덕션 환경 테스트 가이드입니다.

## 🔐 테스트 계정 정보
```
이메일: glemfkcl@naver.com
비밀번호: dhfl9909
```

## 🚀 빠른 시작

### 1. 로컬 환경 테스트 (개발용)
```bash
# 개발 서버 시작
npm run dev

# 테스트 실행 (테스트 로그인 사용)
npm run e2e:youtube-lens
```

### 2. 프로덕션 환경 테스트 (실제 카카오 로그인)
```bash
# 실제 카카오 OAuth로 프로덕션 테스트
npm run e2e:youtube-lens:production

# 브라우저 보면서 디버깅
npm run e2e:youtube-lens:headed

# 단계별 디버깅 모드
npm run e2e:youtube-lens:debug
```

### 3. 연속 테스트 (CI/CD용)
```bash
# 세션 생성 + 전체 테스트 실행
npm run e2e:youtube-lens:continuous
```

## 📁 테스트 파일 구조

### 주요 테스트 파일
- `e2e/auth.setup.ts` - 카카오 OAuth 세션 생성
- `e2e/youtube-lens-production.spec.ts` - 로컬 환경 테스트
- `e2e/youtube-lens-kakao-production.spec.ts` - 프로덕션 환경 테스트
- `e2e/youtube-lens-real.spec.ts` - 실제 API 통합 테스트

### 헬퍼 파일
- `e2e/helpers/error-detector.ts` - 런타임 에러 감지
- `playwright.config.ts` - Playwright 설정

## 🔍 테스트 시나리오

### 1. 인증 플로우
- [x] 카카오 OAuth 로그인
- [x] 세션 저장 및 재사용
- [x] 권한 확인

### 2. YouTube Lens 기능
- [x] 페이지 접근 권한
- [x] 인기 Shorts 데이터 로딩
- [x] YouTube 검색 기능
- [x] 채널 상세 정보
- [x] 7개 필드 데이터 표시
- [x] 6블록 대시보드

### 3. API 통합
- [x] YouTube API 호출
- [x] 데이터 포맷팅 (천/만 단위)
- [x] 에러 처리 및 복구
- [x] Rate Limit 대응

### 4. 성능 메트릭
- [x] 페이지 로드 시간 < 3초
- [x] First Paint < 1.5초
- [x] API 응답 < 2초
- [x] Core Web Vitals 측정

## 🛠️ 문제 해결

### 카카오 로그인 실패 시
1. 계정 정보 확인
2. 2단계 인증 확인
3. 브라우저 캐시 삭제
```bash
# 저장된 세션 삭제
rm -rf playwright/.auth/
```

### API 에러 발생 시
1. YouTube API 키 확인
2. Rate Limit 상태 확인
3. 네트워크 연결 확인

### 테스트 타임아웃 시
```javascript
// playwright.config.ts에서 타임아웃 조정
actionTimeout: 20 * 1000,  // 20초
navigationTimeout: 30 * 1000, // 30초
```

## 📊 테스트 리포트

### HTML 리포트 생성
```bash
npx playwright show-report
```

### 스크린샷 위치
```
test-results/screenshots/
```

### 트레이스 파일
```bash
npx playwright show-trace test-results/.../trace.zip
```

## 🔄 CI/CD 통합

### GitHub Actions 예제
```yaml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 */6 * * *'  # 6시간마다

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E Tests
        env:
          KAKAO_TEST_EMAIL: ${{ secrets.KAKAO_TEST_EMAIL }}
          KAKAO_TEST_PASSWORD: ${{ secrets.KAKAO_TEST_PASSWORD }}
        run: npm run e2e:youtube-lens:production
      
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 💡 베스트 프랙티스

### 1. 테스트 작성 원칙
- 각 테스트는 독립적으로 실행 가능
- 명확한 assertion과 에러 메시지
- 적절한 대기 시간과 retry 로직

### 2. 성능 최적화
- 세션 재사용으로 로그인 시간 단축
- 병렬 실행 활용
- 불필요한 네트워크 요청 최소화

### 3. 유지보수
- 정기적인 테스트 실행 (최소 일 1회)
- 실패 테스트 즉시 수정
- 새 기능 추가 시 테스트 동시 작성

## 📈 모니터링 대시보드

### 주요 지표
- 테스트 성공률
- 평균 실행 시간
- API 응답 시간
- 에러 발생 빈도

### 알림 설정
- 테스트 실패 시 Slack 알림
- 성능 저하 시 이메일 알림
- Daily 리포트 생성

## 🔧 고급 설정

### 환경 변수
```bash
# .env.test
TEST_ENV=production
KAKAO_TEST_EMAIL=glemfkcl@naver.com
KAKAO_TEST_PASSWORD=dhfl9909
PLAYWRIGHT_BASE_URL=https://dhacle.vercel.app
```

### 디버깅 모드
```bash
# Playwright Inspector 사용
PWDEBUG=1 npm run e2e:youtube-lens:production

# 느린 모드로 실행 (각 액션 사이 지연)
npx playwright test --slow-mo=1000
```

## 📝 체크리스트

### 매일 실행
- [ ] 로그인 테스트
- [ ] YouTube Lens 접근
- [ ] 인기 Shorts 로딩
- [ ] 검색 기능

### 주간 실행
- [ ] 전체 E2E 워크플로우
- [ ] 성능 메트릭 측정
- [ ] 크로스 브라우저 테스트

### 배포 전 필수
- [ ] 모든 테스트 통과
- [ ] 성능 목표 달성
- [ ] 에러 0건 확인

## 📞 지원

문제 발생 시:
1. 이슈 트래커 확인
2. 로그 파일 첨부
3. 재현 단계 상세 기록

---

**작성일**: 2025-08-28
**버전**: 1.0.0
**담당**: test-agent, pm-dhacle