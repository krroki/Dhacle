#!/usr/bin/env node

/**
 * 🔐 Wave 2 RLS 정책 적용 스크립트
 * 
 * 이 스크립트는 Supabase 데이터베이스에 Wave 2 RLS 정책을 적용합니다.
 * Service Role Key를 사용하여 RLS를 우회하고 정책을 설정합니다.
 * 
 * 사용법:
 * node scripts/security/apply-rls-wave2.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('필요한 환경 변수:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Service Role 클라이언트 생성 (RLS 우회)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 테이블별 RLS 상태 확인
async function checkRLSStatus() {
  console.log('\n📊 RLS 상태 확인 중...\n');
  
  const { data, error } = await supabase
    .rpc('get_rls_status', {})
    .single();
  
  if (error) {
    // RPC 함수가 없는 경우 직접 쿼리
    const query = `
      SELECT 
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    const { data: tables, error: queryError } = await supabase
      .rpc('query', { query_text: query })
      .single();
    
    if (queryError) {
      console.log('⚠️ RLS 상태를 직접 확인할 수 없습니다. Dashboard에서 확인하세요.');
      return null;
    }
    
    return tables;
  }
  
  return data;
}

// Wave 2 SQL 파일 읽기 및 실행
async function applyWave2RLS() {
  console.log('🔐 Wave 2 RLS 정책 적용 시작...\n');
  
  // SQL 파일 경로
  const sqlFilePath = path.join(__dirname, '../../supabase/migrations/20250123000002_wave2_security_rls.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error('❌ Wave 2 RLS SQL 파일을 찾을 수 없습니다:', sqlFilePath);
    process.exit(1);
  }
  
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  // SQL 문을 개별 명령으로 분리
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  console.log(`📝 ${statements.length}개의 SQL 문 실행 중...\n`);
  
  for (const statement of statements) {
    // 주석이나 빈 문장 스킵
    if (!statement || statement.startsWith('--')) continue;
    
    try {
      // SQL 실행
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      });
      
      if (error) {
        errorCount++;
        errors.push({
          statement: statement.substring(0, 50) + '...',
          error: error.message
        });
        console.log(`❌ 실행 실패: ${statement.substring(0, 50)}...`);
      } else {
        successCount++;
        console.log(`✅ 실행 성공: ${statement.substring(0, 50)}...`);
      }
    } catch (e) {
      errorCount++;
      errors.push({
        statement: statement.substring(0, 50) + '...',
        error: e.message
      });
      console.log(`❌ 예외 발생: ${e.message}`);
    }
  }
  
  // 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 Wave 2 RLS 적용 결과:');
  console.log('='.repeat(50));
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${errorCount}개`);
  
  if (errors.length > 0) {
    console.log('\n❌ 오류 상세:');
    errors.forEach((e, i) => {
      console.log(`\n${i + 1}. ${e.statement}`);
      console.log(`   오류: ${e.error}`);
    });
  }
  
  return { successCount, errorCount };
}

// 테이블별 RLS 정책 확인
async function verifyRLSPolicies() {
  console.log('\n🔍 RLS 정책 검증 중...\n');
  
  const tables = [
    'videos', 'video_stats', 'channels', 'source_folders', 'folder_channels',
    'alert_rules', 'alerts', 'collections', 'collection_items', 'saved_searches',
    'subscriptions', 'user_api_keys', 'youtube_favorites', 'youtube_search_history',
    'api_usage', 'community_posts', 'community_comments', 'community_likes',
    'course_enrollments', 'course_progress'
  ];
  
  const results = [];
  
  for (const table of tables) {
    const query = `
      SELECT COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = '${table}';
    `;
    
    try {
      const { data, error } = await supabase
        .rpc('query', { query_text: query })
        .single();
      
      if (error) {
        results.push({ table, status: '❓ 확인 불가', policies: 0 });
      } else {
        const count = data?.policy_count || 0;
        const status = count > 0 ? '✅ RLS 활성' : '❌ RLS 없음';
        results.push({ table, status, policies: count });
      }
    } catch (e) {
      results.push({ table, status: '❓ 오류', policies: 0 });
    }
  }
  
  // 결과 출력
  console.log('📋 테이블별 RLS 상태:');
  console.log('='.repeat(50));
  
  results.forEach(r => {
    console.log(`${r.status} ${r.table.padEnd(25)} (정책: ${r.policies}개)`);
  });
  
  const enabledCount = results.filter(r => r.status === '✅ RLS 활성').length;
  const totalCount = results.length;
  const coverage = Math.round((enabledCount / totalCount) * 100);
  
  console.log('='.repeat(50));
  console.log(`\n📊 RLS 커버리지: ${enabledCount}/${totalCount} 테이블 (${coverage}%)\n`);
  
  return { enabledCount, totalCount, coverage };
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Wave 2 RLS 정책 적용 프로세스 시작');
  console.log('='.repeat(50));
  
  try {
    // 1. 현재 RLS 상태 확인
    await checkRLSStatus();
    
    // 2. Wave 2 RLS 적용
    const applyResult = await applyWave2RLS();
    
    // 3. 적용 후 검증
    const verifyResult = await verifyRLSPolicies();
    
    // 4. 최종 보고
    console.log('\n' + '='.repeat(50));
    console.log('🎯 Wave 2 RLS 적용 완료!');
    console.log('='.repeat(50));
    
    if (verifyResult.coverage >= 80) {
      console.log('✅ RLS 보안이 크게 개선되었습니다!');
    } else if (verifyResult.coverage >= 50) {
      console.log('⚠️ RLS가 부분적으로 적용되었습니다. Dashboard에서 확인하세요.');
    } else {
      console.log('❌ RLS 적용이 불완전합니다. 수동으로 적용이 필요합니다.');
    }
    
    console.log('\n💡 다음 단계:');
    console.log('1. Supabase Dashboard에서 RLS 상태 확인');
    console.log('2. 실패한 정책 수동 적용');
    console.log('3. 애플리케이션 테스트 실행');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { checkRLSStatus, applyWave2RLS, verifyRLSPolicies };