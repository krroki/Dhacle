# ✅ 빠른 검증 체크리스트

> Phase 1-4 실행 상태 빠른 확인용

## 🚀 5분 빠른 검증

### 1️⃣ Phase 1: DB 테이블 (15개)
```bash
# 테이블 수 확인 (15개 이상이어야 함)
node scripts/verify-with-service-role.js | grep "테이블" | wc -l
```
- [ ] channelSubscriptions 테이블 존재
- [ ] yl_channels 테이블 존재
- [ ] api_usage 테이블 존재
- [ ] proof_reports 테이블 존재
- [ ] coupons 테이블 존재
- [ ] 나머지 10개 테이블 존재
- [ ] RLS 정책 활성화 확인

### 2️⃣ Phase 2: TypeScript (51개 any 제거)
```bash
# any 타입 수 (0이어야 함)
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
```
- [ ] any 타입 0개 달성
- [ ] TypeScript 에러 0개
- [ ] 빌드 성공

### 3️⃣ Phase 3: 보안 (라우트 보호)
```bash
# 보호된 API 라우트 수
grep -r "getUser()" src/app/api -name "route.ts" | wc -l
```
- [ ] 모든 API 라우트 보호
- [ ] middleware.ts 설정
- [ ] RLS 정책 적용

### 4️⃣ Phase 4: API 통일 (13개 fetch 제거)
```bash
# 직접 fetch 사용 수 (0이어야 함)
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "apiClient" | wc -l
```
- [ ] fetch() 직접 호출 0개
- [ ] apiClient 사용 통일
- [ ] 환경변수 env.ts 통일

## 📊 최종 점수

| Phase | 목표 | 현재 | 달성률 |
|-------|------|------|--------|
| Phase 1 | 15개 테이블 | ___개 | ___% |
| Phase 2 | 0개 any | ___개 | ___% |
| Phase 3 | 100% 보호 | ___% | ___% |
| Phase 4 | 0개 fetch | ___개 | ___% |

## 🔴 즉시 해결 필요

1. [ ] _________________________
2. [ ] _________________________
3. [ ] _________________________

## 🟡 다음 단계

1. [ ] _________________________
2. [ ] _________________________
3. [ ] _________________________

## 🟢 완료된 항목

1. [x] _________________________
2. [x] _________________________
3. [x] _________________________

---

*검증 일시: ____________*
*검증자: ____________*
*전체 달성률: ____%*