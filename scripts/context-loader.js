#!/usr/bin/env node

// Dhacle AI Context Loader v2.0 (Recovery Version)
// Purpose: Generate 30-second AI context warmup file for new sessions

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const PROJECT_DNA_FILE = path.join(PROJECT_ROOT, 'project-dna.json');
const ASSET_INVENTORY_FILE = path.join(PROJECT_ROOT, 'asset-inventory.json');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'ai-context-warmup.md');

/**
 * Load project data from files
 */
function loadProjectData() {
  let projectDNA = {};
  let assetInventory = {};
  
  try {
    if (fs.existsSync(PROJECT_DNA_FILE)) {
      projectDNA = JSON.parse(fs.readFileSync(PROJECT_DNA_FILE, 'utf8'));
    }
  } catch (error) {
    console.warn('⚠️ project-dna.json load failed:', error.message);
  }
  
  try {
    if (fs.existsSync(ASSET_INVENTORY_FILE)) {
      assetInventory = JSON.parse(fs.readFileSync(ASSET_INVENTORY_FILE, 'utf8'));
    }
  } catch (error) {
    console.warn('⚠️ asset-inventory.json load failed:', error.message);
  }
  
  return { projectDNA, assetInventory };
}

/**
 * Generate quality score summary
 */
function generateQualityScore(assetInventory) {
  if (!assetInventory.summary) {
    return {
      overall: 0,
      breakdown: { components: 0, apiRoutes: 0, tables: 0 },
      quality: { modernReactScore: 0, securityScore: 0, rlsCoverage: 0 }
    };
  }
  
  const metrics = assetInventory.summary.qualityIndicators || {};
  const breakdown = assetInventory.summary.breakdown || {};
  
  return {
    overall: Math.round((metrics.modernReactScore + metrics.securityScore + metrics.rlsCoverage) / 3) || 0,
    breakdown,
    quality: metrics,
    total: assetInventory.summary.total || 0,
    scanTime: assetInventory.summary.scanTime || 0
  };
}

/**
 * Generate critical issues based on quality metrics
 */
function generateCriticalIssues(quality) {
  const issues = [];
  
  if (quality.quality.modernReactScore < 50) {
    issues.push(`⚠️ HIGH: Client Components overuse ${100 - quality.quality.modernReactScore}% (Server Component recommended)`);
  }
  
  if (quality.quality.securityScore < 70) {
    issues.push(`⚠️ MEDIUM: Unauthenticated API Routes exist (Security score: ${quality.quality.securityScore}%)`);
  }
  
  if (quality.quality.rlsCoverage < 90) {
    issues.push(`⚠️ MEDIUM: Missing RLS policies on tables (Coverage: ${quality.quality.rlsCoverage}%)`);
  }
  
  return issues;
}

/**
 * Generate AI context warmup content
 */
