#!/usr/bin/env node

/**
 * 런타임 설정 및 환경 일관성 검증 스크립트 v1.0
 * 
 * ✅ API Route의 런타임 설정과 환경 변수 사용을 검증합니다.
 * ❌ 자동 수정은 하지 않습니다 - 각 라우트의 요구사항을 고려한 수동 설정이 필요합니다.
 * 
 * 검증 항목:
 * - runtime 설정 (nodejs vs edge)
 * - 환경 변수 하드코딩 여부
 * - 동적 설정 (dynamic, revalidate)
 * - 에러 로깅 패턴
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

// Runtime이 필요한 경우들
const RUNTIME_REQUIREMENTS = {
  'nodejs': [
    'fs',            // 파일 시스템 접근
    'child_process', // 프로세스 실행
    'crypto',        // Node.js crypto
    'stream',        // Stream API
    'buffer',        // Buffer operations
    'formidable',    // 파일 업로드
    'multer'         // 파일 업로드
  ],
  'edge': [
    // Edge Runtime은 제한적이지만 빠름
    // 주로 간단한 API, 인증, 리다이렉션에 사용
  ]
};

// 환경 변수 패턴
const ENV_PATTERNS = {
  hardcoded: [
    {
      pattern: /NEXT_PUBLIC_[A-Z_]+\s*=\s*["'][^"']+["']/,
      name: '환경 변수 하드코딩',
      solution: `✅ process.env 사용
    // 변경 전
    const API_KEY = "sk-abc123...";
    
    // 변경 후
    const API_KEY = process.env.API_KEY;
    
    // .env.local에 추가
    API_KEY=sk-abc123...`
    },
    {
      pattern: /supabase\.com\/[^/]+\/[^/'"]+/,
      name: 'Supabase URL 하드코딩',
      solution: `✅ 환경 변수 사용
    // 변경 전
    const url = "https://xyz.supabase.com/...";
    
    // 변경 후
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;`
    },
    {
      pattern: /(api_key|apiKey|API_KEY|secret|password|token)\s*[:=]\s*["'][^"']+["']/,
      name: '비밀 키 하드코딩',
      solution: `🚨 즉시 수정 필요!
    절대 키를 하드코딩하지 마세요.
    1. .env.local에 키 추가
    2. process.env로 접근
    3. Git에서 파일 기록 삭제 필요`
    }
  ]
};

// 캐싱 및 동적 설정
const PERFORMANCE_PATTERNS = {
  caching: {
    pattern: /export\s+const\s+(revalidate|dynamic)/,
    examples: {
      'revalidate': `// 캐싱 설정 (초 단위)
    export const revalidate = 60; // 60초마다 재검증
    export const revalidate = 0;  // 캐싱 안 함
    export const revalidate = false; // 무한 캐싱`,
      'dynamic': `// 동적 렌더링 설정
    export const dynamic = 'auto';  // 자동 (기본값)
    export const dynamic = 'force-dynamic'; // 항상 동적
    export const dynamic = 'force-static';  // 항상 정적
    export const dynamic = 'error'; // 동적이면 에러`
    }
  }
};

class RuntimeConsistencyChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.checkedFiles = 0;
    this.filesWithRuntime = 0;
    this.filesWithoutRuntime = 0;
    this.problematicFiles = [];
    this.runtimeStats = {
      nodejs: 0,
      edge: 0,
      unspecified: 0
    };
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.relative(process.cwd(), filePath);
    const issues = [];

    // Runtime 설정 확인
    const runtimeMatch = content.match(/export\s+const\s+runtime\s*=\s*["'](\w+)["']/);
    if (runtimeMatch) {
      this.filesWithRuntime++;
      const runtime = runtimeMatch[1];
      
      if (runtime === 'nodejs') {
        this.runtimeStats.nodejs++;
      } else if (runtime === 'edge') {
        this.runtimeStats.edge++;
        
        // Edge runtime 제약 확인
        RUNTIME_REQUIREMENTS.nodejs.forEach(module => {
          if (content.includes(module)) {
            issues.push({
              type: 'error',
              pattern: `Edge Runtime에서 ${module} 사용 불가`,
              solution: `✅ 다음 중 하나 선택:
    1. runtime을 'nodejs'로 변경
       export const runtime = 'nodejs';
    
    2. ${module} 사용 제거하고 Edge 호환 대안 사용`,
              line: this.findLineNumber(content, new RegExp(module))
            });
          }
        });
      } else {
        issues.push({
          type: 'warning',
          pattern: `알 수 없는 runtime: ${runtime}`,
          solution: `✅ 올바른 runtime 사용
    export const runtime = 'nodejs'; // 또는
    export const runtime = 'edge';`,
          line: this.findLineNumber(content, runtimeMatch[0])
        });
      }
    } else {
      this.filesWithoutRuntime++;
      this.runtimeStats.unspecified++;
      
      // Runtime이 필요한지 판단
      let needsNodejs = false;
      let reason = '';
      
      RUNTIME_REQUIREMENTS.nodejs.forEach(module => {
        if (content.includes(module)) {
          needsNodejs = true;
          reason = module;
        }
      });
      
      // 파일 업로드 확인
      if (content.includes('FormData') || content.includes('multipart')) {
        needsNodejs = true;
        reason = '파일 업로드';
      }
      
      if (needsNodejs) {
        issues.push({
          type: 'info',
          pattern: `Runtime 미지정 (${reason} 사용)`,
          solution: `💡 runtime 설정 권장
    export const runtime = 'nodejs'; // ${reason} 때문에 필요
    
    파일 상단에 추가하세요.`,
          line: 1
        });
      }
    }

    // 환경 변수 하드코딩 확인
    ENV_PATTERNS.hardcoded.forEach(({ pattern, name, solution }) => {
      if (pattern.test(content)) {
        const line = this.findLineNumber(content, pattern);
        const match = content.match(pattern);
        
        // 일부 예외 처리 (예: 예제 코드, 주석)
        const lineContent = content.split('\n')[line - 1];
        if (lineContent && (lineContent.includes('//') || lineContent.includes('/*'))) {
          return; // 주석은 무시
        }
        
        issues.push({
          type: name.includes('비밀') ? 'error' : 'warning',
          pattern: name,
          solution: solution,
          line: line,
          context: match ? match[0] : ''
        });
      }
    });

    // process.env 사용 패턴 확인
    if (content.includes('process.env')) {
      const envUsages = content.match(/process\.env\.([A-Z_]+)/g);
      if (envUsages) {
        const uniqueEnvs = [...new Set(envUsages.map(e => e.replace('process.env.', '')))];
        
        // 필수 환경 변수 체크
        const requiredEnvs = [
          'NEXT_PUBLIC_SUPABASE_URL',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          'SUPABASE_SERVICE_ROLE_KEY'
        ];
        
        uniqueEnvs.forEach(env => {
          if (!env.startsWith('NEXT_PUBLIC_') && 
              !requiredEnvs.includes(env) && 
              !['NODE_ENV', 'VERCEL', 'CI'].includes(env)) {
            issues.push({
              type: 'info',
              pattern: `환경 변수 ${env} 사용`,
              solution: `💡 .env.local에 정의 확인
    ${env}=your_value_here
    
    서버 전용 변수는 NEXT_PUBLIC_ 접두사 없이 사용`,
              line: this.findLineNumber(content, new RegExp(`process\\.env\\.${env}`))
            });
          }
        });
      }
    }

    // 캐싱 설정 확인
    const revalidateMatch = content.match(/export\s+const\s+revalidate\s*=\s*(.+);/);
    const dynamicMatch = content.match(/export\s+const\s+dynamic\s*=\s*(.+);/);
    
    if (revalidateMatch || dynamicMatch) {
      if (revalidateMatch) {
        const value = revalidateMatch[1].trim();
        if (value === '0') {
          issues.push({
            type: 'info',
            pattern: 'revalidate = 0 (캐싱 안 함)',
            solution: `💡 캐싱을 사용하면 성능 향상
    export const revalidate = 60; // 60초 캐싱`,
            line: this.findLineNumber(content, revalidateMatch[0])
          });
        }
      }
      
      if (dynamicMatch) {
        const value = dynamicMatch[1].trim().replace(/['"]/g, '');
        if (value === 'force-dynamic') {
          issues.push({
            type: 'info',
            pattern: '강제 동적 렌더링',
            solution: `💡 필요한 경우에만 사용
    // 동적 데이터가 필요 없으면:
    export const dynamic = 'auto';`,
            line: this.findLineNumber(content, dynamicMatch[0])
          });
        }
      }
    }

    // console.error 사용 패턴
    if (content.includes('console.error')) {
      const errorCount = (content.match(/console\.error/g) || []).length;
      if (errorCount > 0) {
        issues.push({
          type: 'info',
          pattern: `console.error 사용 (${errorCount}개)`,
          solution: `💡 프로덕션 로깅 고려
    // 개발 환경에서만 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
    }
    
    // 또는 로깅 서비스 사용 (Sentry, LogRocket 등)`,
          line: this.findLineNumber(content, /console\.error/)
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
      if (typeof pattern === 'string') {
        if (lines[i].includes(pattern)) {
          return i + 1;
        }
      } else if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return 0;
  }

  async run() {
    this.log('🔍 런타임 설정 및 환경 일관성 검증 시작...', colors.cyan);
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

    // 빌드 실패 조건 (하드코딩된 비밀 키가 있으면)
    const hasCriticalErrors = this.errors.some(e => 
      e.pattern && e.pattern.includes('비밀')
    );
    
    if (hasCriticalErrors) {
      this.log('\n🚨 치명적 보안 문제 발견!', colors.red + colors.bold);
      this.log('하드코딩된 비밀 키를 즉시 제거하세요!', colors.red);
      process.exit(1);
    } else if (this.errors.length > 0) {
      this.log('\n⚠️  런타임 검증 경고', colors.yellow + colors.bold);
      this.log('위의 문제들을 검토하세요.', colors.yellow);
      process.exit(0); // 경고만 있으면 빌드는 계속
    } else {
      this.log('\n✅ 런타임 설정 검증 통과!', colors.green + colors.bold);
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
    this.log(`  • Runtime 설정된 파일: ${this.filesWithRuntime}개`, colors.green);
    this.log(`  • Runtime 미설정 파일: ${this.filesWithoutRuntime}개`, colors.yellow);
    this.log(`\n  Runtime 분포:`, colors.cyan);
    this.log(`  • nodejs: ${this.runtimeStats.nodejs}개`, colors.green);
    this.log(`  • edge: ${this.runtimeStats.edge}개`, colors.blue);
    this.log(`  • 미지정: ${this.runtimeStats.unspecified}개`, colors.yellow);
    this.log(`\n  문제 발견:`, colors.cyan);
    this.log(`  • 오류: ${this.errors.length}개`, this.errors.length > 0 ? colors.red : colors.green);
    this.log(`  • 경고: ${this.warnings.length}개`, this.warnings.length > 0 ? colors.yellow : colors.green);
    this.log(`  • 정보: ${this.info.length}개`, colors.blue);

    // 오류 상세
    if (this.errors.length > 0) {
      this.log(`\n❌ 오류 (수정 필요):`, colors.red + colors.bold);
      this.errors.forEach((error, index) => {
        this.log(`\n  ${index + 1}. ${error.file}:${error.line}`, colors.red);
        this.log(`     문제: ${error.pattern}`, colors.red);
        if (error.context) {
          this.log(`     발견: ${error.context}`, colors.yellow);
        }
        this.log(`\n     해결방법:`, colors.green);
        console.log(`     ${error.solution.split('\n').join('\n     ')}`);
        this.log('     ' + '-'.repeat(50), colors.cyan);
      });
    }

    // 경고 상세 (처음 3개만)
    if (this.warnings.length > 0) {
      const displayWarnings = this.warnings.slice(0, 3);
      this.log(`\n⚠️  경고 (검토 필요): ${this.warnings.length}개 중 ${displayWarnings.length}개 표시`, colors.yellow + colors.bold);
      displayWarnings.forEach((warning, index) => {
        this.log(`\n  ${index + 1}. ${warning.file}:${warning.line}`, colors.yellow);
        this.log(`     문제: ${warning.pattern}`, colors.yellow);
        if (warning.context) {
          this.log(`     발견: ${warning.context}`, colors.cyan);
        }
        if (warning.solution) {
          this.log(`\n     권장사항:`, colors.green);
          console.log(`     ${warning.solution.split('\n').join('\n     ')}`);
        }
      });
      
      if (this.warnings.length > 3) {
        this.log(`\n  ... 외 ${this.warnings.length - 3}개 경고`, colors.yellow);
      }
    }

    // Runtime 가이드
    this.log(`\n📚 Runtime 선택 가이드:`, colors.green + colors.bold);
    this.log(`\n  🟢 nodejs (기본값):`, colors.green);
    this.log(`     • 모든 Node.js API 사용 가능`, colors.cyan);
    this.log(`     • 파일 시스템, 데이터베이스 직접 접근`, colors.cyan);
    this.log(`     • 무거운 연산, 파일 업로드 처리`, colors.cyan);
    this.log(`     • 콜드 스타트 시간이 길 수 있음`, colors.yellow);
    
    this.log(`\n  ⚡ edge:`, colors.blue);
    this.log(`     • 전 세계 엣지 로케이션에서 실행`, colors.cyan);
    this.log(`     • 매우 빠른 콜드 스타트`, colors.cyan);
    this.log(`     • 제한사항: Node.js API 사용 불가`, colors.yellow);
    this.log(`     • 적합: 인증, 리다이렉션, 간단한 API`, colors.cyan);

    // 환경 변수 가이드
    this.log(`\n🔐 환경 변수 가이드:`, colors.green + colors.bold);
    this.log(`  1. 클라이언트 변수:`, colors.green);
    this.log(`     NEXT_PUBLIC_ 접두사 필수`, colors.cyan);
    this.log(`  2. 서버 전용 변수:`, colors.green);
    this.log(`     접두사 없이 사용 (보안상 안전)`, colors.cyan);
    this.log(`  3. 필수 파일:`, colors.green);
    this.log(`     .env.local (Git 무시됨)`, colors.cyan);
    this.log(`  4. 절대 금지:`, colors.red);
    this.log(`     비밀 키 하드코딩`, colors.red);

    // 권장사항
    if (this.filesWithoutRuntime > 0) {
      this.log(`\n💡 권장사항:`, colors.yellow + colors.bold);
      this.log(`  ${this.filesWithoutRuntime}개 파일에 runtime 설정이 없습니다.`, colors.yellow);
      this.log(`  기본값은 'nodejs'이지만, 명시적 설정을 권장합니다:`, colors.cyan);
      this.log(`\n  // 파일 상단에 추가`, colors.green);
      this.log(`  export const runtime = 'nodejs'; // 또는 'edge'`, colors.cyan);
    }
  }
}

// 실행
const checker = new RuntimeConsistencyChecker();
checker.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});