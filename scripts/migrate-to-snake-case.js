#!/usr/bin/env node

/**
 * Snake_case 마이그레이션 스크립트
 * 
 * 전체 코드베이스를 camelCase에서 snake_case로 변환
 * 백업 생성 후 안전하게 변환 수행
 * 
 * Usage: node scripts/migrate-to-snake-case.js [options]
 * Options:
 *   --dry-run    실제 변경 없이 시뮬레이션만 실행
 *   --verbose    상세 로그 출력
 *   --no-backup  백업 생성 건너뛰기 (위험!)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 명령행 인자 파싱
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');
const noBackup = args.includes('--no-backup');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

// 로그 헬퍼
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  verbose: (msg) => isVerbose && console.log(`${colors.gray}  → ${msg}${colors.reset}`)
};

// 변환 매핑 테이블 (가장 자주 사용되는 변수들)
const camelToSnakeMap = {
  // === User 관련 ===
  'userId': 'user_id',
  'userName': 'user_name',
  'userEmail': 'user_email',
  'userRole': 'user_role',
  'avatarUrl': 'avatar_url',
  'fullName': 'full_name',
  'phoneNumber': 'phone_number',
  'birthDate': 'birth_date',
  
  // === Course 관련 ===
  'courseId': 'course_id',
  'courseName': 'course_name',
  'courseTitle': 'course_title',
  'courseDescription': 'course_description',
  'instructorName': 'instructor_name',
  'instructorId': 'instructor_id',
  'studentCount': 'student_count',
  'lessonCount': 'lesson_count',
  'totalDuration': 'total_duration',
  'averageRating': 'average_rating',
  'coursePrice': 'course_price',
  'discountPrice': 'discount_price',
  
  // === 시간 관련 ===
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'deletedAt': 'deleted_at',
  'publishedAt': 'published_at',
  'completedAt': 'completed_at',
  'startedAt': 'started_at',
  'endedAt': 'ended_at',
  'lastWatchedAt': 'last_watched_at',
  'expiresAt': 'expires_at',
  'lastActiveAt': 'last_active_at',
  
  // === 상태 관련 ===
  'isActive': 'is_active',
  'isFree': 'is_free',
  'isPublished': 'is_published',
  'isDeleted': 'is_deleted',
  'isPurchased': 'is_purchased',
  'isEnrolled': 'is_enrolled',
  'isCompleted': 'is_completed',
  'isPublic': 'is_public',
  'isVerified': 'is_verified',
  'isPinned': 'is_pinned',
  
  // === YouTube/API 관련 ===
  'apiKey': 'api_key',
  'videoId': 'video_id',
  'channelId': 'channel_id',
  'channelName': 'channel_name',
  'channelUrl': 'channel_url',
  'playlistId': 'playlist_id',
  'thumbnailUrl': 'thumbnail_url',
  'videoUrl': 'video_url',
  'viewCount': 'view_count',
  'likeCount': 'like_count',
  'commentCount': 'comment_count',
  'subscriberCount': 'subscriber_count',
  
  // === 커뮤니티 관련 ===
  'postId': 'post_id',
  'postTitle': 'post_title',
  'postContent': 'post_content',
  'commentId': 'comment_id',
  'parentId': 'parent_id',
  'replyCount': 'reply_count',
  'categoryId': 'category_id',
  'categoryName': 'category_name',
  
  // === Payment/Income 관련 ===
  'currentIncome': 'current_income',
  'targetIncome': 'target_income',
  'totalAmount': 'total_amount',
  'paymentMethod': 'payment_method',
  'paymentStatus': 'payment_status',
  'transactionId': 'transaction_id',
  
  // === 기타 ===
  'orderIndex': 'order_index',
  'maxRetries': 'max_retries',
  'retryCount': 'retry_count',
  'errorMessage': 'error_message',
  'errorCode': 'error_code',
  'requestBody': 'request_body',
  'responseData': 'response_data',
  'workType': 'work_type',
  'jobCategory': 'job_category',
  'experienceLevel': 'experience_level',
  'contentType': 'content_type',
  'fileSize': 'file_size',
  'fileName': 'file_name',
  'mimeType': 'mime_type',
  'sessionId': 'session_id',
  'refreshToken': 'refresh_token',
  'accessToken': 'access_token'
};

// 파일별 통계
const stats = {
  totalFiles: 0,
  processedFiles: 0,
  skippedFiles: 0,
  totalChanges: 0,
  fileChanges: {}
};

/**
 * 백업 디렉토리 생성
 */
