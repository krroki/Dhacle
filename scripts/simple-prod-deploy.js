#!/usr/bin/env node
/**
 * 🚀 심플한 프로덕션 배포 스크립트
 * 
 * 복잡한 자동화 대신 간단하고 확실한 방법으로
 * 실제로 작동하는 배포를 수행합니다.
 */

const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`)
};

// Step 1: 환경변수 체크
function checkEnv() {
  log.info('환경변수 체크 중...');
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'YT_ADMIN_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    log.error(`환경변수 누락: ${missing.join(', ')}`);
    process.exit(1);
  }
  
  log.success('환경변수 확인 완료');
}

// Step 2: 프로덕션 DB 테스트
async function testDatabase() {
  log.info('프로덕션 DB 연결 테스트...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    log.success('DB 연결 성공');
    return true;
  } catch (error) {
    log.error(`DB 연결 실패: ${error.message}`);
    return false;
  }
}

// Step 3: YouTube Lens 테이블 체크
async function checkYouTubeLensTables() {
  log.info('YouTube Lens 테이블 체크...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const tables = ['yl_channels', 'yl_approval_logs', 'yl_channel_daily_delta'];
  const missing = [];
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('count')
      .limit(1)
      .single();
    
    if (error && error.code === 'PGRST116') {
      missing.push(table);
      log.warning(`테이블 없음: ${table}`);
    } else {
      log.success(`테이블 확인: ${table}`);
    }
  }
  
  if (missing.length > 0) {
    log.warning(`누락된 테이블: ${missing.join(', ')}`);
    log.info('테이블 생성 중...');
    
    // YouTube Lens 테이블 생성
    const sqlFile = 'supabase/migrations/20250128_create_youtube_lens_tables.sql';
    try {
      execSync(`node scripts/supabase-sql-executor.js --method pg --file ${sqlFile}`, {
        stdio: 'inherit'
      });
      log.success('테이블 생성 완료');
    } catch (error) {
      log.error('테이블 생성 실패 - 수동으로 실행 필요');
    }
  }
  
  return missing.length === 0;
}

// Step 4: 프로덕션 API 테스트 (실제 프로덕션 URL)
async function testProductionAPI() {
  log.info('프로덕션 API 테스트...');
  
  const PROD_URL = 'https://dhacle.com';  // 하드코딩된 프로덕션 URL
  
  const endpoints = [
    '/api/auth/session',
    '/api/youtube-lens/admin/channels',
    '/api/youtube-lens/admin/channel-stats'
  ];
  
  let hasError = false;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${PROD_URL}${endpoint}`);
      const status = response.status;
      
      if (status === 200 || status === 401) {
        log.success(`${endpoint}: ${status} (정상)`);
      } else if (status === 500) {
        log.error(`${endpoint}: 500 에러!`);
        hasError = true;
      } else {
        log.warning(`${endpoint}: ${status}`);
      }
    } catch (error) {
      log.warning(`${endpoint}: 네트워크 오류`);
    }
  }
  
  return !hasError;
}

// Step 5: Vercel 환경변수 확인 안내
function checkVercelEnv() {
  console.log('\n📋 Vercel 환경변수 체크리스트:');
  console.log('================================');
  console.log('1. https://vercel.com 접속');
  console.log('2. dhacle 프로젝트 → Settings → Environment Variables');
  console.log('3. 다음 변수들이 있는지 확인:');
  console.log('   - YT_ADMIN_KEY');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  console.log('   - DATABASE_URL');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   - NEXT_PUBLIC_APP_URL (https://dhacle.com이어야 함!)');
  console.log('================================\n');
}

// 메인 실행
async function main() {
  console.log('🚀 심플 프로덕션 체크 시작\n');
  
  // 1. 환경변수 체크
  checkEnv();
  
  // 2. DB 연결 테스트
  const dbOk = await testDatabase();
  if (!dbOk) {
    log.error('DB 연결 실패 - Supabase 설정 확인 필요');
    process.exit(1);
  }
  
  // 3. YouTube Lens 테이블 체크
  const tablesOk = await checkYouTubeLensTables();
  
  // 4. 프로덕션 API 테스트
  const apiOk = await testProductionAPI();
  
  // 5. Vercel 환경변수 안내
  checkVercelEnv();
  
  // 결과 요약
  console.log('\n📊 결과 요약');
  console.log('================');
  console.log(`DB 연결: ${dbOk ? '✅' : '❌'}`);
  console.log(`테이블: ${tablesOk ? '✅' : '⚠️ 생성 필요'}`);
  console.log(`API: ${apiOk ? '✅' : '❌ 500 에러 발생'}`);
  console.log('================\n');
  
  if (!apiOk) {
    console.log('🔧 해결 방법:');
    console.log('1. Vercel에 환경변수 추가 (특히 YT_ADMIN_KEY)');
    console.log('2. Vercel 재배포: vercel --prod');
    console.log('3. 프로덕션 로그 확인: Vercel Dashboard → Functions → Logs');
  }
  
  process.exit(apiOk ? 0 : 1);
}

// 실행
main().catch(console.error);