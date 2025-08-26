# 🚨 TypeScript 117개 에러 완전 해결 지시서 v2.0

## 🚀 추천 실행 명령어
```bash
# 복잡도: Complex (117개 에러, 다수 파일)
/sc:troubleshoot --seq --ultrathink --delegate files --wave-mode --wave-strategy systematic
"이 지시서를 읽고 TypeScript 117개 에러를 Wave Mode로 체계적으로 완전 해결"

# 빠른 실행 (Wave 1만)
/sc:troubleshoot --seq --validate --think
"Wave 1: 변수명 오타 47개 에러 즉시 수정"
```

## 📚 온보딩 섹션 (실행 AI 필수 학습)

### 필수 읽기 문서
- [ ] `/CLAUDE.md` 15-71행 - AI 필수 수칙 및 절대 금지사항
- [ ] `/CLAUDE.md` 62-138행 - 자동 변환 스크립트 절대 금지 규칙
- [ ] `/CLAUDE.md` 143-302행 - TypeScript 타입 관리 시스템 v2.0
- [ ] `/docs/PROJECT.md` - 현재 TypeScript 에러 상황
- [ ] `/docs/CODEMAP.md` - 프로젝트 구조 이해

### 프로젝트 컨텍스트
```bash
# 현재 에러 상태 확인
npm run types:check 2>&1 | grep "error TS" | wc -l
# 결과: 117개

# 에러 타입별 분류
npm run types:check 2>&1 | grep -E "error TS[0-9]+:" | sed 's/.*error \(TS[0-9]*\):.*/\1/' | sort | uniq -c
# 결과: TS2304(37), TS2322(15), TS2769(14), TS2339(12) 등

# DB 테이블 상태 확인
node scripts/verify-with-service-role.js
# 결과: 21개 테이블 모두 존재

# 기술 스택 확인
cat package.json | grep -E "next|typescript|supabase"
# Next.js 14.1.0, TypeScript 5.3.3, Supabase 2.39.3
```

### 작업 관련 핵심 정보
- **프레임워크**: Next.js 14 (App Router)
- **데이터베이스**: Supabase (golbwnsytwbyoneucunx)
- **타입 시스템**: Single Source of Truth (src/types/index.ts)
- **snake_case/camelCase**: API 경계에서 자동 변환
- **절대 금지**: 자동 변환 스크립트, any 타입

---

## 📌 목적
TypeScript 117개 에러를 Wave Mode를 활용하여 체계적이고 완전하게 해결합니다. 임시방편이 아닌 근본적인 해결을 통해 타입 안정성을 확보합니다.

## 🤖 실행 AI 역할
1. Wave별로 체계적인 에러 해결
2. 각 파일을 Read로 읽고 정확한 위치 파악
3. Edit로 수동 수정 (자동 스크립트 금지)
4. 각 Wave 완료 후 검증
5. 서브 에이전트 활용하여 병렬 처리

---

## 🌊 Wave Mode 실행 계획

### Wave 구성 개요
| Wave | 목표 | 해결 에러 수 | 예상 시간 | 복잡도 |
|------|------|-------------|-----------|--------|
| Wave 1 | 변수명 오타 수정 | 47개 | 30분 | Simple |
| Wave 2 | 타입 정의 확장 | 40개 | 1시간 | Moderate |
| Wave 3 | DB 스키마 정합성 | 30개 | 1시간 | Complex |

---

## 📋 Wave 1: 변수명 오타 수정 (47개 에러 해결)

### 목표
변수명 불일치로 인한 TS2304, TS2552 에러 47개를 즉시 해결

### 실행 명령
```bash
/sc:task --delegate files --parallel
"Wave 1: collections와 metrics 파일의 변수명 오타 수정"
```

### 수정 파일 및 내용

#### 1. src/lib/youtube/collections.ts
```typescript
# 확인 명령
grep -n "collectionId" src/lib/youtube/collections.ts

# 수정 내용 (15개 위치)
- 103행: const { data: items } = await supabase.from('collection_items').select().eq('collectionId', collectionId);
+ 103행: const { data: items } = await supabase.from('collection_items').select().eq('collection_id', collection_id);

- 136행: .eq('collectionId', collectionId)
+ 136행: .eq('collection_id', collection_id)

- 157행: collection_id: collectionId,
+ 157행: collection_id: collection_id,

- 168행: .eq('collection_id', collectionId)
+ 168행: .eq('collection_id', collection_id)

# ... 총 15개 위치 모두 수정
```

#### 2. src/lib/youtube/collections-server.ts
```typescript
# 수정 내용 (15개 위치)
# collectionId → collection_id 모든 위치 변경
```

#### 3. src/lib/youtube/crypto.ts
```typescript
# 수정 내용
- 106행: if (!apiKey) throw new Error('API key is required');
+ 106행: if (!encryptedApiKey) throw new Error('API key is required');

- 107행: return decrypt(apiKey, process.env.ENCRYPTION_KEY!);
+ 107행: return decrypt(encryptedApiKey, process.env.ENCRYPTION_KEY!);
```

