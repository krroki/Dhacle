#!/usr/bin/env node

/**
 * 🕐 TTL (Time-To-Live) 30일 데이터 보관 정책 구현
 * 
 * 30일 이상 된 임시 데이터를 자동으로 정리합니다.
 * - 검색 기록
 * - 임시 세션 데이터
 * - 만료된 알림
 * - 오래된 로그
 * 
 * 사용법:
 * node scripts/security/ttl-policy.js [--dry-run] [--force]
 */

const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

// 명령줄 인자 파싱
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const forceDelete = args.includes('--force');

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

// 데이터베이스 연결
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  log('❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.', 'red');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * TTL 정책 설정
 */
const TTL_POLICIES = [
  {
    table: 'youtube_search_history',
    column: 'created_at',
    days: 30,
    description: 'YouTube 검색 기록',
    condition: null // 추가 조건 없음
  },
  {
    table: 'api_usage',
    column: 'created_at',
    days: 90,
    description: 'API 사용 로그',
    condition: null
  },
  {
    table: 'alerts',
    column: 'created_at',
    days: 30,
    description: '트리거된 알림',
    condition: "status = 'read'" // 읽은 알림만 삭제
  },
  {
    table: 'community_posts',
    column: 'created_at',
    days: 365,
    description: '커뮤니티 게시글',
    condition: "is_deleted = true" // 삭제 표시된 것만
  },
  {
    table: 'naver_cafe_verifications',
    column: 'created_at',
    days: 7,
    description: '네이버 카페 인증 로그',
    condition: null
  },
  {
    table: 'revenue_proofs',
    column: 'created_at',
    days: 365,
    description: '수익 인증',
    condition: "is_deleted = true" // 삭제 표시된 것만
  }
];

/**
 * 삭제 예정 데이터 수 확인
 */
async function checkDeletionCandidates(policy) {
  const { table, column, days, condition } = policy;
  
  let query = `
    SELECT COUNT(*) as count
    FROM ${table}
    WHERE ${column} < NOW() - INTERVAL '${days} days'
  `;
  
  if (condition) {
    query += ` AND ${condition}`;
  }
  
  try {
    const result = await client.query(query);
    return parseInt(result.rows[0].count);
  } catch (error) {
    log(`  ❌ 조회 실패: ${error.message}`, 'red');
    return 0;
  }
}

/**
 * 데이터 삭제 실행
 */
async function deleteOldData(policy, dryRun = false) {
  const { table, column, days, description, condition } = policy;
  
  log(`\n📋 ${description} (${table})`, 'cyan');
  log(`  보관 기간: ${days}일`, 'yellow');
  
  // 삭제 대상 수 확인
  const count = await checkDeletionCandidates(policy);
  
  if (count === 0) {
    log(`  ✅ 삭제할 데이터 없음`, 'green');
    return { deleted: 0, skipped: true };
  }
  
  log(`  🗑️ 삭제 대상: ${count}개 레코드`, 'yellow');
  
  if (dryRun) {
    log(`  [DRY-RUN] 실제 삭제하지 않음`, 'blue');
    return { deleted: 0, dryRun: true, candidates: count };
  }
  
  // 실제 삭제 실행
  let deleteQuery = `
    DELETE FROM ${table}
    WHERE ${column} < NOW() - INTERVAL '${days} days'
  `;
  
  if (condition) {
    deleteQuery += ` AND ${condition}`;
  }
  
  try {
    const result = await client.query(deleteQuery);
    log(`  ✅ ${result.rowCount}개 레코드 삭제 완료`, 'green');
    return { deleted: result.rowCount };
  } catch (error) {
    log(`  ❌ 삭제 실패: ${error.message}`, 'red');
    return { deleted: 0, error: error.message };
  }
}

/**
 * 테이블별 데이터 통계
 */
async function getTableStatistics() {
  log('\n📊 테이블별 데이터 통계', 'cyan');
  log('─'.repeat(60));
  
  for (const policy of TTL_POLICIES) {
    const { table, column, days } = policy;
    
    try {
      // 전체 레코드 수
      const totalQuery = `SELECT COUNT(*) as total FROM ${table}`;
      const totalResult = await client.query(totalQuery);
      const total = parseInt(totalResult.rows[0].total);
      
      // 30일 이내 데이터
      const recentQuery = `
        SELECT COUNT(*) as recent 
        FROM ${table} 
        WHERE ${column} >= NOW() - INTERVAL '30 days'
      `;
      const recentResult = await client.query(recentQuery);
      const recent = parseInt(recentResult.rows[0].recent);
      
      // 삭제 대상
      const oldCount = await checkDeletionCandidates(policy);
      
      log(`${table.padEnd(30)} 전체: ${total.toString().padStart(6)} | ` +
          `최근 30일: ${recent.toString().padStart(6)} | ` +
          `삭제 대상: ${oldCount.toString().padStart(6)}`,
          oldCount > 0 ? 'yellow' : 'green');
      
    } catch (error) {
      log(`${table.padEnd(30)} 조회 실패: ${error.message}`, 'red');
    }
  }
  
  log('─'.repeat(60));
}

/**
 * TTL 정책 자동화 SQL 생성
 */
