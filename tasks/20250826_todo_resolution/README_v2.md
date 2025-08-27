/sc:implement --seq --validate --c7 --think-hard --delegate files --wave-mode
"Dhacle 프로젝트의 62개 HIGH priority TODO를 6개 Phase로 나누어 체계적으로 해결하고, 모든 기능이 실제 브라우저에서 완벽하게 작동하도록 구현"

# 🎯 Dhacle TODO 해결 마스터 지시서 v2.0

⚠️ → `/docs/CONTEXT_BRIDGE.md` 및 `/CLAUDE.md` 17-71행 필수 확인

## 📚 온보딩 섹션

### 프로젝트 핵심 정보
- **프레임워크**: Next.js 15.4.6 (App Router)
- **데이터베이스**: Supabase (PostgreSQL)
- **스타일링**: Tailwind CSS (shadcn/ui)
- **인증**: Supabase Auth (getUser() 사용)
- **타입**: @/types에서만 import
- **상태관리**: React Query v5 + Zustand

### 🔥 프로젝트 특화 규칙 (절대 준수)
```markdown
- [ ] 자동 변환 스크립트 생성 금지 (38개 스크립트 재앙 경험)
- [ ] any 타입 사용 금지 (biome 에러)
- [ ] 임시방편 해결 금지 (TODO, 주석처리, 빈 배열 반환)
- [ ] getSession() 금지 → getUser() 사용
- [ ] database.generated.ts 직접 import 금지
- [ ] fetch() 직접 호출 금지 → apiClient 사용
```

### 작업 관련 경로
- **페이지**: `src/app/(pages)/*/page.tsx`
- **API Routes**: `src/app/api/*/route.ts`
- **컴포넌트**: `src/components/`
- **타입**: `src/types/index.ts`
- **훅**: `src/hooks/queries/`
- **DB 마이그레이션**: `supabase/migrations/`

### 🔥 실제 코드 패턴 확인
```bash
# API 패턴 확인
grep -r "apiGet\|apiPost" src/hooks --include="*.ts" | head -5
# 결과: apiGet, apiPost, apiPut, apiDelete 함수 사용 중

# Supabase 클라이언트 패턴
grep -r "createSupabaseServerClient" src/ | head -5
# 결과: 표준 패턴 사용 중

# React Query 패턴
grep -r "useQuery\|useMutation" src/hooks | head -5
# 결과: tanstack/react-query v5 사용 중
```

## 📌 목적

**62개의 HIGH priority TODO를 완전히 해결하여 Dhacle 프로젝트의 모든 기능이 실제로 작동하도록 만들기**

### 핵심 문제 분류
1. **데이터베이스 테이블/필드 누락**: 21개
2. **미구현 기능**: 15개
3. **더미 데이터 사용**: 12개
4. **YouTube PubSub**: 12개
5. **환경 설정**: 2개

## 🤖 실행 AI 역할

1. **데이터베이스 아키텍트**: 테이블/필드 생성 및 마이그레이션
2. **백엔드 개발자**: API Route 구현 및 비즈니스 로직
3. **프론트엔드 개발자**: UI 컴포넌트 및 사용자 인터랙션
4. **QA 엔지니어**: 기능 테스트 및 검증
5. **DevOps**: 환경 설정 및 배포 준비

## 📝 작업 내용 - 6 Phase 구조

### 📊 Phase 요약표
| Phase | 작업 내용 | 우선순위 | 예상 시간 | TODO 해결 수 |
|-------|----------|---------|----------|-------------|
| 1 | DB 구조 완성 | 🔴 CRITICAL | 2-3일 | 21개 |
| 2 | 인증/프로필 | 🔴 CRITICAL | 2일 | 8개 |
| 3 | 결제 시스템 | 🟠 HIGH | 1-2일 | 3개 |
| 4 | YouTube Lens | 🟠 HIGH | 3-4일 | 15개 |
| 5 | 더미 데이터 교체 | 🟡 MEDIUM | 2-3일 | 12개 |
| 6 | 부가 기능 | 🟢 LOW | 3-4일 | 3개 |

## 📂 Phase별 상세 파일

```
tasks/20250826_todo_resolution/
├── README_v2.md                    # 이 파일 (마스터 지시서)
├── PHASE_1_DATABASE.md             # DB 구조 완성
├── PHASE_2_AUTH.md                 # 인증 시스템
├── PHASE_3_PAYMENT.md              # 결제 시스템
├── PHASE_4_YOUTUBE.md              # YouTube Lens (신규 작성)
├── PHASE_5_DATA.md                 # 더미 데이터 교체
├── PHASE_6_FEATURES.md             # 부가 기능
└── VALIDATION_CHECKLIST.md         # 검증 체크리스트
```

