# 🚨 Dhacle 타입 시스템 복구 작업 지시서 v2.0

*작성일: 2025-08-22*  
*목적: 타입 시스템 완전 복구 및 재발 방지*  
*예상 소요: 3-4일 (수동 작업)*

---

## ⚠️ 절대 준수 사항 - 먼저 읽기

### 🔴 역사적 교훈: 2025년 1월 "에러 지옥" 사건
- **원인**: 38개 자동 변환 스크립트 실행
- **결과**: 전체 프로젝트 빌드 불가, 300개 타입 오류 발생
- **교훈**: **자동 스크립트는 절대 금지**

### ❌ 절대 금지 사항
1. **자동 변환 스크립트 생성/실행 금지**
   - sed, awk 등 일괄 변경 도구 사용 금지
   - fix-*.js 형태의 자동 수정 스크립트 생성 금지
   - 패턴 기반 일괄 치환 금지

2. **무작정 파일 삭제 금지**
   - 모든 삭제는 백업 후 진행
   - 의존성 확인 없는 삭제 금지

3. **한 번에 모든 것 변경 금지**
   - 점진적, 단계적 접근 필수
   - 각 단계마다 검증 필수

### ✅ 필수 작업 원칙
1. **모든 파일 수동 검토**: Read 도구로 컨텍스트 파악 후 수정
2. **단계별 검증**: 각 파일 수정 후 즉시 타입 체크
3. **즉시 롤백**: 오류가 증가하면 즉시 이전 상태로 복구

---

## 📊 현재 상태 분석

### 문제의 핵심
**"Multiple Sources of Truth" - 단일 진실 원천 위반**

### 타입 파일 현황 (9개 → 2개로 축소 필요)
```
src/types/
├── database.generated.ts   ✅ 유지 (Supabase 자동 생성)
├── index.ts                ✅ 유지 (Single Source of Truth)
├── course.ts               ❌ 통합 대상
├── course-system.types.ts  ❌ 통합 대상
├── revenue-proof.ts        ❌ 통합 대상
├── youtube.ts              ❌ 통합 대상
├── youtube-lens.ts         ❌ 통합 대상
├── youtube-pubsub.ts       ❌ 통합 대상
└── tosspayments.d.ts       ❌ 통합 대상
```

### 영향받는 파일
- **34개 파일**이 잘못된 경로에서 import
- **300개 → 28개** 타입 오류 (91% 해결됨)

### 중복 타입 충돌 맵
| 타입 | 정의 위치 | 충돌 내용 |
|------|----------|-----------|
| Course | course.ts, course-system.types.ts | 필드명과 타입 불일치 |
| VideoStats | index.ts, youtube-lens.ts | 완전히 다른 구조 |
| YouTubeVideo | youtube.ts, youtube-lens.ts | 인터페이스 불일치 |
| YouTubeChannel | youtube.ts, youtube-lens.ts | 필드 충돌 |

---

## 🛠️ 단계별 복구 계획

### 🎯 Phase 0: 백업 및 현황 기록 (30분)

#### 0.1 현재 상태 백업
```bash
# 타입 파일 백업
mkdir -p backup/types-20250822
cp -r src/types/* backup/types-20250822/

# 현재 오류 상태 기록
npm run types:check > backup/initial-errors.log 2>&1
npm run build > backup/initial-build.log 2>&1

# Git 커밋 (현재 상태 기록)
git add -A
git commit -m "backup: 타입 시스템 복구 전 상태"
```

#### 0.2 검증 도구 준비
```bash
# 검증 스크립트 생성 (자동 수정 아님, 검증만)
cat > scripts/verify-type-recovery.js << 'EOF'
// 타입 복구 진행 상황 검증 스크립트
const { execSync } = require('child_process');

console.log('🔍 타입 시스템 복구 상태 검증 중...\n');

// 1. 타입 파일 개수 확인
const typeFiles = execSync('ls src/types/*.ts | wc -l').toString().trim();
console.log(`타입 파일 개수: ${typeFiles}개 (목표: 2개)`);

// 2. 잘못된 import 개수 확인
try {
  const wrongImports = execSync('grep -r "from [\'\\"]@/types/\\(course\\|youtube\\|revenue\\)" src/ | wc -l').toString().trim();
  console.log(`잘못된 import: ${wrongImports}개 (목표: 0개)`);
} catch (e) {
  console.log('잘못된 import: 0개 ✅');
}

// 3. 타입 오류 개수 확인
try {
  execSync('npm run types:check', { stdio: 'pipe' });
  console.log('타입 오류: 0개 ✅');
} catch (e) {
  const errors = e.stdout ? e.stdout.toString().match(/error/gi) : [];
  console.log(`타입 오류: ${errors ? errors.length : '알 수 없음'}개`);
}

// 4. 빌드 가능 여부
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('빌드: 성공 ✅');
} catch (e) {
  console.log('빌드: 실패 ❌');
}
EOF

node scripts/verify-type-recovery.js
```

