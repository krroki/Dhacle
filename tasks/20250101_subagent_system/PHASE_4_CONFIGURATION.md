/sc:build --seq --validate --evidence --no-speculation
"Phase 4: settings.json 구성 및 전체 시스템 검증"

# Phase 4/4: 설정 및 검증

⚠️ **절대 준수사항**
- [ ] 12개 에이전트 모두 settings.json에 등록
- [ ] auto_read 경로 정확히 설정
- [ ] 설치 스크립트 실행 가능하게 작성

---

## 📍 현재 상태 확인 (필수 실행)

### Phase 3 완료 확인
```bash
# 12개 에이전트 파일 확인
ls -la .claude/agents/*.md | wc -l
# 12가 출력되어야 함

# 모든 파일에 핵심 철학 포함 확인
grep -l "CORE PRINCIPLE" .claude/agents/*.md | wc -l
# 12가 출력되어야 함
```

❌ **12개 미만** → Phase 3로 돌아가기

---

## 🔧 수정 작업 (정확한 위치)

### 작업 1: settings.json 생성
**파일: `.claude/settings.json`**

```bash
cat > .claude/settings.json << 'EOF'
{
  "version": "1.0",
  "project": "dhacle",
  "agents": {
    "enabled": true,
    "auto_activate": true,
    "pm_agent": "pm-dhacle",
    "agents": [
      {
        "name": "pm-dhacle",
        "trigger": ["*"],
        "priority": 0,
        "role": "coordinator"
      },
      {
        "name": "api-route-agent",
        "trigger": ["src/app/api/**", "route.ts"],
        "priority": 1,
        "auto_read": ["src/app/api/CLAUDE.md", "docs/CONTEXT_BRIDGE.md"]
      },
      {
        "name": "component-agent",
        "trigger": ["src/components/**", "*.tsx"],
        "priority": 1,
        "auto_read": ["src/components/CLAUDE.md"]
      },
      {
        "name": "page-agent",
        "trigger": ["src/app/(pages)**", "page.tsx"],
        "priority": 1,
        "auto_read": ["src/app/(pages)/CLAUDE.md"]
      },
      {
        "name": "type-agent",
        "trigger": ["type error", "*.ts", "types/**"],
        "priority": 1,
        "auto_read": ["src/types/CLAUDE.md"]
      },
      {
        "name": "query-agent",
        "trigger": ["hooks/queries/**", "use*.ts"],
        "priority": 2,
        "auto_read": ["src/hooks/CLAUDE.md"]
      },
      {
        "name": "database-agent",
        "trigger": ["database", "supabase", "migration", "RLS"],
        "priority": 1,
        "auto_read": ["src/lib/supabase/CLAUDE.md"]
      },
      {
        "name": "security-agent",
        "trigger": ["security", "auth", "RLS", "XSS"],
        "priority": 0,
        "auto_read": ["src/lib/security/CLAUDE.md"]
      },
      {
        "name": "test-agent",
        "trigger": ["*.spec.ts", "e2e/**", "test", "playwright"],
        "priority": 2,
        "auto_read": ["docs/PLAYWRIGHT_USAGE.md"]
      },
      {
        "name": "script-agent",
        "trigger": ["scripts/**"],
        "priority": 3,
        "auto_read": ["scripts/CLAUDE.md"]
      },
      {
        "name": "doc-agent",
        "trigger": ["docs/**", "*.md"],
        "priority": 3,
        "auto_read": ["docs/DOCUMENT_GUIDE.md"]
      },
      {
        "name": "lib-agent",
        "trigger": ["src/lib/**"],
        "priority": 2,
        "auto_read": ["src/lib/CLAUDE.md"]
      }
    ]
  },
  "superclaude": {
    "enabled": true,
    "commands": ["/sc:*"]
  },
  "verification": {
    "auto_run": true,
    "on_save": ["npm run types:check"],
    "before_commit": ["npm run verify:parallel"],
    "after_task": ["npm run verify:quick"]
  },
  "hooks": {
    "enabled": false,
    "pre_task": [],
    "post_task": []
  }
}
EOF
```

### 작업 2: 설치 검증 스크립트 생성
**파일: `install-agents.sh`**

