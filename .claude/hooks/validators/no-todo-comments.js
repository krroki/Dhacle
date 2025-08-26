#!/usr/bin/env node

/**
 * no-todo-comments.js - Claude Code Hook to block TODO/FIXME comments
 * 
 * This validator prevents the addition of TODO, FIXME, XXX, HACK comments
 * which indicate incomplete or temporary code.
 */

const fs = require('fs');

/**
 * Patterns to detect TODO-style comments
 */
const TODO_PATTERNS = [
  {
    pattern: /\/\/\s*(TODO|FIXME|XXX|HACK|BUG|REFACTOR|OPTIMIZE)(?:\s*:|\s+)/gi,
    type: 'single-line'
  },
  {
    pattern: /\/\*\s*(TODO|FIXME|XXX|HACK|BUG|REFACTOR|OPTIMIZE)(?:\s*:|\s+)/gi,
    type: 'multi-line'
  },
  {
    pattern: /#\s*(TODO|FIXME|XXX|HACK|BUG|REFACTOR|OPTIMIZE)(?:\s*:|\s+)/gi,
    type: 'hash-comment'
  },
  {
    // HTML/JSX comments
    pattern: /<!--\s*(TODO|FIXME|XXX|HACK|BUG|REFACTOR|OPTIMIZE)(?:\s*:|\s+)/gi,
    type: 'html-comment'
  }
];

/**
 * Keywords that are commonly used in TODO comments
 */
const TODO_KEYWORDS = [
  'TODO', 'FIXME', 'XXX', 'HACK', 'BUG', 
  'REFACTOR', 'OPTIMIZE', 'TEMPORARY', 'TEMP'
];

/**
 * Whitelist patterns - cases where TODOs might be acceptable
 */
const WHITELIST = {
  // Files that might legitimately contain TODO examples
  patterns: [
    /\.md$/,           // Markdown files
    /README/,          // README files
    /CHANGELOG/,       // Changelog files
    /\.txt$/,          // Text files
    /\.example\./,     // Example files
    /\.sample\./       // Sample files
  ],
  // Comments that indicate the TODO is intentional
  intentionalMarkers: [
    /@allow-todo/i,
    /@keep-todo/i,
    /@example/i
  ]
};

/**
 * Check if file should be excluded from validation
 */
function shouldExcludeFile(filePath) {
  return WHITELIST.patterns.some(pattern => pattern.test(filePath));
}

/**
 * Check if a TODO comment is intentionally allowed
 */
function isTodoIntentional(line, previousLine = '') {
  // Check current line
  if (WHITELIST.intentionalMarkers.some(marker => marker.test(line))) {
    return true;
  }
  // Check previous line for allow marker
  if (WHITELIST.intentionalMarkers.some(marker => marker.test(previousLine))) {
    return true;
  }
  return false;
}

/**
 * Find all TODO-style comments in content
 */
function findTodoComments(content, filePath) {
  if (shouldExcludeFile(filePath)) {
    return [];
  }
  
  const violations = [];
  const lines = content.split('\n');
  
  for (const { pattern, type } of TODO_PATTERNS) {
    // Reset regex
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // Find line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      const lineIndex = lineNumber - 1;
      
      // Check if intentionally allowed
      const currentLine = lines[lineIndex];
      const previousLine = lineIndex > 0 ? lines[lineIndex - 1] : '';
      
      if (isTodoIntentional(currentLine, previousLine)) {
        continue;
      }
      
      // Extract the TODO text for context
      let todoText = match[0];
      const remainingLine = currentLine.substring(
        currentLine.indexOf(match[0]) + match[0].length
      );
      // Get up to 50 chars of context
      todoText += remainingLine.substring(0, 50).trim();
      if (remainingLine.length > 50) todoText += '...';
      
      violations.push({
        line: lineNumber,
        keyword: match[1].toUpperCase(),
        text: todoText.trim(),
        type: type
      });
    }
  }
  
  // Sort by line number
  violations.sort((a, b) => a.line - b.line);
  
  return violations;
}

/**
 * Check for incomplete implementations (common TODO indicators)
 */
function findIncompleteImplementations(content) {
  const incompletePatterns = [
    {
      pattern: /throw\s+new\s+Error\s*\(\s*['"`]Not implemented['"`]/gi,
      message: 'Unimplemented method'
    },
    {
      pattern: /return\s+(\[\]|{}|\{\}|null)\s*;?\s*\/\/\s*temp/gi,
      message: 'Temporary return value'
    },
    {
      pattern: /console\.(log|warn|error)\s*\(\s*['"`](TODO|FIXME|XXX)/gi,
      message: 'TODO in console output'
    }
  ];
  
  const violations = [];
  
  for (const { pattern, message } of incompletePatterns) {
    pattern.lastIndex = 0;
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      
      violations.push({
        line: lineNumber,
        keyword: 'INCOMPLETE',
        text: message,
        type: 'implementation'
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
        ...findTodoComments(editContent, filePath),
        ...findIncompleteImplementations(editContent)
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
  
  // Find violations
  const violations = [
    ...findTodoComments(content, filePath),
    ...findIncompleteImplementations(content)
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
  const byKeyword = {};
  
  // Group by keyword
  violations.forEach(v => {
    if (!byKeyword[v.keyword]) {
      byKeyword[v.keyword] = [];
    }
    byKeyword[v.keyword].push(v);
  });
  
  const messages = [];
  
  for (const [keyword, items] of Object.entries(byKeyword)) {
    messages.push(`  ${keyword} comments (${items.length}):`);
    items.slice(0, 3).forEach(item => {
      messages.push(`    Line ${item.line}: ${item.text}`);
    });
    if (items.length > 3) {
      messages.push(`    ... and ${items.length - 3} more`);
    }
  }
  
  return messages.join('\n');
}

/**
 * Suggest alternatives based on the TODO type
 */
function getSuggestions(violations) {
  const hasIncomplete = violations.some(v => v.keyword === 'INCOMPLETE');
  const suggestions = [];
  
  suggestions.push('1. Complete the implementation now');
  suggestions.push('2. Create a GitHub Issue for tracking');
  
  if (hasIncomplete) {
    suggestions.push('3. Implement a proper error or default behavior');
  }
  
  suggestions.push('4. Document the limitation in README if it\'s intentional');
  suggestions.push('5. If this is example code, add @allow-todo comment');
  
  return suggestions;
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
    const suggestions = getSuggestions(result.violations);
    
    const output = {
      decision: "block",
      reason: `🚫 TODO/FIXME comments detected in ${result.filePath || 'file'}

${formatViolations(result.violations)}

✅ Suggested actions:
${suggestions.join('\n')}

💡 Tip: Incomplete code leads to bugs. Implement it now or track it properly!`
    };
    
    console.log(JSON.stringify(output));
    process.exit(0);
  }
  
  // Validation passed
  process.exit(0);
}

module.exports = { validateContent, findTodoComments, findIncompleteImplementations };