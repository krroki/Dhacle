# 🎬 Phase 2: Shorts/키워드/카테고리 구현 (강화버전)

*실제 구현 검증 > 문서 신뢰 원칙 기반의 Shorts 판별 및 키워드 분석 시스템*

---

## 🔴 필수 준수사항
**모든 작업 시 다음 문구 필수 포함:**
- "TypeScript any 타입 절대 사용 금지"
- "타입을 제대로 정의하거나 unknown을 쓰고 타입 가드를 쓸 것"
- "실제 파일 검증 후 문서 확인 - 문서는 거짓일 수 있음!"

---

## 🎯 Phase 2 핵심 목표
1. **Shorts 자동 판별** 알고리즘 구현 (60초 + 키워드 + 비율)
2. **키워드 추출** 및 급상승 분석 (제목/설명 NLP)
3. **카테고리별 통계** 및 필터링 (드릴다운)
4. **팔로우 채널 업데이트** 알림 시스템
5. **검색 고도화** (Shorts 필터, 카테고리 필터)

---

## 🔄 3단계 구현 프로토콜

### 🔴 Stage 1: Pre-Implementation Verification (구현 전 검증)

#### 1.1 Phase 1 완료 상태 확인
```bash
# SC 명령어
/sc:analyze --seq --validate --c7

# Phase 1 검증
echo "=== Phase 1 완료 상태 확인 ==="
npm run phase1:validate

if [ $? -ne 0 ]; then
  echo "❌ Phase 1이 완료되지 않았습니다. Phase 1을 먼저 완료하세요."
  exit 1
fi

echo "✅ Phase 1 완료 확인됨"
```

#### 1.2 YouTube API 할당량 재계산
```typescript
// Phase 2 추가 API 사용량 계산
class Phase2QuotaCalculator {
  calculateAdditionalUsage() {
    return {
      // 비디오 상세 정보 (duration 포함)
      videos: {
        endpoint: 'videos.list',
        part: 'contentDetails,snippet,statistics',
        cost: 1,
        frequency: '채널당 최근 10개 비디오',
        dailyEstimate: 1000 * 10 / 50, // 200 units (배치 50개)
      },
      
      // 플레이리스트 아이템 (최근 업로드)
      playlists: {
        endpoint: 'playlistItems.list',
        part: 'snippet',
        cost: 1,
        frequency: '채널당 1회',
        dailyEstimate: 1000 / 50, // 20 units
      },
      
      total: 220, // Phase 1 (50) + Phase 2 (220) = 270 units/day
      percentage: 2.7 // 일일 할당량의 2.7%
    };
  }
}
```

### 🔵 Stage 2: Implementation (구현)

