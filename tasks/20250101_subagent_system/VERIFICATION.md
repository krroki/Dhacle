/sc:validate --evidence --no-speculation
"서브에이전트 시스템 전체 검증"

# 최종 검증: 서브에이전트 시스템

⚠️ **절대 준수사항**
- [ ] 모든 Phase 완료 확인
- [ ] 실제 동작 테스트 필수
- [ ] 증거 수집 완료

---

## 📍 전체 Phase 완료 상태 확인

### Phase별 완료 확인
```bash
# Phase 1: 구조 설정
ls -la .claude/agents/pm-dhacle.md
# 파일이 존재해야 함

# Phase 2: 핵심 에이전트 (5개)
ls -la .claude/agents/{api-route,component,type,database,security}-agent.md | wc -l
# 5가 출력되어야 함

# Phase 3: 지원 에이전트 (6개)
ls -la .claude/agents/{query,test,script,doc,lib,page}-agent.md | wc -l
# 6이 출력되어야 함

# Phase 4: 설정 파일
ls -la .claude/settings.json
# 파일이 존재해야 함
```

❌ **하나라도 실패** → 해당 Phase로 돌아가기

---

## 🧪 E2E 테스트 시나리오

### 시나리오 1: API Route Agent 자동 활성화
```bash
# 1. 테스트 파일 생성
echo "// Test API Route" > src/app/api/test-verification/route.ts

# 2. Claude Code에서 파일 열기
# 예상 동작:
# - api-route-agent 자동 활성화
# - src/app/api/CLAUDE.md 자동 읽기
# - 인증 패턴 제안

# 3. 검증
# Agent가 다음을 제안해야 함:
# - createSupabaseRouteHandlerClient 사용
# - getUser() 인증 체크
# - NextResponse 사용
```

### 시나리오 2: Component Agent 자동 활성화
```bash
# 1. 테스트 컴포넌트 생성
echo "// Test Component" > src/components/VerificationTest.tsx

# 2. Claude Code에서 파일 열기
# 예상 동작:
# - component-agent 자동 활성화
# - src/components/CLAUDE.md 자동 읽기
# - shadcn/ui 우선 사용 제안

# 3. 검증
# Agent가 다음을 제안해야 함:
# - Server Component 기본
# - shadcn/ui 컴포넌트 사용
# - Tailwind CSS만 사용
```

### 시나리오 3: Type Agent any 타입 차단
```bash
# 1. any 타입 포함 파일 생성
cat > src/types/test-any.ts << 'EOF'
export const testData: any = {
  id: 1,
  name: "test"
};
EOF

# 2. Claude Code에서 파일 열기
# 예상 동작:
# - type-agent 자동 활성화
# - any 타입 감지 → STOP
# - 정확한 타입 제안

# 3. 검증
# Agent가 즉시 중단하고 수정 요구해야 함
```

### 시나리오 4: PM Agent 작업 조정
```bash
# 사용자 요청: "YouTube 즐겨찾기 기능 추가해줘"

# 예상 PM 동작:
# 1. 작업 분석
#    - DB 테이블 필요
#    - API 엔드포인트 필요
#    - UI 컴포넌트 필요
#    - 타입 정의 필요
#
# 2. 에이전트 순차 활성화:
#    a. database-agent: youtube_favorites 테이블 생성
#    b. type-agent: YouTubeFavorite 타입 정의
#    c. api-route-agent: /api/youtube/favorites 생성
#    d. component-agent: FavoriteButton 컴포넌트 생성
#    e. test-agent: E2E 테스트 작성
#
# 3. 최종 검증:
#    - npm run verify:parallel
#    - npm run types:check
#    - npm run e2e:fast
```

### 시나리오 5: Security Agent RLS 강제
```bash
# 1. RLS 없는 테이블 생성 시도
cat > test-table.sql << 'EOF'
CREATE TABLE test_table (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  data TEXT
);
EOF

# 2. database-agent 반응
# 예상 동작:
# - security-agent도 자동 활성화
# - RLS 정책 누락 감지 → STOP
# - RLS 정책 추가 요구

# 3. 검증
# Agent가 다음을 요구해야 함:
# - ALTER TABLE test_table ENABLE ROW LEVEL SECURITY;
# - CREATE POLICY 추가
```

---

## ✅ 최종 완료 체크리스트

### 구조 검증
- [ ] .claude/agents/ 디렉토리 존재
- [ ] 12개 에이전트 파일 모두 존재
- [ ] settings.json 존재 및 유효
- [ ] 설치 스크립트 존재

### 내용 검증
- [ ] 모든 에이전트에 핵심 철학 포함 (12/12)
- [ ] 각 에이전트별 Stop Triggers 정의
- [ ] auto_read 경로 설정
- [ ] PM Agent의 조정 역할 정의

