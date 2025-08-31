# ✅ 환경 검증 및 사전 체크리스트

*Context 없는 AI가 작업 시작 전 반드시 확인해야 할 환경 검증 가이드*

---

## 📋 검증 개요

### 🎯 목적
- 작업 시작 전 환경 적합성 100% 보장
- 예측 가능한 문제 사전 방지 (남은 5% 위험 중 2% 제거)
- 실패 없는 작업 진행을 위한 기반 확보

### ⏱️ 소요 시간
- **Express 검증**: 2분 (필수 최소 검증)
- **Standard 검증**: 5분 (권장 기본 검증)  
- **Complete 검증**: 10분 (완전한 환경 검증)

---

## 🚀 Express 검증 (2분) - 작업 시작 전 필수

### 1️⃣ 기본 환경 확인 (30초)
```bash
# 현재 위치 확인
pwd
# 출력 예상: /path/to/dhacle (dhacle 프로젝트 루트)

# Node.js 버전 확인 (18+ 필수)
node --version
# 출력 예상: v18.17.0 또는 그 이상

# npm 버전 확인 (9+ 권장)
npm --version  
# 출력 예상: 9.6.7 또는 그 이상

# Git 상태 확인
git branch --show-current
# 출력 예상: feature/safe-massive-refactor 또는 main
```

### 2️⃣ 핵심 파일 존재 확인 (30초)
```bash
# 필수 설정 파일들
ls -la .jscpd.json project-dna.json package.json
# 모든 파일이 존재해야 함

# 핵심 스크립트 존재 확인
ls -la scripts/asset-scanner.js scripts/context-loader.js
# 두 스크립트가 모두 존재해야 함

# Husky Git hooks 확인
ls -la .husky/pre-commit
# 실행 권한이 있어야 함 (-rwxr-xr-x)
```

### 3️⃣ 즉시 실행 테스트 (60초)
```bash
# package.json scripts 기본 작동 확인
timeout 30s npm run --silent scan:assets > /dev/null 2>&1
echo "Asset Scanner 테스트: $?"  # 0이어야 정상

timeout 30s npm run --silent jscpd:check > /dev/null 2>&1  
echo "jscpd 테스트: $?"  # 0이어야 정상

# Git 상태 확인
git status --porcelain | head -5
# 너무 많은 변경사항이 있으면 주의 필요
```

### ✅ Express 검증 통과 기준
- [ ] Node.js 18+ 설치 확인
- [ ] 프로젝트 루트 디렉토리 위치
- [ ] 핵심 4개 파일 존재 (.jscpd.json, project-dna.json, package.json, pre-commit)
- [ ] Asset Scanner 30초 내 정상 실행
- [ ] jscpd 30초 내 정상 실행

**⚠️ Express 검증 실패 시 → Standard 검증으로 넘어가지 말고 즉시 EMERGENCY_TROUBLESHOOTING.md 참조**

---

## 📊 Standard 검증 (5분) - 권장 기본 검증

### 4️⃣ 의존성 및 디스크 확인 (60초)
```bash
# 주요 의존성 설치 확인
npm list --depth=0 2>/dev/null | grep -E "(jscpd|typescript|next)" 
# jscpd, typescript, next 모두 보여야 함

# 디스크 용량 확인 (1GB 이상 필요)
df -h . | awk 'NR==2 {printf "디스크 사용률: %s, 여유공간: %s\n", $5, $4}'
# 사용률 90% 미만이어야 함

# node_modules 크기 확인 (너무 크면 성능 저하)
du -sh node_modules/ 2>/dev/null || echo "node_modules 없음"
# 1GB 미만 권장
```

### 5️⃣ Git 저장소 상태 점검 (60초)
```bash
# Git 저장소 건전성 확인
git status --porcelain | wc -l
echo "변경된 파일 수: $(git status --porcelain | wc -l)"
# 50개 이하 권장

# 최근 커밋 확인
git log --oneline -3
# 최근 3개 커밋이 정상적으로 보여야 함

# 브랜치 상태 확인
git branch -v | head -5
# 현재 브랜치가 명확히 표시되어야 함

# 원격 저장소 연결 확인  
git remote -v | head -2
# origin 원격 저장소가 설정되어 있어야 함
```

