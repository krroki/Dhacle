/sc:implement --seq --validate --think
"Phase 2: Smart Context Detection with Claude Code Auto-Detection"

# Phase 2: Smart Context Detection

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📌 Phase 정보
- Phase 번호: 2/3
- 예상 시간: 1시간
- 우선순위: HIGH
- **핵심**: Claude Code 작업 환경 자동 인식

## 🔥 Claude Code 감지 메커니즘

### 자동 감지 신호
1. **프로세스 감지**
   - `process.title`에 'claude' 포함
   - 환경변수 `CLAUDE_CODE` 존재
   
2. **파일 시스템 감지**
   - `.claude/` 디렉토리 활동
   - `.claude/activity.log` 5분 이내 수정
   
3. **작업 패턴 감지**
   - 빠른 연속 수정 (5초 이내)
   - 여러 파일 동시 수정
   - Edit/MultiEdit 도구 사용

## 🎯 Phase 목표
1. Claude Code 작업 자동 감지
2. 컨텍스트별 규칙 자동 조정
3. 실시간 피드백 제공

## 📝 작업 내용

### 1. Claude Code Detector

파일: `.claude/hooks/claude-detector.js`
```javascript
class ClaudeCodeDetector {
  constructor() {
    this.indicators = [];
    this.confidence = 0;
  }

  detect() {
    this.indicators = [];
    this.confidence = 0;

    // 1. 환경변수 체크 (100% 확신)
    if (process.env.CLAUDE_CODE === 'true') {
      this.indicators.push('ENV_VAR');
      this.confidence = 100;
      return true;
    }

    // 2. 프로세스 체크 (90% 확신)
    if (process.title?.toLowerCase().includes('claude')) {
      this.indicators.push('PROCESS_NAME');
      this.confidence += 90;
    }

    // 3. 활동 로그 체크 (80% 확신)
    const fs = require('fs');
    const logFile = '.claude/activity.log';
    
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      const minutesAgo = (Date.now() - stats.mtime) / 1000 / 60;
      
      if (minutesAgo < 5) {
        this.indicators.push('RECENT_ACTIVITY');
        this.confidence += 80;
      }
    }

    // 4. 수정 패턴 체크 (70% 확신)
    if (this.detectEditPattern()) {
      this.indicators.push('EDIT_PATTERN');
      this.confidence += 70;
    }

    // 5. 파일 잠금 체크 (60% 확신)
    if (fs.existsSync('.claude/hooks/.lock')) {
      this.indicators.push('FILE_LOCK');
      this.confidence += 60;
    }

    // 신뢰도 70% 이상이면 Claude Code로 판단
    return this.confidence >= 70;
  }

  detectEditPattern() {
    // 최근 수정 패턴 분석
    const fs = require('fs');
    const editLog = '.claude/hooks/.edits';
    
    if (!fs.existsSync(editLog)) {
      fs.writeFileSync(editLog, '');
      return false;
    }

    const edits = fs.readFileSync(editLog, 'utf8').split('\n').filter(Boolean);
    const now = Date.now();
    
    // 최근 10초 내 수정 기록
    const recentEdits = edits.filter(line => {
      const [timestamp] = line.split(',');
      return (now - parseInt(timestamp)) < 10000;
    });

    // 5초 내 3개 이상 파일 수정 = Claude Code 패턴
    return recentEdits.length >= 3;
  }

  logEdit(filePath) {
    const fs = require('fs');
    const editLog = '.claude/hooks/.edits';
    const entry = `${Date.now()},${filePath}\n`;
    
    fs.appendFileSync(editLog, entry);
    
    // 로그 관리 (최근 50개만 유지)
    const edits = fs.readFileSync(editLog, 'utf8').split('\n');
    if (edits.length > 50) {
      fs.writeFileSync(editLog, edits.slice(-50).join('\n'));
    }
  }

  getStatus() {
    return {
      isClaudeCode: this.detect(),
      confidence: this.confidence,
      indicators: this.indicators,
      recommendation: this.confidence >= 70 ? 'Warning Mode' : 'Normal Mode'
    };
  }
}

module.exports = ClaudeCodeDetector;
```

