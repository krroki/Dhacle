/**
 * YouTube Keyword Analysis System
 * 
 * Extracts and analyzes trending keywords from video titles and descriptions
 * Phase 2 Implementation - Created: 2025-08-28
 */

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

// 비디오 입력 스키마
export interface VideoInput {
  title: string;
  description: string;
  channelId: string;
  category?: string;
  publishedAt?: string;
}

// 키워드 분석 결과
export interface KeywordAnalysisResult {
  hashtags: string[];
  keywords: string[];
  trending: KeywordTrend[];
}

/**
 * 키워드 추출 및 트렌드 분석 클래스
 */
export class KeywordExtractor {
  // 한국어 불용어 목록
  private koreanStopWords = new Set([
    '그리고', '하지만', '그러나', '그래서', '따라서', '그런데',
    '이것', '저것', '그것', '여기', '거기', '저기',
    '이', '그', '저', '것', '들', '등', '및', '또는',
    '있다', '없다', '하다', '되다', '이다', '아니다',
    '한다', '했다', '할', '함', '합니다', '했습니다',
    '에', '에서', '으로', '로', '를', '을', '는', '은', '가', '이',
    '의', '과', '와', '도', '만', '까지', '부터', '에게', '한테',
  ]);
  
  // 영어 불용어 목록
  private englishStopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must',
    'can', 'this', 'that', 'these', 'those', 'i', 'you',
    'he', 'she', 'it', 'we', 'they', 'them', 'their',
  ]);
  
  /**
   * 해시태그 추출
   */
  extractHashtags(text: string): string[] {
    // 다양한 해시태그 패턴 지원
    const hashtagPattern = /#[0-9A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ_]+/g;
    const hashtags = text.match(hashtagPattern) || [];
    
    // 중복 제거, 소문자 변환, 2자 이상만
    const uniqueHashtags = [...new Set(
      hashtags
        .map(tag => tag.toLowerCase())
        .filter(tag => tag.length > 2)
    )];
    
    return uniqueHashtags;
  }
  
  /**
   * 이모지 제거
   */
  private removeEmojis(text: string): string {
    // 이모지 및 특수 유니코드 제거
    return text.replace(/[\u{1F300}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, ' ');
  }
  
  /**
   * 텍스트 정규화
   */
  private normalizeText(text: string): string {
    // 이모지 제거
    let normalized = this.removeEmojis(text);
    
    // HTML 태그 제거
    normalized = normalized.replace(/<[^>]*>/g, ' ');
    
    // URL 제거
    normalized = normalized.replace(/https?:\/\/[^\s]+/g, ' ');
    
    // 특수문자를 공백으로 (단, 해시태그는 보존)
    normalized = normalized.replace(/[^\w가-힣ㄱ-ㅎㅏ-ㅣ\s#]/g, ' ');
    
    // 연속된 공백을 하나로
    normalized = normalized.replace(/\s+/g, ' ');
    
    return normalized.trim();
  }
  
  /**
   * 일반 키워드 추출
   */
  extractKeywords(text: string, maxKeywords = 10): string[] {
    // 텍스트 정규화
    const normalized = this.normalizeText(text);
    const lowerText = normalized.toLowerCase();
    
    // 단어 분리
    const words = lowerText.split(/\s+/).filter(word => {
      // 길이 체크
      if (word.length <= 1 || word.length > 20) return false;
      
      // 해시태그는 별도 처리
      if (word.startsWith('#')) return false;
      
      // 숫자만 있는 경우 제외
      if (/^\d+$/.test(word)) return false;
      
      // 불용어 체크
      if (this.koreanStopWords.has(word) || this.englishStopWords.has(word)) {
        return false;
      }
      
      return true;
    });
    
    // 빈도 계산
    const frequency = new Map<string, number>();
    for (const word of words) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }
    
    // 빈도순 정렬 및 상위 N개 반환
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }
  
  /**
   * n-gram 추출 (연속된 단어 조합)
   */
  extractNGrams(text: string, n = 2, maxNGrams = 5): string[] {
    const normalized = this.normalizeText(text);
    const words = normalized.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    if (words.length < n) return [];
    
    const ngrams = new Map<string, number>();
    
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      
      // 불용어로만 구성된 n-gram 제외
      const hasContent = words.slice(i, i + n).some(word => 
        !this.koreanStopWords.has(word) && !this.englishStopWords.has(word)
      );
      
      if (hasContent) {
        ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
      }
    }
    
    // 빈도순 정렬
    return Array.from(ngrams.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxNGrams)
      .map(([ngram]) => ngram);
  }
  
  /**
   * 트렌드 스코어 계산
   */
  calculateTrendScore(
    currentFreq: number,
    previousFreq: number,
    totalChannels: number
  ): number {
    // 이전 데이터가 없으면 신규 트렌드
    if (previousFreq === 0) {
      return currentFreq >= 3 ? 100 : currentFreq * 20;
    }
    
    // 성장률 계산
    const growth = ((currentFreq - previousFreq) / previousFreq) * 100;
    
    // 채널 침투율 (얼마나 많은 채널이 사용하는지)
    const penetration = Math.min(100, (currentFreq / Math.max(1, totalChannels)) * 100);
    
    // 성장률 60% + 침투율 40%
    const score = (growth * 0.6) + (penetration * 0.4);
    
    // -100 ~ 500 범위로 제한
    return Math.max(-100, Math.min(500, score));
  }
  
  /**
   * 배치 키워드 트렌드 분석
   */
  async analyzeKeywordTrends(
    videos: VideoInput[],
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
      
      // 해시태그 추출
      const hashtags = this.extractHashtags(text);
      
      // 일반 키워드 추출
      const keywords = this.extractKeywords(text, 15);
      
      // 2-gram 추출 (두 단어 조합)
      const bigrams = this.extractNGrams(text, 2, 5);
      
      // 모든 키워드 결합 (해시태그 우선순위 높게)
      const allKeywords = [
        ...hashtags.map(h => ({ word: h, weight: 2 })), // 해시태그는 가중치 2
        ...keywords.map(k => ({ word: k, weight: 1 })),
        ...bigrams.map(b => ({ word: b, weight: 1.5 })), // 2-gram은 가중치 1.5
      ];
      
      for (const { word, weight } of allKeywords) {
        if (!keywordMap.has(word)) {
          keywordMap.set(word, {
            frequency: 0,
            channels: new Set(),
            categories: new Set(),
          });
        }
        
        const data = keywordMap.get(word)!;
        data.frequency += weight;
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
      // 최소 2개 채널 이상에서 사용되거나, 빈도가 3 이상인 키워드만
      if (data.channels.size < 2 && data.frequency < 3) continue;
      
      const previousFreq = previousTrends?.get(keyword) || 0;
      const trendScore = this.calculateTrendScore(
        data.frequency,
        previousFreq,
        totalChannels
      );
      
      // 트렌드 스코어가 의미있는 경우만 포함
      if (trendScore > 5 || data.frequency >= 5) {
        // 가장 많이 사용된 카테고리를 대표 카테고리로
        const categoryArray = Array.from(data.categories);
        const category = categoryArray.length > 0 ? categoryArray[0] : undefined;
        
        trends.push({
          keyword,
          frequency: Math.round(data.frequency),
          growth: Math.round(trendScore),
          channels: Array.from(data.channels),
          category,
        });
      }
    }
    
    // 트렌드 스코어 및 빈도 순으로 정렬 (상위 30개)
    return trends
      .sort((a, b) => {
        // 성장률이 높은 것 우선
        if (Math.abs(b.growth - a.growth) > 10) {
          return b.growth - a.growth;
        }
        // 성장률이 비슷하면 빈도로 정렬
        return b.frequency - a.frequency;
      })
      .slice(0, 30);
  }
  
  /**
   * 카테고리별 키워드 그룹핑
   */
  groupKeywordsByCategory(
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
    
    // 각 카테고리별로 정렬
    for (const [category, items] of grouped) {
      grouped.set(category, items.sort((a, b) => b.growth - a.growth));
    }
    
    return grouped;
  }
  
  /**
   * 키워드 관련성 점수 계산
   */
  calculateRelevanceScore(
    keyword: string,
    targetKeywords: string[]
  ): number {
    const keywordLower = keyword.toLowerCase();
    let score = 0;
    
    for (const target of targetKeywords) {
      const targetLower = target.toLowerCase();
      
      // 정확히 일치
      if (keywordLower === targetLower) {
        score += 100;
      }
      // 포함 관계
      else if (keywordLower.includes(targetLower) || targetLower.includes(keywordLower)) {
        score += 50;
      }
      // 부분 일치 (3자 이상 연속 일치)
      else {
        const minLength = Math.min(keywordLower.length, targetLower.length);
        if (minLength >= 3) {
          for (let i = 0; i <= keywordLower.length - 3; i++) {
            const substr = keywordLower.substr(i, 3);
            if (targetLower.includes(substr)) {
              score += 10;
              break;
            }
          }
        }
      }
    }
    
    return score;
  }
  
  /**
   * 관련 키워드 찾기
   */
  findRelatedKeywords(
    trends: KeywordTrend[],
    targetKeywords: string[],
    minRelevanceScore = 30
  ): KeywordTrend[] {
    const related: Array<KeywordTrend & { relevance: number }> = [];
    
    for (const trend of trends) {
      const relevance = this.calculateRelevanceScore(trend.keyword, targetKeywords);
      if (relevance >= minRelevanceScore) {
        related.push({ ...trend, relevance });
      }
    }
    
    // 관련성 순으로 정렬
    return related.sort((a, b) => b.relevance - a.relevance);
  }
}

