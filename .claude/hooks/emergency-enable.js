#!/usr/bin/env node

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
  
  console.log('\n🎉 Hooks are now re-enabled!');
}

enableHooks();
