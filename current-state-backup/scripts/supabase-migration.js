#!/usr/bin/env node

/**
 * Supabase Migration Automation Script
 * 
 * 목적: Supabase 마이그레이션 자동화 및 상태 검증
 * 사용: npm run supabase:migrate
 * 
 * 이 스크립트는 다음을 수행합니다:
 * 1. Supabase 프로젝트 연결 확인
 * 2. 마이그레이션 파일 검증
 * 3. 원격 DB에 마이그레이션 적용
 * 4. 테이블 생성 확인
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// 유틸리티 함수
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, silent = false) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    return result;
  } catch (error) {
    if (!silent) {
      log(`❌ Command failed: ${command}`, 'red');
      log(error.message, 'red');
    }
    return null;
  }
}

// 질문 함수
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// 환경 변수 확인
function checkEnvironment() {
  log('\n📋 환경 변수 확인...', 'cyan');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ENCRYPTION_KEY'
  ];

  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local 파일이 없습니다!', 'red');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  let allValid = true;

  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      log(`✅ ${varName} 설정됨`, 'green');
    } else {
      log(`❌ ${varName} 누락됨`, 'red');
      allValid = false;
    }
  });

  return allValid;
}

// Supabase CLI 설치 확인
function checkSupabaseCLI() {
  log('\n🔧 Supabase CLI 확인...', 'cyan');
  
  const version = execCommand('npx supabase --version', true);
  if (!version) {
    log('❌ Supabase CLI가 설치되지 않았습니다!', 'red');
    log('설치 명령: npm install -g supabase', 'yellow');
    return false;
  }
  
  log(`✅ Supabase CLI 버전: ${version.trim()}`, 'green');
  return true;
}

// 프로젝트 연결 확인
function checkProjectLink() {
  log('\n🔗 Supabase 프로젝트 연결 확인...', 'cyan');
  
  const status = execCommand('npx supabase status 2>&1', true);
  
  if (!status || status.includes('Cannot find project ref')) {
    log('⚠️ 프로젝트가 연결되지 않았습니다', 'yellow');
    return false;
  }
  
  log('✅ 프로젝트 연결됨', 'green');
  return true;
}

// 프로젝트 연결
async function linkProject() {
  log('\n🔗 Supabase 프로젝트 연결 중...', 'cyan');
  
  // PROJECT_REF 확인
  const projectRef = 'golbwnsytwbyoneucunx';
  log(`프로젝트 REF: ${projectRef}`, 'blue');
  
  // 연결 시도
  const linkResult = execCommand(`npx supabase link --project-ref ${projectRef}`, true);
  
  if (!linkResult) {
    log('❌ 프로젝트 연결 실패', 'red');
    log('수동으로 연결하세요: npx supabase link --project-ref golbwnsytwbyoneucunx', 'yellow');
    
    const answer = await askQuestion('수동으로 연결한 후 Enter를 누르세요...');
    return checkProjectLink();
  }
  
  log('✅ 프로젝트 연결 성공', 'green');
  return true;
}

// 마이그레이션 파일 확인
function checkMigrationFiles() {
  log('\n📁 마이그레이션 파일 확인...', 'cyan');
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    log('❌ migrations 디렉토리가 없습니다!', 'red');
    return false;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  log(`✅ ${files.length}개의 마이그레이션 파일 발견:`, 'green');
  
  // YouTube Lens 관련 파일 강조
  const youtubeFiles = files.filter(file => 
    file.includes('youtube') || 
    file.includes('user_api_keys') ||
    file.includes('complete_schema')
  );
  
  youtubeFiles.forEach(file => {
    log(`  🎬 ${file}`, 'yellow');
  });

  return true;
}

// 마이그레이션 실행
async function runMigrations() {
  log('\n🚀 마이그레이션 실행 중...', 'cyan');
  
  // DB URL 가져오기
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  
  if (!dbUrl) {
    log('⚠️ DATABASE_URL이 설정되지 않았습니다', 'yellow');
    log('Supabase Dashboard에서 Connection String을 복사하세요', 'yellow');
    
    const answer = await askQuestion('DB URL을 입력하세요 (또는 Enter로 건너뛰기): ');
    
    if (answer) {
      // 임시로 환경변수 설정
      process.env.DATABASE_URL = answer;
    } else {
      // 기본 push 명령 사용
      log('기본 push 명령을 사용합니다...', 'blue');
      const pushResult = execCommand('npx supabase db push');
      return pushResult !== null;
    }
  }
  
  const pushResult = execCommand(`npx supabase db push --db-url "${dbUrl}"`);
  return pushResult !== null;
}

// 테이블 확인
async function verifyTables() {
  log('\n🔍 테이블 생성 확인...', 'cyan');
  
  const requiredTables = [
    // YouTube Lens 핵심 테이블
    'videos',
    'video_stats',
    'channels',
    'source_folders',
    'folder_channels',
    'alert_rules',
    'alerts',
    'collections',
    'collection_items',
    'saved_searches',
    'subscriptions',
    'user_api_keys',
    'channel_subscriptions',
    'webhook_events'
  ];

  log('다음 테이블들이 생성되어야 합니다:', 'blue');
  requiredTables.forEach(table => {
    log(`  - ${table}`, 'cyan');
  });

  log('\n✅ Supabase Dashboard > Table Editor에서 확인하세요', 'green');
  log('URL: https://supabase.com/dashboard/project/golbwnsytwbyoneucunx/editor', 'blue');
  
  return true;
}

// 메인 실행 함수
async function main() {
  log('\n========================================', 'bright');
  log('  Supabase Migration Automation Tool', 'bright');
  log('========================================\n', 'bright');

  // 1. 환경 변수 확인
  if (!checkEnvironment()) {
    log('\n❌ 환경 변수를 먼저 설정하세요', 'red');
    process.exit(1);
  }

  // 2. Supabase CLI 확인
  if (!checkSupabaseCLI()) {
    process.exit(1);
  }

  // 3. 프로젝트 연결 확인
  let isLinked = checkProjectLink();
  
  // 4. 연결되지 않았으면 연결
  if (!isLinked) {
    isLinked = await linkProject();
    if (!isLinked) {
      log('\n❌ 프로젝트 연결에 실패했습니다', 'red');
      process.exit(1);
    }
  }

  // 5. 마이그레이션 파일 확인
  if (!checkMigrationFiles()) {
    process.exit(1);
  }

  // 6. 마이그레이션 실행 여부 확인
  const answer = await askQuestion('\n마이그레이션을 실행하시겠습니까? (y/n): ');
  
  if (answer.toLowerCase() !== 'y') {
    log('마이그레이션을 취소했습니다', 'yellow');
    process.exit(0);
  }

  // 7. 마이그레이션 실행
  const migrationSuccess = await runMigrations();
  
  if (!migrationSuccess) {
    log('\n❌ 마이그레이션 실행 실패', 'red');
    log('수동으로 실행하세요:', 'yellow');
    log('1. npx supabase link --project-ref golbwnsytwbyoneucunx', 'yellow');
    log('2. npx supabase db push', 'yellow');
    process.exit(1);
  }

  // 8. 테이블 확인
  await verifyTables();

  log('\n========================================', 'bright');
  log('  ✅ 마이그레이션 완료!', 'green');
  log('========================================\n', 'bright');
  
  log('다음 단계:', 'cyan');
  log('1. Supabase Dashboard에서 테이블 확인', 'blue');
  log('2. Vercel 환경변수 설정 (NEXT_PUBLIC_APP_URL 등)', 'blue');
  log('3. Vercel 재배포', 'blue');
}

// 실행
main().catch(error => {
  log(`\n❌ 오류 발생: ${error.message}`, 'red');
  process.exit(1);
});