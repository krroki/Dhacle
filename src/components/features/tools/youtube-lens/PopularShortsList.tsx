'use client';

/**
 * PopularShortsList Component
 * Display popular YouTube Shorts with metrics
 * Phase 3: Core Features Implementation
 */

import {
  AlertCircle,
  Bookmark,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError, apiGet } from '@/lib/api-client';
import type { VideoWithStats } from '@/types';
import ApiKeySetup from './ApiKeySetup';

interface PopularShortsListProps {
  initialRegion?: string;
  initialPeriod?: string;
  onVideoSelect?: (video: VideoWithStats) => void;
}

export default function PopularShortsList({
  initialRegion = 'KR',
  initialPeriod = '7d',
  onVideoSelect,
}: PopularShortsListProps) {
  const [videos, set_videos] = useState<VideoWithStats[]>([]);
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);
  const [requires_api_key, set_requires_api_key] = useState(false);
  const [region, set_region] = useState(initialRegion);
  const [period, set_period] = useState(initialPeriod);
  const [selected_tier, set_selected_tier] = useState<string>('all');

  // Fetch popular shorts
  const fetch_popular_shorts = useCallback(async () => {
    set_loading(true);
    set_error(null);
    set_requires_api_key(false);

    try {
      const data = await apiGet<{
        success: boolean;
        data: {
          videos: VideoWithStats[];
        };
      }>(`/api/youtube/popular?region=${region}&period=${period}`);

      set_videos(data.data.videos || []);
    } catch (error) {
      if (error instanceof ApiError) {
        // Check if API key is required
        if (error.data && typeof error.data === 'object' && 'requiresApiKey' in error.data) {
          set_requires_api_key(true);
          return;
        }

        // Handle 401 errors - distinguish between auth and API key issues
        if (error.status === 401) {
          // Check the error message to determine the issue type
          const error_message = error.message?.toLowerCase() || '';
          const error_data = error.data as
            | { requiresApiKey?: boolean; error_code?: string; error?: string }
            | undefined;

          // If it contains "api key" related messages, it's an API key issue
          const is_api_key_error =
            error_data?.requiresApiKey ||
            error_data?.error_code === 'api_key_required' ||
            error_message.includes('api key') ||
            error_message.includes('api 키');

          if (is_api_key_error) {
            set_requires_api_key(true);
            set_error('YouTube API Key 설정이 필요합니다');
          } else {
            // Only redirect to login if it's truly an authentication issue
            // Check if we're actually logged in first
            const is_logged_in = document.cookie.includes('sb-');
            if (!is_logged_in) {
              window.location.href = '/auth/login?redirect=/tools/youtube-lens';
            } else {
              // User is logged in but getting 401 - might be a session issue
              set_error('세션이 만료되었습니다. 새로고침 후 다시 시도해주세요.');
            }
          }
          return;
        }
        set_error(error.message);
      } else {
        const error_message =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        set_error(error_message);
      }
    } finally {
      set_loading(false);
    }
  }, [region, period]);

  // Initial fetch
  useEffect(() => {
    fetch_popular_shorts();
  }, [fetch_popular_shorts]);

  // Format number with K/M suffix
  const format_number = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Format duration
  const format_duration = (duration: string): string => {
    const match = duration.match(/PT(\d+)S/);
    if (match && match[1]) {
      const seconds = Number.parseInt(match[1], 10);
      return `${seconds}s`;
    }
    return duration;
  };

  // Get tier badge color
  const get_tier_color = (score: number): string => {
    if (score >= 80) {
      return 'bg-red-500'; // Viral
    }
    if (score >= 60) {
      return 'bg-orange-500'; // Trending
    }
    if (score >= 40) {
      return 'bg-yellow-500'; // Growing
    }
    if (score >= 20) {
      return 'bg-green-500'; // Steady
    }
    return 'bg-gray-500'; // Low
  };

  // Get tier name
  const get_tier_name = (score: number): string => {
    if (score >= 80) {
      return '바이럴';
    }
    if (score >= 60) {
      return '트렌딩';
    }
    if (score >= 40) {
      return '성장중';
    }
    if (score >= 20) {
      return '안정적';
    }
    return '낮음';
  };

  // Filter videos by tier
  const filtered_videos =
    selected_tier === 'all'
      ? videos
      : videos.filter((video) => {
          const score = video.stats?.viralScore || 0;
          const tier_name = get_tier_name(score).toLowerCase();
          return tier_name === selected_tier;
        });

  // Export to CSV
  const export_to_csv = () => {
    const csv_content = [
      [
        'Title',
        'Channel',
        'Views',
        'Likes',
        'Comments',
        'VPH',
        'Engagement Rate',
        'Viral Score',
        'URL',
      ],
      ...filtered_videos.map((video) => [
        video.title,
        video.channel?.title || video.channel_id || '',
        video.stats?.view_count || 0,
        video.stats?.like_count || 0,
        video.stats?.comment_count || 0,
        video.stats?.viewsPerHour?.toFixed(2) || '0',
        video.stats?.engagementRate?.toFixed(2) || '0',
        video.stats?.viralScore?.toFixed(2) || '0',
        `https://youtube.com/watch?v=${video.video_id}`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv_content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popular-shorts-${region}-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Show API key setup if required
  if (requires_api_key) {
    return (
      <ApiKeySetup
        onSuccess={() => {
          set_requires_api_key(false);
          fetch_popular_shorts();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>인기 YouTube Shorts</CardTitle>
          <CardDescription>키워드 없이 트렌드 중인 짧은 동영상을 발견하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Region selector */}
            <Select value={region} onValueChange={set_region}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KR">🇰🇷 한국</SelectItem>
                <SelectItem value="US">🇺🇸 미국</SelectItem>
                <SelectItem value="JP">🇯🇵 일본</SelectItem>
                <SelectItem value="GB">🇬🇧 영국</SelectItem>
                <SelectItem value="FR">🇫🇷 프랑스</SelectItem>
                <SelectItem value="DE">🇩🇪 독일</SelectItem>
              </SelectContent>
            </Select>

            {/* Period selector */}
            <Select value={period} onValueChange={set_period}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">지난 24시간</SelectItem>
                <SelectItem value="7d">지난 7일</SelectItem>
                <SelectItem value="30d">지난 30일</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={fetch_popular_shorts} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={export_to_csv}
                disabled={filtered_videos.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV 내보내기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tiers */}
      <Tabs value={selected_tier} onValueChange={set_selected_tier}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">전체 ({videos.length})</TabsTrigger>
          <TabsTrigger value="viral">
            바이럴 ({videos.filter((v) => (v.stats?.viralScore || 0) >= 80).length})
          </TabsTrigger>
          <TabsTrigger value="trending">
            트렌딩 (
            {
              videos.filter((v) => {
                const score = v.stats?.viralScore || 0;
                return score >= 60 && score < 80;
              }).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="growing">
            성장중 (
            {
              videos.filter((v) => {
                const score = v.stats?.viralScore || 0;
                return score >= 40 && score < 60;
              }).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="steady">
            안정적 (
            {
              videos.filter((v) => {
                const score = v.stats?.viralScore || 0;
                return score >= 20 && score < 40;
              }).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="low">
            낮음 ({videos.filter((v) => (v.stats?.viralScore || 0) < 20).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selected_tier} className="mt-6">
          {/* Error state */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-40 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Videos grid */}
          {!loading && filtered_videos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered_videos.map((video) => (
                <Card
                  key={video.video_id || video.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onVideoSelect?.(video)}
                >
                  <CardContent className="p-4">
                    {/* Thumbnail */}
                    <div className="relative mb-3 w-full h-40">
                      {video.thumbnails?.medium?.url ? (
                        <Image
                          src={video.thumbnails.medium.url}
                          alt={video.title}
                          fill={true}
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <Badge
                        className={`absolute top-2 right-2 ${get_tier_color(video.stats?.viralScore || 0)} text-white`}
                      >
                        {get_tier_name(video.stats?.viralScore || 0)}
                      </Badge>
                      <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {format_duration(
                          video.durationSeconds ? `PT${video.durationSeconds}S` : 'PT0S'
                        )}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>

                    {/* Channel */}
                    <p className="text-xs text-muted-foreground mb-3">
                      {video.channel?.title || ''}
                    </p>

                    {/* Metrics */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {format_number(Number(video.stats?.view_count || 0))}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {format_number(Number(video.stats?.like_count || 0))}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {format_number(Number(video.stats?.comment_count || 0))}
                        </span>
                      </div>

                      {/* Advanced metrics */}
                      {video.stats && (
                        <div className="pt-2 border-t space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">시간당 조회수</span>
                            <span className="font-medium">
                              {format_number(video.stats.viewsPerHour ?? 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">참여율</span>
                            <span className="font-medium">
                              {video.stats.engagementRate?.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">바이럴 점수</span>
                            <span className="font-medium">
                              {video.stats.viralScore?.toFixed(0)}/100
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://youtube.com/watch?v=${video.video_id || video.id}`, '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        시청
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          // Save to collection
                          try {
                            const response = await fetch('/api/youtube/collections', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                videoId: video.video_id || video.id,
                                type: 'favorites'
                              })
                            });
                            if (response.ok) {
                              console.log('Saved to collection');
                            }
                          } catch (error) {
                            console.error('Failed to save:', error);
                          }
                        }}
                      >
                        <Bookmark className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered_videos.length === 0 && !error && (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">동영상을 찾을 수 없습니다</h3>
                <p className="text-muted-foreground">
                  필터를 조정하거나 새로고침하여 새 데이터를 가져오세요
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
