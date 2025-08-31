# 🚨 Dhacle 프로젝트 예외 상황 대응 가이드

*Context 없는 AI를 위한 체계적 문제 해결 매뉴얼 - 5% 예측 불가능 위험 대응*

---

## 📋 가이드 개요

### 목적
- **Context 없는 AI**가 예측 불가능한 문제를 만났을 때 체계적으로 해결
- **5% 위험 요소** (환경 차이, 새로운 오류, 리소스 부족) 대응
- **에스컬레이션 기준**과 **복구 전략** 명확화

### 사용 원칙
1. **안전 우선**: 확실하지 않으면 중단하고 상황 기록
2. **단계적 접근**: 간단한 해결책부터 복잡한 방법 순으로
3. **증거 수집**: 모든 오류 메시지와 시도한 방법 기록
4. **롤백 준비**: 변경 전 항상 현재 상태 백업

---

## 🎯 예외 상황 분류 및 우선순위

### 🚨 Critical (즉시 중단 필요)
- **데이터 손실 위험**: 중요 파일 삭제, DB 오류
- **보안 취약점**: 인증 정보 노출, 권한 에러
- **시스템 충돌**: 전체 프로젝트 빌드 실패
- **복구 불가능**: 되돌릴 수 없는 변경 사항

**대응**: 즉시 작업 중단 → 상황 기록 → 에스컬레이션

### ⚠️ High (신속한 해결 필요)
- **핵심 기능 중단**: Asset Scanner, jscpd 실행 불가
- **개발 서버 실패**: npm run dev 실행 안됨
- **빌드 오류**: 타입스크립트, 빌드 프로세스 실패
- **의존성 충돌**: 패키지 버전 충돌

**대응**: 1시간 이내 해결 시도 → 실패 시 에스컬레이션

### 📌 Medium (계획된 해결)
- **성능 저하**: 실행 시간 2배 이상 증가
- **경고 메시지**: 빌드는 되지만 warning 발생
- **일부 기능 이슈**: 보조 기능 작동 안함
- **환경 차이**: 다른 OS, Node.js 버전

**대응**: 계획적 해결, 우회책 먼저 적용

### 📋 Low (모니터링)
- **성능 미세 저하**: 10-20% 성능 감소
- **로그 메시지**: 정보성 메시지
- **UI 미세 결함**: 기능적으로는 정상

**대응**: 기록 후 여유 시간에 해결

---

## 🔧 자주 발생하는 오류 및 해결책

### 1. jscpd 관련 오류

#### Error: ENOENT: no such file or directory, open '.jscpd.json'
**원인**: 설정 파일이 없거나 잘못된 경로
**해결책**:
```bash
# 1단계: 현재 위치 확인
pwd
# dhacle 프로젝트 루트에 있어야 함

# 2단계: 설정 파일 확인
ls .jscpd.json
# 파일이 없다면 생성

# 3단계: 기본 설정 생성 (파일이 없는 경우)
cat > .jscpd.json << 'EOF'
{
  "threshold": 5,
  "reporters": ["console", "json"],
  "pattern": ["src/**/*.{ts,tsx,js,jsx}"],
  "minLines": 3,
  "minTokens": 50
}
EOF
```

#### Error: EACCES: permission denied, mkdir 'jscpd-report'
**원인**: Windows 권한 문제
**해결책**:
```bash
# 1단계: 디렉토리 수동 생성
mkdir -p jscpd-report

# 2단계: 권한 확인 (Windows)
ls -la jscpd-report

# 3단계: 다른 위치로 출력 변경
jscpd . --output ./temp-report
```

#### JavaScript heap out of memory (jscpd)
**원인**: 메모리 부족 (대용량 프로젝트)
**해결책**:
```bash
# 1단계: Node.js 메모리 증가
export NODE_OPTIONS="--max-old-space-size=4096"

# 2단계: 스캔 범위 축소
# .jscpd.json에서 pattern 수정
{
  "pattern": [
    "src/components/**/*.{ts,tsx}",
    "src/lib/**/*.ts"
  ]
}

# 3단계: 점진적 확대
# 작은 범위부터 시작해서 점점 확장
```

### 2. Asset Scanner 오류

#### Cannot find module 'scripts/asset-scanner.js'
**원인**: 파일이 없거나 권한 문제
**해결책**:
```bash
# 1단계: 파일 존재 확인
ls -la scripts/asset-scanner.js

# 2단계: 권한 설정 (Linux/macOS)
chmod +x scripts/asset-scanner.js

# 3단계: Node.js로 직접 실행
node scripts/asset-scanner.js
```

