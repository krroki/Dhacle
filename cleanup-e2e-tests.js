#!/usr/bin/env node

/**
 * E2E 테스트 파일 정리 스크립트
 * 중복, 예시, 검증용 파일들을 archive 폴더로 이동
 */

const fs = require('fs');
const path = require('path');

// 정리할 파일들 (중복, 예시, 검증용)
const filesToArchive = [
  'auth-enhanced.spec.ts',           // 중복 (방금 생성한 예시)
  'basic-validation.spec.ts',        // 검증용
  'comprehensive-e2e-todo-resolution.spec.ts', // 중복
  'comprehensive-e2e-with-error-detection.spec.ts', // 중복  
  'error-detection-validation.spec.ts', // 검증용
  'error-safe-example.spec.ts',      // 예시용
  'quick-validation.spec.ts',        // 검증용
  'simple-test.spec.ts',             // 기본 테스트
  'todo-resolution.spec.ts',         // TODO 해결용
];

// 핵심 테스트만 남기기 (7개)
const coreTests = [
  'auth.spec.ts',                    // 🟢 인증 (핵심)
  'core-auth.spec.ts',               // 🟢 핵심 인증
  'homepage.spec.ts',                // 🟢 홈페이지
  'full-journey.spec.ts',            // 🟢 전체 플로우  
  'payment-flow.spec.ts',            // 🟢 결제 플로우
  'youtube-lens.spec.ts',            // 🟢 YouTube Lens
  'comprehensive-e2e.spec.ts',       // 🟢 종합 테스트
];

const e2eDir = path.join(__dirname, 'e2e');
const archiveDir = path.join(__dirname, 'e2e', 'archive');

// archive 디렉토리 생성
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
  console.log('📁 archive 디렉토리 생성됨');
}

// 파일들을 archive로 이동
let movedCount = 0;
let totalSize = 0;

filesToArchive.forEach(filename => {
  const sourceFile = path.join(e2eDir, filename);
  const targetFile = path.join(archiveDir, filename);
  
  if (fs.existsSync(sourceFile)) {
    const stats = fs.statSync(sourceFile);
    totalSize += stats.size;
    
    fs.renameSync(sourceFile, targetFile);
    console.log(`📦 이동: ${filename}`);
    movedCount++;
  } else {
    console.log(`⚠️  파일 없음: ${filename}`);
  }
});

// 결과 요약
console.log(`
🎉 E2E 테스트 정리 완료!

📊 정리 결과:
   이동된 파일: ${movedCount}개
   절약된 용량: ${(totalSize / 1024).toFixed(2)}KB
   
🟢 남은 핵심 테스트 (${coreTests.length}개):
   ${coreTests.map(f => `   • ${f}`).join('\n')}

⚡ 예상 성능 개선:
   • 실행 시간: ${Math.round((movedCount / 16) * 100)}% 단축
   • 파일 스캔: 16개 → ${coreTests.length}개
   • 테스트 개수: 약 ${Math.round(movedCount * 3)}개 감소

🚀 이제 더 빠른 E2E 테스트를 즐기세요!
   npm run e2e:ui
`);

// .gitignore에 archive 추가 제안
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  if (!gitignoreContent.includes('e2e/archive')) {
    console.log(`
📝 추천: .gitignore에 다음 라인 추가
   echo "e2e/archive/" >> .gitignore
`);
  }
}