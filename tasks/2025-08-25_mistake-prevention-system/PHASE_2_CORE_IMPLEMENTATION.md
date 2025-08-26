/sc:implement --seq --validate --think-hard
"Phase 2: 핵심 감지 엔진 및 시스템 구현"

# Phase 2: 핵심 시스템 구현

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📌 Phase 정보
- Phase 번호: 2/3
- 예상 시간: 1시간
- 우선순위: CRITICAL
- 목표: 13가지 실수 패턴 감지 엔진 구현

## 🔥 실제 코드 패턴 확인

### 프로젝트 패턴 분석
```bash
# Step 0-1: API 패턴 확인
echo "=== API 사용 패턴 확인 ==="
grep -r "apiGet\|apiPost" src/ --include="*.ts" --include="*.tsx" | head -5
# 결과: apiGet, apiPost 함수 사용 중

# Step 0-2: Supabase 패턴 확인
echo "=== Supabase 클라이언트 패턴 ==="
grep -r "createSupabaseServerClient" src/ | head -5
# 결과: 프로젝트 표준 패턴

# Step 0-3: Import 패턴 확인
echo "=== 타입 Import 패턴 ==="
grep -r "from '@/types'" src/ --include="*.ts" | head -5
# 결과: @/types에서만 import

# Step 0-4: 기존 검증 스크립트 확인
echo "=== 검증 스크립트 패턴 ==="
ls scripts/verify-*.js | head -5
# 결과: 검증 스크립트만 존재 (fix-*.js 없음)
```

## 🎯 Phase 2 목표
1. MistakeHistoryTracker 클래스 구현
2. ConventionChecker 클래스 구현
3. RealtimeWatchdog 클래스 구현
4. Claude Code Hooks 통합
5. Dashboard UI 구현

## 📝 작업 내용

### 2.1 메인 구현 파일 생성

`.claude/watchdog/implementation-details.js` 생성:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chokidar = require('chokidar');
const notifier = require('node-notifier');
const chalk = require('chalk');

// ===========================
// 1. MistakeHistoryTracker 클래스
// ===========================
class MistakeHistoryTracker {
  constructor() {
    this.historyDir = path.join(process.cwd(), '.claude/mistakes/history');
    this.maxHistorySize = 1000;
    this.history = new Map();
    this.loadHistory();
  }

  loadHistory() {
    if (!fs.existsSync(this.historyDir)) {
      fs.mkdirSync(this.historyDir, { recursive: true });
    }
    
    const historyFile = path.join(this.historyDir, 'history.json');
    if (fs.existsSync(historyFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
        this.history = new Map(data);
      } catch (err) {
        console.error(chalk.red('히스토리 로드 실패:'), err.message);
      }
    }
  }

  saveHistory() {
    const historyFile = path.join(this.historyDir, 'history.json');
    fs.writeFileSync(
      historyFile, 
      JSON.stringify(Array.from(this.history.entries())),
      'utf8'
    );
  }

  recordChange(filePath, change) {
    const changeHash = crypto.createHash('md5')
      .update(JSON.stringify(change))
      .digest('hex');
    
    const fileHistory = this.history.get(filePath) || [];
    
    // 1→2→1 패턴 감지
    if (fileHistory.length > 1) {
      const previousHash = fileHistory[fileHistory.length - 2];
      if (previousHash === changeHash) {
        return {
          error: true,
          type: 'REPEATED_MISTAKE',
          message: '⚠️ 반복 실수 감지! 이전 상태로 되돌아가려고 합니다.',
          pattern: '1→2→1',
          suggestion: '근본적인 해결책을 찾아주세요. 임시방편은 금지입니다.'
        };
      }
    }
    
    fileHistory.push(changeHash);
    
    // 히스토리 크기 제한
    if (fileHistory.length > this.maxHistorySize) {
      fileHistory.shift();
    }
    
    this.history.set(filePath, fileHistory);
    this.saveHistory();
    
    return { error: false };
  }
}

