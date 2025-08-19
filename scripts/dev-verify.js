#!/usr/bin/env node

/**
 * 개발 서버 시작 전 빠른 검증
 * - 치명적 문제만 체크
 * - 경고는 표시하되 진행 차단하지 않음
 */

const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  reset: '\x1b[0m'
};

// 프로젝트 전체 핵심 API 체크 (WIREFRAME.md 기반)
const criticalAPIs = [
  // 인증 관련
  { 
    name: 'Auth Callback',
    path: 'src/app/auth/callback/route.ts',
    critical: true
  },
  // 사용자 관련
  { 
    name: 'User Profile API',
    path: 'src/app/api/user/profile/route.ts',
    critical: true
  },
  {
    name: 'API Keys Management', 
    path: 'src/app/api/user/api-keys/route.ts',
    critical: true
  },
  // YouTube 관련
  {
    name: 'YouTube Search API',
    path: 'src/app/api/youtube/search/route.ts',
    critical: false
  },
  {
    name: 'YouTube Popular API',
    path: 'src/app/api/youtube/popular/route.ts',
    critical: false
  },
  {
    name: 'YouTube Folders API',
    path: 'src/app/api/youtube/folders/route.ts',
    critical: false
  },
  {
    name: 'YouTube Collections API',
    path: 'src/app/api/youtube/collections/route.ts',
    critical: false
  },
  // 수익인증 관련
  {
    name: 'Revenue Proof API',
    path: 'src/app/api/revenue-proof/route.ts',
    critical: false
  },
  // 커뮤니티 관련
  {
    name: 'Community Posts API',
    path: 'src/app/api/community/posts/route.ts',
    critical: false
  }
];

// TypeScript 타입 체크 (간단히)
const typeIssues = [];
const checkForAnyType = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.includes(': any') || line.includes('<any>')) {
      typeIssues.push(`${filePath}:${index + 1} - any 타입 사용`);
    }
  });
};

console.log('\n📋 Development Quick Verify (Project-wide)\n');

let hasError = false;
let warningCount = 0;

// API 파일 체크
console.log('🔍 Checking API endpoints...');
criticalAPIs.forEach(api => {
  const exists = fs.existsSync(path.join(process.cwd(), api.path));
  
  if (!exists && api.critical) {
    console.log(`${colors.red}❌ Missing (CRITICAL): ${api.name}${colors.reset}`);
    console.log(`   Path: ${api.path}`);
    hasError = true;
  } else if (!exists) {
    console.log(`${colors.yellow}⚠️  Missing: ${api.name}${colors.reset}`);
    warningCount++;
  } else {
    console.log(`${colors.green}✅ Found: ${api.name}${colors.reset}`);
    // TypeScript 체크
    checkForAnyType(path.join(process.cwd(), api.path));
  }
});

// TypeScript 이슈 표시
if (typeIssues.length > 0) {
  console.log(`\n${colors.yellow}⚠️  TypeScript Issues:${colors.reset}`);
  typeIssues.slice(0, 3).forEach(issue => {
    console.log(`   ${issue}`);
  });
  if (typeIssues.length > 3) {
    console.log(`   ... and ${typeIssues.length - 3} more`);
  }
  warningCount += typeIssues.length;
}

// 환경 변수 체크
console.log('\n🔐 Checking environment...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log(`${colors.yellow}⚠️  .env.local not found${colors.reset}`);
  warningCount++;
} else {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  requiredEnvVars.forEach(envVar => {
    if (!envContent.includes(envVar)) {
      console.log(`${colors.yellow}⚠️  Missing env: ${envVar}${colors.reset}`);
      warningCount++;
    }
  });
}

// 결과 요약
console.log('\n' + '='.repeat(40));
if (hasError) {
  console.log(`${colors.red}❌ Critical issues found!${colors.reset}`);
  console.log('Please fix the critical issues before continuing.');
  console.log('\nSuggested fix:');
  console.log('1. Create missing API files');
  console.log('2. Or run: npm run fix:missing-apis');
  process.exit(1); // 치명적 에러가 있으면 중단
} else if (warningCount > 0) {
  console.log(`${colors.yellow}⚠️  ${warningCount} warnings found${colors.reset}`);
  console.log('Development server will start, but some features may not work.');
} else {
  console.log(`${colors.green}✅ All checks passed!${colors.reset}`);
}
console.log('='.repeat(40) + '\n');

// 경고만 있으면 계속 진행
process.exit(0);