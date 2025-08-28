/**
 * YouTube Shorts Detection System
 * 
 * Detects YouTube Shorts based on duration, keywords, and other signals
 * Phase 2 Implementation - Created: 2025-08-28
 */

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
      medium: z.object({
        url: z.string(),
        width: z.number(),
        height: z.number(),
      }).optional(),
      high: z.object({
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

export interface ShortsDetectionResult {
  isShorts: boolean;
  confidence: number; // 0-1
  reasons: string[];
  duration: number; // seconds
}

/**
 * ISO 8601 duration을 초로 변환
 * 
 * @example
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
      reasons: [`Duration too long: ${durationSeconds}s (> 60s)`],
      duration: durationSeconds,
    };
  }
  
  reasons.push(`Duration: ${durationSeconds}s (≤ 60s)`);
  confidence = 0.5; // 60초 이하면 기본 50%
  
  // 2. 키워드 체크
  const shortsKeywords = [
    '#shorts', '#쇼츠', 'shorts', '쇼츠', 
    '#short', '#ytshorts', '#youtubeshorts',
    '#yt', '#youtube'
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
  const thumbnails = video.snippet.thumbnails;
  if (thumbnails) {
    const thumb = thumbnails.high || thumbnails.medium || thumbnails.default;
    if (thumb && thumb.height > thumb.width) {
      confidence += 0.1;
      reasons.push('Vertical thumbnail (9:16 ratio)');
    }
  }
  
  // 4. 제목 패턴 체크
  const hasEmoji = /[\u{1F300}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u.test(video.snippet.title);
  const isShortTitle = video.snippet.title.length < 50;
  
  if (hasEmoji && isShortTitle) {
    confidence += 0.1;
    reasons.push('Short title with emoji');
  }
  
  // 5. 매우 짧은 영상 (30초 이하)은 confidence 추가
  if (durationSeconds <= 30) {
    confidence += 0.1;
    reasons.push('Very short duration (≤ 30s)');
  }
  
  // 최종 판정 (60% 이상이면 Shorts)
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

export interface FormatDistribution {
  format: DominantFormat;
  distribution: {
    shorts: number;    // percentage
    longform: number;  // percentage
    live: number;      // percentage
  };
}

export function detectDominantFormat(videos: VideoData[]): FormatDistribution {
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
      // Live 스트리밍 감지
      if (
        title.includes('live') || 
        title.includes('라이브') || 
        title.includes('생방송') || 
        title.includes('스트리밍') ||
        title.includes('streaming') ||
        title.includes('방송')
      ) {
        counts.live++;
      } else {
        counts.longform++;
      }
    }
  }
  
  const total = videos.length;
  const distribution = {
    shorts: Math.round((counts.shorts / total) * 100),
    longform: Math.round((counts.longform / total) * 100),
    live: Math.round((counts.live / total) * 100),
  };
  
  // 지배적인 형식 판별
  let format: DominantFormat = 'mixed';
  
  if (distribution.shorts >= 50) {
    format = 'shorts';
  } else if (distribution.longform >= 50) {
    format = 'longform';
  } else if (distribution.live >= 50) {
    format = 'live';
  } else {
    // 가장 많은 형식을 선택
    const max = Math.max(counts.shorts, counts.longform, counts.live);
    if (max === counts.shorts && counts.shorts > 0) {
      format = 'shorts';
    } else if (max === counts.longform && counts.longform > 0) {
      format = 'longform';
    } else if (max === counts.live && counts.live > 0) {
      format = 'live';
    }
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
    return result;
  });
  
  await Promise.all(promises);
  
  return results;
}

/**
 * Shorts 판별 결과를 데이터베이스 형식으로 변환
 */
export interface ShortsDbRecord {
  video_id: string;
  channel_id: string;
  title: string;
  description: string;
  duration_seconds: number;
  is_shorts: boolean;
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  thumbnail_url: string | null;
  tags: string[];
}

export function videoToDbRecord(
  video: VideoData,
  channelId: string,
  publishedAt: string
): ShortsDbRecord {
  const shortsResult = detectShorts(video);
  const thumbnails = video.snippet.thumbnails;
  const thumbnailUrl = thumbnails?.high?.url || 
                      thumbnails?.medium?.url || 
                      thumbnails?.default?.url || 
                      null;
  
  return {
    video_id: video.id,
    channel_id: channelId,
    title: video.snippet.title,
    description: video.snippet.description,
    duration_seconds: shortsResult.duration,
    is_shorts: shortsResult.isShorts,
    published_at: publishedAt,
    view_count: parseInt(video.statistics?.viewCount || '0', 10),
    like_count: parseInt(video.statistics?.likeCount || '0', 10),
    comment_count: parseInt(video.statistics?.commentCount || '0', 10),
    thumbnail_url: thumbnailUrl,
    tags: [], // YouTube API v3에서 tags를 가져오려면 별도 요청 필요
  };
}

/**
 * 통계 생성
 */
export interface ShortsStats {
  totalVideos: number;
  totalShorts: number;
  shortsPercentage: number;
  averageDuration: number;
  dominantFormat: DominantFormat;
  distribution: FormatDistribution['distribution'];
}

export function calculateShortsStats(videos: VideoData[]): ShortsStats {
  const formatData = detectDominantFormat(videos);
  const shortsResults = videos.map(detectShorts);
  
  const totalShorts = shortsResults.filter(r => r.isShorts).length;
  const totalDuration = shortsResults.reduce((sum, r) => sum + r.duration, 0);
  
  return {
    totalVideos: videos.length,
    totalShorts,
    shortsPercentage: videos.length > 0 
      ? Math.round((totalShorts / videos.length) * 100) 
      : 0,
    averageDuration: videos.length > 0 
      ? Math.round(totalDuration / videos.length) 
      : 0,
    dominantFormat: formatData.format,
    distribution: formatData.distribution,
  };
}