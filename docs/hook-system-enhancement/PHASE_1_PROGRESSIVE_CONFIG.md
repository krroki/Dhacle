/sc:implement --seq --validate --think
"Phase 1: Progressive Hook Configuration 구현"

# Phase 1: Progressive Hook Configuration

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 🔥🔥🔥 최우선 프로젝트 특화 규칙

### 📌 필수 확인 문서
- [x] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙
- [x] `/CLAUDE.md` 17-43행 - 자동 스크립트 절대 금지
- [x] `/docs/ERROR_BOUNDARY.md` - 에러 처리 표준

### 🚫 프로젝트 금지사항
- [x] 자동 변환 스크립트 생성 금지
- [x] any 타입 사용 금지 (현재 0개 유지!)
- [x] 임시방편 해결책 금지

## 📌 Phase 정보
- Phase 번호: 1/3
- 예상 시간: 2시간
- 우선순위: CRITICAL
- **핵심**: Claude Code 즉시 작업 가능하게!

## 🔥 실제 코드 확인 결과
```bash
# 2024-08-26 실제 확인
$ ls -la .claude/hooks/
total 92
-rw-r--r-- config.json  # 현재 모두 Error!
-rwxr-xr-x main-validator.js
-rwxr-xr-x emergency-disable.js
drwxr-xr-x validators/

$ cat .claude/hooks/config.json
# no-any-type: error ← Claude Code 차단!
# no-todo-comments: error ← 58개 때문에 작업 불가!
# no-direct-fetch: error ← 9개 수정 필요

# Claude Code 차단 현황
TODO 58개 → 매 수정마다 차단
fetch() 9개 → API 작업 차단
```

## 🎯 Phase 목표
1. **즉시 Warning으로 전환** (Claude Code 작업 가능)
2. **TODO 2일 제한** (30일 아님!)
3. **자동 감지 구현** (Claude Code 파일 수정 시)

## 📝 작업 내용

### 1. Progressive Configuration (2일 TODO 제한!)

