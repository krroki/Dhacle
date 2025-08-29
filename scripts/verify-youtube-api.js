#!/usr/bin/env node
/**
 * YouTube API 안전 검증 스크립트
 * - 리스크 없이 YouTube API 사용 패턴만 검증
 * - 수정 없음, 검증만 수행
 * - Pre-commit hook 통합용
 * 
 * 중요: 이 스크립트는 READ-ONLY입니다.
 * 파일을 수정하지 않으며, 오직 검증만 수행합니다.
 * 
 * 검증 대상:
 * 1. YouTube API 응답 필드 접근 (camelCase 사용 확인)
 * 2. API Key 하드코딩 방지
 * 3. process.env 직접 접근 차단
 * 
 * 제외 대상:
 * - Database 관련 타입 (DB는 snake_case 사용)
 * - 내부 시스템 타입 (Stats, Record 등)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// YouTube API 관련 파일 패턴
const YOUTUBE_API_PATTERNS = [
  'src/lib/youtube/**/*.ts',
  'src/app/api/youtube/**/*.ts',
  'src/app/api/youtube-lens/**/*.ts',
];

// YouTube Data API v3 공식 필드명 (camelCase)
const YOUTUBE_API_FIELDS = {
  // snippet 필드
  snippet: [
    'channelId',
    'channelTitle',
    'publishedAt',
    'title',
    'description',
    'thumbnails',
    'videoId',
    'resourceId',
    'playlistId',
    'position',
    'tags',
    'categoryId',
    'liveBroadcastContent',
    'defaultLanguage',
    'defaultAudioLanguage',
  ],
  
  // statistics 필드
  statistics: [
    'viewCount',
    'likeCount',
    'dislikeCount',
    'favoriteCount',
    'commentCount',
    'subscriberCount',
    'hiddenSubscriberCount',
    'videoCount',
  ],
  
  // contentDetails 필드
  contentDetails: [
    'duration',
    'dimension',
    'definition',
    'caption',
    'licensedContent',
    'contentRating',
    'projection',
    'hasCustomThumbnail',
    'relatedPlaylists',
    'itemCount',
  ],
  
  // status 필드
  status: [
    'uploadStatus',
    'failureReason',
    'rejectionReason',
    'privacyStatus',
    'publishAt',
    'license',
    'embeddable',
    'publicStatsViewable',
    'madeForKids',
    'selfDeclaredMadeForKids',
  ],
};

// 검증 결과 저장
const validationResults = {
  errors: [],
  warnings: [],
  passed: 0,
  failed: 0,
};

/**
 * 파일에서 YouTube API 응답 접근 패턴 검증
 */
function validateYouTubeAPIAccess(filePath, content) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // YouTube API 응답 객체 접근 패턴 검사
    
    // 1. snake_case로 잘못 접근하는 경우
    const snakeCasePatterns = [
      /snippet\?\.channel_id/g,
      /snippet\?\.channel_title/g,
      /snippet\?\.published_at/g,
      /snippet\?\.category_id/g,  // 추가: categoryId가 올바름
      /snippet\?\.default_language/g,  // 추가: defaultLanguage가 올바름
      /snippet\?\.default_audio_language/g,  // 추가: defaultAudioLanguage가 올바름
      /statistics\?\.view_count/g,
      /statistics\?\.like_count/g,
      /statistics\?\.comment_count/g,
      /statistics\?\.subscriber_count/g,
      /statistics\?\.video_count/g,
      /statistics\?\.hidden_subscriber_count/g,
      /contentDetails\?\.item_count/g,
      /contentDetails\?\.related_playlists/g,
      /contentDetails\?\.content_rating/g,
      /contentDetails\?\.licensed_content/g,
      /resourceId\?\.video_id/g,
      /resourceId\?\.playlist_id/g,
      /resourceId\?\.channel_id/g,
      /status\?\.upload_status/g,
      /status\?\.privacy_status/g,
      /status\?\.failure_reason/g,
      /status\?\.rejection_reason/g,
      /status\?\.publish_at/g,
    ];
    
    snakeCasePatterns.forEach(pattern => {
      const match = line.match(pattern);
      if (match) {
        const fieldName = match[0];
        const correctName = fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        issues.push({
          type: 'error',
          line: index + 1,
          message: `YouTube API 필드 접근 오류: '${fieldName}' → '${correctName}' 사용`,
          code: line.trim(),
        });
      }
    });
    
    // 2. API 응답을 DB에 저장할 때 변환 누락 체크
    if (line.includes('from(') && line.includes('insert(') && line.includes('snippet')) {
      if (!line.includes('camelToSnakeCase') && !line.includes('toSnakeCase')) {
        issues.push({
          type: 'warning',
          line: index + 1,
          message: 'YouTube API 응답을 DB에 저장할 때 camelCase → snake_case 변환 필요',
          code: line.trim(),
        });
      }
    }
    
    // 3. API Key 하드코딩 체크
    if (line.includes('key=') && (line.includes('AIza') || line.includes('eyJ'))) {
      issues.push({
        type: 'error',
        line: index + 1,
        message: 'API Key 하드코딩 금지! env.ts 사용 필수',
        code: line.trim().substring(0, 50) + '...',
      });
    }
    
    // 4. 직접 process.env 접근
    if (line.includes('process.env.YOUTUBE_API_KEY') || line.includes('process.env.YT_')) {
      issues.push({
        type: 'error',
        line: index + 1,
        message: 'process.env 직접 접근 금지! env.ts import 사용',
        code: line.trim(),
      });
    }
  });
  
  return issues;
}

/**
 * YouTube API 타입 정의 검증
 */
