# Phase 2: Shorts/키워드/카테고리 구현

## 🎯 목표
- **Shorts 자동 판별** 알고리즘 구현
- **키워드 추출** 및 급상승 분석
- **카테고리별 통계** 및 필터링
- **팔로우 채널 업데이트** 알림

## 📋 구현 작업 목록

### 1. Shorts 판별 시스템

#### 1.1 판별 알고리즘 유틸리티
```typescript
// src/lib/youtube-lens/shorts-detector.ts

interface ShortsDetectionCriteria {
  duration: number; // 초 단위
  title: string;
  description: string;
  thumbnailUrl?: string;
  channelOverride?: boolean; // 관리자 수동 설정
}

/**
 * Shorts 판별 알고리즘
 * 1. 영상 길이 ≤ 60초 (필수)
 * 2. 제목/설명에 #shorts, #쇼츠 키워드
 * 3. 썸네일 세로 비율 >= 1.0
 * 4. 관리자 오버라이드
 */
export function detectShorts(criteria: ShortsDetectionCriteria): boolean {
  // 관리자 오버라이드 우선
  if (criteria.channelOverride !== undefined) {
    return criteria.channelOverride;
  }

  // 필수 조건: 60초 이하
  if (criteria.duration > 60) {
    return false;
  }

  // 키워드 체크
  const keywords = ['#shorts', '#쇼츠', 'shorts', '쇼츠', 'short'];
  const titleLower = criteria.title.toLowerCase();
  const descLower = criteria.description.toLowerCase();
  
  const hasKeyword = keywords.some(kw => 
    titleLower.includes(kw) || descLower.includes(kw)
  );

  // 썸네일 비율 체크 (옵션)
  if (criteria.thumbnailUrl) {
    // 실제 구현시 이미지 메타데이터 확인
    // 세로 비율 >= 1.0 체크
  }

  // 60초 이하 + 키워드 있으면 Shorts
  return hasKeyword;
}

/**
 * 채널의 지배적 형식 판별
 */
export function detectDominantFormat(
  videos: Array<{ duration: number; title: string; description: string }>
): '쇼츠' | '롱폼' | '라이브' | null {
  if (videos.length === 0) return null;

  const counts = {
    shorts: 0,
    long: 0,
    live: 0,
  };

  for (const video of videos) {
    if (detectShorts({ 
      duration: video.duration, 
      title: video.title, 
      description: video.description 
    })) {
      counts.shorts++;
    } else if (video.title.toLowerCase().includes('live') || 
               video.title.includes('라이브')) {
      counts.live++;
    } else {
      counts.long++;
    }
  }

  // 50% 이상 차지하는 형식 반환
  const total = videos.length;
  if (counts.shorts / total > 0.5) return '쇼츠';
  if (counts.long / total > 0.5) return '롱폼';
  if (counts.live / total > 0.5) return '라이브';
  
  // 혼합 형식인 경우 가장 많은 것
  const max = Math.max(counts.shorts, counts.long, counts.live);
  if (max === counts.shorts) return '쇼츠';
  if (max === counts.long) return '롱폼';
  return '라이브';
}
```

