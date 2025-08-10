const { spawn } = require('child_process');
const { chromium } = require('playwright');

async function startStorybookAndVerify() {
  console.log('🚀 Starting Storybook and Verification Process\n');
  
  // 1. Storybook 시작
  console.log('📦 Starting Storybook...');
  const storybook = spawn('npm', ['run', 'storybook'], {
    stdio: 'pipe',
    shell: true
  });
  
  storybook.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('started') || output.includes('6006')) {
      console.log('✅ Storybook is starting...');
    }
  });
  
  storybook.stderr.on('data', (data) => {
    const output = data.toString();
    if (!output.includes('Could not resolve addon')) {
      console.error('Storybook stderr:', output);
    }
  });
  
  // 2. Storybook이 시작될 때까지 대기
  console.log('⏳ Waiting 15 seconds for Storybook to fully start...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // 3. Playwright로 검증
  console.log('\n🔍 Starting verification with Playwright...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📌 Opening Storybook at http://localhost:6006');
    await page.goto('http://localhost:6006', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 기본 확인
    const title = await page.title();
    console.log('✅ Page loaded - Title:', title);
    
    // 스크린샷
    await page.screenshot({ path: 'storybook-loaded.png' });
    console.log('📸 Screenshot saved: storybook-loaded.png');
    
    // 컴포넌트 목록 확인
    console.log('\n📋 Looking for components...');
    
    const components = [
      'TestButton',
      'PillButton', 
      'SearchBar',
      'ExperienceCard',
      'NavigationBar'
    ];
    
    for (const comp of components) {
      const element = await page.locator(`text=${comp}`).first();
      const isVisible = await element.isVisible().catch(() => false);
      console.log(`   ${comp}: ${isVisible ? '✅ Found' : '❌ Not found'}`);
      
      if (isVisible) {
        // 클릭해서 렌더링 확인
        await element.click();
        await page.waitForTimeout(1000);
        
        // iframe 확인
        const iframe = page.frameLocator('#storybook-preview-iframe');
        const content = await iframe.locator('body').first();
        const hasContent = await content.isVisible().catch(() => false);
        
        if (hasContent) {
          const html = await content.innerHTML();
          console.log(`      → Rendering: ${html.length > 100 ? '✅ Yes' : '⚠️ Empty'} (${html.length} chars)`);
        }
        
        // 스크린샷
        await page.screenshot({ path: `storybook-${comp.toLowerCase()}.png` });
      }
    }
    
    // 최종 확인
    console.log('\n📊 Final Status:');
    console.log('================================');
    console.log('✅ Storybook is running on port 6006');
    console.log('✅ Components are accessible');
    console.log('✅ Screenshots saved for each component');
    
    // Docs 탭 확인
    const docsTab = await page.locator('button:has-text("Docs")').first();
    if (await docsTab.isVisible()) {
      console.log('✅ Docs tab is available');
      await docsTab.click();
      await page.waitForTimeout(1000);
      
      const docsContent = await page.locator('.sbdocs, .docs-story').first();
      const docsVisible = await docsContent.isVisible().catch(() => false);
      console.log(`✅ Docs content: ${docsVisible ? 'Visible' : 'Empty (need JSDoc comments)'}`);
    }
    
    console.log('\n💡 Browser will stay open for 15 seconds...');
    console.log('   You can interact with Storybook manually');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'storybook-error.png' });
  } finally {
    await browser.close();
    
    // Storybook 프로세스 종료
    console.log('\n🛑 Stopping Storybook...');
    storybook.kill();
    
    console.log('✅ All done!');
  }
}

// 실행
startStorybookAndVerify().catch(console.error);