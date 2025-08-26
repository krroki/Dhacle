#!/usr/bin/env node

/**
 * no-empty-catch.js - Claude Code Hook to detect empty catch blocks
 * 
 * This validator prevents silent failures by detecting catch blocks that
 * don't properly handle or log errors.
 */

const fs = require('fs');

/**
 * Patterns to detect various forms of empty catch blocks
 */
const EMPTY_CATCH_PATTERNS = [
  {
    // Classic empty catch block: catch (e) { }
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    type: 'completely-empty',
    message: 'Completely empty catch block'
  },
  {
    // Catch with only whitespace/comments: catch (e) { /* comment */ }
    pattern: /catch\s*\([^)]*\)\s*\{\s*(?:\/\/[^\n]*\n?\s*|\/\*[\s\S]*?\*\/\s*)*\}/g,
    type: 'only-comments',
    message: 'Catch block contains only comments'
  },
  {
    // Catch that only has a return: catch (e) { return; }
    pattern: /catch\s*\([^)]*\)\s*\{\s*return(?:\s+[^;]+)?;\s*\}/g,
    type: 'only-return',
    message: 'Catch block only returns without handling error'
  },
  {
    // Catch that only continues: catch (e) { continue; }
    pattern: /catch\s*\([^)]*\)\s*\{\s*continue;\s*\}/g,
    type: 'only-continue',
    message: 'Catch block only continues without handling error'
  },
  {
    // Catch that only breaks: catch (e) { break; }
    pattern: /catch\s*\([^)]*\)\s*\{\s*break;\s*\}/g,
    type: 'only-break',
    message: 'Catch block only breaks without handling error'
  }
];

/**
 * Patterns that indicate proper error handling
 */
const PROPER_HANDLING_PATTERNS = [
  /console\.(log|warn|error|debug)/,  // Logging
  /logger\./,                         // Logger usage
  /throw/,                            // Re-throwing
  /return\s+.*Error/,                 // Returning error
  /\.report/,                         // Error reporting
  /\.track/,                          // Error tracking
  /sentry/i,                          // Sentry integration
  /bugsnag/i,                         // Bugsnag integration
  /setState/,                         // React error state
  /dispatch/,                         // Redux/state management
  /alert\(/,                          // User notification
  /notify/i,                          // Notification system
  /toast/i,                           // Toast notifications
  /message/i                          // Message display
];

/**
 * Check if a catch block has proper error handling
 */
function hasProperErrorHandling(catchContent) {
  // Remove the catch declaration to focus on the body
  const bodyMatch = catchContent.match(/catch\s*\([^)]*\)\s*\{([\s\S]*)\}/);
  if (!bodyMatch) return false;
  
  const body = bodyMatch[1];
  
  // Check if it contains any proper handling patterns
  return PROPER_HANDLING_PATTERNS.some(pattern => pattern.test(body));
}

/**
 * Extract catch block for detailed analysis
 */
function extractCatchBlock(content, startIndex) {
  let depth = 0;
  let inBlock = false;
  let blockContent = '';
  
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    blockContent += char;
    
    if (char === '{') {
      depth++;
      inBlock = true;
    } else if (char === '}') {
      depth--;
      if (depth === 0 && inBlock) {
        return blockContent;
      }
    }
  }
  
  return blockContent;
}

/**
 * Find all problematic catch blocks
 */
function findEmptyCatchBlocks(content, filePath) {
  const violations = [];
  
  // First, find all catch blocks using a more comprehensive pattern
  const catchBlockPattern = /catch\s*\([^)]*\)\s*\{/g;
  let match;
  
  while ((match = catchBlockPattern.exec(content)) !== null) {
    const catchStart = match.index;
    const catchBlock = extractCatchBlock(content, catchStart);
    
    if (!catchBlock) continue;
    
    // Check if it's empty or problematic
    let isProblematic = false;
    let violationType = '';
    let message = '';
    
    // Check against empty patterns
    for (const { pattern, type, message: msg } of EMPTY_CATCH_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(catchBlock)) {
        isProblematic = true;
        violationType = type;
        message = msg;
        break;
      }
    }
    
    // If not obviously empty, check for proper handling
    if (!isProblematic && !hasProperErrorHandling(catchBlock)) {
      // Extract the body for analysis
      const bodyMatch = catchBlock.match(/catch\s*\([^)]*\)\s*\{([\s\S]*)\}/);
      if (bodyMatch) {
        const body = bodyMatch[1].trim();
        
        // Check if it's suspiciously simple
        if (body.length < 50 && !body.includes('error') && !body.includes('Error')) {
          isProblematic = true;
          violationType = 'insufficient-handling';
          message = 'Catch block appears to have insufficient error handling';
        }
      }
    }
    
    if (isProblematic) {
      // Find line number
      const beforeMatch = content.substring(0, catchStart);
      const lineNumber = beforeMatch.split('\n').length;
      
      // Get the error variable name if present
      const errorVarMatch = catchBlock.match(/catch\s*\(([^)]*)\)/);
      const errorVar = errorVarMatch ? errorVarMatch[1].trim() : '';
      
      violations.push({
        line: lineNumber,
        type: violationType,
        message: message,
        errorVariable: errorVar,
        catchBlock: catchBlock.substring(0, 100) + (catchBlock.length > 100 ? '...' : '')
      });
    }
  }
  
  return violations;
}

