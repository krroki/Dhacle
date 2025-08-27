/sc:implement --seq --validate --c7 --think-hard --delegate files --wave-mode enterprise
"Dhacle 프로젝트의 62개 HIGH priority TODO를 6개 Phase로 체계적으로 해결하여 모든 기능이 실제로 작동하도록 구현"

# 🎯 Dhacle TODO 해결 마스터 지시서 v2.0

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인
- `/docs/CONTEXT_BRIDGE.md` 전체 읽기
- `/CLAUDE.md` 17-71행 절대 준수
- 자동 스크립트 생성 절대 금지

## 📚 온보딩 섹션

### 작업 관련 경로
```
페이지: src/app/(pages)/*/page.tsx
API: src/app/api/*/route.ts
컴포넌트: src/components/
타입: src/types/index.ts
DB 마이그레이션: supabase/migrations/
```

### 프로젝트 컨텍스트 확인
```bash
# 기술 스택 확인
cat package.json | grep -A 5 "dependencies"
# Next.js 15.4.6, React Query v5, Supabase

# 현재 TODO 상태
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l
# 현재: 62개

# 타입 에러 확인
npm run types:check
```

### 🔥 실제 코드 패턴 확인
```bash
# API 패턴 확인
grep -r "apiGet\|apiPost" src/hooks --include="*.ts" | head -5
# 결과: apiGet, apiPost, apiPut, apiDelete 함수 사용

# Supabase 패턴
grep -r "createSupabaseServerClient" src/ | head -5
# 결과: 표준 패턴 사용 중

# 금지 패턴 검사
grep -r "createServerComponentClient" src/ | wc -l  # 0이어야 함
grep -r ": any" src/ --include="*.ts" | wc -l      # 0이어야 함
```

## 📌 목적

**62개 HIGH priority TODO를 완전히 해결하여 Dhacle 프로젝트의 모든 기능이 실제로 작동하도록 만들기**

### 문제 분류
1. 데이터베이스 테이블/필드 누락: 21개
2. 미구현 기능: 15개
3. 더미 데이터 사용: 12개
4. YouTube PubSub: 12개
5. 환경 설정: 2개

## 🤖 실행 AI 역할

1. **데이터베이스 아키텍트**: 테이블 생성 및 마이그레이션
2. **백엔드 개발자**: API Route 구현
3. **프론트엔드 개발자**: UI 컴포넌트 수정
4. **QA 엔지니어**: 기능 테스트 및 검증
5. **DevOps**: 환경 설정 및 배포 준비

## 📝 작업 내용 - Wave Mode 실행

### Wave 1: Discovery & Analysis
```bash
# 전체 TODO 분석
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" > todo-list.txt

# 테이블 누락 확인
grep -r "테이블이 없" src/ --include="*.ts"

# any 타입 사용 확인
grep -r ": any" src/ --include="*.ts"
```

### Wave 2: Planning & Design
6개 Phase로 구조화:
- Phase 1: DB 구조 (CRITICAL)
- Phase 2: 인증 시스템 (CRITICAL)
- Phase 3: 결제 시스템 (HIGH)
- Phase 4: YouTube Lens (HIGH)
- Phase 5: 더미 데이터 (MEDIUM)
- Phase 6: 부가 기능 (LOW)

### Wave 3: Implementation
각 Phase별 순차 실행:
```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
```

### Wave 4: Validation
각 Phase 완료 후 검증:
```bash
npm run build
npm run types:check
npm run dev  # 브라우저 테스트
```

### Wave 5: Optimization
최종 최적화 및 성능 개선

## Phase별 상세 작업

### 📂 Phase 1: 데이터베이스 구조 완성
**파일**: `tasks/20250826_todo_resolution/PHASE_1_DATABASE.md`
**작업 내용**:
1. profiles 테이블 필드 추가 (8개)
2. 결제 관련 테이블 생성 (coupons)
3. YouTube 관련 테이블 생성 (5개)
4. PubSub 테이블 생성 (3개)
5. 로그 테이블 생성 (analyticsLogs)

**실행 명령**:
```bash
# SQL 마이그레이션 파일 생성
ls supabase/migrations/

# SQL 실행
node scripts/supabase-sql-executor.js --method pg --file [SQL파일]

# 확인
Supabase Dashboard → Database → Tables
```

### 📂 Phase 2: 인증/프로필 시스템
**파일**: `tasks/20250826_todo_resolution/PHASE_2_AUTH.md`
**작업 내용**:
1. randomNickname 생성 로직 활성화
2. 네이버 카페 인증 구현
3. work_type 필드 활용
4. 프로필 완성도 체크

### 📂 Phase 3: 결제 시스템
**파일**: `tasks/20250826_todo_resolution/PHASE_3_PAYMENT.md`
**작업 내용**:
1. coupons 테이블 활용
2. 쿠폰 검증 API
3. 결제 실패 처리

