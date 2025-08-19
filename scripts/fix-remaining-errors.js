/**
 * Script to fix remaining TypeScript errors
 * Fixes specific patterns that are causing issues
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

let totalFixed = 0;
const fixedFiles = [];

// 1. Fix undefined 'err' references in admin/courses/videos/page.tsx
const adminVideosFile = path.join(process.cwd(), 'src/app/admin/courses/videos/page.tsx');
if (fs.existsSync(adminVideosFile)) {
  let content = fs.readFileSync(adminVideosFile, 'utf8');
  const originalContent = content;
  
  // Replace err with error
  content = content.replace(/\berr\b(?!or)/g, 'error');
  
  if (content !== originalContent) {
    fs.writeFileSync(adminVideosFile, content, 'utf8');
    totalFixed++;
    fixedFiles.push('src/app/admin/courses/videos/page.tsx');
  }
}

// 2. Fix missing types for array reduce callbacks
const filesToCheck = [
  'src/app/admin/page.tsx',
  'src/app/api/revenue-proof/ranking/route.ts'
];

filesToCheck.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Add types to reduce callbacks
    content = content.replace(
      /\.reduce\(\s*\(\s*acc\s*,\s*proof\s*\)/g,
      '.reduce((acc: any, proof: any)'
    );
    
    content = content.replace(
      /\.reduce\(\s*\(\s*acc\s*,\s*profile\s*\)/g,
      '.reduce((acc: any, profile: any)'
    );
    
    content = content.replace(
      /\.reduce\(\s*\(\s*sum\s*,\s*p\s*\)/g,
      '.reduce((sum: number, p: any)'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      totalFixed++;
      fixedFiles.push(filePath);
    }
  }
});

// 3. Fix pubsub.ts err reference
const pubsubFile = path.join(process.cwd(), 'src/lib/youtube/pubsub.ts');
if (fs.existsSync(pubsubFile)) {
  let content = fs.readFileSync(pubsubFile, 'utf8');
  const originalContent = content;
  
  // Replace err with error  
  content = content.replace(/console\.error\('[^']+',\s*err\)/g, (match) => {
    return match.replace(', err)', ', error)');
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(pubsubFile, content, 'utf8');
    totalFixed++;
    fixedFiles.push('src/lib/youtube/pubsub.ts');
  }
}

// 4. Fix UserApiKey interface issues in api-keys route
const apiKeysRoute = path.join(process.cwd(), 'src/app/api/user/api-keys/route.ts');
if (fs.existsSync(apiKeysRoute)) {
  let content = fs.readFileSync(apiKeysRoute, 'utf8');
  const originalContent = content;
  
  // Extend UserApiKey interface to include missing properties
  if (!content.includes('lastUsedAt')) {
    content = content.replace(
      /interface UserApiKey \{([^}]+)\}/,
      (match, body) => {
        const newProperties = `
  lastUsedAt?: string | null;
  usageCount?: number;
  usageToday?: number;
  usageDate?: string;
  validationError?: string | null;`;
        return `interface UserApiKey {${body}${newProperties}
}`;
      }
    );
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(apiKeysRoute, content, 'utf8');
    totalFixed++;
    fixedFiles.push('src/app/api/user/api-keys/route.ts');
  }
}

console.log(`\n✅ Fixed ${totalFixed} files:`);
fixedFiles.forEach(file => {
  console.log(`  - ${file}`);
});

console.log('\n📋 Fixes applied:');
console.log('  - Replaced undefined err variables with error');
console.log('  - Added types to reduce() callbacks');
console.log('  - Extended UserApiKey interface');
console.log('\n💡 Run "npx tsc --noEmit" to verify fixes');