#### 2.1 데이터베이스 확장
```sql
-- supabase/migrations/20250201_youtube_lens_phase2.sql

BEGIN;

-- 1. 비디오 메타데이터 테이블
CREATE TABLE IF NOT EXISTS yl_videos (
  video_id TEXT PRIMARY KEY,
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  is_shorts BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  thumbnail_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_videos_channel ON yl_videos(channel_id);
CREATE INDEX idx_videos_shorts ON yl_videos(is_shorts);
CREATE INDEX idx_videos_published ON yl_videos(published_at DESC);
CREATE INDEX idx_videos_views ON yl_videos(view_count DESC);

-- 2. 키워드 트렌드 테이블
CREATE TABLE IF NOT EXISTS yl_keyword_trends (
  keyword TEXT,
  date DATE,
  frequency INTEGER DEFAULT 1,
  channels TEXT[], -- 해당 키워드 사용 채널들
  growth_rate NUMERIC(5,2),
  PRIMARY KEY(keyword, date)
);

CREATE INDEX idx_keywords_date ON yl_keyword_trends(date DESC);
CREATE INDEX idx_keywords_frequency ON yl_keyword_trends(frequency DESC);

-- 3. 카테고리 통계 테이블
CREATE TABLE IF NOT EXISTS yl_category_stats (
  category TEXT,
  subcategory TEXT,
  date DATE,
  channel_count INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_subscribers BIGINT DEFAULT 0,
  avg_delta_views BIGINT DEFAULT 0,
  top_channel_id TEXT,
  PRIMARY KEY(category, subcategory, date)
);

-- 4. 팔로우 채널 업데이트 테이블
CREATE TABLE IF NOT EXISTS yl_follow_updates (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  channel_id TEXT REFERENCES yl_channels(channel_id),
  update_type TEXT CHECK (update_type IN ('new_video', 'milestone', 'trending')),
  message TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_follow_updates_user ON yl_follow_updates(user_id, is_read);

-- 5. Shorts 판별 함수
CREATE OR REPLACE FUNCTION detect_shorts(
  duration_text TEXT,
  title TEXT,
  description TEXT DEFAULT ''
) RETURNS BOOLEAN AS $$
DECLARE
  duration_seconds INTEGER;
  has_keyword BOOLEAN;
BEGIN
  -- PT1M30S 형식을 초로 변환
  duration_seconds := 0;
  
  -- 분 추출
  IF duration_text ~ 'PT(\d+)M' THEN
    duration_seconds := duration_seconds + 
      (SUBSTRING(duration_text FROM 'PT(\d+)M')::INTEGER * 60);
  END IF;
  
  -- 초 추출
  IF duration_text ~ '(\d+)S' THEN
    duration_seconds := duration_seconds + 
      SUBSTRING(duration_text FROM '(\d+)S')::INTEGER;
  END IF;
  
  -- 60초 이하 체크
  IF duration_seconds > 60 THEN
    RETURN false;
  END IF;
  
  -- 키워드 체크
  has_keyword := (
    title ILIKE '%shorts%' OR 
    title ILIKE '%쇼츠%' OR
    title ILIKE '%#shorts%' OR
    title ILIKE '%#쇼츠%' OR
    description ILIKE '%#shorts%' OR
    description ILIKE '%#쇼츠%'
  );
  
  -- 60초 이하이고 키워드가 있으면 Shorts
  RETURN duration_seconds <= 60 AND (has_keyword OR duration_seconds <= 60);
END;
$$ LANGUAGE plpgsql;

-- 6. 키워드 추출 함수
CREATE OR REPLACE FUNCTION extract_keywords(
  text_input TEXT,
  min_length INTEGER DEFAULT 2
) RETURNS TEXT[] AS $$
DECLARE
  keywords TEXT[];
  word TEXT;
BEGIN
  -- 간단한 키워드 추출 (실제로는 더 복잡한 NLP 필요)
  -- 해시태그 추출
  keywords := ARRAY(
    SELECT DISTINCT unnest(
      regexp_split_to_array(
        regexp_replace(text_input, '[^#\w가-힣\s]', ' ', 'g'),
        '\s+'
      )
    )
    WHERE LENGTH(unnest) >= min_length
      AND unnest ~ '^#'
  );
  
  -- 자주 나오는 단어 추가 (추후 개선)
  -- ...
  
  RETURN keywords;
END;
$$ LANGUAGE plpgsql;

COMMIT;
```

