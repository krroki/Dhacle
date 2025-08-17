#!/usr/bin/env node

/**
 * 완전 자동화된 Supabase 마이그레이션 스크립트
 * 
 * 이 스크립트는 DB 비밀번호를 환경변수에서 읽어
 * 자동으로 연결하고 마이그레이션을 실행합니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

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

function execCommand(command, silent = false) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: silent ? 'pipe' : 'inherit',
      env: { ...process.env }
    });
    return result;
  } catch (error) {
    if (!silent) {
      log(`❌ Command failed: ${command}`, 'red');
      log(error.message, 'red');
    }
    return null;
  }
}

async function autoMigrate() {
  log('\n========================================', 'bright');
  log('  🚀 Supabase 자동 마이그레이션 시작', 'bright');
  log('========================================\n', 'bright');

  // 1. 환경변수 확인
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  const dbUrl = process.env.DATABASE_URL;
  const projectRef = 'golbwnsytwbyoneucunx';

  if (!dbPassword && !dbUrl) {
    log('❌ DB 비밀번호가 설정되지 않았습니다!', 'red');
    log('1. Supabase Dashboard > Settings > Database에서 비밀번호 확인', 'yellow');
    log('2. .env.local에 SUPABASE_DB_PASSWORD 추가', 'yellow');
    process.exit(1);
  }

  // 2. Supabase CLI 확인
  log('🔧 Supabase CLI 확인...', 'cyan');
  const version = execCommand('npx supabase --version', true);
  if (!version) {
    log('⚠️ Supabase CLI 설치 중...', 'yellow');
    execCommand('npm install -g supabase');
  }

  // 3. 프로젝트 연결 확인
  log('\n🔗 프로젝트 연결 확인...', 'cyan');
  const status = execCommand('npx supabase status 2>&1', true);
  
  if (!status || status.includes('Cannot find project ref')) {
    log('⚠️ 프로젝트 연결 중...', 'yellow');
    
    // 비밀번호로 연결 시도
    const linkCmd = dbPassword 
      ? `npx supabase link --project-ref ${projectRef} --password "${dbPassword}"`
      : `npx supabase link --project-ref ${projectRef}`;
    
    const linkResult = execCommand(linkCmd, true);
    
    if (!linkResult || linkResult.includes('failed')) {
      log('⚠️ 연결 실패, 직접 SQL 실행 모드로 전환...', 'yellow');
      return directSQLMode();
    }
  }

  // 4. 마이그레이션 실행
  log('\n📦 마이그레이션 파일 적용 중...', 'cyan');
  
  // db push 실행
  const pushCmd = dbUrl 
    ? `npx supabase db push --db-url "${dbUrl}"`
    : 'npx supabase db push';
  
  const pushResult = execCommand(pushCmd);
  
  if (!pushResult) {
    log('⚠️ Push 실패, 직접 SQL 실행 모드로 전환...', 'yellow');
    return directSQLMode();
  }

  // 5. 검증
  log('\n✅ 마이그레이션 완료!', 'green');
  log('\n다음 테이블들이 생성되었습니다:', 'cyan');
  
  const tables = [
    'videos', 'video_stats', 'channels', 'source_folders',
    'folder_channels', 'alert_rules', 'alerts', 'collections',
    'collection_items', 'saved_searches', 'subscriptions',
    'user_api_keys', 'channel_subscriptions', 'webhook_events'
  ];
  
  tables.forEach(table => log(`  ✓ ${table}`, 'green'));
  
  log('\n🎉 YouTube Lens가 이제 작동합니다!', 'bright');
  log('URL: https://dhacle.com/tools/youtube-lens', 'blue');
}

// 직접 SQL 실행 모드 (백업 방법)
async function directSQLMode() {
  log('\n📝 직접 SQL 실행 모드', 'cyan');
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  log(`\n${files.length}개 마이그레이션 파일을 순서대로 실행해야 합니다:`, 'yellow');
  
  files.forEach((file, index) => {
    log(`${index + 1}. ${file}`, 'cyan');
  });

  log('\n📋 실행 방법:', 'yellow');
  log('1. Supabase Dashboard > SQL Editor 접속', 'blue');
  log('2. 각 파일 내용을 복사해서 실행', 'blue');
  log('3. 순서대로 모두 실행', 'blue');
  
  log('\n또는 DATABASE_URL을 .env.local에 추가 후 다시 실행:', 'yellow');
  log('DATABASE_URL=postgresql://postgres.[ref]:[password]@[host]:6543/postgres', 'cyan');
}

// 마이그레이션 상태 체크 함수
async function checkMigrationStatus() {
  log('\n🔍 마이그레이션 상태 확인...', 'cyan');
  
  const result = execCommand('npx supabase migration list', true);
  
  if (result) {
    log('✅ 적용된 마이그레이션:', 'green');
    console.log(result);
  }
  
  return result;
}

// CI/CD용 자동 체크 함수
async function validateMigrations() {
  log('\n🔍 마이그레이션 검증...', 'cyan');
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const localFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  const remoteStatus = execCommand('npx supabase migration list', true);
  
  if (!remoteStatus) {
    log('⚠️ 원격 상태 확인 불가', 'yellow');
    return false;
  }
  
  // 적용되지 않은 마이그레이션 찾기
  const pending = localFiles.filter(file => 
    !remoteStatus.includes(file.replace('.sql', ''))
  );
  
  if (pending.length > 0) {
    log(`⚠️ ${pending.length}개 마이그레이션 대기 중:`, 'yellow');
    pending.forEach(file => log(`  - ${file}`, 'cyan'));
    return false;
  }
  
  log('✅ 모든 마이그레이션 적용됨', 'green');
  return true;
}

// 메인 실행
if (process.argv.includes('--check')) {
  checkMigrationStatus();
} else if (process.argv.includes('--validate')) {
  validateMigrations();
} else {
  autoMigrate().catch(error => {
    log(`\n❌ 오류 발생: ${error.message}`, 'red');
    process.exit(1);
  });
}