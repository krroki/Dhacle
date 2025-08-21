#!/usr/bin/env node

/**
 * TypeScript 타입 제안 도구
 * Wave 3: 스마트 자동화 구축
 * 
 * 목적:
 * - 타입 문제에 대한 구체적 해결책 제안
 * - 파일별 맞춤형 수정 가이드 제공
 * - 안전한 수동 수정 유도
 * 
 * 사용법: node scripts/type-suggester.js [파일경로]
 */

const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// 타입 제안 생성
function suggestFixes(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`${colors.red}❌ 파일을 찾을 수 없습니다: ${filePath}${colors.reset}`);
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const suggestions = [];
  const fileName = path.basename(filePath);
  
  // 1. Any 타입 분석 및 제안
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // : any 패턴
    if (line.includes(': any') && !line.includes('// eslint-disable')) {
      const context = extractContext(line);
      suggestions.push({
        line: lineNum,
        issue: 'any 타입 사용',
        code: line.trim(),
        severity: 'high',
        suggestion: generateTypeSuggestion(context, line),
        example: generateTypeExample(context)
      });
    }
    
    // any[] 패턴
    if (line.includes('any[]')) {
      const context = extractContext(line);
      suggestions.push({
        line: lineNum,
        issue: 'any[] 배열 타입 사용',
        code: line.trim(),
        severity: 'high',
        suggestion: `구체적 배열 타입 사용: ${inferArrayType(context)}[]`,
        example: `${context.varName}: ${inferArrayType(context)}[]`
      });
    }
    
    // as any 패턴
    if (line.includes('as any')) {
      suggestions.push({
        line: lineNum,
        issue: 'as any 타입 캐스팅',
        code: line.trim(),
        severity: 'medium',
        suggestion: '타입 가드 또는 구체적 타입 캐스팅 사용',
        example: 'as SpecificType 또는 타입 가드 함수 사용'
      });
    }
  });
  
  // 2. Import 경로 분석
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // 잘못된 import 경로
    if (line.includes("from '@/types/") && !line.includes("from '@/types'")) {
      const match = line.match(/from ['"](@\/types\/[^'"]+)['"]/);
      if (match) {
        suggestions.push({
          line: lineNum,
          issue: '잘못된 import 경로',
          code: line.trim(),
          severity: 'medium',
          suggestion: '@/types에서 통합 import',
          example: line.replace(match[1], '@/types')
        });
      }
    }
    
    // 직접 database.generated import
    if (line.includes("from '@/types/database.generated'")) {
      suggestions.push({
        line: lineNum,
        issue: 'database.generated.ts 직접 import',
        code: line.trim(),
        severity: 'high',
        suggestion: '@/types/index.ts를 통해 import',
        example: line.replace('@/types/database.generated', '@/types')
      });
    }
  });
  
  // 3. 타입 정의 중복 확인
  const typeDefinitions = findTypeDefinitions(content);
  if (typeDefinitions.duplicates.length > 0) {
    typeDefinitions.duplicates.forEach(dup => {
      suggestions.push({
        line: dup.line,
        issue: '중복 타입 정의',
        code: dup.code,
        severity: 'medium',
        suggestion: 'src/types/index.ts의 타입 사용',
        example: `import { ${dup.name} } from '@/types';`
      });
    });
  }
  
  return suggestions;
}

// 컨텍스트 추출
function extractContext(line) {
  const varMatch = line.match(/(\w+)\s*:\s*any/);
  const funcMatch = line.match(/function\s+(\w+)/);
  const paramMatch = line.match(/\(([^)]*any[^)]*)\)/);
  
  return {
    varName: varMatch ? varMatch[1] : null,
    funcName: funcMatch ? funcMatch[1] : null,
    hasParams: !!paramMatch,
    isAsync: line.includes('async'),
    isState: line.includes('useState'),
    isProps: line.includes('Props') || line.includes('props')
  };
}

// 타입 제안 생성
function generateTypeSuggestion(context, line) {
  if (context.isState) {
    return 'useState에 제네릭 타입 지정: useState<Type>(initialValue)';
  }
  
  if (context.isProps) {
    return '컴포넌트 Props 인터페이스 정의';
  }
  
  if (context.varName) {
    // 변수명 기반 타입 추론
    const varName = context.varName.toLowerCase();
    
    if (varName.includes('id')) return 'string 타입 사용';
    if (varName.includes('count') || varName.includes('number')) return 'number 타입 사용';
    if (varName.includes('name') || varName.includes('title')) return 'string 타입 사용';
    if (varName.includes('is') || varName.includes('has')) return 'boolean 타입 사용';
    if (varName.includes('data')) return '구체적 데이터 인터페이스 정의';
    if (varName.includes('user')) return 'User 타입 import 및 사용';
    if (varName.includes('course')) return 'Course 타입 import 및 사용';
    if (varName.includes('lesson')) return 'Lesson 타입 import 및 사용';
  }
  
  return '구체적 타입으로 교체 (string | number | boolean | 커스텀 타입)';
}

// 타입 예제 생성
function generateTypeExample(context) {
  if (context.isState) {
    return 'const [data, setData] = useState<DataType | null>(null);';
  }
  
  if (context.isProps) {
    return `interface ComponentProps {\n  ${context.varName || 'prop'}: string;\n}`;
  }
  
  if (context.varName) {
    const varName = context.varName.toLowerCase();
    
    if (varName.includes('id')) return `${context.varName}: string`;
    if (varName.includes('count')) return `${context.varName}: number`;
    if (varName.includes('is') || varName.includes('has')) return `${context.varName}: boolean`;
    if (varName.includes('user')) return `${context.varName}: User`;
    if (varName.includes('data')) return `${context.varName}: DataType | null`;
  }
  
  return ': string | number | CustomType';
}

