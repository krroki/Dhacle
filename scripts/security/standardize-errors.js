#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 0 - Task 1
 * API Routes 에러 메시지 표준화 스크립트
 * 
 * 목적: 모든 API route의 401 에러 메시지를 'User not authenticated'로 통일
 * 대상: 37개 API route 파일
 */

const fs = require('fs').promises;
const path = require('path');

// 표준 에러 메시지
const STANDARD_ERROR_MESSAGE = 'User not authenticated';
const STANDARD_ERROR_RESPONSE = `JSON.stringify({ error: '${STANDARD_ERROR_MESSAGE}' })`;

// 에러 메시지 패턴들
const ERROR_PATTERNS = [
  // 현재 발견된 패턴들
  /JSON\.stringify\(\s*{\s*error:\s*['"`]Unauthorized['"`]\s*}\s*\)/g,
  /JSON\.stringify\(\s*{\s*error:\s*['"`]로그인이 필요합니다\.?['"`]\s*}\s*\)/g,
  /JSON\.stringify\(\s*{\s*error:\s*['"`]Authentication required['"`]\s*}\s*\)/g,
  /JSON\.stringify\(\s*{\s*error:\s*['"`]Not authenticated['"`]\s*}\s*\)/g,
  /JSON\.stringify\(\s*{\s*error:\s*['"`]Please login['"`]\s*}\s*\)/g,
  /JSON\.stringify\(\s*{\s*error:\s*['"`]인증이 필요합니다['"`]\s*}\s*\)/g,
  
  // Response 객체 패턴
  /new\s+Response\(\s*JSON\.stringify\(\s*{\s*error:\s*['"`]Unauthorized['"`]\s*}\s*\)/g,
  /new\s+Response\(\s*JSON\.stringify\(\s*{\s*error:\s*['"`]로그인이 필요합니다\.?['"`]\s*}\s*\)/g,
  
  // NextResponse 패턴
  /NextResponse\.json\(\s*{\s*error:\s*['"`]Unauthorized['"`]\s*}\s*,\s*{\s*status:\s*401\s*}\s*\)/g,
  /NextResponse\.json\(\s*{\s*error:\s*['"`]로그인이 필요합니다\.?['"`]\s*}\s*,\s*{\s*status:\s*401\s*}\s*\)/g,
];

// API route 파일 찾기
async function findAPIRoutes(dir) {
  const routes = [];
  
  async function traverse(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // node_modules와 .next 제외
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await traverse(fullPath);
        }
      } else if (entry.isFile() && entry.name === 'route.ts') {
        // API route 파일 찾기
        if (fullPath.includes(path.join('app', 'api'))) {
          routes.push(fullPath);
        }
      }
    }
  }
  
  await traverse(dir);
  return routes;
}

// 파일 내용 수정
async function standardizeErrorMessages(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;
    let changeCount = 0;
    
    // 각 패턴에 대해 교체
    for (const pattern of ERROR_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, (match) => {
          // Response 객체 패턴인 경우
          if (match.includes('new Response')) {
            return `new Response(${STANDARD_ERROR_RESPONSE}`;
          }
          // NextResponse 패턴인 경우
          if (match.includes('NextResponse')) {
            return `NextResponse.json({ error: '${STANDARD_ERROR_MESSAGE}' }, { status: 401 })`;
          }
          // 일반 JSON.stringify 패턴
          return STANDARD_ERROR_RESPONSE;
        });
        changeCount += matches.length;
        modified = true;
      }
    }
    
    // 401 상태 코드와 함께 사용되는 다른 패턴들도 확인
    const has401 = content.includes('401');
    const hasAuthCheck = content.includes('!user') || content.includes('getUser()');
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8');
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relativePath}: ${changeCount}개 에러 메시지 표준화`);
      return { modified: true, changeCount };
    } else if (has401 && hasAuthCheck) {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`ℹ️  ${relativePath}: 인증 체크 있음 (수정 불필요)`);
      return { modified: false, hasAuth: true };
    }
    
    return { modified: false };
  } catch (error) {
    console.error(`❌ 파일 처리 실패: ${filePath}`, error.message);
    return { error: true };
  }
}

// 메인 실행 함수
async function main() {
  console.log('🔐 보안 리팩토링: Wave 0 - Task 1');
  console.log('📋 API Routes 에러 메시지 표준화 시작\n');
  
  const projectRoot = path.resolve(__dirname, '../../');
  const apiDir = path.join(projectRoot, 'src', 'app', 'api');
  
  console.log(`🔍 API 디렉토리 스캔: ${apiDir}\n`);
  
  // API route 파일 찾기
  const routes = await findAPIRoutes(apiDir);
  console.log(`📁 발견된 API routes: ${routes.length}개\n`);
  
  // 통계
  let totalModified = 0;
  let totalChanges = 0;
  let totalWithAuth = 0;
  let totalErrors = 0;
  
  // 각 파일 처리
  for (const route of routes) {
    const result = await standardizeErrorMessages(route);
    if (result.modified) {
      totalModified++;
      totalChanges += result.changeCount;
    } else if (result.hasAuth) {
      totalWithAuth++;
    } else if (result.error) {
      totalErrors++;
    }
  }
  
  // 결과 출력
  console.log('\n' + '='.repeat(50));
  console.log('📊 작업 완료 통계:');
  console.log(`  - 총 API routes: ${routes.length}개`);
  console.log(`  - 수정된 파일: ${totalModified}개`);
  console.log(`  - 변경된 에러 메시지: ${totalChanges}개`);
  console.log(`  - 이미 표준화됨: ${totalWithAuth}개`);
  console.log(`  - 처리 실패: ${totalErrors}개`);
  console.log('='.repeat(50));
  
  if (totalModified > 0) {
    console.log('\n✅ Wave 0 - Task 1 완료!');
    console.log('📝 다음 단계: npm run test:security:wave0');
  } else if (totalWithAuth === routes.length) {
    console.log('\n✅ 모든 API routes가 이미 표준화되어 있습니다.');
  }
  
  // coverage 파일 업데이트
  await updateCoverage(routes.length, totalModified, totalChanges);
}

// coverage.md 파일 업데이트
async function updateCoverage(total, modified, changes) {
  const coveragePath = path.resolve(__dirname, '../../docs/security/coverage.md');
  try {
    let content = await fs.readFile(coveragePath, 'utf-8');
    
    // Task 1 진행률 업데이트
    const progress = Math.round((modified / total) * 100);
    content = content.replace(
      /Task 1: 에러 메시지 표준화 \(0\/37\)/,
      `Task 1: 에러 메시지 표준화 (${modified}/${total})`
    );
    
    // Wave 0 진행률 업데이트
    content = content.replace(
      /Wave 0: \[⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜\] 0%/,
      `Wave 0: [${'🟦'.repeat(Math.floor(progress/10))}${'⬜'.repeat(10-Math.floor(progress/10))}] ${progress}%`
    );
    
    // 실시간 업데이트 로그 추가
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const logEntry = `- ${now} - Wave 0 Task 1: ${modified}/${total} API routes 에러 메시지 표준화 (${changes}개 변경)`;
    
    content = content.replace(
      /### 2025-01-23\n(.*)/,
      `### 2025-01-23\n$1\n${logEntry}`
    );
    
    await fs.writeFile(coveragePath, content, 'utf-8');
    console.log('\n📊 coverage.md 업데이트 완료');
  } catch (error) {
    console.error('⚠️ coverage.md 업데이트 실패:', error.message);
  }
}

// 실행
main().catch(console.error);