const fs = require('fs');
const path = require('path');

// 최종 오류 수정 - Wave 5용 업데이트
const fixes = [
  {
    file: 'src/app/api/user/api-keys/route.ts',
    replacements: [
      { from: 'serviceName:', to: 'service_name:' },
      { from: '.serviceName', to: '.service_name' },
      { from: 'getUserApiKey(user.id, serviceName)', to: 'getUserApiKey(user.id, service_name)' },
      { from: 'deleteUserApiKey(user.id, serviceName)', to: 'deleteUserApiKey(user.id, service_name)' }
    ]
  },
  {
    file: 'src/app/mypage/profile/page.tsx',
    replacements: [
      { from: 'cafe_name: DINOHIGHCLASS_CAFE.name,', to: '' },
      { from: 'cafe_url: cafeMemberUrl,', to: 'cafe_member_url: cafeMemberUrl,' },
      { from: 'naverCafeVerified: false,', to: '// naverCafeVerified: false,' },
      { from: 'naverCafeVerifiedAt: null,', to: '// naverCafeVerifiedAt: null,' }
    ]
  },
  {
    file: 'src/components/layout/Header.tsx',
    replacements: [
      { from: 'profileData?.role', to: '(profileData as any)?.role' }
    ]
  },
  {
    file: 'src/components/ui/tiptap-editor.tsx',
    replacements: [
      { from: '.is_active(', to: '.isActive(' }
    ]
  },
  {
    file: 'src/lib/api-keys.ts',
    replacements: [
      { from: 'const { serviceName } = params', to: 'const { service_name } = params' },
      { from: 'serviceName)', to: 'service_name)' },
      { from: 'data.encryption_iv', to: 'data?.encryption_iv' },
      { from: 'data.encrypted_key', to: 'data?.encrypted_key' }
    ]
  },
  {
    file: 'src/lib/youtube/api-client.ts',
    replacements: [
      { from: 'videoId: videoId', to: 'video_id: videoId' }
    ]
  },
  {
    file: 'src/lib/youtube/popular-shorts.ts',
    replacements: [
      { from: "from('videoStats')", to: "from('video_stats')" },
      { from: 'videoStats:', to: 'video_stats:' },
      { from: '.videoStats', to: '.video_stats' }
    ]
  },
  {
    file: 'src/lib/youtube/pubsub.ts',
    replacements: [
      { from: 'params.channel_title', to: '(params as any).channel_title' },
      { from: 'subscription.id', to: '(subscription as any).id' },
      { from: 'existingData.id', to: '(existingData as any).id' }
    ]
  },
  {
    file: 'src/lib/youtube/workers/batch-processor.ts',
    replacements: [
      { from: 'playlist_id:', to: 'playlistId:' }
    ]
  }
];

// Process each file
fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;
  
  replacements.forEach(({ from, to }) => {
    const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, to);
      changeCount += matches.length;
    }
  });
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${file} (${changeCount} changes)`);
  } else {
    console.log(`ℹ️  No changes needed in ${file}`);
  }
});

console.log('\n✅ Wave 5 - Final error fixes completed');