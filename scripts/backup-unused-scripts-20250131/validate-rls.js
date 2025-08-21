#!/usr/bin/env node

/**
 * RLS (Row Level Security) 검증 스크립트
 * 
 * 목적: 모든 테이블의 RLS 상태를 검증하고 보고서 생성
 * 작성일: 2025-08-20
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const chalk = require('chalk');

// 색상 헬퍼
const log = (message, color = 'white') => {
  const colorFunc = chalk[color] || chalk.white;
  console.log(colorFunc(message));
};

class RLSValidator {
  constructor() {
    this.dbUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', 'postgresql://postgres:' + process.env.SUPABASE_SERVICE_ROLE_KEY + '@').replace('.supabase.co', '.supabase.co:5432/postgres');
    
    if (!this.dbUrl) {
      throw new Error('DATABASE_URL 또는 Supabase 환경 변수가 필요합니다.');
    }
  }

  async validate() {
    const client = new Client({
      connectionString: this.dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      log('\n✅ 데이터베이스 연결 성공', 'green');

      // 1. 전체 테이블 조회
      const tablesQuery = `
        SELECT 
          tablename,
          rowsecurity,
          CASE 
            WHEN rowsecurity = true THEN '✅ 활성화'
            ELSE '❌ 비활성화'
          END as status
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY rowsecurity DESC, tablename;
      `;

      const tablesResult = await client.query(tablesQuery);
      const tables = tablesResult.rows;

      log('\n📊 RLS 상태 요약', 'cyan');
      log('=' .repeat(60), 'cyan');

      const enabledCount = tables.filter(t => t.rowsecurity).length;
      const disabledCount = tables.filter(t => !t.rowsecurity).length;
      const totalCount = tables.length;

      log(`총 테이블: ${totalCount}개`, 'yellow');
      log(`RLS 활성화: ${enabledCount}개 (${((enabledCount/totalCount)*100).toFixed(1)}%)`, 'green');
      log(`RLS 비활성화: ${disabledCount}개 (${((disabledCount/totalCount)*100).toFixed(1)}%)`, 'red');

      // 2. RLS 활성화된 테이블 목록
      log('\n✅ RLS 활성화된 테이블', 'green');
      log('-'.repeat(40), 'gray');
      tables.filter(t => t.rowsecurity).forEach(table => {
        log(`  • ${table.tablename}`, 'green');
      });

      // 3. RLS 비활성화된 테이블 목록 (보안 위험)
      if (disabledCount > 0) {
        log('\n❌ RLS 비활성화된 테이블 (보안 위험!)', 'red');
        log('-'.repeat(40), 'gray');
        tables.filter(t => !t.rowsecurity).forEach(table => {
          log(`  • ${table.tablename}`, 'red');
        });
      }

      // 4. 각 테이블의 정책 수 조회
      log('\n📋 테이블별 정책 수', 'cyan');
      log('-'.repeat(60), 'gray');

      const policyQuery = `
        SELECT 
          schemaname,
          tablename,
          COUNT(policyname) as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY schemaname, tablename
        ORDER BY policy_count DESC, tablename;
      `;

      const policyResult = await client.query(policyQuery);
      const policies = policyResult.rows;

      // 테이블 형태로 출력
      console.log('\n');
      console.table(policies.map(p => ({
        '테이블명': p.tablename,
        '정책 수': p.policy_count,
        '상태': p.policy_count > 0 ? '✅ 정책 있음' : '⚠️ 정책 없음'
      })));

      // 5. 중요 테이블 체크 (사용자 데이터 관련)
      const criticalTables = [
        'users',
        'profiles', 
        'user_api_keys',
        'revenue_proofs',
        'community_posts',
        'courses',
        'course_enrollments',
        'payments'
      ];

      log('\n🔒 중요 테이블 보안 상태', 'yellow');
      log('-'.repeat(60), 'gray');

      for (const tableName of criticalTables) {
        const table = tables.find(t => t.tablename === tableName);
        const policy = policies.find(p => p.tablename === tableName);
        
        if (table) {
          const status = table.rowsecurity ? '✅' : '❌';
          const policyCount = policy ? policy.policy_count : 0;
          const policyStatus = policyCount > 0 ? `(${policyCount}개 정책)` : '(정책 없음)';
          
          const message = `${status} ${tableName}: RLS ${table.rowsecurity ? '활성화' : '비활성화'} ${policyStatus}`;
          log(message, table.rowsecurity ? 'green' : 'red');
        } else {
          log(`⚠️ ${tableName}: 테이블 없음`, 'yellow');
        }
      }

      // 6. 보안 점수 계산
      const securityScore = Math.round((enabledCount / totalCount) * 100);
      
      log('\n🏆 보안 점수', 'cyan');
      log('=' .repeat(60), 'cyan');
      
      let grade, gradeColor;
      if (securityScore >= 95) {
        grade = 'A+';
        gradeColor = 'green';
      } else if (securityScore >= 90) {
        grade = 'A';
        gradeColor = 'green';
      } else if (securityScore >= 80) {
        grade = 'B';
        gradeColor = 'yellow';
      } else if (securityScore >= 70) {
        grade = 'C';
        gradeColor = 'yellow';
      } else {
        grade = 'D';
        gradeColor = 'red';
      }

      log(`점수: ${securityScore}/100`, gradeColor);
      log(`등급: ${grade}`, gradeColor);

      // 7. 권장사항
      if (disabledCount > 0) {
        log('\n💡 권장사항', 'yellow');
        log('-'.repeat(60), 'gray');
        log('1. RLS가 비활성화된 테이블에 대해 보안 정책을 적용하세요.', 'yellow');
        log('2. 다음 명령을 실행하여 RLS를 적용할 수 있습니다:', 'yellow');
        log('   npm run security:apply-rls-all', 'cyan');
        log('3. 중요 테이블은 반드시 RLS를 활성화해야 합니다.', 'yellow');
      }

      return {
        total: totalCount,
        enabled: enabledCount,
        disabled: disabledCount,
        score: securityScore,
        grade: grade
      };

    } catch (error) {
      log(`\n❌ 오류 발생: ${error.message}`, 'red');
      throw error;
    } finally {
      await client.end();
      log('\n🔌 데이터베이스 연결 종료', 'cyan');
    }
  }
}

// 메인 실행
async function main() {
  log(chalk.bold('\n========================================'), 'cyan');
  log(chalk.bold('  🔒 RLS 검증 도구'), 'cyan');
  log(chalk.bold('========================================'), 'cyan');

  try {
    const validator = new RLSValidator();
    const result = await validator.validate();
    
    log('\n✅ 검증 완료!', 'green');
    process.exit(0);
  } catch (error) {
    log('\n❌ 검증 실패', 'red');
    console.error(error);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main();
}

module.exports = RLSValidator;