```bash
cat > install-agents.sh << 'EOF'
#!/bin/bash

echo "🚀 디하클 프로젝트 서브에이전트 시스템 설치 검증"
echo "================================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 디렉토리 확인
echo -e "${YELLOW}📁 디렉토리 구조 확인...${NC}"
if [ -d ".claude/agents" ]; then
    echo -e "${GREEN}✓ .claude/agents 디렉토리 존재${NC}"
else
    echo -e "${RED}✗ .claude/agents 디렉토리 없음${NC}"
    exit 1
fi

# 2. 에이전트 파일 검증
echo -e "${YELLOW}🤖 에이전트 파일 검증...${NC}"

agents=(
    "pm-dhacle"
    "api-route-agent"
    "component-agent"
    "page-agent"
    "type-agent"
    "query-agent"
    "database-agent"
    "security-agent"
    "test-agent"
    "script-agent"
    "doc-agent"
    "lib-agent"
)

missing=0
for agent in "${agents[@]}"; do
    if [ -f ".claude/agents/$agent.md" ]; then
        echo -e "  ${GREEN}✓${NC} $agent.md"
    else
        echo -e "  ${RED}✗${NC} $agent.md (누락)"
        missing=$((missing + 1))
    fi
done

# 3. settings.json 확인
echo -e "${YELLOW}⚙️ settings.json 검증...${NC}"
if [ -f ".claude/settings.json" ]; then
    echo -e "${GREEN}✓ settings.json 존재${NC}"
    
    # JSON 유효성 검사 (jq가 있는 경우)
    if command -v jq &> /dev/null; then
        if jq empty .claude/settings.json 2>/dev/null; then
            echo -e "${GREEN}✓ settings.json 유효한 JSON${NC}"
            
            # 에이전트 수 확인
            agent_count=$(jq '.agents.agents | length' .claude/settings.json)
            echo -e "  등록된 에이전트 수: ${agent_count}/12"
        else
            echo -e "${RED}✗ settings.json JSON 파싱 오류${NC}"
        fi
    fi
else
    echo -e "${RED}✗ settings.json 누락${NC}"
fi

# 4. 핵심 철학 포함 확인
echo -e "${YELLOW}📋 핵심 철학 포함 검증...${NC}"
core_count=$(grep -l "CORE PRINCIPLE" .claude/agents/*.md 2>/dev/null | wc -l)
echo -e "  핵심 철학 포함 파일: ${core_count}/12"

if [ $core_count -eq 12 ]; then
    echo -e "${GREEN}✓ 모든 에이전트에 핵심 철학 포함${NC}"
else
    echo -e "${YELLOW}⚠ 일부 에이전트에 핵심 철학 누락${NC}"
    echo "  누락된 에이전트:"
    for agent in "${agents[@]}"; do
        if ! grep -q "CORE PRINCIPLE" ".claude/agents/$agent.md" 2>/dev/null; then
            echo -e "    ${RED}✗${NC} $agent"
        fi
    done
fi

# 5. Stop Triggers 확인
echo -e "${YELLOW}🛑 Stop Triggers 검증...${NC}"
stop_count=$(grep -l "Stop Triggers" .claude/agents/*.md 2>/dev/null | wc -l)
echo -e "  Stop Triggers 포함 파일: ${stop_count}/12"

# 6. 최종 결과
echo ""
echo "================================================"
if [ $missing -eq 0 ] && [ $core_count -eq 12 ] && [ -f ".claude/settings.json" ]; then
    echo -e "${GREEN}✨ 설치 완료!${NC}"
    echo -e "${GREEN}🚀 Claude Code를 재시작하여 에이전트를 활성화하세요${NC}"
    echo ""
    echo "다음 명령어로 재시작:"
    echo "  claude"
    echo ""
    echo "테스트 방법:"
    echo "  1. API 파일 작업: touch src/app/api/test/route.ts"
    echo "  2. 컴포넌트 작업: touch src/components/Test.tsx"
    echo "  3. 해당 에이전트가 자동 활성화되는지 확인"
    exit 0
else
    echo -e "${RED}⚠️ 설치 미완료${NC}"
    echo ""
    echo "문제 해결:"
    [ $missing -gt 0 ] && echo "  - 누락된 에이전트 파일 생성 필요"
    [ $core_count -lt 12 ] && echo "  - 핵심 철학 누락된 파일 수정 필요"
    [ ! -f ".claude/settings.json" ] && echo "  - settings.json 파일 생성 필요"
    exit 1
fi
EOF

# 스크립트 실행 권한 부여
chmod +x install-agents.sh
```

---

## 🔍 검증 단계 (필수)

### 1. settings.json 검증
```bash
# 파일 존재 확인
ls -la .claude/settings.json
# 파일이 존재해야 함

# JSON 유효성 검사 (jq 사용)
jq empty .claude/settings.json
# 에러가 없어야 함

# 에이전트 수 확인
jq '.agents.agents | length' .claude/settings.json
# 12가 출력되어야 함
```

### 2. 설치 스크립트 실행
```bash
# 스크립트 실행 권한 확인
ls -la install-agents.sh
# -rwxr-xr-x 권한이 있어야 함

# 스크립트 실행
bash install-agents.sh
# "✨ 설치 완료!" 메시지가 출력되어야 함
```

### 3. 전체 시스템 검증
```bash
# 전체 파일 구조
tree .claude/
# 다음 구조가 보여야 함:
# .claude/
# ├── agents/
# │   ├── pm-dhacle.md
# │   ├── api-route-agent.md
# │   ├── component-agent.md
# │   ├── ... (12개 파일)
# ├── settings.json
# ├── hooks/
# └── commands/
```

❌ **검증 실패** → 해당 부분 수정
✅ **검증 성공** → VERIFICATION으로 진행

---

## ✅ Phase 4 완료 조건

### 필수 (하나라도 실패 시 미완료)
- [ ] settings.json 생성 완료
- [ ] 12개 에이전트 모두 등록
- [ ] auto_read 경로 모두 설정
- [ ] verification 설정 포함
- [ ] 설치 스크립트 실행 가능
- [ ] 설치 검증 통과

### 증거 수집
```bash
# 증거 1: settings.json
cat .claude/settings.json | jq '.agents.agents | length' > phase4_evidence_settings.txt

# 증거 2: 설치 스크립트 실행 결과
bash install-agents.sh > phase4_evidence_install.txt 2>&1

# 증거 3: 전체 구조
tree .claude/ > phase4_evidence_structure.txt
```

### 다음 단계 진행
- ✅ 모든 필수 조건 충족 → VERIFICATION 진행
- ❌ 조건 미충족 → 수정 후 재검증

---

## 🔐 강제 체크포인트 (통과 필수)

### CP1: 시작 전
- [ ] 12개 에이전트 파일 모두 존재
- [ ] 핵심 철학 모두 포함

### CP2: 수정 중
- [ ] settings.json 전체 작성
- [ ] 12개 에이전트 모두 등록
- [ ] 설치 스크립트 작성

### CP3: 수정 후
- [ ] JSON 유효성 검사 통과
- [ ] 설치 스크립트 실행 성공
- [ ] "✨ 설치 완료!" 메시지 확인

**하나라도 실패 → 시스템 미완성**