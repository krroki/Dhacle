#!/usr/bin/env node

/**
 * DB Truth Enforcer Hook
 * 목적: DB 테이블 관련 수정 시 실제 스키마 확인 강제
 * 작동: profiles↔users 반복 패턴 감지 및 차단
 */

const fs = require('fs');
const path = require('path');

// 설정
const CONFIG = {
  historyDir: path.join(__dirname, 'error-history'),
  dbTruthFile: path.join(process.cwd(), 'docs', 'DB_TRUTH.md'),
  maxOscillations: 2,  // 같은 변경 2회 이상 반복 시 경고
  patterns: {
    dbTable: /from\(['"`](\w+)['"`]\)/g,
    profilesUsers: /\b(profiles|users)\b/gi,
    cafeUrl: /\b(cafe_member_url|naver_cafe_member_url)\b/gi
  }
};

// 히스토리 디렉토리 생성
if (!fs.existsSync(CONFIG.historyDir)) {
  fs.mkdirSync(CONFIG.historyDir, { recursive: true });
}

/**
 * 파일별 에러 히스토리 로드
 */
function loadHistory(filePath) {
  const historyFile = path.join(CONFIG.historyDir, `${path.basename(filePath)}.json`);
  if (fs.existsSync(historyFile)) {
    try {
      return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch (e) {
      return { file: filePath, changes: [], patterns: {} };
    }
  }
  return { file: filePath, changes: [], patterns: {} };
}

/**
 * 히스토리 저장
 */
function saveHistory(filePath, history) {
  const historyFile = path.join(CONFIG.historyDir, `${path.basename(filePath)}.json`);
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

/**
 * 반복 패턴 감지
 */
function detectOscillation(history) {
  const recentChanges = history.changes.slice(-4);
  
  // profiles↔users 반복 체크
  const tableChanges = recentChanges
    .filter(c => c.type === 'table_change')
    .map(c => c.to);
  
  if (tableChanges.length >= 4) {
    const pattern = `${tableChanges[0]}-${tableChanges[1]}-${tableChanges[2]}-${tableChanges[3]}`;
    if (pattern === 'users-profiles-users-profiles' || 
        pattern === 'profiles-users-profiles-users') {
      return {
        detected: true,
        pattern: 'profiles↔users',
        message: '⚠️ OSCILLATION DETECTED: profiles↔users 반복 패턴 감지!'
      };
    }
  }
  
  return { detected: false };
}

/**
 * Pre-Edit Hook: 수정 전 검증
 */
function preEditHook(event) {
  const { file_path, old_content, new_content } = event;
  
  // DB 관련 변경 감지
  if (!file_path?.includes('.ts') && !file_path?.includes('.tsx')) {
    return { pass: true };
  }
  
  // profiles/users 변경 감지
  const oldTables = [...(old_content?.matchAll(/from\(['"`](\w+)['"`]\)/g) || [])]
    .map(m => m[1]);
  const newTables = [...(new_content?.matchAll(/from\(['"`](\w+)['"`]\)/g) || [])]
    .map(m => m[1]);
  
  const tableChanged = oldTables.some((old, i) => newTables[i] && old !== newTables[i]);
  
  if (tableChanged) {
    const history = loadHistory(file_path);
    
    // 변경 기록
    history.changes.push({
      date: new Date().toISOString(),
      type: 'table_change',
      from: oldTables[0],
      to: newTables[0],
      line: event.line_number || 0
    });
    
    // 반복 패턴 체크
    const oscillation = detectOscillation(history);
    if (oscillation.detected) {
      console.error('\n' + '='.repeat(60));
      console.error('🔴 DB TRUTH ENFORCER - CRITICAL WARNING');
      console.error('='.repeat(60));
      console.error(oscillation.message);
      console.error('\n📍 파일:', file_path);
      console.error('📊 최근 변경 패턴:', history.changes.slice(-4).map(c => c.to).join(' → '));
      console.error('\n✅ 해결책:');
      console.error('1. docs/DB_TRUTH.md 확인');
      console.error('2. 실제 DB 스키마 확인: npm run types:generate');
      console.error('3. 카페 인증은 users 테이블 사용!');
      console.error('='.repeat(60) + '\n');
      
      // 히스토리 저장
      saveHistory(file_path, history);
      
      return {
        pass: false,
        error: 'Oscillation pattern detected! Check docs/DB_TRUTH.md for correct table usage.',
        suggestion: 'Use "users" table for naver_cafe operations, not "profiles".'
      };
    }
    
    // 히스토리 저장
    saveHistory(file_path, history);
  }
  
  return { pass: true };
}

/**
 * Post-Edit Hook: 수정 후 검증
 */
function postEditHook(event) {
  const { file_path, new_content, success } = event;
  
  if (!success) {
    const history = loadHistory(file_path);
    const lastChange = history.changes[history.changes.length - 1];
    if (lastChange) {
      lastChange.success = false;
      lastChange.revertedAt = new Date().toISOString();
      saveHistory(file_path, history);
    }
  }
  
  // DB_TRUTH.md 리마인더
  if (new_content?.includes('from(') && Math.random() < 0.3) {  // 30% 확률로 리마인더
    console.log('\n💡 Reminder: Check docs/DB_TRUTH.md for correct table usage');
  }
  
  return { pass: true };
}

// Hook 실행
const hookType = process.argv[2];
const eventData = JSON.parse(process.env.CLAUDE_HOOK_EVENT || '{}');

try {
  if (hookType === 'pre-edit') {
    const result = preEditHook(eventData);
    if (!result.pass) {
      console.error(result.error);
      if (result.suggestion) {
        console.log('💡 Suggestion:', result.suggestion);
      }
      process.exit(1);
    }
  } else if (hookType === 'post-edit') {
    postEditHook(eventData);
  }
} catch (error) {
  console.error('Hook Error:', error.message);
  // Hook 에러는 작업을 방해하지 않도록 pass
  process.exit(0);
}

process.exit(0);