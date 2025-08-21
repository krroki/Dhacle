#!/usr/bin/env node

/**
 * DB 테이블 상태 확인 스크립트
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTables() {
  console.log('\n📊 DB 테이블 확인 중...\n');

  // 필요한 테이블 목록
  const requiredTables = [
    'users',
    'profiles',
    'courses',
    'course_enrollments',
    'course_progress',
    'payments',
    'coupons',
    'purchases',
    'revenue_proofs',
    'community_posts',
    'user_api_keys',
    'videos',
    'channels',
    'collections',
    'source_folders',
    'subscriptions'
  ];

  const existingTables = [];
  const missingTables = [];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error && error.message.includes('does not exist')) {
        console.log(`❌ ${table} - 없음`);
        missingTables.push(table);
      } else {
        console.log(`✅ ${table} - 존재`);
        existingTables.push(table);
      }
    } catch (e) {
      console.log(`⚠️ ${table} - 오류: ${e.message}`);
    }
  }

  console.log('\n📊 결과 요약:');
  console.log(`✅ 존재하는 테이블: ${existingTables.length}개`);
  console.log(`❌ 누락된 테이블: ${missingTables.length}개`);

  if (missingTables.length > 0) {
    console.log('\n누락된 테이블:');
    missingTables.forEach(t => console.log(`  - ${t}`));
  }
}

checkTables().catch(console.error);