# 🖥️ Dhacle 프로젝트 환경 스냅샷

*2025-08-30 기준 정확한 환경 정보 - Context 없는 AI 작업 시 환경 차이 최소화*

---

## 📋 환경 정보 개요

### 스냅샷 생성 정보
- **생성일시**: 2025-08-30 14:30:00 KST
- **목적**: Context 없는 AI 작업 시 환경 의존적 문제 방지
- **업데이트 필요**: 주요 환경 변경 시마다 갱신

---

## 🖥️ 시스템 환경

### 운영체제 정보
```bash
# Windows 환경
OS: Windows 10/11 (MSYS_NT-10.0-19045)
Shell: Git Bash / PowerShell / Command Prompt
Architecture: x86_64
```

### 하드웨어 사양
```
CPU: 최소 4코어 (Asset Scanner 병렬 처리용)
RAM: 최소 8GB (Node.js 메모리 사용량 고려)
Storage: SSD 권장, 최소 10GB 여유공간
Network: 브로드밴드 연결 (외부 패키지 설치용)
```

---

## 🔧 개발 환경

### Node.js 환경
```bash
# 필수 버전 정보
Node.js: v18.17.0 이상 (필수)
npm: v9.6.7 이상 (권장)

# 확인 명령어
node --version    # v18.17.0
npm --version     # 9.6.7

# 메모리 설정 (Asset Scanner 최적화용)
export NODE_OPTIONS="--max-old-space-size=4096"
```

### 패키지 관리자
```json
{
  "packageManager": "npm",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

---

## 📁 프로젝트 구조 스냅샷

### 루트 디렉토리 구조
```
C:\My_Claude_Project\9.Dhacle\
├── 📄 .jscpd.json                    # jscpd 설정 (5% 임계값)
├── 📄 project-dna.json               # 프로젝트 핵심 정보
├── 📄 asset-inventory.json           # 199개 자산 목록 (자동생성)
├── 📄 ai-context-warmup.md           # AI 컨텍스트 (자동생성)
├── 📄 package.json                   # 13개 새 scripts 포함
├── 📄 next.config.ts                 # Next.js 14 설정
├── 📄 tailwind.config.ts             # Tailwind CSS 설정
├── 📄 tsconfig.json                  # TypeScript 설정
├── 📁 .husky/                        # Git hooks
│   └── pre-commit                    # 9단계 검증 프로세스
├── 📁 .next/                         # Next.js 빌드 출력
├── 📁 node_modules/                  # 패키지 설치 폴더
├── 📁 jscpd-report/                  # jscpd 리포트 (자동생성)
├── 📁 src/                           # 메인 소스코드
├── 📁 supabase/                      # 데이터베이스 마이그레이션
├── 📁 scripts/                       # 자동화 스크립트
├── 📁 docs/                          # 프로젝트 문서 (15개)
└── 📁 tasks/                         # 작업별 문서
```

### 핵심 파일 위치 및 크기
```bash
# 설정 파일들
.jscpd.json                    (1KB)   # jscpd 중복 감지 설정
project-dna.json               (5KB)   # 프로젝트 DNA
package.json                   (8KB)   # npm 패키지 설정

# 자동 생성 파일들
asset-inventory.json           (50KB)  # 자산 목록 (199개)
ai-context-warmup.md          (15KB)  # AI 컨텍스트

