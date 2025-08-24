const fs = require('fs');
const { execSync } = require('child_process');

const metrics = {
  timestamp: new Date().toISOString(),
  typeErrors: 0,
  consoleLogCount: 0,
  anyTypeCount: 0,
  fetchDirectCount: 0,
  buildTime: 0,
  testCoverage: 0
};

console.log('📊 베이스라인 메트릭 측정 시작...\n');

try {
  // 타입 에러
  console.log('🔍 타입 에러 확인 중...');
  try {
    const typeCheck = execSync('npm run types:check 2>&1', { encoding: 'utf8' });
    metrics.typeErrors = (typeCheck.match(/error TS/g) || []).length;
  } catch (e) {
    metrics.typeErrors = (e.stdout.match(/error TS/g) || []).length;
  }
  console.log(`✅ 타입 에러: ${metrics.typeErrors}개\n`);
} catch (e) {
  console.log('⚠️ 타입 체크 실패\n');
}

try {
  // 콘솔 로그
  console.log('🔍 console.log 사용 확인 중...');
  const consoleLog = execSync('grep -r "console.log" src --include="*.ts" --include="*.tsx" | wc -l', { encoding: 'utf8', shell: true });
  metrics.consoleLogCount = parseInt(consoleLog.trim());
  console.log(`✅ console.log: ${metrics.consoleLogCount}개\n`);
} catch (e) {
  console.log('⚠️ console.log 카운트 실패\n');
}

try {
  // any 타입
  console.log('🔍 any 타입 사용 확인 중...');
  const anyType = execSync('grep -r ": any" src --include="*.ts" --include="*.tsx" | wc -l', { encoding: 'utf8', shell: true });
  metrics.anyTypeCount = parseInt(anyType.trim());
  console.log(`✅ any 타입: ${metrics.anyTypeCount}개\n`);
} catch (e) {
  console.log('⚠️ any 타입 카운트 실패\n');
}

try {
  // fetch 직접 사용
  console.log('🔍 직접 fetch 사용 확인 중...');
  const fetchDirect = execSync('grep -r "fetch(" src --include="*.ts" --include="*.tsx" | wc -l', { encoding: 'utf8', shell: true });
  metrics.fetchDirectCount = parseInt(fetchDirect.trim());
  console.log(`✅ 직접 fetch: ${metrics.fetchDirectCount}개\n`);
} catch (e) {
  console.log('⚠️ fetch 카운트 실패\n');
}

// 빌드 시간 측정 (선택적)
console.log('🔍 빌드 시간 측정 중 (약 2-3분 소요)...');
try {
  const startTime = Date.now();
  execSync('npm run build > /dev/null 2>&1', { encoding: 'utf8' });
  metrics.buildTime = Math.round((Date.now() - startTime) / 1000);
  console.log(`✅ 빌드 시간: ${metrics.buildTime}초\n`);
} catch (e) {
  console.log('⚠️ 빌드 시간 측정 실패 (빌드 에러 가능성)\n');
  metrics.buildTime = -1;
}

// 결과 저장
fs.writeFileSync('baseline-metrics.json', JSON.stringify(metrics, null, 2));

console.log('\n========================================');
console.log('📊 베이스라인 메트릭 측정 완료!');
console.log('========================================\n');
console.log('📈 측정 결과:');
console.log(`- 타입 에러: ${metrics.typeErrors}개`);
console.log(`- console.log: ${metrics.consoleLogCount}개`);
console.log(`- any 타입: ${metrics.anyTypeCount}개`);
console.log(`- 직접 fetch: ${metrics.fetchDirectCount}개`);
console.log(`- 빌드 시간: ${metrics.buildTime > 0 ? metrics.buildTime + '초' : '측정 실패'}`);
console.log('\n✅ baseline-metrics.json 파일에 저장되었습니다.');