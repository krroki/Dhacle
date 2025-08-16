# YouTube Lens Phase 3: 핵심 기능 구현 (Enhanced)

## 🎯 목표 및 완료 기준
- ✅ 무키워드 인기 Shorts 탐색 (핵심!)
- ✅ 채널 폴더링 & 실시간 모니터링
- ✅ VPH, Δ24h, 참여율 지표 계산
- ✅ 임계치 알림 시스템
- ✅ 컬렉션/보드 관리

## 🔥 Feature A: 무키워드 인기 Shorts 탐색 (핵심 차별화!)

### Step 1: API 검색 로직 구현

```typescript
// src/lib/youtube/popular-shorts.ts
import { youtube } from './api-client';
import { supabase } from '@/lib/supabase/client';

const SHORTS_MAX_DURATION = 70; // seconds
const REGIONS = {
  KR: '한국',
  US: '미국',
  JP: '일본',
  GB: '영국',
  DE: '독일',
  FR: '프랑스',
  BR: '브라질',
  IN: '인도'
};

interface PopularShortsParams {
  regionCode?: string;
  period?: '24h' | '3d' | '7d' | '30d';
  limit?: number;
  excludeMusic?: boolean;
  minViews?: number;
}

/**
 * 키워드 없이 인기 Shorts 가져오기 (핵심 기능!)
 */
export async function getPopularShortsWithoutKeyword(
  params: PopularShortsParams = {}
): Promise<EnrichedShorts[]> {
  const {
    regionCode = 'KR',
    period = '7d',
    limit = 50,
    excludeMusic = false,
    minViews = 0
  } = params;

  try {
    // 1. 기간 계산
    const publishedAfter = calculatePeriodDate(period);
    
    // 2. 빈 쿼리 우회 전략 (중요!)
    // YouTube API는 빈 쿼리를 허용하지 않으므로 우회 방법 사용
    const searchStrategies = [
      { q: ' ', relevanceLanguage: regionCode.toLowerCase() }, // 공백
      { q: '#shorts', type: 'video' }, // 해시태그
      { videoCategoryId: excludeMusic ? '22' : '10' }, // 카테고리별
    ];

    let allVideos: any[] = [];
    
    // 3. 다중 전략으로 영상 수집
    for (const strategy of searchStrategies) {
      const searchResponse = await youtube.search.list({
        part: ['id'],
        ...strategy,
        regionCode,
        publishedAfter,
        videoDuration: 'short', // 4분 이하
        order: 'viewCount',
        maxResults: Math.ceil(limit / searchStrategies.length),
        type: 'video',
        safeSearch: 'none'
      });

      if (searchResponse.data.items) {
        allVideos.push(...searchResponse.data.items);
      }
    }

    // 4. 중복 제거
    const uniqueVideoIds = [...new Set(allVideos.map(v => v.id?.videoId).filter(Boolean))];
    
    if (uniqueVideoIds.length === 0) {
      console.warn('No videos found with current strategies');
      return [];
    }

    // 5. 영상 상세 정보 가져오기 (배치 처리)
    const videoDetails = await getVideosDetailsBatch(uniqueVideoIds);
    
    // 6. Shorts 필터링 (70초 이하 + 세로 비율)
    const shorts = videoDetails.filter(video => {
      const duration = parseDuration(video.contentDetails?.duration || '');
      const isVertical = checkIfVertical(video);
      return duration <= SHORTS_MAX_DURATION && isVertical;
    });

    // 7. 최소 조회수 필터
    const popularShorts = shorts.filter(
      video => (video.statistics?.viewCount || 0) >= minViews
    );

    // 8. 채널 정보 추가
    const channelIds = [...new Set(popularShorts.map(v => v.snippet?.channelId).filter(Boolean))];
    const channels = await getChannelsDetailsBatch(channelIds);
    
    // 9. 지표 계산 및 데이터 결합
    const enrichedShorts = popularShorts.map(video => {
      const channel = channels.find(ch => ch.id === video.snippet?.channelId);
      const metrics = calculateMetrics(video, channel);
      
      return {
        ...video,
        channel,
        metrics,
        region: regionCode,
        fetchedAt: new Date().toISOString()
      };
    });

    // 10. 데이터베이스 저장
    await saveToDatabase(enrichedShorts);
    
    // 11. 조회수 기준 정렬
    return enrichedShorts.sort((a, b) => 
      (b.statistics?.viewCount || 0) - (a.statistics?.viewCount || 0)
    );

  } catch (error) {
    console.error('Failed to fetch popular shorts:', error);
    throw error;
  }
}

/**
 * 배치로 영상 상세 정보 가져오기
 */
async function getVideosDetailsBatch(videoIds: string[]): Promise<any[]> {
  const chunks = [];
  const chunkSize = 50; // YouTube API 제한
  
  for (let i = 0; i < videoIds.length; i += chunkSize) {
    chunks.push(videoIds.slice(i, i + chunkSize));
  }
  
  const results = await Promise.all(
    chunks.map(chunk => 
      youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: chunk
      })
    )
  );
  
  return results.flatMap(r => r.data.items || []);
}

/**
 * 세로 영상 여부 확인
 */
function checkIfVertical(video: any): boolean {
  // 제목이나 태그에 #shorts 포함
  const title = video.snippet?.title?.toLowerCase() || '';
  const tags = video.snippet?.tags || [];
  
  if (title.includes('#shorts') || tags.some((t: string) => t.toLowerCase().includes('shorts'))) {
    return true;
  }
  
  // 썸네일 비율로 판단 (9:16)
  const thumbnail = video.snippet?.thumbnails?.high;
  if (thumbnail && thumbnail.height && thumbnail.width) {
    const ratio = thumbnail.height / thumbnail.width;
    return ratio > 1.5; // 세로가 더 긴 경우
  }
  
  return false;
}

/**
 * ISO 8601 duration을 초로 변환
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const minutes = parseInt(match[1] || '0');
  const seconds = parseInt(match[2] || '0');
  return minutes * 60 + seconds;
}
```