function createBackupDir() {
  const backupDir = path.join(process.cwd(), '.migration-backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    log.success(`Backup directory created: ${backupDir}`);
  }
  return backupDir;
}

/**
 * 파일 백업
 */
function backupFile(filePath) {
  if (noBackup || isDryRun) return;
  
  const backupDir = createBackupDir();
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(backupDir, relativePath);
  const backupDirPath = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDirPath)) {
    fs.mkdirSync(backupDirPath, { recursive: true });
  }
  
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    log.verbose(`Backed up: ${relativePath}`);
  }
}

/**
 * 변환 규칙 적용
 */
function applyTransformations(content, filePath) {
  let transformedContent = content;
  let changeCount = 0;
  const changes = [];
  
  // 각 매핑 적용
  Object.entries(camelToSnakeMap).forEach(([camel, snake]) => {
    // 정규식 패턴들 (컨텍스트별)
    const patterns = [
      // 객체 속성 (key: value)
      new RegExp(`(['"\`]?)\\b${camel}\\b(['"\`]?)\\s*:`, 'g'),
      
      // 객체 접근 (obj.property)
      new RegExp(`\\.${camel}\\b`, 'g'),
      
      // 변수 선언 (const/let/var)
      new RegExp(`(const|let|var)\\s+${camel}\\b`, 'g'),
      
      // 함수 파라미터
      new RegExp(`\\(([^)]*\\b)${camel}\\b([^)]*)\\)`, 'g'),
      
      // 구조 분해 할당
      new RegExp(`\\{([^}]*\\b)${camel}\\b([^}]*)\\}`, 'g'),
      
      // JSX props
      new RegExp(`\\s${camel}=`, 'g'),
      
      // TypeScript 타입
      new RegExp(`:\\s*${camel}\\b`, 'g')
    ];
    
    patterns.forEach((pattern, index) => {
      const matches = transformedContent.match(pattern);
      if (matches) {
        const count = matches.length;
        changeCount += count;
        
        // 변환 적용
        switch (index) {
          case 0: // 객체 속성
            transformedContent = transformedContent.replace(pattern, `$1${snake}$2:`);
            break;
          case 1: // 객체 접근
            transformedContent = transformedContent.replace(pattern, `.${snake}`);
            break;
          case 2: // 변수 선언
            transformedContent = transformedContent.replace(pattern, `$1 ${snake}`);
            break;
          case 3: // 함수 파라미터
            transformedContent = transformedContent.replace(pattern, `($1${snake}$2)`);
            break;
          case 4: // 구조 분해
            transformedContent = transformedContent.replace(pattern, `{$1${snake}$2}`);
            break;
          case 5: // JSX props
            transformedContent = transformedContent.replace(pattern, ` ${snake}=`);
            break;
          case 6: // TypeScript 타입
            transformedContent = transformedContent.replace(pattern, `: ${snake}`);
            break;
        }
        
        changes.push(`${camel} → ${snake} (${count}x)`);
      }
    });
  });
  
  if (changeCount > 0 && isVerbose) {
    log.verbose(`Changes in ${path.basename(filePath)}:`);
    changes.forEach(change => log.verbose(`  ${change}`));
  }
  
  return { transformedContent, changeCount };
}

