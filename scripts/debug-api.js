// API 디버깅 스크립트
// 브라우저 콘솔에서 실행하여 실제 API 응답 확인

async function debugAPIs() {
  console.log('=== API 디버깅 시작 ===\n');
  
  // 1. revenue-proof API 테스트
  console.log('1. Testing /api/revenue-proof...');
  try {
    const response1 = await fetch('/api/revenue-proof');
    console.log('   Status:', response1.status, response1.statusText);
    console.log('   Headers:', Object.fromEntries(response1.headers.entries()));
    
    const text1 = await response1.text();
    console.log('   Response length:', text1.length);
    
    try {
      const data1 = JSON.parse(text1);
      console.log('   Response data:', data1);
    } catch (e) {
      console.log('   Response (not JSON):', text1.substring(0, 500));
    }
  } catch (error) {
    console.error('   Network error:', error);
  }
  
  console.log('\n2. Testing /api/revenue-proof/ranking...');
  try {
    const response2 = await fetch('/api/revenue-proof/ranking');
    console.log('   Status:', response2.status, response2.statusText);
    console.log('   Headers:', Object.fromEntries(response2.headers.entries()));
    
    const text2 = await response2.text();
    console.log('   Response length:', text2.length);
    
    try {
      const data2 = JSON.parse(text2);
      console.log('   Response data:', data2);
    } catch (e) {
      console.log('   Response (not JSON):', text2.substring(0, 500));
    }
  } catch (error) {
    console.error('   Network error:', error);
  }
  
  console.log('\n3. Testing /api/revenue-proof/seed (GET)...');
  try {
    const response3 = await fetch('/api/revenue-proof/seed');
    console.log('   Status:', response3.status, response3.statusText);
    console.log('   Headers:', Object.fromEntries(response3.headers.entries()));
    
    const text3 = await response3.text();
    console.log('   Response length:', text3.length);
    
    try {
      const data3 = JSON.parse(text3);
      console.log('   Response data:', data3);
    } catch (e) {
      console.log('   Response (not JSON):', text3.substring(0, 500));
    }
  } catch (error) {
    console.error('   Network error:', error);
  }
  
  console.log('\n=== 디버깅 완료 ===');
  console.log('위 결과를 확인하여 어떤 API가 어떤 에러를 반환하는지 파악하세요.');
}

// 자동 실행
debugAPIs();