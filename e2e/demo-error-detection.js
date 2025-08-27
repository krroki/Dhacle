/**
 * 에러 감지 시스템 데모 스크립트
 * 일반 테스트 vs 에러 감지 테스트 비교 시연
 */

const { chromium } = require('playwright');

// 색상 코드
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

// 콘솔 로그 헬퍼
const log = {
  error: (msg) => console.log(`${RED}❌ ${msg}${RESET}`),
  success: (msg) => console.log(`${GREEN}✅ ${msg}${RESET}`),
  warning: (msg) => console.log(`${YELLOW}⚠️  ${msg}${RESET}`),
  info: (msg) => console.log(`${BLUE}ℹ️  ${msg}${RESET}`),
  section: (msg) => console.log(`\n${BLUE}${'='.repeat(60)}${RESET}\n${BLUE}${msg}${RESET}\n${BLUE}${'='.repeat(60)}${RESET}`)
};

// 일반 테스트 (에러 감지 없음)
async function normalTest() {
  log.section('일반 테스트 실행 (에러 감지 없음)');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 에러가 있는 HTML 페이지 생성
    const htmlWithError = `
      <!DOCTYPE html>
      <html>
      <head><title>테스트 페이지</title></head>
      <body>
        <h1>에러 테스트 페이지</h1>
        <button id="error-btn">클릭하면 에러 발생</button>
        <script>
          // 페이지 로드 시 console.error 발생
          console.error('런타임 에러: 테스트 에러 메시지');
          
          // 버튼 클릭 시 JavaScript 에러 발생
          document.getElementById('error-btn').onclick = function() {
            throw new Error('JavaScript 런타임 에러 발생!');
          };
        </script>
      </body>
      </html>
    `;
    
    await page.goto(`data:text/html,${encodeURIComponent(htmlWithError)}`);
    log.info('페이지 로드됨');
    
    // 제목 확인 (에러와 무관하게 진행)
    const title = await page.locator('h1').textContent();
    log.info(`제목 확인: ${title}`);
    
    // 버튼 클릭 (JavaScript 에러 발생하지만 무시됨)
    await page.click('#error-btn');
    log.warning('버튼 클릭 - JavaScript 에러 발생했지만 테스트는 계속 진행');
    
    // 다른 작업 계속 수행 (엄한짓)
    await page.waitForTimeout(1000);
    log.warning('에러 무시하고 다른 작업 계속 수행 중...');
    
    log.error('일반 테스트: 에러를 감지하지 못하고 끝까지 실행됨!');
    
  } catch (error) {
    log.info(`테스트 실패: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// 에러 감지가 강화된 테스트
async function errorSafeTest() {
  log.section('에러 감지 강화 테스트 실행');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let errorDetected = false;
  const detectedErrors = [];
  
  // 에러 리스너 설정
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errorDetected = true;
      detectedErrors.push({ type: 'console', message: msg.text() });
      log.success(`Console 에러 감지됨: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', exception => {
    errorDetected = true;
    detectedErrors.push({ type: 'pageerror', message: exception.message || exception.toString() });
    log.success(`JavaScript 에러 감지됨: ${exception.message || exception.toString()}`);
  });
  
  context.on('weberror', webError => {
    errorDetected = true;
    const message = webError.error() instanceof Error ? webError.error().message : String(webError.error());
    detectedErrors.push({ type: 'weberror', message });
    log.success(`Web 에러 감지됨: ${message}`);
  });
  
  try {
    // 같은 에러 페이지 로드
    const htmlWithError = `
      <!DOCTYPE html>
      <html>
      <head><title>테스트 페이지</title></head>
      <body>
        <h1>에러 테스트 페이지</h1>
        <button id="error-btn">클릭하면 에러 발생</button>
        <script>
          // 페이지 로드 시 console.error 발생
          console.error('런타임 에러: 테스트 에러 메시지');
          
          // 버튼 클릭 시 JavaScript 에러 발생
          document.getElementById('error-btn').onclick = function() {
            throw new Error('JavaScript 런타임 에러 발생!');
          };
        </script>
      </body>
      </html>
    `;
    
    await page.goto(`data:text/html,${encodeURIComponent(htmlWithError)}`);
    log.info('페이지 로드됨');
    
    // 에러 체크
    await page.waitForTimeout(500); // 에러 감지를 위한 대기
    if (errorDetected) {
      throw new Error('페이지 로드 중 에러 감지됨!');
    }
    
    // 제목 확인
    const title = await page.locator('h1').textContent();
    log.info(`제목 확인: ${title}`);
    
    // 버튼 클릭
    await page.click('#error-btn');
    
    // 에러 감지를 위한 대기
    await page.waitForTimeout(500);
    if (errorDetected) {
      throw new Error('JavaScript 런타임 에러 감지됨!');
    }
    
    log.warning('이 메시지는 출력되면 안됨 (에러로 중단되어야 함)');
    
  } catch (error) {
    log.success(`테스트 중단됨: ${error.message}`);
    log.success('에러 감지 시스템이 정상 작동하여 테스트를 즉시 중단했습니다!');
  } finally {
    if (detectedErrors.length > 0) {
      log.section('감지된 에러 목록');
      detectedErrors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. [${err.type}] ${err.message}`);
      });
    }
    await browser.close();
  }
}

// 비교 실행
async function main() {
  console.log(`
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}
${BLUE}  E2E 테스트 런타임 에러 감지 시스템 데모${RESET}
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}
  `);
  
  // 1. 일반 테스트 실행
  await normalTest();
  
  console.log('\n');
  
  // 2. 에러 감지 테스트 실행
  await errorSafeTest();
  
  // 결과 요약
  log.section('결과 요약');
  console.log(`
${RED}❌ 일반 테스트:${RESET}
  - Console 에러 무시됨
  - JavaScript 에러 무시됨
  - 테스트가 끝까지 진행됨 (엄한짓)
  - 실제 문제를 놓칠 수 있음

${GREEN}✅ 에러 감지 테스트:${RESET}
  - Console 에러 즉시 감지
  - JavaScript 에러 즉시 감지
  - 에러 발생 시 테스트 중단
  - 정확한 에러 위치와 원인 파악
  `);
  
  log.info('데모 완료!');
}

// 스크립트 실행
main().catch(console.error);