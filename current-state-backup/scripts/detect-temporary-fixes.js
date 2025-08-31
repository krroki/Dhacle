#!/usr/bin/env node

/**
 * 임시 처리 감지 스크립트 v2.0
 * 주석 처리된 DB 호출, TODO, 빈 반환값, any 타입 등 감지
 * 정규식 패턴 개선 및 감지 범위 확대
 * 
 * 사용법: node scripts/detect-temporary-fixes.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 색상 코드
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// 개선된 감지 패턴들
const patterns = {
  // 1. 주석 처리된 DB 호출 (단일줄 + 여러줄 주석 모두 감지)
  commentedDB: {
    regex: /(?:\/\/.*|\/\*[\s\S]*?\*\/).*(?:supabase\.from|\.insert|\.update|\.delete|\.select)/gi,
    severity: 'critical',
    message: '주석 처리된 DB 호출 - 테이블 생성 필요'
  },
  
  // 2. TODO 계열 주석 (확장된 키워드)
  todoComments: {
    regex: /(?:\/\/|\/\*|#)\s*(?:TODO|FIXME|HACK|XXX|BUG|DEPRECATED|NOTE)\s*:?/gi,
    severity: 'high',
    message: '미완료 작업 표시 - 즉시 구현 필요'
  },
  
  // 3. any 타입의 빈 배열
  emptyArrayWithAny: {
    regex: /(?:const|let|var)\s+\w+\s*:\s*any\[\]\s*=\s*\[\]/gi,
    severity: 'high',
    message: 'any[] 타입의 빈 배열 - 구체적 타입 필요'
  },
  
  // 4. 임시 반환값 (주석과 함께)
  temporaryReturn: {
    regex: /return\s+(?:null|undefined|\[\]|{}|''|""|0|false)\s*;?\s*(?:\/\/.*(?:임시|temp|TODO|나중에|추후))/gim,
    severity: 'high',
    message: '임시 반환값 - 실제 데이터 구현 필요'
  },
  
  // 5. any 타입 사용
  anyType: {
    regex: /:\s*any(?:\[\])?(?:\s|;|,|\)|>)/g,
    severity: 'high',
    message: 'any 타입 사용 - 구체적 타입 정의 필요'
  },
  
  // 6. Silent fail (빈 catch 블록)
  silentFail: {
    regex: /catch\s*\([^)]*\)\s*{\s*(?:\/\/[^\n]*)?\s*}/g,
    severity: 'critical',
    message: 'Silent failure - 에러 처리 누락'
  },
  
  // 7. 주석만 있는 catch 블록
  commentOnlyCatch: {
    regex: /catch\s*\([^)]*\)\s*{\s*(?:\/\/[^\n]+|\s)+\s*}/g,
    severity: 'high',
    message: '주석만 있는 catch 블록 - 실제 처리 필요'
  },
  
  // 8. 미구현 함수 (Not implemented 에러)
  notImplemented: {
    regex: /throw\s+new\s+Error\s*\(\s*['"`](?:Not implemented|TODO|Unimplemented|구현.*필요|미구현)/gi,
    severity: 'critical',
    message: '미구현 함수 - 즉시 구현 필요'
  },
  
  // 9. 함수 스텁 (빈 함수 또는 null 반환)
  functionStub: {
    regex: /(?:async\s+)?function\s+\w+\([^)]*\)\s*(?::\s*[\w<>]+)?\s*{\s*(?:\/\/.*TODO|return\s+(?:null|undefined);?\s*)\s*}/gi,
    severity: 'critical',
    message: '미구현 함수 스텁 - 즉시 구현 필요'
  },
  
  // 10. 임시 키워드
  temporaryKeyword: {
    regex: /(?:임시(?:로|방편)?|temporary|temp\s|workaround|hack|quick.*fix|dirty)/gi,
    severity: 'medium',
    message: '임시 처리 키워드 발견'
  },
  
  // 11. console.log 디버깅 (프로덕션 코드에 남아있는 경우)
  debugConsole: {
    regex: /console\.(log|debug|info|warn|error)\s*\(/g,
    severity: 'low',
    message: '디버깅 console 출력 - 프로덕션 전 제거 필요'
  },
  
  // 12. 테스트 스킵
  skippedTest: {
    regex: /(?:it|test|describe)\.(?:skip|only)\s*\(/g,
    severity: 'medium',
    message: '스킵되거나 단독 실행 테스트 - 정상화 필요'
  }
};

// 검사할 파일 패턴
const filePatterns = [
  'src/**/*.{ts,tsx,js,jsx}',
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}',
  'pages/**/*.{ts,tsx,js,jsx}',
  'utils/**/*.{ts,tsx,js,jsx}'
];

