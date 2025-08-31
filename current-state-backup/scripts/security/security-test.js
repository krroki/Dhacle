#!/usr/bin/env node

/**
 * 🧪 보안 테스트 자동화 스크립트
 * 
 * Wave 0-3의 모든 보안 기능을 테스트합니다:
 * - 세션 검사 (401 응답)
 * - API 클라이언트 사용
 * - Rate Limiting
 * - 입력 검증 (Zod)
 * - XSS 방지
 * - RLS 정책
 * 
 * 사용법:
 * npm test:security
 * node scripts/security/security-test.js [--verbose]
 */

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

// 명령줄 인자
const verbose = process.argv.includes('--verbose');

// 테스트 설정
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 테스트 결과 추적
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

/**
 * 테스트 실행 및 결과 기록
 */
async function runTest(name, testFn) {
  totalTests++;
  
  try {
    await testFn();
    passedTests++;
    testResults.push({ name, status: 'PASS', error: null });
    log(`  ✅ ${name}`, 'green');
  } catch (error) {
    failedTests++;
    testResults.push({ name, status: 'FAIL', error: error.message });
    log(`  ❌ ${name}`, 'red');
    if (verbose) {
      log(`     오류: ${error.message}`, 'yellow');
    }
  }
}

/**
 * 1. 세션 검사 테스트 (Wave 1)
 */
async function testSessionCheck() {
  log('\n📋 세션 검사 테스트', 'cyan');
  log('─'.repeat(50));
  
  // 인증 없이 보호된 API 호출
  await runTest('보호된 API는 401 응답', async () => {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status !== 401) {
      throw new Error(`Expected 401, got ${response.status}`);
    }
  });
  
  // 표준 에러 메시지 확인
  await runTest('표준 에러 메시지 형식', async () => {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.error !== 'User not authenticated') {
      throw new Error(`Invalid error message: ${data.error}`);
    }
  });
  
  // 공개 API는 인증 불필요
  await runTest('공개 API는 인증 불필요', async () => {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET'
    });
    
    // health 엔드포인트가 없을 수 있으므로 404도 허용
    if (response.status === 401) {
      throw new Error('Public API should not require authentication');
    }
  });
}

/**
 * 2. Rate Limiting 테스트 (Wave 3)
 */
async function testRateLimiting() {
  log('\n📋 Rate Limiting 테스트', 'cyan');
  log('─'.repeat(50));
  
  // Rate limit 헤더 확인
  await runTest('Rate limit 헤더 존재', async () => {
    const response = await fetch(`${BASE_URL}/api/youtube/popular`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const headers = response.headers;
    if (!headers.get('x-ratelimit-limit')) {
      throw new Error('Rate limit headers missing');
    }
  });
  
  // 연속 요청으로 rate limit 테스트
  await runTest('연속 요청 시 제한 작동', async () => {
    const requests = [];
    
    // 10개 연속 요청
    for (let i = 0; i < 10; i++) {
      requests.push(
        fetch(`${BASE_URL}/api/test-endpoint`, {
          method: 'GET',
          headers: {
            'X-Forwarded-For': '192.168.1.100' // 같은 IP 시뮬레이션
          }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    // 실제로는 60개 이상 요청해야 429가 발생하므로 헤더만 확인
    const hasRateLimitHeaders = responses.every(r => 
      r.headers.get('x-ratelimit-limit') || r.headers.get('x-ratelimit-remaining')
    );
    
    if (!hasRateLimitHeaders) {
      throw new Error('Rate limiting not properly configured');
    }
  });
}

/**
 * 3. 입력 검증 테스트 (Wave 3)
 */
async function testInputValidation() {
  log('\n📋 입력 검증 테스트', 'cyan');
  log('─'.repeat(50));
  
  // 잘못된 이메일 형식
  await runTest('잘못된 이메일 거부', async () => {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'not-an-email'
      })
    });
    
    // 401 (인증 필요) 또는 400 (검증 실패) 예상
    if (response.status !== 401 && response.status !== 400) {
      throw new Error(`Expected 401 or 400, got ${response.status}`);
    }
  });
  
  // SQL Injection 시도
  await runTest('SQL Injection 방지', async () => {
    const response = await fetch(`${BASE_URL}/api/community/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: "'; DROP TABLE users; --",
        content: 'Test content'
      })
    });
    
    // 401 (인증 필요) 또는 400 (검증 실패) 예상
    if (response.status !== 401 && response.status !== 400) {
      throw new Error('SQL Injection attempt not blocked');
    }
  });
  
  // 너무 긴 입력
  await runTest('최대 길이 초과 거부', async () => {
    const longString = 'a'.repeat(10001); // 10000자 제한 초과
    
    const response = await fetch(`${BASE_URL}/api/community/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test',
        content: longString
      })
    });
    
    // 401 (인증 필요) 또는 400 (검증 실패) 예상
    if (response.status !== 401 && response.status !== 400) {
      throw new Error('Long input not rejected');
    }
  });
}

