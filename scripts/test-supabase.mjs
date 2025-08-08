import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSupabaseConnection() {
  console.log('🚀 Testing Supabase connection...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the test page
    console.log('📄 Navigating to /supabase-test page...');
    await page.goto('http://localhost:3002/supabase-test', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for the page to fully load
    await page.waitForTimeout(3000);
    
    // Check for success message
    const successElement = await page.locator('text=Connection Successful').first();
    const hasSuccess = await successElement.isVisible().catch(() => false);
    
    if (hasSuccess) {
      console.log('✅ Connection Successful! Database message found.');
    } else {
      // Check for error message
      const errorElement = await page.locator('text=Connection Failed').first();
      const hasError = await errorElement.isVisible().catch(() => false);
      
      if (hasError) {
        console.log('❌ Connection Failed. Check your Supabase configuration.');
        // Get error details
        const errorMessage = await page.locator('text=Error Message:').first().textContent().catch(() => '');
        console.log('Error details:', errorMessage);
      } else {
        console.log('⚠️ Unknown state - check the page manually');
      }
    }
    
    // Take screenshot for evidence
    const screenshotPath = path.join(__dirname, '..', 'evidence-1.9-connection-success.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true
    });
    console.log(`📸 Screenshot saved as evidence-1.9-connection-success.png`);
    
    // Keep browser open for 5 seconds to see the result
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await context.close();
    await browser.close();
    console.log('🎉 Test completed!');
  }
}

// Run the test
testSupabaseConnection().catch(console.error);