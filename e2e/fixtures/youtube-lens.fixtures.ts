/**
 * YouTube Lens 공통 테스트 픽스처
 * 
 * Context7 패턴 기반으로 중복 제거 및 안정성 향상:
 * ✅ 테스트 로그인 자동화
 * ✅ WebKit 브라우저별 처리
 * ✅ 에러 감지 시스템 통합
 * ✅ 동적 서버 URL 지원
 * ✅ 스크린샷 자동 저장
 */

import { test as base, expect, Page } from '@playwright/test';
import { ErrorDetector } from '../helpers/error-detector';
import { getRunningServerUrl, waitForServer } from '../helpers/get-server-url';

// 픽스처 타입 정의
type YouTubeLensFixtures = {
  authenticatedPage: Page;
  errorDetector: ErrorDetector;
  serverUrl: string;
  youtubeLensPage: Page;
};

// Context7 패턴: test.extend()를 사용한 커스텀 픽스처 생성
export const test = base.extend<YouTubeLensFixtures>({
  
  // 1. 서버 URL 동적 감지 픽스처
  serverUrl: async ({}, use) => {
    const url = await getRunningServerUrl();
    const isReady = await waitForServer(url);
    
    if (!isReady) {
      throw new Error(`테스트 서버가 준비되지 않음: ${url}`);
    }
    
    console.log(`🌐 테스트 서버 URL: ${url}`);
    await use(url);
  },

  // 2. 에러 감지기 픽스처 (자동 활성화)
  errorDetector: async ({ page }, use, testInfo) => {
    const detector = new ErrorDetector();
    await detector.initialize();
    await detector.attachToPage(page, testInfo.title);
    
    await use(detector);
    
    // 테스트 완료 후 에러 체크
    const errors = detector.getErrors();
    if (errors.length > 0) {
      console.log(`⚠️ 감지된 에러: ${errors.length}개`);
      errors.forEach(error => {
        console.log(`  - ${error.type}: ${error.message}`);
      });
    }
  },

  // 3. 인증된 페이지 픽스처 (테스트 로그인 자동 실행)
  authenticatedPage: async ({ page, browserName, serverUrl }, use) => {
    console.log('🔐 테스트 로그인 시작...');
    
    // 테스트 로그인 페이지로 이동
    await page.goto(`${serverUrl}/auth/test-login`);
    await page.waitForLoadState('networkidle');
    
    // 테스트 로그인 페이지 확인
    await expect(page.locator('h1')).toContainText('🧪 테스트 로그인');
    
    // 테스트 로그인 버튼 클릭
    const loginButton = page.locator('button:has-text("🧪 테스트 로그인")');
    await expect(loginButton).toBeVisible();
    await loginButton.click();
    
    // Context7 패턴: WebKit 브라우저별 특수 처리
    if (browserName === 'webkit') {
      console.log('🍎 WebKit 감지: 추가 인증 대기 시간 적용');
      await page.waitForTimeout(5000); // WebKit 전용 긴 대기
      
      // WebKit 전용 쿠키 검증
      const cookies = await page.context().cookies();
      const hasAuthCookie = cookies.some(c => c.name.startsWith('sb-'));
      if (!hasAuthCookie) {
        console.log('⚠️ WebKit 인증 쿠키 미설정, 재시도 중...');
        await page.waitForTimeout(2000); // 추가 대기
      }
    } else {
      // 다른 브라우저는 기본 대기 시간
      await page.waitForTimeout(2000);
    }
    
    console.log('✅ 테스트 로그인 완료');
    await use(page);
  },

  // 4. YouTube Lens 페이지 픽스처 (인증된 페이지에서 YouTube Lens 접근)
  youtubeLensPage: async ({ authenticatedPage, serverUrl, browserName }, use, testInfo) => {
    console.log('📺 YouTube Lens 페이지 접근 중...');
    
    // YouTube Lens 페이지로 이동
    await authenticatedPage.goto(`${serverUrl}/tools/youtube-lens`);
    await authenticatedPage.waitForLoadState('networkidle');
    
    // 현재 URL 확인 (로그인 페이지로 리다이렉트되면 안됨)
    const currentUrl = authenticatedPage.url();
    console.log('📍 현재 URL:', currentUrl);
    
    if (currentUrl.includes('/auth/login')) {
      console.error('❌ 인증 실패: 로그인 페이지로 리다이렉트됨');
      
      // 실패 스크린샷 저장
      const screenshotPath = `test-results/screenshots/auth-failed-${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}.png`;
      await authenticatedPage.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      throw new Error('인증 실패: 로그인 페이지로 리다이렉트됨');
    }
    
    // Context7 패턴: 페이지 제목 로딩 완료까지 안정적으로 대기
    console.log('📄 페이지 제목 로딩 완료 대기 중...');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForFunction(() => document.readyState === 'complete');
    
    // WebKit 전용 추가 페이지 안정화 대기
    if (browserName === 'webkit') {
      await authenticatedPage.waitForLoadState('domcontentloaded');
      await authenticatedPage.waitForTimeout(3000); // UI 렌더링 완료 대기
    }
    
    // 제목이 변경될 때까지 대기 (비동기 제목 로딩 처리)
    try {
      await authenticatedPage.waitForFunction(() => 
        document.title.includes('YouTube') || 
        document.querySelector('h1')?.textContent?.includes('YouTube'),
        { timeout: 10000 }
      );
      console.log('✅ YouTube 제목 로딩 완료');
    } catch (e) {
      console.log('⚠️ YouTube 제목 로딩 타임아웃, 현재 상태로 진행');
    }
    
    // 페이지 제목 확인
    const pageTitle = await authenticatedPage.locator('h1').first().textContent();
    console.log('📄 페이지 제목:', pageTitle);
    console.log('🌐 브라우저 제목:', await authenticatedPage.title());
    
    console.log('✅ YouTube Lens 페이지 접근 완료');
    await use(authenticatedPage);
    
    // 테스트 완료 후 성공 스크린샷 저장 (선택적)
    if (testInfo.status === 'passed') {
      const screenshotPath = `test-results/screenshots/youtube-lens-success-${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}.png`;
      await authenticatedPage.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      console.log(`📸 성공 스크린샷: ${screenshotPath}`);
    }
  }
});

