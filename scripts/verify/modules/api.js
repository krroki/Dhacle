/**
 * API 검증 모듈 v2.0 - 스마트 분류 시스템
 * 위험 기반 4단계 분류 (Critical/High/Medium/Low)
 * 컨텍스트 인식 및 헬퍼 패턴 지원
 */

const { FileScanner, IssueTracker, Reporter, logger, helpers } = require('../utils');
const config = require('../config');
const fs = require('fs');
const path = require('path');

/**
 * 스마트 컨텍스트 분석 및 위험도 분류 시스템
 */
class SmartClassifier {
  constructor() {
    // 인증 패턴 (헬퍼 함수 포함)
    this.authPatterns = {
      strict: /const\s*{\s*data:\s*{\s*user\s*}\s*}\s*=\s*await\s+supabase\.auth\.getUser\(\)/,
      helper: /const\s+user\s*=\s*await\s+requireAuth\s*\(/,
      alternative: /await\s+getUser\s*\(/,
      middleware: /middleware.*auth/i
    };
    
    // 파일 분류
    this.fileTypes = {
      test: [/\.test\./i, /\.spec\./i, /__tests__/, /test-/],
      mock: [/mock/i, /__mocks__/],
      config: [/config/i, /\.config\./],
      legacy: [/legacy/i, /deprecated/i],
      debug: [/debug/i, /dev/i]
    };
    
    // 개선 마커
    this.improvementMarkers = [
      '// TODO: 타입 개선',
      '// FIXME: any 타입 제거 예정',
      '// Phase',
      '// 점진적 개선',
      '// 개선 예정'
    ];
  }
  
  analyzeContext(file) {
    const filePath = file.path.toLowerCase();
    const content = file.content;
    
    return {
      // 파일 타입 분석
      isTestFile: this.fileTypes.test.some(pattern => pattern.test(filePath)),
      isMockFile: this.fileTypes.mock.some(pattern => pattern.test(filePath)),
      isConfigFile: this.fileTypes.config.some(pattern => pattern.test(filePath)),
      isLegacyFile: this.fileTypes.legacy.some(pattern => pattern.test(filePath)),
      isDebugFile: this.fileTypes.debug.some(pattern => pattern.test(filePath)),
      
      // 개선 상태 분석
      hasImprovementPlan: this.improvementMarkers.some(marker => content.includes(marker)),
      hasProperErrorHandling: /try\s*{[\s\S]*catch/i.test(content),
      usesHelperFunctions: this.authPatterns.helper.test(content),
      
      // 보안 평가
      hasHardcodedSecrets: this.hasHardcodedSecrets(content),
      hasAuthImplementation: this.hasAuthImplementation(content),
      
      // 비즈니스 영향도
      businessCritical: this.isBusinessCritical(filePath)
    };
  }
  
  hasAuthImplementation(content) {
    return Object.values(this.authPatterns).some(pattern => 
      typeof pattern === 'object' && pattern.test && pattern.test(content)
    );
  }
  
  getAuthPatternQuality(content) {
    if (this.authPatterns.helper.test(content)) {
      return { pattern: 'helper', quality: 'excellent', message: 'requireAuth 헬퍼 사용 (권장 패턴)' };
    }
    if (this.authPatterns.strict.test(content)) {
      return { pattern: 'strict', quality: 'good', message: '표준 Supabase 패턴' };
    }
    if (this.authPatterns.alternative.test(content)) {
      return { pattern: 'alternative', quality: 'acceptable', message: '대안 패턴 사용' };
    }
    return { pattern: 'none', quality: 'missing', message: '인증 패턴 없음' };
  }
  
  hasHardcodedSecrets(content) {
    const secretPatterns = [
      /['"]sk_[a-zA-Z0-9]+['"]/,  // API keys
      /['"][A-Za-z0-9]{32,}['"]/,  // Long tokens
      /password\s*[:=]\s*['"][^'"]+['"]/i,  // Passwords
    ];
    return secretPatterns.some(pattern => pattern.test(content));
  }
  
  isBusinessCritical(filePath) {
    const criticalPaths = ['payment', 'auth', 'user', 'admin', 'account'];
    return criticalPaths.some(path => filePath.includes(path));
  }
  
  classifyIssue(issue, context, severity = 'medium') {
    // Critical: 실제 보안/런타임 위험
    if (issue.type === 'hardcoded_secrets' || issue.type === 'sql_injection') {
      return { level: 'critical', action: 'immediate_fix', count: true };
    }
    
    if (issue.type === 'missing_auth' && context.businessCritical && !context.isTestFile) {
      return { level: 'critical', action: 'immediate_fix', count: true };
    }
    
    // High: 버그 가능성 높음
    if (issue.type === 'inconsistent_error' && !context.isTestFile) {
      return { level: 'high', action: 'prioritize', count: true };
    }
    
    if (issue.type === 'missing_auth' && !context.isTestFile && !context.hasImprovementPlan) {
      return { level: 'high', action: 'prioritize', count: true };
    }
    
    // Medium: 품질 개선 (컨텍스트 고려)
    if (issue.type === 'pattern_mismatch') {
      if (context.usesHelperFunctions) {
        return { level: 'low', action: 'informational', count: false, 
                message: '헬퍼 패턴 사용 중 (권장 방식)' };
      }
      if (context.hasImprovementPlan) {
        return { level: 'low', action: 'track_progress', count: false };
      }
      return { level: 'medium', action: 'improve_when_possible', count: true };
    }
    
    // Low: 정보 및 스타일
    if (issue.type === 'special_purpose' || issue.type === 'service_role') {
      return { level: 'low', action: 'informational', count: false };
    }
    
    // 기본값
    return { level: severity, action: 'review', count: true };
  }
}

class ApiVerifier {
  constructor(options = {}) {
    this.options = {
      ...config.modules.api,
      ...options
    };
    
    this.tracker = new IssueTracker();
    this.scanner = new FileScanner(config.patterns.api, {
      ignore: config.ignore
    });
    
    // 스마트 분류 시스템
    this.classifier = new SmartClassifier();
    
    // API 검증 규칙 (개선된 버전)
    this.checks = {
      authenticationPattern: this.checkSmartAuthPattern.bind(this),
      errorHandling: this.checkErrorHandling.bind(this),
      supabasePattern: this.checkSupabasePattern.bind(this),
      securityIssues: this.checkSecurityIssues.bind(this),
      responseFormat: this.checkResponseFormat.bind(this)
    };

    // 파일 분류 시스템 (개선됨)
    this.fileClassification = {
      // 완전 제외 (카운트 안 함)
      excluded: [
        '**/node_modules/**',
        '**/*.d.ts', 
        '**/generated/**'
      ],
      
      // 정보용 (경고 카운트 제외)
      informational: [
        'webhook/route.ts',
        'debug/*/route.ts',
        'test-login/route.ts',
        'auth/callback/route.ts'
      ],
      
      // 완화된 기준 적용
      relaxed: [
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/mocks/**',
        '**/legacy/**'
      ],
      
      // Service Role (정보용으로 변경)
      serviceRole: [
        'revenue-proof/[id]/route.ts',
        'revenue-proof/ranking/route.ts'
      ]
    };
  }

  async verify(options = {}) {
    const startTime = Date.now();
    this.tracker.clear();
    
    try {
      // 파일 스캔
      const files = this.scanner.scanWithContent();
      
      if (options.verbose) {
        logger.info(`📁 검사할 API Route 파일: ${files.length}개`);
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
      logger.error(`API 검증 실패: ${error.message}`);
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
    
    if (fileCategory === 'informational') {
      this.addSmartIssue({
        type: 'special_purpose',
        message: '특수 목적 파일',
        context,
        file: relativePath
      });
      return;
    }
    
    if (fileCategory === 'service_role') {
      this.addSmartIssue({
        type: 'service_role', 
        message: 'Service Role 사용 (관리용)',
        context,
        file: relativePath
      });
      return;
    }
    
    // 각 검증 규칙 실행 (컨텍스트 전달)
    for (const [checkName, checkFunction] of Object.entries(this.checks)) {
      if (this.options.rules[checkName] !== false) {
        await checkFunction(file, relativePath, context, options);
      }
    }
  }

  categorizeFile(relativePath) {
    const normalizedPath = relativePath.replace(/\\/g, '/');
    
    // 완전 제외
    if (this.fileClassification.excluded.some(pattern => 
      this.matchPattern(normalizedPath, pattern))) {
      return 'excluded';
    }
    
    // 정보용
    if (this.fileClassification.informational.some(pattern => 
      this.matchPattern(normalizedPath, pattern))) {
      return 'informational';
    }
    
    // Service Role
    if (this.fileClassification.serviceRole.some(pattern => 
      normalizedPath.includes(pattern))) {
      return 'service_role';
    }
    
    // 완화된 기준
    if (this.fileClassification.relaxed.some(pattern => 
      this.matchPattern(normalizedPath, pattern))) {
      return 'relaxed';
    }
    
    return 'standard';
  }
  
  matchPattern(path, pattern) {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(path);
    }
    return path.includes(pattern);
  }
  
  addSmartIssue(issue) {
    const classification = this.classifier.classifyIssue(issue, issue.context);
    
    if (!classification.count) {
      // 정보용 - 카운트하지 않음
      this.tracker.addInfo(
        issue.file,
        null,
        `[${classification.level.toUpperCase()}] ${issue.message}`,
        null,
        null,
        classification.message || ''
      );
      return;
    }
    
    // 위험도에 따른 분류
    switch (classification.level) {
      case 'critical':
        this.tracker.addError(
          issue.file,
          null,
          `[CRITICAL] ${issue.message}`,
          null,
          null,
          `즉시 수정 필요: ${classification.message || ''}`
        );
        break;
        
      case 'high':
        this.tracker.addError(
          issue.file,
          null,
          `[HIGH] ${issue.message}`,
          null,
          null,
          `우선 수정 권장: ${classification.message || ''}`
        );
        break;
        
      case 'medium':
        this.tracker.addWarning(
          issue.file,
          null,
          `[MEDIUM] ${issue.message}`,
          null,
          null,
          `시간 있을 때 개선: ${classification.message || ''}`
        );
        break;
        
      case 'low':
      default:
        this.tracker.addInfo(
          issue.file,
          null,
          `[LOW] ${issue.message}`,
          null,
          null,
          `참고사항: ${classification.message || ''}`
        );
        break;
    }
  }

  checkSupabasePattern(file, relativePath, options) {
    const correctImport = 'createSupabaseRouteHandlerClient';
    const correctPath = '@/lib/supabase/server-client';
    
    // Supabase를 사용하지 않는 파일들은 검사하지 않음
    const nonSupabaseFiles = [
      'youtube/validate-key/route.ts',
      'youtube/webhook/route.ts',
      'payment/fail/route.ts',
      'debug/env-check/route.ts'
    ];
    
    if (nonSupabaseFiles.some(pattern => relativePath.includes(pattern))) {
      return;
    }
    
    // Supabase 사용 여부 확인 (실제로 .from() 이나 .auth. 같은 패턴이 있는지)
    const usesSupabase = /supabase\s*\./.test(file.content) || 
                         /\.from\s*\(/.test(file.content) ||
                         /\.auth\./.test(file.content);
    
    if (!usesSupabase) {
      return; // Supabase를 사용하지 않으면 검사하지 않음
    }
    
    // Import 패턴 확인
    if (!file.content.includes(correctImport)) {
      this.tracker.addError(
        relativePath,
        null,
        'Supabase 클라이언트 import 누락 또는 잘못됨',
        null,
        null,
        `import { ${correctImport} } from '${correctPath}'`
      );
      return;
    }

    // 올바른 import 경로 확인
    const importPattern = new RegExp(`from\\s+['"]([^'"]+)['"]`, 'g');
    let hasCorrectImport = false;
    
    let match;
    while ((match = importPattern.exec(file.content)) !== null) {
      if (match[0].includes(correctImport)) {
        if (match[1] !== correctPath) {
          const line = file.content.substring(0, match.index).split('\n').length;
          this.tracker.addError(
            relativePath,
            line,
            'Supabase import 경로 불일치',
            match[0],
            null,
            `'${correctPath}' 사용`
          );
        } else {
          hasCorrectImport = true;
        }
      }
    }

    // 클라이언트 생성 패턴 확인
    const clientPattern = /const\s+supabase\s*=\s*await\s+createSupabaseRouteHandlerClient\(\)/;
    if (!clientPattern.test(file.content)) {
      this.tracker.addError(
        relativePath,
        null,
        'Supabase 클라이언트 생성 패턴 불일치',
        null,
        null,
        'const supabase = await createSupabaseRouteHandlerClient()'
      );
    }
  }

  checkAuthPattern(file, relativePath, options) {
    // 인증이 필요한 라우트 패턴
    const needsAuth = [
      '/user/',
      '/admin/',
      '/dashboard/',
      '/settings/',
      '/api-keys/'
    ];

    const shouldHaveAuth = needsAuth.some(pattern => 
      relativePath.includes(pattern)
    );

    if (shouldHaveAuth || !relativePath.includes('/public/')) {
      const authPattern = /supabase\.auth\.getUser\(\)/;
      
      if (!authPattern.test(file.content)) {
        this.tracker.addWarning(
          relativePath,
          null,
          '인증 체크 누락 가능성',
          null,
          null,
          'const { data: { user } } = await supabase.auth.getUser()'
        );
      }
    }
  }

  checkSessionValidation(file, relativePath, options) {
    // 세션 체크 패턴
    const sessionPattern = /const\s+{\s*data:\s*{\s*user\s*}\s*}\s*=\s*await\s+supabase\.auth\.getUser\(\)/;
    const userCheckPattern = /if\s*\(\s*!user\s*\)/;
    
    if (sessionPattern.test(file.content)) {
      // 세션 체크 후 401 응답 확인
      if (!userCheckPattern.test(file.content)) {
        this.tracker.addWarning(
          relativePath,
          null,
          '사용자 인증 확인 로직 누락',
          null,
          null,
          'if (!user) { return NextResponse.json({ error: "User not authenticated" }, { status: 401 }) }'
        );
      }
    }
  }

  checkErrorHandling(file, relativePath, options) {
    // 에러 응답 형식 확인
    const errorPatterns = [
      { pattern: /status:\s*401/g, format: "{ error: 'User not authenticated' }" },
      { pattern: /status:\s*403/g, format: "{ error: 'Unauthorized' }" },
      { pattern: /status:\s*404/g, format: "{ error: 'Not found' }" },
      { pattern: /status:\s*400/g, format: "{ error: 'Bad request' }" },
      { pattern: /status:\s*500/g, format: "{ error: 'Internal server error' }" }
    ];

    errorPatterns.forEach(({ pattern, format }) => {
      const matches = file.content.matchAll(pattern);
      
      for (const match of matches) {
        const line = file.content.substring(0, match.index).split('\n').length;
        const lineContent = file.lines[line - 1];
        
        // 일관된 에러 형식 확인
        if (!lineContent.includes("{ error:") && !lineContent.includes("{error:")) {
          this.tracker.addWarning(
            relativePath,
            line,
            `${match[0].replace('status:', 'Status')} error format inconsistent`,
            lineContent.trim(),
            null,
            `NextResponse.json(${format}, ${match[0]})`
          );
        }
      }
    });

    // try-catch 블록 확인
    const hasTryCatch = /try\s*{/.test(file.content) && /catch\s*\(/.test(file.content);
    
    if (!hasTryCatch) {
      this.tracker.addInfo(
        relativePath,
        null,
        'try-catch 에러 처리 누락',
        null
      );
    }
  }

  checkRouteProtection(file, relativePath, options) {
    // 보호되어야 할 라우트 패턴
    const protectedPatterns = [
      'admin',
      'dashboard',
      'settings',
      'user',
      'profile'
    ];

    const isProtectedRoute = protectedPatterns.some(pattern => 
      relativePath.toLowerCase().includes(pattern)
    );

    if (isProtectedRoute) {
      // 인증 체크 확인 - requireAuth 함수와 supabase.auth.getUser 둘 다 허용
      const hasDirectAuthCheck = /supabase\.auth\.getUser\(\)/.test(file.content);
      const hasRequireAuth = /requireAuth\(/.test(file.content);
      const hasUserCheck = /if\s*\(\s*![a-zA-Z_][a-zA-Z0-9_]*\s*\)/.test(file.content);
      
      if ((!hasDirectAuthCheck && !hasRequireAuth) || !hasUserCheck) {
        this.tracker.addError(
          relativePath,
          null,
          '보호된 라우트에 인증 체크 누락',
          null,
          null,
          'requireAuth() 함수 또는 supabase.auth.getUser() 사용 필요'
        );
      }
    }
  }

  checkHttpMethods(file, relativePath, options) {
    // HTTP 메서드 export 확인
    const methodExports = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const exportedMethods = [];
    
    methodExports.forEach(method => {
      const pattern = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}`, 'g');
      if (pattern.test(file.content)) {
        exportedMethods.push(method);
      }
    });

    // OPTIONS 메서드 CORS 처리 확인
    if (exportedMethods.length > 0 && !exportedMethods.includes('OPTIONS')) {
      this.tracker.addInfo(
        relativePath,
        null,
        'OPTIONS 메서드 미구현 (CORS)',
        null
      );
    }

    // 메서드별 적절한 응답 확인
    exportedMethods.forEach(method => {
      const methodPattern = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}[^}]+}`, 's');
      const methodMatch = file.content.match(methodPattern);
      
      if (methodMatch) {
        const methodBody = methodMatch[0];
        
        // NextResponse 사용 확인
        if (!methodBody.includes('NextResponse')) {
          this.tracker.addWarning(
            relativePath,
            null,
            `${method} 메서드에서 NextResponse 미사용`,
            null,
            null,
            'NextResponse.json() 사용 권장'
          );
        }
      }
    });
  }

  checkResponseFormat(file, relativePath, options) {
    // 응답 형식 일관성
    const responsePattern = /NextResponse\.json\s*\(/g;
    const responses = [];
    
    let match;
    while ((match = responsePattern.exec(file.content)) !== null) {
      const line = file.content.substring(0, match.index).split('\n').length;
      const endIndex = file.content.indexOf(')', match.index);
      const responseContent = file.content.substring(match.index, endIndex + 1);
      
      responses.push({
        line,
        content: responseContent
      });
    }

    // 성공 응답 형식 확인
    responses.forEach(response => {
      if (response.content.includes('status: 200') || 
          (!response.content.includes('status:') && !response.content.includes('error'))) {
        // 성공 응답은 data 키 사용 권장
        if (!response.content.includes('data:') && !response.content.includes('{ data')) {
          this.tracker.addInfo(
            relativePath,
            response.line,
            '성공 응답에 data 키 사용 권장',
            null
          );
        }
      }
    });

    // 빈 응답 확인
    const emptyResponses = /NextResponse\.json\s*\(\s*\)/g;
    if (emptyResponses.test(file.content)) {
      this.tracker.addWarning(
        relativePath,
        null,
        '빈 응답 반환',
        null,
        null,
        '적절한 응답 데이터 제공 필요'
      );
    }
  }
  
  // ============ 새로운 스마트 검증 메서드들 ============
  
  /**
   * 개선된 인증 패턴 체크 - 헬퍼 함수 패턴 인정
   */
  checkSmartAuthPattern(file, relativePath, context, options) {
    // 테스트/Mock 파일은 인증 체크 완화
    if (context.isTestFile || context.isMockFile) {
      return;
    }
    
    // Public 엔드포인트는 인증 불필요
    if (relativePath.includes('/public/')) {
      return;
    }
    
    // 인증이 필요한 경로 확인
    const requiresAuth = this.shouldRequireAuth(relativePath);
    if (!requiresAuth) {
      return;
    }
    
    // 인증 패턴 품질 평가
    const authQuality = this.classifier.getAuthPatternQuality(file.content);
    
    if (authQuality.pattern === 'none') {
      // 실제 인증 누락
      this.addSmartIssue({
        type: 'missing_auth',
        message: '인증 체크 누락',
        context,
        file: relativePath,
        details: '사용자 인증이 필요한 엔드포인트입니다',
        solution: 'const user = await requireAuth(request); 또는 supabase.auth.getUser() 사용'
      });
    } else if (authQuality.pattern === 'helper') {
      // 헬퍼 함수 사용 - 권장 패턴!
      this.addSmartIssue({
        type: 'pattern_mismatch',
        message: `인증 패턴: ${authQuality.message}`,
        context,
        file: relativePath
      });
    } else {
      // 기타 패턴도 인정
      this.addSmartIssue({
        type: 'pattern_mismatch',
        message: `인증 패턴: ${authQuality.message}`,
        context,
        file: relativePath
      });
    }
  }
  
  /**
   * 보안 문제 체크
   */
  checkSecurityIssues(file, relativePath, context, options) {
    // 하드코딩된 비밀키 체크 (Critical)
    if (context.hasHardcodedSecrets) {
      this.addSmartIssue({
        type: 'hardcoded_secrets',
        message: '하드코딩된 비밀키 발견',
        context,
        file: relativePath,
        details: 'API 키, 패스워드 등이 코드에 하드코딩되어 있습니다',
        solution: '환경변수나 보안 저장소 사용 필요'
      });
    }
    
    // SQL 인젝션 위험 패턴 체크
    const sqlInjectionPatterns = [
      /\$\{[^}]*\}/,  // Template literal in SQL
      /\+\s*['"].*['"]\s*\+/  // String concatenation
    ];
    
    sqlInjectionPatterns.forEach(pattern => {
      if (pattern.test(file.content)) {
        this.addSmartIssue({
          type: 'sql_injection',
          message: 'SQL 인젝션 위험 패턴',
          context,
          file: relativePath,
          details: '동적 쿼리 생성에서 보안 위험이 있습니다',
          solution: 'Parameterized queries 또는 ORM 사용'
        });
      }
    });
  }
  
  /**
   * 인증이 필요한 경로인지 확인
   */
  shouldRequireAuth(relativePath) {
    const authRequiredPaths = [
      '/user/',
      '/admin/',
      '/account/',
      '/settings/',
      '/api-keys/',
      '/mypage/'
    ];
    
    return authRequiredPaths.some(pattern => relativePath.includes(pattern));
  }
}

module.exports = ApiVerifier;