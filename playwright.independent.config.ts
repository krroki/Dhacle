import { defineConfig, devices } from '@playwright/test'

/**
 * 독립적인 YouTube Lens 테스트용 Playwright 설정
 * 서버 의존성과 setup 의존성 완전 제거
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\/youtube-lens-final-working\.spec\.ts/,
  
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  
  reporter: [['line'], ['html', { open: 'never' }]],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects: [
    {
      name: 'independent-test',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
        ignoreHTTPSErrors: true,
        acceptDownloads: true,
        actionTimeout: 30 * 1000,
        navigationTimeout: 30 * 1000,
      },
      dependencies: [],
    },
  ],

  // 서버 설정 제거 - 외부에서 실행중인 서버 사용
})