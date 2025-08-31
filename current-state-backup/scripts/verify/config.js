/**
 * 통합 검증 시스템 설정
 */

module.exports = {
  // 파일 패턴
  patterns: {
    all: 'src/**/*.{ts,tsx,js,jsx}',
    typescript: 'src/**/*.{ts,tsx}',
    javascript: 'src/**/*.{js,jsx}',
    api: 'src/app/api/**/*.{ts,tsx}',
    components: 'src/components/**/*.{ts,tsx}',
    pages: 'src/app/(pages)/**/*.{ts,tsx}',
    hooks: 'src/hooks/**/*.{ts,tsx}',
    lib: 'src/lib/**/*.{ts,tsx}',
    types: 'src/types/**/*.{ts,tsx}',
    styles: 'src/**/*.{css,scss}',
    tests: '**/*.{test,spec}.{ts,tsx,js,jsx}'
  },

  // 제외 패턴
  ignore: [
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.git/**',
    '**/*.min.js',
    '**/*.d.ts',
    '**/generated/**'
  ],

  // 검증 모듈 설정
  modules: {
    types: {
      enabled: true,
      rules: {
        noAny: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noUnusedVariables: true,
        noUnusedParameters: true,
        consistentTypes: true
      }
    },
    
    api: {
      enabled: true,
      rules: {
        authenticationRequired: true,
        consistentErrorFormat: true,
        sessionValidation: true,
        rateLimiting: false,
        supabasePatterns: true
      }
    },
    
    security: {
      enabled: true,
      rules: {
        noHardcodedSecrets: true,
        noConsoleLog: false,
        xssProtection: true,
        sqlInjectionProtection: true,
        sessionSecurity: true
      }
    },
    
    ui: {
      enabled: true,
      rules: {
        componentNaming: true,
        propTypes: false,
        accessibility: true,
        responsiveDesign: true,
        tailwindConsistency: true
      }
    },
    
    database: {
      enabled: true,
      rules: {
        schemaValidation: true,
        typeSync: true,
        rlsPolicies: true,
        migrationCheck: true
      }
    },
    
    dependencies: {
      enabled: true,
      rules: {
        securityAudit: true,
        versionCheck: true,
        unusedDependencies: true,
        duplicateDependencies: true
      }
    }
  },

  // 리포팅 설정
  reporting: {
    showContext: true,
    showSolutions: true,
    maxIssuesPerType: 10,
    outputFormat: 'console', // console, json, html
    generateReport: false,
    reportPath: './verification-report.json'
  },

  // 성능 설정
  performance: {
    parallel: true,
    maxWorkers: 4,
    cache: true,
    cacheDir: './.verify-cache'
  },

  // 임계값
  thresholds: {
    maxErrors: 0,      // 0개 이상 오류 시 실패
    maxWarnings: 100,  // 100개 이상 경고 시 실패
    maxComplexity: 20, // 순환 복잡도 임계값
    minCoverage: 80    // 최소 커버리지 %
  },

  // 커스텀 규칙
  customRules: {
    // 프로젝트별 커스텀 규칙 추가 가능
    noTodoComments: false,
    requireJSDoc: false,
    maxFileLength: 500,
    maxLineLength: 120
  },

  // Supabase 관련 설정
  supabase: {
    clientPattern: 'createSupabaseRouteHandlerClient',
    authPattern: 'supabase.auth.getUser()',
    errorFormat: {
      unauthenticated: "{ error: 'User not authenticated' }",
      unauthorized: "{ error: 'Unauthorized' }",
      notFound: "{ error: 'Not found' }",
      badRequest: "{ error: 'Bad request' }"
    }
  },

  // 환경별 설정
  env: {
    development: {
      strict: false,
      ignoreWarnings: false
    },
    production: {
      strict: true,
      ignoreWarnings: false
    },
    test: {
      strict: true,
      ignoreWarnings: true
    }
  }
};