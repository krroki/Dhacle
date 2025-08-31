# jscpd 중복 코드 감지 시스템 - 기술 가이드

*Dhacle 프로젝트 코드 품질 관리의 핵심 시스템*

---

## 📋 시스템 개요

### 도입 배경
- **핵심 문제**: "이미 있는데 비슷하거나 같은걸 또 만든다"
- **비용**: 중복 코드로 인한 유지보수 비용 증가, 타입 충돌, 로직 불일치
- **해결책**: jscpd를 통한 실시간 중복 감지 및 5% 임계값 품질 게이트

### jscpd란?
- **정식명칭**: JavaScript Copy/Paste Detector
- **목적**: 소스코드에서 중복된 블록을 감지하고 리포트 생성
- **지원 언어**: JavaScript, TypeScript, Python, Java, C#, SQL 등 100+ 언어
- **특징**: 토큰 기반 분석으로 변수명이 달라도 로직 중복 감지 가능

---

## 🔧 시스템 구성 및 설정

### 1. 설치 및 기본 설정

#### 패키지 설치
```bash
# Dhacle 프로젝트에 설치된 버전
npm install --save-dev jscpd@4.0.5

# 설치 확인
npx jscpd --version
# Expected: 4.0.5
```

#### 프로젝트 구조에서의 위치
```
dhacle/
├── .jscpd.json          ← 핵심 설정 파일
├── jscpd-report/        ← 생성되는 리포트 폴더
│   ├── json/            ← JSON 형식 리포트
│   └── html/            ← HTML 시각화 리포트
├── package.json         ← jscpd scripts 추가
└── .husky/pre-commit    ← Git hook 통합
```

### 2. .jscpd.json 상세 설정 분석

#### 완전한 설정 파일
```json
{
  "threshold": 5,
  "reporters": ["console", "json"],
  "output": "./jscpd-report",
  "pattern": [
    "src/**/*.{ts,tsx,js,jsx}",
    "supabase/**/*.sql",
    "scripts/**/*.js"
  ],
  "ignore": [
    "node_modules/**",
    ".next/**",
    "dist/**",
    "coverage/**",
    "jscpd-report/**",
    "**/*.test.{ts,tsx,js,jsx}",
    "**/*.spec.{ts,tsx,js,jsx}"
  ],
  "minLines": 3,
  "minTokens": 50,
  "exitCode": 1,
  "format": "typescript,javascript,sql",
  "verbose": false,
  "silent": false,
  "blame": true,
  "cache": true,
  "absolute": false
}
```

#### 각 설정 옵션 상세 설명

##### 🎯 임계값 설정 (threshold: 5)
```json
{
  "threshold": 5  // 5% 이상 중복 시 실패
}
```
- **의미**: 전체 코드에서 중복된 부분이 5% 이상이면 실패
- **선택 근거**: 
  - 0-3%: 너무 엄격 (false positive 많음)
  - 3-5%: 적당한 수준 (우리 선택)
  - 5-10%: 관대한 수준
  - 10%+: 너무 관대함
- **계산 방식**: (중복 라인 수 / 전체 라인 수) × 100

##### 📊 리포터 설정 (reporters)
```json
{
  "reporters": ["console", "json"]
}
```
- **console**: 터미널 출력 (실시간 피드백)
- **json**: JSON 파일 생성 (프로그래밍 방식 처리용)
- **html**: HTML 리포트 (시각적 분석용, 별도 명령어로 생성)
- **xml**: XML 형식 (CI/CD 도구 통합용)

##### 🗂️ 스캔 대상 설정 (pattern)
```json
{
  "pattern": [
    "src/**/*.{ts,tsx,js,jsx}",  // React 컴포넌트, 훅, 유틸리티
    "supabase/**/*.sql",         // 데이터베이스 마이그레이션
    "scripts/**/*.js"            // 자동화 스크립트
  ]
}
```
- **Glob 패턴**: Unix shell style wildcards
- **포함 이유**:
  - `src/**/*`: 메인 애플리케이션 코드 (중복 가능성 높음)
  - `supabase/**/*.sql`: SQL 스키마 중복 방지 (테이블 중복 생성 방지)
  - `scripts/**/*.js`: 자동화 스크립트 중복 방지

