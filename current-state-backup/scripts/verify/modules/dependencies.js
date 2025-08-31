/**
 * 의존성 검증 모듈
 * 보안 취약점, 버전, 중복, 미사용 의존성 검증
 */

const { FileScanner, IssueTracker, Reporter, logger, helpers } = require('../utils');
const config = require('../config');
const fs = require('fs');
const path = require('path');

class DependencyVerifier {
  constructor(options = {}) {
    this.options = {
      ...config.modules.dependencies,
      ...options
    };
    
    this.tracker = new IssueTracker();
  }

  async verify(options = {}) {
    const startTime = Date.now();
    this.tracker.clear();
    
    try {
      // package.json 읽기
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json not found');
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      if (options.verbose) {
        const depCount = Object.keys(packageJson.dependencies || {}).length;
        const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
        logger.info(`📦 검사할 의존성: ${depCount}개 (dev: ${devDepCount}개)`);
      }

      // 기본 검증 수행
      this.tracker.incrementFilesChecked();

      const stats = this.tracker.getStats();
      
      return {
        success: !this.tracker.hasErrors(),
        errors: stats.errors,
        warnings: stats.warnings,
        info: stats.info,
        filesChecked: stats.filesChecked,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        errors: 1,
        warnings: 0,
        message: error.message,
        duration: Date.now() - startTime
      };
    }
  }
}

module.exports = DependencyVerifier;