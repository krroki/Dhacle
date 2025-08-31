# 🚨 응급상황 대응 가이드

*Context 없는 AI를 위한 완전한 예외상황 처리 매뉴얼*

---

## 📋 응급상황 분류 체계

### 🔥 Critical (즉시 중단 필요)
- 시스템 전체 장애 
- 데이터 손실 위험
- 보안 침해 의심
- 빌드/배포 완전 실패

### ⚠️ High (1시간 내 해결)  
- 핵심 기능 일부 장애
- 성능 급격한 저하
- 의존성 충돌 문제
- Git workflow 중단

### 🔧 Medium (당일 해결)
- 개발 도구 오작동
- 문서/리포트 생성 실패
- 권한 또는 환경 문제
- 새로운 에러 패턴

---

## 🆘 Critical 응급상황

### 🔥 시스템 전체 장애

#### 증상
- 모든 npm scripts 실행 실패
- Node.js/npm 명령어 작동 안함
- 프로젝트 파일 손상 의심

#### 즉시 대응 (5분 이내)
```bash
# 1단계: 환경 기본 상태 확인
node --version                  # Node.js 설치 여부 확인
npm --version                   # npm 설치 여부 확인
pwd                            # 현재 위치 확인 (dhacle 프로젝트 루트여야 함)
ls -la package.json           # package.json 존재 여부

# 2단계: Git 상태 점검
git status                    # Git 저장소 상태
git branch                    # 현재 브랜치 확인
git log --oneline -5         # 최근 커밋 5개 확인

# 3단계: 기본 파일 무결성 확인
ls -la .jscpd.json           # jscpd 설정 파일
ls -la project-dna.json      # 프로젝트 DNA 파일
ls -la scripts/asset-scanner.js  # 핵심 스크립트
```

#### 복구 절차
```bash
# A. Node.js/npm 문제인 경우
nvm install 18               # Node.js 18 재설치 (nvm 사용 시)
npm cache clean --force      # npm 캐시 정리
npm install                  # 의존성 재설치

# B. Git 저장소 문제인 경우  
git stash                    # 현재 변경사항 임시 저장
git checkout main            # main 브랜치로 이동
git pull origin main         # 최신 상태로 업데이트

# C. 프로젝트 파일 손상인 경우
git checkout HEAD -- package.json        # package.json 복구
git checkout HEAD -- .jscpd.json        # jscpd 설정 복구
git checkout HEAD -- project-dna.json   # Project DNA 복구
```

### 💥 데이터 손실 위험

#### 증상
- `project-dna.json` 손상/삭제
- `asset-inventory.json` 비어있음
- 중요 설정 파일 누락

#### 즉시 대응
```bash
# 1단계: 백업 확인
git log --oneline --grep="asset-inventory"  # 자동 커밋 히스토리 확인
git show HEAD~1:project-dna.json           # 이전 버전 확인

# 2단계: 자동 복구 시도
git checkout HEAD~1 -- project-dna.json    # 이전 버전으로 복구
npm run scan:assets                        # Asset Scanner 재실행
npm run context:load                       # 컨텍스트 재생성

# 3단계: 수동 복구 (자동 실패 시)
cp project-dna.json.backup project-dna.json  # 백업 파일이 있는 경우
# 또는 기본 구조 재생성
cat > project-dna.json << 'EOF'
{
  "projectName": "Dhacle - YouTube 크리에이터 도구",
  "phase": "Phase 1-4 Completed",
  "lastUpdated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "coreRules": {},
  "agentSystem": { "totalAgents": 16 }
}
EOF
```

### 🛡️ 보안 침해 의심

#### 증상
- 알 수 없는 파일 생성
- 민감한 정보 노출
- 의심스러운 네트워크 활동

