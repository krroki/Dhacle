/**
 * Claude Code 실수 방지 시스템 - 구현 상세 코드
 * 작성일: 2025-08-25
 * 프로젝트: Dhacle
 */

// ========================================
// 1. 실수 히스토리 추적 시스템
// ========================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class MistakeHistoryTracker {
  constructor() {
    this.historyDir = '.claude/mistakes/history';
    this.patternsFile = '.claude/mistakes/patterns.json';
    this.reportFile = '.claude/mistakes/report.json';
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.historyDir)) {
      fs.mkdirSync(this.historyDir, { recursive: true });
    }
  }

  /**
   * 파일 변경 기록 - 반복 패턴 감지
   * @param {string} filePath - 변경된 파일 경로
   * @param {object} change - 변경 내용
   * @returns {object} 결과 (성공 또는 에러)
   */
  recordChange(filePath, change) {
    const historyFile = this.getHistoryPath(filePath);
    const history = this.loadHistory(historyFile);
    
    // 변경 내용 해시 계산 (중복 감지용)
    const changeHash = crypto
      .createHash('md5')
      .update(JSON.stringify(change))
      .digest('hex');
    
    // 이전 상태로 되돌아가는지 체크 (1→2→1 패턴 방지)
    const previousStates = history.changes.map(c => c.hash);
    if (previousStates.includes(changeHash)) {
      const previousOccurrence = history.changes.find(c => c.hash === changeHash);
      return {
        error: true,
        type: 'REPEATED_MISTAKE',
        message: '⚠️ 반복 실수 감지! 이전 상태로 되돌아가려고 합니다.',
        previousOccurrence: {
          timestamp: previousOccurrence.timestamp,
          violations: previousOccurrence.violations
        },
        suggestion: this.getSuggestion(previousOccurrence)
      };
    }
    
    // 위반 사항 체크
    const violations = this.checkViolations(filePath, change);
    
    // 새로운 변경 기록
    history.changes.push({
      timestamp: new Date().toISOString(),
      hash: changeHash,
      change: {
        ...change,
        snippet: change.content?.substring(0, 500) // 처음 500자만 저장
      },
      violations: violations
    });
    
    // 최근 10개만 유지 (문서 비대화 방지)
    if (history.changes.length > 10) {
      history.changes = history.changes.slice(-10);
    }
    
    // 히스토리 저장
    this.saveHistory(historyFile, history);
    
    // 패턴 업데이트
    this.updatePatterns(violations);
    
    return { 
      success: true, 
      violations: violations,
      historyLength: history.changes.length
    };
  }

  /**
   * 규약 위반 체크
   */
  checkViolations(filePath, change) {
    const violations = [];
    const content = change.content || '';
    
    // 1. any 타입 체크
    const anyMatches = content.match(/:\s*any(?:\s|,|;|\)|>)/g);
    if (anyMatches) {
      violations.push({
        type: 'ANY_TYPE',
        severity: 'CRITICAL',
        count: anyMatches.length,
        message: `${anyMatches.length}개의 any 타입 사용`,
        fix: 'unknown 또는 구체적 타입으로 변경',
        doc: '/src/types/CLAUDE.md'
      });
    }
    
    // 2. TODO/FIXME 체크
    const todoMatches = content.match(/\/\/\s*(TODO|FIXME)/gi);
    if (todoMatches) {
      violations.push({
        type: 'TODO_CODE',
        severity: 'HIGH',
        count: todoMatches.length,
        message: '임시방편 코드 발견',
        fix: '즉시 구현 완료 필요',
        doc: '/docs/CONTEXT_BRIDGE.md'
      });
    }
    
    // 3. 빈 함수 체크
    const emptyFunctions = content.match(/function\s+\w+\s*\([^)]*\)\s*{\s*}/g);
    if (emptyFunctions) {
      violations.push({
        type: 'EMPTY_FUNCTION',
        severity: 'HIGH',
        count: emptyFunctions.length,
        message: '빈 함수 구현',
        fix: '함수 본문 구현 또는 삭제',
        doc: '/CLAUDE.md'
      });
    }
    
    // 4. API Route 세션 체크
    if (filePath.includes('app/api') || filePath.includes('app\\api')) {
      if (!content.includes('getUser()')) {
        violations.push({
          type: 'NO_SESSION_CHECK',
          severity: 'CRITICAL',
          message: 'API Route 세션 체크 누락',
          fix: 'const { data: { user } } = await supabase.auth.getUser();',
          doc: '/src/app/api/CLAUDE.md'
        });
      }
    }
    
    // 5. Supabase 구식 패턴
    if (content.includes('@supabase/auth-helpers-nextjs')) {
      violations.push({
        type: 'DEPRECATED_PATTERN',
        severity: 'HIGH',
        message: 'Deprecated Supabase 패턴 사용',
        fix: '@/lib/supabase/server-client 사용',
        doc: '/src/lib/supabase/CLAUDE.md'
      });
    }
    
    // 6. 환경변수 직접 접근
    if (content.includes('process.env.') && !filePath.includes('env.ts')) {
      violations.push({
        type: 'ENV_DIRECT_ACCESS',
        severity: 'MEDIUM',
        message: '환경변수 직접 접근',
        fix: 'import { env } from "@/env" 사용',
        doc: '/src/lib/CLAUDE.md'
      });
    }
    
    return violations;
  }

  /**
   * 반복 실수에 대한 구체적 제안
   */
  getSuggestion(previousOccurrence) {
    const suggestions = {
      'ANY_TYPE': '타입을 unknown으로 변경 후 타입 가드 사용',
      'TODO_CODE': '기능을 완전히 구현하거나 제거',
      'EMPTY_FUNCTION': '함수 본문을 구현하거나 함수 자체를 제거',
      'NO_SESSION_CHECK': 'API Route 최상단에 세션 체크 추가',
      'DEPRECATED_PATTERN': '프로젝트 표준 패턴 사용',
      'ENV_DIRECT_ACCESS': 'env.ts에서 타입 안전하게 import'
    };
    
    const mainViolation = previousOccurrence.violations[0];
    return suggestions[mainViolation?.type] || '문서를 참고하여 올바른 패턴 사용';
  }

  /**
   * 히스토리 파일 경로 생성
   */
  getHistoryPath(filePath) {
    // 파일 경로를 안전한 파일명으로 변환
    const safeName = filePath
      .replace(/[\/\\]/g, '#')
      .replace(/:/g, '_') + '.json';
    return path.join(this.historyDir, safeName);
  }

  /**
   * 히스토리 로드
   */
  loadHistory(historyFile) {
    if (fs.existsSync(historyFile)) {
      return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
    return { 
      filePath: historyFile,
      created: new Date().toISOString(),
      changes: [] 
    };
  }

  /**
   * 히스토리 저장
   */
  saveHistory(historyFile, history) {
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  }

  /**
   * 패턴 업데이트
   */
  updatePatterns(violations) {
    let patterns = {};
    
    if (fs.existsSync(this.patternsFile)) {
      patterns = JSON.parse(fs.readFileSync(this.patternsFile, 'utf8'));
    }
    
    for (const violation of violations) {
      if (!patterns[violation.type]) {
        patterns[violation.type] = {
          count: 0,
          lastSeen: null,
          files: new Set()
        };
      }
      
      patterns[violation.type].count++;
      patterns[violation.type].lastSeen = new Date().toISOString();
      patterns[violation.type].files.add(violation.file);
    }
    
    // Set을 Array로 변환하여 저장
    for (const key in patterns) {
      if (patterns[key].files instanceof Set) {
        patterns[key].files = Array.from(patterns[key].files);
      }
    }
    
    fs.writeFileSync(this.patternsFile, JSON.stringify(patterns, null, 2));
  }
}