#### 1.2 비디오 메타데이터 수집 배치
```typescript
// app/api/youtube-lens/batch/collect-videos/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { detectShorts, detectDominantFormat } from '@/lib/youtube-lens/shorts-detector';

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Admin 체크
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 승인된 채널 목록
    const { data: channels } = await supabase
      .from('yl_channels')
      .select('channel_id')
      .eq('approval_status', 'approved');

    if (!channels || channels.length === 0) {
      return NextResponse.json({ message: 'No approved channels' });
    }

    const allVideos = [];
    const channelFormats = new Map();

    // 각 채널의 최신 비디오 수집
    for (const channel of channels) {
      // 1. 채널의 업로드 플레이리스트 ID 가져오기
      const channelUrl = `${YT_BASE}/channels?part=contentDetails&id=${channel.channel_id}&key=${process.env.YT_ADMIN_KEY}`;
      const channelRes = await fetch(channelUrl);
      const channelData = await channelRes.json();
      
      if (!channelData.items?.[0]) continue;
      
      const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
      
      // 2. 최신 비디오 10개 가져오기
      const videosUrl = `${YT_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=10&key=${process.env.YT_ADMIN_KEY}`;
      const videosRes = await fetch(videosUrl);
      const videosData = await videosRes.json();
      
      if (!videosData.items) continue;
      
      const videoIds = videosData.items.map((v: any) => v.snippet.resourceId.videoId).join(',');
      
      // 3. 비디오 상세 정보 (duration 포함)
      const detailsUrl = `${YT_BASE}/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${process.env.YT_ADMIN_KEY}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();
      
      const channelVideos = [];
      
      for (const video of detailsData.items || []) {
        // ISO 8601 duration을 초로 변환
        const duration = parseDuration(video.contentDetails.duration);
        const isShorts = detectShorts({
          duration,
          title: video.snippet.title,
          description: video.snippet.description || '',
        });
        
        const videoData = {
          video_id: video.id,
          channel_id: channel.channel_id,
          title: video.snippet.title,
          description: video.snippet.description,
          published_at: video.snippet.publishedAt,
          duration,
          is_shorts: isShorts,
          view_count: parseInt(video.statistics.viewCount || '0'),
          like_count: parseInt(video.statistics.likeCount || '0'),
          comment_count: parseInt(video.statistics.commentCount || '0'),
        };
        
        channelVideos.push(videoData);
        allVideos.push(videoData);
      }
      
      // 채널의 지배적 형식 판별
      const dominantFormat = detectDominantFormat(channelVideos);
      if (dominantFormat) {
        channelFormats.set(channel.channel_id, dominantFormat);
      }
    }

    // 비디오 데이터 저장
    if (allVideos.length > 0) {
      await supabase.from('yl_videos')
        .upsert(allVideos, { onConflict: 'video_id' });
    }

    // 채널 형식 업데이트
    for (const [channelId, format] of channelFormats.entries()) {
      await supabase.from('yl_channels')
        .update({ dominant_format: format })
        .eq('channel_id', channelId);
    }

    return NextResponse.json({
      success: true,
      processed: allVideos.length,
      channels: channels.length,
      shorts: allVideos.filter(v => v.is_shorts).length,
    });

  } catch (error) {
    console.error('Video collection error:', error);
    return NextResponse.json(
      { error: 'Failed to collect videos' },
      { status: 500 }
    );
  }
}

// ISO 8601 duration 파싱 헬퍼
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}
```

### 2. 키워드 추출 시스템

#### 2.1 키워드 추출 유틸리티
```typescript
// src/lib/youtube-lens/keyword-extractor.ts

interface KeywordData {
  keyword: string;
  count: number;
  channels: Set<string>;
  growth: number; // 전일 대비 증가율
}

/**
 * 비디오 제목/설명에서 키워드 추출
 */
export function extractKeywords(text: string): string[] {
  // 한글/영문/숫자만 추출
  const cleaned = text.replace(/[^\w가-힣\s]/g, ' ');
  
  // 단어 분리
  const words = cleaned.split(/\s+/).filter(w => w.length > 1);
  
  // 불용어 제거
  const stopWords = new Set([
    '영상', '비디오', '채널', '구독', '좋아요', '댓글',
    'video', 'channel', 'subscribe', 'like', 'comment',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
  ]);
  
  return words
    .filter(w => !stopWords.has(w.toLowerCase()))
    .map(w => w.toLowerCase());
}

/**
 * 키워드 빈도 계산
 */
export function calculateKeywordFrequency(
  videos: Array<{ title: string; description: string; channel_id: string }>
): Map<string, KeywordData> {
  const keywordMap = new Map<string, KeywordData>();
  
  for (const video of videos) {
    const keywords = [
      ...extractKeywords(video.title),
      ...extractKeywords(video.description.slice(0, 200)), // 설명 첫 200자만
    ];
    
    for (const keyword of keywords) {
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, {
          keyword,
          count: 0,
          channels: new Set(),
          growth: 0,
        });
      }
      
      const data = keywordMap.get(keyword)!;
      data.count++;
      data.channels.add(video.channel_id);
    }
  }
  
  // 2개 이상 채널에서 언급된 키워드만 필터
  return new Map(
    Array.from(keywordMap.entries())
      .filter(([_, data]) => data.channels.size >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20) // Top 20
  );
}

/**
 * 급상승 키워드 계산 (전일 대비)
 */
