#!/usr/bin/env node

/**
 * E2E 테스트 완료 후 자동 실행되는 훅
 * 테스트 완료 시 불필요한 파일들을 자동으로 정리
 */

const { spawn } = require('child_process');
const path = require('path');

async function postTestCleanup() {
  console.log('\n🧹 테스트 완료 후 자동 정리 시작...');
  
  try {
    // 자동 아카이브 실행
    const autoArchive = spawn('node', [path.join(__dirname, 'auto-archive.js'), 'run'], {
      cwd: path.dirname(__dirname),
      stdio: 'inherit'
    });
    
    autoArchive.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 테스트 파일 자동 정리 완료');
        
        // 통계 표시
        const stats = spawn('node', [path.join(__dirname, 'auto-archive.js'), 'stats'], {
          cwd: path.dirname(__dirname),
          stdio: 'inherit'
        });
      } else {
        console.log('⚠️ 자동 정리 중 문제가 발생했지만 계속 진행합니다.');
      }
    });
    
  } catch (error) {
    console.log('⚠️ 자동 정리 실행 실패:', error.message);
  }
}

// 즉시 실행
if (require.main === module) {
  postTestCleanup();
}

module.exports = postTestCleanup;