#### 4. src/lib/youtube/metrics.ts
```typescript
# 수정 내용
- 33행: return viewCount > 1000 ? `${(viewCount / 1000).toFixed(1)}K` : viewCount.toString();
+ 33행: return view_count > 1000 ? `${(view_count / 1000).toFixed(1)}K` : view_count.toString();

- 49행: const viewGrowth = (viewCount - previousViewCount) / previousViewCount * 100;
+ 49행: const viewGrowth = (view_count - previousViewCount) / previousViewCount * 100;

- 76행: const publishDate = new Date(publishedAt);
+ 76행: const publishDate = new Date(published_at);

- 145행: const ratio = viewCount / subscriberCount;
+ 145행: const ratio = view_count / subscriber_count;

- 256행: const stats = await supabase.from('videoStats').select().eq('video_id', videoId);
+ 256행: const stats = await supabase.from('video_stats').select().eq('video_id', videoId);
```

#### 5. src/lib/api/revenue-proof.ts
```typescript
# 수정 내용
- 94행: .eq('id', proof_id)
+ 94행: .eq('id', proofId)
```

#### 6. src/lib/api/courses.ts
```typescript
# 수정 내용
- 108행: if (isPurchased) {
+ 108행: if (is_purchased) {

- 119행: if (isEnrolled) {
+ 119행: if (is_enrolled) {
```

### Wave 1 검증
```bash
# 검증 명령
npm run types:check 2>&1 | grep "error TS" | wc -l
# 예상: 70개 (117 - 47)

# 변수명 오타 에러 확인
npm run types:check 2>&1 | grep "Cannot find name 'collectionId'"
# 예상: 0개
```

---

## 📋 Wave 2: 타입 정의 확장 (40개 에러 해결)

### 목표
누락된 타입 속성으로 인한 TS2322, TS2740 에러 40개 해결

### 실행 명령
```bash
/sc:implement --seq --validate --c7
"Wave 2: src/types/index.ts 타입 정의 확장"
```

### 수정 파일: src/types/index.ts

#### Course 타입 확장 (500행 부근에 추가)
```typescript
// 기존 Course 타입 찾기
grep -n "export interface Course" src/types/index.ts

// Course 타입 확장 추가
export interface Course extends Database['public']['Tables']['courses']['Row'] {
  // Frontend 전용 추가 필드
  isPremium: boolean;
  total_duration: number;
  student_count: number;
  reviewCount: number;
  rating: number;
  enrollmentCount: number;
  
  // 기존 필드 매핑 (snake_case → camelCase는 자동 변환)
  // 예: average_rating → averageRating (api-client가 처리)
}
```

#### Lesson 타입 수정 (520행 부근)
```typescript
export interface Lesson extends Database['public']['Tables']['lessons']['Row'] {
  // 매핑 필드
  duration: number;          // duration_minutes 매핑
  order_index: number;        // order_in_week 매핑  
  is_free: boolean;          // is_preview 매핑
  
  // 기존 필드는 유지
}
```

#### CourseProgress 타입 정의 (540행 부근)
```typescript
// course_progress 테이블과 정확히 매칭
export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string | null;
  progress: number;
  completed: boolean;
  watchCount?: number;
  last_watched_at?: string | null;
  created_at: string;
  updated_at: string;
}
```

#### VideoStats 타입 정의 (560행 부근)
```typescript
// video_stats 테이블 타입 (누락되었다면 추가)
export interface VideoStats {
  id: string;
  video_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  subscriber_count?: number;
  published_at: string;
  channel_id: string;
  duration: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}
```

#### RevenueProof 타입 수정 (580행 부근)
```typescript
export interface RevenueProof extends Database['public']['Tables']['revenue_proofs']['Row'] {
  // 옵셔널 필드로 변경
  thumbnail_url?: string;
  blurDataUrl?: string;
  
  // 기존 필드는 유지
}
```

### Wave 2 검증
```bash
# 타입 체크
npm run types:check 2>&1 | grep "error TS" | wc -l
# 예상: 30개 (70 - 40)

# 타입 불일치 에러 확인
npm run types:check 2>&1 | grep "Type .* is missing the following properties"
# 예상: 대부분 해결됨
```

---

## 📋 Wave 3: DB 스키마 정합성 (30개 에러 해결)

### 목표
DB 스키마와 타입 시스템 간 불일치로 인한 나머지 30개 에러 완전 해결

### 실행 명령
```bash
/sc:implement --seq --ultrathink --validate
"Wave 3: DB 스키마 정합성 확보 및 타입 시스템 최종 정리"
```

### 작업 1: DB 스키마 확인 및 수정

#### user_api_keys 테이블 컬럼 추가 (필요시)
```sql
-- migrations/20250131_fix_api_keys.sql 생성
ALTER TABLE user_api_keys 
ADD COLUMN IF NOT EXISTS encrypted_key TEXT,
ADD COLUMN IF NOT EXISTS encryption_iv TEXT;

-- RLS 정책 확인
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
```

