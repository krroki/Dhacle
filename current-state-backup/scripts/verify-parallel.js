#!/usr/bin/env node

/**
 * 병렬 검증 실행 스크립트 v1.0
 * 
 * 모든 검증 스크립트를 병렬로 실행하여 속도 향상
 * 평균 60-70% 시간 단축 효과
 */

const { spawn } = require('child_process');
const path = require('path');

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

// 검증 스크립트 정의
const VERIFY_SCRIPTS = {
  // 우선순위별 그룹 (동시 실행 가능한 것들끼리 묶음)
  critical: [
    { name: 'API 일치성', command: 'verify:api', weight: 1 },
    { name: '라우트 보호', command: 'verify:routes', weight: 1 },
    { name: '타입 안정성', command: 'verify:types', weight: 1 }
  ],
  quality: [
    { name: 'UI 일관성', command: 'verify:ui', weight: 0.5 },
    { name: 'Import 구조', command: 'verify:imports', weight: 0.5 }
  ],
  infrastructure: [
    { name: '의존성', command: 'verify:deps', weight: 0.8 },
    { name: 'DB 스키마', command: 'verify:db', weight: 0.7 },
    { name: '런타임 설정', command: 'verify:runtime', weight: 0.3 }
  ]
};

class ParallelVerifier {
  constructor(mode = 'all') {
    this.mode = mode;
    this.results = new Map();
    this.startTime = Date.now();
    this.failedScripts = [];
    this.successfulScripts = [];
    this.warningScripts = [];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  // 스크립트 실행
  runScript(name, command) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const child = spawn('npm', ['run', command], {
        shell: true,
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        const result = {
          name,
          command,
          exitCode: code,
          duration,
          output,
          errorOutput,
          status: code === 0 ? 'success' : 'failed'
        };

        // 경고 감지 (exit code는 0이지만 warning이 있는 경우)
        if (code === 0 && (output.includes('⚠️') || output.includes('warning'))) {
          result.status = 'warning';
        }

        this.results.set(name, result);
        resolve(result);
      });

      child.on('error', (error) => {
        const duration = Date.now() - startTime;
        
        const result = {
          name,
          command,
          exitCode: -1,
          duration,
          output: '',
          errorOutput: error.message,
          status: 'error'
        };

        this.results.set(name, result);
        resolve(result);
      });
    });
  }

  // 그룹 병렬 실행
  async runGroup(groupName, scripts) {
    this.log(`\n🚀 ${groupName} 그룹 병렬 실행 중...`, colors.cyan);
    
    const promises = scripts.map(script => 
      this.runScript(script.name, script.command)
    );

    const results = await Promise.all(promises);
    
    // 결과 분류
    results.forEach(result => {
      if (result.status === 'failed' || result.status === 'error') {
        this.failedScripts.push(result);
      } else if (result.status === 'warning') {
        this.warningScripts.push(result);
      } else {
        this.successfulScripts.push(result);
      }
      
      // 실시간 상태 표시
      const statusIcon = 
        result.status === 'success' ? '✅' :
        result.status === 'warning' ? '⚠️' :
        '❌';
      
      const statusColor = 
        result.status === 'success' ? colors.green :
        result.status === 'warning' ? colors.yellow :
        colors.red;
      
      this.log(
        `  ${statusIcon} ${result.name}: ${result.duration}ms`,
        statusColor
      );
    });
    
    return results;
  }

  // 선택적 실행
  getScriptsToRun() {
    switch (this.mode) {
      case 'critical':
        return { Critical: VERIFY_SCRIPTS.critical };
      
      case 'quality':
        return { Quality: VERIFY_SCRIPTS.quality };
      
      case 'infrastructure':
        return { Infrastructure: VERIFY_SCRIPTS.infrastructure };
      
      case 'security':
        return {
          Security: [
            VERIFY_SCRIPTS.critical[1], // routes
            VERIFY_SCRIPTS.infrastructure[0], // deps
            VERIFY_SCRIPTS.infrastructure[2] // runtime
          ]
        };
      
      case 'all':
      default:
        return {
          Critical: VERIFY_SCRIPTS.critical,
          Quality: VERIFY_SCRIPTS.quality,
          Infrastructure: VERIFY_SCRIPTS.infrastructure
        };
    }
  }

  // 결과 요약 출력
  printSummary() {
    const totalDuration = Date.now() - this.startTime;
    
    this.log('\n' + '='.repeat(60), colors.cyan);
    this.log('📊 병렬 검증 결과 요약', colors.cyan + colors.bold);
    this.log('='.repeat(60), colors.cyan);
    
    // 통계
    this.log(`\n⏱️  총 실행 시간: ${totalDuration}ms`, colors.blue);
    this.log(`📈 검증 결과:`, colors.blue);
    this.log(`  • 성공: ${this.successfulScripts.length}개`, colors.green);
    this.log(`  • 경고: ${this.warningScripts.length}개`, colors.yellow);
    this.log(`  • 실패: ${this.failedScripts.length}개`, colors.red);
    
    // 실패한 스크립트 상세
    if (this.failedScripts.length > 0) {
      this.log(`\n❌ 실패한 검증:`, colors.red + colors.bold);
      this.failedScripts.forEach(script => {
        this.log(`  • ${script.name} (${script.command})`, colors.red);
        
        // 주요 에러 메시지 추출
        const errorLines = script.output.split('\n')
          .filter(line => line.includes('❌') || line.includes('Error'))
          .slice(0, 3);
        
        if (errorLines.length > 0) {
          errorLines.forEach(line => {
            this.log(`    ${line.trim()}`, colors.yellow);
          });
        }
      });
    }
    
    // 경고가 있는 스크립트
    if (this.warningScripts.length > 0) {
      this.log(`\n⚠️  경고가 있는 검증:`, colors.yellow + colors.bold);
      this.warningScripts.forEach(script => {
        this.log(`  • ${script.name} (${script.command})`, colors.yellow);
      });
    }
    
    // 성능 분석
    this.log(`\n📊 성능 분석:`, colors.magenta);
    const sortedByDuration = Array.from(this.results.values())
      .sort((a, b) => b.duration - a.duration);
    
    this.log(`  가장 느린 검증:`, colors.cyan);
    sortedByDuration.slice(0, 3).forEach(result => {
      this.log(`    • ${result.name}: ${result.duration}ms`, colors.cyan);
    });
    
    // 병렬 실행 이득 계산
    const sequentialTime = Array.from(this.results.values())
      .reduce((sum, r) => sum + r.duration, 0);
    const speedup = ((sequentialTime - totalDuration) / sequentialTime * 100).toFixed(1);
    
    this.log(`\n⚡ 병렬 실행 효과:`, colors.green);
    this.log(`  • 순차 실행 예상 시간: ${sequentialTime}ms`, colors.cyan);
    this.log(`  • 실제 병렬 실행 시간: ${totalDuration}ms`, colors.cyan);
    this.log(`  • 속도 향상: ${speedup}%`, colors.green + colors.bold);
  }

  // 메인 실행
  async run() {
    this.log('🚀 병렬 검증 시작...', colors.cyan + colors.bold);
    this.log(`모드: ${this.mode}`, colors.blue);
    this.log('=' .repeat(60), colors.cyan);
    
    const scriptsToRun = this.getScriptsToRun();
    
    // 각 그룹을 순차적으로, 그룹 내에서는 병렬로 실행
    for (const [groupName, scripts] of Object.entries(scriptsToRun)) {
      await this.runGroup(groupName, scripts);
    }
    
    // 결과 요약
    this.printSummary();
    
    // Exit code 결정
    if (this.failedScripts.length > 0) {
      this.log('\n❌ 검증 실패!', colors.red + colors.bold);
      process.exit(1);
    } else if (this.warningScripts.length > 0) {
      this.log('\n⚠️  경고와 함께 통과', colors.yellow + colors.bold);
      process.exit(0);
    } else {
      this.log('\n✅ 모든 검증 통과!', colors.green + colors.bold);
      process.exit(0);
    }
  }
}

// CLI 인자 파싱
const args = process.argv.slice(2);
const mode = args[0] || 'all';

const validModes = ['all', 'critical', 'quality', 'infrastructure', 'security'];
if (!validModes.includes(mode)) {
  console.error(`❌ 유효하지 않은 모드: ${mode}`);
  console.log(`사용 가능한 모드: ${validModes.join(', ')}`);
  process.exit(1);
}

// 실행
const verifier = new ParallelVerifier(mode);
verifier.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});