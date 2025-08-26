const packageJson = require('../package.json');

const scripts = packageJson.scripts;

const scriptCategories = {
  'Development': ['dev', 'start', 'fresh'],
  'Build': ['build', 'export', 'analyze'],
  'Testing': ['test', 'e2e'],
  'Verification': ['verify', 'check'],
  'Security': ['security'],
  'Database': ['db', 'supabase', 'migrate'],
  'Linting & Formatting': ['lint', 'format', 'biome'],
  'Type System': ['type', 'types'],
  'Cleanup': ['clean'],
  'Fix & Automation': ['fix', 'auto']
};

console.log('🎯 Dhacle Project NPM Scripts Analysis');
console.log('======================================\n');

const categorizedScripts = {};
const uncategorizedScripts = [];

// Initialize categories
Object.keys(scriptCategories).forEach(category => {
  categorizedScripts[category] = [];
});

// Categorize each script
Object.keys(scripts).forEach(scriptName => {
  let categorized = false;
  
  for (const [category, patterns] of Object.entries(scriptCategories)) {
    if (patterns.some(pattern => {
      // Check if the script name contains the pattern
      const parts = scriptName.split(/[:_-]/);
      return parts.some(part => part.toLowerCase().includes(pattern.toLowerCase()));
    })) {
      categorizedScripts[category].push({
        name: scriptName,
        command: scripts[scriptName]
      });
      categorized = true;
      break;
    }
  }
  
  if (!categorized) {
    uncategorizedScripts.push({
      name: scriptName,
      command: scripts[scriptName]
    });
  }
});

// Print categorized scripts
let totalCategorized = 0;

Object.entries(categorizedScripts).forEach(([category, categoryScripts]) => {
  if (categoryScripts.length > 0) {
    console.log(`📂 ${category} (${categoryScripts.length} scripts):`);
    console.log('━'.repeat(50));
    
    categoryScripts.forEach(s => {
      // Truncate long commands for readability
      const cmd = s.command.length > 80 
        ? s.command.substring(0, 77) + '...' 
        : s.command;
      console.log(`  npm run ${s.name}`);
      console.log(`    └─ ${cmd}`);
    });
    console.log();
    totalCategorized += categoryScripts.length;
  }
});

// Print uncategorized scripts
if (uncategorizedScripts.length > 0) {
  console.log(`❓ Uncategorized (${uncategorizedScripts.length} scripts):`);
  console.log('━'.repeat(50));
  uncategorizedScripts.forEach(s => {
    const cmd = s.command.length > 80 
      ? s.command.substring(0, 77) + '...' 
      : s.command;
    console.log(`  npm run ${s.name}`);
    console.log(`    └─ ${cmd}`);
  });
  console.log();
}

// Print summary statistics
console.log('\n📊 Summary Statistics');
console.log('=====================');
console.log(`Total scripts: ${Object.keys(scripts).length}`);
console.log(`Categorized: ${totalCategorized}`);
console.log(`Uncategorized: ${uncategorizedScripts.length}`);

// Category distribution
console.log('\n📈 Category Distribution:');
Object.entries(categorizedScripts)
  .filter(([_, scripts]) => scripts.length > 0)
  .sort(([_, a], [__, b]) => b.length - a.length)
  .forEach(([category, scripts]) => {
    const percentage = ((scripts.length / Object.keys(packageJson.scripts).length) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(scripts.length / 2));
    console.log(`  ${category}: ${scripts.length} (${percentage}%) ${bar}`);
  });

// Most complex categories (by average command length)
console.log('\n🔧 Script Complexity (by command length):');
Object.entries(categorizedScripts)
  .filter(([_, scripts]) => scripts.length > 0)
  .map(([category, scripts]) => {
    const avgLength = scripts.reduce((sum, s) => sum + s.command.length, 0) / scripts.length;
    return { category, avgLength, count: scripts.length };
  })
  .sort((a, b) => b.avgLength - a.avgLength)
  .slice(0, 5)
  .forEach(({ category, avgLength, count }) => {
    console.log(`  ${category}: avg ${Math.round(avgLength)} chars (${count} scripts)`);
  });

// Identify script patterns
console.log('\n🔍 Common Script Patterns:');
const scriptNames = Object.keys(scripts);
const scriptCommands = Object.values(scripts);
const patterns = {
  'Parallel execution': scriptNames.filter(s => s.includes('parallel')).length,
  'Quick operations': scriptNames.filter(s => s.includes('quick')).length,
  'Dry run support': scriptCommands.filter(s => s.includes('-dry') || s.includes('--dry-run')).length,
  'Auto operations': scriptNames.filter(s => s.includes('auto')).length,
  'Wave-based': scriptNames.filter(s => s.includes('wave')).length,
  'Local vs Remote': scriptNames.filter(s => s.includes('local')).length,
  'Deprecated': scriptCommands.filter(s => s.includes('DEPRECATED') || s.includes('OLD')).length
};

Object.entries(patterns)
  .filter(([_, count]) => count > 0)
  .forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count} scripts`);
  });

// Script dependencies (scripts that call other scripts)
const scriptDependencies = {};
Object.entries(scripts).forEach(([name, command]) => {
  const matches = command.match(/npm run [\w:-]+/g);
  if (matches) {
    scriptDependencies[name] = matches.map(m => m.replace('npm run ', ''));
  }
});

if (Object.keys(scriptDependencies).length > 0) {
  console.log('\n🔗 Script Dependencies:');
  Object.entries(scriptDependencies).slice(0, 10).forEach(([script, deps]) => {
    console.log(`  ${script} → [${deps.join(', ')}]`);
  });
}