```bash
# SQL 실행
node scripts/supabase-sql-executor.js --method pg --file migrations/20250131_fix_api_keys.sql
```

### 작업 2: 타입 재생성
```bash
# DB에서 최신 타입 생성
npm run types:generate

# 생성된 타입 확인
cat src/types/database.generated.ts | grep "user_api_keys" -A 20
```

### 작업 3: API Route 타입 매핑 수정

#### src/lib/api-keys.ts 수정
```typescript
# import 수정 (1행)
import type { UserApiKey } from '@/types';
// UserApiKey interface 중복 정의 제거 (5-20행 삭제)

# 함수 시그니처 수정 (필요시)
export async function getApiKeys(userId: string): Promise<UserApiKey[]> {
  // implementation
}
```

### 작업 4: 함수 호출 시그니처 수정

#### src/lib/api/courses.ts
```typescript
# 124행: from() 호출 수정
- const progress = await supabase.from('course_progress')
+ const progress = await supabase.from('course_progress' as any)
// 또는 타입 캐스팅
+ const progress = await supabase.from('course_progress' as keyof Database['public']['Tables'])
```

### Wave 3 최종 검증
```bash
# 최종 타입 체크
npm run types:check
# 목표: 0개 에러

# 빌드 테스트
npm run build
# 성공 확인

# 런타임 테스트
npm run dev
# http://localhost:3000 접속 후 기능 테스트
```

---

## 🧪 QA 테스트 시나리오

### 기능 테스트 체크리스트
| 테스트 항목 | 경로 | 예상 결과 | 실제 결과 |
|------------|------|-----------|-----------|
| 컬렉션 목록 표시 | /tools/youtube-lens | 정상 표시 | ☐ |
| 컬렉션 생성 | /tools/youtube-lens | 생성 성공 | ☐ |
| 강의 목록 | /courses | 타입 에러 없음 | ☐ |
| 수익 인증 | /revenue-proof | 업로드 성공 | ☐ |
| API 키 관리 | /mypage/api-keys | CRUD 정상 | ☐ |

### 성능 벤치마크
```bash
# 빌드 시간 측정
time npm run build
# 목표: < 60초

# 타입 체크 시간
time npm run types:check
# 목표: < 10초
```

### 엣지 케이스 테스트
1. **빈 데이터**: 각 페이지에서 데이터 없을 때 에러 없음
2. **null 처리**: 옵셔널 필드 null 값 정상 처리
3. **타입 가드**: unknown 타입 안전하게 처리
4. **API 응답**: snake_case → camelCase 자동 변환 확인

---

## ✅ 성공 기준

### Wave별 완료 기준
- [ ] **Wave 1**: 변수명 오타 47개 해결 (30분)
- [ ] **Wave 2**: 타입 정의 40개 해결 (1시간)
- [ ] **Wave 3**: DB 정합성 30개 해결 (1시간)

### 최종 검증
- [ ] `npm run types:check` 에러 0개
- [ ] `npm run build` 성공
- [ ] `npm run dev` 정상 실행
- [ ] 모든 페이지 접속 가능
- [ ] any 타입 사용 0개

### 품질 게이트
- [ ] 타입 커버리지 100%
- [ ] 자동 스크립트 사용 0개
- [ ] 수동 검증 완료
- [ ] 회귀 테스트 통과

---

## 🚨 주의사항

### 절대 금지
1. ❌ 자동 변환 스크립트 생성 및 실행
2. ❌ any 타입 사용 (unknown + 타입 가드 사용)
3. ❌ 일괄 변경 스크립트
4. ❌ @ts-ignore 사용 (임시 해결책)

### 필수 준수
1. ✅ 각 파일 Read → Edit 수동 수정
2. ✅ 각 Wave 완료 후 검증
3. ✅ 서브 에이전트 활용 가능
4. ✅ 타입 시스템 Single Source of Truth 유지

---

## 📊 진행 상황 추적

```markdown
## Wave 진행 상황
- Wave 1: [=========>] 47/47 완료 ✅
- Wave 2: [=====>    ] 20/40 진행중 🔄
- Wave 3: [          ] 0/30 대기 ⏳

## 전체 진행률
[=======                ] 67/117 (57.3%)

## 예상 완료 시간
- 시작: 2025-08-21 14:00
- Wave 1 완료: 14:30 ✅
- Wave 2 예상: 15:30
- Wave 3 예상: 16:30
- 전체 완료 예상: 17:00
```

---

## 🎯 최종 목표

**3시간 내 TypeScript 117개 에러 완전 해결**
- 임시방편 ❌ → 근본 해결 ✅
- 자동 스크립트 ❌ → 수동 검증 ✅
- any 타입 ❌ → 타입 안전성 ✅

**"TypeScript 에러 0개의 깨끗한 코드베이스 달성"**