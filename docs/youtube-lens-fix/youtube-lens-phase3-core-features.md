# YouTube Lens Phase 3: 핵심 기능 구현

## 📌 개요
YouTube Shorts 분석 플랫폼의 핵심 기능인 무키워드 인기 영상 탐색, 채널 모니터링, 기본 지표 계산을 구현합니다.

## 🎯 목표
- 무키워드 인기 Shorts 탐색 기능
- 소스 채널 폴더링 & 임계치 알림
- 기본 지표 계산 (VPH, Δ24h, 참여율)
- 즐겨찾기 및 보드 시스템

## 🔍 Feature A: 무키워드 인기 Shorts 탐색

### 구현 전략

```typescript
// lib/youtube/search.ts
interface PopularShortsParams {
  regionCode?: string;
  period?: '24h' | '3d' | '7d' | '30d';
  limit?: number;
  excludeMusic?: boolean;
}

export async function getPopularShorts(params: PopularShortsParams) {
  const { regionCode = 'KR', period = '7d', limit = 50 } = params;
  
  // 기간 계산
  const publishedAfter = calculatePeriodDate(period);
  
  // 1단계: Search API로 후보 영상 가져오기
  const searchResults = await searchVideos({
    regionCode,
    publishedAfter,
    videoDuration: 'short',
    order: 'viewCount',
    maxResults: limit,
    // 빈 쿼리 우회 전략
    q: ' ', // 공백 한 칸 또는
    videoCategoryId: params.excludeMusic ? '22' : undefined // People & Blogs
  });
  
  // 2단계: 영상 상세 정보 가져오기
  const videoIds = searchResults.items.map(item => item.id.videoId);
  const videoDetails = await getVideosDetails(videoIds);
  
  // 3단계: Shorts 필터링 (70초 이하)
  const shorts = videoDetails.items.filter(video => {
    const duration = parseDuration(video.contentDetails.duration);
    return duration <= SHORTS_MAX_DURATION;
  });
  
  // 4단계: 채널 정보 추가
  const channelIds = [...new Set(shorts.map(v => v.snippet.channelId))];
  const channels = await getChannelsDetails(channelIds);
  
  // 5단계: 데이터 결합 및 정렬
  const enrichedShorts = shorts.map(video => ({
    ...video,
    channel: channels.find(ch => ch.id === video.snippet.channelId),
    metrics: calculateBasicMetrics(video)
  }));
  
  // 6단계: DB 저장
  await saveToDatabase(enrichedShorts);
  
  return enrichedShorts;
}

// 기간별 날짜 계산
function calculatePeriodDate(period: string): string {
  const now = new Date();
  const periodMap = {
    '24h': 1,
    '3d': 3,
    '7d': 7,
    '30d': 30
  };
  
  const days = periodMap[period] || 7;
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date.toISOString();
}
```

### UI 컴포넌트

