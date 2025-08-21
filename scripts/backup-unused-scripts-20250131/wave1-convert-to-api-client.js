#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - api-client.ts 전환
 * 
 * 목적: 직접 fetch 호출을 api-client.ts 래퍼로 전환
 */

const fs = require('fs');
const path = require('path');

// 전환 대상 파일 목록 (size.json에서 확인된 14개 파일)
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

console.log('🔧 Wave 1: api-client.ts 전환 시작\n');

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
    
    // api-client import 추가 (이미 없는 경우)
    if (!content.includes("from '@/lib/api-client'") && !content.includes('from "@/lib/api-client"')) {
      // 첫 번째 import 문 찾기
      const firstImportMatch = content.match(/^import .+ from .+$/m);
      if (firstImportMatch) {
        const firstImportIndex = content.indexOf(firstImportMatch[0]);
        const insertIndex = firstImportIndex + firstImportMatch[0].length;
        
        // TypeScript 파일인지 확인
        const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
        
        if (isTypeScript) {
          content = content.slice(0, insertIndex) + 
                   "\nimport { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api-client';" +
                   content.slice(insertIndex);
        } else {
          content = content.slice(0, insertIndex) + 
                   "\nimport { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api-client';" +
                   content.slice(insertIndex);
        }
        modified = true;
        console.log(`📝 ${filePath}: api-client import 추가`);
      }
    }
    
    // fetch 호출 패턴을 찾아서 변환
    const fetchPatterns = [
      // GET 요청 패턴
      {
        pattern: /await fetch\(([^,)]+)\s*(?:,\s*{\s*credentials:\s*['"]same-origin['"]\s*}\s*)?\)/g,
        replacement: (match, url) => {
          // URL이 /api/로 시작하는지 확인
          if (url.includes('/api/')) {
            return `await apiGet(${url})`;
          }
          return match; // 외부 API는 그대로 유지
        }
      },
      // POST 요청 패턴
      {
        pattern: /await fetch\(([^,]+),\s*{\s*method:\s*['"]POST['"]\s*,[\s\S]*?}\s*\)/g,
        replacement: (match, url) => {
          if (url.includes('/api/')) {
            // body 추출
            const bodyMatch = match.match(/body:\s*JSON\.stringify\(([^)]+)\)/);
            if (bodyMatch) {
              return `await apiPost(${url}, ${bodyMatch[1]})`;
            }
            // body가 직접 전달되는 경우
            const directBodyMatch = match.match(/body:\s*([^,}]+)/);
            if (directBodyMatch && !directBodyMatch[1].includes('JSON.stringify')) {
              return `await apiPost(${url}, JSON.parse(${directBodyMatch[1]}))`;
            }
          }
          return match;
        }
      },
      // PUT 요청 패턴
      {
        pattern: /await fetch\(([^,]+),\s*{\s*method:\s*['"]PUT['"]\s*,[\s\S]*?}\s*\)/g,
        replacement: (match, url) => {
          if (url.includes('/api/')) {
            const bodyMatch = match.match(/body:\s*JSON\.stringify\(([^)]+)\)/);
            if (bodyMatch) {
              return `await apiPut(${url}, ${bodyMatch[1]})`;
            }
          }
          return match;
        }
      },
      // DELETE 요청 패턴
      {
        pattern: /await fetch\(([^,]+),\s*{\s*method:\s*['"]DELETE['"]\s*,?[\s\S]*?}\s*\)/g,
        replacement: (match, url) => {
          if (url.includes('/api/')) {
            return `await apiDelete(${url})`;
          }
          return match;
        }
      }
    ];
    
    // 각 패턴 적용
    fetchPatterns.forEach(({ pattern, replacement }) => {
      const oldContent = content;
      content = content.replace(pattern, replacement);
      if (oldContent !== content) {
        modified = true;
        console.log(`✅ ${filePath}: fetch 호출 변환`);
      }
    });
    
    // 단순 fetch 호출 (GET, credentials 포함)
    const simpleFetchPattern = /fetch\(([^)]+),\s*{\s*credentials:\s*['"]same-origin['"]\s*}\s*\)/g;
    if (simpleFetchPattern.test(content)) {
      content = content.replace(simpleFetchPattern, (match, url) => {
        if (url.includes('/api/')) {
          return `apiGet(${url})`;
        }
        return match;
      });
      modified = true;
    }
    
    // 에러 처리 개선
    const errorHandlingPattern = /if\s*\(!response\.ok\)\s*{[\s\S]*?throw new Error\([^)]+\);?[\s\S]*?}/g;
    if (errorHandlingPattern.test(content)) {
      content = content.replace(errorHandlingPattern, (match) => {
        // ApiError로 변경
        return match.replace(/throw new Error\(/, 'throw new ApiError(');
      });
      modified = true;
    }
    
    // 파일 저장
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      convertedFiles++;
      console.log(`💾 ${filePath}: 저장 완료`);
    } else {
      console.log(`⚠️  ${filePath}: 변환할 fetch 호출 없음`);
      skippedFiles++;
    }
    
  } catch (error) {
    console.error(`❌ ${filePath}: 처리 중 오류 - ${error.message}`);
    errorFiles.push(filePath);
  }
});

// 결과 요약
console.log('\n' + '='.repeat(50));
console.log('📊 api-client.ts 전환 결과:');
console.log(`  - 처리 대상: ${filesToConvert.length}개`);
console.log(`  - 전환됨: ${convertedFiles}개`);
console.log(`  - 건너뜀: ${skippedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

console.log('\n✅ Wave 1 api-client.ts 전환 완료!');
console.log('\n⚠️  TypeScript 타입 체크를 실행하세요:');
console.log('   npx tsc --noEmit');