/sc:implement --seq --validate --think
"Phase 3: 실시간 규칙 위반 감지 시스템 구현"

# Phase 3: 실시간 규칙 위반 감지 시스템 구현

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (전체 읽기 필수)
- [ ] `.husky/pre-commit` - 현재 Hook 설정 확인
- [ ] 각 폴더별 CLAUDE.md 파일들 확인

### 프로젝트 금지사항 체크 ✅
- [ ] 기존 pre-commit 무단 변경 금지
- [ ] --write, --fix 플래그 사용 금지
- [ ] 자동 수정 기능 구현 금지
- [ ] 성능 저하 유발 금지

## 📌 Phase 정보
- **Phase 번호**: 3/4
- **선행 조건**: Phase 2 완료 (폴더별 CLAUDE.md 생성)
- **예상 시간**: 1시간
- **우선순위**: HIGH
- **작업 범위**: Git Hook, VS Code 태스크, 검증 스크립트

## 🎯 Phase 목표
1. Pre-commit Hook 강화
2. 폴더별 규칙 자동 검사
3. VS Code 태스크 설정
4. 실시간 피드백 시스템

## 📚 온보딩 섹션

### 이 Phase에 필요한 지식
- [ ] Git Hook 작동 원리
- [ ] Husky 설정 방법
- [ ] VS Code 태스크 시스템
- [ ] Node.js 스크립트 작성

### 작업 파일 경로
- `.husky/pre-commit` - Git Hook 설정
- `scripts/check-claude-rules.js` - 규칙 검사 스크립트
- `.vscode/tasks.json` - VS Code 태스크 설정

## 📝 작업 내용

### Step 1: 규칙 검사 스크립트 작성
`scripts/check-claude-rules.js` 파일 생성:

```javascript
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ClaudeRuleChecker {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.checkedFiles = 0;
  }

  // 파일이 속한 폴더의 CLAUDE.md 찾기
  findRelevantClaudeFile(filePath) {
    let dir = path.dirname(filePath);
    const claudeFiles = [];

    // 상위 폴더로 올라가며 CLAUDE.md 찾기
    while (dir !== path.dirname(dir)) {
      const claudePath = path.join(dir, 'CLAUDE.md');
      if (fs.existsSync(claudePath)) {
        claudeFiles.push(claudePath);
      }
      dir = path.dirname(dir);
    }

    // 루트 CLAUDE.md도 확인
    const rootClaude = path.join(process.cwd(), 'CLAUDE.md');
    if (fs.existsSync(rootClaude)) {
      claudeFiles.push(rootClaude);
    }

    return claudeFiles;
  }

  // 금지 패턴 체크
  checkForbiddenPatterns(filePath, content) {
    const patterns = {
      // API Routes 금지 패턴
      'src/app/api': [
        {
          pattern: /createServerComponentClient|createRouteHandlerClient|createClientComponentClient/g,
          message: '구식 Supabase 패턴 사용 금지',
          severity: 'error'
        },
        {
          pattern: /getSession\(\)/g,
          message: 'getSession() 금지 → getUser() 사용',
          severity: 'error'
        },
        {
          pattern: /new Response\(/g,
          message: 'new Response() 금지 → NextResponse.json() 사용',
          severity: 'error'
        }
      ],
      // TypeScript 금지 패턴
      'src/types': [
        {
          pattern: /: any/g,
          message: 'any 타입 사용 금지',
          severity: 'error'
        },
        {
          pattern: /from ['"]@\/types\/database/g,
          message: 'database.generated.ts 직접 import 금지',
          severity: 'error'
        }
      ],
      // Components 금지 패턴
      'src/components': [
        {
          pattern: /style={{[^}]+}}/g,
          message: '인라인 스타일 금지 → Tailwind CSS 사용',
          severity: 'warning'
        },
        {
          pattern: /styled\./g,
          message: 'styled-components 금지',
          severity: 'error'
        },
        {
          pattern: /use_[a-z]+/gi,
          message: 'React Hook은 camelCase 사용 (use_carousel ❌ → useCarousel ✅)',
          severity: 'error'
        }
      ],
      // Scripts 금지 패턴
      'scripts': [
        {
          pattern: /fix-.*\.js|migrate-.*\.js|auto-.*\.js/g,
          message: '자동 변환 스크립트 생성 금지',
          severity: 'error',
          fileNameCheck: true
        }
      ]
    };

    // 파일 경로에 따라 적용할 패턴 결정
    for (const [pathPattern, rules] of Object.entries(patterns)) {
      if (filePath.includes(pathPattern)) {
        for (const rule of rules) {
          if (rule.fileNameCheck) {
            // 파일명 체크
            const fileName = path.basename(filePath);
            if (rule.pattern.test(fileName)) {
              this.violations.push({
                file: filePath,
                message: rule.message,
                severity: rule.severity
              });
            }
          } else {
            // 내용 체크
            const matches = content.match(rule.pattern);
            if (matches) {
              this.violations.push({
                file: filePath,
                line: this.findLineNumber(content, matches[0]),
                message: rule.message,
                severity: rule.severity,
                match: matches[0]
              });
            }
          }
        }
      }
    }
  }

  // 라인 번호 찾기
  findLineNumber(content, match) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) {
        return i + 1;
      }
    }
    return 0;
  }

  // 파일 검사
  async checkFile(filePath) {
    this.checkedFiles++;

    // 파일 읽기
    const content = fs.readFileSync(filePath, 'utf-8');

    // 확장자별 검사
    const ext = path.extname(filePath);
    if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      this.checkForbiddenPatterns(filePath, content);
    }

    // SQL 파일 검사
    if (ext === '.sql') {
      this.checkSQLPatterns(filePath, content);
    }
  }

  // SQL 패턴 검사
  checkSQLPatterns(filePath, content) {
    // RLS 체크
    if (content.includes('CREATE TABLE') && !content.includes('ENABLE ROW LEVEL SECURITY')) {
      this.warnings.push({
        file: filePath,
        message: 'RLS 정책이 설정되지 않은 테이블',
        severity: 'warning'
      });
    }
  }

  // 결과 출력
  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📋 CLAUDE.md 규칙 검사 결과\n');

    if (this.violations.length === 0 && this.warnings.length === 0) {
      console.log('✅ 모든 규칙을 준수하고 있습니다!');
      console.log(`   검사한 파일: ${this.checkedFiles}개`);
      return true;
    }

    // 오류 출력
    if (this.violations.length > 0) {
      console.log('❌ 위반 사항:');
      for (const violation of this.violations) {
        if (violation.severity === 'error') {
          console.log(`  🔴 ${violation.file}${violation.line ? ':' + violation.line : ''}`);
          console.log(`     ${violation.message}`);
          if (violation.match) {
            console.log(`     발견: "${violation.match}"`);
          }
        }
      }
    }

    // 경고 출력
    const warnings = this.violations.filter(v => v.severity === 'warning')
      .concat(this.warnings);
    if (warnings.length > 0) {
      console.log('\n⚠️ 경고:');
      for (const warning of warnings) {
        console.log(`  🟡 ${warning.file}${warning.line ? ':' + warning.line : ''}`);
        console.log(`     ${warning.message}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    return this.violations.filter(v => v.severity === 'error').length === 0;
  }

  // 실행
  async run(files) {
    console.log('🔍 CLAUDE.md 규칙 검사 시작...\n');

    for (const file of files) {
      if (fs.existsSync(file)) {
        await this.checkFile(file);
      }
    }

    return this.printResults();
  }
}

// CLI 실행
if (process.argv.length > 2) {
  const files = process.argv.slice(2);
  const checker = new ClaudeRuleChecker();
  
  checker.run(files).then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  console.error('사용법: node check-claude-rules.js <파일1> <파일2> ...');
  process.exit(1);
}
```

### Step 2: Pre-commit Hook 업데이트
`.husky/pre-commit` 파일 수정:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Pre-commit 검사 시작..."

# 1. Staged 파일 목록 가져오기
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# 2. TypeScript/JavaScript 파일만 필터링
TS_FILES=""
for FILE in $STAGED_FILES; do
  if [[ "$FILE" =~ \.(ts|tsx|js|jsx)$ ]]; then
    TS_FILES="$TS_FILES $FILE"
  fi
done

# 3. CLAUDE.md 규칙 검사
if [ -n "$TS_FILES" ]; then
  echo "📋 CLAUDE.md 규칙 검사 중..."
  node scripts/check-claude-rules.js $TS_FILES
  if [ $? -ne 0 ]; then
    echo "❌ CLAUDE.md 규칙 위반이 발견되었습니다!"
    echo "💡 수정 후 다시 커밋해주세요."
    exit 1
  fi
fi

# 4. 기존 검사들 (snake_case 차단 등)
echo "🐍 Snake case 검사 중..."
for FILE in $STAGED_FILES; do
  if [[ "$FILE" =~ \.(ts|tsx)$ ]] && [[ ! "$FILE" =~ \.test\.(ts|tsx)$ ]]; then
    if grep -q "const.*_.*=" "$FILE" || \
       grep -q "let.*_.*=" "$FILE" || \
       grep -q "function.*_.*(" "$FILE"; then
      echo "❌ Snake case 변수 발견: $FILE"
      echo "camelCase를 사용해주세요!"
      exit 1
    fi
  fi
done

# 5. Biome 린팅 (검사만, 자동 수정 없음)
echo "🎨 Biome 코드 품질 검사 중..."
npx @biomejs/biome check --no-errors-on-unmatched --files-ignore-unknown=true $STAGED_FILES

echo "✅ Pre-commit 검사 완료!"
```