### 2. Smart Context Rules

파일: `.claude/hooks/smart-context.js`
```javascript
const ClaudeCodeDetector = require('./claude-detector');

class SmartContextRules {
  constructor() {
    this.detector = new ClaudeCodeDetector();
    this.rules = this.loadRules();
  }

  loadRules() {
    return {
      // Claude Code 작업 중
      'claude-mode': {
        'no-any-type': { severity: 'info' },
        'no-todo-comments': { 
          severity: 'warning',
          maxAge: '2days',
          autoAddDate: true
        },
        'no-empty-catch': { 
          severity: 'info',
          autoFix: true
        },
        'no-direct-fetch': { severity: 'warning' },
        'no-deprecated-supabase': { severity: 'error' },
        'no-wrong-type-imports': { severity: 'error' }
      },

      // 일반 개발
      'normal-mode': {
        'no-any-type': { severity: 'warning' },
        'no-todo-comments': { 
          severity: 'warning',
          maxAge: '2days'
        },
        'no-empty-catch': { severity: 'warning' },
        'no-direct-fetch': { severity: 'warning' },
        'no-deprecated-supabase': { severity: 'error' },
        'no-wrong-type-imports': { severity: 'error' }
      },

      // 경로별 특별 규칙
      'path-specific': {
        'src/lib/external/**': {
          'no-any-type': { severity: 'info' },
          'no-direct-fetch': { enabled: false }
        },
        '**/*.test.ts': {
          'no-any-type': { severity: 'info' },
          'no-empty-catch': { severity: 'info' }
        },
        'src/app/api/**': {
          'no-empty-catch': { severity: 'error' },
          'no-direct-fetch': { severity: 'error' }
        }
      }
    };
  }

  getActiveRules(filePath) {
    const status = this.detector.getStatus();
    
    // Claude Code 감지됨
    if (status.isClaudeCode) {
      console.log(`🤖 Claude Mode Active (${status.confidence}% confidence)`);
      console.log(`   Indicators: ${status.indicators.join(', ')}`);
      return this.rules['claude-mode'];
    }

    // 경로별 규칙 체크
    for (const [pattern, rules] of Object.entries(this.rules['path-specific'])) {
      if (this.matchPattern(filePath, pattern)) {
        return { ...this.rules['normal-mode'], ...rules };
      }
    }

    // 기본 규칙
    return this.rules['normal-mode'];
  }

  matchPattern(filePath, pattern) {
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    
    return new RegExp(`^${regex}$`).test(filePath);
  }

  // 실시간 피드백
  provideFeedback(violation, filePath) {
    const status = this.detector.getStatus();
    
    if (status.isClaudeCode) {
      // Claude Code용 친절한 메시지
      switch(violation.rule) {
        case 'no-todo-comments':
          return `💡 TODO 발견 - 2일 내 해결하세요 (자동 날짜 추가됨)`;
        case 'no-any-type':
          return `📝 any 타입 - 나중에 타입 정의 추가하세요`;
        case 'no-direct-fetch':
          return `🔄 fetch() 사용 - apiClient로 변경 권장`;
        default:
          return violation.message;
      }
    }

    // 일반 메시지
    return violation.message;
  }
}

module.exports = SmartContextRules;
```

## ✅ 완료 조건

### 🔴 필수 완료 조건
```bash
# Claude Code 자동 감지
- [ ] 환경변수 감지 작동
- [ ] 활동 로그 감지 작동
- [ ] 수정 패턴 감지 작동
- [ ] 신뢰도 계산 정확

# 실시간 적용
- [ ] Claude Code 작업 시 자동으로 Warning
- [ ] 일반 작업 시 정상 규칙
- [ ] 경로별 규칙 적용
```

## → 다음 Phase
- 파일: PHASE_3_CLAUDE_COLLABORATION.md