export function calculateTrendingKeywords(
  todayKeywords: Map<string, KeywordData>,
  yesterdayKeywords: Map<string, KeywordData>
): Array<{ keyword: string; growth: number; count: number }> {
  const trending = [];
  
  for (const [keyword, todayData] of todayKeywords.entries()) {
    const yesterdayData = yesterdayKeywords.get(keyword);
    const yesterdayCount = yesterdayData?.count || 0;
    
    if (yesterdayCount > 0) {
      const growth = ((todayData.count - yesterdayCount) / yesterdayCount) * 100;
      if (growth > 50) { // 50% 이상 증가
        trending.push({
          keyword,
          growth,
          count: todayData.count,
        });
      }
    } else if (todayData.count >= 5) {
      // 신규 키워드 (5회 이상 언급)
      trending.push({
        keyword,
        growth: 999, // 신규 표시
        count: todayData.count,
      });
    }
  }
  
  return trending
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 10);
}
```

#### 2.2 키워드 배치 처리
```typescript
// app/api/youtube-lens/batch/extract-keywords/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { 
  calculateKeywordFrequency, 
  calculateTrendingKeywords 
} from '@/lib/youtube-lens/keyword-extractor';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // 오늘 게시된 비디오
    const { data: todayVideos } = await supabase
      .from('yl_videos')
      .select('video_id, title, description, channel_id')
      .gte('published_at', today)
      .lt('published_at', new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    
    // 어제 게시된 비디오
    const { data: yesterdayVideos } = await supabase
      .from('yl_videos')
      .select('video_id, title, description, channel_id')
      .gte('published_at', yesterday)
      .lt('published_at', today);
    
    // 키워드 빈도 계산
    const todayKeywords = calculateKeywordFrequency(todayVideos || []);
    const yesterdayKeywords = calculateKeywordFrequency(yesterdayVideos || []);
    
    // 급상승 키워드
    const trendingKeywords = calculateTrendingKeywords(todayKeywords, yesterdayKeywords);
    
    // DB 저장
    const keywordRecords = trendingKeywords.map(kw => ({
      date: today,
      keyword: kw.keyword,
      count: kw.count,
      growth_rate: kw.growth,
      channel_count: todayKeywords.get(kw.keyword)?.channels.size || 0,
    }));
    
    if (keywordRecords.length > 0) {
      await supabase.from('yl_trending_keywords')
        .upsert(keywordRecords, { onConflict: 'date,keyword' });
    }
    
    return NextResponse.json({
      success: true,
      keywords: trendingKeywords.length,
      date: today,
    });
    
  } catch (error) {
    console.error('Keyword extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract keywords' },
      { status: 500 }
    );
  }
}
```

### 3. 카테고리 통계 시스템

#### 3.1 카테고리 매핑 테이블
```sql
-- 마이그레이션 추가
CREATE TABLE yl_categories (
  category_id TEXT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  parent_category TEXT,
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 999
);

