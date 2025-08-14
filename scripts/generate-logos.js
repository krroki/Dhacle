const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateLogos() {
  const svgPath = path.join(__dirname, '../public/images/logo/dhacle-logo.svg');
  const svgBuffer = fs.readFileSync(svgPath);
  
  // 생성할 로고 파일들의 설정
  const logoConfigs = [
    // 메인 로고 (헤더용)
    { 
      output: '../public/images/logo/dhacle-logo@2x.png',
      width: 320,
      height: 96,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    },
    { 
      output: '../public/images/logo/dhacle-logo-mobile.png',
      width: 240,
      height: 72,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    },
    
    // 파비콘 세트
    { 
      output: '../public/images/favicon/favicon-16x16.png',
      width: 16,
      height: 16,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    },
    { 
      output: '../public/images/favicon/favicon-32x32.png',
      width: 32,
      height: 32,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    },
    { 
      output: '../public/images/favicon/apple-touch-icon.png',
      width: 180,
      height: 180,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    },
    
    // PWA/모바일 앱용
    { 
      output: '../public/images/favicon/icon-192.png',
      width: 192,
      height: 192,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    },
    { 
      output: '../public/images/favicon/icon-512.png',
      width: 512,
      height: 512,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  ];

  // favicon 폴더 생성 (없으면)
  const faviconDir = path.join(__dirname, '../public/images/favicon');
  if (!fs.existsSync(faviconDir)) {
    fs.mkdirSync(faviconDir, { recursive: true });
    console.log('📁 favicon 폴더 생성됨');
  }

  console.log('🎨 로고 파일 생성 시작...\n');

  for (const config of logoConfigs) {
    const outputPath = path.join(__dirname, config.output);
    const outputName = path.basename(outputPath);
    
    try {
      await sharp(svgBuffer)
        .resize(config.width, config.height, {
          fit: config.fit,
          background: config.background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${outputName} (${config.width}×${config.height}px) 생성 완료`);
    } catch (error) {
      console.error(`❌ ${outputName} 생성 실패:`, error.message);
    }
  }

  // favicon.ico 생성 (멀티사이즈)
  try {
    const icoPath = path.join(__dirname, '../public/images/favicon/favicon.ico');
    await sharp(svgBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(icoPath);
    console.log('✅ favicon.ico (32×32px) 생성 완료');
  } catch (error) {
    console.error('❌ favicon.ico 생성 실패:', error.message);
  }

  console.log('\n🎉 모든 로고 파일 생성 완료!');
  console.log('\n📁 생성된 파일 구조:');
  console.log('public/');
  console.log('└── images/');
  console.log('    ├── logo/');
  console.log('    │   ├── dhacle-logo.svg (원본)');
  console.log('    │   ├── dhacle-logo@2x.png (320×96)');
  console.log('    │   └── dhacle-logo-mobile.png (240×72)');
  console.log('    └── favicon/');
  console.log('        ├── favicon.ico (32×32)');
  console.log('        ├── favicon-16x16.png');
  console.log('        ├── favicon-32x32.png');
  console.log('        ├── apple-touch-icon.png (180×180)');
  console.log('        ├── icon-192.png');
  console.log('        └── icon-512.png');
}

// 스크립트 실행
generateLogos().catch(console.error);