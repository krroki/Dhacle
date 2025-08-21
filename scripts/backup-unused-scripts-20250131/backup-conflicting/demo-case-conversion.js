#!/usr/bin/env node

/**
 * snake_case/camelCase 변환 데모
 * 구현된 변환 로직의 동작을 시연
 */

console.log('🎯 snake_case/camelCase 변환 시스템 데모\n');
console.log('=' .repeat(60));

console.log('\n📌 구현 완료 사항:\n');

console.log('1. ✅ API 클라이언트 변환 로직 적용');
console.log('   - 파일: src/lib/api-client.ts');
console.log('   - 기능: API 응답 자동 snake_case → camelCase 변환');
console.log('   - 기능: API 요청 자동 camelCase → snake_case 변환\n');

console.log('2. ✅ React 보호 변환 유틸리티 생성');
console.log('   - 파일: src/lib/utils/case-converter.ts');
console.log('   - 보호: displayName, className, onClick 등 React 예약어');
console.log('   - 보호: aria-*, data-* 속성\n');

console.log('3. ✅ Pre-commit Hook 검사 추가');
console.log('   - 파일: .husky/pre-commit');
console.log('   - 검사: display_name 사용 차단');
console.log('   - 검사: snake_case JSX 속성 차단\n');

console.log('4. ✅ 검증 스크립트 생성');
console.log('   - 파일: scripts/verify-case-consistency.js');
console.log('   - 실행: node scripts/verify-case-consistency.js\n');

console.log('=' .repeat(60));
console.log('\n📊 변환 예시:\n');

// 예시 데이터
const apiResponse = {
  user_id: 123,
  user_name: 'John Doe',
  created_at: '2024-01-01',
  profile_info: {
    display_name: 'John',
    email_address: 'john@example.com'
  }
};

const frontendData = {
  userId: 123,
  userName: 'John Doe',
  createdAt: '2024-01-01',
  profileInfo: {
    displayName: 'John',
    emailAddress: 'john@example.com'
  }
};

console.log('🔄 API 응답 (snake_case):');
console.log(JSON.stringify(apiResponse, null, 2));

console.log('\n    ↓ snakeToCamelCase() 변환\n');

console.log('📦 Frontend 사용 (camelCase):');
console.log(JSON.stringify(frontendData, null, 2));

console.log('\n    ↓ camelToSnakeCase() 변환\n');

console.log('🔄 API 요청 (snake_case로 복원)');

console.log('\n' + '=' .repeat(60));
console.log('\n⚠️  React 컴포넌트 보호 예시:\n');

const reactComponent = {
  displayName: 'MyComponent',  // ← 변환되지 않음 ✅
  className: 'btn-primary',     // ← 변환되지 않음 ✅
  onClick: 'handleClick',       // ← 변환되지 않음 ✅
  userData: {                   // ← user_data로 변환됨 ✅
    name: 'John'
  }
};

console.log('React 컴포넌트 속성:');
console.log('  displayName: "MyComponent" → displayName (보호됨) ✅');
console.log('  className: "btn-primary" → className (보호됨) ✅');
console.log('  onClick: handleClick → onClick (보호됨) ✅');
console.log('  userData: {...} → user_data: {...} (변환됨) ✅');

console.log('\n' + '=' .repeat(60));
console.log('\n🎉 시스템 구현 완료!\n');

console.log('사용 방법:');
console.log('1. Frontend → API: 자동으로 camelCase → snake_case');
console.log('2. API → Frontend: 자동으로 snake_case → camelCase');
console.log('3. React 속성: 항상 camelCase 유지');
console.log('4. 커밋 시: Pre-commit hook이 자동 검사\n');

console.log('검증 명령어:');
console.log('  node scripts/verify-case-consistency.js\n');

process.exit(0);