/**
 * 파일 처리
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 백업 생성
    backupFile(filePath);
    
    // 변환 적용
    const { transformedContent, changeCount } = applyTransformations(content, filePath);
    
    if (changeCount > 0) {
      if (!isDryRun) {
        fs.writeFileSync(filePath, transformedContent);
      }
      
      stats.fileChanges[filePath] = changeCount;
      stats.totalChanges += changeCount;
      stats.processedFiles++;
      
      const relativePath = path.relative(process.cwd(), filePath);
      log.success(`${relativePath}: ${changeCount} changes`);
    } else {
      stats.skippedFiles++;
      if (isVerbose) {
        const relativePath = path.relative(process.cwd(), filePath);
        log.verbose(`${relativePath}: No changes needed`);
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to process ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('\n' + colors.blue + '╔════════════════════════════════════════╗' + colors.reset);
  console.log(colors.blue + '║' + colors.reset + '  🔄 Snake_case Migration Tool v1.0     ' + colors.blue + '║' + colors.reset);
  console.log(colors.blue + '╚════════════════════════════════════════╝' + colors.reset + '\n');
  
  if (isDryRun) {
    log.warning('DRY RUN MODE - No actual changes will be made');
  }
  
  // 대상 파일 찾기
  log.info('Scanning for TypeScript files...');
  const files = glob.sync('src/**/*.{ts,tsx}', {
    ignore: [
      '**/node_modules/**',
      '**/database.generated.ts',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/dist/**',
      '**/build/**'
    ]
  });
  
  stats.totalFiles = files.length;
  log.info(`Found ${stats.totalFiles} files to process\n`);
  
  // 진행률 표시
  const progressBar = (current, total) => {
    const percentage = Math.floor((current / total) * 100);
    const filled = Math.floor(percentage / 2);
    const bar = '█'.repeat(filled) + '░'.repeat(50 - filled);
    process.stdout.write(`\r${colors.blue}Progress: [${bar}] ${percentage}%${colors.reset}`);
  };
  
  // 파일 처리
  for (let i = 0; i < files.length; i++) {
    processFile(files[i]);
    if (!isVerbose) {
      progressBar(i + 1, files.length);
    }
  }
  
  console.log('\n');
  
  // 결과 요약
  console.log('\n' + colors.green + '╔════════════════════════════════════════╗' + colors.reset);
  console.log(colors.green + '║' + colors.reset + '         📊 Migration Summary           ' + colors.green + '║' + colors.reset);
  console.log(colors.green + '╚════════════════════════════════════════╝' + colors.reset + '\n');
  
  console.log(`${colors.blue}Total files:${colors.reset}      ${stats.totalFiles}`);
  console.log(`${colors.green}Processed:${colors.reset}        ${stats.processedFiles}`);
  console.log(`${colors.gray}Skipped:${colors.reset}          ${stats.skippedFiles}`);
  console.log(`${colors.yellow}Total changes:${colors.reset}    ${stats.totalChanges}`);
  
  // Top 5 most changed files
  if (stats.processedFiles > 0) {
    console.log('\n' + colors.blue + 'Top 5 most changed files:' + colors.reset);
    const sortedFiles = Object.entries(stats.fileChanges)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    sortedFiles.forEach(([file, changes]) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`  ${colors.yellow}${changes}${colors.reset} changes: ${relativePath}`);
    });
  }
  
  if (isDryRun) {
    console.log('\n' + colors.yellow + '⚠️  This was a dry run. No files were actually modified.' + colors.reset);
    console.log('Remove --dry-run flag to apply changes.\n');
  } else if (stats.processedFiles > 0) {
    console.log('\n' + colors.green + '✅ Migration completed successfully!' + colors.reset);
    if (!noBackup) {
      console.log(`Backup saved in: ${colors.blue}.migration-backup/${colors.reset}`);
      console.log(`To restore: ${colors.gray}cp -r .migration-backup/src/* src/${colors.reset}\n`);
    }
  } else {
    console.log('\n' + colors.gray + 'No changes were needed.' + colors.reset + '\n');
  }
}

// 에러 핸들링
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// 실행
main().catch((error) => {
  log.error(`Migration failed: ${error.message}`);
  process.exit(1);
});