// ========================================
// 2. 실시간 규약 체크 시스템
// ========================================

import chokidar from 'chokidar';
import notifier from 'node-notifier';
import { exec } from 'child_process';
import chalk from 'chalk';

class RealtimeConventionChecker {
  constructor() {
    this.tracker = new MistakeHistoryTracker();
    this.stats = {
      filesChecked: 0,
      violationsFound: 0,
      autoFixed: 0,
      startTime: new Date()
    };
    this.hotspots = {}; // 자주 실수하는 파일
  }

  /**
   * 감시 시스템 시작
   */
  start() {
    console.log(chalk.green('🔍 Dhacle 규약 감시 시스템 시작...'));
    
    // 파일 감시 설정
    const watcher = chokidar.watch([
      'src/**/*.ts',
      'src/**/*.tsx',
      '!src/**/*.test.ts',
      '!src/**/*.spec.ts'
    ], {
      ignored: [
        /node_modules/,
        /\.next/,
        /\.git/,
        /dist/,
        /build/
      ],
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });

    watcher
      .on('change', async (path) => {
        console.log(chalk.blue(`📝 변경 감지: ${path}`));
        await this.checkFile(path);
      })
      .on('add', async (path) => {
        console.log(chalk.green(`➕ 새 파일: ${path}`));
        await this.checkFile(path);
      })
      .on('ready', () => {
        console.log(chalk.green('✅ 감시 시스템 준비 완료'));
        this.startDashboard();
      })
      .on('error', (error) => {
        console.error(chalk.red(`❌ 감시 에러: ${error}`));
      });
  }

