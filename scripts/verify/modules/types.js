/**
 * 타입 검증 모듈
 * TypeScript 타입 시스템 검증 및 any 타입 사용 감지
 */

const { FileScanner, IssueTracker, Reporter, logger, helpers } = require('../utils');
const config = require('../config');
const fs = require('fs');
const path = require('path');

class TypeVerifier {
  constructor(options = {}) {
    this.options = {
      ...config.modules.types,
      ...options
    };
    
    this.tracker = new IssueTracker();
    this.scanner = new FileScanner(config.patterns.typescript, {
      ignore: config.ignore
    });
    
    // 타입 검증 규칙
    this.checks = {
      anyTypeUsage: this.checkAnyType.bind(this),
      implicitAny: this.checkImplicitAny.bind(this),
      typeAssertions: this.checkTypeAssertions.bind(this),
      generatedTypes: this.checkGeneratedTypes.bind(this),
      unusedTypes: this.checkUnusedTypes.bind(this),
      typeConsistency: this.checkTypeConsistency.bind(this)
    };
  }

  async verify(options = {}) {
    const startTime = Date.now();
    this.tracker.clear();
    
    try {
      // 파일 스캔
      const files = this.scanner.scanWithContent();
      
      if (options.verbose) {
        logger.info(`📁 검사할 TypeScript 파일: ${files.length}개`);
      }

      // 각 파일 검증
      for (const file of files) {
        await this.verifyFile(file, options);
      }

      // 리포트 생성
      const reporter = new Reporter(this.tracker, {
        showContext: true,
        showSolutions: true
      });
      
      const success = !this.tracker.hasErrors();
      const stats = this.tracker.getStats();

      return {
        success,
        errors: stats.errors,
        warnings: stats.warnings,
        info: stats.info,
        filesChecked: stats.filesChecked,
        duration: Date.now() - startTime
      };
    } catch (error) {
      logger.error(`타입 검증 실패: ${error.message}`);
      return {
        success: false,
        errors: 1,
        warnings: 0,
        message: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  async verifyFile(file, options) {
    this.tracker.incrementFilesChecked();
    const relativePath = helpers.getRelativePath(file.path);

    // 각 검증 규칙 실행
    for (const [checkName, checkFunction] of Object.entries(this.checks)) {
      if (this.options.rules[checkName] !== false) {
        await checkFunction(file, relativePath, options);
      }
    }
  }

  checkAnyType(file, relativePath, options) {
    const anyPatterns = [
      // any 타입 선언
      /:\s*any(?:\s|;|,|\)|>|$)/g,
      /:\s*any\[\]/g,
      /:\s*Array<any>/g,
      /:\s*Promise<any>/g,
      /:\s*Record<[^,]+,\s*any>/g,
      
      // as any 타입 단언
      /as\s+any(?:\s|;|,|\)|$)/g,
      
      // Function 타입 (암시적 any)
      /:\s*Function(?:\s|;|,|\)|$)/g
    ];

    file.lines.forEach((line, index) => {
      // 주석 제외
      const codeOnly = line.split('//')[0];
      if (codeOnly.includes('/*') || codeOnly.includes('*/')) return;

      anyPatterns.forEach(pattern => {
        const matches = codeOnly.matchAll(pattern);
        for (const match of matches) {
          const context = helpers.getLineContext(file.lines, index + 1);
          
          this.tracker.addError(
            relativePath,
            index + 1,
            'any 타입 사용',
            match[0],
            context,
            this.getAnySolution(match[0])
          );
        }
      });
    });
  }

