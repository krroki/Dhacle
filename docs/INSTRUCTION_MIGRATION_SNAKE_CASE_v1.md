# 🔥 전체 시스템 snake_case 통일 마이그레이션 지시서

## 🚀 추천 실행 명령어
```bash
# 복잡도: Enterprise (전체 시스템 변경)
/sc:implement --seq --ultrathink --all-mcp --wave-mode --wave-strategy enterprise --delegate files
"이 지시서를 읽고 전체 코드베이스를 snake_case로 통일하는 마이그레이션 실행"

# 분석만 원할 경우
/sc:analyze --seq --ultrathink --wave-mode
"snake_case 마이그레이션 영향도 분석만 수행"
```

## 📚 온보딩 섹션 (실행 AI 필수 학습)

### 필수 읽기 문서
- [ ] `/CLAUDE.md` 143-302행 - TypeScript 타입 관리 시스템 v2.0 (현재 변환 체계)
- [ ] `/CLAUDE.md` 54-71행 - 절대 금지사항 및 필수 작업 원칙
- [ ] `/docs/DATA_MODEL.md` - 현재 snake_case/camelCase 매핑 구조
- [ ] `/docs/CODEMAP.md` - 프로젝트 전체 구조 (영향 범위 파악)
- [ ] `/src/types/index.ts` - 중앙 타입 정의 (변환 레이어)

### 프로젝트 컨텍스트
```bash
# 현재 타입 시스템 확인
cat src/types/index.ts | grep -E "SnakeToCamelCase|export type"

# 프로젝트 규모 확인
find src -name "*.tsx" -o -name "*.ts" | wc -l  # 예상: 200+ 파일
find src/app/api -name "route.ts" | wc -l      # 예상: 38 API routes

# 현재 빌드 상태 확인
npm run build  # 현재 오류 확인
npm run types:check  # 타입 오류 확인

# Biome 설정 확인
cat biome.json | grep -A 10 "useNamingConvention"
```

### 작업 관련 핵심 정보
- **현재 상태**: Frontend(camelCase) ↔ DB(snake_case) 혼재
- **문제점**: 계속되는 변환 오류 (예: `courseProgressExtended` 버그)
- **목표**: 전체 시스템 snake_case 통일
- **영향 범위**: 200+ 파일, 38 API routes, 150+ 컴포넌트
- **예상 기간**: 3-5일 (Wave 단계별 진행)

## 📌 목적

현재 프로젝트는 DB는 snake_case, Frontend는 camelCase를 사용하여 지속적인 변환 오류가 발생하고 있습니다. 이를 해결하기 위해 전체 시스템을 snake_case로 통일하여:

1. **변환 함수 완전 제거** - snakeToCamelCase, camelToSnakeCase 불필요
2. **타입 일치 100%** - DB = TypeScript = Frontend 완벽 일치
3. **개발 생산성 향상** - 네이밍 혼란 제거, 오류 발생 0%
4. **유지보수성 개선** - 단일 네이밍 컨벤션으로 일관성 확보

## 🤖 실행 AI 역할

당신은 대규모 코드베이스 마이그레이션 전문가입니다. Wave Mode를 활용하여 체계적으로 전체 시스템을 snake_case로 전환하며, 각 단계마다 검증과 롤백 가능성을 확보합니다.

## 🌊 Wave 실행 계획 (Enterprise Scale)

### Wave 1: Discovery & Analysis (현황 분석)
**목표**: 전체 영향 범위 파악 및 마이그레이션 계획 수립

