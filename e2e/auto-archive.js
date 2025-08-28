#!/usr/bin/env node

/**
 * E2E 테스트 자동 아카이브 시스템
 * 테스트 완료 후 불필요한 파일들을 자동으로 archive 폴더로 이동
 */

const fs = require('fs');
const path = require('path');

const AUTO_ARCHIVE_CONFIG = {
  // 자동으로 archive할 파일명 패턴
  patterns: [
    /test-.*\.spec\.ts$/,        // test-로 시작하는 임시 테스트
    /demo-.*\.spec\.ts$/,        // demo-로 시작하는 데모 테스트
    /sample-.*\.spec\.ts$/,      // sample-로 시작하는 샘플 테스트
    /temp-.*\.spec\.ts$/,        // temp-로 시작하는 임시 테스트
    /backup-.*\.spec\.ts$/,      // backup-으로 시작하는 백업 테스트
    /old-.*\.spec\.ts$/,         // old-로 시작하는 구 버전 테스트
    /.*-test\.spec\.ts$/,        // -test로 끝나는 테스트
    /.*-demo\.spec\.ts$/,        // -demo로 끝나는 테스트
    /.*-backup\.spec\.ts$/,      // -backup으로 끝나는 테스트
  ],
  
  // 중복된 기능을 테스트하는 파일들
  duplicates: {
    'auth.spec.ts': ['auth-enhanced.spec.ts', 'core-auth.spec.ts'], // auth 관련 중복 시 enhanced, core-auth 우선 archive
    'homepage.spec.ts': ['home-*.spec.ts', 'main-*.spec.ts'],
    'payment-flow.spec.ts': ['payment-*.spec.ts', 'billing-*.spec.ts'],
  },
  
  // 자동 archive 제외할 핵심 파일들
  protectedFiles: [
    'auth.spec.ts',
    'homepage.spec.ts', 
    'payment-flow.spec.ts',
    'youtube-lens.spec.ts',
    'full-journey.spec.ts',
  ]
};

class AutoArchiveSystem {
  constructor() {
    this.e2eDir = path.join(__dirname);
    this.archiveDir = path.join(__dirname, 'archive');
    this.logFile = path.join(__dirname, 'archive-log.txt');
  }
  
  /**
   * 메인 실행 함수
   */
  async run() {
    console.log('🤖 E2E 테스트 자동 아카이브 시작...');
    
    // archive 디렉토리 확인/생성
    this.ensureArchiveDir();
    
    // 아카이브할 파일 검색
    const filesToArchive = this.findFilesToArchive();
    
    if (filesToArchive.length === 0) {
      console.log('✅ 아카이브할 파일이 없습니다.');
      return;
    }
    
    // 파일 이동 및 로그 기록
    await this.archiveFiles(filesToArchive);
    
    console.log(`🎉 자동 아카이브 완료: ${filesToArchive.length}개 파일 이동`);
  }
  
  /**
   * archive 디렉토리 확인/생성
   */
  ensureArchiveDir() {
    if (!fs.existsSync(this.archiveDir)) {
      fs.mkdirSync(this.archiveDir, { recursive: true });
      console.log('📁 archive 디렉토리 생성됨');
    }
  }
  
  /**
   * 아카이브할 파일들을 찾기
   */
  findFilesToArchive() {
    const files = fs.readdirSync(this.e2eDir)
      .filter(file => file.endsWith('.spec.ts'))
      .filter(file => !AUTO_ARCHIVE_CONFIG.protectedFiles.includes(file));
    
    const toArchive = [];
    
    // 1. 패턴 매칭으로 찾기
    files.forEach(file => {
      const shouldArchive = AUTO_ARCHIVE_CONFIG.patterns.some(pattern => 
        pattern.test(file)
      );
      
      if (shouldArchive) {
        toArchive.push({
          file,
          reason: '임시/데모/샘플 파일 패턴'
        });
      }
    });
    
    // 2. 중복 파일 찾기
    Object.entries(AUTO_ARCHIVE_CONFIG.duplicates).forEach(([mainFile, duplicatePatterns]) => {
      if (files.includes(mainFile)) {
        duplicatePatterns.forEach(pattern => {
          const matches = files.filter(file => 
            new RegExp(pattern.replace('*', '.*')).test(file)
          );
          
          matches.forEach(match => {
            if (!toArchive.find(item => item.file === match)) {
              toArchive.push({
                file: match,
                reason: `${mainFile}와 중복 기능`
              });
            }
          });
        });
      }
    });
    
    return toArchive;
  }
  