##### 🚫 제외 대상 설정 (ignore)
```json
{
  "ignore": [
    "node_modules/**",        // 외부 패키지
    ".next/**",              // Next.js 빌드 출력
    "dist/**",               // 빌드 산출물
    "coverage/**",           // 테스트 커버리지 리포트
    "jscpd-report/**",       // jscpd 자체 리포트
    "**/*.test.{ts,tsx,js,jsx}",  // 테스트 파일 (중복 패턴 허용)
    "**/*.spec.{ts,tsx,js,jsx}"   // 스펙 파일
  ]
}
```

##### 🔍 최소 감지 기준
```json
{
  "minLines": 3,    // 최소 3줄 이상
  "minTokens": 50   // 최소 50개 토큰 이상
}
```
- **minLines**: 너무 작은 중복은 무시 (import 문 등)
- **minTokens**: 의미있는 코드 블록만 감지 (공백, 주석 제외)
- **토큰 예시**:
  ```typescript
  // 이 코드는 약 15개 토큰
  const handleClick = () => {
    setLoading(true);
  };
  
  // 이 코드는 약 60개 토큰 (감지 대상)
  const fetchUserData = async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  };
  ```

##### ⚙️ 추가 옵션들
```json
{
  "exitCode": 1,      // 임계값 초과 시 process exit code
  "format": "typescript,javascript,sql",  // 분석 언어 명시
  "verbose": false,   // 상세 출력 비활성화 (기본값)
  "silent": false,    // 완전 조용한 모드 비활성화
  "blame": true,      // Git blame 정보 포함 (누가 작성했는지)
  "cache": true,      // 캐시 활성화 (성능 향상)
  "absolute": false   // 상대 경로 출력 (프로젝트 이식성)
}
```

---

## 📊 jscpd 작동 원리와 분석 방식

### 토큰 기반 분석 (Token-based Analysis)

#### 1. 토큰화 과정
```typescript
// 원본 코드 1
const getUserInfo = async (id) => {
  const response = await fetch(`/api/user/${id}`);
  const user = await response.json();
  return user;
};

// 원본 코드 2 (변수명만 다름)
const getProfileData = async (userId) => {
  const result = await fetch(`/api/user/${userId}`);
  const profile = await result.json();
  return profile;
};
```

#### 토큰 변환 결과
```
원본 코드 1 토큰:
[const, IDENTIFIER, =, async, (, IDENTIFIER, ), =>, {, 
 const, IDENTIFIER, =, await, fetch, (, TEMPLATE_LITERAL, ), ;,
 const, IDENTIFIER, =, await, IDENTIFIER, ., json, (, ), ;,
 return, IDENTIFIER, ;, }]

원본 코드 2 토큰:
[const, IDENTIFIER, =, async, (, IDENTIFIER, ), =>, {,
 const, IDENTIFIER, =, await, fetch, (, TEMPLATE_LITERAL, ), ;,
 const, IDENTIFIER, =, await, IDENTIFIER, ., json, (, ), ;,
 return, IDENTIFIER, ;, }]
```

**결과**: 토큰 패턴이 동일하므로 중복으로 감지!

### 2. 중복률 계산 알고리즘

#### 계산 공식
```
중복률 = (중복된 토큰 수 / 전체 토큰 수) × 100
```

#### 실제 계산 예시
```typescript
// 파일 A: 1000 토큰
// 파일 B: 800 토큰  
// 중복된 부분: 120 토큰

// 파일 A 기준: 120/1000 = 12% 중복
// 파일 B 기준: 120/800 = 15% 중복
// 전체 프로젝트: (120×2)/(1000+800) = 13.3% 중복
```

### 3. Dhacle 프로젝트에서의 중복 감지 사례

#### 자주 발생하는 중복 패턴들

##### 🔄 API 호출 패턴 중복
```typescript
// src/lib/api/users.ts
export async function getUser(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// src/lib/api/posts.ts (중복 패턴!)
export async function getPost(id: string) {
  const { data, error } = await supabase
    .from('posts')  // 테이블명만 다름
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}
```

