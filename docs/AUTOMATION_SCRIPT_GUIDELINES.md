# 🤖 자동화 스크립트 사용 가이드라인

*작성일: 2025-02-21*  
*목적: 안전하고 효과적인 자동화 도구 사용 원칙 정립*  
*배경: 38개 무분별한 자동 스크립트로 인한 "에러 지옥" 경험 후 작성*

---

## 🚨 우리가 배운 교훈: "자동화의 함정"

### 2025년 1월의 재앙
```
Day 1: 117개 오류 → 자동 스크립트 생성 → 13개로 감소 ✅
Day 2: 더 많은 자동 스크립트 추가 → 숨겨진 문제 누적 ⚠️
Day 30: 38개 스크립트 운영 중 → 시스템 불안정 🔥
Day 31: 전체 스크립트 삭제 → 300개+ 오류 폭발 💥
```

**핵심 교훈**: 자동화는 문제를 해결하는 것이 아니라 **덮어놓을 수 있다**

---

## ✅ 허용되는 자동화 (Green Zone)

### 1. 검증 스크립트 (Verify Scripts)
```javascript
// ✅ GOOD: 읽기 전용, 문제 탐지만 수행
scripts/verify-types.js         // 타입 오류 찾기
scripts/verify-api-consistency.js  // API 일관성 검사
scripts/verify-imports.js       // import 경로 검증

// 특징:
// - 파일을 수정하지 않음
// - 문제를 보고만 함
// - 언제든 안전하게 실행 가능
```

### 2. 분석 스크립트 (Analysis Scripts)
```javascript
// ✅ GOOD: 정보 수집 및 보고서 생성
scripts/analyze-bundle-size.js   // 번들 크기 분석
scripts/check-dependencies.js    // 의존성 검사
scripts/coverage-report.js       // 테스트 커버리지

// 특징:
// - 읽기 작업만 수행
// - 통계와 메트릭 생성
// - 의사결정 지원 도구
```

### 3. 생성 스크립트 (Generator Scripts)
```javascript
// ✅ GOOD: 새 파일 생성 (기존 파일 수정 없음)
scripts/generate-component.js    // 컴포넌트 보일러플레이트
scripts/generate-types-from-db.js // DB에서 타입 생성

// 특징:
// - 기존 코드를 건드리지 않음
// - 템플릿 기반 생성
// - 예측 가능한 결과
```

---

## ⚠️ 신중히 사용할 자동화 (Yellow Zone)

### 조건부 허용 스크립트
```javascript
// ⚠️ CAUTION: 특정 조건 하에서만 사용
scripts/format-code.js          // Prettier/ESLint 자동 포맷
scripts/update-imports.js       // Import 경로 업데이트
scripts/rename-variables.js     // 변수명 일괄 변경

// 필수 조건:
// 1. --dry-run 모드 제공
// 2. 단일 파일 처리 옵션
// 3. Git 커밋 전 별도 브랜치
// 4. 변경사항 미리보기
// 5. 사용자 확인 필수
```

### 안전장치 구현 예시
```javascript
// scripts/safe-auto-fix.js
const program = require('commander');

program
  .option('--dry-run', 'Preview changes without applying')
  .option('--file <path>', 'Process single file only')
  .option('--confirm', 'Require user confirmation')
  .option('--backup', 'Create backup before changes');

async function execute() {
  // 1. 백업 생성
  if (options.backup) await createBackup();
  
  // 2. 변경사항 미리보기
  const changes = analyzeChanges();
  console.log('Proposed changes:', changes);
  
  // 3. 사용자 확인
  if (options.confirm) {
    const answer = await prompt('Proceed? (y/n)');
    if (answer !== 'y') return;
  }
  
  // 4. 실행 또는 시뮬레이션
  if (!options.dryRun) {
    await applyChanges(changes);
  }
}
```

---

## 🚫 절대 금지 자동화 (Red Zone)

### 금지된 패턴들
```javascript
// ❌ NEVER: 컨텍스트 무시 일괄 변경
scripts/fix-all-errors.js       // 모든 오류 "자동" 수정
scripts/migrate-everything.js    // 전체 코드베이스 마이그레이션
scripts/auto-refactor.js        // AI 기반 자동 리팩토링

// 왜 위험한가:
// 1. 파일별 컨텍스트 무시
// 2. 부작용 예측 불가
// 3. 도미노 효과 발생
// 4. 되돌리기 어려움
// 5. 숨겨진 버그 생성
```

### 실제 실패 사례
```javascript
// 😱 실제로 문제를 일으킨 스크립트
fix-all-typescript-errors.js
// 문제: any 타입을 unknown으로 일괄 변경
// 결과: 300개+ 새로운 타입 오류 발생

migrate-to-snake-case.js  
// 문제: React 예약어까지 변경 (className → class_name)
// 결과: 전체 UI 컴포넌트 작동 중단

fix-api-consistency.js
// 문제: API 응답 구조 임의 변경
// 결과: 프론트엔드-백엔드 통신 실패
```

---

## 📐 자동화 스크립트 설계 원칙

### 1. KISS (Keep It Simple, Stupid)
```javascript
// ❌ 복잡함: 여러 작업을 한 번에
function fixEverything() {
  fixTypes();
  fixImports();
  fixNaming();
  fixStyles();
}

// ✅ 단순함: 한 가지만 잘 하기
function validateTypes() {
  return findTypeErrors();
}
```

