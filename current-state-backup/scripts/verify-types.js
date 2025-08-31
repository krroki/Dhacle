#!/usr/bin/env node

/**
 * TypeScript 타입 일관성 검증 스크립트 v1.0
 * 
 * ✅ 타입 안전성을 검증하고 구체적인 수정 지침을 제공합니다.
 * ❌ 자동 수정은 하지 않습니다 - 각 파일의 컨텍스트를 고려한 수동 수정이 필요합니다.
 * 
 * 검증 항목:
 * - any 타입 사용 금지
 * - Promise 반환 타입 명시
 * - 에러 타입 정의
 * - unknown 타입 가드 사용
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

// 잘못된 타입 패턴들과 해결 방법
const TYPE_VIOLATIONS = [
  {
    pattern: /:\s*any(?:\s|>|,|\)|;|$)/,
    name: 'any 타입 선언',
    severity: 'error',
    solution: `✅ 구체적 타입 정의
    예시 1 - 객체 타입:
    // 변경 전
    const data: any = response;
    
    // 변경 후
    interface ResponseData {
      id: string;
      name: string;
      items: Array<{ id: string; value: number }>;
    }
    const data: ResponseData = response;
    
    예시 2 - unknown 사용:
    // 변경 전
    const value: any = getUserInput();
    
    // 변경 후
    const value: unknown = getUserInput();
    // 타입 가드 사용
    if (typeof value === 'string') {
      console.log(value.toUpperCase());
    }`
  },
  {
    pattern: /<any>/,
    name: '제네릭 any 타입',
    severity: 'error',
    solution: `✅ 구체적 제네릭 타입 사용
    예시 1 - State:
    // 변경 전
    const [data, setData] = useState<any>(null);
    
    // 변경 후
    interface UserData {
      id: string;
      email: string;
    }
    const [data, setData] = useState<UserData | null>(null);
    
    예시 2 - API 호출:
    // 변경 전
    apiGet<any>('/api/users');
    
    // 변경 후
    apiGet<User[]>('/api/users');`
  },
  {
    pattern: /as\s+any/,
    name: 'any 타입 단언',
    severity: 'error',
    solution: `✅ 적절한 타입 단언 또는 타입 가드
    예시 1 - 타입 단언:
    // 변경 전
    const element = document.getElementById('btn') as any;
    
    // 변경 후
    const element = document.getElementById('btn') as HTMLButtonElement;
    
    예시 2 - 타입 가드:
    // 변경 전
    const data = JSON.parse(str) as any;
    
    // 변경 후
    const data = JSON.parse(str) as unknown;
    if (isUserData(data)) {
      // 사용
    }
    
    function isUserData(obj: unknown): obj is UserData {
      return typeof obj === 'object' && 
             obj !== null &&
             'id' in obj &&
             'email' in obj;
    }`
  },
  {
    pattern: /Function(?:\s|,|\)|;|$)/,
    name: 'Function 타입 사용',
    severity: 'warning',
    solution: `✅ 구체적 함수 시그니처 정의
    예시:
    // 변경 전
    const callback: Function = () => {};
    
    // 변경 후
    const callback: (id: string) => void = () => {};
    // 또는
    type CallbackFn = (id: string, data: UserData) => Promise<void>;
    const callback: CallbackFn = async (id, data) => {};`
  },
  {
    pattern: /async\s+function\s+\w+\([^)]*\)(?!\s*:\s*Promise)/,
    name: 'async 함수 Promise 타입 누락',
    severity: 'warning',
    solution: `✅ Promise 반환 타입 명시
    예시:
    // 변경 전
    async function fetchData() {
      return await apiGet('/data');
    }
    
    // 변경 후
    async function fetchData(): Promise<DataType> {
      return await apiGet<DataType>('/data');
    }`
  },
  {
    pattern: /catch\s*\(\s*[a-zA-Z_]\w*\s*\)/,
    name: 'catch 블록 타입 없음',
    severity: 'warning',
    solution: `✅ 에러 타입 체크
    예시:
    // 변경 전
    try {
      // ...
    } catch (e) {
      console.log(e.message);
    }
    
    // 변경 후
    try {
      // ...
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log('Unknown error:', error);
      }
    }`
  },
  {
    pattern: /Object(?:\s|,|\)|;|$)(?!\.)/,
    name: 'Object 타입 사용',
    severity: 'warning',
    solution: `✅ 구체적 객체 타입 정의
    예시:
    // 변경 전
    const config: Object = { key: 'value' };
    
    // 변경 후
    interface Config {
      key: string;
      timeout?: number;
    }
    const config: Config = { key: 'value' };
    
    // 또는 Record 사용
    const config: Record<string, string> = { key: 'value' };`
  },
  {
    pattern: /\[\s*\](?!\s*as)/,
    name: '빈 배열 타입 추론',
    severity: 'info',
    solution: `💡 배열 타입 명시 권장
    예시:
    // 변경 전
    const items = [];
    
    // 변경 후
    const items: string[] = [];
    // 또는
    const items = [] as string[];`
  },
  {
    pattern: /typeof\s+\w+\s*===\s*["']object["']/,
    name: 'null 체크 없는 object 타입 체크',
    severity: 'warning',
    solution: `✅ null 체크 추가
    예시:
    // 변경 전
    if (typeof value === 'object') {
      // value가 null일 수 있음!
    }
    
    // 변경 후
    if (typeof value === 'object' && value !== null) {
      // 안전한 객체 접근
    }`
  }
];

// 특수 목적 파일들 (검증 제외)
const EXCLUDED_PATTERNS = [
  'node_modules',
  '.next',
  'public',
  '*.js',
  '*.d.ts',
  '*.config.ts',
  '*.config.js'
];

class TypeConsistencyChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
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

    // eslint-disable가 있는 파일은 any 타입 검사 건너뛰기
    const hasEslintDisableAny = content.includes('eslint-disable @typescript-eslint/no-explicit-any');

    // 각 타입 위반 패턴 검사
    for (const violation of TYPE_VIOLATIONS) {
      // eslint-disable가 있고 any 관련 패턴이면 건너뛰기
      if (hasEslintDisableAny && (violation.name.includes('any') || violation.pattern.toString().includes('any'))) {
        continue;
      }
      const matches = this.findAllMatches(content, violation.pattern);
      
      matches.forEach(match => {
        issues.push({
          type: violation.severity,
          pattern: violation.name,
          solution: violation.solution,
          line: match.line,
          context: match.context,
          code: match.code
        });
      });
    }

    // API Route 특별 검사
    if (filePath.includes('/api/') && filePath.endsWith('route.ts')) {
      // NextResponse 타입 체크
      if (content.includes('NextResponse.json(') && !content.includes('import { NextResponse }')) {
        issues.push({
          type: 'error',
          pattern: 'NextResponse import 누락',
          solution: `✅ NextResponse import 추가
    import { NextResponse } from 'next/server';`,
          line: 1
        });
      }

      // Request 타입 체크
      if (/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/.test(content)) {
        const functionMatch = content.match(/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)/);
        if (functionMatch && !functionMatch[0].includes(': Request') && !functionMatch[0].includes(': NextRequest')) {
          const line = this.findLineNumber(content, new RegExp(functionMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
          issues.push({
            type: 'warning',
            pattern: 'Request 타입 누락',
            solution: `✅ Request 타입 추가
    export async function ${functionMatch[1]}(request: Request) {
    // 또는
    export async function ${functionMatch[1]}(request: NextRequest) {`,
            line: line
          });
        }
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
        } else {
          this.info.push({
            file: fileName,
            ...issue
          });
        }
      });
    }

    this.checkedFiles++;
  }

  findAllMatches(content, pattern) {
    const matches = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        const context = this.getLineContext(lines, index + 1);
        matches.push({
          line: index + 1,
          context: context,
          code: line.trim()
        });
      }
    });
    
    return matches;
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

  getLineContext(lines, lineNumber) {
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
    this.log('🔍 TypeScript 타입 일관성 검증 시작...', colors.cyan);
    this.log('=' .repeat(60), colors.cyan);

    // TypeScript 파일 찾기
    const tsFiles = glob.sync('src/**/*.{ts,tsx}', {
      cwd: process.cwd(),
      ignore: EXCLUDED_PATTERNS
    });

    this.log(`\n📁 검사할 TypeScript 파일: ${tsFiles.length}개\n`, colors.blue);

    // 각 파일 검사
    tsFiles.forEach(file => {
      this.checkFile(file);
    });

    // 결과 출력
    this.printResults();

    // 빌드 실패 조건
    const shouldFail = this.errors.length > 0;
    
    if (shouldFail) {
      this.log('\n❌ TypeScript 타입 일관성 검증 실패!', colors.red + colors.bold);
      this.log('위의 오류들을 수정한 후 다시 시도하세요.', colors.red);
      process.exit(1);
    } else {
      this.log('\n✅ TypeScript 타입 일관성 검증 통과!', colors.green + colors.bold);
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
    this.log(`  • 정보: ${this.info.length}개`, colors.blue);

    // 오류 상세
    if (this.errors.length > 0) {
      this.log(`\n❌ 오류 (반드시 수정 필요):`, colors.red + colors.bold);
      this.errors.forEach((error, index) => {
        this.log(`\n  ${index + 1}. ${error.file}:${error.line}`, colors.red);
        this.log(`     문제: ${error.pattern}`, colors.red);
        this.log(`     코드: ${error.code}`, colors.yellow);
        if (error.context) {
          this.log(`\n     컨텍스트:`, colors.yellow);
          console.log(error.context);
        }
        this.log(`\n     해결방법:`, colors.green);
        console.log(`     ${error.solution.split('\n').join('\n     ')}`);
        this.log('     ' + '-'.repeat(50), colors.cyan);
      });
    }

    // 경고 상세 (처음 5개만)
    if (this.warnings.length > 0) {
      const displayWarnings = this.warnings.slice(0, 5);
      this.log(`\n⚠️  경고 (권장 사항): ${this.warnings.length}개 중 ${displayWarnings.length}개 표시`, colors.yellow + colors.bold);
      displayWarnings.forEach((warning, index) => {
        this.log(`\n  ${index + 1}. ${warning.file}:${warning.line}`, colors.yellow);
        this.log(`     문제: ${warning.pattern}`, colors.yellow);
        this.log(`     코드: ${warning.code}`, colors.cyan);
        if (warning.solution) {
          this.log(`\n     권장사항:`, colors.green);
          console.log(`     ${warning.solution.split('\n').join('\n     ')}`);
        }
      });
      
      if (this.warnings.length > 5) {
        this.log(`\n  ... 외 ${this.warnings.length - 5}개 경고`, colors.yellow);
      }
    }

    // TypeScript 타입 가이드
    this.log(`\n📚 TypeScript 타입 가이드:`, colors.green + colors.bold);
    this.log(`  1. any 타입:`, colors.green);
    this.log(`     절대 사용 금지 → unknown + 타입 가드 사용`, colors.cyan);
    this.log(`  2. 함수 타입:`, colors.green);
    this.log(`     모든 매개변수와 반환값에 타입 명시`, colors.cyan);
    this.log(`  3. Promise:`, colors.green);
    this.log(`     async 함수는 반드시 Promise<T> 반환 타입 명시`, colors.cyan);
    this.log(`  4. 에러 처리:`, colors.green);
    this.log(`     catch 블록에서 error instanceof Error 체크`, colors.cyan);
    this.log(`  5. 객체 타입:`, colors.green);
    this.log(`     interface 또는 type 정의 사용`, colors.cyan);

    // 수정 우선순위
    if (this.errors.length > 0 || this.warnings.length > 0) {
      this.log(`\n🔧 수정 우선순위:`, colors.yellow + colors.bold);
      this.log(`  1. 🔴 any 타입 제거 (최우선)`, colors.red);
      this.log(`  2. 🟡 Promise 반환 타입 추가`, colors.yellow);
      this.log(`  3. 🟡 에러 타입 체크 추가`, colors.yellow);
      this.log(`  4. 🔵 Object/Function → 구체적 타입`, colors.blue);
      this.log(`\n  💡 팁: npm run type-check로 TypeScript 컴파일러 체크`, colors.cyan);
    }
  }
}

// 실행
const checker = new TypeConsistencyChecker();
checker.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});