**jscpd 감지 결과**: 85% 유사도 (임계값 5% 초과로 차단)

##### 🧩 React 컴포넌트 패턴 중복
```tsx
// src/components/UserCard.tsx
export function UserCard({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  
  const handleAction = async () => {
    setLoading(true);
    try {
      await someAction(user.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>{user.name}</h3>
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
}

// src/components/PostCard.tsx (유사한 패턴!)
export function PostCard({ post }: { post: Post }) {
  const [loading, setLoading] = useState(false);  // 동일한 패턴
  
  const handleAction = async () => {            // 동일한 패턴
    setLoading(true);
    try {
      await someAction(post.id);                // post.id만 다름
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">                      // 동일한 패턴
      <h3>{post.title}</h3>                     // 필드명만 다름
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}    // 동일한 패턴
      </button>
    </div>
  );
}
```

**jscpd 감지 결과**: 78% 유사도 (임계값 초과로 차단)

---

## 🚀 실전 사용법 및 워크플로우

### 1. 일상적인 개발 워크플로우

#### 코드 작성 전 중복 확인
```bash
# 새로운 컴포넌트 작성 전
npm run jscpd:check

# 출력 예시 (정상)
✅ jscpd found 0 clones with duplicated code.
Total duplicated lines: 0
Total duplicated tokens: 0  
Total duplicated percentage: 0%
```

#### 코드 작성 후 중복 검사
```bash
# 컴포넌트 작성 후
npm run jscpd:check

# 출력 예시 (중복 발견)
❌ jscpd found 2 clones with duplicated code.
Total duplicated lines: 25
Total duplicated tokens: 180
Total duplicated percentage: 7.2%

Clone found:
- src/components/UserCard.tsx:15-35 (21 lines)
- src/components/PostCard.tsx:15-35 (21 lines)

Duplicated code:
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await someAction(user.id);  // 이 부분만 다름
  } finally {
    setLoading(false);
  }
};
```

### 2. 상세 분석 리포트 활용

#### HTML 리포트 생성 및 활용
```bash
# HTML 리포트 생성
npm run jscpd:report

# 브라우저에서 확인
open jscpd-report/html/index.html
```

#### HTML 리포트 구성
```
jscpd-report/html/
├── index.html           ← 메인 대시보드
├── src/                ← 소스 파일별 분석
│   ├── components/
│   │   ├── UserCard.tsx.html
│   │   └── PostCard.tsx.html
│   └── lib/
└── assets/             ← CSS, JS 리소스
```

#### 리포트 활용 방법
1. **Overview 페이지**: 전체 프로젝트 중복률 확인
2. **Files 탭**: 파일별 중복률 순위 (가장 문제가 되는 파일 우선 확인)
3. **Duplicates 탭**: 구체적인 중복 블록과 위치 확인
4. **Statistics 탭**: 언어별, 폴더별 통계

### 3. Git Pre-commit Hook 통합

#### .husky/pre-commit에서의 동작
```bash
# Step 8: 코드 중복 검사 (jscpd)
echo "📋 Step 8/9: 코드 중복 검사..."
STAGED_CODE_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|sql)$' || true)

if [ -n "$STAGED_CODE_FILES" ]; then
  echo "  중복 코드 검사 중... ($(echo $STAGED_CODE_FILES | wc -w)개 파일)"
  npm run jscpd:silent || {
    echo "⚠️ 코드 중복 발견!"
    echo ""
    echo "💡 해결 방법:"
    echo "  1. 상세 리포트: npm run jscpd:verbose"
    echo "  2. 중복 제거 후 다시 커밋"
    echo "  3. 공통 함수/컴포넌트로 추출"
    echo ""
    echo "📈 중복률이 5% 이상이면 커밋이 차단됩니다."
    exit 1
  }
fi
```

