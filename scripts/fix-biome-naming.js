#!/usr/bin/env node

/**
 * Biome 네이밍 컨벤션 자동 수정 스크립트
 * - snake_case를 camelCase로 변환
 * - 데이터베이스 필드명은 유지 (snake_case 유지)
 * - TypeScript 인터페이스의 속성명 수정
 */

const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// 변환 제외 패턴 (데이터베이스 필드명 등)
const EXCLUDE_PATTERNS = [
  // Supabase 테이블 필드명
  'user_id',
  'created_at',
  'updated_at',
  'deleted_at',
  'channel_id',
  'video_id',
  'collection_id',
  'folder_id',
  'proof_id',
  'post_id',
  'course_id',
  'lesson_id',
  'payment_id',
  'avatar_url',
  'thumbnail_url',
  'screenshot_url',
  'signature_data',
  'is_hidden',
  'is_public',
  'is_admin',
  'is_verified',
  'is_deleted',
  'is_active',
  'is_featured',
  'is_monetized',
  'view_count',
  'like_count',
  'likes_count',
  'comment_count',
  'comments_count',
  'reports_count',
  'total_amount',
  'proof_count',
  'published_at',
  'last_sync_at',
  'enrollment_count',
  'completion_rate',
  'screenshot_blur',
  'channel_name',
  'channel_handle',
  'subscriber_count',
  'video_count',
  'video_title',
  'video_description',
  'video_tags',
  'video_duration',
  'custom_thumbnail_url',
  'default_language',
  'made_for_kids',
  'age_restricted',
  'revenue_proofs',
  'proof_likes',
  'proof_comments',
  'proof_reports',
  'youtube_channels',
  'youtube_channel_folders',
  'youtube_channel_stats',
  'youtube_collections',
  'youtube_collection_videos',
  'youtube_favorites',
  'youtube_search_history',
  'youtube_videos',
  'youtube_video_stats',
  'youtube_monitoring_channels',
  'youtube_monitoring_rules',
  'community_posts',
  'community_comments',
  'community_post_likes',
  'community_post_saves',
  'course_enrollments',
  'course_progress',
  'lesson_completions',
  'service_role_key',
  'anon_key',
  'api_key',
  'client_key',
  'secret_key',
  'webhook_url',
  'callback_url',
  'redirect_url',
  'base_url',
  'site_url',
  'auth_helpers',
];

// snake_case를 camelCase로 변환
function snakeToCamel(str) {
  // 제외 패턴 체크
  if (EXCLUDE_PATTERNS.includes(str)) {
    return str;
  }
  
  // 이미 camelCase인 경우 그대로 반환
  if (!str.includes('_')) {
    return str;
  }
  
  // 대문자가 포함된 snake_case는 그대로 유지 (예: API_KEY)
  if (str !== str.toLowerCase()) {
    return str;
  }
  
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// TypeScript 파일에서 snake_case 변수/속성 찾기
function findSnakeCaseInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // 변수 선언 패턴
  const varPatterns = [
    /const\s+([a-z]+_[a-z_]+)\s*=/g,
    /let\s+([a-z]+_[a-z_]+)\s*=/g,
    /var\s+([a-z]+_[a-z_]+)\s*=/g,
  ];
  
  // 함수 매개변수 패턴
  const paramPattern = /\(([^)]*[a-z]+_[a-z_]+[^)]*)\)/g;
  
  // 객체 속성 패턴 (TypeScript 인터페이스 포함)
  const propPattern = /^\s*([a-z]+_[a-z_]+)\s*[:?]/gm;
  
  // 변수 선언 체크
  for (const pattern of varPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const varName = match[1];
      if (!EXCLUDE_PATTERNS.includes(varName)) {
        issues.push({
          type: 'variable',
          name: varName,
          line: content.substring(0, match.index).split('\n').length,
          replacement: snakeToCamel(varName)
        });
      }
    }
  }
  
  // 함수 매개변수 체크
  let match;
  while ((match = paramPattern.exec(content)) !== null) {
    const params = match[1];
    const paramNames = params.match(/[a-z]+_[a-z_]+/g);
    if (paramNames) {
      for (const paramName of paramNames) {
        if (!EXCLUDE_PATTERNS.includes(paramName)) {
          issues.push({
            type: 'parameter',
            name: paramName,
            line: content.substring(0, match.index).split('\n').length,
            replacement: snakeToCamel(paramName)
          });
        }
      }
    }
  }
  
  // 객체 속성 체크
  while ((match = propPattern.exec(content)) !== null) {
    const propName = match[1];
    if (!EXCLUDE_PATTERNS.includes(propName)) {
      // 데이터베이스 쿼리에서 사용되는 필드는 제외
      const lineStart = content.lastIndexOf('\n', match.index);
      const lineEnd = content.indexOf('\n', match.index);
      const line = content.substring(lineStart, lineEnd);
      
      // Supabase 쿼리에서 사용되는 필드는 제외
      if (!line.includes('.from(') && !line.includes('.select(') && 
          !line.includes('.insert(') && !line.includes('.update(') &&
          !line.includes('.eq(') && !line.includes('.in(')) {
        issues.push({
          type: 'property',
          name: propName,
          line: content.substring(0, match.index).split('\n').length,
          replacement: snakeToCamel(propName)
        });
      }
    }
  }
  
  return issues;
}

