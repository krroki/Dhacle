/**
 * 타입 검증 모듈 v2.0 - TypeScript ESLint 기준 적용
 * 위험 기반 분류 및 컨텍스트 인식 시스템
 * any 타입: 'error' → 'warn' 수준으로 조정 (TypeScript ESLint 공식 기준)
 */

const { FileScanner, IssueTracker, Reporter, logger, helpers } = require('../utils');
const config = require('../config');
const fs = require('fs');
const path = require('path');

/**
 * TypeScript ESLint 기준을 적용한 스마트 타입 분류자
 */
class SmartTypeClassifier {
  constructor() {
    // TypeScript ESLint 공식 기준 (no-explicit-any: 'warn')
    this.anyTypeRisk = {
      // High 위험: 실제 런타임 에러 가능성
      unsafe: [
        /as\s+any\s*\[/,         // Array index as any[]
        /any\s*\)/,              // Function return any
        /Promise<any>/,          // Promise with any
      ],
      
      // Medium 위험: 일반적인 any 사용
      common: [
        /:\s*any(?:\s|;|,|\)|>|$)/,    // Type annotation: any
        /:\s*any\[\]/,                  // any[]
        /:\s*Array<any>/,               // Array<any>
        /:\s*Record<[^,]+,\s*any>/,     // Record<key, any>
      ],
      
      // Low 위험: 특수 상황에서 허용 가능
      acceptable: [
        /:\s*Function(?:\s|;|,|\)|$)/,  // Function type (일반적)
        /catch\s*\([^)]*any/,           // Error handling
        /JSON\.parse.*any/,              // JSON parsing
      ]
    };
    
    // 파일 예외 분류
    this.fileExceptions = {
      // 완전 예외 (검사 안 함)
      excluded: [
        '**/node_modules/**',
        '**/*.d.ts',
        '**/generated/**',
        '**/dist/**'
      ],
      
      // 완화된 기준
      relaxed: [
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/mocks/**',
        '**/legacy/**',
        '**/external/**',
        '**/vendor/**'
      ],
      
      // 외부 라이브러리 연관
      external: [
        '**/youtube/**',    // YouTube API
        '**/supabase/**',   // Supabase 클라이언트
        '**/api/**'         // 외부 API 클라이언트
      ]
    };
    
    // 개선 마커
    this.improvementMarkers = [
      '// TODO: 타입 개선',
      '// FIXME: any 타입 제거 예정',
      '// Phase',
      '// 점진적 개선',
      '// Intentional any',
      '@ts-ignore'
    ];
  }
  
  analyzeContext(file) {
    const filePath = file.path.toLowerCase();
    const content = file.content;
    
    return {
      // 파일 타입
      isTestFile: this.matchPatterns(filePath, ['**/__tests__/**', '**/*.test.*', '**/*.spec.*']),
      isMockFile: this.matchPatterns(filePath, ['**/mocks/**', '**/__mocks__/**']),
      isLegacyFile: this.matchPatterns(filePath, ['**/legacy/**', '**/deprecated/**']),
      isExternalLib: this.matchPatterns(filePath, this.fileExceptions.external),
      
      // 상태 분석
      hasImprovementPlan: this.improvementMarkers.some(marker => content.includes(marker)),
      hasProperTypes: this.hasProperTypeDefinitions(content),
      usesExternalLibs: this.usesExternalLibraries(content),
      
      // TypeScript 특징
      hasTypeAssertions: /as\s+\w+/.test(content),
      hasGenerics: /<[A-Z]\w*>/.test(content),
      hasInterfaces: /interface\s+\w+/.test(content)
    };
  }
  
  matchPatterns(path, patterns) {
    return patterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\//g, '[\\\\/]'));
        return regex.test(path);
      }
      return path.includes(pattern);
    });
  }
  
  hasProperTypeDefinitions(content) {
    const typeDefinitionPatterns = [
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /enum\s+\w+/,
      /class\s+\w+/
    ];
    return typeDefinitionPatterns.some(pattern => pattern.test(content));
  }
  
  usesExternalLibraries(content) {
    const externalLibs = ['youtube', 'supabase', 'axios', 'fetch', 'process.env'];
    return externalLibs.some(lib => content.includes(lib));
  }
  
  classifyAnyUsage(match, context, line) {
    // Critical: 실제 위험이 높은 패턴
    if (this.anyTypeRisk.unsafe.some(pattern => pattern.test(match))) {
      return { level: 'high', message: '위험한 any 사용 패턴' };
    }
    
    // 외부 라이브러리와 관련된 any 사용
    if (context.usesExternalLibs && (line.includes('youtube') || line.includes('supabase'))) {
      return { level: 'low', message: '외부 라이브러리 연관 any 사용' };
    }
    
    // 테스트/Mock 파일
    if (context.isTestFile || context.isMockFile) {
      return { level: 'low', message: '테스트/Mock 파일에서 any 사용' };
    }
    
    // 개선 계획 있음
    if (context.hasImprovementPlan) {
      return { level: 'low', message: '점진적 개선 예정' };
    }
    
    // 일반적인 any 사용 (TypeScript ESLint 'warn' 수준)
    return { level: 'medium', message: 'any 타입 사용 (가능하면 구체적 타입 사용 근장)' };
  }
}

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
    
    // 스마트 타입 분류 시스템
    this.classifier = new SmartTypeClassifier();
    
    // 개선된 타입 검증 규칙 - Context7 베스트 프랙티스 적용
    this.checks = {
      smartAnyTypeUsage: this.checkSmartAnyType.bind(this),
      typeAssertions: this.checkTypeAssertions.bind(this),
      typeConsistency: this.checkTypeConsistency.bind(this),
      generatedTypes: this.checkGeneratedTypes.bind(this),
      unusedTypes: this.checkUnusedTypes.bind(this)
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
    
    // 컨텍스트 분석 (스마트 분류의 핵심)
    const context = this.classifier.analyzeContext(file);
    
    // 파일 분류에 따른 처리
    const fileCategory = this.categorizeFile(relativePath);
    
    if (fileCategory === 'excluded') {
      return; // 완전 제외
    }
    
    if (fileCategory === 'relaxed') {
      // 완화된 기준 적용
      context.relaxedMode = true;
    }
    
    // 각 검증 규칙 실행 (컨텍스트 전달)
    for (const [checkName, checkFunction] of Object.entries(this.checks)) {
      if (this.options.rules[checkName] !== false) {
        await checkFunction(file, relativePath, context, options);
      }
    }
  }
  
  /**
   * 스마트 any 타입 검증 - TypeScript ESLint 기준 적용
   * Context7 베스트 프랙티스: no-explicit-any: 'warn' 수준
   */
  checkSmartAnyType(file, relativePath, context, options) {
    const lines = file.content.split('\n');
    const anyPatterns = [
      ...this.classifier.anyTypeRisk.unsafe,
      ...this.classifier.anyTypeRisk.common,
      ...this.classifier.anyTypeRisk.acceptable
    ];
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;
      
      // 개선 마커가 있는 라인은 스킵
      if (this.classifier.improvementMarkers.some(marker => line.includes(marker))) {
        continue;
      }
      
      // any 패턴 검사
      for (const pattern of anyPatterns) {
        const matches = line.matchAll(new RegExp(pattern.source, 'g'));
        
        for (const match of matches) {
          // 스마트 분류 적용
          const classification = this.classifier.classifyAnyUsage(match[0], context, line);
          
          // Context7 베스트 프랙티스: TypeScript ESLint 공식 기준
          const issue = {
            file: relativePath,
            line: lineNumber,
            match: match[0],
            level: this.adjustSeverityByContext(classification.level, context),
            message: classification.message,
            solution: this.getSolution(classification.level, match[0])
          };
          
          // 위험도별 이슈 추가
          this.addSmartIssue(issue);
          
          if (options.verbose) {
            logger.debug(`[${issue.level.toUpperCase()}] ${relativePath}:${lineNumber} - ${issue.message}`);
          }
        }
      }
    }
  }
  
  /**
   * 컨텍스트에 따른 심각도 조정
   * Context7 베스트 프랙티스: 테스트/외부 라이브러리에서 완화
   */
  adjustSeverityByContext(level, context) {
    // 완화된 모드 (테스트 파일, 외부 라이브러리)
    if (context.relaxedMode || context.isTestFile || context.isMockFile) {
      if (level === 'high') return 'medium';
      if (level === 'medium') return 'low';
      return level;
    }
    
    // 외부 라이브러리 사용 시 완화
    if (context.usesExternalLibs && level === 'medium') {
      return 'low';
    }
    
    // 개선 계획 있을 시 완화
    if (context.hasImprovementPlan && level !== 'critical') {
      return level === 'high' ? 'medium' : 'low';
    }
    
    return level;
  }
  
  /**
   * TypeScript ESLint 베스트 프랙티스 기반 해결책 제안
   */
  getSolution(level, match) {
    switch (level) {
      case 'critical':
        return '즉시 구체적 타입으로 교체 필요';
      case 'high':
        return 'unknown 타입이나 구체적 타입으로 교체 권장';
      case 'medium':
        return 'TypeScript ESLint 권장: 가능하면 구체적 타입 사용';
      case 'low':
        return '현재 상황에서 허용 가능하나 점진적 개선 고려';
      default:
        return '타입 개선 검토';
    }
  }
  
  categorizeFile(relativePath) {
    const normalizedPath = relativePath.replace(/\\/g, '/');
    
    // 완전 제외
    if (this.classifier.matchPatterns(normalizedPath, this.classifier.fileExceptions.excluded)) {
      return 'excluded';
    }
    
    // 완화된 기준
    if (this.classifier.matchPatterns(normalizedPath, this.classifier.fileExceptions.relaxed)) {
      return 'relaxed';
    }
    
    return 'standard';
  }
  
  addSmartIssue(issue) {
    // 위험도에 따른 분류
    switch (issue.level) {
      case 'critical':
        this.tracker.addError(
          issue.file,
          issue.line,
          `[CRITICAL] ${issue.message}`,
          issue.match,
          null,
          `즉시 수정 필요: ${issue.solution || ''}`
        );
        break;
        
      case 'high':
        this.tracker.addError(
          issue.file,
          issue.line,
          `[HIGH] ${issue.message}`,
          issue.match,
          null,
          `우선 수정 권장: ${issue.solution || ''}`
        );
        break;
        
      case 'medium':
        this.tracker.addWarning(
          issue.file,
          issue.line,
          `[MEDIUM] ${issue.message}`,
          issue.match,
          null,
          `TypeScript ESLint 'warn' 수준: ${issue.solution || ''}`
        );
        break;
        
      case 'low':
      default:
        this.tracker.addInfo(
          issue.file,
          issue.line,
          `[LOW] ${issue.message}`,
          issue.match,
          null,
          `참고사항: ${issue.solution || ''}`
        );
        break;
    }
  }

  // Legacy checkAnyType 제거됨 - checkSmartAnyType으로 대체
  // TypeScript ESLint 베스트 프랙티스 적용: any 타입을 'warn' 수준으로 처리

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