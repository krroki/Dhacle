#!/usr/bin/env node

/**
 * Import 구조 및 순서 일관성 검증 스크립트 v1.0
 * 
 * ✅ Import 구조 표준화 및 순환 의존성 감지
 * ❌ 자동 수정은 하지 않습니다 - import 순서 변경은 부작용 가능성이 있습니다.
 * 
 * 검증 항목:
 * - 사용하지 않는 import 감지
 * - 순환 의존성 체크
 * - Import 순서 (React > 외부 라이브러리 > 내부 모듈)
 * - 절대/상대 경로 일관성
 * - 중복 import 감지
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

// Import 순서 규칙
const IMPORT_ORDER = {
  'react': 1,           // React 관련
  'next': 2,            // Next.js 관련
  'external': 3,        // 외부 라이브러리
  'absolute': 4,        // 절대 경로 (@/)
  'relative': 5,        // 상대 경로 (./ ../)
  'style': 6,           // 스타일 파일
  'type': 7             // 타입 전용 import
};

class ImportChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.unusedImports = new Map();
    this.circularDeps = new Set();
    this.checkedFiles = 0;
    this.fileGraph = new Map(); // 의존성 그래프
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  // Import 타입 분류
  getImportType(importPath) {
    if (importPath.startsWith('react')) return 'react';
    if (importPath.startsWith('next')) return 'next';
    if (importPath.startsWith('@/')) return 'absolute';
    if (importPath.startsWith('./') || importPath.startsWith('../')) return 'relative';
    if (importPath.endsWith('.css') || importPath.endsWith('.scss')) return 'style';
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) return 'external';
    return 'unknown';
  }

  // 파일 분석
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.relative(process.cwd(), filePath);
    const issues = [];
    
    // Import 문 추출
    const imports = [];
    const importRegex = /^import\s+(?:type\s+)?(?:(\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(\{[^}]*\}))?\s+from\s+)?['"]([^'"]+)['"]/gm;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importStatement = match[0];
      const importedItems = match[1] || '';
      const additionalItems = match[2] || '';
      const importPath = match[3];
      const isTypeImport = importStatement.includes('import type');
      
      // 실제 import된 항목들 파싱
      const items = new Set();
      
      // default import
      if (importedItems && !importedItems.startsWith('{') && !importedItems.includes('*')) {
        items.add(importedItems);
      }
      
      // named imports
      const namedImports = [...importedItems.matchAll(/\{([^}]+)\}/g), ...additionalItems.matchAll(/\{([^}]+)\}/g)];
      namedImports.forEach(named => {
        const names = named[1].split(',').map(n => n.trim().split(' as ')[0]);
        names.forEach(n => items.add(n));
      });
      
      // namespace import
      const namespaceMatch = importedItems.match(/\*\s+as\s+(\w+)/);
      if (namespaceMatch) {
        items.add(namespaceMatch[1]);
      }
      
      imports.push({
        statement: importStatement,
        path: importPath,
        type: isTypeImport ? 'type' : this.getImportType(importPath),
        items: Array.from(items),
        line: content.substring(0, match.index).split('\n').length
      });
    }
    
    // 의존성 그래프 업데이트
    const dependencies = imports.map(imp => {
      if (imp.path.startsWith('./') || imp.path.startsWith('../')) {
        // 상대 경로를 절대 경로로 변환
        const dir = path.dirname(filePath);
        const resolvedPath = path.resolve(dir, imp.path);
        
        // 확장자 추가 시도
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
        for (const ext of extensions) {
          const fullPath = resolvedPath + (resolvedPath.endsWith(ext) ? '' : ext);
          if (fs.existsSync(fullPath)) {
            return path.relative(process.cwd(), fullPath);
          }
        }
      }
      return null;
    }).filter(Boolean);
    
    this.fileGraph.set(fileName, dependencies);
    
    // Import 순서 체크
    let lastOrder = 0;
    let wrongOrder = false;
    
    imports.forEach((imp, index) => {
      const order = IMPORT_ORDER[imp.type] || 99;
      
      if (order < lastOrder && imp.type !== 'type') {
        wrongOrder = true;
        issues.push({
          type: 'warning',
          line: imp.line,
          pattern: 'Import 순서 위반',
          current: `${imp.type} import가 ${imports[index - 1]?.type} 뒤에 있음`,
          solution: `✅ 올바른 순서:
    1. React 관련 (react, react-dom)
    2. Next.js 관련 (next/*)
    3. 외부 라이브러리 (npm packages)
    4. 절대 경로 (@/*)
    5. 상대 경로 (./, ../)
    6. 스타일 파일 (*.css, *.scss)
    7. 타입 전용 import (import type)`
        });
      }
      lastOrder = order;
    });
    
    // 사용하지 않는 import 체크
    const codeWithoutImports = content.replace(/^import\s+.*$/gm, '');
    
    imports.forEach(imp => {
      imp.items.forEach(item => {
        // JSX에서 사용되는지 체크 (React 컴포넌트)
        const jsxRegex = new RegExp(`<${item}[\\s/>]`, 'g');
        const codeRegex = new RegExp(`\\b${item}\\b`, 'g');
        
        if (!codeRegex.test(codeWithoutImports) && !jsxRegex.test(codeWithoutImports)) {
          if (!this.unusedImports.has(fileName)) {
            this.unusedImports.set(fileName, []);
          }
          this.unusedImports.get(fileName).push({
            item,
            from: imp.path,
            line: imp.line
          });
        }
      });
    });
    
    // 중복 import 체크
    const importPaths = new Map();
    imports.forEach(imp => {
      if (importPaths.has(imp.path)) {
        issues.push({
          type: 'error',
          line: imp.line,
          pattern: '중복 import',
          duplicate: `'${imp.path}'가 ${importPaths.get(imp.path)}번 줄에도 있음`,
          solution: `✅ import 문 통합:
    // 변경 전
    import { A } from 'module';
    import { B } from 'module';
    
    // 변경 후
    import { A, B } from 'module';`
        });
      } else {
        importPaths.set(imp.path, imp.line);
      }
    });
    
    // 절대/상대 경로 일관성 체크
    const hasAbsolute = imports.some(imp => imp.path.startsWith('@/'));
    const hasRelativeInternal = imports.some(imp => 
      (imp.path.startsWith('./') || imp.path.startsWith('../')) &&
      !imp.path.includes('node_modules')
    );
    
    if (hasAbsolute && hasRelativeInternal) {
      issues.push({
        type: 'info',
        pattern: '경로 스타일 혼용',
        message: '절대 경로(@/)와 상대 경로를 함께 사용 중',
        solution: `💡 일관성을 위해 하나로 통일 권장:
    // 절대 경로 (권장)
    import Component from '@/components/Component';
    
    // 상대 경로
    import Component from './components/Component';`
      });
    }
    
    // 결과 저장
    if (issues.length > 0) {
      issues.forEach(issue => {
        if (issue.type === 'error') {
          this.errors.push({ file: fileName, ...issue });
        } else if (issue.type === 'warning') {
          this.warnings.push({ file: fileName, ...issue });
        } else {
          this.info.push({ file: fileName, ...issue });
        }
      });
    }
    
    this.checkedFiles++;
  }

  // 순환 의존성 감지 (DFS)
  detectCircularDependencies() {
    this.log('\n🔍 순환 의존성 검사 중...', colors.cyan);
    
    const visited = new Set();
    const stack = new Set();
    const cycles = [];
    
    const dfs = (file, path = []) => {
      if (stack.has(file)) {
        // 순환 발견
        const cycleStart = path.indexOf(file);
        const cycle = path.slice(cycleStart).concat(file);
        cycles.push(cycle);
        return;
      }
      
      if (visited.has(file)) return;
      
      visited.add(file);
      stack.add(file);
      
      const deps = this.fileGraph.get(file) || [];
      deps.forEach(dep => {
        dfs(dep, [...path, file]);
      });
      
      stack.delete(file);
    };
    
    // 모든 파일에서 DFS 시작
    this.fileGraph.forEach((_, file) => {
      if (!visited.has(file)) {
        dfs(file);
      }
    });
    
    // 중복 제거
    const uniqueCycles = [];
    const seen = new Set();
    
    cycles.forEach(cycle => {
      const key = cycle.sort().join('->');
      if (!seen.has(key)) {
        seen.add(key);
        uniqueCycles.push(cycle);
        
        this.errors.push({
          type: 'circular',
          pattern: '순환 의존성 발견',
          cycle: cycle.join(' → '),
          solution: `✅ 순환 의존성 해결 방법:
    1. 공통 인터페이스/타입을 별도 파일로 분리
    2. 의존성 역전 원칙(DIP) 적용
    3. 이벤트 기반 통신으로 변경
    4. 동적 import 사용 (필요시에만 로드)`
        });
      }
    });
    
    return uniqueCycles;
  }

  // 결과 출력
  printResults() {
    this.log('\n' + '='.repeat(60), colors.cyan);
    this.log('📊 Import 구조 검증 결과', colors.cyan + colors.bold);
    this.log('='.repeat(60), colors.cyan);

    // 통계
    this.log(`\n📈 통계:`, colors.blue);
    this.log(`  • 검사한 파일: ${this.checkedFiles}개`);
    this.log(`  • 사용하지 않는 import: ${Array.from(this.unusedImports.values()).flat().length}개`);
    this.log(`  • 순환 의존성: ${this.errors.filter(e => e.type === 'circular').length}개`);
    this.log(`  • Import 순서 위반: ${this.warnings.filter(w => w.pattern?.includes('순서')).length}개`);

    // 순환 의존성
    const circularErrors = this.errors.filter(e => e.type === 'circular');
    if (circularErrors.length > 0) {
      this.log(`\n🔴 순환 의존성 (Critical):`, colors.red + colors.bold);
      circularErrors.forEach((error, index) => {
        this.log(`\n  ${index + 1}. ${error.cycle}`, colors.red);
        this.log(`\n     해결방법:`, colors.green);
        console.log(`     ${error.solution.split('\n').join('\n     ')}`);
      });
    }

    // 사용하지 않는 import
    if (this.unusedImports.size > 0) {
      this.log(`\n⚠️  사용하지 않는 import:`, colors.yellow + colors.bold);
      let count = 0;
      
      this.unusedImports.forEach((imports, file) => {
        if (count >= 5) return; // 처음 5개 파일만
        
        this.log(`\n  ${file}:`, colors.yellow);
        imports.slice(0, 3).forEach(imp => {
          this.log(`    • ${imp.item} from '${imp.from}' (line ${imp.line})`, colors.cyan);
        });
        
        if (imports.length > 3) {
          this.log(`    ... 외 ${imports.length - 3}개`, colors.yellow);
        }
        count++;
      });
      
      if (this.unusedImports.size > 5) {
        this.log(`\n  ... 외 ${this.unusedImports.size - 5}개 파일`, colors.yellow);
      }
    }

    // Import 순서 위반
    const orderWarnings = this.warnings.filter(w => w.pattern?.includes('순서'));
    if (orderWarnings.length > 0) {
      this.log(`\n📝 Import 순서 위반:`, colors.yellow);
      orderWarnings.slice(0, 3).forEach((warning, index) => {
        this.log(`  ${index + 1}. ${warning.file}:${warning.line}`, colors.yellow);
        this.log(`     ${warning.current}`, colors.cyan);
      });
      
      if (orderWarnings.length > 3) {
        this.log(`  ... 외 ${orderWarnings.length - 3}개`, colors.yellow);
      }
    }

    // 권장사항
    this.log(`\n💡 권장사항:`, colors.green + colors.bold);
    
    if (circularErrors.length > 0) {
      this.log(`  1. 순환 의존성 즉시 해결 (빌드 오류 가능)`, colors.red);
    }
    
    if (this.unusedImports.size > 0) {
      this.log(`  2. 사용하지 않는 import 제거로 번들 크기 감소`, colors.yellow);
      this.log(`     ESLint 규칙 추가: "no-unused-vars"`, colors.cyan);
    }
    
    this.log(`  3. Import 자동 정렬 도구 사용:`, colors.green);
    this.log(`     • prettier-plugin-organize-imports`, colors.cyan);
    this.log(`     • eslint-plugin-import`, colors.cyan);
    
    this.log(`  4. 절대 경로 사용 통일:`, colors.green);
    this.log(`     tsconfig.json의 paths 설정 활용`, colors.cyan);
  }

  async run() {
    this.log('🔍 Import 구조 검증 시작...', colors.cyan);
    this.log('=' .repeat(60), colors.cyan);

    // 모든 TypeScript/JavaScript 파일 검사
    const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**']
    });

    this.log(`\n📁 검사할 파일: ${files.length}개\n`, colors.blue);

    // 각 파일 분석
    files.forEach(file => {
      this.analyzeFile(file);
    });

    // 순환 의존성 감지
    this.detectCircularDependencies();

    // 결과 출력
    this.printResults();

    // Exit code 결정
    const hasCircular = this.errors.some(e => e.type === 'circular');
    
    if (hasCircular) {
      this.log('\n❌ 순환 의존성 발견!', colors.red + colors.bold);
      process.exit(1);
    } else if (this.warnings.length > 0) {
      this.log('\n⚠️  Import 구조 경고', colors.yellow + colors.bold);
      process.exit(0);
    } else {
      this.log('\n✅ Import 구조 검증 통과!', colors.green + colors.bold);
      process.exit(0);
    }
  }
}

// 실행
const checker = new ImportChecker();
checker.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});