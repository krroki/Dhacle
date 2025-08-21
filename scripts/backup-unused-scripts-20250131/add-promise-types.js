/**
 * Script to add Promise return types to async functions
 * Improves TypeScript type safety
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/types/**']
});

let totalImproved = 0;
const improvedFiles = [];
const skippedFiles = [];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let improved = false;

  // Skip test files and type definition files
  if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('.d.ts')) {
    return;
  }

  // Pattern: async function without explicit Promise return type
  // Match: export async function name(params) {
  const exportAsyncPattern = /export\s+async\s+function\s+(\w+)\s*\([^)]*\)\s*(?!:\s*Promise)[{:]/g;
  
  // Collect all matches first
  const matches = [];
  let match;
  while ((match = exportAsyncPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      fullMatch: match[0],
      functionName: match[1]
    });
  }

  // Process matches in reverse order to maintain indices
  matches.reverse().forEach(m => {
    // Try to infer return type from the function body
    const functionStart = m.index;
    const functionBody = content.substring(functionStart, functionStart + 2000); // Look ahead 2000 chars
    
    let returnType = 'Promise<void>';
    
    // Check for return statements
    if (functionBody.includes('return NextResponse.json')) {
      returnType = 'Promise<NextResponse>';
    } else if (functionBody.includes('return Response.json')) {
      returnType = 'Promise<Response>';
    } else if (functionBody.includes('return true') || functionBody.includes('return false')) {
      returnType = 'Promise<boolean>';
    } else if (functionBody.includes('return null')) {
      returnType = 'Promise<null>';
    } else if (functionBody.includes('return {')) {
      returnType = 'Promise<unknown>'; // Could be improved with better analysis
    } else if (functionBody.includes('return data')) {
      returnType = 'Promise<unknown>'; // Could be improved with better analysis
    }

    // Replace the function signature
    const newSignature = m.fullMatch.replace(
      /(\s*)\s*(?!:\s*Promise)[{:]/,
      `: ${returnType} {`
    );
    
    if (newSignature !== m.fullMatch) {
      content = content.substring(0, m.index) + newSignature + content.substring(m.index + m.fullMatch.length);
      improved = true;
    }
  });

  // Pattern: Async arrow functions in interfaces/types
  const asyncArrowPattern = /(\w+):\s*\([^)]*\)\s*=>\s*Promise<[^>]+>/g;
  // This pattern is already correct, so we skip it

  // Pattern: Class methods
  const classAsyncPattern = /^\s*(public|private|protected)?\s*async\s+(\w+)\s*\([^)]*\)\s*(?!:\s*Promise)[{:]/gm;
  
  content = content.replace(classAsyncPattern, (match, visibility, methodName) => {
    if (!match.includes(': Promise')) {
      improved = true;
      const vis = visibility ? visibility + ' ' : '';
      return match.replace(
        /async\s+(\w+)\s*\([^)]*\)\s*/,
        `async ${methodName}$&: Promise<void> `
      );
    }
    return match;
  });

  if (improved && content !== originalContent) {
    // Basic validation - ensure we didn't break the syntax
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    
    if (openBraces === closeBraces) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalImproved++;
      improvedFiles.push(path.relative(process.cwd(), filePath));
    } else {
      skippedFiles.push(path.relative(process.cwd(), filePath));
      console.warn(`⚠️ Skipped ${path.relative(process.cwd(), filePath)} - syntax validation failed`);
    }
  }
});

console.log(`\n✅ Added Promise return types to ${totalImproved} files:`);
if (improvedFiles.length > 0) {
  improvedFiles.slice(0, 10).forEach(file => {
    console.log(`  - ${file}`);
  });
  if (improvedFiles.length > 10) {
    console.log(`  ... and ${improvedFiles.length - 10} more files`);
  }
}

if (skippedFiles.length > 0) {
  console.log(`\n⚠️ Skipped ${skippedFiles.length} files due to syntax concerns`);
}

console.log('\n📋 Improvements applied:');
console.log('  - Added Promise<NextResponse> for API routes');
console.log('  - Added Promise<boolean> for boolean returns');
console.log('  - Added Promise<void> for void functions');
console.log('  - Added Promise<unknown> for complex returns');
console.log('\n💡 Run "npx tsc --noEmit" to verify no TypeScript errors');