#### 커밋 차단 시나리오
```bash
$ git commit -m "새로운 ProfileCard 컴포넌트 추가"

🔍 Pre-commit 검증 시작...
📋 Step 8/9: 코드 중복 검사...
  중복 코드 검사 중... (3개 파일)

⚠️ 코드 중복 발견!

💡 해결 방법:
  1. 상세 리포트: npm run jscpd:verbose
  2. 중복 제거 후 다시 커밋  
  3. 공통 함수/컴포넌트로 추출

📈 중복률이 5% 이상이면 커밋이 차단됩니다.

# 커밋이 중단됨
```

### 4. 중복 코드 해결 전략

#### 전략 1: 공통 함수 추출
```typescript
// ❌ 중복 발생 (Before)
// UserCard.tsx
const handleUserAction = async (userId: string) => {
  setLoading(true);
  try {
    await fetch(`/api/users/${userId}/action`, { method: 'POST' });
    toast.success('Action completed');
  } catch (error) {
    toast.error('Action failed');
  } finally {
    setLoading(false);
  }
};

// PostCard.tsx  
const handlePostAction = async (postId: string) => {
  setLoading(true);
  try {
    await fetch(`/api/posts/${postId}/action`, { method: 'POST' });
    toast.success('Action completed');
  } catch (error) {
    toast.error('Action failed');
  } finally {
    setLoading(false);
  }
};

// ✅ 공통 함수 추출 (After)
// src/lib/actions.ts
export async function useEntityAction<T>(
  entityType: 'users' | 'posts',
  entityId: string,
  onLoading: (loading: boolean) => void
) {
  onLoading(true);
  try {
    await fetch(`/api/${entityType}/${entityId}/action`, { method: 'POST' });
    toast.success('Action completed');
  } catch (error) {
    toast.error('Action failed');
  } finally {
    onLoading(false);
  }
}

// UserCard.tsx
const handleAction = () => useEntityAction('users', user.id, setLoading);

// PostCard.tsx
const handleAction = () => useEntityAction('posts', post.id, setLoading);
```

#### 전략 2: 제네릭 컴포넌트 생성
```tsx
// ✅ 제네릭 Card 컴포넌트 생성
// src/components/ui/EntityCard.tsx
interface EntityCardProps<T> {
  entity: T;
  title: string;
  onAction: (id: string) => Promise<void>;
}

export function EntityCard<T extends { id: string }>({ 
  entity, 
  title, 
  onAction 
}: EntityCardProps<T>) {
  const [loading, setLoading] = useState(false);
  
  const handleAction = async () => {
    setLoading(true);
    try {
      await onAction(entity.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>{title}</h3>
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
}

// 사용법
// UserCard.tsx
export function UserCard({ user }: { user: User }) {
  return (
    <EntityCard
      entity={user}
      title={user.name}
      onAction={(id) => userAction(id)}
    />
  );
}
```

---

## 🔧 고급 설정 및 커스터마이징

### 1. 프로젝트별 임계값 조정

#### 프로젝트 성격에 따른 임계값 가이드
```json
{
  // 신규 프로젝트 (엄격)
  "threshold": 3,
  
  // 성숙한 프로젝트 (표준) - Dhacle 현재 설정
  "threshold": 5,
  
  // 레거시 프로젝트 (관대)
  "threshold": 10,
  
  // 프로토타입/실험 프로젝트
  "threshold": 15
}
```

### 2. 파일별 세부 설정

#### .jscpdignore 파일 활용
```gitignore
# .jscpdignore

# 생성된 파일들
src/types/database.generated.ts
src/components/ui/*  # shadcn/ui 컴포넌트는 중복 허용

# 설정 파일들
*.config.js
*.config.ts

# 임시 파일들
**/*.temp.*
**/*.tmp.*

# 특정 패턴 파일들
src/lib/constants/*  # 상수 파일은 유사할 수 있음
```

#### 언어별 세부 설정
```json
{
  "languages": {
    "typescript": {
      "minLines": 4,
      "minTokens": 60
    },
    "sql": {
      "minLines": 2,
      "minTokens": 30
    },
    "javascript": {
      "minLines": 3,
      "minTokens": 50
    }
  }
}
```

### 3. CI/CD 통합

