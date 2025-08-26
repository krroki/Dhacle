/**
 * Component Organization Script
 * Displays the plan for reorganizing components
 * DOES NOT MOVE FILES - Manual execution required
 */

const fs = require('fs');
const path = require('path');

// Component move plan - DISPLAY ONLY
const componentMoves = [
  // UI Components (shadcn/ui)
  { from: 'components/ui/*', to: 'components/ui/' , note: 'Already in correct location' },
  
  // Common Components
  { from: 'components/Header.tsx', to: 'components/common/Header/index.tsx' },
  { from: 'components/Footer.tsx', to: 'components/common/Footer/index.tsx' },
  { from: 'components/Navigation.tsx', to: 'components/common/Navigation/index.tsx' },
  { from: 'components/Layout.tsx', to: 'components/common/Layout/index.tsx' },
  { from: 'components/ErrorBoundary.tsx', to: 'components/common/ErrorBoundary/index.tsx' },
  { from: 'components/LoadingSpinner.tsx', to: 'components/common/LoadingSpinner/index.tsx' },
  
  // Feature Components
  { from: 'components/features/tools/youtube-lens/*', to: 'components/features/YouTubeLens/' },
  { from: 'components/features/auth/*', to: 'components/features/Auth/' },
  { from: 'components/features/payment/*', to: 'components/features/Payment/' },
  { from: 'components/features/dashboard/*', to: 'components/features/Dashboard/' },
  { from: 'components/features/courses/*', to: 'components/features/Courses/' },
  { from: 'components/features/community/*', to: 'components/features/Community/' },
];

// Standard folder structure template
const standardStructure = `
📁 src/components/
├── 📁 ui/              # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── ...
├── 📁 common/          # Common reusable components
│   ├── 📁 Header/
│   │   ├── index.tsx
│   │   ├── Header.styles.ts
│   │   └── Header.test.tsx
│   ├── 📁 Footer/
│   │   ├── index.tsx
│   │   ├── Footer.styles.ts
│   │   └── Footer.test.tsx
│   ├── 📁 Navigation/
│   │   ├── index.tsx
│   │   ├── Navigation.styles.ts
│   │   └── Navigation.test.tsx
│   └── 📁 Layout/
│       ├── index.tsx
│       ├── Layout.styles.ts
│       └── Layout.test.tsx
└── 📁 features/        # Feature-specific components
    ├── 📁 YouTubeLens/
    │   ├── index.tsx
    │   ├── YouTubeLens.styles.ts
    │   ├── YouTubeLens.test.tsx
    │   └── 📁 components/
    │       ├── VideoPlayer.tsx
    │       ├── Transcript.tsx
    │       └── Controls.tsx
    ├── 📁 Auth/
    │   ├── index.tsx
    │   ├── LoginForm.tsx
    │   ├── SignupForm.tsx
    │   └── ResetPassword.tsx
    ├── 📁 Payment/
    │   ├── index.tsx
    │   ├── PaymentForm.tsx
    │   ├── SubscriptionCard.tsx
    │   └── PaymentHistory.tsx
    └── 📁 Dashboard/
        ├── index.tsx
        ├── DashboardStats.tsx
        ├── ActivityFeed.tsx
        └── QuickActions.tsx
`;

console.log('====================================');
console.log('📦 Component Structure Reorganization Plan');
console.log('====================================\n');

console.log('📋 CURRENT STRUCTURE ANALYSIS:');
console.log('--------------------------------');

// Check current structure
const componentsDir = path.join(__dirname, '..', 'src', 'components');
if (fs.existsSync(componentsDir)) {
  const dirs = fs.readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log('Existing directories:', dirs.join(', '));
} else {
  console.log('Components directory not found!');
}

console.log('\n📋 PROPOSED MOVES:');
console.log('--------------------------------');
componentMoves.forEach(({ from, to, note }) => {
  if (note) {
    console.log(`  ✅ ${from} (${note})`);
  } else {
    console.log(`  📦 ${from}`);
    console.log(`     → ${to}`);
  }
});

console.log('\n📋 TARGET STRUCTURE:');
console.log('--------------------------------');
console.log(standardStructure);

console.log('\n⚠️  IMPORTANT INSTRUCTIONS:');
console.log('====================================');
console.log('1. This script ONLY shows the plan - NO files are moved automatically');
console.log('2. Use git mv to preserve file history:');
console.log('   git mv src/components/Header.tsx src/components/common/Header/index.tsx');
console.log('3. Update all imports after moving files');
console.log('4. Run type checking after reorganization:');
console.log('   npm run types:check');
console.log('5. Run tests to ensure nothing broke:');
console.log('   npm test');
console.log('\n✨ Manual reorganization ensures safety and preserves git history!\n');

// Create directory structure commands
console.log('📁 DIRECTORY CREATION COMMANDS:');
console.log('--------------------------------');
const dirsToCreate = [
  'src/components/common/Header',
  'src/components/common/Footer',
  'src/components/common/Navigation',
  'src/components/common/Layout',
  'src/components/common/ErrorBoundary',
  'src/components/common/LoadingSpinner',
  'src/components/features/YouTubeLens/components',
  'src/components/features/Auth',
  'src/components/features/Payment',
  'src/components/features/Dashboard',
  'src/components/features/Courses',
  'src/components/features/Community',
];

console.log('# Create directories first:');
dirsToCreate.forEach(dir => {
  console.log(`mkdir -p ${dir}`);
});

console.log('\n📦 GIT MOVE COMMANDS:');
console.log('--------------------------------');
console.log('# Then move files with git:');
componentMoves
  .filter(move => !move.note)
  .forEach(({ from, to }) => {
    if (!from.includes('*')) {
      const fileName = path.basename(from);
      const targetFile = to.endsWith('/') ? `${to}index.tsx` : to;
      console.log(`git mv src/${from} src/${targetFile}`);
    }
  });

console.log('\n✅ After reorganization, run:');
console.log('  npm run types:check');
console.log('  npm test');
console.log('  npm run build');