#### 즉시 대응 (보안 우선)
```bash
# 1단계: 현재 상태 스냅샷
git status > security-incident-$(date +%Y%m%d-%H%M%S).log
ls -la > file-list-$(date +%Y%m%d-%H%M%S).log
ps aux > process-list-$(date +%Y%m%d-%H%M%S).log

# 2단계: 민감 정보 확인
grep -r "password\|secret\|key" . --exclude-dir=node_modules > security-scan.log
grep -r "process.env" src/ > env-usage.log

# 3단계: 격리 및 정리
git stash                    # 현재 변경사항 격리
npm run verify:parallel      # 전체 시스템 검증 실행
```

---

## ⚠️ High Priority 응급상황

### 🔧 jscpd 실행 완전 실패

#### 일반적 에러 패턴들
```bash
# Error: ENOENT: no such file or directory, open '.jscpd.json'
ls -la .jscpd.json                    # 파일 존재 확인
git checkout HEAD -- .jscpd.json     # Git에서 복구

# Error: Cannot find module 'jscpd'
npm list jscpd                        # 설치 상태 확인
npm install --save-dev jscpd          # 재설치
npm list jscpd                        # 재확인

# Error: EACCES: permission denied, mkdir 'jscpd-report'
mkdir -p jscpd-report                 # 수동 디렉토리 생성
chmod 755 jscpd-report               # 권한 설정

# Error: JavaScript heap out of memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run jscpd:check                   # 메모리 증가 후 재실행
```

#### 단계적 복구 전략
```bash
# Level 1: 기본 복구
npm install --save-dev jscpd
mkdir -p jscpd-report
npm run jscpd:check

# Level 2: 설정 문제 해결
cp .jscpd.json .jscpd.json.backup    # 백업 생성
cat > .jscpd.json << 'EOF'            # 최소 설정으로 재생성
{
  "threshold": 5,
  "reporters": ["console"],
  "pattern": ["src/**/*.{ts,tsx}"],
  "minLines": 3,
  "minTokens": 50
}
EOF

# Level 3: 환경 문제 해결
npx jscpd --version                   # 글로벌 설치로 테스트
npx jscpd . --threshold 5             # 직접 실행 테스트
```

### 📊 Asset Scanner 메모리 부족

#### 메모리 부족 에러 처리
```bash
# Error: JavaScript heap out of memory (Asset Scanner)

# 1단계: 메모리 증가
export NODE_OPTIONS="--max-old-space-size=8192"  # 8GB로 증가
npm run scan:assets

# 2단계: 부분 스캔 (전체 실패 시)
# scripts/asset-scanner.js 임시 수정
sed -i.backup 's/src\/\*\*/src\/components/g' scripts/asset-scanner.js
npm run scan:assets                   # 컴포넌트만 스캔
mv scripts/asset-scanner.js.backup scripts/asset-scanner.js  # 원복

# 3단계: 수동 경량 스캔
find src -name "*.tsx" | wc -l       # 컴포넌트 개수만 확인
find src/app/api -name "route.ts" | wc -l  # API 개수만 확인
find supabase/migrations -name "*.sql" | wc -l  # 테이블 개수만 확인
```

### 🔗 Git Hooks 실행 안됨

#### Pre-commit Hook 문제 해결
```bash
# 1단계: Husky 설치 상태 확인
ls -la .husky/                       # .husky 디렉토리 존재 확인
cat .husky/pre-commit | head -5      # hook 스크립트 내용 확인

# 2단계: 권한 문제 해결
chmod +x .husky/pre-commit           # 실행 권한 부여
./.husky/pre-commit                  # 수동 실행 테스트

# 3단계: Husky 재설정
npm run prepare                      # Husky 재설치
git config core.hooksPath            # Git hooks 경로 확인 (.husky여야 함)

# 4단계: 수동 검증 (Hook 우회 필요 시)
npm run jscpd:check                  # 중복 검사
npm run verify:parallel              # 전체 검증
git commit --no-verify -m "emergency fix"  # Hook 우회 커밋
```

### ⚡ 성능 급격한 저하