#### GitHub Actions 예시
```yaml
# .github/workflows/code-quality.yml
name: Code Quality Check

on: [push, pull_request]

jobs:
  duplicate-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run jscpd
        run: npm run jscpd:check
        
      - name: Upload jscpd report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: jscpd-report
          path: jscpd-report/
```

---

## 📈 성능 최적화 및 모니터링

### 1. 성능 최적화

#### 캐시 활용
```json
{
  "cache": true,
  "cacheLocation": "./node_modules/.cache/jscpd"
}
```
- **효과**: 두 번째 실행부터 50-70% 속도 향상
- **캐시 무효화**: 파일 변경 시 자동으로 캐시 갱신

#### 병렬 처리 최적화
```json
{
  "maxCPU": 4,  // CPU 코어 수에 맞춰 조정
  "maxMemory": "2GB"
}
```

#### 증분 스캔 (Incremental Scanning)
```bash
# Git으로 변경된 파일만 스캔
changed_files=$(git diff --name-only HEAD~1 --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || echo "")
if [ -n "$changed_files" ]; then
  npx jscpd --files "$changed_files"
fi
```

### 2. 메트릭 수집 및 모니터링

#### JSON 리포트 파싱
```javascript
// scripts/jscpd-metrics.js
const fs = require('fs');
const path = require('path');

function analyzeJSCPDReport() {
  const reportPath = './jscpd-report/jscpd-report.json';
  
  if (!fs.existsSync(reportPath)) {
    console.log('No jscpd report found');
    return;
  }
  
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  const metrics = {
    totalFiles: report.statistics.formats.total.sources,
    totalLines: report.statistics.formats.total.lines,
    duplicatedLines: report.statistics.formats.total.duplicatedLines,
    duplicatedPercentage: (report.statistics.formats.total.duplicatedLines / 
                          report.statistics.formats.total.lines * 100).toFixed(2),
    clonesFound: report.duplicates?.length || 0,
    
    // 파일 타입별 분석
    typeScript: {
      files: report.statistics.formats.typescript?.sources || 0,
      duplicated: report.statistics.formats.typescript?.duplicatedLines || 0
    },
    sql: {
      files: report.statistics.formats.sql?.sources || 0,
      duplicated: report.statistics.formats.sql?.duplicatedLines || 0
    }
  };
  
  console.log('📊 jscpd Metrics Summary:');
  console.log(`   Total Files: ${metrics.totalFiles}`);
  console.log(`   Total Lines: ${metrics.totalLines}`);
  console.log(`   Duplicated: ${metrics.duplicatedLines} lines (${metrics.duplicatedPercentage}%)`);
  console.log(`   Clones Found: ${metrics.clonesFound}`);
  
  // 임계값 체크
  if (parseFloat(metrics.duplicatedPercentage) > 5) {
    console.log('❌ Duplication threshold exceeded!');
    process.exit(1);
  } else {
    console.log('✅ Duplication within acceptable limits');
  }
}

analyzeJSCPDReport();
```

### 3. 트렌드 분석

#### 히스토리 추적
```bash
# scripts/track-duplication.sh
#!/bin/bash

# 현재 날짜
date=$(date +"%Y-%m-%d")

# jscpd 실행 및 메트릭 추출
npm run jscpd:check > /dev/null 2>&1
duplication_percentage=$(node scripts/jscpd-metrics.js | grep "Duplicated:" | awk '{print $4}' | sed 's/%//' | sed 's/(//')

# 히스토리 파일에 추가
echo "$date,$duplication_percentage" >> .jscpd-history.csv

# 최근 30일 트렌드 표시
echo "📈 Recent Duplication Trends:"
tail -30 .jscpd-history.csv | while IFS=',' read -r date percent; do
  echo "   $date: $percent%"
done
```

---

## 🐛 문제해결 가이드

### 1. 자주 발생하는 오류들

#### Error: ENOENT: no such file or directory
```bash
# 원인: output 디렉토리가 존재하지 않음
# 해결: 디렉토리 생성
mkdir -p jscpd-report/json
mkdir -p jscpd-report/html

# 또는 package.json script에서 자동 생성
"jscpd:check": "mkdir -p jscpd-report && jscpd ."
```

