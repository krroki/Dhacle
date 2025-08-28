const SecurityVerifier = require('./scripts/verify/modules/security.js');

async function debugSecurity() {
  const verifier = new SecurityVerifier();
  const result = await verifier.verify({ verbose: true });
  
  console.log('=== Security 검증 상세 결과 ===');
  console.log('Success:', result.success);
  console.log('Errors:', result.errors);
  console.log('Files checked:', result.filesChecked);
  
  if (verifier.tracker.errors.length > 0) {
    console.log('\n=== Security 오류 목록 ===');
    verifier.tracker.errors.forEach((error, i) => {
      console.log(`${i+1}. 파일: ${error.file}`);
      console.log(`   라인: ${error.line || 'N/A'}`);
      console.log(`   메시지: ${error.message}`);
      console.log(`   코드: ${error.code || 'N/A'}`);
      console.log(`   해결책: ${error.solution || 'N/A'}`);
      console.log('');
    });
  }
  
  if (verifier.tracker.warnings.length > 0) {
    console.log('\n=== Security 경고 목록 ===');
    verifier.tracker.warnings.forEach((warning, i) => {
      console.log(`${i+1}. 파일: ${warning.file}`);
      console.log(`   라인: ${warning.line || 'N/A'}`);
      console.log(`   메시지: ${warning.message}`);
      console.log(`   코드: ${warning.code || 'N/A'}`);
      console.log('');
    });
  }
}

debugSecurity().catch(console.error);