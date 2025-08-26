/**
 * React Query v5 Migration Checker
 * Identifies patterns that need to be updated for v5 compatibility
 * DOES NOT modify files - only reports what needs to be changed
 */

const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, '..', 'src', 'hooks', 'queries');

// Patterns to check
const v4Patterns = {
  onSuccess: /onSuccess:/g,
  onError: /onError:/g,
  cacheTime: /cacheTime:/g,
  isIdle: /isIdle/g,
  status: /status\s*===?\s*['"]idle['"]/g,
  remove: /\.remove\(\)/g,
};

const migrationReport = {
  totalFiles: 0,
  filesNeedingUpdate: [],
  summary: {}
};

console.log('====================================');
console.log('📊 React Query v5 Migration Check');
console.log('====================================\n');

// Check if hooks directory exists
if (!fs.existsSync(hooksDir)) {
  console.error('❌ Hooks directory not found:', hooksDir);
  process.exit(1);
}

// Get all TypeScript files
const files = fs.readdirSync(hooksDir).filter(file => file.endsWith('.ts'));
migrationReport.totalFiles = files.length;

console.log(`Found ${files.length} query hook files to check\n`);

// Check each file
files.forEach(file => {
  const filePath = path.join(hooksDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const issues = [];
  
  // Check for v4 patterns
  Object.entries(v4Patterns).forEach(([name, pattern]) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        pattern: name,
        count: matches.length,
        recommendation: getRecommendation(name)
      });
    }
  });
  
  if (issues.length > 0) {
    migrationReport.filesNeedingUpdate.push({
      file,
      issues
    });
  }
});

// Helper function for recommendations
function getRecommendation(pattern) {
  const recommendations = {
    onSuccess: 'Move to component level or use mutation.mutate() second parameter',
    onError: 'Move to component level or use mutation.mutate() third parameter',
    cacheTime: 'Rename to gcTime',
    isIdle: 'Use isPending instead',
    status: 'Use isPending for idle state',
    remove: 'Use queryClient.removeQueries() instead'
  };
  return recommendations[pattern] || 'Update to v5 pattern';
}

// Print report
console.log('📋 MIGRATION REPORT:');
console.log('--------------------------------\n');

if (migrationReport.filesNeedingUpdate.length === 0) {
  console.log('✅ All files are already using React Query v5 patterns!\n');
} else {
  console.log(`⚠️  ${migrationReport.filesNeedingUpdate.length} files need updating:\n`);
  
  migrationReport.filesNeedingUpdate.forEach(({ file, issues }) => {
    console.log(`📄 ${file}`);
    issues.forEach(({ pattern, count, recommendation }) => {
      console.log(`   ⚠️  ${pattern}: ${count} occurrence(s)`);
      console.log(`      → ${recommendation}`);
    });
    console.log('');
  });
  
  // Summary
  console.log('📊 SUMMARY:');
  console.log('--------------------------------');
  const totalIssues = migrationReport.filesNeedingUpdate.reduce(
    (sum, { issues }) => sum + issues.reduce((s, i) => s + i.count, 0), 0
  );
  console.log(`Total files to update: ${migrationReport.filesNeedingUpdate.length}/${migrationReport.totalFiles}`);
  console.log(`Total patterns to fix: ${totalIssues}`);
}

// Migration guide
console.log('\n📚 MIGRATION GUIDE:');
console.log('--------------------------------');
console.log('1. onSuccess/onError in mutations:');
console.log('   // Before (v4)');
console.log('   useMutation({');
console.log('     mutationFn: updateUser,');
console.log('     onSuccess: (data) => { ... },');
console.log('     onError: (error) => { ... }');
console.log('   });');
console.log('');
console.log('   // After (v5)');
console.log('   const mutation = useMutation({');
console.log('     mutationFn: updateUser');
console.log('   });');
console.log('   // Handle in component:');
console.log('   mutation.mutate(data, {');
console.log('     onSuccess: (data) => { ... },');
console.log('     onError: (error) => { ... }');
console.log('   });');
console.log('');
console.log('2. cacheTime → gcTime:');
console.log('   // Before: cacheTime: 5 * 60 * 1000');
console.log('   // After:  gcTime: 5 * 60 * 1000');
console.log('');
console.log('3. isIdle → isPending:');
console.log('   // Before: query.isIdle');
console.log('   // After:  query.isPending');
console.log('');

// List files for manual update
if (migrationReport.filesNeedingUpdate.length > 0) {
  console.log('\n🔧 FILES TO UPDATE MANUALLY:');
  console.log('--------------------------------');
  migrationReport.filesNeedingUpdate.forEach(({ file }) => {
    console.log(`  - src/hooks/queries/${file}`);
  });
  console.log('\n⚠️  Update these files manually to ensure correct migration');
  console.log('✅ Run this script again after updates to verify completion');
}