### 동작 검증
- [ ] 설치 스크립트 실행 성공
- [ ] Claude Code 재시작 가능
- [ ] 파일별 에이전트 자동 활성화
- [ ] PM의 작업 분배 확인

### 품질 검증
- [ ] any 타입 즉시 차단
- [ ] 인증 체크 강제
- [ ] RLS 정책 강제
- [ ] 임시방편 코드 차단

---

## 📊 성공 지표 측정

### 측정 명령어
```bash
# 1. 에이전트 수
ls -la .claude/agents/*.md | wc -l
# 목표: 12

# 2. 핵심 철학 포함률
grep -l "CORE PRINCIPLE" .claude/agents/*.md | wc -l
# 목표: 12 (100%)

# 3. Stop Triggers 정의
grep -l "Stop Triggers" .claude/agents/*.md | wc -l
# 목표: 10+ (대부분의 에이전트)

# 4. 설치 검증
bash install-agents.sh
# 목표: "✨ 설치 완료!" 메시지
```

### 성과 지표
| 지표 | 목표 | 실제 | 달성 |
|-----|------|------|------|
| 에이전트 수 | 12개 | ___ | ⬜ |
| 핵심 철학 | 100% | ___ | ⬜ |
| 자동 활성화 | 성공 | ___ | ⬜ |
| any 타입 차단 | 100% | ___ | ⬜ |
| 인증 체크 | 100% | ___ | ⬜ |

---

## 📂 최종 산출물 구조

```
.claude/
├── agents/                    # ✅ 12개 에이전트
│   ├── pm-dhacle.md          
│   ├── api-route-agent.md    
│   ├── component-agent.md    
│   ├── page-agent.md         
│   ├── type-agent.md         
│   ├── query-agent.md        
│   ├── database-agent.md     
│   ├── security-agent.md     
│   ├── test-agent.md         
│   ├── script-agent.md       
│   ├── doc-agent.md          
│   └── lib-agent.md          
├── settings.json              # ✅ 설정 파일
├── hooks/                     # ✅ 훅 디렉토리
└── commands/                  # ✅ 명령 디렉토리

tasks/20250101_subagent_system/
├── README.md                  # ✅ 전체 개요
├── PHASE_1_STRUCTURE_SETUP.md # ✅ Phase 1
├── PHASE_2_CORE_AGENTS.md     # ✅ Phase 2
├── PHASE_3_SUPPORT_AGENTS.md  # ✅ Phase 3
├── PHASE_4_CONFIGURATION.md   # ✅ Phase 4
└── VERIFICATION.md            # ✅ 최종 검증 (이 파일)
```

---

## 🚀 시스템 활성화

### 즉시 실행
```bash
# 1. 설치 검증
bash install-agents.sh

# 2. Claude Code 재시작
claude

# 3. 테스트
touch src/app/api/activation-test/route.ts
# api-route-agent가 자동 활성화되어야 함
```

### 향후 관리
```bash
# 에이전트 업데이트 시
1. 해당 .md 파일 수정
2. settings.json 업데이트 (필요시)
3. Claude Code 재시작

# 새 에이전트 추가 시
1. .claude/agents/에 새 .md 파일 생성
2. settings.json에 등록
3. 핵심 철학 포함 확인
4. Claude Code 재시작
```

---

## ⛔ 문제 해결

### 에이전트가 활성화되지 않을 때
```bash
# 1. 파일 확인
ls -la .claude/agents/$AGENT_NAME.md

# 2. settings.json 확인
jq '.agents.agents[] | select(.name=="$AGENT_NAME")' .claude/settings.json

# 3. 트리거 확인
# 파일 경로가 trigger 패턴과 일치하는지 확인

# 4. Claude Code 재시작
```

### any 타입이 차단되지 않을 때
```bash
# type-agent 확인
grep "any type anywhere" .claude/agents/type-agent.md
# Stop Trigger 포함되어 있어야 함

# settings.json 확인
jq '.agents.agents[] | select(.name=="type-agent")' .claude/settings.json
# priority가 1이어야 함
```

---

## 🎯 최종 결론

### 시스템 준비 상태
- [ ] 모든 파일 생성 완료
- [ ] 설치 검증 통과
- [ ] 테스트 시나리오 준비
- [ ] Claude Code 재시작 준비

### 예상 효과
- any 타입 발생: 10-15개 → 0개
- 인증 누락: 5-10회 → 0회
- 반복 실수: 40-50% → 5% 이하
- 디버깅 시간: 2-3시간 → 15-30분

---

*서브에이전트 시스템 구축이 완료되었습니다.*
*Claude Code를 재시작하여 시스템을 활성화하세요.*