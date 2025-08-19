#!/usr/bin/env node

/**
 * 빌드 시 종합 검증 스크립트
 * - TypeScript 타입 체크
 * - API 엔드포인트 검증
 * - 프론트엔드-백엔드 연결 검증
 * - 라우트 보호 검증
 * - 보안 패턴 검증
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 색상 코드
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// 검증 결과 추적
let errorCount = 0;
let warningCount = 0;
const issues = {
  critical: [],
  errors: [],
  warnings: []
};

// Vercel/CI 환경 감지
const isVercel = process.env.VERCEL === '1';
const isCI = process.env.CI === 'true';

console.log('\n🔍 Build Verification System v2.0\n');
console.log('=' .repeat(50));

// ==============================
// 1. TypeScript 검증
// ==============================
console.log('\n📝 TypeScript Verification');
console.log('-'.repeat(40));

function checkTypeScriptIssues() {
  const srcDir = path.join(process.cwd(), 'src');
  const patterns = {
    anyType: /:\s*any\b|<any>/g,
    zodError: /\.errors\b/g, // should be .issues
    missingReturn: /async\s+function\s+\w+\([^)]*\)\s*{/g,
    unknownAccess: /\bunknown\[/g
  };
  
  let localIssues = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Check for any types
        lines.forEach((line, index) => {
          if (patterns.anyType.test(line) && !line.includes('// @ts-ignore')) {
            localIssues.push(`${relativePath}:${index + 1} - any type usage`);
          }
          
          // Check for ZodError.errors (should be .issues)
          if (patterns.zodError.test(line)) {
            localIssues.push(`${relativePath}:${index + 1} - Use ZodError.issues instead of .errors`);
          }
          
          // Check for unknown access without type guard
          if (patterns.unknownAccess.test(line)) {
            localIssues.push(`${relativePath}:${index + 1} - Accessing unknown without type guard`);
          }
        });
        
        // Check for missing return types on async functions
        const asyncMatches = content.match(patterns.missingReturn);
        if (asyncMatches) {
          localIssues.push(`${relativePath} - Missing return type on async function(s)`);
        }
      }
    }
  }
  
  try {
    scanDirectory(srcDir);
    
    if (localIssues.length > 0) {
      console.log(`${colors.yellow}⚠️ Found ${localIssues.length} TypeScript issues:${colors.reset}`);
      localIssues.slice(0, 5).forEach(issue => {
        console.log(`   ${issue}`);
        issues.warnings.push(issue);
      });
      if (localIssues.length > 5) {
        console.log(`   ... and ${localIssues.length - 5} more`);
      }
      warningCount += localIssues.length;
    } else {
      console.log(`${colors.green}✅ No TypeScript issues found${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ TypeScript scan failed: ${error.message}${colors.reset}`);
    issues.errors.push(`TypeScript scan: ${error.message}`);
    errorCount++;
  }
}

checkTypeScriptIssues();

// Run tsc --noEmit
console.log('\nRunning TypeScript compiler check...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log(`${colors.green}✅ TypeScript compilation successful${colors.reset}`);
} catch (error) {
  console.log(`${colors.red}❌ TypeScript compilation failed${colors.reset}`);
  const output = error.stdout ? error.stdout.toString() : '';
  if (output) {
    const lines = output.split('\n').slice(0, 5);
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`   ${line}`);
        // In Vercel environment, TypeScript errors are warnings, not blocking errors
        if (isVercel) {
          issues.warnings.push(`TSC: ${line}`);
        } else {
          issues.errors.push(`TSC: ${line}`);
        }
      }
    });
  }
  errorCount++;
}

// ==============================
// 2. API 엔드포인트 검증
// ==============================
console.log('\n🔌 API Endpoint Verification');
console.log('-'.repeat(40));

// WIREFRAME.md 기반 전체 API 목록
const apiEndpoints = [
  // 인증 관련
  { path: 'src/app/auth/callback/route.ts', name: 'Auth Callback', needsAuth: false },
  // logout은 클라이언트 측에서 처리 (Supabase signOut)
  
  // 사용자 관련
  { path: 'src/app/api/user/profile/route.ts', name: 'User Profile', needsAuth: true },
  { path: 'src/app/api/user/api-keys/route.ts', name: 'API Keys', needsAuth: true },
  { path: 'src/app/api/user/init-profile/route.ts', name: 'Init Profile', needsAuth: true },
  { path: 'src/app/api/user/generate-username/route.ts', name: 'Generate Username', needsAuth: true },
  { path: 'src/app/api/user/generate-nickname/route.ts', name: 'Generate Nickname', needsAuth: true },
  { path: 'src/app/api/user/check-username/route.ts', name: 'Check Username', needsAuth: true },
  { path: 'src/app/api/user/naver-cafe/route.ts', name: 'Naver Cafe', needsAuth: true },
  
  // YouTube 관련
  { path: 'src/app/api/youtube/search/route.ts', name: 'YouTube Search', needsAuth: true },
  { path: 'src/app/api/youtube/popular/route.ts', name: 'Popular Videos', needsAuth: true },
  { path: 'src/app/api/youtube/analysis/route.ts', name: 'Video Analysis', needsAuth: true },
  { path: 'src/app/api/youtube/metrics/route.ts', name: 'Metrics', needsAuth: true },
  { path: 'src/app/api/youtube/batch/route.ts', name: 'Batch Process', needsAuth: true },
  { path: 'src/app/api/youtube/webhook/route.ts', name: 'Webhook', needsAuth: false },
  { path: 'src/app/api/youtube/validate-key/route.ts', name: 'Validate Key', needsAuth: true },
  { path: 'src/app/api/youtube/subscribe/route.ts', name: 'Subscribe', needsAuth: true },
  { path: 'src/app/api/youtube/collections/route.ts', name: 'Collections', needsAuth: true },
  { path: 'src/app/api/youtube/collections/items/route.ts', name: 'Collection Items', needsAuth: true },
  { path: 'src/app/api/youtube/favorites/route.ts', name: 'Favorites', needsAuth: true },
  { path: 'src/app/api/youtube/favorites/[id]/route.ts', name: 'Favorites Detail', needsAuth: true },
  { path: 'src/app/api/youtube/folders/route.ts', name: 'Folders', needsAuth: true },
  
  // 수익인증 관련
  { path: 'src/app/api/revenue-proof/route.ts', name: 'Revenue Proof', needsAuth: false },
  { path: 'src/app/api/revenue-proof/[id]/route.ts', name: 'Revenue Proof Detail', needsAuth: false },
  { path: 'src/app/api/revenue-proof/[id]/like/route.ts', name: 'Revenue Like', needsAuth: true },
  { path: 'src/app/api/revenue-proof/[id]/comment/route.ts', name: 'Revenue Comment', needsAuth: false },
  { path: 'src/app/api/revenue-proof/[id]/report/route.ts', name: 'Revenue Report', needsAuth: true },
  { path: 'src/app/api/revenue-proof/my/route.ts', name: 'My Revenue', needsAuth: true },
  { path: 'src/app/api/revenue-proof/ranking/route.ts', name: 'Ranking', needsAuth: false },
  { path: 'src/app/api/revenue-proof/seed/route.ts', name: 'Seed Data', needsAuth: false },
  
  // 커뮤니티 관련
  { path: 'src/app/api/community/posts/route.ts', name: 'Community Posts', needsAuth: false },
  
  // 결제 관련
  { path: 'src/app/api/payment/create-intent/route.ts', name: 'Payment Intent', needsAuth: true },
  { path: 'src/app/api/payment/confirm/route.ts', name: 'Payment Confirm', needsAuth: true },
  { path: 'src/app/api/payment/fail/route.ts', name: 'Payment Fail', needsAuth: true },
  
  // 기타
  { path: 'src/app/api/health/route.ts', name: 'Health Check', needsAuth: false },
  { path: 'src/app/api/upload/route.ts', name: 'File Upload', needsAuth: true },
  { path: 'src/app/api/coupons/validate/route.ts', name: 'Coupon Validate', needsAuth: true },
  { path: 'src/app/api/debug/env-check/route.ts', name: 'Env Check', needsAuth: false }
];

function checkAPIEndpoints() {
  let missingEndpoints = [];
  let authIssues = [];
  
  apiEndpoints.forEach(endpoint => {
    const fullPath = path.join(process.cwd(), endpoint.path);
    
    if (!fs.existsSync(fullPath)) {
      missingEndpoints.push(endpoint.name);
      issues.errors.push(`Missing API: ${endpoint.name} (${endpoint.path})`);
    } else if (endpoint.needsAuth) {
      // Check for authentication pattern
      const content = fs.readFileSync(fullPath, 'utf-8');
      const hasAuthCheck = content.includes('getUser()') || 
                          content.includes('supabase.auth.getUser') ||
                          content.includes('User not authenticated');
      
      if (!hasAuthCheck) {
        authIssues.push(`${endpoint.name} - Missing auth check`);
        issues.warnings.push(`Auth missing: ${endpoint.name}`);
      }
    }
  });
  
  if (missingEndpoints.length > 0) {
    console.log(`${colors.red}❌ Missing ${missingEndpoints.length} API endpoints:${colors.reset}`);
    missingEndpoints.slice(0, 5).forEach(name => {
      console.log(`   - ${name}`);
    });
    errorCount += missingEndpoints.length;
  } else {
    console.log(`${colors.green}✅ All API endpoints exist${colors.reset}`);
  }
  
  if (authIssues.length > 0) {
    console.log(`${colors.yellow}⚠️ ${authIssues.length} endpoints missing auth checks:${colors.reset}`);
    authIssues.slice(0, 3).forEach(issue => {
      console.log(`   - ${issue}`);
    });
    warningCount += authIssues.length;
  } else {
    console.log(`${colors.green}✅ All protected endpoints have auth checks${colors.reset}`);
  }
}

checkAPIEndpoints();

// ==============================
// 3. Frontend-Backend 연결 검증
// ==============================
console.log('\n🔗 Frontend-Backend Connection Verification');
console.log('-'.repeat(40));

function checkAPIClientUsage() {
  const componentsDir = path.join(process.cwd(), 'src');
  let directFetchCount = 0;
  let apiClientUsageCount = 0;
  let problemFiles = [];
  
  function scanForFetch(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanForFetch(filePath);
      } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.includes('route.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Check for direct fetch to internal APIs
        if (content.includes("fetch('/api/") || content.includes('fetch("/api/')) {
          // Exclude api-client.ts itself
          if (!filePath.includes('api-client.ts')) {
            directFetchCount++;
            problemFiles.push(relativePath);
          }
        }
        
        // Check for api-client usage
        if (content.includes('apiGet') || content.includes('apiPost') || 
            content.includes('apiPut') || content.includes('apiDelete')) {
          apiClientUsageCount++;
        }
      }
    }
  }
  
  scanForFetch(componentsDir);
  
  if (directFetchCount > 0) {
    console.log(`${colors.yellow}⚠️ Found ${directFetchCount} files using direct fetch:${colors.reset}`);
    problemFiles.slice(0, 3).forEach(file => {
      console.log(`   - ${file}`);
      issues.warnings.push(`Direct fetch: ${file}`);
    });
    if (problemFiles.length > 3) {
      console.log(`   ... and ${problemFiles.length - 3} more`);
    }
    warningCount += directFetchCount;
  } else {
    console.log(`${colors.green}✅ No direct fetch calls to internal APIs${colors.reset}`);
  }
  
  console.log(`${colors.cyan}ℹ️ Found ${apiClientUsageCount} files using api-client properly${colors.reset}`);
}

checkAPIClientUsage();

// ==============================
// 4. 라우트 보호 검증
// ==============================
console.log('\n🔒 Route Protection Verification');
console.log('-'.repeat(40));

// Protected routes from ROUTE_SPEC.md
const protectedRoutes = [
  'src/app/(pages)/mypage',
  'src/app/(pages)/tools/youtube-lens',
  'src/app/(pages)/onboarding',
  'src/app/(pages)/settings',
  'src/app/(pages)/payment',
  'src/app/(pages)/admin'
];

function checkRouteProtection() {
  let unprotectedRoutes = [];
  
  protectedRoutes.forEach(routePath => {
    const fullPath = path.join(process.cwd(), routePath);
    
    if (fs.existsSync(fullPath)) {
      // Check for page.tsx in the directory
      const pagePath = path.join(fullPath, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf-8');
        
        // Check for auth patterns
        const hasAuthCheck = content.includes('redirect') && content.includes('login') ||
                           content.includes('useAuth') ||
                           content.includes('getServerSession') ||
                           content.includes('getUser');
        
        if (!hasAuthCheck) {
          unprotectedRoutes.push(routePath);
          issues.warnings.push(`Unprotected route: ${routePath}`);
        }
      }
    }
  });
  
  if (unprotectedRoutes.length > 0) {
    console.log(`${colors.yellow}⚠️ ${unprotectedRoutes.length} routes may lack protection:${colors.reset}`);
    unprotectedRoutes.forEach(route => {
      console.log(`   - ${route}`);
    });
    warningCount += unprotectedRoutes.length;
  } else {
    console.log(`${colors.green}✅ All protected routes have auth checks${colors.reset}`);
  }
}

checkRouteProtection();

// ==============================
// 5. 컴포넌트-API 통합 검증
// ==============================
console.log('\n🧩 Component-API Integration Verification');
console.log('-'.repeat(40));

function checkComponentAPIIntegration() {
  // Check key components for proper data flow
  const keyComponents = [
    { 
      path: 'src/app/(pages)/tools/youtube-lens/page.tsx',
      requiredAPIs: ['/api/youtube/popular', '/api/youtube/search']
    },
    {
      path: 'src/app/(pages)/revenue-proof/page.tsx',
      requiredAPIs: ['/api/revenue-proof']
    },
    {
      path: 'src/app/(pages)/mypage/page.tsx',
      requiredAPIs: ['/api/user/profile']
    }
  ];
  
  let integrationIssues = [];
  
  keyComponents.forEach(component => {
    const fullPath = path.join(process.cwd(), component.path);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      component.requiredAPIs.forEach(api => {
        // Check if the component references the API
        const apiName = api.replace('/api/', '').replace(/\//g, '-');
        if (!content.includes(api) && !content.includes(apiName)) {
          integrationIssues.push(`${component.path} may not use ${api}`);
        }
      });
    }
  });
  
  if (integrationIssues.length > 0) {
    console.log(`${colors.yellow}⚠️ Potential integration issues:${colors.reset}`);
    integrationIssues.slice(0, 3).forEach(issue => {
      console.log(`   - ${issue}`);
      issues.warnings.push(issue);
    });
    warningCount += integrationIssues.length;
  } else {
    console.log(`${colors.green}✅ Component-API integration looks good${colors.reset}`);
  }
}

checkComponentAPIIntegration();

// ==============================
// 6. API 일치성 검증 (Supabase Client Consistency)
// ==============================
console.log('\n🔐 API Consistency Verification');
console.log('-'.repeat(40));

try {
  // Run API consistency check
  execSync('node scripts/verify-api-consistency.js', { stdio: 'pipe' });
  console.log(`${colors.green}✅ API consistency check passed${colors.reset}`);
} catch (error) {
  const output = error.stdout ? error.stdout.toString() : '';
  const hasErrors = output.includes('❌');
  
  if (hasErrors) {
    console.log(`${colors.red}❌ API consistency check failed${colors.reset}`);
    errorCount += 5; // Critical issue
    issues.critical.push('API routes using inconsistent Supabase client patterns');
    
    // Extract error details
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.includes('→')) {
        const errorMsg = line.split('→')[1]?.trim();
        if (errorMsg) {
          issues.errors.push(`API Pattern: ${errorMsg}`);
        }
      }
    });
  } else {
    console.log(`${colors.yellow}⚠️ API consistency check has warnings${colors.reset}`);
    warningCount += 2;
    issues.warnings.push('Some API routes may need review');
  }
  
  // Show summary from the check
  const summaryStart = output.indexOf('📈 통계:');
  if (summaryStart !== -1) {
    const summaryLines = output.substring(summaryStart).split('\n').slice(0, 4);
    summaryLines.forEach(line => {
      if (line.trim()) {
        console.log(`   ${line.trim()}`);
      }
    });
  }
}

// ==============================
// 7. ESLint 검증
// ==============================
console.log('\n🔍 ESLint Verification');
console.log('-'.repeat(40));

try {
  execSync('npm run lint', { stdio: 'pipe' });
  console.log(`${colors.green}✅ ESLint check passed${colors.reset}`);
} catch (error) {
  console.log(`${colors.yellow}⚠️ ESLint found issues${colors.reset}`);
  const output = error.stdout ? error.stdout.toString() : '';
  if (output) {
    const lines = output.split('\n').slice(0, 3);
    lines.forEach(line => {
      if (line.trim() && !line.includes('npm')) {
        console.log(`   ${line}`);
        issues.warnings.push(`ESLint: ${line}`);
      }
    });
  }
  warningCount++;
}

// ==============================
// 8. Biome 코드 품질 검증 (2025-08-20 추가)
// ==============================
console.log('\n🎯 Biome Code Quality Verification');
console.log('-'.repeat(40));

if (fs.existsSync(path.join(process.cwd(), 'biome.json'))) {
  try {
    // Biome 검사 실행 (에러와 경고 모두 표시)
    const biomeOutput = execSync('npx biome check ./src --reporter=compact', { 
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    console.log(`${colors.green}✅ Biome check passed${colors.reset}`);
  } catch (error) {
    const output = error.stdout || error.stderr || '';
    
    // 에러/경고 카운트 추출
    const errorMatch = output.match(/(\d+) error/);
    const warningMatch = output.match(/(\d+) warning/);
    const biomeErrorCount = errorMatch ? parseInt(errorMatch[1]) : 0;
    const biomeWarningCount = warningMatch ? parseInt(warningMatch[1]) : 0;
    
    if (biomeErrorCount > 0) {
      console.log(`${colors.red}❌ Biome found ${biomeErrorCount} errors${colors.reset}`);
      console.log('   These should be fixed for better code quality');
      console.log('   Run: npm run lint:biome:fix to auto-fix');
      
      // Biome 에러는 빌드를 막지 않지만 경고로 기록
      warningCount += biomeErrorCount;
      issues.warnings.push(`Biome: ${biomeErrorCount} code quality issues`);
      
      // 처음 3개 이슈만 표시
      const lines = output.split('\n').filter(line => line.trim());
      const issueLines = lines.filter(line => 
        line.includes('.ts') || line.includes('.tsx') || line.includes('.js')
      );
      issueLines.slice(0, 3).forEach(line => {
        console.log(`   ${line}`);
      });
      if (issueLines.length > 3) {
        console.log(`   ... and ${issueLines.length - 3} more issues`);
      }
    } else if (biomeWarningCount > 0) {
      console.log(`${colors.yellow}⚠️ Biome found ${biomeWarningCount} warnings${colors.reset}`);
      warningCount += biomeWarningCount;
    } else {
      console.log(`${colors.yellow}⚠️ Biome check completed with issues${colors.reset}`);
    }
  }
} else {
  console.log(`${colors.cyan}ℹ️ Biome not configured (biome.json not found)${colors.reset}`);
  console.log('   Install with: npm install --save-dev @biomejs/biome');
  console.log('   Initialize with: npx biome init');
}

// ==============================
// 9. 빌드 테스트 (옵션)
// ==============================
const skipBuild = process.argv.includes('--skip-build');

// Vercel/CI 환경 감지 - 이중 빌드 방지 (상단으로 이동됨)

if (!skipBuild && !isVercel && !isCI) {
  console.log('\n🏗️ Build Test');
  console.log('-'.repeat(40));
  
  console.log('Running Next.js build (this may take a while)...');
  console.log('Tip: Use --skip-build flag to skip this step');
  
  try {
    // Set environment variable to speed up build
    process.env.SKIP_BUILD_PRODUCT_REDIRECTS = '1';
    
    const buildOutput = execSync('npm run build', { 
      stdio: 'pipe',
      env: { ...process.env },
      timeout: 300000 // 5분으로 증가
    });
  
  console.log(`${colors.green}✅ Build successful!${colors.reset}`);
  
  // Parse build output for useful info
  const output = buildOutput.toString();
  const sizeMatch = output.match(/Total size: ([\d.]+\s*[KMG]?B)/);
  if (sizeMatch) {
    console.log(`   Build size: ${sizeMatch[1]}`);
  }
} catch (error) {
  console.log(`${colors.red}❌ Build failed!${colors.reset}`);
  const output = error.stdout ? error.stdout.toString() : '';
  if (output) {
    const errorLines = output.split('\n').filter(line => 
      line.includes('Error') || line.includes('error') || line.includes('Failed')
    ).slice(0, 5);
    
    errorLines.forEach(line => {
      console.log(`   ${line}`);
      issues.critical.push(`Build: ${line}`);
    });
  }
  errorCount += 5; // Build failure is critical
}
} else {
  console.log('\n🏗️ Build Test (Skipped)');
  console.log('-'.repeat(40));
  
  if (isVercel) {
    console.log('ℹ️ Vercel environment detected - skipping build test to avoid infinite loop');
  } else if (isCI) {
    console.log('ℹ️ CI environment detected - skipping build test');
  } else {
    console.log('Build test skipped. Run without --skip-build flag to test build.');
  }
}

// ==============================
// 최종 결과 요약
// ==============================
console.log('\n' + '='.repeat(50));
console.log('📊 Build Verification Summary');
console.log('='.repeat(50));

if (errorCount === 0 && warningCount === 0) {
  console.log(`\n${colors.green}🎉 Perfect! All checks passed!${colors.reset}`);
  console.log('Your build is ready for production.');
  process.exit(0);
} else {
  if (issues.critical.length > 0) {
    console.log(`\n${colors.red}🚨 CRITICAL ISSUES (${issues.critical.length}):${colors.reset}`);
    issues.critical.forEach(issue => {
      console.log(`   • ${issue}`);
    });
  }
  
  if (errorCount > 0) {
    console.log(`\n${colors.red}❌ ERRORS (${errorCount}):${colors.reset}`);
    console.log('These must be fixed before deployment:');
    issues.errors.slice(0, 5).forEach(issue => {
      console.log(`   • ${issue}`);
    });
    if (issues.errors.length > 5) {
      console.log(`   ... and ${issues.errors.length - 5} more`);
    }
  }
  
  if (warningCount > 0) {
    console.log(`\n${colors.yellow}⚠️ WARNINGS (${warningCount}):${colors.reset}`);
    console.log('These should be addressed:');
    issues.warnings.slice(0, 5).forEach(issue => {
      console.log(`   • ${issue}`);
    });
    if (issues.warnings.length > 5) {
      console.log(`   ... and ${issues.warnings.length - 5} more`);
    }
  }
  
  console.log('\n' + '-'.repeat(50));
  console.log('📝 Recommendations:');
  
  if (issues.errors.some(e => e.includes('Missing API'))) {
    console.log('1. Run: npm run fix:missing-apis');
  }
  if (issues.warnings.some(w => w.includes('any type'))) {
    console.log('2. Fix TypeScript type issues');
  }
  if (issues.warnings.some(w => w.includes('Direct fetch'))) {
    console.log('3. Replace direct fetch with api-client functions');
  }
  if (issues.warnings.some(w => w.includes('Auth missing'))) {
    console.log('4. Add authentication checks to protected endpoints');
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Exit with error if critical issues (but be lenient in Vercel)
  if (isVercel) {
    // In Vercel, only fail for critical issues, not TypeScript errors
    if (issues.critical.length > 0) {
      console.log(`\n${colors.red}Build verification failed due to critical issues.${colors.reset}`);
      process.exit(1);
    } else if (errorCount > 0) {
      console.log(`\n${colors.yellow}Build completed with errors that should be fixed soon.${colors.reset}`);
      process.exit(0); // Allow build to continue in Vercel
    } else {
      console.log(`\n${colors.green}Build verification passed (Vercel mode).${colors.reset}`);
      process.exit(0);
    }
  } else {
    // In local environment, be stricter
    if (errorCount > 0 || issues.critical.length > 0) {
      console.log(`\n${colors.red}Build verification failed. Please fix errors before deploying.${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`\n${colors.yellow}Build completed with warnings. Consider fixing them.${colors.reset}`);
      process.exit(0);
    }
  }
}