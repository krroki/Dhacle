#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 0 - Task 3
 * 세션 검사 보완 스크립트
 * 
 * 목적: 모든 API route에 표준 세션 검사가 있는지 확인하고 누락된 곳에 추가
 */

const fs = require('fs').promises;
const path = require('path');

// 표준 세션 검사 템플릿
const SESSION_CHECK_TEMPLATE = `
  // 세션 검사
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'User not authenticated' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }`;

// 세션 검사 패턴들
const SESSION_CHECK_PATTERNS = [
  /supabase\.auth\.getUser\(\)/,
  /getUser\(\)/,
  /auth\.uid\(\)/,
  /!user/,
  /if\s*\(\s*!user\s*\)/,
  /if\s*\(\s*!data\?\.user\s*\)/,
];

// 중요 API routes (우선 확인)
const CRITICAL_APIS = [
  '/api/payment/create-intent',
  '/api/payment/confirm',
  '/api/user/api-keys',
  '/api/admin/video/upload',
  '/api/revenue-proof/route',
  '/api/youtube/collections',
];

// API route 파일 찾기
async function findAPIRoutes(dir) {
  const routes = [];
  
  async function traverse(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await traverse(fullPath);
        }
      } else if (entry.isFile() && entry.name === 'route.ts') {
        if (fullPath.includes(path.join('app', 'api'))) {
          routes.push(fullPath);
        }
      }
    }
  }
  
  await traverse(dir);
  return routes;
}