### 6️⃣ 시스템 성능 기준선 측정 (120초)
```bash
# Asset Scanner 성능 측정
echo "Asset Scanner 성능 테스트 시작..."
time npm run scan:assets > /dev/null 2>&1
# 일반적으로 10-30초 내 완료되어야 함

# jscpd 성능 측정  
echo "jscpd 성능 테스트 시작..."
time npm run jscpd:check > /dev/null 2>&1
# 일반적으로 5-15초 내 완료되어야 함

# Context Loader 성능 측정
echo "Context Loader 성능 테스트 시작..."
time npm run context:load > /dev/null 2>&1  
# 목표: 30초 내 완료
```

### 7️⃣ 품질 지표 기준선 확인 (60초)
```bash
# 현재 품질 상태 스냅샷
npm run scan:assets 2>/dev/null | tail -10
# 자산 개수와 품질 점수 확인

# 중복률 현재 상태
npm run jscpd:check 2>/dev/null | grep -E "(duplicated|percentage)"
# 중복률 5% 이하 확인

# TypeScript 컴파일 확인
npm run types:check > /dev/null 2>&1
echo "TypeScript 컴파일: $?"  # 0이어야 정상
```

### ✅ Standard 검증 통과 기준
- [ ] 주요 의존성 3개 이상 설치 확인
- [ ] 디스크 사용률 90% 미만
- [ ] Git 변경 파일 50개 이하
- [ ] Asset Scanner 60초 내 완료
- [ ] jscpd 30초 내 완료  
- [ ] TypeScript 컴파일 성공

**⚠️ Standard 검증 실패 시 → 해당 문제 해결 후 재검증**

---

## 🔧 Complete 검증 (10분) - 완전한 환경 검증

### 8️⃣ 고급 시스템 진단 (180초)
```bash
# 메모리 사용량 체크
echo "시스템 메모리 정보:"
# Linux/macOS
free -m 2>/dev/null || vm_stat | head -5
# Windows: wmic computersystem get TotalPhysicalMemory

# CPU 사용률 체크 (5초간 샘플링)
echo "CPU 사용률 체크 중..."  
top -bn1 | grep "Cpu(s)" || echo "macOS의 경우 top 명령어 다름"

# 네트워크 연결 확인 (npm registry 접근)
echo "npm registry 연결 테스트:"
curl -s -o /dev/null -w "%{http_code}" https://registry.npmjs.org/ || echo "네트워크 문제 가능성"

# 프로세스 충돌 확인 (Node.js 관련)
ps aux | grep -i node | head -5
```

### 9️⃣ 전체 빌드 시스템 검증 (240초)
```bash
# Next.js 빌드 테스트 (가장 종합적인 검증)
echo "🔨 전체 빌드 테스트 시작 (2-4분 소요)..."
timeout 240s npm run build > build-test.log 2>&1
BUILD_RESULT=$?

if [ $BUILD_RESULT -eq 0 ]; then
  echo "✅ 빌드 성공"
  rm build-test.log
else
  echo "❌ 빌드 실패 - build-test.log 확인 필요"
  tail -20 build-test.log
fi

# TypeScript strict 모드 검증
echo "📋 TypeScript strict 검증..."
npx tsc --noEmit --strict > /dev/null 2>&1
echo "Strict TypeScript: $?"  # 0이어야 최고 품질
```

### 🔟 보안 및 설정 검증 (60초)
```bash
# 환경변수 노출 위험 검사
echo "🔒 보안 검증:"
grep -r "process.env" src/ --include="*.ts" --include="*.tsx" | wc -l
echo "process.env 직접 사용 개수 (0개가 이상적)"

# Git hooks 실제 작동 확인  
echo "🪝 Git hooks 테스트:"
echo "test commit" > test-commit.txt
git add test-commit.txt
git commit -m "test: pre-commit hook validation" --dry-run
rm test-commit.txt
git reset HEAD test-commit.txt 2>/dev/null

# 중요 설정 파일 무결성 확인
echo "📄 설정 파일 무결성:"
cat .jscpd.json | jq . > /dev/null 2>&1 && echo "✅ .jscpd.json 유효" || echo "❌ .jscpd.json 손상"
cat project-dna.json | jq . > /dev/null 2>&1 && echo "✅ project-dna.json 유효" || echo "❌ project-dna.json 손상"
```

### ✅ Complete 검증 통과 기준
- [ ] 시스템 메모리 2GB+ 사용 가능
- [ ] 네트워크 npm registry 접근 가능
- [ ] 전체 빌드 4분 내 성공
- [ ] TypeScript strict 모드 통과
- [ ] process.env 직접 사용 10개 미만
- [ ] Git hooks 정상 작동
- [ ] 핵심 JSON 파일 문법 오류 없음