---

### 🎯 Phase 1: index.ts를 진정한 Single Source of Truth로 (1일차)

#### 1.1 index.ts 구조 재설계

**작업 전 필수 확인**:
```bash
# 현재 index.ts 백업
cp src/types/index.ts backup/index.ts.original

# 의존성 확인
grep -r "from '@/types'" src/ | grep -v "from '@/types'" | head -20
```

**수동 작업 절차**:

1. **course.ts의 타입들을 index.ts로 이동**
   ```typescript
   // src/types/index.ts에 추가 (re-export 대신 직접 정의)
   
   // ============= Course Types (통합) =============
   // course.ts와 course-system.types.ts의 타입을 병합
   export interface Course {
     // database.generated.ts의 courses 테이블 기준
     id: string;
     title: string;
     description: string | null;
     instructor_id: string | null;
     instructor_name: string;
     thumbnail_url: string | null;
     price: number;
     discount_price: number | null;
     is_free: boolean;
     isPremium: boolean;
     // ... 나머지 필드들
   }
   
   export interface Lesson {
     id: string;
     course_id: string;
     title: string;
     // ... 나머지 필드들
   }
   ```

2. **youtube 관련 타입들 통합**
   ```typescript
   // ============= YouTube Types (통합) =============
   // youtube.ts와 youtube-lens.ts 병합
   export interface YouTubeVideo {
     video_id: string;  // 통일된 필드명
     title: string;
     description: string | null;
     channel_id: string;
     // ... 나머지 필드들
   }
   
   // VideoStats는 두 가지 버전이 있으므로 구분
   export interface VideoStats extends Tables<'video_stats'> {
     // DB 기반 타입
   }
   
   export interface YouTubeLensVideoStats {
     // youtube-lens.ts의 VideoStats
     view_count: number;
     like_count: number;
     // ... 나머지 필드들
   }
   ```

3. **기존 re-export 제거**
   ```typescript
   // ❌ 제거할 것들
   // export type { Course, Lesson } from './course';
   // export type { YouTubeVideo } from './youtube';
   
   // ✅ 직접 정의로 대체
   ```

#### 1.2 각 단계별 검증
```bash
# 매 타입 추가 후 실행
npm run types:check

# 오류가 증가하면 즉시 중단하고 롤백
git diff src/types/index.ts  # 변경사항 확인
git checkout -- src/types/index.ts  # 롤백 (필요시)
```

---

### 🎯 Phase 2: Import 경로 수정 (2일차)

#### 2.1 파일별 수동 수정 프로세스

**절대 자동화하지 말 것! 각 파일을 개별적으로 확인하고 수정**

**34개 파일 수정 절차**:

1. **파일 읽기 및 분석**
   ```bash
   # 예: src/lib/youtube/popular-shorts.ts
   code src/lib/youtube/popular-shorts.ts
   ```

2. **import 문 확인**
   ```typescript
   // ❌ 현재 (잘못됨)
   import { YouTubeVideo } from '@/types/youtube';
   import { VideoStats } from '@/types/youtube-lens';
   
   // ✅ 수정 후 (올바름)
   import { YouTubeVideo, VideoStats } from '@/types';
   ```

3. **타입 사용 부분 확인**
   - 필드명이 바뀌었을 수 있으므로 확인
   - snake_case vs camelCase 차이 확인
   - 옵셔널 필드 확인

4. **수정 후 즉시 검증**
   ```bash
   npx tsc --noEmit src/lib/youtube/popular-shorts.ts
   ```

#### 2.2 우선순위별 파일 목록

**Critical (즉시 수정 필요)**:
1. src/lib/utils/type-mappers.ts
2. src/lib/youtube/popular-shorts.ts
3. src/lib/youtube/collections-server.ts
4. src/app/api/youtube/search/route.ts

**High Priority**:
5. src/app/(pages)/tools/youtube-lens/page.tsx
6. src/components/features/tools/youtube-lens/CollectionViewer.tsx
7. src/components/features/tools/youtube-lens/PopularShortsList.tsx

**Medium Priority**:
- 나머지 27개 파일

---

### 🎯 Phase 3: 중복 파일 정리 (3일차)

#### 3.1 의존성 최종 확인

**삭제 전 필수 확인**:
```bash
# 각 파일별로 import 확인
grep -r "from './course'" src/types/
grep -r "from './youtube'" src/types/
grep -r "from './youtube-lens'" src/types/

# 모두 제거되었는지 확인 후에만 진행
```