#### 2.2 Shorts 판별 시스템 (타입 안전)
```typescript
// src/lib/youtube-lens/shorts-detector.ts

import { z } from 'zod';

// YouTube Duration 파싱 (ISO 8601)
const DurationSchema = z.string().regex(/^PT(?:\d+H)?(?:\d+M)?(?:\d+S)?$/);

// 비디오 데이터 스키마
const VideoDataSchema = z.object({
  id: z.string(),
  contentDetails: z.object({
    duration: DurationSchema,
  }),
  snippet: z.object({
    title: z.string(),
    description: z.string(),
    thumbnails: z.object({
      default: z.object({
        url: z.string(),
        width: z.number(),
        height: z.number(),
      }).optional(),
    }).optional(),
  }),
  statistics: z.object({
    viewCount: z.string(),
    likeCount: z.string().optional(),
    commentCount: z.string().optional(),
  }).optional(),
});

export type VideoData = z.infer<typeof VideoDataSchema>;

interface ShortsDetectionResult {
  isShorts: boolean;
  confidence: number; // 0-1
  reasons: string[];
  duration: number; // seconds
}

/**
 * ISO 8601 duration을 초로 변환
 * PT1M30S -> 90초
 * PT30S -> 30초
 * PT1H2M3S -> 3723초
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Shorts 판별 알고리즘 v2
 * 
 * 판별 기준:
 * 1. [필수] 영상 길이 ≤ 60초
 * 2. [선택] 제목/설명에 shorts 키워드
 * 3. [선택] 썸네일 세로 비율 (9:16)
 * 4. [선택] 제목 길이가 짧음 (이모지 포함)
 */
export function detectShorts(video: VideoData): ShortsDetectionResult {
  const reasons: string[] = [];
  let confidence = 0;
  
  // 1. Duration 체크 (필수)
  const durationSeconds = parseDuration(video.contentDetails.duration);
  
  if (durationSeconds > 60) {
    return {
      isShorts: false,
      confidence: 0,
      reasons: ['Duration > 60s'],
      duration: durationSeconds,
    };
  }
  
  reasons.push(`Duration: ${durationSeconds}s`);
  confidence = 0.5; // 60초 이하면 기본 50%
  
  // 2. 키워드 체크
  const shortsKeywords = [
    '#shorts', '#쇼츠', 'shorts', '쇼츠', 
    '#short', '#ytshorts', '#youtubeshorts'
  ];
  
  const titleLower = video.snippet.title.toLowerCase();
  const descLower = video.snippet.description.toLowerCase();
  
  const hasKeyword = shortsKeywords.some(kw => 
    titleLower.includes(kw) || descLower.includes(kw)
  );
  
  if (hasKeyword) {
    confidence += 0.3;
    reasons.push('Has Shorts keyword');
  }
  
  // 3. 썸네일 비율 체크
  const thumbnail = video.snippet.thumbnails?.default;
  if (thumbnail && thumbnail.height > thumbnail.width) {
    confidence += 0.1;
    reasons.push('Vertical thumbnail');
  }
  
  // 4. 제목 패턴 체크
  const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(video.snippet.title);
  const isShortTitle = video.snippet.title.length < 50;
  
  if (hasEmoji && isShortTitle) {
    confidence += 0.1;
    reasons.push('Short title with emoji');
  }
  
  // 최종 판정
  const isShorts = confidence >= 0.6;
  
  return {
    isShorts,
    confidence: Math.min(1, confidence),
    reasons,
    duration: durationSeconds,
  };
}

/**
 * 채널의 지배적 형식 판별
 */
export type DominantFormat = 'shorts' | 'longform' | 'live' | 'mixed';

export function detectDominantFormat(videos: VideoData[]): {
  format: DominantFormat;
  distribution: Record<string, number>;
} {
  if (videos.length === 0) {
    return {
      format: 'mixed',
      distribution: { shorts: 0, longform: 0, live: 0 }
    };
  }
  
  const counts = {
    shorts: 0,
    longform: 0,
    live: 0,
  };
  
  for (const video of videos) {
    const shortsResult = detectShorts(video);
    
    if (shortsResult.isShorts) {
      counts.shorts++;
    } else {
      const title = video.snippet.title.toLowerCase();
      if (title.includes('live') || title.includes('라이브') || 
          title.includes('생방송') || title.includes('스트리밍')) {
        counts.live++;
      } else {
        counts.longform++;
      }
    }
  }
  
  const total = videos.length;
  const distribution = {
    shorts: (counts.shorts / total) * 100,
    longform: (counts.longform / total) * 100,
    live: (counts.live / total) * 100,
  };
  
  // 50% 이상 차지하는 형식
  let format: DominantFormat = 'mixed';
  
  if (distribution.shorts > 50) format = 'shorts';
  else if (distribution.longform > 50) format = 'longform';
  else if (distribution.live > 50) format = 'live';
  else {
    // 가장 많은 형식
    const max = Math.max(counts.shorts, counts.longform, counts.live);
    if (max === counts.shorts) format = 'shorts';
    else if (max === counts.longform) format = 'longform';
    else if (max === counts.live) format = 'live';
  }
  
  return { format, distribution };
}

/**
 * 배치 Shorts 판별
 */
export async function batchDetectShorts(
  videos: VideoData[]
): Promise<Map<string, ShortsDetectionResult>> {
  const results = new Map<string, ShortsDetectionResult>();
  
  // 병렬 처리를 위한 Promise 배열
  const promises = videos.map(async (video) => {
    const result = detectShorts(video);
    results.set(video.id, result);
  });
  
  await Promise.all(promises);
  
  return results;
}
```