// 배열 타입 추론
function inferArrayType(context) {
  if (!context.varName) return 'unknown';
  
  const varName = context.varName.toLowerCase();
  
  if (varName.includes('user')) return 'User';
  if (varName.includes('course')) return 'Course';
  if (varName.includes('lesson')) return 'Lesson';
  if (varName.includes('item')) return 'Item';
  if (varName.includes('id')) return 'string';
  if (varName.includes('number')) return 'number';
  
  return 'CustomType';
}

// 타입 정의 찾기
function findTypeDefinitions(content) {
  const definitions = [];
  const duplicates = [];
  const knownTypes = ['User', 'Course', 'Lesson', 'CourseProgress', 'CommunityPost'];
  
  // interface, type alias 찾기
  const typeRegex = /(?:interface|type)\s+(\w+)/g;
  let match;
  let lineNum = 1;
  
  content.split('\n').forEach((line, index) => {
    if (line.match(/(?:interface|type)\s+(\w+)/)) {
      const typeName = line.match(/(?:interface|type)\s+(\w+)/)[1];
      definitions.push({
        name: typeName,
        line: index + 1,
        code: line.trim()
      });
      
      if (knownTypes.includes(typeName)) {
        duplicates.push({
          name: typeName,
          line: index + 1,
          code: line.trim()
        });
      }
    }
  });
  
  return { definitions, duplicates };
}

// 결과 출력
function displaySuggestions(filePath, suggestions) {
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}       타입 제안 도구 v1.0${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.magenta}📁 파일: ${filePath}${colors.reset}\n`);
  
  if (suggestions.length === 0) {
    console.log(`${colors.green}✅ 타입 관련 이슈가 없습니다!${colors.reset}\n`);
    return;
  }
  
  console.log(`${colors.yellow}🔍 발견된 이슈: ${suggestions.length}개${colors.reset}\n`);
  
  // 심각도별 그룹화
  const bySeverity = {
    high: suggestions.filter(s => s.severity === 'high'),
    medium: suggestions.filter(s => s.severity === 'medium'),
    low: suggestions.filter(s => s.severity === 'low')
  };
  
  // 높은 심각도부터 출력
  ['high', 'medium', 'low'].forEach(severity => {
    const items = bySeverity[severity];
    if (items.length === 0) return;
    
    const severityColors = {
      high: colors.red,
      medium: colors.yellow,
      low: colors.blue
    };
    
    const severityLabels = {
      high: '🔴 높음',
      medium: '🟡 중간',
      low: '🔵 낮음'
    };
    
    console.log(`${severityColors[severity]}${severityLabels[severity]} (${items.length}개)${colors.reset}`);
    
    items.forEach((item, index) => {
      if (index < 5) { // 각 심각도별 최대 5개
        console.log(`\n  ${colors.dim}Line ${item.line}:${colors.reset} ${item.issue}`);
        console.log(`  ${colors.dim}코드:${colors.reset} ${item.code.substring(0, 60)}${item.code.length > 60 ? '...' : ''}`);
        console.log(`  ${colors.green}✨ 제안:${colors.reset} ${item.suggestion}`);
        if (item.example) {
          console.log(`  ${colors.blue}📝 예시:${colors.reset} ${item.example}`);
        }
      }
    });
    
    if (items.length > 5) {
      console.log(`\n  ${colors.dim}... 그 외 ${items.length - 5}개 더${colors.reset}`);
    }
    console.log();
  });
  
  // 수정 가이드
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bold}🛠️  수정 가이드${colors.reset}\n`);
  
  console.log(`1. ${colors.yellow}각 제안을 파일 컨텍스트와 함께 검토${colors.reset}`);
  console.log(`2. ${colors.yellow}구체적 타입으로 점진적 교체${colors.reset}`);
  console.log(`3. ${colors.yellow}import 경로를 @/types로 통일${colors.reset}`);
  console.log(`4. ${colors.yellow}수정 후 npm run build로 검증${colors.reset}\n`);
  
  console.log(`${colors.bold}⚠️  주의사항:${colors.reset}`);
  console.log(`- 자동 수정 스크립트 사용 금지`);
  console.log(`- 파일별 컨텍스트 이해 필수`);
  console.log(`- 각 수정 후 즉시 테스트\n`);
}

// 메인 실행
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`${colors.bold}사용법:${colors.reset} node scripts/type-suggester.js <파일경로>\n`);
    console.log(`${colors.bold}예시:${colors.reset}`);
    console.log(`  node scripts/type-suggester.js src/lib/api/courses.ts`);
    console.log(`  node scripts/type-suggester.js src/app/page.tsx\n`);
    
    console.log(`${colors.bold}기능:${colors.reset}`);
    console.log(`  - any 타입 사용 위치별 구체적 제안`);
    console.log(`  - import 경로 수정 제안`);
    console.log(`  - 중복 타입 정의 감지`);
    console.log(`  - 컨텍스트 기반 타입 추론\n`);
    
    process.exit(0);
  }
  
  const filePath = path.resolve(args[0]);
  const suggestions = suggestFixes(filePath);
  displaySuggestions(filePath, suggestions);
}

// 실행
if (require.main === module) {
  main();
}

module.exports = { suggestFixes };