// 세션 검사 확인
async function checkSessionValidation(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // 각 HTTP 메서드 확인
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const results = {
      path: relativePath,
      methods: {},
      hasSessionCheck: false,
      needsImprovement: false,
      isCritical: false,
    };
    
    // Critical API 여부 확인
    for (const criticalPath of CRITICAL_APIS) {
      if (relativePath.includes(criticalPath.replace('/api/', '').replace('/', path.sep))) {
        results.isCritical = true;
        break;
      }
    }
    
    // 각 메서드별 세션 검사 확인
    for (const method of methods) {
      const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(`);
      if (methodRegex.test(content)) {
        // 메서드가 존재함
        results.methods[method] = {
          exists: true,
          hasSessionCheck: false,
          hasStandardCheck: false,
        };
        
        // 해당 메서드 부분 추출 (간단한 방법)
        const methodMatch = content.match(new RegExp(`export\\s+async\\s+function\\s+${method}[\\s\\S]*?(?=export\\s+async\\s+function|$)`));
        if (methodMatch) {
          const methodContent = methodMatch[0];
          
          // 세션 검사 패턴 확인
          for (const pattern of SESSION_CHECK_PATTERNS) {
            if (pattern.test(methodContent)) {
              results.methods[method].hasSessionCheck = true;
              results.hasSessionCheck = true;
              break;
            }
          }
          
          // 표준 응답 형식 확인
          if (methodContent.includes('User not authenticated')) {
            results.methods[method].hasStandardCheck = true;
          } else if (results.methods[method].hasSessionCheck && !results.methods[method].hasStandardCheck) {
            results.needsImprovement = true;
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`❌ 파일 읽기 실패: ${filePath}`, error.message);
    return { error: true };
  }
}

// 세션 검사 추가
async function addSessionCheck(filePath, methods) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;
    
    // import 문 확인 및 추가
    if (!content.includes('createRouteHandlerClient')) {
      const importStatement = `import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';\n`;
      content = importStatement + content;
      modified = true;
    }
    
    if (!content.includes('cookies')) {
      const importStatement = `import { cookies } from 'next/headers';\n`;
      content = importStatement + content;
      modified = true;
    }
    
    // 각 메서드에 세션 검사 추가
    for (const method of Object.keys(methods)) {
      if (methods[method].exists && !methods[method].hasSessionCheck) {
        // 메서드 시작 부분 찾기
        const methodRegex = new RegExp(`(export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*{)`);
        content = content.replace(methodRegex, (match, group1) => {
          return group1 + SESSION_CHECK_TEMPLATE;
        });
        modified = true;
      }
    }
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 세션 검사 추가 실패: ${filePath}`, error.message);
    return false;
  }
}

// 메인 실행
async function main() {
  console.log('🔐 보안 리팩토링: Wave 0 - Task 3');
  console.log('📋 세션 검사 보완 시작\n');
  
  const projectRoot = path.resolve(__dirname, '../../');
  const apiDir = path.join(projectRoot, 'src', 'app', 'api');
  
  // API route 파일 찾기
  const routes = await findAPIRoutes(apiDir);
  console.log(`📁 발견된 API routes: ${routes.length}개\n`);
  
  // 통계
  const stats = {
    total: routes.length,
    withSessionCheck: 0,
    withoutSessionCheck: 0,
    needsImprovement: 0,
    critical: {
      total: 0,
      withCheck: 0,
      withoutCheck: 0,
    },
    modified: 0,
  };
  
  // Critical APIs 먼저 확인
  console.log('🚨 Critical API 확인:\n');
  
  const allResults = [];
  
  for (const route of routes) {
    const result = await checkSessionValidation(route);
    if (!result.error) {
      allResults.push(result);
      
      if (result.hasSessionCheck) {
        stats.withSessionCheck++;
      } else {
        stats.withoutSessionCheck++;
      }
      
      if (result.needsImprovement) {
        stats.needsImprovement++;
      }
      
      if (result.isCritical) {
        stats.critical.total++;
        if (result.hasSessionCheck) {
          stats.critical.withCheck++;
          console.log(`✅ ${result.path}: 세션 검사 있음`);
        } else {
          stats.critical.withoutCheck++;
          console.log(`❌ ${result.path}: 세션 검사 없음 (추가 필요)`);
          
          // 세션 검사 추가 시도
          const added = await addSessionCheck(route, result.methods);
          if (added) {
            console.log(`  ➡️ 세션 검사 추가됨`);
            stats.modified++;
          }
        }
      }
    }
  }
  
  // 나머지 API 확인
  console.log('\n📋 일반 API 확인:\n');
  
  let displayCount = 0;
  for (const result of allResults) {
    if (!result.isCritical && !result.hasSessionCheck && displayCount < 10) {
      console.log(`⚠️ ${result.path}: 세션 검사 없음`);
      displayCount++;
    }
  }
  
  if (stats.withoutSessionCheck - stats.critical.withoutCheck > 10) {
    console.log(`  ... 그 외 ${stats.withoutSessionCheck - stats.critical.withoutCheck - 10}개 API`);
  }
  
  // 결과 출력
  console.log('\n' + '='.repeat(50));
  console.log('📊 세션 검사 통계:');
  console.log(`  - 총 API routes: ${stats.total}개`);
  console.log(`  - 세션 검사 있음: ${stats.withSessionCheck}개 (${Math.round(stats.withSessionCheck/stats.total*100)}%)`);
  console.log(`  - 세션 검사 없음: ${stats.withoutSessionCheck}개 (${Math.round(stats.withoutSessionCheck/stats.total*100)}%)`);
  console.log(`  - 개선 필요: ${stats.needsImprovement}개`);
  console.log(`\n  [Critical APIs]`);
  console.log(`  - 총: ${stats.critical.total}개`);
  console.log(`  - 보호됨: ${stats.critical.withCheck}개`);
  console.log(`  - 취약: ${stats.critical.withoutCheck}개`);
  console.log(`  - 수정됨: ${stats.modified}개`);
  console.log('='.repeat(50));
  
  if (stats.critical.withoutCheck === 0) {
    console.log('\n✅ Wave 0 - Task 3 완료!');
    console.log('✅ 모든 Critical API가 세션 검사로 보호됨');
  } else if (stats.modified > 0) {
    console.log('\n✅ Wave 0 - Task 3 부분 완료');
    console.log(`📝 ${stats.modified}개 Critical API에 세션 검사 추가됨`);
  } else {
    console.log('\n⚠️ 수동 작업 필요');
    console.log('📝 Critical API에 세션 검사를 수동으로 추가하세요');
  }
  
  // coverage 업데이트
  await updateCoverage(stats);
}

// coverage.md 업데이트
async function updateCoverage(stats) {
  const coveragePath = path.resolve(__dirname, '../../docs/security/coverage.md');
  try {
    let content = await fs.readFile(coveragePath, 'utf-8');
    
    // 실시간 로그 추가
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const percentage = Math.round(stats.withSessionCheck / stats.total * 100);
    const logEntry = `- ${now} - Wave 0 Task 3: 세션 검사 ${stats.withSessionCheck}/${stats.total} (${percentage}%) 완료`;
    
    content = content.replace(
      /### 2025-01-23\n(.*)/s,
      `### 2025-01-23\n$1\n${logEntry}`
    );
    
    await fs.writeFile(coveragePath, content, 'utf-8');
    console.log('\n📊 coverage.md 업데이트 완료');
  } catch (error) {
    console.error('⚠️ coverage.md 업데이트 실패:', error.message);
  }
}

// 실행
main().catch(console.error);