// 제외할 파일 패턴
const excludePatterns = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/*.d.ts',
  '**/scripts/detect-temporary-fixes.js', // 자기 자신 제외
  '**/scripts/type-*.js', // 타입 관련 스크립트 제외
  '**/__tests__/**',
  '**/__mocks__/**'
];

class TemporaryFixDetector {
  constructor() {
    this.issues = [];
    this.stats = {
      filesScanned: 0,
      filesWithIssues: 0,
      totalIssues: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    this.fileIssueCount = {};
  }

  // 파일 검사 (성능 최적화 포함)
  scanFile(filePath) {
    try {
      // 큰 파일 스킵 (1MB 이상)
      const stats = fs.statSync(filePath);
      if (stats.size > 1024 * 1024) {
        console.log(`  ⚠️  Skipping large file (${(stats.size / 1024 / 1024).toFixed(2)}MB): ${filePath}`);
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let fileHasIssues = false;
      
      Object.entries(patterns).forEach(([patternName, pattern]) => {
        // console.log 패턴은 테스트 파일에서는 무시
        if (patternName === 'debugConsole' && filePath.includes('.test.')) {
          return;
        }
        
        const matches = content.matchAll(pattern.regex);
        
        for (const match of matches) {
          const lineNumber = this.getLineNumber(content, match.index);
          const line = lines[lineNumber - 1];
          
          // 특정 패턴 필터링
          if (this.shouldSkipMatch(patternName, line, filePath)) {
            continue;
          }
          
          this.issues.push({
            file: filePath,
            line: lineNumber,
            severity: pattern.severity,
            type: patternName,
            message: pattern.message,
            code: line?.trim() || match[0]
          });
          
          this.stats[pattern.severity]++;
          this.stats.totalIssues++;
          fileHasIssues = true;
          
          // 파일별 이슈 카운트
          this.fileIssueCount[filePath] = (this.fileIssueCount[filePath] || 0) + 1;
        }
      });
      
      if (fileHasIssues) {
        this.stats.filesWithIssues++;
      }
      
      this.stats.filesScanned++;
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error.message);
    }
  }

  // 특정 매치를 스킵해야 하는지 판단
  shouldSkipMatch(patternName, line, filePath) {
    // eslint-disable 지시문이 있는 경우 스킵
    if (line && line.includes('eslint-disable')) {
      return true;
    }
    
    // @ts-ignore가 있는 경우 any 타입 허용
    if (patternName === 'anyType' && line && line.includes('@ts-ignore')) {
      return true;
    }
    
    // 타입 정의 파일에서는 any 허용
    if (patternName === 'anyType' && filePath.endsWith('.d.ts')) {
      return true;
    }
    
    return false;
  }

  // 라인 번호 계산
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // 모든 파일 스캔
  async scanAll() {
    console.log(`${colors.cyan}${colors.bold}🔍 임시 처리 감지 시작 (v2.0)...${colors.reset}\n`);
    
    const startTime = Date.now();
    
    for (const pattern of filePatterns) {
      const files = glob.sync(pattern, { 
        ignore: excludePatterns,
        nodir: true 
      });
      
      console.log(`📂 ${pattern} 패턴 검사 중... (${files.length}개 파일)`);
      
      files.forEach(file => this.scanFile(file));
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  검사 완료: ${duration}초\n`);
    
    this.reportResults();
  }

  // 결과 보고
  reportResults() {
    console.log(`${colors.bold}📊 스캔 결과${colors.reset}`);
    console.log(`├─ 검사한 파일: ${this.stats.filesScanned}개`);
    console.log(`├─ 문제 있는 파일: ${this.stats.filesWithIssues}개`);
    console.log(`└─ 발견된 문제: ${this.stats.totalIssues}개\n`);
    
    if (this.issues.length === 0) {
      console.log(`${colors.green}✅ 임시 처리 패턴이 발견되지 않았습니다!${colors.reset}`);
      console.log('프로젝트가 깨끗한 상태입니다. 🎉');
      process.exit(0);
    }
    
    // 파일별 이슈 수 상위 5개
    const topFiles = Object.entries(this.fileIssueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topFiles.length > 0) {
      console.log(`${colors.magenta}${colors.bold}📌 문제가 많은 파일 TOP 5${colors.reset}`);
      topFiles.forEach(([file, count], index) => {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`  ${index + 1}. ${relativePath} (${count}개)`);
      });
      console.log();
    }
    
    // 심각도별 그룹화
    const grouped = {
      critical: this.issues.filter(i => i.severity === 'critical'),
      high: this.issues.filter(i => i.severity === 'high'),
      medium: this.issues.filter(i => i.severity === 'medium'),
      low: this.issues.filter(i => i.severity === 'low')
    };
    
    // Critical 이슈
    if (grouped.critical.length > 0) {
      console.log(`${colors.red}${colors.bold}🚨 CRITICAL (${grouped.critical.length}개) - 즉시 수정 필요!${colors.reset}`);
      grouped.critical.slice(0, 10).forEach(issue => this.printIssue(issue, colors.red));
      if (grouped.critical.length > 10) {
        console.log(`  ... 외 ${grouped.critical.length - 10}개 더 있음`);
      }
      console.log();
    }
    
    // High 이슈
    if (grouped.high.length > 0) {
      console.log(`${colors.yellow}${colors.bold}⚠️  HIGH (${grouped.high.length}개) - 빠른 수정 필요${colors.reset}`);
      grouped.high.slice(0, 10).forEach(issue => this.printIssue(issue, colors.yellow));
      if (grouped.high.length > 10) {
        console.log(`  ... 외 ${grouped.high.length - 10}개 더 있음`);
      }
      console.log();
    }
    
    // Medium 이슈
    if (grouped.medium.length > 0) {
      console.log(`${colors.cyan}${colors.bold}ℹ️  MEDIUM (${grouped.medium.length}개) - 검토 필요${colors.reset}`);
      grouped.medium.slice(0, 5).forEach(issue => this.printIssue(issue, colors.cyan));
      if (grouped.medium.length > 5) {
        console.log(`  ... 외 ${grouped.medium.length - 5}개 더 있음`);
      }
      console.log();
    }
    
    // Low 이슈 (요약만)
    if (grouped.low.length > 0) {
      console.log(`${colors.cyan}📝 LOW (${grouped.low.length}개) - 참고 사항${colors.reset}\n`);
    }
    
    // 요약
    console.log(`${colors.bold}📈 요약:${colors.reset}`);
    console.log(`  🚨 Critical: ${this.stats.critical}개`);
    console.log(`  ⚠️  High: ${this.stats.high}개`);
    console.log(`  ℹ️  Medium: ${this.stats.medium}개`);
    console.log(`  📝 Low: ${this.stats.low}개`);
    
    // 행동 지침
    if (this.stats.critical > 0) {
      console.log(`\n${colors.red}${colors.bold}⛔ 작업 중단 필요!${colors.reset}`);
      console.log('Critical 이슈를 먼저 해결하세요:');
      console.log('1. 주석 처리된 DB 호출 → 테이블 생성 SQL 작성');
      console.log('2. Silent failure → 에러 처리 구현');
      console.log('3. 미구현 함수 → 즉시 구현');
      console.log('4. 빈 catch 블록 → 로깅 및 처리 추가');
      
      process.exit(1);
    } else if (this.stats.high > 0) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  주의: High 이슈가 있습니다${colors.reset}`);
      console.log('빠른 시일 내에 해결하세요:');
      console.log('1. TODO 주석 → 구현 완료');
      console.log('2. any 타입 → 구체적 타입 정의');
      console.log('3. 임시 반환값 → 실제 로직 구현');
      
      process.exit(1);
    } else if (this.stats.medium > 0) {
      console.log(`\n${colors.cyan}ℹ️  Medium 이슈를 검토해주세요.${colors.reset}`);
    }
    
    process.exit(0);
  }

  // 이슈 출력
  printIssue(issue, color) {
    const relativePath = path.relative(process.cwd(), issue.file);
    console.log(`  ${color}${relativePath}:${issue.line}${colors.reset}`);
    console.log(`    ${issue.message}`);
    console.log(`    ${colors.cyan}${issue.code.substring(0, 80)}${issue.code.length > 80 ? '...' : ''}${colors.reset}`);
  }
}

// 실행
async function main() {
  const detector = new TemporaryFixDetector();
  await detector.scanAll();
}

// CLI 실행
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = TemporaryFixDetector;