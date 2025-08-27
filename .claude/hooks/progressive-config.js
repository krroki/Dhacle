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
    const activityLog = path.join(__dirname, 'activity.log');
    if (fs.existsSync(activityLog)) {
      try {
        const log = fs.readFileSync(activityLog, 'utf8');
        const lines = log.trim().split('\n').filter(l => l);
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1];
          const timestampMatch = lastLine.match(/^(\d{4}-\d{2}-\d{2}T[\d:\.]+Z)/);
          if (timestampMatch) {
            const lastActivity = new Date(timestampMatch[1]);
            const minutesAgo = (Date.now() - lastActivity) / 1000 / 60;
            // 5분 이내 활동이면 Claude Code 작업 중
            if (minutesAgo < 5) return true;
          }
        }
      } catch (e) {
        // 로그 파일 읽기 실패 시 무시
        console.error('Failed to read activity log:', e.message);
      }
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

    return configs[this.projectPhase] || configs['development'];
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
        autoFix: 'console.error(e)',  // 자동 수정
        message: '빈 catch 블록 - error 로깅 추가 필요'
      },
      'no-direct-fetch': { 
        enabled: true, 
        severity: 'warning',
        suggestion: 'apiClient 사용 권장',
        message: 'fetch() 대신 apiClient 사용 필요'
      },
      'no-deprecated-supabase': { 
        enabled: true, 
        severity: 'error',  // 보안은 양보 불가
        message: '보안 취약점 - 즉시 수정 필요'
      },
      'no-wrong-type-imports': { 
        enabled: true, 
        severity: 'error',  // 타입 시스템 보호
        message: '타입 import 경로 수정 필요'
      }
    };
  }

  /**
   * Check age of TODO comments (2 days limit)
   * @param {string} content - File content to check
   * @param {string} filePath - Path to the file being checked
   * @returns {{violations: Array, modifiedContent: string}} Results
   */
  checkTodoAge(content, filePath) {
    const todoPattern = /TODO(?:\[(\d{4}-\d{2}-\d{2})\])?(?:\[([A-Z]+-\d+)\])?:?\s*(.+)/g;
    const violations = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let modifiedContent = content;
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
        const newTodo = `TODO[${todayStr}]: ${message}`;
        
        if (this.isClaudeCode) {
          // Claude Code면 자동 수정
          modifiedContent = modifiedContent.replace(full, newTodo);
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
    
    return { violations, modifiedContent };
  }

  // 현재 설정과 병합
  mergeWithCurrent(currentConfig) {
    const progressive = this.getConfig();
    const merged = JSON.parse(JSON.stringify(currentConfig)); // Deep copy
    
    // Claude Code 작업 중이면 강제로 Warning
    if (this.isClaudeCode) {
      console.error('🤖 Claude Code 감지 - Warning 모드 활성화');
      
      // Progressive config의 설정으로 덮어쓰기
      for (const [key, value] of Object.entries(progressive)) {
        merged.validators[key] = value;
      }
    } else {
      // Development/Production 모드에서도 progressive 설정 적용
      for (const [key, value] of Object.entries(progressive)) {
        if (merged.validators[key]) {
          merged.validators[key] = { ...merged.validators[key], ...value };
        } else {
          merged.validators[key] = value;
        }
      }
    }
    
    // strictMode는 Claude Code일 때 false
    if (this.isClaudeCode) {
      merged.strictMode = false;
      merged.includeWarnings = true; // Warning도 표시
    }
    
    return merged;
  }

  // 활동 로그 (Claude Code 감지용)
  logActivity() {
    const logFile = path.join(__dirname, 'activity.log');
    const timestamp = new Date().toISOString();
    const entry = `${timestamp} Hook validation executed\n`;
    
    try {
      // 로그 파일이 없으면 생성
      if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, '');
      }
      
      fs.appendFileSync(logFile, entry);
      
      // 로그 파일 크기 관리 (최근 100줄만 유지)
      const logs = fs.readFileSync(logFile, 'utf8').split('\n').filter(l => l);
      if (logs.length > 100) {
        fs.writeFileSync(logFile, logs.slice(-100).join('\n') + '\n');
      }
    } catch (error) {
      // 로그 작성 실패해도 계속 진행
      if (process.env.CLAUDE_HOOKS_DEBUG === 'true') {
        console.error('Failed to write activity log:', error.message);
      }
    }
  }
}

module.exports = ProgressiveHookConfig;