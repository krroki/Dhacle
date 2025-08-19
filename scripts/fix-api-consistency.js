#!/usr/bin/env node

/**
 * ⚠️ DEPRECATED - 이 스크립트는 사용하지 마세요!
 * 
 * 이 자동 수정 도구는 다음과 같은 심각한 문제가 있습니다:
 * - 컨텍스트를 무시한 단순 텍스트 치환
 * - 변수 스코프와 타입을 고려하지 않음
 * - 각 파일의 특수한 상황을 무시
 * - 런타임 오류를 발생시킬 수 있음
 * 
 * ✅ 올바른 방법:
 * 1. npm run verify:api로 문제 파일 확인
 * 2. 각 파일을 개별적으로 열어서 수정
 * 3. 변수명과 스코프를 정확히 확인
 * 4. 타입 체크 통과 확인
 * 
 * @deprecated 2025-01-30
 */

console.error('\n⛔ 이 스크립트는 비활성화되었습니다.');
console.error('📌 각 파일을 수동으로 검토하고 수정하세요.');
console.error('💡 npm run verify:api를 실행하여 수정이 필요한 파일을 확인하세요.\n');
process.exit(1);

// 아래 코드는 실행되지 않습니다
const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// 통계
let fixedFiles = 0;
let totalFixes = 0;
let failedFiles = [];

console.log(`\n${colors.cyan}🔧 API 일치성 자동 수정 시작...${colors.reset}`);
console.log('='.repeat(60));

// API routes 디렉토리 찾기
function findAPIRoutes(dir) {
  let routes = [];
  
  if (!fs.existsSync(dir)) return routes;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      routes = routes.concat(findAPIRoutes(fullPath));
    } else if (item === 'route.ts' || item === 'route.js') {
      routes.push(fullPath);
    }
  }
  
  return routes;
}

// 파일 수정 함수
function fixAPIRoute(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const relativePath = path.relative(process.cwd(), filePath);
    let fixes = [];
    
    // 1. Import 수정 - createRouteHandlerClient를 @supabase/auth-helpers-nextjs에서 가져오기
    if (content.includes('createServerClient') || 
        content.includes('createSupabaseRouteHandlerClient') ||
        (!content.includes("import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'") &&
         content.includes('cookies'))) {
      
      // 기존 잘못된 import 제거
      content = content.replace(/import\s+{\s*createServerClient[^}]*}\s+from\s+['"]@supabase\/ssr['"];?\s*\n?/g, '');
      content = content.replace(/import\s+{\s*createServerClient[^}]*}\s+from\s+['"]@\/lib\/supabase\/server['"];?\s*\n?/g, '');
      content = content.replace(/import\s+{\s*createSupabaseRouteHandlerClient[^}]*}\s+from\s+['"]@\/lib\/supabase['"];?\s*\n?/g, '');
      
      // 올바른 import 추가 (중복 방지)
      if (!content.includes("import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'")) {
        // 첫 번째 import 문 찾기
        const firstImportMatch = content.match(/^import\s+/m);
        if (firstImportMatch) {
          const insertPosition = firstImportMatch.index;
          content = content.slice(0, insertPosition) + 
                   "import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';\n" +
                   content.slice(insertPosition);
        } else {
          // import 문이 없으면 파일 시작 부분에 추가
          content = "import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';\n" + content;
        }
        fixes.push('Import 문 수정');
      }
    }
    
    // 2. Supabase 클라이언트 생성 패턴 수정
    // createServerClient → createRouteHandlerClient
    content = content.replace(
      /createServerClient\([^)]+\)/g,
      'createRouteHandlerClient({ cookies })'
    );
    
    // createSupabaseRouteHandlerClient → createRouteHandlerClient
    content = content.replace(
      /createSupabaseRouteHandlerClient\([^)]*\)/g,
      'createRouteHandlerClient({ cookies })'
    );
    
    if (content !== originalContent && !fixes.includes('Import 문 수정')) {
      fixes.push('클라이언트 생성 패턴 수정');
    }
    
    // 3. getSession() → getUser() 변경
    if (content.includes('getSession()')) {
      content = content.replace(/\.auth\.getSession\(\)/g, '.auth.getUser()');
      content = content.replace(/const\s+{\s*data:\s*{\s*session\s*}\s*}/g, 'const { data: { user } }');
      content = content.replace(/const\s+{\s*data:\s*session\s*}/g, 'const { data: { user } }');
      content = content.replace(/if\s*\(\s*!session\s*\)/g, 'if (!user)');
      content = content.replace(/if\s*\(\s*session\s*\)/g, 'if (user)');
      fixes.push('getSession → getUser 변경');
    }
    
    // 4. 401 에러 응답 형식 통일
    // 다양한 401 응답 패턴들을 표준 형식으로 변경
    const errorPatterns = [
      // Pattern 1: { error: 'Unauthorized' }
      /return\s+NextResponse\.json\s*\(\s*{\s*error:\s*['"]Unauthorized['"]\s*}\s*,\s*{\s*status:\s*401\s*}\s*\)/g,
      // Pattern 2: { error: 'Authentication required' }
      /return\s+NextResponse\.json\s*\(\s*{\s*error:\s*['"]Authentication required['"]\s*}\s*,\s*{\s*status:\s*401\s*}\s*\)/g,
      // Pattern 3: { message: ... }
      /return\s+NextResponse\.json\s*\(\s*{\s*message:\s*[^}]+}\s*,\s*{\s*status:\s*401\s*}\s*\)/g,
      // Pattern 4: new Response with 401
      /return\s+new\s+Response\s*\(\s*['"][^'"]*['"]\s*,\s*{\s*status:\s*401[^}]*}\s*\)/g
    ];
    
    let hadErrorFormatChange = false;
    for (const pattern of errorPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, 
          "return NextResponse.json(\n        { error: 'User not authenticated' },\n        { status: 401 }\n      )"
        );
        hadErrorFormatChange = true;
      }
    }
    
    if (hadErrorFormatChange) {
      fixes.push('401 에러 형식 표준화');
    }
    
    // 5. Service Role Client는 건너뛰기 (특수 목적)
    if (content.includes('SERVICE_ROLE_KEY') || content.includes('service_role')) {
      console.log(`${colors.yellow}⚠️  ${relativePath} - Service Role Client 사용 (건너뜀)${colors.reset}`);
      return false;
    }
    
    // 변경사항이 있으면 파일 저장
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`${colors.green}✅ ${relativePath}${colors.reset}`);
      fixes.forEach(fix => {
        console.log(`   - ${fix}`);
      });
      fixedFiles++;
      totalFixes += fixes.length;
      return true;
    }
    
    return false;
    
  } catch (error) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`${colors.red}❌ ${relativePath} - ${error.message}${colors.reset}`);
    failedFiles.push(relativePath);
    return false;
  }
}

