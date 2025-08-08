const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureBefore() {
  console.log('📸 Capturing current UI state (before)...');
  
  // Ensure evidence directory exists
  const evidenceDir = path.join(__dirname, 'evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
    console.log('✅ Created evidence directory');
  }
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Capture full page screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'evidence', 'evidence-3.0-before.png'),
      fullPage: true 
    });
    
    console.log('✅ Before screenshot captured successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

captureBefore();