```tsx
// components/features/youtube-lens/PopularShortsList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const REGIONS = [
  { code: 'KR', name: '한국', flag: '🇰🇷' },
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'IN', name: '인도', flag: '🇮🇳' },
  { code: 'BR', name: '브라질', flag: '🇧🇷' },
];

const PERIODS = [
  { value: '24h', label: '24시간' },
  { value: '3d', label: '3일' },
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
];

export function PopularShortsList() {
  const [region, setRegion] = useState('KR');
  const [period, setPeriod] = useState('7d');
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchShorts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/youtube/popular-shorts?region=${region}&period=${period}`);
      const data = await response.json();
      setShorts(data);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchShorts();
  }, [region, period]);
  
  return (
    <div className="space-y-4">
      {/* 필터 바 */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          {REGIONS.map(r => (
            <Button
              key={r.code}
              variant={region === r.code ? 'default' : 'outline'}
              onClick={() => setRegion(r.code)}
            >
              {r.flag} {r.name}
            </Button>
          ))}
        </div>
        
        <Select value={period} onValueChange={setPeriod}>
          {PERIODS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
      </div>
      
      {/* 영상 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {shorts.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
```

## 📂 Feature B: 소스 채널 폴더링 & 알림

### 폴더 관리 시스템

```typescript
// lib/folders/manager.ts
export class FolderManager {
  // 폴더 생성
  async createFolder(name: string, description?: string) {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        description,
        user_id: getCurrentUserId(),
        color: generateRandomColor()
      })
      .select()
      .single();
    
    return data;
  }
  
  // 채널 추가
  async addChannelToFolder(folderId: string, channelId: string) {
    // 1. 채널 정보가 없으면 YouTube API로 가져오기
    let channel = await this.getChannelFromDB(channelId);
    if (!channel) {
      const ytChannel = await getChannelInfo(channelId);
      channel = await this.saveChannel(ytChannel);
    }
    
    // 2. PubSubHubbub 구독
    await subscribeToChannel(channelId);
    
    // 3. 폴더에 채널 연결
    await supabase
      .from('folder_channels')
      .insert({
        folder_id: folderId,
        channel_id: channelId
      });
  }
  
  // 알림 규칙 설정
  async setAlertRule(folderId: string, rule: AlertRule) {
    const { data } = await supabase
      .from('alert_rules')
      .insert({
        folder_id: folderId,
        name: rule.name,
        min_views: rule.minViews || 100000,
        max_age_hours: rule.maxAgeHours || 72,
        max_duration_seconds: rule.maxDurationSeconds || 70,
        is_active: true
      })
      .select()
      .single();
    
    return data;
  }
}
```

### 알림 평가 시스템

```typescript
// lib/alerts/evaluator.ts
export class AlertEvaluator {
  async evaluateVideo(video: VideoData, channelId: string) {
    // 해당 채널이 속한 폴더의 알림 규칙 조회
    const rules = await this.getActiveRules(channelId);
    
    for (const rule of rules) {
      const triggered = this.checkRule(video, rule);
      
      if (triggered) {
        await this.createAlert(video, rule);
        await this.sendNotification(video, rule);
      }
    }
  }
  
  private checkRule(video: VideoData, rule: AlertRule): boolean {
    const now = Date.now();
    const publishedAt = new Date(video.snippet.publishedAt).getTime();
    const ageHours = (now - publishedAt) / (1000 * 60 * 60);
    
    // 조건 체크
    const viewsOk = parseInt(video.statistics.viewCount) >= rule.min_views;
    const ageOk = ageHours <= rule.max_age_hours;
    const durationOk = parseDuration(video.contentDetails.duration) <= rule.max_duration_seconds;
    
    return viewsOk && ageOk && durationOk;
  }
  
  private async sendNotification(video: VideoData, rule: AlertRule) {
    // 실시간 알림 (Supabase Realtime)
    await supabase
      .from('realtime_notifications')
      .insert({
        user_id: rule.user_id,
        type: 'video_alert',
        title: `🔥 ${video.snippet.title}`,
        message: `조회수 ${formatNumber(video.statistics.viewCount)}회 돌파!`,
        video_id: video.id,
        rule_id: rule.id
      });
    
    // 이메일 알림 (선택적)
    if (rule.email_enabled) {
      await sendEmail({
        to: rule.user_email,
        subject: '핫한 Shorts 발견!',
        template: 'video-alert',
        data: { video, rule }
      });
    }
  }
}
```

## 📊 Feature C: 숏폼 특화 지표 계산

### VPH (Views Per Hour) 계산

```typescript
// lib/metrics/calculator.ts
export class MetricsCalculator {
  // VPH 계산
  calculateVPH(viewCount: number, publishedAt: Date): number {
    const now = Date.now();
    const published = publishedAt.getTime();
    const hoursElapsed = Math.max(1, (now - published) / (1000 * 60 * 60));
    
    return Math.round(viewCount / hoursElapsed);
  }
  
  // 24시간 변화량
  async calculateDelta24h(videoId: string, currentViews: number): Promise<number> {
    // 24시간 전 스냅샷 조회
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data } = await supabase
      .from('video_stats')
      .select('view_count')
      .eq('video_id', videoId)
      .gte('captured_at', yesterday.toISOString())
      .order('captured_at', { ascending: true })
      .limit(1);
    
    if (data && data.length > 0) {
      return currentViews - data[0].view_count;
    }
    
    // 24시간 전 데이터가 없으면 전체 조회수 반환
    return currentViews;
  }
  
  // 참여율 계산
  calculateEngagement(likeCount: number, viewCount: number): number {
    if (viewCount === 0) return 0;
    return (likeCount / viewCount) * 100;
  }
  
  // 채널 정규화 점수
  calculateNormalizedScore(viewCount: number, subscriberCount: number): number {
    if (!subscriberCount || subscriberCount === 0) {
      // 구독자 수 숨김 또는 0인 경우
      return viewCount / 100000; // 기본값으로 10만 가정
    }
    return viewCount / subscriberCount;
  }
  
  // z-MAD 이상치 점수
  calculateOutlierScore(vph: number, allVPHs: number[]): number {
    if (allVPHs.length < 3) return 0;
    
    // 중앙값 계산
    const sorted = [...allVPHs].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // MAD (Median Absolute Deviation) 계산
    const deviations = allVPHs.map(v => Math.abs(v - median));
    const sortedDeviations = deviations.sort((a, b) => a - b);
    const mad = sortedDeviations[Math.floor(sortedDeviations.length / 2)];
    
    // z-MAD 점수
    if (mad === 0) return 0;
    return (vph - median) / (1.4826 * mad);
  }
  
  // 종합 점수 계산
  calculateCompositeScore(metrics: VideoMetrics): number {
    const weights = {
      views: 0.3,
      vph: 0.25,
      engagement: 0.2,
      normalized: 0.15,
      outlier: 0.1
    };
    
    // 각 지표를 0-100 범위로 정규화
    const normalizedMetrics = {
      views: Math.min(100, metrics.viewCount / 10000000 * 100),
      vph: Math.min(100, metrics.vph / 100000 * 100),
      engagement: Math.min(100, metrics.engagementRate * 10),
      normalized: Math.min(100, metrics.normalizedScore * 10),
      outlier: Math.min(100, Math.abs(metrics.outlierScore) * 20)
    };
    
    // 가중 평균 계산
    return Object.keys(weights).reduce((score, key) => {
      return score + normalizedMetrics[key] * weights[key];
    }, 0);
  }
}
```

### 스냅샷 수집 워커

```typescript
// lib/workers/snapshot.ts
export class SnapshotWorker {
  private interval: NodeJS.Timeout;
  
  start() {
    // 매 60분마다 실행
    this.interval = setInterval(() => {
      this.collectSnapshots();
    }, 60 * 60 * 1000);
  }
  
  async collectSnapshots() {
    // 모니터링 대상 영상 조회
    const videos = await this.getMonitoredVideos();
    
    // 배치로 통계 조회
    const batches = this.createBatches(videos, 50);
    
    for (const batch of batches) {
      const stats = await getVideosStatistics(batch.map(v => v.video_id));
      
      // 스냅샷 저장
      const snapshots = stats.map(stat => ({
        video_id: stat.id,
        view_count: parseInt(stat.statistics.viewCount),
        like_count: parseInt(stat.statistics.likeCount),
        comment_count: parseInt(stat.statistics.commentCount),
        vph: this.calculateVPH(stat),
        captured_at: new Date()
      }));
      
      await supabase
        .from('video_stats')
        .insert(snapshots);
    }
  }
  
  private async getMonitoredVideos() {
    // 최근 7일 내 인기 영상 + 알림 대상 영상
    const recentPopular = await supabase
      .from('videos')
      .select('video_id')
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('view_count', { ascending: false })
      .limit(100);
    
    const alertCandidates = await supabase
      .from('folder_channels')
      .select('channel_id')
      .limit(50);
    
    // 중복 제거 후 반환
    return [...new Set([...recentPopular, ...alertCandidates])];
  }
}
```

## 💾 Feature D: 즐겨찾기 및 보드 시스템

```typescript
// lib/boards/manager.ts
export class BoardManager {
  // 보드 생성
  async createBoard(name: string, description?: string, isPublic = false) {
    const { data } = await supabase
      .from('boards')
      .insert({
        name,
        description,
        is_public: isPublic,
        user_id: getCurrentUserId()
      })
      .select()
      .single();
    
    return data;
  }
  
  // 영상 추가
  async addVideoToBoard(boardId: string, videoId: string, notes?: string) {
    // 최대 position 조회
    const { data: maxPos } = await supabase
      .from('board_items')
      .select('position')
      .eq('board_id', boardId)
      .order('position', { ascending: false })
      .limit(1);
    
    const position = (maxPos?.[0]?.position || 0) + 1;
    
    await supabase
      .from('board_items')
      .insert({
        board_id: boardId,
        video_id: videoId,
        notes,
        position
      });
  }
  
  // CSV 내보내기
  async exportToCSV(boardId: string): Promise<string> {
    const { data } = await supabase
      .from('board_items')
      .select(`
        position,
        video_id,
        notes,
        videos (
          title,
          channel_id,
          published_at,
          view_count,
          like_count
        )
      `)
      .eq('board_id', boardId)
      .order('position');
    
    // CSV 생성
    const headers = ['순위', '제목', '채널', '조회수', '좋아요', '게시일', '메모'];
    const rows = data.map(item => [
      item.position,
      item.videos.title,
      item.videos.channel_id,
      item.videos.view_count,
      item.videos.like_count,
      item.videos.published_at,
      item.notes || ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
  
  // Google Sheets 내보내기
  async exportToSheets(boardId: string, sheetTitle: string) {
    // OAuth 토큰 확인
    const token = await getGoogleOAuthToken();
    
    // 새 시트 생성
    const sheet = await createGoogleSheet(token, sheetTitle);
    
    // 데이터 조회
    const data = await this.getBoardData(boardId);
    
    // 시트에 데이터 추가
    await appendToSheet(sheet.spreadsheetId, data);
    
    return sheet.spreadsheetUrl;
  }
}
```

## ✅ 구현 체크리스트

- [ ] 무키워드 인기 Shorts 탐색 API
- [ ] 폴더/채널 관리 시스템
- [ ] PubSubHubbub 알림 처리
- [ ] 지표 계산 로직 (VPH, Δ24h, 참여율)
- [ ] 스냅샷 수집 워커
- [ ] 즐겨찾기/보드 CRUD
- [ ] CSV/Sheets 내보내기
- [ ] UI 컴포넌트 구현

## 📝 다음 단계
Phase 4: 고급 분석 기능으로 진행