#### Error: JavaScript heap out of memory
```bash
# 원인: 대용량 프로젝트 분석 시 메모리 부족
# 해결 1: Node.js 메모리 제한 증가
export NODE_OPTIONS="--max-old-space-size=4096"
npm run jscpd:check

# 해결 2: 스캔 범위 축소
# .jscpd.json에서 pattern 축소
{
  "pattern": [
    "src/components/**/*.{ts,tsx}",  # 전체에서 특정 폴더만
    "src/lib/**/*.ts"
  ]
}
```

#### Error: Cannot find module 'jscpd'
```bash
# 원인: 패키지 설치 안됨
# 해결: 재설치
npm install --save-dev jscpd

# 캐시 문제인 경우
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 2. 성능 문제 해결

#### 스캔 속도가 너무 느림
```json
{
  // 성능 최적화 설정
  "cache": true,
  "skipComments": true,
  "skipEmptyLines": true,
  "maxSize": "100kb",  // 큰 파일 제외
  "timeout": 300000    // 5분 타임아웃
}
```

#### False Positive (잘못된 중복 감지)
```json
{
  // 더 엄격한 기준 설정
  "minLines": 5,      // 3 → 5로 증가
  "minTokens": 100,   // 50 → 100으로 증가
  
  // 특정 패턴 제외
  "ignore": [
    "**/constants/**",
    "**/types/**",
    "**/*.config.*"
  ]
}
```

### 3. Git Hook 관련 문제

#### Pre-commit hook이 작동하지 않음
```bash
# 1. Husky 설치 확인
npm run prepare

# 2. Hook 파일 권한 확인
chmod +x .husky/pre-commit

# 3. 수동 테스트
./.husky/pre-commit

# 4. Git hooks 경로 확인
git config core.hooksPath
# Expected: .husky
```

#### Hook에서 npm script 실행 안됨
```bash
# .husky/pre-commit 상단에 추가
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Node.js PATH 확인 및 추가
export PATH="$PATH:./node_modules/.bin"

# npm script 대신 직접 실행
npx jscpd . --silent
```

---

## 📋 체크리스트 및 베스트 프랙티스

### 1. 도입 체크리스트

#### 초기 설정 (✅ Dhacle에서 완료됨)
- [x] jscpd 패키지 설치
- [x] .jscpd.json 설정 파일 생성
- [x] package.json scripts 추가
- [x] .gitignore에 jscpd-report/ 추가
- [x] Pre-commit hook 통합
- [x] 팀원들에게 사용법 공유

#### 정기적인 관리
- [ ] 주간 HTML 리포트 검토
- [ ] 중복률 트렌드 모니터링  
- [ ] 임계값 조정 검토 (분기별)
- [ ] False positive 패턴 ignore 목록 업데이트
- [ ] 새로운 프로젝트 폴더 pattern 추가

### 2. 개발 워크플로우 베스트 프랙티스

#### 코드 작성 시
1. **사전 확인**: 기존 유사 컴포넌트/함수 검색
2. **작성 중**: 3번째 유사 패턴 발견 시 추상화 고려
3. **작성 후**: `npm run jscpd:check` 실행
4. **커밋 전**: Pre-commit hook 자동 검사 통과

#### 중복 발견 시 대응
1. **분석**: HTML 리포트로 구체적 중복 위치 확인
2. **판단**: 의미있는 중복인지 우연한 유사성인지 구분
3. **해결**: 공통 함수 추출 또는 제네릭 컴포넌트 생성
4. **검증**: 해결 후 다시 jscpd 실행하여 개선 확인

#### 팀 협업 시
1. **코드 리뷰**: PR에서 중복 가능성 사전 지적
2. **가이드라인**: 중복 허용 기준 팀 내 공유
3. **교육**: 새 팀원에게 jscpd 사용법 교육
4. **회고**: 스프린트 회고에서 중복 패턴 개선 논의

### 3. 프로젝트 성숙도별 전략

#### 신규 프로젝트 (0-6개월)
- **목표**: 중복 방지 습관 형성
- **임계값**: 3% (엄격)
- **빈도**: 매일 체크
- **초점**: 아키텍처 패턴 정립

#### 성장 프로젝트 (6-18개월) - Dhacle 현재 단계
- **목표**: 품질 유지와 개발 속도 균형
- **임계값**: 5% (표준)
- **빈도**: 커밋마다 자동 체크
- **초점**: 리팩토링 및 최적화

#### 성숙한 프로젝트 (18개월+)
- **목표**: 레거시 중복 제거
- **임계값**: 7% (점진적 개선)
- **빈도**: 주간 리포트 검토
- **초점**: 대규모 리팩토링 계획

---

## 🔮 향후 발전 계획

### 1. Dhacle 프로젝트 로드맵

#### Phase 1: 현재 상태 (완료)
- ✅ jscpd 기본 설정 및 Git hook 통합
- ✅ 5% 임계값 품질 게이트 운영
- ✅ 자동화된 중복 방지 시스템

#### Phase 2: 고도화 (2025년 Q3)
- 🎯 증분 스캔 도입으로 성능 50% 향상
- 🎯 파일 타입별 세분화된 임계값 설정
- 🎯 중복 패턴 자동 리팩토링 제안 시스템

#### Phase 3: 지능화 (2025년 Q4)
- 🎯 AI 기반 중복 패턴 분석
- 🎯 자동 공통 함수 추출 제안
- 🎯 코드 리뷰 시 중복 위험 사전 경고

### 2. 기술적 확장

#### AST 기반 고도화
```javascript
// 향후 구현 예정: AST 기반 의미론적 중복 감지
const ast = require('@babel/parser');