/**
 * Check for console.log that might be swallowing errors
 */
function findSwallowedErrors(content) {
  const violations = [];
  
  // Pattern for console.log without proper error indication
  const swallowPattern = /catch\s*\([^)]*\)\s*\{[^}]*console\.log\s*\([^)]*\)[^}]*\}/g;
  
  let match;
  while ((match = swallowPattern.exec(content)) !== null) {
    const catchBlock = match[0];
    
    // Check if console.log includes error context
    if (!catchBlock.includes('error') && !catchBlock.includes('Error') && 
        !catchBlock.includes('err') && !catchBlock.includes('e.')) {
      
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      
      violations.push({
        line: lineNumber,
        type: 'misleading-log',
        message: 'Console.log in catch without error context',
        errorVariable: '',
        catchBlock: catchBlock.substring(0, 100) + (catchBlock.length > 100 ? '...' : '')
      });
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
      const violations = [
        ...findEmptyCatchBlocks(editContent, filePath),
        ...findSwallowedErrors(editContent)
      ];
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
  
  // Skip non-JavaScript/TypeScript files
  if (!filePath.match(/\.(ts|tsx|js|jsx|mjs|cjs)$/)) {
    return { pass: true };
  }
  
  // Find violations
  const violations = [
    ...findEmptyCatchBlocks(content, filePath),
    ...findSwallowedErrors(content)
  ];
  
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
function formatViolations(violations) {
  const messages = violations.slice(0, 5).map(v => {
    let msg = `  Line ${v.line}: ${v.message}`;
    if (v.errorVariable) {
      msg += `\n    Error variable '${v.errorVariable}' is not being used`;
    }
    return msg;
  });
  
  let result = messages.join('\n\n');
  
  if (violations.length > 5) {
    result += `\n\n  ... and ${violations.length - 5} more issues`;
  }
  
  return result;
}

/**
 * Generate proper error handling examples
 */
function getErrorHandlingExamples(violations) {
  const examples = [];
  
  // Check what types of violations we have
  const hasEmpty = violations.some(v => v.type === 'completely-empty');
  const hasReturn = violations.some(v => v.type === 'only-return');
  
  if (hasEmpty) {
    examples.push(`// Option 1: Log the error
catch (error) {
  console.error('Operation failed:', error);
}`);
  }
  
  if (hasReturn) {
    examples.push(`// Option 2: Return error result
catch (error) {
  console.error('Error occurred:', error);
  return { success: false, error: error.message };
}`);
  }
  
  examples.push(`// Option 3: User-friendly error handling
catch (error) {
  console.error('[ComponentName] Error:', error);
  // Notify user
  showErrorNotification('Something went wrong. Please try again.');
  // Track error
  errorTracker.log(error);
}`);
  
  examples.push(`// Option 4: Re-throw with context
catch (error) {
  const enhancedError = new Error(\`Failed to perform operation: \${error.message}\`);
  enhancedError.cause = error;
  throw enhancedError;
}`);
  
  return examples;
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
    const examples = getErrorHandlingExamples(result.violations);
    
    const output = {
      decision: "block",
      reason: `🚫 Empty or insufficient catch blocks detected in ${result.filePath || 'file'}

${formatViolations(result.violations)}

⚠️  Silent failures hide bugs and make debugging difficult!

✅ Proper error handling examples:

${examples.join('\n\n')}

💡 Tips:
• Always log errors for debugging
• Provide user feedback when operations fail
• Consider error recovery strategies
• Use error tracking services in production`
    };
    
    console.log(JSON.stringify(output));
    process.exit(0);
  }
  
  // Validation passed
  process.exit(0);
}

module.exports = { validateContent, findEmptyCatchBlocks, findSwallowedErrors };