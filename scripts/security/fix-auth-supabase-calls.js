#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - authSupabase 호출 수정
 * 
 * 목적: authSupabase 변수명 변경 후 호출 부분도 수정
 */

const fs = require('fs');
const path = require('path');

// 수정이 필요한 파일 목록
const filesToFix = [
  'src/app/api/payment/fail/route.ts',
  'src/app/api/revenue-proof/[id]/comment/route.ts',
  'src/app/api/revenue-proof/[id]/report/route.ts',
  'src/app/api/revenue-proof/[id]/route.ts',
  'src/app/api/revenue-proof/ranking/route.ts',
  'src/app/api/revenue-proof/seed/route.ts'
];

let fixedFiles = 0;
let errorFiles = [];

console.log('🔧 Wave 1: authSupabase 호출 수정 시작\n');

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

    // authSupabase 선언 후 supabase.auth.getUser()를 authSupabase.auth.getUser()로 변경
    const pattern = /const authSupabase = createRouteHandlerClient\({ cookies }\);\n\s+const { data: { user } } = await supabase\.auth\.getUser\(\);/g;
    
    if (content.match(pattern)) {
      content = content.replace(
        pattern,
        `const authSupabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await authSupabase.auth.getUser();`
      );
      modified = true;
      console.log(`✅ ${filePath}: authSupabase 호출 수정`);
    }

    // 파일 저장
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedFiles++;
      console.log(`📝 ${filePath}: 저장 완료`);
    } else {
      console.log(`⚠️  ${filePath}: 이미 수정됨 또는 수정 불필요`);
    }

  } catch (error) {
    console.error(`❌ ${filePath}: 처리 중 오류 - ${error.message}`);
    errorFiles.push(filePath);
  }
});

// 결과 요약
console.log('\n' + '='.repeat(50));
console.log('📊 authSupabase 호출 수정 결과:');
console.log(`  - 처리 대상: ${filesToFix.length}개`);
console.log(`  - 수정됨: ${fixedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

console.log('\n✅ Wave 1 authSupabase 호출 수정 완료!');
console.log('\n⚠️  다시 TypeScript 타입 체크를 실행하세요:');
console.log('   npx tsc --noEmit');