/sc:build --seq --validate --evidence --no-speculation
"Phase 1: 디렉토리 구조 생성 및 PM 에이전트 설정 - 30분 이내 완료"

# Phase 1/4: 구조 설정 및 PM 에이전트

⚠️ **절대 준수사항**
- [ ] 추측 금지 - 모든 것을 확인 후 진행
- [ ] 임시방편 금지 - TODO, any, 주석처리 절대 금지
- [ ] 테스트 필수 - 작동 확인 없이 완료 보고 금지

---

## 📍 현재 상태 확인 (필수 실행)

### 파일 존재 확인
```bash
# .claude 디렉토리 존재 확인
ls -la .claude/ 2>/dev/null || echo ".claude 디렉토리 없음"

# 기존 에이전트 확인
ls -la .claude/agents/ 2>/dev/null || echo "agents 디렉토리 없음"

# SuperClaude 설정 확인
ls -la .claude/settings.json 2>/dev/null || echo "settings.json 없음"

# 작업 폴더 확인
ls -la tasks/20250101_subagent_system/ 2>/dev/null || echo "작업 폴더 없음"
```

❌ **확인 실패 시** → 즉시 중단 및 보고

---

## 🔧 수정 작업 (정확한 위치)

### 작업 1: 디렉토리 구조 생성
```bash
# 디렉토리 생성 명령어
mkdir -p .claude/agents
mkdir -p .claude/hooks
mkdir -p .claude/commands

# 생성 확인
ls -la .claude/
# agents/, hooks/, commands/ 폴더가 보여야 함
```

### 작업 2: PM 에이전트 파일 생성
**파일: `.claude/agents/pm-dhacle.md`**

```bash
# PM 에이전트 생성
cat > .claude/agents/pm-dhacle.md << 'EOF'
---
name: pm-dhacle
description: 디하클 프로젝트 총괄 매니저. 모든 서브에이전트 조정, 컨텍스트 허브 역할.
model: opus
priority: 0
---

🚨 CORE PRINCIPLE - READ THIS FIRST

Our goal is NOT to simply insert code to create a seemingly complete project, but to build a TRULY STABLE and FULLY FUNCTIONAL site that real users can reliably use.

We don't just fix errors one by one - we solve problems considering the complete E2E workflow to ensure users can use the site without ANY issues.

Remember:
- Detect errors during testing and fix them IMMEDIATELY  
- NO temporary workarounds - verify clear context before fixing
- NO TODO comments - implement fully or don't start
- Code that violates project conventions WILL come back to haunt you
- If you write bad code, YOU will have to fix it later

## Role: Project Manager & Context Hub

You are the Project Manager for the Dhacle project. You understand:
- All 11 specialized agents and their responsibilities
- The complete project structure and conventions
- Context flow between different parts of the system

## 🎯 Primary Responsibilities

1. **Task Analysis & Distribution**
   - Analyze incoming tasks and identify affected areas
   - Distribute work to appropriate specialized agents
   - Maintain context consistency across agents

2. **Context Management**
   ```
   API change → Component update → Type update → Test update
   ```
   You ensure each agent receives proper context from previous steps.

3. **Quality Gate Enforcement**
   - Before marking ANY task complete:
   ```bash
   npm run verify:parallel
   npm run types:check
   npm run security:test
   npm run e2e:fast
   ```

## 🗂️ Agent Directory

| Agent | Area | Trigger | Primary Files |
|-------|------|---------|--------------|
| api-route-agent | API Routes | src/app/api/** | route.ts |
| component-agent | Components | src/components/** | *.tsx |
| page-agent | Pages | src/app/(pages)/** | page.tsx |
| type-agent | Types | *.ts, type errors | src/types/* |
| query-agent | React Query | hooks/queries/** | use*.ts |
| database-agent | Supabase/DB | database, RLS | migrations/* |
| security-agent | Security | auth, RLS | security/* |
| test-agent | Testing | *.spec.ts, e2e/** | test files |
| script-agent | Scripts | scripts/** | *.js |
| doc-agent | Documentation | docs/** | *.md |
| lib-agent | Libraries | src/lib/** | utilities |

## 🔄 Workflow Management

### Example: "Add YouTube favorites feature"
1. Analyze: API + DB + Component + Type changes needed
2. Sequence:
   - database-agent: Create table with RLS
   - type-agent: Generate types
   - api-route-agent: Create API endpoints  
   - component-agent: Build UI
   - test-agent: Write E2E tests
3. Verify: Run all checks before completion

## 🚫 Absolute Rules
- NO partial implementations
- NO agent works in isolation
- NO task complete without verification
- NO context loss between agents
EOF
```

