# YouTube Lens Phase 2: YouTube API 통합 강화

## 📌 개요
YouTube Data API v3와 PubSubHubbub을 활용한 데이터 수집 파이프라인을 구축합니다. 실시간 알림과 주기적 데이터 수집을 병행하는 하이브리드 시스템을 구현합니다.

## 🎯 목표
- YouTube Data API v3 완벽 통합
- PubSubHubbub 실시간 알림 시스템 구축
- API 쿼터 관리 및 최적화
- 외부 트렌드 API 연동 (Wikipedia, GDELT 등)

## 📊 API 통합 전략

### 1. YouTube Data API v3

#### 핵심 엔드포인트 활용

```typescript
// 1. 무키워드 인기 영상 검색
const searchPopularShorts = async (params: SearchParams) => {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  
  const searchParams = {
    part: 'snippet',
    type: 'video',
    videoDuration: 'short', // 4분 미만
    order: 'viewCount',
    regionCode: params.regionCode || 'KR',
    publishedAfter: params.publishedAfter, // ISO 8601
    maxResults: 50,
    key: process.env.YOUTUBE_API_KEY
  };
  
  // 쿼터 비용: 100 units
  return await fetch(url + new URLSearchParams(searchParams));
};

// 2. 영상 상세 정보 배치 조회
const getVideosDetails = async (videoIds: string[]) => {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  
  const params = {
    part: 'snippet,statistics,contentDetails,status',
    id: videoIds.join(','), // 최대 50개
    key: process.env.YOUTUBE_API_KEY
  };
  
  // 쿼터 비용: 1 unit (50개까지 동일)
  return await fetch(url + new URLSearchParams(params));
};

// 3. 채널 정보 배치 조회
const getChannelsDetails = async (channelIds: string[]) => {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  
  const params = {
    part: 'snippet,statistics,contentDetails',
    id: channelIds.join(','),
    key: process.env.YOUTUBE_API_KEY
  };
  
  // 쿼터 비용: 1 unit
  return await fetch(url + new URLSearchParams(params));
};

// 4. 댓글 조회 (선택적)
const getVideoComments = async (videoId: string, limit = 3) => {
  const url = new URL('https://www.googleapis.com/youtube/v3/commentThreads');
  
  const params = {
    part: 'snippet,replies',
    videoId: videoId,
    order: 'relevance',
    maxResults: limit,
    key: process.env.YOUTUBE_API_KEY
  };
  
  // 쿼터 비용: 1 unit
  return await fetch(url + new URLSearchParams(params));
};
```

#### Shorts 필터링 로직

```typescript
interface VideoDetails {
  id: string;
  duration: string; // ISO 8601 (e.g., "PT1M10S")
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

// ISO 8601 duration 파싱
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Shorts 판별 (기본 70초)
const SHORTS_MAX_DURATION = 70;

function isShorts(video: VideoDetails): boolean {
  const durationSeconds = parseDuration(video.duration);
  return durationSeconds > 0 && durationSeconds <= SHORTS_MAX_DURATION;
}
```

### 2. PubSubHubbub 실시간 알림

#### 구독 설정

```typescript
// Webhook 엔드포인트: /api/webhook/youtube
interface PubSubParams {
  'hub.mode': 'subscribe' | 'unsubscribe';
  'hub.topic': string;
  'hub.callback': string;
  'hub.lease_seconds'?: number;
  'hub.secret'?: string;
}

async function subscribeToChannel(channelId: string) {
  const params: PubSubParams = {
    'hub.mode': 'subscribe',
    'hub.topic': `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    'hub.callback': `${process.env.NEXT_PUBLIC_URL}/api/webhook/youtube`,
    'hub.lease_seconds': 432000, // 5일
    'hub.secret': process.env.PUBSUB_SECRET
  };
  
  const response = await fetch('https://pubsubhubbub.appspot.com/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params as any)
  });
  
  // DB에 구독 정보 저장
  await supabase.from('pubsub_subscriptions').upsert({
    channel_id: channelId,
    topic_url: params['hub.topic'],
    callback_url: params['hub.callback'],
    lease_seconds: params['hub.lease_seconds'],
    expires_at: new Date(Date.now() + params['hub.lease_seconds']! * 1000)
  });
}
```

#### Webhook 핸들러

```typescript
// /api/webhook/youtube/route.ts
export async function GET(request: Request) {
  // Hub 검증 (초기 핸드셰이크)
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const topic = url.searchParams.get('hub.topic');
  const challenge = url.searchParams.get('hub.challenge');
  
  if (mode === 'subscribe' || mode === 'unsubscribe') {
    // 검증 후 challenge 반환
    return new Response(challenge, { status: 200 });
  }
  
  return new Response('Invalid request', { status: 400 });
}

export async function POST(request: Request) {
  // 새 영상 알림 처리
  const body = await request.text();
  const xml = parseXML(body); // XML 파싱 라이브러리 사용
  
  const entry = xml.querySelector('entry');
  if (!entry) return new Response('No entry', { status: 400 });
  
  const videoId = entry.querySelector('yt\\:videoId')?.textContent;
  const channelId = entry.querySelector('yt\\:channelId')?.textContent;
  const published = entry.querySelector('published')?.textContent;
  
  // 영상 상세 정보 조회
  const videoDetails = await getVideosDetails([videoId]);
  
  // 알림 규칙 평가
  await evaluateAlertRules(videoId, channelId, videoDetails);
  
  return new Response('OK', { status: 200 });
}
```

### 3. 외부 트렌드 API 통합

#### Wikipedia Pageviews API

```typescript
interface WikiPageview {
  article: string;
  views: number;
  rank: number;
}

