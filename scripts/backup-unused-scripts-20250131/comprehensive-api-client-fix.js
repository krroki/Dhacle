#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - 종합적인 api-client.ts 전환 수정
 * 
 * 목적: api-client.ts를 올바르게 사용하도록 전체적으로 수정
 */

const fs = require('fs');
const path = require('path');

// 수정이 필요한 파일 목록
const filesToFix = [
  'src/lib/api/revenue-proof.ts',
  'src/app/admin/courses/videos/page.tsx',
  'src/app/(pages)/tools/youtube-lens/page.tsx',
  'src/app/(pages)/community/board/page.tsx',
  'src/app/(pages)/courses/[id]/components/PurchaseCard.tsx',
  'src/app/onboarding/page.tsx',
  'src/app/(pages)/revenue-proof/create/page.tsx',
  'src/app/(pages)/payment/success/page.tsx',
  'src/app/(pages)/payment/fail/page.tsx',
  'src/app/(pages)/settings/api-keys/page.tsx',
  'src/app/learn/[courseId]/[lessonId]/components/VideoPlayer.tsx',
  'src/components/features/tools/youtube-lens/ChannelFolders.tsx',
  'src/components/features/tools/youtube-lens/CollectionBoard.tsx',
  'src/components/features/tools/youtube-lens/components/EnvironmentChecker.tsx'
];

let fixedFiles = 0;
let errorFiles = [];

console.log('🔧 종합적인 api-client.ts 전환 수정 시작\n');

// 각 파일 원본으로 되돌리고 올바르게 다시 변환
filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ ${filePath}: 파일을 찾을 수 없음`);
    errorFiles.push(filePath);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // 1. 잘못된 괄호 수정
    content = content.replace(/\}\)\s*\}\);/g, '});');
    content = content.replace(/\)\s*\}\);/g, ');');
    
    // 2. FormData 처리 수정 (uploadImage 함수)
    if (filePath.includes('revenue-proof.ts')) {
      // uploadImage 함수는 fetch 사용 유지
      content = content.replace(
        /const response = await apiPost\('\/api\/upload', JSON\.parse\(formData\)\);/g,
        `const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  });`
      );
      
      // deleteImage 함수 수정
      content = content.replace(
        /const response = await apiGet\(`\/api\/upload\?\$\{params\.toString\(\)\}`, \{[^}]*\}\);/g,
        `const response = await fetch(\`/api/upload?\${params.toString()}\`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });`
      );
      
      // 나머지 함수들은 api-client 사용
      // GET 요청
      content = content.replace(
        /const response = await fetch\(`([^`]+)`(?:, \{\s*credentials: 'same-origin',?\s*\})?\);/g,
        (match, url) => {
          if (url.includes('/api/revenue-proof') || url === '${API_BASE}' || url.includes('${API_BASE}')) {
            return `const response = await apiGet(\`${url}\`);`;
          }
          return match;
        }
      );
      
      // POST 요청 (FormData가 아닌 경우)
      content = content.replace(
        /const response = await fetch\(([^,]+), \{\s*method: 'POST',\s*(?:headers:[^}]+,\s*)?body: JSON\.stringify\(([^)]+)\)[^}]*\}\);/g,
        (match, url, data) => {
          if (!match.includes('formData')) {
            return `const response = await apiPost(${url}, ${data});`;
          }
          return match;
        }
      );
      
      // PUT 요청
      content = content.replace(
        /const response = await fetch\(([^,]+), \{\s*method: 'PUT',[^}]+body: JSON\.stringify\(([^)]+)\)[^}]*\}\);/g,
        `const response = await apiPut($1, $2);`
      );
      
      // DELETE 요청
      content = content.replace(
        /const response = await fetch\(([^,]+), \{\s*method: 'DELETE'[^}]*\}\);/g,
        `const response = await apiDelete($1);`
      );
      
      modified = true;
    } else {
      // 다른 파일들의 api-client 사용 수정
      
      // response 변수명을 data로 변경 (api-client는 직접 데이터 반환)
      const apiCallPattern = /(const\s+)response(\s*=\s*await\s+api(?:Get|Post|Put|Delete)\([^)]+\));/g;
      content = content.replace(apiCallPattern, '$1data$2');
      
      // response.ok 체크 제거 (api-client가 에러 처리)
      content = content.replace(
        /if\s*\(!data\.ok\)\s*\{[^}]*\}/g,
        '// api-client handles errors internally'
      );
      
      // response.json() 호출 제거 (api-client가 이미 파싱)
      content = content.replace(
        /const\s+(\w+)\s*=\s*await\s+data\.json\(\);?/g,
        '// Data is already parsed by api-client'
      );
      
      // data를 직접 사용
      content = content.replace(
        /const\s+result\s*=\s*await\s+data\.json\(\);/g,
        'const result = data;'
      );
      
      modified = true;
    }
    
    // 파일 저장
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedFiles++;
      console.log(`💾 ${filePath}: 수정 완료`);
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
console.log('📊 종합 수정 결과:');
console.log(`  - 처리 대상: ${filesToFix.length}개`);
console.log(`  - 수정됨: ${fixedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

console.log('\n✅ 종합 api-client.ts 수정 완료!');
console.log('\n⚠️  다시 TypeScript 타입 체크를 실행하세요:');
console.log('   npx tsc --noEmit');