/sc:troubleshoot --seq --validate --evidence --db-first --no-speculation
"Phase 0: DB Truth 확인 & 타입 에러 수정 - DB가 진실이다"

# Phase 0: DB Truth & 타입 에러 수정

## ⚠️ 3-Strike Rule
같은 파일 3번 수정 = 즉시 중단 → 근본 원인 파악 필수

## 🎯 목표
DB 스키마를 진실의 근원으로 삼아 모든 타입 에러 해결

---

## 🔍 Phase 0-1: DB Truth 확인 (필수!)

### 🎬 사용자 시나리오
```
개발자가 코드 작성 → DB와 불일치 → 500 에러 → 디버깅 지옥
↓ 해결책
DB 스키마 먼저 확인 → 코드를 DB에 맞춤 → 실제 작동
```

### ✅ 진행 조건
- [ ] git status 확인 (깨끗한 상태)
- [ ] npm install 완료
- [ ] .env 파일 확인

### 🔧 작업

#### Step 1: DB 스키마 최신화
```bash
# 1. 현재 타입 백업
cp src/types/database.generated.ts src/types/database.generated.ts.backup

# 2. DB에서 최신 스키마 가져오기
npm run types:generate

# 3. 변경사항 확인
git diff src/types/database.generated.ts
```

#### Step 2: 주요 테이블 구조 확인
```bash
# profiles vs users 확인 (가장 중요!)
echo "=== PROFILES TABLE ==="
cat src/types/database.generated.ts | grep -A 50 "profiles:"

echo "=== USERS TABLE ==="
cat src/types/database.generated.ts | grep -A 30 "users:"

# 네이버 카페 필드 위치 확인
grep -n "cafe_member_url\|naver_cafe" src/types/database.generated.ts
```

#### Step 3: 실제 사용 패턴 파악
```bash
# 어디서 profiles를 사용하는가?
grep -r "from.*profiles" src/ --include="*.ts" --include="*.tsx"

# 어디서 users를 사용하는가?
grep -r "from.*users" src/ --include="*.ts" --include="*.tsx"

# 필드명 불일치 찾기
grep -r "naver_cafe_member_url" src/ --include="*.ts" --include="*.tsx"
```

### 🧪 검증
```bash
# DB 스키마가 최신인가?
- [ ] database.generated.ts 업데이트됨
- [ ] profiles 테이블 구조 확인
- [ ] users 테이블 구조 확인
- [ ] 필드명 매핑 완료
```

---

## 🔍 Phase 0-2: 타입 에러 수정 (DB 기반)

### 🎬 사용자 시나리오
```
타입 에러 15개 → 추측으로 수정 → 런타임 에러
↓ 해결책
DB 스키마 확인 → 정확한 타입 적용 → 컴파일 & 런타임 모두 성공
```

### ✅ 진행 조건
- [ ] Phase 0-1 완료 (DB Truth 확인)
- [ ] 타입 에러 목록 확보
- [ ] 수정 우선순위 결정

### 🔧 작업

#### Step 1: 타입 에러 목록 확보
```bash
# 전체 타입 에러 확인
npm run types:check 2>&1 | tee type-errors.log

# 에러 개수 파악
grep -c "error TS" type-errors.log

# 파일별 에러 분류
grep "error TS" type-errors.log | cut -d'(' -f1 | sort | uniq -c
```

#### Step 2: 필드명 불일치 수정

**🚨 중요: DB 스키마가 진실이다!**

```typescript
// ❌ 잘못된 수정 (추측)
profile.naver_cafe_member_url // DB에 없는 필드

// ✅ 올바른 수정 (DB 확인 후)
profile.cafe_member_url // DB에 실제로 있는 필드
```

**수정 대상 파일들:**
1. `src/app/api/admin/verify-cafe/route.ts`
2. `src/app/api/user/naver-cafe/route.ts`
3. `src/app/api/user/profile/route.ts`
4. `src/app/mypage/profile/page.tsx`
5. `src/components/features/tools/youtube-lens/AlertRules.tsx`

#### Step 3: 각 파일별 수정

**파일 1: src/app/api/admin/verify-cafe/route.ts**
```bash
# 현재 상태 확인
grep -n "naver_cafe\|cafe_member" src/app/api/admin/verify-cafe/route.ts

# DB 확인 후 수정
# Line 80: .select() 내용을 DB 필드에 맞춤
# Line 88: 필드명을 실제 DB 필드로 변경
```

