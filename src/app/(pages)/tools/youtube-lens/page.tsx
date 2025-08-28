'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle,
  Folder,
  FolderOpen,
  Hash,
  Heart,
  History,
  Key,
  Search,
  Settings,
  TrendingUp,
  Youtube,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  QuotaStatus,
  SearchBar,
  VideoGrid,
  YouTubeLensErrorBoundary,
} from '@/components/features/tools/youtube-lens';
import AlertRules from '@/components/features/tools/youtube-lens/AlertRules';
import ChannelFolders from '@/components/features/tools/youtube-lens/ChannelFolders';
import CollectionBoard from '@/components/features/tools/youtube-lens/CollectionBoard';
import { DeltaDashboard } from '@/components/features/tools/youtube-lens/DeltaDashboard';
import { KeywordTrends } from '@/components/features/tools/youtube-lens/KeywordTrends';
import PopularShortsList from '@/components/features/tools/youtube-lens/PopularShortsList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiGet, apiPost } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/AuthContext';
import { useYouTubeLensStore } from '@/store/youtube-lens';
import type {
  EntityExtraction,
  FlattenedYouTubeVideo,
  QuotaStatus as QuotaStatusType,
  TrendAnalysis,
  YouTubeLensVideoStats as VideoStats,
  YouTubeFavorite,
  YouTubeSearchFilters,
} from '@/types';

// API 타입 정의
interface ApiKeyData {
  id: string;
  service_name: string;
  is_active: boolean;
  usageToday?: number;
  [key: string]: unknown;
}

interface ApiKeyStatusResponse {
  success: boolean;
  data?: ApiKeyData;
}

// API 함수들
const fetch_api_key_status = async () => {
  const data = await apiGet<ApiKeyStatusResponse>('/api/user/api-keys?service=youtube');

  // QuotaStatus 타입에 맞게 구성
  const used = data.data?.usageToday || 0;
  const limit = 10000;
  const remaining = limit - used;
  const percentage = (used / limit) * 100;

  return {
    success: data.success,
    hasApiKey: !!data.data,
    apiKeyData: data.data,
    quota: data.data
      ? {
          used,
          limit,
          remaining,
          percentage,
          resetTime: new Date(new Date().setHours(24, 0, 0, 0)), // 다음날 자정
          warning: percentage >= 80,
          critical: percentage >= 95,
          searchCount: 0,
          videoCount: 0,
        }
      : null,
  };
};

interface SearchResponse {
  success: boolean;
  data: {
    items: FlattenedYouTubeVideo[];
  };
  quota?: {
    used?: number;
    limit?: number;
    remaining?: number;
    searchCount?: number;
    videoCount?: number;
  };
  error?: string;
  errorCode?: string;
}

const search_videos = async (filters: YouTubeSearchFilters) => {
  const result = await apiPost<SearchResponse>('/api/youtube/search', filters);
  return result;
};

interface FavoritesResponse {
  success: boolean;
  data: YouTubeFavorite[];
}

const fetch_favorites = async () => {
  const result = await apiGet<FavoritesResponse>('/api/youtube/favorites');
  return result;
};

