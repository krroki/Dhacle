# PM-AI-VERIFICATION.md - 철벽 검증 시스템

## ✅ 3단계 검증 시스템

### Level 1: 코드 검증
```bash
# TypeScript 컴파일
npx tsc --noEmit
# ✅ PASS: 0 errors
# ❌ FAIL: any 타입, import 에러, 타입 불일치

# 파일 구조 확인
ls -la src/app/courses/[id]/
cat src/app/courses/[id]/page.tsx | grep SimpleCourse
# ✅ PASS: SimpleCourseDetail import 있음
# ❌ FAIL: 새 컴포넌트 생성됨

# Import 체크
grep -n "import.*Simple" src/app/courses/[id]/page.tsx
# ✅ PASS: SimpleCourseDetail, SimplePurchaseCard 둘 다
# ❌ FAIL: 하나라도 없음
```

### Level 2: 렌더링 검증
```javascript
// 브라우저 콘솔에서 실행
const checks = {
  // 필수 요소 존재
  title: document.querySelector('h1')?.textContent,
  content: document.querySelector('[class*="content"]')?.children.length > 0,
  purchaseCard: !!document.querySelector('[class*="purchase"]'),
  tabs: document.querySelectorAll('[class*="tab"]').length === 3,
  
  // Mock 데이터 확인
  mockData: document.body.innerHTML.includes('유튜브 쇼츠'),
  hasPrice: document.body.innerHTML.includes('원'),
  
  // 레이아웃 확인
  twoColumn: !!document.querySelector('.grid-cols-\\[1fr\\,400px\\]'),
  container: !!document.querySelector('.container')
}
console.table(checks)
// 하나라도 false면 FAIL
```

### Level 3: 스크린샷 검증
```bash
# Playwright 스크린샷
npx playwright screenshot http://localhost:3000/courses/1 verify.png

# 육안 확인 항목:
□ 2컬럼 레이아웃 (65% + 35%)
□ 좌측: 콘텐츠 (비어있으면 FAIL)
□ 우측: 구매 카드 (스티키)
□ 탭 3개: 강의소개/커리큘럼/FAQ
□ 실제 텍스트 있음 (Lorem ipsum 금지)
□ 이미지나 비디오 블록 표시
□ 가격 정보 표시
□ 수강 버튼 있음
```

## 🚨 즉시 FAIL 처리 목록

### 코드 레벨 FAIL
- `any` 타입 사용
- `// @ts-ignore` 사용
- 새 컴포넌트 파일 생성
- SimpleCourse 미사용
- theme.deep.json 미사용

### UI 레벨 FAIL
- 빈 div만 있음
- "Lorem ipsum" 텍스트
- 하드코딩된 색상 (#ffffff 등)
- Mock 데이터 미연결
- 탭 클릭 안 됨

### 기능 레벨 FAIL
- TypeScript 에러 있음
- 콘솔 에러 있음
- 404 에러
- 빈 화면
- 레이아웃 깨짐

## 📊 검증 스코어카드

```typescript
interface VerificationScore {
  codeQuality: {
    typescript: boolean,     // npx tsc --noEmit 통과
    imports: boolean,        // SimpleCourse 사용
    noNewComponents: boolean // 새 컴포넌트 없음
  },
  rendering: {
    layout: boolean,         // 2컬럼 레이아웃
    content: boolean,        // 콘텐츠 표시
    purchaseCard: boolean,   // 구매 카드 표시
    tabs: boolean           // 탭 3개
  },
  functionality: {
    mockData: boolean,       // Mock 데이터 사용
    interactive: boolean,    // 탭 클릭 가능
    responsive: boolean,     // 반응형 동작
    noErrors: boolean       // 콘솔 에러 없음
  }
}

// 모든 항목 true여야 PASS
```

## 🔴 검증 실패 시 조치

### 1차 실패: 경고
```
"검증 실패. SimpleCourseDetail 사용해서 다시."
```

### 2차 실패: 롤백
```bash
git reset --hard HEAD
"처음부터 다시. 10줄씩만."
```

### 3차 실패: 협박
```
"새 세션 열 준비 중. 마지막 기회."
```

### 4차 실패: 실행
```
"새 세션 추천. 현재 AI는 신뢰도 0%."
```