function detectSemanticDuplication(code1, code2) {
  const ast1 = ast.parse(code1, { sourceType: 'module' });
  const ast2 = ast.parse(code2, { sourceType: 'module' });
  
  // 의미론적 구조 비교 (변수명 무관)
  return compareASTStructure(ast1, ast2);
}
```

#### 머신러닝 통합
```python
# 향후 연구 예정: ML 기반 중복 패턴 학습
import tensorflow as tf

class CodeDuplicationModel:
    def __init__(self):
        self.model = self.build_model()
    
    def predict_duplication_risk(self, code_snippet):
        # 코드 패턴 분석하여 중복 가능성 예측
        pass
```

---

## 📚 참고 자료

### 공식 문서
- **jscpd GitHub**: https://github.com/kucherenko/jscpd
- **jscpd NPM**: https://www.npmjs.com/package/jscpd
- **Configuration Guide**: https://github.com/kucherenko/jscpd/blob/master/docs/config.md

### 관련 도구
- **SonarQube**: 엔터프라이즈급 코드 품질 관리
- **CodeClimate**: 자동화된 코드 리뷰
- **ESLint**: JavaScript 코드 품질 검사

### Dhacle 프로젝트 관련
- **Asset Scanner 문서**: `/docs/AI_CONTEXT_SYSTEM_IMPLEMENTATION.md`
- **Project DNA 가이드**: `/project-dna.json`
- **Git Hook 시스템**: `/.husky/pre-commit`

---

## 💡 마무리

jscpd 중복 감지 시스템은 Dhacle 프로젝트의 핵심 품질 관리 도구로, **"이미 있는데 비슷하거나 같은걸 또 만든다"**는 근본적인 문제를 해결합니다.

### 핵심 가치
- **자동화**: Git commit마다 자동 검사
- **실시간**: 5% 임계값으로 즉시 피드백  
- **가시성**: HTML 리포트로 구체적 분석
- **통합성**: Pre-commit hook, Asset Scanner와 완전 통합

### 성공 지표
- 중복률 임계값: **5% 이하 유지**
- 자동 감지율: **Git hook 100% 커버리지**
- 개발 효율: **중복 생성으로 인한 디버깅 시간 80% 감소**

이 시스템을 통해 Dhacle 프로젝트는 지속 가능하고 고품질의 코드베이스를 유지할 수 있습니다.

---

*본 문서는 2025-08-30에 작성된 jscpd 시스템 완전 가이드입니다.*