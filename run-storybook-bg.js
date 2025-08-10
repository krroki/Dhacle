const { spawn } = require('child_process');

// Storybook을 백그라운드로 실행
const storybook = spawn('npm', ['run', 'storybook'], {
  detached: false,
  stdio: 'ignore',
  shell: true
});

console.log('✅ Storybook started in background (PID:', storybook.pid, ')');
console.log('🌐 Opening at http://localhost:6006');
console.log('⏳ Waiting for Storybook to be ready...');

// 10초 후 종료
setTimeout(() => {
  console.log('✅ Background process will continue running');
  process.exit(0);
}, 10000);