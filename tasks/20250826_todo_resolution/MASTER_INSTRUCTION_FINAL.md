/sc:implement --seq --validate --c7 --think-hard --wave-mode --delegate auto
"Dhacle 프로젝트 62개 HIGH priority TODO 완전 해결 - 실제 작동하는 기능 구현"

# 🎯 Dhacle 프로젝트 TODO 완전 해결 마스터 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인
- `/docs/CONTEXT_BRIDGE.md` 전체 읽기 필수
- `/CLAUDE.md` 17-43행 자동 스크립트 절대 금지
- any 타입 사용 금지
- 임시방편 해결책 금지 (TODO, 주석처리, 빈 배열 반환 등)

## 📚 온보딩 섹션

### 작업 관련 경로
- 페이지: `src/app/(pages)/`
- 컴포넌트: `src/components/`
- API: `src/app/api/`
- 타입: `src/types/index.ts`
- 마이그레이션: `supabase/migrations/`
- Phase 지시서: `tasks/20250826_todo_resolution/`

### 프로젝트 컨텍스트 확인
```bash
# 기술 스택 확인
cat package.json | grep -A 5 "dependencies"

# 프로젝트 구조 확인  
ls -la src/

# 현재 TODO 상태 확인
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l
# 결과: 62개 HIGH priority TODO
```

### 🔥 실제 코드 패턴 확인 (v17.0 필수)
```bash
# API 클라이언트 패턴 확인
grep -r "apiGet\|apiPost" src/ --include="*.ts" --include="*.tsx" | head -5
# 결과: apiGet, apiPost, apiPut, apiDelete 함수 사용

# 현재 사용 중인 import 패턴 확인
grep -r "import.*from '@/lib/api-client'" src/ | head -5
# 결과: import { apiGet, apiPost } from '@/lib/api-client';

# Supabase 패턴 확인
grep -r "createSupabaseServerClient" src/ --include="*.ts" | wc -l
# 결과: 33개 사용 중

# 금지 패턴 사용 여부 확인 (직접 네트워크 호출)
# 프로젝트 규칙상 외부 API 호출은 별도 처리 필요
```

## 📌 목적
Pre-commit hook에서 발견된 62개의 HIGH priority TODO를 완전히 해결하여, 모든 기능이 실제 브라우저에서 작동하는 완전한 프로젝트로 만들기

## 🤖 실행 AI 역할
1. 데이터베이스 구조 완성 전문가
2. API 라우트 구현 전문가
3. React 컴포넌트 개발 전문가
4. 타입 시스템 관리자
5. 테스트 및 검증 담당자

## 📝 작업 내용

### 🚨 62개 TODO 분류별 현황
```
📊 HIGH priority TODO 분석 (62개)
├── 🔴 데이터베이스 테이블/필드 누락 (21개)
│   ├── profiles 필드: 8개
│   ├── YouTube 테이블: 5개
│   ├── PubSub 테이블: 3개
│   ├── 결제 테이블: 2개
│   └── 로그 테이블: 1개
├── 🟡 더미 데이터 사용 (12개)
│   ├── 프로필 이미지: 10개
│   └── 강사 정보: 2개
├── 🟠 미구현 기능 (15개)
│   ├── 네이버 카페 인증: 2개
│   ├── 계정/검색/뉴스레터: 3개
│   └── 기타 기능: 10개
├── 🔵 YouTube PubSub (12개)
└── 🟢 환경 설정 (2개)
```

### 📂 Phase 구조와 의존성
```
tasks/20250826_todo_resolution/
├── README.md                 # 전체 개요 및 진입점
├── PHASE_1_DATABASE.md      # DB 구조 (21개 테이블/필드)
├── PHASE_2_AUTH.md          # 인증/프로필 (네이버카페)
├── PHASE_3_PAYMENT.md       # 결제 시스템 (쿠폰)
├── PHASE_4_YOUTUBE.md       # YouTube Lens 복원 (관리자, PubSub)
├── PHASE_5_DATA.md          # 더미 데이터 교체 (12개)
├── PHASE_6_FEATURES.md      # 부가 기능 (15개)
├── VALIDATION_REPORT.md     # 검증 결과
└── MASTER_INSTRUCTION_FINAL.md  # 현재 파일
```

### 🔥 Phase별 실행 순서 (의존성 준수 필수)
```
Phase 1 (DB) → Phase 2,3,4 (병렬 가능) → Phase 5 (데이터) → Phase 6 (부가)

⚠️ Phase 1이 완료되지 않으면 다른 Phase 실행 불가!
```

