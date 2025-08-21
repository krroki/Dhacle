# 🚨 CRITICAL: Dhacle 타입 시스템 긴급 복구 지시서

## 🚀 추천 실행 명령어
```bash
# 복잡도: Enterprise (300+ 오류, 시스템 전체 영향)
/sc:implement --seq --ultrathink --wave-mode --wave-strategy systematic --validate
"이 지시서를 읽고 타입 시스템을 4단계 Wave로 복구하세요. 빌드 실패율 100%, 타입 오류 300개 이상 긴급 상황입니다."

# 빠른 긴급 조치 (Wave 1만)
/sc:troubleshoot --seq --think-hard --validate
"Phase 1 긴급 안정화만 즉시 실행"
```

## 📚 온보딩 섹션 (필수 - 건너뛰면 실패 보장)

### 필수 읽기 문서 (순서대로)
- [ ] **`/docs/CRITICAL_TYPE_SYSTEM_RECOVERY_PLAN.md`** 전체 - 현재 재앙 상황 이해
- [ ] **`/CLAUDE.md`** 17-43행 - 자동 변환 스크립트 절대 금지 이유
- [ ] **`/CLAUDE.md`** 189-261행 - TypeScript 타입 관리 시스템 v2.0
- [ ] **`/docs/PROJECT.md`** 45-54행 - 현재 주요 이슈 (TypeScript 오류 13개 → 300개 폭증)
- [ ] **`/docs/AUTOMATION_SCRIPT_GUIDELINES.md`** - 자동화 스크립트 가이드라인

### 프로젝트 컨텍스트
```bash
# 1. 현재 상황 파악 (반드시 실행)
npm run build 2>&1 | head -50  # 빌드 실패 확인
npm run types:check 2>&1 | grep "error" | wc -l  # 타입 오류 개수 (300+)
grep -r "any\[\]" src --include="*.ts" --include="*.tsx" | wc -l  # any 타입 개수

# 2. 문제 파일 확인
cat src/lib/api/courses.ts | grep -A 5 -B 5 "any"  # Any 타입 위치
cat src/types/index.ts | grep "CourseProgress"  # 타입 정의 1
cat src/types/course.ts | grep "CourseProgress" 2>/dev/null  # 타입 정의 2 (중복)

# 3. 삭제된 스크립트 확인 (절대 복원 금지!)
ls -la scripts/backup-unused-scripts-20250131/ | head -10
```

### 작업 관련 핵심 정보
- **현재 상태**: 빌드 실패율 100%, 타입 오류 300개+, 개발 중단 3일+
- **근본 원인**: 38개 자동 스크립트가 "덕트 테이프"처럼 문제를 숨기고 있었음
- **긴급도**: CRITICAL - 즉시 조치 필요
- **예상 소요**: 3-5일 (4단계 Wave 접근)

## 📌 목적
Dhacle 프로젝트의 완전히 붕괴된 타입 시스템을 체계적으로 복구하여 개발을 재개할 수 있도록 하고, 재발 방지 체계를 구축합니다.

## 🤖 실행 AI 역할
타입 시스템 복구 전문가로서 4단계 Wave를 통해 점진적이고 안전하게 시스템을 복구합니다. 절대 일괄 자동 수정을 시도하지 않고, 각 파일의 컨텍스트를 이해한 후 수정합니다.

---

## 🌊 Wave 1: 긴급 안정화 (1일차) - 빌드 통과 최우선

### 목표
☑ 빌드 성공 (현재 실패율 100% → 0%)
☑ 개발 재개 가능
☑ Any 타입 8개 제거

### 실행 단계

#### 1.1 Any 타입 즉시 제거
**파일**: `src/lib/api/courses.ts`

