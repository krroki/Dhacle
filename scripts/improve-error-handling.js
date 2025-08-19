/**
 * Script to improve error handling in catch blocks
 * Adds proper error type checking for TypeScript
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
});

let totalImproved = 0;
const improvedFiles = [];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let improved = false;

  // Pattern 1: Basic catch (error) without type checking
  const basicCatchPattern = /catch\s*\(\s*error\s*\)\s*\{([^}]*console\.(error|log|warn)\([^)]*error\s*\))/g;
  
  content = content.replace(basicCatchPattern, (match, body) => {
    if (!body.includes('instanceof')) {
      improved = true;
      // Replace with proper error handling
      return match.replace(
        'console.error(error)',
        'console.error(error instanceof Error ? error.message : String(error))'
      ).replace(
        'console.log(error)',
        'console.log(error instanceof Error ? error.message : String(error))'
      ).replace(
        'console.warn(error)',
        'console.warn(error instanceof Error ? error.message : String(error))'
      );
    }
    return match;
  });

  // Pattern 2: catch (e) or catch (err) without type checking
  const altCatchPattern = /catch\s*\(\s*(e|err|ex)\s*\)\s*\{/g;
  
  content = content.replace(altCatchPattern, (match, varName) => {
    improved = true;
    return `catch (error) {`;
  });

  // Pattern 3: Direct error property access without type guard
  const errorAccessPattern = /catch\s*\(\s*error\s*\)\s*\{([^}]*error\.(message|stack|name)[^}]*)\}/g;
  
  content = content.replace(errorAccessPattern, (match, body) => {
    if (!body.includes('instanceof Error')) {
      improved = true;
      // Wrap error property access with type guard
      const lines = body.split('\n');
      const improvedLines = lines.map(line => {
        if (line.includes('error.message') || line.includes('error.stack') || line.includes('error.name')) {
          if (!line.includes('instanceof')) {
            return line.replace(
              /error\.(message|stack|name)/g,
              'error instanceof Error ? error.$1 : String(error)'
            );
          }
        }
        return line;
      });
      return `catch (error) {${improvedLines.join('\n')}}`;
    }
    return match;
  });

  if (improved && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalImproved++;
    improvedFiles.push(path.relative(process.cwd(), filePath));
  }
});

console.log(`\n✅ Improved error handling in ${totalImproved} files:`);
improvedFiles.forEach(file => {
  console.log(`  - ${file}`);
});

console.log('\n📋 Improvements applied:');
console.log('  - Added error instanceof checks');
console.log('  - Standardized error variable names');
console.log('  - Protected error property access');
console.log('\n💡 Run "npx tsc --noEmit" to verify no TypeScript errors');