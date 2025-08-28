/sc:troubleshoot --seq --validate --evidence --no-speculation
"Phase 2: React Hook 경고 수정 - useEffect 의존성 배열 및 ref cleanup 경고 해결"

# Phase 2/3: React Hook 경고 수정

⚠️ **절대 준수사항**
- [ ] 추측 금지 - 모든 것을 확인 후 진행
- [ ] 임시방편 금지 - TODO, any, 주석처리 절대 금지
- [ ] 테스트 필수 - 작동 확인 없이 완료 보고 금지

---

## 📍 현재 상태 확인 (필수 실행)

### 파일 존재 확인
```bash
# 정확한 파일 경로 확인 (추측 금지)
ls -la src/components/features/tools/youtube-lens/AlertRules.tsx
ls -la src/hooks/use-youtube-lens-subscription.ts

# 없으면 STOP - 다음 진행 금지
```

### 현재 구현 확인
```bash
# AlertRules.tsx의 useEffect 확인 (라인 65 주변)
cat -n src/components/features/tools/youtube-lens/AlertRules.tsx | sed -n '60,70p'

# use-youtube-lens-subscription.ts의 cleanup 확인 (라인 54 주변)  
cat -n src/hooks/use-youtube-lens-subscription.ts | sed -n '50,60p'

# 현재 Hook 경고 확인
npm run build 2>&1 | grep -A 3 -B 3 "missing dependency\|ref value"
```

### 의존성 확인
```bash
# loadAlertRules 함수 정의 확인
grep -n "loadAlertRules" src/components/features/tools/youtube-lens/AlertRules.tsx

# pubsub ref 사용 패턴 확인
grep -n "pubsub.current" src/hooks/use-youtube-lens-subscription.ts
```

❌ **확인 실패 시** → 즉시 중단 및 보고

---

## 🔧 수정 작업 (정확한 위치)

### 파일 1: src/components/features/tools/youtube-lens/AlertRules.tsx

**라인 65 수정 - useEffect 의존성 배열**
```typescript
// 현재 코드 (정확히 이 코드여야 함)
  useEffect(() => {
    if (channelId) {
      loadAlertRules();
    }
  }, [channelId]);

// 수정 후 (정확히 이렇게 변경)
  useEffect(() => {
    if (channelId) {
      loadAlertRules();
    }
  }, [channelId, loadAlertRules]);
```

**수정 이유**: React Hook exhaustive-deps 규칙에 따라 useEffect에서 사용하는 `loadAlertRules` 함수를 의존성 배열에 포함해야 함

### 파일 2: src/hooks/use-youtube-lens-subscription.ts

**라인 52-55 수정 - ref cleanup 경고 해결**
```typescript
// 현재 코드 (정확히 이 코드여야 함)
    // Cleanup on unmount or channel change
    return () => {
      isMounted = false;
      pubsub.current.unsubscribe();
    };

// 수정 후 (정확히 이렇게 변경)
    // Cleanup on unmount or channel change
    return () => {
      isMounted = false;
      const currentPubsub = pubsub.current;
      currentPubsub.unsubscribe();
    };
```

**수정 이유**: ref cleanup 함수에서 `pubsub.current`를 직접 사용하면 cleanup 실행 시점에 값이 변경될 수 있으므로, 로컬 변수에 복사하여 사용

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
# React Hook 경고가 사라졌는지 확인
```

### 2. ESLint 검증
```bash
# React Hook 룰 체크
npx eslint src/components/features/tools/youtube-lens/AlertRules.tsx
npx eslint src/hooks/use-youtube-lens-subscription.ts
# exhaustive-deps, react-hooks 경고가 사라졌는지 확인
```

### 3. 실제 동작 검증
```bash
# 개발 서버 실행
npm run dev
```

**브라우저 테스트 체크리스트**
- [ ] http://localhost:3000 접속
- [ ] YouTube Lens 페이지로 이동
- [ ] AlertRules 컴포넌트가 정상 렌더링되는지 확인
- [ ] 채널 선택 시 useEffect가 정상 실행되는지 확인
- [ ] Console 에러 0개 확인 (F12)
- [ ] React Hook 관련 경고 0개 확인

### 4. Hook 동작 검증
```bash
# 실제 YouTube Lens 기능 테스트 필요
# - AlertRules 로딩 확인
# - subscription cleanup 정상 동작 확인
```

❌ **검증 실패** → Phase 실패 보고 및 중단
✅ **검증 성공** → Phase 3 진행 가능

---

## ✅ Phase 2 완료 조건

### 필수 (하나라도 실패 시 미완료)
- [ ] 컴파일 에러 0개
- [ ] React Hook 경고 0개
- [ ] AlertRules 컴포넌트 정상 작동
- [ ] YouTube Lens subscription 정상 작동
- [ ] Console 에러 0개

### 증거 수집
- 스크린샷: [YouTube Lens 페이지 정상 렌더링]
- 로그: [npm run build Hook 경고 0개 결과]
- 코드: [수정된 useEffect 의존성 배열, ref cleanup]

### 다음 Phase 진행 가능 여부
- ✅ 모든 필수 조건 충족 → Phase 3 진행
- ❌ 조건 미충족 → 수정 후 재검증

---

## 🔐 강제 체크포인트 (통과 필수)

### CP1: 시작 전
- [ ] 관련 파일 모두 확인 (AlertRules.tsx, use-youtube-lens-subscription.ts)
- [ ] 현재 Hook 경고 정확히 파악 (라인 65, 54)
- [ ] loadAlertRules 함수와 pubsub ref 사용 패턴 확인

### CP2: 수정 중
- [ ] 정확한 라인 번호에서만 수정
- [ ] useEffect 의존성 배열에 loadAlertRules 추가
- [ ] ref cleanup에서 로컬 변수 사용
- [ ] 다른 코드는 건드리지 않음

### CP3: 수정 후
- [ ] npm run types:check 통과
- [ ] npm run build Hook 경고 0개
- [ ] 브라우저에서 실제 YouTube Lens 테스트
- [ ] AlertRules 로딩 및 subscription 정상 동작 확인

**하나라도 실패 → 다음 단계 진행 불가**