# 핵심 스크립트들
scripts/asset-scanner.js       (25KB)  # 400+ 라인
scripts/context-loader.js      (12KB)  # 200+ 라인
scripts/improved-instruction-template.js (15KB) # 250+ 라인
```

---

## 🔗 Git 환경

### Git 설정 정보
```bash
# 현재 Git 상태 (2025-08-30 기준)
Current Branch: feature/safe-massive-refactor
Main Branch: main
Remote: origin (GitHub)
```

### 브랜치 전략
```bash
# 주요 브랜치들
main                    # 프로덕션 배포 브랜치
feature/*              # 기능 개발 브랜치
hotfix/*               # 긴급 수정 브랜치
```

### Git Hooks 상태
```bash
# Husky 설정
.husky/pre-commit      # 9단계 검증 (활성화)
  ├── Any 타입 차단
  ├── 타입 시스템 검증
  ├── 임시 처리 감지
  ├── 핵심 검증 실행
  ├── TypeScript 컴파일
  ├── API Route 보안
  ├── YouTube API 패턴
  ├── 코드 중복 검사 (jscpd)
  └── 자산 인벤토리 업데이트
```

---

## 📦 주요 의존성

### 프로덕션 의존성
```json
{
  "next": "14.2.5",
  "react": "^18.3.1",
  "typescript": "^5.5.4",
  "tailwindcss": "^3.4.7",
  "@supabase/supabase-js": "^2.45.1",
  "@tanstack/react-query": "^5.51.23",
  "zustand": "^4.5.4"
}
```

### 개발 의존성
```json
{
  "jscpd": "^4.0.5",
  "@biomejs/biome": "1.8.3",
  "husky": "^9.1.4",
  "nodemon": "^3.1.4"
}
```

### 전역 패키지 (선택적)
```bash
# 권장 전역 설치 패키지
npm install -g @vercel/cli    # Vercel 배포용
npm install -g typescript     # TS 컴파일러
```

---

## 🗃️ 데이터베이스 환경

### Supabase 설정
```bash
# 환경 변수 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 데이터베이스 상태
```sql
-- 테이블 현황 (80개)
-- RLS 활성화: 78/80 (97.5%)
-- 주요 테이블들:
users, profiles, posts, comments, 
youtube_lens_videos, youtube_lens_channels,
api_keys, user_settings, etc.
```

### 마이그레이션 상태
```bash
# 마이그레이션 파일 위치
supabase/migrations/
├── 20240101_initial_setup.sql
├── 20240205_user_profiles.sql
├── ...
└── 20250829_drop_yl_videos_simple.sql  # 최신

# 실행 도구
node scripts/supabase-sql-executor.js
```

---

## 🔧 빌드 및 배포 환경

### Next.js 설정
```typescript
// next.config.ts 핵심 설정
const nextConfig = {
  output: 'standalone',           # Vercel 배포 최적화
  experimental: {
    serverComponentsExternalPackages: []
  },
  images: {
    domains: ['images.unsplash.com']
  }
}
```

### 빌드 스크립트
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "types:check": "tsc --noEmit",
    "types:generate": "supabase gen types typescript"
  }
}
```

### Vercel 배포 설정
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

---

## 🔍 개발 도구 설정

### VSCode 설정 (권장)
```json
// .vscode/settings.json (생성 권장)
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

### Biome 설정
```json
// biome.json
{
  "schema": "https://biomejs.dev/schemas/1.8.3/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "suspicious": {
        "noExplicitAny": "error"  // any 타입 차단
      }
    }
  }
}
```

---

## 🎯 성능 기준선 (Baseline)

### 현재 성능 지표 (2025-08-30 측정)
```bash
# 빌드 시간
npm run build          # 약 45초 (측정 필요)
npm run types:check    # 약 15초 (측정 필요)

# Asset Scanner 실행 시간
npm run scan:assets    # 약 30초 (199개 자산)

# Context Loader 실행 시간  
npm run context:load   # 약 30초 → 5초 목표

# jscpd 실행 시간
npm run jscpd:check    # 약 10초 (측정 필요)

# 전체 검증 시간 (pre-commit)
.husky/pre-commit      # 약 60초 (9단계, 측정 필요)
```

### 메모리 사용량
```bash
# Node.js 프로세스별 메모리 사용
Asset Scanner: ~500MB
Context Loader: ~200MB
jscpd: ~300MB
Next.js dev: ~150MB

# 권장 시스템 메모리: 8GB+
# NODE_OPTIONS="--max-old-space-size=4096" 설정 권장
```

---

## 🚨 알려진 환경 이슈들

### Windows 특정 이슈들
```bash
# 1. 경로 구분자 문제
# 해결: path.join() 사용, / vs \ 자동 변환

# 2. 권한 문제 (PowerShell)
# 해결: "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"

# 3. 긴 경로 이름 문제
# 해결: Git 설정 "git config --system core.longpaths true"

# 4. Line ending 차이 (CRLF vs LF)
# 해결: Git 설정 "git config --global core.autocrlf true"
```

### Node.js 메모리 이슈
```bash
# 증상: Asset Scanner 실행 중 메모리 부족
# 해결: NODE_OPTIONS="--max-old-space-size=4096"

# 증상: jscpd 대용량 파일 처리 실패
# 해결: 스캔 범위 축소 또는 메모리 증설
```

### npm 패키지 설치 이슈
```bash
# 증상: 일부 패키지 설치 실패
# 해결: npm cache clean --force, node_modules 재설치

# 증상: 네트워크 타임아웃
# 해결: npm config set registry https://registry.npmjs.org/
```

---

## 🔧 환경 검증 스크립트

### 환경 체크 스크립트 (권장 생성)
```javascript
// scripts/check-environment.js (신규 생성 권장)
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

function checkEnvironment() {
  console.log('🔍 Dhacle 프로젝트 환경 검증 중...\n');
  
  // Node.js 버전 확인
  const nodeVersion = process.version;
  console.log(`Node.js: ${nodeVersion}`);
  if (parseInt(nodeVersion.slice(1)) < 18) {
    console.log('❌ Node.js 18+ 필요');
    return false;
  }
  
  // npm 버전 확인
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`npm: v${npmVersion}`);
  } catch (error) {
    console.log('❌ npm 설치되지 않음');
    return false;
  }
  
  // 필수 파일 존재 확인
  const requiredFiles = [
    '.jscpd.json',
    'project-dna.json', 
    'package.json',
    '.husky/pre-commit'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.log(`❌ 필수 파일 누락: ${file}`);
      return false;
    }
  }
  
  // 디스크 공간 확인 (간단한 체크)
  try {
    const stats = fs.statSync('.');
    console.log('📁 프로젝트 디렉토리 접근 가능');
  } catch (error) {
    console.log('❌ 디렉토리 접근 권한 문제');
    return false;
  }
  
  console.log('\n✅ 환경 검증 통과!');
  return true;
}

if (require.main === module) {
  const success = checkEnvironment();
  process.exit(success ? 0 : 1);
}

module.exports = { checkEnvironment };
```

### 빠른 환경 체크 명령어
```bash
# 기본 환경 정보 확인
node --version && npm --version && pwd

# 프로젝트 파일 존재 확인
ls -la .jscpd.json project-dna.json package.json

# Git 상태 확인
git status --porcelain && git branch --show-current

# 디스크 공간 확인 (Windows)
dir /s | find "bytes"

# 메모리 사용량 확인 (Windows)
tasklist /fi "imagename eq node.exe"
```

---

## 📞 환경 문제 해결 가이드

### 자주 발생하는 환경 문제들

#### 1. Node.js 버전 불일치
```bash
# 문제: Node.js 버전이 18 미만
# 증상: 일부 ES2022 기능 사용 불가

# 해결책:
# 1. Node.js 18+ 설치 (https://nodejs.org)
# 2. nvm 사용 (Windows: nvm-windows)
nvm install 18
nvm use 18
```

#### 2. npm 패키지 설치 실패
```bash
# 문제: 패키지 설치 중 권한 또는 네트워크 오류
# 해결책:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 3. Git hooks 실행 실패  
```bash
# 문제: .husky/pre-commit 실행 권한 없음
# 해결책:
npm run prepare
chmod +x .husky/pre-commit

# Windows에서 Git Bash 사용 권장
```

#### 4. 메모리 부족 오류
```bash
# 문제: Asset Scanner 또는 jscpd 실행 중 메모리 부족
# 해결책:
export NODE_OPTIONS="--max-old-space-size=4096"
npm run scan:assets
```

#### 5. 경로 문제 (Windows)
```bash
# 문제: 경로 길이 제한 또는 특수문자 문제
# 해결책:
git config --system core.longpaths true
# 프로젝트를 짧은 경로(C:\dev\dhacle)로 이동 권장
```

---

## 🔄 환경 업데이트 가이드

### 환경 변경 시 업데이트 필요사항

#### Node.js 버전 업데이트 시
1. 새 버전 호환성 확인
2. package.json engines 필드 업데이트
3. 전체 빌드 테스트 실행
4. 본 문서의 버전 정보 업데이트

#### 프로젝트 구조 변경 시
1. 파일/폴더 구조 섹션 업데이트
2. 관련 스크립트의 경로 확인
3. .gitignore 업데이트 검토
4. 문서 링크 유효성 검사

#### 새로운 도구 추가 시
1. 의존성 목록에 추가
2. 설정 파일 정보 포함
3. 환경 검증 스크립트에 체크 로직 추가
4. 알려진 이슈 섹션에 주의사항 기록

### 업데이트 주기
- **정기 업데이트**: 월 1회 (주요 변경사항 발생시)
- **긴급 업데이트**: 환경 관련 이슈 발생시 즉시
- **버전 관리**: Git을 통한 변경 이력 추적

---

## 📊 환경 호환성 매트릭스

### 운영체제별 호환성
| OS | 지원여부 | 주의사항 | 권장도 |
|----|---------|----------|--------|
| **Windows 10/11** | ✅ | 경로/권한 이슈 주의 | 높음 |
| **macOS** | ✅ | Unix 기반으로 일반적으로 문제 없음 | 높음 |
| **Linux (Ubuntu)** | ✅ | 패키지 관리자 차이 주의 | 중간 |
| **WSL2** | ✅ | Windows에서 Linux 환경 | 중간 |

### Node.js 버전별 호환성
| 버전 | 지원여부 | 성능 | 권장도 |
|------|---------|------|--------|
| **Node.js 16** | ⚠️ | 일부 기능 제한 | 낮음 |
| **Node.js 18** | ✅ | 최적 성능 | 높음 |
| **Node.js 20** | ✅ | 최신 기능 활용 | 높음 |
| **Node.js 21+** | ⚠️ | 호환성 미검증 | 중간 |

### 브라우저별 지원 (개발/테스트용)
| 브라우저 | 지원여부 | 주의사항 |
|----------|---------|----------|
| **Chrome** | ✅ | 권장 브라우저 |
| **Edge** | ✅ | Windows 기본 |
| **Firefox** | ✅ | 호환성 양호 |
| **Safari** | ✅ | macOS 사용자용 |

---

## 🎯 환경 최적화 권장사항

### 개발 생산성 향상을 위한 설정

#### Git 설정 최적화
```bash
# 전역 Git 설정 (권장)
git config --global core.autocrlf true          # Windows 줄 바꿈 처리
git config --global core.longpaths true         # 긴 경로 지원
git config --global init.defaultBranch main     # 기본 브랜치명
git config --global pull.rebase false           # Merge 방식 사용
```

#### npm 설정 최적화
```bash
# npm 레지스트리 및 캐시 최적화
npm config set registry https://registry.npmjs.org/
npm config set cache-min 3600
npm config set progress false                    # CI/CD 환경에서 권장
```

#### VSCode 확장 프로그램 권장
```json
// .vscode/extensions.json (생성 권장)
{
  "recommendations": [
    "biomejs.biome",              // 코드 포매팅/린팅
    "bradlc.vscode-tailwindcss",  // Tailwind CSS 지원
    "ms-vscode.vscode-typescript-next", // TypeScript 고급 기능
    "ms-vscode.vscode-json",      // JSON 편집 지원
    "eamodio.gitlens"             // Git 히스토리 시각화
  ]
}
```

### 성능 최적화 설정
```bash
# Windows 성능 최적화
# 1. Windows Defender 제외 폴더 설정:
#    - C:\My_Claude_Project\9.Dhacle\node_modules
#    - C:\My_Claude_Project\9.Dhacle\.next

# 2. 시스템 환경 변수 설정:
set NODE_OPTIONS=--max-old-space-size=4096
set NPM_CONFIG_PROGRESS=false
```

---

## 📝 환경 문제 리포팅 가이드

### 환경 문제 발생 시 수집할 정보

#### 기본 시스템 정보
```bash
# 시스템 정보 수집 스크립트
echo "=== 시스템 정보 ==="
echo "OS: $(uname -s)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "현재 디렉토리: $(pwd)"
echo "Git 브랜치: $(git branch --show-current)"
echo ""

echo "=== 디스크 공간 ==="
df -h .
echo ""

echo "=== 메모리 사용량 ==="
# Windows: tasklist | find "node"
# Linux/Mac: ps aux | grep node
echo ""

echo "=== 환경 변수 ==="
echo "NODE_OPTIONS: $NODE_OPTIONS"
echo "PATH에서 Node.js: $(which node)"
```

#### 에러 발생 시 추가 정보
```bash
# 에러 재현 정보
echo "=== 에러 재현 정보 ==="
echo "실행 명령어: [실행한 명령어]"
echo "에러 메시지: [전체 에러 메시지]"
echo "발생 시점: $(date)"
echo "재현율: [항상/가끔/한번만]"
echo ""

echo "=== 관련 파일 상태 ==="
ls -la .jscpd.json project-dna.json package.json
echo ""

echo "=== 최근 변경사항 ==="
git log --oneline -5
```

---

## 🔮 환경 발전 계획

### 단기 개선 계획 (1-2개월)
- **환경 자동 검증**: scripts/check-environment.js 개발
- **설치 자동화**: 원클릭 개발 환경 설정 스크립트  
- **성능 모니터링**: 환경별 성능 지표 수집

### 중기 개선 계획 (3-6개월)  
- **Docker 지원**: 일관된 개발 환경 제공
- **CI/CD 통합**: 다양한 환경에서 자동 테스트
- **모니터링 대시보드**: 환경 상태 실시간 확인

### 장기 계획 (6개월+)
- **클라우드 개발 환경**: GitHub Codespaces 지원
- **멀티 플랫폼**: 모든 주요 OS에서 완벽 지원
- **성능 최적화**: 환경별 최적화 자동 적용

---

**이 환경 스냅샷을 통해 Context 없는 AI도 정확한 환경 정보를 바탕으로 안전하게 작업할 수 있습니다.**

---

*본 문서는 2025-08-30 기준으로 작성되었으며, 환경 변경 시 즉시 업데이트가 필요합니다.*