function generateContextWarmup(projectDNA, assetInventory) {
  const quality = generateQualityScore(assetInventory);
  const issues = generateCriticalIssues(quality);
  const lastScanned = assetInventory.summary?.generated ? 
    new Date(assetInventory.summary.generated).toLocaleString('ko-KR') : 'Unknown';
  
  return `# 🚀 AI Context Warmup - Dhacle Project

## 📋 Project Overview (30-second summary)
- **Project**: ${projectDNA.projectName || 'Dhacle - YouTube Creator Tools'}
- **Status**: ${projectDNA.phase || 'Phase Recovery in progress'}
- **Assets**: ${quality.total} total (Components ${quality.breakdown.components || 0}, API ${quality.breakdown.apiRoutes || 0}, Tables ${quality.breakdown.tables || 0})
- **Quality Score**: ${quality.overall}% (Modern React ${quality.quality.modernReactScore || 0}%, Security ${quality.quality.securityScore || 0}%, RLS ${quality.quality.rlsCoverage || 0}%)
- **Last Scan**: ${lastScanned}
- **Scan Time**: ${quality.scanTime}ms

## 🛑 Immediate Block Rules (STOP & ACT)
${projectDNA.coreRules ? 
  Object.entries(projectDNA.coreRules).map(([key, rule]) => 
    `- **${key}**: ${rule.reason || rule.pattern || 'Rule enforced'} (${rule.violation || 'BLOCK'})`
  ).join('\n') : 
  `- any type usage → immediate block
- process.env direct access → use env.ts
- getSession() usage → use getUser()
- missing RLS policies → apply with table creation`}

## ⚠️ Current Critical Issues
${issues.length > 0 ? issues.map(issue => `- ${issue}`).join('\n') : '- No major issues found'}

## 🎯 Core Patterns (Must Memorize)
- **Components**: shadcn/ui first, Server Component default
- **API**: getUser() auth → snake_case conversion → response
- **DB**: CREATE TABLE → Enable RLS → Create policies
- **Types**: import from @/types, never use any
- **Environment**: import only from env.ts

## 📁 Core File Locations
- **Config**: \`.env.local\`, \`project-dna.json\`, \`.jscpd.json\`
- **Docs**: \`CLAUDE.md\` (per folder), \`docs/CONTEXT_BRIDGE.md\`
- **Scripts**: \`scripts/asset-scanner.js\`, \`scripts/context-loader.js\`
- **Asset List**: \`asset-inventory.json\` (auto-generated)

## 🔧 Frequently Used Commands
\`\`\`bash
npm run scan:assets        # Asset scanning
npm run jscpd:check       # Duplicate check  
npm run verify:parallel   # Full verification
npm run types:check       # Type checking
npm run context:load      # AI context generation
\`\`\`

## 🚨 Emergency Situation Guide
- **Build failure**: \`npm run types:check\` → manual type error fixes
- **Missing table**: Generate SQL → \`node scripts/supabase-sql-executor.js\`
- **Duplicate code**: \`npm run jscpd:verbose\` → extract to common functions
- **any types**: biome auto-blocks → define specific types

## 📊 System Status (${new Date().toLocaleString('ko-KR')})
- **Last Updated**: ${projectDNA.lastUpdated || new Date().toISOString()}
- **Recovery Stage**: ${projectDNA.recoveryInfo?.recoveryPhase || 'Phase 2 in progress'}
- **Automation Systems**: jscpd ✅, asset-scanner ✅, context-loader ✅
- **Integration Status**: ${Object.keys(projectDNA.automationSystems || {}).length} systems active

---
*This context is auto-generated by \`npm run context:load\` command.*
*For latest info: run \`npm run scan:assets\` then regenerate.*`;
}

/**
 * Main execution function
 */
function generateContext() {
  console.log('🧠 AI Context Loader v2.0 starting...\n');
  
  try {
    const { projectDNA, assetInventory } = loadProjectData();
    
    if (Object.keys(projectDNA).length === 0 && Object.keys(assetInventory).length === 0) {
      console.error('❌ No project data found.');
      console.log('💡 First run this command:');
      console.log('   node scripts/asset-scanner.js');
      process.exit(1);
    }
    
    const content = generateContextWarmup(projectDNA, assetInventory);
    
    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    
    console.log('✅ AI Context generation completed!');
    console.log(`📄 Output file: ${path.relative(PROJECT_ROOT, OUTPUT_FILE)}`);
    
    if (assetInventory.summary) {
      console.log(`📊 Total assets: ${assetInventory.summary.total}`);
      const quality = generateQualityScore(assetInventory);
      console.log(`🎯 Overall quality: ${quality.overall}%`);
    }
    
    console.log('\n💡 Usage:');
    console.log('   Copy ai-context-warmup.md content to new Claude session');
    
  } catch (error) {
    console.error('❌ Context generation failed:', error.message);
    process.exit(1);
  }
}

// Execute when run directly
if (require.main === module) {
  generateContext();
}

module.exports = { generateContext };