#!/usr/bin/env node

/**
 * main-validator.js - Main Claude Code Hook validator
 * 
 * This script combines all validation checks and can be configured
 * to enable/disable specific validators.
 */

const fs = require('fs');
const path = require('path');

// Import validators
const validators = {
  'no-any-type': require('./validators/no-any-type'),
  'no-todo-comments': require('./validators/no-todo-comments'),
  'no-empty-catch': require('./validators/no-empty-catch'),
  'no-direct-fetch': require('./validators/no-direct-fetch'),
  'no-deprecated-supabase': require('./validators/no-deprecated-supabase'),
  'no-wrong-type-imports': require('./validators/no-wrong-type-imports')
};

/**
 * Configuration - can be overridden by environment variables or config file
 */
const DEFAULT_CONFIG = {
  enabled: true,
  validators: {
    'no-any-type': {
      enabled: true,
      severity: 'error'  // error | warning | info
    },
    'no-todo-comments': {
      enabled: true,
      severity: 'error'
    },
    'no-empty-catch': {
      enabled: true,
      severity: 'error'
    }
  },
  // Global settings
  maxViolations: 10,        // Max violations to show
  includeWarnings: false,   // Include warnings in output
  strictMode: false,        // Fail on warnings
  debugMode: false          // Show debug information
};

/**
 * Load configuration from file if exists
 */
function loadConfig() {
  // Check emergency disable FIRST - this takes precedence over everything
  if (process.env.CLAUDE_HOOKS_ENABLED === 'false') {
    return {
      enabled: false,
      validators: {},
      debugMode: process.env.CLAUDE_HOOKS_DEBUG === 'true'
    };
  }
  
  // Try to load config from file
  let config = { ...DEFAULT_CONFIG };
  
  const configPaths = [
    path.join(__dirname, 'config.json'),
    path.join(__dirname, '../config.json'),
    '.claude-hooks.json'
  ];
  
  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        config = { ...config, ...fileConfig };
        break;
      }
    } catch (error) {
      if (process.env.CLAUDE_HOOKS_DEBUG === 'true') {
        console.error(`Warning: Failed to load config from ${configPath}:`, error.message);
      }
    }
  }
  
  // Apply individual validator overrides from environment
  if (process.env.CLAUDE_HOOKS_NO_ANY === 'false' && config.validators['no-any-type']) {
    config.validators['no-any-type'].enabled = false;
  }
  if (process.env.CLAUDE_HOOKS_NO_TODO === 'false' && config.validators['no-todo-comments']) {
    config.validators['no-todo-comments'].enabled = false;
  }
  if (process.env.CLAUDE_HOOKS_NO_EMPTY_CATCH === 'false' && config.validators['no-empty-catch']) {
    config.validators['no-empty-catch'].enabled = false;
  }
  
  // Debug mode
  if (process.env.CLAUDE_HOOKS_DEBUG === 'true') {
    config.debugMode = true;
  }
  
  return config;
}

/**
 * Run all enabled validators
 */
function runValidators(input, config) {
  const results = [];
  
  for (const [name, validator] of Object.entries(validators)) {
    const validatorConfig = config.validators[name];
    
    if (!validatorConfig || !validatorConfig.enabled) {
      if (config.debugMode) {
        console.error(`Skipping disabled validator: ${name}`);
      }
      continue;
    }
    
    try {
      const result = validator.validateContent(input);
      
      if (!result.pass) {
        results.push({
          validator: name,
          severity: validatorConfig.severity,
          violations: result.violations,
          filePath: result.filePath
        });
      }
    } catch (error) {
      if (config.debugMode) {
        console.error(`Error in validator ${name}:`, error);
      }
      // Continue with other validators even if one fails
    }
  }
  
  return results;
}

/**
 * Format all validation results
 */
