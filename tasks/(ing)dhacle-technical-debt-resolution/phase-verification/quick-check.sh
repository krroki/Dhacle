#!/bin/bash

# 기술 부채 해소 프로젝트 빠른 검증 스크립트
# 핵심 지표만 빠르게 확인

echo "========================================="
echo "   🚀 기술 부채 해소 빠른 검증"
echo "========================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로젝트 루트로 이동
cd "$(dirname "$0")/../../.." || exit

echo -e "${BLUE}📊 핵심 지표 검사${NC}"
echo "-------------------"

# 1. 직접 fetch 사용
echo -n "직접 fetch 사용: "
FETCH_COUNT=$(grep -r "fetch(" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "api-client" | wc -l)
if [ "$FETCH_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ 0개${NC}"
else
    echo -e "${RED}❌ ${FETCH_COUNT}개${NC}"
fi

# 2. console.log 사용
echo -n "console.log 사용: "
CONSOLE_COUNT=$(grep -r "console\.log" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$CONSOLE_COUNT" -le 5 ]; then
    echo -e "${GREEN}✅ ${CONSOLE_COUNT}개${NC}"
else
    echo -e "${RED}❌ ${CONSOLE_COUNT}개${NC}"
fi

# 3. any 타입 사용
echo -n "any 타입 사용: "
ANY_COUNT=$(grep -r ": any" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$ANY_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ 0개${NC}"
else
    echo -e "${RED}❌ ${ANY_COUNT}개${NC}"
fi

# 4. TypeScript 컴파일
echo -n "TypeScript 컴파일: "
if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
    TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
    echo -e "${RED}❌ ${TS_ERRORS}개 에러${NC}"
else
    echo -e "${GREEN}✅ 에러 없음${NC}"
fi

# 5. 빌드 테스트
echo -n "Next.js 빌드: "
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 성공${NC}"
else
    echo -e "${RED}❌ 실패${NC}"
fi

echo ""
echo -e "${BLUE}📁 프로젝트 구조 확인${NC}"
echo "---------------------"

# 환경변수 시스템
echo -n "환경변수 시스템: "
if [ -f "src/lib/env.ts" ]; then
    echo -e "${GREEN}✅ 구현됨${NC}"
else
    echo -e "${RED}❌ 미구현${NC}"
fi

# API 클라이언트
echo -n "API 클라이언트: "
if [ -f "src/lib/api-client.ts" ]; then
    echo -e "${GREEN}✅ 구현됨${NC}"
else
    echo -e "${RED}❌ 미구현${NC}"
fi

# 로거 시스템
echo -n "로거 시스템: "
if [ -f "src/lib/logger.ts" ]; then
    echo -e "${GREEN}✅ 구현됨${NC}"
else
    echo -e "${RED}❌ 미구현${NC}"
fi

# 컴포넌트 구조
echo -n "컴포넌트 구조: "
if [ -d "src/components/features" ] && [ -d "src/components/common" ] && [ -d "src/components/ui" ]; then
    echo -e "${GREEN}✅ 표준화됨${NC}"
else
    echo -e "${YELLOW}⚠️ 부분 구현${NC}"
fi

echo ""
echo -e "${BLUE}🧹 오버엔지니어링 제거 확인${NC}"
echo "---------------------------"

# Storybook
echo -n "Storybook: "
if [ -d ".storybook" ] || grep -q "@storybook" package.json 2>/dev/null; then
    echo -e "${RED}❌ 여전히 존재${NC}"
else
    echo -e "${GREEN}✅ 제거됨${NC}"
fi

# Docker
echo -n "Docker: "
if [ -f "Dockerfile" ] || [ -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ 여전히 존재${NC}"
else
    echo -e "${GREEN}✅ 제거됨${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}검증 완료!${NC}"
echo ""
echo "상세 검증을 원하시면 다음을 실행하세요:"
echo "  node verify-all-phases.js"
echo "========================================="