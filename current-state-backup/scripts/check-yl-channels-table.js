/**
 * yl_channels 테이블 존재 여부 직접 확인
 */
const { createClient } = require('@supabase/supabase-js');

async function checkYlChannelsTable() {
  console.log('🔍 yl_channels 테이블 존재 여부 확인...\n');

  try {
    // Supabase service role 클라이언트 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. 테이블 존재 여부 확인
    console.log('1️⃣ information_schema에서 yl_channels 테이블 확인');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_name', 'yl_channels')
      .eq('table_schema', 'public');

    if (tableError) {
      console.error('❌ 테이블 정보 조회 실패:', tableError);
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('✅ yl_channels 테이블 존재 확인됨');
      console.log(`   스키마: ${tableInfo[0].table_schema}`);
    } else {
      console.log('❌ yl_channels 테이블 존재하지 않음');
    }

    // 2. 테이블 구조 확인
    if (tableInfo && tableInfo.length > 0) {
      console.log('\n2️⃣ yl_channels 테이블 컬럼 구조 확인');
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'yl_channels')
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (columnError) {
        console.error('❌ 컬럼 정보 조회 실패:', columnError);
      } else {
        console.log('📋 컬럼 목록:');
        columns.forEach((col, index) => {
          console.log(`   ${index + 1}. ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      }
    }

    // 3. 실제 데이터 조회 시도
    if (tableInfo && tableInfo.length > 0) {
      console.log('\n3️⃣ yl_channels 테이블 데이터 조회 시도');
      const { data: sampleData, error: dataError } = await supabase
        .from('yl_channels')
        .select('*')
        .limit(1);

      if (dataError) {
        console.error('❌ 데이터 조회 실패:', dataError.message);
      } else {
        console.log(`✅ 테이블 조회 성공 (데이터 개수: ${sampleData?.length || 0}개)`);
      }
    }

    // 4. 관련 테이블들도 확인
    console.log('\n4️⃣ 관련 테이블 확인');
    const relatedTables = ['yl_channel_daily_delta', 'yl_approval_logs', 'yl_videos'];
    
    for (const table of relatedTables) {
      const { data: relatedInfo } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', table)
        .eq('table_schema', 'public');

      console.log(`   ${table}: ${relatedInfo && relatedInfo.length > 0 ? '✅ 존재' : '❌ 없음'}`);
    }

  } catch (error) {
    console.error('❌ 전체 검사 실패:', error);
    return false;
  }

  return true;
}

// 직접 실행
if (require.main === module) {
  require('dotenv').config({ path: '.env.local' });
  checkYlChannelsTable()
    .then(() => {
      console.log('\n🎯 yl_channels 테이블 검사 완료');
    })
    .catch(error => {
      console.error('💥 검사 중 오류:', error);
      process.exit(1);
    });
}

module.exports = { checkYlChannelsTable };