### Step 2: 지표 계산 엔진 구현

```typescript
// src/lib/youtube/metrics.ts

export interface VideoMetrics {
  vph: number;          // Views Per Hour
  delta24h: number;     // 24시간 증가량
  engagementRate: number; // 참여율
  viralScore: number;   // 바이럴 점수
  normalizedViews: number; // 채널 대비 조회수
}

/**
 * 핵심 지표 계산
 */
export function calculateMetrics(video: any, channel?: any): VideoMetrics {
  const viewCount = parseInt(video.statistics?.viewCount || '0');
  const likeCount = parseInt(video.statistics?.likeCount || '0');
  const commentCount = parseInt(video.statistics?.commentCount || '0');
  const subscriberCount = parseInt(channel?.statistics?.subscriberCount || '1');
  
  // 게시 후 경과 시간
  const publishedAt = new Date(video.snippet?.publishedAt);
  const now = new Date();
  const hoursElapsed = Math.max(1, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
  
  // VPH (Views Per Hour) 계산
  const vph = Math.round(viewCount / hoursElapsed);
  
  // 참여율 (좋아요 + 댓글 / 조회수)
  const engagementRate = viewCount > 0 
    ? ((likeCount + commentCount) / viewCount) * 100 
    : 0;
  
  // 채널 정규화 (조회수 / 구독자수)
  const normalizedViews = subscriberCount > 0 
    ? viewCount / subscriberCount 
    : viewCount;
  
  // 바이럴 점수 (복합 지표)
  const viralScore = calculateViralScore({
    vph,
    engagementRate,
    normalizedViews,
    hoursElapsed
  });
  
  // Delta24h는 이전 스냅샷과 비교 필요 (추후 구현)
  const delta24h = 0; // TODO: Implement with historical data
  
  return {
    vph,
    delta24h,
    engagementRate: Math.round(engagementRate * 100) / 100,
    viralScore: Math.round(viralScore * 100) / 100,
    normalizedViews: Math.round(normalizedViews * 100) / 100
  };
}

/**
 * 바이럴 점수 계산 (0-100)
 */
function calculateViralScore(params: {
  vph: number;
  engagementRate: number;
  normalizedViews: number;
  hoursElapsed: number;
}): number {
  const { vph, engagementRate, normalizedViews, hoursElapsed } = params;
  
  // 가중치
  const weights = {
    vph: 0.4,           // 시간당 조회수 (40%)
    engagement: 0.3,    // 참여율 (30%)
    normalized: 0.2,    // 채널 대비 (20%)
    freshness: 0.1      // 신선도 (10%)
  };
  
  // 정규화 (0-100 스케일)
  const vphScore = Math.min(100, (vph / 10000) * 100);
  const engagementScore = Math.min(100, engagementRate * 10);
  const normalizedScore = Math.min(100, normalizedViews * 10);
  const freshnessScore = hoursElapsed <= 24 ? 100 : Math.max(0, 100 - (hoursElapsed - 24));
  
  // 가중 평균
  return (
    vphScore * weights.vph +
    engagementScore * weights.engagement +
    normalizedScore * weights.normalized +
    freshnessScore * weights.freshness
  );
}
```

