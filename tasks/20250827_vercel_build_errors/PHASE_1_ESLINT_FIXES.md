/sc:troubleshoot --seq --validate --evidence --no-speculation
"Phase 1: ESLint 에러 수정 - test-error/page.tsx @ts-ignore → @ts-expect-error 변경"

# Phase 1/3: ESLint 에러 수정

⚠️ **절대 준수사항**
- [ ] 추측 금지 - 모든 것을 확인 후 진행
- [ ] 임시방편 금지 - TODO, any, 주석처리 절대 금지
- [ ] 테스트 필수 - 작동 확인 없이 완료 보고 금지

---

## 📍 현재 상태 확인 (필수 실행)

### 파일 존재 확인
```bash
# 정확한 파일 경로 확인 (추측 금지)
ls -la src/app/test-error/page.tsx

# 없으면 STOP - 다음 진행 금지
```

### 현재 구현 확인
```bash
# 실제 코드 확인 (라인 번호 포함)
cat -n src/app/test-error/page.tsx | sed -n '20,45p'

# ESLint 에러 확인
grep -n "@ts-ignore" src/app/test-error/page.tsx
```

### Vercel 에러 로그 재확인
```bash
# 현재 빌드 상태 확인
npm run build 2>&1 | grep -A 5 -B 5 "ts-ignore"
```

❌ **확인 실패 시** → 즉시 중단 및 보고

---

## 🔧 수정 작업 (정확한 위치)

### 파일: src/app/test-error/page.tsx

**라인 21 수정 (현재 `@ts-ignore`)**
```typescript
// 현재 코드 (정확히 이 코드여야 함)
    // @ts-ignore

// 수정 후 (정확히 이렇게 변경)  
    // @ts-expect-error
```

**라인 27 수정 (현재 `@ts-ignore`)**
```typescript
// 현재 코드 (정확히 이 코드여야 함)
    // @ts-ignore

// 수정 후 (정확히 이렇게 변경)
    // @ts-expect-error
```

**라인 42 수정 (현재 `@ts-ignore`)**
```typescript
// 현재 코드 (정확히 이 코드여야 함)
    // @ts-ignore

// 수정 후 (정확히 이렇게 변경)
    // @ts-expect-error
```

**수정 이유**: ESLint 규칙 `@typescript-eslint/ban-ts-comment`에 따라 `@ts-ignore` 대신 `@ts-expect-error` 사용 필요

⚠️ **수정 금지 사항**
- any 타입 사용 → 타입 오류 발생 시 정확한 타입 찾기
- TODO 주석 → 완전히 구현하거나 삭제  
- try-catch로 에러 숨기기 → 근본 원인 해결

---

## 🔍 검증 단계 (필수)

### 1. 컴파일 검증
```bash
# 타입 체크 (에러 0개 필수)
npm run types:check
# 실패 시 → 수정 단계로 돌아가기

# 빌드 확인
npm run build 
# 실패 시 → 에러 메시지 기록 후 수정
```

### 2. ESLint 검증
```bash
# ESLint 체크
npx eslint src/app/test-error/page.tsx
# @ts-ignore 관련 에러가 사라졌는지 확인
```

### 3. 실제 동작 검증
```bash
# 개발 서버 실행
npm run dev
```

**브라우저 테스트 체크리스트**
- [ ] http://localhost:3000/test-error 접속
- [ ] 페이지가 정상 렌더링되는지 확인
- [ ] Console 에러 0개 확인 (F12)
- [ ] 버튼 클릭 시 의도된 에러가 정상 발생하는지 확인

❌ **검증 실패** → Phase 실패 보고 및 중단
✅ **검증 성공** → Phase 2 진행 가능

---

## ✅ Phase 1 완료 조건

### 필수 (하나라도 실패 시 미완료)
- [ ] 컴파일 에러 0개
- [ ] ESLint `@ts-ignore` 에러 0개
- [ ] test-error 페이지 정상 작동
- [ ] Console 에러 0개 (의도된 에러 제외)

### 증거 수집
- 스크린샷: [test-error 페이지 정상 렌더링]
- 로그: [npm run build 성공 결과]
- 코드: [수정된 @ts-expect-error 라인들]

### 다음 Phase 진행 가능 여부
- ✅ 모든 필수 조건 충족 → Phase 2 진행
- ❌ 조건 미충족 → 수정 후 재검증

---

## 🔐 강제 체크포인트 (통과 필수)

### CP1: 시작 전
- [ ] src/app/test-error/page.tsx 파일 존재 확인
- [ ] 현재 @ts-ignore 위치 정확히 파악 (라인 21, 27, 42)
- [ ] 빌드 에러 메시지에서 정확한 라인 번호 확인

### CP2: 수정 중  
- [ ] 정확한 라인 번호에서만 수정
- [ ] @ts-expect-error로 정확히 변경
- [ ] 다른 코드는 건드리지 않음

### CP3: 수정 후
- [ ] npm run types:check 통과
- [ ] npm run build 성공  
- [ ] 브라우저에서 실제 테스트
- [ ] ESLint 에러 0개 확인

**하나라도 실패 → 다음 단계 진행 불가**