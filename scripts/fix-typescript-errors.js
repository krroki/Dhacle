#!/usr/bin/env node

/**
 * TypeScript 오류 자동 수정 스크립트
 * - session → user 변경
 * - 중복 import 제거
 * - createServerClient 제거
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

console.log(`\n${colors.cyan}🔧 TypeScript 오류 자동 수정 시작...${colors.reset}`);
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
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const relativePath = path.relative(process.cwd(), filePath);
    let fixes = [];
    
    // 1. 중복 NextResponse import 제거
    // 먼저 잘못된 import 제거
    content = content.replace(
      /import\s*{\s*NextResponse\s*,\s*cookies\s*}\s*from\s*['"]next\/headers['"]\s*;?\s*\n?/g,
      "import { cookies } from 'next/headers';\n"
    );
    
    content = content.replace(
      /import\s*{\s*NextResponse\s*}\s*from\s*['"]next\/headers['"]\s*;?\s*\n?/g,
      ""
    );
    
    if (content !== originalContent) {
      fixes.push('중복 NextResponse import 제거');
    }
    
    // 2. session → user 변경 (더 정확한 패턴)
    // session 변수 참조들
    content = content.replace(/\bif\s*\(\s*!session\s*\)/g, 'if (!user)');
    content = content.replace(/\bif\s*\(\s*session\s*\)/g, 'if (user)');
    content = content.replace(/\bsession\?\./g, 'user?.');
    content = content.replace(/\bsession\s*&&\s*/g, 'user && ');
    content = content.replace(/\bsession\s*\|\|\s*/g, 'user || ');
    content = content.replace(/\b!session\b/g, '!user');
    content = content.replace(/\bsession\.user\b/g, 'user');
    content = content.replace(/\bsession\.id\b/g, 'user.id');
    content = content.replace(/\buser_id:\s*session\b/g, 'user_id: user.id');
    content = content.replace(/\bsession\s*\?\s*session\b/g, 'user ? user.id');
    
    // const session 선언 변경 (안전하게)
    content = content.replace(/const\s+session\s*=/g, 'const user =');
    
    if (content.includes('user') && !originalContent.includes('user')) {
      fixes.push('session → user 변경');
    }
    
    // 3. createServerClient 제거 및 교체
    if (content.includes('createServerClient')) {
      // await createServerClient() → createRouteHandlerClient({ cookies })
      content = content.replace(
        /await\s+createServerClient\(\)/g,
        'createRouteHandlerClient({ cookies })'
      );
      
      // createServerClient import 제거
      content = content.replace(
        /import\s*{\s*createServerClient\s*}\s*from\s*[^;]+;?\s*\n?/g,
        ''
      );
      
      // CookieOptions 타입 제거 (사용되지 않음)
      content = content.replace(
        /:\s*CookieOptions/g,
        ''
      );
      
      fixes.push('createServerClient 제거');
    }
    
    // 4. 중복 user 선언 수정
    // 여러 번 선언된 user를 다른 이름으로 변경
    const userDeclarations = content.match(/const\s*{\s*data:\s*{\s*user\s*}\s*}/g) || [];
    if (userDeclarations.length > 1) {
      // 첫 번째 선언은 유지, 나머지는 다른 이름으로
      let count = 0;
      content = content.replace(/const\s*{\s*data:\s*{\s*user\s*}\s*}/g, (match) => {
        count++;
        if (count === 1) return match;
        return `const { data: { user: authUser${count} } }`;
      });
      
      // 참조도 변경
      if (count > 1) {
        fixes.push('중복 user 선언 수정');
      }
    }
    
    // 5. .session 프로퍼티 접근 수정
    content = content.replace(/data\.\s*session\b/g, 'data.user');
    content = content.replace(/{\s*session\s*}/g, '{ user }');
    
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
    fixFile(route);
  });
  
  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}📊 수정 결과${colors.reset}`);
  console.log('='.repeat(60));
  
  console.log(`\n${colors.green}✅ 수정 완료:${colors.reset}`);
  console.log(`   • 수정된 파일: ${fixedFiles}개`);
  console.log(`   • 총 수정 사항: ${totalFixes}개`);
  
  // 검증 스크립트 실행 권장
  console.log(`\n${colors.cyan}💡 다음 단계:${colors.reset}`);
  console.log('   1. TypeScript 확인: npx tsc --noEmit');
  console.log('   2. 빌드 테스트: npm run build');
  
  process.exit(0);
}

// 실행
main();