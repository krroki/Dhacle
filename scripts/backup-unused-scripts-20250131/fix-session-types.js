#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 0 - TypeScript 에러 수정
 * cookies() 함수 await 누락 수정
 */

const fs = require('fs').promises;
const path = require('path');

// 수정이 필요한 파일들
const FILES_TO_FIX = [
  'src/app/api/payment/confirm/route.ts',
  'src/app/api/revenue-proof/route.ts',
  'src/app/api/youtube/collections/items/route.ts',
  'src/app/api/youtube/collections/route.ts',
];

// 잘못된 패턴과 올바른 패턴
const WRONG_PATTERN = /const cookieStore = await cookies\(\);/g;
const CORRECT_PATTERN = 'const cookieStore = await cookies();';

const WRONG_PATTERN2 = /const supabase = createRouteHandlerClient\({ cookies: \(\) => cookieStore }\);/g;
const CORRECT_PATTERN2 = 'const supabase = createRouteHandlerClient({ cookies: () => cookieStore });';

async function fixFile(filePath) {
  try {
    const fullPath = path.resolve(__dirname, '../../', filePath);
    let content = await fs.readFile(fullPath, 'utf-8');
    
    // cookies() 함수 주변 코드 수정
    // 잘못된 템플릿 제거하고 올바른 템플릿으로 교체
    const oldTemplate = `
  // 세션 검사
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });`;
    
    const newTemplate = `
  // 세션 검사
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });`;
    
    // 실제로는 타입 문제가 아니라 cookies() 함수 사용법 문제
    // createRouteHandlerClient는 cookies 함수를 직접 받아야 함
    const correctTemplate = `
  // 세션 검사
  const supabase = createRouteHandlerClient({ cookies });`;
    
    // 템플릿 교체
    content = content.replace(/\/\/ 세션 검사\s*\n\s*const cookieStore = await cookies\(\);\s*\n\s*const supabase = createRouteHandlerClient\({ cookies: \(\) => cookieStore }\);/g, correctTemplate);
    
    await fs.writeFile(fullPath, content, 'utf-8');
    console.log(`✅ ${filePath} 수정 완료`);
    return true;
  } catch (error) {
    console.error(`❌ ${filePath} 수정 실패:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔐 TypeScript 에러 수정 시작\n');
  
  let successCount = 0;
  for (const file of FILES_TO_FIX) {
    const success = await fixFile(file);
    if (success) successCount++;
  }
  
  console.log(`\n✅ ${successCount}/${FILES_TO_FIX.length} 파일 수정 완료`);
}

main().catch(console.error);