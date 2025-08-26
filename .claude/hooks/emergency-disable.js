#!/usr/bin/env node

/**
 * emergency-disable.js - Emergency disable script for Claude Code hooks
 * 
 * Use this script when hooks are causing problems and need to be disabled quickly.
 * Run with: node .claude/hooks/emergency-disable.js
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

/**
 * Backup a file before modifying
 */
function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }
  return null;
}

/**
 * Disable hooks in settings.json
 */
function disableInSettings() {
  const settingsPath = path.join(__dirname, '../../settings.json');
  
  if (!fs.existsSync(settingsPath)) {
    console.log(`${COLORS.YELLOW}⚠️  No settings.json found${COLORS.RESET}`);
    return false;
  }
  
  // Backup first
  const backupPath = backupFile(settingsPath);
  console.log(`📁 Backed up settings.json to: ${backupPath}`);
  
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    
    // Rename hooks to hooks_disabled to deactivate
    if (settings.hooks) {
      settings.hooks_disabled = settings.hooks;
      delete settings.hooks;
      
      // Add a note
      settings._hooks_disabled_at = new Date().toISOString();
      settings._hooks_disabled_reason = 'Emergency disable via script';
      
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.log(`${COLORS.GREEN}✅ Disabled hooks in settings.json${COLORS.RESET}`);
      return true;
    } else {
      console.log(`${COLORS.YELLOW}⚠️  No hooks found in settings.json${COLORS.RESET}`);
      return false;
    }
  } catch (error) {
    console.error(`${COLORS.RED}❌ Failed to modify settings.json: ${error.message}${COLORS.RESET}`);
    return false;
  }
}

/**
 * Disable hooks in config.json
 */
function disableInConfig() {
  const configPath = path.join(__dirname, 'config.json');
  
  if (!fs.existsSync(configPath)) {
    console.log(`${COLORS.YELLOW}⚠️  No config.json found${COLORS.RESET}`);
    return false;
  }
  
  // Backup first
  const backupPath = backupFile(configPath);
  console.log(`📁 Backed up config.json to: ${backupPath}`);
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // Disable all validators
    config.enabled = false;
    config._disabled_at = new Date().toISOString();
    config._disabled_reason = 'Emergency disable';
    
    // Disable individual validators too
    if (config.validators) {
      for (const validator in config.validators) {
        config.validators[validator].enabled = false;
      }
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`${COLORS.GREEN}✅ Disabled all validators in config.json${COLORS.RESET}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.RED}❌ Failed to modify config.json: ${error.message}${COLORS.RESET}`);
    return false;
  }
}

/**
 * Create a disable flag file
 */
function createDisableFlag() {
  const flagPath = path.join(__dirname, 'DISABLED');
  
  const content = `Claude Code Hooks Emergency Disable
====================================
Disabled at: ${new Date().toISOString()}
Reason: Emergency disable via script

To re-enable:
1. Delete this file
2. Run: node .claude/hooks/emergency-enable.js
3. Or manually edit config.json and settings.json
`;
  
  fs.writeFileSync(flagPath, content);
  console.log(`${COLORS.GREEN}✅ Created DISABLED flag file${COLORS.RESET}`);
  return true;
}

/**
 * Show status after disabling
 */
function showStatus() {
  console.log(`\n${COLORS.BLUE}📊 Current Status:${COLORS.RESET}`);
  
  // Check settings.json
  const settingsPath = path.join(__dirname, '../../settings.json');
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    if (settings.hooks) {
      console.log(`   settings.json: ${COLORS.RED}⚠️  Still has hooks (may need manual edit)${COLORS.RESET}`);
    } else {
      console.log(`   settings.json: ${COLORS.GREEN}✅ Hooks disabled${COLORS.RESET}`);
    }
  }
  
  // Check config.json
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log(`   config.json: ${config.enabled ? COLORS.RED + '❌ Enabled' : COLORS.GREEN + '✅ Disabled'}${COLORS.RESET}`);
  }
  
  // Check flag file
  const flagPath = path.join(__dirname, 'DISABLED');
  if (fs.existsSync(flagPath)) {
    console.log(`   DISABLED flag: ${COLORS.GREEN}✅ Present${COLORS.RESET}`);
  }
}

/**
 * Create re-enable script
 */
function createEnableScript() {
  const scriptPath = path.join(__dirname, 'emergency-enable.js');
  
  const content = `#!/usr/bin/env node

/**
 * emergency-enable.js - Re-enable Claude Code hooks
 * Run with: node .claude/hooks/emergency-enable.js
 */

const fs = require('fs');
const path = require('path');

function enableHooks() {
  // Re-enable in settings.json
  const settingsPath = path.join(__dirname, '../../settings.json');
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    if (settings.hooks_disabled) {
      settings.hooks = settings.hooks_disabled;
      delete settings.hooks_disabled;
      delete settings._hooks_disabled_at;
      delete settings._hooks_disabled_reason;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.log('✅ Re-enabled hooks in settings.json');
    }
  }
  
  // Re-enable in config.json
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config.enabled = true;
    delete config._disabled_at;
    delete config._disabled_reason;
    
    if (config.validators) {
      for (const validator in config.validators) {
        config.validators[validator].enabled = true;
      }
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Re-enabled validators in config.json');
  }
  
  // Remove flag file
  const flagPath = path.join(__dirname, 'DISABLED');
  if (fs.existsSync(flagPath)) {
    fs.unlinkSync(flagPath);
    console.log('✅ Removed DISABLED flag');
  }
  
  console.log('\\n🎉 Hooks are now re-enabled!');
}

enableHooks();
`;
  
  fs.writeFileSync(scriptPath, content);
  console.log(`${COLORS.GREEN}✅ Created emergency-enable.js script${COLORS.RESET}`);
}

/**
 * Main execution
 */
function main() {
  console.log(`${COLORS.RED}🚨 EMERGENCY HOOK DISABLE 🚨${COLORS.RESET}`);
  console.log('============================\n');
  
  console.log('This will disable all Claude Code hooks to resolve any issues.\n');
  
  // Perform disable operations
  console.log(`${COLORS.YELLOW}🔧 Disabling hooks...${COLORS.RESET}\n`);
  
  disableInSettings();
  disableInConfig();
  createDisableFlag();
  createEnableScript();
  
  // Show final status
  showStatus();
  
  console.log(`\n${COLORS.GREEN}✅ Emergency disable complete!${COLORS.RESET}`);
  console.log('\n📝 Next steps:');
  console.log('1. Try your operation again - hooks should be disabled');
  console.log('2. To re-enable hooks: node .claude/hooks/emergency-enable.js');
  console.log('3. To selectively enable: Edit .claude/hooks/config.json');
  console.log('\n💡 Tips:');
  console.log('• You can also set environment variable: CLAUDE_HOOKS_ENABLED=false');
  console.log('• Individual validators can be disabled in config.json');
  console.log('• Check backup files if you need to restore settings');
}

// Run if executed directly
if (require.main === module) {
  main();
}