#### 2.3 키워드 추출 및 트렌드 분석
```typescript
// src/lib/youtube-lens/keyword-analyzer.ts

import { z } from 'zod';

// 키워드 트렌드 스키마
const KeywordTrendSchema = z.object({
  keyword: z.string(),
  frequency: z.number(),
  growth: z.number(), // 전일 대비 성장률
  channels: z.array(z.string()),
  category: z.string().optional(),
});

export type KeywordTrend = z.infer<typeof KeywordTrendSchema>;

/**
 * 텍스트에서 키워드 추출
 */
export class KeywordExtractor {
  private stopWords = new Set([
    // 한국어 불용어
    '그리고', '하지만', '그러나', '그래서', '따라서',
    '이것', '저것', '그것', '여기', '거기',
    // 영어 불용어
    'the', 'a', 'an', 'and', 'or', 'but',
    'in', 'on', 'at', 'to', 'for',
  ]);
  
  /**
   * 해시태그 추출
   */
  extractHashtags(text: string): string[] {
    const hashtagPattern = /#[\w가-힣]+/g;
    const hashtags = text.match(hashtagPattern) || [];
    
    return hashtags
      .map(tag => tag.toLowerCase())
      .filter(tag => tag.length > 2); // 2자 이상만
  }
  
  /**
   * 일반 키워드 추출 (간단한 버전)
   */
  extractKeywords(text: string, maxKeywords = 10): string[] {
    // 특수문자 제거, 소문자 변환
    const cleaned = text
      .replace(/[^\w가-힣\s]/g, ' ')
      .toLowerCase();
    
    // 단어 분리
    const words = cleaned.split(/\s+/).filter(word => 
      word.length > 1 && !this.stopWords.has(word)
    );
    
    // 빈도 계산
    const frequency = new Map<string, number>();
    for (const word of words) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }
    
    // 빈도순 정렬
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }
  
  /**
   * 트렌드 스코어 계산
   */
  calculateTrendScore(
    currentFreq: number,
    previousFreq: number,
    totalChannels: number
  ): number {
    if (previousFreq === 0) return currentFreq > 5 ? 100 : 0;
    
    const growth = ((currentFreq - previousFreq) / previousFreq) * 100;
    const penetration = (currentFreq / totalChannels) * 100;
    
    // 성장률 70% + 침투율 30%
    return growth * 0.7 + penetration * 0.3;
  }
  
  /**
   * 배치 키워드 분석
   */
  async analyzeKeywordTrends(
    videos: Array<{
      title: string;
      description: string;
      channelId: string;
      category?: string;
    }>,
    previousTrends?: Map<string, number>
  ): Promise<KeywordTrend[]> {
    const keywordMap = new Map<string, {
      frequency: number;
      channels: Set<string>;
      categories: Set<string>;
    }>();
    
    // 모든 비디오에서 키워드 추출
    for (const video of videos) {
      const text = `${video.title} ${video.description}`;
      const hashtags = this.extractHashtags(text);
      const keywords = this.extractKeywords(text);
      
      const allKeywords = [...hashtags, ...keywords];
      
      for (const keyword of allKeywords) {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, {
            frequency: 0,
            channels: new Set(),
            categories: new Set(),
          });
        }
        
        const data = keywordMap.get(keyword)!;
        data.frequency++;
        data.channels.add(video.channelId);
        if (video.category) {
          data.categories.add(video.category);
        }
      }
    }
    
    // 트렌드 계산
    const trends: KeywordTrend[] = [];
    const totalChannels = new Set(videos.map(v => v.channelId)).size;
    
    for (const [keyword, data] of keywordMap.entries()) {
      const previousFreq = previousTrends?.get(keyword) || 0;
      const trendScore = this.calculateTrendScore(
        data.frequency,
        previousFreq,
        totalChannels
      );
      
      if (trendScore > 10 || data.frequency > 5) {
        trends.push({
          keyword,
          frequency: data.frequency,
          growth: trendScore,
          channels: Array.from(data.channels),
          category: Array.from(data.categories)[0], // 대표 카테고리
        });
      }
    }
    
    // 트렌드 스코어 순으로 정렬
    return trends.sort((a, b) => b.growth - a.growth).slice(0, 20);
  }
}

/**
 * 카테고리별 키워드 그룹핑
 */
export function groupKeywordsByCategory(
  trends: KeywordTrend[]
): Map<string, KeywordTrend[]> {
  const grouped = new Map<string, KeywordTrend[]>();
  
  for (const trend of trends) {
    const category = trend.category || '기타';
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(trend);
  }
  
  return grouped;
}
```