```bash
# 1. camelCase 사용 현황 분석
echo "=== CamelCase Variables Analysis ==="
grep -r "userId\|courseId\|createdAt\|updatedAt\|isActive" src --include="*.ts" --include="*.tsx" | wc -l

# 2. 변환 함수 사용 현황
echo "=== Conversion Function Usage ==="
grep -r "snakeToCamelCase\|camelToSnakeCase" src --include="*.ts" --include="*.tsx" -l

# 3. API Route 분석
echo "=== API Routes Analysis ==="
find src/app/api -name "route.ts" -exec grep -l "NextResponse.json" {} \;

# 4. Component props 분석
echo "=== Component Props Analysis ==="
grep -r "interface.*Props" src/components --include="*.tsx" -A 5

# 5. 영향도 리포트 생성
cat > migration-report.md << EOF
# Snake Case Migration Impact Report

## Statistics
- Total Files: $(find src -name "*.ts" -o -name "*.tsx" | wc -l)
- API Routes: $(find src/app/api -name "route.ts" | wc -l)
- Components: $(find src/components -name "*.tsx" | wc -l)
- Type Files: $(find src/types -name "*.ts" | wc -l)

## High Impact Areas
1. src/types/index.ts - Type conversion layer
2. src/lib/api-client.ts - API client wrapper
3. src/app/api/**/route.ts - All API routes
4. src/components/**/*.tsx - All components

## Risk Assessment
- Build Break Risk: HIGH
- Runtime Error Risk: MEDIUM
- Data Loss Risk: LOW
EOF
```

### Wave 2: Configuration & Tooling (설정 변경)
**목표**: Linter 설정 및 자동화 도구 준비

#### 2.1 Biome 설정 수정
```typescript
// biome.json 수정
{
  "linter": {
    "rules": {
      "style": {
        "useNamingConvention": {
          "level": "error",
          "options": {
            "strictCase": false,
            "conventions": [
              {
                "selector": { "kind": "function" },
                "formats": ["snake_case", "PascalCase"]  // snake_case 추가
              },
              {
                "selector": { "kind": "variable" },
                "formats": ["snake_case", "CONSTANT_CASE", "PascalCase"]  // snake_case 추가
              },
              {
                "selector": { "kind": "typeLike" },
                "formats": ["PascalCase"]  // 타입은 PascalCase 유지
              },
              {
                "selector": { "kind": "objectLiteralProperty" },
                "formats": ["snake_case"]  // 객체 속성도 snake_case
              },
              {
                "selector": { "kind": "objectLiteralMethod" },
                "formats": ["snake_case"]  // 객체 메서드도 snake_case
              }
            ]
          }
        }
      }
    }
  }
}
```

#### 2.2 마이그레이션 스크립트 생성
```javascript
// scripts/migrate-to-snake-case.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 변환 매핑 테이블
const camelToSnakeMap = {
  // User 관련
  'userId': 'user_id',
  'userName': 'user_name',
  'userEmail': 'user_email',
  'userRole': 'user_role',
  'avatarUrl': 'avatar_url',
  
  // Course 관련
  'courseId': 'course_id',
  'courseName': 'course_name',
  'courseTitle': 'course_title',
  'instructorName': 'instructor_name',
  'instructorId': 'instructor_id',
  'studentCount': 'student_count',
  'lessonCount': 'lesson_count',
  'totalDuration': 'total_duration',
  'averageRating': 'average_rating',
  
  // 시간 관련
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'deletedAt': 'deleted_at',
  'publishedAt': 'published_at',
  'completedAt': 'completed_at',
  'startedAt': 'started_at',
  'endedAt': 'ended_at',
  'lastWatchedAt': 'last_watched_at',
  
  // 상태 관련
  'isActive': 'is_active',
  'isFree': 'is_free',
  'isPublished': 'is_published',
  'isDeleted': 'is_deleted',
  'isPurchased': 'is_purchased',
  'isEnrolled': 'is_enrolled',
  'isCompleted': 'is_completed',
  
  // API/YouTube 관련
  'apiKey': 'api_key',
  'videoId': 'video_id',
  'channelId': 'channel_id',
  'playlistId': 'playlist_id',
  'thumbnailUrl': 'thumbnail_url',
  'videoUrl': 'video_url',
  'viewCount': 'view_count',
  'likeCount': 'like_count',
  'commentCount': 'comment_count',
  
  // 커뮤니티 관련
  'postId': 'post_id',
  'postTitle': 'post_title',
  'postContent': 'post_content',
  'commentId': 'comment_id',
  'replyCount': 'reply_count',
  
  // 기타
  'orderIndex': 'order_index',
  'maxRetries': 'max_retries',
  'retryCount': 'retry_count',
  'errorMessage': 'error_message',
  'requestBody': 'request_body',
  'responseData': 'response_data',
  'phoneNumber': 'phone_number',
  'birthDate': 'birth_date'
};

// 파일 변환 함수
function migrateFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  let changeCount = 0;
  
  // Backup 생성
  const backupPath = filePath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, content);
  }
  
  // 각 매핑 적용
  Object.entries(camelToSnakeMap).forEach(([camel, snake]) => {
    // 변수명, 속성명 변경 (단어 경계 확인)
    const regex = new RegExp(`\\b${camel}\\b`, 'g');
    const newContent = content.replace(regex, snake);
    if (newContent !== content) {
      changeCount += (content.match(regex) || []).length;
      content = newContent;
    }
  });
  
  // 파일 저장
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Changed ${changeCount} occurrences`);
  } else {
    console.log(`  ⏭️  No changes needed`);
  }
  
  return changeCount;
}

