#!/usr/bin/env node

/**
 * API 일치성 검증 스크립트 v2.0
 * 
 * ✅ 올바른 패턴을 검증하고 구체적인 수정 지침을 제공합니다.
 * ❌ 자동 수정은 하지 않습니다 - 각 파일의 컨텍스트를 고려한 수동 수정이 필요합니다.
 * 
 * 올바른 패턴:
 * - Import: createRouteHandlerClient from '@supabase/auth-helpers-nextjs'
 * - Client: createRouteHandlerClient({ cookies })
 * - Auth: const { data: { user } } = await supabase.auth.getUser()
 * - Guard: if (!user) return 401 with { error: 'User not authenticated' }
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
  bold: '\x1b[1m'
};

// 올바른 패턴
const CORRECT_PATTERNS = {
  import: "import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'",
  creation: "createRouteHandlerClient({ cookies })",
  auth: "await supabase.auth.getUser()"
};

// 잘못된 패턴들과 해결 방법
const INCORRECT_PATTERNS = [
  { 
    pattern: /createServerClient.*from.*['"]@\/lib\/supabase/, 
    name: 'createServerClient from lib',
    solution: `✅ import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'`
  },
  { 
    pattern: /createSupabaseRouteHandlerClient/, 
    name: 'createSupabaseRouteHandlerClient',
    solution: '✅ createRouteHandlerClient({ cookies }) 사용'
  },
  { 
    pattern: /createSupabaseServerClient/, 
    name: 'createSupabaseServerClient',
    solution: '✅ createRouteHandlerClient({ cookies }) 사용'
  },
  { 
    pattern: /createServerClient.*from.*['"]@supabase\/ssr/, 
    name: 'createServerClient from @supabase/ssr',
    solution: `✅ import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'`
  },
  { 
    pattern: /auth\.getSession\(\)/, 
    name: 'getSession() instead of getUser()',
    solution: '✅ getUser() 사용 + 변수명 확인: const { data: { user } } = ...'
  }
];

// Service Role 클라이언트 예외 (특수 목적용)
const SERVICE_ROLE_EXCEPTION = /createSupabaseServiceRoleClient/;

// 특수 목적 파일들 (검증 제외)
const SPECIAL_PURPOSE_FILES = [
  'api-keys',      // API 키 관리는 Service Role 필요
  'debug',         // 디버그 파일은 제외
  'env-check',     // 환경 체크 파일
  'webhook'        // Webhook은 인증 불필요
];

class APIConsistencyChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checkedFiles = 0;
    this.problematicFiles = [];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.relative(process.cwd(), filePath);
    const issues = [];
    
    // 특수 목적 파일인지 확인
    const isSpecialFile = SPECIAL_PURPOSE_FILES.some(special => 
      filePath.includes(special)
    );
    
    if (isSpecialFile) {
      this.warnings.push({
        file: fileName,
        message: 'Special purpose file (검증 제외)'
      });
      return; // 특수 파일은 검증 건너뛰기
    }
    
    // Service Role 클라이언트는 특수 목적이므로 예외 처리
    if (SERVICE_ROLE_EXCEPTION.test(content)) {
      this.warnings.push({
        file: fileName,
        message: 'Uses Service Role Client (특수 목적 - 검토 필요)'
      });
    }

    // 잘못된 패턴 검사
    for (const { pattern, name, solution } of INCORRECT_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          type: 'error',
          pattern: name,
          solution: solution,
          line: this.findLineNumber(content, pattern)
        });
      }
    }

    // 올바른 패턴이 없는 경우
    if (!content.includes("import { createRouteHandlerClient }") && 
        !content.includes("from '@supabase/auth-helpers-nextjs'")) {
      // 인증이 필요한 API인지 확인
      if (content.includes('getUser') || content.includes('auth')) {
        issues.push({
          type: 'error',
          pattern: 'Missing correct import',
          line: 1
        });
      }
    }

    // 에러 응답 형식 확인
    if (content.includes('status: 401')) {
      const has401Format = content.includes("{ error: 'User not authenticated' }");
      if (!has401Format) {
        issues.push({
          type: 'warning',
          pattern: '401 error format inconsistent',
          line: this.findLineNumber(content, /status:\s*401/)
        });
      }
    }

    if (issues.length > 0) {
      this.problematicFiles.push({
        file: fileName,
        issues
      });
      
      issues.forEach(issue => {
        if (issue.type === 'error') {
          this.errors.push({
            file: fileName,
            message: issue.pattern,
            solution: issue.solution,
            line: issue.line
          });
        } else {
          this.warnings.push({
            file: fileName,
            message: issue.pattern,
            solution: issue.solution,
            line: issue.line
          });
        }
      });
    }

    this.checkedFiles++;
  }

  findLineNumber(content, pattern) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return 0;
  }

  async run() {
    this.log('🔍 API 일치성 검증 시작...', colors.cyan);
    this.log('=' .repeat(60), colors.cyan);

    // API route 파일 찾기
    const apiFiles = glob.sync('src/app/api/**/route.{ts,js}', {
      cwd: process.cwd()
    });

    this.log(`\n📁 검사할 API Route 파일: ${apiFiles.length}개\n`, colors.blue);

    // 각 파일 검사
    apiFiles.forEach(file => {
      this.checkFile(file);
    });

    // 결과 출력
    this.printResults();

    // 빌드 실패 조건
    const shouldFail = this.errors.length > 0;
    
    if (shouldFail) {
      this.log('\n❌ API 일치성 검증 실패!', colors.red + colors.bold);
      this.log('위의 오류들을 수정한 후 다시 시도하세요.', colors.red);
      process.exit(1);
    } else {
      this.log('\n✅ API 일치성 검증 통과!', colors.green + colors.bold);
      process.exit(0);
    }
  }

  printResults() {
    this.log('\n' + '='.repeat(60), colors.cyan);
    this.log('📊 검증 결과', colors.cyan + colors.bold);
    this.log('='.repeat(60), colors.cyan);

    // 통계
    this.log(`\n📈 통계:`, colors.blue);
    this.log(`  • 검사한 파일: ${this.checkedFiles}개`);
    this.log(`  • 문제 있는 파일: ${this.problematicFiles.length}개`);
    this.log(`  • 오류: ${this.errors.length}개`, this.errors.length > 0 ? colors.red : colors.green);
    this.log(`  • 경고: ${this.warnings.length}개`, this.warnings.length > 0 ? colors.yellow : colors.green);

    // 오류 상세
    if (this.errors.length > 0) {
      this.log(`\n❌ 오류 (반드시 수정 필요):`, colors.red + colors.bold);
      this.errors.forEach(error => {
        this.log(`  ${error.file}:${error.line}`, colors.red);
        this.log(`    문제: ${error.message}`, colors.red);
        if (error.solution) {
          this.log(`    해결: ${error.solution}`, colors.green);
        }
      });
    }

    // 경고 상세
    if (this.warnings.length > 0) {
      this.log(`\n⚠️  경고 (검토 필요):`, colors.yellow + colors.bold);
      this.warnings.forEach(warning => {
        this.log(`  ${warning.file}${warning.line ? ':' + warning.line : ''}`, colors.yellow);
        this.log(`    문제: ${warning.message}`, colors.yellow);
        if (warning.solution) {
          this.log(`    해결: ${warning.solution}`, colors.green);
        }
      });
    }

    // 올바른 패턴 안내
    this.log(`\n📚 올바른 패턴:`, colors.green + colors.bold);
    this.log(`  1. Import:`, colors.green);
    this.log(`     ${CORRECT_PATTERNS.import}`, colors.cyan);
    this.log(`  2. 클라이언트 생성:`, colors.green);
    this.log(`     const supabase = ${CORRECT_PATTERNS.creation}`, colors.cyan);
    this.log(`  3. 인증 체크:`, colors.green);
    this.log(`     const { data: { user } } = ${CORRECT_PATTERNS.auth}`, colors.cyan);
    this.log(`  4. 401 응답:`, colors.green);
    this.log(`     return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })`, colors.cyan);

    // 수정 가이드
    if (this.errors.length > 0) {
      this.log(`\n🔧 수정 가이드:`, colors.yellow + colors.bold);
      this.log(`\n  ⚠️ 자동 수정 도구는 사용하지 마세요!`, colors.red);
      this.log(`  각 파일을 개별적으로 확인하고 수정하세요.`, colors.yellow);
      this.log(`\n  📌 수정 시 주의사항:`, colors.cyan);
      this.log(`  1. 변수명 일치성 확인 - user 변수를 선언하고 참조하는지`, colors.yellow);
      this.log(`  2. 스코프 확인 - 변수가 올바른 스코프에서 사용되는지`, colors.yellow);
      this.log(`  3. 타입 안전성 - TypeScript 타입 체크 통과 확인`, colors.yellow);
      this.log(`  4. 런타임 검증 - 실제로 작동하는지 테스트`, colors.yellow);
      this.log(`\n  💡 명령어:`, colors.cyan);
      this.log(`  • npm run type-check - TypeScript 타입 체크`, colors.green);
      this.log(`  • npm run build - 빌드 테스트`, colors.green);
      this.log(`  • npm run dev - 로컬 테스트`, colors.green);
    }
  }
}

// 실행
const checker = new APIConsistencyChecker();
checker.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});