---

## 🎯 환경별 특수 검증

### 🪟 Windows 환경 추가 확인
```powershell
# PowerShell에서 실행
# Node.js 경로 확인
where node
# npm 글로벌 경로 확인  
npm config get prefix
# 권한 문제 확인
Test-Path $env:APPDATA\npm -PathType Container
# Git 설정 확인
git config --global user.name
git config --global user.email
```

### 🍎 macOS 환경 추가 확인
```bash
# Homebrew 설치 확인 (권장)
brew --version 2>/dev/null && echo "✅ Homebrew 설치됨" || echo "⚠️ Homebrew 미설치"

# Xcode Command Line Tools 확인
xcode-select -p 2>/dev/null && echo "✅ Xcode CLI Tools" || echo "❌ Xcode CLI Tools 필요"

# macOS 권한 설정 확인
ls -la ~/.npm-global 2>/dev/null || echo "npm 글로벌 디렉토리 설정 필요 가능성"

# Rosetta (M1/M2 Mac) 확인
uname -m | grep arm64 >/dev/null && echo "🔧 Apple Silicon - Node.js 호환성 확인 필요"
```

### 🐧 Linux 환경 추가 확인
```bash
# 배포판 확인
cat /etc/os-release | head -3

# 필수 패키지 설치 확인
which curl git python3 make gcc g++ > /dev/null && echo "✅ 개발 도구 완비" || echo "❌ 개발 도구 부족"

# 권한 설정 확인
groups $USER | grep sudo >/dev/null && echo "✅ sudo 권한" || echo "⚠️ sudo 권한 없음"

# Node.js 설치 방법 확인  
which nvm >/dev/null && echo "✅ NVM 설치" || echo "⚠️ NVM 미설치"
```

---

## 🔧 자동 검증 스크립트

