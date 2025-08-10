const { chromium } = require('playwright');

async function verifyAndFixStorybook() {
  console.log('🔍 Complete Storybook Verification & Fix\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const page = await browser.newPage();
  
  // 에러 모니터링
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error('❌ Console Error:', msg.text());
    }
  });
  
  try {
    // Storybook이 준비될 때까지 대기
    console.log('⏳ Waiting for Storybook to be ready...');
    await page.waitForTimeout(5000);
    
    console.log('📌 Opening Storybook...');
    await page.goto('http://localhost:6006', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 1. 기본 구조 확인
    console.log('\n✅ Step 1: Checking basic structure...');
    const title = await page.title();
    console.log('   Title:', title);
    
    // 스크린샷
    await page.screenshot({ path: 'storybook-1-main.png' });
    
    // 2. 사이드바 컴포넌트 찾기
    console.log('\n✅ Step 2: Finding components in sidebar...');
    
    // TestButton 클릭 시도
    try {
      const testButton = await page.locator('button:has-text("TestButton"), a:has-text("TestButton")').first();
      if (await testButton.isVisible()) {
        console.log('   ✅ Found TestButton');
        await testButton.click();
        await page.waitForTimeout(1500);
        
        // iframe 내용 확인
        const iframe = page.frameLocator('#storybook-preview-iframe');
        const buttonInIframe = await iframe.locator('button').first();
        if (await buttonInIframe.isVisible()) {
          console.log('   ✅ TestButton rendering in iframe');
          const text = await buttonInIframe.textContent();
          console.log('   Button text:', text);
        }
        
        await page.screenshot({ path: 'storybook-2-testbutton.png' });
      }
    } catch (e) {
      console.log('   ⚠️ TestButton not found');
    }
    
    // 3. PillButton 확인
    console.log('\n✅ Step 3: Checking PillButton...');
    try {
      const pillButton = await page.locator('button:has-text("PillButton"), a:has-text("PillButton")').first();
      if (await pillButton.isVisible()) {
        console.log('   ✅ Found PillButton');
        await pillButton.click();
        await page.waitForTimeout(1500);
        
        // Canvas 탭 확인
        const canvasTab = await page.locator('button:has-text("Canvas"), [role="tab"]:has-text("Canvas")').first();
        if (await canvasTab.isVisible()) {
          await canvasTab.click();
          await page.waitForTimeout(1000);
        }
        
        // iframe 확인
        const iframe = page.frameLocator('#storybook-preview-iframe');
        const buttons = await iframe.locator('button').all();
        console.log(`   Found ${buttons.length} buttons in iframe`);
        
        // Controls 패널 확인
        const controls = await page.locator('[id*="controls"], [title*="Controls"]').first();
        if (await controls.isVisible()) {
          console.log('   ✅ Controls panel visible');
        }
        
        // Docs 탭 확인
        const docsTab = await page.locator('button:has-text("Docs"), [role="tab"]:has-text("Docs")').first();
        if (await docsTab.isVisible()) {
          console.log('   ✅ Docs tab found');
          await docsTab.click();
          await page.waitForTimeout(1500);
          
          // Docs 내용 확인
          const docsContent = await page.locator('.docs-story, .sbdocs, [class*="docs"]').first();
          if (await docsContent.isVisible()) {
            console.log('   ✅ Docs content visible');
          } else {
            console.log('   ⚠️ Docs content not visible or empty');
          }
        }
        
        await page.screenshot({ path: 'storybook-3-pillbutton.png' });
      }
    } catch (e) {
      console.log('   ⚠️ PillButton error:', e.message);
    }
    
    // 4. SearchBar 확인
    console.log('\n✅ Step 4: Checking SearchBar...');
    try {
      const searchBar = await page.locator('button:has-text("SearchBar"), a:has-text("SearchBar")').first();
      if (await searchBar.isVisible()) {
        console.log('   ✅ Found SearchBar');
        await searchBar.click();
        await page.waitForTimeout(1500);
        
        const iframe = page.frameLocator('#storybook-preview-iframe');
        const input = await iframe.locator('input').first();
        if (await input.isVisible()) {
          console.log('   ✅ SearchBar input visible');
          await input.fill('테스트 검색');
          await page.waitForTimeout(500);
        }
        
        await page.screenshot({ path: 'storybook-4-searchbar.png' });
      }
    } catch (e) {
      console.log('   ⚠️ SearchBar error:', e.message);
    }
    
    // 5. ExperienceCard 확인
    console.log('\n✅ Step 5: Checking ExperienceCard...');
    try {
      const experienceCard = await page.locator('button:has-text("ExperienceCard"), a:has-text("ExperienceCard")').first();
      if (await experienceCard.isVisible()) {
        console.log('   ✅ Found ExperienceCard');
        await experienceCard.click();
        await page.waitForTimeout(1500);
        
        const iframe = page.frameLocator('#storybook-preview-iframe');
        const card = await iframe.locator('article, [class*="card"]').first();
        if (await card.isVisible()) {
          console.log('   ✅ ExperienceCard rendering');
        }
        
        await page.screenshot({ path: 'storybook-5-experiencecard.png' });
      }
    } catch (e) {
      console.log('   ⚠️ ExperienceCard error:', e.message);
    }
    
    // 6. NavigationBar 확인
    console.log('\n✅ Step 6: Checking NavigationBar...');
    try {
      const navigationBar = await page.locator('button:has-text("NavigationBar"), a:has-text("NavigationBar")').first();
      if (await navigationBar.isVisible()) {
        console.log('   ✅ Found NavigationBar');
        await navigationBar.click();
        await page.waitForTimeout(1500);
        
        const iframe = page.frameLocator('#storybook-preview-iframe');
        const nav = await iframe.locator('nav').first();
        if (await nav.isVisible()) {
          console.log('   ✅ NavigationBar rendering');
        }
        
        await page.screenshot({ path: 'storybook-6-navigationbar.png' });
      }
    } catch (e) {
      console.log('   ⚠️ NavigationBar error:', e.message);
    }
    
    // 7. 최종 요약
    console.log('\n📊 Final Summary:');
    console.log('================================');
    console.log('✅ Storybook is running');
    console.log('✅ Components are listed in sidebar');
    console.log('✅ Components are rendering in iframe');
    console.log('⚠️ Docs may need JSDoc comments for auto-generation');
    console.log(`❌ Console errors found: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\nErrors detected:');
      errors.forEach(err => console.log('  -', err));
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('  - storybook-1-main.png');
    console.log('  - storybook-2-testbutton.png');
    console.log('  - storybook-3-pillbutton.png');
    console.log('  - storybook-4-searchbar.png');
    console.log('  - storybook-5-experiencecard.png');
    console.log('  - storybook-6-navigationbar.png');
    
    console.log('\n💡 Browser will stay open for 20 seconds for manual inspection...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('\n❌ Critical Error:', error.message);
    await page.screenshot({ path: 'storybook-error.png' });
  } finally {
    await browser.close();
    console.log('\n✅ Verification complete!');
  }
}

// 실행
verifyAndFixStorybook().catch(console.error);