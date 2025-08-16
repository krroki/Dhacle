# YouTube Lens Phase 4: 고급 분석 기능

## 📌 개요
트렌드 분석, 랭킹 시스템, 이상치 탐지 등 고급 분석 기능을 구현합니다. 외부 데이터 소스를 활용한 종합적인 인사이트 제공이 목표입니다.

## 🎯 목표
- 주제/키워드 엔티티 레이더 구축
- 종합 랭킹 시스템 구현
- 이상치(Outlier) 탐지 알고리즘
- 트렌드 예측 및 분석

## 🎨 Feature A: 주제/키워드 엔티티 레이더

### 키워드 추출 시스템

```typescript
// lib/analysis/keyword-extractor.ts
import { OpenKoreanTextProcessor } from '@/lib/nlp/korean';

export class KeywordExtractor {
  private koreanProcessor: OpenKoreanTextProcessor;
  
  constructor() {
    this.koreanProcessor = new OpenKoreanTextProcessor();
  }
  
  // 영상 메타데이터에서 키워드 추출
  async extractFromVideos(videos: VideoData[]): Promise<KeywordFrequency[]> {
    const allText = videos.map(v => 
      `${v.title} ${v.description} ${v.tags?.join(' ') || ''}`
    ).join(' ');
    
    // 언어별 처리
    const koreanKeywords = await this.extractKorean(allText);
    const englishKeywords = this.extractEnglish(allText);
    
    // 빈도 계산
    const frequency = this.calculateFrequency([
      ...koreanKeywords,
      ...englishKeywords
    ]);
    
    // 불용어 제거 및 정렬
    return this.filterAndSort(frequency);
  }
  
  private async extractKorean(text: string): Promise<string[]> {
    // 한국어 형태소 분석
    const tokens = await this.koreanProcessor.tokenize(text);
    
    // 명사만 추출
    return tokens
      .filter(token => token.pos === 'Noun')
      .map(token => token.text)
      .filter(word => word.length > 1); // 1글자 제외
  }
  
  private extractEnglish(text: string): string[] {
    // 영어 단어 추출 (간단한 정규식)
    const words = text.match(/[a-zA-Z]{3,}/g) || [];
    
    // 소문자 변환 및 중복 제거
    return [...new Set(words.map(w => w.toLowerCase()))];
  }
  
  private calculateFrequency(words: string[]): Map<string, number> {
    const frequency = new Map<string, number>();
    
    for (const word of words) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }
    
    return frequency;
  }
  
  private filterAndSort(frequency: Map<string, number>): KeywordFrequency[] {
    const stopWords = new Set([
      'shorts', '영상', '동영상', 'video', '채널', 'channel',
      '구독', 'subscribe', '좋아요', 'like'
    ]);
    
    return Array.from(frequency.entries())
      .filter(([word]) => !stopWords.has(word.toLowerCase()))
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // 상위 20개
  }
}
```

### 엔티티 식별 및 트렌드 매핑