// 실행
async function main() {
  const files = glob.sync('src/**/*.{ts,tsx}', { 
    ignore: ['**/node_modules/**', '**/database.generated.ts'] 
  });
  
  let totalChanges = 0;
  for (const file of files) {
    totalChanges += migrateFile(file);
  }
  
  console.log(`\n✅ Migration complete: ${totalChanges} total changes in ${files.length} files`);
}

main().catch(console.error);
```

### Wave 3: Core System Migration (핵심 시스템 전환)
**목표**: 타입 시스템 및 API 레이어 전환

#### 3.1 타입 시스템 단순화
```typescript
// src/types/index.ts 수정
// Before: 복잡한 변환 레이어
export type User = SnakeToCamelCase<DBUser>;
export type Course = SnakeToCamelCase<DBCourse>;

// After: 직접 매핑 (변환 없음)
export type User = DBUser;  // 이미 snake_case
export type Course = DBCourse;  // 이미 snake_case

// 변환 함수 제거
// DELETE: snakeToCamelCase 함수
// DELETE: camelToSnakeCase 함수
// DELETE: SnakeToCamelCase 타입
// DELETE: CamelToSnakeCase 타입
```

#### 3.2 API Routes 수정 (38개)
```typescript
// 모든 API route 수정 예시
// Before: src/app/api/user/profile/route.ts
export async function GET() {
  const { data } = await supabase.from('users').select();
  return NextResponse.json(snakeToCamelCase(data));  // 변환 사용
}

// After: 변환 제거
export async function GET() {
  const { data } = await supabase.from('users').select();
  return NextResponse.json(data);  // 변환 없이 그대로 반환
}
```

### Wave 4: Component Migration (컴포넌트 전환)
**목표**: 150+ 컴포넌트 snake_case 전환

#### 4.1 자동 변환 실행
```bash
# 마이그레이션 스크립트 실행
node scripts/migrate-to-snake-case.js

# Biome로 포맷팅
npm run lint:biome:fix

# 타입 체크
npm run types:check
```

#### 4.2 수동 검증 필요 항목
```typescript
// Props 인터페이스 확인
// Before
interface UserCardProps {
  userId: string;
  userName: string;
  isActive: boolean;
}

// After
interface UserCardProps {
  user_id: string;
  user_name: string;
  is_active: boolean;
}

// 컴포넌트 내부 사용
// Before
const { userId, userName, isActive } = props;

// After  
const { user_id, user_name, is_active } = props;
```

### Wave 5: Validation & Optimization (검증 및 최적화)
**목표**: 전체 시스템 검증 및 최적화

#### 5.1 검증 체크리스트
```bash
# 1. 빌드 테스트
npm run build
# Expected: BUILD SUCCESS

# 2. 타입 체크
npm run types:check
# Expected: No errors

# 3. 테스트 실행
npm run test
# Expected: All tests pass

# 4. API 일관성 검증
npm run verify:api
# Expected: 100% consistency

