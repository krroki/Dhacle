/**
 * YouTube Lens Phase 진행상황 검증 스크립트
 * 각 Phase별 구현 완료 여부를 체크합니다.
 */

const fs = require('fs');
const path = require('path');

// 색상 출력
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Phase별 체크 항목
const phases = {
  'Phase 0: Foundation (기반 구축)': {
    files: [
      'supabase/migrations/20250201000001_youtube_lens_delta_system.sql',
      'src/lib/youtube-lens/format-number-ko.ts'
    ],
    status: null
  },
  'Phase 1: Admin Core (관리자 핵심)': {
    files: [
      'src/components/features/tools/youtube-lens/admin/ChannelApprovalConsole.tsx',
      'src/app/api/youtube-lens/admin/channels/route.ts',
      'src/app/api/youtube-lens/admin/channels/[channelId]/route.ts',
      'src/app/api/youtube-lens/admin/approval-logs/[channelId]/route.ts',
      'src/app/tools/youtube-lens/admin/channels/page.tsx'
    ],
    status: null
  },
  'Phase 2: Data Collection (데이터 수집)': {
    files: [
      'supabase/functions/yl-daily-batch/index.ts',
      'docs/youtube-lens-implementation/integration-test-plan.md'
    ],
    status: null
  },
  'Phase 3: User Dashboard (사용자 대시보드)': {
    files: [
      'src/components/features/tools/youtube-lens/DeltaDashboard.tsx',
      'src/app/api/youtube-lens/trending-summary/route.ts',
      'src/app/api/youtube-lens/category-stats/route.ts'
    ],
    status: null
  },
  'Phase 4: Advanced Features (고급 기능)': {
    files: [
      'src/lib/youtube-lens/shorts-detector.ts',
      'src/lib/youtube-lens/keyword-extractor.ts',
      'src/lib/youtube-lens/newcomer-detector.ts'
    ],
    status: null
  },
  'Phase 5: Optimization (최적화)': {
    files: [
      'src/lib/youtube-lens/cache-manager.ts',
      'src/lib/youtube-lens/performance-monitor.ts'
    ],
    status: null
  }
};

// 파일 존재 체크
function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  try {
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

// Phase 진행률 계산
function calculateProgress(phase) {
  const existingFiles = phase.files.filter(file => checkFile(file));
  const percentage = Math.round((existingFiles.length / phase.files.length) * 100);
  return {
    percentage,
    existing: existingFiles.length,
    total: phase.files.length
  };
}

// 진행 바 생성
function createProgressBar(percentage) {
  const barLength = 30;
  const filled = Math.round((percentage / 100) * barLength);
  const empty = barLength - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  let color = colors.red;
  if (percentage === 100) color = colors.green;
  else if (percentage >= 50) color = colors.yellow;
  
  return `${color}${bar}${colors.reset}`;
}

// 메인 실행
console.log(`\n${colors.bold}📋 YouTube Lens Delta System - Phase 진행상황 검증${colors.reset}\n`);
console.log('=' .repeat(80));

let totalProgress = 0;
let completedPhases = 0;
const phaseCount = Object.keys(phases).length;

// 각 Phase 체크
Object.entries(phases).forEach(([phaseName, phaseData], index) => {
  const progress = calculateProgress(phaseData);
  const isComplete = progress.percentage === 100;
  
  if (isComplete) completedPhases++;
  totalProgress += progress.percentage;
  
  const statusIcon = isComplete ? '✅' : progress.percentage > 0 ? '⚠️' : '❌';
  const phaseNumber = `Phase ${index}`;
  
  console.log(`\n${statusIcon} ${colors.bold}${phaseName}${colors.reset}`);
  console.log(`   ${createProgressBar(progress.percentage)} ${progress.percentage}% (${progress.existing}/${progress.total} 파일)`);
  
  // 누락된 파일 표시
  if (!isComplete) {
    const missingFiles = phaseData.files.filter(file => !checkFile(file));
    if (missingFiles.length > 0) {
      console.log(`   ${colors.red}누락된 파일:${colors.reset}`);
      missingFiles.forEach(file => {
        console.log(`     - ${file}`);
      });
    }
  }
});

// 전체 진행률
const overallProgress = Math.round(totalProgress / phaseCount);
console.log('\n' + '=' .repeat(80));
console.log(`\n${colors.bold}📊 전체 진행률${colors.reset}`);
console.log(`   ${createProgressBar(overallProgress)} ${overallProgress}%`);
console.log(`   완료된 Phase: ${completedPhases}/${phaseCount}`);

// 권장사항
console.log(`\n${colors.bold}🎯 다음 작업 권장사항${colors.reset}`);
if (completedPhases < 3) {
  console.log(`   ${colors.yellow}⚠️  Phase 3 (User Dashboard) 구현이 필요합니다.${colors.reset}`);
  console.log(`      - DeltaDashboard 컴포넌트 생성`);
  console.log(`      - API 엔드포인트 구현`);
  console.log(`      - MetricsDashboard 교체`);
} else if (completedPhases < 4) {
  console.log(`   ${colors.blue}📍 Phase 4 (Advanced Features) 구현을 시작하세요.${colors.reset}`);
  console.log(`      - Shorts 탐지 알고리즘`);
  console.log(`      - 키워드 추출 서비스`);
} else if (completedPhases < 5) {
  console.log(`   ${colors.blue}🚀 Phase 5 (Optimization) 구현을 시작하세요.${colors.reset}`);
  console.log(`      - 캐싱 전략 구현`);
  console.log(`      - 성능 모니터링`);
} else {
  console.log(`   ${colors.green}✨ 모든 Phase가 완료되었습니다!${colors.reset}`);
}

// 환경 변수 체크
console.log(`\n${colors.bold}🔐 환경 변수 체크${colors.reset}`);
const requiredEnvVars = ['YT_ADMIN_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch {
  console.log(`   ${colors.red}❌ .env.local 파일을 찾을 수 없습니다.${colors.reset}`);
}

if (envContent) {
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`   ${colors.green}✅ ${envVar}${colors.reset}`);
    } else {
      console.log(`   ${colors.red}❌ ${envVar} - 설정 필요${colors.reset}`);
    }
  });
}

// React Query 설정 체크
console.log(`\n${colors.bold}⚡ React Query 캐싱 설정${colors.reset}`);
console.log(`   권장 설정:`);
console.log(`   - staleTime: 5분 (300000ms)`);
console.log(`   - gcTime: 24시간 (86400000ms)`);
console.log(`   - 캐시 키 네임스페이스: 'yl/*'`);

console.log('\n' + '=' .repeat(80));
console.log(`\n완료! Phase 실행 계획은 /docs/youtube-lens-implementation/PHASE_EXECUTION_PLAN.md 참조\n`);