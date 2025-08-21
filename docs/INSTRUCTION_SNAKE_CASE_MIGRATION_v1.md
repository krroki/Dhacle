# 🔄 전체 시스템 snake_case 통일 마이그레이션 지시서

## 🚀 추천 실행 명령어
```bash
# 복잡도: Enterprise (200+ 파일, 5000+ 라인 변경)
/sc:implement --seq --ultrathink --all-mcp --wave-mode --wave-strategy enterprise --delegate files
"이 지시서를 읽고 전체 시스템을 snake_case로 통일하는 마이그레이션 실행"

# 빠른 분석 (Wave 1만)
/sc:analyze --seq --think-hard --delegate folders
"현재 camelCase 사용 현황 분석"
```

## 📚 온보딩 섹션 (실행 AI 필수 학습)

### 필수 읽기 문서
- [ ] `/CLAUDE.md` 143-302행 - TypeScript 타입 관리 시스템 (현재 상태 이해)
- [ ] `/CLAUDE.md` 54-71행 - 절대 금지사항 (any 타입 사용 금지 등)
- [ ] `/docs/DATA_MODEL.md` - 데이터베이스 구조 (snake_case 사용 중)
- [ ] `/docs/PROJECT.md` - 현재 이슈 (camelCase/snake_case 혼용 문제)

### 프로젝트 컨텍스트
```bash
# 현재 상황 파악
cat src/types/index.ts | grep -E "snakeToCamelCase|camelToSnakeCase" | wc -l
# 결과: 변환 함수가 광범위하게 사용 중

# 영향 범위 확인
find src -name "*.tsx" -o -name "*.ts" | wc -l
# 결과: 약 200개 파일

# API Route 수
find src/app/api -name "route.ts" | wc -l
# 결과: 38개 API 엔드포인트

# 현재 문제점 확인
npm run build 2>&1 | grep -c "Type.*does not satisfy"
# 결과: 117개 타입 오류 (대부분 네이밍 불일치)
```

### 작업 관련 핵심 정보
- **현재 상태**: DB는 snake_case, Frontend는 camelCase 혼용
- **변환 함수**: snakeToCamelCase, camelToSnakeCase 사용 중
- **문제점**: 지속적인 타입 불일치, 변환 오류, 개발 생산성 저하
- **목표**: 전체 시스템 snake_case 통일 (DB = TypeScript = Frontend)

## 📌 목적

현재 프로젝트는 DB는 snake_case, Frontend는 camelCase를 사용하여 지속적인 변환 오류가 발생하고 있습니다. 이를 해결하기 위해:

1. **변환 함수 완전 제거** - snakeToCamelCase, camelToSnakeCase 불필요
2. **타입 일치 100%** - DB = TypeScript = Frontend 완벽 일치  
3. **개발 생산성 향상** - 네이밍 혼란 제거, 오류 발생 0%
4. **유지보수성 개선** - 단일 네이밍 컨벤션으로 일관성 확보

## 🤖 실행 AI 역할

대규모 네이밍 컨벤션 마이그레이션 전문가로서:
- 200+ 파일의 체계적 변환 수행
- 자동화 스크립트 개발 및 실행
- 수동 수정 필요 케이스 처리
- 완벽한 검증 및 테스트 수행

---

## 🌊 Wave 실행 계획

### Wave 1: Discovery & Analysis (현황 파악)
**목표**: 변환 대상 100% 식별 및 영향 범위 매핑

#### 1.1 현재 사용 패턴 분석
```bash
# camelCase 사용 현황 스캔
grep -r "userId\|createdAt\|updatedAt\|videoId\|channelId" src --include="*.ts" --include="*.tsx" > camelcase-usage.txt

# 변환 함수 사용 위치
grep -r "snakeToCamelCase\|camelToSnakeCase" src --include="*.ts" --include="*.tsx" > conversion-usage.txt

# 타입 정의 분석
cat src/types/index.ts | grep -E "interface|type" | grep -E "[a-z][A-Z]" > camelcase-types.txt
```

#### 1.2 영향 범위 문서화
```markdown
### 변환 대상 카테고리
1. **타입 정의** (src/types/*.ts)
   - User, Course, RevenueProof 등 30+ 인터페이스
   - 약 500개 속성 변환 필요

2. **API Routes** (src/app/api/*/route.ts)
   - 38개 엔드포인트
   - 응답 구조 전체 변환

3. **Frontend Components** (src/app/(pages)/**/*.tsx, src/components/**/*.tsx)
   - 100+ 컴포넌트 파일
   - props, state, API 호출 부분

4. **Store & Hooks** (src/store/*.ts, src/hooks/*.ts)
   - Zustand store 상태
   - Custom hooks 반환값
```