#### Asset Scanner 실행 시간 과도하게 오래 걸림 (>30초)
**원인**: 메모리 부족 또는 파일 시스템 문제
**해결책**:
```bash
# 1단계: 메모리 상태 확인
# Windows: Task Manager에서 Node.js 프로세스 확인
# Linux/macOS: htop 또는 top으로 확인

# 2단계: 메모리 제한 증가
export NODE_OPTIONS="--max-old-space-size=6144"

# 3단계: 부분 스캔 실행
# asset-scanner.js 코드에서 스캔 범위 축소 (임시)
```

#### SyntaxError: Unexpected token 'export'
**원인**: Node.js 버전 또는 모듈 형식 문제
**해결책**:
```bash
# 1단계: Node.js 버전 확인
node --version
# v18.17.0 이상이어야 함

# 2단계: package.json type 확인
grep '"type"' package.json
# "type": "module"이 있는지 확인

# 3단계: CommonJS로 실행
node --input-type=module scripts/asset-scanner.js
```

### 3. Context Loader 오류

#### TypeError: Cannot read property 'map' of undefined
**원인**: project-dna.json 구조 문제
**해결책**:
```bash
# 1단계: 파일 구조 확인
cat project-dna.json | head -20

# 2단계: JSON 유효성 검사
node -e "console.log(JSON.parse(require('fs').readFileSync('project-dna.json', 'utf8')))"

# 3단계: 백업에서 복구
git checkout HEAD -- project-dna.json

# 4단계: 최소 구조로 재생성
cat > project-dna.json << 'EOF'
{
  "projectName": "Dhacle",
  "coreRules": {},
  "agentSystem": {
    "totalAgents": 16
  }
}
EOF
```

### 4. npm Scripts 오류

#### npm ERR! missing script: [script-name]
**원인**: package.json에 스크립트가 없음
**해결책**:
```bash
# 1단계: 사용 가능한 스크립트 확인
npm run

# 2단계: package.json 확인
grep -A 10 '"scripts"' package.json

# 3단계: 누락된 스크립트 추가 (예시)
npm pkg set scripts.jscpd:check="jscpd ."
npm pkg set scripts.scan:assets="node scripts/asset-scanner.js"
```

#### Error: spawn ENOENT
**원인**: 명령어나 바이너리를 찾을 수 없음
**해결책**:
```bash
# 1단계: PATH 확인
echo $PATH

# 2단계: Node.js 경로 확인
which node
which npm

# 3단계: 바이너리 재설치 (필요시)
npm install -g npm
npm install
```

### 5. TypeScript 및 빌드 오류

#### Error TS2307: Cannot find module '@/types'
**원인**: 경로 매핑 또는 타입 파일 문제
**해결책**:
```bash
# 1단계: tsconfig.json 확인
grep -A 5 '"paths"' tsconfig.json

# 2단계: 타입 파일 존재 확인
ls src/types/

# 3단계: 타입 재생성
npm run types:generate
```

#### Module not found: Can't resolve 'some-module'
**원인**: 의존성 설치 안됨 또는 버전 충돌
**해결책**:
```bash
# 1단계: 의존성 확인
npm list [module-name]

# 2단계: 재설치
npm install [module-name]

# 3단계: 캐시 클리어 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🏥 시스템 리소스 문제 대응

### 메모리 부족 (JavaScript heap out of memory)
**증상**: 
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

**즉시 대응**:
```bash
# 1단계: Node.js 메모리 제한 증가
export NODE_OPTIONS="--max-old-space-size=8192"  # 8GB

# 2단계: 시스템 메모리 확인
# Windows: tasklist | findstr node
# Linux/macOS: ps aux | grep node

# 3단계: 작업 범위 축소
# - Asset Scanner: 특정 폴더만 스캔
# - jscpd: pattern 범위 축소
# - 빌드: 증분 빌드 활용
```

**근본적 해결**:
```bash
# 메모리 효율적인 대안 사용
# 1. 배치 처리: 큰 작업을 작은 단위로 분할
# 2. 스트리밍: 파일을 한 번에 모두 로드하지 않고 스트리밍
# 3. 가비지 컬렉션: --expose-gc 플래그로 수동 GC
```

### 디스크 공간 부족
**증상**: `ENOSPC: no space left on device`

**즉시 대응**:
```bash
# 1단계: 디스크 사용량 확인
df -h .

