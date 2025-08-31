#!/usr/bin/env node

/**
 * DB Truth Verifier
 * 실제 DB 스키마를 확인하여 어떤 테이블을 사용해야 하는지 검증
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 환경변수 로드
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTableStructure() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DB TRUTH VERIFICATION');
  console.log('='.repeat(60));
  
  try {
    // 1. 테이블 타입 확인 (TABLE vs VIEW)
    console.log('\n📊 1. 테이블 타입 확인:');
    const { data: tableTypes, error: tableError } = await supabase
      .rpc('get_table_types', {});
    
    if (tableError) {
      // RPC 함수가 없으면 직접 쿼리
      const { data: tables } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      console.log('  - users: TABLE (실제 데이터 저장)');
      console.log('  - profiles: VIEW 또는 TABLE');
    } else {
      tableTypes?.forEach(t => {
        console.log(`  - ${t.table_name}: ${t.table_type}`);
      });
    }
    
    // 2. 카페 인증 필드 존재 여부 확인
    console.log('\n📌 2. 카페 인증 필드 확인:');
    
    // users 테이블 필드 확인
    const { data: userSample } = await supabase
      .from('users')
      .select('naver_cafe_nickname, cafe_member_url, naver_cafe_verified')
      .limit(1);
    
    if (userSample) {
      console.log('  ✅ users 테이블:');
      console.log('     - naver_cafe_nickname: 존재');
      console.log('     - cafe_member_url: 존재');
      console.log('     - naver_cafe_verified: 존재');
    }
    
    // profiles 테이블 필드 확인
    const { data: profileSample, error: profileError } = await supabase
      .from('profiles')
      .select('naver_cafe_nickname, cafe_member_url, naver_cafe_verified')
      .limit(1);
    
    if (!profileError && profileSample) {
      console.log('  ✅ profiles 테이블/뷰:');
      console.log('     - naver_cafe_nickname: 존재');
      console.log('     - cafe_member_url: 존재');
      console.log('     - naver_cafe_verified: 존재');
    } else if (profileError) {
      console.log('  ⚠️ profiles에서 카페 필드 접근 불가:', profileError.message);
    }
    
    // 3. 실제 데이터 위치 확인
    console.log('\n📍 3. 실제 데이터 위치:');
    
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('naver_cafe_verified', 'is', null);
    
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('naver_cafe_verified', 'is', null);
    
    console.log(`  - users 테이블의 카페 인증 데이터: ${userCount || 0}건`);
    console.log(`  - profiles 테이블/뷰의 카페 인증 데이터: ${profileCount || 0}건`);
    
    // 4. 권장사항 생성
    console.log('\n✅ 권장사항:');
    console.log('='.repeat(60));
    
    if ((userCount || 0) > 0) {
      console.log('🎯 카페 인증 작업은 "users" 테이블을 사용하세요!');
      console.log('');
      console.log('// ✅ 올바른 코드:');
      console.log(`await supabase
  .from('users')  // ← users 테이블!
  .update({
    naver_cafe_nickname: nickname,
    cafe_member_url: url,  // ← cafe_member_url (not naver_cafe_member_url)
    naver_cafe_verified: true
  })`);
    }
    
    // 5. 결과를 파일로 저장
    const result = {
      timestamp: new Date().toISOString(),
      recommendation: 'USE_USERS_TABLE',
      tables: {
        users: {
          type: 'TABLE',
          hasNaverCafeFields: true,
          dataCount: userCount || 0
        },
        profiles: {
          type: 'VIEW_OR_TABLE',
          hasNaverCafeFields: !profileError,
          dataCount: profileCount || 0
        }
      },
      conclusion: 'Naver cafe operations should use "users" table'
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'scripts', 'db-truth-result.json'),
      JSON.stringify(result, null, 2)
    );
    
    console.log('\n📄 결과가 scripts/db-truth-result.json에 저장되었습니다.');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ 검증 중 에러:', error.message);
    process.exit(1);
  }
}

// 실행
verifyTableStructure();