  /**
   * 파일들을 archive 폴더로 이동
   */
  async archiveFiles(filesToArchive) {
    const timestamp = new Date().toISOString();
    let logEntry = `\n--- ${timestamp} ---\n`;
    
    for (const { file, reason } of filesToArchive) {
      const sourcePath = path.join(this.e2eDir, file);
      const targetPath = path.join(this.archiveDir, file);
      
      try {
        if (fs.existsSync(sourcePath)) {
          // 같은 이름 파일이 archive에 있으면 timestamp 추가
          let finalTargetPath = targetPath;
          if (fs.existsSync(targetPath)) {
            const nameWithoutExt = path.parse(file).name;
            const ext = path.parse(file).ext;
            const timestampSuffix = Date.now();
            finalTargetPath = path.join(this.archiveDir, `${nameWithoutExt}-${timestampSuffix}${ext}`);
          }
          
          fs.renameSync(sourcePath, finalTargetPath);
          console.log(`📦 이동: ${file} (${reason})`);
          logEntry += `  ✅ ${file} -> archive/ (${reason})\n`;
        }
      } catch (error) {
        console.error(`❌ 에러: ${file} 이동 실패`, error.message);
        logEntry += `  ❌ ${file} 이동 실패: ${error.message}\n`;
      }
    }
    
    // 로그 파일에 기록
    fs.appendFileSync(this.logFile, logEntry);
  }
  
  /**
   * 수동 실행: 특정 파일 아카이브
   */
  static async archiveFile(filename, reason = '수동 아카이브') {
    const system = new AutoArchiveSystem();
    system.ensureArchiveDir();
    
    await system.archiveFiles([{ file: filename, reason }]);
    console.log(`🎯 ${filename} 수동 아카이브 완료`);
  }
  
  /**
   * 통계 보기
   */
  static showStats() {
    const system = new AutoArchiveSystem();
    const archiveDir = system.archiveDir;
    
    if (!fs.existsSync(archiveDir)) {
      console.log('📊 아카이브된 파일이 없습니다.');
      return;
    }
    
    const archivedFiles = fs.readdirSync(archiveDir).filter(f => f.endsWith('.spec.ts'));
    const currentFiles = fs.readdirSync(system.e2eDir).filter(f => f.endsWith('.spec.ts'));
    
    console.log(`
📊 E2E 테스트 파일 통계:
   현재 활성화: ${currentFiles.length}개
   아카이브됨: ${archivedFiles.length}개
   전체: ${currentFiles.length + archivedFiles.length}개
   
🎯 아카이브 효과:
   실행 시간 단축: ${Math.round((archivedFiles.length / (currentFiles.length + archivedFiles.length)) * 100)}%
   관리 복잡성 감소: ${archivedFiles.length}개 파일 정리됨
`);
    
    if (fs.existsSync(system.logFile)) {
      console.log('\n📜 최근 아카이브 로그:');
      const logContent = fs.readFileSync(system.logFile, 'utf-8');
      const recentLogs = logContent.split('\n---').slice(-3).join('\n---');
      console.log(recentLogs);
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const command = process.argv[2];
  const filename = process.argv[3];
  
  switch (command) {
    case 'run':
      new AutoArchiveSystem().run();
      break;
    case 'archive':
      if (!filename) {
        console.error('사용법: node auto-archive.js archive <파일명>');
        process.exit(1);
      }
      AutoArchiveSystem.archiveFile(filename);
      break;
    case 'stats':
      AutoArchiveSystem.showStats();
      break;
    default:
      console.log(`
🤖 E2E 테스트 자동 아카이브 시스템

사용법:
  node auto-archive.js run                    # 자동 아카이브 실행
  node auto-archive.js archive <파일명>       # 특정 파일 아카이브
  node auto-archive.js stats                  # 통계 보기

예시:
  node auto-archive.js run
  node auto-archive.js archive temp-test.spec.ts
  node auto-archive.js stats
`);
  }
}

module.exports = AutoArchiveSystem;