```typescript
// lib/analysis/entity-radar.ts
export class EntityRadar {
  // 키워드를 엔티티로 매핑
  async mapToEntities(keywords: string[]): Promise<Entity[]> {
    const entities: Entity[] = [];
    
    for (const keyword of keywords) {
      // 1. Google Knowledge Graph로 엔티티 확인
      const kgEntity = await this.searchKnowledgeGraph(keyword);
      
      if (kgEntity) {
        entities.push({
          name: kgEntity.name,
          type: kgEntity.types[0],
          description: kgEntity.description,
          score: kgEntity.score,
          keyword: keyword
        });
        continue;
      }
      
      // 2. Wikidata SPARQL로 대체 검색
      const wikiEntity = await this.searchWikidata(keyword);
      
      if (wikiEntity) {
        entities.push({
          name: wikiEntity.label,
          type: wikiEntity.type,
          description: wikiEntity.description,
          score: 0.5, // 기본 점수
          keyword: keyword
        });
      }
    }
    
    return entities;
  }
  
  // 엔티티별 트렌드 신호 수집
  async collectTrendSignals(entities: Entity[]): Promise<TrendSignal[]> {
    const signals: TrendSignal[] = [];
    
    for (const entity of entities) {
      // Wikipedia 페이지뷰 추이
      const wikiTrend = await this.getWikipediaTrend(entity.name);
      
      // GDELT 뉴스 언급량
      const newsTrend = await this.getNewsTrend(entity.name);
      
      // Reddit 언급 (선택적)
      const redditTrend = await this.getRedditTrend(entity.name);
      
      signals.push({
        entity: entity,
        wikipedia: wikiTrend,
        news: newsTrend,
        reddit: redditTrend,
        composite: this.calculateCompositeScore(wikiTrend, newsTrend, redditTrend)
      });
    }
    
    return signals.sort((a, b) => b.composite - a.composite);
  }
  
  private async getWikipediaTrend(keyword: string): Promise<TrendData> {
    const endDate = new Date();
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    try {
      const data = await fetchWikipediaPageviews(keyword, startDate, endDate);
      
      // 7일 전 대비 증가율 계산
      const recent = data.slice(-3).reduce((sum, d) => sum + d.views, 0) / 3;
      const past = data.slice(0, 3).reduce((sum, d) => sum + d.views, 0) / 3;
      const changeRate = ((recent - past) / past) * 100;
      
      return {
        value: recent,
        change: changeRate,
        sparkline: data.map(d => d.views)
      };
    } catch {
      return { value: 0, change: 0, sparkline: [] };
    }
  }
  
  private calculateCompositeScore(wiki: TrendData, news: TrendData, reddit: TrendData): number {
    // 가중 평균 (Wikipedia 40%, News 40%, Reddit 20%)
    const weights = { wiki: 0.4, news: 0.4, reddit: 0.2 };
    
    const scores = {
      wiki: Math.min(100, Math.max(0, wiki.change + 50)),
      news: Math.min(100, Math.max(0, news.change + 50)),
      reddit: Math.min(100, Math.max(0, reddit.change + 50))
    };
    
    return scores.wiki * weights.wiki + 
           scores.news * weights.news + 
           scores.reddit * weights.reddit;
  }
}
```

## 🌐 외부 API 통합 상세

### 무료 API 목록 및 활용 전략

#### Wikipedia Pageviews API
- **엔드포인트**: `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/{project}/{access}/{agent}/{article}/{granularity}/{start}/{end}`
- **용도**: 엔티티/인물의 관심도 추이 파악
- **제한**: 1000 req/hour
- **구현 예시**:

```typescript
// lib/external/wikipedia.ts
export async function getWikipediaPageviews(
  article: string,
  startDate: Date,
  endDate: Date
): Promise<PageviewData[]> {
  const project = 'en.wikipedia'; // 또는 ko.wikipedia
  const access = 'all-access';
  const agent = 'user';
  const granularity = 'daily';
  
  const start = formatDate(startDate, 'YYYYMMDD');
  const end = formatDate(endDate, 'YYYYMMDD');
  
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${project}/${access}/${agent}/${encodeURIComponent(article)}/${granularity}/${start}/${end}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.items.map((item: any) => ({
    date: item.timestamp,
    views: item.views
  }));
}
```

#### GDELT Event Database API
- **엔드포인트**: `https://api.gdeltproject.org/api/v2/doc/doc`
- **용도**: 뉴스 트렌드 및 이벤트 모니터링
- **제한**: 무료, 무제한 (단, 과도한 사용 자제)
- **구현 예시**:

```typescript
// lib/external/gdelt.ts
export async function getGDELTNews(
  query: string,
  mode: 'artlist' | 'timelinevol' = 'artlist'
): Promise<GDELTResult> {
  const params = new URLSearchParams({
    query: query,
    mode: mode,
    maxrecords: '50',
    format: 'json',
    sort: 'dateadded',
    timespan: '7d'
  });
  
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
  const response = await fetch(url);
  
  return response.json();
}
```

#### Wikidata SPARQL API
- **엔드포인트**: `https://query.wikidata.org/sparql`
- **용도**: 엔티티 정보 및 관계 추출
- **제한**: 합리적 사용 (초당 5회 이하 권장)
- **구현 예시**:

```typescript
// lib/external/wikidata.ts
export async function searchWikidata(keyword: string): Promise<WikidataEntity[]> {
  const query = `
    SELECT ?item ?itemLabel ?itemDescription WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:endpoint "www.wikidata.org";
                        wikibase:api "EntitySearch";
                        mwapi:search "${keyword}";
                        mwapi:language "ko,en".
        ?item wikibase:apiOutputItem mwapi:item.
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "ko,en". }
    }
    LIMIT 5
  `;
  
  const url = 'https://query.wikidata.org/sparql';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `query=${encodeURIComponent(query)}`
  });
  
  const data = await response.json();
  return data.results.bindings.map((binding: any) => ({
    id: binding.item.value.split('/').pop(),
    label: binding.itemLabel.value,
    description: binding.itemDescription?.value || ''
  }));
}
```

#### Reddit API (선택적)
- **엔드포인트**: `https://www.reddit.com/r/{subreddit}/search.json`
- **용도**: 커뮤니티 반응 및 버즈 측정
- **제한**: 60 req/min (OAuth 없이)
- **구현 예시**:

```typescript
// lib/external/reddit.ts
export async function searchReddit(
  query: string,
  subreddit: string = 'all',
  sort: 'relevance' | 'hot' | 'new' = 'hot'
): Promise<RedditPost[]> {
  const params = new URLSearchParams({
    q: query,
    sort: sort,
    t: 'week',
    limit: '25'
  });
  
  const url = `https://www.reddit.com/r/${subreddit}/search.json?${params}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'YouTube-Lens/1.0'
    }
  });
  
  const data = await response.json();
  return data.data.children.map((child: any) => ({
    title: child.data.title,
    score: child.data.score,
    numComments: child.data.num_comments,
    created: new Date(child.data.created_utc * 1000),
    url: `https://reddit.com${child.data.permalink}`
  }));
}
```

#### Google Knowledge Graph API (선택적)
- **엔드포인트**: `https://kgsearch.googleapis.com/v1/entities:search`
- **용도**: 엔티티 식별 및 분류
- **제한**: 100,000 req/day (무료)
- **API Key 필요**: Google Cloud Console에서 발급
- **구현 예시**:

```typescript
// lib/external/knowledge-graph.ts
export async function searchKnowledgeGraph(
  query: string,
  types?: string[],
  languages: string[] = ['ko', 'en']
): Promise<KGEntity[]> {
  const params = new URLSearchParams({
    query: query,
    key: process.env.GOOGLE_KG_API_KEY!,
    limit: '10',
    languages: languages.join(',')
  });
  
  if (types?.length) {
    params.append('types', types.join(','));
  }
  
  const url = `https://kgsearch.googleapis.com/v1/entities:search?${params}`;
  const response = await fetch(url);
  const data = await response.json();
  
  return data.itemListElement?.map((item: any) => ({
    name: item.result.name,
    types: item.result['@type'] || [],
    description: item.result.description,
    score: item.resultScore,
    url: item.result.url
  })) || [];
}
```

### API 통합 전략

#### 우선순위 및 폴백 체인
1. **Primary**: YouTube Data API (핵심 데이터)
2. **Secondary**: Wikipedia Pageviews (트렌드 보강)
3. **Tertiary**: GDELT (뉴스 신호)
4. **Optional**: Reddit, Wikidata, Knowledge Graph

#### 캐싱 전략
```typescript
// lib/external/cache-manager.ts
export class ExternalAPICache {
  private cache = new Map<string, CacheEntry>();
  private ttl = {
    wikipedia: 3600000,    // 1시간
    gdelt: 1800000,        // 30분
    wikidata: 86400000,    // 24시간
    reddit: 600000,        // 10분
    knowledgeGraph: 86400000 // 24시간
  };
  
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    api: keyof typeof this.ttl
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl[api]) {
      return cached.data as T;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    
    return data;
  }
}
```

#### 에러 처리 및 폴백
```typescript
// lib/external/trend-aggregator.ts
export class TrendAggregator {
  async getTrendSignals(keyword: string): Promise<AggregatedTrend> {
    const signals: Partial<AggregatedTrend> = {};
    
    // Wikipedia - 필수
    try {
      signals.wikipedia = await this.getWikipediaTrend(keyword);
    } catch (error) {
      console.warn('Wikipedia API failed:', error);
      signals.wikipedia = { available: false };
    }
    
    // GDELT - 선택적
    try {
      signals.news = await this.getGDELTTrend(keyword);
    } catch (error) {
      console.warn('GDELT API failed:', error);
      // 무시하고 계속
    }
    
    // Reddit - 선택적
    if (process.env.ENABLE_REDDIT_API === 'true') {
      try {
        signals.reddit = await this.getRedditTrend(keyword);
      } catch (error) {
        console.warn('Reddit API failed:', error);
      }
    }
    
    // 최소 1개 이상의 신호가 있어야 함
    if (Object.keys(signals).length === 0) {
      throw new Error('No trend signals available');
    }
    
    return signals as AggregatedTrend;
  }
}
```

### API 비용 및 제한 관리

| API | 무료 한도 | 권장 사용량 | 캐시 TTL | 우선순위 |
|-----|----------|------------|----------|----------|
| YouTube Data API | 10,000 units/day | 5,000 units/day | 5분 | 필수 |
| Wikipedia | 1,000 req/hour | 500 req/hour | 1시간 | 높음 |
| GDELT | 무제한 | 1,000 req/day | 30분 | 중간 |
| Wikidata | 무제한 (합리적) | 300 req/hour | 24시간 | 낮음 |
| Reddit | 60 req/min | 30 req/min | 10분 | 낮음 |
| Knowledge Graph | 100,000 req/day | 10,000 req/day | 24시간 | 선택 |

## 📈 Feature B: 종합 랭킹 시스템

### 다차원 점수 계산

```typescript
// lib/ranking/scoring-engine.ts
export class ScoringEngine {
  private weights = {
    viewCount: 0.25,
    vph: 0.20,
    delta24h: 0.15,
    engagement: 0.15,
    normalized: 0.10,
    outlier: 0.10,
    freshness: 0.05
  };
  
  // 종합 점수 계산
  calculateScore(video: EnrichedVideoData): number {
    const components = this.calculateComponents(video);
    
    // 각 컴포넌트 정규화 (0-100)
    const normalized = this.normalizeComponents(components);
    
    // 가중 합계
    let score = 0;
    for (const [key, weight] of Object.entries(this.weights)) {
      score += normalized[key] * weight;
    }
    
    return Math.round(score * 100) / 100;
  }
  
  private calculateComponents(video: EnrichedVideoData) {
    const now = Date.now();
    const publishedAt = new Date(video.publishedAt).getTime();
    const ageHours = (now - publishedAt) / (1000 * 60 * 60);
    
    return {
      viewCount: parseInt(video.statistics.viewCount),
      vph: video.metrics.vph,
      delta24h: video.metrics.delta24h || 0,
      engagement: video.metrics.engagementRate,
      normalized: video.metrics.normalizedScore,
      outlier: Math.abs(video.metrics.outlierScore || 0),
      freshness: Math.max(0, 168 - ageHours) / 168 // 7일 기준
    };
  }
  
  private normalizeComponents(components: any) {
    // 각 지표별 최대값 (경험적 수치)
    const maxValues = {
      viewCount: 10000000,
      vph: 100000,
      delta24h: 1000000,
      engagement: 10, // 10%
      normalized: 10, // 구독자 대비 10배
      outlier: 3, // z-score 3
      freshness: 1 // 이미 0-1 범위
    };
    
    const normalized: any = {};
    
    for (const [key, value] of Object.entries(components)) {
      normalized[key] = Math.min(100, (value as number) / maxValues[key] * 100);
    }
    
    return normalized;
  }
  