**파일 2: src/app/api/user/naver-cafe/route.ts**
```bash
# 현재 상태 확인
grep -n "select\|naver_cafe\|cafe_member" src/app/api/user/naver-cafe/route.ts

# DB 확인 후 수정
# Line 37: select 문의 필드를 DB와 일치
# Line 66: 응답 객체의 필드명 수정
```

### 🧪 검증 (각 수정 후 즉시!)
```bash
# 1. 타입 체크
npm run types:check

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저 테스트
- [ ] localhost:3000 접속
- [ ] Console 에러 확인 (0개여야 함)
- [ ] 프로필 페이지 접속
- [ ] API 호출 확인 (Network 탭)
```

---

## 🔍 Phase 0-3: 실제 작동 확인

### 🎬 사용자 시나리오
```
빌드 성공 → "완료!" → 실제로는 작동 안 함
↓ 해결책
빌드 성공 → 브라우저 테스트 → 실제 작동 확인 → 진짜 완료
```

### ✅ 진행 조건
- [ ] Phase 0-2 완료 (타입 에러 0개)
- [ ] npm run build 성공
- [ ] 환경 변수 설정 확인

### 🔧 작업

#### Step 1: 빌드 테스트
```bash
# 클린 빌드
rm -rf .next
npm run build

# 빌드 결과 확인
- [ ] 에러 없음
- [ ] 경고 최소화
- [ ] 번들 크기 확인
```

#### Step 2: 실제 브라우저 테스트
```bash
# 개발 서버 실행
npm run dev
```

**필수 테스트 시나리오:**
1. **메인 페이지**
   - [ ] localhost:3000 접속
   - [ ] 페이지 정상 로드
   - [ ] Console 에러 0개

2. **프로필 페이지**
   - [ ] /mypage/profile 접속
   - [ ] 데이터 로드 확인
   - [ ] 네이버 카페 섹션 표시

3. **API 테스트**
   ```bash
   # Chrome DevTools → Network 탭
   - [ ] /api/user/profile → 200 OK
   - [ ] 응답 데이터 확인
   - [ ] 필드명 일치 확인
   ```

### 🧪 최종 검증
```bash
# 증거 수집
- [ ] 메인 페이지 스크린샷
- [ ] 프로필 페이지 스크린샷
- [ ] Network 탭 스크린샷
- [ ] Console 탭 스크린샷 (에러 0개)
```

---

## ⛔ 즉시 중단 신호

1. **같은 에러 3번 반복** → DB 스키마 재확인
2. **any 타입 사용 시도** → 정확한 타입 찾기
3. **"일단 컴파일만..."** → 실제 작동 확인
4. **profiles vs users 혼란** → DB Truth 다시 확인

---

## 📋 체크리스트

### Phase 0 완료 조건
```yaml
DB_Truth:
  - [ ] npm run types:generate 실행
  - [ ] database.generated.ts 최신화
  - [ ] profiles vs users 명확히 구분
  - [ ] 필드명 매핑 완료

타입_에러:
  - [ ] TypeScript 에러: 0개
  - [ ] any 타입 사용: 0개
  - [ ] 추측 코딩: 0개

빌드:
  - [ ] npm run build: 성공
  - [ ] 번들 생성 완료

실제_작동:
  - [ ] npm run dev: 정상 실행
  - [ ] localhost:3000: 접속 성공
  - [ ] Console 에러: 0개
  - [ ] API 응답: 200/201
  - [ ] DB 데이터: 정상 표시

증거:
  - [ ] 작동 스크린샷 3장 이상
  - [ ] Network 로그 캡처
  - [ ] 타입 체크 성공 로그
```

---

## 🔄 실패 시 프로토콜

### 타입 에러가 계속 발생할 때
```bash
# 1. DB 스키마 재확인
npm run types:generate
git diff src/types/database.generated.ts

# 2. 실제 DB 쿼리로 확인
node scripts/verify-with-service-role.js

# 3. 필드 위치 재확인
- profiles에 있는지?
- users에 있는지?
- 아예 없는지?
```

### 런타임 에러 발생 시
```bash
# 1. Console 에러 전체 복사
# 2. 에러 발생 파일:라인 확인
# 3. DB 쿼리 실제 실행해보기
# 4. 필드명 오타 확인
```

---

## → 다음 Phase

Phase 0 완료 확인 후:
```bash
# 완료 상태 확인
- 타입 에러: 0개
- 실제 작동: 확인됨
- 증거: 수집 완료

# Phase 1로 진행
cat PHASE_1_AUTH_TODO.md
```

---

*Phase 0: DB Truth & 타입 에러*
*핵심: DB 스키마가 진실, 추측 코딩 금지*
*목표: 실제로 작동하는 기반 확보*