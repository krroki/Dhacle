const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function verifyTokenSystem() {
  const checks = {
    backup_file_created: false,
    tripadvisor_json_valid: false,
    typescript_errors: 0,
    validation_passed: false,
    git_committed: false
  };

  // Check backup file exists
  const backupFiles = fs.readdirSync('.')
    .filter(file => file.startsWith('theme.deep.backup.'));
  checks.backup_file_created = backupFiles.length > 0;

  // Check TripAdvisor JSON exists and is valid
  const tripAdvisorPath = path.join(__dirname, '..', 'theme.tripadvisor.json');
  if (fs.existsSync(tripAdvisorPath)) {
    try {
      const content = fs.readFileSync(tripAdvisorPath, 'utf8');
      JSON.parse(content);
      checks.tripadvisor_json_valid = true;
    } catch (e) {
      checks.tripadvisor_json_valid = false;
    }
  }

  // Check required tokens exist
  if (checks.tripadvisor_json_valid) {
    const tokens = JSON.parse(fs.readFileSync(tripAdvisorPath, 'utf8'));
    const requiredPaths = [
      'colors.primary.green.500',
      'colors.neutral.gray.50',
      'typography.fontFamily.base',
      'components.button.borderRadius.default'
    ];

    const hasAllTokens = requiredPaths.every(path => {
      const value = path.split('.').reduce((obj, key) => obj?.[key], tokens);
      return value !== undefined;
    });

    checks.validation_passed = hasAllTokens;
  }

  // Check if files are committed to git
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const uncommittedFiles = gitStatus
      .split('\n')
      .filter(line => line.includes('theme.tripadvisor.json') || line.includes('theme.deep.backup'));
    
    // Also check if there's a commit with the expected message
    const gitLog = execSync('git log --oneline -10', { encoding: 'utf8' });
    const hasBackupCommit = gitLog.includes('backup:') || gitLog.includes('theme.deep.json');
    const hasFeatureCommit = gitLog.includes('feat:') && gitLog.includes('TripAdvisor');
    
    checks.git_committed = uncommittedFiles.length === 0 && (hasBackupCommit || hasFeatureCommit);
  } catch (e) {
    checks.git_committed = false;
  }

  // Write result
  const resultPath = path.join(__dirname, '..', 'task-result.json');
  fs.writeFileSync(resultPath, JSON.stringify({
    task_id: 'TASK-2024-001',
    status: checks.validation_passed ? 'completed' : 'failed',
    ...checks,
    timestamp: new Date().toISOString()
  }, null, 2));

  console.log('Verification Result:', checks);
  process.exit(checks.validation_passed ? 0 : 1);
}

verifyTokenSystem();