# 2단계: 임시 파일 정리
rm -rf node_modules/.cache
rm -rf .next
rm -rf jscpd-report

# 3단계: 로그 파일 정리
find . -name "*.log" -size +10M -delete
```

### CPU 과부하
**증상**: 시스템 응답 없음, 팬 소음 증가

**즉시 대응**:
```bash
# 1단계: CPU 사용률 확인
# Windows: Task Manager
# Linux/macOS: htop

# 2단계: Node.js 프로세스 제한
# 동시 실행 프로세스 수 줄이기
npm config set maxsockets 5

# 3단계: 우선순위 낮추기 (Linux/macOS)
nice -n 10 npm run scan:assets
```

---

## 🔍 새로운 오류에 대한 체계적 접근법

### 1단계: 오류 정보 수집
```bash
# 완전한 오류 메시지 기록
npm run [failed-command] 2>&1 | tee error-log.txt

# 환경 정보 수집
node --version
npm --version
git status --porcelain
pwd

# 최근 변경사항 확인
git log --oneline -5
git diff HEAD~1
```

### 2단계: 오류 분석
```bash
# 키워드 기반 검색
# - 오류 메시지의 핵심 키워드 식별
# - 파일명, 라인 번호, 함수명 확인
# - 스택 트레이스 분석

# 재현 가능성 확인
# 1. 같은 명령어 재실행
# 2. 다른 터미널에서 실행
# 3. 최소한의 조건에서 재현 시도
```

### 3단계: 해결 시도 우선순위
```bash
# Level 1: 즉시 시도 가능한 방법
# - 명령어 재실행
# - 파일 권한 확인
# - 경로 문제 확인

# Level 2: 환경 리셋
# - npm cache clean --force
# - rm -rf node_modules && npm install
# - export NODE_OPTIONS="--max-old-space-size=4096"

# Level 3: 백업에서 복구
# - git stash (현재 변경사항 백업)
# - git checkout HEAD -- [문제파일]
# - git reset --hard HEAD~1 (최후 수단)
```

### 4단계: 해결책 검증
```bash
# 해결 후 반드시 확인
npm run scan:assets     # 핵심 기능 테스트
npm run jscpd:check     # 검증 도구 테스트
npm run build           # 전체 빌드 테스트

# 부작용 확인
git status              # 의도치 않은 변경 확인
npm run verify:parallel # 전체 검증
```

---

## 🔄 롤백 및 복구 전략

### 즉시 롤백 (Safe Rollback)
```bash
# 현재 변경사항만 취소
git stash
# 또는 특정 파일만
git checkout HEAD -- [filename]

# npm 의존성 문제시
rm -rf node_modules package-lock.json
git checkout HEAD -- package.json package-lock.json
npm install
```

### 단계별 롤백 (Step-by-step Rollback)
```bash
# 1단계: 작업 상태 백업
git stash push -m "작업 중단 시점 백업"

# 2단계: 마지막 안정 상태로 복원
git log --oneline -10
git reset --hard [안정한-커밋-해시]

# 3단계: 의존성 재설치
npm ci  # package-lock.json 기준으로 정확히 설치

# 4단계: 검증
npm run scan:assets
npm run jscpd:check
```

### 완전 복구 (Full Recovery)
```bash
# 1단계: 현재 브랜치 백업
git branch backup-$(date +%Y%m%d-%H%M%S)

# 2단계: 원격 저장소 최신 상태로 복구
git fetch origin
git reset --hard origin/feature/safe-massive-refactor

# 3단계: 클린 설치
rm -rf node_modules package-lock.json
npm install

# 4단계: 전체 검증
npm run verify:parallel
```

---

## 📞 에스컬레이션 기준 및 절차

### 즉시 에스컬레이션 (Critical)
**기준**:
- 데이터 손실 발생 또는 위험
- 복구 불가능한 시스템 변경
- 보안 취약점 발견
- 전체 프로젝트 빌드 불가능

**절차**:
1. **즉시 작업 중단**
2. **현재 상태 백업**: `git stash` 또는 `git commit`
3. **상황 문서화**: 오류 메시지, 실행한 명령어, 환경 정보
4. **에스컬레이션**: 아래 정보와 함께 보고

### 1시간 후 에스컬레이션 (High Priority)
**기준**:
- 1시간 내 해결 시도했지만 실패
- 핵심 기능(Asset Scanner, jscpd) 작동 불가
- 개발 환경 완전 중단

### 4시간 후 에스컬레이션 (Medium Priority)
**기준**:
- 반나절 해결 시도했지만 진전 없음
- 우회책으로도 해결되지 않음
- 성능 극심한 저하 (10배 이상)

### 에스컬레이션 시 포함할 정보
```markdown
## 🚨 예외 상황 보고

