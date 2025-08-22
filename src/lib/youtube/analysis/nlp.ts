/**
 * YouTube Lens - NLP Entity Radar System
 * Phase 4: Advanced Analytics
 *
 * Natural Language Processing for Korean and English content
 * Extracts keywords, entities, topics, and sentiment from video metadata
 */

import type { EntityExtraction, TrendAnalysis, YouTubeLensVideo as Video } from '@/types';

/**
 * Korean language patterns and stopwords
 */
const KOREAN_STOPWORDS = [
  '의',
  '가',
  '이',
  '은',
  '들',
  '는',
  '좀',
  '잘',
  '걍',
  '과',
  '도',
  '를',
  '으로',
  '자',
  '에',
  '와',
  '한',
  '하다',
  '그',
  '저',
  '것',
  '수',
  '등',
  '년',
  '월',
  '일',
  '때',
  '더',
  '대',
  '및',
  '제',
  '할',
  '만',
  '또',
  '못',
  '그리고',
  '아니',
  '위',
  '까지',
  '따라',
  '때문',
  '만큼',
  '관련',
  '같',
  '모든',
  '각',
  '또는',
  '이런',
  '저런',
  '어떤',
];

/**
 * English stopwords
 */
const ENGLISH_STOPWORDS = [
  'the',
  'is',
  'at',
  'which',
  'on',
  'a',
  'an',
  'as',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'shall',
  'should',
  'may',
  'might',
  'can',
  'could',
  'must',
  'ought',
  'to',
  'for',
  'of',
  'with',
  'in',
  'out',
  'up',
  'down',
  'about',
];

/**
 * Brand patterns for detection
 */
const BRAND_PATTERNS = [
  // Tech companies
  /samsung|삼성/gi,
  /apple|애플/gi,
  /google|구글/gi,
  /microsoft|마이크로소프트/gi,
  /netflix|넷플릭스/gi,
  /youtube|유튜브/gi,
  /instagram|인스타그램/gi,
  /tiktok|틱톡/gi,

  // Korean brands
  /카카오|kakao/gi,
  /네이버|naver/gi,
  /쿠팡|coupang/gi,
  /배민|배달의민족/gi,

  // Fashion/Beauty
  /nike|나이키/gi,
  /adidas|아디다스/gi,
  /chanel|샤넬/gi,
  /gucci|구찌/gi,
];

/**
 * Sentiment keywords
 */
const SENTIMENT_KEYWORDS = {
  positive: {
    korean: [
      '좋아',
      '최고',
      '대박',
      '멋지',
      '예쁘',
      '귀엽',
      '완벽',
      '추천',
      '사랑',
      '행복',
      '웃긴',
      '재밌',
    ],
    english: [
      'love',
      'amazing',
      'awesome',
      'great',
      'perfect',
      'excellent',
      'wonderful',
      'fantastic',
      'best',
    ],
  },
  negative: {
    korean: ['싫어', '최악', '별로', '나쁘', '실망', '화나', '짜증', '망했', '슬프', '무서'],
    english: [
      'hate',
      'terrible',
      'awful',
      'worst',
      'bad',
      'horrible',
      'disgusting',
      'fail',
      'boring',
    ],
  },
};

/**
 * Detect language of text
 */
function detectLanguage(text: string): 'ko' | 'en' | 'mixed' {
  const koreanChars = (text.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const total = koreanChars + englishChars;

  if (total === 0) {
    return 'en';
  }

  const koreanRatio = koreanChars / total;
  if (koreanRatio > 0.7) {
    return 'ko';
  }
  if (koreanRatio < 0.3) {
    return 'en';
  }
  return 'mixed';
}

/**
 * Tokenize Korean text (simple word boundary approach)
 */
function tokenizeKorean(text: string): string[] {
  // Simple tokenization by spaces and punctuation
  // In production, you'd use a proper Korean tokenizer like mecab-ko
  return text
    .split(/[\s,.\-!?()[\]{}'"]/g)
    .filter((token) => token.length > 0)
    .filter((token) => !KOREAN_STOPWORDS.includes(token));
}

/**
 * Tokenize English text
 */
function tokenizeEnglish(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.\-!?()[\]{}'"]/g)
    .filter((token) => token.length > 1)
    .filter((token) => !ENGLISH_STOPWORDS.includes(token));
}

/**
 * Extract keywords using TF-IDF approach
 */
function extractKeywords(text: string, limit = 10): string[] {
  const language = detectLanguage(text);
  const tokens = language === 'ko' ? tokenizeKorean(text) : tokenizeEnglish(text);

  // Calculate term frequency
  const termFreq = new Map<string, number>();
  tokens.forEach((token) => {
    termFreq.set(token, (termFreq.get(token) || 0) + 1);
  });

  // Sort by frequency and return top keywords
  return Array.from(termFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}

/**
 * Extract brands from text
 */
function extractBrands(text: string): string[] {
  const brands = new Set<string>();

  BRAND_PATTERNS.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => brands.add(match));
    }
  });

  return Array.from(brands);
}

/**
 * Extract people names (simple pattern matching)
 */
