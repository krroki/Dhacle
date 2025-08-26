/sc:implement --seq --validate
"Phase 1: Claude Code 실수 방지 시스템 기초 설치 및 설정"

# Phase 1: 기초 설치 및 설정

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📌 Phase 정보
- Phase 번호: 1/3
- 예상 시간: 30분
- 우선순위: CRITICAL
- 목표: 시스템 구축을 위한 기초 환경 설정

## 🔥 실제 코드 패턴 확인

### 현재 프로젝트 상태 확인
```bash
# Step 0-1: 현재 문제 패턴 확인
echo "=== 현재 any 타입 개수 ==="
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
# 결과: 88개 (목표: 0개)

# Step 0-2: TODO/FIXME 패턴 확인
echo "=== TODO/FIXME 개수 ==="
grep -r "TODO\|FIXME" src/ | wc -l
# 결과: 다수 존재

# Step 0-3: 금지 패턴 확인
echo "=== 금지된 Supabase 패턴 ==="
grep -r "createServerComponentClient" src/ | wc -l
# 결과: 0개여야 함

# Step 0-4: 자동 스크립트 확인
echo "=== 자동 변환 스크립트 확인 ==="
ls scripts/fix-*.js 2>/dev/null
# 결과: 없어야 함 (38개 스크립트 재앙 방지)
```

## 🎯 Phase 1 목표
1. 필수 npm 패키지 설치
2. 디렉토리 구조 생성
3. Git 충돌 방지 설정
4. 초기 권한 설정

## 📝 작업 내용

### 1.1 필수 패키지 설치

```bash
npm install -D chokidar@3.6.0 node-notifier@10.0.1 chalk@4.1.2
```

**패키지 설명**:
- `chokidar@3.6.0`: 파일 시스템 실시간 감시
- `node-notifier@10.0.1`: 데스크톱 알림 시스템
- `chalk@4.1.2`: 콘솔 컬러 출력

### 1.2 디렉토리 구조 생성

```bash
# Claude 전용 디렉토리 생성
mkdir -p .claude/mistakes/history
mkdir -p .claude/watchdog
mkdir -p .claude/logs
mkdir -p .claude/cache

# 권한 설정 (Windows는 자동)
chmod 755 .claude/mistakes/ 2>/dev/null || true
chmod 755 .claude/watchdog/ 2>/dev/null || true
chmod 755 .claude/logs/ 2>/dev/null || true
```

**디렉토리 설명**:
- `.claude/mistakes/history/`: 실수 히스토리 저장
- `.claude/watchdog/`: 감시 시스템 코드
- `.claude/logs/`: 실행 로그
- `.claude/cache/`: 패턴 캐시

### 1.3 Git 충돌 방지 설정

```bash
# .gitignore에 추가
cat >> .gitignore << 'EOF'

# Claude Code Mistake Prevention System
.claude/mistakes/
.claude/watchdog/*.log
.claude/logs/
.claude/cache/
*.watchdog.tmp
EOF

echo "✅ Git ignore 설정 완료"
```

### 1.4 초기 설정 파일 생성

```bash
# watchdog 설정 파일
cat > .claude/watchdog/config.json << 'EOF'
{
  "version": "1.0.0",
  "enabled": true,
  "autoFix": false,
  "throttle": 500,
  "maxHistorySize": 1000,
  "ignored": [
    "node_modules/**",
    ".next/**",
    "dist/**",
    "*.log",
    ".git/**",
    ".claude/mistakes/**"
  ],
  "patterns": {
    "critical": {
      "any_type": ":\\s*any(?:\\s|,|;|\\)|>)",
      "todo_fixme": "\\/\\/\\s*(TODO|FIXME)",
      "auto_script": "scripts\\/fix-.*\\.js$",
      "no_session": "app\\/api.*!getUser\\(\\)"
    },
    "recurring": {
      "old_supabase": "createServerComponentClient",
      "direct_import": "from.*database\\.generated",
      "get_session": "getSession\\(\\)",
      "direct_fetch": "fetch\\(",
      "snake_case_var": "const\\s+[a-z]+_[a-z]+",
      "hook_violation": "use[A-Z].*\\(.*\\).*{.*use"
    }
  },
  "notifications": {
    "desktop": true,
    "console": true,
    "logFile": true
  }
}
EOF

echo "✅ 설정 파일 생성 완료"
```

