#!/usr/bin/env node

/**
 * Fix remaining snake_case/camelCase mismatches
 */

const fs = require('fs');
const path = require('path');

// Fix specific files with known issues
const fixes = [
  {
    file: 'src/app/admin/courses/components/CourseEditor.tsx',
    replacements: [
      { from: /\.is_active/g, to: '.isActive' }
    ]
  },
  {
    file: 'src/app/(pages)/tools/youtube-lens/page.tsx', 
    replacements: [
      { from: /error_code/g, to: 'errorCode' }
    ]
  },
  {
    file: 'src/components/features/tools/youtube-lens/PopularShortsList.tsx',
    replacements: [
      { from: /errorMessage/g, to: 'error_message' }
    ]
  },
  {
    file: 'src/components/features/tools/youtube-lens/CollectionBoard.tsx',
    replacements: [
      { from: /collection_id(?!\w)/g, to: 'collectionId' }
    ]
  },
  {
    file: 'src/components/features/tools/youtube-lens/CollectionViewer.tsx',
    replacements: [
      { from: /videoId(?!\w)/g, to: 'video_id' }
    ]
  },
  {
    file: 'src/components/layout/Header.tsx',
    replacements: [
      { from: /user_role(?!\w)/g, to: 'userRole' }
    ]
  },
  {
    file: 'src/app/api/revenue-proof/route.ts',
    replacements: [
      { from: /content_type:/g, to: 'contentType:' }
    ]
  },
  {
    file: 'src/app/api/upload/route.ts',
    replacements: [
      { from: /content_type:/g, to: 'contentType:' }
    ]
  },
  {
    file: 'src/app/api/user/api-keys/route.ts',
    replacements: [
      { from: /\.api_key_masked/g, to: '.apiKeyMasked' },
      { from: /service_name(?!\w)/g, to: 'serviceName' }
    ]
  },
  {
    file: 'src/app/api/youtube/subscribe/route.ts',
    replacements: [
      { from: /channel_title:/g, to: 'channelTitle:' }
    ]
  }
];

console.log('🔧 Fixing remaining type errors...\n');

fixes.forEach(({ file, replacements }) => {
  const fullPath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  
  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${file}`);
  } else {
    console.log(`⏭️  No changes needed: ${file}`);
  }
});

console.log('\n✨ Remaining fixes complete!');
