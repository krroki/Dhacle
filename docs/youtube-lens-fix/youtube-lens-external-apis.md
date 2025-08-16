# YouTube Lens 외부 API 연동 상세 구현

## 📌 개요
YouTube Lens의 엔티티 레이더 기능을 위한 외부 API (Wikipedia, GDELT, Google Knowledge Graph) 연동 상세 구현 가이드입니다.

## 🌐 Wikipedia API 연동

### 1. API 엔드포인트 및 인증

```typescript
// src/lib/external-apis/wikipedia.ts

const WIKIPEDIA_CONFIG = {
  // REST API 엔드포인트
  REST_API: 'https://en.wikipedia.org/api/rest_v1',
  ACTION_API: 'https://en.wikipedia.org/w/api.php',
  
  // 다국어 지원
  LANGUAGES: {
    ko: 'https://ko.wikipedia.org/api/rest_v1',
    en: 'https://en.wikipedia.org/api/rest_v1',
    ja: 'https://ja.wikipedia.org/api/rest_v1',
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    requests_per_second: 200,
    burst_limit: 500,
  },
  
  // User-Agent 필수 (Wikipedia 정책)
  USER_AGENT: 'YouTubeLens/1.0 (https://yourlens.com; contact@yourlens.com)',
};

interface WikipediaPageView {
  article: string;
  views: number;
  rank: number;
  date: string;
}

/**
 * Wikipedia 페이지뷰 트렌드 가져오기
 */
export async function getWikipediaPageViews(
  topic: string,
  language: string = 'en',
  days: number = 7
): Promise<WikipediaPageView[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const startStr = formatDateYYYYMMDD(startDate);
  const endStr = formatDateYYYYMMDD(endDate);
  
  try {
    // 1. 페이지 검색
    const searchUrl = new URL(`${WIKIPEDIA_CONFIG.ACTION_API}`);
    searchUrl.searchParams.append('action', 'query');
    searchUrl.searchParams.append('list', 'search');
    searchUrl.searchParams.append('srsearch', topic);
    searchUrl.searchParams.append('format', 'json');
    searchUrl.searchParams.append('origin', '*');
    
    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        'User-Agent': WIKIPEDIA_CONFIG.USER_AGENT,
      },
    });
    
    const searchData = await searchResponse.json();
    const pages = searchData.query?.search || [];
    
    if (pages.length === 0) {
      return [];
    }
    
    // 2. 각 페이지의 조회수 가져오기
    const pageViews = await Promise.all(
      pages.slice(0, 5).map(async (page: any) => {
        const title = encodeURIComponent(page.title.replace(/ /g, '_'));
        const viewsUrl = `${WIKIPEDIA_CONFIG.REST_API}/metrics/pageviews/per-article/${language}.wikipedia/all-access/all-agents/${title}/daily/${startStr}/${endStr}`;
        
        try {
          const viewsResponse = await fetch(viewsUrl, {
            headers: {
              'User-Agent': WIKIPEDIA_CONFIG.USER_AGENT,
            },
          });
          
          if (!viewsResponse.ok) {
            return null;
          }
          
          const viewsData = await viewsResponse.json();
          const items = viewsData.items || [];
          
          // 총 조회수 계산
          const totalViews = items.reduce((sum: number, item: any) => 
            sum + (item.views || 0), 0
          );
          
          return {
            article: page.title,
            views: totalViews,
            rank: 0, // 나중에 정렬 후 설정
            date: endStr,
          };
        } catch (error) {
          console.error(`Failed to fetch views for ${page.title}:`, error);
          return null;
        }
      })
    );
    
    // 3. null 제거하고 조회수로 정렬
    const validPageViews = pageViews
      .filter(pv => pv !== null)
      .sort((a, b) => b!.views - a!.views)
      .map((pv, index) => ({
        ...pv!,
        rank: index + 1,
      }));
    
    return validPageViews;
  } catch (error) {
    console.error('Wikipedia API error:', error);
    throw error;
  }
}

/**
 * 트렌딩 토픽 감지
 */
export async function detectTrendingTopics(
  keywords: string[],
  threshold: number = 1000
): Promise<{topic: string, trend: number}[]> {
  const trends = await Promise.all(
    keywords.map(async (keyword) => {
      const views = await getWikipediaPageViews(keyword, 'en', 1);
      const todayViews = views[0]?.views || 0;
      
      // 일주일 전 대비 증가율 계산
      const weekAgoViews = await getWikipediaPageViews(keyword, 'en', 8);
      const weekAgoTotal = weekAgoViews[0]?.views || 1;
      
      const trendScore = ((todayViews - weekAgoTotal) / weekAgoTotal) * 100;
      
      return {
        topic: keyword,
        trend: trendScore,
      };
    })
  );
  
  return trends.filter(t => t.trend > threshold);
}
```

