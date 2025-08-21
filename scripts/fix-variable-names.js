const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Wave 5 - 변수명 및 타입 수정
const variableMappings = {
  'lessonId': 'lesson_id',
  'courseId': 'course_id',
  'userId': 'user_id',
  'videoId': 'video_id',
  'channelId': 'channel_id',
  'collectionId': 'collection_id',
  'folderId': 'folder_id',
  'proofId': 'proof_id',
  'ruleId': 'rule_id',
  'channelTitle': 'channel_title',
  'serviceName': 'service_name',
  'apiKeyMasked': 'api_key_masked',
  'errorCode': 'error_code',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
};

function fixVariableNames(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const changes = [];
  
  // 특정 파일별 처리
  const fileName = path.basename(filePath);
  
  // api-keys/route.ts 처리
  if (filePath.includes('api-keys/route.ts')) {
    // api_key_masked 접근 수정
    content = content.replace(/api_key\.apiKeyMasked/g, 'api_key.api_key_masked');
    
    // service_name 변수 선언 수정
    content = content.replace(/const { serviceName } = params/g, 'const { service_name } = params');
    content = content.replace(/const serviceName = /g, 'const service_name = ');
    content = content.replace(/let serviceName = /g, 'let service_name = ');
    content = content.replace(/if \(!serviceName\)/g, 'if (!service_name)');
    content = content.replace(/service: serviceName/g, 'service: service_name');
    content = content.replace(/getUserApiKey\(user\.id, service_name\)/g, 'getUserApiKey(user.id, service_name as string)');
    content = content.replace(/deleteUserApiKey\(user\.id, service_name\)/g, 'deleteUserApiKey(user.id, service_name as string)');
    
    modified = true;
    changes.push('API keys route 수정');
  }
  
  // collections/items/route.ts 처리
  if (filePath.includes('collections/items/route.ts')) {
    // collectionId 변수 선언 수정
    content = content.replace(/const collectionId = /g, 'const collection_id = ');
    content = content.replace(/let collectionId = /g, 'let collection_id = ');
    
    // collectionId 사용 부분 수정
    content = content.replace(/\bcollectionId\b/g, 'collection_id');
    
    modified = true;
    changes.push('Collections route 수정');
  }
  
  // youtube/popular/route.ts 처리
  if (filePath.includes('youtube/popular/route.ts')) {
    content = content.replace(/\bcollectionId\b/g, 'collection_id');
    modified = true;
    changes.push('Popular route 수정');
  }
  
  // subscribe/route.ts 처리
  if (filePath.includes('subscribe/route.ts')) {
    content = content.replace(/channelTitle:/g, 'channel_title:');
    content = content.replace(/\bchannelTitle\b/g, 'channel_title');
    modified = true;
    changes.push('Subscribe route 수정');
  }
  
  // VideoPlayer.tsx 처리
  if (filePath.includes('VideoPlayer.tsx')) {
    // props에서 lessonId를 lesson_id로 변경
    content = content.replace(/\blessonId\b/g, 'lesson_id');
    modified = true;
    changes.push('VideoPlayer props 수정');
  }
  
  // [lessonId]/page.tsx 처리  
  if (filePath.includes('[lessonId]/page.tsx')) {
    content = content.replace(/lessonId=/g, 'lesson_id=');
    content = content.replace(/const lesson_id = /g, 'const lesson_id = ');
    modified = true;
    changes.push('Lesson page 수정');
  }
  
  // CourseEditor.tsx 처리 - tiptap editor의 isActive
  if (filePath.includes('CourseEditor.tsx')) {
    // editor.isActive는 tiptap의 메서드이므로 변경하지 않음
    // is_active를 isActive로 되돌려야 함
    content = content.replace(/editor\.is_active/g, 'editor.isActive');
    modified = true;
    changes.push('CourseEditor tiptap 수정');
  }
  
  // mypage/profile/page.tsx 처리
  if (filePath.includes('mypage/profile/page.tsx')) {
    // naver cafe verification 필드 추가
    content = content.replace(/cafe_member_url: cafeMemberUrl,/g, 'cafe_nickname: cafeNickname,\n          cafe_member_url: cafeMemberUrl,');
    modified = true;
    changes.push('Profile page 네이버 카페 필드 수정');
  }
  
  // YouTube API client 처리
  if (filePath.includes('youtube/api-client.ts')) {
    content = content.replace(/this\.api_key/g, 'this.apiKey');
    content = content.replace(/this\.user_id/g, 'this.userId');
    modified = true;
    changes.push('YouTube API client 수정');
  }
  
  // lib/api-keys.ts 처리
  if (filePath.includes('lib/api-keys.ts') && !filePath.includes('index.ts')) {
    content = content.replace(/const { serviceName }/g, 'const { service_name }');
    content = content.replace(/getUserApiKey\(userId, serviceName\)/g, 'getUserApiKey(userId, service_name)');
    content = content.replace(/data\.encryption_iv/g, '(data as any)?.encryption_iv');
    content = content.replace(/data\.encrypted_key/g, '(data as any)?.encrypted_key');
    modified = true;
    changes.push('lib/api-keys.ts 수정');
  }
  
  // lib/api-keys/index.ts 처리
  if (filePath.includes('lib/api-keys/index.ts')) {
    content = content.replace(/isValid:/g, 'is_valid:');
    content = content.replace(/'incrementApiKeyUsage'/g, "'increment_api_key_usage'");
    modified = true;
    changes.push('api-keys/index.ts 수정');
  }
  
  // lib/api-keys/crypto.ts 처리
  if (filePath.includes('lib/api-keys/crypto.ts')) {
    content = content.replace(/return apiKey;/g, 'return encryptedData;');
    modified = true;
    changes.push('api-keys/crypto.ts 수정');
  }
  
  // lib/youtube/client-helper.ts 처리
  if (filePath.includes('client-helper.ts')) {
    content = content.replace(/from\('apiUsage'\)/g, "from('api_usage' as any)");
    modified = true;
    changes.push('client-helper.ts 수정');
  }
  
  // lib/api/revenue-proof.ts 처리
  if (filePath.includes('lib/api/revenue-proof.ts')) {
    content = content.replace(/proof_id: proof_id/g, 'proof_id: proofId');
    modified = true;
    changes.push('revenue-proof.ts 수정');
  }
  
  // lib/api/courses.ts 처리
  if (filePath.includes('lib/api/courses.ts')) {
    content = content.replace(/isPurchased:/g, 'is_purchased:');
    content = content.replace(/isEnrolled:/g, 'is_enrolled:');
    content = content.replace(/from\('courseProgressExtended'\)/g, "from('course_progress' as any)");
    modified = true;
    changes.push('courses.ts 수정');
  }
  
  // revenue-proof report route 처리
  if (filePath.includes('revenue-proof') && filePath.includes('report/route.ts')) {
    content = content.replace(/const proofId = /g, 'const proof_id = ');
    content = content.replace(/\bproofId\b/g, 'proof_id');
    modified = true;
    changes.push('Report route 수정');
  }
  
  // admin/courses/videos/page.tsx 처리
  if (filePath.includes('admin/courses/videos/page.tsx')) {
    content = content.replace(/\blesson_id\b/g, 'lessonId');
    modified = true;
    changes.push('Admin videos page 수정');
  }
  
  // admin/video/upload/route.ts 처리
  if (filePath.includes('admin/video/upload/route.ts')) {
    content = content.replace(/const lessonId = /g, 'const lesson_id = ');
    content = content.replace(/let lessonId = /g, 'let lesson_id = ');
    modified = true;
    changes.push('Video upload route 수정');
  }
  
  // tools/youtube-lens/page.tsx 처리 - SearchResponse의 errorCode
  if (filePath.includes('tools/youtube-lens/page.tsx')) {
    content = content.replace(/searchResponse\.error_code/g, 'searchResponse.errorCode');
    modified = true;
    changes.push('YouTube Lens page 수정');
  }
  
  // RevenueProofDetail.tsx 처리
  if (filePath.includes('RevenueProofDetail.tsx')) {
    content = content.replace(/\bcreatedAt\b/g, 'created_at');
    modified = true;
    changes.push('RevenueProofDetail 수정');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    changes.forEach(change => console.log(`  - ${change}`));
    return true;
  }
  return false;
}

