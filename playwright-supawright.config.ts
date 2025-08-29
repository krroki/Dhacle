import { defineConfig } from '@playwright/test'

export default defineConfig({
  // 기존 setup 없이 독립 실행
  testDir: './e2e',
  testMatch: '**/youtube-lens-supawright.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 60000,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: false, // 브라우저 표시해서 디버깅
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'supawright-chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})