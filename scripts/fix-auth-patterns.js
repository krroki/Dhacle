#!/usr/bin/env node

/**
 * API Route 인증 패턴 자동 수정 스크립트
 * - 모든 API route에서 올바른 인증 체크 패턴 사용 확인
 * - createRouteHandlerClient + getUser() 패턴으로 통일
 */

const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// 인증이 필요한 API 패턴
const AUTH_REQUIRED_PATTERNS = [
  '/api/user/',
  '/api/youtube/',
  '/api/revenue-proof/', // All revenue-proof endpoints need auth except webhook
  '/api/payment/',
  '/api/admin/',
  '/api/community/posts/my',
  '/api/course/my',
  '/api/debug/env-check', // Needs auth for security (exposes env variables)
];

// 공개 API 패턴 (인증 불필요)
const PUBLIC_PATTERNS = [
  '/api/health',
  '/api/youtube/webhook',
  '/api/test/',
  '/auth/callback',
  '/api/user/check-username', // Username availability check during registration
];

function shouldRequireAuth(filePath) {
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  const apiPath = relativePath.replace('src/app', '').replace('/route.ts', '').replace('/route.js', '');
  
  // 공개 패턴 체크
  for (const pattern of PUBLIC_PATTERNS) {
    if (apiPath.includes(pattern.replace('/api/', ''))) {
      return false;
    }
  }
  
  // 인증 필요 패턴 체크
  for (const pattern of AUTH_REQUIRED_PATTERNS) {
    if (apiPath.includes(pattern.replace('/api/', ''))) {
      return true;
    }
  }
  
  // 기본적으로 모든 API는 인증 필요
  return true;
}

function checkAndFixAuthPattern(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const needsAuth = shouldRequireAuth(filePath);
  const fileName = path.basename(path.dirname(filePath));
  
  let issues = [];
  let fixed = false;
  
  if (needsAuth) {
    // 인증이 필요한 경우
    const hasCorrectImport = content.includes("import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'");
    const hasGetUser = content.includes('getUser()');
    const hasAuthCheck = content.includes('User not authenticated');
    
    if (!hasCorrectImport) {
      issues.push('Missing correct Supabase import');
    }
    if (!hasGetUser) {
      issues.push('Not using getUser()');
    }
    if (!hasAuthCheck) {
      issues.push('Missing auth check');
    }
    
    // 잘못된 패턴 체크
    if (content.includes('getSession()')) {
      issues.push('Using deprecated getSession()');
    }
    if (content.includes('createServerClient')) {
      issues.push('Using wrong createServerClient');
    }
  } else {
    // 공개 API인 경우
    if (content.includes('getUser()') && content.includes('401')) {
      issues.push('Public API has unnecessary auth check');
    }
  }
  
  return {
    path: filePath,
    needsAuth,
    issues,
    fileName
  };
}

function scanAPIRoutes() {
  const apiDir = path.join(process.cwd(), 'src/app/api');
  const authCallbackDir = path.join(process.cwd(), 'src/app/auth/callback');
  const results = [];
  
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file === 'route.ts' || file === 'route.js') {
        const result = checkAndFixAuthPattern(filePath);
        if (result.issues.length > 0) {
          results.push(result);
        }
      }
    }
  }
  
  scanDirectory(apiDir);
  if (fs.existsSync(authCallbackDir)) {
    scanDirectory(authCallbackDir);
  }
  
  return results;
}

// 실행
console.log('\n🔐 API Route Authentication Pattern Check\n');
console.log('=' .repeat(50));

const results = scanAPIRoutes();

if (results.length === 0) {
  console.log(`${colors.green}✅ All API routes have correct authentication patterns!${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠️ Found ${results.length} routes with authentication issues:${colors.reset}\n`);
  
  results.forEach((result, index) => {
    const routeName = result.path.replace(process.cwd(), '').replace(/\\/g, '/');
    console.log(`${index + 1}. ${colors.cyan}${routeName}${colors.reset}`);
    console.log(`   Auth Required: ${result.needsAuth ? 'Yes' : 'No'}`);
    console.log(`   Issues:`);
    result.issues.forEach(issue => {
      console.log(`     ${colors.red}• ${issue}${colors.reset}`);
    });
    console.log();
  });
  
  console.log(`${colors.yellow}To fix these issues, ensure all protected routes use:${colors.reset}`);
  console.log(`
  import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
  import { cookies } from 'next/headers';
  
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }
  `);
}