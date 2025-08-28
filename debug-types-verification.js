const TypesVerifier = require('./scripts/verify/modules/types.js');

async function debugTypes() {
  const verifier = new TypesVerifier();
  const result = await verifier.verify({ verbose: true });
  
  console.log('=== Types 검증 상세 결과 ===');
  console.log('Success:', result.success);
  console.log('Errors:', result.errors);
  console.log('Files checked:', result.filesChecked);
  
  if (verifier.tracker.errors.length > 0) {
    console.log('\n=== Types 오류 목록 ===');
    verifier.tracker.errors.forEach((error, i) => {
      console.log(`${i+1}. 파일: ${error.file}`);
      console.log(`   라인: ${error.line || 'N/A'}`);
      console.log(`   메시지: ${error.message}`);
      console.log(`   코드: ${error.code || 'N/A'}`);
      console.log(`   해결책: ${error.solution || 'N/A'}`);
      console.log('');
    });
  }
}

debugTypes().catch(console.error);