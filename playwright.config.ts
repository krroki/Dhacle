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
    // Setup project
    { 
      name: 'setup', 
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] }
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
  ],

  /* 최적화된 서버 설정 */
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 15 * 1000, // 15초로 단축 (30초 → 15초)
    stdout: 'ignore', // 서버 로그 숨김 (성능 향상)
    stderr: 'pipe',
  },
})