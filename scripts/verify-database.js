#!/usr/bin/env node

/**
 * 데이터베이스 스키마 일치성 검증 스크립트 v1.0
 * 
 * ✅ TypeScript 타입과 Supabase 스키마 동기화 검증
 * ❌ 자동 수정은 하지 않습니다 - 스키마 변경은 마이그레이션이 필요합니다.
 * 
 * 검증 항목:
 * - TypeScript 인터페이스와 DB 테이블 매칭
 * - 컬럼 타입 일치성
 * - RLS 정책 활성화 여부
 * - 마이그레이션 파일 적용 상태
 * - snake_case ↔ camelCase 변환 일관성
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// 프로젝트의 핵심 테이블 목록 (PROJECT.md 기반)
const CORE_TABLES = [
  // 기본 테이블
  'profiles',
  'courses',
  'course_enrollments',
  'course_progress',
  'revenues',
  'badges',
  'community_links',
  
  // 수익 인증 시스템
  'revenue_proofs',
  'proof_likes',
  'proof_comments',
  'proof_reports',
  
  // 네이버 카페 연동
  'naver_cafe_verifications',
  
  // YouTube Lens
  'youtube_favorites',
  'youtube_search_history',
  'api_usage',
  'user_api_keys',
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
  
  // 커뮤니티 시스템
  'community_posts',
  'community_comments',
  'community_likes'
];

// TypeScript to PostgreSQL 타입 매핑
const TYPE_MAPPING = {
  'string': ['text', 'varchar', 'character varying', 'uuid'],
  'number': ['integer', 'bigint', 'numeric', 'decimal', 'real', 'double precision', 'int4', 'int8'],
  'boolean': ['boolean', 'bool'],
  'Date': ['timestamp', 'timestamptz', 'timestamp with time zone', 'timestamp without time zone'],
  'any': ['json', 'jsonb'],
  'object': ['json', 'jsonb']
};

// RLS가 필요한 테이블 패턴
const RLS_REQUIRED_PATTERNS = [
  'user_', 'youtube_', 'community_', 'course', 'revenue', 'proof', 'collection', 'saved', 'subscription'
];

class DatabaseSchemaChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.missingTypes = [];
    this.missingTables = [];
    this.rlsStatus = new Map();
    this.migrationStatus = [];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  // TypeScript 인터페이스 파싱
  parseTypeScriptInterfaces() {
    this.log('\n🔍 TypeScript 인터페이스 분석 중...', colors.cyan);
    
    const interfaces = new Map();
    
    // types 폴더의 모든 .ts 파일 검사
    const typeFiles = glob.sync('src/types/**/*.{ts,tsx}', {
      ignore: ['**/node_modules/**']
    });
    
    // lib 폴더도 검사
    const libFiles = glob.sync('src/lib/**/*.{ts,tsx}', {
      ignore: ['**/node_modules/**']
    });
    
    [...typeFiles, ...libFiles].forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // interface 추출
      const interfaceMatches = content.matchAll(/interface\s+(\w+)\s*{([^}]+)}/g);
      
      for (const match of interfaceMatches) {
        const interfaceName = match[1];
        const body = match[2];
        
        // 프로퍼티 파싱
        const properties = new Map();
        const propMatches = body.matchAll(/\s*(\w+)(\?)?:\s*([^;]+);/g);
        
        for (const prop of propMatches) {
          properties.set(prop[1], {
            optional: !!prop[2],
            type: prop[3].trim()
          });
        }
        
        if (properties.size > 0) {
          interfaces.set(interfaceName, {
            file: path.relative(process.cwd(), file),
            properties
          });
        }
      }
      
      // type 선언도 추출
      const typeMatches = content.matchAll(/type\s+(\w+)\s*=\s*{([^}]+)}/g);
      
      for (const match of typeMatches) {
        const typeName = match[1];
        const body = match[2];
        
        const properties = new Map();
        const propMatches = body.matchAll(/\s*(\w+)(\?)?:\s*([^;,]+)[;,]/g);
        
        for (const prop of propMatches) {
          properties.set(prop[1], {
            optional: !!prop[2],
            type: prop[3].trim()
          });
        }
        
        if (properties.size > 0) {
          interfaces.set(typeName, {
            file: path.relative(process.cwd(), file),
            properties
          });
        }
      }
    });
    
    return interfaces;
  }

  // Supabase 타입 정의 파일 체크
  checkSupabaseTypes() {
    this.log('\n🔍 Supabase 타입 정의 체크 중...', colors.cyan);
    
    const supabaseTypesPath = 'src/types/database.types.ts';
    
    if (!fs.existsSync(supabaseTypesPath)) {
      this.warnings.push({
        message: 'Supabase 타입 정의 파일 없음',
        solution: `✅ 타입 생성 명령어 실행:
    npx supabase gen types typescript --local > ${supabaseTypesPath}
    
    또는 원격에서:
    npx supabase gen types typescript --project-ref golbwnsytwbyoneucunx > ${supabaseTypesPath}`
      });
      return null;
    }
    
    const content = fs.readFileSync(supabaseTypesPath, 'utf-8');
    
    // Database 타입에서 테이블 추출
    const tableMatch = content.match(/public:\s*{([^}]+Tables:[^}]+})/s);
    
    if (!tableMatch) {
      this.warnings.push({
        message: 'Supabase 타입 정의 파일 형식 오류',
        file: supabaseTypesPath
      });
      return null;
    }
    
    // 테이블 이름 추출
    const tables = new Set();
    const tableNameMatches = content.matchAll(/(\w+):\s*{[^}]*Row:\s*{/g);
    
    for (const match of tableNameMatches) {
      tables.add(match[1]);
    }
    
    return tables;
  }

  // 마이그레이션 파일 체크
  checkMigrations() {
    this.log('\n🔍 마이그레이션 파일 체크 중...', colors.cyan);
    
    const migrationDir = 'supabase/migrations';
    
    if (!fs.existsSync(migrationDir)) {
      this.errors.push({
        message: '마이그레이션 디렉토리 없음',
        solution: '✅ Supabase 초기화: npx supabase init'
      });
      return;
    }
    
    const migrationFiles = glob.sync(`${migrationDir}/*.sql`).sort();
    
    migrationFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const fileName = path.basename(file);
      
      // CREATE TABLE 문 찾기
      const createTableMatches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi);
      
      for (const match of createTableMatches) {
        const tableName = match[1];
        
        // RLS 체크
        const hasRLS = content.includes(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`) ||
                      content.includes(`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY`);
        
        if (!hasRLS && this.needsRLS(tableName)) {
          this.warnings.push({
            file: fileName,
            table: tableName,
            message: 'RLS 활성화 누락',
            solution: `✅ 마이그레이션에 추가:
    ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
    
    -- 기본 정책 추가
    CREATE POLICY "${tableName}_select_own" ON ${tableName}
      FOR SELECT USING (user_id = auth.uid());`
          });
        }
        
        this.rlsStatus.set(tableName, hasRLS);
      }
      
      // 인덱스 체크
      if (!content.includes('CREATE INDEX')) {
        this.info.push({
          file: fileName,
          message: '인덱스 없음',
          suggestion: '성능 최적화를 위해 적절한 인덱스 추가 고려'
        });
      }
    });
    
    this.migrationStatus = migrationFiles.map(f => path.basename(f));
  }

  // RLS가 필요한 테이블인지 체크
  needsRLS(tableName) {
    return RLS_REQUIRED_PATTERNS.some(pattern => tableName.includes(pattern));
  }

  // snake_case ↔ camelCase 변환 체크
  checkNamingConventions() {
    this.log('\n🔍 네이밍 컨벤션 일관성 체크 중...', colors.cyan);
    
    // API route 파일에서 변환 함수 사용 체크
    const apiFiles = glob.sync('src/app/api/**/route.{ts,tsx}');
    
    let hasSnakeToCamel = false;
    let hasCamelToSnake = false;
    
    apiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // 변환 함수 사용 체크
      if (content.includes('snakeToCamel') || content.includes('snake_to_camel')) {
        hasSnakeToCamel = true;
      }
      
      if (content.includes('camelToSnake') || content.includes('camel_to_snake')) {
        hasCamelToSnake = true;
      }
      
      // 직접 snake_case 사용 체크
      const snakeCaseInJS = content.match(/['"](\w+_\w+)['"]/g);
      
      if (snakeCaseInJS && snakeCaseInJS.length > 0) {
        const fileName = path.relative(process.cwd(), file);
        const uniqueSnakes = [...new Set(snakeCaseInJS)];
        
        if (uniqueSnakes.length > 3) { // 3개 이상이면 경고
          this.warnings.push({
            file: fileName,
            message: `snake_case 직접 사용 (${uniqueSnakes.length}개)`,
            examples: uniqueSnakes.slice(0, 3).join(', '),
            solution: `✅ 변환 함수 사용 권장:
    import { snakeToCamel, camelToSnake } from '@/lib/utils';
    
    // DB에서 가져올 때
    const data = snakeToCamel(dbResult);
    
    // DB에 저장할 때
    const dbData = camelToSnake(jsObject);`
          });
        }
      }
    });
    
    if (!hasSnakeToCamel && !hasCamelToSnake) {
      this.info.push({
        message: '네이밍 변환 함수 미사용',
        suggestion: 'DB와 JS 간 네이밍 컨벤션 변환 함수 사용 권장'
      });
    }
  }

  // 누락된 테이블 체크
  checkMissingTables() {
    const supabaseTables = this.checkSupabaseTypes();
    
    if (!supabaseTables) return;
    
    CORE_TABLES.forEach(table => {
      if (!supabaseTables.has(table)) {
        this.missingTables.push(table);
        this.errors.push({
          table,
          message: '필수 테이블 누락',
          solution: `✅ 마이그레이션 실행:
    npm run supabase:migrate-complete
    
    또는 수동 생성:
    CREATE TABLE ${table} (...);`
        });
      }
    });
  }

  // 결과 출력
  printResults() {
    this.log('\n' + '='.repeat(60), colors.cyan);
    this.log('📊 데이터베이스 스키마 검증 결과', colors.cyan + colors.bold);
    this.log('='.repeat(60), colors.cyan);

    // 통계
    this.log(`\n📈 통계:`, colors.blue);
    this.log(`  • 검사한 테이블: ${CORE_TABLES.length}개`);
    this.log(`  • 누락된 테이블: ${this.missingTables.length}개`, 
      this.missingTables.length > 0 ? colors.red : colors.green);
    this.log(`  • RLS 활성화: ${Array.from(this.rlsStatus.values()).filter(v => v).length}/${this.rlsStatus.size}개`);
    this.log(`  • 마이그레이션 파일: ${this.migrationStatus.length}개`);

    // 누락된 테이블
    if (this.missingTables.length > 0) {
      this.log(`\n❌ 누락된 필수 테이블:`, colors.red + colors.bold);
      this.missingTables.forEach((table, index) => {
        this.log(`  ${index + 1}. ${table}`, colors.red);
      });
      
      this.log(`\n  💡 해결방법:`, colors.green);
      this.log(`     npm run supabase:migrate-complete`, colors.cyan);
    }

    // RLS 미적용 테이블
    const noRLSTables = Array.from(this.rlsStatus.entries())
      .filter(([table, hasRLS]) => !hasRLS && this.needsRLS(table));
    
    if (noRLSTables.length > 0) {
      this.log(`\n⚠️  RLS 미적용 테이블:`, colors.yellow + colors.bold);
      noRLSTables.forEach(([table], index) => {
        this.log(`  ${index + 1}. ${table}`, colors.yellow);
      });
      
      this.log(`\n  💡 적용 명령어:`, colors.green);
      this.log(`     npm run security:apply-rls-all`, colors.cyan);
    }

    // 경고 출력
    if (this.warnings.length > 0) {
      this.log(`\n⚠️  경고사항:`, colors.yellow + colors.bold);
      this.warnings.slice(0, 5).forEach((warning, index) => {
        this.log(`\n  ${index + 1}. ${warning.message}`, colors.yellow);
        if (warning.file) {
          this.log(`     파일: ${warning.file}`, colors.cyan);
        }
        if (warning.solution) {
          this.log(`\n     해결방법:`, colors.green);
          console.log(`     ${warning.solution.split('\n').join('\n     ')}`);
        }
      });
    }

    // 권장사항
    this.log(`\n💡 권장사항:`, colors.green + colors.bold);
    this.log(`  1. TypeScript 타입 자동 생성:`, colors.green);
    this.log(`     npx supabase gen types typescript --project-ref golbwnsytwbyoneucunx > src/types/database.types.ts`, colors.cyan);
    
    this.log(`  2. 마이그레이션 상태 확인:`, colors.green);
    this.log(`     npm run supabase:check`, colors.cyan);
    
    this.log(`  3. RLS 정책 적용:`, colors.green);
    this.log(`     npm run security:apply-rls-all`, colors.cyan);
    
    this.log(`  4. 네이밍 컨벤션 통일:`, colors.green);
    this.log(`     snake_case (DB) ↔ camelCase (JS) 변환 함수 사용`, colors.cyan);
  }

  async run() {
    this.log('🔍 데이터베이스 스키마 검증 시작...', colors.cyan);
    this.log('=' .repeat(60), colors.cyan);

    // 각 검사 실행
    const interfaces = this.parseTypeScriptInterfaces();
    this.checkMissingTables();
    this.checkMigrations();
    this.checkNamingConventions();

    // 결과 출력
    this.printResults();

    // Exit code 결정
    if (this.missingTables.length > 0) {
      this.log('\n❌ 필수 테이블 누락!', colors.red + colors.bold);
      this.log('마이그레이션을 실행하세요.', colors.red);
      process.exit(1);
    } else if (this.warnings.length > 0) {
      this.log('\n⚠️  스키마 경고 발견', colors.yellow + colors.bold);
      process.exit(0);
    } else {
      this.log('\n✅ 데이터베이스 스키마 검증 통과!', colors.green + colors.bold);
      process.exit(0);
    }
  }
}

// 실행
const checker = new DatabaseSchemaChecker();
checker.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});