function extractPeople(text: string): string[] {
  const people = new Set<string>();

  // Korean name patterns (성 + 이름)
  const koreanNames = text.match(/[김이박최정강조윤장임][가-힣]{1,2}/g) || [];
  koreanNames.forEach((name) => {
    if (name.length >= 2 && name.length <= 4) {
      people.add(name);
    }
  });

  // English name patterns (Capitalized words)
  const englishNames = text.match(/[A-Z][a-z]+ [A-Z][a-z]+/g) || [];
  englishNames.forEach((name) => people.add(name));

  return Array.from(people);
}

/**
 * Extract locations (simple pattern matching)
 */
function extractLocations(text: string): string[] {
  const locations = new Set<string>();

  // Common location patterns
  const locationPatterns = [
    /서울|seoul/gi,
    /부산|busan/gi,
    /대구|daegu/gi,
    /인천|incheon/gi,
    /광주|gwangju/gi,
    /대전|daejeon/gi,
    /울산|ulsan/gi,
    /제주|jeju/gi,
    /강남|gangnam/gi,
    /홍대|hongdae/gi,
    /명동|myeongdong/gi,
    /이태원|itaewon/gi,
    /new york|뉴욕/gi,
    /los angeles|LA|엘에이/gi,
    /tokyo|도쿄|동경/gi,
    /paris|파리/gi,
    /london|런던/gi,
  ];

  locationPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => locations.add(match));
    }
  });

  return Array.from(locations);
}

/**
 * Analyze sentiment of text
 */
function analyzeSentiment(text: string): {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
} {
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;

  // Check positive keywords
  SENTIMENT_KEYWORDS.positive.korean.forEach((keyword) => {
    if (text.includes(keyword)) {
      positiveScore += 2;
    }
  });
  SENTIMENT_KEYWORDS.positive.english.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      positiveScore += 1;
    }
  });

  // Check negative keywords
  SENTIMENT_KEYWORDS.negative.korean.forEach((keyword) => {
    if (text.includes(keyword)) {
      negativeScore += 2;
    }
  });
  SENTIMENT_KEYWORDS.negative.english.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      negativeScore += 1;
    }
  });

  // Calculate sentiment
  const total = positiveScore + negativeScore;
  if (total === 0) {
    return { sentiment: 'neutral', confidence: 0.5 };
  }

  const confidence = Math.max(positiveScore, negativeScore) / total;

  if (positiveScore > negativeScore) {
    return { sentiment: 'positive', confidence };
  }
  if (negativeScore > positiveScore) {
    return { sentiment: 'negative', confidence };
  }
  return { sentiment: 'neutral', confidence: 0.5 };
}

/**
 * Extract entities from video metadata
 */
export async function extractEntities(video: Video): Promise<EntityExtraction> {
  const text = `${video.title} ${video.description || ''} ${(video.tags || []).join(' ')}`;
  const language = detectLanguage(text);

  const keywords = extractKeywords(text, 20);
  const brands = extractBrands(text);
  const people = extractPeople(text);
  const locations = extractLocations(text);

  // Extract topics (group related keywords)
  const topics = extractTopics(keywords);

  return {
    entities: {
      keywords: keywords.slice(0, 10),
      topics,
      brands,
      people,
      locations,
    },
    language: language === 'ko' ? 'Korean' : language === 'en' ? 'English' : 'Mixed',
    confidence: calculateConfidence(keywords, brands, people, locations),
    processedAt: new Date().toISOString(),
  };
}

/**
 * Extract topics from keywords
 */
function extractTopics(keywords: string[]): string[] {
  const topicPatterns = {
    Technology: /tech|코딩|프로그래밍|개발|ai|인공지능|computer|소프트웨어/i,
    Gaming: /game|게임|플레이|play|스트림|stream|e-?sports/i,
    Beauty: /뷰티|beauty|화장|makeup|cosmetic|skincare|스킨케어/i,
    Fashion: /패션|fashion|옷|clothes|스타일|style|outfit|코디/i,
    Food: /음식|food|먹방|mukbang|요리|cooking|recipe|레시피/i,
    Music: /음악|music|노래|song|커버|cover|dance|댄스/i,
    Education: /교육|education|강의|lecture|tutorial|튜토리얼|학습|study/i,
    Travel: /여행|travel|trip|tour|관광|vlog|브이로그/i,
    Fitness: /운동|fitness|health|헬스|다이어트|diet|workout/i,
    Entertainment: /예능|entertainment|comedy|코미디|funny|재미/i,
  };

  const detectedTopics = new Set<string>();

  keywords.forEach((keyword) => {
    Object.entries(topicPatterns).forEach(([topic, pattern]) => {
      if (pattern.test(keyword)) {
        detectedTopics.add(topic);
      }
    });
  });

  return Array.from(detectedTopics);
}

/**
 * Calculate confidence score for entity extraction
 */
