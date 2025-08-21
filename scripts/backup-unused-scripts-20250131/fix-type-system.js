#!/usr/bin/env node
/**
 * TypeScript 타입 시스템 자동 수정 스크립트
 * snake_case/camelCase 충돌 문제를 근본적으로 해결
 * 
 * 실행: node scripts/fix-type-system.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 TypeScript 타입 시스템 수정 시작...\n');
console.log('📋 근본 원인 해결을 위한 자동 수정 진행\n');

let fixCount = 0;
let errorCount = 0;

// 유틸리티 함수
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`❌ 파일 읽기 실패: ${filePath}`);
    console.error(`   ${error.message}`);
    errorCount++;
    return null;
  }
}

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ 수정 완료: ${path.basename(filePath)}`);
    fixCount++;
    return true;
  } catch (error) {
    console.error(`❌ 파일 쓰기 실패: ${filePath}`);
    console.error(`   ${error.message}`);
    errorCount++;
    return false;
  }
}

// Step 1: api-keys/index.ts에서 중복 UserApiKey interface 제거
console.log('📌 Step 1: 중복 타입 정의 제거...');
const apiKeysPath = path.join(__dirname, '../src/lib/api-keys/index.ts');
let apiKeysContent = readFile(apiKeysPath);

if (apiKeysContent) {
  // UserApiKey interface 전체 제거 (멀티라인)
  const interfaceRegex = /export interface UserApiKey\s*\{[\s\S]*?\n\}\n/;
  if (interfaceRegex.test(apiKeysContent)) {
    apiKeysContent = apiKeysContent.replace(interfaceRegex, '');
    console.log('   - UserApiKey interface 제거');
    
    // import 문이 없다면 추가
    if (!apiKeysContent.includes("from '@/types'")) {
      // 다른 import 문 찾기
      const importMatch = apiKeysContent.match(/import[\s\S]*?from[\s\S]*?;/);
      if (importMatch) {
        // 첫 번째 import 문 뒤에 추가
        const firstImportEnd = importMatch.index + importMatch[0].length;
        apiKeysContent = 
          apiKeysContent.slice(0, firstImportEnd) + 
          "\nimport type { UserApiKey } from '@/types';" +
          apiKeysContent.slice(firstImportEnd);
      } else {
        // import 문이 없으면 최상단에 추가
        apiKeysContent = "import type { UserApiKey } from '@/types';\n" + apiKeysContent;
      }
      console.log('   - UserApiKey import 추가');
    }
    
    writeFile(apiKeysPath, apiKeysContent);
  } else {
    console.log('   - UserApiKey interface가 이미 제거됨');
  }
}

// Step 2: API Routes에서 snake_case 일관성 확보
console.log('\n📌 Step 2: API Route snake_case 통일...');

const apiRouteFixes = [
  {
    file: 'src/app/api/user/api-keys/route.ts',
    description: 'user/api-keys route',
    replacements: [
      // safeApiKey 객체 내의 camelCase를 snake_case로 변경
      { from: /api_key_masked: api_key\.apiKeyMasked/g, to: 'api_key_masked: api_key.api_key_masked' },
      { from: /service_name: api_key\.serviceName/g, to: 'service_name: api_key.service_name' },
      { from: /lastUsedAt: api_key\.lastUsedAt/g, to: 'last_used_at: api_key.last_used_at' },
      { from: /usageCount: api_key\.usageCount/g, to: 'usage_count: api_key.usage_count' },
      { from: /usageToday: api_key\.usageToday/g, to: 'usage_today: api_key.usage_today' },
      { from: /usageDate: api_key\.usageDate/g, to: 'usage_date: api_key.usage_date' },
      { from: /isValid: api_key\.isValid/g, to: 'is_valid: api_key.is_valid' },
      { from: /validationError: api_key\.validationError/g, to: 'validation_error: api_key.validation_error' },
      
      // savedKey 객체 내의 camelCase를 snake_case로 변경
      { from: /api_key_masked: savedKey\.apiKeyMasked/g, to: 'api_key_masked: savedKey.api_key_masked' },
      { from: /isValid: savedKey\.isValid/g, to: 'is_valid: savedKey.is_valid' },
    ]
  }
];

apiRouteFixes.forEach(({ file, description, replacements }) => {
  const filePath = path.join(__dirname, '..', file);
  let content = readFile(filePath);
  
  if (content) {
    console.log(`   - ${description} 수정 중...`);
    let changeCount = 0;
    
    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        changeCount++;
      }
    });
    
    if (changeCount > 0) {
      writeFile(filePath, content);
      console.log(`     → ${changeCount}개 항목 수정`);
    } else {
      console.log(`     → 이미 수정됨 또는 수정 불필요`);
    }
  }
});

// Step 3: Profile 페이지 snake_case 변환 추가
console.log('\n📌 Step 3: Frontend 컴포넌트 변환 적용...');

const profilePath = path.join(__dirname, '../src/app/mypage/profile/page.tsx');
let profileContent = readFile(profilePath);

if (profileContent) {
  // snakeToCamelCase import 확인 및 추가
  if (!profileContent.includes('snakeToCamelCase')) {
    // createBrowserClient import 찾기
    const supabaseImportRegex = /import\s*\{[^}]*createBrowserClient[^}]*\}\s*from\s*['"]@\/lib\/supabase\/browser-client['"]/;
    const match = profileContent.match(supabaseImportRegex);
    
    if (match) {
      const importEnd = match.index + match[0].length;
      profileContent = 
        profileContent.slice(0, importEnd) + 
        ";\nimport { snakeToCamelCase } from '@/lib/utils/case-converter';" +
        profileContent.slice(importEnd);
      console.log('   - snakeToCamelCase import 추가');
    }
  }
  
  // setProfile(data) → setProfile(snakeToCamelCase(data)) 변경
  const setProfileRegex = /setProfile\(data\)/g;
  if (setProfileRegex.test(profileContent)) {
    profileContent = profileContent.replace(setProfileRegex, 'setProfile(snakeToCamelCase(data))');
    console.log('   - Profile 데이터 변환 적용');
    writeFile(profilePath, profileContent);
  } else {
    console.log('   - 이미 변환 적용됨 또는 해당 코드 없음');
  }
}

// Step 4: 타입 일관성 검증
console.log('\n📌 Step 4: 타입 검증...');

// types/index.ts 확인
const typesIndexPath = path.join(__dirname, '../src/types/index.ts');
const typesContent = readFile(typesIndexPath);

if (typesContent) {
  // UserApiKey가 DB 타입으로 export되는지 확인
  if (typesContent.includes('export type UserApiKey = DBUserApiKey')) {
    console.log('   ✅ UserApiKey 타입 정의 정상');
  } else {
    console.log('   ⚠️  UserApiKey 타입 정의 확인 필요');
  }
  
  // 변환 함수 export 확인
  if (typesContent.includes('snakeToCamelCase') && typesContent.includes('camelToSnakeCase')) {
    console.log('   ✅ 변환 함수 export 정상');
  } else {
    console.log('   ⚠️  변환 함수 export 확인 필요');
  }
}

// 최종 결과 출력
console.log('\n' + '='.repeat(50));
console.log('📊 수정 결과:');
console.log(`   ✅ 성공: ${fixCount}개 파일`);
if (errorCount > 0) {
  console.log(`   ❌ 실패: ${errorCount}개 파일`);
}
console.log('='.repeat(50));

if (errorCount === 0) {
  console.log('\n🎉 타입 시스템 수정 완료!');
  console.log('\n👉 다음 단계:');
  console.log('   1. npm run types:generate  (타입 재생성)');
  console.log('   2. npm run build          (빌드 테스트)');
  console.log('   3. npm run verify:types   (타입 검증)');
} else {
  console.log('\n⚠️  일부 오류가 발생했습니다. 로그를 확인하세요.');
  process.exit(1);
}