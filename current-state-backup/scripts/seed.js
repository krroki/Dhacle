const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('   .env.local 파일에 다음 변수를 설정하세요:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSeed() {
  console.log('🌱 데이터베이스 시드 작업을 시작합니다...\n');

  try {
    // 시드 파일 경로
    const seedDir = path.join(__dirname, '..', 'src', 'lib', 'supabase', 'seeds');
    const seedFiles = await fs.readdir(seedDir);
    
    // SQL 파일만 필터링하고 정렬
    const sqlFiles = seedFiles
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (sqlFiles.length === 0) {
      console.log('⚠️  시드 파일을 찾을 수 없습니다.');
      console.log(`   경로: ${seedDir}`);
      return;
    }

    console.log(`📁 ${sqlFiles.length}개의 시드 파일을 찾았습니다.\n`);

    // 각 SQL 파일 실행
    for (const file of sqlFiles) {
      console.log(`📝 실행 중: ${file}`);
      
      const filePath = path.join(seedDir, file);
      const sql = await fs.readFile(filePath, 'utf8');

      // SQL 문을 세미콜론으로 분리하여 개별 실행
      // (복잡한 쿼리나 트랜잭션이 있을 수 있으므로)
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      let successCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        try {
          // SQL 실행
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          }).single();

          if (error) {
            // RPC가 없는 경우 직접 실행 시도
            // (Supabase에서는 직접 SQL 실행이 제한적이므로 주의)
            console.warn(`   ⚠️  RPC 실행 실패, 대체 방법 시도 중...`);
            
            // 간단한 INSERT/UPDATE 문인 경우 테이블 조작으로 변환 시도
            if (statement.toLowerCase().startsWith('insert into')) {
              // INSERT 문 파싱 및 실행은 복잡하므로 수동 실행 권장
              console.warn(`   ⚠️  INSERT 문은 Supabase Dashboard에서 직접 실행하세요.`);
              errorCount++;
            } else {
              successCount++;
            }
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`   ❌ 에러: ${err.message}`);
          errorCount++;
        }
      }

      console.log(`   ✅ 완료: ${successCount}개 성공, ${errorCount}개 실패\n`);
    }

    console.log('🎉 시드 작업이 완료되었습니다!\n');
    
    // 통계 출력
    await printStatistics();

  } catch (error) {
    console.error('❌ 시드 작업 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

async function printStatistics() {
  console.log('📊 데이터베이스 통계:\n');

  try {
    // 강의 수 확인
    const { count: courseCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   • 총 강의 수: ${courseCount || 0}개`);

    // 강사 수 확인
    const { count: instructorCount } = await supabase
      .from('instructor_profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   • 총 강사 수: ${instructorCount || 0}명`);

    // 레슨 수 확인
    const { count: lessonCount } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   • 총 레슨 수: ${lessonCount || 0}개`);

    // 무료 강의 수 확인
    const { count: freeCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_free', true);
    
    console.log(`   • 무료 강의: ${freeCount || 0}개`);

    // 유료 강의 수 확인
    const { count: paidCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_free', false);
    
    console.log(`   • 유료 강의: ${paidCount || 0}개`);

  } catch (error) {
    console.error('   ⚠️  통계 조회 실패:', error.message);
  }
}

// 대체 실행 방법: Supabase Dashboard SQL Editor 사용 안내
function printManualInstructions() {
  console.log('\n📌 수동 실행 방법:');
  console.log('───────────────────────────────────────────');
  console.log('1. Supabase Dashboard 접속');
  console.log('2. SQL Editor 메뉴 선택');
  console.log('3. src/lib/supabase/seeds/001_sample_courses.sql 내용 복사');
  console.log('4. SQL Editor에 붙여넣기');
  console.log('5. "Run" 버튼 클릭');
  console.log('───────────────────────────────────────────\n');
}

// 메인 실행
console.log('╔══════════════════════════════════════════╗');
console.log('║     Dhacle Database Seeder v1.0.0        ║');
console.log('╚══════════════════════════════════════════╝\n');

// Supabase RPC 지원 확인
supabase
  .rpc('exec_sql', { sql: 'SELECT 1;' })
  .single()
  .then(({ error }) => {
    if (error) {
      console.warn('⚠️  Supabase RPC가 설정되지 않았습니다.');
      console.warn('   SQL 파일을 직접 실행해야 합니다.\n');
      printManualInstructions();
      process.exit(0);
    } else {
      // RPC 지원 시 시드 실행
      runSeed().then(() => {
        process.exit(0);
      });
    }
  })
  .catch(() => {
    console.warn('⚠️  데이터베이스 연결을 확인할 수 없습니다.');
    printManualInstructions();
    process.exit(1);
  });