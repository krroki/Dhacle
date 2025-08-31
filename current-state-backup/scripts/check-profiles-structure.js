const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkProfilesStructure() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('=== Checking profiles table/view structure ===\n');
  
  // Check if profiles is a table or view
  const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_info', { 
    table_name: 'profiles' 
  }).single();
  
  if (tableError) {
    // Try alternate query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_type')
      .eq('table_name', 'profiles')
      .single();
      
    if (!error && data) {
      console.log(`profiles is a: ${data.table_type}`);
    }
  }
  
  // Check auth.users table
  console.log('\n📋 Checking auth.users table structure:');
  const authFields = [
    'random_nickname',
    'email'
  ];
  
  // Test query to auth.users through profiles view
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (!profileError && profileData) {
    console.log('\nProfiles view columns:', Object.keys(profileData[0] || {}));
  }
  
  // Check if we need to modify auth.users instead
  console.log('\n📋 Need to determine actual table structure');
}

checkProfilesStructure().catch(console.error);