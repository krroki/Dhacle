#!/usr/bin/env node

/**
 * 통합 검증 시스템 메인 엔진
 * 모든 검증 모듈을 관리하고 실행하는 중앙 컨트롤러
 */

const { logger, helpers, colors } = require('./utils');
const config = require('./config');
const TypeVerifier = require('./modules/types');
const ApiVerifier = require('./modules/api');
const SecurityVerifier = require('./modules/security');
const UiVerifier = require('./modules/ui');
const DatabaseVerifier = require('./modules/database');
const DependencyVerifier = require('./modules/dependencies');

class VerificationEngine {
  constructor(options = {}) {
    this.options = {
      module: 'all',      // all, types, api, security, ui, database, dependencies
      verbose: false,
      fix: false,
      dryRun: false,
      parallel: true,
      ...options
    };

    // 모듈 초기화
    this.modules = {
      types: new TypeVerifier(config.modules.types),
      api: new ApiVerifier(config.modules.api),
      security: new SecurityVerifier(config.modules.security),
      ui: new UiVerifier(config.modules.ui),
      database: new DatabaseVerifier(config.modules.database),
      dependencies: new DependencyVerifier(config.modules.dependencies)
    };

    this.results = {};
  }

  async run() {
    const startTime = Date.now();
    
    logger.header('🚀 통합 검증 시스템 시작...');
    console.log('============================================================');
    
    // 실행할 모듈 결정
    const modulesToRun = this.getModulesToRun();
    
    if (this.options.verbose) {
      logger.info(`실행 모드: ${this.options.module}`);
      logger.info(`실행할 모듈: ${modulesToRun.join(', ')}`);
      if (this.options.dryRun) {
        logger.warning('DRY RUN 모드 - 실제 수정 없음');
      }
    }

    console.log('');

    // 모듈 실행
    if (this.options.parallel && modulesToRun.length > 1) {
      await this.runParallel(modulesToRun);
    } else {
      await this.runSequential(modulesToRun);
    }

    // 결과 집계
    const summary = this.generateSummary();
    const duration = Date.now() - startTime;

    // 최종 리포트
    this.printFinalReport(summary, duration);

    // 종료 코드 결정
    const exitCode = this.determineExitCode(summary);
    
    if (this.options.generateReport) {
      this.saveReport(summary);
    }

    process.exit(exitCode);
  }

  getModulesToRun() {
    if (this.options.module === 'all') {
      return Object.keys(this.modules).filter(name => 
        config.modules[name]?.enabled !== false
      );
    }
    
    // 특정 모듈만 실행
    if (this.modules[this.options.module]) {
      return [this.options.module];
    }

    // 카테고리별 실행
    const categories = {
      critical: ['types', 'api', 'security'],
      quality: ['ui', 'database'],
      infrastructure: ['dependencies']
    };

    if (categories[this.options.module]) {
      return categories[this.options.module];
    }

    logger.error(`알 수 없는 모듈: ${this.options.module}`);
    process.exit(1);
  }

  async runSequential(modules) {
    for (const moduleName of modules) {
      logger.subheader(`\n🔍 ${moduleName.toUpperCase()} 검증 중...`);
      
      try {
        const result = await this.modules[moduleName].verify(this.options);
        this.results[moduleName] = result;
        
        if (result.success) {
          logger.success(`${moduleName} 검증 완료`);
        } else {
          logger.warning(`${moduleName} 검증 문제 발견`);
        }
      } catch (error) {
        logger.error(`${moduleName} 검증 실패: ${error.message}`);
        this.results[moduleName] = {
          success: false,
          errors: 1,
          message: error.message
        };
      }
    }
  }

  async runParallel(modules) {
    logger.subheader('\n🚀 병렬 검증 실행 중...');
    
    const promises = modules.map(async (moduleName) => {
      const startTime = Date.now();
      
      try {
        const result = await this.modules[moduleName].verify(this.options);
        const duration = Date.now() - startTime;
        
        this.results[moduleName] = { ...result, duration };
        
        const icon = result.success ? '✅' : result.errors > 0 ? '❌' : '⚠️';
        console.log(`  ${icon} ${moduleName}: ${duration}ms`);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`  ❌ ${moduleName}: ${error.message} (${duration}ms)`);
        
        this.results[moduleName] = {
          success: false,
          errors: 1,
          message: error.message,
          duration
        };
        
        return this.results[moduleName];
      }
    });

