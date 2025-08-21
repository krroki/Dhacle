# 🚨 AI 세션 인계서: 타입 시스템 위기 대응

*작성일: 2025-02-21*  
*긴급도: **CRITICAL***  
*예상 작업 시간: 3-5일*

---

## ⚠️ 즉시 읽어야 할 내용

**현재 상황**: 프로젝트가 **빌드 불가능** 상태입니다. 300개 이상의 타입 오류로 인해 개발이 완전히 중단되었습니다.

**근본 원인**: 2025년 1월 31일, 38개의 자동 수정 스크립트가 삭제되면서 그동안 "땜질"되어 있던 타입 시스템의 구조적 문제가 한꺼번에 노출되었습니다.

---

## 📋 첫 실행 명령어 (복사하여 사용)

```bash
# 1. 현재 상황 파악
cd C:\My_Claude_Project\9.Dhacle
npm run verify:types 2>&1 | head -50

# 2. 핵심 문서 확인 (반드시 읽을 것)
cat docs/CRITICAL_TYPE_SYSTEM_RECOVERY_PLAN.md
cat docs/AUTOMATION_SCRIPT_GUIDELINES.md

# 3. 가장 심각한 오류 확인
cat src/lib/api/courses.ts | head -250
```

---

## 🔥 가장 긴급한 문제 (Phase 1 - 1일차)

### 1. TypeScript 컴파일 차단 오류 2개
**파일**: `src/lib/api/courses.ts`
```typescript
// Line 238: Type 'Course | null' is not assignable to type 'Course'
// Line 242: CourseProgress 타입 불일치 (서로 다른 파일에서 import)
```

**즉시 수정 방법**:
```typescript
// 1단계: Line 95-101의 로컬 interface 삭제
// ❌ 삭제할 부분
interface CourseDetailResponse {
  course: Course | null;
  lessons: any[];
  progress: any[];
}

// 2단계: import 타입만 사용하도록 수정
// 3단계: null 처리 명확화
return {
  course: mappedCourse || ({} as Course),  // null 대신 빈 객체
  lessons: mappedLessons as Lesson[],
  progress: progress as CourseProgress[],
}
```

### 2. ESLint any 타입 8개 (빌드 차단)
```
src/lib/api/courses.ts - 4개
src/lib/supabase/typed-client.ts - 2개
src/lib/utils/type-mappers.ts - 2개
```
**모든 `any`를 구체적 타입으로 변경 필수**

---

## 🗺️ 전체 작업 로드맵

### Phase 1: 긴급 안정화 (1일차) ⬅️ **여기부터 시작**
- [ ] TypeScript 컴파일 오류 2개 수정
- [ ] ESLint any 타입 8개 제거
- [ ] 빌드 성공 확인
- [ ] 개발 서버 실행 가능 확인

### Phase 2: 타입 시스템 통합 (2-3일차)
- [ ] 중복 타입 정의 제거 (course.ts 삭제)
- [ ] Import 경로 통일 (@/types만 사용)
- [ ] DB 타입 재생성 (`npm run types:generate`)

### Phase 3: 스마트 자동화 구축 (4일차)
- [ ] 검증 스크립트 개선
- [ ] 안전한 자동화 도구 생성
- [ ] Dry-run 모드 구현

### Phase 4: 방어 체계 구축 (5일차)
- [ ] Pre-commit hook 강화
- [ ] CI/CD 파이프라인 개선
- [ ] 문서화 완료

---

## ⚠️ 절대 하지 말아야 할 것들

### 🚫 금지사항
1. **일괄 자동 수정 스크립트 생성 금지**
   ```javascript
   // ❌ 절대 만들지 마세요
   fixAllErrors('**/*.ts')  // 재앙의 시작
   ```

2. **컨텍스트 없는 패턴 매칭 수정 금지**
   ```javascript
   // ❌ 위험
   replace(/any/g, 'unknown')  // 더 많은 오류 생성
   ```