// 파일 수정
function fixFile(filePath, issues) {
  if (issues.length === 0) return false;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // 이슈를 라인 번호 역순으로 정렬 (뒤에서부터 수정)
  issues.sort((a, b) => b.line - a.line);
  
  for (const issue of issues) {
    // 정규표현식으로 해당 이름 치환
    const regex = new RegExp(`\\b${issue.name}\\b`, 'g');
    const newContent = content.replace(regex, issue.replacement);
    
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return modified;
}

// 디렉토리 스캔
function scanDirectory(dir) {
  const results = [];
  
  function scan(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      // node_modules, .next 등 제외
      if (file === 'node_modules' || file === '.next' || file === '.git') {
        continue;
      }
      
      if (stat.isDirectory()) {
        scan(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const issues = findSnakeCaseInFile(filePath);
        if (issues.length > 0) {
          results.push({
            path: filePath,
            issues
          });
        }
      }
    }
  }
  
  scan(dir);
  return results;
}

// 실행
console.log('\n🔧 Biome Naming Convention Fix\n');
console.log('=' .repeat(50));

const srcDir = path.join(process.cwd(), 'src');
const results = scanDirectory(srcDir);

if (results.length === 0) {
  console.log(`${colors.green}✅ No naming convention issues found!${colors.reset}`);
} else {
  console.log(`${colors.yellow}Found ${results.length} files with naming issues:${colors.reset}\n`);
  
  let totalIssues = 0;
  let fixedFiles = 0;
  
  for (const result of results) {
    const relativePath = path.relative(process.cwd(), result.path);
    console.log(`\n${colors.cyan}${relativePath}${colors.reset}`);
    console.log(`  Issues: ${result.issues.length}`);
    
    // 자동 수정 시도
    if (fixFile(result.path, result.issues)) {
      console.log(`  ${colors.green}✅ Fixed automatically${colors.reset}`);
      fixedFiles++;
    } else {
      console.log(`  ${colors.red}❌ Could not fix automatically${colors.reset}`);
    }
    
    totalIssues += result.issues.length;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n${colors.green}Summary:${colors.reset}`);
  console.log(`  Total issues: ${totalIssues}`);
  console.log(`  Files fixed: ${fixedFiles}/${results.length}`);
  
  if (fixedFiles > 0) {
    console.log(`\n${colors.yellow}⚠️ Please run 'npm run lint:fix' to clean up any remaining issues${colors.reset}`);
  }
}