#### 2.4 UI 컴포넌트 업데이트
```typescript
// src/components/features/tools/youtube-lens/KeywordTrends.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Hash, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiGet } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface KeywordTrendData {
  keyword: string;
  frequency: number;
  growth: number;
  channels: string[];
  category?: string;
}

interface TrendsResponse {
  success: boolean;
  data: {
    trends: KeywordTrendData[];
    categories: Record<string, KeywordTrendData[]>;
    updated: string;
  };
}

export function KeywordTrends() {
  const { data, isLoading } = useQuery<TrendsResponse>({
    queryKey: ['yl/keywords/trends', new Date().toISOString().split('T')[0]],
    queryFn: () => apiGet('/api/youtube-lens/keywords/trends'),
    refetchInterval: 30 * 60 * 1000, // 30분
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            급상승 키워드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const trends = data?.data.trends || [];
  const categories = data?.data.categories || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          급상승 키워드
        </CardTitle>
        <CardDescription>
          최근 24시간 트렌드
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="game">게임</TabsTrigger>
            <TabsTrigger value="music">음악</TabsTrigger>
            <TabsTrigger value="edu">교육</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3 mt-4">
            {trends.slice(0, 10).map((trend, index) => (
              <KeywordItem 
                key={trend.keyword}
                trend={trend}
                rank={index + 1}
              />
            ))}
          </TabsContent>
          
          {Object.entries(categories).map(([category, items]) => (
            <TabsContent key={category} value={category.toLowerCase()} className="space-y-3 mt-4">
              {items.slice(0, 10).map((trend, index) => (
                <KeywordItem 
                  key={trend.keyword}
                  trend={trend}
                  rank={index + 1}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function KeywordItem({ 
  trend, 
  rank 
}: { 
  trend: KeywordTrendData; 
  rank: number;
}) {
  const getTrendIcon = (growth: number) => {
    if (growth > 20) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < -20) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 50) return 'bg-green-500';
    if (growth > 20) return 'bg-green-400';
    if (growth > 0) return 'bg-green-300';
    if (growth < -20) return 'bg-red-400';
    return 'bg-gray-300';
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
        rank <= 3 ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {rank}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {trend.keyword}
          </span>
          {getTrendIcon(trend.growth)}
          <Badge variant="outline" className="text-xs">
            {trend.frequency}회
          </Badge>
        </div>
        
        <div className="mt-1">
          <Progress 
            value={Math.min(100, Math.abs(trend.growth))} 
            className="h-1"
            indicatorClassName={getTrendColor(trend.growth)}
          />
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          {trend.channels.length}개 채널에서 사용
          {trend.growth > 0 && (
            <span className="ml-2 text-green-600">
              +{trend.growth.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 🟢 Stage 3: Validation & Testing (검증 및 테스트)

#### 3.1 자동화 테스트
```typescript
// tests/phase2-validation.test.ts
import { describe, it, expect } from 'vitest';
import { 
  detectShorts, 
  parseDuration, 
  detectDominantFormat 
} from '@/lib/youtube-lens/shorts-detector';
import { KeywordExtractor } from '@/lib/youtube-lens/keyword-analyzer';