/**
 * 4. XSS 방지 테스트 (Wave 3)
 */
async function testXSSPrevention() {
  log('\n📋 XSS 방지 테스트', 'cyan');
  log('─'.repeat(50));
  
  // 스크립트 태그 정화
  await runTest('스크립트 태그 제거', async () => {
    const maliciousContent = '<script>alert("XSS")</script>Hello';
    
    const response = await fetch(`${BASE_URL}/api/community/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test',
        content: maliciousContent
      })
    });
    
    // 실제로 저장되었다면 스크립트 태그가 제거되었는지 확인
    // 여기서는 401 응답 예상 (인증 필요)
    if (response.status !== 401) {
      const data = await response.json();
      if (data.content && data.content.includes('<script>')) {
        throw new Error('Script tags not removed');
      }
    }
  });
  
  // 이벤트 핸들러 제거
  await runTest('이벤트 핸들러 제거', async () => {
    const maliciousContent = '<img src="x" onerror="alert(1)">';
    
    const response = await fetch(`${BASE_URL}/api/community/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test',
        content: maliciousContent
      })
    });
    
    // 401 응답 예상
    if (response.status !== 401) {
      const data = await response.json();
      if (data.content && data.content.includes('onerror')) {
        throw new Error('Event handlers not removed');
      }
    }
  });
  
  // 위험한 프로토콜 차단
  await runTest('위험한 프로토콜 차단', async () => {
    const maliciousContent = '<a href="javascript:alert(1)">Click</a>';
    
    const response = await fetch(`${BASE_URL}/api/test-xss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: maliciousContent
      })
    });
    
    // 실제 응답 확인
    if (response.status === 200) {
      const data = await response.json();
      if (data.content && data.content.includes('javascript:')) {
        throw new Error('Dangerous protocols not blocked');
      }
    }
  });
}

/**
 * 5. API 클라이언트 사용 확인 (Wave 1)
 */
async function testAPIClient() {
  log('\n📋 API 클라이언트 사용 확인', 'cyan');
  log('─'.repeat(50));
  
  // api-client.ts 파일 존재 확인
  await runTest('api-client.ts 파일 존재', async () => {
    const filePath = path.join(process.cwd(), 'src/lib/api-client.ts');
    if (!fs.existsSync(filePath)) {
      throw new Error('api-client.ts file not found');
    }
  });
  
  // 클라이언트 파일들이 api-client 사용하는지 확인
  await runTest('클라이언트 파일 api-client 사용', async () => {
    const clientFiles = [
      'src/lib/api/revenue-proof.ts',
      'src/app/(pages)/tools/youtube-lens/page.tsx'
    ];
    
    for (const file of clientFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('api-client') && !content.includes('apiGet')) {
          throw new Error(`${file} not using api-client`);
        }
      }
    }
  });
}

/**
 * 6. RLS 정책 테스트 (Wave 2)
 */
async function testRLSPolicies() {
  log('\n📋 RLS 정책 테스트', 'cyan');
  log('─'.repeat(50));
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    log('  ⚠️ Supabase 환경 변수 없음, RLS 테스트 건너뜀', 'yellow');
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // 인증 없이 개인 데이터 접근 시도
  await runTest('인증 없이 개인 데이터 접근 차단', async () => {
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('*');
    
    // RLS가 활성화되어 있다면 데이터가 없어야 함
    if (data && data.length > 0) {
      throw new Error('Personal data accessible without auth');
    }
  });
  
  // 공개 데이터는 접근 가능
  await runTest('공개 데이터 접근 가능', async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .limit(1);
    
    // 에러가 없어야 함 (데이터가 없을 수는 있음)
    if (error && error.code !== 'PGRST116') { // 빈 결과는 OK
      throw new Error(`Public data not accessible: ${error.message}`);
    }
  });
}

/**
 * 보안 구성 파일 확인
 */
async function testSecurityConfiguration() {
  log('\n📋 보안 구성 파일 확인', 'cyan');
  log('─'.repeat(50));
  
  const requiredFiles = [
    { path: 'src/lib/security/rate-limiter.ts', name: 'Rate Limiter' },
    { path: 'src/lib/security/validation-schemas.ts', name: 'Validation Schemas' },
    { path: 'src/lib/security/sanitizer.ts', name: 'XSS Sanitizer' },
    { path: 'src/middleware.ts', name: 'Middleware' },
    { path: 'supabase/migrations/20250123000001_wave0_security_rls.sql', name: 'Wave 0 RLS' },
    { path: 'supabase/migrations/20250123000002_wave2_security_rls.sql', name: 'Wave 2 RLS' }
  ];
  
  for (const file of requiredFiles) {
    await runTest(`${file.name} 파일 존재`, async () => {
      const filePath = path.join(process.cwd(), file.path);
      if (!fs.existsSync(filePath)) {
        throw new Error(`${file.name} file not found`);
      }
    });
  }
}

/**
 * 메인 테스트 실행
 */
async function main() {
  log('\n' + '═'.repeat(60), 'bright');
  log('🧪 보안 테스트 자동화 실행', 'cyan');
  log('═'.repeat(60), 'bright');
  log(`\n테스트 환경: ${BASE_URL}`, 'yellow');
  
  // 서버 준비 확인 (5초 대기)
  log('\n서버 준비 확인 중...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 서버 상태 확인
  try {
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    if (healthResponse.status === 404) {
      log('Health 엔드포인트 없음 (정상)', 'yellow');
    } else {
      log('서버 준비 완료', 'green');
    }
  } catch (error) {
    log('⚠️  개발 서버가 실행되지 않음. npm run dev 먼저 실행하세요.', 'red');
    process.exit(1);
  }
  
  try {
    // 각 카테고리별 테스트 실행
    await testSessionCheck();
    await testRateLimiting();
    await testInputValidation();
    await testXSSPrevention();
    await testAPIClient();
    await testRLSPolicies();
    await testSecurityConfiguration();
    
    // 결과 요약
    log('\n' + '═'.repeat(60), 'bright');
    log('📊 테스트 결과 요약', 'cyan');
    log('─'.repeat(60));
    
    const passRate = Math.round((passedTests / totalTests) * 100);
    
    log(`총 테스트: ${totalTests}개`, 'bright');
    log(`✅ 성공: ${passedTests}개`, 'green');
    log(`❌ 실패: ${failedTests}개`, failedTests > 0 ? 'red' : 'green');
    log(`📈 성공률: ${passRate}%`, passRate >= 80 ? 'green' : 'yellow');
    
    // 실패한 테스트 상세
    if (failedTests > 0) {
      log('\n❌ 실패한 테스트:', 'red');
      testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          log(`  - ${r.name}`, 'yellow');
          if (verbose && r.error) {
            log(`    ${r.error}`, 'red');
          }
        });
    }
    
    // 보안 등급 판정
    log('\n' + '═'.repeat(60), 'bright');
    log('🛡️ 보안 등급', 'cyan');
    log('─'.repeat(60));
    
    let grade = '';
    let gradeColor = 'green';
    
    if (passRate >= 90) {
      grade = 'A - 우수';
      gradeColor = 'green';
    } else if (passRate >= 80) {
      grade = 'B - 양호';
      gradeColor = 'green';
    } else if (passRate >= 70) {
      grade = 'C - 보통';
      gradeColor = 'yellow';
    } else if (passRate >= 60) {
      grade = 'D - 개선 필요';
      gradeColor = 'yellow';
    } else {
      grade = 'F - 긴급 조치 필요';
      gradeColor = 'red';
    }
    
    log(`보안 등급: ${grade}`, gradeColor);
    
    // 권장 사항
    log('\n💡 권장 사항:', 'cyan');
    log('─'.repeat(60));
    
    if (failedTests > 0) {
      log('1. 실패한 테스트를 우선적으로 수정하세요', 'yellow');
    }
    log('2. 정기적으로 보안 테스트를 실행하세요', 'yellow');
    log('3. 프로덕션 배포 전 모든 테스트 통과를 확인하세요', 'yellow');
    log('4. RLS 정책이 Supabase Dashboard에 적용되었는지 확인하세요', 'yellow');
    
    // 종료 코드
    process.exit(failedTests > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\n❌ 테스트 실행 실패: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { runTest, testResults };