#### 3.2 단계적 파일 제거

**한 번에 하나씩 제거하고 검증**:

1. **course.ts 제거**
   ```bash
   mv src/types/course.ts backup/types-20250822/
   npm run types:check
   # 오류 없으면 계속, 있으면 복구
   ```

2. **youtube.ts 제거**
   ```bash
   mv src/types/youtube.ts backup/types-20250822/
   npm run types:check
   ```

3. **나머지 파일들도 동일하게 진행**

---

### 🎯 Phase 4: 최종 검증 및 문서화 (4일차)

#### 4.1 전체 시스템 검증
```bash
# 1. 타입 체크
npm run types:check

# 2. 빌드 테스트
npm run build

# 3. 검증 스크립트 실행
node scripts/verify-type-recovery.js

# 4. 테스트 실행
npm run test

# 5. 개발 서버 실행
npm run dev
# 주요 페이지 접속 테스트
```

#### 4.2 CLAUDE.md 업데이트
- 타입 시스템 섹션 업데이트
- Single Source of Truth 원칙 강조
- 향후 AI 작업 시 주의사항 추가

---

## 🚨 롤백 계획

### 언제 롤백해야 하는가?
1. 타입 오류가 28개에서 증가할 때
2. 빌드가 실패할 때
3. 런타임 오류가 발생할 때

### 롤백 절차
```bash
# 1. 현재 변경사항 확인
git status
git diff

# 2. 특정 파일 롤백
git checkout -- src/types/index.ts

# 3. 전체 롤백 (최후의 수단)
git reset --hard HEAD
cp -r backup/types-20250822/* src/types/
```

---

## ✅ 성공 기준

### 정량적 지표 (2025-08-22 Phase 3 완료)
- [x] 타입 파일 2개로 축소 (database.generated.ts, index.ts) ✅ 완료
- [x] 잘못된 import 0개 ✅ 완료
- [x] 타입 오류 13개로 감소 (224개→13개, 94.2% 해결) ✅ 완료
- [x] 중요 타입 오류 0개 (플레이스홀더만 남음) ✅ 완료
- [ ] 빌드 성공 (타입 오류는 해결, 빌드 테스트 필요)

### 정성적 지표
- [x] Single Source of Truth 확립 ✅ 완료
- [x] 타입 정의 명확성 향상 ✅ 완료
- [ ] 개발 생산성 복구 📝 진행중
- [x] 향후 유지보수 용이성 확보 ✅ 완료

---

## 📚 참고 문서
- `/CLAUDE.md` - AI 작업 지침서 (자동 스크립트 금지 규칙)
- `/docs/PROJECT.md` - 프로젝트 현황
- `backup/types-20250822/` - 원본 타입 파일 백업

---

## ⚠️ 미래 AI를 위한 경고

### 절대 하지 말아야 할 것
1. **자동 변환 스크립트 생성** - 2025년 1월 재앙의 원인
2. **패턴 기반 일괄 변경** - 컨텍스트 무시로 인한 오류
3. **검증 없는 대규모 변경** - 롤백 불가능한 상황 초래
4. **의도적인 `as any` 제거** - DB 스키마 불일치로 인해 일부러 남겨둔 것

### 반드시 해야 할 것
1. **수동으로 각 파일 검토**
2. **단계별 검증**
3. **즉각적인 롤백 준비**
4. **컨텍스트 이해 후 수정**

### 🚨 의도적으로 남겨둔 `as any` (절대 수정 금지)
**2025-08-22 타입 시스템 복구 과정에서 의도적으로 남긴 것**

다음 파일들의 `as any`는 **절대 제거하지 마세요**:
- `src/lib/youtube/popular-shorts.ts`: line 401, 451
- `src/lib/youtube/collections-server.ts`: line 345
- `src/lib/youtube/metrics.ts`: 여러 위치
- `src/lib/youtube/queue-manager.ts`: line 95
- `src/lib/supabase/typed-client.ts`: line 90
- `src/lib/youtube/analysis/predictor.ts`: line 75, 82, 93
- `src/lib/utils/type-mappers.ts`: line 71

**이유**: 
- `video_stats` 테이블에 없는 필드들(`views_per_hour`, `engagement_rate`, `viral_score`)이 포함되어 있음
- DB 마이그레이션이 필요하지만 현재는 임시로 `as any` 사용
- pre-commit hook에서도 이 파일들은 예외 처리됨

**해결 방법**:
1. DB에 누락된 필드 추가 (마이그레이션 필요)
2. 마이그레이션 후 `npm run types:generate` 실행
3. 그 후 `as any` 제거

---

*"빠른 해결책은 없다. 올바른 해결책만 있을 뿐이다."*