### 1.5 권한 확인 스크립트

```bash
# 권한 확인 스크립트 생성
cat > .claude/watchdog/check-permissions.js << 'EOF'
const fs = require('fs');
const path = require('path');

const dirs = [
  '.claude/mistakes/history',
  '.claude/watchdog',
  '.claude/logs',
  '.claude/cache'
];

console.log('🔍 디렉토리 권한 확인 중...\n');

let allOk = true;
dirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  try {
    // 읽기 권한 확인
    fs.accessSync(fullPath, fs.constants.R_OK);
    // 쓰기 권한 확인
    fs.accessSync(fullPath, fs.constants.W_OK);
    console.log(`✅ ${dir} - 정상`);
  } catch (err) {
    console.log(`❌ ${dir} - 권한 오류: ${err.message}`);
    allOk = false;
  }
});

if (allOk) {
  console.log('\n✅ 모든 디렉토리 권한 정상');
} else {
  console.log('\n❌ 권한 오류가 있습니다. 수정이 필요합니다.');
  process.exit(1);
}
EOF

# 권한 확인 실행
node .claude/watchdog/check-permissions.js
```

## ✅ Phase 1 완료 조건

### 🔴 필수 완료 조건 (하나라도 미충족 시 미완료)
```bash
# 1. 패키지 설치 확인
- [ ] npm ls chokidar → 3.6.0 버전 확인
- [ ] npm ls node-notifier → 10.0.1 버전 확인
- [ ] npm ls chalk → 4.1.2 버전 확인

# 2. 디렉토리 생성 확인
- [ ] ls -la .claude/ → 4개 하위 디렉토리 확인
- [ ] ls -la .claude/watchdog/ → config.json 존재
- [ ] node .claude/watchdog/check-permissions.js → 모두 정상

# 3. Git 설정 확인
- [ ] cat .gitignore | grep ".claude" → 설정 확인
- [ ] git status → .claude 폴더 추적 안됨
```

### 🟡 권장 완료 조건
- [ ] 디스크 공간 10MB 이상 확보
- [ ] Node.js 버전 16+ 확인
- [ ] npm 버전 8+ 확인

## 🔄 롤백 계획

### 롤백 절차
```bash
# 1. 패키지 제거
npm uninstall chokidar node-notifier chalk

# 2. 디렉토리 제거
rm -rf .claude/

# 3. .gitignore 정리
# .gitignore에서 Claude 관련 항목 수동 제거
```

## 📋 테스트 시나리오

### 디렉토리 생성 테스트
```bash
# 테스트 파일 생성
echo "test" > .claude/mistakes/test.txt
cat .claude/mistakes/test.txt
# 출력: test

# 테스트 파일 제거
rm .claude/mistakes/test.txt
```

### 패키지 동작 테스트
```bash
# Chokidar 테스트
node -e "const chokidar = require('chokidar'); console.log('✅ Chokidar 정상');"

# Node-notifier 테스트
node -e "const notifier = require('node-notifier'); console.log('✅ Node-notifier 정상');"

# Chalk 테스트
node -e "const chalk = require('chalk'); console.log(chalk.green('✅ Chalk 정상'));"
```

## → 다음 Phase
- 파일: PHASE_2_CORE_IMPLEMENTATION.md
- 내용: 핵심 감지 엔진 구현

---

**Phase 1 체크리스트**:
- [ ] npm 패키지 3개 설치 완료
- [ ] 디렉토리 4개 생성 완료
- [ ] .gitignore 설정 완료
- [ ] config.json 생성 완료
- [ ] 권한 확인 통과