-- YouTube 카테고리 ID 매핑
INSERT INTO yl_categories (category_id, name_ko, name_en, icon, color) VALUES
('1', '영화/애니메이션', 'Film & Animation', 'film', '#FF6B6B'),
('2', '자동차', 'Autos & Vehicles', 'car', '#4ECDC4'),
('10', '음악', 'Music', 'music', '#FFE66D'),
('15', '반려동물', 'Pets & Animals', 'heart', '#95E1D3'),
('17', '스포츠', 'Sports', 'activity', '#FFA07A'),
('19', '여행/이벤트', 'Travel & Events', 'map-pin', '#87CEEB'),
('20', '게임', 'Gaming', 'gamepad-2', '#9B59B6'),
('22', '인물/블로그', 'People & Blogs', 'users', '#F39C12'),
('23', '코미디', 'Comedy', 'smile', '#FF9FF3'),
('24', '엔터테인먼트', 'Entertainment', 'tv', '#EE5A6F'),
('25', '뉴스/정치', 'News & Politics', 'newspaper', '#95A5A6'),
('26', '노하우/스타일', 'Howto & Style', 'sparkles', '#FD79A8'),
('27', '교육', 'Education', 'book-open', '#74B9FF'),
('28', '과학기술', 'Science & Technology', 'cpu', '#00D2D3');
```

#### 3.2 카테고리 통계 API
```typescript
// app/api/youtube-lens/category-stats/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
    // 카테고리별 채널 수
    const { data: channelsByCategory } = await supabase
      .from('yl_channels')
      .select('category, subcategory')
      .eq('approval_status', 'approved');
    
    // 카테고리별 일일 조회수 합계
    const { data: viewsByCategory } = await supabase
      .from('yl_channel_daily_delta')
      .select(`
        delta_views,
        channel:yl_channels(category, subcategory)
      `)
      .eq('date', date);
    
    // 카테고리 메타데이터
    const { data: categories } = await supabase
      .from('yl_categories')
      .select('*')
      .order('display_order');
    
    // 통계 집계
    const stats = new Map();
    
    // 채널 수 집계
    for (const channel of channelsByCategory || []) {
      const cat = channel.category || '기타';
      if (!stats.has(cat)) {
        stats.set(cat, {
          category: cat,
          channelCount: 0,
          totalViews: 0,
          avgViews: 0,
        });
      }
      stats.get(cat).channelCount++;
    }
    
    // 조회수 집계
    for (const item of viewsByCategory || []) {
      const cat = item.channel?.category || '기타';
      if (stats.has(cat)) {
        stats.get(cat).totalViews += item.delta_views;
      }
    }
    
    // 평균 계산
    for (const stat of stats.values()) {
      if (stat.channelCount > 0) {
        stat.avgViews = Math.round(stat.totalViews / stat.channelCount);
      }
    }
    
    // 카테고리 메타데이터 병합
    const enrichedStats = Array.from(stats.values()).map(stat => {
      const meta = categories?.find(c => c.name_ko === stat.category);
      return {
        ...stat,
        icon: meta?.icon || 'folder',
        color: meta?.color || '#666666',
        nameEn: meta?.name_en || stat.category,
      };
    });
    
    // 점유율 계산
    const totalChannels = enrichedStats.reduce((sum, s) => sum + s.channelCount, 0);
    const result = enrichedStats
      .map(stat => ({
        ...stat,
        share: ((stat.channelCount / totalChannels) * 100).toFixed(1),
      }))
      .sort((a, b) => b.channelCount - a.channelCount);
    
    return NextResponse.json({
      success: true,
      data: result,
      date,
    });
    
  } catch (error) {
    console.error('Category stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category stats' },
      { status: 500 }
    );
  }
}
```

### 4. 팔로우 채널 업데이트

#### 4.1 사용자 팔로우 관계 테이블
```sql
-- 마이그레이션 추가
CREATE TABLE yl_user_follows (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  notification_enabled BOOLEAN DEFAULT true,
  PRIMARY KEY(user_id, channel_id)
);

-- RLS 정책
ALTER TABLE yl_user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY yl_user_follows_select_own ON yl_user_follows
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY yl_user_follows_insert_own ON yl_user_follows
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY yl_user_follows_update_own ON yl_user_follows
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY yl_user_follows_delete_own ON yl_user_follows
  FOR DELETE USING (user_id = auth.uid());
```

#### 4.2 팔로우 채널 업데이트 컴포넌트
```typescript
// src/components/features/tools/youtube-lens/FollowedChannelsCard.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell, BellOff, FolderOpen, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { apiGet, apiPost } from '@/lib/api-client';
import { formatNumberKo } from '@/lib/youtube-lens/format-number-ko';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface FollowedChannel {
  channel_id: string;
  channel: {
    title: string;
    subscriber_count: number;
    category: string;
  };
  delta: {
    delta_views: number;
    date: string;
  };
  last_video: {
    title: string;
    published_at: string;
    is_shorts: boolean;
  };
  notification_enabled: boolean;
}

