/sc:implement --seq --validate --evidence --no-speculation  
"Phase 2: 타입 안전성 확보 - any 타입 및 위험한 단언 제거 - 30분 이내 완료"

# Phase 2/3: 타입 안전성 확보

⚠️ **절대 준수사항**
- [ ] 추측 금지 - 모든 것을 확인 후 진행
- [ ] 임시방편 금지 - TODO, any, 주석처리 절대 금지  
- [ ] 테스트 필수 - 작동 확인 없이 완료 보고 금지

## 📍 현재 상태 확인 (필수 실행)

### 파일 존재 확인

```bash
# any 타입 사용 파일 식별 (추측 금지)
grep -r "any\|as any" src/ --include="*.ts" --include="*.tsx" | grep -v "// Intentional any" > any-type-files.txt

# 위험한 타입 단언 식별
grep -r "as unknown\|<any>" src/ --include="*.ts" --include="*.tsx" > dangerous-assertions.txt

# 우선순위 파일 식별 (가장 많은 any가 있는 파일)
grep -c "any" src/**/*.ts src/**/*.tsx | sort -t: -k2 -nr | head -5 > priority-files.txt
```

### 현재 구현 확인

```bash
# 가장 문제가 많은 파일 상세 확인
cat priority-files.txt | head -3

# YouTube API 응답 타입 확인 (예상 고위험 파일)
grep -n "any" src/lib/youtube/api-client.ts | head -5

# 에러 핸들러 타입 확인 (예상 고위험 파일)  
grep -n "any" src/lib/error-handler.ts | head -5
```

### 의존성 확인  

```bash  
# 기존 타입 정의 확인
ls -la src/types/

# YouTube 관련 타입 정의 확인
grep -r "YouTubeSearchResponse\|YouTubeVideo" src/types/ --include="*.ts"

# 외부 라이브러리 타입 확인
grep -r "@types" package.json
```

❌ **확인 실패 시** → 즉시 중단 및 보고

## 🔧 수정 작업 (정확한 위치)

### 🚨 강제 체크포인트 CP1: 시작 전
- [ ] any-type-files.txt 파일 생성 확인
- [ ] priority-files.txt에서 상위 3개 파일 확인
- [ ] 기존 타입 정의 현황 파악 완료

### 우선순위 파일 수정

#### 파일 1: src/lib/youtube/api-client.ts
**현재 상태 확인**
```bash
cat -n src/lib/youtube/api-client.ts | grep -A 3 -B 3 "any"
```

**예상 수정 위치 (실제 확인 후 정확한 라인 결정)**
```typescript
// 현재 코드 (확인 후 정확히 이 코드여야 함)  
const results = response.data.items as any

// 수정 후 (정확한 타입 정의)
interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string; 
    thumbnails: {
      default: { url: string };
    };
  };
}

const results = response.data.items as YouTubeSearchItem[]
```

**수정 이유**: YouTube API 응답의 정확한 타입을 정의하여 런타임 에러 방지

#### 파일 2: src/lib/error-handler.ts  
**현재 상태 확인**
```bash
cat -n src/lib/error-handler.ts | sed -n '200,210p'
```

**라인 204 수정 (실제 라인 확인 후)**
```typescript
// 현재 코드 (확인 필요)
(...args: any[])

// 수정 후 (제네릭 활용)
export function withErrorHandling<TFunc extends (...args: unknown[]) => unknown>(
  fn: TFunc,
  context?: string
): TFunc {
  return ((...args: Parameters<TFunc>) => {
    // 구현부...
  }) as TFunc;
}
```

#### 파일 3: src/lib/security/example-usage.ts
**라인 96 수정 (실제 확인 후)**
```typescript  
// 현재 코드
.update(sanitized_data as any)

// 수정 후 (정확한 타입)
type UserUpdate = Database['public']['Tables']['users']['Update'];
.update(sanitized_data as UserUpdate)
```

### 새로운 타입 정의 생성

#### 파일 생성: src/types/youtube.ts
```typescript
// YouTube API 응답 타입 정의
export interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
    };
  };
}
```

