/**
 * no-wrong-type-imports.js - Enforces correct type import patterns
 * 
 * This validator ensures all type imports come from '@/types' 
 * and not from database.generated.ts or other incorrect paths.
 * 
 * Exception: src/types/index.ts is allowed to import from database.generated
 */

module.exports = {
  validateContent(input) {
    const { content, file_path } = input;
    const filePath = file_path || '';
    
    // CRITICAL EXCEPTION: types/index.ts is THE ONLY file allowed to import from database.generated
    if (this.isTypesIndexFile(filePath)) {
      return { pass: true, violations: [] };
    }
    
    // Skip validation for certain file types
    if (this.shouldSkipFile(filePath)) {
      return { pass: true, violations: [] };
    }
    
    const violations = [];
    const lines = content.split('\n');
    
    // Patterns to detect incorrect type imports
    const incorrectPatterns = [
      {
        pattern: /from\s+['"]@\/types\/database\.generated['"]/,
        message: "Import from '@/types' instead of '@/types/database.generated'",
        suggestion: "import { YourType } from '@/types';"
      },
      {
        pattern: /from\s+['"]@\/types\/database['"]/,
        message: "Import from '@/types' instead of '@/types/database'",
        suggestion: "import { YourType } from '@/types';"
      },
      {
        pattern: /from\s+['"]\.\.\/types\/database\.generated['"]/,
        message: "Use '@/types' for all type imports",
        suggestion: "import { YourType } from '@/types';"
      },
      {
        pattern: /from\s+['"]\.\/database\.generated['"]/,
        message: "Only src/types/index.ts can import from database.generated",
        suggestion: "import { YourType } from '@/types';"
      }
    ];
    
    lines.forEach((line, index) => {
      // Skip comments and empty lines
      const trimmedLine = line.trim();
      if (!trimmedLine || 
          trimmedLine.startsWith('//') || 
          trimmedLine.startsWith('*') ||
          trimmedLine.startsWith('/*')) {
        return;
      }
      
      incorrectPatterns.forEach(({ pattern, message, suggestion }) => {
        if (pattern.test(line)) {
          // Extract the type being imported for better suggestion
          const typeMatch = line.match(/import\s+(?:type\s+)?{([^}]+)}/);
          const importedTypes = typeMatch ? typeMatch[1].trim() : 'YourType';
          
          violations.push({
            line: index + 1,
            text: line.trim(),
            message: message,
            suggestion: suggestion.replace('YourType', importedTypes),
            severity: 'error'
          });
        }
      });
    });
    
    return {
      pass: violations.length === 0,
      violations: violations,
      filePath: filePath
    };
  },
  
  isTypesIndexFile(filePath) {
    // Check if this is the special types/index.ts file
    return filePath.endsWith('types/index.ts') || 
           filePath.endsWith('types\\index.ts') ||
           filePath.endsWith('src/types/index.ts') ||
           filePath.endsWith('src\\types\\index.ts');
  },
  
  shouldSkipFile(filePath) {
    // Skip documentation files
    if (filePath.endsWith('.md') || 
        filePath.includes('/docs/') || 
        filePath.includes('\\docs\\') ||
        filePath.includes('CLAUDE.md')) {
      return true;
    }
    
    // Skip test files
    if (filePath.includes('.spec.') || 
        filePath.includes('.test.') ||
        filePath.includes('__tests__') ||
        filePath.includes('__mocks__')) {
      return true;
    }
    
    // Skip migration and setup scripts
    if (filePath.includes('/scripts/') ||
        filePath.includes('\\scripts\\') ||
        filePath.includes('setup.') ||
        filePath.includes('migrate')) {
      return true;
    }
    
    // Skip configuration files
    if (filePath.endsWith('.config.js') ||
        filePath.endsWith('.config.ts') ||
        filePath.endsWith('config.json')) {
      return true;
    }
    
    // Skip node_modules and build directories
    if (filePath.includes('node_modules') ||
        filePath.includes('.next') ||
        filePath.includes('dist') ||
        filePath.includes('build')) {
      return true;
    }
    
    return false;
  }
};