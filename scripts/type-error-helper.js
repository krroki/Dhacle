#!/usr/bin/env node

/**
 * 🎯 타입 오류 도움말 시스템
 * 
 * TypeScript 오류를 분석하고 구체적인 해결 방법을 제시합니다.
 * 개발 지식이 없는 사용자도 이해할 수 있는 메시지를 제공합니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// 이모지
const emoji = {
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  success: '✅',
  fix: '🔧',
  tip: '💡',
  doc: '📖',
  code: '💻',
  question: '❓',
  arrow: '→'
};

class TypeErrorHelper {
  constructor() {
    this.errorPatterns = this.initializeErrorPatterns();
  }

  // 오류 패턴과 해결책 매핑
  initializeErrorPatterns() {
    return [
      {
        code: 'TS2304',
        pattern: /Cannot find name '(\w+)'/,
        title: '타입/변수를 찾을 수 없음',
        getMessage: (match) => `'${match[1]}' 이름을 찾을 수 없습니다`,
        solutions: [
          'import 문이 빠졌을 수 있습니다',
          'npm run types:auto-fix 실행해보세요',
          '변수명 오타를 확인하세요'
        ],
        example: `import { ${match => match[1]} } from '@/types';`,
        autoFixCommand: 'npm run types:auto-fix'
      },
      {
        code: 'TS2339',
        pattern: /Property '(\w+)' does not exist on type '(.+)'/,
        title: '속성이 존재하지 않음',
        getMessage: (match) => `'${match[2]}' 타입에 '${match[1]}' 속성이 없습니다`,
        solutions: [
          'snake_case와 camelCase 차이일 수 있습니다',
          'DB 필드명과 다를 수 있습니다',
          'npm run types:auto-fix로 자동 변환 시도'
        ],
        example: (match) => {
          const snakeCase = match[1].replace(/([A-Z])/g, '_$1').toLowerCase();
          return `혹시 '${snakeCase}' 또는 '${match[1]}' 중 하나를 사용해야 할까요?`;
        },
        autoFixCommand: 'npm run types:auto-fix'
      },
      {
        code: 'TS2322',
        pattern: /Type '(.+)' is not assignable to type '(.+)'/,
        title: '타입이 일치하지 않음',
        getMessage: (match) => `'${match[1]}' 타입을 '${match[2]}' 타입에 할당할 수 없습니다`,
        solutions: [
          '타입을 명시적으로 지정해보세요',
          'as 키워드로 타입 단언을 사용해보세요',
          'null 또는 undefined 체크가 필요할 수 있습니다'
        ],
        example: (match) => `const value = data as ${match[2]};`,
        autoFixCommand: null
      },
      {
        code: 'TS2532',
        pattern: /Object is possibly '(null|undefined)'/,
        title: '값이 null/undefined일 수 있음',
        getMessage: () => '객체가 null 또는 undefined일 수 있습니다',
        solutions: [
          '옵셔널 체이닝(?.)을 사용하세요',
          'if 문으로 null 체크를 추가하세요',
          '기본값을 제공하세요'
        ],
        example: () => `object?.property 또는 object ?? defaultValue`,
        autoFixCommand: 'npm run types:auto-fix'
      },
      {
        code: 'TS7006',
        pattern: /Parameter '(\w+)' implicitly has an 'any' type/,
        title: '파라미터에 타입이 없음',
        getMessage: (match) => `'${match[1]}' 파라미터에 타입을 지정해야 합니다`,
        solutions: [
          '명시적으로 타입을 추가하세요',
          ': string, : number, : boolean 등을 사용하세요',
          '복잡한 타입은 interface를 정의하세요'
        ],
        example: (match) => `function example(${match[1]}: string) { ... }`,
        autoFixCommand: 'npm run types:auto-fix'
      },
      {
        code: 'TS2307',
        pattern: /Cannot find module '(.+)' or its corresponding type declarations/,
        title: '모듈을 찾을 수 없음',
        getMessage: (match) => `'${match[1]}' 모듈을 찾을 수 없습니다`,
        solutions: [
          '패키지가 설치되어 있는지 확인하세요',
          'npm install로 패키지를 설치하세요',
          '경로가 올바른지 확인하세요',
          '@types/ 패키지가 필요할 수 있습니다'
        ],
        example: (match) => `npm install ${match[1]}`,
        autoFixCommand: null
      },
      {
        code: 'TS2345',
        pattern: /Argument of type '(.+)' is not assignable to parameter of type '(.+)'/,
        title: '함수 인자 타입 불일치',
        getMessage: (match) => `'${match[1]}' 타입의 인자를 '${match[2]}' 타입 파라미터에 전달할 수 없습니다`,
        solutions: [
          '인자의 타입을 확인하세요',
          '타입 변환이 필요할 수 있습니다',
          'null/undefined 체크가 필요할 수 있습니다'
        ],
        example: (match) => `함수에 ${match[2]} 타입을 전달하세요`,
        autoFixCommand: null
      },
      {
        code: 'TS18048',
        pattern: /'(\w+)' is possibly 'undefined'/,
        title: '값이 undefined일 수 있음',
        getMessage: (match) => `'${match[1]}'이(가) undefined일 수 있습니다`,
        solutions: [
          '옵셔널 체이닝(?.)을 사용하세요',
          '기본값을 제공하세요',
          'if 문으로 체크하세요'
        ],
        example: (match) => `${match[1]}?.property 또는 ${match[1]} || defaultValue`,
        autoFixCommand: 'npm run types:auto-fix'
      },
      {
        code: 'TS2551',
        pattern: /Property '(\w+)' does not exist on type '(.+)'. Did you mean '(\w+)'/,
        title: '속성명 오타',
        getMessage: (match) => `'${match[1]}' 대신 '${match[3]}'을(를) 사용하려고 했나요?`,
        solutions: (match) => [
          `'${match[3]}'으로 변경하세요`,
          '자동 완성을 사용하세요',
          'VS Code의 Quick Fix를 사용하세요'
        ],
        example: (match) => `object.${match[3]}`,
        autoFixCommand: 'npm run types:auto-fix'
      }
    ];
  }

  // 오류 분석 및 도움말 생성
  analyzeError(error) {
    const pattern = this.errorPatterns.find(p => 
      p.code === error.code || 
      (p.pattern && p.pattern.test(error.message))
    );

    if (!pattern) {
      return this.getGenericHelp(error);
    }

    const match = pattern.pattern ? error.message.match(pattern.pattern) : null;
    
    return {
      title: pattern.title,
      message: pattern.getMessage ? pattern.getMessage(match) : error.message,
      solutions: typeof pattern.solutions === 'function' ? pattern.solutions(match) : pattern.solutions,
      example: typeof pattern.example === 'function' ? pattern.example(match) : pattern.example,
      autoFixCommand: pattern.autoFixCommand,
      original: error
    };
  }

  // 일반적인 도움말
  getGenericHelp(error) {
    return {
      title: 'TypeScript 오류',
      message: error.message,
      solutions: [
        'npm run types:auto-fix를 실행해보세요',
        'npm run types:check로 전체 오류를 확인하세요',
        'VS Code에서 파일을 열어 Quick Fix를 사용하세요'
      ],
      example: null,
      autoFixCommand: 'npm run types:auto-fix',
      original: error
    };
  }

  // 오류 수집
  collectErrors() {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return [];
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : '';
      const errors = [];
      const lines = output.split('\n');
      
      for (const line of lines) {
        const errorMatch = line.match(/(.+)\((\d+),(\d+)\): error (TS\d+): (.+)/);
        if (errorMatch) {
          errors.push({
            file: errorMatch[1].trim(),
            line: parseInt(errorMatch[2]),
            column: parseInt(errorMatch[3]),
            code: errorMatch[4],
            message: errorMatch[5]
          });
        }
      }
      
      return errors;
    }
  }

  // 도움말 출력
  printHelp(helpInfo) {
    console.log('');
    console.log(`${colors.red}${emoji.error} ${colors.bold}${helpInfo.title}${colors.reset}`);
    console.log(`${colors.dim}${helpInfo.original.file}:${helpInfo.original.line}:${helpInfo.original.column}${colors.reset}`);
    console.log('');
    
    console.log(`${colors.yellow}${emoji.warning} 문제:${colors.reset}`);
    console.log(`  ${helpInfo.message}`);
    console.log('');
    
    console.log(`${colors.green}${emoji.fix} 해결 방법:${colors.reset}`);
    helpInfo.solutions.forEach((solution, index) => {
      console.log(`  ${index + 1}. ${solution}`);
    });
    console.log('');
    
    if (helpInfo.example) {
      console.log(`${colors.cyan}${emoji.code} 예시:${colors.reset}`);
      console.log(`  ${colors.dim}${helpInfo.example}${colors.reset}`);
      console.log('');
    }
    
    if (helpInfo.autoFixCommand) {
      console.log(`${colors.magenta}${emoji.tip} 자동 수정:${colors.reset}`);
      console.log(`  ${colors.bold}${helpInfo.autoFixCommand}${colors.reset}`);
      console.log('');
    }
    
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
  }

  // 요약 출력
  printSummary(errors, helpInfos) {
    console.log('');
    console.log(`${colors.cyan}${colors.bold}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}📊 타입 오류 요약${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log('');
    
    // 오류 타입별 집계
    const errorTypes = {};
    helpInfos.forEach(help => {
      errorTypes[help.title] = (errorTypes[help.title] || 0) + 1;
    });
    
    console.log(`${colors.yellow}${emoji.info} 오류 유형:${colors.reset}`);
    Object.entries(errorTypes).forEach(([type, count]) => {
      console.log(`  • ${type}: ${count}개`);
    });
    console.log('');
    
    // 자동 수정 가능 여부
    const autoFixable = helpInfos.filter(h => h.autoFixCommand).length;
    const manual = helpInfos.length - autoFixable;
    
    console.log(`${colors.green}${emoji.success} 자동 수정 가능: ${autoFixable}개${colors.reset}`);
    console.log(`${colors.yellow}${emoji.warning} 수동 수정 필요: ${manual}개${colors.reset}`);
    console.log('');
    
    // 추천 액션
    console.log(`${colors.blue}${emoji.arrow} 추천 단계:${colors.reset}`);
    if (autoFixable > 0) {
      console.log(`  1. ${colors.bold}npm run types:auto-fix${colors.reset} 실행`);
      console.log(`  2. 남은 오류 수동 수정`);
      console.log(`  3. ${colors.bold}npm run types:check${colors.reset}로 재확인`);
    } else if (manual > 0) {
      console.log(`  1. VS Code에서 각 파일 열기`);
      console.log(`  2. Quick Fix (Ctrl+.) 사용`);
      console.log(`  3. 위 해결 방법 참고하여 수정`);
    }
    console.log('');
    
    // Claude Code 안내
    console.log(`${colors.magenta}${emoji.doc} Claude Code 사용자:${colors.reset}`);
    console.log(`  "${colors.bold}타입 오류 수정해줘${colors.reset}"라고 요청하세요`);
    console.log('');
  }

  // 메인 실행
  async run() {
    console.log(`${colors.cyan}${colors.bold}🎯 타입 오류 도움말 시스템${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    
    const errors = this.collectErrors();
    
    if (errors.length === 0) {
      console.log('');
      console.log(`${colors.green}${emoji.success} ${colors.bold}타입 오류가 없습니다!${colors.reset}`);
      console.log('');
      return;
    }
    
    console.log('');
    console.log(`${colors.red}${emoji.error} ${errors.length}개의 타입 오류 발견${colors.reset}`);
    console.log('');
    
    const helpInfos = [];
    
    // 각 오류에 대한 도움말 출력
    errors.forEach((error, index) => {
      if (index < 10) { // 처음 10개만 상세 출력
        const helpInfo = this.analyzeError(error);
        helpInfos.push(helpInfo);
        this.printHelp(helpInfo);
      }
    });
    
    if (errors.length > 10) {
      console.log(`${colors.dim}... 그리고 ${errors.length - 10}개 더${colors.reset}`);
      console.log('');
    }
    
    // 요약 출력
    this.printSummary(errors, helpInfos);
  }
}

// 실행
const helper = new TypeErrorHelper();
helper.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});