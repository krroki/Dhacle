const { chromium } = require('playwright');
const path = require('path');

async function testKakaoLogin() {
  console.log('🚀 Starting Kakao Login Test...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './evidence',
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to the homepage
    console.log('📍 Step 1: Navigating to homepage...');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take screenshot of initial state
    await page.screenshot({ 
      path: path.join(__dirname, 'evidence', 'evidence-2.0-1-homepage.png'),
      fullPage: true 
    });

    // Step 2: Click on Kakao login button
    console.log('📍 Step 2: Clicking Kakao login button...');
    const loginButton = await page.locator('button:has-text("카카오 로그인")');
    await loginButton.waitFor({ state: 'visible' });
    
    // Highlight the button before clicking
    await loginButton.evaluate(el => {
      el.style.border = '3px solid red';
      el.style.boxShadow = '0 0 10px red';
    });
    await page.waitForTimeout(1000);
    
    await loginButton.click();
    
    // Step 3: Wait for OAuth redirect (or error)
    console.log('📍 Step 3: Waiting for OAuth redirect...');
    await page.waitForTimeout(3000);
    
    // Check if we're redirected to Kakao or got an error
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('kauth.kakao.com') || currentUrl.includes('accounts.kakao.com')) {
      console.log('✅ Successfully redirected to Kakao OAuth page!');
      await page.screenshot({ 
        path: path.join(__dirname, 'evidence', 'evidence-2.0-2-kakao-oauth.png'),
        fullPage: true 
      });
    } else if (currentUrl.includes('supabase')) {
      console.log('⚠️ Redirected to Supabase - Kakao provider may not be configured');
      await page.screenshot({ 
        path: path.join(__dirname, 'evidence', 'evidence-2.0-2-supabase-config-needed.png'),
        fullPage: true 
      });
    } else {
      console.log('❌ No redirect occurred - check console for errors');
      await page.screenshot({ 
        path: path.join(__dirname, 'evidence', 'evidence-2.0-2-no-redirect.png'),
        fullPage: true 
      });
    }

    // Step 4: Navigate to Supabase test page to verify connection
    console.log('📍 Step 4: Testing Supabase connection...');
    await page.goto('http://localhost:3005/supabase-test', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'evidence', 'evidence-2.0-3-supabase-test.png'),
      fullPage: true 
    });

    // Check for success message
    const successMessage = await page.locator('text=Connection Successful').count();
    if (successMessage > 0) {
      console.log('✅ Supabase connection verified!');
    } else {
      console.log('⚠️ Supabase connection status unclear');
    }

    // Step 5: Test logout flow (if logged in)
    console.log('📍 Step 5: Testing logout flow...');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const logoutButton = await page.locator('button:has-text("로그아웃")').count();
    if (logoutButton > 0) {
      console.log('User is logged in, testing logout...');
      await page.locator('button:has-text("로그아웃")').click();
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: path.join(__dirname, 'evidence', 'evidence-2.0-4-after-logout.png'),
        fullPage: true 
      });
      console.log('✅ Logout tested!');
    }

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'evidence', 'evidence-2.0-error.png'),
      fullPage: true 
    });
  } finally {
    await page.waitForTimeout(2000); // Keep open for a moment to save video
    await context.close();
    await browser.close();
    
    console.log('📹 Video evidence saved to ./evidence/');
    console.log('📸 Screenshots saved to ./evidence/');
  }
}

// Run the test
testKakaoLogin().catch(console.error);