#!/usr/bin/env node

/**
 * snake_case/camelCase 일관성 검증 스크립트
 * React/라이브러리 필드 보호 및 API 경계 변환 검증
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 검증 결과 통계
const stats = {
  totalFiles: 0,
  filesWithIssues: 0,
  displayNameIssues: 0,
  jsxAttributeIssues: 0,
  apiClientUsageIssues: 0,
  conversionBoundaryIssues: 0,
  errors: []
};

// React/라이브러리 예약어
const RESERVED_REACT_PROPS = [
  'displayName', 'className', 'htmlFor', 'onClick', 'onChange',
  'onSubmit', 'onFocus', 'onBlur', 'defaultValue', 'defaultChecked',
  'autoComplete', 'autoFocus', 'readOnly', 'tabIndex', 'colSpan', 'rowSpan'
];

// snake_case 버전의 예약어 (이것들이 있으면 안됨)
const FORBIDDEN_SNAKE_PROPS = [
  'display_name', 'class_name', 'html_for', 'on_click', 'on_change',
  'on_submit', 'on_focus', 'on_blur', 'default_value', 'default_checked',
  'auto_complete', 'auto_focus', 'read_only', 'tab_index', 'col_span', 'row_span'
];

console.log('🔍 snake_case/camelCase 일관성 검증 시작...\n');

// 1. React 컴포넌트에서 display_name 오염 검사
function checkDisplayNamePollution() {
  console.log('📋 Step 1/5: React 컴포넌트 displayName 검사...');
  
  const componentFiles = glob.sync('src/**/*.{tsx,ts}', { 
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']
  });
  
  componentFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // .display_name 패턴 검사
      if (line.match(/\.display_name\b/)) {
        stats.displayNameIssues++;
        stats.errors.push({
          file,
          line: index + 1,
          type: 'display_name',
          message: `display_name 사용 감지 (displayName을 사용해야 함)`,
          code: line.trim()
        });
      }
    });
    
    stats.totalFiles++;
  });
  
  if (stats.displayNameIssues === 0) {
    console.log('  ✅ displayName 정상 (오염 없음)');
  } else {
    console.log(`  ❌ display_name 오염 발견: ${stats.displayNameIssues}건`);
  }
}

// 2. JSX 속성에서 snake_case 패턴 검사
function checkJSXAttributes() {
  console.log('\n📋 Step 2/5: JSX 속성 snake_case 검사...');
  
  const tsxFiles = glob.sync('src/**/*.tsx', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']
  });
  
  tsxFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      FORBIDDEN_SNAKE_PROPS.forEach(prop => {
        const regex = new RegExp(`\\b${prop}[=\\s]`, 'g');
        if (regex.test(line)) {
          stats.jsxAttributeIssues++;
          const camelCase = prop.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          stats.errors.push({
            file,
            line: index + 1,
            type: 'jsx_attribute',
            message: `snake_case JSX 속성 '${prop}' 사용 ('${camelCase}' 사용 필요)`,
            code: line.trim()
          });
        }
      });
    });
  });
  
  if (stats.jsxAttributeIssues === 0) {
    console.log('  ✅ JSX 속성 정상 (camelCase 사용)');
  } else {
    console.log(`  ❌ snake_case JSX 속성 발견: ${stats.jsxAttributeIssues}건`);
  }
}

// 3. API 클라이언트 사용 검증
function checkAPIClientUsage() {
  console.log('\n📋 Step 3/5: API 클라이언트 사용 패턴 검사...');
  
  const apiRoutes = glob.sync('src/app/api/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**']
  });
  
  let directFetchCount = 0;
  let apiClientUsageCount = 0;
  
  apiRoutes.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Direct fetch 사용 검사 (외부 API 제외)
    if (content.match(/fetch\s*\(\s*['"`](?!http)/)) {
      directFetchCount++;
      stats.apiClientUsageIssues++;
      stats.errors.push({
        file,
        type: 'direct_fetch',
        message: 'fetch() 직접 사용 감지 (api-client.ts 사용 필요)',
      });
    }
    
    // api-client 사용 확인
    if (content.includes('@/lib/api-client')) {
      apiClientUsageCount++;
    }
  });
  
  console.log(`  📊 API Routes: ${apiRoutes.length}개`);
  console.log(`  📊 api-client 사용: ${apiClientUsageCount}개`);
  
  if (directFetchCount === 0) {
    console.log('  ✅ API 클라이언트 사용 정상');
  } else {
    console.log(`  ⚠️  직접 fetch() 사용: ${directFetchCount}건`);
  }
}

