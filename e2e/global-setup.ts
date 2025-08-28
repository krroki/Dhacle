/**
 * Playwright 전역 설정 - 모든 테스트에 런타임 에러 감지 자동 적용
 */

import { test as baseTest, expect } from '@playwright/test';
import { ErrorDetector } from './helpers/error-detector';

/**
 * 모든 테스트에 자동으로 에러 감지 적용
 */
export const test = baseTest.extend<{ errorDetector: ErrorDetector }>({
  errorDetector: async ({ page }, use, testInfo) => {
    const detector = new ErrorDetector();
    await detector.attachToPage(page, testInfo.title);
    
    console.log(`🛡️ ErrorDetector 활성화: ${testInfo.title}`);
    
    await use(detector);
    
    // 테스트 종료 시 에러 체크
    detector.assertNoErrors();
  },
});

export { expect };