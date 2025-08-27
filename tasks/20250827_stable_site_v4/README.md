/sc:implement --seq --validate --evidence --db-first --e2e --no-speculation
"Dhacle 안정적 사이트 구현 V4 - 실제 작동 강제 버전"

# 🎯 Dhacle 안정적 사이트 구현 V4 - DB-First & E2E 강제

**핵심 원칙**: "작동하지 않으면 완료가 아니다"

⚠️ **필독**: `/docs/INSTRUCTION_TEMPLATE_V4.md` - 모든 작업의 기준
⚠️ **DB Truth**: 모든 작업 전 `npm run types:generate` 필수

---

## 🚫 V3의 실패 원인 분석

### ❌ 치명적 문제점들
1. **DB-First 위반**: 코드부터 수정하고 DB는 나중에 확인
2. **TODO 41개 일괄 처리**: 현실적으로 불가능
3. **E2E가 Phase 3에 격리**: 너무 늦게 발견
4. **3-Strike Rule 없음**: profiles↔users 같은 반복
5. **브라우저 테스트가 "권장"**: 필수가 아님

### 📊 예상 실패 시나리오
```
Phase 0 → 타입 에러 해결 → 빌드 성공 → "완료!" 
→ npm run dev → 500 에러 → DB 불일치 발견 → 처음부터 다시
```

---

## ✅ V4 개선 사항

### 🔥 핵심 변경점
1. **DB Truth First**: 모든 작업 전 DB 스키마 확인 필수
2. **TODO 우선순위 분할**: 5-10개씩 나누어 처리
3. **즉시 E2E 검증**: 모든 Phase에서 브라우저 테스트
4. **3-Strike Rule**: 같은 파일 3번 수정 시 즉시 중단
5. **실제 작동 필수**: 컴파일 성공 ≠ 완료

---

## 📂 Phase 구조 (30분 단위)

| Phase | 작업 내용 | TODO 개수 | 예상 시간 | E2E 검증 |
|-------|----------|-----------|----------|---------|
| **Phase 0** | DB Truth & 타입 에러 | - | 4시간 | ✅ 필수 |
| **Phase 1** | 인증 관련 TODO | 5개 | 3시간 | ✅ 필수 |
| **Phase 2** | 프로필 관련 TODO | 8개 | 4시간 | ✅ 필수 |
| **Phase 3** | YouTube Lens TODO | 10개 | 5시간 | ✅ 필수 |
| **Phase 4** | 결제 관련 TODO | 8개 | 4시간 | ✅ 필수 |
| **Phase 5** | 나머지 TODO | 10개 | 4시간 | ✅ 필수 |

---

## 🎬 E2E 시나리오 (모든 Phase 적용)

### 필수 검증 프로세스
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 브라우저 테스트
- http://localhost:3000 접속
- 개발자 도구 Console 열기
- 실제 기능 클릭 테스트

# 3. 검증 항목
✅ 페이지 로드 성공
✅ Console 에러 0개
✅ Network 200/201 응답
✅ DB 데이터 저장 확인
```

---

## ⚡ 3-Strike Rule

### 즉시 중단 조건
```
같은 파일 3번 수정 = STOP
→ 근본 원인 분석 필수
→ DB 스키마 재확인
→ 실제 테이블 구조 확인
```

### 실패 패턴 예시
```
1차: profiles.naver_cafe_member_url 수정
2차: users.naver_cafe_member_url로 변경
3차: 다시 profiles로 변경 → STOP! DB Truth 확인 필요
```

---

## 🔍 Phase 0 특별 주의사항

### DB Truth 확인 프로세스
```bash
# 1. DB 스키마 최신화 (필수!)
npm run types:generate

# 2. 실제 테이블 확인
cat src/types/database.generated.ts | grep -A 50 "profiles:"
cat src/types/database.generated.ts | grep -A 30 "users:"

# 3. 필드 불일치 발견 시
- SQL 작성 → 실행 → 재생성
- 절대 추측 코딩 금지
```

---

## ⛔ 즉시 중단 신호

1. **any 타입 사용** → 즉시 중단
2. **TODO 주석 남기기** → 즉시 중단
3. **빈 배열/null 반환** → 즉시 중단
4. **"일단 컴파일되게..."** → 즉시 중단
5. **테스트 없이 "완료"** → 즉시 중단

---

## 📊 일일 진행 상황 추적

### 매일 시작 시
```bash
# 1. DB Truth 확인
npm run types:generate
git diff src/types/database.generated.ts

# 2. 현재 상태 체크
grep -r "TODO" src/ | wc -l  # 남은 TODO 수
npm run types:check          # 타입 에러 확인

# 3. 실제 작동 테스트
npm run dev
# 브라우저로 직접 확인 필수!
```

### 매일 종료 시
```bash
# 1. 증거 수집
- 작동 스크린샷/영상
- Network 탭 캡처
- DB 쿼리 결과

# 2. 진행 기록
- 해결한 TODO: [목록]
- 실제 작동 기능: [목록]
- 발견한 문제: [목록]
```

---

## 📈 성공 지표

### Phase별 완료 조건
```yaml
Phase_완료:
  코드:
    - TODO 제거 완료
    - 타입 에러 0개
    - any 타입 0개
  
  실제_작동:
    - npm run dev 성공
    - 브라우저 테스트 통과
    - Console 에러 0개
    - DB 데이터 확인
  
  증거:
    - 작동 영상/GIF
    - Network 로그
    - DB 스크린샷
```

---

## 🚀 시작하기

### 1. Phase 0부터 시작 (DB Truth)
```bash
cat PHASE_0_DB_TRUTH.md
```

### 2. TODO 현황 파악
```bash
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l
# 현재: 41개 → 목표: 0개
```

### 3. 실제 작동 확인
```bash
npm run dev
# localhost:3000 접속 → 실제 클릭 테스트
```

---

## 📋 파일 목록

```
tasks/20250827_stable_site_v4/
├── README.md                   # 이 파일 (마스터 지시서)
├── PHASE_0_DB_TRUTH.md        # DB 스키마 확인 & 타입 에러
├── PHASE_1_AUTH_TODO.md       # 인증 관련 TODO (5개)
├── PHASE_2_PROFILE_TODO.md    # 프로필 관련 TODO (8개)
├── PHASE_3_YOUTUBE_TODO.md    # YouTube Lens TODO (10개)
├── PHASE_4_PAYMENT_TODO.md    # 결제 관련 TODO (8개)
├── PHASE_5_REMAINING_TODO.md  # 나머지 TODO (10개)
└── E2E_SCENARIOS.md           # 전체 사용자 시나리오
```

---

## 🔥 핵심 메시지

> **"컴파일 성공이 아닌, 실제 사용자가 브라우저에서 사용할 수 있는 사이트를 만든다"**

- ❌ 타입 에러 0개 = 완료 (X)
- ❌ 빌드 성공 = 완료 (X)
- ✅ 사용자가 실제 클릭하고 사용 = 완료 (O)

---

*Version: 4.0.0*
*Created: 2025-08-27*
*Based on: INSTRUCTION_TEMPLATE_V4.md*
*목표: 실제로 작동하는 안정적인 사이트*