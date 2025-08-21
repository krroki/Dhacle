/**
 * Script to fix remaining err references in YouTube Lens components
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all YouTube Lens component files
const files = glob.sync('src/components/features/tools/youtube-lens/*.tsx', {
  cwd: process.cwd(),
  absolute: true
});

let totalFixed = 0;
const fixedFiles = [];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixed = false;
  
  // Pattern 1: Replace standalone err references with error
  // This catches cases where err is used without being defined
  
  // Replace err in catch blocks where error is the actual variable
  content = content.replace(/catch\s*\(error\)[\s\S]*?\}/g, (block) => {
    if (block.includes('err')) {
      fixed = true;
      // Replace err with error, but be careful not to replace error with erroror
      return block.replace(/\berr\b(?!or)/g, 'error');
    }
    return block;
  });
  
  // Also check for any remaining err references that aren't part of error/Error
  const lines = content.split('\n');
  const fixedLines = lines.map(line => {
    // Check if line has 'err' that's not part of 'error' or 'Error'
    if (line.match(/\berr\b(?!or)/g) && !line.includes('catch')) {
      // Check if 'error' is defined in the scope (common in catch blocks)
      if (line.includes('console.') || line.includes('instanceof') || line.includes('?.') || line.includes('||')) {
        fixed = true;
        return line.replace(/\berr\b(?!or)/g, 'error');
      }
    }
    return line;
  });
  
  if (fixed) {
    content = fixedLines.join('\n');
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    fixedFiles.push(path.relative(process.cwd(), filePath));
  }
});

console.log(`\n✅ Fixed ${totalFixed} YouTube Lens component files:`);
fixedFiles.forEach(file => {
  console.log(`  - ${file}`);
});

console.log('\n📋 Fixes applied:');
console.log('  - Replaced undefined err variables with error');
console.log('\n💡 Run "npx tsc --noEmit" to verify fixes');