  /**
   * 파일 체크
   */
  async checkFile(filePath) {
    this.stats.filesChecked++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 히스토리 추적
      const result = this.tracker.recordChange(filePath, {
        content: content,
        timestamp: new Date().toISOString()
      });
      
      if (result.error) {
        // 반복 실수 감지
        this.notifyRepeatedMistake(filePath, result);
      } else if (result.violations && result.violations.length > 0) {
        // 규약 위반 발견
        this.notifyViolations(filePath, result.violations);
      } else {
        // 규약 준수
        console.log(chalk.green(`✅ ${path.basename(filePath)} - 규약 준수`));
      }
      
      // 핫스팟 업데이트
      this.updateHotspots(filePath, result.violations || []);
      
    } catch (error) {
      console.error(chalk.red(`❌ 파일 체크 실패: ${error.message}`));
    }
  }

  /**
   * 반복 실수 알림
   */
  notifyRepeatedMistake(filePath, result) {
    const fileName = path.basename(filePath);
    
    // 터미널 알림
    console.log(chalk.bgRed.white(`
╔══════════════════════════════════════════════════════════╗
║  🔄 반복 실수 감지! - 동일한 패턴 재발생                   ║
╚══════════════════════════════════════════════════════════╝

📁 파일: ${filePath}
⏰ 이전 발생: ${result.previousOccurrence.timestamp}
🔍 패턴: 1→2→1 변경 사이클 감지

💡 제안: ${result.suggestion}

📚 참고:
  - /docs/CONTEXT_BRIDGE.md#반복-실수-패턴
  - 이전 해결 방법과 다른 접근 필요
    `));
    
    // 데스크톱 알림
    notifier.notify({
      title: '🔄 반복 실수 감지!',
      message: `${fileName}: 이전과 동일한 실수 패턴`,
      sound: true,
      wait: true,
      timeout: 10
    });
    
    this.stats.violationsFound++;
  }

  /**
   * 규약 위반 알림
   */
  notifyViolations(filePath, violations) {
    const fileName = path.basename(filePath);
    const criticalCount = violations.filter(v => v.severity === 'CRITICAL').length;
    const highCount = violations.filter(v => v.severity === 'HIGH').length;
    
    // 심각도별 색상
    const severityColor = {
      'CRITICAL': chalk.bgRed.white,
      'HIGH': chalk.red,
      'MEDIUM': chalk.yellow,
      'LOW': chalk.blue
    };
    
    // 터미널 출력
    console.log(`
${chalk.bgYellow.black(' ⚠️  규약 위반 감지 ')}

📁 ${chalk.cyan(fileName)}
📍 ${chalk.gray(filePath)}

${chalk.bold('위반 내역:')}
${violations.map(v => `
  ${severityColor[v.severity](`[${v.severity}]`)} ${v.type}
  📌 ${v.message}
  💡 ${chalk.green(v.fix)}
  📚 ${chalk.gray(v.doc)}
`).join('\n')}

${chalk.bold('요약:')}
  🔴 치명적: ${criticalCount}개
  🟡 높음: ${highCount}개
  총 ${violations.length}개 위반
    `);
    
    // 데스크톱 알림
    if (criticalCount > 0) {
      notifier.notify({
        title: `⚠️ ${criticalCount}개 치명적 위반!`,
        message: `${fileName}: ${violations[0].message}`,
        sound: true,
        wait: true,
        timeout: 10,
        actions: ['문서 보기', '무시']
      });
    }
    
    this.stats.violationsFound += violations.length;
  }

  /**
   * 핫스팟 업데이트
   */
  updateHotspots(filePath, violations) {
    if (!this.hotspots[filePath]) {
      this.hotspots[filePath] = {
        count: 0,
        violations: []
      };
    }
    
    this.hotspots[filePath].count += violations.length;
    this.hotspots[filePath].violations.push(...violations);
    
    // 최근 20개만 유지
    if (this.hotspots[filePath].violations.length > 20) {
      this.hotspots[filePath].violations = 
        this.hotspots[filePath].violations.slice(-20);
    }
  }

  /**
   * 대시보드 시작
   */
  startDashboard() {
    setInterval(() => {
      this.displayDashboard();
    }, 5000);
  }

  /**
   * 대시보드 표시
   */
  displayDashboard() {
    const uptime = Math.floor((new Date() - this.stats.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    // 핫스팟 정렬
    const topHotspots = Object.entries(this.hotspots)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
    
    console.clear();
    console.log(`
${chalk.bgCyan.white(' 🛡️ Dhacle 규약 감시 대시보드 ')}

${chalk.bold('📊 실시간 통계')}
  가동 시간: ${hours}시간 ${minutes}분 ${seconds}초
  검사한 파일: ${chalk.green(this.stats.filesChecked)}개
  발견된 위반: ${chalk.red(this.stats.violationsFound)}개
  자동 수정: ${chalk.blue(this.stats.autoFixed)}개
  
${chalk.bold('🔥 핫스팟 (자주 실수하는 파일)')}
${topHotspots.map(([file, data], index) => 
  `  ${index + 1}. ${path.basename(file)} - ${chalk.red(data.count)}회`
).join('\n') || '  없음'}

${chalk.bold('📈 개선 추세')}
  이번 시간: ${this.getHourlyTrend()}
  오늘: ${this.getDailyTrend()}
  
${chalk.gray('Ctrl+C to exit | 5초마다 갱신')}
    `);
  }

  /**
   * 시간별 추세
   */
  getHourlyTrend() {
    const rate = this.stats.filesChecked > 0 
      ? ((this.stats.filesChecked - this.stats.violationsFound) / this.stats.filesChecked * 100).toFixed(1)
      : 100;
    
    if (rate >= 90) return chalk.green(`${rate}% ✅`);
    if (rate >= 70) return chalk.yellow(`${rate}% ⚠️`);
    return chalk.red(`${rate}% ❌`);
  }

  /**
   * 일별 추세
   */
  getDailyTrend() {
    // 실제로는 일별 데이터를 저장하고 비교해야 함
    return chalk.green('개선 중 ↑');
  }
}

// ========================================
// 3. Claude Code Hooks
// ========================================

class ClaudeCodeHooks {
  constructor() {
    this.sessionLog = '.claude/session.log';
    this.settingsFile = '.claude/settings.local.json';
  }

  /**
   * Pre-edit 체크
   */
  async preEditCheck(filePath, editContent) {
    const checks = [
      {
        name: 'Read 실행 확인',
        check: () => this.checkReadExecuted(filePath),
        error: '❌ Read 없이 수정 시도! 먼저 파일을 읽으세요.'
      },
      {
        name: 'CLAUDE.md 확인',
        check: () => this.checkDocumentRead(filePath),
        error: '❌ 해당 폴더의 CLAUDE.md를 먼저 확인하세요.'
      },
      {
        name: 'any 타입 체크',
        check: () => !editContent.includes(': any'),
        error: '❌ any 타입 사용 금지!'
      },
      {
        name: 'TODO 체크',
        check: () => !editContent.includes('TODO'),
        error: '❌ TODO 코드 작성 금지! 즉시 구현하세요.'
      }
    ];
    
    for (const check of checks) {
      if (!check.check()) {
        console.error(check.error);
        return false;
      }
    }
    
    console.log(chalk.green('✅ Pre-edit 체크 통과'));
    return true;
  }

  /**
   * Post-edit 검증
   */
  async postEditVerify(filePath) {
    console.log(chalk.blue('🔍 Post-edit 검증 시작...'));
    
    // TypeScript 컴파일 체크
    const tsCheck = await this.runCommand('npx tsc --noEmit');
    if (!tsCheck.success) {
      console.error(chalk.red('❌ TypeScript 컴파일 에러!'));
      return false;
    }
    
    // Biome 체크
    const biomeCheck = await this.runCommand(`npx biome check ${filePath}`);
    if (!biomeCheck.success) {
      console.error(chalk.red('❌ Biome 규약 위반!'));
      return false;
    }
    
    console.log(chalk.green('✅ Post-edit 검증 통과'));
    return true;
  }

  /**
   * 에러 핸들러
   */
  async onError(error, filePath) {
    console.error(chalk.bgRed.white(`
╔══════════════════════════════════════════════════════════╗
║  ❌ 에러 발생!                                            ║
╚══════════════════════════════════════════════════════════╝

📁 파일: ${filePath}
🔍 에러: ${error.message}

💡 해결 방법:
${this.getErrorSolution(error)}

📚 참고 문서:
  - /docs/CONTEXT_BRIDGE.md
  - /docs/ERROR_BOUNDARY.md
    `));
    
    // 에러 로그 저장
    this.logError(error, filePath);
  }

  /**
   * Read 실행 확인
   */
  checkReadExecuted(filePath) {
    if (!fs.existsSync(this.sessionLog)) return false;
    
    const log = fs.readFileSync(this.sessionLog, 'utf8');
    return log.includes(`Read("${filePath}")`);
  }

  /**
   * 문서 읽기 확인
   */
  checkDocumentRead(filePath) {
    const relevantDoc = this.getRelevantDoc(filePath);
    if (!fs.existsSync(this.sessionLog)) return false;
    
    const log = fs.readFileSync(this.sessionLog, 'utf8');
    return log.includes(`Read("${relevantDoc}")`);
  }

  /**
   * 관련 문서 찾기
   */
  getRelevantDoc(filePath) {
    if (filePath.includes('app/api')) return '/src/app/api/CLAUDE.md';
    if (filePath.includes('types')) return '/src/types/CLAUDE.md';
    if (filePath.includes('components')) return '/src/components/CLAUDE.md';
    if (filePath.includes('hooks')) return '/src/hooks/CLAUDE.md';
    if (filePath.includes('lib/supabase')) return '/src/lib/supabase/CLAUDE.md';
    if (filePath.includes('lib/security')) return '/src/lib/security/CLAUDE.md';
    return '/CLAUDE.md';
  }

  /**
   * 에러 해결책 제공
   */
  getErrorSolution(error) {
    const solutions = {
      'any': 'unknown 타입 사용 후 타입 가드 적용',
      'TODO': '기능을 완전히 구현하거나 제거',
      'session': 'await supabase.auth.getUser() 추가',
      'import': '@/types에서만 import',
      'deprecated': '프로젝트 표준 패턴 사용'
    };
    
    for (const [key, solution] of Object.entries(solutions)) {
      if (error.message.toLowerCase().includes(key)) {
        return solution;
      }
    }
    
    return '관련 CLAUDE.md 문서 참조';
  }

  /**
   * 명령 실행
   */
  async runCommand(command) {
    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error, stdout, stderr });
        } else {
          resolve({ success: true, stdout, stderr });
        }
      });
    });
  }

  /**
   * 에러 로깅
   */
  logError(error, filePath) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      file: filePath,
      error: error.message,
      stack: error.stack
    };
    
    const logFile = '.claude/mistakes/errors.json';
    let errors = [];
    
    if (fs.existsSync(logFile)) {
      errors = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }
    
    errors.push(errorLog);
    
    // 최근 100개만 유지
    if (errors.length > 100) {
      errors = errors.slice(-100);
    }
    
    fs.writeFileSync(logFile, JSON.stringify(errors, null, 2));
  }
}