```typescript
// 🔴 현재 상태 (빌드 차단 원인)
// Line 95-101: 로컬 interface 정의 (삭제 필요)
interface CourseDetailResponse {
  course: Course | null;
  lessons: any[];  // ESLint 에러: no-explicit-any
  progress: any[];  // ESLint 에러: no-explicit-any
}

// ✅ 수정 1: 로컬 interface 완전 삭제
// Line 95-101 전체 삭제

// ✅ 수정 2: Line 238 타입 수정
// 수정 전:
return {
  course: mappedCourse,
  lessons: mappedLessons,  // any[]로 추론됨
  progress: progress,       // any[]로 추론됨
}

// 수정 후:
return {
  course: mappedCourse || ({} as Course),  // null 대신 빈 객체
  lessons: (mappedLessons || []) as Lesson[],  // 명시적 타입 캐스팅
  progress: (progress || []) as CourseProgress[],  // 명시적 타입 캐스팅
}

// ✅ 수정 3: Line 242 타입 가드 추가
// 추가할 코드:
if (!mappedCourse) {
  console.error('Course not found');
  return {
    course: {} as Course,
    lessons: [] as Lesson[],
    progress: [] as CourseProgress[],
  };
}
```

#### 1.2 Import 정리
**파일**: `src/lib/api/courses.ts`

```typescript
// Line 1-10: Import 수정
// 수정 전:
import { Course } from '@/types/course';  // 잘못된 import
import { Lesson } from '@/types';
import { CourseProgress } from '@/types/course';  // 중복 정의

// 수정 후:
import { Course, Lesson, CourseProgress } from '@/types';  // 통합 import
```

#### 1.3 타입 불일치 임시 해결
**파일**: `src/app/(pages)/courses/[id]/page.tsx`

```typescript
// Line 45-50: 타입 불일치 수정
// 수정 전:
const { course, lessons, progress } = data;
if (!course) {  // course가 null일 수 있음
  return <div>Course not found</div>;
}

// 수정 후:
const { course, lessons, progress } = data;
if (!course || Object.keys(course).length === 0) {  // 빈 객체 체크
  return <div>Course not found</div>;
}
```

### Wave 1 검증
```bash
# 1. Any 타입 제거 확인
grep -r "any\[\]" src/lib/api/courses.ts  # 결과 없어야 함

# 2. 빌드 테스트
npm run build  # 성공해야 함

# 3. 타입 체크
npm run types:check 2>&1 | grep "error" | wc -l  # 100개 이하로 감소
```

### Wave 1 성공 기준
☑ `npm run build` 성공
☑ Any 타입 0개 (src/lib/api/courses.ts)
☑ 타입 오류 < 100개
☑ 개발 서버 정상 시작 (`npm run dev`)

---

## 🌊 Wave 2: 타입 시스템 통합 (2-3일차) - Single Source of Truth

### 목표
☑ 중복 타입 정의 제거
☑ Single Source of Truth 확립
☑ Import 일원화

### 실행 단계

#### 2.1 중복 타입 파일 정리
```bash
# 1. 중복 파일 백업 후 삭제
cp src/types/course.ts src/types/course.ts.backup
rm src/types/course.ts  # 중복 제거

# 2. 기타 중복 타입 파일 확인
find src -name "*.types.ts" -o -name "*-types.ts"  # 발견 시 통합
```

#### 2.2 src/types/index.ts 통합
**파일**: `src/types/index.ts`

```typescript
// 모든 타입을 여기서 export
export * from './database.generated';  // Supabase 자동 생성 (건드리지 않음)

// Snake to Camel 변환 후 export
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  // ... 나머지 필드
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  // ... 나머지 필드
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId?: string;  // optional로 통일
  completed: boolean;
  completedAt?: string;
  // ... 나머지 필드
}
```

#### 2.3 전체 Import 경로 수정
```bash
# 자동 검색 (수정은 수동으로)
grep -r "from '@/types/" src --include="*.ts" --include="*.tsx" | grep -v "from '@/types'"

# 각 파일 수동 수정
# ❌ 금지:
# import { Course } from '@/types/course'
# import { Database } from '@/types/database'
# 
# ✅ 필수:
# import { Course, Lesson, CourseProgress } from '@/types'
```

