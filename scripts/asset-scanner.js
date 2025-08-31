#!/usr/bin/env node

// Dhacle Project Asset Scanner v2.0
// Recovery version for tracking project assets

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Project root and output configuration
const PROJECT_ROOT = process.cwd();
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'asset-inventory.json');

/**
 * Scan all React components
 */
async function scanComponents() {
  const componentFiles = await glob('src/components/**/*.{tsx,jsx}', { 
    cwd: PROJECT_ROOT,
    ignore: ['**/*.test.*', '**/*.spec.*']
  });

  const components = [];
  
  for (const file of componentFiles) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');
    const componentName = path.basename(file, path.extname(file));
    
    // Check if it's a Client Component
    const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
    
    // Check if it's a shadcn/ui component
    const isShadcnUI = file.includes('src/components/ui/');
    
    components.push({
      name: componentName,
      path: file,
      type: isClientComponent ? 'client' : 'server',
      framework: isShadcnUI ? 'shadcn/ui' : 'custom',
      lines: content.split('\n').length
    });
  }

  return components;
}

/**
 * Scan all API routes
 */
async function scanAPIRoutes() {
  const apiFiles = await glob('src/app/api/**/route.{ts,js}', {
    cwd: PROJECT_ROOT
  });

  const routes = [];
  
  for (const file of apiFiles) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');
    
    // Detect HTTP methods
    const methods = [];
    if (content.includes('export async function GET')) methods.push('GET');
    if (content.includes('export async function POST')) methods.push('POST');
    if (content.includes('export async function PUT')) methods.push('PUT');
    if (content.includes('export async function DELETE')) methods.push('DELETE');
    
    // Check for authentication
    const hasAuth = content.includes('getUser()') || content.includes('auth.getUser');
    
    routes.push({
      path: file,
      methods,
      hasAuth,
      lines: content.split('\n').length
    });
  }

  return routes;
}

/**
 * Scan database tables from migration files
 */
async function scanDatabaseTables() {
  const migrationFiles = await glob('supabase/migrations/*.sql', {
    cwd: PROJECT_ROOT
  });

  const tables = new Set();
  const rlsTables = new Set();
  
  for (const file of migrationFiles) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');
    
    // Find CREATE TABLE statements
    const createTableMatches = content.match(/CREATE TABLE[^(]*([^(\s]+)/gi) || [];
    createTableMatches.forEach(match => {
      const tableName = match.replace(/CREATE TABLE[^(]*/i, '').trim();
      if (tableName && !tableName.includes('(')) {
        tables.add(tableName);
      }
    });
    
    // Find RLS enabled tables
    const rlsMatches = content.match(/ALTER TABLE\s+([^\s]+)\s+ENABLE ROW LEVEL SECURITY/gi) || [];
    rlsMatches.forEach(match => {
      const tableName = match.match(/ALTER TABLE\s+([^\s]+)/i)[1];
      rlsTables.add(tableName);
    });
  }

  return Array.from(tables).map(tableName => ({
    name: tableName,
    hasRLS: rlsTables.has(tableName)
  }));
}

/**
 * Calculate quality metrics
 */
function calculateQualityMetrics(components, routes, tables) {
  // Modern React Score (Server Component ratio)
  const totalComponents = components.length;
  const serverComponents = components.filter(c => c.type === 'server').length;
  const modernReactScore = totalComponents > 0 ? Math.round((serverComponents / totalComponents) * 100) : 0;
  
  // Security Score (API authentication coverage)
  const totalRoutes = routes.length;
  const authenticatedRoutes = routes.filter(r => r.hasAuth).length;
  const securityScore = totalRoutes > 0 ? Math.round((authenticatedRoutes / totalRoutes) * 100) : 0;
  
  // RLS Coverage
  const totalTables = tables.length;
  const rlsEnabledTables = tables.filter(t => t.hasRLS).length;
  const rlsCoverage = totalTables > 0 ? Math.round((rlsEnabledTables / totalTables) * 100) : 0;

  return {
    modernReactScore,
    securityScore,
    rlsCoverage,
    totalAssets: totalComponents + totalRoutes + totalTables
  };
}

/**
 * Main scanning function
 */
async function scanAssets() {
  console.log('🔍 Dhacle Asset Scanner v2.0 starting...\n');
  
  const startTime = Date.now();
  
  try {
    console.log('📦 Scanning components...');
    const components = await scanComponents();
    console.log(`   Found: ${components.length} components`);
    
    console.log('🔗 Scanning API routes...');
    const routes = await scanAPIRoutes();
    console.log(`   Found: ${routes.length} API routes`);
    
    console.log('🗄️ Scanning database tables...');
    const tables = await scanDatabaseTables();
    console.log(`   Found: ${tables.length} tables`);
    
    console.log('📊 Calculating quality metrics...');
    const metrics = calculateQualityMetrics(components, routes, tables);
    
    const inventory = {
      summary: {
        total: metrics.totalAssets,
        generated: new Date().toISOString(),
        breakdown: {
          components: components.length,
          apiRoutes: routes.length,
          tables: tables.length
        },
        qualityIndicators: {
          modernReactScore: metrics.modernReactScore,
          securityScore: metrics.securityScore,
          rlsCoverage: metrics.rlsCoverage
        },
        scanTime: Date.now() - startTime
      },
      components,
      apiRoutes: routes,
      tables
    };
    
    // Save results
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(inventory, null, 2), 'utf8');
    
    console.log('\n✅ Scan completed!');
    console.log(`📄 Results: ${OUTPUT_FILE}`);
    console.log(`⏱️ Execution time: ${inventory.summary.scanTime}ms`);
    console.log('\n📊 Summary:');
    console.log(`   Total assets: ${inventory.summary.total}`);
    console.log(`   - Components: ${components.length}`);
    console.log(`   - API routes: ${routes.length}`);
    console.log(`   - Tables: ${tables.length}`);
    console.log('\n🎯 Quality metrics:');
    console.log(`   Modern React: ${metrics.modernReactScore}%`);
    console.log(`   Security score: ${metrics.securityScore}%`);
    console.log(`   RLS coverage: ${metrics.rlsCoverage}%`);
    
    return inventory;
    
  } catch (error) {
    console.error('❌ Scan failed:', error.message);
    process.exit(1);
  }
}

// Execute when run directly
if (require.main === module) {
  scanAssets();
}

module.exports = { scanAssets };