## ✅ 전체 완료 조건

### 🔴 필수 완료 조건 (모두 충족 필요)
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
- [ ] Network 탭 → 모든 API 200/201 응답

# 3. 핵심 기능 테스트
- [ ] 회원가입/로그인 → 정상 작동
- [ ] YouTube Lens 검색 → 결과 표시
- [ ] 수익 인증 생성 → 저장 성공
- [ ] 결제 프로세스 → 완료 가능
```

### 🟡 권장 완료 조건
- [ ] 로딩 상태 모든 페이지에 표시
- [ ] 에러 처리 완벽 구현
- [ ] 반응형 디자인 확인
- [ ] React Query DevTools 캐싱 확인

### 🟢 선택 완료 조건
- [ ] Lighthouse 점수 > 80
- [ ] 테스트 커버리지 > 70%
- [ ] 문서 100% 업데이트

## 📋 QA 테스트 시나리오

### 🔴 필수: 핵심 사용자 플로우
```bash
# 1. 회원가입 → 프로필 설정 → 네이버 카페 인증
1. 카카오 로그인 클릭
2. 프로필 정보 입력 (닉네임, 직업 등)
3. 네이버 카페 인증 진행
4. 프로필 완성 확인

# 2. YouTube Lens 사용
1. YouTube Lens 페이지 접속
2. 검색어 입력 → 검색 버튼 클릭
3. 검색 결과 표시 확인
4. 채널 분석 데이터 확인
5. 컬렉션 저장 기능 테스트

# 3. 수익 인증 작성
1. 수익 인증 작성 페이지 이동
2. 폼 입력 (제목, 내용, 금액)
3. 이미지 업로드
4. 저장 → 목록에 표시 확인
5. 상세보기 → 공유 기능 테스트

# 4. 결제 프로세스
1. 상품 선택
2. 쿠폰 적용 (있는 경우)
3. 결제 정보 입력
4. 결제 완료 → 성공 페이지
```

### 🔴 필수: 에러 시나리오 테스트
```bash
# 네트워크 에러
1. DevTools → Network → Offline
2. 각 기능 실행 → 에러 메시지 확인

# 권한 에러
1. 로그아웃 상태에서 인증 필요 페이지 접근
2. 401 에러 처리 확인

# 입력 검증
1. 빈 폼 제출 → 검증 메시지
2. 잘못된 형식 입력 → 에러 피드백
```

### 🟡 권장: 성능 측정
```bash
# Chrome DevTools → Lighthouse
- Performance: > 70
- Accessibility: > 80
- Best Practices: > 80
- SEO: > 80

# 응답 시간
- 페이지 로드: < 3초
- API 응답: < 500ms
- 버튼 클릭 반응: < 300ms
```

## 🔄 롤백 계획

### 백업 전략
```bash
# 1. 현재 상태 백업
git checkout -b backup-$(date +%Y%m%d)
git add -A && git commit -m "Backup before TODO resolution"

# 2. DB 백업 (Supabase Dashboard에서)
Supabase → Database → Backups → Create Backup
```

### 롤백 절차
```bash
# 코드 롤백
git reset --hard backup-20250826

# DB 롤백 (필요시)
Supabase → Database → Backups → Restore
```

## 📊 진행 상황 추적

### Phase별 체크포인트
| Phase | 시작 | 25% | 50% | 75% | 완료 | 검증 |
|-------|------|-----|-----|-----|------|------|
| Phase 1 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Phase 2 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Phase 3 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Phase 4 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Phase 5 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Phase 6 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

### 일일 체크리스트
```bash
# 매일 시작 시
- [ ] git pull
- [ ] npm install
- [ ] npm run types:check

# 매일 종료 시
- [ ] git add -A && git commit
- [ ] npm run build
- [ ] TODO 개수 확인
```

## 🚨 위험 관리

### 주요 리스크 및 대응
1. **DB 마이그레이션 실패**
   - 트랜잭션 사용
   - 단계별 실행
   - 즉시 롤백 준비

2. **타입 시스템 충돌**
   - 점진적 수정
   - types:check 지속 실행
   - any 타입 절대 금지

3. **기능 파괴**
   - 기능별 브랜치 분리
   - 단위 테스트 우선
   - 즉시 롤백 가능

## → 다음 단계

**Phase 1부터 순차적 진행 필수**
```bash
# Phase 1 시작
cat PHASE_1_DATABASE.md
```

---
*버전: 2.0.0*
*작성일: 2025-08-26*
*작성자: Claude Code Assistant*
*검증: INSTRUCTION_TEMPLATE.md v17.0 준수*