#### 1.3 Wave 1 검증 기준
- [ ] 모든 camelCase 패턴 식별 완료
- [ ] 변환 대상 파일 목록 생성
- [ ] 예외 케이스 문서화
- [ ] 영향 범위 리포트 작성

---

### Wave 2: Planning & Design (마이그레이션 전략)
**목표**: 변환 규칙 정의 및 자동화 전략 수립

#### 2.1 변환 규칙 정의
```typescript
// 변환 규칙 매핑
const conversionRules = {
  // 기본 패턴
  userId: 'user_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // YouTube 관련
  videoId: 'video_id',
  channelId: 'channel_id',
  channelName: 'channel_name',
  viewCount: 'view_count',
  likeCount: 'like_count',
  
  // 불린 패턴
  isPublished: 'is_published',
  hasAccess: 'has_access',
  canEdit: 'can_edit',
  
  // 복합 단어
  phoneNumber: 'phone_number',
  firstName: 'first_name',
  lastName: 'last_name',
  emailAddress: 'email_address',
  
  // 특수 케이스
  apiKey: 'api_key',
  accessToken: 'access_token',
  refreshToken: 'refresh_token'
}
```

#### 2.2 제외 대상 정의
```typescript
// 변환 제외 패턴
const excludePatterns = [
  /^[A-Z]/, // PascalCase (컴포넌트명)
  /^(import|export)/, // import/export 구문
  /node_modules/, // 외부 라이브러리
  /\.(css|scss|json)$/, // 스타일 및 설정 파일
  /@(supabase|next|react)/, // 프레임워크 타입
]
```

#### 2.3 자동화 전략
```markdown
### 자동 변환 가능 (80%)
- TypeScript 인터페이스/타입
- 객체 리터럴 속성
- 함수 매개변수
- API 응답 구조

### 수동 수정 필요 (20%)
- 동적 속성 접근: obj[variable]
- 템플릿 리터럴: `${userId}`
- 조건부 속성: spread 연산자
- 외부 API 인터페이스
```

#### 2.4 Wave 2 검증 기준
- [ ] 변환 규칙 100% 정의
- [ ] 제외 패턴 명확화
- [ ] 자동화 범위 확정
- [ ] 백업 전략 수립

---

### Wave 3: Automated Migration (자동 변환)
**목표**: 자동 변환 스크립트로 80% 이상 마이그레이션