### Step 3: VS Code 태스크 설정
`.vscode/tasks.json` 파일 생성:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Check CLAUDE.md Rules",
      "type": "shell",
      "command": "node",
      "args": [
        "scripts/check-claude-rules.js",
        "${file}"
      ],
      "problemMatcher": {
        "owner": "claude-rules",
        "fileLocation": ["relative", "${workspaceFolder}"],
        "pattern": {
          "regexp": "^🔴\\s+(.+):(\\d+)$",
          "file": 1,
          "line": 2,
          "message": 3
        }
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": false,
        "clear": true
      }
    },
    {
      "label": "Check All CLAUDE.md Rules",
      "type": "shell",
      "command": "node",
      "args": [
        "scripts/check-claude-rules.js",
        "src/**/*.{ts,tsx,js,jsx}"
      ],
      "problemMatcher": [],
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": true,
        "panel": "dedicated"
      }
    }
  ]
}
```

### Step 4: package.json 스크립트 추가
```json
{
  "scripts": {
    "check:rules": "node scripts/check-claude-rules.js src/**/*.{ts,tsx,js,jsx}",
    "check:rules:api": "node scripts/check-claude-rules.js src/app/api/**/*.ts",
    "check:rules:components": "node scripts/check-claude-rules.js src/components/**/*.tsx",
    "check:rules:types": "node scripts/check-claude-rules.js src/types/**/*.ts"
  }
}
```

### Step 5: 테스트 및 검증
```bash
# 규칙 검사 테스트
npm run check:rules

# Pre-commit 테스트
git add .
git commit -m "test: 규칙 검사 시스템 테스트"

# VS Code 태스크 테스트 (VS Code에서)
# Ctrl+Shift+P → Tasks: Run Task → Check CLAUDE.md Rules
```

## 📋 QA 테스트 시나리오

### 정상 플로우
1. 규칙 위반 파일 생성 → 감지되는가?
2. Pre-commit 시 차단되는가?
3. VS Code 태스크 정상 동작하는가?

### 실패 시나리오
1. 규칙 위반 → 명확한 오류 메시지
2. 수정 가이드 → 구체적 해결 방법 제시
3. False positive → 예외 처리 가능

### 성능 측정
- 검사 시간: < 3초 (100개 파일)
- Pre-commit 오버헤드: < 5초
- 메모리 사용: < 50MB

## ✅ Phase 완료 조건 (기능 작동 필수)
- [ ] **규칙 검사 스크립트 작성** - check-claude-rules.js 생성
- [ ] **Pre-commit Hook 업데이트** - 규칙 검사 통합
- [ ] **VS Code 태스크 설정** - tasks.json 생성
- [ ] **npm 스크립트 추가** - package.json 업데이트
- [ ] **테스트 통과** - 모든 시나리오 성공
- [ ] **문서 업데이트** - 사용법 문서화

## 🔄 롤백 절차
```bash
# Phase 3 롤백
git checkout HEAD~1 .husky/pre-commit
rm -f scripts/check-claude-rules.js
rm -f .vscode/tasks.json
git checkout HEAD~1 package.json
```

## → 다음 Phase
- **파일**: PHASE_4_VALIDATION_AND_ROLLBACK.md
- **선행 조건**: Phase 3의 모든 완료 조건 충족
- **주요 작업**: 최종 검증 및 롤백 시스템 구축