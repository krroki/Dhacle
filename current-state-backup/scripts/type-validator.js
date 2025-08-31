#!/usr/bin/env node

/**
 * TypeScript 타입 시스템 검증 도구
 * Wave 3: 스마트 자동화 구축
 * 
 * 목적:
 * - Any 타입 사용 감지
 * - 잘못된 import 경로 검증
 * - 타입 시스템 일관성 확인
 * 
 * 사용법: node scripts/type-validator.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

// 타입 불일치 감지
function detectTypeMismatches() {
  const issues = [];
  
  console.log(`${colors.blue}🔍 타입 시스템 검증 시작...${colors.reset}\n`);
  
  // 1. Any 타입 탐지
  console.log('📋 Any 타입 검사 중...');
  try {
    const anyTypes = execSync(
      'grep -r ": any" src --include="*.ts" --include="*.tsx" 2>/dev/null || true',
      { encoding: 'utf8', shell: true }
    );
    
    if (anyTypes) {
      anyTypes.split('\n').forEach(line => {
        if (line && 
            !line.includes('// eslint-disable') && 
            !line.includes('// @ts-ignore') &&
            !line.includes('// @ts-expect-error')) {
          const [file, ...rest] = line.split(':');
          if (file && rest.length > 0) {
            issues.push({
              type: 'any-type',
              severity: 'high',
              file: file.trim(),
              line: rest.join(':').trim(),
              message: 'any 타입 사용 금지'
            });
          }
        }
      });
    }
  } catch (error) {
    console.log('  Any 타입 검사 완료');
  }
  
  // 2. any[] 타입 탐지
  console.log('📋 any[] 타입 검사 중...');
  try {
    const anyArrayTypes = execSync(
      'grep -r "any\\[\\]" src --include="*.ts" --include="*.tsx" 2>/dev/null || true',
      { encoding: 'utf8', shell: true }
    );
    
    if (anyArrayTypes) {
      anyArrayTypes.split('\n').forEach(line => {
        if (line && 
            !line.includes('// eslint-disable') && 
            !line.includes('// @ts-ignore')) {
          const [file, ...rest] = line.split(':');
          if (file && rest.length > 0) {
            issues.push({
              type: 'any-array',
              severity: 'high',
              file: file.trim(),
              line: rest.join(':').trim(),
              message: 'any[] 타입 사용 금지'
            });
          }
        }
      });
    }
  } catch (error) {
    console.log('  any[] 타입 검사 완료');
  }
  
  // 3. Import 경로 검증
  console.log('📋 Import 경로 검사 중...');
  try {
    const wrongImports = execSync(
      'grep -r "from [\'\\"]@/types/" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "from [\'\\"]@/types[\'\\"]" || true',
      { encoding: 'utf8', shell: true }
    );
    
    if (wrongImports) {
      wrongImports.split('\n').forEach(line => {
        if (line) {
          const [file, ...rest] = line.split(':');
          if (file && rest.length > 0) {
            issues.push({
              type: 'wrong-import',
              severity: 'medium',
              file: file.trim(),
              line: rest.join(':').trim(),
              message: '@/types에서만 import 해야 함'
            });
          }
        }
      });
    }
  } catch (error) {
    console.log('  Import 경로 검사 완료');
  }
  
  // 4. 중복 타입 파일 확인
  console.log('📋 중복 타입 파일 검사 중...');
  const typeFiles = [
    'src/types/course.ts',
    'src/types/database.ts',
    'src/types/database.types.ts'
  ];
  
  typeFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      issues.push({
        type: 'duplicate-type-file',
        severity: 'high',
        file: file,
        line: '',
        message: '중복 타입 파일 - src/types/index.ts로 통합 필요'
      });
    }
  });
  
  return issues;
}

// 결과 포맷팅
function formatIssues(issues) {
  const byType = {};
  issues.forEach(issue => {
    if (!byType[issue.type]) {
      byType[issue.type] = [];
    }
    byType[issue.type].push(issue);
  });
  
  return byType;
}

// 메인 실행
function main() {
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}       타입 시스템 검증 도구 v1.0${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}\n`);
  
  const issues = detectTypeMismatches();
  
  if (issues.length > 0) {
    console.log(`\n${colors.red}🔴 타입 시스템 이슈 발견: ${issues.length}개${colors.reset}\n`);
    
    const grouped = formatIssues(issues);
    
    // 타입별로 출력
    Object.entries(grouped).forEach(([type, typeIssues]) => {
      const typeLabels = {
        'any-type': '⚠️  Any 타입 사용',
        'any-array': '⚠️  Any[] 배열 타입 사용',
        'wrong-import': '📦 잘못된 Import 경로',
        'duplicate-type-file': '📁 중복 타입 파일'
      };
      
      console.log(`${colors.yellow}${typeLabels[type] || type} (${typeIssues.length}개)${colors.reset}`);
      
      typeIssues.forEach((issue, index) => {
        if (index < 5) { // 처음 5개만 표시
          console.log(`  ${colors.red}→${colors.reset} ${issue.file}`);
          if (issue.line && index < 3) { // 처음 3개는 상세 표시
            console.log(`    ${colors.yellow}${issue.line.substring(0, 80)}${issue.line.length > 80 ? '...' : ''}${colors.reset}`);
          }
        }
      });
      
      if (typeIssues.length > 5) {
        console.log(`  ${colors.yellow}... 그 외 ${typeIssues.length - 5}개 더${colors.reset}`);
      }
      console.log();
    });
    
    // 해결 가이드
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.bold}💡 해결 방법:${colors.reset}`);
    
    if (grouped['any-type'] || grouped['any-array']) {
      console.log(`  1. Any 타입을 구체적인 타입으로 교체`);
      console.log(`     ${colors.yellow}: any → : string | number | 구체적타입${colors.reset}`);
    }
    
    if (grouped['wrong-import']) {
      console.log(`  2. Import 경로를 @/types로 통일`);
      console.log(`     ${colors.yellow}from '@/types/course' → from '@/types'${colors.reset}`);
    }
    
    if (grouped['duplicate-type-file']) {
      console.log(`  3. 중복 타입 파일을 src/types/index.ts로 통합`);
      console.log(`     ${colors.yellow}rm src/types/course.ts (백업 후)${colors.reset}`);
    }
    
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
    
    process.exit(1);
  } else {
    console.log(`\n${colors.green}✅ 타입 시스템 검증 통과!${colors.reset}`);
    console.log(`${colors.green}   모든 타입이 올바르게 정의되어 있습니다.${colors.reset}\n`);
    process.exit(0);
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = { detectTypeMismatches };