### 📂 Phase 4: YouTube Lens 복원
**파일**: `tasks/20250826_todo_resolution/PHASE_4_YOUTUBE.md`
**작업 내용**:
1. yl_channels 등 테이블 생성
2. 관리자 API 복원
3. PubSub 시스템 구현
4. 알림 규칙 복원

### 📂 Phase 5: 더미 데이터 교체
**파일**: `tasks/20250826_todo_resolution/PHASE_5_DATA.md`
**작업 내용**:
1. 프로필 이미지 업로드
2. 강사 정보 실제 데이터
3. duration/reviewCount 계산

### 📂 Phase 6: 부가 기능
**파일**: `tasks/20250826_todo_resolution/PHASE_6_FEATURES.md`
**작업 내용**:
1. 계정 삭제 API
2. 뉴스레터 구독
3. 검색 기능

## ✅ 완료 조건

### 🔴 필수 (모두 충족 필요)
```bash
# 1. 코드 품질
- [ ] TODO 주석: 62개 → 0개
- [ ] any 타입: 0개
- [ ] npm run build → 성공
- [ ] npm run types:check → 에러 0개

# 2. 실제 작동 검증
- [ ] npm run dev → http://localhost:3000
- [ ] 모든 페이지 에러 없이 로드
- [ ] 개발자 도구 Console → 에러 0개
- [ ] Network 탭 → 모든 API 200/201

# 3. 핵심 기능 테스트
- [ ] 회원가입/로그인 정상 작동
- [ ] YouTube Lens 검색 작동
- [ ] 수익 인증 생성 성공
- [ ] 결제 프로세스 완료 가능
```

## 📋 QA 테스트 시나리오

### 정상 플로우
```bash
1. 회원가입
   - 카카오 로그인 클릭
   - 프로필 설정 완료
   - 네이버 카페 인증

2. YouTube Lens
   - 검색어 입력 → 결과 표시
   - 채널 분석 → 데이터 표시
   - 컬렉션 저장 → 성공

3. 수익 인증
   - 작성 → 이미지 업로드 → 저장
   - 목록 조회 → 상세보기
   - 공유 기능 테스트

4. 결제
   - 상품 선택 → 쿠폰 적용 → 완료
```

### 실패 시나리오
```bash
# 네트워크 에러
DevTools → Network → Offline
→ 에러 메시지 표시 확인

# 입력 검증
빈 폼 제출 → 검증 메시지
잘못된 형식 → 에러 피드백

# 권한 체크
로그아웃 상태 → 401 처리
```

### 성능 측정
```bash
# Lighthouse
Performance: > 70
Accessibility: > 80
Best Practices: > 80

# 응답 시간
페이지 로드: < 3초
API 응답: < 500ms
```

## 🔄 롤백 계획

### 백업
```bash
# 코드 백업
git checkout -b backup-$(date +%Y%m%d)
git add -A && git commit -m "Backup before TODO resolution"

# DB 백업
Supabase Dashboard → Database → Backups → Create
```

### 롤백 절차
```bash
# 코드 롤백
git reset --hard backup-20250826

# DB 롤백
Supabase Dashboard → Restore from Backup
```

## 📊 성과 측정 기준

### 정량적 지표
| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| TODO 수 | 62개 | 0개 | 100% |
| any 타입 | ?개 | 0개 | 100% |
| 에러율 | ?% | 0% | 100% |

### 정성적 지표
- [ ] 모든 기능 실제 작동
- [ ] 사용자 경험 개선
- [ ] 코드 품질 향상

## 🔍 지시서 품질 검증

### 필수 요소 체크
- [x] SuperClaude 명령어 최상단 배치
- [x] 프로젝트 특화 규칙 참조
- [x] 구체적 파일 경로 포함
- [x] 7단계 실제 작동 검증 시나리오
- [x] 브라우저 테스트 방법 명시
- [x] DB 데이터 확인 방법
- [x] 롤백 계획 포함
- [x] 실제 코드 패턴 확인 결과

### 품질 기준
- [x] 실제 작동 가능성 100%
- [x] npm run dev 후 테스트 가능
- [x] 사용자가 브라우저에서 확인 가능
- [x] 의도 전달 명확성
- [x] 프로젝트 규칙 준수

### 실제 코드 확인
- [x] grep으로 현재 패턴 확인
- [x] 기존 파일 구조 확인
- [x] Import 패턴 확인
- [x] 관련 CLAUDE.md 확인

## 🚀 즉시 시작

```bash
# Phase 1부터 순차 진행
cat tasks/20250826_todo_resolution/PHASE_1_DATABASE.md

# 각 Phase 완료 후 검증
cat tasks/20250826_todo_resolution/VALIDATION_CHECKLIST.md
```

---
*버전: 2.0.0*
*작성일: 2025-08-26*
*작성자: Claude Code Assistant*
*검증: INSTRUCTION_TEMPLATE.md v17.0 준수*
*Wave Mode: Enterprise (6 Phase 구조)*