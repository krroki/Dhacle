#!/usr/bin/env node
/**
 * 🚀 실제로 작동하는 SQL 실행 스크립트
 * 
 * 복잡한 CLI 대신 단순하게 SQL을 프로덕션에 실행합니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// 색상
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function main() {
  const sqlFile = process.argv[2];
  
  if (!sqlFile) {
    log('❌ SQL 파일을 지정하세요', 'red');
    log('사용법: npm run sql:apply supabase/migrations/파일명.sql', 'yellow');
    process.exit(1);
  }
  
  if (!fs.existsSync(sqlFile)) {
    log(`❌ 파일이 없습니다: ${sqlFile}`, 'red');
    process.exit(1);
  }
  
  log(`📄 SQL 파일: ${sqlFile}`, 'blue');
  log('🚀 프로덕션 DB에 실행 중...', 'yellow');
  
  try {
    // supabase-sql-executor.js 사용
    const result = execSync(
      `node scripts/supabase-sql-executor.js --method pg --file ${sqlFile}`,
      { stdio: 'inherit' }
    );
    
    log('✅ SQL 실행 완료!', 'green');
    log('', 'reset');
    log('다음 단계:', 'yellow');
    log('1. npm run prod:check - 상태 확인', 'blue');
    log('2. git add . && git commit -m "feat: SQL migration" && git push', 'blue');
    log('3. npm run deploy:vercel - 배포', 'blue');
    
  } catch (error) {
    log(`❌ SQL 실행 실패: ${error.message}`, 'red');
    log('', 'reset');
    log('해결 방법:', 'yellow');
    log('1. Supabase Dashboard에서 직접 실행', 'blue');
    log('2. https://supabase.com/dashboard/project/golbwnsytwbyoneucunx/sql/new', 'blue');
    process.exit(1);
  }
}

main();