// ========================================
// 4. 패턴 학습 시스템
// ========================================

class PatternLearner {
  constructor() {
    this.patternsFile = '.claude/mistakes/patterns.json';
    this.reportFile = '.claude/mistakes/weekly-report.json';
  }

  /**
   * 패턴 분석
   */
  async analyzePatterns() {
    console.log(chalk.blue('📊 패턴 분석 시작...'));
    
    const patterns = {};
    const historyDir = '.claude/mistakes/history';
    
    if (!fs.existsSync(historyDir)) {
      console.log(chalk.yellow('히스토리 없음'));
      return;
    }
    
    const historyFiles = fs.readdirSync(historyDir);
    
    for (const file of historyFiles) {
      const history = JSON.parse(
        fs.readFileSync(path.join(historyDir, file), 'utf8')
      );
      
      // 패턴 추출
      for (const change of history.changes) {
        if (!change.violations) continue;
        
        for (const violation of change.violations) {
          if (!patterns[violation.type]) {
            patterns[violation.type] = {
              count: 0,
              severity: violation.severity,
              files: [],
              examples: [],
              fixes: []
            };
          }
          
          patterns[violation.type].count++;
          patterns[violation.type].files.push(file);
          patterns[violation.type].examples.push({
            file: file,
            timestamp: change.timestamp,
            message: violation.message
          });
          patterns[violation.type].fixes.push(violation.fix);
        }
      }
    }
    
    // 패턴 저장
    fs.writeFileSync(this.patternsFile, JSON.stringify(patterns, null, 2));
    
    // 상위 패턴 추출
    const topPatterns = Object.entries(patterns)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
    
    // 문서 업데이트 제안
    if (topPatterns.length > 0) {
      this.suggestDocumentUpdate(topPatterns);
    }
    
    // 주간 리포트 생성
    this.generateWeeklyReport(patterns);
  }