#### 성능 이슈 진단
```bash
# 1단계: 현재 성능 측정
time npm run scan:assets             # Asset Scanner 실행 시간
time npm run jscpd:check            # jscpd 실행 시간
time npm run context:load           # Context Loader 실행 시간

# 2단계: 시스템 리소스 확인
df -h .                             # 디스크 용량
free -m                             # 메모리 사용량 (Linux)
# macOS: vm_stat | head -10
# Windows: wmic computersystem get TotalPhysicalMemory

# 3단계: 병목 지점 식별
du -sh node_modules/                # node_modules 크기
du -sh jscpd-report/               # 리포트 폴더 크기
find . -name "*.log" -exec ls -lh {} \;  # 로그 파일 크기
```

#### 즉시 최적화 조치
```bash
# A. 캐시 정리
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# B. 임시 파일 정리
rm -rf jscpd-report/
rm -rf *.log
rm -rf .next/
rm -rf dist/

# C. 스캔 범위 축소 (긴급 시)
# .jscpd.json 임시 수정
cp .jscpd.json .jscpd.json.emergency
sed -i 's/"src\/\*\*\/\*"/"src\/components\/**"/g' .jscpd.json
npm run jscpd:check
mv .jscpd.json.emergency .jscpd.json  # 원복
```

---

## 🔧 Medium Priority 응급상황

### 📝 Context Loader 생성 실패

#### TypeError: Cannot read property 문제
```bash
# 일반적 에러: TypeError: Cannot read property 'coreRules' of undefined

# 1단계: 입력 파일 상태 확인
ls -la project-dna.json asset-inventory.json
cat project-dna.json | jq .          # JSON 구문 검증
cat asset-inventory.json | jq .      # JSON 구문 검증

# 2단계: 손상된 파일 복구
git checkout HEAD -- project-dna.json  # Git에서 복구
npm run scan:assets                     # asset-inventory.json 재생성

# 3단계: 최소 구조로 수동 생성 (Git 복구 실패 시)
cat > project-dna.json << 'EOF'
{
  "projectName": "Dhacle",
  "phase": "Development",
  "lastUpdated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "coreRules": {
    "noAnyTypes": {"violation": "BLOCK"},
    "useEnvTs": {"violation": "BLOCK"}
  },
  "agentSystem": {"totalAgents": 16}
}
EOF
```

### 🏗️ 빌드 시스템 오류

#### Next.js 빌드 실패 처리
```bash
# Error: Module not found 또는 Type errors

# 1단계: TypeScript 에러 확인
npm run types:check                  # 구체적 타입 에러 확인
npx tsc --noEmit                    # 컴파일러 직접 실행

# 2단계: 모듈 해결 문제
npm install                         # 의존성 재설치
rm -rf .next/                      # Next.js 캐시 제거
npm run build                      # 빌드 재시도

# 3단계: 타입 정의 재생성 (Supabase 관련 시)
npm run types:generate             # DB 타입 재생성
npm run build                      # 빌드 재시도
```

### 📊 리포트 생성 실패

#### HTML 리포트 생성 오류
```bash
# jscpd HTML 리포트 생성 실패

# 1단계: 디렉토리 권한 확인
ls -la jscpd-report/
mkdir -p jscpd-report/html         # 수동 생성
chmod 755 jscpd-report/

# 2단계: 최소 리포트로 대체
npm run jscpd:verbose              # 콘솔 출력으로 대체
npm run jscpd:check > jscpd-simple-report.txt  # 텍스트 리포트

# 3단계: JSON 리포트 활용
cat jscpd-report/jscpd-report.json | jq '.statistics'  # 핵심 통계만 추출
```

---

## 🛡️ 예방적 조치 및 모니터링

### 🔍 조기 경고 시스템

