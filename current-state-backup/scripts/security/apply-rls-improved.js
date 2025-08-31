#!/usr/bin/env node

/**
 * 🔐 개선된 RLS 정책 적용 스크립트
 * 
 * pg 패키지를 사용하여 직접 PostgreSQL에 연결하여 RLS 정책을 적용합니다.
 * Wave 0와 Wave 2의 모든 RLS 정책을 안전하게 적용합니다.
 * 
 * 사용법:
 * npm install pg
 * node scripts/security/apply-rls-improved.js [--dry-run] [--wave 0|2|all]
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

// 명령줄 인자 파싱
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const waveArg = args.findIndex(arg => arg === '--wave');
const wave = waveArg !== -1 ? args[waveArg + 1] : 'all';

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

// 데이터베이스 연결 설정
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  log('❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.', 'red');
  log('필요한 환경 변수:', 'yellow');
  log('- DATABASE_URL: PostgreSQL 연결 문자열', 'yellow');
  process.exit(1);
}

// PostgreSQL 클라이언트 생성
const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Supabase는 SSL 필요
  }
});

/**
 * SQL 파일 읽기 및 파싱
 */
function readSQLFile(filename) {
  const filepath = path.join(__dirname, '../../supabase/migrations', filename);
  
  if (!fs.existsSync(filepath)) {
    throw new Error(`SQL 파일을 찾을 수 없습니다: ${filepath}`);
  }
  
  const content = fs.readFileSync(filepath, 'utf8');
  
  // SQL 문을 세미콜론으로 분리하되, 함수 정의 내부의 세미콜론은 무시
  const statements = [];
  let currentStatement = '';
  let inFunction = false;
  
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 함수 시작/끝 감지
    if (trimmedLine.includes('CREATE FUNCTION') || trimmedLine.includes('CREATE OR REPLACE FUNCTION')) {
      inFunction = true;
    }
    if (trimmedLine === '$$;' || trimmedLine.endsWith('$$ LANGUAGE plpgsql;')) {
      inFunction = false;
      currentStatement += line + '\n';
      statements.push(currentStatement.trim());
      currentStatement = '';
      continue;
    }
    
    // 주석 무시
    if (trimmedLine.startsWith('--') && !inFunction) {
      continue;
    }
    
    currentStatement += line + '\n';
    
    // 함수 밖에서 세미콜론을 만나면 문장 종료
    if (!inFunction && trimmedLine.endsWith(';')) {
      statements.push(currentStatement.trim());
      currentStatement = '';
    }
  }
  
  // 마지막 문장 처리
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements.filter(s => s.length > 0);
}

/**
 * RLS 상태 확인
 */