## 🌍 GDELT API 연동

### 2. GDELT Project API 구현

```typescript
// src/lib/external-apis/gdelt.ts

const GDELT_CONFIG = {
  // GDELT API 엔드포인트
  DOC_API: 'https://api.gdeltproject.org/api/v2/doc/doc',
  TV_API: 'https://api.gdeltproject.org/api/v2/tv/tv',
  GEO_API: 'https://api.gdeltproject.org/api/v2/geo/geo',
  
  // 파라미터 제한
  MAX_RECORDS: 250,
  
  // 출력 형식
  FORMAT: 'json',
};

interface GDELTArticle {
  url: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

interface GDELTTrend {
  keyword: string;
  volume: number;
  sentiment: number;
  articles: GDELTArticle[];
}

/**
 * GDELT에서 실시간 뉴스 트렌드 가져오기
 */
export async function getGDELTTrends(
  query: string,
  timespan: string = '1d',
  region?: string
): Promise<GDELTTrend> {
  try {
    const params = new URLSearchParams({
      query: query,
      mode: 'artlist',
      maxrecords: GDELT_CONFIG.MAX_RECORDS.toString(),
      timespan: timespan,
      format: GDELT_CONFIG.FORMAT,
      sort: 'hybridrel', // 관련성 + 최신순
    });
    
    if (region) {
      params.append('sourcecountry', region);
    }
    
    const url = `${GDELT_CONFIG.DOC_API}?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GDELT API error: ${response.status}`);
    }
    
    const data = await response.json();
    const articles = data.articles || [];
    
    // 감정 분석 점수 계산
    const sentimentScores = articles.map((a: any) => 
      parseFloat(a.tone || '0')
    );
    const avgSentiment = sentimentScores.length > 0
      ? sentimentScores.reduce((a: number, b: number) => a + b, 0) / sentimentScores.length
      : 0;
    
    return {
      keyword: query,
      volume: articles.length,
      sentiment: avgSentiment,
      articles: articles.slice(0, 10).map((a: any) => ({
        url: a.url,
        title: a.title,
        seendate: a.seendate,
        socialimage: a.socialimage,
        domain: a.domain,
        language: a.language,
        sourcecountry: a.sourcecountry,
      })),
    };
  } catch (error) {
    console.error('GDELT API error:', error);
    throw error;
  }
}

/**
 * 지역별 트렌드 히트맵 데이터
 */
export async function getGDELTGeoTrends(
  query: string,
  timespan: string = '1d'
): Promise<{location: string, count: number}[]> {
  try {
    const params = new URLSearchParams({
      query: query,
      mode: 'pointdata',
      geolocationcc: 'true',
      timespan: timespan,
      format: GDELT_CONFIG.FORMAT,
    });
    
    const url = `${GDELT_CONFIG.GEO_API}?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GDELT GEO API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 국가별 집계
    const locationCounts: Record<string, number> = {};
    
    (data.features || []).forEach((feature: any) => {
      const country = feature.properties?.countrycode || 'Unknown';
      locationCounts[country] = (locationCounts[country] || 0) + 1;
    });
    
    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('GDELT GEO API error:', error);
    throw error;
  }
}
```

## 🧠 Google Knowledge Graph API 연동

### 3. Knowledge Graph API 구현

```typescript
// src/lib/external-apis/knowledge-graph.ts

const KNOWLEDGE_GRAPH_CONFIG = {
  API_ENDPOINT: 'https://kgsearch.googleapis.com/v1/entities:search',
  API_KEY: process.env.GOOGLE_KG_API_KEY!,
  
  // 제한사항
  DAILY_LIMIT: 100000,
  QPM_LIMIT: 60000, // Queries per minute
  
  // 기본 파라미터
  DEFAULT_LIMIT: 10,
  DEFAULT_INDENT: false,
};

