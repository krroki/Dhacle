import { defineConfig, devices } from '@playwright/test'

/**
 * 실용적 E2E 테스트용 Playwright 설정
 * Context7 권장: 기존 테스트 로그인 시스템 활용
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/youtube-lens-practical.spec.ts', '**/youtube-lens-dynamic.spec.ts'],
  
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  timeout: 60000,
  
  reporter: [['list'], ['html', { open: 'never' }]],
  
  use: {
    baseURL: 'http://localhost:3003',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false, // 브라우저 표시해서 확인
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'practical-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
  ],

  // 외부에서 실행 중인 서버 사용 (webServer 설정 없음)
})