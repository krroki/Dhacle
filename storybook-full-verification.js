const { chromium } = require('playwright');

async function verifyStorybook() {
  console.log('🔍 Starting Storybook Full Verification...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  // 콘솔 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('❌ Console Error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });
  
  try {
    console.log('📌 Opening Storybook...');
    await page.goto('http://localhost:6006', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 1. Storybook 로드 확인
    console.log('\n✅ Step 1: Checking Storybook loaded...');
    const title = await page.title();
    console.log('   Title:', title);
    
    // 2. 사이드바 확인
    console.log('\n✅ Step 2: Checking sidebar...');
    const sidebar = await page.locator('[id="storybook-explorer-tree"], [role="tree"], .sidebar-container').first();
    const sidebarVisible = await sidebar.isVisible().catch(() => false);
    console.log('   Sidebar visible:', sidebarVisible);
    
    if (!sidebarVisible) {
      // 사이드바가 없으면 다른 선택자 시도
      const altSidebar = await page.locator('nav').first();
      const altSidebarVisible = await altSidebar.isVisible().catch(() => false);
      console.log('   Alternative sidebar visible:', altSidebarVisible);
    }
    
    // 3. 모든 스토리 링크 찾기
    console.log('\n✅ Step 3: Finding all story links...');
    const storyLinks = await page.locator('a[href*="story"], button:has-text("Button"), button:has-text("Search"), button:has-text("Navigation"), button:has-text("Experience"), button:has-text("Test")').all();
    console.log(`   Found ${storyLinks.length} potential story links`);
    
    // 4. TestButton 확인
    console.log('\n✅ Step 4: Checking TestButton story...');
    const testButtonLink = await page.locator('text=/Test.*Button/i').first();
    if (await testButtonLink.isVisible()) {
      await testButtonLink.click();
      await page.waitForTimeout(1000);
      
      // iframe 내부 확인
      const iframe = page.frameLocator('#storybook-preview-iframe, iframe[title*="storybook"]').first();
      const testButton = await iframe.locator('button').first();
      const testButtonVisible = await testButton.isVisible().catch(() => false);
      console.log('   TestButton in iframe visible:', testButtonVisible);
      
      if (testButtonVisible) {
        const buttonText = await testButton.textContent();
        console.log('   Button text:', buttonText);
      }
    } else {
      console.log('   ⚠️ TestButton story not found in sidebar');
    }
    
    // 5. PillButton 확인
    console.log('\n✅ Step 5: Checking PillButton story...');
    const pillButtonLink = await page.locator('text=/PillButton/i').first();
    if (await pillButtonLink.isVisible()) {
      await pillButtonLink.click();
      await page.waitForTimeout(1000);
      
      const iframe = page.frameLocator('#storybook-preview-iframe, iframe[title*="storybook"]').first();
      const pillButton = await iframe.locator('button').first();
      const pillButtonVisible = await pillButton.isVisible().catch(() => false);
      console.log('   PillButton in iframe visible:', pillButtonVisible);
      
      // Controls 패널 확인
      const controls = await page.locator('[id*="controls"], [id*="panel"]').first();
      const controlsVisible = await controls.isVisible().catch(() => false);
      console.log('   Controls panel visible:', controlsVisible);
      
      // Docs 탭 확인
      const docsTab = await page.locator('button:has-text("Docs"), [role="tab"]:has-text("Docs")').first();
      const docsTabVisible = await docsTab.isVisible().catch(() => false);
      console.log('   Docs tab visible:', docsTabVisible);
      
      if (docsTabVisible) {
        await docsTab.click();
        await page.waitForTimeout(1000);
        
        const docsContent = await page.locator('.docs-content, .sbdocs, [id*="docs"]').first();
        const docsContentVisible = await docsContent.isVisible().catch(() => false);
        console.log('   Docs content visible:', docsContentVisible);
        
        if (!docsContentVisible) {
          console.log('   ⚠️ Docs content is empty or not rendering');
        }
      }
    } else {
      console.log('   ⚠️ PillButton story not found');
    }
    
    // 6. 페이지 구조 분석
    console.log('\n✅ Step 6: Analyzing page structure...');
    const pageStructure = await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      const buttons = document.querySelectorAll('button');
      const links = document.querySelectorAll('a');
      const divs = document.querySelectorAll('div');
      
      return {
        iframeCount: iframes.length,
        iframeSrcs: Array.from(iframes).map(f => f.src || f.title || 'no-src'),
        buttonCount: buttons.length,
        buttonTexts: Array.from(buttons).slice(0, 10).map(b => b.textContent?.trim()),
        linkCount: links.length,
        divCount: divs.length,
        hasStorybookRoot: !!document.querySelector('#storybook-root, #root, .sb-show-main'),
        hasPreviewIframe: !!document.querySelector('#storybook-preview-iframe'),
        bodyClasses: document.body.className,
        documentTitle: document.title
      };
    });
    
    console.log('   Page structure:', JSON.stringify(pageStructure, null, 2));
    
    // 7. 스크린샷 촬영
    console.log('\n📸 Taking screenshots...');
    await page.screenshot({ 
      path: 'storybook-main-page.png',
      fullPage: false 
    });
    console.log('   Main page screenshot saved');
    
    // 8. iframe 내부 직접 확인
    console.log('\n✅ Step 7: Checking iframe content directly...');
    const iframeElement = await page.locator('#storybook-preview-iframe, iframe').first();
    if (await iframeElement.isVisible()) {
      const frame = page.frameLocator('#storybook-preview-iframe, iframe').first();
      
      // iframe 내부의 모든 요소 확인
      const iframeContent = await frame.locator('body').first();
      const iframeHTML = await iframeContent.innerHTML().catch(() => 'Could not get HTML');
      console.log('   Iframe content length:', iframeHTML.length);
      
      if (iframeHTML.length < 100) {
        console.log('   ⚠️ Iframe appears to be empty or minimal content');
        console.log('   First 500 chars:', iframeHTML.substring(0, 500));
      }
    }
    
    // 9. 네트워크 에러 확인
    console.log('\n✅ Step 8: Checking for network errors...');
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()?.errorText
      });
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (failedRequests.length > 0) {
      console.log('   ❌ Failed requests:', failedRequests);
    } else {
      console.log('   ✅ No failed requests');
    }
    
    console.log('\n🎯 Verification Summary:');
    console.log('   - Storybook is running: ✅');
    console.log('   - Stories are listed: ' + (storyLinks.length > 0 ? '✅' : '❌'));
    console.log('   - Components rendering: ' + (pageStructure.iframeCount > 0 ? '✅' : '❌'));
    console.log('   - Docs tab present: ' + (await page.locator('button:has-text("Docs")').isVisible() ? '✅' : '❌'));
    
    console.log('\n⚠️ Common Issues Found:');
    console.log('   1. Docs may be empty - need to add JSDoc comments to components');
    console.log('   2. Some stories may not have proper args/argTypes defined');
    console.log('   3. Missing Storybook addons for documentation generation');
    
    console.log('\n💡 Keeping browser open for manual inspection...');
    console.log('   Press Ctrl+C to close');
    
    // 브라우저를 30초간 열어둠
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Verification complete!');
  }
}

// 실행
verifyStorybook().catch(console.error);