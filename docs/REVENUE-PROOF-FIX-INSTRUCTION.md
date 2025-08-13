# 🚨 수익인증 시스템 긴급 수정 지시서

## 0️⃣ 프로젝트 컨텍스트 (필수!)

**온보딩 문서 읽었나요?**
- [x] docs/PROJECT-CODEMAP.md 읽음 (필수)
- [x] docs/PROJECT.md 읽음 (현황 파악)
- [x] docs/REVENUE-PROOF-IMPLEMENTATION.md 읽음 (구현 명세)

**프로젝트 정보**
- 프로젝트명: 디하클 (Dhacle)
- 프로젝트 경로: C:\My_Claude_Project\9.Dhacle
- 주요 기술: Next.js 15.4.6, TypeScript (strict mode), Supabase, Tailwind CSS, shadcn/ui
- UI 방향: Tailwind CSS + shadcn/ui (styled-components 완전 제거)
- 현재 Phase: 4 (메인 페이지 구현 완료)

**🔴 긴급도: 최고 (프로젝트 지침 심각 위반)**

## 🔥 현재 문제 요약

### 치명적 문제 (즉시 수정 필요)
1. **더미 데이터 사용** - CLAUDE.md 지침 직접 위반
2. **실제 작동 불가** - Supabase 연동 불완전
3. **라이브러리 불일치** - 문서와 구현 차이

### 검토 결과
- 구현 완성도: 75/100점
- 파일 구조: ✅ 완벽
- TypeScript: ✅ 에러 없음
- 프로젝트 지침: ❌ 위반 (더미 데이터)
- 실제 작동: ❌ 불가능

## 1️⃣ 기본 정보 (필수)

### 작업 복잡도
- **작업 유형**: 버그 수정 + 리팩토링
- **복잡도**: moderate (4-6시간)
- **우선순위**: 🔴 긴급 (다른 작업 블로킹)

## 2️⃣ SuperClaude 명령어
```bash
# 수정 작업 명령어
/sc:implement --seq --validate --evidence --c7

# 작업 명령
작업: 수익인증 시스템 긴급 수정
위치: /app/(pages)/revenue-proof/
복잡도: moderate
```

## 3️⃣ 의존성 체크리스트

**이미 구현된 것들:**
- ✅ DB 테이블 (007_revenue_proof_system.sql)
- ✅ API Routes (12개 모두 구현)
- ✅ 컴포넌트 구조
- ✅ TypeScript 타입 정의

**수정/추가 필요:**
- [ ] 더미 데이터 완전 제거
- [ ] react-image-crop 설치
- [ ] Supabase Storage 버킷 설정
- [ ] 실제 API 연동 테스트

## 4️⃣ 수정 작업 명세

### 🔴 Phase 1: 더미 데이터 완전 제거 (최우선)

#### 1.1 파일별 수정 사항

**`/app/(pages)/revenue-proof/page.tsx`**
```typescript
// ❌ 제거해야 할 코드 (14번 줄)
import { dummyRevenueProofs } from '@/lib/dummy-data/revenue-proof';

// ❌ 제거해야 할 코드 (25번 줄)
const [useRealData, setUseRealData] = useState(true);

// ❌ 수정해야 할 코드 (50-70번 줄)
// 기존 (더미 데이터 폴백)
} else {
  // 더미 데이터 사용 (개발 중)
  let filteredData = [...dummyRevenueProofs];
  // ...
  setItems(filteredData);
}

// ✅ 수정 후 (에러 처리만)
} catch (error) {
  console.error('Failed to load revenue proofs:', error);
  // 에러 상태 표시
  setError('데이터를 불러오는 중 오류가 발생했습니다.');
  setItems([]);
} finally {
  setIsLoading(false);
}
```

**`/lib/dummy-data/revenue-proof.ts`**
```typescript
// ⚠️ 파일 전체 삭제 또는 개발 환경에서만 사용하도록 수정
// 옵션 1: 파일 삭제
// 옵션 2: 개발 환경 체크 추가
if (process.env.NODE_ENV !== 'production') {
  // 개발 환경에서만 더미 데이터 export
}
```