async function createTTLProcedure() {
  log('\n🔧 TTL 자동화 프로시저 생성', 'cyan');
  log('─'.repeat(60));
  
  const procedureSQL = `
    -- TTL 정책 자동 실행 함수
    CREATE OR REPLACE FUNCTION cleanup_old_data()
    RETURNS TABLE(
      table_name TEXT,
      deleted_count INTEGER
    )
    LANGUAGE plpgsql
    AS $$
    DECLARE
      v_count INTEGER;
    BEGIN
      -- YouTube 검색 기록 (30일)
      DELETE FROM youtube_search_history
      WHERE created_at < NOW() - INTERVAL '30 days';
      GET DIAGNOSTICS v_count = ROW_COUNT;
      table_name := 'youtube_search_history';
      deleted_count := v_count;
      RETURN NEXT;
      
      -- API 사용 로그 (90일)
      DELETE FROM api_usage
      WHERE created_at < NOW() - INTERVAL '90 days';
      GET DIAGNOSTICS v_count = ROW_COUNT;
      table_name := 'api_usage';
      deleted_count := v_count;
      RETURN NEXT;
      
      -- 읽은 알림 (30일)
      DELETE FROM alerts
      WHERE created_at < NOW() - INTERVAL '30 days'
        AND status = 'read';
      GET DIAGNOSTICS v_count = ROW_COUNT;
      table_name := 'alerts';
      deleted_count := v_count;
      RETURN NEXT;
      
      -- 네이버 카페 인증 로그 (7일)
      DELETE FROM naver_cafe_verifications
      WHERE created_at < NOW() - INTERVAL '7 days';
      GET DIAGNOSTICS v_count = ROW_COUNT;
      table_name := 'naver_cafe_verifications';
      deleted_count := v_count;
      RETURN NEXT;
      
      RETURN;
    END;
    $$;
    
    -- 매일 자정에 실행되는 크론 작업 설정 (pg_cron 확장 필요)
    -- SELECT cron.schedule('cleanup-old-data', '0 0 * * *', 'SELECT cleanup_old_data();');
  `;
  
  if (isDryRun) {
    log('[DRY-RUN] 프로시저 생성 SQL:', 'blue');
    console.log(procedureSQL);
    return;
  }
  
  try {
    await client.query(procedureSQL);
    log('✅ TTL 자동화 프로시저 생성 완료', 'green');
    log('💡 Supabase Dashboard에서 pg_cron을 활성화하고 스케줄을 설정하세요', 'yellow');
  } catch (error) {
    log(`❌ 프로시저 생성 실패: ${error.message}`, 'red');
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  log('\n' + '═'.repeat(60), 'bright');
  log('🕐 TTL 30일 데이터 보관 정책 실행', 'cyan');
  log('═'.repeat(60), 'bright');
  
  if (isDryRun) {
    log('\n⚠️ DRY-RUN 모드: 실제 삭제 없음', 'yellow');
  }
  
  if (forceDelete) {
    log('\n⚠️ FORCE 모드: 강제 삭제 활성화', 'yellow');
  }
  
  try {
    // 데이터베이스 연결
    log('\n🔌 데이터베이스 연결 중...', 'blue');
    await client.connect();
    log('✅ 연결 성공', 'green');
    
    // 현재 통계 표시
    await getTableStatistics();
    
    // 각 정책별 처리
    log('\n🗑️ TTL 정책 실행', 'cyan');
    log('═'.repeat(60));
    
    let totalDeleted = 0;
    let totalCandidates = 0;
    const results = [];
    
    for (const policy of TTL_POLICIES) {
      const result = await deleteOldData(policy, isDryRun);
      results.push({
        table: policy.table,
        ...result
      });
      
      if (result.deleted) {
        totalDeleted += result.deleted;
      }
      if (result.candidates) {
        totalCandidates += result.candidates;
      }
    }
    
    // 결과 요약
    log('\n' + '═'.repeat(60), 'bright');
    log('📊 TTL 정책 실행 결과', 'cyan');
    log('─'.repeat(60));
    
    if (isDryRun) {
      log(`삭제 예정: ${totalCandidates}개 레코드`, 'yellow');
      log('실제 삭제하려면 --dry-run 플래그 없이 실행하세요', 'yellow');
    } else {
      log(`✅ 총 ${totalDeleted}개 레코드 삭제 완료`, 'green');
    }
    
    // 자동화 프로시저 생성
    if (!isDryRun) {
      await createTTLProcedure();
    }
    
    // 권장 사항
    log('\n💡 권장 사항:', 'cyan');
    log('─'.repeat(60));
    log('1. 정기적으로 TTL 정책을 실행하세요 (일 1회 권장)', 'yellow');
    log('2. Supabase Dashboard에서 pg_cron 확장을 활성화하세요', 'yellow');
    log('3. 중요 데이터는 백업 후 삭제하세요', 'yellow');
    log('4. 프로덕션 환경에서는 단계적으로 적용하세요', 'yellow');
    
  } catch (error) {
    log(`\n❌ 치명적 오류: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    // 연결 종료
    await client.end();
    log('\n🔌 데이터베이스 연결 종료', 'blue');
  }
}

// 스크립트 실행
if (require.main === module) {
  main().then(() => {
    process.exit(0);
  }).catch((error) => {
    log(`\n❌ 스크립트 실행 실패: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { deleteOldData, getTableStatistics };