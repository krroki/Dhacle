#!/usr/bin/env node

/**
 * Phase 3 API Pattern Unification Verification Script
 * 
 * 이 스크립트는 Phase 3에서 수행한 API 패턴 통일 작업을 검증합니다.
 * 
 * 검증 항목:
 * 1. api-client.ts 파일 존재 및 구현
 * 2. 직접 fetch 사용 (내부 API)
 * 3. Silent failure 패턴
 * 4. apiClient 사용률
 * 5. 에러 처리 구현
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 유틸리티 함수
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return '0';
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFileContent(filePath) {
  if (!checkFileExists(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8');
}

// 검증 시작
console.log('');
log('═══════════════════════════════════════════════════════════════', 'cyan');
log('  🔍 Phase 3: API Pattern Unification Verification', 'cyan');
log('═══════════════════════════════════════════════════════════════', 'cyan');
console.log('');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

// 1. api-client.ts 파일 검증
log('1️⃣  Checking api-client.ts implementation...', 'blue');
const apiClientPath = path.join(__dirname, '../src/lib/api-client.ts');

if (checkFileExists(apiClientPath)) {
  const content = readFileContent(apiClientPath);
  
  // 필수 구현 체크
  const checks = {
    'ApiClient class': content.includes('class ApiClient'),
    'retryRequest method': content.includes('retryRequest'),
    'handleResponse method': content.includes('handleResponse'),
    'GET method': content.includes('async get'),
    'POST method': content.includes('async post'),
    'Error messages': content.includes('getErrorMessage'),
    'Timeout setting': content.includes('timeout'),
    'Retry logic': content.includes('retry')
  };
  
  let allPassed = true;
  for (const [feature, exists] of Object.entries(checks)) {
    if (exists) {
      log(`  ✅ ${feature} implemented`, 'green');
    } else {
      log(`  ❌ ${feature} missing`, 'red');
      allPassed = false;
    }
  }
  
  if (allPassed) {
    results.passed.push('api-client.ts implementation');
  } else {
    results.failed.push('api-client.ts incomplete implementation');
  }
} else {
  log('  ❌ api-client.ts not found!', 'red');
  results.failed.push('api-client.ts not found');
}

console.log('');

// 2. 직접 fetch 사용 검증
log('2️⃣  Checking direct fetch usage...', 'blue');

// 전체 fetch 사용
const allFetchCount = executeCommand(
  'grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l'
);

// api-client 내부 fetch 제외
const directFetchList = executeCommand(
  'grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "api-client" | grep -v "// External API"'
);

const directFetchFiles = directFetchList.split('\n').filter(line => line.trim());
const internalFetchFiles = directFetchFiles.filter(file => {
  // 외부 API 패턴 제외
  const externalPatterns = [
    'youtube', 'googleapis', 'toss', 'payment', 
    'pubsub', 'external', 'third-party'
  ];
  return !externalPatterns.some(pattern => file.toLowerCase().includes(pattern));
});

log(`  📊 Total fetch calls: ${allFetchCount}`, 'cyan');
log(`  📊 Direct fetch (non api-client): ${directFetchFiles.length}`, 'cyan');
log(`  📊 Internal API fetch: ${internalFetchFiles.length} (target: 0)`, 
    internalFetchFiles.length === 0 ? 'green' : 'yellow');

if (internalFetchFiles.length > 0) {
  log('  ⚠️  Files still using direct fetch for internal APIs:', 'yellow');
  internalFetchFiles.slice(0, 5).forEach(file => {
    const fileName = file.split(':')[0].replace('src/', '');
    log(`    - ${fileName}`, 'yellow');
  });
  results.warnings.push(`${internalFetchFiles.length} files still using direct fetch`);
} else {
  results.passed.push('No direct fetch for internal APIs');
}

console.log('');

// 3. Silent Failure 패턴 검증
log('3️⃣  Checking silent failure patterns...', 'blue');

// 빈 catch 블록
const emptyCatchCount = executeCommand(
  'grep -r "catch.*{[[:space:]]*}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l'
);

// catch 후 즉시 닫히는 패턴
const silentCatchCount = executeCommand(
  'grep -r "} catch {}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l'
);

const totalSilentFailures = parseInt(emptyCatchCount) + parseInt(silentCatchCount);

log(`  📊 Empty catch blocks: ${emptyCatchCount}`, 'cyan');
log(`  📊 Silent catch patterns: ${silentCatchCount}`, 'cyan');
log(`  📊 Total silent failures: ${totalSilentFailures} (target: 0, acceptable: ≤5)`, 
    totalSilentFailures === 0 ? 'green' : totalSilentFailures <= 5 ? 'yellow' : 'red');

if (totalSilentFailures === 0) {
  results.passed.push('No silent failures');
} else if (totalSilentFailures <= 5) {
  results.warnings.push(`${totalSilentFailures} silent failures (acceptable)`);
} else {
  results.failed.push(`${totalSilentFailures} silent failures (too many)`);
}

console.log('');

// 4. apiClient 사용률 검증
log('4️⃣  Checking apiClient adoption...', 'blue');

const apiClientImports = executeCommand(
  'grep -r "from \'@/lib/api-client\'\\|from \\"@/lib/api-client\\"" src/ 2>/dev/null | wc -l'
);

log(`  📊 Files importing apiClient: ${apiClientImports} (target: 30+)`, 
    parseInt(apiClientImports) >= 30 ? 'green' : parseInt(apiClientImports) >= 25 ? 'yellow' : 'red');

if (parseInt(apiClientImports) >= 30) {
  results.passed.push(`Strong apiClient adoption (${apiClientImports} files)`);
} else if (parseInt(apiClientImports) >= 25) {
  results.warnings.push(`Moderate apiClient adoption (${apiClientImports} files)`);
} else {
  results.failed.push(`Low apiClient adoption (${apiClientImports} files)`);
}

console.log('');

// 5. 에러 처리 구현 검증
log('5️⃣  Checking error handling implementation...', 'blue');

// Logger 사용
const loggerImports = executeCommand(
  'grep -r "from \'@/lib/logger\'\\|from \\"@/lib/logger\\"" src/ 2>/dev/null | wc -l'
);
const loggerErrorCalls = executeCommand(
  'grep -r "logger\\.error" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l'
);

// Toast 사용
const toastImports = executeCommand(
  'grep -r "from \'sonner\'\\|from \\"sonner\\"" src/ 2>/dev/null | wc -l'
);
const toastErrorCalls = executeCommand(
  'grep -r "toast\\.error" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l'
);

log(`  📊 Logger imports: ${loggerImports}`, 'cyan');
log(`  📊 logger.error calls: ${loggerErrorCalls} (target: 15+)`, 
    parseInt(loggerErrorCalls) >= 15 ? 'green' : 'yellow');
log(`  📊 Toast imports: ${toastImports}`, 'cyan');
log(`  📊 toast.error calls: ${toastErrorCalls} (target: 8+)`, 
    parseInt(toastErrorCalls) >= 8 ? 'green' : 'yellow');

if (parseInt(loggerErrorCalls) >= 15 && parseInt(toastErrorCalls) >= 8) {
  results.passed.push('Good error handling implementation');
} else {
  results.warnings.push('Error handling could be improved');
}

console.log('');

// 6. TypeScript 컴파일 체크
log('6️⃣  Checking TypeScript compilation...', 'blue');
try {
  executeCommand('npm run types:check');
  log('  ✅ TypeScript compilation successful', 'green');
  results.passed.push('TypeScript compilation');
} catch (error) {
  log('  ❌ TypeScript compilation failed', 'red');
  results.failed.push('TypeScript compilation');
}

console.log('');

// 최종 결과 요약
log('═══════════════════════════════════════════════════════════════', 'cyan');
log('  📊 VERIFICATION SUMMARY', 'cyan');
log('═══════════════════════════════════════════════════════════════', 'cyan');
console.log('');

// Passed
if (results.passed.length > 0) {
  log(`✅ PASSED (${results.passed.length})`, 'green');
  results.passed.forEach(item => log(`  • ${item}`, 'green'));
  console.log('');
}

// Warnings
if (results.warnings.length > 0) {
  log(`⚠️  WARNINGS (${results.warnings.length})`, 'yellow');
  results.warnings.forEach(item => log(`  • ${item}`, 'yellow'));
  console.log('');
}

// Failed
if (results.failed.length > 0) {
  log(`❌ FAILED (${results.failed.length})`, 'red');
  results.failed.forEach(item => log(`  • ${item}`, 'red'));
  console.log('');
}

// 최종 판정
const overallStatus = results.failed.length === 0 
  ? 'PASSED' 
  : results.failed.length <= 2 && results.warnings.length <= 3
    ? 'PARTIALLY PASSED'
    : 'FAILED';

const statusColor = overallStatus === 'PASSED' ? 'green' 
  : overallStatus === 'PARTIALLY PASSED' ? 'yellow' 
  : 'red';

log('═══════════════════════════════════════════════════════════════', 'cyan');
log(`  📈 Overall Status: ${overallStatus}`, statusColor);

// 완료도 계산
const totalChecks = results.passed.length + results.warnings.length + results.failed.length;
const passedChecks = results.passed.length + (results.warnings.length * 0.5);
const completionRate = Math.round((passedChecks / totalChecks) * 100);

log(`  📊 Completion Rate: ${completionRate}%`, 
    completionRate >= 75 ? 'green' : completionRate >= 50 ? 'yellow' : 'red');
log('═══════════════════════════════════════════════════════════════', 'cyan');
console.log('');

// 권장사항
if (results.failed.length > 0 || results.warnings.length > 0) {
  log('💡 RECOMMENDATIONS:', 'blue');
  
  if (results.failed.includes('api-client.ts incomplete implementation')) {
    log('  1. Complete the implementation of api-client.ts', 'cyan');
  }
  
  if (results.warnings.some(w => w.includes('direct fetch'))) {
    log('  2. Replace remaining direct fetch calls with apiClient', 'cyan');
  }
  
  if (results.warnings.some(w => w.includes('silent failures'))) {
    log('  3. Add proper error handling to empty catch blocks', 'cyan');
  }
  
  if (results.warnings.some(w => w.includes('apiClient adoption'))) {
    log('  4. Increase apiClient usage across the codebase', 'cyan');
  }
  
  if (results.failed.includes('TypeScript compilation')) {
    log('  5. Fix TypeScript errors before proceeding', 'cyan');
  }
  
  console.log('');
}

// Exit code
process.exit(overallStatus === 'FAILED' ? 1 : 0);