interface KnowledgeEntity {
  id: string;
  name: string;
  type: string[];
  description: string;
  score: number;
  url?: string;
  image?: string;
}

/**
 * Knowledge Graph에서 엔티티 검색
 */
export async function searchKnowledgeGraph(
  query: string,
  types?: string[],
  languages: string[] = ['en', 'ko'],
  limit: number = 10
): Promise<KnowledgeEntity[]> {
  if (!KNOWLEDGE_GRAPH_CONFIG.API_KEY) {
    throw new Error('Google Knowledge Graph API key is not configured');
  }
  
  try {
    const params = new URLSearchParams({
      query: query,
      key: KNOWLEDGE_GRAPH_CONFIG.API_KEY,
      limit: limit.toString(),
      indent: KNOWLEDGE_GRAPH_CONFIG.DEFAULT_INDENT.toString(),
      languages: languages.join(','),
    });
    
    if (types && types.length > 0) {
      types.forEach(type => params.append('types', type));
    }
    
    const url = `${KNOWLEDGE_GRAPH_CONFIG.API_ENDPOINT}?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Knowledge Graph API error: ${error.error?.message || response.status}`);
    }
    
    const data = await response.json();
    const entities = data.itemListElement || [];
    
    return entities.map((item: any) => {
      const entity = item.result || {};
      return {
        id: entity['@id'] || '',
        name: entity.name || '',
        type: entity['@type'] || [],
        description: entity.description || '',
        score: item.resultScore || 0,
        url: entity.url || entity.detailedDescription?.url,
        image: entity.image?.contentUrl,
      };
    });
  } catch (error) {
    console.error('Knowledge Graph API error:', error);
    throw error;
  }
}

/**
 * YouTube 영상 제목에서 엔티티 추출
 */
export async function extractEntitiesFromTitle(
  title: string,
  types: string[] = ['Person', 'Organization', 'Event', 'Place']
): Promise<KnowledgeEntity[]> {
  // 제목을 토큰화
  const tokens = title.split(/\s+/);
  const entities: KnowledgeEntity[] = [];
  
  // N-gram으로 엔티티 후보 생성
  for (let n = 3; n >= 1; n--) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const candidate = tokens.slice(i, i + n).join(' ');
      
      // 너무 짧은 단어는 제외
      if (candidate.length < 3) continue;
      
      try {
        const results = await searchKnowledgeGraph(candidate, types, ['ko', 'en'], 1);
        
        if (results.length > 0 && results[0].score > 50) {
          // 중복 제거
          if (!entities.find(e => e.id === results[0].id)) {
            entities.push(results[0]);
          }
        }
      } catch (error) {
        // 개별 검색 실패는 무시
        console.debug(`Entity search failed for: ${candidate}`);
      }
      
      // Rate limiting 준수
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  return entities.sort((a, b) => b.score - a.score);
}
```

## 🔄 통합 트렌드 분석 엔진

### 4. 모든 외부 API를 통합한 트렌드 분석

```typescript
// src/lib/external-apis/trend-engine.ts

import { getWikipediaPageViews, detectTrendingTopics } from './wikipedia';
import { getGDELTTrends, getGDELTGeoTrends } from './gdelt';
import { searchKnowledgeGraph, extractEntitiesFromTitle } from './knowledge-graph';

interface TrendSignal {
  source: 'wikipedia' | 'gdelt' | 'knowledge_graph';
  keyword: string;
  score: number;
  metadata: any;
}

interface CompositeTrend {
  keyword: string;
  composite_score: number;
  signals: TrendSignal[];
  recommendation: string;
}

/**
 * 복합 트렌드 점수 계산
 */