파일: `.claude/hooks/progressive-config.js`
```javascript
const fs = require('fs');
const path = require('path');

class ProgressiveHookConfig {
  constructor() {
    // Claude Code는 환경변수 설정 가능
    this.projectPhase = process.env.PROJECT_PHASE || 'development';
    
    // Claude Code 작업 중인지 감지
    this.isClaudeCode = process.env.CLAUDE_CODE || 
                        process.argv.includes('--claude') ||
                        this.detectClaudeCode();
  }

  detectClaudeCode() {
    // Claude Code 자동 감지 로직
    // 1. 프로세스 이름 체크
    if (process.title?.includes('claude')) return true;
    
    // 2. 작업 디렉토리 체크
    if (process.cwd().includes('.claude')) return true;
    
    // 3. 특정 파일 존재 체크
    if (fs.existsSync('.claude/activity.log')) {
      const log = fs.readFileSync('.claude/activity.log', 'utf8');
      const lastActivity = new Date(log.split('\n').pop()?.split(' ')[0]);
      const minutesAgo = (Date.now() - lastActivity) / 1000 / 60;
      // 5분 이내 활동이면 Claude Code 작업 중
      if (minutesAgo < 5) return true;
    }
    
    return false;
  }

  getConfig() {
    // Claude Code 작업 중이면 무조건 Warning!
    if (this.isClaudeCode) {
      return this.getClaudeCodeConfig();
    }

    const configs = {
      // 개발 단계 (기본값) - Warning 위주!
      'development': {
        'no-any-type': { 
          enabled: true, 
          severity: 'warning',  // Error 아님!
        },
        'no-todo-comments': {
          enabled: true,
          severity: 'warning',  // Error 아님!
          maxAge: '2days',      // 30일 아니고 2일!
          allowWithTicket: true
        },
        'no-empty-catch': { 
          enabled: true, 
          severity: 'warning'   // Error 아님!
        },
        'no-direct-fetch': { 
          enabled: true, 
          severity: 'warning'   // Error 아님!
        },
        // 보안 관련만 Error
        'no-deprecated-supabase': { 
          enabled: true, 
          severity: 'error'     // 이것만 Error
        },
        'no-wrong-type-imports': { 
          enabled: true, 
          severity: 'error'     // 이것만 Error
        }
      },

      // Production (나중에)
      'production': {
        'no-any-type': { enabled: true, severity: 'error' },
        'no-todo-comments': { enabled: true, severity: 'error', maxAge: '2days' },
        'no-empty-catch': { enabled: true, severity: 'error' },
        'no-direct-fetch': { enabled: true, severity: 'error' },
        'no-deprecated-supabase': { enabled: true, severity: 'error' },
        'no-wrong-type-imports': { enabled: true, severity: 'error' }
      },

      // 긴급 모드
      'hotfix': {
        'no-any-type': { enabled: false },  // 완전 비활성화
        'no-todo-comments': { enabled: false },
        'no-empty-catch': { enabled: false },
        'no-direct-fetch': { enabled: false },
        'no-deprecated-supabase': { enabled: true, severity: 'warning' },
        'no-wrong-type-imports': { enabled: true, severity: 'warning' }
      }
    };

    return configs[this.projectPhase];
  }

  getClaudeCodeConfig() {
    // Claude Code 작업 시 특별 설정
    return {
      'no-any-type': { 
        enabled: true, 
        severity: 'info',  // 정보만 표시
        message: 'any 타입 발견 - 나중에 수정 필요'
      },
      'no-todo-comments': {
        enabled: true,
        severity: 'warning',
        maxAge: '2days',  // 2일!
        autoAddDate: true,  // 자동으로 날짜 추가
        message: 'TODO는 2일 내 해결 필수'
      },
      'no-empty-catch': { 
        enabled: true, 
        severity: 'info',
        autoFix: 'console.error(e)'  // 자동 수정
      },
      'no-direct-fetch': { 
        enabled: true, 
        severity: 'warning',
        suggestion: 'apiClient 사용 권장'
      },
      'no-deprecated-supabase': { 
        enabled: true, 
        severity: 'error'  // 보안은 양보 불가
      },
      'no-wrong-type-imports': { 
        enabled: true, 
        severity: 'error'  // 타입 시스템 보호
      }
    };
  }

  // TODO Aging 체크 (2일!)
  checkTodoAge(content, filePath) {
    const todoPattern = /TODO(?:\[(\d{4}-\d{2}-\d{2})\])?(?:\[([A-Z]+-\d+)\])?:?\s*(.+)/g;
    const violations = [];
    const today = new Date();
    
    let match;
    while (match = todoPattern.exec(content)) {
      const [full, date, ticket, message] = match;
      const line = content.substring(0, match.index).split('\n').length;
      
      // 티켓 번호 있으면 OK
      if (ticket) continue;
      
      if (date) {
        const todoDate = new Date(date);
        const daysOld = Math.floor((today - todoDate) / (1000 * 60 * 60 * 24));
        
        if (daysOld > 2) {  // 2일!
          violations.push({
            severity: 'error',
            message: `TODO가 2일 지났습니다! (${daysOld}일): ${message}`,
            line,
            autoFix: `TODO[OVERDUE-${daysOld}d]: ${message}`
          });
        } else if (daysOld === 2) {
          violations.push({
            severity: 'warning',
            message: `TODO 오늘까지입니다!: ${message}`,
            line
          });
        }
      } else {
        // 날짜 없으면 자동 추가
        const newTodo = `TODO[${today.toISOString().split('T')[0]}]: ${message}`;
        
        if (this.isClaudeCode) {
          // Claude Code면 자동 수정
          return {
            autoFix: newTodo,
            message: '날짜 자동 추가됨'
          };
        } else {
          violations.push({
            severity: 'warning',
            message: `날짜 추가 필요: ${message}`,
            suggestion: newTodo,
            line
          });
        }
      }
    }
    
    return violations;
  }

  // 현재 설정과 병합
  mergeWithCurrent(currentConfig) {
    const progressive = this.getConfig();
    
    // Claude Code 작업 중이면 강제로 Warning
    if (this.isClaudeCode) {
      console.log('🤖 Claude Code 감지 - Warning 모드 활성화');
      
      // 모든 Error를 Warning으로 변경 (보안 제외)
      for (const [key, value] of Object.entries(currentConfig.validators)) {
        if (!key.includes('supabase') && !key.includes('type-imports')) {
          if (value.severity === 'error') {
            value.severity = 'warning';
          }
        }
      }
    }
    
    return { ...currentConfig, validators: { ...currentConfig.validators, ...progressive } };
  }

  // 활동 로그 (Claude Code 감지용)
  logActivity() {
    const logFile = '.claude/activity.log';
    const timestamp = new Date().toISOString();
    const entry = `${timestamp} Hook validation executed\n`;
    
    fs.appendFileSync(logFile, entry);
    
    // 로그 파일 크기 관리 (최근 100줄만 유지)
    const logs = fs.readFileSync(logFile, 'utf8').split('\n');
    if (logs.length > 100) {
      fs.writeFileSync(logFile, logs.slice(-100).join('\n'));
    }
  }
}

module.exports = ProgressiveHookConfig;
```

### 2. main-validator.js 수정