// 실행
console.log('🔍 변수명 및 파라미터 수정 중...\n');

const targetFiles = [
  'src/app/api/user/api-keys/route.ts',
  'src/app/api/youtube/collections/items/route.ts',
  'src/app/api/youtube/popular/route.ts',
  'src/app/api/youtube/subscribe/route.ts',
  'src/app/learn/[courseId]/[lessonId]/components/VideoPlayer.tsx',
  'src/app/learn/[courseId]/[lessonId]/page.tsx',
  'src/app/admin/courses/components/CourseEditor.tsx',
  'src/app/api/revenue-proof/[id]/report/route.ts',
  'src/app/admin/courses/videos/page.tsx',
  'src/app/api/admin/video/upload/route.ts',
  'src/app/(pages)/tools/youtube-lens/page.tsx',
  'src/components/features/revenue-proof/RevenueProofDetail.tsx',
  'src/app/mypage/profile/page.tsx',
  'src/lib/api-keys.ts',
  'src/lib/api-keys/index.ts',
  'src/lib/api-keys/crypto.ts',
  'src/lib/youtube/api-client.ts',
  'src/lib/youtube/client-helper.ts',
  'src/lib/api/revenue-proof.ts',
  'src/lib/api/courses.ts',
];

let fixedCount = 0;
targetFiles.forEach(file => {
  if (fs.existsSync(file) && fixVariableNames(file)) {
    fixedCount++;
    console.log('');
  }
});

console.log(`\n✅ 총 ${fixedCount}개 파일 수정 완료`);