  checkImplicitAny(file, relativePath, options) {
    const implicitPatterns = [
      // 타입 없는 함수 매개변수
      /function\s+\w+\s*\(([^)]+)\)/g,
      /const\s+\w+\s*=\s*\(([^)]+)\)\s*=>/g,
      /\w+\s*:\s*\(([^)]+)\)\s*=>/g,
      
      // 타입 없는 변수 선언
      /(?:let|const|var)\s+(\w+)\s*=\s*(?!.*:\s*\w)/g
    ];

    file.lines.forEach((line, index) => {
      const codeOnly = line.split('//')[0];
      
      // 함수 매개변수 검사
      const funcMatch = codeOnly.match(/function\s+\w+\s*\(([^)]*)\)/);
      if (funcMatch && funcMatch[1]) {
        const params = funcMatch[1].split(',');
        params.forEach(param => {
          if (param.trim() && !param.includes(':')) {
            this.tracker.addWarning(
              relativePath,
              index + 1,
              '암시적 any 타입 (타입 없는 매개변수)',
              param.trim(),
              null,
              '명시적 타입 추가 필요'
            );
          }
        });
      }
    });
  }

  checkTypeAssertions(file, relativePath, options) {
    const assertionPatterns = [
      // 위험한 타입 단언
      /as\s+unknown\s+as\s+\w+/g,
      /<any>/g,
      /!\./g,  // Non-null assertion
      /\bas\s+const\b/g
    ];

    file.lines.forEach((line, index) => {
      const codeOnly = line.split('//')[0];
      
      assertionPatterns.forEach(pattern => {
        if (pattern.test(codeOnly)) {
          this.tracker.addWarning(
            relativePath,
            index + 1,
            '위험한 타입 단언',
            codeOnly.trim(),
            null,
            '타입 가드 사용 권장'
          );
        }
      });
    });
  }

  checkGeneratedTypes(file, relativePath, options) {
    // generated 타입 파일과 실제 사용 동기화 확인
    if (relativePath.includes('generated')) {
      return; // generated 파일은 검사 제외
    }

    // database.generated.ts import 확인
    if (file.content.includes('from "@/types/database.generated"')) {
      const importMatch = file.content.match(/import\s+{([^}]+)}\s+from\s+["']@\/types\/database\.generated["']/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(i => i.trim());
        
        // 실제 사용 확인
        imports.forEach(typeName => {
          const usagePattern = new RegExp(`\\b${typeName}\\b`, 'g');
          const usages = (file.content.match(usagePattern) || []).length;
          
          if (usages <= 1) { // import 문만 있고 사용 안됨
            this.tracker.addInfo(
              relativePath,
              null,
              `미사용 generated 타입: ${typeName}`,
              null
            );
          }
        });
      }
    }
  }

  checkUnusedTypes(file, relativePath, options) {
    // 타입/인터페이스 정의 찾기
    const typeDefinitions = [];
    const typePattern = /(?:type|interface)\s+(\w+)/g;
    
    let match;
    while ((match = typePattern.exec(file.content)) !== null) {
      typeDefinitions.push({
        name: match[1],
        line: file.content.substring(0, match.index).split('\n').length
      });
    }

    // 각 타입의 사용 확인
    typeDefinitions.forEach(typeDef => {
      const usagePattern = new RegExp(`\\b${typeDef.name}\\b`, 'g');
      const usages = (file.content.match(usagePattern) || []).length;
      
      if (usages <= 1) { // 정의만 있고 사용 안됨
        this.tracker.addInfo(
          relativePath,
          typeDef.line,
          `미사용 타입 정의: ${typeDef.name}`,
          null
        );
      }
    });
  }

  checkTypeConsistency(file, relativePath, options) {
    // API 응답 타입 일관성
    if (relativePath.includes('/api/')) {
      // NextResponse.json 타입 체크
      const responsePattern = /NextResponse\.json\s*\(([^)]+)\)/g;
      let match;
      
      while ((match = responsePattern.exec(file.content)) !== null) {
        const line = file.content.substring(0, match.index).split('\n').length;
        
        // 에러 응답 형식 확인
        if (match[1].includes('error:')) {
          if (!match[1].includes('{ error:')) {
            this.tracker.addWarning(
              relativePath,
              line,
              '비일관적인 에러 응답 형식',
              match[0],
              null,
              '{ error: string } 형식 사용'
            );
          }
        }
      }
    }

    // React 컴포넌트 Props 타입 체크
    if (relativePath.includes('/components/')) {
      if (!file.content.includes('Props') && file.content.includes('export')) {
        const componentMatch = file.content.match(/export\s+(?:default\s+)?function\s+(\w+)/);
        if (componentMatch && componentMatch[1][0] === componentMatch[1][0].toUpperCase()) {
          this.tracker.addInfo(
            relativePath,
            null,
            'Props 타입 정의 누락 가능성',
            null
          );
        }
      }
    }
  }

  getAnySolution(code) {
    const solutions = {
      ': any': '구체적 타입 정의 (interface, type alias)',
      'as any': '타입 가드 사용 또는 unknown 사용 후 타입 좁히기',
      'Array<any>': 'Array<구체적타입> 또는 제네릭 사용',
      'Promise<any>': 'Promise<구체적타입> 정의',
      'Function': '구체적 함수 시그니처 정의'
    };

    for (const [pattern, solution] of Object.entries(solutions)) {
      if (code.includes(pattern)) {
        return solution;
      }
    }

    return '구체적 타입 정의 필요';
  }
}

module.exports = TypeVerifier;