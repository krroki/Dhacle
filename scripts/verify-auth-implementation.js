#!/usr/bin/env node

/**
 * Phase 1 Security Verification Script
 * Checks all API routes for requireAuth implementation
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function findApiRoutes() {
  const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
  const routes = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file === 'route.ts') {
        routes.push(filePath);
      }
    }
  }
  
  if (fs.existsSync(apiDir)) {
    walkDir(apiDir);
  }
  
  // Also check auth/callback route
  const authCallbackPath = path.join(__dirname, '..', 'src', 'app', 'auth', 'callback', 'route.ts');
  if (fs.existsSync(authCallbackPath)) {
    routes.push(authCallbackPath);
  }
  
  return routes;
}

function checkAuthImplementation(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check for requireAuth import
  const hasRequireAuthImport = content.includes("import { requireAuth") || 
                               content.includes("import { requireAuth, requireRole") ||
                               content.includes("requireAuth } from '@/lib/api-auth'");
  
  // Check for requireAuth usage in methods (various parameter names)
  const hasRequireAuthUsage = content.includes("await requireAuth(request)") || 
                              content.includes("await requireAuth(req)") ||
                              content.includes("await requireAuth(_request)") ||
                              /await requireAuth\([^)]+\)/.test(content);
  
  // Check for old getUser pattern (should be replaced)
  const hasGetUser = content.includes("supabase.auth.getUser()");
  
  // Check for getSession (should be removed)
  const hasGetSession = content.includes("getSession()");
  
  // Extract HTTP methods
  const methods = [];
  if (content.includes("export async function GET")) methods.push("GET");
  if (content.includes("export async function POST")) methods.push("POST");
  if (content.includes("export async function PUT")) methods.push("PUT");
  if (content.includes("export async function PATCH")) methods.push("PATCH");
  if (content.includes("export async function DELETE")) methods.push("DELETE");
  
  // Special routes that might not need auth
  const isSpecialRoute = relativePath.includes('auth/callback') || 
                        relativePath.includes('health') ||
                        relativePath.includes('debug/env-check');
  
  return {
    path: relativePath,
    hasRequireAuthImport,
    hasRequireAuthUsage,
    hasGetUser,
    hasGetSession,
    methods,
    isSpecialRoute,
    isProtected: hasRequireAuthImport && hasRequireAuthUsage,
  };
}

function main() {
  console.log(`${colors.cyan}🔍 Phase 1 Security Verification - API Route Authentication Check${colors.reset}\n`);
  
  const routes = findApiRoutes();
  console.log(`Found ${routes.length} API route files\n`);
  
  const results = routes.map(checkAuthImplementation);
  
  // Categorize results
  const protected = results.filter(r => r.isProtected);
  const unprotected = results.filter(r => !r.isProtected && !r.isSpecialRoute);
  const special = results.filter(r => r.isSpecialRoute);
  const withGetSession = results.filter(r => r.hasGetSession);
  const withOldPattern = results.filter(r => r.hasGetUser && !r.hasRequireAuthUsage);
  
  // Display results
  console.log(`${colors.green}✅ Protected Routes (${protected.length}/${routes.length})${colors.reset}`);
  protected.forEach(r => {
    console.log(`  ✓ ${r.path} [${r.methods.join(', ')}]`);
  });
  
  console.log(`\n${colors.red}❌ Unprotected Routes (${unprotected.length})${colors.reset}`);
  unprotected.forEach(r => {
    console.log(`  ✗ ${r.path} [${r.methods.join(', ')}]`);
    if (r.hasGetUser) {
      console.log(`    ${colors.yellow}⚠ Uses old getUser pattern - needs requireAuth${colors.reset}`);
    }
    if (!r.hasRequireAuthImport) {
      console.log(`    ${colors.yellow}⚠ Missing requireAuth import${colors.reset}`);
    }
  });
  
  if (special.length > 0) {
    console.log(`\n${colors.blue}ℹ Special Routes (${special.length}) - Review Needed${colors.reset}`);
    special.forEach(r => {
      console.log(`  ? ${r.path} [${r.methods.join(', ')}]`);
      if (!r.isProtected) {
        console.log(`    ${colors.yellow}⚠ Not protected - verify if this is intentional${colors.reset}`);
      }
    });
  }
  
  if (withGetSession.length > 0) {
    console.log(`\n${colors.magenta}⚠️ Routes using getSession (${withGetSession.length}) - Must be replaced${colors.reset}`);
    withGetSession.forEach(r => {
      console.log(`  ! ${r.path}`);
    });
  }
  
  // Summary
  console.log(`\n${colors.cyan}📊 Summary:${colors.reset}`);
  console.log(`  Total Routes: ${routes.length}`);
  console.log(`  ${colors.green}Protected: ${protected.length}${colors.reset}`);
  console.log(`  ${colors.red}Unprotected: ${unprotected.length}${colors.reset}`);
  console.log(`  ${colors.blue}Special: ${special.length}${colors.reset}`);
  console.log(`  ${colors.magenta}Using getSession: ${withGetSession.length}${colors.reset}`);
  console.log(`  ${colors.yellow}Using old pattern: ${withOldPattern.length}${colors.reset}`);
  
  // Exit code
  const success = unprotected.length === 0 && withGetSession.length === 0;
  if (success) {
    console.log(`\n${colors.green}✅ All routes are properly secured!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ Security issues found! ${unprotected.length} routes need protection.${colors.reset}`);
    process.exit(1);
  }
}

main();