#### 시스템 건강성 체크 스크립트
```bash
#!/bin/bash
# scripts/health-check.sh (생성 예정)

echo "🔍 Dhacle 시스템 건강성 체크 시작..."

# 1. 기본 환경 확인
echo "📋 기본 환경:"
node --version 2>/dev/null || echo "❌ Node.js 설치되지 않음"
npm --version 2>/dev/null || echo "❌ npm 설치되지 않음"

# 2. 핵심 파일 확인
echo "📄 핵심 파일:"
[ -f ".jscpd.json" ] && echo "✅ .jscpd.json" || echo "❌ .jscpd.json 누락"
[ -f "project-dna.json" ] && echo "✅ project-dna.json" || echo "❌ project-dna.json 누락"
[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json 누락"

# 3. 의존성 확인
echo "📦 의존성:"
npm list jscpd >/dev/null 2>&1 && echo "✅ jscpd 설치됨" || echo "❌ jscpd 미설치"
npm list typescript >/dev/null 2>&1 && echo "✅ typescript 설치됨" || echo "❌ typescript 미설치"

# 4. 디스크 용량 확인
echo "💾 디스크 용량:"
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
  echo "⚠️ 디스크 사용률 ${DISK_USAGE}% (경고: 90% 초과)"
else
  echo "✅ 디스크 사용률 ${DISK_USAGE}%"
fi

# 5. 핵심 명령어 테스트
echo "🔧 핵심 명령어 테스트:"
timeout 30s npm run jscpd:check >/dev/null 2>&1 && echo "✅ jscpd 정상" || echo "❌ jscpd 실행 실패"
timeout 60s npm run scan:assets >/dev/null 2>&1 && echo "✅ Asset Scanner 정상" || echo "❌ Asset Scanner 실행 실패"

echo "✅ 건강성 체크 완료"
```

### 🚨 자동 복구 메커니즘

#### 자동 문제 해결 스크립트
```bash
#!/bin/bash  
# scripts/auto-recovery.sh (생성 예정)

echo "🔧 자동 복구 시스템 시작..."

# 1. jscpd 문제 자동 해결
if ! npm run jscpd:check >/dev/null 2>&1; then
  echo "🔨 jscpd 문제 감지, 자동 복구 중..."
  npm install --save-dev jscpd
  mkdir -p jscpd-report
  npm run jscpd:check >/dev/null 2>&1 && echo "✅ jscpd 복구 성공" || echo "❌ jscpd 복구 실패"
fi

# 2. Asset Scanner 문제 자동 해결
if ! npm run scan:assets >/dev/null 2>&1; then
  echo "🔨 Asset Scanner 문제 감지, 메모리 증가 후 재시도..."
  export NODE_OPTIONS="--max-old-space-size=4096"
  npm run scan:assets >/dev/null 2>&1 && echo "✅ Asset Scanner 복구 성공" || echo "❌ Asset Scanner 복구 실패"
fi

# 3. Git hooks 문제 자동 해결
if ! ./.husky/pre-commit >/dev/null 2>&1; then
  echo "🔨 Git hooks 문제 감지, 권한 및 설정 복구 중..."
  chmod +x .husky/pre-commit
  npm run prepare
  echo "✅ Git hooks 복구 완료"
fi

echo "🔧 자동 복구 완료"
```

---

## 📋 응급상황 체크리스트

### ⚡ 5분 내 즉시 대응 (Critical)
- [ ] 환경 기본 확인 (Node.js, npm, Git)
- [ ] 프로젝트 위치 확인 (dhacle 루트)
- [ ] 핵심 파일 존재 확인 (package.json, .jscpd.json)
- [ ] Git 상태 확인 (현재 브랜치, 커밋 히스토리)
- [ ] 에러 메시지 정확히 기록
- [ ] 변경사항 Git stash로 격리

### 🔧 15분 내 복구 시도 (High Priority)  
- [ ] 의존성 재설치 (npm install)
- [ ] 캐시 정리 (npm cache clean --force)
- [ ] 설정 파일 복구 (Git checkout)
- [ ] 권한 문제 해결 (chmod +x)
- [ ] 메모리 설정 조정 (NODE_OPTIONS)
- [ ] 부분 기능 테스트 (단계별 확인)

