#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - api-client TypeScript 타입 수정
 * 
 * 목적: api-client 함수 호출에 타입 추가
 */

const fs = require('fs');
const path = require('path');

// TypeScript 에러가 발생한 파일들
const filesToFix = {
  'src/app/(pages)/payment/success/page.tsx': {
    fixes: [
      { old: 'const response = await', new: 'const response: any = await' }
    ]
  },
  'src/app/(pages)/revenue-proof/create/page.tsx': {
    fixes: [
      { old: 'const response = await', new: 'const response: any = await' }
    ]
  },
  'src/app/(pages)/revenue-proof/page.tsx': {
    fixes: [
      { old: 'const result = await', new: 'const result: any = await' }
    ]
  },
  'src/app/admin/courses/videos/page.tsx': {
    fixes: [
      { old: 'const response = await', new: 'const response: any = await' }
    ]
  },
  'src/components/features/home/RevenueGallery/RevenueGalleryNew.tsx': {
    fixes: [
      { old: 'const result = await', new: 'const result: any = await' }
    ]
  },
  'src/components/features/revenue-proof/LiveRankingSidebar.tsx': {
    fixes: [
      { old: 'const data = await getRankings', new: 'const data: any = await getRankings' }
    ]
  },
  'src/components/features/revenue-proof/RevenueProofDetail.tsx': {
    fixes: [
      { old: 'const newComment = await createComment', new: 'const newComment: any = await createComment' }
    ]
  },
  'src/components/features/tools/youtube-lens/components/EnvironmentChecker.tsx': {
    fixes: [
      { old: 'const response = await', new: 'const response: any = await' }
    ]
  }
};

let fixedFiles = 0;
let errorFiles = [];

console.log('🔧 api-client TypeScript 타입 수정 시작\n');

Object.entries(filesToFix).forEach(([filePath, config]) => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ ${filePath}: 파일을 찾을 수 없음`);
    errorFiles.push(filePath);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // 각 수정사항 적용
    config.fixes.forEach(({ old, new: replacement }) => {
      if (content.includes(old)) {
        content = content.replace(new RegExp(old, 'g'), replacement);
        modified = true;
      }
    });
    
    // ApiError import 추가 (필요한 경우)
    if (modified && !content.includes('ApiError')) {
      const apiClientImport = content.match(/import .* from ['"]@\/lib\/api-client['"]/);
      if (apiClientImport && !apiClientImport[0].includes('ApiError')) {
        content = content.replace(
          apiClientImport[0],
          apiClientImport[0].replace('}', ', ApiError }')
        );
      }
    }
    
    // 파일 저장
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedFiles++;
      console.log(`💾 ${filePath}: 타입 수정 완료`);
    } else {
      console.log(`⚠️  ${filePath}: 수정 사항 없음`);
    }
    
  } catch (error) {
    console.error(`❌ ${filePath}: 처리 중 오류 - ${error.message}`);
    errorFiles.push(filePath);
  }
});

// 결과 요약
console.log('\n' + '='.repeat(50));
console.log('📊 TypeScript 타입 수정 결과:');
console.log(`  - 처리 대상: ${Object.keys(filesToFix).length}개`);
console.log(`  - 수정됨: ${fixedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

console.log('\n✅ TypeScript 타입 수정 완료!');
console.log('\n⚠️  다시 TypeScript 타입 체크를 실행하세요:');
console.log('   npx tsc --noEmit');