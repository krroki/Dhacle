/**
 * 공통 유틸리티 함수들
 * 모든 검증 스크립트에서 재사용 가능한 유틸리티
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// 로깅 함수
const logger = {
  info: (message) => console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`),
  success: (message) => console.log(`${colors.green}✅ ${message}${colors.reset}`),
  warning: (message) => console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`),
  error: (message) => console.log(`${colors.red}❌ ${message}${colors.reset}`),
  header: (message) => console.log(`${colors.cyan}${colors.bold}${message}${colors.reset}`),
  subheader: (message) => console.log(`${colors.cyan}${message}${colors.reset}`),
  debug: (message) => console.log(`${colors.dim}🔍 ${message}${colors.reset}`)
};

// 파일 스캐너
class FileScanner {
  constructor(patterns, options = {}) {
    this.patterns = Array.isArray(patterns) ? patterns : [patterns];
    this.options = {
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**'],
      ...options
    };
  }

  scan() {
    const files = [];
    this.patterns.forEach(pattern => {
      const found = glob.sync(pattern, this.options);
      files.push(...found);
    });
    return [...new Set(files)]; // 중복 제거
  }

  scanWithContent() {
    const files = this.scan();
    return files.map(filePath => ({
      path: filePath,
      content: fs.readFileSync(filePath, 'utf-8'),
      lines: fs.readFileSync(filePath, 'utf-8').split('\n')
    }));
  }
}

// 이슈 추적기
class IssueTracker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.filesChecked = 0;
    this.filesWithIssues = new Set();
  }

  addError(file, line, message, code = null, context = null, solution = null) {
    this.errors.push({ file, line, message, code, context, solution });
    this.filesWithIssues.add(file);
  }

  addWarning(file, line, message, code = null, context = null, solution = null) {
    this.warnings.push({ file, line, message, code, context, solution });
    this.filesWithIssues.add(file);
  }

  addInfo(file, line, message, code = null) {
    this.info.push({ file, line, message, code });
  }

  incrementFilesChecked() {
    this.filesChecked++;
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  getStats() {
    return {
      filesChecked: this.filesChecked,
      filesWithIssues: this.filesWithIssues.size,
      errors: this.errors.length,
      warnings: this.warnings.length,
      info: this.info.length
    };
  }

  clear() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.filesChecked = 0;
    this.filesWithIssues.clear();
  }
}

// 리포터
class Reporter {
  constructor(tracker, options = {}) {
    this.tracker = tracker;
    this.options = {
      showContext: true,
      showSolutions: true,
      maxIssuesPerType: 10,
      ...options
    };
  }

  generateReport() {
    const stats = this.tracker.getStats();
    
    // 헤더
    logger.header('📊 검증 결과');
    console.log('============================================================');
    
    // 통계
    logger.subheader('\n📈 통계:');
    console.log(`  • 검사한 파일: ${stats.filesChecked}개`);
    console.log(`  • 문제 있는 파일: ${stats.filesWithIssues}개`);
    console.log(`${colors.red}  • 오류: ${stats.errors}개${colors.reset}`);
    console.log(`${colors.yellow}  • 경고: ${stats.warnings}개${colors.reset}`);
    console.log(`${colors.blue}  • 정보: ${stats.info}개${colors.reset}`);

    // 오류 출력
    if (this.tracker.errors.length > 0) {
      console.log(`${colors.red}${colors.bold}\n❌ 오류 (반드시 수정 필요):${colors.reset}`);
      this.printIssues(this.tracker.errors, colors.red);
    }

    // 경고 출력
    if (this.tracker.warnings.length > 0) {
      console.log(`${colors.yellow}${colors.bold}\n⚠️  경고 (검토 필요):${colors.reset}`);
      this.printIssues(this.tracker.warnings, colors.yellow);
    }

    // 정보 출력 (옵션)
    if (this.options.showInfo && this.tracker.info.length > 0) {
      console.log(`${colors.blue}${colors.bold}\nℹ️  정보:${colors.reset}`);
      this.printIssues(this.tracker.info, colors.blue, false);
    }

    // 결과 요약
    console.log('\n============================================================');
    if (this.tracker.hasErrors()) {
      logger.error('검증 실패!');
      return false;
    } else if (this.tracker.hasWarnings()) {
      logger.warning('경고와 함께 통과');
      return true;
    } else {
      logger.success('검증 통과!');
      return true;
    }
  }

  printIssues(issues, color, showDetails = true) {
    const limit = Math.min(issues.length, this.options.maxIssuesPerType);
    
    for (let i = 0; i < limit; i++) {
      const issue = issues[i];
      console.log(`${color}  ${issue.file}${issue.line ? `:${issue.line}` : ''}${colors.reset}`);
      console.log(`${color}    문제: ${issue.message}${colors.reset}`);
      
      if (showDetails) {
        if (issue.code && this.options.showContext) {
          console.log(`${colors.yellow}    코드: ${issue.code}${colors.reset}`);
        }
        
        if (issue.context && this.options.showContext) {
          console.log(`${colors.yellow}\n    컨텍스트:${colors.reset}`);
          issue.context.forEach(line => {
            console.log(`    ${line}`);
          });
        }
        
        if (issue.solution && this.options.showSolutions) {
          console.log(`${colors.green}\n    해결방법:${colors.reset}`);
          console.log(`    ${issue.solution}`);
        }
      }
      console.log('');
    }
    
    if (issues.length > limit) {
      console.log(`${color}  ... 그리고 ${issues.length - limit}개 더${colors.reset}\n`);
    }
  }
}

// 헬퍼 함수들
const helpers = {
  // 라인 번호와 컨텍스트 가져오기
  getLineContext(lines, lineNumber, contextSize = 2) {
    const start = Math.max(0, lineNumber - contextSize - 1);
    const end = Math.min(lines.length, lineNumber + contextSize);
    const context = [];
    
    for (let i = start; i < end; i++) {
      const prefix = i === lineNumber - 1 ? '→' : ' ';
      context.push(`${String(i + 1).padStart(5)} ${prefix}    ${lines[i]}`);
    }
    
    return context;
  },

  // 상대 경로로 변환
  getRelativePath(filePath) {
    return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  },

  // 파일 확장자 확인
  isTypeScriptFile(filePath) {
    return /\.(ts|tsx)$/.test(filePath);
  },

  isJavaScriptFile(filePath) {
    return /\.(js|jsx)$/.test(filePath);
  },

  isReactFile(filePath) {
    return /\.(jsx|tsx)$/.test(filePath);
  },

  // 패턴 매칭
  createPattern(pattern, flags = 'g') {
    if (typeof pattern === 'string') {
      return new RegExp(pattern, flags);
    }
    return pattern;
  },

  // 시간 측정
  measureTime(fn) {
    const start = Date.now();
    const result = fn();
    const duration = Date.now() - start;
    return { result, duration };
  }
};

// 설정 로더
class ConfigLoader {
  constructor(configPath = null) {
    this.config = this.loadConfig(configPath);
  }

  loadConfig(configPath) {
    // 기본 설정
    const defaultConfig = {
      patterns: {
        typescript: 'src/**/*.{ts,tsx}',
        javascript: 'src/**/*.{js,jsx}',
        api: 'src/app/api/**/*.{ts,tsx}',
        components: 'src/components/**/*.{ts,tsx}',
        pages: 'src/app/**/*.{ts,tsx}'
      },
      ignore: [
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      rules: {
        enableTypeCheck: true,
        enableSecurityCheck: true,
        enableStyleCheck: true,
        enablePerformanceCheck: false
      }
    };

    // 사용자 설정 로드
    if (configPath && fs.existsSync(configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return { ...defaultConfig, ...userConfig };
      } catch (error) {
        logger.warning(`설정 파일 로드 실패: ${error.message}`);
      }
    }

    return defaultConfig;
  }

  get(key) {
    return this.config[key];
  }
}

module.exports = {
  colors,
  logger,
  FileScanner,
  IssueTracker,
  Reporter,
  helpers,
  ConfigLoader
};