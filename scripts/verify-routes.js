#!/usr/bin/env node

/**
 * 라우트 보호 및 구조 일관성 검증 스크립트 v1.0
 * 
 * ✅ API 라우트 보호 상태를 검증하고 구체적인 수정 지침을 제공합니다.
 * ❌ 자동 수정은 하지 않습니다 - 각 라우트의 보안 요구사항을 고려한 수동 수정이 필요합니다.
 * 
 * 검증 항목:
 * - 인증 체크 여부
 * - 적절한 HTTP 메서드 구현
 * - 에러 응답 형식 일관성
 * - RLS 정책 관련 테이블 접근
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

// 인증이 필요 없는 공개 라우트
const PUBLIC_ROUTES = [
  'health',
  'debug/env-check',
  'webhook',
  'payment/confirm',  // 결제 확인은 외부 서비스 콜백
  'payment/fail'      // 결제 실패는 외부 서비스 콜백
];

// 특수 권한이 필요한 라우트
const ADMIN_ROUTES = [
  'admin/',
  'revenue-proof/seed'
];

// RLS가 필요한 테이블들
const RLS_REQUIRED_TABLES = [
  'youtube_lens_',
  'user_',
  'community_',
  'courses',
  'coupons',
  'revenue_proof'
];

class RouteProtectionChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.checkedFiles = 0;
    this.protectedRoutes = 0;
    this.unprotectedRoutes = 0;
    this.problematicFiles = [];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  isPublicRoute(filePath) {
    return PUBLIC_ROUTES.some(route => filePath.includes(route));
  }

  isAdminRoute(filePath) {
    return ADMIN_ROUTES.some(route => filePath.includes(route));
  }

  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.relative(process.cwd(), filePath);
    const issues = [];
    const isPublic = this.isPublicRoute(filePath);
    const isAdmin = this.isAdminRoute(filePath);

    // HTTP 메서드 확인
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const implementedMethods = methods.filter(method => 
      new RegExp(`export\\s+(async\\s+)?function\\s+${method}`).test(content)
    );

    if (implementedMethods.length === 0) {
      issues.push({
        type: 'error',
        pattern: 'HTTP 메서드 미구현',
        solution: `✅ 최소 하나의 HTTP 메서드 구현 필요
    export async function GET(request: Request) {
      // 구현
    }`,
        line: 1
      });
    }

    // 공개 라우트가 아닌 경우 인증 체크
    if (!isPublic) {
      const hasAuthCheck = /getUser\(\)/.test(content);
      const hasSessionCheck = /getSession\(\)/.test(content);
      const has401Response = /status:\s*401/.test(content);

      if (!hasAuthCheck) {
        if (hasSessionCheck) {
          const line = this.findLineNumber(content, /getSession\(\)/);
          issues.push({
            type: 'error',
            pattern: 'getSession() 사용 (보안 취약)',
            solution: `✅ getUser()로 변경 필요
    // 변경 전
    const { data: { session } } = await supabase.auth.getSession();
    
    // 변경 후
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }`,
            line: line
          });
        } else {
          issues.push({
            type: 'error',
            pattern: '인증 체크 누락',
            solution: `✅ 인증 체크 추가 필요
    import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
    import { cookies } from 'next/headers';
    
    export async function ${implementedMethods[0] || 'GET'}(request: Request) {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not authenticated' },
          { status: 401 }
        );
      }
      
      // 비즈니스 로직...
    }`,
            line: 1
          });
        }
        this.unprotectedRoutes++;
      } else {
        this.protectedRoutes++;
        
        // 401 응답 형식 확인
        if (has401Response) {
          const correct401Format = /\{\s*error:\s*['"]User not authenticated['"]\s*\}/.test(content);
          if (!correct401Format) {
            const line = this.findLineNumber(content, /status:\s*401/);
            issues.push({
              type: 'warning',
              pattern: '401 에러 형식 불일치',
              solution: `✅ 표준 401 응답 형식 사용
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );`,
              line: line
            });
          }
        }
      }
    } else {
      this.info.push({
        file: fileName,
        message: '공개 라우트 (인증 불필요)',
        pattern: 'PUBLIC_ROUTE'
      });
    }

    // 관리자 라우트 체크
    if (isAdmin) {
      const hasAdminCheck = /isAdmin|role.*admin|checkAdmin/i.test(content);
      if (!hasAdminCheck) {
        issues.push({
          type: 'warning',
          pattern: '관리자 권한 체크 없음',
          solution: `💡 관리자 권한 체크 추가 권장
    // user 정보 가져온 후
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }`,
          line: 1
        });
      }
    }

    // RLS 테이블 접근 체크
    RLS_REQUIRED_TABLES.forEach(table => {
      if (content.includes(`.from('${table}`) || content.includes(`.from("${table}`)) {
        const hasUserId = /user_id.*user\.id|user\.id.*user_id/.test(content);
        if (!hasUserId) {
          issues.push({
            type: 'warning',
            pattern: `RLS 테이블 ${table} 접근 시 user_id 필터 없음`,
            solution: `💡 user_id 필터 추가 권장
    const { data } = await supabase
      .from('${table}')
      .select('*')
      .eq('user_id', user.id);  // RLS 정책과 일치`,
            line: this.findLineNumber(content, new RegExp(`\\.from\\(['"\]${table}`))
          });
        }
      }
    });

    // Request/Response 타입 체크
    implementedMethods.forEach(method => {
      const methodRegex = new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\s*\\([^)]*\\)`);
      const methodMatch = content.match(methodRegex);
      
      if (methodMatch) {
        // Request 타입 체크
        if (!methodMatch[0].includes(': Request') && !methodMatch[0].includes(': NextRequest')) {
          issues.push({
            type: 'info',
            pattern: `${method} 메서드 Request 타입 누락`,
            solution: `💡 Request 타입 명시 권장
    export async function ${method}(request: Request) {
      // 또는
    export async function ${method}(request: NextRequest) {`,
            line: this.findLineNumber(content, methodRegex)
          });
        }
      }
    });

    // 에러 처리 체크
    if (content.includes('try {')) {
      const hasCatch = content.includes('catch');
      if (!hasCatch) {
        issues.push({
          type: 'warning',
          pattern: 'try 블록에 catch 없음',
          solution: `✅ 에러 처리 추가
    try {
      // 비즈니스 로직
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }`,
          line: this.findLineNumber(content, /try\s*{/)
        });
      }
    }

    // CORS 헤더 체크 (필요한 경우)
    if (content.includes('OPTIONS')) {
      const hasCORS = /Access-Control-Allow/i.test(content);
      if (!hasCORS) {
        issues.push({
          type: 'info',
          pattern: 'OPTIONS 메서드에 CORS 헤더 없음',
          solution: `💡 CORS 헤더 추가
    export async function OPTIONS(request: Request) {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }`,
          line: this.findLineNumber(content, /OPTIONS/)
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
            ...issue
          });
        } else if (issue.type === 'warning') {
          this.warnings.push({
            file: fileName,
            ...issue
          });
        } else if (issue.type === 'info') {
          this.info.push({
            file: fileName,
            ...issue
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
    this.log('🔍 라우트 보호 및 구조 검증 시작...', colors.cyan);
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
      this.log('\n❌ 라우트 보호 검증 실패!', colors.red + colors.bold);
      this.log('위의 오류들을 수정한 후 다시 시도하세요.', colors.red);
      process.exit(1);
    } else {
      this.log('\n✅ 라우트 보호 검증 통과!', colors.green + colors.bold);
      process.exit(0);
    }
  }

  printResults() {
    this.log('\n' + '='.repeat(60), colors.cyan);
    this.log('📊 검증 결과', colors.cyan + colors.bold);
    this.log('='.repeat(60), colors.cyan);

    // 통계
    this.log(`\n📈 통계:`, colors.blue);
    this.log(`  • 검사한 라우트: ${this.checkedFiles}개`);
    this.log(`  • 보호된 라우트: ${this.protectedRoutes}개`, colors.green);
    this.log(`  • 보호되지 않은 라우트: ${this.unprotectedRoutes}개`, this.unprotectedRoutes > 0 ? colors.red : colors.green);
    this.log(`  • 문제 있는 파일: ${this.problematicFiles.length}개`);
    this.log(`  • 오류: ${this.errors.length}개`, this.errors.length > 0 ? colors.red : colors.green);
    this.log(`  • 경고: ${this.warnings.length}개`, this.warnings.length > 0 ? colors.yellow : colors.green);
    this.log(`  • 정보: ${this.info.length}개`, colors.blue);

    // 오류 상세
    if (this.errors.length > 0) {
      this.log(`\n❌ 오류 (반드시 수정 필요):`, colors.red + colors.bold);
      this.errors.forEach((error, index) => {
        this.log(`\n  ${index + 1}. ${error.file}${error.line ? ':' + error.line : ''}`, colors.red);
        this.log(`     문제: ${error.pattern}`, colors.red);
        this.log(`\n     해결방법:`, colors.green);
        console.log(`     ${error.solution.split('\n').join('\n     ')}`);
        this.log('     ' + '-'.repeat(50), colors.cyan);
      });
    }

    // 경고 상세 (처음 5개만)
    if (this.warnings.length > 0) {
      const displayWarnings = this.warnings.slice(0, 5);
      this.log(`\n⚠️  경고 (보안 강화 권장): ${this.warnings.length}개 중 ${displayWarnings.length}개 표시`, colors.yellow + colors.bold);
      displayWarnings.forEach((warning, index) => {
        this.log(`\n  ${index + 1}. ${warning.file}${warning.line ? ':' + warning.line : ''}`, colors.yellow);
        this.log(`     문제: ${warning.pattern}`, colors.yellow);
        if (warning.solution) {
          this.log(`\n     권장사항:`, colors.green);
          console.log(`     ${warning.solution.split('\n').join('\n     ')}`);
        }
      });
      
      if (this.warnings.length > 5) {
        this.log(`\n  ... 외 ${this.warnings.length - 5}개 경고`, colors.yellow);
      }
    }

    // 정보 요약
    if (this.info.length > 0) {
      const publicRoutes = this.info.filter(i => i.pattern === 'PUBLIC_ROUTE');
      if (publicRoutes.length > 0) {
        this.log(`\n💡 공개 라우트 (${publicRoutes.length}개):`, colors.blue);
        publicRoutes.forEach(route => {
          this.log(`  • ${route.file}`, colors.cyan);
        });
      }
    }

    // 라우트 보호 가이드
    this.log(`\n📚 라우트 보호 가이드:`, colors.green + colors.bold);
    this.log(`  1. 인증 체크:`, colors.green);
    this.log(`     모든 비공개 라우트는 getUser() 필수`, colors.cyan);
    this.log(`  2. 에러 응답:`, colors.green);
    this.log(`     401: { error: 'User not authenticated' }`, colors.cyan);
    this.log(`  3. RLS 테이블:`, colors.green);
    this.log(`     user_id 필터 추가로 이중 보호`, colors.cyan);
    this.log(`  4. 관리자 라우트:`, colors.green);
    this.log(`     role 체크 추가 필수`, colors.cyan);

    // 보안 체크리스트
    if (this.errors.length > 0 || this.warnings.length > 0) {
      this.log(`\n🔒 보안 체크리스트:`, colors.yellow + colors.bold);
      this.log(`  ☐ 모든 라우트에 인증 체크 추가`, colors.yellow);
      this.log(`  ☐ getSession() → getUser() 변경`, colors.yellow);
      this.log(`  ☐ 401 응답 형식 통일`, colors.yellow);
      this.log(`  ☐ RLS 테이블 user_id 필터 확인`, colors.yellow);
      this.log(`  ☐ 관리자 라우트 권한 체크`, colors.yellow);
    }
  }
}

// 실행
const checker = new RouteProtectionChecker();
checker.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});