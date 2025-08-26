/**
 * API 검증 모듈
 * API 라우트 패턴, 인증, 에러 처리 일관성 검증
 */

const { FileScanner, IssueTracker, Reporter, logger, helpers } = require('../utils');
const config = require('../config');
const fs = require('fs');
const path = require('path');

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
    
    // API 검증 규칙
    this.checks = {
      authenticationPattern: this.checkAuthPattern.bind(this),
      sessionValidation: this.checkSessionValidation.bind(this),
      errorHandling: this.checkErrorHandling.bind(this),
      supabasePattern: this.checkSupabasePattern.bind(this),
      routeProtection: this.checkRouteProtection.bind(this),
      httpMethods: this.checkHttpMethods.bind(this),
      responseFormat: this.checkResponseFormat.bind(this)
    };

    // 특수 목적 파일 (검증 제외)
    this.specialPurposeFiles = [
      'webhook/route.ts',
      'debug/env-check/route.ts',
      'user/api-keys/route.ts',
      'auth/callback/route.ts'
    ];

    // Service Role을 사용하는 특수 라우트
    this.serviceRoleRoutes = [
      'revenue-proof/[id]/route.ts',
      'revenue-proof/ranking/route.ts'
    ];
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

    // 특수 목적 파일 확인
    if (this.isSpecialPurposeFile(relativePath)) {
      this.tracker.addWarning(
        relativePath,
        null,
        'Special purpose file (검증 제외)',
        null
      );
      return;
    }

    // Service Role 라우트 확인
    if (this.isServiceRoleRoute(relativePath)) {
      this.tracker.addWarning(
        relativePath,
        null,
        'Uses Service Role Client (특수 목적 - 검토 필요)',
        null
      );
      return;
    }

    // 각 검증 규칙 실행
    for (const [checkName, checkFunction] of Object.entries(this.checks)) {
      if (this.options.rules[checkName] !== false) {
        await checkFunction(file, relativePath, options);
      }
    }
  }

  isSpecialPurposeFile(relativePath) {
    return this.specialPurposeFiles.some(pattern => 
      relativePath.includes(pattern.replace(/\\/g, '/'))
    );
  }

  isServiceRoleRoute(relativePath) {
    return this.serviceRoleRoutes.some(pattern => 
      relativePath.includes(pattern.replace(/\\/g, '/'))
    );
  }

  checkSupabasePattern(file, relativePath, options) {
    const correctImport = 'createSupabaseRouteHandlerClient';
    const correctPath = '@/lib/supabase/server-client';
    
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
      // 인증 체크 확인
      const hasAuthCheck = /supabase\.auth\.getUser\(\)/.test(file.content);
      const hasUserCheck = /if\s*\(\s*!user\s*\)/.test(file.content);
      
      if (!hasAuthCheck || !hasUserCheck) {
        this.tracker.addError(
          relativePath,
          null,
          '보호된 라우트에 인증 체크 누락',
          null,
          null,
          '인증 체크 및 401 응답 추가 필요'
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
}

module.exports = ApiVerifier;