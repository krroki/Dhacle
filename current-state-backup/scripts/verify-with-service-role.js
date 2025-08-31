#!/usr/bin/env node

/**
 * Service Role Key를 사용한 정확한 테이블 검증
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifyTables() {
  log('\n========================================', 'bright');
  log('  📊 Service Role Key로 테이블 검증', 'bright');
  log('========================================\n', 'bright');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('your-')) {
    log('❌ Service Role Key가 설정되지 않았습니다!', 'red');
    return;
  }

  // Service Role Key로 클라이언트 생성 (RLS 우회)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  // YouTube Lens 핵심 테이블들
  const criticalTables = {
    'YouTube Lens': [
      'videos',
      'video_stats',
      'channels',
      'collections',
      'collection_items',
      'source_folders',
      'folder_channels',
      'alert_rules',
      'alerts',
      'saved_searches',
      'subscriptions'
    ],
    'Course System': [
      'courses',
      'course_enrollments',
      'course_progress'
    ],
    'Payment': [
      'payments',
      'coupons'
    ],
    'Basic': [
      'users',
      'profiles',
      'user_api_keys',
      'revenue_proofs',
      'community_posts'
    ]
  };

  let totalTables = 0;
  let existingTables = 0;
  const missingTables = [];

  for (const [category, tables] of Object.entries(criticalTables)) {
    log(`\n📁 ${category}:`, 'cyan');
    
    for (const table of tables) {
      totalTables++;
      try {
        // Service Role Key로 직접 쿼리 (RLS 우회)
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });

        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('not found')) {
            log(`  ❌ ${table} - 존재하지 않음`, 'red');
            missingTables.push(table);
          } else if (error.message.includes('schema cache')) {
            // 스키마 캐시 문제는 대부분 테이블이 없다는 의미
            log(`  ❌ ${table} - 존재하지 않음 (캐시)`, 'red');
            missingTables.push(table);
          } else {
            log(`  ⚠️ ${table} - 오류: ${error.message}`, 'yellow');
          }
        } else {
          log(`  ✅ ${table} - 존재함`, 'green');
          existingTables++;
        }
      } catch (err) {
        log(`  ❌ ${table} - 예외: ${err.message}`, 'red');
        missingTables.push(table);
      }
    }
  }

  log('\n========================================', 'bright');
  log('  📊 최종 결과', 'bright');
  log('========================================\n', 'bright');
  
  log(`총 테이블: ${totalTables}개`, 'blue');
  log(`생성됨: ${existingTables}개`, 'green');
  log(`누락됨: ${missingTables.length}개`, missingTables.length > 0 ? 'red' : 'green');

  if (missingTables.length > 0) {
    log('\n❌ 누락된 테이블:', 'red');
    missingTables.forEach(table => {
      log(`  - ${table}`, 'red');
    });
    
    log('\n🔧 해결 방법:', 'yellow');
    log('1. Supabase Dashboard SQL Editor에서 수동 실행:', 'blue');
    log('   https://supabase.com/dashboard/project/golbwnsytwbyoneucunx/sql', 'cyan');
    log('\n2. 특히 YouTube Lens 마이그레이션 파일 실행:', 'blue');
    log('   - 20250121000001_youtube_lens_complete_schema.sql', 'cyan');
    log('   - 20250816075332_youtube_lens_pubsubhubbub.sql', 'cyan');
    log('   - 20250816080000_youtube_lens_analytics.sql', 'cyan');
  } else {
    log('\n✅ 모든 테이블이 정상적으로 생성되었습니다!', 'green');
    log('YouTube Lens를 사용할 준비가 완료되었습니다.', 'green');
  }

  // YouTube Lens 상태 특별 체크
  const youtubeTables = criticalTables['YouTube Lens'];
  const foundYoutubeTables = youtubeTables.filter(t => !missingTables.includes(t));
  
  log('\n🎬 YouTube Lens 상태:', 'cyan');
  log(`${foundYoutubeTables.length}/${youtubeTables.length} 테이블 생성됨`, 
    foundYoutubeTables.length === youtubeTables.length ? 'green' : 'red');
  
  if (foundYoutubeTables.length < youtubeTables.length) {
    log('\n⚠️ YouTube Lens 기능이 정상 작동하지 않을 수 있습니다!', 'yellow');
  }
}

// 실행
verifyTables().catch(error => {
  log(`\n❌ 오류 발생: ${error.message}`, 'red');
  process.exit(1);
});