### 🟡 Phase 2: 실제 Supabase 연동

#### 2.1 환경 변수 확인
```bash
# .env.local 필수 설정
NEXT_PUBLIC_SUPABASE_URL=your_actual_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_key
```

#### 2.2 Storage 버킷 생성
```sql
-- Supabase Dashboard > Storage에서 실행
-- 버킷명: revenue-proofs
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
```

#### 2.3 API 수정 사항

**`/app/api/revenue-proof/route.ts`**
```typescript
// 150-200번 줄 수정
// ✅ 이미지 업로드 실제 구현
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('revenue-proofs')
  .upload(filePath, file, {
    contentType: file.type,
    upsert: false
  });

if (uploadError) {
  // 에러 처리 개선
  if (uploadError.message.includes('bucket')) {
    // Storage 버킷 생성 안내
    return NextResponse.json({
      error: 'Storage 설정이 필요합니다. Supabase Dashboard에서 revenue-proofs 버킷을 생성해주세요.',
      setupGuide: 'https://supabase.com/docs/guides/storage'
    }, { status: 500 });
  }
}
```

### 🟢 Phase 3: 누락 라이브러리 설치

#### 3.1 패키지 설치
```bash
# 누락된 패키지 설치
npm install react-image-crop

# 선택적: TipTap 최소 버전 (권장)
npm install @aslam97/shadcn-minimal-tiptap
```

#### 3.2 이미지 편집 기능 추가

**`/app/(pages)/revenue-proof/create/page.tsx`**
```typescript
// react-image-crop 추가 (선택적)
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// 이미지 크롭 기능 추가
const [crop, setCrop] = useState<Crop>();
const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

// 크롭 UI 추가
{imagePreview && (
  <ReactCrop
    crop={crop}
    onChange={(c) => setCrop(c)}
    onComplete={(c) => setCompletedCrop(c)}
  >
    <img src={imagePreview} alt="크롭할 이미지" />
  </ReactCrop>
)}
```

### Phase 4: 에러 처리 개선

#### 4.1 전역 에러 상태 추가

**`/app/(pages)/revenue-proof/page.tsx`**
```typescript
// 상태 추가
const [error, setError] = useState<string | null>(null);

// 에러 UI 추가
{error && (
  <Alert variant="destructive" className="mb-4">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>오류</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}

// Empty State 개선
{!isLoading && items.length === 0 && !error && (
  <Card className="text-center py-12">
    <CardContent>
      <p className="text-muted-foreground mb-4">
        아직 인증된 수익이 없습니다.
      </p>
      <Link href="/revenue-proof/create">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          첫 수익 인증하기
        </Button>
      </Link>
    </CardContent>
  </Card>
)}
```

## 5️⃣ 기술 스택 확인

### 현재 설치된 패키지 (유지)
- ✅ masonic (4.1.0)
- ✅ @tanstack/react-query (5.85.0)
- ✅ react-hook-form (7.62.0)
- ✅ react-signature-canvas (1.1.0-alpha.2)
- ✅ @tiptap 패키지들

### 추가 필요
- ❌ react-image-crop (설치 필요)
- ⚠️ @aslam97/shadcn-minimal-tiptap (선택적)

## 6️⃣ 데이터 & API

### 실제 데이터 테스트 시나리오
```typescript
// 테스트용 실제 데이터 생성
const testData = {
  title: "1월 YouTube Shorts 수익 테스트",
  amount: 150000,
  platform: "youtube",
  content: "<p>실제 테스트 데이터입니다. 더미 데이터가 아닙니다.</p>",
  // 실제 스크린샷 업로드 필요
};
```

## 7️⃣ 테스트 시나리오

