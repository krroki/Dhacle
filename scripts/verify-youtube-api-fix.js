/**
 * YouTube API 수정 검증 스크립트
 * api-client.ts 파일의 camelCase 필드 접근이 올바른지 확인
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_CLIENT_PATH = path.join(__dirname, '../src/lib/youtube/api-client.ts');

function verifyAPIClient() {
  console.log('🔍 Verifying YouTube API Client Fix...\n');
  
  const content = fs.readFileSync(API_CLIENT_PATH, 'utf-8');
  
  // 검증할 패턴들
  const patterns = [
    {
      name: 'channelId in getVideos',
      correct: /snippet\?\.channelId/,
      incorrect: /snippet\?\.channel_id/,
      context: 'getVideos method'
    },
    {
      name: 'channelTitle in getVideos',
      correct: /snippet\?\.channelTitle/,
      incorrect: /snippet\?\.channel_title/,
      context: 'getVideos method'
    },
    {
      name: 'publishedAt in getVideos',
      correct: /snippet\?\.publishedAt/,
      incorrect: /snippet\?\.published_at/,
      context: 'getVideos method'
    },
    {
      name: 'viewCount in statistics',
      correct: /statistics\?\.viewCount/,
      incorrect: /statistics\?\.view_count/,
      context: 'statistics parsing'
    },
    {
      name: 'likeCount in statistics',
      correct: /statistics\?\.likeCount/,
      incorrect: /statistics\?\.like_count/,
      context: 'statistics parsing'
    },
    {
      name: 'commentCount in statistics',
      correct: /statistics\?\.commentCount/,
      incorrect: /statistics\?\.comment_count/,
      context: 'statistics parsing'
    },
    {
      name: 'subscriberCount in channel',
      correct: /statistics\?\.subscriberCount/,
      incorrect: /statistics\?\.subscriber_count/,
      context: 'channel statistics'
    },
    {
      name: 'videoId in playlist items',
      correct: /resource_id\?\.videoId/,
      incorrect: /resource_id\?\.video_id/,
      context: 'playlist items'
    }
  ];
  
  console.log('📊 Pattern Verification:');
  console.log('=' .repeat(50));
  
  let allCorrect = true;
  let incorrectPatterns = [];
  
  patterns.forEach(pattern => {
    const hasCorrect = pattern.correct.test(content);
    const hasIncorrect = pattern.incorrect.test(content);
    
    if (hasCorrect && !hasIncorrect) {
      console.log(`✅ ${pattern.name}: Correctly using camelCase`);
    } else if (!hasCorrect && hasIncorrect) {
      console.log(`❌ ${pattern.name}: Still using snake_case`);
      incorrectPatterns.push(pattern);
      allCorrect = false;
    } else if (hasCorrect && hasIncorrect) {
      console.log(`⚠️  ${pattern.name}: Mixed usage detected`);
      allCorrect = false;
    } else {
      console.log(`❓ ${pattern.name}: Pattern not found`);
    }
  });
  
  // 상세 분석
  if (incorrectPatterns.length > 0) {
    console.log('\n❌ Issues Found:');
    console.log('=' .repeat(50));
    
    incorrectPatterns.forEach(pattern => {
      console.log(`\n  ${pattern.name} (${pattern.context}):`);
      
      // 해당 패턴이 있는 라인 찾기
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (pattern.incorrect.test(line)) {
          console.log(`    Line ${index + 1}: ${line.trim()}`);
        }
      });
    });
  }
  
  // 결론
  console.log('\n🎯 Verification Result:');
  console.log('=' .repeat(50));
  
  if (allCorrect) {
    console.log('✅ All YouTube API field accesses are correctly using camelCase');
    console.log('✅ The fix has been successfully applied');
  } else {
    console.log('❌ Some issues remain - please review the patterns above');
  }
  
  // 추가 확인 - 출력 필드는 snake_case로 유지되는지
  console.log('\n📝 Output Field Format Check:');
  console.log('=' .repeat(50));
  
  const outputPatterns = [
    { pattern: /channel_id:/, name: 'channel_id output' },
    { pattern: /channel_title:/, name: 'channel_title output' },
    { pattern: /published_at:/, name: 'published_at output' },
    { pattern: /view_count:/, name: 'view_count output' },
    { pattern: /like_count:/, name: 'like_count output' }
  ];
  
  outputPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(content)) {
      console.log(`✅ ${name}: Maintaining snake_case for output`);
    } else {
      console.log(`❓ ${name}: Not found in output`);
    }
  });
  
  return allCorrect;
}

const isCorrect = verifyAPIClient();
process.exit(isCorrect ? 0 : 1);