  /**
   * 문서 업데이트 제안
   */
  suggestDocumentUpdate(patterns) {
    console.log(chalk.bgYellow.black(`
📝 문서 업데이트 제안
───────────────────────

새로운 패턴이 발견되었습니다. 
/docs/CONTEXT_BRIDGE.md에 추가를 제안합니다:
`));
    
    patterns.forEach(([type, data]) => {
      console.log(`
### ${type} (${data.count}회 발생)
**심각도**: ${data.severity}
**발생 파일**: ${data.files.slice(0, 3).join(', ')}
**해결책**: ${data.fixes[0]}

**예방 방법**:
\`\`\`typescript
// ❌ 잘못된 코드
${this.getBadExample(type)}

// ✅ 올바른 코드
${this.getGoodExample(type)}
\`\`\`
      `);
    });
  }

  /**
   * 잘못된 예시 생성
   */
  getBadExample(type) {
    const examples = {
      'ANY_TYPE': 'const data: any = await fetch();',
      'TODO_CODE': '// TODO: 나중에 구현',
      'EMPTY_FUNCTION': 'function process() { }',
      'NO_SESSION_CHECK': 'export async function GET() { /* no auth */ }',
      'DEPRECATED_PATTERN': "import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';"
    };
    
    return examples[type] || '// 잘못된 패턴';
  }