### 2. Explicit Over Implicit
```javascript
// ❌ 암묵적: 자동으로 모든 것 결정
function autoFix(file) {
  const fixes = detectProblems(file);
  applyFixes(fixes);  // 사용자 모르게 수정
}

// ✅ 명시적: 사용자가 모든 것 통제
function suggestFixes(file) {
  const problems = detectProblems(file);
  console.log('Found problems:', problems);
  console.log('Suggested fixes:', generateFixes(problems));
  // 실제 수정은 사용자가 결정
}
```

### 3. Incremental Progress
```javascript
// ❌ 한 번에 전체 처리
processAllFiles('**/*.ts');

// ✅ 점진적 처리
async function processIncremental() {
  const files = getFilesToProcess();
  for (const file of files) {
    await processFile(file);
    await validateFile(file);
    await confirmContinue();
  }
}
```

---

## 🛠️ 안전한 자동화 스크립트 템플릿

```javascript
#!/usr/bin/env node

/**
 * Safe Automation Script Template
 * 
 * Purpose: [명확한 목적 기술]
 * Scope: [영향 범위 명시]
 * Risk Level: Low | Medium | High
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');

// 명령줄 옵션 정의
program
  .version('1.0.0')
  .option('-d, --dry-run', 'Run without making changes')
  .option('-f, --file <path>', 'Process single file')
  .option('-v, --verbose', 'Verbose output')
  .option('-b, --backup', 'Create backup before changes')
  .option('-y, --yes', 'Skip confirmation prompts')
  .parse(process.argv);

const options = program.opts();

// 안전장치 1: Dry Run이 기본값
const isDryRun = options.dryRun !== false;

// 안전장치 2: 백업 생성
async function createBackup(filePath) {
  if (!options.backup) return;
  
  const backupPath = `${filePath}.backup.${Date.now()}`;
  await fs.promises.copyFile(filePath, backupPath);
  console.log(chalk.green(`✅ Backup created: ${backupPath}`));
}

// 안전장치 3: 변경사항 미리보기
function previewChanges(original, modified) {
  console.log(chalk.yellow('\n--- Preview Changes ---'));
  console.log(chalk.red('- ' + original));
  console.log(chalk.green('+ ' + modified));
  console.log(chalk.yellow('----------------------\n'));
}

// 안전장치 4: 사용자 확인
async function confirmAction(message) {
  if (options.yes) return true;
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    readline.question(`${message} (y/n): `, answer => {
      readline.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// 안전장치 5: 검증
async function validateChanges(filePath) {
  // 구문 검사
  // 타입 검사
  // 테스트 실행
  return true;
}

// 메인 실행 함수
async function main() {
  console.log(chalk.blue('🤖 Safe Automation Script'));
  console.log(chalk.gray(`Mode: ${isDryRun ? 'DRY RUN' : 'EXECUTE'}`));
  
  try {
    // 1. 대상 파일 확인
    const targetFile = options.file || await selectFile();
    
    // 2. 백업 생성
    await createBackup(targetFile);
    
    // 3. 분석
    const analysis = await analyzeFile(targetFile);
    
    // 4. 변경사항 생성
    const changes = generateChanges(analysis);
    
    // 5. 미리보기
    previewChanges(analysis.original, changes);
    
    // 6. 확인
    if (!await confirmAction('Apply changes?')) {
      console.log(chalk.yellow('❌ Cancelled by user'));
      return;
    }
    
    // 7. 실행 (Dry Run이 아닌 경우만)
    if (!isDryRun) {
      await applyChanges(targetFile, changes);
      
      // 8. 검증
      if (await validateChanges(targetFile)) {
        console.log(chalk.green('✅ Changes applied successfully'));
      } else {
        console.log(chalk.red('❌ Validation failed, reverting...'));
        await revertChanges(targetFile);
      }
    } else {
      console.log(chalk.yellow('ℹ️ Dry run complete (no changes made)'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

// 실행
main();
```

---

## 📋 자동화 스크립트 체크리스트

### 새 스크립트 생성 전
- [ ] 정말 자동화가 필요한가? (수동이 더 안전할 수도)
- [ ] 기존 도구로 해결 가능한가? (ESLint, Prettier 등)
- [ ] 영향 범위가 명확한가?
- [ ] 되돌리기 계획이 있는가?

### 스크립트 구현 시
- [ ] --dry-run 모드 구현
- [ ] 단일 파일 처리 옵션
- [ ] 백업 메커니즘
- [ ] 변경사항 미리보기
- [ ] 사용자 확인 단계
- [ ] 상세 로깅
- [ ] 에러 처리

### 스크립트 테스트
- [ ] 테스트 파일로 먼저 실행
- [ ] Dry Run 모드 검증
- [ ] 백업 및 복원 테스트
- [ ] 엣지 케이스 처리
- [ ] 성능 영향 측정

### 스크립트 배포
- [ ] README 문서화
- [ ] 위험 수준 명시
- [ ] 사용 예시 제공
- [ ] 롤백 가이드 작성

---

## 🎯 황금률: The Golden Rules

1. **의심스러우면 하지 마라** (When in doubt, don't)
2. **검증은 자동화, 수정은 수동** (Automate validation, manual fixing)
3. **한 번에 하나씩** (One thing at a time)
4. **항상 미리보기** (Always preview)
5. **백업은 필수** (Backup is mandatory)

---

## 📚 참고 자료

- [삭제된 위험한 스크립트들](../scripts/backup-unused-scripts-20250131/)
- [안전한 검증 스크립트들](../scripts/verify-*.js)
- [프로젝트 타입 시스템 복구 계획](./CRITICAL_TYPE_SYSTEM_RECOVERY_PLAN.md)

---

*"자동화는 도구일 뿐이다. 문제는 그것을 어떻게 사용하느냐에 있다."*

**이 가이드라인을 준수하여 다시는 "자동화 지옥"에 빠지지 않도록 합시다.**