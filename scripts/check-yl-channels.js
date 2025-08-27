const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('\n🔍 Checking YouTube Lens tables...\n');

  // Check if yl_channels table exists
  let tables, error;
  try {
    const result = await supabase.rpc('check_table_exists', {
      table_name: 'yl_channels'
    });
    tables = result.data;
    error = result.error;
  } catch (e) {
    tables = null;
    error = 'Function not found';
  }

  // Alternative method - try to query the table
  const { data: ylChannels, error: ylError } = await supabase
    .from('yl_channels')
    .select('*')
    .limit(1);

  if (!ylError) {
    console.log('✅ yl_channels table exists');
    
    // Get column information
    // Skip column check for now since it's causing issues
  } else {
    console.log('❌ yl_channels table does not exist or error:', ylError.message);
  }

  // Check other tables
  const tablesToCheck = [
    'yl_channel_daily_delta',
    'yl_approval_logs',
    'channel_subscriptions',
    'webhook_events',
    'subscription_logs'
  ];

  for (const table of tablesToCheck) {
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log(`✅ ${table} table exists`);
    } else {
      console.log(`❌ ${table} table does not exist`);
    }
  }
}

checkTables().catch(console.error);