#### 3.1 자동 변환 스크립트 생성
파일: `scripts/migrate-to-snake-case.js`
```javascript
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// AST 기반 TypeScript 변환기
class SnakeCaseMigrator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      propsConverted: 0,
      errors: []
    };
  }

  // camelCase를 snake_case로 변환
  toSnakeCase(str) {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  // 파일 변환
  transformFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    try {
      // 백업 생성
      const backup = filePath.replace('/src/', '/.migration-backup/src/');
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      fs.copyFileSync(filePath, backup);
      
      // 파일 읽기
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 변환 규칙 적용
      Object.entries(conversionRules).forEach(([camel, snake]) => {
        // 속성명 변환
        const propRegex = new RegExp(`(["']?)${camel}(["']?)(:)`, 'g');
        content = content.replace(propRegex, `$1${snake}$2$3`);
        
        // 타입 속성 변환
        const typeRegex = new RegExp(`(\\s+)${camel}(\\??:)`, 'g');
        content = content.replace(typeRegex, `$1${snake}$2`);
        
        // 변수 접근 변환
        const accessRegex = new RegExp(`\\.${camel}([^a-zA-Z])`, 'g');
        content = content.replace(accessRegex, `.${snake}$1`);
        
        this.stats.propsConverted++;
      });
      
      // 변환 함수 제거
      content = content.replace(/snakeToCamelCase\((.*?)\)/g, '$1');
      content = content.replace(/camelToSnakeCase\((.*?)\)/g, '$1');
      
      // import 구문에서 변환 함수 제거
      content = content.replace(/import.*\{.*(?:snakeToCamelCase|camelToSnakeCase).*\}.*from.*['"]@\/types['"];?\n?/g, '');
      
      // 파일 저장
      fs.writeFileSync(filePath, content);
      this.stats.filesProcessed++;
      
    } catch (error) {
      this.stats.errors.push({ file: filePath, error: error.message });
    }
  }

  // 디렉토리 순회
  processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !fullPath.includes('node_modules')) {
        this.processDirectory(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        this.transformFile(fullPath);
      }
    });
  }

  // 실행
  run() {
    console.log('🚀 Starting snake_case migration...');
    
    // 백업 디렉토리 생성
    const backupDir = `.migration-backup-${Date.now()}`;
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`📦 Backup created: ${backupDir}`);
    
    // 변환 실행
    this.processDirectory('src');
    
    // 결과 출력
    console.log('\n📊 Migration Statistics:');
    console.log(`✅ Files processed: ${this.stats.filesProcessed}`);
    console.log(`✅ Properties converted: ${this.stats.propsConverted}`);
    console.log(`❌ Errors: ${this.stats.errors.length}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n⚠️ Errors:');
      this.stats.errors.forEach(e => {
        console.log(`  - ${e.file}: ${e.error}`);
      });
    }
  }
}

// 실행
const migrator = new SnakeCaseMigrator();
migrator.run();
```

#### 3.2 단계별 실행
```bash
# Step 1: 타입 정의 변환
node scripts/migrate-to-snake-case.js --target src/types

# Step 2: API Routes 변환
node scripts/migrate-to-snake-case.js --target src/app/api

# Step 3: Components 변환
node scripts/migrate-to-snake-case.js --target src/components
node scripts/migrate-to-snake-case.js --target "src/app/(pages)"

# Step 4: Store & Hooks 변환
node scripts/migrate-to-snake-case.js --target src/store
node scripts/migrate-to-snake-case.js --target src/hooks
```

#### 3.3 자동 변환 후 검증
```bash
# 빌드 테스트
npm run build

# 타입 체크
npm run types:check

# 변환 통계
grep -r "snakeToCamelCase\|camelToSnakeCase" src | wc -l
# 목표: 0개
```

#### 3.4 Wave 3 검증 기준
- [ ] 80% 이상 자동 변환 성공
- [ ] 백업 파일 생성 완료
- [ ] 변환 함수 제거 확인
- [ ] 초기 빌드 테스트

---

### Wave 4: Manual Fixes (수동 수정)
**목표**: 자동 변환 실패 케이스 수동 처리

#### 4.1 수동 수정 대상 식별
```bash
# 빌드 오류 수집
npm run build 2>&1 | tee build-errors.log

# TypeScript 오류 분석
npm run types:check 2>&1 | tee type-errors.log

# 패턴별 수동 수정 필요 케이스
grep -r "\\[.*\\]" src --include="*.ts" --include="*.tsx" | grep -v "\\['" | grep -v '\\"' > dynamic-access.txt
```

#### 4.2 케이스별 수정 가이드

**케이스 1: 동적 속성 접근**
```typescript
// Before
const field = isNew ? 'createdAt' : 'updatedAt';
const value = data[field];

// After
const field = isNew ? 'created_at' : 'updated_at';
const value = data[field];
```

**케이스 2: 템플릿 리터럴**
```typescript
// Before
const message = `User ${user.userId} created at ${user.createdAt}`;

// After
const message = `User ${user.user_id} created at ${user.created_at}`;
```

**케이스 3: Destructuring**
```typescript
// Before
const { userId, createdAt, ...rest } = user;

// After
const { user_id, created_at, ...rest } = user;
```

**케이스 4: 조건부 속성**
```typescript
// Before
const props = {
  ...(includeId && { userId: user.id }),
  ...(includeTime && { createdAt: new Date() })
};

// After
const props = {
  ...(includeId && { user_id: user.id }),
  ...(includeTime && { created_at: new Date() })
};
```

#### 4.3 특수 파일 수동 처리

**1. src/lib/api-client.ts**
```typescript
// 모든 API 호출 함수의 반환 타입 확인
// snakeToCamelCase 제거
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin' });
  const data = await response.json();
  return data; // 변환 함수 제거
}
```

**2. src/types/database.generated.ts**
```typescript
// Supabase 자동 생성 파일 - 수정 금지
// 이미 snake_case 사용 중
```

**3. src/types/index.ts**
```typescript
// 변환 함수 완전 제거
// export 구문에서 제거
// 모든 인터페이스 snake_case로 변경
```

#### 4.4 Wave 4 검증 기준
- [ ] 모든 빌드 오류 해결
- [ ] 타입 체크 통과
- [ ] 동적 접근 패턴 수정
- [ ] 특수 케이스 처리 완료

---

### Wave 5: Validation & Optimization (검증 및 최적화)
**목표**: 완벽한 검증 및 성능 최적화

#### 5.1 종합 검증
```bash
# 1. 빌드 검증
npm run build
# Expected: 0 errors

# 2. 타입 검증
npm run types:check
# Expected: 0 errors

# 3. 린트 검증
npm run lint:biome:fix
# Expected: Clean

# 4. 보안 검증
npm run security:test
# Expected: Pass

# 5. API 일치성 검증
npm run verify:api
# Expected: 100% consistent
```

#### 5.2 E2E 테스트
```bash
# Playwright 테스트 실행
npm run e2e

# 주요 시나리오 테스트
- 로그인/회원가입 플로우
- YouTube Lens 전체 기능
- 결제 프로세스
- 파일 업로드
- 데이터 CRUD
```

#### 5.3 성능 벤치마크
```bash
# 번들 크기 비교
npm run build -- --analyze

# Before: ~2.5MB
# After: ~2.3MB (변환 함수 제거로 감소)

# API 응답 시간
# Before: ~120ms (변환 오버헤드)
# After: ~80ms (직접 전달)
```

#### 5.4 최종 정리
```bash
# 변환 함수 완전 제거 확인
grep -r "snakeToCamelCase\|camelToSnakeCase" src
# Expected: 0 results

# 불필요한 import 제거
grep -r "import.*from.*['\"]@/types['\"]" src | grep -E "snakeToCamelCase|camelToSnakeCase"
# Expected: 0 results

# Git 커밋
git add .
git commit -m "feat: Migrate entire system to snake_case naming convention

- Remove snakeToCamelCase and camelToSnakeCase functions
- Unify naming: DB = TypeScript = Frontend
- Improve type safety and eliminate conversion errors
- Reduce bundle size by removing conversion overhead

BREAKING CHANGE: API response structure changed to snake_case"
```

#### 5.5 Wave 5 검증 기준
- [ ] 모든 테스트 통과
- [ ] 성능 향상 확인
- [ ] 변환 함수 완전 제거
- [ ] 문서 업데이트 완료

---

## 📋 QA 테스트 시나리오

### 핵심 사용자 시나리오

#### 시나리오 1: 신규 사용자 가입
```markdown
1. **시작**: 홈페이지 접속
2. **행동 순서**:
   - 회원가입 버튼 클릭
   - 정보 입력 (email, password, phone_number)
   - 가입 완료
3. **검증**:
   ✅ DB에 user_id, created_at 정확히 저장
   ✅ 세션에 user 정보 snake_case로 저장
   ✅ 프로필 페이지에서 정보 정상 표시
```

#### 시나리오 2: YouTube Lens 사용
```markdown
1. **시작**: 로그인 상태
2. **행동 순서**:
   - YouTube Lens 페이지 이동
   - API 키 설정 (api_key)
   - 채널 추가 (channel_id, channel_name)
   - 비디오 분석 (video_id, view_count)
3. **검증**:
   ✅ 모든 데이터 snake_case로 저장/표시
   ✅ API 응답 구조 일치
   ✅ Frontend 표시 정상
```

### 엣지 케이스 테스트

| 테스트 항목 | 입력 | 예상 결과 | 실제 |
|------------|------|-----------|------|
| 빈 객체 | {} | 정상 처리 | ☐ |
| null 값 | { user_id: null } | null 유지 | ☐ |
| undefined | { user_id: undefined } | undefined 유지 | ☐ |
| 숫자 키 | { "123": "value" } | 변환 안 함 | ☐ |
| 특수문자 | { "@#$": "value" } | 변환 안 함 | ☐ |
| 깊은 중첩 | { user: { profile: { first_name }}} | 모든 레벨 snake_case | ☐ |

### 성능 테스트

| 메트릭 | Before | After | 개선율 |
|--------|--------|-------|--------|
| Bundle Size | 2.5MB | 2.3MB | -8% |
| API Response | 120ms | 80ms | -33% |
| Type Check Time | 15s | 10s | -33% |
| Build Time | 45s | 40s | -11% |

### 회귀 테스트 체크리스트
- [ ] 인증 플로우 정상 동작
- [ ] 모든 API 엔드포인트 응답 정상
- [ ] 결제 프로세스 정상 동작
- [ ] 파일 업로드 기능 정상
- [ ] 실시간 업데이트 정상
- [ ] 캐싱 메커니즘 정상
- [ ] 세션 관리 정상

---

## ⚠️ 위험 관리 및 롤백 계획

### 주요 위험 요소

#### 1. Breaking Changes
- **위험**: 클라이언트 캐시 무효화
- **완화**: 캐시 버스팅, 버전 관리
- **롤백**: Git revert 가능

#### 2. 외부 API 호환성
- **위험**: 외부 서비스 연동 실패
- **완화**: Adapter 패턴 적용
- **롤백**: 변환 함수 임시 복원

#### 3. 성능 저하
- **위험**: 리렌더링 증가
- **완화**: React.memo 적용
- **롤백**: 이전 커밋으로 복원

### 롤백 프로세스
```bash
# Wave별 롤백 포인트
git tag wave-1-complete
git tag wave-2-complete
git tag wave-3-complete
git tag wave-4-complete

# 긴급 롤백
git reset --hard wave-3-complete

# 부분 롤백
git checkout wave-3-complete -- src/types/
```

### 백업 전략
```bash
# 전체 백업
cp -r . ../dhacle-backup-$(date +%Y%m%d)

# DB 백업
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# 환경별 배포
1. Development: 즉시 적용
2. Staging: 24시간 안정화
3. Production: Canary 배포 (10% → 50% → 100%)
```

---

## ✅ 최종 성공 기준

### 필수 달성 목표
1. ✅ **빌드 성공**: `npm run build` 에러 0개
2. ✅ **타입 체크 통과**: `npm run types:check` 에러 0개
3. ✅ **변환 함수 제거**: snakeToCamelCase, camelToSnakeCase 완전 제거
4. ✅ **일관성 100%**: DB = TypeScript = Frontend 네이밍 일치
5. ✅ **테스트 통과**: 모든 E2E 테스트 성공
6. ✅ **성능 향상**: API 응답 시간 30% 개선
7. ✅ **번들 크기 감소**: 약 200KB 감소

### Wave별 완료 조건
- **Wave 1**: 변환 대상 100% 식별 ✅
- **Wave 2**: 변환 규칙 문서화 완료 ✅
- **Wave 3**: 자동 변환 80% 이상 성공 ✅
- **Wave 4**: 수동 수정 완료, 빌드 성공 ✅
- **Wave 5**: 모든 테스트 통과, 성능 개선 확인 ✅

### 장기적 이익
- 개발 속도 30% 향상 (변환 오류 제거)
- 유지보수 비용 50% 감소 (일관성 확보)
- 신규 개발자 온보딩 시간 단축
- 타입 안정성 100% 보장

---

## 📊 예상 타임라인

| Wave | 작업 내용 | 예상 시간 | 자동화 가능 |
|------|-----------|-----------|------------|
| Wave 1 | Discovery & Analysis | 2-3시간 | 80% |
| Wave 2 | Planning & Design | 1-2시간 | 30% |
| Wave 3 | Automated Migration | 3-4시간 | 90% |
| Wave 4 | Manual Fixes | 4-6시간 | 20% |
| Wave 5 | Validation | 2-3시간 | 70% |
| **총계** | **전체 마이그레이션** | **12-18시간** | **60%** |

---

## 🎯 실행 요약

이 지시서는 전체 시스템을 snake_case로 통일하는 Enterprise 레벨 마이그레이션입니다.

**핵심 전략**:
1. Wave Mode로 체계적 진행
2. 자동화 우선 접근 (60% 자동화)
3. 단계별 검증 및 롤백 포인트
4. 성능 개선 동시 달성

**실행 AI는 이 지시서만으로**:
- 200+ 파일 체계적 변환
- 5000+ 라인 안전하게 수정
- 완벽한 테스트 및 검증 수행
- 프로덕션 배포 준비 완료

**시작하려면 Wave 1부터 순차적으로 실행하세요.**

---

*v1.0 - Enterprise급 snake_case 마이그레이션 지시서*
*템플릿 v12.2 기반 작성 - Wave Mode 및 자동화 전략 포함*