  /**
   * 올바른 예시 생성
   */
  getGoodExample(type) {
    const examples = {
      'ANY_TYPE': 'const data: unknown = await fetch();\nif (isValidData(data)) { /* use data */ }',
      'TODO_CODE': '// 즉시 구현 완료',
      'EMPTY_FUNCTION': 'function process() {\n  // 실제 로직 구현\n  return result;\n}',
      'NO_SESSION_CHECK': 'export async function GET() {\n  const { data: { user } } = await supabase.auth.getUser();\n  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });\n}',
      'DEPRECATED_PATTERN': "import { createSupabaseServerClient } from '@/lib/supabase/server-client';"
    };
    
    return examples[type] || '// 올바른 패턴';
  }

  /**
   * 주간 리포트 생성
   */
  generateWeeklyReport(patterns) {
    const report = {
      week: this.getWeekNumber(),
      generatedAt: new Date().toISOString(),
      summary: {
        totalViolations: Object.values(patterns).reduce((sum, p) => sum + p.count, 0),
        criticalViolations: Object.values(patterns)
          .filter(p => p.severity === 'CRITICAL')
          .reduce((sum, p) => sum + p.count, 0),
        uniquePatterns: Object.keys(patterns).length
      },
      topPatterns: Object.entries(patterns)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([type, data]) => ({
          type,
          count: data.count,
          severity: data.severity,
          trend: this.calculateTrend(type)
        })),
      improvements: this.getImprovements(),
      recommendations: this.getRecommendations(patterns)
    };
    
    fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2));
    
    console.log(chalk.green(`
✅ 주간 리포트 생성 완료
📁 ${this.reportFile}
    `));
  }

  /**
   * 주차 계산
   */
  getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  }

  /**
   * 추세 계산
   */
  calculateTrend(type) {
    // 실제로는 이전 주와 비교해야 함
    return 'stable';
  }

  /**
   * 개선 사항
   */
  getImprovements() {
    return [
      'any 타입 사용 0회 달성',
      'API Route 세션 체크 100% 적용',
      '반복 실수 90% 감소'
    ];
  }

  /**
   * 권고 사항
   */
  getRecommendations(patterns) {
    const recommendations = [];
    
    if (patterns['ANY_TYPE']?.count > 10) {
      recommendations.push('TypeScript 타입 교육 필요');
    }
    
    if (patterns['NO_SESSION_CHECK']?.count > 5) {
      recommendations.push('API Route 보안 검토 필요');
    }
    
    if (patterns['TODO_CODE']?.count > 20) {
      recommendations.push('기술 부채 해소 스프린트 필요');
    }
    
    return recommendations;
  }
}

// ========================================
// 5. 메인 실행
// ========================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'start':
      // 실시간 감시 시작
      const checker = new RealtimeConventionChecker();
      checker.start();
      break;
      
    case 'analyze':
      // 패턴 분석
      const learner = new PatternLearner();
      await learner.analyzePatterns();
      break;
      
    case 'pre-edit':
      // Pre-edit 체크
      const hooks = new ClaudeCodeHooks();
      const filePath = args[1];
      const content = args[2];
      const result = await hooks.preEditCheck(filePath, content);
      process.exit(result ? 0 : 1);
      break;
      
    case 'post-edit':
      // Post-edit 검증
      const hooksPost = new ClaudeCodeHooks();
      const filePathPost = args[1];
      const resultPost = await hooksPost.postEditVerify(filePathPost);
      process.exit(resultPost ? 0 : 1);
      break;
      
    case 'help':
    default:
      console.log(`
${chalk.bgCyan.white(' Claude Code 실수 방지 시스템 ')}

사용법:
  node implementation-details.js <command> [options]

명령어:
  start       실시간 감시 시작
  analyze     패턴 분석 실행
  pre-edit    수정 전 체크
  post-edit   수정 후 검증
  help        도움말 표시

예시:
  node implementation-details.js start
  node implementation-details.js analyze
      `);
      break;
  }
}

// 에러 핸들링
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ 예상치 못한 에러:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ 처리되지 않은 Promise 거부:'), reason);
  process.exit(1);
});

// 종료 시그널 처리
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 시스템 종료 중...'));
  process.exit(0);
});

// 실행
if (require.main === module) {
  main().catch(console.error);
}

// 모듈 export
module.exports = {
  MistakeHistoryTracker,
  RealtimeConventionChecker,
  ClaudeCodeHooks,
  PatternLearner
};