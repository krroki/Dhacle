/sc:troubleshoot --e2e --validate
"Phase 0: DB Truth & 타입 에러 - 실제 작동 기반 구축"

# Phase 0: DB Truth & 타입 에러 수정

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 🎬 사용자 시나리오
1. 개발자가 localhost:3000 접속
2. 500 에러 발생 → Console 확인
3. "profiles.naver_cafe_member_url" 에러
4. DB 확인 → 실제는 "cafe_member_url"
5. 코드 수정 → 다시 테스트 → 작동!

## 현재 문제
- 타입 에러 15개+
- profiles vs users 필드 혼란
- DB와 코드 불일치

## 작업 내용

### 1. DB Truth 확인 (30분)
```bash
# DB 스키마 최신화
npm run types:generate

# 변경사항 확인
git diff src/types/database.generated.ts

# profiles vs users 구조 확인
grep -A 50 "profiles:" src/types/database.generated.ts
grep -A 30 "users:" src/types/database.generated.ts
```

**중요 발견사항:**
- `naver_cafe_member_url` → 실제는 `cafe_member_url`
- 네이버 카페 관련 필드는 profiles 테이블에 존재
- users 테이블에는 기본 인증 정보만

### 2. 타입 에러 수정 (2시간)

#### 수정 대상 파일들
```bash
# 잘못된 필드명 사용 중인 파일들
grep -n "naver_cafe_member_url" src/ --include="*.ts" --include="*.tsx"
```

**파일 1: src/app/api/admin/verify-cafe/route.ts**
```typescript
// Line 80, 88 수정
// ❌ 기존
.select('id, username, naver_cafe_member_url, naver_cafe_nickname')

// ✅ 수정
.select('id, username, cafe_member_url, naver_cafe_nickname')
```

**파일 2: src/app/api/user/naver-cafe/route.ts**
```typescript
// Line 37, 66 수정
// ❌ 기존
cafeMemberUrl: profile.naver_cafe_member_url

// ✅ 수정  
cafeMemberUrl: profile.cafe_member_url
```

**파일 3: src/app/api/user/profile/route.ts**
```typescript
// Line 49, 57 수정
// 동일하게 필드명 변경
```

**파일 4: src/app/mypage/profile/page.tsx**
```typescript
// Line 123, 145 수정
// 컴포넌트에서도 필드명 통일
```

**파일 5: src/components/features/tools/youtube-lens/AlertRules.tsx**
```typescript
// Line 89 수정
// 타입 정의 수정
```

### 3. 즉시 검증 (각 수정 후)
```bash
# 타입 체크
npm run types:check

# 개발 서버 실행
npm run dev

# 브라우저 테스트
- localhost:3000 접속
- Console 에러 확인 (0개여야 함)
- 프로필 페이지 접속
- API 호출 확인
```

### 4. 실제 작동 확인 (1시간)

#### 필수 테스트 시나리오
```markdown
1. **메인 페이지**
   - [ ] localhost:3000 접속 성공
   - [ ] 페이지 정상 로드
   - [ ] Console 에러 0개

2. **프로필 페이지**  
   - [ ] /mypage/profile 접속
   - [ ] 데이터 로드 성공
   - [ ] 네이버 카페 섹션 표시

3. **API 테스트**
   - [ ] /api/user/profile → 200 OK
   - [ ] 응답 필드명 확인
   - [ ] DB 데이터와 일치
```

---

## ✅ 완료 조건

### 실제 작동
- [ ] npm run dev 정상 실행
- [ ] localhost:3000 에러 없이 로드
- [ ] Console 에러 0개
- [ ] 모든 페이지 접근 가능

### 코드 품질
- [ ] TypeScript 에러 0개
- [ ] any 타입 사용 0개
- [ ] TODO 주석 0개 (Phase 0 범위)

### 증거
- [ ] 메인 페이지 스크린샷
- [ ] 프로필 페이지 스크린샷
- [ ] Console 탭 스크린샷 (에러 0개)
- [ ] Network 탭 스크린샷

---

## 🔄 에러 발생 시

### profiles vs users 혼란 시
```bash
# DB 직접 확인
cat src/types/database.generated.ts | grep -A 20 "cafe_member"

# 실제 사용 패턴 확인
grep -r "from.*profiles" src/ --include="*.ts"
grep -r "from.*users" src/ --include="*.ts"
```

### 타입 에러 계속 발생 시
```bash
# DB 스키마 재생성
npm run types:generate

# 특정 파일 집중 수정
npx tsc --noEmit src/[문제파일].ts
```

---

## → Phase 1로

Phase 0 완료 확인:
- [ ] 타입 에러 0개
- [ ] 실제 작동 확인
- [ ] 증거 수집 완료

다음 단계:
```bash
cat E2E_PHASE_1.md
```

---

*Phase 0: DB Truth & 타입 에러*
*목표: 실제로 작동하는 기반 확보*
*시간: 4시간*