export function FollowedChannelsCard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['yl/followed-channels'],
    queryFn: async () => {
      const response = await apiGet<{ data: FollowedChannel[] }>(
        '/api/youtube-lens/followed-channels'
      );
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // 5분마다
  });

  const toggleNotification = async (channelId: string, enabled: boolean) => {
    await apiPost('/api/youtube-lens/follow-notification', {
      channelId,
      enabled,
    });
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="h-20 bg-gray-200" />
        <CardContent className="h-60 bg-gray-100" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          팔로우 채널 업데이트
        </CardTitle>
        <CardDescription>
          내가 팔로우한 채널의 최신 활동
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-3">
            {data.slice(0, 5).map((item) => (
              <div 
                key={item.channel_id}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.channel.title}</h4>
                    {item.delta && item.delta.delta_views > 10000 && (
                      <Badge className="bg-red-100 text-red-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        핫
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1 space-x-2">
                    <span>구독 {formatNumberKo(item.channel.subscriber_count)}</span>
                    <span>·</span>
                    <span>{item.channel.category}</span>
                    {item.delta && (
                      <>
                        <span>·</span>
                        <span className="text-green-600">
                          오늘 +{formatNumberKo(item.delta.delta_views)}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {item.last_video && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span className="line-clamp-1">
                          {item.last_video.title}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(item.last_video.published_at), {
                          addSuffix: true,
                          locale: ko,
                        })}
                        {item.last_video.is_shorts && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Shorts
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center ml-4">
                  <Switch
                    checked={item.notification_enabled}
                    onCheckedChange={(checked) => 
                      toggleNotification(item.channel_id, checked)
                    }
                  />
                  {item.notification_enabled ? (
                    <Bell className="w-4 h-4 ml-2 text-primary" />
                  ) : (
                    <BellOff className="w-4 h-4 ml-2 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>팔로우한 채널이 없습니다</p>
            <Button variant="outline" size="sm" className="mt-3">
              채널 둘러보기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 5. 업데이트된 대시보드 컴포넌트

```typescript
// src/components/features/tools/youtube-lens/DeltaDashboard.tsx 수정
// 기존 Phase 1 코드에 추가

import { FollowedChannelsCard } from './FollowedChannelsCard';

// ... 기존 코드

// 급상승 키워드 섹션 업데이트
const { data: keywords } = useQuery({
  queryKey: ['yl/trending-keywords', new Date().toISOString().split('T')[0]],
  queryFn: async () => {
    const response = await apiGet('/api/youtube-lens/trending-keywords');
    return response.data;
  },
});

// 카테고리 통계 섹션 업데이트
const { data: categoryStats } = useQuery({
  queryKey: ['yl/category-stats', new Date().toISOString().split('T')[0]],
  queryFn: async () => {
    const response = await apiGet('/api/youtube-lens/category-stats');
    return response.data;
  },
});

// 렌더링 부분 수정
return (
  <div className="space-y-6">
    {/* ... 헤더 */}
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. 카테고리 점유율 - 실제 데이터로 업데이트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            카테고리 점유율
          </CardTitle>
          <CardDescription>승인 채널 카테고리 분포</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryStats && categoryStats.length > 0 ? (
            <div className="space-y-2">
              {categoryStats.slice(0, 5).map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{cat.channelCount}개</Badge>
                    <span className="text-xs text-muted-foreground">
                      {cat.share}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              데이터 수집 중...
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. 급상승 키워드 - 실제 데이터로 업데이트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            급상승 키워드
          </CardTitle>
          <CardDescription>오늘의 핫 키워드</CardDescription>
        </CardHeader>
        <CardContent>
          {keywords && keywords.length > 0 ? (
            <div className="space-y-2">
              {keywords.slice(0, 8).map((kw: any, index: number) => (
                <div key={kw.keyword} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{kw.keyword}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {kw.growth === 999 ? (
                      <Badge className="bg-purple-100 text-purple-800">NEW</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">
                        +{kw.growth.toFixed(0)}%
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {kw.count}회
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              키워드 분석 중...
            </div>
          )}
        </CardContent>
      </Card>

      {/* ... 기존 카드들 */}

      {/* 5. 팔로우 채널 업데이트 - Phase 2 신규 */}
      <FollowedChannelsCard />
    </div>
  </div>
);
```

## 🧪 테스트 체크리스트

### 단위 테스트
- [ ] Shorts 판별 알고리즘 테스트 (60초, 키워드, 오버라이드)
- [ ] 키워드 추출 테스트 (불용어 제거, 빈도 계산)
- [ ] 급상승 키워드 계산 테스트
- [ ] ISO 8601 duration 파싱 테스트

### 통합 테스트
- [ ] 비디오 메타데이터 수집 배치 실행
- [ ] 키워드 추출 배치 실행
- [ ] 카테고리 통계 API 응답
- [ ] 팔로우 채널 업데이트 표시

### E2E 테스트
- [ ] 급상승 키워드가 대시보드에 표시됨
- [ ] 카테고리 점유율 차트 정확성
- [ ] 팔로우 채널 알림 토글 동작
- [ ] Shorts 뱃지가 올바르게 표시됨

## ✅ Phase 2 완료 기준

- [ ] Shorts 판별 정확도 90% 이상
- [ ] 키워드 추출 일일 배치 성공
- [ ] 카테고리별 통계 실시간 반영
- [ ] 팔로우 채널 업데이트 5분 이내
- [ ] 모든 데이터 한국어 표기 (천/만)

## 📌 다음 단계
Phase 3: 품질/성능/UX 고도화로 진행