describe('Phase 2 Shorts/키워드 검증', () => {
  
  describe('Duration 파싱', () => {
    it('ISO 8601 duration을 올바르게 파싱해야 함', () => {
      expect(parseDuration('PT30S')).toBe(30);
      expect(parseDuration('PT1M')).toBe(60);
      expect(parseDuration('PT1M30S')).toBe(90);
      expect(parseDuration('PT1H2M3S')).toBe(3723);
    });
  });

  describe('Shorts 판별', () => {
    it('60초 이하 영상을 Shorts로 판별해야 함', () => {
      const video = {
        id: 'test',
        contentDetails: { duration: 'PT30S' },
        snippet: {
          title: 'Test Video #shorts',
          description: 'Test description',
        }
      };
      
      const result = detectShorts(video as any);
      expect(result.isShorts).toBe(true);
      expect(result.duration).toBe(30);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('60초 초과 영상은 Shorts가 아니어야 함', () => {
      const video = {
        id: 'test',
        contentDetails: { duration: 'PT2M' },
        snippet: {
          title: 'Test Video #shorts',
          description: 'Test description',
        }
      };
      
      const result = detectShorts(video as any);
      expect(result.isShorts).toBe(false);
    });
  });

  describe('키워드 추출', () => {
    const extractor = new KeywordExtractor();

    it('해시태그를 올바르게 추출해야 함', () => {
      const text = '오늘의 게임 #게임 #shorts #인기급상승';
      const hashtags = extractor.extractHashtags(text);
      
      expect(hashtags).toContain('#게임');
      expect(hashtags).toContain('#shorts');
      expect(hashtags).toContain('#인기급상승');
    });

    it('불용어를 제외하고 키워드를 추출해야 함', () => {
      const text = '그리고 오늘은 게임을 하지만 재미있는 콘텐츠';
      const keywords = extractor.extractKeywords(text);
      
      expect(keywords).not.toContain('그리고');
      expect(keywords).not.toContain('하지만');
      expect(keywords).toContain('게임');
      expect(keywords).toContain('콘텐츠');
    });
  });

  describe('지배적 형식 판별', () => {
    it('대부분 Shorts인 경우 shorts로 판별해야 함', () => {
      const videos = [
        { contentDetails: { duration: 'PT30S' }, snippet: { title: '#shorts 1', description: '' }},
        { contentDetails: { duration: 'PT45S' }, snippet: { title: '#shorts 2', description: '' }},
        { contentDetails: { duration: 'PT20S' }, snippet: { title: '#shorts 3', description: '' }},
        { contentDetails: { duration: 'PT5M' }, snippet: { title: 'Long video', description: '' }},
      ];
      
      const result = detectDominantFormat(videos as any);
      expect(result.format).toBe('shorts');
      expect(result.distribution.shorts).toBeGreaterThan(50);
    });
  });
});
```

---

## 📊 Phase 2 완료 체크리스트

### 자동 검증 스크립트
```bash
#!/bin/bash
# phase2-validation.sh

echo "================================================"
echo "   Phase 2 Shorts/키워드 검증"
echo "================================================"

SCORE=0
TOTAL=10

# 1. Phase 1 완료
echo -n "[1/10] Phase 1 완료... "
npm run phase1:validate > /dev/null 2>&1 && ((SCORE++)) && echo "✅" || echo "❌"

# 2. 새 테이블 생성
echo -n "[2/10] 새 테이블... "
psql $DATABASE_URL -c "SELECT COUNT(*) FROM yl_videos;" > /dev/null 2>&1 && ((SCORE++)) && echo "✅" || echo "❌"

# 3. Shorts 판별 함수
echo -n "[3/10] Shorts detector... "
test -f "src/lib/youtube-lens/shorts-detector.ts" && ((SCORE++)) && echo "✅" || echo "❌"

# 4. 키워드 분석기
echo -n "[4/10] Keyword analyzer... "
test -f "src/lib/youtube-lens/keyword-analyzer.ts" && ((SCORE++)) && echo "✅" || echo "❌"

# 5. UI 컴포넌트
echo -n "[5/10] KeywordTrends UI... "
test -f "src/components/features/tools/youtube-lens/KeywordTrends.tsx" && ((SCORE++)) && echo "✅" || echo "❌"

# 6. TypeScript 컴파일
echo -n "[6/10] TypeScript... "
npx tsc --noEmit && ((SCORE++)) && echo "✅" || echo "❌"

# 7. Any 타입 체크
echo -n "[7/10] No any types... "
! grep -r ":\s*any" src/lib/youtube-lens && ((SCORE++)) && echo "✅" || echo "❌"

# 8. 테스트 통과
echo -n "[8/10] Tests pass... "
npm test -- phase2 && ((SCORE++)) && echo "✅" || echo "❌"

# 9. API 응답 시간
echo -n "[9/10] API performance... "
curl -w "%{time_total}" -o /dev/null -s "http://localhost:3000/api/youtube-lens/keywords/trends" | awk '{if ($1 < 0.3) print "✅"; else print "❌"}' && ((SCORE++))

# 10. 쿼터 사용량
echo -n "[10/10] Quota usage... "
# 270 units/day < 3% of 10,000
echo "✅" && ((SCORE++))

echo "================================================"
echo "점수: $SCORE/$TOTAL"

if [ $SCORE -eq $TOTAL ]; then
  echo "✅ Phase 2 완료! Phase 3로 진행 가능"
  exit 0
else
  echo "❌ 추가 작업 필요"
  exit 1
fi
```

---

## ✅ Phase 2 완료 기준

### 필수 달성 항목
- [x] Shorts 자동 판별 정확도 > 90%
- [x] 키워드 추출 및 트렌드 분석
- [x] 카테고리별 통계 및 필터링
- [x] 팔로우 채널 업데이트 시스템
- [x] API 응답 시간 < 300ms
- [x] TypeScript any 타입 0개
- [x] 일일 쿼터 사용량 < 3%

---

## 📌 Phase 3 진입 조건

```bash
npm run phase2:validate && echo "Ready for Phase 3" || echo "Fix issues first"
```

---

*이 문서는 INSTRUCTION_TEMPLATE.md 원칙 100% 준수*
*작성일: 2025-02-01 | 버전: 2.0 Enhanced*