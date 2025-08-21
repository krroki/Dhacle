#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - 세션 검사 추가
 * 
 * 목적: 세션 검사가 없는 API routes에 표준 세션 검사 코드 추가
 * 대상: 14개 API routes
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// API routes 경로
const apiPath = path.join(process.cwd(), 'src', 'app', 'api');

// 세션 검사가 없는 API 목록 (verify-session-checks.js 실행 결과)
const apisWithoutSessionCheck = [
  'debug/env-check/route.ts',
  'health/route.ts',
  'payment/fail/route.ts',
  'revenue-proof/ranking/route.ts',
  'revenue-proof/seed/route.ts',
  'revenue-proof/[id]/comment/route.ts',
  'revenue-proof/[id]/like/route.ts',
  'revenue-proof/[id]/report/route.ts',
  'revenue-proof/[id]/route.ts',
  'youtube/analysis/route.ts',
  'youtube/batch/route.ts',
  'youtube/metrics/route.ts',
  'youtube/popular/route.ts',
  'youtube/webhook/route.ts'
];

// 공개 API (세션 검사 제외)
const publicApis = [
  'health/route.ts',
  'debug/env-check/route.ts',
  'webhook/route.ts'
];

// 표준 세션 검사 코드
const sessionCheckTemplate = `
  // 세션 검사
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'User not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
`;

// import 문 추가 템플릿
const importTemplate = `import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';`;

let modifiedFiles = 0;
let skippedFiles = 0;
let errorFiles = [];

console.log('🔐 Wave 1: 세션 검사 추가 시작\n');

// 각 API 파일 처리
apisWithoutSessionCheck.forEach(apiFile => {
  // 공개 API는 건너뛰기
  if (publicApis.includes(apiFile)) {
    console.log(`⏭️  ${apiFile}: 공개 API - 건너뜀`);
    skippedFiles++;
    return;
  }

  const filePath = path.join(apiPath, apiFile);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${apiFile}: 파일을 찾을 수 없음`);
    errorFiles.push(apiFile);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // createRouteHandlerClient import 확인 및 추가
    if (!content.includes('createRouteHandlerClient')) {
      if (!content.includes('@supabase/auth-helpers-nextjs')) {
        // import 문 추가
        const importIndex = content.indexOf('import');
        if (importIndex !== -1) {
          const firstImportEnd = content.indexOf('\n', importIndex);
          content = content.slice(0, firstImportEnd + 1) + 
                   importTemplate + '\n' + 
                   content.slice(firstImportEnd + 1);
          modified = true;
        }
      } else {
        // 기존 import에 추가
        content = content.replace(
          /@supabase\/auth-helpers-nextjs['"]/,
          match => {
            const beforeQuote = match.slice(0, -1);
            return beforeQuote + "';\nimport { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'";
          }
        );
        modified = true;
      }
    }

    // cookies import 확인 및 추가
    if (!content.includes("from 'next/headers'")) {
      const importIndex = content.indexOf('import');
      if (importIndex !== -1) {
        const firstImportEnd = content.indexOf('\n', importIndex);
        content = content.slice(0, firstImportEnd + 1) + 
                 "import { cookies } from 'next/headers';\n" + 
                 content.slice(firstImportEnd + 1);
        modified = true;
      }
    }

    // 각 HTTP 메서드에 세션 검사 추가
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
    methods.forEach(method => {
      const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*{`, 'g');
      const matches = content.match(methodRegex);
      
      if (matches) {
        matches.forEach(match => {
          const functionStart = content.indexOf(match);
          const functionBodyStart = functionStart + match.length;
          
          // try 블록 찾기
          const tryIndex = content.indexOf('try {', functionBodyStart);
          if (tryIndex !== -1 && tryIndex < functionBodyStart + 100) {
            const tryBodyStart = tryIndex + 5;
            
            // 이미 세션 검사가 있는지 확인
            const nextHundred = content.slice(tryBodyStart, tryBodyStart + 200);
            if (!nextHundred.includes('getUser()') && !nextHundred.includes('getSession()')) {
              // 세션 검사 코드 삽입
              content = content.slice(0, tryBodyStart) + 
                       '\n' + sessionCheckTemplate + '\n' +
                       content.slice(tryBodyStart);
              modified = true;
              console.log(`✅ ${apiFile}: ${method} 메서드에 세션 검사 추가`);
            }
          }
        });
      }
    });

    // 수정된 내용 저장
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
      console.log(`📝 ${apiFile}: 파일 저장 완료`);
    } else {
      console.log(`⚠️  ${apiFile}: 이미 세션 검사가 있거나 수정할 수 없음`);
    }

  } catch (error) {
    console.error(`❌ ${apiFile}: 처리 중 오류 - ${error.message}`);
    errorFiles.push(apiFile);
  }
});

// 결과 요약
console.log('\n' + '='.repeat(50));
console.log('📊 Wave 1 세션 검사 추가 결과:');
console.log(`  - 처리 대상: ${apisWithoutSessionCheck.length}개`);
console.log(`  - 수정됨: ${modifiedFiles}개`);
console.log(`  - 건너뜀: ${skippedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

// TypeScript 타입 체크 필요 알림
if (modifiedFiles > 0) {
  console.log('\n⚠️  TypeScript 타입 체크가 필요합니다:');
  console.log('   npm run type-check');
  console.log('   또는');
  console.log('   npx tsc --noEmit');
}

console.log('\n✅ Wave 1 세션 검사 추가 작업 완료!');