// Context7 패턴: expect도 함께 export
export { expect } from '@playwright/test';

// 공통 유틸리티 함수들
export const YouTubeLensUtils = {
  /**
   * API 응답 모니터링 설정
   */
  async setupAPIMonitoring(page: Page): Promise<Array<{url: string, status: number}>> {
    const apiResponses: Array<{url: string, status: number}> = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status()
        });
        console.log(`📡 API 호출: ${response.status()} ${response.url()}`);
      }
    });
    
    return apiResponses;
  },

  /**
   * API 에러 분석
   */
  analyzeAPIErrors(apiResponses: Array<{url: string, status: number}>) {
    const serverErrors = apiResponses.filter(r => r.status >= 500);
    const authErrors = apiResponses.filter(r => r.status === 401 || r.status === 403);
    
    if (serverErrors.length > 0) {
      console.log('🚨 500 에러 감지된 API들:');
      serverErrors.forEach(err => {
        console.log(`  - ${err.status} ${err.url}`);
      });
    }
    
    if (authErrors.length > 0) {
      console.log('🔐 인증 에러 감지된 API들:');
      authErrors.forEach(err => {
        console.log(`  - ${err.status} ${err.url}`);
      });
    }
    
    return {
      hasErrors: serverErrors.length > 0 || authErrors.length > 0,
      serverErrors,
      authErrors
    };
  },

  /**
   * UI 렌더링 상태 확인
   */
  async checkUIRendering(page: Page) {
    // 로딩 스피너가 사라질 때까지 대기
    try {
      await page.waitForSelector('[data-testid="loading"], .loading', { 
        state: 'hidden', 
        timeout: 10000 
      });
      console.log('✅ 로딩 완료');
    } catch {
      console.log('⚠️ 로딩 인디케이터 미발견 (이미 로드 완료일 수 있음)');
    }
    
    // 주요 UI 요소들 확인
    const mainContent = await page.locator('main, [role="main"]').count();
    const buttons = await page.locator('button').count();
    const headings = await page.locator('h1, h2, h3').count();
    
    console.log(`📊 UI 렌더링 상태:`);
    console.log(`  - 메인 컨텐츠: ${mainContent}개`);
    console.log(`  - 버튼: ${buttons}개`);
    console.log(`  - 제목: ${headings}개`);
    
    return {
      hasContent: mainContent > 0 && buttons > 0,
      counts: { mainContent, buttons, headings }
    };
  }
};