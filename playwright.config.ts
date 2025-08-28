import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration - 최적화 및 에러 감지 강화
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  testIgnore: '**/archive/**', // archive 폴더 제외
  
  /* 성능 최적화 설정 */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // 로컬에서도 1회 재시도
  workers: process.env.CI ? 1 : 4, // 로컬 병렬 처리 최적화
  
  /* 향상된 리포터 */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  /* 에러 감지 강화 설정 */
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    /* 에러 추적 강화 */
    trace: 'retain-on-failure', // 실패시 항상 trace 저장
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    /* 런타임 에러 감지를 위한 설정 */
    ignoreHTTPSErrors: true,
    actionTimeout: 10 * 1000, // 10초로 단축
    navigationTimeout: 15 * 1000, // 15초로 단축
  },

  /* 최적화된 프로젝트 구성 */
  projects: [
    // 실제 카카오 OAuth Setup project
    { 
      name: 'setup', 
      testMatch: /.*\.setup\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        // OAuth 자동화를 위한 추가 설정
        ignoreHTTPSErrors: true,
        acceptDownloads: true,
        // 카카오 로그인 페이지용 긴 타임아웃
        actionTimeout: 15 * 1000,
        navigationTimeout: 20 * 1000,
      }
    },
    
    // 🚀 기본 실행: Chromium만 (빠른 실행)
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
        
        /* 런타임 에러 감지 강화 */
        contextOptions: {
          // 콘솔 메시지 수집
          recordVideo: { dir: 'test-results/videos/' },
        }
      },
      dependencies: ['setup'],
    },
    
    // 📋 선택적 실행: 다른 브라우저 (필요시만)
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    
    // 🎯 빠른 검증용 프로젝트 (핵심 테스트만)
    {
      name: 'smoke',
      testMatch: /.*\/(auth|homepage|core-auth)\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    
    // 🚀 실제 카카오 OAuth YouTube Lens 테스트
    {
      name: 'real-kakao-oauth',
      testMatch: /.*\/youtube-lens-real\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
        // YouTube API 호출을 위한 긴 타임아웃
        actionTimeout: 20 * 1000,
        navigationTimeout: 25 * 1000,
      },
      dependencies: ['setup'],
    },

    // 🏠 로컬 환경 실제 카카오 OAuth 테스트
    {
      name: 'local-oauth',
      testMatch: /.*\/youtube-lens-local-oauth\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        // 세션 파일 없이 시작 (테스트 내에서 OAuth 수행)
        baseURL: 'http://localhost:3000',
        ignoreHTTPSErrors: true,
        acceptDownloads: true,
        // 로컬 환경 최적화된 타임아웃
        actionTimeout: 20 * 1000,
        navigationTimeout: 25 * 1000,
      },
      // setup 의존성 없이 자체적으로 OAuth 수행
      dependencies: [],
    },

    // 🎯 독립적인 YouTube Lens 테스트 (setup 의존성 없음)
    {
      name: 'independent',
      testMatch: /.*\/youtube-lens-final-working\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        // 완전히 독립적인 실행
        baseURL: 'http://localhost:3000',
        ignoreHTTPSErrors: true,
        acceptDownloads: true,
        actionTimeout: 30 * 1000,
        navigationTimeout: 30 * 1000,
      },
      // 의존성 완전 제거
      dependencies: [],
    },

    // 🌍 프로덕션 환경 YouTube Lens 테스트 (현재 비활성화 - 배포 필요)
    {
      name: 'production-oauth',
      testMatch: /.*\/youtube-lens-production-oauth\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        // 세션 파일 없이 시작 (테스트 내에서 OAuth 수행)
        // storageState는 첫 번째 테스트 완료 후 저장됨
        // 프로덕션 환경 설정
        baseURL: 'https://dhacle.vercel.app',
        ignoreHTTPSErrors: true,
        acceptDownloads: true,
        // 긴 타임아웃 (네트워크 지연 고려)
        actionTimeout: 30 * 1000,
        navigationTimeout: 35 * 1000,
      },
      // setup 의존성 없이 자체적으로 OAuth 수행
      dependencies: [],
    },
  ],

  /* 최적화된 서버 설정 */
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,  // 기존 서버 재사용 강제
    timeout: 15 * 1000, // 15초로 단축 (30초 → 15초)
    stdout: 'ignore', // 서버 로그 숨김 (성능 향상)
    stderr: 'pipe',
  },
})