### 필수 테스트 체크리스트
```typescript
describe('수익인증 더미 데이터 제거 검증', () => {
  test('더미 데이터 import 없음', () => {
    // grep으로 dummyRevenueProofs 검색
    // 결과 0개여야 함
  });

  test('실제 API 호출 확인', () => {
    // Network 탭에서 /api/revenue-proof 호출 확인
    // 실제 Supabase 응답 확인
  });

  test('에러 시 적절한 UI 표시', () => {
    // API 실패 시뮬레이션
    // 에러 메시지 표시 확인
    // 더미 데이터 표시 안 됨 확인
  });

  test('일일 제한 작동', () => {
    // 첫 번째 인증 성공
    // 두 번째 인증 시도
    // 429 에러 및 메시지 확인
  });
});
```

## 8️⃣ 성능 벤치마크

### 수정 후 목표 지표
```yaml
실제 데이터 로드: < 1s
이미지 업로드: < 3s (5MB)
무한 스크롤: 60fps 유지
메모리 사용: < 100MB
```

## 9️⃣ 보안 체크리스트

### 필수 확인 사항
- [x] RLS 정책 활성화 확인
- [ ] Storage 버킷 권한 설정
- [ ] 일일 제한 우회 방지
- [ ] 이미지 업로드 검증

## 🔄 롤백 계획

### 문제 발생 시
```bash
# Git 롤백
git stash  # 현재 변경사항 임시 저장
git checkout main  # 안정 버전으로

# 긴급 수정
git checkout -b hotfix/remove-dummy-data
# 수정 작업
git push origin hotfix/remove-dummy-data
```

## ⚡ 구현 순서 (최적화됨)

### 수정 작업 순서 (4-6시간)
```mermaid
1. 더미 데이터 제거 (1시간)
   ├─ import 문 제거
   ├─ 폴백 로직 제거
   └─ 에러 처리 추가

2. Supabase 연동 확인 (1시간)
   ├─ 환경 변수 설정
   ├─ Storage 버킷 생성
   └─ API 테스트

3. 누락 기능 구현 (2시간)
   ├─ react-image-crop 설치
   ├─ 이미지 편집 기능
   └─ blur placeholder 구현

4. 테스트 & 검증 (2시간)
   ├─ 실제 데이터 CRUD
   ├─ 일일 제한 테스트
   └─ 성능 측정
```

## ✅ 검증 체크리스트

### 자동 검증
```bash
# TypeScript 체크
npx tsc --noEmit

# 더미 데이터 검색
grep -r "dummyRevenueProofs" src/

# 빌드 테스트
npm run build

# 린트 체크
npm run lint
```

### 수동 검증
- [ ] 더미 데이터 완전 제거 확인
- [ ] 실제 수익 인증 작성 테스트
- [ ] 이미지 업로드 작동 확인
- [ ] 일일 제한 작동 확인
- [ ] 에러 시 적절한 UI 표시

## 📝 추가 주의사항

### 절대 하지 말아야 할 것
```typescript
// ❌❌❌ 절대 금지
import { dummyData } from '@/lib/dummy-data/*'  // 더미 데이터 import
setItems(fallbackData)  // 에러 시 가짜 데이터 표시
console.log(환경변수)  // 환경 변수 로깅

// ✅✅✅ 올바른 방법
// 실제 API만 사용
// 에러 시 명확한 에러 메시지
// 환경 변수는 서버에서만 사용
```

### 프로젝트 지침 재확인
1. **더미 데이터 절대 금지**
2. **any 타입 사용 금지**
3. **styled-components 사용 금지**
4. **환경 변수 하드코딩 금지**

## 🚀 예상 결과

### 수정 완료 후
- ✅ 프로젝트 지침 100% 준수
- ✅ 실제 수익 인증 작동
- ✅ TypeScript 에러 0개
- ✅ 더미 데이터 완전 제거
- ✅ 프로덕션 배포 가능

### 개선된 점수
- 구현 완성도: 75점 → 95점
- 프로젝트 지침: ❌ → ✅
- 실제 작동: ❌ → ✅

---

**수정 담당자**: Developer AI
**검토 담당자**: PM AI
**예상 소요 시간**: 4-6시간
**우선순위**: 🔴 최고 긴급

*이 지시서는 수익인증 시스템의 긴급 수정을 위한 것입니다.*
*더미 데이터 제거가 최우선이며, 실제 작동 가능한 상태로 만드는 것이 목표입니다.*