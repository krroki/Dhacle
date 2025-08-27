#!/usr/bin/env node

/**
 * no-any-type.js - Claude Code Hook to block 'any' type usage in TypeScript
 * 
 * This validator prevents the use of 'any' type which reduces type safety.
 * It checks for various patterns where 'any' might appear.
 */

const fs = require('fs');

/**
 * Patterns to detect 'any' type usage
 * Each pattern includes the regex and a specific error message
 */
const ANY_PATTERNS = [
  {
    // Basic any type annotation
    pattern: /:\s*any(?:\s|;|,|\)|>|\]|\}|$)/g,
    message: "Explicit 'any' type annotation detected"
  },
  {
    // any in generics
    pattern: /<any(?:\s|>|,)/g,
    message: "'any' type in generic parameter"
  },
  {
    // any[] array type
    pattern: /:\s*any\[\]/g,
    message: "'any[]' array type detected"
  },
  {
    // Function return type any
    pattern: /\)\s*:\s*any(?:\s|{|$)/g,
    message: "Function returning 'any' type"
  },
  {
    // as any type assertion
    pattern: /as\s+any(?:\s|;|,|\)|$)/g,
    message: "Type assertion to 'any'"
  }
];

/**
 * Whitelist patterns that should be allowed
 */
const WHITELIST_PATTERNS = [
  // Allow if there's a @ts-expect-error comment
  /@ts-expect-error.*any/,
  // Allow if there's a specific allow-any comment
  /\/\/\s*@allow-any/,
  // Allow in .d.ts declaration files
  /\.d\.ts$/
];

/**
 * Check if the content or file should be whitelisted
 */
function isWhitelisted(content, filePath) {
  // Check file path whitelist
  if (WHITELIST_PATTERNS.some(pattern => pattern.test(filePath))) {
    return true;
  }
  
  // Check for whitelist comments in the same line
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (WHITELIST_PATTERNS.some(pattern => pattern.test(line))) {
      // If whitelist pattern found, ignore any patterns on this line
      return false; // Continue checking other lines
    }
  }
  
  return false;
}

/**
 * Find all occurrences of 'any' type in the content
 */
function findAnyTypes(content, filePath) {
  if (isWhitelisted(content, filePath)) {
    return [];
  }
  
  const violations = [];
  const lines = content.split('\n');
  
  for (const patternDef of ANY_PATTERNS) {
    const { pattern, message } = patternDef;
    // Reset regex for each use
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // Find which line this match is on
      let charCount = 0;
      let lineNumber = 0;
      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1; // +1 for newline
        if (charCount > match.index) {
          lineNumber = i + 1;
          break;
        }
      }
      
      // Check if this specific line is whitelisted
      const line = lines[lineNumber - 1];
      const hasWhitelistComment = WHITELIST_PATTERNS.some(wp => wp.test(line));
      
      if (!hasWhitelistComment) {
        violations.push({
          line: lineNumber,
          column: match.index - content.lastIndexOf('\n', match.index),
          match: match[0].trim(),
          message: message
        });
      }
    }
  }
  
  return violations;
}

/**
 * Main validation function
 */
function validateContent(input) {
  const { tool_name, tool_input } = input;
  
  // Only validate for write/edit operations
  if (!['Write', 'Edit', 'MultiEdit'].includes(tool_name)) {
    return { pass: true };
  }
  
  // Extract content and file path
  let content = '';
  let filePath = '';
  
  if (tool_name === 'Write' || tool_name === 'Edit') {
    content = tool_input.content || tool_input.new_string || '';
    filePath = tool_input.file_path || '';
  } else if (tool_name === 'MultiEdit') {
    // For MultiEdit, check all edits
    const allViolations = [];
    filePath = tool_input.file_path || '';
    
    for (const edit of (tool_input.edits || [])) {
      const editContent = edit.new_string || '';
      const violations = findAnyTypes(editContent, filePath);
      allViolations.push(...violations);
    }
    
    if (allViolations.length > 0) {
      return {
        pass: false,
        violations: allViolations,
        filePath
      };
    }
    return { pass: true };
  }
  
  // Skip non-TypeScript files and markdown files
  if (!filePath.match(/\.(ts|tsx|js|jsx)$/) || filePath.match(/\.md$/i)) {
    return { pass: true };
  }
  
  // Find any type violations
  const violations = findAnyTypes(content, filePath);
  
  if (violations.length > 0) {
    return {
      pass: false,
      violations,
      filePath
    };
  }
  
  return { pass: true };
}

/**
 * Format violations for display
 */
function formatViolations(violations, filePath) {
  const messages = violations.slice(0, 5).map(v => 
    `  Line ${v.line}: ${v.message}\n    Found: "${v.match}"`
  );
  
  let result = messages.join('\n\n');
  
  if (violations.length > 5) {
    result += `\n\n  ... and ${violations.length - 5} more violations`;
  }
  
  return result;
}

// Main execution
if (require.main === module) {
  let input;
  
  try {
    // Read input from stdin
    input = JSON.parse(fs.readFileSync(0, 'utf-8'));
  } catch (error) {
    console.error('Failed to parse input:', error.message);
    process.exit(1);
  }
  
  const result = validateContent(input);
  
  if (!result.pass) {
    const output = {
      decision: "block",
      reason: `🚫 'any' type usage detected in ${result.filePath || 'file'}

${formatViolations(result.violations, result.filePath)}

✅ Suggested fixes:
  1. Use 'unknown' instead and add proper type guards
  2. Define a specific interface or type
  3. Use generic types for better type safety
  4. If absolutely necessary, add // @allow-any comment with justification`
    };
    
    console.log(JSON.stringify(output));
    process.exit(0);
  }
  
  // Validation passed
  process.exit(0);
}

module.exports = { validateContent, findAnyTypes };