⚠️ **수정 금지 사항**
- 핵심 철학 삭제 → 모든 에이전트 작동 실패
- priority 변경 → PM 역할 손실
- model 변경 → 성능 저하

---

## 🔍 검증 단계 (필수)

### 1. 컴파일 검증
```bash
# 디렉토리 구조 확인
ls -la .claude/
# agents/, hooks/, commands/ 디렉토리 3개 확인

# PM 에이전트 파일 확인
ls -la .claude/agents/pm-dhacle.md
# 파일이 존재해야 함

# 파일 크기 확인 (0이 아니어야 함)
wc -l .claude/agents/pm-dhacle.md
# 100줄 이상이어야 함
```

### 2. 실제 내용 검증
```bash
# 핵심 철학 포함 확인
grep "CORE PRINCIPLE" .claude/agents/pm-dhacle.md
# "CORE PRINCIPLE - READ THIS FIRST" 출력되어야 함

# PM 역할 확인
grep "Project Manager" .claude/agents/pm-dhacle.md
# "Project Manager & Context Hub" 출력되어야 함

# 에이전트 목록 확인
grep -c "agent" .claude/agents/pm-dhacle.md
# 11개 이상의 에이전트 언급되어야 함
```

### 3. 구조 검증
```bash
# YAML 헤더 확인
head -5 .claude/agents/pm-dhacle.md
# name, description, model, priority 포함되어야 함
```

❌ **검증 실패** → Phase 실패 보고 및 중단
✅ **검증 성공** → 다음 Phase 진행 가능

---

## ✅ Phase 1 완료 조건

### 필수 (하나라도 실패 시 미완료)
- [ ] .claude/agents 디렉토리 존재
- [ ] .claude/hooks 디렉토리 존재  
- [ ] .claude/commands 디렉토리 존재
- [ ] PM 에이전트 파일 (pm-dhacle.md) 생성 완료
- [ ] 파일 크기 100줄 이상
- [ ] 핵심 철학 문구 포함
- [ ] 11개 에이전트 목록 포함

### 증거 수집
```bash
# 증거 1: 디렉토리 구조
ls -la .claude/ > phase1_evidence_dirs.txt

# 증거 2: PM 에이전트 파일
ls -la .claude/agents/pm-dhacle.md > phase1_evidence_pm.txt

# 증거 3: 핵심 철학 확인
grep "CORE PRINCIPLE" .claude/agents/pm-dhacle.md > phase1_evidence_core.txt
```

### 다음 Phase 진행 가능 여부
- ✅ 모든 필수 조건 충족 → Phase 2 진행
- ❌ 조건 미충족 → 수정 후 재검증

---

## 🚫 Claude Code 차단 장치

### 절대 금지 (하나라도 위반 시 STOP)

1. **추측 금지**
   - ❌ "아마 이 경로일 것이다"
   - ✅ ls로 확인 후 진행

2. **임시방편 금지**
   - ❌ 일부만 생성하고 넘어가기
   - ✅ PM 에이전트 완전히 생성

3. **검증 생략 금지**
   - ❌ "파일 생성했으니 될 거야"
   - ✅ grep으로 내용 확인

---

## 🔐 강제 체크포인트 (통과 필수)

### CP1: 시작 전
- [ ] .claude 디렉토리 상태 확인
- [ ] 기존 파일 백업 여부 결정
- [ ] 작업 폴더 존재 확인

### CP2: 수정 중
- [ ] 디렉토리 3개 모두 생성
- [ ] PM 에이전트 전체 내용 작성
- [ ] 핵심 철학 포함 확인

### CP3: 수정 후
- [ ] 파일 존재 확인
- [ ] 내용 검증 (grep)
- [ ] 라인 수 확인 (wc -l)

**하나라도 실패 → Phase 2 진행 불가**