### 📋 Phase별 핵심 작업 및 검증

#### Phase 1: 데이터베이스 기반 구조 (🔴 CRITICAL - 2-3일)
```sql
-- 작업 내용
1. profiles 테이블 필드 추가 (8개)
   ALTER TABLE profiles ADD COLUMN randomNickname VARCHAR(255);
   ALTER TABLE profiles ADD COLUMN naverCafeVerified BOOLEAN DEFAULT false;
   -- 등등...

2. 테이블 생성 (12개)
   CREATE TABLE coupons (...);
   CREATE TABLE yl_channels (...);
   CREATE TABLE channel_subscriptions (...);
   -- 등등...

-- 검증 방법
Supabase Dashboard → Table Editor → 각 테이블/필드 확인
npx supabase gen types typescript → src/types/database.generated.ts 업데이트
```

#### Phase 2: 인증/프로필 시스템 (🔴 CRITICAL - 2일)
```typescript
// 작업 내용
1. /api/user/init-profile - randomNickname 생성
2. /api/user/naver-cafe - 네이버 카페 인증
3. /mypage/profile - 모든 필드 표시/수정

// 검증 방법
- 프로필 페이지에서 모든 필드 표시 확인
- 네이버 카페 인증 플로우 테스트
- randomNickname 자동 생성 확인
```

#### Phase 3: 결제 시스템 (🟠 HIGH - 1-2일)
```typescript
// 작업 내용
1. coupons 테이블 활용
2. /api/payment/create-intent 쿠폰 적용
3. /api/coupons/validate 구현

// 검증 방법
- 쿠폰 생성 → 적용 → 할인 확인
- 결제 실패 시 쿠폰 복원 확인
```

#### Phase 4: YouTube Lens 복원 (🟠 HIGH - 3-4일)
```typescript
// 작업 내용
1. 관리자 패널 구현
   - /api/youtube-lens/admin/channels
   - 채널 승인/거부 기능
   
2. PubSub 시스템
   - 구독 관리
   - 웹훅 처리
   
3. 알림 규칙
   - AlertRules 컴포넌트

// 검증 방법
- 관리자 로그인 → 채널 관리 화면
- 채널 승인/거부 → DB 반영 확인
- 알림 규칙 생성/삭제 테스트
```

#### Phase 5: 더미 데이터 교체 (🟡 MEDIUM - 2-3일)
```typescript
// 작업 내용
1. 프로필 이미지 업로드
   - Supabase Storage 버킷
   - /api/user/profile-image
   
2. 강사 정보 시스템
   - instructors 테이블
   - 실제 데이터 입력
   
3. 코스 메타데이터
   - duration 계산
   - reviewCount 집계

// 검증 방법
- 프로필 이미지 업로드/변경/삭제
- 강사 정보 실제 표시
- 코스 상세에서 실제 duration 확인
```

#### Phase 6: 부가 기능 (🟢 LOW - 3-4일)
```typescript
// 작업 내용
1. 계정 삭제 API
2. 뉴스레터 구독
3. 검색 기능
4. 에러 리포팅
5. 이미지 처리 기능

// 검증 방법
- 각 기능 개별 테스트
- 사용자 플로우 검증
```

## ✅ 완료 조건

### 🔴 필수 완료 조건 체크리스트
```bash
# 1. 코드 품질
- [ ] TODO 주석: 62개 → 0개
- [ ] any 타입: 0개 유지
- [ ] 임시방편 코드: 0개

# 2. 빌드 및 타입
- [ ] npm run build → 성공
- [ ] npm run types:check → 에러 0개
- [ ] npx biome check → 통과

# 3. 기능 작동 (브라우저 테스트)
- [ ] YouTube Lens 전체 기능
- [ ] 수익 인증 CRUD
- [ ] 프로필 시스템
- [ ] 결제 플로우
- [ ] 커뮤니티 기능

# 4. 데이터베이스
- [ ] 모든 테이블 생성 확인
- [ ] RLS 정책 적용
- [ ] 타입 동기화
```

## 📋 7단계 실제 작동 검증 시나리오

### ✅ 시나리오 1: UI 렌더링 검증
```bash
# 🔴 필수
- [ ] /tools/youtube-lens → 에러 없이 로드
- [ ] /revenue-proof → 모든 컴포넌트 표시
- [ ] /mypage/profile → 모든 필드 표시

# 🟡 권장
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] 다크모드 지원
- [ ] 스켈레톤 UI
```

