const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyExistingStructure() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('=== Checking Existing Database Structure ===\n');
  
  // Check profiles table fields
  console.log('📋 Checking profiles table fields:');
  const profileFields = [
    'random_nickname',
    'naver_cafe_verified',
    'cafe_member_url',
    'naver_cafe_nickname',
    'naver_cafe_verified_at',
    'work_type',
    'email'
  ];
  
  for (const field of profileFields) {
    const { data, error } = await supabase
      .from('profiles')
      .select(field)
      .limit(1);
    
    if (error && error.message.includes('column')) {
      console.log(`  ❌ ${field}: Missing`);
    } else {
      console.log(`  ✅ ${field}: Exists`);
    }
  }
  
  console.log('\n📋 Checking tables existence:');
  const tables = [
    'coupons',
    'yl_channels', 
    'yl_channel_daily_delta',
    'yl_approval_logs',
    'alert_rules',
    'channel_subscriptions',
    'webhook_events', 
    'subscription_logs',
    'analytics_logs'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log(`  ❌ ${table}: Does not exist`);
    } else if (error) {
      console.log(`  ⚠️ ${table}: ${error.message}`);
    } else {
      console.log(`  ✅ ${table}: Exists`);
    }
  }
}

verifyExistingStructure().catch(console.error);