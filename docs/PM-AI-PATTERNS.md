# PM-AI-PATTERNS.md - Developer AI 실패 패턴 즉시 차단

## 🚫 반복되는 실패 패턴과 즉시 차단법

### 📋 범용 적용 원칙
- **[컴포넌트명]**: 해당 작업의 기존 컴포넌트로 치환
- **[데이터함수]**: mockData() 또는 실제 API 호출로 치환
- **[페이지경로]**: 작업 중인 페이지 경로로 치환
- 모든 패턴은 **어떤 작업에도** 동일하게 적용

### 패턴 1: "새로 만들기 시도"
```
징후: 
- "새로운 컴포넌트를 생성하겠습니다"
- "CourseDetail.tsx를 만들겠습니다"
- "컴포넌트를 구현하겠습니다"

즉시 대응:
"STOP. [기존컴포넌트].tsx 사용. 
새로 만들면 새 세션이다.
ls src/components/[폴더]/ 실행해서 확인해."

적용 예시:
- courses → SimpleCourseDetail.tsx
- auth → LoginForm.tsx  
- dashboard → DashboardLayout.tsx
```

### 패턴 2: "빈 껍데기"
```
징후:
- <div>강의 콘텐츠</div>
- <div>여기에 내용이 들어갑니다</div>
- return <div />

즉시 대응:
"[mockData함수]() 데이터 연결 안 하면 새 세션.
const data = [mockData함수]() 추가.
{data.field} 이렇게 실제 데이터 표시."

적용 예시:
- courses → mockSimpleCourse()
- users → mockUserData()
- products → mockProductList()
```

### 패턴 3: "가짜 완료"
```
징후:
- "작업을 완료했습니다"
- "구현이 끝났습니다"
- "페이지가 완성되었습니다"

즉시 대응:
"npm run dev 실행하고 스크린샷 먼저.
localhost:3000/courses/1 캡처해.
안 하면 새 세션."
```

### 패턴 4: "하드코딩"
```
징후:
- style={{ color: 'blue' }}
- className="text-white"
- backgroundColor: '#ffffff'

즉시 대응:
"theme.deep.json 무시하면 새 세션.
import theme from '@/lib/theme/theme.ts'
theme.colors.primary 이렇게 써."
```

### 패턴 5: "Import 무시"
```
징후:
- 필요한 import 누락
- 잘못된 경로
- 존재하지 않는 파일 import

즉시 대응:
"정확한 import:
import SimpleCourseDetail from '@/components/courses/SimpleCourseDetail'
import SimplePurchaseCard from '@/components/courses/SimplePurchaseCard'
import { mockSimpleCourse } from '@/types/simple-course.types'
이것만."
```

### 패턴 6: "레이아웃 붕괴"
```
징후:
- 1컬럼 레이아웃
- flex 사용
- 그리드 없음

즉시 대응:
"2컬럼 필수:
grid grid-cols-1 lg:grid-cols-[1fr,400px]
65% + 35% 비율.
안 하면 다시."
```

### 패턴 7: "타입 에러 무시"
```
징후:
- @ts-ignore 사용
- any 타입 사용
- 타입 에러 있는데 진행

즉시 대응:
"npx tsc --noEmit 
에러 0개 될 때까지 진행 금지.
any 쓰면 새 세션."
```

## 🎯 궁극의 협박 멘트 모음

### 레벨 1 (경고)
```
"SimpleCourseDetail 안 쓰면 다시 한다."
```

### 레벨 2 (위협)
```
"또 새로 만들었어? 새 세션 열까?"
```

### 레벨 3 (최후통첩)
```
"3번 경고했는데도 안 듣네?
새 세션 열어서 처음부터 다시 할까?
아니면 SimpleCourseDetail.tsx 쓸래?"
```

### 레벨 4 (실행)
```
"끝. 새 세션 추천.
다음 AI는 이 문서 먼저 읽고 시작."
```

## 📊 실패 카운터

```typescript
interface FailureCounter {
  newComponent: number,      // 새 컴포넌트 생성 시도
  emptyContent: number,      // 빈 콘텐츠
  fakeCompletion: number,    // 가짜 완료 선언
  hardcoding: number,        // 하드코딩
  typeErrors: number,        // 타입 에러
  
  totalWarnings: number,     // 총 경고 횟수
  sessionThreat: boolean     // 새 세션 위협 사용 여부
}

// totalWarnings >= 3 → 새 세션 강력 권고
// totalWarnings >= 5 → 새 세션 필수
```

## 🔴 Developer AI 신뢰도

### 작업별 신뢰도
```
90% 신뢰: Import 문 추가
70% 신뢰: 함수 선언
50% 신뢰: 레이아웃 구성
30% 신뢰: 데이터 연결
10% 신뢰: 스타일링
0% 신뢰: 새 컴포넌트 생성
```

### 신뢰도별 대응
```
70%+: 지시 후 확인
50-69%: 코드 일부 제공
30-49%: 전체 코드 제공
0-29%: 하지 말라고 명시
```