function YouTubeLensContent() {
  const router = useRouter();
  // const _searchParams = useSearchParams(); // Currently unused
  const { user, loading: auth_loading } = useAuth();

  const {
    videos,
    setVideos,
    setQuotaStatus,
    setOAuthToken: _setOAuthToken,
    setError,
    setLoading: _setLoading,
    searchHistory,
    favoriteVideos,
    loadFavorites,
  } = useYouTubeLensStore();

  const [active_tab, set_active_tab] = useState('dashboard');
  const [is_searching, set_is_searching] = useState(false);
  const [has_api_key, set_has_api_key] = useState(false);

  // API Key 상태 쿼리
  const {
    data: api_key_status,
    isLoading: api_key_loading,
    refetch: refetch_api_key_status,
  } = useQuery({
    queryKey: ['youtube-api-key-status'],
    queryFn: fetch_api_key_status,
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // 5분마다 갱신
  });

  // 메트릭 데이터 조회
  const {
    data: _metricsData,
    isLoading: _isLoadingMetrics,
    refetch: _refetchMetrics,
  } = useQuery({
    queryKey: ['youtube-metrics'],
    queryFn: async () => {
      const response = await apiGet<{
        success: boolean;
        data: {
          metrics: VideoStats[];
          trends: TrendAnalysis[];
          entities: EntityExtraction[];
        };
      }>('/api/youtube/metrics?type=video');
      return response.data;
    },
    enabled: !!user && !!api_key_status?.hasApiKey,
    refetchInterval: 5 * 60 * 1000, // 5분마다 갱신
  });

  // 즐겨찾기 쿼리
  const { data: favorites_data } = useQuery({
    queryKey: ['youtube-favorites'],
    queryFn: fetch_favorites,
    enabled: !!user && has_api_key,
  });

  // 검색 결과에서 할당량 업데이트
  const update_quota_from_search = useCallback(
    (result: {
      quota?: {
        used?: number;
        limit?: number;
        remaining?: number;
        searchCount?: number;
        videoCount?: number;
      };
    }) => {
      if (result?.quota) {
        const quota: QuotaStatusType = {
          used: result.quota.used || 0,
          limit: result.quota.limit || 10000,
          remaining: result.quota.remaining || 10000,
          percentage: ((result.quota.used || 0) / (result.quota.limit || 10000)) * 100,
          resetTime: new Date(new Date().setHours(24, 0, 0, 0)),
          warning: (result.quota.remaining || 0) < 2000,
          critical: (result.quota.remaining || 0) < 500,
          searchCount: (result.quota.searchCount || 0) + 1,
          videoCount: result.quota.videoCount || 0,
        };
        setQuotaStatus(quota);
      }
    },
    [setQuotaStatus]
  );

  // 검색 실행
  const handle_search = useCallback(
    async (_query: string, filters: YouTubeSearchFilters) => {
      if (!has_api_key) {
        toast.error('API Key를 먼저 등록해주세요');
        router.push('/settings/api-keys');
        return;
      }

      set_is_searching(true);
      setError(null);

      try {
        const result = await search_videos(filters);

        if (result.success) {
          setVideos(result.data.items);
          update_quota_from_search(result);
          toast.success(`${result.data.items.length}개의 영상을 찾았습니다`);
        } else if (result.errorCode === 'apiKeyRequired') {
          toast.error(result.error || 'API Key가 필요합니다');
          router.push('/settings/api-keys');
        } else {
          throw new Error(result.error || '검색 실패');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '검색 실패';
        setError(message);

        // API Key 관련 오류 처리
        if (message.includes('API Key') || message.includes('api_key')) {
          toast.error(message);
          const should_redirect = confirm(
            'API Key에 문제가 있습니다. 설정 페이지로 이동하시겠습니까?'
          );
          if (should_redirect) {
            router.push('/settings/api-keys');
          }
        } else {
          toast.error(message);
        }
      } finally {
        set_is_searching(false);
      }
    },
    [has_api_key, router, setVideos, update_quota_from_search, setError]
  );

  // 할당량 새로고침
  const handle_refresh_quota = useCallback(async () => {
    await refetch_api_key_status();
  }, [refetch_api_key_status]);

  // 인증 체크
  useEffect(() => {
    if (!auth_loading && !user) {
      router.push('/auth/login?redirect=/tools/youtube-lens');
    }
  }, [user, auth_loading, router]);

  // API Key 상태 업데이트
  useEffect(() => {
    if (api_key_status) {
      set_has_api_key(api_key_status.hasApiKey);
      if (api_key_status.quota) {
        setQuotaStatus(api_key_status.quota);
      }
    }
  }, [api_key_status, setQuotaStatus]);

  // 즐겨찾기 데이터 로드
  useEffect(() => {
    if (favorites_data?.data) {
      loadFavorites(favorites_data.data);
    }
  }, [favorites_data, loadFavorites]);

  // API Key 설정 페이지로 이동
  const handle_api_key_setup = () => {
    router.push('/settings/api-keys');
  };

  if (auth_loading || api_key_loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const is_authenticated = has_api_key;

  return (
    <div className="w-full px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8 bg-gradient-to-r from-yt-lens-primary/10 to-yt-lens-secondary/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yt-lens-secondary rounded-lg">
              <Youtube className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yt-lens-primary to-yt-lens-secondary bg-clip-text text-transparent">
                YouTube Lens
              </h1>
              <p className="text-muted-foreground mt-1">YouTube Shorts 영상 탐색 및 분석 도구</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!is_authenticated ? (
              <Button
                onClick={handle_api_key_setup}
                className="bg-yt-lens-primary hover:bg-yt-lens-primary-dark text-white"
              >
                <Key className="mr-2 h-4 w-4" />
                API Key 설정
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge className="gap-1 bg-yt-lens-accent/20 text-yt-lens-accent-dark border-yt-lens-accent">
                  <CheckCircle className="h-3 w-3" />
                  API Key 등록됨
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handle_api_key_setup}
                  title="API Key 설정"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* API 할당량 표시 */}
        {api_key_status?.quota && (
          <QuotaStatus
            quotaStatus={api_key_status.quota}
            onRefresh={handle_refresh_quota}
            compact={true}
            className="mb-4"
          />
        )}

        {/* API Key 필요 경고 */}
        {!is_authenticated && (
          <Alert className="mb-4 border-yt-lens-secondary bg-yt-lens-secondary/10">
            <AlertCircle className="h-4 w-4 text-yt-lens-secondary" />
            <AlertTitle className="text-yt-lens-secondary">
              YouTube API Key 설정이 필요합니다
            </AlertTitle>
            <AlertDescription>
              YouTube 영상을 검색하려면 API Key를 등록해주세요. 개인별로 일일 10,000 units를 무료로
              사용할 수 있습니다.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs value={active_tab} onValueChange={set_active_tab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-9 bg-gradient-to-r from-yt-lens-primary/5 to-yt-lens-secondary/5 p-1 overflow-x-auto">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            대시보드
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            인기 Shorts
          </TabsTrigger>
          <TabsTrigger
            value="keywords"
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <Hash className="mr-2 h-4 w-4" />
            트렌드 키워드
          </TabsTrigger>
          <TabsTrigger
            value="folders"
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <Folder className="mr-2 h-4 w-4" />
            채널 폴더
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <Bell className="mr-2 h-4 w-4" />
            알림 설정
          </TabsTrigger>
          <TabsTrigger
            value="collections"
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            컬렉션
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <Search className="mr-2 h-4 w-4" />
            검색
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <Heart className="mr-2 h-4 w-4" />
            즐겨찾기 ({favoriteVideos.size})
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <History className="mr-2 h-4 w-4" />
            검색 기록
          </TabsTrigger>
        </TabsList>

        {/* 대시보드 탭 */}
        <TabsContent value="dashboard" className="space-y-4">
          <DeltaDashboard />
        </TabsContent>

        {/* 인기 Shorts 탭 */}
        <TabsContent value="popular" className="space-y-4">
          <PopularShortsList />
        </TabsContent>

        {/* 트렌드 키워드 탭 */}
        <TabsContent value="keywords" className="space-y-4">
          <KeywordTrends />
        </TabsContent>

        {/* 채널 폴더 탭 */}
        <TabsContent value="folders" className="space-y-4">
          {user && <ChannelFolders />}
        </TabsContent>

        {/* 알림 설정 탭 */}
        <TabsContent value="alerts" className="space-y-4">
          <AlertRules />
        </TabsContent>

        {/* 컬렉션 탭 */}
        <TabsContent value="collections" className="space-y-4">
          <CollectionBoard />
        </TabsContent>

        {/* 검색 탭 */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>YouTube 영상 검색</CardTitle>
              <CardDescription>키워드를 입력하여 YouTube Shorts 영상을 검색하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <SearchBar
                onSearch={handle_search}
                isLoading={is_searching}
                disabled={!is_authenticated}
              />
              {!is_authenticated && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    YouTube 검색을 사용하려면 API Key 등록이 필요합니다.
                  </p>
                  <Button variant="outline" size="sm" onClick={handle_api_key_setup}>
                    <Key className="mr-2 h-4 w-4" />
                    API Key 등록하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 비디오 그리드 */}
          {(videos.length > 0 || is_searching) && (
            <VideoGrid
              videos={videos}
              isLoading={is_searching}
              hasMore={false}
              onVideoSelect={(video) => {
                // 비디오 선택 처리
                console.log('Selected video:', video);
              }}
            />
          )}
        </TabsContent>

        {/* 즐겨찾기 탭 */}
        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>즐겨찾기 영상</CardTitle>
              <CardDescription>저장한 YouTube 영상 목록입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteVideos.size > 0 ? (
                <VideoGrid
                  videos={Array.from(favoriteVideos.values()).map((f) => f.videoData)}
                  isLoading={false}
                  hasMore={false}
                />
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">아직 즐겨찾기한 영상이 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 검색 기록 탭 */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>검색 기록</CardTitle>
              <CardDescription>최근 검색한 키워드 목록입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.map((query, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">{query}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          set_active_tab('search');
                          // 검색 실행
                        }}
                      >
                        다시 검색
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">검색 기록이 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function YouTubeLensPage() {
  return (
    <YouTubeLensErrorBoundary>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>로딩 중...</p>
            </div>
          </div>
        }
      >
        <YouTubeLensContent />
      </Suspense>
    </YouTubeLensErrorBoundary>
  );
}