async function checkRLSStatus() {
  log('\n📊 현재 RLS 상태 확인 중...', 'cyan');
  
  const query = `
    SELECT 
      t.tablename,
      t.rowsecurity as rls_enabled,
      COUNT(p.policyname) as policy_count
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
    WHERE t.schemaname = 'public'
      AND t.tablename NOT LIKE 'pg_%'
      AND t.tablename NOT IN ('schema_migrations', 'supabase_migrations')
    GROUP BY t.tablename, t.rowsecurity
    ORDER BY t.tablename;
  `;
  
  try {
    const result = await client.query(query);
    
    log('\n테이블별 RLS 상태:', 'bright');
    log('─'.repeat(60));
    
    let totalTables = 0;
    let enabledTables = 0;
    let tablesWithPolicies = 0;
    
    for (const row of result.rows) {
      totalTables++;
      const status = row.rls_enabled ? '✅' : '❌';
      const policies = parseInt(row.policy_count);
      
      if (row.rls_enabled) enabledTables++;
      if (policies > 0) tablesWithPolicies++;
      
      const statusColor = row.rls_enabled ? 'green' : 'red';
      const policyColor = policies > 0 ? 'green' : 'yellow';
      
      console.log(
        `${colors[statusColor]}${status}${colors.reset} ${row.tablename.padEnd(30)} ` +
        `${colors[policyColor]}(정책: ${policies}개)${colors.reset}`
      );
    }
    
    log('─'.repeat(60));
    log(`\n📈 RLS 커버리지:`, 'bright');
    log(`  - RLS 활성화: ${enabledTables}/${totalTables} 테이블 (${Math.round(enabledTables/totalTables*100)}%)`, 
        enabledTables === totalTables ? 'green' : 'yellow');
    log(`  - 정책 보유: ${tablesWithPolicies}/${totalTables} 테이블 (${Math.round(tablesWithPolicies/totalTables*100)}%)`,
        tablesWithPolicies === totalTables ? 'green' : 'yellow');
    
    return { totalTables, enabledTables, tablesWithPolicies };
  } catch (error) {
    log(`❌ RLS 상태 확인 실패: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * SQL 문 실행
 */
async function executeStatement(statement, dryRun = false) {
  // 실행할 SQL 요약 (첫 50자)
  const summary = statement.substring(0, 100).replace(/\n/g, ' ');
  
  if (dryRun) {
    log(`  [DRY-RUN] ${summary}...`, 'blue');
    return { success: true, dryRun: true };
  }
  
  try {
    await client.query(statement);
    log(`  ✅ ${summary}...`, 'green');
    return { success: true };
  } catch (error) {
    log(`  ❌ 실패: ${summary}...`, 'red');
    log(`     오류: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Wave별 RLS 정책 적용
 */
async function applyRLS(waveNumber, dryRun = false) {
  const filename = waveNumber === 0 
    ? '20250123000001_wave0_security_rls.sql'
    : '20250123000002_wave2_security_rls.sql';
    
  log(`\n🔐 Wave ${waveNumber} RLS 정책 적용 ${dryRun ? '(DRY-RUN)' : ''}`, 'cyan');
  log('─'.repeat(60));
  
  try {
    const statements = readSQLFile(filename);
    log(`📝 ${statements.length}개의 SQL 문 발견`, 'yellow');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // 트랜잭션 시작 (dry-run이 아닌 경우)
    if (!dryRun) {
      await client.query('BEGIN');
      log('🔄 트랜잭션 시작', 'blue');
    }
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      log(`\n[${i + 1}/${statements.length}] 실행 중...`, 'yellow');
      
      const result = await executeStatement(statement, dryRun);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        errors.push({
          index: i + 1,
          statement: statement.substring(0, 50) + '...',
          error: result.error
        });
      }
    }
    
    // 결과에 따라 커밋 또는 롤백
    if (!dryRun) {
      if (errorCount === 0) {
        await client.query('COMMIT');
        log('\n✅ 트랜잭션 커밋 완료', 'green');
      } else {
        await client.query('ROLLBACK');
        log('\n⚠️ 오류 발생으로 트랜잭션 롤백', 'yellow');
      }
    }
    
    // 결과 요약
    log('\n' + '═'.repeat(60), 'bright');
    log(`📊 Wave ${waveNumber} 적용 결과:`, 'bright');
    log('─'.repeat(60));
    log(`✅ 성공: ${successCount}개`, 'green');
    log(`❌ 실패: ${errorCount}개`, errorCount > 0 ? 'red' : 'green');
    
    if (errors.length > 0) {
      log('\n❌ 오류 상세:', 'red');
      errors.forEach(e => {
        log(`  ${e.index}. ${e.statement}`, 'yellow');
        log(`     ${e.error}`, 'red');
      });
    }
    
    return { successCount, errorCount };
    
  } catch (error) {
    log(`\n❌ Wave ${waveNumber} 적용 실패: ${error.message}`, 'red');
    if (!dryRun) {
      await client.query('ROLLBACK');
      log('⚠️ 트랜잭션 롤백', 'yellow');
    }
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  log('\n' + '═'.repeat(60), 'bright');
  log('🚀 개선된 RLS 정책 적용 프로세스', 'cyan');
  log('═'.repeat(60), 'bright');
  
  if (isDryRun) {
    log('\n⚠️ DRY-RUN 모드: 실제 변경사항 없음', 'yellow');
  }
  
  try {
    // 데이터베이스 연결
    log('\n🔌 데이터베이스 연결 중...', 'blue');
    await client.connect();
    log('✅ 연결 성공', 'green');
    
    // 현재 상태 확인
    const beforeStatus = await checkRLSStatus();
    
    // Wave별 적용
    if (wave === 'all' || wave === '0') {
      await applyRLS(0, isDryRun);
    }
    
    if (wave === 'all' || wave === '2') {
      await applyRLS(2, isDryRun);
    }
    
    // 적용 후 상태 확인
    if (!isDryRun) {
      log('\n🔍 적용 후 RLS 상태 확인...', 'cyan');
      const afterStatus = await checkRLSStatus();
      
      // 개선 사항 요약
      log('\n' + '═'.repeat(60), 'bright');
      log('📈 개선 사항:', 'cyan');
      log('─'.repeat(60));
      
      const rlsImproved = afterStatus.enabledTables - beforeStatus.enabledTables;
      const policyImproved = afterStatus.tablesWithPolicies - beforeStatus.tablesWithPolicies;
      
      if (rlsImproved > 0) {
        log(`✅ RLS 활성화 테이블: +${rlsImproved}개`, 'green');
      }
      if (policyImproved > 0) {
        log(`✅ 정책 추가 테이블: +${policyImproved}개`, 'green');
      }
      
      if (rlsImproved === 0 && policyImproved === 0) {
        log('ℹ️ 변경사항 없음 (이미 적용됨)', 'yellow');
      }
    }
    
    // 다음 단계 안내
    log('\n' + '═'.repeat(60), 'bright');
    log('💡 다음 단계:', 'cyan');
    log('─'.repeat(60));
    log('1. Supabase Dashboard에서 최종 확인', 'yellow');
    log('2. 애플리케이션 테스트 실행', 'yellow');
    log('3. 모니터링 설정', 'yellow');
    
    if (isDryRun) {
      log('\n💡 실제 적용하려면 --dry-run 플래그 없이 실행하세요', 'yellow');
    }
    
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

module.exports = { checkRLSStatus, applyRLS };