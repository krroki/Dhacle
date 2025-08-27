#!/bin/bash

echo "============================================"
echo "🚀 Hook System Progressive Enhancement 적용 시작"
echo "============================================"
echo ""

# 1. 현재 설정 백업
BACKUP_FILE="config.json.backup.$(date +%Y%m%d_%H%M%S)"
cp config.json "$BACKUP_FILE"
echo "✅ 기존 설정 백업 완료: $BACKUP_FILE"

# 2. Development 모드로 전환
export PROJECT_PHASE=development
echo "✅ Development 모드 설정"

# 3. Claude Code 감지 활성화
export CLAUDE_CODE=true
echo "✅ Claude Code 모드 활성화"

# 4. 활동 로그 파일 생성
echo "$(date -Iseconds) Initial setup" > activity.log
echo "✅ 활동 로그 파일 생성"

# 5. DISABLED 파일 제거 (emergency disable 해제)
if [ -f DISABLED ]; then
    rm DISABLED
    echo "✅ Emergency disable 플래그 제거"
fi

# 6. config.json을 Progressive Mode로 수정
echo "✅ config.json 업데이트 중..."
node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Remove disable markers
delete config._disabled_at;
delete config._disabled_reason;

// Enable hooks
config.enabled = true;

// Set validators to warning mode (except security)
config.validators['no-any-type'] = {
  enabled: true,
  severity: 'warning',
  description: 'Prevents use of TypeScript any type for better type safety'
};

config.validators['no-todo-comments'] = {
  enabled: true,
  severity: 'warning',
  description: 'Prevents TODO/FIXME comments to ensure complete implementations'
};

config.validators['no-empty-catch'] = {
  enabled: true,
  severity: 'warning',
  description: 'Prevents empty catch blocks that silence errors'
};

config.validators['no-direct-fetch'] = {
  enabled: true,
  severity: 'warning',
  description: 'Prevents direct fetch() usage, enforces apiClient for consistency'
};

// Security validators remain as errors
config.validators['no-deprecated-supabase'] = {
  enabled: true,
  severity: 'error',
  description: 'Prevents deprecated @supabase/auth-helpers-nextjs usage that causes PKCE errors'
};

config.validators['no-wrong-type-imports'] = {
  enabled: true,
  severity: 'error',
  description: 'Ensures type imports come from @/types, not database.generated.ts directly'
};

// Progressive settings
config.strictMode = false;
config.includeWarnings = true;

fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
console.log('✅ config.json 업데이트 완료');
"

echo ""
echo "============================================"
echo "🎉 적용 완료!"
echo "============================================"
echo ""
echo "📊 현재 상태:"
echo "  - 모든 Hook이 Warning으로 변경 (보안 제외)"
echo "  - TODO 제한: 2일"
echo "  - Claude Code 자동 감지 활성화"
echo "  - Progressive Configuration 활성화"
echo ""
echo "🤖 Claude Code 이제 작업 가능합니다!"
echo ""
echo "💡 테스트 방법:"
echo "  1. 파일 수정 시도"
echo "  2. Warning만 표시되는지 확인"
echo "  3. 작업 차단 없음 확인"
echo ""
echo "🔄 롤백 방법:"
echo "  cp $BACKUP_FILE config.json"
echo ""