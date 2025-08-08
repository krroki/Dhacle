const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function captureAfterAndCompare() {
  console.log('📸 Capturing improved UI state (after)...');
  
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
      path: path.join(__dirname, 'evidence', 'evidence-3.0-after.png'),
      fullPage: true 
    });
    
    console.log('✅ After screenshot captured successfully!');
    
    // Create side-by-side comparison if sharp is available
    try {
      const beforePath = path.join(__dirname, 'evidence', 'evidence-3.0-before.png');
      const afterPath = path.join(__dirname, 'evidence', 'evidence-3.0-after.png');
      
      if (fs.existsSync(beforePath) && fs.existsSync(afterPath)) {
        console.log('🎨 Creating side-by-side comparison...');
        
        const before = await sharp(beforePath).resize(960, null, { fit: 'inside' }).toBuffer();
        const after = await sharp(afterPath).resize(960, null, { fit: 'inside' }).toBuffer();
        
        const beforeMeta = await sharp(before).metadata();
        const afterMeta = await sharp(after).metadata();
        
        const maxHeight = Math.max(beforeMeta.height, afterMeta.height);
        
        // Create labels
        const beforeLabel = await sharp({
          create: {
            width: 960,
            height: 60,
            channels: 4,
            background: { r: 239, g: 68, b: 68, alpha: 1 }
          }
        })
        .composite([{
          input: Buffer.from(`<svg width="960" height="60">
            <text x="480" y="40" font-family="Arial" font-size="32" font-weight="bold" fill="white" text-anchor="middle">BEFORE (개선 전)</text>
          </svg>`),
          top: 0,
          left: 0
        }])
        .png()
        .toBuffer();
        
        const afterLabel = await sharp({
          create: {
            width: 960,
            height: 60,
            channels: 4,
            background: { r: 34, g: 197, b: 94, alpha: 1 }
          }
        })
        .composite([{
          input: Buffer.from(`<svg width="960" height="60">
            <text x="480" y="40" font-family="Arial" font-size="32" font-weight="bold" fill="white" text-anchor="middle">AFTER (개선 후)</text>
          </svg>`),
          top: 0,
          left: 0
        }])
        .png()
        .toBuffer();
        
        // Combine images with labels
        const beforeWithLabel = await sharp({
          create: {
            width: 960,
            height: maxHeight + 60,
            channels: 4,
            background: { r: 17, g: 24, b: 39, alpha: 1 }
          }
        })
        .composite([
          { input: beforeLabel, top: 0, left: 0 },
          { input: before, top: 60, left: 0 }
        ])
        .png()
        .toBuffer();
        
        const afterWithLabel = await sharp({
          create: {
            width: 960,
            height: maxHeight + 60,
            channels: 4,
            background: { r: 17, g: 24, b: 39, alpha: 1 }
          }
        })
        .composite([
          { input: afterLabel, top: 0, left: 0 },
          { input: after, top: 60, left: 0 }
        ])
        .png()
        .toBuffer();
        
        // Create final comparison
        await sharp({
          create: {
            width: 1920,
            height: maxHeight + 60,
            channels: 4,
            background: { r: 17, g: 24, b: 39, alpha: 1 }
          }
        })
        .composite([
          { input: beforeWithLabel, left: 0, top: 0 },
          { input: afterWithLabel, left: 960, top: 0 }
        ])
        .png()
        .toFile(path.join(__dirname, 'evidence', 'evidence-3.0-before-after.png'));
        
        console.log('✅ Comparison image created successfully!');
      }
    } catch (sharpError) {
      console.log('⚠️ Sharp not available, skipping image processing.');
      // If sharp is not available, just note that we have before and after screenshots
      console.log('Before: evidence-3.0-before.png');
      console.log('After: evidence-3.0-after.png');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

captureAfterAndCompare();