async function getWikipediaTrends(lang = 'ko', date?: string) {
  const targetDate = date || new Date().toISOString().split('T')[0].replace(/-/g, '/');
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${lang}.wikipedia/all-access/${targetDate}`;
  
  const response = await fetch(url, {
    headers: { 'User-Agent': 'YouTubeLens/1.0' }
  });
  
  const data = await response.json();
  return data.items[0].articles as WikiPageview[];
}

// 특정 키워드의 위키 조회수 추이
async function getKeywordTrend(keyword: string, days = 7) {
  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/ko.wikipedia/all-access/all-agents/${encodeURIComponent(keyword)}/daily/${formatDate(startDate)}/${formatDate(endDate)}`;
  
  const response = await fetch(url);
  return await response.json();
}
```

#### Google Knowledge Graph API

```typescript
interface KnowledgeEntity {
  name: string;
  description: string;
  types: string[];
  score: number;
  url?: string;
}

async function getEntityInfo(query: string): Promise<KnowledgeEntity[]> {
  const url = new URL('https://kgsearch.googleapis.com/v1/entities:search');
  
  const params = {
    query: query,
    key: process.env.GOOGLE_KG_API_KEY,
    limit: '5',
    languages: 'ko,en'
  };
  
  url.search = new URLSearchParams(params).toString();
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.itemListElement.map((item: any) => ({
    name: item.result.name,
    description: item.result.description,
    types: item.result['@type'] || [],
    score: item.resultScore,
    url: item.result.url
  }));
}
```

## 📈 API 쿼터 관리

### 쿼터 추적 시스템

```typescript
class QuotaManager {
  private readonly DAILY_LIMIT = 10000;
  private readonly COSTS = {
    search: 100,
    videos: 1,
    channels: 1,
    comments: 1,
    playlistItems: 1
  };
  
  async canMakeRequest(type: keyof typeof this.COSTS): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('api_usage')
      .select('units_consumed')
      .eq('user_id', userId)
      .gte('created_at', today)
      .single();
    
    const used = data?.units_consumed || 0;
    const cost = this.COSTS[type];
    
    return (used + cost) <= this.DAILY_LIMIT;
  }
  
  async recordUsage(type: keyof typeof this.COSTS, params: any) {
    await supabase.from('api_usage').insert({
      user_id: userId,
      endpoint: type,
      units_consumed: this.COSTS[type],
      request_params: params
    });
  }
}
```

### 쿼터 최적화 전략

```typescript
// 1. 배치 처리 - 50개씩 묶어서 처리
async function batchGetVideos(videoIds: string[]) {
  const batches = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    batches.push(videoIds.slice(i, i + 50));
  }
  
  const results = await Promise.all(
    batches.map(batch => getVideosDetails(batch))
  );
  
  return results.flat();
}

// 2. 캐싱 - 자주 조회되는 데이터 캐싱
class DataCache {
  private cache = new Map<string, { data: any; expires: number }>();
  
  set(key: string, data: any, ttl = 3600000) { // 1시간
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }
  
  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
}

// 3. 우선순위 큐 - 중요한 요청 우선 처리
class RequestQueue {
  private queues = {
    high: [] as any[],
    medium: [] as any[],
    low: [] as any[]
  };
  
  enqueue(request: any, priority: 'high' | 'medium' | 'low') {
    this.queues[priority].push(request);
  }
  
  async process() {
    const request = 
      this.queues.high.shift() ||
      this.queues.medium.shift() ||
      this.queues.low.shift();
    
    if (request) {
      await this.execute(request);
    }
  }
}
```

## 🔄 데이터 수집 워크플로우

### 1. 실시간 + 폴링 하이브리드

```typescript
// Cron Job - 매시간 실행
async function hourlyDataCollection() {
  // 1. 인기 Shorts 수집
  const regions = ['KR', 'US', 'JP', 'IN', 'BR'];
  
  for (const region of regions) {
    const videos = await searchPopularShorts({
      regionCode: region,
      publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    await saveVideosToDatabase(videos);
  }
  
  // 2. 통계 스냅샷 업데이트
  const trackedVideos = await getTrackedVideos();
  const stats = await batchGetVideos(trackedVideos.map(v => v.video_id));
  
  await saveVideoStats(stats);
  
  // 3. VPH 계산 및 저장
  await calculateAndSaveVPH(stats);
}

// PubSub 재구독 - 4시간마다
async function renewSubscriptions() {
  const expiring = await supabase
    .from('pubsub_subscriptions')
    .select('*')
    .lt('expires_at', new Date(Date.now() + 24 * 60 * 60 * 1000));
  
  for (const sub of expiring.data || []) {
    await subscribeToChannel(sub.channel_id);
  }
}
```

## ✅ 구현 체크리스트

- [ ] YouTube API 클라이언트 구현
- [ ] PubSubHubbub webhook 엔드포인트
- [ ] 쿼터 관리 시스템
- [ ] 데이터 캐싱 레이어
- [ ] 외부 API 통합 (Wikipedia, KG)
- [ ] Cron 작업 설정
- [ ] 에러 처리 및 재시도 로직
- [ ] API 응답 타입 정의

## 📝 다음 단계
Phase 3: 핵심 기능 구현으로 진행