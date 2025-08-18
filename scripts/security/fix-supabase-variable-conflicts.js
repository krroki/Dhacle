#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - TypeScript 변수명 충돌 수정
 * 
 * 목적: 세션 검사로 인한 supabase 변수명 충돌 해결
 */

const fs = require('fs');
const path = require('path');

// 수정이 필요한 파일 목록 (TypeScript 에러 발생 파일)
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

console.log('🔧 Wave 1: supabase 변수명 충돌 수정 시작\n');

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

    // 세션 검사 부분의 supabase를 authSupabase로 변경
    const sessionCheckPattern = /\/\/ 세션 검사\s+const supabase = createRouteHandlerClient/g;
    if (content.match(sessionCheckPattern)) {
      content = content.replace(
        sessionCheckPattern,
        '// 세션 검사\n  const authSupabase = createRouteHandlerClient'
      );
      
      // getUser 호출도 함께 변경
      content = content.replace(
        /const supabase = createRouteHandlerClient\({ cookies }\);\s+const { data: { user } } = await supabase\.auth\.getUser\(\);/g,
        'const authSupabase = createRouteHandlerClient({ cookies });\n  const { data: { user } } = await authSupabase.auth.getUser();'
      );
      
      modified = true;
    }

    // 더 직접적인 방법: 세션 검사 블록 전체를 찾아서 수정
    const sessionBlockRegex = /\/\/ 세션 검사\n\s+const supabase = createRouteHandlerClient\({ cookies }\);\n\s+const { data: { user } } = await supabase\.auth\.getUser\(\);/g;
    
    if (content.match(sessionBlockRegex)) {
      content = content.replace(
        sessionBlockRegex,
        `// 세션 검사
  const authSupabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await authSupabase.auth.getUser();`
      );
      modified = true;
    }

    // 파일 저장
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedFiles++;
      console.log(`✅ ${filePath}: 변수명 충돌 수정 완료`);
    } else {
      console.log(`⚠️  ${filePath}: 수정할 내용을 찾을 수 없음`);
    }

  } catch (error) {
    console.error(`❌ ${filePath}: 처리 중 오류 - ${error.message}`);
    errorFiles.push(filePath);
  }
});

// 결과 요약
console.log('\n' + '='.repeat(50));
console.log('📊 변수명 충돌 수정 결과:');
console.log(`  - 처리 대상: ${filesToFix.length}개`);
console.log(`  - 수정됨: ${fixedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

console.log('\n✅ Wave 1 변수명 충돌 수정 완료!');
console.log('\n⚠️  다시 TypeScript 타입 체크를 실행하세요:');
console.log('   npx tsc --noEmit');