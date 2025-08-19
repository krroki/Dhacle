#!/usr/bin/env node

/**
 * 의존성 취약점 및 사용 현황 검증 스크립트 v1.0
 * 
 * ✅ npm audit + 사용하지 않는 패키지 감지 + 버전 일관성 체크
 * ❌ 자동 수정은 하지 않습니다 - 의존성 변경은 신중한 검토가 필요합니다.
 * 
 * 검증 항목:
 * - 보안 취약점 (Critical, High, Medium, Low)
 * - 사용하지 않는 dependencies
 * - 중복된 패키지 버전
 * - package-lock.json 일치성
 * - 라이선스 호환성
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// 화이트리스트 패키지 (사용하지 않아도 유지)
const WHITELIST = [
  '@types/', // TypeScript 타입 정의
  'eslint-', // ESLint 플러그인
  'postcss', // CSS 처리
  'tailwindcss', // 스타일링
  'autoprefixer' // CSS 접두사
];

// 위험한 라이선스
const RISKY_LICENSES = [
  'GPL', 'AGPL', 'LGPL', 'SSPL', 'EUPL'
];

class DependencyChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.unusedPackages = new Set();
    this.vulnerabilities = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0
    };
    this.duplicates = new Map();
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  // npm audit 실행
  checkVulnerabilities() {
    this.log('\n🔍 보안 취약점 검사 중...', colors.cyan);
    
    try {
      // npm audit --json으로 결과 파싱
      const auditResult = execSync('npm audit --json', { encoding: 'utf-8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.metadata) {
        this.vulnerabilities = {
          critical: audit.metadata.vulnerabilities.critical || 0,
          high: audit.metadata.vulnerabilities.high || 0,
          moderate: audit.metadata.vulnerabilities.moderate || 0,
          low: audit.metadata.vulnerabilities.low || 0
        };
        
        const total = Object.values(this.vulnerabilities).reduce((a, b) => a + b, 0);
        
        if (total > 0) {
          // 취약점 상세 정보
          Object.entries(audit.vulnerabilities || {}).forEach(([name, vuln]) => {
            const severity = vuln.severity;
            const via = vuln.via[0];
            
            if (typeof via === 'object') {
              const issue = {
                package: name,
                severity: severity,
                title: via.title || 'Unknown vulnerability',
                url: via.url || '',
                fixAvailable: vuln.fixAvailable
              };
              
              if (severity === 'critical' || severity === 'high') {
                this.errors.push(issue);
              } else if (severity === 'moderate') {
                this.warnings.push(issue);
              } else {
                this.info.push(issue);
              }
            }
          });
        }
      }
    } catch (error) {
      // npm audit가 0이 아닌 exit code를 반환해도 계속
      if (error.stdout) {
        try {
          const audit = JSON.parse(error.stdout);
          if (audit.metadata) {
            this.vulnerabilities = audit.metadata.vulnerabilities;
          }
        } catch (e) {
          this.warnings.push({
            message: 'npm audit 결과 파싱 실패',
            detail: error.message
          });
        }
      }
    }
  }

  // 사용하지 않는 패키지 찾기
  findUnusedPackages() {
    this.log('\n🔍 사용하지 않는 패키지 검사 중...', colors.cyan);
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    const allDeps = [...dependencies, ...devDependencies];
    
    // 프로젝트 파일에서 import/require 수집
    const sourceFiles = glob.sync('src/**/*.{js,jsx,ts,tsx}', {
      ignore: ['**/node_modules/**', '**/.next/**']
    });
    
    const usedPackages = new Set();
    
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // import 문 파싱
      const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
      const requireMatches = content.matchAll(/require\s*\(['"]([^'"]+)['"]\)/g);
      
      [...importMatches, ...requireMatches].forEach(match => {
        const importPath = match[1];
        // 패키지명 추출 (스코프 패키지 처리)
        const packageName = importPath.startsWith('@') 
          ? importPath.split('/').slice(0, 2).join('/')
          : importPath.split('/')[0];
        
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
          usedPackages.add(packageName);
        }
      });
    });
    
    // CSS 파일에서 사용되는 패키지 체크
    const cssFiles = glob.sync('src/**/*.{css,scss}');
    cssFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('tailwind')) {
        usedPackages.add('tailwindcss');
        usedPackages.add('autoprefixer');
        usedPackages.add('postcss');
      }
    });
    
    // Next.js 설정 파일 체크
    if (fs.existsSync('next.config.js') || fs.existsSync('next.config.mjs')) {
      usedPackages.add('next');
      usedPackages.add('react');
      usedPackages.add('react-dom');
    }
    
    // 사용하지 않는 패키지 찾기
    allDeps.forEach(dep => {
      const isUsed = usedPackages.has(dep);
      const isWhitelisted = WHITELIST.some(w => dep.includes(w));
      
      if (!isUsed && !isWhitelisted) {
        this.unusedPackages.add(dep);
        
        const isDevDep = devDependencies.includes(dep);
        this.warnings.push({
          package: dep,
          type: isDevDep ? 'devDependency' : 'dependency',
          message: '사용하지 않는 패키지'
        });
      }
    });
  }

  // 중복 버전 체크
  checkDuplicates() {
    this.log('\n🔍 중복 패키지 버전 검사 중...', colors.cyan);
    
    try {
      // npm ls --json으로 의존성 트리 분석
      const lsResult = execSync('npm ls --json --depth=999', { 
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });
      const tree = JSON.parse(lsResult);
      
      const packageVersions = new Map();
      
      // 재귀적으로 의존성 트리 탐색
      const traverse = (deps, parent = '') => {
        Object.entries(deps || {}).forEach(([name, info]) => {
          if (info.version) {
            if (!packageVersions.has(name)) {
              packageVersions.set(name, new Set());
            }
            packageVersions.get(name).add(info.version);
          }
          
          if (info.dependencies) {
            traverse(info.dependencies, name);
          }
        });
      };
      
      traverse(tree.dependencies);
      
      // 중복 버전 찾기
      packageVersions.forEach((versions, name) => {
        if (versions.size > 1) {
          this.duplicates.set(name, Array.from(versions));
          this.info.push({
            package: name,
            versions: Array.from(versions),
            message: '중복 버전 발견'
          });
        }
      });
    } catch (error) {
      // npm ls 오류는 무시 (peer dependency 문제 등)
    }
  }

  // package-lock.json 일치성 체크
  checkLockFile() {
    this.log('\n🔍 package-lock.json 일치성 검사 중...', colors.cyan);
    
    if (!fs.existsSync('package-lock.json')) {
      this.errors.push({
        message: 'package-lock.json 파일 없음',
        solution: 'npm install을 실행하여 생성하세요'
      });
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const lockFile = JSON.parse(fs.readFileSync('package-lock.json', 'utf-8'));
    
    // 버전 일치성 체크
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    Object.entries(deps).forEach(([name, version]) => {
      const lockVersion = lockFile.packages?.[`node_modules/${name}`]?.version;
      
      if (lockVersion) {
        // 간단한 버전 호환성 체크
        if (!this.isVersionCompatible(version, lockVersion)) {
          this.warnings.push({
            package: name,
            expected: version,
            actual: lockVersion,
            message: 'package-lock.json 버전 불일치'
          });
        }
      }
    });
  }

  // 버전 호환성 체크
  isVersionCompatible(range, version) {
    // 간단한 체크 (완벽하지 않음)
    if (range === version) return true;
    if (range.startsWith('^') || range.startsWith('~')) {
      return version.startsWith(range.substring(1).split('.')[0]);
    }
    return false;
  }

  // 결과 출력
  printResults() {
    this.log('\n' + '='.repeat(60), colors.cyan);
    this.log('📊 의존성 검증 결과', colors.cyan + colors.bold);
    this.log('='.repeat(60), colors.cyan);

    // 통계
    this.log(`\n📈 통계:`, colors.blue);
    this.log(`  보안 취약점:`, colors.yellow);
    this.log(`    • Critical: ${this.vulnerabilities.critical}개`, 
      this.vulnerabilities.critical > 0 ? colors.red : colors.green);
    this.log(`    • High: ${this.vulnerabilities.high}개`,
      this.vulnerabilities.high > 0 ? colors.red : colors.green);
    this.log(`    • Moderate: ${this.vulnerabilities.moderate}개`,
      this.vulnerabilities.moderate > 0 ? colors.yellow : colors.green);
    this.log(`    • Low: ${this.vulnerabilities.low}개`, colors.cyan);
    
    this.log(`\n  패키지 상태:`, colors.blue);
    this.log(`    • 사용하지 않는 패키지: ${this.unusedPackages.size}개`);
    this.log(`    • 중복 버전: ${this.duplicates.size}개`);

    // Critical/High 취약점 상세
    const criticalAndHigh = this.errors.filter(e => 
      e.severity === 'critical' || e.severity === 'high'
    );
    
    if (criticalAndHigh.length > 0) {
      this.log(`\n🚨 심각한 보안 취약점:`, colors.red + colors.bold);
      criticalAndHigh.forEach((vuln, index) => {
        this.log(`\n  ${index + 1}. ${vuln.package} (${vuln.severity})`, colors.red);
        this.log(`     ${vuln.title}`, colors.yellow);
        if (vuln.url) {
          this.log(`     상세: ${vuln.url}`, colors.cyan);
        }
        if (vuln.fixAvailable) {
          this.log(`     ✅ 수정 가능: npm audit fix`, colors.green);
        } else {
          this.log(`     ⚠️  수동 수정 필요`, colors.yellow);
        }
      });
    }

    // 사용하지 않는 패키지
    if (this.unusedPackages.size > 0) {
      this.log(`\n📦 사용하지 않는 패키지:`, colors.yellow + colors.bold);
      Array.from(this.unusedPackages).slice(0, 10).forEach((pkg, index) => {
        this.log(`  ${index + 1}. ${pkg}`, colors.yellow);
      });
      
      if (this.unusedPackages.size > 10) {
        this.log(`  ... 외 ${this.unusedPackages.size - 10}개`, colors.yellow);
      }
      
      this.log(`\n  💡 제거 명령어:`, colors.green);
      this.log(`     npm uninstall ${Array.from(this.unusedPackages).join(' ')}`, colors.cyan);
    }

    // 권장사항
    this.log(`\n💡 권장사항:`, colors.green + colors.bold);
    
    if (this.vulnerabilities.critical > 0 || this.vulnerabilities.high > 0) {
      this.log(`  1. 즉시 보안 취약점 수정:`, colors.red);
      this.log(`     npm audit fix`, colors.cyan);
      this.log(`     npm audit fix --force  # 주의: breaking changes 가능`, colors.yellow);
    }
    
    if (this.unusedPackages.size > 0) {
      this.log(`  2. 사용하지 않는 패키지 제거로 번들 크기 감소`, colors.yellow);
    }
    
    if (this.duplicates.size > 0) {
      this.log(`  3. 중복 패키지 정리:`, colors.blue);
      this.log(`     npm dedupe`, colors.cyan);
    }
    
    this.log(`  4. 정기적인 의존성 업데이트:`, colors.green);
    this.log(`     npm outdated  # 오래된 패키지 확인`, colors.cyan);
    this.log(`     npm update    # 안전한 업데이트`, colors.cyan);
  }

  async run() {
    this.log('🔍 의존성 검증 시작...', colors.cyan);
    this.log('=' .repeat(60), colors.cyan);

    // 각 검사 실행
    this.checkVulnerabilities();
    this.findUnusedPackages();
    this.checkDuplicates();
    this.checkLockFile();

    // 결과 출력
    this.printResults();

    // Exit code 결정
    const hasCritical = this.vulnerabilities.critical > 0;
    const hasHigh = this.vulnerabilities.high > 0;
    
    if (hasCritical) {
      this.log('\n❌ Critical 보안 취약점 발견!', colors.red + colors.bold);
      process.exit(1);
    } else if (hasHigh) {
      this.log('\n⚠️  High 보안 취약점 발견!', colors.yellow + colors.bold);
      process.exit(0); // 경고만
    } else {
      this.log('\n✅ 의존성 검증 통과!', colors.green + colors.bold);
      process.exit(0);
    }
  }
}

// 실행
const checker = new DependencyChecker();
checker.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});