function formatResults(results, config) {
  if (results.length === 0) {
    return null;
  }
  
  // Filter by severity if needed
  const relevantResults = config.strictMode 
    ? results 
    : results.filter(r => r.severity === 'error');
  
  if (relevantResults.length === 0) {
    return null;
  }
  
  // Build the output message
  const messages = [];
  
  messages.push(`🚫 Code quality issues detected\n`);
  
  // Group by validator
  const byValidator = {};
  relevantResults.forEach(result => {
    if (!byValidator[result.validator]) {
      byValidator[result.validator] = [];
    }
    byValidator[result.validator].push(result);
  });
  
  // Format each validator's results
  for (const [validatorName, validatorResults] of Object.entries(byValidator)) {
    const validatorConfig = config.validators[validatorName];
    const icon = validatorConfig.severity === 'error' ? '❌' : '⚠️';
    
    // Get a friendly name
    const friendlyNames = {
      'no-any-type': 'TypeScript "any" Usage',
      'no-todo-comments': 'TODO/FIXME Comments',
      'no-empty-catch': 'Empty Catch Blocks',
      'no-direct-fetch': 'Direct fetch() Usage',
      'no-deprecated-supabase': 'Deprecated Supabase Imports',
      'no-wrong-type-imports': 'Incorrect Type Imports'
    };
    
    messages.push(`\n${icon} ${friendlyNames[validatorName] || validatorName}:`);
    
    // Show violations
    validatorResults.forEach(result => {
      if (result.violations && result.violations.length > 0) {
        const violationCount = Math.min(result.violations.length, config.maxViolations);
        
        result.violations.slice(0, violationCount).forEach(violation => {
          if (violation.line) {
            messages.push(`  Line ${violation.line}: ${violation.message || violation.text || 'Issue detected'}`);
          } else {
            messages.push(`  ${violation.message || violation.text || 'Issue detected'}`);
          }
        });
        
        if (result.violations.length > violationCount) {
          messages.push(`  ... and ${result.violations.length - violationCount} more`);
        }
      }
    });
  }
  
  // Add suggestions
  messages.push(`\n✅ How to fix:`);
  
  if (byValidator['no-any-type']) {
    messages.push(`• Replace 'any' with 'unknown' and add type guards`);
  }
  if (byValidator['no-todo-comments']) {
    messages.push(`• Complete the implementation or create GitHub issues`);
  }
  if (byValidator['no-empty-catch']) {
    messages.push(`• Add proper error logging and handling`);
  }
  if (byValidator['no-direct-fetch']) {
    messages.push(`• Use apiClient methods instead of direct fetch()`);
  }
  if (byValidator['no-deprecated-supabase']) {
    messages.push(`• Use '@/lib/supabase/server-client' instead of '@supabase/auth-helpers-nextjs'`);
  }
  if (byValidator['no-wrong-type-imports']) {
    messages.push(`• Import types from '@/types' instead of database.generated.ts`);
  }
  
  messages.push(`\n💡 To temporarily disable checks:`);
  messages.push(`• Add @allow-any, @allow-todo comments for specific lines`);
  messages.push(`• Set CLAUDE_HOOKS_ENABLED=false to disable all hooks`);
  messages.push(`• Configure individual validators in .claude-hooks.json`);
  
  return messages.join('\n');
}

/**
 * Main execution
 */
function main() {
  const config = loadConfig();
  
  // Check if hooks are globally disabled
  if (!config.enabled) {
    if (config.debugMode) {
      console.error('Claude hooks are disabled');
    }
    process.exit(0);
  }
  
  let input;
  
  try {
    // Read input from stdin
    input = JSON.parse(fs.readFileSync(0, 'utf-8'));
  } catch (error) {
    if (config.debugMode) {
      console.error('Failed to parse input:', error.message);
    }
    process.exit(1);
  }
  
  // Skip if not a relevant tool
  const { tool_name } = input;
  if (!['Write', 'Edit', 'MultiEdit'].includes(tool_name)) {
    process.exit(0);
  }
  
  // Run validators
  const results = runValidators(input, config);
  
  // Format results
  const message = formatResults(results, config);
  
  if (message) {
    const output = {
      decision: "block",
      reason: message
    };
    
    console.log(JSON.stringify(output));
    process.exit(0);
  }
  
  // All validations passed
  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { runValidators, formatResults, loadConfig };