function calculateConfidence(
  keywords: string[],
  brands: string[],
  people: string[],
  locations: string[]
): number {
  const totalEntities = keywords.length + brands.length + people.length + locations.length;

  if (totalEntities === 0) {
    return 0;
  }

  // Base confidence on entity diversity and count
  let confidence = Math.min(totalEntities / 20, 1) * 0.5;

  // Boost confidence if multiple entity types are found
  const typesFound = [
    keywords.length > 0,
    brands.length > 0,
    people.length > 0,
    locations.length > 0,
  ].filter(Boolean).length;

  confidence += (typesFound / 4) * 0.5;

  return Math.min(confidence, 0.95);
}

/**
 * Analyze trends from multiple videos
 */
export async function analyzeTrends(videos: Video[], timeWindowDays = 7): Promise<TrendAnalysis[]> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - timeWindowDays * 24 * 60 * 60 * 1000);

  // Filter videos within time window
  const recentVideos = videos.filter((v) => new Date(v.published_at) >= windowStart);

  // Extract all keywords from recent videos
  const allKeywords = new Map<
    string,
    {
      count: number;
      videos: string[];
      firstSeen: Date;
      lastSeen: Date;
      sentiments: Array<'positive' | 'negative' | 'neutral'>;
    }
  >();

  for (const video of recentVideos) {
    const text = `${video.title} ${video.description || ''}`;
    const keywords = extractKeywords(text, 10);
    const { sentiment } = analyzeSentiment(text);
    const videoDate = new Date(video.published_at);

    keywords.forEach((keyword) => {
      const existing = allKeywords.get(keyword);
      if (existing) {
        existing.count++;
        existing.videos.push(video.video_id);
        existing.sentiments.push(sentiment);
        if (videoDate < existing.firstSeen) {
          existing.firstSeen = videoDate;
        }
        if (videoDate > existing.lastSeen) {
          existing.lastSeen = videoDate;
        }
      } else {
        allKeywords.set(keyword, {
          count: 1,
          videos: [video.video_id],
          firstSeen: videoDate,
          lastSeen: videoDate,
          sentiments: [sentiment],
        });
      }
    });
  }

  // Calculate trends
  const trends: TrendAnalysis[] = [];

  allKeywords.forEach((data, keyword) => {
    if (data.count >= 2) {
      // Minimum frequency threshold
      const daysDiff = Math.max(
        1,
        (data.lastSeen.getTime() - data.firstSeen.getTime()) / (24 * 60 * 60 * 1000)
      );
      const growthRate = data.count / daysDiff;

      // Calculate dominant sentiment
      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
      data.sentiments.forEach((s) => sentimentCounts[s]++);
      const sortedSentiments = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1]);
      const dominantSentiment = (sortedSentiments[0]?.[0] ?? 'neutral') as
        | 'positive'
        | 'negative'
        | 'neutral';

      trends.push({
        keyword,
        frequency: data.count,
        growthRate: growthRate,
        firstSeen: data.firstSeen.toISOString(),
        lastSeen: data.lastSeen.toISOString(),
        relatedVideos: data.videos.slice(0, 10),
        sentiment: dominantSentiment,
        confidence: Math.min(data.count / 10, 0.95),
      });
    }
  });

  // Sort by growth rate
  return trends.sort((a, b) => {
    const aRate = typeof a.growthRate === 'number' ? a.growthRate : 0;
    const bRate = typeof b.growthRate === 'number' ? b.growthRate : 0;
    return bRate - aRate;
  });
}

/**
 * Generate NLP analysis report
 */
export function generateNLPReport(
  entityExtractions: EntityExtraction[],
  trends: TrendAnalysis[]
): {
  totalProcessed: number;
  languageDistribution: Record<string, number>;
  topKeywords: Array<{ keyword: string; count: number }>;
  topTopics: Array<{ topic: string; count: number }>;
  topBrands: Array<{ brand: string; count: number }>;
  trendingKeywords: TrendAnalysis[];
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
} {
  const languageCounts: Record<string, number> = {};
  const keywordCounts = new Map<string, number>();
  const topicCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();

  entityExtractions.forEach((extraction) => {
    // Language distribution
    languageCounts[extraction.language] = (languageCounts[extraction.language] || 0) + 1;

    // Type guard for entities
    if (!extraction.entities || typeof extraction.entities !== 'object') {
      return;
    }

    const entities = extraction.entities as {
      keywords?: string[];
      topics?: string[];
      brands?: string[];
    };

    // Aggregate keywords
    entities.keywords?.forEach((keyword) => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    });

    // Aggregate topics
    entities.topics?.forEach((topic) => {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });

    // Aggregate brands
    entities.brands?.forEach((brand) => {
      brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
    });
  });

  // Calculate sentiment distribution from trends
  const sentimentDist = { positive: 0, negative: 0, neutral: 0 };
  trends.forEach((trend) => {
    sentimentDist[trend.sentiment]++;
  });

  return {
    totalProcessed: entityExtractions.length,
    languageDistribution: languageCounts,
    topKeywords: Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count })),
    topTopics: Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count })),
    topBrands: Array.from(brandCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([brand, count]) => ({ brand, count })),
    trendingKeywords: trends.slice(0, 10),
    sentimentDistribution: sentimentDist,
  };
}

const nlpAnalysis = {
  extractEntities,
  analyzeTrends,
  generateNLPReport,
};

export default nlpAnalysis;