# 5. 런타임 테스트
npm run dev
# Manual testing of critical paths
```

## 📊 영향 범위 상세 분석

| 영역 | 파일 수 | 변경 내용 | 리스크 | 우선순위 |
|------|---------|-----------|--------|----------|
| Type System | 5 | 변환 레이어 제거 | HIGH | 1 |
| API Routes | 38 | Response 변환 제거 | HIGH | 2 |
| Components | 150+ | Props/State 변경 | MEDIUM | 3 |
| Hooks | 20+ | Return 값 변경 | MEDIUM | 4 |
| Utils | 30+ | 함수 파라미터 변경 | LOW | 5 |
| Tests | 50+ | Assertion 업데이트 | LOW | 6 |

## 🧪 QA 테스트 시나리오

### 핵심 사용자 플로우 테스트

#### 1. 인증 플로우
```markdown
1. **로그인 프로세스**
   - Step 1: /auth/login 접속
   - Step 2: 카카오 로그인 클릭
   - Step 3: 인증 완료
   - Step 4: 프로필 데이터 확인
   
   **검증 포인트**:
   ✅ user_id 정상 저장
   ✅ created_at 타임스탬프 정확
   ✅ is_active 상태 확인
```

#### 2. YouTube Lens 기능
```markdown
1. **컬렉션 CRUD**
   - 생성: collection_name 입력 → 저장
   - 조회: user_id 기반 필터링
   - 수정: updated_at 자동 갱신
   - 삭제: deleted_at 소프트 삭제
   
   **검증 포인트**:
   ✅ 모든 snake_case 필드 정상 동작
   ✅ API 응답 형식 일치
   ✅ 프론트엔드 표시 정상
```

### 엣지 케이스 테스트

| 시나리오 | 테스트 내용 | 예상 결과 | 실제 결과 |
|---------|------------|-----------|-----------|
| 빈 데이터 | null/undefined 처리 | 에러 없음 | ☐ |
| 중첩 객체 | nested.user_id | 정상 접근 | ☐ |
| 배열 데이터 | items[0].created_at | 정상 접근 | ☐ |
| 조건부 렌더링 | is_active && render | 정상 동작 | ☐ |
| 타입 가드 | if (user_id) | 정상 동작 | ☐ |

### 성능 벤치마크

```markdown
## Before Migration
- Build Time: ~45s
- Type Check: ~12s
- Bundle Size: 2.3MB
- Runtime Performance: baseline

## After Migration (목표)
- Build Time: < 40s (변환 제거로 개선)
- Type Check: < 10s (단순화로 개선)
- Bundle Size: < 2.2MB (변환 코드 제거)
- Runtime Performance: +5% (변환 오버헤드 제거)
```

### 회귀 테스트 범위

```markdown
### 필수 테스트 영역
☑ 사용자 인증/인가
☑ API 엔드포인트 (38개 전체)
☑ 데이터 CRUD 작업
☑ 실시간 업데이트
☑ 파일 업로드/다운로드
☑ 검색 및 필터링
☑ 페이지네이션
☑ 에러 처리

### 브라우저 호환성
| 브라우저 | 테스트 | 결과 |
|---------|--------|------|
| Chrome 120+ | 전체 기능 | ☐ |
| Safari 17+ | 전체 기능 | ☐ |
| Firefox 120+ | 전체 기능 | ☐ |
| Edge 120+ | 전체 기능 | ☐ |
```

## 🔄 롤백 계획

### Git 브랜치 전략
```bash
# 1. 마이그레이션 브랜치 생성
git checkout -b feature/snake-case-migration

# 2. Wave별 커밋
git commit -m "Wave 1: Analysis and planning"
git commit -m "Wave 2: Configuration changes"
git commit -m "Wave 3: Core system migration"
git commit -m "Wave 4: Component migration"
git commit -m "Wave 5: Validation and optimization"

# 3. 문제 발생 시 롤백
git revert HEAD~[n]  # n = 롤백할 Wave 수

