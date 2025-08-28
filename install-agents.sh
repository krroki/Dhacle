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
core_count=$(find .claude/agents -name "*.md" -exec grep -l "CORE PRINCIPLE" {} \; | wc -l)
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
stop_count=$(find .claude/agents -name "*.md" -exec grep -l "Stop Triggers" {} \; | wc -l)
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