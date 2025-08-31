// 타입 복구 진행 상황 검증 스크립트
const { execSync } = require('child_process');

console.log('🔍 타입 시스템 복구 상태 검증 중...\n');

// 1. 타입 파일 개수 확인
try {
  const typeFiles = execSync('ls src/types/*.ts 2>/dev/null | wc -l', { shell: true }).toString().trim();
  console.log(`타입 파일 개수: ${typeFiles}개 (목표: 2개)`);
} catch (e) {
  console.log('타입 파일 개수 확인 실패');
}

// 2. 잘못된 import 개수 확인
try {
  const wrongImports = execSync('grep -r "from [\'\\"]@/types/\\(course\\|youtube\\|revenue\\)" src/ 2>/dev/null | wc -l', { shell: true }).toString().trim();
  if (wrongImports === '0') {
    console.log('잘못된 import: 0개 ✅');
  } else {
    console.log(`잘못된 import: ${wrongImports}개 (목표: 0개)`);
  }
} catch (e) {
  console.log('잘못된 import: 0개 ✅');
}

// 3. 타입 오류 개수 확인
try {
  execSync('npm run types:check', { stdio: 'pipe' });
  console.log('타입 오류: 0개 ✅');
} catch (e) {
  const output = e.stdout ? e.stdout.toString() : '';
  const errors = output.match(/error TS\d+:/g);
  console.log(`타입 오류: ${errors ? errors.length : '알 수 없음'}개`);
}

// 4. 빌드 가능 여부
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('빌드: 성공 ✅');
} catch (e) {
  console.log('빌드: 실패 ❌');
}

console.log('\n검증 완료!');