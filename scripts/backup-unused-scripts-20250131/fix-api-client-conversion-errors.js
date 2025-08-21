#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - api-client.ts 전환 오류 수정
 * 
 * 목적: api-client.ts 전환 후 발생한 구문 오류 수정
 */

const fs = require('fs');
const path = require('path');

// 수정이 필요한 파일 목록 (TypeScript 에러 발생 파일)
const filesToFix = [
  'src/app/(pages)/community/board/page.tsx',
  'src/app/(pages)/courses/[id]/components/PurchaseCard.tsx',
  'src/app/(pages)/payment/fail/page.tsx',
  'src/app/(pages)/settings/api-keys/page.tsx',
  'src/app/(pages)/tools/youtube-lens/page.tsx',
  'src/app/onboarding/page.tsx',
  'src/components/features/tools/youtube-lens/ChannelFolders.tsx',
  'src/components/features/tools/youtube-lens/CollectionBoard.tsx',
  'src/lib/api/revenue-proof.ts'
];

let fixedFiles = 0;
let errorFiles = [];

console.log('🔧 api-client.ts 전환 오류 수정 시작\n');

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
    
    // FormData를 사용하는 잘못된 변환 수정
    // apiPost('/api/upload', JSON.parse(formData)) -> 원래대로 fetch 사용
    if (content.includes('JSON.parse(formData)')) {
      content = content.replace(
        /apiPost\('\/api\/upload', JSON\.parse\(formData\)\)/g,
        `fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  })`
      );
      modified = true;
      console.log(`✅ ${filePath}: FormData 관련 수정`);
    }
    
    // apiGet with DELETE method 수정
    if (content.includes("apiGet(`/api/upload?${params.toString()}`, {")) {
      content = content.replace(
        /apiGet\(`\/api\/upload\?\$\{params\.toString\(\)\}`, \{\s*method: 'DELETE',\s*credentials: 'same-origin',\s*\}\)/g,
        `apiDelete(\`/api/upload?\${params.toString()}\`)`
      );
      modified = true;
      console.log(`✅ ${filePath}: DELETE 메서드 수정`);
    }
    
    // 잘못된 try-catch 블록 수정
    // try { ... } catch 대신 제대로 된 에러 처리
    const tryPattern = /try\s*\{([^}]*await\s+apiGet[^}]*)\}\s*catch(?!\s*\()/g;
    if (tryPattern.test(content)) {
      content = content.replace(tryPattern, (match, tryBlock) => {
        return `try {${tryBlock}} catch (error)`;
      });
      modified = true;
      console.log(`✅ ${filePath}: try-catch 블록 수정`);
    }
    
    // 중복된 credentials 제거
    content = content.replace(
      /apiGet\(([^,]+),\s*\{\s*credentials:\s*['"]same-origin['"]\s*\}\)/g,
      'apiGet($1)'
    );
    content = content.replace(
      /apiPost\(([^,]+),\s*([^,]+),\s*\{\s*credentials:\s*['"]same-origin['"]\s*\}\)/g,
      'apiPost($1, $2)'
    );
    
    // 잘못된 response 체크 수정
    // apiGet, apiPost 등은 직접 데이터를 반환하므로 response.ok 체크 필요 없음
    const apiCallPattern = /(const\s+\w+\s*=\s*await\s+api(?:Get|Post|Put|Delete)\([^)]+\));?\s*if\s*\(!\w+\.ok\)/g;
    if (apiCallPattern.test(content)) {
      content = content.replace(apiCallPattern, (match, apiCall) => {
        const varName = apiCall.match(/const\s+(\w+)/)?.[1];
        if (varName === 'response') {
          // response 변수명을 data로 변경
          return apiCall.replace('response', 'data') + ';\n    // api-client handles errors internally';
        }
        return apiCall + ';\n    // api-client handles errors internally';
      });
      modified = true;
      console.log(`✅ ${filePath}: API 응답 체크 수정`);
    }
    
    // 파일 저장
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedFiles++;
      console.log(`💾 ${filePath}: 저장 완료`);
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
console.log('📊 오류 수정 결과:');
console.log(`  - 처리 대상: ${filesToFix.length}개`);
console.log(`  - 수정됨: ${fixedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

console.log('\n✅ api-client.ts 전환 오류 수정 완료!');
console.log('\n⚠️  다시 TypeScript 타입 체크를 실행하세요:');
console.log('   npx tsc --noEmit');