require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function checkAlertRulesTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ 데이터베이스 연결 성공\n');

    // 1. alert_rules 테이블 존재 확인
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'alert_rules'
      );
    `;
    
    const tableResult = await client.query(tableExistsQuery);
    const tableExists = tableResult.rows[0].exists;
    
    console.log('📊 alert_rules 테이블 상태:');
    console.log(`  테이블 존재: ${tableExists ? '✅ YES' : '❌ NO'}\n`);
    
    if (tableExists) {
      // 2. 테이블 구조 확인
      const columnsQuery = `
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'alert_rules'
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await client.query(columnsQuery);
      
      console.log('📋 테이블 컬럼 구조:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // 3. 데이터 개수 확인
      const countQuery = 'SELECT COUNT(*) FROM alert_rules;';
      const countResult = await client.query(countQuery);
      console.log(`\n📊 데이터 개수: ${countResult.rows[0].count}개`);
      
      // 4. 샘플 데이터 확인 (최대 3개)
      const sampleQuery = 'SELECT * FROM alert_rules LIMIT 3;';
      const sampleResult = await client.query(sampleQuery);
      
      if (sampleResult.rows.length > 0) {
        console.log('\n📝 샘플 데이터:');
        console.log(JSON.stringify(sampleResult.rows, null, 2));
      }
    }
    
    // 5. alerts 테이블도 확인
    console.log('\n\n📊 alerts 테이블 상태:');
    const alertsExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'alerts'
      );
    `;
    
    const alertsResult = await client.query(alertsExistsQuery);
    const alertsExists = alertsResult.rows[0].exists;
    console.log(`  테이블 존재: ${alertsExists ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ 오류:', error.message);
    console.error('상세:', error);
  } finally {
    await client.end();
  }
}

checkAlertRulesTable();