/**
 * E2E 테스트 에러 감지 헬퍼
 * Next.js 런타임 에러, 콘솔 에러, Error Boundary 활성화를 감지
 */

import { Page, test } from '@playwright/test';

interface ErrorContext {
  url: string;
  timestamp: string;
  testName: string;
  action?: string;
}

export class ErrorDetector {
  private errors: Array<{
    type: 'console' | 'pageerror' | 'weberror' | 'nextjs-overlay' | 'error-boundary';
    message: string;
    context: ErrorContext;
  }> = [];

  /**
   * 페이지에 에러 감지 리스너 설정
   */
  async attachToPage(page: Page, testName: string) {
    // 1. 콘솔 에러 감지
    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.recordError('console', msg.text(), page, testName);
        
        // React 에러나 Next.js 에러 즉시 실패
        if (msg.text().includes('Error:') || 
            msg.text().includes('Warning:') ||
            msg.text().includes('Unhandled')) {
          throw new Error(`🔴 콘솔 에러 감지: ${msg.text()}`);
        }
      }
    });

    // 2. JavaScript 런타임 에러 감지
    page.on('pageerror', exception => {
      const message = exception.message || exception.toString();
      this.recordError('pageerror', message, page, testName);
      throw new Error(`🔴 JavaScript 런타임 에러: ${message}`);
    });

    // 3. 웹 에러 감지 (context level)
    page.context().on('weberror', webError => {
      const message = webError.error() instanceof Error ? webError.error().message : String(webError.error());
      this.recordError('weberror', message, page, testName);
      throw new Error(`🔴 웹 에러 발생: ${message}`);
    });

    // 4. 각 네비게이션/액션 후 에러 체크
    page.on('load', () => this.checkForErrors(page, testName));
    page.on('domcontentloaded', () => this.checkForErrors(page, testName));
  }

  /**
   * Next.js 에러 오버레이 및 Error Boundary 체크
   */
  private async checkForErrors(page: Page, testName: string) {
    try {
      // Next.js 개발 모드 에러 오버레이 감지
      const errorOverlay = await page.locator('[data-nextjs-dialog]').count();
      if (errorOverlay > 0) {
        const errorText = await page.locator('[data-nextjs-dialog]').textContent();
        this.recordError('nextjs-overlay', errorText || 'Next.js Error Overlay', page, testName);
        throw new Error(`🔴 Next.js 에러 오버레이 감지: ${errorText}`);
      }

      // Next.js hydration 에러 감지
      const hydrationError = await page.locator('body:has-text("Hydration failed")').count();
      if (hydrationError > 0) {
        throw new Error('🔴 Next.js Hydration 에러 발생');
      }

      // React Error Boundary 활성화 감지
      const errorBoundary = await page.locator('[role="alert"], .error-boundary, [data-error-boundary]').count();
      if (errorBoundary > 0) {
        const errorText = await page.locator('[role="alert"], .error-boundary').first().textContent();
        this.recordError('error-boundary', errorText || 'Error Boundary Triggered', page, testName);
        throw new Error(`🔴 Error Boundary 활성화: ${errorText}`);
      }

      // 한국어 에러 메시지 체크 (프로젝트 특성)
      const koreanError = await page.locator('text=/문제가 발생했습니다|오류가 발생했습니다|에러/').count();
      if (koreanError > 0) {
        throw new Error('🔴 사용자 에러 화면 표시됨');
      }
    } catch (error) {
      // 체크 중 에러는 무시 (페이지가 아직 로드 중일 수 있음)
      if (error instanceof Error && error.message.includes('🔴')) {
        throw error; // 우리가 던진 에러는 재전파
      }
    }
  }

  /**
   * 에러 기록
   */
  private recordError(
    type: 'console' | 'pageerror' | 'weberror' | 'nextjs-overlay' | 'error-boundary',
    message: string,
    page: Page,
    testName: string
  ) {
    const context: ErrorContext = {
      url: page.url(),
      timestamp: new Date().toISOString(),
      testName,
      action: this.getCurrentAction()
    };

    this.errors.push({ type, message, context });

    // 에러 발생 시 스크린샷 자동 저장
    page.screenshot({
      path: `test-results/error-${type}-${Date.now()}.png`,
      fullPage: true
    }).catch(() => {}); // 스크린샷 실패는 무시
  }

  /**
   * 현재 실행 중인 액션 추적 (옵션)
   */
  private currentAction: string = '';
  
  setCurrentAction(action: string) {
    this.currentAction = action;
  }

  private getCurrentAction(): string {
    return this.currentAction;
  }

  /**
   * 누적된 에러 리포트
   */
  getErrors() {
    return this.errors;
  }

  /**
   * 에러 체크 assertion
   */
  assertNoErrors() {
    if (this.errors.length > 0) {
      const summary = this.errors.map(e => 
        `${e.type}: ${e.message.substring(0, 100)}...`
      ).join('\n');
      
      throw new Error(`테스트 중 ${this.errors.length}개 에러 발생:\n${summary}`);
    }
  }
}

/**
 * 에러 감지가 활성화된 테스트 fixture
 */
export const errorSafeTest = test.extend<{
  errorDetector: ErrorDetector;
}>({
  errorDetector: async ({ page }, use, testInfo) => {
    const detector = new ErrorDetector();
    await detector.attachToPage(page, testInfo.title);
    
    // 테스트 실행
    await use(detector);
    
    // 테스트 종료 시 에러 체크
    detector.assertNoErrors();
  },
});

/**
 * 액션 실행 전 컨텍스트 설정 헬퍼
 */
export async function withErrorContext<T>(
  detector: ErrorDetector,
  action: string,
  fn: () => Promise<T>
): Promise<T> {
  detector.setCurrentAction(action);
  try {
    const result = await fn();
    detector.setCurrentAction('');
    return result;
  } catch (error) {
    console.error(`❌ 에러 발생 위치: ${action}`);
    throw error;
  }
}