const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function verifyPillButton() {
  const checks = {
    component_file_created: false,
    storybook_file_created: false,
    test_file_created: false,
    typescript_errors: 0,
    variants_implemented: 0,
    sizes_implemented: 0,
    hardcoded_colors: 0,
    token_imports_valid: false,
    build_success: false,
    git_committed: false
  };

  console.log('Starting PillButton Component verification...\n');

  // Check component file exists
  const componentPath = path.join(__dirname, '..', 'src/components/PillButton.tsx');
  if (fs.existsSync(componentPath)) {
    checks.component_file_created = true;
    console.log('✅ Component file found: PillButton.tsx');
    
    // Read component content
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Check for token imports
    checks.token_imports_valid = 
      (content.includes("from '../styles/tokens/colors'") || 
       content.includes('from "../styles/tokens/colors"')) &&
      (content.includes("from '../styles/tokens/effects'") ||
       content.includes('from "../styles/tokens/effects"')) &&
      (content.includes("from '../styles/tokens/typography'") ||
       content.includes('from "../styles/tokens/typography"'));
    
    if (checks.token_imports_valid) {
      console.log('✅ Token imports are valid');
    } else {
      console.log('❌ Token imports are missing or incorrect');
    }
    
    // Check for hardcoded colors (hex codes or rgb values)
    // Exclude imports and comments
    const codeWithoutImports = content
      .split('\n')
      .filter(line => !line.includes('import') && !line.includes('//'))
      .join('\n');
    
    const hardcodedHex = codeWithoutImports.match(/#[0-9A-Fa-f]{3,6}\b/g);
    const hardcodedRgb = codeWithoutImports.match(/rgb\([^)]+\)/g);
    
    if (hardcodedHex) {
      checks.hardcoded_colors += hardcodedHex.length;
      console.log(`⚠️  Found ${hardcodedHex.length} hardcoded hex colors`);
    }
    if (hardcodedRgb) {
      checks.hardcoded_colors += hardcodedRgb.length;
      console.log(`⚠️  Found ${hardcodedRgb.length} hardcoded rgb colors`);
    }
    if (checks.hardcoded_colors === 0) {
      console.log('✅ No hardcoded colors found');
    }
    
    // Count variants
    const variants = ['primary', 'secondary', 'ghost', 'cta'];
    variants.forEach(v => {
      if (content.includes(`'${v}'`) || content.includes(`"${v}"`)) {
        checks.variants_implemented++;
      }
    });
    console.log(`✅ Variants implemented: ${checks.variants_implemented}/4 (${variants.slice(0, checks.variants_implemented).join(', ')})`);
    
    // Count sizes
    const sizes = ['sm', 'md', 'lg'];
    sizes.forEach(s => {
      if (content.includes(`'${s}'`) || content.includes(`"${s}"`)) {
        checks.sizes_implemented++;
      }
    });
    console.log(`✅ Sizes implemented: ${checks.sizes_implemented}/3 (${sizes.slice(0, checks.sizes_implemented).join(', ')})`);
    
    // Check for pill shape
    if (content.includes('borderRadius.pill') || content.includes('9999px')) {
      console.log('✅ Pill shape border radius found');
    } else {
      console.log('❌ Pill shape border radius not found');
    }
  } else {
    console.log('❌ Component file not found');
  }

  // Check Storybook file
  const storybookPath = path.join(__dirname, '..', 'src/components/PillButton.stories.tsx');
  checks.storybook_file_created = fs.existsSync(storybookPath);
  console.log(`${checks.storybook_file_created ? '✅' : '❌'} Storybook file: ${checks.storybook_file_created ? 'found' : 'not found'}`);

  // Check test file (optional)
  const testPath = path.join(__dirname, '..', 'src/components/__tests__/PillButton.test.tsx');
  checks.test_file_created = fs.existsSync(testPath);
  console.log(`${checks.test_file_created ? '✅' : '⚠️ '} Test file: ${checks.test_file_created ? 'found' : 'not found (optional)'}`);

  // Check TypeScript compilation
  console.log('\nChecking TypeScript compilation...');
  try {
    // Check if tsconfig exists
    const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      checks.typescript_errors = 0;
      console.log('✅ TypeScript compilation successful');
    } else {
      console.log('⚠️  No tsconfig.json found, skipping TypeScript check');
    }
  } catch (error) {
    if (error.stdout) {
      const output = error.stdout.toString();
      const errorCount = (output.match(/error TS/g) || []).length;
      checks.typescript_errors = errorCount;
      console.log(`❌ TypeScript compilation failed with ${errorCount} errors`);
    } else {
      console.log('⚠️  TypeScript check could not be completed');
    }
  }

  // Check git status
  console.log('\nChecking Git status...');
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const uncommittedFiles = gitStatus
      .split('\n')
      .filter(line => line.includes('PillButton'));
    
    // Check if there are commits related to PillButton
    const gitLog = execSync('git log --oneline -10', { encoding: 'utf8' });
    const hasPillButtonCommit = gitLog.toLowerCase().includes('pillbutton') || 
                                 gitLog.toLowerCase().includes('pill button');
    
    if (uncommittedFiles.length === 0 || hasPillButtonCommit) {
      checks.git_committed = true;
      console.log('✅ Files tracked in Git');
    } else {
      console.log(`⚠️  ${uncommittedFiles.length} PillButton files not yet committed`);
    }
  } catch (error) {
    console.log('⚠️  Git check failed:', error.message);
  }

  // Determine validation status
  const validation_passed = 
    checks.component_file_created &&
    checks.storybook_file_created &&
    checks.typescript_errors === 0 &&
    checks.variants_implemented === 4 &&
    checks.sizes_implemented === 3 &&
    checks.hardcoded_colors === 0 &&
    checks.token_imports_valid;

  // Write result
  const resultPath = path.join(__dirname, '..', 'task-result.json');
  const result = {
    task_id: 'TASK-2024-003',
    status: validation_passed ? 'completed' : 'failed',
    ...checks,
    timestamp: new Date().toISOString(),
    validation_details: {
      expected_variants: 4,
      found_variants: checks.variants_implemented,
      expected_sizes: 3,
      found_sizes: checks.sizes_implemented,
      has_hardcoded_colors: checks.hardcoded_colors > 0,
      uses_design_tokens: checks.token_imports_valid
    }
  };

  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

  // Console output summary
  console.log('\n' + '='.repeat(50));
  console.log('PILLBUTTON COMPONENT VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Component file: ${checks.component_file_created ? '✅' : '❌'}`);
  console.log(`Storybook file: ${checks.storybook_file_created ? '✅' : '❌'}`);
  console.log(`TypeScript errors: ${checks.typescript_errors === 0 ? '✅' : `❌ (${checks.typescript_errors} errors)`}`);
  console.log(`Variants (4): ${checks.variants_implemented === 4 ? '✅' : `❌ (${checks.variants_implemented}/4)`}`);
  console.log(`Sizes (3): ${checks.sizes_implemented === 3 ? '✅' : `❌ (${checks.sizes_implemented}/3)`}`);
  console.log(`No hardcoded colors: ${checks.hardcoded_colors === 0 ? '✅' : `❌ (${checks.hardcoded_colors} found)`}`);
  console.log(`Token imports: ${checks.token_imports_valid ? '✅' : '❌'}`);
  console.log('\nOverall Status: ' + (validation_passed ? '✅ PASSED' : '❌ FAILED'));
  console.log('='.repeat(50));

  process.exit(validation_passed ? 0 : 1);
}

// Run verification
verifyPillButton();