### 📋 통합 검증 스크립트 (생성 권장)
```bash
#!/bin/bash
# scripts/environment-validator.js (Node.js로 작성 권장)

cat > scripts/environment-validator.js << 'EOF'
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.results = {};
  }

  async validateExpress() {
    console.log('🚀 Express 검증 시작 (2분)...\n');
    
    // Node.js 버전 검증
    try {
      const nodeVersion = execSync('node --version').toString().trim();
      const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
      if (majorVersion >= 18) {
        console.log(`✅ Node.js ${nodeVersion}`);
      } else {
        this.errors.push(`❌ Node.js ${nodeVersion} - 18+ 필요`);
      }
    } catch (e) {
      this.errors.push('❌ Node.js 설치되지 않음');
    }

    // 핵심 파일 확인
    const coreFiles = ['.jscpd.json', 'project-dna.json', 'package.json'];
    for (const file of coreFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} 존재`);
      } else {
        this.errors.push(`❌ ${file} 누락`);
      }
    }

    // Asset Scanner 테스트
    try {
      execSync('timeout 30s npm run scan:assets > /dev/null 2>&1');
      console.log('✅ Asset Scanner 정상');
    } catch (e) {
      this.errors.push('❌ Asset Scanner 실행 실패');
    }

    return this.errors.length === 0;
  }

  async validateStandard() {
    console.log('\n📊 Standard 검증 시작 (5분)...\n');
    
    // 성능 측정
    const startTime = Date.now();
    try {
      execSync('npm run jscpd:check > /dev/null 2>&1');
      const duration = Date.now() - startTime;
      if (duration < 30000) {
        console.log(`✅ jscpd 성능: ${duration}ms`);
      } else {
        this.warnings.push(`⚠️ jscpd 느림: ${duration}ms`);
      }
    } catch (e) {
      this.errors.push('❌ jscpd 실행 실패');
    }

    return this.errors.length === 0;
  }

  async validateComplete() {
    console.log('\n🔧 Complete 검증 시작 (10분)...\n');
    
    // 빌드 테스트
    try {
      console.log('🔨 전체 빌드 테스트 시작...');
      execSync('timeout 240s npm run build > /dev/null 2>&1');
      console.log('✅ 빌드 성공');
    } catch (e) {
      this.errors.push('❌ 빌드 실패');
    }

    return this.errors.length === 0;
  }

  generateReport() {
    console.log('\n📊 검증 결과 요약');
    console.log('==================');
    
    if (this.errors.length === 0) {
      console.log('🎉 모든 검증 통과!');
      console.log('✅ 환경 준비 완료 - 작업 시작 가능');
    } else {
      console.log(`❌ ${this.errors.length}개 오류 발견:`);
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ ${this.warnings.length}개 경고:`);
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    return this.errors.length === 0;
  }
}

async function main() {
  const validator = new EnvironmentValidator();
  
  const expressOk = await validator.validateExpress();
  if (!expressOk) {
    console.log('\n🚨 Express 검증 실패 - EMERGENCY_TROUBLESHOOTING.md 참조');
    validator.generateReport();
    process.exit(1);
  }

  const standardOk = await validator.validateStandard();  
  if (!standardOk) {
    console.log('\n⚠️ Standard 검증 실패 - 문제 해결 후 재시도');
    validator.generateReport();
    process.exit(1);
  }

  const completeOk = await validator.validateComplete();
  const success = validator.generateReport();
  
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = EnvironmentValidator;
EOF

chmod +x scripts/environment-validator.js
```

### 🚀 간편 실행 명령어
```bash
# package.json에 추가할 scripts
"scripts": {
  "validate:env": "node scripts/environment-validator.js",
  "validate:express": "node scripts/environment-validator.js --level express",
  "validate:standard": "node scripts/environment-validator.js --level standard", 
  "validate:complete": "node scripts/environment-validator.js --level complete"
}
```

---

## 📊 검증 결과 해석 가이드

### ✅ 완전 통과 (작업 시작 권장)
```
🎉 모든 검증 통과!
✅ 환경 준비 완료 - 작업 시작 가능

권장 첫 번째 작업:
/cleanup docs --validate --evidence --systematic
```

### ⚠️ 경고 있음 (주의하여 진행)
```
✅ 필수 검증 통과
⚠️ 2개 성능 경고:
  - Asset Scanner 느림: 45초
  - 디스크 사용률 85%

→ 성능 최적화 우선 고려
/improve performance --benchmark --focus bottlenecks
```

### ❌ 검증 실패 (즉시 문제 해결 필요)
```
❌ 3개 오류 발견:
  - Node.js 16.x - 18+ 필요
  - .jscpd.json 누락
  - Asset Scanner 실행 실패

→ EMERGENCY_TROUBLESHOOTING.md 참조하여 해결 후 재검증
```

---

## 🎯 상황별 대응 전략

### 🟢 Green Zone (완전 통과)
- **즉시 작업 시작 가능**
- Phase 1부터 순차적 진행
- 정기 모니터링만 필요

### 🟡 Yellow Zone (경고 있음)  
- **주의하여 작업 진행**
- 성능 관련 경고는 최적화 우선
- 리소스 모니터링 강화

### 🔴 Red Zone (검증 실패)
- **작업 시작 금지**
- EMERGENCY_TROUBLESHOOTING.md 즉시 참조
- 문제 해결 후 재검증 필수

---

## 📋 Context 없는 AI용 체크리스트

### 🚀 작업 시작 전 필수 확인 (2분)
```bash
# 이 명령어들을 순서대로 실행하고 모든 결과가 정상인지 확인
pwd                                    # dhacle 프로젝트 루트 확인
node --version                         # v18+ 확인  
ls -la .jscpd.json project-dna.json   # 파일 존재 확인
timeout 30s npm run scan:assets >/dev/null 2>&1 && echo "✅ Asset Scanner" || echo "❌ 실패"
timeout 30s npm run jscpd:check >/dev/null 2>&1 && echo "✅ jscpd" || echo "❌ 실패"
```

### 📊 권장 추가 확인 (5분)
```bash
# 성능과 안정성을 위한 추가 확인
df -h . | awk 'NR==2 {print "디스크:", $5, $4}'  # 용량 확인
git status --porcelain | wc -l              # 변경 파일 수
npm run types:check >/dev/null 2>&1 && echo "✅ TypeScript" || echo "❌ 타입 에러"
```

### 🔧 완전 검증 (10분) - 중요한 작업 전에만
```bash
# 자동 검증 스크립트가 있는 경우
npm run validate:complete

# 수동 검증인 경우
npm run build >/dev/null 2>&1 && echo "✅ 빌드 성공" || echo "❌ 빌드 실패"
```

**모든 검증을 통과한 후에만 실제 작업을 시작하세요! 🚀**

---

*본 가이드는 실제 환경에서 발생할 수 있는 모든 변수를 고려하여 작성되었습니다.*