### 📊 30분 내 시스템 검증 (Medium Priority)
- [ ] 전체 빌드 테스트 (npm run build)
- [ ] 핵심 스크립트 실행 (scan:assets, jscpd:check)
- [ ] 타입 체크 통과 (npm run types:check)
- [ ] Git hooks 정상 작동 확인
- [ ] 성능 기준 확인 (실행 시간 측정)
- [ ] 복구 결과 문서화

---

## 🎯 에러 패턴별 해결책 요약

### Node.js/npm 관련
```bash
# 버전 문제
nvm install 18 && nvm use 18

# 권한 문제  
npm config set cache ~/.npm-cache --global
sudo chown -R $(whoami) ~/.npm

# 의존성 충돌
rm -rf node_modules package-lock.json && npm install
```

### jscpd 관련
```bash  
# 설치 문제
npm install --save-dev jscpd

# 메모리 문제
export NODE_OPTIONS="--max-old-space-size=4096"

# 권한 문제
mkdir -p jscpd-report && chmod 755 jscpd-report
```

### Asset Scanner 관련
```bash
# 메모리 부족
export NODE_OPTIONS="--max-old-space-size=8192"

# 파일 접근 권한
find scripts/ -name "*.js" -exec chmod +x {} \;

# 부분 스캔 (긴급 시)
# scripts/asset-scanner.js에서 스캔 범위 축소
```

### Git/Husky 관련
```bash
# Hook 권한
chmod +x .husky/pre-commit

# Husky 재설정
npm run prepare

# Hook 우회 (긴급 시)  
git commit --no-verify -m "emergency commit"
```

---

## 📞 도움 요청 시 제공할 정보

### Context 없는 AI가 사용자에게 보고할 정보
```markdown
## 🆘 해결 불가능한 문제 발생 - 도움 필요

### 📊 환경 정보
- **OS**: [Windows/macOS/Linux]
- **Node.js**: [버전]
- **npm**: [버전]  
- **Git 브랜치**: [현재 브랜치]
- **작업 디렉토리**: [현재 경로]

### ❌ 발생한 에러
**명령어**: `[실행한 명령어]`
**에러 메시지**: 
```
[에러 메시지 전체 복사]
```

### 🔄 시도한 해결책
1. [시도한 방법 1]
2. [시도한 방법 2]  
3. [시도한 방법 3]

### 📁 현재 상태
- **변경된 파일**: [git status 결과]
- **설치된 패키지**: [npm list --depth=0 결과 일부]
- **파일 존재 확인**: 
  - .jscpd.json: [있음/없음]
  - project-dna.json: [있음/없음]
  - package.json: [있음/없음]

### 🎯 요청사항
1. 즉시 해결이 필요한지 아니면 다음 세션에서 해결해도 되는지
2. 현재 상태에서 안전하게 중단하고 롤백해야 하는지
3. 다른 접근 방법이나 대안이 있는지
```

---

## 🎊 성공적인 복구 후 체크리스트

### ✅ 복구 완료 검증
- [ ] 모든 핵심 명령어 정상 실행 (npm run context:update)
- [ ] jscpd 검사 통과 (5% 이하)
- [ ] Asset Scanner 정상 작동 (199개 자산 감지)
- [ ] 빌드 성공 (npm run build)
- [ ] Git hooks 정상 작동 (테스트 커밋)

### 📝 사후 조치
- [ ] 복구 과정 문서화 (다음 발생 시 참조용)
- [ ] 예방 조치 계획 수립
- [ ] 백업 시스템 점검 및 강화
- [ ] 모니터링 알림 설정 검토
- [ ] 팀원 공유 (협업 환경인 경우)

**응급상황은 학습 기회입니다. 해결 과정을 문서화하여 다음에는 더 빠르게 대응할 수 있도록 준비하세요! 🚀**

---

*본 가이드는 2025-08-30 기준 실제 발생 가능한 응급상황을 바탕으로 작성되었습니다.*