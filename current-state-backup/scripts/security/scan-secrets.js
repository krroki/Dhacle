#!/usr/bin/env node

/**
 * 🔐 비밀키 스캔 스크립트
 * Wave 2: 하드코딩된 비밀키 및 민감정보 탐지
 * 
 * 사용법:
 * node scripts/security/scan-secrets.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 스캔할 파일 패턴
const FILE_PATTERNS = [
  'src/**/*.{js,jsx,ts,tsx}',
  'app/**/*.{js,jsx,ts,tsx}',
  'pages/**/*.{js,jsx,ts,tsx}',
  'lib/**/*.{js,jsx,ts,tsx}',
  'components/**/*.{js,jsx,ts,tsx}',
  'scripts/**/*.js',
  '*.{js,json,env}',
];

// 제외할 디렉토리
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'coverage',
];

// 민감한 패턴 정의
const SECRET_PATTERNS = [
  // API 키 패턴
  {
    name: 'Generic API Key',
    pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]|(?:api[_-]?key|apikey)['"]?\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})/gi,
    severity: 'HIGH',
  },
  // Supabase 키
  {
    name: 'Supabase Service Role Key',
    pattern: /(?:service[_-]?role[_-]?key|SUPABASE_SERVICE_ROLE_KEY)\s*[:=]\s*['"]?(eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+)/gi,
    severity: 'CRITICAL',
  },
  {
    name: 'Supabase Anon Key (Public)',
    pattern: /(?:anon[_-]?key|SUPABASE_ANON_KEY)\s*[:=]\s*['"]?(eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+)/gi,
    severity: 'LOW', // Anon key는 공개 가능
  },
  // JWT 토큰
  {
    name: 'JWT Token',
    pattern: /(?:jwt|token|bearer)\s*[:=]\s*['"]?(eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+)/gi,
    severity: 'HIGH',
  },
  // 데이터베이스 URL
  {
    name: 'Database URL',
    pattern: /(?:database[_-]?url|DATABASE_URL|db[_-]?url)\s*[:=]\s*['"]?(postgres(?:ql)?:\/\/[^'"}\s]+)/gi,
    severity: 'CRITICAL',
  },
  // 비밀번호 패턴
  {
    name: 'Hardcoded Password',
    pattern: /(?:password|passwd|pwd|pass)\s*[:=]\s*['"]([^'"]{8,})['"](?!\s*\|\|)/gi,
    severity: 'CRITICAL',
  },
  // OAuth 시크릿
  {
    name: 'OAuth Secret',
    pattern: /(?:client[_-]?secret|oauth[_-]?secret|app[_-]?secret)\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})/gi,
    severity: 'CRITICAL',
  },
  // Stripe/Payment 키
  {
    name: 'Payment API Key',
    pattern: /(?:stripe|payment|toss)[_-]?(?:key|secret|token)\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})/gi,
    severity: 'CRITICAL',
  },
  // AWS 키
  {
    name: 'AWS Access Key',
    pattern: /(?:aws[_-]?access[_-]?key[_-]?id|AWS_ACCESS_KEY_ID)\s*[:=]\s*['"]?(AKIA[0-9A-Z]{16})/gi,
    severity: 'CRITICAL',
  },
  // Private Key
  {
    name: 'Private Key',
    pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
    severity: 'CRITICAL',
  },
  // 환경변수 직접 사용 (process.env 제외)
  {
    name: 'Direct Env Variable',
    pattern: /(?<!process\.env\.)[A-Z_]{5,}(?:_KEY|_SECRET|_TOKEN|_PASSWORD)\s*=\s*['"]([^'"]+)['"]/g,
    severity: 'MEDIUM',
  },
];

// 화이트리스트 (허용되는 패턴)
const WHITELIST_PATTERNS = [
  /process\.env\./,
  /import\.meta\.env\./,
  /example\.(com|org|net)/i,
  /test[_-]?key/i,
  /mock[_-]?secret/i,
  /placeholder/i,
  /your[_-]?api[_-]?key/i,
  /xxx+/i,
];

// 파일 스캔
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const findings = [];
  
  SECRET_PATTERNS.forEach(secretPattern => {
    lines.forEach((line, lineIndex) => {
      // 주석 라인 스킵
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('#')) {
        return;
      }
      
      // 화이트리스트 체크
      const isWhitelisted = WHITELIST_PATTERNS.some(pattern => pattern.test(line));
      if (isWhitelisted) {
        return;
      }
      
      const matches = line.matchAll(secretPattern.pattern);
      for (const match of matches) {
        findings.push({
          file: filePath,
          line: lineIndex + 1,
          column: match.index + 1,
          pattern: secretPattern.name,
          severity: secretPattern.severity,
          content: line.trim().substring(0, 100),
          match: match[1] || match[0],
        });
      }
    });
  });
  
  return findings;
}