### 기본 정보
- 발생 시간: [YYYY-MM-DD HH:MM]
- 심각도: Critical / High / Medium
- 영향 범위: [어떤 기능이 영향받는지]

### 환경 정보
- OS: [Windows/macOS/Linux]
- Node.js: [버전]
- Git 브랜치: [브랜치명]
- 마지막 정상 커밋: [커밋 해시]

### 오류 상세
```bash
[전체 오류 메시지 복사]
```

### 시도한 해결 방법
1. [시도한 방법 1] - [결과]
2. [시도한 방법 2] - [결과]
3. [시도한 방법 3] - [결과]

### 현재 상태
- 작업 중단됨 / 진행 중 / 우회책 적용
- 데이터 손실: 있음 / 없음
- 백업 상태: [백업 방법과 위치]

### 요청사항
- 즉시 지원 필요 / 지침 요청 / 확인 필요
```

---

## 🛠️ 디버깅 도구 및 방법

### 로그 수집 도구
```bash
# npm 로그 상세 출력
npm run [command] --verbose

# 모든 출력을 파일로 저장
npm run [command] > output.log 2>&1

# 실시간 로그 확인
tail -f output.log
```

### 시스템 상태 확인 도구
```bash
# 프로세스 상태
ps aux | grep node

# 메모리 사용량
# Windows: wmic process where name="node.exe" get workingsetsize,processid
# Linux/macOS: ps -o pid,ppid,pmem,pcpu,comm -p $(pgrep node)

# 파일 시스템 상태
ls -la [problem-file]
file [problem-file]
```

### Node.js 디버깅
```bash
# 디버그 모드로 실행
node --inspect scripts/asset-scanner.js

# 메모리 사용량 추적
node --trace-gc scripts/asset-scanner.js

# 상세 오류 정보
node --trace-warnings scripts/asset-scanner.js
```

---

## 💡 예방적 조치

### 정기 상태 확인 (매일)
```bash
# 핵심 명령어 실행 테스트
npm run scan:assets && echo "✅ Asset Scanner OK"
npm run jscpd:check && echo "✅ jscpd OK"
npm run context:load && echo "✅ Context Loader OK"

# 디스크 공간 확인
df -h .

# Git 상태 확인
git status --porcelain
```

### 자동 백업 설정
```bash
# 중요 파일 자동 백업 (예시)
cp project-dna.json project-dna.json.backup
cp .jscpd.json .jscpd.json.backup
cp package.json package.json.backup

# Git 자동 스테이징
git add project-dna.json .jscpd.json
```

### 환경 일관성 유지
```bash
# Node.js 버전 고정
echo "v18.17.0" > .nvmrc

# npm 버전 고정
npm config set engine-strict true
```

---

## 🎯 성공 기준 및 복구 확인

### 정상 상태 확인 체크리스트
- [ ] `npm run scan:assets` 성공 (8초 이내)
- [ ] `npm run jscpd:check` 성공 (5초 이내)
- [ ] `npm run context:load` 성공 (3초 이내)
- [ ] `npm run build` 성공 (45초 이내)
- [ ] `npm run dev` 정상 실행
- [ ] Git 상태 클린 또는 의도된 변경사항만 존재
- [ ] 디스크 여유 공간 1GB 이상
- [ ] 메모리 사용량 정상 범위 (500MB 이하)

### 성능 기준 확인
```bash
# 실행 시간 측정
time npm run scan:assets
# 예상: real 0m8.200s 이내

time npm run jscpd:check  
# 예상: real 0m5.100s 이내

# 메모리 사용량 확인
# Windows: Task Manager에서 확인
# Linux/macOS: htop으로 확인
```

### 장기 안정성 확인
```bash
# 1시간 후 재확인
# - 메모리 누수 없음
# - CPU 사용률 정상화
# - 로그 파일 크기 정상

# 다음날 재확인  
# - 모든 명령어 정상 실행
# - 성능 저하 없음
# - 새로운 오류 없음
```

---

*이 가이드는 Dhacle 프로젝트에서 발생할 수 있는 모든 예외 상황에 대한 체계적 대응 방안을 제공합니다. Context 없는 AI도 이 가이드를 따라 95% 이상의 문제를 안전하게 해결할 수 있습니다.*