function validateYouTubeTypes(filePath, content) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // 타입 정의 시작 감지
    const typeMatch = line.match(/^\s*(type|interface)\s+(\w+)/);
    if (!typeMatch) return;
    
    const typeName = typeMatch[2];
    
    // Database 관련 타입은 제외 (DB 테이블은 snake_case 사용)
    // 중요: DB 테이블 컬럼명은 snake_case가 표준이므로 이런 타입들은 검증에서 제외
    const isDatabaseType = 
      typeName.includes('Database') || 
      typeName.includes('DB') || 
      typeName.includes('database') ||
      typeName.includes('Table') ||
      typeName.includes('Row') ||
      typeName.includes('Stats') ||      // video_stats 테이블 관련
      typeName.includes('Record') ||
      typeName === 'DatabaseVideoStats'; // analysis/route.ts의 DB 타입
    
    // YouTube API Response 타입만 검사
    const isYouTubeAPIType = 
      typeName.includes('YouTube') && 
      !isDatabaseType;
    
    if (!isYouTubeAPIType) return;
    
    // 타입 내용 검사 (다음 20줄)
    const nextLines = lines.slice(index, Math.min(index + 20, lines.length));
    
    nextLines.forEach((nextLine, offset) => {
      // 필드 정의 찾기
      const fieldMatch = nextLine.match(/^\s*(\w+):/);
      if (!fieldMatch) return;
      
      const fieldName = fieldMatch[1];
      
      // snake_case 필드 발견
      if (fieldName.includes('_') && !fieldName.startsWith('_')) {
        const camelCase = fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        issues.push({
          type: 'error',
          line: index + offset + 1,
          message: `YouTube API 타입 정의 오류: '${fieldName}' → '${camelCase}'`,
          code: nextLine.trim(),
        });
      }
    });
  });
  
  return issues;
}

/**
 * 파일 검증 실행
 */
function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // YouTube 관련 파일만 검증
    if (!filePath.includes('youtube') && !filePath.includes('YouTube')) {
      return;
    }
    
    const accessIssues = validateYouTubeAPIAccess(filePath, content);
    const typeIssues = validateYouTubeTypes(filePath, content);
    
    const allIssues = [...accessIssues, ...typeIssues];
    
    if (allIssues.length > 0) {
      validationResults.failed++;
      console.log(`\n❌ ${path.relative(process.cwd(), filePath)}`);
      
      allIssues.forEach(issue => {
        if (issue.type === 'error') {
          validationResults.errors.push({ file: filePath, ...issue });
          console.log(`   L${issue.line}: ❌ ${issue.message}`);
          console.log(`     > ${issue.code}`);
        } else {
          validationResults.warnings.push({ file: filePath, ...issue });
          console.log(`   L${issue.line}: ⚠️  ${issue.message}`);
          console.log(`     > ${issue.code}`);
        }
      });
    } else {
      validationResults.passed++;
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🔍 YouTube API 사용 패턴 검증 시작...\n');
  console.log('=' .repeat(60));
  
  // Git staged 파일 가져오기 (pre-commit에서 사용)
  let filesToCheck = [];
  
  // 명령줄 인자로 --all이 있으면 전체 검사
  const checkAll = process.argv.includes('--all');
  
  if (!checkAll) {
    try {
      const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' })
        .split('\n')
        .filter(file => file && (file.endsWith('.ts') || file.endsWith('.tsx')));
      
      if (stagedFiles.length > 0) {
        filesToCheck = stagedFiles.map(file => path.join(process.cwd(), file));
        console.log(`📋 Staged 파일 ${stagedFiles.length}개 검증\n`);
      }
    } catch (error) {
      // Git 명령 실패 시 안내 메시지
      console.log('📋 Staged 파일 없음 (--all 옵션으로 전체 검사 가능)\n');
    }
  }
  
  // --all 옵션이나 staged 파일이 없을 때 YouTube 관련 파일 전체 검사
  if (checkAll || filesToCheck.length === 0) {
    console.log('📋 YouTube 관련 파일 전체 검증\n');
    
    // YouTube 관련 디렉토리 검사
    const youtubeDirectories = [
      path.join(__dirname, '../src/lib/youtube'),
      path.join(__dirname, '../src/app/api/youtube'),
      path.join(__dirname, '../src/app/api/youtube-lens'),
    ];
    
    youtubeDirectories.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = walkDirectory(dir, ['.ts', '.tsx']);
        filesToCheck.push(...files);
      }
    });
  }
  
  // 파일 검증
  filesToCheck.forEach(file => validateFile(file));
  
  // 결과 출력
  console.log('\n' + '=' .repeat(60));
  console.log('📊 검증 결과:\n');
  
  console.log(`✅ 정상: ${validationResults.passed}개 파일`);
  
  if (validationResults.warnings.length > 0) {
    console.log(`⚠️  경고: ${validationResults.warnings.length}건`);
  }
  
  if (validationResults.errors.length > 0) {
    console.log(`❌ 오류: ${validationResults.errors.length}건`);
    
    console.log('\n💡 수정 방법:');
    console.log('1. YouTube API 응답은 camelCase 사용 (channelId, viewCount 등)');
    console.log('2. DB 저장 시에만 snake_case로 변환 (camelToSnakeCase 사용)');
    console.log('3. API Key는 env.ts에서 import하여 사용');
    console.log('4. 타입 정의도 YouTube API 공식 필드명(camelCase) 사용');
    
    process.exit(1);
  }
  
  console.log('\n✅ YouTube API 검증 통과!');
  return 0;
}

/**
 * 디렉토리 순회하며 파일 찾기
 */
function walkDirectory(dir, extensions) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...walkDirectory(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    console.error(`Error walking directory ${dir}:`, error.message);
  }
  
  return files;
}

// 실행
main();