    await Promise.all(promises);
  }

  generateSummary() {
    const summary = {
      totalErrors: 0,
      totalWarnings: 0,
      totalInfo: 0,
      failedModules: [],
      warningModules: [],
      passedModules: [],
      totalDuration: 0
    };

    Object.entries(this.results).forEach(([name, result]) => {
      summary.totalErrors += result.errors || 0;
      summary.totalWarnings += result.warnings || 0;
      summary.totalInfo += result.info || 0;
      summary.totalDuration += result.duration || 0;

      if (!result.success || result.errors > 0) {
        summary.failedModules.push(name);
      } else if (result.warnings > 0) {
        summary.warningModules.push(name);
      } else {
        summary.passedModules.push(name);
      }
    });

    return summary;
  }

  printFinalReport(summary, totalDuration) {
    console.log('\n============================================================');
    logger.header('📊 통합 검증 결과 요약');
    console.log('============================================================');
    
    logger.subheader('\n⏱️  실행 시간:');
    console.log(`  • 총 실행 시간: ${totalDuration}ms`);
    
    if (this.options.parallel && Object.keys(this.results).length > 1) {
      const sequentialTime = summary.totalDuration;
      const speedup = ((sequentialTime - totalDuration) / sequentialTime * 100).toFixed(1);
      console.log(`  • 순차 실행 예상: ${sequentialTime}ms`);
      logger.success(`  • 속도 향상: ${speedup}%`);
    }

    logger.subheader('\n📈 검증 결과:');
    console.log(`${colors.green}  • 성공: ${summary.passedModules.length}개${colors.reset}`);
    console.log(`${colors.yellow}  • 경고: ${summary.warningModules.length}개${colors.reset}`);
    console.log(`${colors.red}  • 실패: ${summary.failedModules.length}개${colors.reset}`);

    if (summary.failedModules.length > 0) {
      logger.error('\n❌ 실패한 검증:');
      summary.failedModules.forEach(name => {
        const result = this.results[name];
        console.log(`  • ${name}: ${result.errors || 0}개 오류`);
        if (result.details) {
          result.details.slice(0, 3).forEach(detail => {
            console.log(`    - ${detail}`);
          });
        }
      });
    }

    if (summary.warningModules.length > 0) {
      logger.warning('\n⚠️  경고가 있는 검증:');
      summary.warningModules.forEach(name => {
        const result = this.results[name];
        console.log(`  • ${name}: ${result.warnings || 0}개 경고`);
      });
    }

    if (summary.passedModules.length > 0 && this.options.verbose) {
      logger.success('\n✅ 통과한 검증:');
      summary.passedModules.forEach(name => {
        console.log(`  • ${name}`);
      });
    }

    // 최종 상태
    console.log('\n============================================================');
    if (summary.failedModules.length > 0) {
      logger.error('❌ 검증 실패!');
    } else if (summary.warningModules.length > 0) {
      logger.warning('⚠️  경고와 함께 통과');
    } else {
      logger.success('✅ 모든 검증 통과!');
    }
  }

  determineExitCode(summary) {
    if (summary.failedModules.length > 0) {
      return 1;
    }
    
    if (config.thresholds.maxWarnings && summary.totalWarnings > config.thresholds.maxWarnings) {
      return 1;
    }
    
    return 0;
  }

  saveReport(summary) {
    const fs = require('fs');
    const report = {
      timestamp: new Date().toISOString(),
      options: this.options,
      summary,
      results: this.results
    };

    fs.writeFileSync(
      config.reporting.reportPath,
      JSON.stringify(report, null, 2)
    );
    
    logger.info(`리포트 저장: ${config.reporting.reportPath}`);
  }
}

// CLI 인터페이스
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    module: 'all'
  };

  // 플래그 파싱
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--fix') {
      options.fix = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--sequential') {
      options.parallel = false;
    } else if (arg === '--report') {
      options.generateReport = true;
    } else if (arg === '--module' && i + 1 < args.length) {
      options.module = args[i + 1];
      i++; // Skip next arg
    } else if (arg.startsWith('--module=')) {
      options.module = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      // First non-flag argument is the module
      if (options.module === 'all') {
        options.module = arg;
      }
    }
  }

  return options;
}

// 도움말
function showHelp() {
  console.log(`
${colors.cyan}${colors.bold}통합 검증 시스템${colors.reset}

사용법:
  node scripts/verify [module] [options]

모듈:
  all           모든 검증 실행 (기본값)
  types         타입 검증만 실행
  api           API 검증만 실행
  security      보안 검증만 실행
  ui            UI 검증만 실행
  database      데이터베이스 검증만 실행
  dependencies  의존성 검증만 실행
  critical      중요 검증만 (types, api, security)
  quality       품질 검증만 (ui, database)

옵션:
  --verbose, -v    자세한 출력
  --fix            자동 수정 (가능한 경우)
  --dry-run        실제 수정 없이 실행
  --sequential     순차 실행 (병렬 비활성화)
  --report         JSON 리포트 생성
  --help, -h       도움말 표시

예제:
  node scripts/verify                    # 모든 검증 실행
  node scripts/verify types              # 타입 검증만
  node scripts/verify critical --verbose # 중요 검증 상세 실행
  node scripts/verify all --fix          # 자동 수정과 함께 실행
  `);
}

// 메인 실행
async function main() {
  const options = parseArguments();
  
  if (options.module === '--help' || options.module === '-h') {
    showHelp();
    process.exit(0);
  }

  const engine = new VerificationEngine(options);
  await engine.run();
}

// 실행
if (require.main === module) {
  main().catch(error => {
    logger.error(`치명적 오류: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = VerificationEngine;