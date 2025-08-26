/**
 * no-deprecated-supabase.js - Prevents deprecated Supabase package usage
 * 
 * This validator blocks the use of @supabase/auth-helpers-nextjs
 * which causes PKCE errors and other issues.
 * 
 * Instead, use the project's wrapper functions from @/lib/supabase/*
 */

module.exports = {
  validateContent(input) {
    const { content, file_path } = input;
    const filePath = file_path || '';
    
    // Skip validation for certain file types
    if (this.shouldSkipFile(filePath)) {
      return { pass: true, violations: [] };
    }
    
    const violations = [];
    const lines = content.split('\n');
    
    // Patterns to detect deprecated imports
    const deprecatedPatterns = [
      {
        pattern: /@supabase\/auth-helpers-nextjs/,
        message: "Use '@/lib/supabase/server-client' instead of '@supabase/auth-helpers-nextjs'",
        suggestion: "import { createSupabaseServerClient } from '@/lib/supabase/server-client';"
      },
      {
        pattern: /createServerComponentClient.*from.*auth-helpers/,
        message: "Use 'createSupabaseServerClient' from '@/lib/supabase/server-client'",
        suggestion: "const supabase = await createSupabaseServerClient();"
      },
      {
        pattern: /createRouteHandlerClient.*from.*auth-helpers/,
        message: "Use 'createSupabaseRouteHandlerClient' from '@/lib/supabase/server-client'",
        suggestion: "const supabase = await createSupabaseRouteHandlerClient();"
      },
      {
        pattern: /createMiddlewareClient.*from.*auth-helpers/,
        message: "Middleware should use '@supabase/ssr' directly as shown in middleware.ts",
        suggestion: "import { createServerClient } from '@supabase/ssr';"
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
      
      deprecatedPatterns.forEach(({ pattern, message, suggestion }) => {
        if (pattern.test(line)) {
          violations.push({
            line: index + 1,
            text: line.trim(),
            message: message,
            suggestion: suggestion
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
  
  shouldSkipFile(filePath) {
    // Skip documentation files
    if (filePath.endsWith('.md') || 
        filePath.includes('/docs/') || 
        filePath.includes('\\docs\\')) {
      return true;
    }
    
    // Skip test files
    if (filePath.includes('.spec.') || 
        filePath.includes('.test.') ||
        filePath.includes('__tests__')) {
      return true;
    }
    
    // Skip migration scripts
    if (filePath.includes('/scripts/migrate') ||
        filePath.includes('\\scripts\\migrate')) {
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