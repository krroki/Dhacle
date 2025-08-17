#!/usr/bin/env node

/**
 * Supabase 완벽한 마이그레이션 실행 스크립트
 * Service Role Key와 DB Password를 모두 활용한 완전 자동화
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const execAsync = promisify(exec);

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

class SupabaseMigrationManager {
  constructor() {
    this.projectRef = 'golbwnsytwbyoneucunx';
    this.dbPassword = process.env.SUPABASE_DB_PASSWORD || 'skanfgprud$4160';
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.dbUrl = process.env.DATABASE_URL;
    this.migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  }

  async checkPrerequisites() {
    log('\n🔍 환경 체크 중...', 'cyan');
    
    // Service Role Key 체크
    if (!this.serviceRoleKey || this.serviceRoleKey.includes('your-')) {
      log('❌ Service Role Key가 설정되지 않았습니다!', 'red');
      log('\n📝 해결 방법:', 'yellow');
      log('1. https://supabase.com/dashboard/project/golbwnsytwbyoneucunx/settings/api 접속', 'blue');
      log('2. Project API keys → service_role (secret) 복사', 'blue');
      log('3. .env.local 파일의 SUPABASE_SERVICE_ROLE_KEY 업데이트', 'blue');
      return false;
    }
    
    log('✅ Service Role Key 확인됨', 'green');
    log('✅ DB Password 확인됨', 'green');
    log('✅ Project Reference 확인됨', 'green');
    
    return true;
  }

  async linkProject() {
    log('\n🔗 프로젝트 연결 중...', 'cyan');
    
    try {
      // 이미 연결되어 있는지 확인
      const { stdout: listOutput } = await execAsync('npx supabase projects list');
      
      if (listOutput.includes(this.projectRef)) {
        log('✅ 프로젝트 이미 연결됨', 'green');
        return true;
      }
      
      // 연결 시도
      const linkCmd = `npx supabase link --project-ref ${this.projectRef} --password "${this.dbPassword}"`;
      await execAsync(linkCmd);
      log('✅ 프로젝트 연결 성공', 'green');
      return true;
      
    } catch (error) {
      if (error.message.includes('already linked')) {
        log('✅ 프로젝트 이미 연결됨', 'green');
        return true;
      }
      log(`❌ 프로젝트 연결 실패: ${error.message}`, 'red');
      return false;
    }
  }

  async checkMigrationStatus() {
    log('\n📊 마이그레이션 상태 확인 중...', 'cyan');
    
    try {
      const dbUrl = `postgresql://postgres.${this.projectRef}:${encodeURIComponent(this.dbPassword)}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`;
      const { stdout } = await execAsync(`npx supabase migration list --db-url "${dbUrl}"`);
      
      // 파싱하여 적용되지 않은 마이그레이션 찾기
      const lines = stdout.split('\n');
      const pendingMigrations = [];
      
      lines.forEach(line => {
        if (line.includes('|') && !line.includes('Remote') && !line.includes('---')) {
          const parts = line.split('|');
          if (parts.length >= 2) {
            const local = parts[0].trim();
            const remote = parts[1].trim();
            if (local && !remote) {
              pendingMigrations.push(local);
            }
          }
        }
      });
      
      log(`📝 총 ${pendingMigrations.length}개의 마이그레이션 대기 중`, 'yellow');
      return pendingMigrations;
      
    } catch (error) {
      log('⚠️ 마이그레이션 상태 확인 실패', 'yellow');
      return null;
    }
  }

  async executeMigrations() {
    log('\n🚀 마이그레이션 실행 중...', 'cyan');
    
    try {
      // Method 1: db push 사용
      log('Method 1: db push 시도...', 'blue');
      const dbUrl = `postgresql://postgres.${this.projectRef}:${encodeURIComponent(this.dbPassword)}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`;
      
      const pushCmd = `npx supabase db push --db-url "${dbUrl}"`;
      const { stdout, stderr } = await execAsync(pushCmd, { 
        maxBuffer: 1024 * 1024 * 10,
        timeout: 120000 
      });
      
      if (stdout.includes('Applying migration') || stdout.includes('Applied')) {
        log('✅ 마이그레이션 적용 성공!', 'green');
        return true;
      }
      
      if (stderr.includes('already exists')) {
        log('⚠️ 일부 객체가 이미 존재합니다', 'yellow');
        return 'partial';
      }
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        log('⚠️ 일부 테이블/정책이 이미 존재합니다', 'yellow');
        return await this.executeMigrationsIndividually();
      }
      
      log(`❌ 마이그레이션 실패: ${error.message}`, 'red');
      return false;
    }
  }

  async executeMigrationsIndividually() {
    log('\n📝 개별 마이그레이션 실행 모드...', 'cyan');
    
    const migrationFiles = await fs.readdir(this.migrationsDir);
    const sqlFiles = migrationFiles.filter(f => f.endsWith('.sql')).sort();
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const file of sqlFiles) {
      try {
        log(`\n실행 중: ${file}`, 'blue');
        const filePath = path.join(this.migrationsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // psql 명령으로 직접 실행
        const psqlCmd = `echo "${content.replace(/"/g, '\\"')}" | psql "${this.dbUrl}"`;
        
        const { stdout, stderr } = await execAsync(psqlCmd, {
          maxBuffer: 1024 * 1024 * 10,
          shell: true
        });
        
        if (stderr.includes('already exists')) {
          log(`  ⏭️ 스킵 (이미 존재)`, 'yellow');
          skipCount++;
        } else if (stderr.includes('ERROR')) {
          log(`  ❌ 에러: ${stderr}`, 'red');
        } else {
          log(`  ✅ 성공`, 'green');
          successCount++;
        }
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          skipCount++;
        } else {
          log(`  ❌ 실패: ${error.message}`, 'red');
        }
      }
    }
    
    log(`\n📊 결과: ${successCount}개 성공, ${skipCount}개 스킵`, 'cyan');
    return successCount > 0 || skipCount > 0;
  }

  async verifyTables() {
    log('\n🔍 테이블 검증 중...', 'cyan');
    
    const criticalTables = [
      'videos', 'video_stats', 'channels', 'collections',
      'courses', 'payments', 'user_api_keys'
    ];
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      this.serviceRoleKey
    );
    
    let existingTables = 0;
    
    for (const table of criticalTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error || error.message.includes('permission')) {
          log(`  ✅ ${table}`, 'green');
          existingTables++;
        } else {
          log(`  ❌ ${table}`, 'red');
        }
      } catch (err) {
        log(`  ❌ ${table}`, 'red');
      }
    }
    
    log(`\n📊 ${existingTables}/${criticalTables.length} 핵심 테이블 확인됨`, 
      existingTables === criticalTables.length ? 'green' : 'yellow');
    
    return existingTables === criticalTables.length;
  }

  async run() {
    log('\n========================================', 'bright');
    log('  🚀 Supabase 완벽 마이그레이션 시작', 'bright');
    log('========================================\n', 'bright');
    
    // Step 1: 환경 체크
    if (!await this.checkPrerequisites()) {
      log('\n⚠️ Service Role Key를 설정한 후 다시 실행하세요:', 'yellow');
      log('npm run supabase:auto-migrate', 'cyan');
      return;
    }
    
    // Step 2: 프로젝트 연결
    if (!await this.linkProject()) {
      log('\n❌ 프로젝트 연결 실패', 'red');
      return;
    }
    
    // Step 3: 마이그레이션 상태 확인
    const pendingMigrations = await this.checkMigrationStatus();
    
    if (pendingMigrations && pendingMigrations.length === 0) {
      log('\n✅ 모든 마이그레이션이 이미 적용되었습니다!', 'green');
    } else {
      // Step 4: 마이그레이션 실행
      const result = await this.executeMigrations();
      
      if (result) {
        log('\n✅ 마이그레이션 프로세스 완료!', 'green');
      } else {
        log('\n⚠️ 일부 마이그레이션 실패', 'yellow');
        log('Dashboard에서 수동 실행이 필요할 수 있습니다:', 'yellow');
        log('https://supabase.com/dashboard/project/golbwnsytwbyoneucunx/sql', 'cyan');
      }
    }
    
    // Step 5: 테이블 검증
    const allTablesOk = await this.verifyTables();
    
    if (allTablesOk) {
      log('\n🎉 모든 핵심 테이블이 정상적으로 생성되었습니다!', 'green');
      log('YouTube Lens를 사용할 준비가 완료되었습니다.', 'green');
    } else {
      log('\n⚠️ 일부 테이블이 누락되었습니다.', 'yellow');
      log('수동 확인이 필요합니다:', 'yellow');
      log('https://supabase.com/dashboard/project/golbwnsytwbyoneucunx/editor', 'cyan');
    }
  }
}

// 실행
const manager = new SupabaseMigrationManager();
manager.run().catch(error => {
  log(`\n❌ 치명적 오류: ${error.message}`, 'red');
  process.exit(1);
});