파일: `.claude/hooks/main-validator.js`
수정 내용:
```javascript
// 상단에 추가
const ProgressiveHookConfig = require('./progressive-config');

// validateContent 함수 수정
async function validateContent(content, metadata) {
  try {
    const progressive = new ProgressiveHookConfig();
    
    // Claude Code 활동 로그
    progressive.logActivity();
    
    // 현재 설정과 병합 (Claude Code면 자동으로 Warning)
    const config = progressive.mergeWithCurrent(loadConfig());
    
    // Claude Code 작업 중이면 알림
    if (progressive.isClaudeCode) {
      console.log('🤖 Claude Code Mode: Warnings only (except security)');
    }
    
    const violations = [];
    
    // TODO Aging 체크 (2일!)
    if (config.validators['no-todo-comments']?.enabled) {
      const todoResults = progressive.checkTodoAge(content, metadata.filePath);
      
      // 자동 수정이 있으면 적용
      if (todoResults.autoFix && progressive.isClaudeCode) {
        content = content.replace(/TODO(?:\[[^\]]*\])?:?\s*(.+)/g, todoResults.autoFix);
        console.log('✅ TODO 날짜 자동 추가됨');
      } else if (Array.isArray(todoResults)) {
        violations.push(...todoResults);
      }
    }
    
    // 기존 검증 로직...
    
    return { violations, modifiedContent: content };
  } catch (error) {
    console.error('Hook validation error:', error);
    // 에러 시 Claude Code 작업 차단 방지
    if (process.env.CLAUDE_CODE) {
      console.log('⚠️ Hook 에러 - Claude Code 작업 계속 허용');
      return { violations: [], modifiedContent: content };
    }
    throw error;
  }
}
```

### 3. 즉시 적용 스크립트

파일: `.claude/hooks/apply-now.sh`
```bash
#!/bin/bash

echo "🚀 Hook System Progressive Enhancement 적용 시작"

# 1. 현재 설정 백업
cp config.json config.json.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ 기존 설정 백업 완료"

# 2. Development 모드로 전환
export PROJECT_PHASE=development
echo "✅ Development 모드 설정"

# 3. Claude Code 감지 활성화
export CLAUDE_CODE=true
echo "✅ Claude Code 모드 활성화"

# 4. config.json을 Warning으로 수정
node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// 보안 관련 제외하고 모두 Warning
for (const [key, value] of Object.entries(config.validators)) {
  if (!key.includes('supabase') && !key.includes('type-imports')) {
    if (value.severity === 'error') {
      value.severity = 'warning';
      console.log('  ✓ ' + key + ': error → warning');
    }
  }
}

fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
console.log('✅ config.json 업데이트 완료');
"

# 5. 활동 로그 파일 생성
touch .claude/activity.log
echo "✅ 활동 로그 파일 생성"

echo ""
echo "🎉 적용 완료!"
echo ""
echo "📊 현재 상태:"
echo "  - 모든 Hook이 Warning으로 변경 (보안 제외)"
echo "  - TODO 제한: 2일"
echo "  - Claude Code 자동 감지 활성화"
echo ""
echo "🤖 Claude Code 이제 작업 가능합니다!"
```

## ✅ 완료 조건

### 🔴 필수 완료 조건
```bash
# 1. Claude Code 즉시 작업 가능
- [ ] 58개 TODO가 있어도 수정 가능 (Warning)
- [ ] 9개 fetch()가 있어도 작업 가능 (Warning)
- [ ] 자동 감지 작동 확인

# 2. TODO 2일 제한
- [ ] 2일 지난 TODO → Error
- [ ] 날짜 없는 TODO → 자동 날짜 추가

# 3. 실제 테스트
- [ ] npm run dev → Claude Code 작업
- [ ] 파일 수정 → Warning만 표시
- [ ] 작업 차단 없음 확인
```

## 📋 QA 테스트 시나리오

### ✅ 시나리오 1: Claude Code 작업 플로우
```bash
# 1. Claude Code 작업 시작
export CLAUDE_CODE=true

# 2. 파일 수정 시도
# - TODO 있는 파일 → Warning만, 수정 가능
# - fetch() 있는 파일 → Warning만, 수정 가능

# 3. 자동 감지 확인
cat .claude/activity.log
# 최근 활동 로그 확인
```

### ✅ 시나리오 2: TODO Aging (2일!)
```bash
# TODO 테스트
TODO[2024-08-24]: 오래된 TODO  # Error! (2일 지남)
TODO[2024-08-25]: 경고 TODO     # Warning (오늘까지)
TODO[2024-08-26]: 새 TODO       # OK
TODO: 날짜 없음                 # 자동으로 [2024-08-26] 추가
```

## 🔄 롤백 계획
```bash
# 실패 시
cp config.json.backup.* config.json
unset PROJECT_PHASE
unset CLAUDE_CODE
```

## → 다음 Phase
- 파일: PHASE_2_SMART_DETECTION.md