  // 사용자 정의 가중치
  setCustomWeights(weights: Partial<typeof this.weights>) {
    this.weights = { ...this.weights, ...weights };
  }
}
```

### 랭킹 카테고리별 분류

```typescript
// lib/ranking/categorizer.ts
export class RankingCategorizer {
  categorizeVideos(videos: ScoredVideo[]): CategorizedRankings {
    return {
      overall: this.getTopN(videos, 'score', 50),
      trending: this.getTrending(videos),
      viral: this.getViral(videos),
      underrated: this.getUnderrated(videos),
      fresh: this.getFresh(videos),
      steady: this.getSteady(videos)
    };
  }
  
  private getTrending(videos: ScoredVideo[]): ScoredVideo[] {
    // VPH가 높은 영상
    return videos
      .filter(v => v.metrics.vph > 10000)
      .sort((a, b) => b.metrics.vph - a.metrics.vph)
      .slice(0, 20);
  }
  
  private getViral(videos: ScoredVideo[]): ScoredVideo[] {
    // 24시간 증가량이 높은 영상
    return videos
      .filter(v => v.metrics.delta24h > 100000)
      .sort((a, b) => b.metrics.delta24h - a.metrics.delta24h)
      .slice(0, 20);
  }
  
  private getUnderrated(videos: ScoredVideo[]): ScoredVideo[] {
    // 참여율은 높지만 조회수는 낮은 영상
    return videos
      .filter(v => 
        v.metrics.engagementRate > 5 && 
        parseInt(v.statistics.viewCount) < 100000
      )
      .sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate)
      .slice(0, 20);
  }
  
  private getFresh(videos: ScoredVideo[]): ScoredVideo[] {
    // 최근 24시간 내 게시된 영상
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    
    return videos
      .filter(v => new Date(v.publishedAt).getTime() > yesterday)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }
  
  private getSteady(videos: ScoredVideo[]): ScoredVideo[] {
    // 꾸준히 조회수가 증가하는 영상 (VPH가 안정적)
    return videos
      .filter(v => {
        const ageHours = (Date.now() - new Date(v.publishedAt).getTime()) / (1000 * 60 * 60);
        const expectedVPH = parseInt(v.statistics.viewCount) / ageHours;
        const actualVPH = v.metrics.vph;
        const ratio = actualVPH / expectedVPH;
        return ratio > 0.8 && ratio < 1.2; // 예상 범위 내
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }
}
```

## 🎯 Feature C: 이상치(Outlier) 탐지

### z-MAD 기반 이상치 탐지

```typescript
// lib/analysis/outlier-detector.ts
export class OutlierDetector {
  // 영상별 이상치 점수 계산
  detectOutliers(videos: VideoData[]): OutlierResult[] {
    const metrics = this.extractMetrics(videos);
    const outliers: OutlierResult[] = [];
    
    // 각 지표별 이상치 탐지
    const vphOutliers = this.detectByMAD(metrics.vph);
    const viewOutliers = this.detectByMAD(metrics.views);
    const engagementOutliers = this.detectByMAD(metrics.engagement);
    
    // 종합 이상치 점수
    videos.forEach((video, index) => {
      const outlierScore = 
        Math.abs(vphOutliers[index]) * 0.4 +
        Math.abs(viewOutliers[index]) * 0.3 +
        Math.abs(engagementOutliers[index]) * 0.3;
      
      if (outlierScore > 2.0) { // 임계값
        outliers.push({
          video,
          score: outlierScore,
          components: {
            vph: vphOutliers[index],
            views: viewOutliers[index],
            engagement: engagementOutliers[index]
          },
          reason: this.generateReason(video, outlierScore)
        });
      }
    });
    
    return outliers.sort((a, b) => b.score - a.score);
  }
  
  private detectByMAD(values: number[]): number[] {
    if (values.length < 3) return values.map(() => 0);
    
    // 중앙값 계산
    const sorted = [...values].sort((a, b) => a - b);
    const median = this.getMedian(sorted);
    
    // MAD 계산
    const deviations = values.map(v => Math.abs(v - median));
    const mad = this.getMedian([...deviations].sort((a, b) => a - b));
    
    // z-MAD 점수 계산
    if (mad === 0) return values.map(() => 0);
    
    const k = 1.4826; // 정규분포 상수
    return values.map(v => (v - median) / (k * mad));
  }
  
  private getMedian(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    
    return sorted[mid];
  }
  
  private generateReason(video: VideoData, score: number): string {
    const reasons = [];
    
    if (video.metrics.vph > 50000) {
      reasons.push(`시간당 ${formatNumber(video.metrics.vph)}회 조회`);
    }
    
    if (video.metrics.engagementRate > 10) {
      reasons.push(`${video.metrics.engagementRate.toFixed(1)}% 참여율`);
    }
    
    if (video.metrics.normalizedScore > 5) {
      reasons.push('구독자 대비 높은 조회수');
    }
    
    return reasons.join(', ') || '복합적 이상 패턴';
  }
}
```

### 채널별 이상치 탐지

```typescript
// lib/analysis/channel-outlier.ts
export class ChannelOutlierDetector {
  // 채널 내에서 특별히 잘 나가는 영상 탐지
  async detectChannelOutliers(channelId: string): Promise<OutlierVideo[]> {
    // 채널의 최근 50개 영상 조회
    const recentVideos = await this.getChannelVideos(channelId, 50);
    
    // 채널 평균 성과 계산
    const avgViews = this.calculateAverage(recentVideos.map(v => v.viewCount));
    const avgVPH = this.calculateAverage(recentVideos.map(v => v.vph));
    
    // 이상치 탐지
    const outliers = recentVideos.filter(video => {
      const viewRatio = video.viewCount / avgViews;
      const vphRatio = video.vph / avgVPH;
      
      // 평균의 3배 이상
      return viewRatio > 3 || vphRatio > 3;
    });
    
    return outliers.map(video => ({
      ...video,
      outlierReason: this.generateChannelReason(video, avgViews, avgVPH)
    }));
  }
  
  private generateChannelReason(video: any, avgViews: number, avgVPH: number): string {
    const viewRatio = video.viewCount / avgViews;
    const vphRatio = video.vph / avgVPH;
    
    if (viewRatio > 5) {
      return `채널 평균 대비 ${viewRatio.toFixed(1)}배 조회수`;
    }
    
    if (vphRatio > 5) {
      return `채널 평균 대비 ${vphRatio.toFixed(1)}배 빠른 성장`;
    }
    
    return '채널 내 특별한 성과';
  }
}
```

## 📊 Feature D: 트렌드 예측

```typescript
// lib/analysis/trend-predictor.ts
export class TrendPredictor {
  // 단순 선형 회귀 기반 예측
  predictGrowth(snapshots: VideoSnapshot[]): GrowthPrediction {
    if (snapshots.length < 3) {
      return { confidence: 0, prediction: null };
    }
    
    // 시간과 조회수 데이터 준비
    const data = snapshots.map((s, i) => ({
      x: i, // 시간 인덱스
      y: s.viewCount
    }));
    
    // 선형 회귀 계산
    const regression = this.linearRegression(data);
    
    // 다음 24시간 예측
    const next24h = regression.slope * 24 + regression.intercept;
    
    // 신뢰도 계산 (R²)
    const confidence = this.calculateR2(data, regression);
    
    return {
      confidence,
      prediction: {
        next24h: Math.round(next24h),
        growthRate: regression.slope,
        currentTrend: this.classifyTrend(regression.slope)
      }
    };
  }
  
  private linearRegression(data: {x: number, y: number}[]) {
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.y, 0);
    const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }
  
  private classifyTrend(slope: number): TrendType {
    if (slope > 10000) return 'viral';
    if (slope > 1000) return 'rising';
    if (slope > 0) return 'steady';
    if (slope > -1000) return 'declining';
    return 'fading';
  }
}
```

## ✅ 구현 체크리스트

- [ ] 키워드 추출 시스템 (한국어 NLP)
- [ ] 엔티티 매핑 (KG API, Wikidata)
- [ ] 외부 트렌드 신호 수집
- [ ] 종합 랭킹 점수 계산
- [ ] 카테고리별 랭킹 분류
- [ ] 이상치 탐지 알고리즘
- [ ] 채널별 이상치 분석
- [ ] 트렌드 예측 모델

## 📝 다음 단계
Phase 5: UI/UX 구현으로 진행