/**
 * 키워드 통계 생성
 */
export interface KeywordStats {
  totalKeywords: number;
  uniqueKeywords: number;
  trendingKeywords: number; // growth > 50
  risingKeywords: number;   // growth > 20
  decliningKeywords: number; // growth < -20
  topCategories: Array<{ category: string; count: number }>;
}

export function calculateKeywordStats(trends: KeywordTrend[]): KeywordStats {
  const categoryCount = new Map<string, number>();
  let trendingCount = 0;
  let risingCount = 0;
  let decliningCount = 0;
  
  for (const trend of trends) {
    // 카테고리별 집계
    const category = trend.category || '기타';
    categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    
    // 성장률별 분류
    if (trend.growth > 50) {
      trendingCount++;
    } else if (trend.growth > 20) {
      risingCount++;
    } else if (trend.growth < -20) {
      decliningCount++;
    }
  }
  
  // 상위 카테고리 정렬
  const topCategories = Array.from(categoryCount.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    totalKeywords: trends.reduce((sum, t) => sum + t.frequency, 0),
    uniqueKeywords: trends.length,
    trendingKeywords: trendingCount,
    risingKeywords: risingCount,
    decliningKeywords: decliningCount,
    topCategories,
  };
}

/**
 * 데이터베이스 저장용 변환
 */
export interface KeywordDbRecord {
  keyword: string;
  date: string;
  frequency: number;
  channels: string[];
  growth_rate: number;
  category: string | null;
}

export function trendToDbRecord(
  trend: KeywordTrend,
  date: Date = new Date()
): KeywordDbRecord {
  const dateString = date.toISOString().split('T')[0];
  if (!dateString) {
    throw new Error('Invalid date format');
  }
  
  return {
    keyword: trend.keyword,
    date: dateString, // YYYY-MM-DD
    frequency: trend.frequency,
    channels: trend.channels,
    growth_rate: trend.growth,
    category: trend.category ?? null,
  };
}