3. **타입 정의 새로 생성 금지**
   - 이미 3곳에 중복된 타입 정의가 있음
   - 더 추가하면 상황 악화

---

## ✅ 반드시 따라야 할 원칙

### 1. 파일 단위 수정
```bash
# ✅ 올바른 접근
1. Read로 파일 전체 이해
2. 컨텍스트 파악
3. 필요한 부분만 Edit
4. 검증 실행
```

### 2. 검증 우선
```bash
# 수정 전후 항상 실행
npm run verify:types
npm run verify:api
npm run build
```

### 3. 백업 생성
```bash
# 중요 파일 수정 전
cp src/lib/api/courses.ts src/lib/api/courses.ts.backup
```

---

## 📚 배경 지식

### 왜 이렇게 되었나?
1. **2025-01-20**: 117개 타입 오류 발생
2. **2025-01-20~30**: 38개 자동 스크립트로 "해결"
3. **2025-01-31**: 스크립트 전면 삭제 (위험성 인지)
4. **2025-02-01~21**: 수동 수정 시도 → 300개+ 오류 폭발

### 핵심 문제
- **타입 정의 중복**: 같은 타입이 3곳에서 다르게 정의
- **Any 타입 남용**: ESLint가 빌드 차단
- **Snake_case 혼재**: DB와 Frontend 네이밍 불일치

---

## 🔗 참고 자료

### 필수 문서
1. `docs/CRITICAL_TYPE_SYSTEM_RECOVERY_PLAN.md` - 상세 복구 계획
2. `docs/AUTOMATION_SCRIPT_GUIDELINES.md` - 자동화 가이드
3. `CLAUDE.md` - AI 작업 지침 (업데이트됨)
4. `docs/PROJECT.md` - 프로젝트 현황

### 유용한 스크립트
```bash
# 검증 전용 (안전)
npm run verify:types
npm run verify:parallel
npm run verify:all

# 위험 (백업된 폴더)
scripts/backup-unused-scripts-20250131/
```

---

## 💬 사용자와의 커뮤니케이션

### 예상 질문과 답변

**Q: "왜 오류가 더 늘어났어?"**
A: 자동 스크립트가 문제를 해결한 게 아니라 숨기고 있었습니다. 이제 진짜 문제를 해결하고 있습니다.

**Q: "언제 정상화되나?"**
A: Phase 1 완료 시(1일) 개발 가능, Phase 4 완료 시(5일) 완전 정상화됩니다.

**Q: "자동 스크립트 다시 만들면 안되나?"**
A: 안전한 검증 스크립트는 만들되, 자동 수정은 매우 신중하게 접근해야 합니다.

---

## 🎯 성공 기준

### Phase 1 완료 시
- ✅ `npm run build` 성공
- ✅ TypeScript 오류 < 50개
- ✅ Any 타입 0개

### 전체 완료 시
- ✅ TypeScript 오류 0개
- ✅ 단일 타입 정의 소스
- ✅ 자동 검증 시스템 구축
- ✅ 문서화 완료

---

## 🆘 막힐 때

1. **타입 오류가 계속 늘어난다면**
   - 일단 멈추고 `npm run verify:types` 실행
   - 패턴을 파악한 후 하나씩 해결

2. **Any 타입 대체가 어렵다면**
   - 임시로 `unknown` 사용 후 타입 가드 추가
   - 또는 정확한 타입을 database.generated.ts에서 찾기

3. **Import 충돌이 생긴다면**
   - 무조건 `@/types`에서만 import
   - course.ts 등 개별 파일 import 금지

---

## 📌 마지막 당부

**"빠른 해결"을 위해 자동 스크립트를 만들고 싶은 유혹이 들 것입니다.**

**하지만 그것이 현재 상황을 만든 원인입니다.**

**천천히, 하나씩, 확실하게 해결하세요.**

---

*작성자: 이전 세션 Claude*  
*인계 대상: 새로운 세션 Claude*

**행운을 빕니다. 당신은 할 수 있습니다. 💪**