### Wave 2 검증
```bash
# 1. 중복 타입 파일 없음 확인
ls -la src/types/  # index.ts, database.generated.ts만 있어야 함

# 2. Import 일관성 확인
node scripts/verify-imports.js  # 모든 import가 @/types에서

# 3. 타입 생성 테스트
npm run types:generate  # 성공해야 함
```

### Wave 2 성공 기준
☑ src/types/index.ts가 유일한 export 지점
☑ 모든 import가 @/types에서
☑ 타입 정의 중복 없음
☑ 타입 오류 < 50개

---

## 🌊 Wave 3: 스마트 자동화 구축 (4일차) - 안전한 도구

### 목표
☑ 검증 전용 도구 구축
☑ 제안 시스템 구축
☑ 신중한 자동화 구현

### 실행 단계

#### 3.1 검증 도구 생성
**파일**: `scripts/type-validator.js` (새 파일)

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 타입 불일치 감지
function detectTypeMismatches() {
  const issues = [];
  
  // Any 타입 탐지
  const anyTypes = execSync('grep -r "any" src --include="*.ts" --include="*.tsx" || true', { encoding: 'utf8' });
  if (anyTypes) {
    anyTypes.split('\n').forEach(line => {
      if (line && !line.includes('// eslint-disable')) {
        issues.push({
          type: 'any-type',
          file: line.split(':')[0],
          line: line
        });
      }
    });
  }
  
  // Import 경로 검증
  const wrongImports = execSync('grep -r "from \'@/types/" src --include="*.ts" --include="*.tsx" | grep -v "from \'@/types\'" || true', { encoding: 'utf8' });
  if (wrongImports) {
    wrongImports.split('\n').forEach(line => {
      if (line) {
        issues.push({
          type: 'wrong-import',
          file: line.split(':')[0],
          line: line
        });
      }
    });
  }
  
  return issues;
}

// 실행
const issues = detectTypeMismatches();
if (issues.length > 0) {
  console.log('🔴 타입 시스템 이슈 발견:');
  issues.forEach(issue => {
    console.log(`  - ${issue.type}: ${issue.file}`);
  });
  process.exit(1);
} else {
  console.log('✅ 타입 시스템 검증 통과');
  process.exit(0);
}
```

#### 3.2 제안 도구 생성
**파일**: `scripts/type-suggester.js` (새 파일)

```javascript
#!/usr/bin/env node
const fs = require('fs');

function suggestFixes(file) {
  const content = fs.readFileSync(file, 'utf8');
  const suggestions = [];
  
  // Any 타입 제안
  if (content.includes(': any')) {
    suggestions.push({
      issue: 'any 타입 사용',
      suggestion: '구체적 타입으로 교체하세요',
      example: ': any → : string | number | 구체적타입'
    });
  }
  
  // Import 제안
  if (content.includes("from '@/types/") && !content.includes("from '@/types'")) {
    suggestions.push({
      issue: '잘못된 import 경로',
      suggestion: "@/types에서만 import하세요",
      example: "from '@/types/course' → from '@/types'"
    });
  }
  
  return suggestions;
}

// 사용법 출력
console.log('사용법: node scripts/type-suggester.js <파일경로>');
```

### Wave 3 검증
```bash
# 1. 검증 도구 테스트
node scripts/type-validator.js  # 이슈 감지 확인

# 2. 제안 도구 테스트
node scripts/type-suggester.js src/lib/api/courses.ts

# 3. pre-commit 테스트
git add .
git commit -m "test"  # 검증 실행 확인
```

### Wave 3 성공 기준
☑ type-validator.js 정상 작동
☑ type-suggester.js 정상 작동
☑ Any 타입 0개
☑ 타입 오류 < 20개

---

## 🌊 Wave 4: 방어 체계 구축 (5일차) - 재발 방지

### 목표
☑ Pre-commit hook 설정
☑ CI/CD 통합
☑ 재발 방지 완성

### 실행 단계

#### 4.1 Pre-commit Hook 강화
**파일**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 타입 시스템 검증 중..."

# 1. Any 타입 차단
if grep -r ": any" src --include="*.ts" --include="*.tsx" | grep -v "eslint-disable"; then
  echo "❌ any 타입 사용 금지!"
  exit 1
fi

# 2. 타입 검증
npm run types:check || {
  echo "❌ 타입 오류 발견!"
  exit 1
}

# 3. Import 검증
node scripts/type-validator.js || {
  echo "❌ 타입 시스템 검증 실패!"
  exit 1
}

echo "✅ 타입 시스템 검증 통과"
```

