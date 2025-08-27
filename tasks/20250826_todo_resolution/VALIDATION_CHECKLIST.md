# ✅ TODO 해결 검증 체크리스트

⚠️ 각 Phase 완료 후 이 체크리스트로 검증 필수

## 🔴 Phase별 검증 (순차적 진행)

### Phase 1: 데이터베이스 구조 (21개 TODO)
```bash
# SQL 실행 확인
- [ ] supabase/migrations/ 폴더에 SQL 파일 생성됨
- [ ] node scripts/supabase-sql-executor.js 실행 성공
- [ ] Supabase Dashboard에서 테이블 확인

# 필드 확인
- [ ] profiles 테이블 필드 추가 완료
  - [ ] randomNickname
  - [ ] naverCafeVerified
  - [ ] cafe_member_url
  - [ ] work_type
  - [ ] email
- [ ] coupons 테이블 생성
- [ ] analyticsLogs 테이블 생성
```

### Phase 2: 인증/프로필 시스템 (8개 TODO)
```bash
# API 테스트
- [ ] POST /api/user/init-profile → 200
- [ ] GET /api/user/profile → 200
- [ ] POST /api/user/naver-cafe → 200

# 브라우저 테스트
- [ ] 회원가입 후 프로필 설정 화면 표시
- [ ] 랜덤 닉네임 생성 작동
- [ ] 네이버 카페 인증 UI 표시
```

### Phase 3: 결제 시스템 (3개 TODO)
```bash
# API 테스트
- [ ] POST /api/payment/create-intent → 200
- [ ] POST /api/coupons/validate → 200
- [ ] POST /api/payment/fail → 쿠폰 복원 동작

# 브라우저 테스트
- [ ] 쿠폰 입력 UI 작동
- [ ] 할인 금액 적용 확인
- [ ] 결제 실패 시 쿠폰 복원
```

### Phase 4: YouTube Lens (15개 TODO)
```bash
# 테이블 확인
- [ ] yl_channels 테이블 존재
- [ ] yl_channel_daily_delta 테이블 존재
- [ ] yl_approval_logs 테이블 존재
- [ ] alert_rules 테이블 존재

# API 테스트
- [ ] GET /api/youtube-lens/admin/channels → 200
- [ ] GET /api/youtube-lens/trending-summary → 200
- [ ] GET /api/youtube/favorites → 200

# 브라우저 테스트
- [ ] YouTube Lens 페이지 정상 로드
- [ ] 채널 분석 데이터 표시
- [ ] 알림 규칙 설정 가능
```

### Phase 5: 더미 데이터 교체 (12개 TODO)
```bash
# 구현 확인
- [ ] 프로필 이미지 업로드 기능 구현
- [ ] 강사 정보 실제 데이터 입력
- [ ] duration 계산 로직 구현
- [ ] reviewCount 집계 로직 구현

# 데이터 확인
- [ ] 더미 데이터 제거됨
- [ ] 실제 데이터로 교체됨
- [ ] UI에 정상 표시
```

### Phase 6: 부가 기능 (3개 TODO)
```bash
# 기능 구현
- [ ] 계정 삭제 API 구현
- [ ] 뉴스레터 구독 기능
- [ ] 검색 기능 구현

# 브라우저 테스트
- [ ] 계정 삭제 동작
- [ ] 뉴스레터 구독 폼 작동
- [ ] 검색 결과 표시
```

## 🔥 전체 시스템 검증

### 코드 품질 검증
```bash
# TODO 제거 확인
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l
# 예상: 0개

# any 타입 확인
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
# 예상: 0개

# 빌드 테스트
npm run build
# 예상: 성공

# 타입 체크
npm run types:check
# 예상: 에러 0개
```

### 실제 사용자 플로우 테스트
```bash
# 1. 회원가입 플로우
- [ ] 카카오 로그인 → 성공
- [ ] 프로필 초기 설정 → 완료
- [ ] 네이버 카페 인증 → 가능

# 2. YouTube Lens 사용
- [ ] 검색 → 결과 표시
- [ ] 채널 분석 → 데이터 표시
- [ ] 컬렉션 저장 → 성공

# 3. 수익 인증 작성
- [ ] 작성 폼 → 정상 입력
- [ ] 이미지 업로드 → 성공
- [ ] 저장 → DB 확인

# 4. 결제 프로세스
- [ ] 상품 선택 → 가능
- [ ] 쿠폰 적용 → 할인 적용
- [ ] 결제 진행 → 완료
```

### 성능 측정
```bash
# Chrome DevTools → Lighthouse
- [ ] Performance: > 70
- [ ] Accessibility: > 80
- [ ] Best Practices: > 80
- [ ] SEO: > 80

# 응답 시간
- [ ] 페이지 로드: < 3초
- [ ] API 응답: < 500ms
- [ ] 버튼 클릭: < 300ms
```

## 📊 최종 확인 사항

### 정량적 목표
| 항목 | 시작 | 목표 | 현재 | 달성 |
|------|------|------|------|------|
| TODO 주석 | 62개 | 0개 | ? | ☐ |
| any 타입 | ?개 | 0개 | ? | ☐ |
| 빌드 에러 | ?개 | 0개 | ? | ☐ |
| 타입 에러 | ?개 | 0개 | ? | ☐ |

### 정성적 목표
- [ ] 모든 기능 브라우저에서 실제 작동
- [ ] 데이터베이스 무결성 유지
- [ ] 사용자 경험 개선 확인
- [ ] 에러 처리 완벽 구현

## 🚨 문제 발생 시 대응

### 빌드 실패 시
```bash
# 에러 로그 확인
npm run build 2>&1 | tee build-error.log

# 타입 에러 확인
npm run types:check

# 문제 파일 수정 후 재시도
```

### DB 마이그레이션 실패 시
```bash
# 롤백
git reset --hard HEAD~1

# SQL 문법 검증
psql -h localhost -U postgres -d test -f [SQL파일]

# 수정 후 재실행
```

### API 에러 발생 시
```bash
# 로그 확인
npm run dev
# 브라우저 개발자 도구 → Network 탭 → 실패한 요청 확인

# 서버 로그 확인
# Console 탭에서 에러 메시지 확인
```

## ✅ 최종 승인 기준

### 필수 통과 조건 (모두 만족)
- [ ] TODO 주석 0개
- [ ] any 타입 0개
- [ ] npm run build 성공
- [ ] npm run types:check 통과
- [ ] 핵심 기능 모두 작동
- [ ] 브라우저 콘솔 에러 0개

### Sign-off
```
검증 완료일: _____________
검증자: _________________
승인 상태: [ ] 승인 [ ] 조건부 승인 [ ] 재작업 필요
```

---
*이 체크리스트는 각 Phase 완료 시마다 확인해야 합니다*