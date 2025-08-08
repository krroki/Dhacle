const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function verifyNavigationBar() {
  const checks = {
    component_file_created: false,
    hook_file_created: false,
    storybook_file_created: false,
    typescript_errors: 0,
    nav_items_implemented: 0,
    glassmorphism_applied: false,
    sticky_positioning: false,
    mobile_menu_functional: false,
    kakao_login_present: false,
    scroll_effect_working: false,
    aria_attributes_present: false,
    hardcoded_colors: 0,
    token_imports_valid: false,
    build_success: false,
    git_committed: false
  };

  // Check component file exists
  const componentPath = path.join(__dirname, '..', 'src/components/NavigationBar.tsx');
  if (fs.existsSync(componentPath)) {
    checks.component_file_created = true;
    
    // Read component content
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Check for token imports
    checks.token_imports_valid = content.includes("from '../styles/tokens") || 
                                 content.includes('from "../styles/tokens"');
    
    // Check for hardcoded colors (hex codes or rgb values)
    // Exclude Kakao colors which are allowed
    const hardcodedMatches = content.match(/#[0-9A-Fa-f]{3,6}(?![0-9A-Za-z])|rgb\([^)]+\)/g);
    const allowedColors = ['#FEE500', '#FDD835', '#191919']; // Kakao colors
    if (hardcodedMatches) {
      const violations = hardcodedMatches.filter(color => !allowedColors.includes(color));
      checks.hardcoded_colors = violations.length;
    }
    
    // Count navigation items
    const navItems = ['홈', '강의', '템플릿', '도구', '커뮤니티'];
    navItems.forEach(item => {
      if (content.includes(item)) {
        checks.nav_items_implemented++;
      }
    });
    
    // Check for glassmorphism
    checks.glassmorphism_applied = content.includes('backdrop-filter') && 
                                   content.includes('blur');
    
    // Check for sticky positioning
    checks.sticky_positioning = content.includes('position: sticky');
    
    // Check for mobile menu
    checks.mobile_menu_functional = content.includes('isMobileMenuOpen') && 
                                   content.includes('FiMenu');
    
    // Check for Kakao login
    checks.kakao_login_present = content.includes('카카오 로그인') || 
                                 content.includes('KakaoLogin');
    
    // Check for scroll effect
    checks.scroll_effect_working = content.includes('useScrollPosition') || 
                                   content.includes('isScrolled');
    
    // Check for ARIA attributes
    const ariaAttributes = ['role="navigation"', 'aria-label', 'aria-expanded', 'aria-current'];
    checks.aria_attributes_present = ariaAttributes.some(attr => content.includes(attr));
  }

  // Check hook file
  const hookPath = path.join(__dirname, '..', 'src/hooks/useScrollPosition.ts');
  if (fs.existsSync(hookPath)) {
    checks.hook_file_created = true;
  }

  // Check Storybook file
  const storybookPath = path.join(__dirname, '..', 'src/components/NavigationBar.stories.tsx');
  checks.storybook_file_created = fs.existsSync(storybookPath);

  // Check TypeScript compilation
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    checks.typescript_errors = 0;
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : '';
    const errorCount = (output.match(/error TS/g) || []).length;
    checks.typescript_errors = errorCount;
  }

  // Check build (if storybook exists)
  if (checks.storybook_file_created) {
    try {
      console.log('Building Storybook...');
      execSync('npm run storybook:build', { stdio: 'pipe' });
      checks.build_success = true;
    } catch (error) {
      checks.build_success = false;
    }
  }

  // Check git status
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    checks.git_committed = gitStatus.trim().length === 0;
  } catch (error) {
    checks.git_committed = false;
  }

  // Determine validation status
  const validation_passed = 
    checks.component_file_created &&
    checks.hook_file_created &&
    checks.storybook_file_created &&
    checks.typescript_errors === 0 &&
    checks.nav_items_implemented === 5 &&
    checks.glassmorphism_applied &&
    checks.sticky_positioning &&
    checks.mobile_menu_functional &&
    checks.kakao_login_present &&
    checks.scroll_effect_working &&
    checks.aria_attributes_present &&
    checks.hardcoded_colors === 0 &&
    checks.token_imports_valid;

  // Write result
  const resultPath = path.join(__dirname, '..', 'task-result.json');
  const result = {
    task_id: 'TASK-2024-005',
    status: validation_passed ? 'completed' : 'failed',
    ...checks,
    timestamp: new Date().toISOString(),
    validation_details: {
      expected_nav_items: 5,
      found_nav_items: checks.nav_items_implemented,
      has_glassmorphism: checks.glassmorphism_applied,
      has_sticky: checks.sticky_positioning,
      has_mobile_menu: checks.mobile_menu_functional,
      has_kakao_login: checks.kakao_login_present,
      has_scroll_effect: checks.scroll_effect_working,
      has_accessibility: checks.aria_attributes_present,
      has_hardcoded_colors: checks.hardcoded_colors > 0,
      uses_design_tokens: checks.token_imports_valid
    }
  };

  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

  // Console output
  console.log('\n=== NavigationBar Component Verification ===\n');
  console.log(`✓ Component file: ${checks.component_file_created ? '✅' : '❌'}`);
  console.log(`✓ Hook file: ${checks.hook_file_created ? '✅' : '❌'}`);
  console.log(`✓ Storybook file: ${checks.storybook_file_created ? '✅' : '❌'}`);
  console.log(`✓ TypeScript errors: ${checks.typescript_errors === 0 ? '✅' : `❌ (${checks.typescript_errors} errors)`}`);
  console.log(`✓ Nav items (5): ${checks.nav_items_implemented === 5 ? '✅' : `❌ (${checks.nav_items_implemented}/5)`}`);
  console.log(`✓ Glassmorphism: ${checks.glassmorphism_applied ? '✅' : '❌'}`);
  console.log(`✓ Sticky positioning: ${checks.sticky_positioning ? '✅' : '❌'}`);
  console.log(`✓ Mobile menu: ${checks.mobile_menu_functional ? '✅' : '❌'}`);
  console.log(`✓ Kakao login: ${checks.kakao_login_present ? '✅' : '❌'}`);
  console.log(`✓ Scroll effect: ${checks.scroll_effect_working ? '✅' : '❌'}`);
  console.log(`✓ Accessibility: ${checks.aria_attributes_present ? '✅' : '❌'}`);
  console.log(`✓ No hardcoded colors: ${checks.hardcoded_colors === 0 ? '✅' : `❌ (${checks.hardcoded_colors} found)`}`);
  console.log(`✓ Token imports: ${checks.token_imports_valid ? '✅' : '❌'}`);
  console.log(`\nOverall: ${validation_passed ? '✅ PASSED' : '❌ FAILED'}\n`);

  process.exit(validation_passed ? 0 : 1);
}

verifyNavigationBar();