# 4. 백업 복구
find src -name "*.backup" -exec sh -c 'mv "$1" "${1%.backup}"' _ {} \;
```

### 단계별 롤백 포인트
1. **Wave 2 실패**: Biome 설정만 되돌리기
2. **Wave 3 실패**: 타입 시스템 원복 + API 변환 함수 복구
3. **Wave 4 실패**: 컴포넌트 백업 파일로 복구
4. **Wave 5 실패**: 전체 브랜치 폐기 및 main 복귀

## ⚠️ 리스크 및 대응 방안

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
|--------|----------|--------|-----------|
| 빌드 실패 | HIGH | HIGH | Wave별 점진적 적용, 각 단계 검증 |
| 타입 불일치 | MEDIUM | HIGH | types:generate 재실행, 수동 매핑 |
| 런타임 에러 | MEDIUM | HIGH | 충분한 테스트, 단계별 배포 |
| 성능 저하 | LOW | MEDIUM | 프로파일링, 최적화 |
| 데이터 손실 | LOW | HIGH | 백업 확보, 읽기 전용 작업 |

## 📈 성공 기준

### 필수 달성 목표
☑ **빌드 성공**: `npm run build` 에러 없음
☑ **타입 안정성**: `npm run types:check` 통과
☑ **테스트 통과**: 모든 자동화 테스트 성공
☑ **API 일관성**: 100% snake_case 응답
☑ **성능 유지**: 기존 대비 저하 없음

### 품질 지표
- **코드 일관성**: 100% snake_case 사용
- **변환 함수**: 0개 (완전 제거)
- **타입 오류**: 0개
- **런타임 에러**: 0개
- **테스트 커버리지**: 80% 이상 유지

## 🚀 실행 명령어 요약

```bash
# Phase 1: 준비
git checkout -b feature/snake-case-migration
npm run build > before-migration.log
npm run types:check >> before-migration.log

# Phase 2: 실행
node scripts/migrate-to-snake-case.js
npm run lint:biome:fix
npm run types:generate

# Phase 3: 검증
npm run build
npm run types:check
npm run test
npm run verify:all

# Phase 4: 커밋
git add -A
git commit -m "feat: 전체 시스템 snake_case 통일 마이그레이션

- 변환 함수 제거 (snakeToCamelCase, camelToSnakeCase)
- 타입 시스템 단순화 (직접 매핑)
- API Routes 38개 수정
- Components 150+ 수정
- 성능 개선: 변환 오버헤드 제거

BREAKING CHANGE: 모든 API 응답이 snake_case로 변경됨"
```

## 📋 체크리스트

### Wave 1 완료 조건
- [ ] 영향 범위 분석 완료
- [ ] migration-report.md 생성
- [ ] 백업 전략 수립
- [ ] 팀 공유 및 승인

### Wave 2 완료 조건
- [ ] Biome 설정 업데이트
- [ ] 마이그레이션 스크립트 작성
- [ ] 테스트 환경 준비
- [ ] 롤백 계획 문서화

### Wave 3 완료 조건
- [ ] 타입 시스템 수정
- [ ] API Routes 전체 수정
- [ ] 빌드 테스트 통과
- [ ] API 응답 검증

### Wave 4 완료 조건
- [ ] 모든 컴포넌트 변환
- [ ] Props 인터페이스 수정
- [ ] Hooks 수정
- [ ] 수동 테스트 완료

### Wave 5 완료 조건
- [ ] 전체 테스트 통과
- [ ] 성능 벤치마크 달성
- [ ] 문서 업데이트
- [ ] 프로덕션 배포 준비

## 🎯 최종 확인

이 마이그레이션이 완료되면:
1. ✅ **더 이상 naming 관련 오류 없음**
2. ✅ **DB와 Frontend 완벽한 일치**
3. ✅ **개발 생산성 대폭 향상**
4. ✅ **유지보수성 극대화**

---

*작성일: 2025-01-31*
*작성자: Claude Code AI*
*버전: v1.0*
*복잡도: Enterprise*
*예상 소요 시간: 3-5일*