### Step 3: 채널 모니터링 시스템 구현

```typescript
// src/lib/youtube/monitoring.ts
import { createClient } from '@supabase/supabase-js';
import { PubSubHubbub } from './pubsubhubbub';

export class ChannelMonitor {
  private supabase: any;
  private pubsub: PubSubHubbub;
  private intervals: Map<string, NodeJS.Timer> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    this.pubsub = new PubSubHubbub();
  }

  /**
   * 폴더의 모든 채널 모니터링 시작
   */
  async startMonitoringFolder(folderId: string): Promise<void> {
    // 1. 폴더의 채널 목록 가져오기
    const { data: channels } = await this.supabase
      .from('folder_channels')
      .select(`
        *,
        channels (*)
      `)
      .eq('folder_id', folderId)
      .eq('enabled', true);

    if (!channels) return;

    // 2. 각 채널에 대해 모니터링 설정
    for (const channelMapping of channels) {
      const channel = channelMapping.channels;
      
      // PubSubHubbub 구독 (실시간 알림)
      await this.subscribeToPubSubHubbub(channel.channel_id);
      
      // 정기 체크 설정
      this.startPeriodicCheck(channel.channel_id, folderId);
    }
  }

  /**
   * PubSubHubbub 구독
   */
  private async subscribeToPubSubHubbub(channelId: string): Promise<void> {
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/youtube/webhook`;
    const topicUrl = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
    
    await this.pubsub.subscribe(topicUrl, callbackUrl);
  }

  /**
   * 정기적인 채널 체크
   */
  private startPeriodicCheck(channelId: string, folderId: string): void {
    // 기존 인터벌 제거
    if (this.intervals.has(channelId)) {
      clearInterval(this.intervals.get(channelId)!);
    }

    // 60분마다 체크
    const interval = setInterval(async () => {
      await this.checkChannelForNewVideos(channelId, folderId);
    }, 60 * 60 * 1000);

    this.intervals.set(channelId, interval);
  }

  /**
   * 채널의 새 영상 체크 및 알림
   */
  private async checkChannelForNewVideos(
    channelId: string, 
    folderId: string
  ): Promise<void> {
    try {
      // 1. 최근 영상 가져오기
      const recentVideos = await this.getRecentVideos(channelId);
      
      // 2. 알림 규칙 확인
      const { data: rules } = await this.supabase
        .from('alert_rules')
        .select('*')
        .eq('folder_id', folderId)
        .eq('enabled', true);

      if (!rules) return;

      // 3. 각 영상에 대해 규칙 체크
      for (const video of recentVideos) {
        for (const rule of rules) {
          const triggered = await this.checkRule(video, rule);
          
          if (triggered) {
            await this.triggerAlert(video, rule);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to check channel ${channelId}:`, error);
    }
  }

  /**
   * 알림 규칙 체크
   */
  private async checkRule(video: any, rule: any): Promise<boolean> {
    const viewCount = parseInt(video.statistics?.viewCount || '0');
    const publishedAt = new Date(video.snippet?.publishedAt);
    const hoursElapsed = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);

    switch (rule.rule_type) {
      case 'view_threshold':
        // X시간 내에 N뷰 돌파
        return hoursElapsed <= (rule.within_hours || 24) && 
               viewCount >= rule.threshold_value;
               
      case 'vph_threshold':
        // VPH가 N 이상
        const vph = viewCount / Math.max(1, hoursElapsed);
        return vph >= rule.threshold_value;
        
      case 'engagement_threshold':
        // 참여율이 N% 이상
        const likes = parseInt(video.statistics?.likeCount || '0');
        const engagementRate = viewCount > 0 ? (likes / viewCount) * 100 : 0;
        return engagementRate >= rule.threshold_value;
        
      default:
        return false;
    }
  }

  /**
   * 알림 발송
   */
  private async triggerAlert(video: any, rule: any): Promise<void> {
    // 1. 알림 기록 저장
    const { data: alert } = await this.supabase
      .from('alerts')
      .insert({
        rule_id: rule.id,
        video_id: video.id,
        alert_type: rule.rule_type,
        message: this.generateAlertMessage(video, rule),
        trigger_value: video.statistics?.viewCount,
        video_data: video
      })
      .select()
      .single();

    if (!alert) return;

    // 2. 알림 발송
    if (rule.notify_email) {
      await this.sendEmailAlert(alert, rule);
    }
    
    if (rule.notify_push) {
      await this.sendPushNotification(alert, rule);
    }
    
    if (rule.notify_webhook && rule.webhook_url) {
      await this.sendWebhook(alert, rule);
    }

    // 3. 발송 상태 업데이트
    await this.supabase
      .from('alerts')
      .update({ sent: true, sent_at: new Date() })
      .eq('id', alert.id);
  }

  private generateAlertMessage(video: any, rule: any): string {
    const title = video.snippet?.title;
    const viewCount = video.statistics?.viewCount;
    const channel = video.snippet?.channelTitle;
    
    return `🔥 "${title}"이(가) ${viewCount}회를 돌파했습니다!\n` +
           `채널: ${channel}\n` +
           `규칙: ${rule.name}`;
  }
}
```

### Step 4: API 라우트 구현

```typescript
// src/app/api/youtube/popular/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPopularShortsWithoutKeyword } from '@/lib/youtube/popular-shorts';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 요청 파라미터
    const body = await request.json();
    const {
      regionCode = 'KR',
      period = '7d',
      limit = 50,
      excludeMusic = false,
      minViews = 0
    } = body;

    // API 사용량 체크
    const quotaCheck = await checkUserQuota(user.id);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: 'API quota exceeded' },
        { status: 429 }
      );
    }

    // 인기 Shorts 가져오기
    const shorts = await getPopularShortsWithoutKeyword({
      regionCode,
      period,
      limit,
      excludeMusic,
      minViews
    });

    // API 사용량 기록
    await recordApiUsage(user.id, 'popular_shorts', shorts.length);

    return NextResponse.json({
      success: true,
      data: shorts,
      meta: {
        region: regionCode,
        period,
        count: shorts.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Popular shorts API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkUserQuota(userId: string) {
  // TODO: Implement quota checking
  return { allowed: true, remaining: 1000 };
}

async function recordApiUsage(userId: string, operation: string, units: number) {
  // TODO: Implement usage recording
}
```

### Step 5: UI 컴포넌트 구현

```tsx
// src/components/features/youtube-lens/PopularShortsList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Clock, Heart, MessageCircle, Eye, Users } from 'lucide-react';
import { formatNumber, formatDuration } from '@/lib/utils';
import VideoCard from './VideoCard';

const REGIONS = [
  { code: 'KR', name: '한국', flag: '🇰🇷' },
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'GB', name: '영국', flag: '🇬🇧' },
  { code: 'DE', name: '독일', flag: '🇩🇪' },
  { code: 'FR', name: '프랑스', flag: '🇫🇷' },
  { code: 'BR', name: '브라질', flag: '🇧🇷' },
  { code: 'IN', name: '인도', flag: '🇮🇳' }
];

const PERIODS = [
  { value: '24h', label: '24시간' },
  { value: '3d', label: '3일' },
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' }
];

export default function PopularShortsList() {
  const [region, setRegion] = useState('KR');
  const [period, setPeriod] = useState('7d');
  const [excludeMusic, setExcludeMusic] = useState(false);
  const [sortBy, setSortBy] = useState<'views' | 'vph' | 'engagement'>('views');

  // 인기 Shorts 가져오기
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['popular-shorts', region, period, excludeMusic],
    queryFn: async () => {
      const response = await fetch('/api/youtube/popular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionCode: region,
          period,
          excludeMusic,
          limit: 50
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch popular shorts');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000 // 10분
  });

  // 정렬
  const sortedVideos = data?.data ? [...data.data].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'vph':
        return (b.metrics?.vph || 0) - (a.metrics?.vph || 0);
      case 'engagement':
        return (b.metrics?.engagementRate || 0) - (a.metrics?.engagementRate || 0);
      default:
        return (b.statistics?.viewCount || 0) - (a.statistics?.viewCount || 0);
    }
  }) : [];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            무키워드 인기 Shorts 탐색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* 지역 선택 */}
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(r => (
                  <SelectItem key={r.code} value={r.code}>
                    <span className="flex items-center gap-2">
                      <span>{r.flag}</span>
                      <span>{r.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 기간 선택 */}
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 음악 제외 */}
            <Button
              variant={excludeMusic ? "default" : "outline"}
              onClick={() => setExcludeMusic(!excludeMusic)}
            >
              음악 제외
            </Button>

            {/* 새로고침 */}
            <Button onClick={() => refetch()} variant="outline">
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 정렬 탭 */}
      <Tabs value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
        <TabsList>
          <TabsTrigger value="views">
            <Eye className="w-4 h-4 mr-1" />
            조회수
          </TabsTrigger>
          <TabsTrigger value="vph">
            <Clock className="w-4 h-4 mr-1" />
            VPH
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <Heart className="w-4 h-4 mr-1" />
            참여율
          </TabsTrigger>
        </TabsList>

        <TabsContent value={sortBy} className="mt-6">
          {/* 영상 그리드 */}
          {isLoading ? (
            <div className="text-center py-12">로딩 중...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              오류가 발생했습니다
            </div>
          ) : sortedVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedVideos.map((video: any) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  showMetrics
                  showChannel
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              영상을 찾을 수 없습니다
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## ✅ Phase 3 완료 체크리스트

### 무키워드 검색
- [ ] 빈 쿼리 우회 전략 구현
- [ ] 다중 검색 전략 적용
- [ ] Shorts 필터링 (70초, 세로)
- [ ] 지역/기간별 필터 작동

### 지표 계산
- [ ] VPH 계산 로직 구현
- [ ] 참여율 계산 구현
- [ ] 바이럴 점수 알고리즘
- [ ] 채널 정규화 지표

### 모니터링 시스템
- [ ] 채널 폴더 관리 UI
- [ ] 정기 체크 스케줄러
- [ ] PubSubHubbub 웹훅
- [ ] 알림 규칙 설정 UI

### 알림 시스템
- [ ] 임계치 체크 로직
- [ ] 이메일 알림 발송
- [ ] 푸시 알림 (선택)
- [ ] 웹훅 전송

## 🚨 트러블슈팅

### 빈 쿼리 검색 실패 시
```typescript
// 대체 전략
const fallbackStrategies = [
  { videoCategoryId: '24' }, // Entertainment
  { q: 'shorts', type: 'video' },
  { q: '#shorts #viral' },
  { relevanceLanguage: regionCode }
];
```

### API 쿼터 초과 시
```typescript
// 캐싱 전략
const cacheKey = `popular_${region}_${period}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```