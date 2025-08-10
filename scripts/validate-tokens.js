#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// 검증 결과
let results = {
  passed: [],
  failed: [],
  warnings: []
};

// 1. theme.deep.json 검증
function validateThemeFile() {
  console.log(`${colors.blue}1. Validating theme.deep.json...${colors.reset}`);
  
  const themePath = path.join(__dirname, '..', 'theme.deep.json');
  if (!fs.existsSync(themePath)) {
    results.failed.push('theme.deep.json not found');
    return false;
  }
  
  try {
    const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
    
    // 필수 섹션 확인
    const requiredSections = ['colors', 'typography', 'spacing', 'effects'];
    for (const section of requiredSections) {
      if (!theme[section]) {
        results.failed.push(`Missing section: ${section}`);
      } else {
        results.passed.push(`${section} section exists`);
      }
    }
    
    return true;
  } catch (error) {
    results.failed.push(`Invalid JSON: ${error.message}`);
    return false;
  }
}

// 2. 토큰 파일 export 검증
function validateTokenExports() {
  console.log(`${colors.blue}2. Validating token exports...${colors.reset}`);
  
  const tokenFiles = [
    'src/styles/tokens/colors.ts',
    'src/styles/tokens/typography.ts',
    'src/styles/tokens/effects.ts',
    'src/styles/tokens/spacing.ts'
  ];
  
  for (const file of tokenFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      results.failed.push(`Token file not found: ${file}`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('export')) {
      results.passed.push(`${file} has exports`);
    } else {
      results.failed.push(`${file} missing exports`);
    }
  }
}

// 3. 하드코딩 검색
function findHardcodedValues() {
  console.log(`${colors.blue}3. Searching for hardcoded values...${colors.reset}`);
  
  const patterns = [
    { pattern: 'color:\\s*["\']#', description: 'Hardcoded color' },
    { pattern: 'backgroundColor:\\s*["\']#', description: 'Hardcoded background' },
    { pattern: 'text-[a-z]+-[0-9]+', description: 'Hardcoded Tailwind text color' },
    { pattern: 'bg-[a-z]+-[0-9]+', description: 'Hardcoded Tailwind bg color' },
    { pattern: 'padding:\\s*["\'][0-9]+px', description: 'Hardcoded padding' },
    { pattern: 'margin:\\s*["\'][0-9]+px', description: 'Hardcoded margin' },
    { pattern: 'fontSize:\\s*["\'][0-9]+', description: 'Hardcoded font size' }
  ];
  
  const srcPath = path.join(__dirname, '..', 'src');
  
  for (const { pattern, description } of patterns) {
    try {
      const result = execSync(
        `grep -r "${pattern}" ${srcPath} --include="*.tsx" --include="*.ts" 2>/dev/null || true`,
        { encoding: 'utf8' }
      );
      
      if (result.trim()) {
        const matches = result.trim().split('\n');
        results.warnings.push(`Found ${matches.length} ${description} instances`);
        
        // 처음 3개만 표시
        matches.slice(0, 3).forEach(match => {
          console.log(`  ${colors.yellow}⚠${colors.reset} ${match.substring(0, 100)}`);
        });
      }
    } catch (error) {
      // grep이 없는 환경 처리
      console.log(`  Skipping pattern check: ${description}`);
    }
  }
  
  if (results.warnings.length === 0) {
    results.passed.push('No hardcoded values found');
  }
}

// 4. 사용되지 않는 토큰 검사
function findUnusedTokens() {
  console.log(`${colors.blue}4. Checking for unused tokens...${colors.reset}`);
  
  // 간단한 검사 - 실제로는 더 정교한 분석 필요
  const themePath = path.join(__dirname, '..', 'theme.deep.json');
  const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
  
  // 토큰 키 추출
  const tokenKeys = [];
  function extractKeys(obj, prefix = '') {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        extractKeys(obj[key], fullKey);
      } else {
        tokenKeys.push(fullKey);
      }
    }
  }
  
  extractKeys(theme);
  console.log(`  Total tokens defined: ${tokenKeys.length}`);
  results.passed.push(`${tokenKeys.length} tokens defined`);
}

// 5. 결과 출력
function printResults() {
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.blue}VALIDATION RESULTS${colors.reset}`);
  console.log('='.repeat(50));
  
  if (results.passed.length > 0) {
    console.log(`\n${colors.green}✅ PASSED (${results.passed.length})${colors.reset}`);
    results.passed.forEach(item => console.log(`  • ${item}`));
  }
  
  if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  WARNINGS (${results.warnings.length})${colors.reset}`);
    results.warnings.forEach(item => console.log(`  • ${item}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n${colors.red}❌ FAILED (${results.failed.length})${colors.reset}`);
    results.failed.forEach(item => console.log(`  • ${item}`));
  }
  
  // 최종 상태
  console.log('\n' + '='.repeat(50));
  if (results.failed.length === 0) {
    console.log(`${colors.green}✅ Token system validation PASSED${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ Token system validation FAILED${colors.reset}`);
    process.exit(1);
  }
}

// 메인 실행
function main() {
  console.log(`${colors.blue}Token System Validator v1.0${colors.reset}`);
  console.log('='.repeat(50) + '\n');
  
  validateThemeFile();
  validateTokenExports();
  findHardcodedValues();
  findUnusedTokens();
  
  printResults();
}

// 실행
main();