// 메인 실행
function main() {
  // API routes 찾기
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  const authDir = path.join(process.cwd(), 'src', 'app', 'auth');
  
  console.log(`\n${colors.cyan}📁 API Routes 검색 중...${colors.reset}`);
  
  let allRoutes = [];
  if (fs.existsSync(apiDir)) {
    allRoutes = allRoutes.concat(findAPIRoutes(apiDir));
  }
  if (fs.existsSync(authDir)) {
    allRoutes = allRoutes.concat(findAPIRoutes(authDir));
  }
  
  console.log(`   발견된 파일: ${allRoutes.length}개\n`);
  
  // 각 파일 수정
  console.log(`${colors.cyan}🔧 파일 수정 중...${colors.reset}`);
  console.log('-'.repeat(60));
  
  allRoutes.forEach(route => {
    fixAPIRoute(route);
  });
  
  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}📊 수정 결과${colors.reset}`);
  console.log('='.repeat(60));
  
  console.log(`\n${colors.green}✅ 수정 완료:${colors.reset}`);
  console.log(`   • 수정된 파일: ${fixedFiles}개`);
  console.log(`   • 총 수정 사항: ${totalFixes}개`);
  
  if (failedFiles.length > 0) {
    console.log(`\n${colors.red}❌ 수정 실패:${colors.reset}`);
    failedFiles.forEach(file => {
      console.log(`   • ${file}`);
    });
  }
  
  // 검증 스크립트 실행 권장
  console.log(`\n${colors.cyan}💡 다음 단계:${colors.reset}`);
  console.log('   1. 수정 내용 확인: git diff');
  console.log('   2. 검증 실행: npm run verify:api');
  console.log('   3. 빌드 테스트: npm run build');
  
  process.exit(failedFiles.length > 0 ? 1 : 0);
}

// 실행
main();