// 전체 프로젝트 스캔
function scanProject() {
  console.log('🔍 비밀키 스캔 시작...\n');
  
  const allFindings = [];
  let fileCount = 0;
  
  FILE_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: EXCLUDE_DIRS.map(dir => `**/${dir}/**`),
    });
    
    files.forEach(file => {
      fileCount++;
      const findings = scanFile(file);
      allFindings.push(...findings);
    });
  });
  
  console.log(`📊 스캔 완료: ${fileCount}개 파일 검사\n`);
  
  return allFindings;
}

// 결과 출력
function reportFindings(findings) {
  if (findings.length === 0) {
    console.log('✅ 하드코딩된 비밀키를 찾지 못했습니다!\n');
    return;
  }
  
  console.log(`⚠️ ${findings.length}개의 잠재적 비밀키 발견:\n`);
  
  // 심각도별 그룹화
  const bySeverity = {
    CRITICAL: [],
    HIGH: [],
    MEDIUM: [],
    LOW: [],
  };
  
  findings.forEach(finding => {
    bySeverity[finding.severity].push(finding);
  });
  
  // 심각도별 출력
  Object.entries(bySeverity).forEach(([severity, items]) => {
    if (items.length === 0) return;
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚨 ${severity} (${items.length}개)`);
    console.log('='.repeat(50));
    
    items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.pattern}`);
      console.log(`   📁 파일: ${item.file}:${item.line}:${item.column}`);
      console.log(`   📝 내용: ${item.content}`);
      console.log(`   🔑 매치: ${item.match.substring(0, 20)}...`);
    });
  });
  
  // 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 요약:');
  console.log('='.repeat(50));
  console.log(`CRITICAL: ${bySeverity.CRITICAL.length}개`);
  console.log(`HIGH: ${bySeverity.HIGH.length}개`);
  console.log(`MEDIUM: ${bySeverity.MEDIUM.length}개`);
  console.log(`LOW: ${bySeverity.LOW.length}개`);
  
  // 권장 사항
  console.log('\n💡 권장 사항:');
  console.log('1. CRITICAL/HIGH 항목은 즉시 환경변수로 이동');
  console.log('2. 하드코딩된 값을 process.env로 교체');
  console.log('3. .env.local에 실제 값 저장');
  console.log('4. .gitignore에 .env.local 포함 확인');
  
  return bySeverity.CRITICAL.length > 0 || bySeverity.HIGH.length > 0;
}

// .env 파일 체크
function checkEnvFiles() {
  console.log('\n🔐 환경변수 파일 체크...\n');
  
  const envFiles = ['.env', '.env.local', '.env.production'];
  const issues = [];
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} 파일 존재`);
      
      // .gitignore 체크
      const gitignorePath = '.gitignore';
      if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf8');
        if (!gitignore.includes(file) && file !== '.env.local') {
          issues.push(`⚠️ ${file}이 .gitignore에 포함되지 않음`);
        }
      }
    }
  });
  
  if (issues.length > 0) {
    console.log('\n⚠️ 발견된 문제:');
    issues.forEach(issue => console.log(issue));
  }
}

// 메인 실행
function main() {
  console.log('🔐 보안 스캔 도구 v1.0');
  console.log('='.repeat(50));
  
  // 1. 비밀키 스캔
  const findings = scanProject();
  const hasCritical = reportFindings(findings);
  
  // 2. 환경변수 파일 체크
  checkEnvFiles();
  
  // 3. 종료 코드
  if (hasCritical) {
    console.log('\n❌ CRITICAL/HIGH 보안 이슈가 발견되었습니다!');
    process.exit(1);
  } else {
    console.log('\n✅ 심각한 보안 이슈가 발견되지 않았습니다.');
    process.exit(0);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { scanFile, scanProject, reportFindings };