import { defineConfig, devices } from '@playwright/test'

/**
 * Temporary Playwright Configuration for Runtime Error Testing
 * Uses already running dev server without webServer config
 */
export default defineConfig({
  testDir: './e2e',
  testIgnore: '**/archive/**',
  
  /* Performance Settings */
  fullyParallel: false, // Sequential for debugging
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for debugging
  workers: 1, // Single worker for debugging
  
  /* Enhanced Reporter */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  
  /* Error Detection Settings */
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    /* Error Tracking */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure', 
    video: 'retain-on-failure',
    
    /* Runtime Error Detection */
    ignoreHTTPSErrors: true,
    actionTimeout: 30 * 1000, // 30 seconds for debugging
    navigationTimeout: 30 * 1000, // 30 seconds for debugging
  },

  /* Single Project for Debugging */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // No storage state for now to avoid auth complexities
        contextOptions: {
          recordVideo: { dir: 'test-results/videos/' },
        }
      },
    },
  ],

  // No webServer - use already running server
})