⚠️ **수정 금지 사항**  
- any 타입으로 임시 해결 → 정확한 타입 정의 필요
- unknown으로 회피 → 구체적 타입 찾기  
- 타입 단언 남용 → 타입 가드 사용

## 🔍 검증 단계 (필수)

### 🚨 강제 체크포인트 CP2: 수정 중
- [ ] any 타입 0개 (any-type-files.txt 재확인)
- [ ] 새로운 타입 정의 추가 확인
- [ ] 기존 기능 정상 동작 확인

### 1. 컴파일 검증
```bash
# 타입 체크 (에러 0개 필수)
npm run types:check
# 실패 시 → 타입 정의 수정

# 특정 파일 타입 체크  
npx tsc --noEmit src/lib/youtube/api-client.ts
# 실패 시 → 해당 파일 타입 재검토
```

### 2. 실제 동작 검증
```bash  
# 개발 서버 실행
npm run dev
```

**브라우저 테스트 체크리스트**
- [ ] http://localhost:3000/youtube-lens 접속  
- [ ] YouTube 검색 기능 테스트
- [ ] 검색 결과 표시 확인 (타입 안전하게 렌더링)
- [ ] Console 에러 0개 확인 (F12)
- [ ] Network 탭에서 API 응답 구조 확인

### 3. 타입 안전성 검증
```bash
# any 타입 완전 제거 확인
grep -r "any\|as any" src/ --include="*.ts" --include="*.tsx" | grep -v "// Intentional" | wc -l
# 결과: 0이어야 함 (또는 크게 감소)

# 타입 커버리지 확인
npm run verify:types 2>&1 | grep -o '[0-9]\+ type warnings'
```

### 🚨 강제 체크포인트 CP3: 수정 후  
- [ ] npm run types:check 통과
- [ ] any 타입 90% 이상 제거 확인
- [ ] YouTube 검색 기능 정상 동작
- [ ] 타입 안전성 검증 완료

❌ **검증 실패** → Phase 실패 보고 및 중단
✅ **검증 성공** → Phase 3 진행 가능

## ✅ Phase 2 완료 조건

### 필수 (하나라도 실패 시 미완료)
- [ ] 컴파일 에러 0개  
- [ ] any 타입 90% 이상 제거 (192개 → 20개 이하)
- [ ] 새로운 타입 정의 추가 및 적용
- [ ] Console 에러 0개
- [ ] 기존 기능 100% 정상 동작

### 증거 수집  
- 스크린샷: YouTube 검색 기능 정상 동작 화면
- 로그: 타입 체크 통과 결과  
- 검증: `npm run verify:types` 실행 결과

### 성과 측정
```bash  
# Phase 2 완료 후 타입 경고 수 측정
npm run verify:types 2>&1 | grep -o '[0-9]\+ type warnings' | grep -o '[0-9]\+'

# 목표: 192개 → 100개 이하
```

### 다음 Phase 진행 가능 여부
- ✅ 모든 필수 조건 충족 → Phase 3 진행  
- ❌ 조건 미충족 → 수정 후 재검증

## ⛔ 절대 금지 (하나라도 위반 시 STOP)

1. **타입 회피 금지**
   - ❌ any로 임시 해결
   - ❌ unknown으로 회피  
   - ✅ 정확한 타입 정의 후 사용

2. **임시방편 금지**
   - ❌ // TODO: 타입 나중에 정의
   - ❌ as any "일단 돌아가게"
   - ✅ 완전한 타입 시스템 구축

3. **검증 생략 금지**  
   - ❌ "컴파일 되니까 OK"
   - ❌ "타입 에러 없으니 완료"
   - ✅ 브라우저에서 실제 기능 테스트

4. **기능 파괴 금지**
   - ❌ 타입 맞추려고 기능 삭제  
   - ❌ 에러 나도 넘어가기
   - ✅ 기능 + 타입 안전성 모두 확보

**하나라도 실패 → 다음 단계 진행 불가**