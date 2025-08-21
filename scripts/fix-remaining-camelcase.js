const fs = require('fs');
const path = require('path');
const glob = require('glob');

// camelCase → snake_case 변환 매핑
const fieldMappings = {
  // 공통 필드
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'deletedAt': 'deleted_at',
  'userId': 'user_id',
  'videoId': 'video_id',
  'channelId': 'channel_id',
  'playlistId': 'playlist_id',
  'courseId': 'course_id',
  'lessonId': 'lesson_id',
  'folderId': 'folder_id',
  'collectionId': 'collection_id',
  'ruleId': 'rule_id',
  'proofId': 'proof_id',
  
  // Profile 필드
  'displayName': 'display_name',
  'avatarUrl': 'avatar_url',
  'phoneNumber': 'phone_number',
  'firstName': 'first_name',
  'lastName': 'last_name',
  
  // API 키 필드
  'apiKey': 'api_key',
  'encryptedKey': 'encrypted_key',
  'encryptionIv': 'encryption_iv',
  'serviceName': 'service_name',
  'apiKeyMasked': 'api_key_masked',
  
  // YouTube 관련
  'videoTitle': 'video_title',
  'channelTitle': 'channel_title',
  'thumbnailUrl': 'thumbnail_url',
  'publishedAt': 'published_at',
  'viewCount': 'view_count',
  'likeCount': 'like_count',
  'commentCount': 'comment_count',
  'subscriberCount': 'subscriber_count',
  
  // 기타 필드
  'isActive': 'is_active',
  'isPublic': 'is_public',
  'isHidden': 'is_hidden',
  'isRead': 'is_read',
  'isResolved': 'is_resolved',
  'errorCode': 'error_code',
  'accessToken': 'access_token',
  'refreshToken': 'refresh_token',
  'likesCount': 'likes_count',
  'commentsCount': 'comments_count',
};

// TSX/TS 파일에서 필드 사용 패턴 수정
function fixCamelCaseFields(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const changes = [];
  
  for (const [camel, snake] of Object.entries(fieldMappings)) {
    // 객체 속성 접근 패턴 수정 (예: user.userId → user.user_id)
    const propertyPattern = new RegExp(`\\.${camel}(?![a-zA-Z])`, 'g');
    const propertyMatches = content.match(propertyPattern);
    if (propertyMatches) {
      content = content.replace(propertyPattern, `.${snake}`);
      changes.push(`  .${camel} → .${snake} (${propertyMatches.length}개)`);
      modified = true;
    }
    
    // 구조 분해 할당 패턴 수정 (예: { userId } → { user_id })
    const destructurePattern = new RegExp(`([{,]\\s*)${camel}(\\s*[,}:])`, 'g');
    const destructureMatches = content.match(destructurePattern);
    if (destructureMatches) {
      content = content.replace(destructurePattern, `$1${snake}$2`);
      changes.push(`  {${camel}} → {${snake}} (${destructureMatches.length}개)`);
      modified = true;
    }
    
    // 객체 키 패턴 수정 (예: { userId: value } → { user_id: value })
    const objectKeyPattern = new RegExp(`(\\s+)${camel}:`, 'g');
    const objectKeyMatches = content.match(objectKeyPattern);
    if (objectKeyMatches) {
      content = content.replace(objectKeyPattern, `$1${snake}:`);
      changes.push(`  ${camel}: → ${snake}: (${objectKeyMatches.length}개)`);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    changes.forEach(change => console.log(change));
    return true;
  }
  return false;
}

// 실행
console.log('🔍 Searching for remaining camelCase fields...\n');

const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: [
    'src/types/database.generated.ts',
    'src/**/*.test.{ts,tsx}',
    'src/**/*.spec.{ts,tsx}',
    'node_modules/**',
    '**/node_modules/**',
    'src/**/*.backup'
  ]
});

console.log(`📊 총 ${files.length}개 파일 검사 중...\n`);

let fixedCount = 0;
files.forEach(file => {
  if (fixCamelCaseFields(file)) {
    fixedCount++;
    console.log(''); // 간격 추가
  }
});

console.log(`\n✅ 총 ${fixedCount}개 파일 수정 완료`);
console.log(`📊 검사한 파일: ${files.length}개`);