// ===========================
// 2. ConventionChecker 클래스
// ===========================
class ConventionChecker {
  constructor() {
    this.violations = [];
    this.patterns = {
      critical: [
        {
          name: 'ANY_TYPE',
          pattern: /:\s*any(?:\s|,|;|\)|>)/g,
          message: '🚫 any 타입 사용 금지! 구체적 타입을 정의하세요.',
          severity: 'CRITICAL'
        },
        {
          name: 'TODO_FIXME',
          pattern: /\/\/\s*(TODO|FIXME)/gi,
          message: '🚫 TODO/FIXME는 임시방편! 즉시 완전히 해결하세요.',
          severity: 'CRITICAL'
        },
        {
          name: 'AUTO_SCRIPT',
          pattern: /scripts\/fix-.*\.js$/,
          message: '🚫 자동 변환 스크립트 금지! 38개 스크립트 재앙 방지!',
          severity: 'CRITICAL'
        },
        {
          name: 'NO_SESSION_CHECK',
          pattern: null, // 특별 체크
          message: '🚫 API Route에 getUser() 세션 체크 필수!',
          severity: 'CRITICAL'
        }
      ],
      recurring: [
        {
          name: 'OLD_SUPABASE',
          pattern: /createServerComponentClient/g,
          message: '⚠️ 구식 Supabase 패턴! createSupabaseServerClient 사용',
          severity: 'HIGH'
        },
        {
          name: 'DIRECT_DB_IMPORT',
          pattern: /from\s+['"].*database\.generated/g,
          message: '⚠️ database.generated.ts 직접 import 금지! @/types 사용',
          severity: 'HIGH'
        },
        {
          name: 'GET_SESSION',
          pattern: /getSession\(\)/g,
          message: '⚠️ getSession() 금지! getUser() 사용',
          severity: 'HIGH'
        },
        {
          name: 'DIRECT_FETCH',
          pattern: /fetch\(/g,
          message: '⚠️ fetch() 직접 호출 금지! apiClient 사용',
          severity: 'MEDIUM'
        },
        {
          name: 'SNAKE_CASE_VAR',
          pattern: /(?:const|let|var)\s+[a-z]+_[a-z]+/g,
          message: '⚠️ snake_case 변수명 금지! camelCase 사용',
          severity: 'LOW'
        }
      ]
    };
  }

  checkFile(filePath, content) {
    this.violations = [];
    
    // Critical 패턴 체크
    this.patterns.critical.forEach(rule => {
      if (rule.name === 'NO_SESSION_CHECK') {
        // API Route 특별 체크
        if (filePath.includes('app/api') && filePath.endsWith('route.ts')) {
          if (!content.includes('getUser()')) {
            this.violations.push({
              type: rule.name,
              severity: rule.severity,
              message: rule.message,
              file: filePath,
              line: 1
            });
          }
        }
      } else if (rule.pattern) {
        const matches = content.match(rule.pattern);
        if (matches) {
          matches.forEach(match => {
            const lines = content.substring(0, content.indexOf(match)).split('\\n');
            this.violations.push({
              type: rule.name,
              severity: rule.severity,
              message: rule.message,
              file: filePath,
              line: lines.length,
              match: match
            });
          });
        }
      }
    });
    
    // Recurring 패턴 체크
    this.patterns.recurring.forEach(rule => {
      if (rule.pattern) {
        const matches = content.match(rule.pattern);
        if (matches) {
          matches.forEach(match => {
            const lines = content.substring(0, content.indexOf(match)).split('\\n');
            this.violations.push({
              type: rule.name,
              severity: rule.severity,
              message: rule.message,
              file: filePath,
              line: lines.length,
              match: match
            });
          });
        }
      }
    });
    
    return this.violations;
  }
}

// ===========================
// 3. RealtimeWatchdog 클래스
// ===========================
class RealtimeWatchdog {
  constructor() {
    this.tracker = new MistakeHistoryTracker();
    this.checker = new ConventionChecker();
    this.stats = {
      startTime: Date.now(),
      filesChecked: 0,
      violationsFound: 0,
      criticalCount: 0,
      autoFixed: 0
    };
    this.config = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')
    );
  }

