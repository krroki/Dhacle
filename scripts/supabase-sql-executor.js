#!/usr/bin/env node

/**
 * 🚀 Supabase SQL 실행 마스터 스크립트
 * 
 * 이 스크립트는 Supabase 데이터베이스에 SQL을 실행하는 모든 방법을 통합합니다.
 * Claude Code가 자동으로 SQL을 실행할 수 있도록 설계되었습니다.
 * 
 * 사용법:
 * node scripts/supabase-sql-executor.js --method [pg|cli|sdk] --file <sql파일> [--dry-run]
 * 
 * Methods:
 * - pg: PostgreSQL 직접 연결 (권장)
 * - cli: Supabase CLI 사용
 * - sdk: Supabase SDK RPC 사용
 */

const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

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

class SupabaseSQLExecutor {
  constructor() {
    // 환경 변수 로드
    this.dbUrl = process.env.DATABASE_URL;
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.dbPassword = process.env.SUPABASE_DB_PASSWORD;
    this.projectRef = 'golbwnsytwbyoneucunx';
    
    // 명령줄 인자 파싱
    this.args = this.parseArgs();
  }

  parseArgs() {
    const args = process.argv.slice(2);
    const result = {
      method: 'pg', // 기본값
      file: null,
      sqlContent: null,
      dryRun: false,
      verbose: false
    };

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--method':
          result.method = args[++i];
          break;
        case '--file':
          result.file = args[++i];
          break;
        case '--sql':
          result.sqlContent = args[++i];
          break;
        case '--dry-run':
          result.dryRun = true;
          break;
        case '--verbose':
          result.verbose = true;
          break;
      }
    }

    return result;
  }

  /**
   * Method 1: PostgreSQL 직접 연결 (가장 신뢰할 수 있는 방법)
   */
  async executePG(sql) {
    log('\n📦 Method 1: PostgreSQL 직접 연결', 'cyan');
    
    if (!this.dbUrl) {
      throw new Error('DATABASE_URL이 설정되지 않았습니다.');
    }

    const client = new Client({
      connectionString: this.dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      log('✅ 데이터베이스 연결 성공', 'green');

      // SQL 문을 개별적으로 실행
      const statements = this.parseSQL(sql);
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        if (!statement.trim()) continue;
        
        try {
          if (this.args.verbose) {
            log(`\n실행 중: ${statement.substring(0, 100)}...`, 'blue');
          }
          
          if (!this.args.dryRun) {
            // SELECT 쿼리 확인 (주석 제거 후 확인)
            const cleanStatement = statement.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
            const isSelect = /^\s*SELECT\s+/i.test(cleanStatement);
            
            if (isSelect) {
              const result = await client.query(statement);
              successCount++;
              
              // SELECT 결과 표시
              if (result.rows && result.rows.length > 0) {
                log(`  ✅ 조회 성공 (${result.rows.length}개 행)`, 'green');
                
                // 테이블 형태로 결과 표시
                console.log('\n📊 조회 결과:');
                if (result.rows.length > 10 && !this.args.verbose) {
                  console.table(result.rows.slice(0, 10));
                  log(`  ℹ️ 상위 10개 행만 표시됨. 전체 보려면 --verbose 사용`, 'yellow');
                } else {
                  console.table(result.rows);
                }
              } else {
                log(`  ✅ 조회 성공 (결과 없음)`, 'green');
              }
            } else {
              // 일반 쿼리 실행
              await client.query(statement);
              successCount++;
              log(`  ✅ 성공`, 'green');
            }
          } else {
            log(`  🔍 Dry-run: 실행 예정`, 'yellow');
          }
        } catch (error) {
          if (error.message.includes('already exists')) {
            skipCount++;
            log(`  ⏭️ 스킵 (이미 존재)`, 'yellow');
          } else {
            errorCount++;
            log(`  ❌ 오류: ${error.message}`, 'red');
            if (!this.args.verbose) {
              // 상세 모드가 아니면 계속 진행
              continue;
            }
          }
        }
      }

      log(`\n📊 실행 결과:`, 'cyan');
      log(`  성공: ${successCount}`, 'green');
      log(`  스킵: ${skipCount}`, 'yellow');
      log(`  오류: ${errorCount}`, errorCount > 0 ? 'red' : 'green');

      return { success: successCount, skip: skipCount, error: errorCount };

    } finally {
      await client.end();
      log('🔌 데이터베이스 연결 종료', 'cyan');
    }
  }

  /**
   * Method 2: Supabase CLI 사용
   */
  async executeCLI(sql) {
    log('\n📦 Method 2: Supabase CLI', 'cyan');
    
    // 임시 SQL 파일 생성
    const tempFile = path.join(__dirname, `temp_${Date.now()}.sql`);
    fs.writeFileSync(tempFile, sql);

    try {
      // 프로젝트 연결 확인
      try {
        execSync('npx supabase projects list', { stdio: 'pipe' });
      } catch {
        log('⚠️ 프로젝트 연결 중...', 'yellow');
        const linkCmd = `npx supabase link --project-ref ${this.projectRef} --password "${this.dbPassword}"`;
        execSync(linkCmd, { stdio: 'pipe' });
      }

      // db push 실행
      const pushCmd = this.args.dryRun 
        ? `npx supabase db push --dry-run`
        : `npx supabase db push --password "${this.dbPassword}"`;
      
      const result = execSync(pushCmd, { encoding: 'utf8' });
      log('✅ CLI 실행 완료', 'green');
      
      if (this.args.verbose) {
        console.log(result);
      }
      
      return { success: true };

    } catch (error) {
      log(`❌ CLI 실행 실패: ${error.message}`, 'red');
      return { success: false, error: error.message };
    } finally {
      // 임시 파일 삭제
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  /**
   * Method 3: Supabase SDK RPC (함수 생성 후 호출)
   */
  async executeSDK(sql) {
    log('\n📦 Method 3: Supabase SDK RPC', 'cyan');
    
    if (!this.supabaseUrl || !this.serviceRoleKey) {
      throw new Error('Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
    }

    const supabase = createClient(this.supabaseUrl, this.serviceRoleKey);

    // 먼저 실행 함수를 생성해야 함
    const functionSQL = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result json;
      BEGIN
        EXECUTE sql_query;
        RETURN json_build_object('success', true);
      EXCEPTION
        WHEN OTHERS THEN
          RETURN json_build_object('success', false, 'error', SQLERRM);
      END;
      $$;
    `;

    // PG 메소드로 함수 생성
    await this.executePG(functionSQL);

    // RPC로 SQL 실행
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
    
    if (error) {
      log(`❌ SDK 실행 실패: ${error.message}`, 'red');
      return { success: false, error: error.message };
    }

    log('✅ SDK 실행 완료', 'green');
    return data;
  }

  /**
   * SQL 파싱 (여러 문장 분리)
   */
  parseSQL(sql) {
    const statements = [];
    let current = '';
    let inFunction = false;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      const nextChar = sql[i + 1];

      // 문자열 처리
      if ((char === "'" || char === '"') && sql[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      // 함수 정의 처리
      if (!inString) {
        const substr = sql.substring(i, i + 20).toUpperCase();
        if (substr.includes('CREATE FUNCTION') || substr.includes('CREATE OR REPLACE FUNCTION')) {
          inFunction = true;
        }
        if (sql.substring(i, i + 3) === '$$;' || sql.substring(i, i + 20).includes('$$ LANGUAGE')) {
          inFunction = false;
        }
      }

      current += char;

      // 세미콜론으로 문장 구분 (함수 내부가 아닐 때)
      if (char === ';' && !inString && !inFunction) {
        statements.push(current.trim());
        current = '';
      }
    }

    if (current.trim()) {
      statements.push(current.trim());
    }

    return statements;
  }

  /**
   * SQL 파일 읽기
   */
  readSQLFile(filepath) {
    if (!fs.existsSync(filepath)) {
      // migrations 폴더에서 찾기
      const migrationsPath = path.join(__dirname, '../supabase/migrations', filepath);
      if (fs.existsSync(migrationsPath)) {
        return fs.readFileSync(migrationsPath, 'utf8');
      }
      throw new Error(`SQL 파일을 찾을 수 없습니다: ${filepath}`);
    }
    return fs.readFileSync(filepath, 'utf8');
  }

  /**
   * 메인 실행 함수
   */
  async execute() {
    log('\n========================================', 'bright');
    log('  🚀 Supabase SQL Executor', 'bright');
    log('========================================\n', 'bright');

    // SQL 내용 준비
    let sql;
    if (this.args.file) {
      log(`📄 SQL 파일: ${this.args.file}`, 'cyan');
      sql = this.readSQLFile(this.args.file);
    } else if (this.args.sqlContent) {
      sql = this.args.sqlContent;
    } else {
      log('❌ SQL 파일 또는 내용을 지정해주세요.', 'red');
      log('사용법: --file <파일명> 또는 --sql "<SQL문>"', 'yellow');
      return;
    }

    log(`🔧 실행 방법: ${this.args.method}`, 'cyan');
    log(`🔍 Dry-run: ${this.args.dryRun}`, 'cyan');

    try {
      let result;
      
      switch (this.args.method) {
        case 'pg':
          result = await this.executePG(sql);
          break;
        case 'cli':
          result = await this.executeCLI(sql);
          break;
        case 'sdk':
          result = await this.executeSDK(sql);
          break;
        default:
          throw new Error(`알 수 없는 메소드: ${this.args.method}`);
      }

      log('\n✅ 실행 완료!', 'green');
      
      // 타입 재생성 권장
      if (result.success > 0 && !this.args.dryRun) {
        log('\n💡 권장 사항:', 'yellow');
        log('타입을 재생성하려면 다음 명령을 실행하세요:', 'cyan');
        log('npm run types:generate', 'blue');
      }

    } catch (error) {
      log(`\n❌ 실행 실패: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  /**
   * 헬스 체크 - 연결 테스트
   */
  async healthCheck() {
    log('\n🏥 연결 상태 확인 중...', 'cyan');
    
    const results = {
      pg: false,
      cli: false,
      sdk: false
    };

    // PG 연결 테스트
    try {
      const client = new Client({
        connectionString: this.dbUrl,
        ssl: { rejectUnauthorized: false }
      });
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      results.pg = true;
      log('  ✅ PostgreSQL 직접 연결: 성공', 'green');
    } catch (error) {
      log('  ❌ PostgreSQL 직접 연결: 실패', 'red');
    }

    // CLI 테스트
    try {
      execSync('npx supabase --version', { stdio: 'pipe' });
      results.cli = true;
      log('  ✅ Supabase CLI: 설치됨', 'green');
    } catch {
      log('  ❌ Supabase CLI: 설치 필요', 'red');
    }

    // SDK 테스트
    if (this.supabaseUrl && this.serviceRoleKey) {
      results.sdk = true;
      log('  ✅ Supabase SDK: 설정됨', 'green');
    } else {
      log('  ❌ Supabase SDK: 설정 필요', 'red');
    }

    return results;
  }
}

// 실행
if (require.main === module) {
  const executor = new SupabaseSQLExecutor();
  
  // 헬스 체크 옵션
  if (process.argv.includes('--health')) {
    executor.healthCheck().then(results => {
      const allGood = Object.values(results).every(v => v);
      if (allGood) {
        log('\n🎉 모든 연결 방법이 정상입니다!', 'green');
      } else {
        log('\n⚠️ 일부 연결 방법에 문제가 있습니다.', 'yellow');
      }
    });
  } else {
    executor.execute().catch(error => {
      log(`\n❌ 치명적 오류: ${error.message}`, 'red');
      process.exit(1);
    });
  }
}

module.exports = SupabaseSQLExecutor;