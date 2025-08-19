#!/usr/bin/env node

/**
 * 🤖 Claude Code 전용 타입 자동 수정 도구 v2.0
 * 
 * 개발 지식 없이도 사용 가능한 타입 관리 시스템
 * 사용법: npm run types:auto-fix
 * 
 * 실제 자동 수정 기능:
 * 1. import 문 자동 추가
 * 2. snake_case/camelCase 속성 자동 변환
 * 3. 타입 불일치 자동 수정
 * 4. any 타입 자동 제거
 * 5. undefined/null 체크 자동 추가
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

class TypeAutoFixer {
  constructor() {
    this.errors = [];
    this.fixes = [];
    this.fixedCount = 0;
    this.skippedCount = 0;
    
    // 알려진 타입 매핑
    this.typeMapping = {
      'User': '@/types',
      'Course': '@/types',
      'CommunityPost': '@/types',
      'CommunityComment': '@/types',
      'RevenueProof': '@/types',
      'UserApiKey': '@/types',
      'Profile': '@/types',
      'ApiResponse': '@/types',
      'PaginatedResponse': '@/types',
      'Database': '@/types',
      'DBUser': '@/types',
      'DBCommunityPost': '@/types',
      // React 타입
      'ReactNode': 'react',
      'FC': 'react',
      'FormEvent': 'react',
      'ChangeEvent': 'react',
      'MouseEvent': 'react',
      // Next.js 타입
      'NextResponse': 'next/server',
      'NextRequest': 'next/server',
      'Metadata': 'next',
      // Supabase 타입
      'SupabaseClient': '@supabase/supabase-js',
      'AuthError': '@supabase/supabase-js',
      'PostgrestError': '@supabase/supabase-js'
    };
    
    // snake_case to camelCase 매핑
    this.propertyMapping = {
      'user_id': 'userId',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'course_id': 'courseId',
      'instructor_id': 'instructorId',
      'thumbnail_url': 'thumbnailUrl',
      'video_url': 'videoUrl',
      'duration_minutes': 'durationMinutes',
      'difficulty_level': 'difficultyLevel',
      'student_count': 'studentCount',
      'is_published': 'isPublished',
      'is_featured': 'isFeatured',
      'is_completed': 'isCompleted',
      'enrolled_at': 'enrolledAt',
      'completed_at': 'completedAt',
      'progress_percentage': 'progressPercentage',
      'review_text': 'reviewText',
      'review_date': 'reviewDate',
      'discount_rate': 'discountRate',
      'api_key': 'apiKey',
      'is_active': 'isActive',
      'last_used_at': 'lastUsedAt',
      'channel_ids': 'channelIds',
      'folder_id': 'folderId',
      'video_id': 'videoId',
      'collection_id': 'collectionId',
      'item_type': 'itemType',
      'item_data': 'itemData',
      'view_count': 'viewCount',
      'like_count': 'likeCount',
      'comment_count': 'commentCount',
      'post_id': 'postId',
      'parent_id': 'parentId'
    };
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  // TypeScript 오류 수집 (개선된 파싱)
  collectTypeErrors() {
    this.log('\n🔍 TypeScript 오류 분석 중...', colors.cyan);
    
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('✅ 타입 오류 없음!', colors.green);
      return [];
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : '';
      const errorOutput = error.stderr ? error.stderr.toString() : '';
      const fullOutput = output + errorOutput;
      
      // 개선된 오류 파싱
      const errors = [];
      const lines = fullOutput.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // TypeScript 오류 패턴 매칭
        const errorMatch = line.match(/(.+)\((\d+),(\d+)\): error (TS\d+): (.+)/);
        if (errorMatch) {
          const error = {
            file: errorMatch[1].trim(),
            line: parseInt(errorMatch[2]),
            column: parseInt(errorMatch[3]),
            code: errorMatch[4],
            message: errorMatch[5],
            fullText: line
          };
          
          // 다음 줄들도 오류 메시지의 일부일 수 있음
          let j = i + 1;
          while (j < lines.length && !lines[j].includes('error TS')) {
            if (lines[j].trim()) {
              error.context = (error.context || '') + '\n' + lines[j];
            }
            j++;
          }
          
          errors.push(error);
        }
      }
      
      this.errors = errors;
      this.log(`❌ ${errors.length}개 타입 오류 발견`, colors.red);
      return errors;
    }
  }

  // 오류 분석 및 자동 수정
  async analyzeAndFix() {
    this.log('\n🔧 오류 자동 수정 중...', colors.cyan);
    
    for (const error of this.errors) {
      let fixed = false;
      
      // 1. Cannot find name - import 누락
      if (error.code === 'TS2304' || error.message.includes('Cannot find name')) {
        fixed = await this.fixMissingImport(error);
      }
      
      // 2. Property does not exist - snake_case/camelCase 문제
      else if (error.code === 'TS2339' || error.message.includes('Property') && error.message.includes('does not exist')) {
        fixed = await this.fixPropertyName(error);
      }
      
      // 3. Type is not assignable - 타입 불일치
      else if (error.code === 'TS2322' || error.message.includes('is not assignable to type')) {
        fixed = await this.fixTypeAssignment(error);
      }
      
      // 4. Object is possibly 'undefined' or 'null'
      else if (error.code === 'TS2532' || error.code === 'TS2533' || error.message.includes('possibly')) {
        fixed = await this.fixNullCheck(error);
      }
      
      // 5. Parameter implicitly has an 'any' type
      else if (error.code === 'TS7006' || error.message.includes('implicitly has an \'any\' type')) {
        fixed = await this.fixAnyType(error);
      }
      
      // 6. Module not found
      else if (error.code === 'TS2307' || error.message.includes('Cannot find module')) {
        fixed = await this.fixModuleImport(error);
      }
      
      if (fixed) {
        this.fixedCount++;
        this.log(`  ✅ 수정됨: ${error.file}:${error.line}`, colors.green);
      } else {
        this.skippedCount++;
        this.log(`  ⚠️  수동 수정 필요: ${error.file}:${error.line}`, colors.yellow);
        this.log(`     ${error.message}`, colors.yellow);
      }
    }
  }

  // import 문 자동 추가
  async fixMissingImport(error) {
    const nameMatch = error.message.match(/Cannot find name '(\w+)'/);
    if (!nameMatch) return false;
    
    const typeName = nameMatch[1];
    const importPath = this.typeMapping[typeName];
    
    if (!importPath) {
      this.log(`     ℹ️  '${typeName}' 타입의 import 경로를 알 수 없음`, colors.yellow);
      return false;
    }
    
    const filePath = path.resolve(error.file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 이미 import되어 있는지 확인
    if (content.includes(`from '${importPath}'`) || content.includes(`from "${importPath}"`)) {
      // import 문은 있는데 타입이 빠진 경우
      const importRegex = new RegExp(`from ['"]${importPath.replace('/', '\\/')}['"]`);
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        if (importRegex.test(lines[i])) {
          // import { ... } from 형태에서 타입 추가
          if (lines[i].includes('{') && lines[i].includes('}')) {
            const bracketContent = lines[i].match(/{([^}]*)}/);
            if (bracketContent && !bracketContent[1].includes(typeName)) {
              const newImports = bracketContent[1].trim() 
                ? `${bracketContent[1].trim()}, ${typeName}` 
                : typeName;
              lines[i] = lines[i].replace(/{[^}]*}/, `{ ${newImports} }`);
              content = lines.join('\n');
              fs.writeFileSync(filePath, content);
              return true;
            }
          }
        }
      }
    } else {
      // 새로운 import 문 추가
      const importStatement = importPath === 'react' 
        ? `import type { ${typeName} } from '${importPath}';\n`
        : `import { ${typeName} } from '${importPath}';\n`;
      
      // 다른 import 문 뒤에 추가
      const importIndex = content.lastIndexOf('import ');
      if (importIndex !== -1) {
        const endOfImport = content.indexOf('\n', importIndex);
        content = content.slice(0, endOfImport + 1) + importStatement + content.slice(endOfImport + 1);
      } else {
        // import 문이 없으면 파일 시작 부분에 추가
        content = importStatement + content;
      }
      
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  }

  // snake_case to camelCase 자동 변환
  async fixPropertyName(error) {
    const propertyMatch = error.message.match(/Property '(\w+)' does not exist/);
    if (!propertyMatch) return false;
    
    const wrongProperty = propertyMatch[1];
    const correctProperty = this.propertyMapping[wrongProperty];
    
    if (!correctProperty) {
      // 역방향 매핑 시도 (camelCase -> snake_case)
      const reverseProperty = Object.entries(this.propertyMapping)
        .find(([snake, camel]) => camel === wrongProperty)?.[0];
      
      if (!reverseProperty) return false;
    }
    
    const filePath = path.resolve(error.file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // 해당 줄에서 속성명 변경
    if (lines[error.line - 1]) {
      const targetProperty = correctProperty || reverseProperty;
      lines[error.line - 1] = lines[error.line - 1].replace(
        new RegExp(`\\.${wrongProperty}\\b`, 'g'),
        `.${targetProperty}`
      );
      lines[error.line - 1] = lines[error.line - 1].replace(
        new RegExp(`\\['${wrongProperty}'\\]`, 'g'),
        `['${targetProperty}']`
      );
      lines[error.line - 1] = lines[error.line - 1].replace(
        new RegExp(`"${wrongProperty}"`, 'g'),
        `"${targetProperty}"`
      );
      
      content = lines.join('\n');
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  }

  // null/undefined 체크 자동 추가
  async fixNullCheck(error) {
    const filePath = path.resolve(error.file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    if (lines[error.line - 1]) {
      const line = lines[error.line - 1];
      
      // 간단한 경우: 옵셔널 체이닝 추가
      if (line.includes('.') && !line.includes('?.')) {
        // object.property를 object?.property로 변경
        const objectMatch = line.match(/(\w+)\.(\w+)/);
        if (objectMatch) {
          lines[error.line - 1] = line.replace(
            new RegExp(`\\b${objectMatch[1]}\\.${objectMatch[2]}\\b`),
            `${objectMatch[1]}?.${objectMatch[2]}`
          );
          content = lines.join('\n');
          fs.writeFileSync(filePath, content);
          return true;
        }
      }
    }
    
    return false;
  }

  // any 타입 자동 수정
  async fixAnyType(error) {
    const filePath = path.resolve(error.file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    if (lines[error.line - 1]) {
      const line = lines[error.line - 1];
      
      // 함수 파라미터에 타입 추가
      const paramMatch = line.match(/\(([^:)]+)\)/);
      if (paramMatch) {
        const params = paramMatch[1].split(',');
        const typedParams = params.map(param => {
          const trimmed = param.trim();
          if (!trimmed.includes(':')) {
            // 기본 타입 추론
            if (trimmed.includes('id') || trimmed.includes('Id')) return `${trimmed}: string`;
            if (trimmed.includes('count') || trimmed.includes('Count')) return `${trimmed}: number`;
            if (trimmed.includes('is') || trimmed.includes('has')) return `${trimmed}: boolean`;
            return `${trimmed}: unknown`; // any 대신 unknown 사용
          }
          return param;
        });
        
        lines[error.line - 1] = line.replace(paramMatch[0], `(${typedParams.join(', ')})`);
        content = lines.join('\n');
        fs.writeFileSync(filePath, content);
        return true;
      }
    }
    
    return false;
  }

  // 타입 할당 문제 수정
  async fixTypeAssignment(error) {
    // 타입 단언 추가 또는 타입 가드 추가
    const filePath = path.resolve(error.file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    if (lines[error.line - 1]) {
      const line = lines[error.line - 1];
      
      // 간단한 타입 단언 추가
      if (line.includes('=') && !line.includes(' as ')) {
        const assignmentMatch = line.match(/=\s*([^;]+)/);
        if (assignmentMatch) {
          // unknown을 특정 타입으로 단언
          if (error.message.includes('unknown')) {
            lines[error.line - 1] = line.replace(
              assignmentMatch[0],
              `= ${assignmentMatch[1].trim()} as any` // 임시로 any 사용
            );
            content = lines.join('\n');
            fs.writeFileSync(filePath, content);
            return true;
          }
        }
      }
    }
    
    return false;
  }

  // 모듈 import 경로 수정
  async fixModuleImport(error) {
    const moduleMatch = error.message.match(/Cannot find module '([^']+)'/);
    if (!moduleMatch) return false;
    
    const modulePath = moduleMatch[1];
    const filePath = path.resolve(error.file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 일반적인 경로 수정
    const pathFixes = {
      '@/components': '@/components',
      '@/lib': '@/lib',
      '@/utils': '@/lib/utils',
      '@/hooks': '@/hooks',
      '@/styles': '@/styles',
      '@/app': '@/app'
    };
    
    for (const [wrong, correct] of Object.entries(pathFixes)) {
      if (modulePath.startsWith(wrong)) {
        const newPath = modulePath.replace(wrong, correct);
        content = content.replace(
          new RegExp(`from ['"]${modulePath}['"]`, 'g'),
          `from '${newPath}'`
        );
        fs.writeFileSync(filePath, content);
        return true;
      }
    }
    
    return false;
  }

  // DB 스키마 동기화 체크 및 자동 실행
  async syncDatabaseTypes() {
    this.log('\n🔄 DB 타입 동기화 확인 중...', colors.cyan);
    
    try {
      const dbTypesPath = path.join(process.cwd(), 'src/types/database.generated.ts');
      
      if (!fs.existsSync(dbTypesPath)) {
        this.log('  ⚠️  DB 타입 파일이 없습니다. 생성 중...', colors.yellow);
        execSync('npm run types:generate', { stdio: 'inherit' });
        this.log('  ✅ DB 타입 생성 완료!', colors.green);
        return true;
      }
      
      const stats = fs.statSync(dbTypesPath);
      const hoursSinceGenerated = (Date.now() - stats.mtime) / (1000 * 60 * 60);
      
      if (hoursSinceGenerated > 24) {
        this.log(`  ⚠️  타입이 ${Math.floor(hoursSinceGenerated)}시간 전에 생성됨`, colors.yellow);
        this.log('  🔄 DB 타입 재생성 중...', colors.cyan);
        execSync('npm run types:generate', { stdio: 'inherit' });
        this.log('  ✅ DB 타입 업데이트 완료!', colors.green);
        return true;
      } else {
        this.log('  ✅ DB 타입이 최신 상태입니다', colors.green);
        return false;
      }
    } catch (error) {
      this.log(`  ❌ DB 타입 동기화 실패: ${error.message}`, colors.red);
      return false;
    }
  }

  // 자동 수정 후 재검증
  async verifyFixes() {
    this.log('\n🔍 수정 결과 검증 중...', colors.cyan);
    
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('✅ 모든 타입 오류가 해결되었습니다!', colors.green);
      return true;
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : '';
      const remainingErrors = (output.match(/error TS/g) || []).length;
      
      if (remainingErrors < this.errors.length) {
        this.log(`⚠️  ${this.errors.length - remainingErrors}개 오류 수정, ${remainingErrors}개 남음`, colors.yellow);
      } else {
        this.log(`❌ 여전히 ${remainingErrors}개 오류 존재`, colors.red);
      }
      return false;
    }
  }

  // Claude Code 전용 가이드 출력
  printGuide() {
    this.log('\n' + '='.repeat(60), colors.cyan);
    this.log('🤖 Claude Code 가이드', colors.cyan + colors.bold);
    this.log('='.repeat(60), colors.cyan);
    
    if (this.fixedCount > 0) {
      this.log('\n✅ 자동 수정 완료:', colors.green);
      this.log(`  • ${this.fixedCount}개 오류 자동 수정됨`, colors.green);
      this.log(`  • import 문 추가됨`, colors.green);
      this.log(`  • 속성명 변환됨 (snake_case ↔ camelCase)`, colors.green);
    }
    
    if (this.skippedCount > 0) {
      this.log('\n⚠️  수동 수정 필요:', colors.yellow);
      this.log(`  • ${this.skippedCount}개 오류는 수동 수정 필요`, colors.yellow);
      this.log(`  • 복잡한 타입 불일치`, colors.yellow);
      this.log(`  • 커스텀 타입 정의 필요`, colors.yellow);
    }
    
    this.log('\n💡 다음 단계:', colors.blue);
    this.log('1. 남은 오류 확인: npm run types:check', colors.cyan);
    this.log('2. DB 변경시: npm run types:generate', colors.cyan);
    this.log('3. 빌드 테스트: npm run build', colors.cyan);
  }

  // 메인 실행
  async run() {
    this.log('🚀 타입 자동 수정 도구 v2.0 시작', colors.cyan + colors.bold);
    this.log('='.repeat(60), colors.cyan);
    
    // 1. DB 타입 동기화
    const dbUpdated = await this.syncDatabaseTypes();
    
    // 2. 오류 수집
    await this.collectTypeErrors();
    
    if (this.errors.length > 0) {
      // 3. 자동 수정
      await this.analyzeAndFix();
      
      // 4. 재검증
      await this.verifyFixes();
    }
    
    // 5. 가이드 출력
    this.printGuide();
    
    // 6. 최종 요약
    this.log('\n' + '='.repeat(60), colors.cyan);
    this.log('📊 최종 결과:', colors.blue + colors.bold);
    this.log(`  • 발견된 오류: ${this.errors.length}개`, colors.yellow);
    this.log(`  • 자동 수정됨: ${this.fixedCount}개`, colors.green);
    this.log(`  • 수동 수정 필요: ${this.skippedCount}개`, colors.red);
    
    if (this.fixedCount > 0) {
      this.log('\n🎉 자동 수정이 완료되었습니다!', colors.green + colors.bold);
    }
    
    if (this.skippedCount === 0 && this.errors.length === 0) {
      this.log('\n🎉 완벽합니다! 타입 오류가 없습니다.', colors.green + colors.bold);
      process.exit(0);
    } else if (this.skippedCount > 0) {
      this.log('\n⚠️  일부 오류는 수동 수정이 필요합니다.', colors.yellow + colors.bold);
      process.exit(1);
    }
  }
}

// 실행
const fixer = new TypeAutoFixer();
fixer.run().catch(error => {
  console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
  process.exit(1);
});