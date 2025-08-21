#!/usr/bin/env node

/**
 * Fix display_name to displayName for React components
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/components/ui/*.tsx');

console.log(`Found ${files.length} UI component files to check`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Replace display_name with displayName
  content = content.replace(/\.display_name/g, '.displayName');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log('✨ display_name fixes complete!');