### ✅ 시나리오 2: 사용자 인터랙션
```bash
# 🔴 필수
- [ ] YouTube 검색 → 결과 표시
- [ ] 프로필 이미지 업로드 → 저장
- [ ] 수익 인증 작성 → 공유

# 🟡 권장
- [ ] 드래그 앤 드롭
- [ ] 키보드 네비게이션
```

### ✅ 시나리오 3: 데이터 플로우
```bash
# 🔴 필수
- [ ] API 호출 성공 (200/201)
- [ ] 데이터 DB 저장 확인
- [ ] 상태 변경 UI 반영

# 🟡 권장
- [ ] 로딩 상태
- [ ] 에러 처리
- [ ] 캐싱 작동
```

### ✅ 시나리오 4: 에러 처리
```bash
# 🔴 필수
- [ ] 네트워크 오류 → 에러 메시지
- [ ] 입력 검증 → 피드백
- [ ] 앱 크래시 방지

# 🟡 권장
- [ ] 토스트 알림
- [ ] 재시도 버튼
```

### ✅ 시나리오 5: 성능 검증
```bash
# 🔴 필수
- [ ] 페이지 로드 < 5초
- [ ] API 응답 < 1초
- [ ] 메모리 누수 없음

# 🟡 권장
- [ ] FCP < 2초
- [ ] 번들 < 500KB
```

### ✅ 시나리오 6: Dhacle 핵심 기능
```bash
# 🔴 YouTube Lens
- [ ] 검색 → 결과 → 상세보기
- [ ] 채널 분석 데이터
- [ ] 관리자 패널

# 🔴 수익 인증
- [ ] 생성 → 업로드 → 저장
- [ ] 월별 통계
- [ ] 공유 URL

# 🔴 커뮤니티
- [ ] CRUD 작동
- [ ] 댓글 시스템
- [ ] 좋아요 기능
```

### ✅ 시나리오 7: 실제 사용자 플로우
```bash
npm run dev
# http://localhost:3000

1. 회원가입/로그인
   - [ ] 카카오 로그인
   - [ ] 세션 유지

2. 메인 기능
   - [ ] YouTube Lens 사용
   - [ ] 수익 인증 작성
   - [ ] 커뮤니티 활동

3. 프로필
   - [ ] 이미지 업로드
   - [ ] 네이버 카페 인증
   - [ ] 설정 변경

# 개발자 도구
- [ ] Console 에러 0개
- [ ] Network 200/201
- [ ] React Query DevTools
```

## 🔄 롤백 계획
```bash
# 백업
git branch backup-before-todo-resolution
pg_dump $DATABASE_URL > backup.sql

# 롤백 조건
- 빌드 실패 5회+
- 핵심 기능 파괴
- 데이터 손실

# 롤백 절차
git checkout backup-before-todo-resolution
psql $DATABASE_URL < backup.sql
npm install && npm run build
```

## 📊 성과 측정

### 정량적 지표
| 지표 | 현재 | 목표 | 달성 |
|------|------|------|------|
| TODO 주석 | 62개 | 0개 | ⏳ |
| any 타입 | ?개 | 0개 | ⏳ |
| 작동 기능 | 70% | 100% | ⏳ |
| 빌드 성공 | ❌ | ✅ | ⏳ |

### 작업 일정
- Week 1: Phase 1-3 (기반 구축)
- Week 2: Phase 4-5 (핵심 기능)
- Week 3: Phase 6 + 최종 검증

## ⚡ 즉시 실행 명령어
```bash
# 시작
cd tasks/20250826_todo_resolution
cat README.md

# Phase 1 실행
cat PHASE_1_DATABASE.md
# SQL 실행 → 검증 → 다음 Phase

# 진행 상태 확인
grep -r "TODO" src/ | wc -l

# 최종 검증
npm run build && npm run types:check && npm run dev
```

---

## 🎯 핵심 메시지
**"코드 작성이 목표가 아니다. 실제로 작동하는 사이트가 목표다!"**

모든 Phase를 순차적으로 실행하면:
- 62개 TODO → 0개
- 모든 기능 실제 작동
- 완전한 Dhacle 프로젝트 완성

---

*작성일: 2025-08-26*
*작성자: Claude Code Assistant*
*버전: 2.0.0 Final*
*검증: INSTRUCTION_TEMPLATE.md v17.0 준수 완료*