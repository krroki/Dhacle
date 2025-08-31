/**
 * 보안 검증 모듈
 * 비밀키 스캔, RLS 정책, 세션 보안, XSS 방지 등 검증
 */

const { FileScanner, IssueTracker, Reporter, logger, helpers } = require('../utils');
const config = require('../config');
const fs = require('fs');
const path = require('path');

class SecurityVerifier {
  constructor(options = {}) {
    this.options = {
      ...config.modules.security,
      ...options
    };
    
    this.tracker = new IssueTracker();
    this.scanner = new FileScanner(config.patterns.all, {
      ignore: [...config.ignore, '**/.env*', '**/secrets/**']
    });
    
    // 보안 검증 규칙
    this.checks = {
      secretScanning: this.checkHardcodedSecrets.bind(this),
      sessionSecurity: this.checkSessionSecurity.bind(this),
      xssProtection: this.checkXSSProtection.bind(this),
      sqlInjection: this.checkSQLInjection.bind(this),
      rlsPolicies: this.checkRLSPolicies.bind(this),
      consoleLogging: this.checkConsoleLogging.bind(this),
      errorExposure: this.checkErrorExposure.bind(this)
    };

    // 비밀키 패턴
    this.secretPatterns = [
      // API 키
      { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["']([a-zA-Z0-9_\-]{20,})["']/gi, type: 'API Key' },
      { pattern: /sk-[a-zA-Z0-9]{48,}/g, type: 'OpenAI API Key' },
      { pattern: /eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g, type: 'JWT Token' },
      
      // 데이터베이스
      { pattern: /(?:password|passwd|pwd)\s*[:=]\s*["']([^"']{8,})["']/gi, type: 'Password' },
      { pattern: /postgres:\/\/[^@]+@[^/]+/g, type: 'Database URL' },
      { pattern: /mongodb(\+srv)?:\/\/[^@]+@[^/]+/g, type: 'MongoDB URL' },
      
      // AWS
      { pattern: /AKIA[0-9A-Z]{16}/g, type: 'AWS Access Key' },
      { pattern: /aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*["'][a-zA-Z0-9/+=]{40}["']/gi, type: 'AWS Secret' },
      
      // Supabase
      { pattern: /supabase[_-]?(?:service[_-]?role[_-]?)?key\s*[:=]\s*["']([^"']{40,})["']/gi, type: 'Supabase Key' },
      { pattern: /anon[_-]?key\s*[:=]\s*["']eyJ[^"']+["']/gi, type: 'Supabase Anon Key' },
      
      // 기타
      { pattern: /(?:secret|private[_-]?key)\s*[:=]\s*["']([^"']{10,})["']/gi, type: 'Secret' },
      { pattern: /bearer\s+[a-zA-Z0-9_\-\.]+/gi, type: 'Bearer Token' }
    ];

    // 허용된 예외 (테스트, 예제 등)
    this.allowedExceptions = [
      'NEXT_PUBLIC_',
      'process.env.',
      'import.meta.env.',
      'example',
      'sample',
      'test',
      'mock',
      'dummy'
    ];
  }

  async verify(options = {}) {
    const startTime = Date.now();
    this.tracker.clear();
    
    try {
      // 파일 스캔
      const files = this.scanner.scanWithContent();
      
      if (options.verbose) {
        logger.info(`📁 검사할 파일: ${files.length}개`);
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
      logger.error(`보안 검증 실패: ${error.message}`);
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

    // 테스트 파일은 일부 검사 제외
    const isTestFile = relativePath.includes('.test.') || relativePath.includes('.spec.');
    
    // 각 검증 규칙 실행
    for (const [checkName, checkFunction] of Object.entries(this.checks)) {
      if (this.options.rules[checkName] !== false) {
        // 테스트 파일은 console.log 검사 제외
        if (isTestFile && checkName === 'consoleLogging') continue;
        
        await checkFunction(file, relativePath, options);
      }
    }
  }

  checkHardcodedSecrets(file, relativePath, options) {
    // .env 파일은 검사 제외
    if (relativePath.includes('.env')) return;

    this.secretPatterns.forEach(({ pattern, type }) => {
      const matches = file.content.matchAll(pattern);
      
      for (const match of matches) {
        const line = file.content.substring(0, match.index).split('\n').length;
        const matchedText = match[0];
        
        // 허용된 예외 확인
        const isAllowed = this.allowedExceptions.some(exception => 
          matchedText.includes(exception)
        );
        
        if (!isAllowed) {
          const context = helpers.getLineContext(file.lines, line);
          
          this.tracker.addError(
            relativePath,
            line,
            `하드코딩된 ${type} 발견`,
            matchedText.substring(0, 50) + '...',
            context,
            '환경변수 사용: process.env.YOUR_KEY'
          );
        }
      }
    });
  }

  checkSessionSecurity(file, relativePath, options) {
    // API 라우트에서 세션 체크
    if (relativePath.includes('/api/')) {
      const hasAuth = /supabase\.auth\.getUser\(\)/.test(file.content);
      const hasUserCheck = /if\s*\(\s*!user\s*\)/.test(file.content);
      
      // 공개 API 제외
      const isPublicAPI = relativePath.includes('/public/') || 
                         relativePath.includes('/health/') ||
                         relativePath.includes('/webhook/');
      
      if (!isPublicAPI && !hasAuth) {
        this.tracker.addWarning(
          relativePath,
          null,
          '세션 체크 누락',
          null,
          null,
          'supabase.auth.getUser() 호출 필요'
        );
      }
      
      if (hasAuth && !hasUserCheck) {
        this.tracker.addWarning(
          relativePath,
          null,
          '세션 검증 후 처리 누락',
          null,
          null,
          'if (!user) 체크 필요'
        );
      }
    }

    // 클라이언트 컴포넌트에서 세션 관리
    if (relativePath.includes('/components/') && file.content.includes('use client')) {
      if (file.content.includes('localStorage') && file.content.includes('token')) {
        this.tracker.addWarning(
          relativePath,
          null,
          'localStorage에 토큰 저장 감지',
          null,
          null,
          'httpOnly 쿠키 사용 권장'
        );
      }
    }
  }

  checkXSSProtection(file, relativePath, options) {
    // React 컴포넌트에서 XSS 취약점 체크
    if (helpers.isReactFile(file.path)) {
      // dangerouslySetInnerHTML 사용 체크
      const dangerousPattern = /dangerouslySetInnerHTML/g;
      const matches = file.content.matchAll(dangerousPattern);
      
      for (const match of matches) {
        const line = file.content.substring(0, match.index).split('\n').length;
        
        this.tracker.addWarning(
          relativePath,
          line,
          'dangerouslySetInnerHTML 사용 (XSS 위험)',
          null,
          null,
          'DOMPurify 등 sanitization 라이브러리 사용'
        );
      }

      // eval 사용 체크
      if (/\beval\s*\(/.test(file.content)) {
        this.tracker.addError(
          relativePath,
          null,
          'eval() 사용 감지 (심각한 보안 위험)',
          null,
          null,
          'eval() 제거 및 안전한 대안 사용'
        );
      }

      // innerHTML 직접 조작
      if (/\.innerHTML\s*=/.test(file.content)) {
        this.tracker.addWarning(
          relativePath,
          null,
          'innerHTML 직접 조작 (XSS 위험)',
          null,
          null,
          'textContent 또는 React 렌더링 사용'
        );
      }
    }

    // API 응답에서 HTML 반환 체크
    if (relativePath.includes('/api/')) {
      if (file.content.includes('text/html') && !file.content.includes('sanitize')) {
        this.tracker.addWarning(
          relativePath,
          null,
          'HTML 응답 시 sanitization 누락',
          null,
          null,
          'HTML sanitization 필수'
        );
      }
    }
  }

  checkSQLInjection(file, relativePath, options) {
    // SQL 쿼리 직접 작성 체크
    const sqlPatterns = [
      /`SELECT .* FROM .* WHERE .*\$\{/,
      /`INSERT INTO .* VALUES .*\$\{/,
      /`UPDATE .* SET .*\$\{/,
      /`DELETE FROM .* WHERE .*\$\{/,
      /query\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`\s*\)/
    ];

    sqlPatterns.forEach(pattern => {
      if (pattern.test(file.content)) {
        this.tracker.addError(
          relativePath,
          null,
          'SQL Injection 취약점 가능성',
          null,
          null,
          'Parameterized queries 또는 Supabase 클라이언트 사용'
        );
      }
    });

    // Supabase 쿼리에서 직접 문자열 조합
    const supabasePattern = /\.from\([^)]+\)\.select\(`[^`]*\$\{/;
    if (supabasePattern.test(file.content)) {
      this.tracker.addWarning(
        relativePath,
        null,
        'Supabase 쿼리에 직접 변수 삽입',
        null,
        null,
        'Supabase 쿼리 빌더 메서드 사용'
      );
    }
  }

  checkRLSPolicies(file, relativePath, options) {
    // SQL 마이그레이션 파일에서 RLS 체크
    if (relativePath.includes('/migrations/') && relativePath.endsWith('.sql')) {
      const hasCreateTable = /CREATE TABLE/i.test(file.content);
      const hasRLSEnable = /ALTER TABLE .* ENABLE ROW LEVEL SECURITY/i.test(file.content);
      const hasPolicy = /CREATE POLICY/i.test(file.content);
      
      if (hasCreateTable && !hasRLSEnable) {
        this.tracker.addWarning(
          relativePath,
          null,
          'RLS 활성화 누락',
          null,
          null,
          'ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;'
        );
      }
      
      if (hasRLSEnable && !hasPolicy) {
        this.tracker.addWarning(
          relativePath,
          null,
          'RLS Policy 정의 누락',
          null,
          null,
          'CREATE POLICY 추가 필요'
        );
      }
    }

    // Service Role 사용 체크
    if (file.content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      if (!relativePath.includes('/api/') || !this.isServiceRoleRequired(relativePath)) {
        this.tracker.addWarning(
          relativePath,
          null,
          'Service Role Key 사용',
          null,
          null,
          'Client Key 사용 검토 필요'
        );
      }
    }
  }

  checkConsoleLogging(file, relativePath, options) {
    // production 코드에서 console.log 체크
    const consolePatterns = [
      /console\.(log|debug|info)\(/g,
      /console\.dir\(/g,
      /console\.trace\(/g
    ];

    consolePatterns.forEach(pattern => {
      const matches = file.content.matchAll(pattern);
      
      for (const match of matches) {
        const line = file.content.substring(0, match.index).split('\n').length;
        
        // 개발 환경 체크 없는 console.log
        const lineContent = file.lines[line - 1];
        if (!lineContent.includes('NODE_ENV') && 
            !lineContent.includes('__DEV__') &&
            !lineContent.includes('// TODO') &&
            !lineContent.includes('// DEBUG')) {
          
          this.tracker.addInfo(
            relativePath,
            line,
            'console.log 사용',
            match[0]
          );
        }
      }
    });
  }

  checkErrorExposure(file, relativePath, options) {
    // API 에러 응답에서 민감한 정보 노출 체크
    if (relativePath.includes('/api/')) {
      // 스택 트레이스 노출
      if (file.content.includes('error.stack') && file.content.includes('NextResponse')) {
        this.tracker.addError(
          relativePath,
          null,
          '에러 스택 트레이스 노출',
          null,
          null,
          'Production에서는 일반적인 에러 메시지만 반환'
        );
      }

      // 데이터베이스 에러 직접 노출
      if (/NextResponse\.json\([^)]*error\.message/g.test(file.content)) {
        this.tracker.addWarning(
          relativePath,
          null,
          '원본 에러 메시지 직접 노출',
          null,
          null,
          '사용자 친화적인 에러 메시지 사용'
        );
      }

      // SQL 에러 노출
      if (file.content.includes('SQLSTATE') || file.content.includes('SQL syntax')) {
        this.tracker.addError(
          relativePath,
          null,
          'SQL 에러 정보 노출',
          null,
          null,
          'SQL 에러는 일반 메시지로 변환'
        );
      }
    }
  }

  isServiceRoleRequired(relativePath) {
    // Service Role이 필요한 특수 경로
    const serviceRoleRoutes = [
      'revenue-proof',
      'admin',
      'system',
      'migration'
    ];
    
    return serviceRoleRoutes.some(route => relativePath.includes(route));
  }
}

module.exports = SecurityVerifier;