// 4. 변환 경계 레이어 검증
function checkConversionBoundary() {
  console.log('\n📋 Step 4/5: snake_case/camelCase 변환 경계 검사...');
  
  // api-client.ts 파일 확인
  const apiClientPath = path.join('src', 'lib', 'api-client.ts');
  if (fs.existsSync(apiClientPath)) {
    const content = fs.readFileSync(apiClientPath, 'utf8');
    
    const hasSnakeToCamel = content.includes('snakeToCamelCase');
    const hasCamelToSnake = content.includes('camelToSnakeCase');
    const hasSkipConversion = content.includes('skipCaseConversion');
    
    if (hasSnakeToCamel && hasCamelToSnake && hasSkipConversion) {
      console.log('  ✅ API 클라이언트 변환 로직 구현됨');
    } else {
      console.log('  ⚠️  API 클라이언트 변환 로직 불완전');
      if (!hasSnakeToCamel) console.log('    - snakeToCamelCase 누락');
      if (!hasCamelToSnake) console.log('    - camelToSnakeCase 누락');
      if (!hasSkipConversion) console.log('    - skipCaseConversion 옵션 누락');
      stats.conversionBoundaryIssues++;
    }
  } else {
    console.log('  ❌ api-client.ts 파일 없음');
    stats.conversionBoundaryIssues++;
  }
  
  // case-converter.ts 파일 확인
  const converterPath = path.join('src', 'lib', 'utils', 'case-converter.ts');
  if (fs.existsSync(converterPath)) {
    const content = fs.readFileSync(converterPath, 'utf8');
    
    const hasReservedKeys = content.includes('RESERVED_KEYS');
    const hasReactCheck = content.includes('isReactProperty');
    
    if (hasReservedKeys && hasReactCheck) {
      console.log('  ✅ 변환 유틸리티 React 보호 로직 구현됨');
    } else {
      console.log('  ⚠️  변환 유틸리티 React 보호 로직 불완전');
      stats.conversionBoundaryIssues++;
    }
  } else {
    console.log('  ❌ case-converter.ts 파일 없음');
    stats.conversionBoundaryIssues++;
  }
}

// 5. Pre-commit Hook 검증
function checkPreCommitHook() {
  console.log('\n📋 Step 5/5: Pre-commit Hook 설정 검사...');
  
  const hookPath = path.join('.husky', 'pre-commit');
  if (fs.existsSync(hookPath)) {
    const content = fs.readFileSync(hookPath, 'utf8');
    
    const hasDisplayNameCheck = content.includes('display_name');
    const hasSnakeCaseCheck = content.includes('class_name\\|html_for\\|on_click');
    
    if (hasDisplayNameCheck && hasSnakeCaseCheck) {
      console.log('  ✅ Pre-commit Hook snake_case 검사 구현됨');
    } else {
      console.log('  ⚠️  Pre-commit Hook 검사 불완전');
      if (!hasDisplayNameCheck) console.log('    - display_name 검사 누락');
      if (!hasSnakeCaseCheck) console.log('    - JSX snake_case 속성 검사 누락');
    }
  } else {
    console.log('  ❌ Pre-commit Hook 파일 없음');
  }
}

// 검증 실행
checkDisplayNamePollution();
checkJSXAttributes();
checkAPIClientUsage();
checkConversionBoundary();
checkPreCommitHook();

// 결과 출력
console.log('\n' + '='.repeat(60));
console.log('📊 검증 결과 요약');
console.log('='.repeat(60));

const totalIssues = stats.displayNameIssues + stats.jsxAttributeIssues + 
                   stats.apiClientUsageIssues + stats.conversionBoundaryIssues;

console.log(`\n검사한 파일: ${stats.totalFiles}개`);
console.log(`발견된 이슈: ${totalIssues}개`);
console.log(`  - display_name 오염: ${stats.displayNameIssues}건`);
console.log(`  - snake_case JSX 속성: ${stats.jsxAttributeIssues}건`);
console.log(`  - API 클라이언트 미사용: ${stats.apiClientUsageIssues}건`);
console.log(`  - 변환 경계 이슈: ${stats.conversionBoundaryIssues}건`);

// 상세 오류 출력
if (stats.errors.length > 0) {
  console.log('\n' + '='.repeat(60));
  console.log('❌ 발견된 문제 상세');
  console.log('='.repeat(60));
  
  stats.errors.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.type}`);
    console.log(`   파일: ${error.file}${error.line ? `:${error.line}` : ''}`);
    console.log(`   문제: ${error.message}`);
    if (error.code) {
      console.log(`   코드: ${error.code}`);
    }
  });
  
  console.log('\n💡 수정 방법:');
  console.log('  1. display_name → displayName으로 변경');
  console.log('  2. snake_case JSX 속성 → camelCase로 변경');
  console.log('  3. fetch() 직접 사용 → api-client.ts 함수 사용');
  console.log('  4. 변환 로직 누락 → case-converter.ts 확인');
}

// 최종 상태
console.log('\n' + '='.repeat(60));
if (totalIssues === 0) {
  console.log('✅ 모든 검증 통과! snake_case/camelCase 일관성 유지됨');
  process.exit(0);
} else {
  console.log(`⚠️  ${totalIssues}개 이슈 발견 - 수정 필요`);
  process.exit(1);
}