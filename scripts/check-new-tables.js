require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ 데이터베이스 연결 성공\n');

    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'proof_likes', 
        'proof_comments', 
        'naver_cafe_verifications',
        'subscription_logs',
        'channel_subscriptions',
        'webhook_events',
        'course_progress_extended'
      )
      ORDER BY table_name;
    `;

    const result = await client.query(query);
    
    const expectedTables = [
      'proof_likes',
      'proof_comments',
      'naver_cafe_verifications',
      'subscription_logs',
      'channel_subscriptions',
      'webhook_events',
      'course_progress_extended'
    ];

    console.log('📊 새로 생성된 테이블 확인:\n');
    
    const createdTables = result.rows.map(row => row.table_name);
    
    expectedTables.forEach(table => {
      if (createdTables.includes(table)) {
        console.log(`  ✅ ${table} - 생성됨`);
      } else {
        console.log(`  ❌ ${table} - 누락됨`);
      }
    });

    console.log(`\n총 ${createdTables.length}/${expectedTables.length} 테이블 생성됨`);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();