#### 4.2 tsconfig.json 강화
**파일**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  }
}
```

### Wave 4 검증
```bash
# 1. Pre-commit 테스트
echo ": any" >> src/test.ts
git add src/test.ts
git commit -m "test"  # 실패해야 함
rm src/test.ts

# 2. 전체 시스템 테스트
npm run build  # 성공
npm run types:check  # 오류 0개
npm run verify:types  # 통과
```

### Wave 4 성공 기준
☑ Pre-commit hook 작동
☑ 타입 오류 0개
☑ Any 타입 0개
☑ 재발 방지 시스템 완성

---

## 📊 전체 QA 테스트 시나리오

### 기능 회귀 테스트
1. **로그인/로그아웃**: 정상 작동
2. **페이지 라우팅**: 모든 페이지 접근 가능
3. **API 호출**: 모든 엔드포인트 정상
4. **UI 렌더링**: 타입 오류로 인한 렌더링 실패 없음

### 성능 측정
| 지표 | Wave 1 이전 | Wave 4 이후 | 목표 |
|------|-----------|------------|------|
| 빌드 시간 | 실패 | < 60초 | ✅ |
| 타입 체크 | 실패 | < 30초 | ✅ |
| 타입 오류 | 300+ | 0 | ✅ |
| Any 타입 | 8+ | 0 | ✅ |

### 개발자 경험
- 자동 완성 정상 작동
- 타입 추론 정확도 향상
- 개발 생산성 회복

---

## 🎯 최종 성공 기준

### 필수 달성 목표
☑ **빌드 성공**: `npm run build` 에러 없이 완료
☑ **타입 오류 0개**: `npm run types:check` 클린
☑ **Any 타입 0개**: 프로젝트 전체
☑ **Single Source of Truth**: src/types/index.ts 일원화
☑ **재발 방지**: Pre-commit hook + CI/CD 통합

### 교훈 문서화
파일: `docs/LESSONS_LEARNED_TYPE_CRISIS.md`
- 자동화의 위험성
- Single Source of Truth 중요성
- 점진적 마이그레이션 전략
- 검증 우선 원칙
- 컨텍스트 이해의 중요성

---

## ⚠️ 중요 경고

### 절대 하지 마세요
❌ **일괄 자동 변경 스크립트 생성** - 38개 스크립트의 교훈
❌ **패턴 매칭만으로 수정** - 컨텍스트 무시는 재앙
❌ **백업 없이 대량 수정** - Git 커밋 필수
❌ **검증 없이 수정** - 각 수정 후 즉시 테스트

### 반드시 하세요
✅ **파일별 컨텍스트 이해** - 왜 그렇게 작성되었는지 파악
✅ **점진적 수정** - 작은 단위로 나누어 진행
✅ **즉시 검증** - 각 수정 후 빌드 테스트
✅ **문서화** - 모든 변경사항 기록

---

## 📞 긴급 지원

### 막힐 때 참고
1. `/docs/CRITICAL_TYPE_SYSTEM_RECOVERY_PLAN.md` - 상세 계획
2. `/CLAUDE.md` - AI 작업 지침
3. `scripts/backup-unused-scripts-20250131/` - 참고용 (절대 실행 금지)

### 검증 명령어
```bash
npm run verify:types       # 타입 검증
npm run verify:parallel    # 병렬 검증  
npm run build             # 최종 빌드 테스트
```

---

*"The road to hell is paved with automated scripts." - 이 프로젝트에서 배운 교훈*

**이 지시서를 Wave 1부터 순차적으로 진행하세요. 절대 서두르지 마세요.**