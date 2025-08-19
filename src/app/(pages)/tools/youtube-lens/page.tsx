'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useYouTubeLensStore } from '@/store/youtube-lens';
import { 
  SearchBar, 
  VideoGrid, 
  QuotaStatus, 
  YouTubeLensErrorBoundary,
  MetricsDashboard 
} from '@/components/features/tools/youtube-lens';
import PopularShortsList from '@/components/features/tools/youtube-lens/PopularShortsList';
import ChannelFolders from '@/components/features/tools/youtube-lens/ChannelFolders';
import AlertRules from '@/components/features/tools/youtube-lens/AlertRules';
import CollectionBoard from '@/components/features/tools/youtube-lens/CollectionBoard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Youtube, 
  Settings, 
  Heart, 
  History,
  AlertCircle,
  Key,
  CheckCircle,
  TrendingUp,
  Folder,
  Bell,
  FolderOpen,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import type { YouTubeSearchFilters, FlattenedYouTubeVideo, QuotaStatus as QuotaStatusType, YouTubeFavorite } from '@/types/youtube';
import type { VideoStats, TrendAnalysis, EntityExtraction } from '@/types/youtube-lens';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';

// API 타입 정의
interface ApiKeyData {
  id: string;
  service_name: string;
  is_active: boolean;
  usage_today?: number;
  [key: string]: unknown;
}

interface ApiKeyStatusResponse {
  success: boolean;
  data?: ApiKeyData;
}

