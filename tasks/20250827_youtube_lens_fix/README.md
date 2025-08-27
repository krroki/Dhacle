# 🎯 YouTube Lens 완전 수정 - E2E 작동 검증

/sc:implement --seq --validate --evidence --no-speculation --db-first --e2e
"YouTube Lens 기능 완전 수정 - 실제 작동 필수"

## 📊 작업 개요
- 영향 범위: API 3개, 컴포넌트 2개, DB 테이블 3개
- 예상 시간: 총 2시간 (Phase별 30분)
- 복잡도: Complex
- 핵심 목표: **관리자가 채널을 승인하고, 사용자가 알림 규칙을 만들 수 있는 실제 작동 시스템**

## 🎬 사용자 시나리오 (역방향 설계)

### 시나리오 1: 관리자 채널 승인
1. 관리자가 채널 목록 페이지 접속
2. "승인" 버튼 클릭
3. → 성공 토스트 "채널이 승인되었습니다"
4. → yl_channels.status = 'approved'
5. → 목록에서 상태 변경 확인

### 시나리오 2: 사용자 알림 규칙 생성
1. 사용자가 YouTube Lens 페이지 접속
2. "알림 규칙 추가" 클릭
3. 조건 입력 (조회수 > 100000)
4. → 성공 메시지
5. → alert_rules 테이블에 저장
6. → 규칙 목록에 표시

## 📂 Phase 구조
```
tasks/20250827_youtube_lens_fix/
├── README.md                    # 현재 파일
├── PHASE_1_DB_VERIFICATION.md   # DB 스키마 확인 및 수정
├── PHASE_2_API_FIX.md          # API Route 수정
├── PHASE_3_UI_INTEGRATION.md   # UI 컴포넌트 수정
└── E2E_TEST_RESULTS.md         # 최종 테스트 결과
```

## ⚠️ 3-Strike Rule 적용
- verify-cafe/route.ts: 이미 2회 수정 (profiles↔users)
- AlertRules.tsx: 이미 1회 수정 (필드 불일치)
- **3회째 수정 시 즉시 중단 → 근본 원인 파악 필수**

## ✅ 현재 상태
- [ ] Phase 1: DB 검증 및 수정
- [ ] Phase 2: API 수정
- [ ] Phase 3: UI 연결
- [ ] E2E 테스트 완료