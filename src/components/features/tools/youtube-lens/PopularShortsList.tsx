'use client';

/**
 * PopularShortsList Component
 * Display popular YouTube Shorts with metrics
 * Phase 3: Core Features Implementation
 */

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { YouTubeVideo } from '@/types/youtube-lens';
import ApiKeySetup from './ApiKeySetup';
import { apiGet, ApiError } from '@/lib/api-client';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Clock, 
  RefreshCw,
  Download,
  Bookmark,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface PopularShortsListProps {
  initialRegion?: string;
  initialPeriod?: string;
  onVideoSelect?: (video: YouTubeVideo) => void;
}

export default function PopularShortsList({ 
  initialRegion = 'KR',
  initialPeriod = '7d',
  onVideoSelect 
}: PopularShortsListProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresApiKey, setRequiresApiKey] = useState(false);
  const [region, setRegion] = useState(initialRegion);
  const [period, setPeriod] = useState(initialPeriod);
  const [selectedTier, setSelectedTier] = useState<string>('all');

  // Fetch popular shorts
  const fetchPopularShorts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRequiresApiKey(false);

    try {
      const data = await apiGet<{
        success: boolean;
        data: {
          videos: YouTubeVideo[];
        };
      }>(`/api/youtube/popular?region=${region}&period=${period}`);
      
      setVideos(data.data.videos || []);
    } catch (err) {
      console.error('[PopularShortsList] Fetch error:', {
        error: err,
        region,
        period
      });

      if (err instanceof ApiError) {
        // Check if API key is required
        if (err.data && typeof err.data === 'object' && 'requiresApiKey' in err.data) {
          setRequiresApiKey(true);
          return;
        }

        // Handle 401 errors - distinguish between auth and API key issues
        if (err.status === 401) {
          // Check if it's an API key issue
          const errorData = err.data as { requiresApiKey?: boolean; errorCode?: string; error?: string } | undefined;
          const isApiKeyError = errorData?.requiresApiKey || 
                                errorData?.errorCode === 'api_key_required' ||
                                errorData?.error?.includes('API Key');
          
          if (isApiKeyError) {
            setRequiresApiKey(true);
            setError('YouTube API Key 설정이 필요합니다');
          } else {
            // Real authentication issue - redirect to login
            window.location.href = '/auth/login?redirect=/tools/youtube-lens';
          }
          return;
        } else {
          setError(err.message);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [region, period]);

  // Initial fetch
  useEffect(() => {
    fetchPopularShorts();
  }, [fetchPopularShorts]);

  // Format number with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Format duration
  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+)S/);
    if (match) {
      const seconds = parseInt(match[1]);
      return `${seconds}s`;
    }
    return duration;
  };

  // Get tier badge color
  const getTierColor = (score: number): string => {
    if (score >= 80) return 'bg-red-500'; // Viral
    if (score >= 60) return 'bg-orange-500'; // Trending
    if (score >= 40) return 'bg-yellow-500'; // Growing
    if (score >= 20) return 'bg-green-500'; // Steady
    return 'bg-gray-500'; // Low
  };

  // Get tier name
  const getTierName = (score: number): string => {
    if (score >= 80) return 'Viral';
    if (score >= 60) return 'Trending';
    if (score >= 40) return 'Growing';
    if (score >= 20) return 'Steady';
    return 'Low';
  };

  // Filter videos by tier
  const filteredVideos = selectedTier === 'all' 
    ? videos 
    : videos.filter(video => {
        const score = video.metrics?.viral_score || 0;
        const tierName = getTierName(score).toLowerCase();
        return tierName === selectedTier;
      });

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Title', 'Channel', 'Views', 'Likes', 'Comments', 'VPH', 'Engagement Rate', 'Viral Score', 'URL'],
      ...filteredVideos.map(video => [
        video.snippet.title,
        video.snippet.channelTitle,
        video.statistics.viewCount,
        video.statistics.likeCount,
        video.statistics.commentCount,
        video.metrics?.vph?.toFixed(2) || '0',
        video.metrics?.engagement_rate?.toFixed(2) || '0',
        video.metrics?.viral_score?.toFixed(2) || '0',
        `https://youtube.com/watch?v=${video.id}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popular-shorts-${region}-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Show API key setup if required
  if (requiresApiKey) {
    return (
      <ApiKeySetup 
        onSuccess={() => {
          setRequiresApiKey(false);
          fetchPopularShorts();
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Popular YouTube Shorts</CardTitle>
          <CardDescription>
            Discover trending short-form videos without keywords
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Region selector */}
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KR">🇰🇷 Korea</SelectItem>
                <SelectItem value="US">🇺🇸 United States</SelectItem>
                <SelectItem value="JP">🇯🇵 Japan</SelectItem>
                <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                <SelectItem value="FR">🇫🇷 France</SelectItem>
                <SelectItem value="DE">🇩🇪 Germany</SelectItem>
              </SelectContent>
            </Select>

            {/* Period selector */}
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex gap-2 ml-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchPopularShorts}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToCSV}
                disabled={filteredVideos.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tiers */}
      <Tabs value={selectedTier} onValueChange={setSelectedTier}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({videos.length})</TabsTrigger>
          <TabsTrigger value="viral">
            Viral ({videos.filter(v => (v.metrics?.viral_score || 0) >= 80).length})
          </TabsTrigger>
          <TabsTrigger value="trending">
            Trending ({videos.filter(v => {
              const score = v.metrics?.viral_score || 0;
              return score >= 60 && score < 80;
            }).length})
          </TabsTrigger>
          <TabsTrigger value="growing">
            Growing ({videos.filter(v => {
              const score = v.metrics?.viral_score || 0;
              return score >= 40 && score < 60;
            }).length})
          </TabsTrigger>
          <TabsTrigger value="steady">
            Steady ({videos.filter(v => {
              const score = v.metrics?.viral_score || 0;
              return score >= 20 && score < 40;
            }).length})
          </TabsTrigger>
          <TabsTrigger value="low">
            Low ({videos.filter(v => (v.metrics?.viral_score || 0) < 20).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTier} className="mt-6">
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
          {!loading && filteredVideos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onVideoSelect?.(video)}
                >
                  <CardContent className="p-4">
                    {/* Thumbnail */}
                    <div className="relative mb-3 w-full h-40">
                      <Image
                        src={video.snippet.thumbnails?.medium?.url || '/placeholder.jpg'}
                        alt={video.snippet.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${getTierColor(video.metrics?.viral_score || 0)} text-white`}
                      >
                        {getTierName(video.metrics?.viral_score || 0)}
                      </Badge>
                      <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(video.contentDetails.duration)}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {video.snippet.title}
                    </h3>

                    {/* Channel */}
                    <p className="text-xs text-muted-foreground mb-3">
                      {video.snippet.channelTitle}
                    </p>

                    {/* Metrics */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(video.statistics.viewCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(video.statistics.likeCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {formatNumber(video.statistics.commentCount)}
                        </span>
                      </div>

                      {/* Advanced metrics */}
                      {video.metrics && (
                        <div className="pt-2 border-t space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">VPH</span>
                            <span className="font-medium">
                              {formatNumber(video.metrics.vph || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Engagement</span>
                            <span className="font-medium">
                              {video.metrics.engagement_rate?.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Viral Score</span>
                            <span className="font-medium">
                              {video.metrics.viral_score?.toFixed(0)}/100
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
                          window.open(`https://youtube.com/watch?v=${video.id}`, '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Watch
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement save to collection
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
          {!loading && filteredVideos.length === 0 && !error && (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No videos found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or refresh to fetch new data
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}