// API 함수들
const fetchApiKeyStatus = async () => {
  try {
    const data = await apiGet<ApiKeyStatusResponse>('/api/user/api-keys?service=youtube');
    
    // QuotaStatus 타입에 맞게 구성
    const used = data.data?.usage_today || 0;
    const limit = 10000;
    const remaining = limit - used;
    const percentage = (used / limit) * 100;
    
    return {
      success: data.success,
      hasApiKey: !!data.data,
      apiKeyData: data.data,
      quota: data.data ? {
        used,
        limit,
        remaining,
        percentage,
        resetTime: new Date(new Date().setHours(24, 0, 0, 0)), // 다음날 자정
        warning: percentage >= 80,
        critical: percentage >= 95,
        searchCount: 0,
        videoCount: 0
      } : null
    };
  } catch (error) {
    console.error('API Key status fetch error:', error);
    throw error;
  }
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

const searchVideos = async (filters: YouTubeSearchFilters) => {
  try {
    const result = await apiPost<SearchResponse>('/api/youtube/search', filters);
    return result;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

interface FavoritesResponse {
  success: boolean;
  data: YouTubeFavorite[];
}

interface AddFavoriteResponse {
  success: boolean;
  data: YouTubeFavorite;
}

const fetchFavorites = async () => {
  try {
    const result = await apiGet<FavoritesResponse>('/api/youtube/favorites');
    return result;
  } catch (error) {
    console.error('Favorites fetch error:', error);
    throw error;
  }
};

const addFavorite = async (video: FlattenedYouTubeVideo) => {
  try {
    const result = await apiPost<AddFavoriteResponse>('/api/youtube/favorites', {
      video_id: video.id,
      video_data: video,
    });
    return result;
  } catch (error) {
    console.error('Add favorite error:', error);
    throw error;
  }
};

const removeFavorite = async (favoriteId: string) => {
  try {
    const result = await apiDelete<{ success: boolean }>(`/api/youtube/favorites/${favoriteId}`);
    return result;
  } catch (error) {
    console.error('Remove favorite error:', error);
    throw error;
  }
};

function YouTubeLensContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const { 
    videos,
    setVideos,
    setQuotaStatus,
    setOAuthToken,
    setError,
    setLoading,
    searchHistory,
    favoriteVideos,
    loadFavorites
  } = useYouTubeLensStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearching, setIsSearching] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // API Key 상태 쿼리
  const { data: apiKeyStatus, isLoading: apiKeyLoading, refetch: refetchApiKeyStatus } = useQuery({
    queryKey: ['youtube-api-key-status'],
    queryFn: fetchApiKeyStatus,
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // 5분마다 갱신
  });

  // 메트릭 데이터 조회
  const { data: metricsData, isLoading: isLoadingMetrics, refetch: refetchMetrics } = useQuery({
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
    enabled: !!user && !!apiKeyStatus?.hasApiKey,
    refetchInterval: 5 * 60 * 1000, // 5분마다 갱신
  });

  // 즐겨찾기 쿼리
  const { data: favoritesData, refetch: refetchFavorites } = useQuery({
    queryKey: ['youtube-favorites'],
    queryFn: fetchFavorites,
    enabled: !!user && hasApiKey,
  });

  // 즐겨찾기 추가 뮤테이션
  const addFavoriteMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => {
      toast.success('즐겨찾기에 추가되었습니다');
      refetchFavorites();
    },
    onError: (error: Error) => {
      toast.error(error.message || '즐겨찾기 추가 실패');
    },
  });

  // 즐겨찾기 제거 뮤테이션
  const removeFavoriteMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      toast.success('즐겨찾기에서 제거되었습니다');
      refetchFavorites();
    },
    onError: (error: Error) => {
      toast.error(error.message || '즐겨찾기 제거 실패');
    },
  });

  // 검색 결과에서 할당량 업데이트
  const updateQuotaFromSearch = useCallback((result: { quota?: { used?: number; limit?: number; remaining?: number; searchCount?: number; videoCount?: number } }) => {
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
        videoCount: result.quota.videoCount || 0
      };
      setQuotaStatus(quota);
    }
  }, [setQuotaStatus]);

  // 검색 실행
  const handleSearch = useCallback(async (query: string, filters: YouTubeSearchFilters) => {
    if (!hasApiKey) {
      toast.error('API Key를 먼저 등록해주세요');
      router.push('/settings/api-keys');
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const result = await searchVideos(filters);
      
      if (result.success) {
        setVideos(result.data.items);
        updateQuotaFromSearch(result);
        toast.success(`${result.data.items.length}개의 영상을 찾았습니다`);
      } else if (result.errorCode === 'api_key_required') {
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
        const shouldRedirect = confirm('API Key에 문제가 있습니다. 설정 페이지로 이동하시겠습니까?');
        if (shouldRedirect) {
          router.push('/settings/api-keys');
        }
      } else {
        toast.error(message);
      }
    } finally {
      setIsSearching(false);
    }
  }, [hasApiKey, router, setVideos, updateQuotaFromSearch, setError]);

  // 할당량 새로고침
  const handleRefreshQuota = useCallback(async () => {
    await refetchApiKeyStatus();
  }, [refetchApiKeyStatus]);

  // 인증 체크
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/tools/youtube-lens');
    }
  }, [user, authLoading, router]);

  // API Key 상태 업데이트
  useEffect(() => {
    if (apiKeyStatus) {
      setHasApiKey(apiKeyStatus.hasApiKey);
      if (apiKeyStatus.quota) {
        setQuotaStatus(apiKeyStatus.quota);
      }
    }
  }, [apiKeyStatus, setQuotaStatus]);

  // 즐겨찾기 데이터 로드
  useEffect(() => {
    if (favoritesData?.data) {
      loadFavorites(favoritesData.data);
    }
  }, [favoritesData, loadFavorites]);

  // API Key 설정 페이지로 이동
  const handleApiKeySetup = () => {
    router.push('/settings/api-keys');
  };

  if (authLoading || apiKeyLoading) {
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

  const isAuthenticated = hasApiKey;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              <p className="text-muted-foreground mt-1">
                YouTube Shorts 영상 탐색 및 분석 도구
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <Button onClick={handleApiKeySetup} className="bg-yt-lens-primary hover:bg-yt-lens-primary-dark text-white">
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
                  onClick={handleApiKeySetup}
                  title="API Key 설정"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* API 할당량 표시 */}
        {apiKeyStatus?.quota && (
          <QuotaStatus 
            quotaStatus={apiKeyStatus.quota}
            onRefresh={handleRefreshQuota}
            compact
            className="mb-4"
          />
        )}

        {/* API Key 필요 경고 */}
        {!isAuthenticated && (
          <Alert className="mb-4 border-yt-lens-secondary bg-yt-lens-secondary/10">
            <AlertCircle className="h-4 w-4 text-yt-lens-secondary" />
            <AlertTitle className="text-yt-lens-secondary">YouTube API Key 설정이 필요합니다</AlertTitle>
            <AlertDescription>
              YouTube 영상을 검색하려면 API Key를 등록해주세요. 개인별로 일일 10,000 units를 무료로 사용할 수 있습니다.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8 bg-gradient-to-r from-yt-lens-primary/5 to-yt-lens-secondary/5 p-1">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white">
            <BarChart3 className="mr-2 h-4 w-4" />
            대시보드
          </TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white">
            <TrendingUp className="mr-2 h-4 w-4" />
            인기 Shorts
          </TabsTrigger>
          <TabsTrigger value="folders" className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white">
            <Folder className="mr-2 h-4 w-4" />
            채널 폴더
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white">
            <Bell className="mr-2 h-4 w-4" />
            알림 설정
          </TabsTrigger>
          <TabsTrigger value="collections" className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white">
            <FolderOpen className="mr-2 h-4 w-4" />
            컬렉션
          </TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white">
            <Search className="mr-2 h-4 w-4" />
            검색
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white">
            <Heart className="mr-2 h-4 w-4" />
            즐겨찾기 ({favoriteVideos.size})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white">
            <History className="mr-2 h-4 w-4" />
            검색 기록
          </TabsTrigger>
        </TabsList>

        {/* 대시보드 탭 */}
        <TabsContent value="dashboard" className="space-y-4">
          <MetricsDashboard 
            metrics={metricsData?.metrics}
            trends={metricsData?.trends}
            entities={metricsData?.entities}
            onRefresh={() => refetchMetrics()}
            isLoading={isLoadingMetrics}
          />
        </TabsContent>

        {/* 인기 Shorts 탭 */}
        <TabsContent value="popular" className="space-y-4">
          <PopularShortsList />
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
              <CardDescription>
                키워드를 입력하여 YouTube Shorts 영상을 검색하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchBar
                onSearch={handleSearch}
                isLoading={isSearching}
                disabled={!isAuthenticated}
              />
              {!isAuthenticated && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    YouTube 검색을 사용하려면 API Key 등록이 필요합니다.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleApiKeySetup}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    API Key 등록하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 비디오 그리드 */}
          {(videos.length > 0 || isSearching) && (
            <VideoGrid
              videos={videos}
              isLoading={isSearching}
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
              <CardDescription>
                저장한 YouTube 영상 목록입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteVideos.size > 0 ? (
                <VideoGrid
                  videos={Array.from(favoriteVideos.values()).map(f => f.video_data)}
                  isLoading={false}
                  hasMore={false}
                />
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    아직 즐겨찾기한 영상이 없습니다
                  </p>
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
              <CardDescription>
                최근 검색한 키워드 목록입니다
              </CardDescription>
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
                          setActiveTab('search');
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
                  <p className="text-muted-foreground">
                    검색 기록이 없습니다
                  </p>
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
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>로딩 중...</p>
          </div>
        </div>
      }>
        <YouTubeLensContent />
      </Suspense>
    </YouTubeLensErrorBoundary>
  );
}