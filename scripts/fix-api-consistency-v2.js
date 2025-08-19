#!/usr/bin/env node

/**
 * API 일치성 자동 수정 스크립트 v2
 * - 더 강력한 패턴 매칭과 수정
 * - 모든 Supabase 클라이언트 패턴 통일
 */

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
let skippedFiles = [];

console.log(`\n${colors.cyan}🔧 API 일치성 자동 수정 v2 시작...${colors.reset}`);
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
    
    // Service Role Client 사용하는 파일은 건너뛰기
    if (content.includes('SERVICE_ROLE_KEY') || 
        content.includes('service_role') ||
        content.includes('createServiceRoleClient')) {
      console.log(`${colors.yellow}⚠️  ${relativePath} - Service Role Client 사용 (건너뜀)${colors.reset}`);
      skippedFiles.push(relativePath);
      return false;
    }
    
    // 특수 파일들 건너뛰기
    if (filePath.includes('env-check') || 
        filePath.includes('webhook') ||
        filePath.includes('debug')) {
      console.log(`${colors.yellow}⚠️  ${relativePath} - 특수 목적 파일 (건너뜀)${colors.reset}`);
      skippedFiles.push(relativePath);
      return false;
    }
    
    // 1. 모든 잘못된 import 제거
    const badImportPatterns = [
      /import\s+{\s*createServerClient[^}]*}\s+from\s+['"]@supabase\/ssr['"];?\s*\n?/g,
      /import\s+{\s*createServerClient[^}]*}\s+from\s+['"]@\/lib\/supabase\/server['"];?\s*\n?/g,
      /import\s+{\s*createServerClient[^}]*}\s+from\s+['"]@\/lib\/supabase['"];?\s*\n?/g,
      /import\s+{\s*createSupabaseRouteHandlerClient[^}]*}\s+from\s+['"]@\/lib\/supabase['"];?\s*\n?/g,
      /import\s+{\s*createSupabaseRouteHandlerClient[^}]*}\s+from\s+[^;]+;?\s*\n?/g,
      /import\s+createSupabaseRouteHandlerClient[^;]*;?\s*\n?/g
    ];
    
    for (const pattern of badImportPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        fixes.push('잘못된 import 제거');
      }
    }
    
    // 2. cookies import가 있는지 확인
    const needsCookiesImport = content.includes('cookies') && 
                               !content.includes("import { cookies } from 'next/headers'");
    
    // 3. 올바른 imports 추가
    const needsSupabaseImport = !content.includes("import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'");
    
    if (needsSupabaseImport || needsCookiesImport) {
      // 파일 시작 부분 찾기
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // 첫 번째 import 문 위치 찾기
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertIndex = i;
          break;
        }
      }
      
      const imports = [];
      if (needsSupabaseImport) {
        imports.push("import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';");
      }
      if (needsCookiesImport) {
        imports.push("import { cookies } from 'next/headers';");
      }
      
      // imports 삽입
      lines.splice(insertIndex, 0, ...imports);
      content = lines.join('\n');
      
      if (needsSupabaseImport) fixes.push('Supabase import 추가');
      if (needsCookiesImport) fixes.push('cookies import 추가');
    }
    
    // 4. 모든 잘못된 클라이언트 생성 패턴 수정
    // createServerClient 패턴들
    content = content.replace(
      /const\s+supabase\s*=\s*createServerClient\([^)]+\)/g,
      'const supabase = createRouteHandlerClient({ cookies })'
    );
    
    content = content.replace(
      /const\s+supabaseClient\s*=\s*createServerClient\([^)]+\)/g,
      'const supabase = createRouteHandlerClient({ cookies })'
    );
    
    // createSupabaseRouteHandlerClient 패턴들
    content = content.replace(
      /const\s+supabase\s*=\s*createSupabaseRouteHandlerClient\([^)]*\)/g,
      'const supabase = createRouteHandlerClient({ cookies })'
    );
    
    content = content.replace(
      /const\s+supabaseClient\s*=\s*createSupabaseRouteHandlerClient\([^)]*\)/g,
      'const supabase = createRouteHandlerClient({ cookies })'
    );
    
    // createRouteHandlerClient 잘못된 사용 수정
    content = content.replace(
      /createRouteHandlerClient\(\s*\)/g,
      'createRouteHandlerClient({ cookies })'
    );
    
    if (content.includes('createRouteHandlerClient') && !fixes.includes('클라이언트 생성 패턴 수정')) {
      fixes.push('클라이언트 생성 패턴 수정');
    }
    
    // 5. getSession() → getUser() 변경
    if (content.includes('getSession')) {
      // getSession 호출
      content = content.replace(/\.auth\.getSession\(\)/g, '.auth.getUser()');
      
      // session 변수명들
      content = content.replace(/const\s+{\s*data:\s*{\s*session\s*}[^}]*}/g, 'const { data: { user } }');
      content = content.replace(/const\s+{\s*data:\s*session[^}]*}/g, 'const { data: { user } }');
      
      // session 체크
      content = content.replace(/if\s*\(\s*!session\b/g, 'if (!user');
      content = content.replace(/if\s*\(\s*session\b/g, 'if (user');
      content = content.replace(/\bsession\s*\?\./g, 'user?.');
      content = content.replace(/\bsession\s*&&/g, 'user &&');
      content = content.replace(/\bsession\s*\|\|/g, 'user ||');
      content = content.replace(/\b!session\b/g, '!user');
      
      // session.user → user
      content = content.replace(/\bsession\.user\b/g, 'user');
      
      fixes.push('getSession → getUser 변경');
    }
    
    // 6. 401 에러 응답 형식 통일
    // 다양한 401 응답 패턴들을 표준 형식으로 변경
    const errorPatterns = [
      /return\s+NextResponse\.json\s*\(\s*{\s*error:\s*['"][^'"]+['"]\s*}\s*,\s*{\s*status:\s*401/g,
      /return\s+NextResponse\.json\s*\(\s*{\s*message:\s*[^}]+}\s*,\s*{\s*status:\s*401/g,
      /return\s+new\s+Response\s*\([^,]+,\s*{\s*status:\s*401/g
    ];
    
    let hadErrorFormatChange = false;
    for (const pattern of errorPatterns) {
      if (pattern.test(content)) {
        // 간단한 치환이 아닌 더 정확한 치환
        content = content.replace(pattern, (match) => {
          // API Key 관련 에러는 유지
          if (match.includes('API Key') || match.includes('api_key')) {
            return match;
          }
          return 'return NextResponse.json(\n        { error: \'User not authenticated\' },\n        { status: 401';
        });
        hadErrorFormatChange = true;
      }
    }
    
    if (hadErrorFormatChange) {
      fixes.push('401 에러 형식 표준화');
    }
    
    // 7. NextResponse import 확인
    if (content.includes('NextResponse') && !content.includes("import { NextResponse }")) {
      const lines = content.split('\n');
      let nextImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('from \'next')) {
          nextImportIndex = i;
          break;
        }
      }
      
      if (nextImportIndex === -1) {
        // next import가 없으면 처음에 추가
        lines.unshift("import { NextResponse } from 'next/server';");
      } else {
        // 기존 next import 수정
        if (!lines[nextImportIndex].includes('NextResponse')) {
          lines[nextImportIndex] = lines[nextImportIndex].replace(
            /import\s*{\s*/,
            'import { NextResponse, '
          );
        }
      }
      
      content = lines.join('\n');
      fixes.push('NextResponse import 추가');
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
  
  if (skippedFiles.length > 0) {
    console.log(`\n${colors.yellow}⚠️  건너뛴 파일 (${skippedFiles.length}개):${colors.reset}`);
    skippedFiles.slice(0, 5).forEach(file => {
      console.log(`   • ${file}`);
    });
    if (skippedFiles.length > 5) {
      console.log(`   ... 외 ${skippedFiles.length - 5}개`);
    }
  }
  
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