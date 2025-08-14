'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useYouTubeLensStore } from '@/store/youtube-lens';
import { 
  SearchBar, 
  VideoGrid, 
  QuotaStatus, 
  SetupGuide,
  EnvironmentChecker,
  YouTubeLensErrorBoundary 
} from '@/components/features/tools/youtube-lens';
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
  LogIn,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import type { YouTubeSearchFilters, FlattenedYouTubeVideo, YouTubeFavorite, QuotaStatus as QuotaStatusType } from '@/types/youtube';

// API 함수들
const checkConfig = async () => {
  const response = await fetch('/api/youtube/auth/check-config');
  if (!response.ok) throw new Error('Failed to check configuration');
  return response.json();
};

const fetchAuthStatus = async () => {
  const response = await fetch('/api/youtube/auth/status');
  if (!response.ok) throw new Error('Failed to fetch auth status');
  return response.json();
};

const searchVideos = async (filters: YouTubeSearchFilters) => {
  const response = await fetch('/api/youtube/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Search failed');
  }
  
  return response.json();
};

const fetchFavorites = async () => {
  const response = await fetch('/api/youtube/favorites');
  if (!response.ok) throw new Error('Failed to fetch favorites');
  return response.json();
};

const addFavorite = async (video: FlattenedYouTubeVideo) => {
  const response = await fetch('/api/youtube/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_id: video.id,
      video_data: video,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add favorite');
  }
  
  return response.json();
};

const removeFavorite = async (favoriteId: string) => {
  const response = await fetch(`/api/youtube/favorites/${favoriteId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove favorite');
  }
  
  return response.json();
};

function YouTubeLensContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
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

  const [activeTab, setActiveTab] = useState('search');
  const [isSearching, setIsSearching] = useState(false);

  // 환경 변수 설정 체크
  const { data: configCheck, isLoading: configLoading } = useQuery({
    queryKey: ['youtube-config-check'],
    queryFn: checkConfig,
    retry: 1,
  });

  // API Key 상태 쿼리
  const { data: authStatus, isLoading: authStatusLoading, refetch: refetchAuthStatus } = useQuery({
    queryKey: ['youtube-api-key-status'],
    queryFn: fetchApiKeyStatus,
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // 5분마다 갱신
  });

  // 즐겨찾기 쿼리
  const { data: favoritesData, refetch: refetchFavorites } = useQuery({
    queryKey: ['youtube-favorites'],
    queryFn: fetchFavorites,
    enabled: !!user && authStatus?.success && authStatus?.data,
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

  // 검색 실행
  const handleSearch = useCallback(async (query: string, filters: YouTubeSearchFilters) => {
    setIsSearching(true);
    setError(null);
    
    try {
      const result = await searchVideos(filters);
      
      if (result.success) {
        setVideos(result.data.items);
        setQuotaStatus(result.quota);
        toast.success(`${result.data.items.length}개의 영상을 찾았습니다`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '검색 실패';
      setError(message);
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  }, [setVideos, setQuotaStatus, setError]);

  // 할당량 새로고침
  const handleRefreshQuota = useCallback(async () => {
    await refetchAuthStatus();
  }, [refetchAuthStatus]);

  // 인증 체크
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/tools/youtube-lens');
    }
  }, [user, authLoading, router]);

  // URL 파라미터 처리 (OAuth 콜백)
  useEffect(() => {
    const auth = searchParams.get('auth');
    const error = searchParams.get('error');
    
    if (auth === 'success') {
      toast.success('Google 로그인에 성공했습니다');
      router.replace('/tools/youtube-lens');
    }
    
    if (error) {
      const messages: Record<string, string> = {
        'oauth_denied': 'Google 로그인이 취소되었습니다',
        'oauth_failed': 'Google 로그인에 실패했습니다',
        'auth_required': '로그인이 필요합니다',
        'security_error': '보안 오류가 발생했습니다',
        'config_missing': '환경 변수 설정이 필요합니다. 아래 가이드를 참고해주세요.',
        'oauth_init_failed': 'OAuth 초기화에 실패했습니다. 설정을 확인해주세요.',
        'unknown_error': '알 수 없는 오류가 발생했습니다'
      };
      toast.error(messages[error] || '알 수 없는 오류가 발생했습니다');
      router.replace('/tools/youtube-lens');
    }
  }, [searchParams, router]);

  // 즐겨찾기 데이터 로드
  useEffect(() => {
    if (favoritesData?.data) {
      loadFavorites(favoritesData.data);
    }
  }, [favoritesData, loadFavorites]);

  // 인증 상태 업데이트
  useEffect(() => {
    if (authStatus) {
      setQuotaStatus(authStatus.quota);
      if (authStatus.youtube?.authenticated) {
        setOAuthToken({
          access_token: 'authenticated',
          refresh_token: '',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: '',
        });
      }
    }
  }, [authStatus, setQuotaStatus, setOAuthToken]);

  // Google OAuth 로그인
  const handleGoogleLogin = () => {
    window.location.href = '/api/youtube/auth/login';
  };

  if (authLoading || configLoading) {
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

  // 환경 변수가 설정되지 않았을 때 설정 가이드 표시
  if (!configCheck?.configured) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* 환경 변수 체커 */}
          <EnvironmentChecker 
            autoCheck={true}
            onComplete={() => {
              // 설정 완료 시 페이지 새로고침
              window.location.reload();
            }}
          />
          
          {/* 설정 가이드 */}
          <SetupGuide missingVars={configCheck?.missingVars || []} />
        </div>
      </div>
    );
  }

  const isAuthenticated = authStatus?.youtube?.authenticated;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Youtube className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold">YouTube Lens</h1>
              <p className="text-muted-foreground">
                YouTube Shorts 영상 탐색 및 분석 도구
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <Button onClick={handleGoogleLogin} variant="default">
                <LogIn className="mr-2 h-4 w-4" />
                Google 로그인
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {authStatus?.youtube?.email}
                </Badge>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* API 할당량 표시 */}
        {authStatus?.quota && (
          <QuotaStatus 
            quotaStatus={authStatus.quota}
            onRefresh={handleRefreshQuota}
            compact
            className="mb-4"
          />
        )}

        {/* 인증 필요 경고 */}
        {!isAuthenticated && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Google 로그인이 필요합니다</AlertTitle>
            <AlertDescription>
              YouTube 영상을 검색하려면 Google 계정으로 로그인해주세요.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4" />
            검색
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="mr-2 h-4 w-4" />
            즐겨찾기 ({favoriteVideos.size})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            검색 기록
          </TabsTrigger>
        </TabsList>

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