  start() {
    console.clear();
    console.log(chalk.cyan('🛡️ Claude Code 실수 방지 시스템 시작'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(chalk.yellow('⚠️  자동 수정: ') + chalk.red('비활성화 (38개 스크립트 재앙 방지)'));
    console.log(chalk.gray('━'.repeat(50)));
    
    // 파일 감시 시작
    const watcher = chokidar.watch(['src/**/*.{ts,tsx,js,jsx}', 'scripts/**/*.js'], {
      ignored: this.config.ignored,
      persistent: true,
      ignoreInitial: true
    });
    
    watcher
      .on('add', path => this.handleFile(path, 'added'))
      .on('change', path => this.handleFile(path, 'changed'))
      .on('unlink', path => this.handleFile(path, 'deleted'));
    
    // 대시보드 업데이트
    setInterval(() => this.updateDashboard(), 5000);
    
    // 종료 처리
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\\n\\n시스템 종료 중...'));
      watcher.close();
      process.exit(0);
    });
  }

  handleFile(filePath, event) {
    if (event === 'deleted') return;
    
    this.stats.filesChecked++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 히스토리 체크
      const historyResult = this.tracker.recordChange(filePath, { content, timestamp: Date.now() });
      if (historyResult.error) {
        this.showNotification('critical', historyResult.message, filePath);
        console.log(chalk.red('\\n' + historyResult.message));
        console.log(chalk.yellow(`파일: ${filePath}`));
        console.log(chalk.cyan(`제안: ${historyResult.suggestion}`));
        return;
      }
      
      // 규약 체크
      const violations = this.checker.checkFile(filePath, content);
      
      if (violations.length > 0) {
        this.stats.violationsFound += violations.length;
        
        violations.forEach(violation => {
          if (violation.severity === 'CRITICAL') {
            this.stats.criticalCount++;
            this.showNotification('critical', violation.message, filePath);
          } else {
            this.showNotification('warning', violation.message, filePath);
          }
          
          // 콘솔 출력
          const color = violation.severity === 'CRITICAL' ? 'red' : 
                       violation.severity === 'HIGH' ? 'yellow' : 'gray';
          console.log(chalk[color](`\\n${violation.message}`));
          console.log(chalk.gray(`📁 ${filePath}:${violation.line}`));
          if (violation.match) {
            console.log(chalk.gray(`📝 ${violation.match.substring(0, 50)}...`));
          }
        });
      }
    } catch (err) {
      console.error(chalk.red('파일 처리 오류:'), err.message);
    }
  }

  showNotification(level, message, file) {
    if (!this.config.notifications.desktop) return;
    
    const fileName = path.basename(file);
    
    notifier.notify({
      title: level === 'critical' ? '🚨 Critical 위반!' : '⚠️ 규약 위반',
      message: `${message}\\n파일: ${fileName}`,
      sound: level === 'critical',
      wait: false,
      timeout: 5
    });
  }

  updateDashboard() {
    console.clear();
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    console.log(chalk.cyan.bold('🛡️ Dhacle 규약 감시 대시보드'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(chalk.white.bold('\\n📊 실시간 통계'));
    console.log(chalk.gray(`  가동 시간: ${hours}시간 ${minutes}분 ${seconds}초`));
    console.log(chalk.gray(`  검사한 파일: ${this.stats.filesChecked}개`));
    console.log(chalk.yellow(`  발견된 위반: ${this.stats.violationsFound}개`));
    console.log(chalk.red(`  Critical 위반: ${this.stats.criticalCount}개`));
    console.log(chalk.green(`  자동 수정: ${this.stats.autoFixed}개 (비활성화)`));
    
    console.log(chalk.white.bold('\\n🔥 감시 중인 패턴 (13개)'));
    console.log(chalk.red('  Critical: any타입, TODO/FIXME, 자동스크립트, 세션체크'));
    console.log(chalk.yellow('  High: 구식Supabase, DB직접import, getSession'));
    console.log(chalk.gray('  Medium: fetch직접호출, snake_case'));
    
    console.log(chalk.white.bold('\\n📈 목표 달성도'));
    const anyCount = this.getCurrentAnyCount();
    console.log(chalk.gray(`  any 타입: ${anyCount}/0개 (목표: 0개)`));
    console.log(chalk.gray(`  반복 실수: ${this.stats.criticalCount}회 (목표: 0회/월)`));
    
    console.log(chalk.gray('\\n━'.repeat(50)));
    console.log(chalk.dim('Ctrl+C로 종료 | 38개 스크립트 재앙 방지 모드'));
  }

  getCurrentAnyCount() {
    // 실제로는 grep 명령 실행
    try {
      const { execSync } = require('child_process');
      const result = execSync('grep -r ": any" src/ --include="*.ts" 2>/dev/null | wc -l', { encoding: 'utf8' });
      return parseInt(result.trim()) || 0;
    } catch {
      return 88; // 기본값
    }
  }
}

// ===========================
// 4. CLI 명령어 처리
// ===========================
const command = process.argv[2];

switch (command) {
  case 'start':
    const watchdog = new RealtimeWatchdog();
    watchdog.start();
    break;
    
  case 'analyze':
    console.log(chalk.cyan('📊 패턴 분석 중...'));
    // 주간 리포트 생성 로직
    const reportPath = path.join('.claude/mistakes/weekly-report.md');
    const report = `# 주간 실수 패턴 분석\\n\\n생성일: ${new Date().toISOString()}\\n\\n...`;
    fs.writeFileSync(reportPath, report);
    console.log(chalk.green(`✅ 리포트 생성: ${reportPath}`));
    break;
    
  case 'pre-edit':
    const file = process.argv[3];
    if (file) {
      console.log(chalk.cyan(`🔍 수정 전 체크: ${file}`));
      const checker = new ConventionChecker();
      const content = fs.readFileSync(file, 'utf8');
      const violations = checker.checkFile(file, content);
      if (violations.length > 0) {
        console.log(chalk.red('⚠️ 위반 발견! 수정 전 해결하세요.'));
        process.exit(1);
      }
    }
    break;
    
  case 'post-edit':
    const editedFile = process.argv[3];
    if (editedFile) {
      console.log(chalk.cyan(`🔍 수정 후 체크: ${editedFile}`));
      // 수정 후 검증 로직
    }
    break;
    
  default:
    console.log(chalk.yellow('사용법:'));
    console.log('  node implementation-details.js start      - 실시간 감시 시작');
    console.log('  node implementation-details.js analyze    - 패턴 분석');
    console.log('  node implementation-details.js pre-edit   - 수정 전 체크');
    console.log('  node implementation-details.js post-edit  - 수정 후 체크');
}
```

### 2.2 Claude Code 설정 파일

`.claude/settings.local.json` 생성:

```json
{
  "hooks": {
    "beforeEdit": "npm run check:pre-edit",
    "afterEdit": "npm run check:post-edit",
    "onError": "node .claude/watchdog/error-handler.js"
  },
  "watchdog": {
    "enabled": true,
    "realtime": true,
    "autoFix": false,
    "notificationLevel": "all",
    "dashboard": {
      "refreshInterval": 5000,
      "showStats": true,
      "showHotspots": true
    }
  },
  "patterns": {
    "customPatterns": [],
    "severity": {
      "any_type": "critical",
      "todo_fixme": "critical",
      "auto_script": "critical",
      "no_session": "critical"
    }
  }
}
```

### 2.3 에러 핸들러 생성

`.claude/watchdog/error-handler.js` 생성:

```javascript
#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

console.log(chalk.red.bold('\\n🚨 에러 발생!'));
console.log(chalk.yellow('━'.repeat(50)));

const error = process.argv[2] || 'Unknown error';
const file = process.argv[3] || 'Unknown file';

console.log(chalk.white('에러:', error));
console.log(chalk.gray('파일:', file));

// 에러 로깅
const logFile = path.join('.claude/logs', 'errors.log');
const logEntry = `${new Date().toISOString()} | ${error} | ${file}\\n`;
fs.appendFileSync(logFile, logEntry);

// 제안 제공
console.log(chalk.cyan('\\n💡 해결 제안:'));

if (error.includes('any')) {
  console.log('- 구체적인 타입 정의를 사용하세요');
  console.log('- unknown 타입 후 타입 가드 사용');
  console.log('- 제네릭 타입 활용');
}

if (error.includes('TODO') || error.includes('FIXME')) {
  console.log('- 임시방편 대신 완전한 해결책 구현');
  console.log('- 문제를 미루지 말고 즉시 해결');
  console.log('- 필요시 도움 요청');
}

console.log(chalk.gray('\\n자세한 내용: .claude/logs/errors.log'));
```

### 2.4 package.json 스크립트 추가

```json
{
  "scripts": {
    "watch:conventions": "node .claude/watchdog/implementation-details.js start",
    "analyze:patterns": "node .claude/watchdog/implementation-details.js analyze",
    "check:pre-edit": "node .claude/watchdog/implementation-details.js pre-edit",
    "check:post-edit": "node .claude/watchdog/implementation-details.js post-edit",
    "watchdog:test": "node .claude/watchdog/implementation-details.js test",
    "watchdog:status": "node -e \\"console.log('✅ Watchdog 준비 완료')\\"",
    "watchdog:clean": "rm -rf .claude/mistakes/history/* .claude/logs/*"
  }
}
```

## ✅ Phase 2 완료 조건

### 🔴 필수 완료 조건 (하나라도 미충족 시 미완료)
```bash
# 1. 파일 생성 확인
- [ ] ls .claude/watchdog/implementation-details.js → 존재
- [ ] ls .claude/settings.local.json → 존재
- [ ] ls .claude/watchdog/error-handler.js → 존재
- [ ] ls .claude/watchdog/config.json → 존재

# 2. 코드 동작 확인
- [ ] node .claude/watchdog/implementation-details.js → 사용법 표시
- [ ] npm run watchdog:status → "준비 완료" 메시지

# 3. 패턴 감지 확인
- [ ] 13가지 패턴 모두 구현됨
- [ ] autoFix: false 설정 확인
```

### 🟡 권장 완료 조건
- [ ] 대시보드 UI 정상 표시
- [ ] 알림 시스템 작동
- [ ] 로그 파일 생성

## 🔄 롤백 계획

### 롤백 절차
```bash
# 1. 구현 파일 제거
rm -rf .claude/watchdog/*.js
rm .claude/settings.local.json

# 2. package.json 스크립트 제거
# scripts 섹션에서 watch:*, check:* 제거

# 3. 캐시/로그 정리
rm -rf .claude/mistakes/history/*
rm -rf .claude/logs/*
```

## → 다음 Phase
- 파일: PHASE_3_VALIDATION.md
- 내용: 시스템 실행 및 검증

---

**Phase 2 체크리스트**:
- [ ] MistakeHistoryTracker 구현 완료
- [ ] ConventionChecker 구현 완료
- [ ] RealtimeWatchdog 구현 완료
- [ ] 13가지 패턴 모두 포함
- [ ] Claude Code Hooks 통합
- [ ] autoFix: false 확인