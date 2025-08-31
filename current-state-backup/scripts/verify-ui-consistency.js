#!/usr/bin/env node

/**
 * UI 일관성 검증 스크립트 v1.0
 * 
 * ✅ 올바른 패턴을 검증하고 구체적인 수정 지침을 제공합니다.
 * ❌ 자동 수정은 하지 않습니다 - 각 파일의 컨텍스트를 고려한 수동 수정이 필요합니다.
 * 
 * 검증 항목:
 * - shadcn/ui 컴포넌트 사용
 * - Tailwind CSS 클래스 사용 (인라인 스타일 금지)
 * - api-client.ts 사용 (직접 fetch 금지)
 * - TypeScript any 타입 금지
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
  uiImports: /@\/components\/ui/,
  apiClient: /@\/lib\/api-client/,
  tailwind: /className=["|']/,
  typeAnnotation: /: \w+(?:<[\w\s,]+>)?(?:\[\])?/
};

// 잘못된 패턴들과 해결 방법
const INCORRECT_PATTERNS = [
  { 
    pattern: /style\s*=\s*\{\{/,
    name: '인라인 스타일 사용',
    severity: 'error',
    solution: `✅ Tailwind CSS 클래스로 변경
    예시: style={{ padding: '20px' }} → className="p-5"
    참고: https://tailwindcss.com/docs/padding`
  },
  {
    pattern: /fetch\s*\(/,
    name: '직접 fetch() 호출',
    severity: 'error',
    solution: `✅ api-client.ts 함수 사용
    예시: 
    // 변경 전
    fetch('/api/endpoint')
    
    // 변경 후
    import { apiGet } from '@/lib/api-client';
    apiGet('/api/endpoint')`
  },
  {
    pattern: /:\s*any(?:\s|>|,|\)|$)/,
    name: 'any 타입 사용',
    severity: 'error',
    solution: `✅ 구체적 타입 정의 또는 unknown 사용
    예시:
    // 변경 전
    const data: any = response;
    
    // 변경 후 (옵션 1)
    interface ResponseData {
      id: string;
      name: string;
    }
    const data: ResponseData = response;
    
    // 변경 후 (옵션 2)
    const data: unknown = response;
    if (typeof data === 'object' && data !== null) {
      // 타입 가드 사용
    }`
  },
  {
    pattern: /<any>/,
    name: '제네릭 any 타입',
    severity: 'error',
    solution: `✅ 구체적 제네릭 타입 사용
    예시:
    // 변경 전
    useState<any>(null);
    
    // 변경 후
    useState<User | null>(null);`
  },
  {
    pattern: /as\s+any/,
    name: 'any 타입 단언',
    severity: 'error',
    solution: `✅ 적절한 타입 단언 또는 타입 가드
    예시:
    // 변경 전
    const value = data as any;
    
    // 변경 후
    const value = data as UserData;`
  },
  {
    pattern: /styled-components/,
    name: 'styled-components 사용',
    severity: 'error',
    solution: `✅ Tailwind CSS로 마이그레이션
    참고: 프로젝트에서 styled-components는 제거되었습니다.
    Tailwind 유틸리티 클래스 사용하세요.`
  },
  {
    pattern: /\.module\.css/,
    name: 'CSS Modules 사용',
    severity: 'warning',
    solution: `✅ Tailwind CSS 클래스 사용 권장
    CSS Modules 대신 Tailwind 유틸리티 클래스를 사용하세요.`
  }
];

// 특수 목적 파일들 (검증 제외)
const EXCLUDED_PATTERNS = [
  'node_modules',
  '.next',
  'public',
  '*.test.tsx',
  '*.spec.tsx',
  '*.stories.tsx'
];

class UIConsistencyChecker {
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
    
    // 파일 확장자 확인
    const ext = path.extname(filePath);
    if (!['.tsx', '.jsx'].includes(ext)) {
      return; // UI 파일만 검사
    }

    // 컴포넌트 파일인지 확인 (대략적 판단)
    const isComponent = /export\s+(default\s+)?function|export\s+const.*=.*\(|const.*:\s*React\.FC/.test(content);
    if (!isComponent) {
      return;
    }

    // shadcn/ui 사용 권장 (Button, Card 등 사용하는 경우)
    if (/Button|Card|Dialog|Input|Select/.test(content) && !CORRECT_PATTERNS.uiImports.test(content)) {
      issues.push({
        type: 'warning',
        pattern: 'shadcn/ui 미사용',
        solution: `💡 shadcn/ui 컴포넌트 사용 권장
    import { Button } from '@/components/ui/button';
    import { Card } from '@/components/ui/card';`,
        line: 1
      });
    }

    // API 호출 검사 (fetch 사용 여부)
    if (/fetch\s*\(/.test(content)) {
      const fetchMatch = content.match(/fetch\s*\([^)]+\)/);
      const line = this.findLineNumber(content, /fetch\s*\(/);
      
      // 외부 API 호출인지 확인
      const isExternalAPI = fetchMatch && (
        fetchMatch[0].includes('http://') || 
        fetchMatch[0].includes('https://') ||
        fetchMatch[0].includes('googleapis.com')
      );
      
      if (!isExternalAPI) {
        issues.push({
          type: 'error',
          pattern: '직접 fetch() 호출',
          solution: INCORRECT_PATTERNS.find(p => p.pattern.test('fetch(')).solution,
          line: line,
          context: this.getLineContext(content, line)
        });
      }
    }

    // 잘못된 패턴 검사
    for (const { pattern, name, severity, solution } of INCORRECT_PATTERNS) {
      if (pattern.test(content)) {
        const line = this.findLineNumber(content, pattern);
        const context = this.getLineContext(content, line);
        
        issues.push({
          type: severity,
          pattern: name,
          solution: solution,
          line: line,
          context: context
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
            line: issue.line,
            context: issue.context
          });
        } else {
          this.warnings.push({
            file: fileName,
            message: issue.pattern,
            solution: issue.solution,
            line: issue.line,
            context: issue.context
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

  getLineContext(content, lineNumber) {
    const lines = content.split('\n');
    const startLine = Math.max(0, lineNumber - 2);
    const endLine = Math.min(lines.length, lineNumber + 1);
    
    let context = '';
    for (let i = startLine; i < endLine; i++) {
      const lineNum = i + 1;
      const marker = lineNum === lineNumber ? '→' : ' ';
      context += `    ${lineNum.toString().padStart(4)}${marker} ${lines[i]}\n`;
    }
    return context;
  }

  async run() {
    this.log('🔍 UI 일관성 검증 시작...', colors.cyan);
    this.log('=' .repeat(60), colors.cyan);

    // UI 컴포넌트 파일 찾기
    const componentFiles = glob.sync('src/**/*.{tsx,jsx}', {
      cwd: process.cwd(),
      ignore: EXCLUDED_PATTERNS
    });

    this.log(`\n📁 검사할 UI 파일: ${componentFiles.length}개\n`, colors.blue);

    // 각 파일 검사
    componentFiles.forEach(file => {
      this.checkFile(file);
    });

    // 결과 출력
    this.printResults();

    // 빌드 실패 조건
    const shouldFail = this.errors.length > 0;
    
    if (shouldFail) {
      this.log('\n❌ UI 일관성 검증 실패!', colors.red + colors.bold);
      this.log('위의 오류들을 수정한 후 다시 시도하세요.', colors.red);
      process.exit(1);
    } else {
      this.log('\n✅ UI 일관성 검증 통과!', colors.green + colors.bold);
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
      this.errors.forEach((error, index) => {
        this.log(`\n  ${index + 1}. ${error.file}:${error.line}`, colors.red);
        this.log(`     문제: ${error.message}`, colors.red);
        if (error.context) {
          this.log(`\n     코드:`, colors.yellow);
          console.log(error.context);
        }
        this.log(`\n     해결방법:`, colors.green);
        console.log(`     ${error.solution.split('\n').join('\n     ')}`);
        this.log('     ' + '-'.repeat(50), colors.cyan);
      });
    }

    // 경고 상세
    if (this.warnings.length > 0) {
      this.log(`\n⚠️  경고 (권장 사항):`, colors.yellow + colors.bold);
      this.warnings.forEach((warning, index) => {
        this.log(`\n  ${index + 1}. ${warning.file}${warning.line ? ':' + warning.line : ''}`, colors.yellow);
        this.log(`     제안: ${warning.message}`, colors.yellow);
        if (warning.solution) {
          this.log(`\n     권장사항:`, colors.green);
          console.log(`     ${warning.solution.split('\n').join('\n     ')}`);
        }
      });
    }

    // UI 개발 가이드
    this.log(`\n📚 UI 개발 가이드:`, colors.green + colors.bold);
    this.log(`  1. 컴포넌트:`, colors.green);
    this.log(`     shadcn/ui 컴포넌트 우선 사용`, colors.cyan);
    this.log(`  2. 스타일링:`, colors.green);
    this.log(`     Tailwind CSS 클래스만 사용 (인라인 스타일 금지)`, colors.cyan);
    this.log(`  3. API 호출:`, colors.green);
    this.log(`     @/lib/api-client의 apiGet, apiPost 등 사용`, colors.cyan);
    this.log(`  4. 타입:`, colors.green);
    this.log(`     명확한 타입 정의, any 타입 절대 금지`, colors.cyan);

    // 수정 가이드
    if (this.errors.length > 0) {
      this.log(`\n🔧 수정 가이드:`, colors.yellow + colors.bold);
      this.log(`\n  ⚠️ 자동 수정 도구는 사용하지 마세요!`, colors.red);
      this.log(`  각 파일의 컨텍스트를 고려하여 수동으로 수정하세요.`, colors.yellow);
      this.log(`\n  📌 수정 순서:`, colors.cyan);
      this.log(`  1. any 타입 → 구체적 타입 또는 unknown + 타입 가드`, colors.yellow);
      this.log(`  2. 인라인 스타일 → Tailwind 클래스`, colors.yellow);
      this.log(`  3. fetch() → api-client 함수`, colors.yellow);
      this.log(`  4. 타입 체크: npm run type-check`, colors.yellow);
      this.log(`  5. 빌드 테스트: npm run build`, colors.yellow);
    }
  }
}

// 실행
const checker = new UIConsistencyChecker();
checker.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});