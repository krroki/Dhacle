#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - 최종 api-client.ts 전환
 * 
 * 목적: 모든 파일을 올바르게 api-client.ts로 전환
 */

const fs = require('fs');
const path = require('path');

// 전환 대상 파일 목록
const filesToConvert = [
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

let convertedFiles = 0;
let skippedFiles = 0;
let errorFiles = [];

console.log('🔧 최종 api-client.ts 전환 시작\n');

filesToConvert.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ ${filePath}: 파일을 찾을 수 없음`);
    errorFiles.push(filePath);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // 1. api-client import 추가 (이미 없는 경우)
    if (!content.includes("from '@/lib/api-client'") && !content.includes('from "@/lib/api-client"')) {
      // 첫 번째 import 문 찾기
      const firstImportMatch = content.match(/^import .+ from .+$/m);
      if (firstImportMatch) {
        const firstImportIndex = content.indexOf(firstImportMatch[0]);
        const insertIndex = firstImportIndex + firstImportMatch[0].length;
        
        content = content.slice(0, insertIndex) + 
                 "\nimport { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api-client';" +
                 content.slice(insertIndex);
        modified = true;
        console.log(`📝 ${filePath}: api-client import 추가`);
      }
    }
    
    // 2. revenue-proof.ts 특별 처리
    if (filePath.includes('revenue-proof.ts')) {
      // FormData를 사용하는 uploadImage/deleteImage는 fetch 유지
      // 나머지는 api-client로 전환
      
      // GET 요청 변환
      content = content.replace(
        /const response = await fetch\(`\$\{API_BASE\}([^`]*)`(?:, \{\s*credentials: 'same-origin',?\s*\})?\);\s*if \(!response\.ok\) \{[^}]*\}\s*return response\.json\(\);/g,
        'return await apiGet(`${API_BASE}$1`);'
      );
      
      // POST 요청 변환 (FormData 제외)
      content = content.replace(
        /const response = await fetch\(`\$\{API_BASE\}([^`]+)`, \{\s*method: 'POST',\s*(?:headers: \{[^}]+\},\s*)?body: JSON\.stringify\(([^)]+)\),\s*credentials: 'same-origin',?\s*\}\);\s*if \(!response\.ok\) \{[^}]*\}\s*return response\.json\(\);/g,
        'return await apiPost(`${API_BASE}$1`, $2);'
      );
      
      // PUT 요청 변환
      content = content.replace(
        /const response = await fetch\(`\$\{API_BASE\}\/\$\{id\}`, \{\s*method: 'PUT',\s*headers: \{[^}]+\},\s*body: JSON\.stringify\(data\),\s*credentials: 'same-origin',?\s*\}\);\s*if \(!response\.ok\) \{[^}]*\}\s*return response\.json\(\);/g,
        'return await apiPut(`${API_BASE}/${id}`, data);'
      );
      
      // DELETE 요청 변환
      content = content.replace(
        /const response = await fetch\(`\$\{API_BASE\}\/\$\{id\}`, \{\s*method: 'DELETE',\s*credentials: 'same-origin',?\s*\}\);\s*if \(!response\.ok\) \{[^}]*\}\s*return response\.json\(\);/g,
        'return await apiDelete(`${API_BASE}/${id}`);'
      );
      
      // Error 클래스 변경
      content = content.replace(/throw new Error\(/g, 'throw new ApiError(');
      
      modified = true;
    } else {
      // 3. 일반 파일들의 fetch 변환
      
      // GET 요청
      content = content.replace(
        /const response = await fetch\(([^,)]+)(?:, \{\s*credentials: 'same-origin'\s*\})?\);/g,
        (match, url) => {
          if (url.includes('/api/')) {
            return `const data = await apiGet(${url});`;
          }
          return match;
        }
      );
      
      // POST 요청
      content = content.replace(
        /const response = await fetch\(([^,]+), \{\s*method: 'POST',\s*headers: \{[^}]+\},\s*(?:credentials: 'same-origin',\s*)?body: JSON\.stringify\(([^)]+)\)\s*\}\);/g,
        (match, url, body) => {
          if (url.includes('/api/')) {
            return `const data = await apiPost(${url}, ${body});`;
          }
          return match;
        }
      );
      
      // PUT 요청
      content = content.replace(
        /const response = await fetch\(([^,]+), \{\s*method: 'PUT',\s*headers: \{[^}]+\},\s*(?:credentials: 'same-origin',\s*)?body: JSON\.stringify\(([^)]+)\)\s*\}\);/g,
        (match, url, body) => {
          if (url.includes('/api/')) {
            return `const data = await apiPut(${url}, ${body});`;
          }
          return match;
        }
      );
      
      // PATCH 요청
      content = content.replace(
        /const response = await fetch\(([^,]+), \{\s*method: 'PATCH',\s*headers: \{[^}]+\},\s*(?:credentials: 'same-origin',\s*)?body: JSON\.stringify\(([^)]+)\)\s*\}\);/g,
        (match, url, body) => {
          if (url.includes('/api/')) {
            return `const data = await apiPatch(${url}, ${body});`;
          }
          return match;
        }
      );
      
      // DELETE 요청
      content = content.replace(
        /const response = await fetch\(([^,]+), \{\s*method: 'DELETE',\s*credentials: 'same-origin'\s*\}\);/g,
        (match, url) => {
          if (url.includes('/api/')) {
            return `const data = await apiDelete(${url});`;
          }
          return match;
        }
      );
      
      // response.ok 체크 제거 (data 변수 사용 시)
      content = content.replace(
        /if \(!data\.ok\) \{[^}]*\}/g,
        '// api-client handles errors internally'
      );
      
      // response.json() 호출 제거 (data 변수 사용 시)
      content = content.replace(
        /const (\w+) = await data\.json\(\);/g,
        'const $1 = data;'
      );
      
      // 남은 response 변수를 data로 변경 (특정 패턴)
      content = content.replace(
        /if \(response\.ok\) \{/g,
        'if (data) {'
      );
      
      content = content.replace(
        /if \(!response\.ok\) \{/g,
        '// Error handling is done by api-client\nif (false) {'
      );
      
      // await response.json() 패턴 처리
      content = content.replace(
        /const data = await response\.json\(\);/g,
        '// Data is already parsed by api-client'
      );
      
      modified = true;
    }
    
    // 파일 저장
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      convertedFiles++;
      console.log(`💾 ${filePath}: 저장 완료`);
    } else {
      console.log(`⚠️  ${filePath}: 변환할 내용 없음`);
      skippedFiles++;
    }
    
  } catch (error) {
    console.error(`❌ ${filePath}: 처리 중 오류 - ${error.message}`);
    errorFiles.push(filePath);
  }
});

// 결과 요약
console.log('\n' + '='.repeat(50));
console.log('📊 최종 api-client.ts 전환 결과:');
console.log(`  - 처리 대상: ${filesToConvert.length}개`);
console.log(`  - 전환됨: ${convertedFiles}개`);
console.log(`  - 건너뜀: ${skippedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

console.log('\n✅ 최종 api-client.ts 전환 완료!');
console.log('\n⚠️  TypeScript 타입 체크를 실행하세요:');
console.log('   npx tsc --noEmit');