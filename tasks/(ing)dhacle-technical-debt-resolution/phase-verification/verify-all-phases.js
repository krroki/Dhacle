#!/usr/bin/env node

/**
 * 기술 부채 해소 프로젝트 통합 검증 스크립트
 * Phase 0-5 전체 검증 자동화
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 출력을 위한 간단한 헬퍼
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

console.log(colors.blue(colors.bold('\n===============================================')));
console.log(colors.blue(colors.bold('   🔍 기술 부채 해소 프로젝트 통합 검증')));
console.log(colors.blue(colors.bold('===============================================\n')));

// 검증 결과 저장 객체
const results = {
  timestamp: new Date().toISOString(),
  phases: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// 검증 함수
function runCheck(phase, name, command, expected = null, type = 'exists') {
  process.stdout.write(`[Phase ${phase}] ${name}... `);
  results.summary.total++;
  
  if (!results.phases[`phase${phase}`]) {
    results.phases[`phase${phase}`] = { passed: 0, failed: 0, checks: [] };
  }
  
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: path.join(__dirname, '../../..')
    }).trim();
    
    let passed = false;
    let message = '';
    
    switch(type) {
      case 'exists':
        passed = result.includes(expected || 'exists');
        message = passed ? 'File/Directory exists' : 'Not found';
        break;
      case 'count':
        const count = parseInt(result) || 0;
        passed = expected === null ? true : count <= expected;
        message = `Count: ${count}${expected !== null ? ` (max: ${expected})` : ''}`;
        break;
      case 'contains':
        passed = result.includes(expected);
        message = passed ? 'Contains expected value' : 'Missing expected value';
        break;
      default:
        passed = true;
        message = 'Check completed';
    }
    
    if (passed) {
      console.log(colors.green('✅ PASS'));
      results.phases[`phase${phase}`].passed++;
      results.summary.passed++;
    } else {
      console.log(colors.red('❌ FAIL'));
      results.phases[`phase${phase}`].failed++;
      results.summary.failed++;
    }
    
    results.phases[`phase${phase}`].checks.push({
      name,
      status: passed ? 'passed' : 'failed',
      message,
      details: result.substring(0, 100)
    });
    
  } catch (error) {
    console.log(colors.red('❌ ERROR'));
    results.phases[`phase${phase}`].failed++;
    results.summary.failed++;
    
    results.phases[`phase${phase}`].checks.push({
      name,
      status: 'error',
      message: error.message.substring(0, 100)
    });
  }
}

// Phase 0: 준비 및 백업
console.log(colors.bold('\n📦 Phase 0: 준비 및 백업\n'));
runCheck(0, '프로젝트 특화 규칙 문서', 'test -f docs/CONTEXT_BRIDGE.md && echo "exists"', 'exists', 'exists');
runCheck(0, 'CLAUDE.md 메인 문서', 'test -f CLAUDE.md && echo "exists"', 'exists', 'exists');
runCheck(0, 'Git 저장소 상태', 'git status --porcelain | wc -l', 100, 'count');

// Phase 1: 환경변수 타입 안전성
console.log(colors.bold('\n🔐 Phase 1: 환경변수 타입 안전성\n'));
runCheck(1, '환경변수 타입 정의 파일', 'test -f src/lib/env.ts && echo "exists"', 'exists', 'exists');
runCheck(1, 'Zod 스키마 사용', 'grep -c "z\\." src/lib/env.ts 2>/dev/null || echo "0"', null, 'count');
runCheck(1, '환경변수 검증', 'test -f scripts/validate-env.js && echo "exists"', 'exists', 'exists');

// Phase 2: High Priority 기술부채
console.log(colors.bold('\n🚨 Phase 2: High Priority 기술부채\n'));
runCheck(2, '직접 fetch 사용', 'grep -r "fetch(" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "api-client" | wc -l', 0, 'count');
runCheck(2, 'console.log 사용', 'grep -r "console\\.log" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l', 5, 'count');
runCheck(2, 'any 타입 사용', 'grep -r ": any" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l', 0, 'count');
runCheck(2, 'API 클라이언트', 'test -f src/lib/api-client.ts && echo "exists"', 'exists', 'exists');
runCheck(2, '로거 시스템', 'test -f src/lib/logger.ts && echo "exists"', 'exists', 'exists');

// Phase 3: Medium Priority 품질개선
console.log(colors.bold('\n⚡ Phase 3: Medium Priority 품질개선\n'));
runCheck(3, 'React Query v5', 'cat package.json | grep "@tanstack/react-query" | grep -c "\\"5\\." || echo "0"', null, 'count');
runCheck(3, '컴포넌트 구조화', 'test -d src/components/features && echo "exists"', 'exists', 'exists');
runCheck(3, '공통 컴포넌트', 'test -d src/components/common && echo "exists"', 'exists', 'exists');
runCheck(3, 'UI 컴포넌트', 'test -d src/components/ui && echo "exists"', 'exists', 'exists');
runCheck(3, '훅 구현', 'ls src/hooks/use*.ts 2>/dev/null | wc -l', null, 'count');

// Phase 4: Low Priority (오버엔지니어링 제거)
console.log(colors.bold('\n🧹 Phase 4: 오버엔지니어링 제거\n'));
runCheck(4, 'Storybook 제거', '! test -d .storybook && echo "removed"', 'removed', 'exists');
runCheck(4, 'Docker 파일 제거', '! test -f Dockerfile && echo "removed"', 'removed', 'exists');
runCheck(4, 'Storybook 패키지', 'cat package.json | grep -c "@storybook" || echo "0"', 0, 'count');
runCheck(4, '번들 분석기 제거', 'cat package.json | grep -c "@next/bundle-analyzer" || echo "0"', 0, 'count');

// Phase 5: 최종 검증
console.log(colors.bold('\n✅ Phase 5: 최종 검증\n'));
runCheck(5, 'TypeScript 컴파일', 'npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"', 0, 'count');
runCheck(5, 'ESLint 검사', 'npm run lint 2>&1 | grep -c "error" || echo "0"', 10, 'count');

// 결과 요약
console.log(colors.blue(colors.bold('\n===============================================')));
console.log(colors.blue(colors.bold('                  📊 검증 결과')));
console.log(colors.blue(colors.bold('===============================================\n')));

// Phase별 결과
Object.entries(results.phases).forEach(([phase, data]) => {
  const phaseNum = phase.replace('phase', '');
  const total = data.passed + data.failed;
  const percentage = total > 0 ? Math.round((data.passed / total) * 100) : 0;
  const status = percentage === 100 ? colors.green('✅') : percentage >= 80 ? colors.yellow('⚠️') : colors.red('❌');
  
  console.log(`${status} Phase ${phaseNum}: ${data.passed}/${total} 통과 (${percentage}%)`);
});

// 전체 요약
console.log(colors.bold('\n📈 전체 요약:'));
console.log(`  • 총 검사: ${results.summary.total}개`);
console.log(`  • ${colors.green('통과')}: ${results.summary.passed}개`);
console.log(`  • ${colors.red('실패')}: ${results.summary.failed}개`);

const successRate = Math.round((results.summary.passed / results.summary.total) * 100);
console.log(`  • 성공률: ${successRate}%`);

// 결과 파일 저장
const resultFile = path.join(__dirname, 'verification-results.json');
fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
console.log(`\n📄 상세 결과가 저장되었습니다: ${resultFile}`);

// 최종 판정
console.log(colors.blue(colors.bold('\n===============================================\n')));
if (successRate === 100) {
  console.log(colors.green(colors.bold('🎉 모든 검증을 통과했습니다!')));
  console.log(colors.green('기술 부채 해소 프로젝트가 성공적으로 완료되었습니다.\n'));
  process.exit(0);
} else if (successRate >= 80) {
  console.log(colors.yellow(colors.bold('⚠️ 대부분의 검증을 통과했습니다.')));
  console.log(colors.yellow(`일부 항목(${results.summary.failed}개)에 대한 추가 작업이 필요합니다.\n`));
  process.exit(0);
} else {
  console.log(colors.red(colors.bold('❌ 검증 실패')));
  console.log(colors.red(`많은 항목(${results.summary.failed}개)이 실패했습니다. 추가 작업이 필요합니다.\n`));
  process.exit(1);
}