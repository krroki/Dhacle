const packageJson = require('../package.json');

const categories = {
  'UI Framework': ['react', 'react-dom', 'next'],
  'UI Components': ['@radix-ui', 'embla-carousel', 'framer-motion', 'lucide-react', 'masonic', 'react-window', 'react-virtualized', 'react-intersection', 'react-signature', 'react-image-crop', 'canvas-confetti'],
  'State Management': ['zustand', '@tanstack/react-query'],
  'Form & Validation': ['react-hook-form', 'zod', '@hookform/resolvers'],
  'Database & Backend': ['@supabase', 'ioredis', 'bullmq', 'pg', 'googleapis'],
  'Testing': ['vitest', '@testing-library', '@playwright', 'msw', 'jsdom', '@vitest'],
  'Build Tools': ['vite', 'turbo', 'tsup', '@next/bundle-analyzer', 'postcss', 'tailwindcss', 'autoprefixer', 'sharp'],
  'Dev Tools': ['@biomejs/biome', 'typescript', 'prettier', 'eslint', 'husky', 'rimraf', 'cross-env', 'glob'],
  'Security': ['dompurify', 'crypto-js', 'isomorphic-dompurify'],
  'Analytics & Monitoring': ['@vercel/analytics', '@vercel/speed-insights', 'web-vitals', 'nprogress'],
  'Rich Text & Editor': ['@tiptap'],
  'Styling': ['clsx', 'class-variance-authority', 'tailwind-merge', 'tailwindcss-animate'],
  'Date & Time': ['date-fns'],
  'Payment': ['@tosspayments'],
  'Video & Media': ['hls.js'],
  'Utilities': ['lodash.debounce', 'lru-cache', 'dotenv', '@t3-oss/env-nextjs'],
  'Theme Management': ['next-themes'],
  'Toast & Notifications': ['sonner'],
  'Error Handling': ['react-error-boundary'],
  'Type Definitions': ['@types'],
  'Window Management': ['@react-hook/window-size']
};

// Combine all dependencies
const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

// Categorize dependencies
console.log('🎯 Dhacle Project Dependency Analysis');
console.log('=====================================\n');

const categorizedDeps = {};
const uncategorized = [];

// Initialize categorized deps
Object.keys(categories).forEach(category => {
  categorizedDeps[category] = [];
});

// Categorize each dependency
Object.keys(allDeps).forEach(dep => {
  let categorized = false;
  
  for (const [category, patterns] of Object.entries(categories)) {
    if (patterns.some(pattern => dep.toLowerCase().includes(pattern.toLowerCase()))) {
      categorizedDeps[category].push({ name: dep, version: allDeps[dep] });
      categorized = true;
      break;
    }
  }
  
  if (!categorized) {
    uncategorized.push({ name: dep, version: allDeps[dep] });
  }
});

// Print results
let totalCategorized = 0;

Object.entries(categorizedDeps).forEach(([category, deps]) => {
  if (deps.length > 0) {
    console.log(`📦 ${category}: ${deps.length}개`);
    deps.forEach(d => console.log(`  - ${d.name}: ${d.version}`));
    console.log();
    totalCategorized += deps.length;
  }
});

if (uncategorized.length > 0) {
  console.log(`❓ Uncategorized: ${uncategorized.length}개`);
  uncategorized.forEach(d => console.log(`  - ${d.name}: ${d.version}`));
  console.log();
}

// Print summary
console.log('\n📊 Summary');
console.log('==========');
console.log(`Total dependencies: ${Object.keys(allDeps).length}`);
console.log(`Regular dependencies: ${Object.keys(packageJson.dependencies).length}`);
console.log(`Dev dependencies: ${Object.keys(packageJson.devDependencies).length}`);
console.log(`Categorized: ${totalCategorized}`);
console.log(`Uncategorized: ${uncategorized.length}`);

// Category breakdown
console.log('\n📈 Category Distribution:');
Object.entries(categorizedDeps)
  .filter(([_, deps]) => deps.length > 0)
  .sort(([_, a], [__, b]) => b.length - a.length)
  .forEach(([category, deps]) => {
    const percentage = ((deps.length / Object.keys(allDeps).length) * 100).toFixed(1);
    console.log(`  ${category}: ${deps.length} (${percentage}%)`);
  });