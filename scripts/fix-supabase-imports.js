#!/usr/bin/env node
/**
 * Supabase 클라이언트 import 패턴 수정 검증 스크립트
 * 수정이 필요한 파일들을 확인하고 패턴을 표시합니다.
 * 
 * 이 스크립트는 검증만 하고 실제 수정은 하지 않습니다.
 */

const fs = require('fs');
const path = require('path');

// 수정이 필요한 파일 목록
const filesToFix = [
  'src/app/api/youtube/popular/route.ts',
  'src/app/api/youtube/metrics/route.ts',
  'src/lib/youtube/monitoring.ts',
  'src/lib/youtube/collections.ts',
  'src/lib/security/example-usage.ts',
  'src/app/api/youtube/analysis/route.ts',
  'src/app/api/youtube-lens/admin/channels/route.ts',
  'src/app/api/youtube/subscribe/route.ts',
  'src/app/api/youtube/folders/route.ts',
  'src/app/api/youtube/favorites/route.ts',
  'src/app/api/youtube-lens/trending-summary/route.ts',
  'src/app/api/revenue-proof/route.ts',
  'src/app/api/youtube-lens/admin/channels/[channelId]/route.ts',
  'src/app/api/youtube/search/route.ts',
  'src/app/api/user/profile/route.ts',
  'src/app/api/youtube/favorites/[id]/route.ts',
  'src/app/api/revenue-proof/[id]/route.ts',
  'src/app/api/youtube-lens/admin/approval-logs/[channelId]/route.ts',
  'src/app/api/user/naver-cafe/route.ts',
  'src/app/api/youtube/batch/route.ts',
  'src/app/api/revenue-proof/ranking/route.ts',
  'src/app/api/upload/route.ts',
  'src/app/api/youtube/collections/route.ts',
  'src/app/api/user/init-profile/route.ts',
  'src/app/api/youtube/collections/items/route.ts',
  'src/app/api/revenue-proof/my/route.ts',
  'src/app/api/revenue-proof/[id]/report/route.ts',
  'src/app/api/revenue-proof/[id]/comment/route.ts',
  'src/app/api/user/generate-nickname/route.ts',
  'src/app/api/user/generate-username/route.ts',
  'src/app/api/health/route.ts',
  'src/app/api/revenue-proof/seed/route.ts',
  'src/app/api/user/check-username/route.ts',
  'src/app/api/payment/create-intent/route.ts',
  'src/app/api/revenue-proof/[id]/like/route.ts',
  'src/app/api/coupons/validate/route.ts',
  'src/app/api/payment/confirm/route.ts',
  'src/app/api/payment/fail/route.ts',
  'src/app/api/community/posts/[id]/route.ts',
  'src/app/api/admin/video/upload/route.ts',
  'src/app/api/community/posts/route.ts',
  'src/app/api/debug/env-check/route.ts'
];

console.log(`📋 Checking ${filesToFix.length} files for old Supabase import patterns...\n`);

let filesNeedingFix = 0;
let filesAlreadyFixed = 0;
let filesNotFound = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Not found: ${filePath}`);
    filesNotFound++;
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('@supabase/auth-helpers-nextjs')) {
    console.log(`⚠️  Needs fix: ${filePath}`);
    
    // Show the problematic lines
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('@supabase/auth-helpers-nextjs') || 
          line.includes('createRouteHandlerClient')) {
        console.log(`   Line ${index + 1}: ${line.trim()}`);
      }
    });
    console.log('');
    filesNeedingFix++;
  } else if (content.includes('createSupabaseRouteHandlerClient')) {
    console.log(`✅ Already fixed: ${filePath}`);
    filesAlreadyFixed++;
  } else {
    console.log(`ℹ️  Unknown pattern: ${filePath}`);
  }
});

console.log('\n📊 Summary:');
console.log(`  - Files needing fix: ${filesNeedingFix}`);
console.log(`  - Files already fixed: ${filesAlreadyFixed}`);
console.log(`  - Files not found: ${filesNotFound}`);
console.log(`  - Total: ${filesToFix.length}`);

if (filesNeedingFix > 0) {
  console.log('\n⚡ These files need to be updated:');
  console.log('  1. Remove: import { createRouteHandlerClient } from \'@supabase/auth-helpers-nextjs\';');
  console.log('  2. Remove: import { cookies } from \'next/headers\';');
  console.log('  3. Add: import { createSupabaseRouteHandlerClient } from \'@/lib/supabase/server-client\';');
  console.log('  4. Replace: createRouteHandlerClient({ cookies }) with await createSupabaseRouteHandlerClient()');
}