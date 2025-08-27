/sc:troubleshoot --seq --validate --think
"Phase 1: TypeScript 타입 시스템 완전 정상화 - 컴파일 에러 0개 달성"

# Phase 1: 타입 시스템 정상화

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인
- `/docs/CONTEXT_BRIDGE.md` 필독
- any 타입 사용 금지
- 임시방편 해결 금지

## 📌 Phase 정보
- Phase 번호: 1/5
- 예상 시간: 4시간
- 우선순위: 🔴 CRITICAL
- 선행 조건: 없음
- 차단 요소: 타입 에러로 인한 빌드 실패

## 🔥 실제 코드 확인
```bash
# 현재 타입 에러 상황
npm run types:check | head -30

# 필드명 패턴 확인
grep -r "naver_cafe_member_url\|cafe_member_url" src/ --include="*.ts" --include="*.tsx"

# AlertRules 사용 패턴
grep -r "AlertRules" src/ --include="*.tsx"
```

## 🎯 Phase 목표
1. TypeScript 컴파일 에러 0개
2. 모든 필드명 불일치 해결
3. any 타입 완전 제거
4. 타입 가드 추가

## 📝 작업 내용

### 1️⃣ 필드명 불일치 해결

#### 파일: src/app/mypage/profile/page.tsx
```typescript
// 라인 108-110 수정 - 이미 수정됨
if (data.cafe_member_url) {
  set_naver_cafe_member_url(data.cafe_member_url);
}
```

### 2️⃣ AlertRules Props 타입 수정

#### 파일: src/app/(pages)/tools/youtube-lens/page.tsx
```typescript
// 라인 464 수정
// ❌ 현재
<AlertRules />

// ✅ 수정 - channelId prop 전달
{selectedChannelId && <AlertRules channelId={selectedChannelId} />}
```

### 3️⃣ 남은 타입 에러 해결

#### 컴파일 에러 목록:
1. src/app/(pages)/tools/youtube-lens/page.tsx(464,12): channelId missing
2. src/components/features/tools/youtube-lens/AlertRules.tsx: 타입 불일치
3. src/app/api/admin/verify-cafe/route.ts: 필드 참조 오류
4. src/app/api/user/naver-cafe/route.ts: 필드 참조 오류

#### 각 파일별 수정 사항:
- AlertRules 컴포넌트: channelId optional 처리 확인
- API routes: users 테이블 사용 확인 (profiles는 VIEW)

## ✅ 완료 조건 (실제 작동 확인 필수)

### 🔴 필수 완료 조건 (하나라도 미충족 시 미완료)
```bash
# 1. 타입 체크 성공
- [ ] npm run types:check → 에러 0개
- [ ] npx tsc --noEmit → 성공

# 2. any 타입 제거
- [ ] grep -r ": any" src/ --include="*.ts" → 0개 (타입 정의 제외)

# 3. 빌드 테스트
- [ ] npm run build → 성공
```

### 🟡 권장 완료 조건
- [ ] 타입 가드 함수 추가
- [ ] 제네릭 타입 활용
- [ ] 유틸리티 타입 사용

### 🟢 선택 완료 조건
- [ ] JSDoc 주석 추가
- [ ] 타입 테스트 작성

## 🔄 롤백 계획

```bash
# 백업
git checkout -b backup-type-system
git add -A && git commit -m "Backup before type system fix"

# 실패 시 롤백
git reset --hard HEAD~1
```

## → 다음 Phase
- 파일: PHASE_2_API_COMPLETION.md