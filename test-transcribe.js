const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testTranscribeFlow() {
  console.log('🚀 Starting AI Transcribe Test...');
  
  // Create a sample audio file for testing (silent audio)
  const sampleAudioPath = path.join(__dirname, 'sample-audio.mp3');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
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
    // Step 1: Navigate to homepage and login
    console.log('📍 Step 1: Navigating to homepage...');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check if user is already logged in
    const isLoggedIn = await page.locator('button:has-text("로그아웃")').count() > 0;
    
    if (!isLoggedIn) {
      console.log('User not logged in, please login manually in the browser...');
      await page.waitForTimeout(10000); // Give user time to login
    }

    // Step 2: Navigate to tools page
    console.log('📍 Step 2: Navigating to tools page...');
    await page.goto('http://localhost:3005/tools', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'evidence', 'evidence-2.1-1-tools-page.png'),
      fullPage: true 
    });

    // Step 3: Click on AI Subtitle Generator
    console.log('📍 Step 3: Clicking AI Subtitle Generator...');
    await page.locator('text=AI 자막 생성기').first().click();
    await page.waitForURL('**/tools/transcribe');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'evidence', 'evidence-2.1-2-transcribe-page.png'),
      fullPage: true 
    });

    // Step 4: Upload a file (simulate with file chooser)
    console.log('📍 Step 4: Uploading audio file...');
    
    // Create a dummy audio file if it doesn't exist
    if (!fs.existsSync(sampleAudioPath)) {
      // Create a simple text file as a placeholder (in real scenario, use actual audio)
      fs.writeFileSync(sampleAudioPath, 'This is a test audio file placeholder');
    }
    
    // Trigger file input
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(sampleAudioPath);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'evidence', 'evidence-2.1-3-file-selected.png'),
      fullPage: true 
    });

    // Step 5: Click upload button
    console.log('📍 Step 5: Starting transcription...');
    const uploadButton = await page.locator('button:has-text("자막 생성 시작")');
    
    if (await uploadButton.count() > 0) {
      // Highlight the button
      await uploadButton.evaluate(el => {
        el.style.border = '3px solid red';
        el.style.boxShadow = '0 0 10px red';
      });
      await page.waitForTimeout(1000);
      
      await uploadButton.click();
      
      // Step 6: Wait for processing
      console.log('📍 Step 6: Waiting for AI processing...');
      await page.waitForTimeout(3000);
      
      // Check for upload progress
      const progressBar = await page.locator('.bg-accent').first();
      if (await progressBar.count() > 0) {
        console.log('Upload progress detected');
        await page.screenshot({ 
          path: path.join(__dirname, 'evidence', 'evidence-2.1-4-upload-progress.png'),
          fullPage: true 
        });
      }
      
      // Check for processing status
      const processingStatus = await page.locator('text=자막 생성 중').count();
      if (processingStatus > 0) {
        console.log('AI processing in progress...');
        await page.screenshot({ 
          path: path.join(__dirname, 'evidence', 'evidence-2.1-5-processing.png'),
          fullPage: true 
        });
      }
      
      // Wait for completion or error
      await page.waitForTimeout(5000);
      
      // Check for completion
      const completionStatus = await page.locator('text=자막 생성 완료').count();
      const downloadButton = await page.locator('button:has-text("자막 다운로드")').count();
      
      if (completionStatus > 0 || downloadButton > 0) {
        console.log('✅ Transcription completed successfully!');
        await page.screenshot({ 
          path: path.join(__dirname, 'evidence', 'evidence-2.1-6-completed.png'),
          fullPage: true 
        });
      } else {
        console.log('⚠️ Transcription may have failed or is still processing');
        await page.screenshot({ 
          path: path.join(__dirname, 'evidence', 'evidence-2.1-6-status.png'),
          fullPage: true 
        });
      }
    } else {
      console.log('Upload button not found - user may not be logged in');
    }

    console.log('✅ Test flow completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'evidence', 'evidence-2.1-error.png'),
      fullPage: true 
    });
  } finally {
    await page.waitForTimeout(3000); // Keep open to save video
    await context.close();
    await browser.close();
    
    console.log('📹 Video evidence saved to ./evidence/');
    console.log('📸 Screenshots saved to ./evidence/');
    
    // Clean up sample file
    if (fs.existsSync(sampleAudioPath)) {
      fs.unlinkSync(sampleAudioPath);
    }
  }
}

// Run the test
testTranscribeFlow().catch(console.error);