export async function calculateCompositeTrend(
  keyword: string,
  region: string = 'KR'
): Promise<CompositeTrend> {
  const signals: TrendSignal[] = [];
  
  try {
    // 1. Wikipedia 신호
    const wikiViews = await getWikipediaPageViews(keyword, 'en', 7);
    if (wikiViews.length > 0) {
      const avgViews = wikiViews.reduce((sum, v) => sum + v.views, 0) / wikiViews.length;
      signals.push({
        source: 'wikipedia',
        keyword,
        score: Math.min(100, avgViews / 1000), // 정규화
        metadata: { views: avgViews },
      });
    }
    
    // 2. GDELT 신호
    const gdeltTrend = await getGDELTTrends(keyword, '3d', region);
    if (gdeltTrend.volume > 0) {
      signals.push({
        source: 'gdelt',
        keyword,
        score: Math.min(100, gdeltTrend.volume), // 정규화
        metadata: {
          articles: gdeltTrend.volume,
          sentiment: gdeltTrend.sentiment,
        },
      });
    }
    
    // 3. Knowledge Graph 신호
    const entities = await searchKnowledgeGraph(keyword, undefined, ['en', 'ko'], 1);
    if (entities.length > 0) {
      signals.push({
        source: 'knowledge_graph',
        keyword,
        score: entities[0].score,
        metadata: {
          entity_type: entities[0].type,
          description: entities[0].description,
        },
      });
    }
  } catch (error) {
    console.error('Error collecting trend signals:', error);
  }
  
  // 가중 평균 계산
  const weights = {
    wikipedia: 0.3,
    gdelt: 0.5,
    knowledge_graph: 0.2,
  };
  
  let compositeScore = 0;
  let totalWeight = 0;
  
  signals.forEach(signal => {
    const weight = weights[signal.source];
    compositeScore += signal.score * weight;
    totalWeight += weight;
  });
  
  if (totalWeight > 0) {
    compositeScore = compositeScore / totalWeight;
  }
  
  // 추천 생성
  let recommendation = '보통 관심도';
  if (compositeScore > 70) {
    recommendation = '🔥 핫 트렌드! 즉시 콘텐츠 제작 추천';
  } else if (compositeScore > 40) {
    recommendation = '📈 상승 트렌드. 모니터링 필요';
  } else if (compositeScore < 20) {
    recommendation = '📉 하락 트렌드. 신중한 접근 필요';
  }
  
  return {
    keyword,
    composite_score: compositeScore,
    signals,
    recommendation,
  };
}

/**
 * YouTube 영상 제목 배치에서 트렌드 추출
 */
export async function extractTrendsFromVideos(
  videoTitles: string[],
  limit: number = 10
): Promise<CompositeTrend[]> {
  // 1. 모든 제목에서 엔티티 추출
  const allEntities: Map<string, number> = new Map();
  
  for (const title of videoTitles) {
    const entities = await extractEntitiesFromTitle(title);
    entities.forEach(entity => {
      const count = allEntities.get(entity.name) || 0;
      allEntities.set(entity.name, count + 1);
    });
  }
  
  // 2. 빈도순 정렬
  const sortedEntities = Array.from(allEntities.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  
  // 3. 각 엔티티의 트렌드 점수 계산
  const trends = await Promise.all(
    sortedEntities.map(([keyword]) => 
      calculateCompositeTrend(keyword)
    )
  );
  
  return trends.sort((a, b) => b.composite_score - a.composite_score);
}
```

## 🔧 환경 변수 설정

```bash
# .env.local
GOOGLE_KG_API_KEY=your_knowledge_graph_api_key_here
WIKIPEDIA_USER_AGENT=YouTubeLens/1.0
GDELT_CACHE_TTL=3600
```

## 📊 사용 예제

```typescript
// 페이지 컴포넌트에서 사용
import { extractTrendsFromVideos } from '@/lib/external-apis/trend-engine';

export default async function TrendRadar() {
  // YouTube에서 가져온 영상 제목들
  const videoTitles = [
    "뉴진스 신곡 최초 공개",
    "삼성전자 실적 발표",
    // ...
  ];
  
  const trends = await extractTrendsFromVideos(videoTitles, 5);
  
  return (
    <div>
      {trends.map(trend => (
        <div key={trend.keyword}>
          <h3>{trend.keyword}</h3>
          <p>트렌드 점수: {trend.composite_score.toFixed(1)}</p>
          <p>{trend.recommendation}</p>
        </div>
      ))}
    </div>
  );
}
```

## ⚠️ 주의사항

1. **Rate Limiting**: 각 API의 요청 제한 준수
   - Wikipedia: 200 req/s
   - GDELT: 제한 없음 (courtesy 준수)
   - Knowledge Graph: 60,000 QPM

2. **에러 처리**: 개별 API 실패 시 전체 시스템 영향 최소화

3. **캐싱**: 동일 쿼리 반복 방지를 위한 캐싱 필수

4. **비용**: Google Knowledge Graph API는 유료 (일일 무료 한도 있음)