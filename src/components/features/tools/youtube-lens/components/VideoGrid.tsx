'use client';

import {
  CheckSquare,
  Download,
  Grid3X3,
  LayoutGrid,
  List,
  Loader2,
  Search,
  Square,
} from 'lucide-react';
import { memo, useCallback, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { areEqual, FixedSizeGrid, FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useYouTubeLensStore } from '@/store/youtube-lens';
import type { FlattenedYouTubeVideo, YouTubeFavorite } from '@/types/youtube';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: FlattenedYouTubeVideo[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void>;
  onVideoSelect?: (video: FlattenedYouTubeVideo) => void;
  className?: string;
}

// 가상 스크롤 아이템 렌더러 - Grid View
const GridCell = memo(function GridCell({
  columnIndex,
  rowIndex,
  style,
  data,
}: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    videos: FlattenedYouTubeVideo[];
    columns: number;
    selectedVideos: Set<string>;
    favoriteVideos: Map<string, YouTubeFavorite>;
    onToggleSelect: (video_id: string) => void;
    onToggleFavorite: (video: FlattenedYouTubeVideo) => void;
    onPlay: (video: FlattenedYouTubeVideo) => void;
  };
}) {
  const index = rowIndex * data.columns + columnIndex;
  const video = data.videos[index];

  if (!video) {
    return null;
  }

  return (
    <div style={style} className="p-2">
      <VideoCard
        video={video}
        viewMode="grid"
        isSelected={data.selectedVideos.has(video.id)}
        isFavorite={data.favoriteVideos.has(video.id)}
        onSelect={data.onToggleSelect}
        onToggleFavorite={data.onToggleFavorite}
        onPlay={data.onPlay}
      />
    </div>
  );
}, areEqual);

// 가상 스크롤 아이템 렌더러 - List View
const ListRow = memo(function ListRow({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: {
    videos: FlattenedYouTubeVideo[];
    selectedVideos: Set<string>;
    favoriteVideos: Map<string, YouTubeFavorite>;
    onToggleSelect: (video_id: string) => void;
    onToggleFavorite: (video: FlattenedYouTubeVideo) => void;
    onPlay: (video: FlattenedYouTubeVideo) => void;
  };
}) {
  const video = data.videos[index];

  if (!video) {
    return null;
  }

  return (
    <div style={style} className="px-4 py-2">
      <VideoCard
        video={video}
        viewMode="list"
        isSelected={data.selectedVideos.has(video.id)}
        isFavorite={data.favoriteVideos.has(video.id)}
        onSelect={data.onToggleSelect}
        onToggleFavorite={data.onToggleFavorite}
        onPlay={data.onPlay}
      />
    </div>
  );
}, areEqual);

// 스켈레톤 로딩 카드
const SkeletonCard = ({ viewMode }: { viewMode: 'grid' | 'list' | 'compact' }) => {
  if (viewMode === 'grid') {
    return (
      <Card className="overflow-hidden">
        <div className="aspect-[9/16] bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="p-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-3">
            <Skeleton className="w-40 aspect-video flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-3 p-2">
      <Skeleton className="w-20 aspect-video flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  );
};

export function VideoGrid({
  videos,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onVideoSelect,
  className,
}: VideoGridProps) {
  const {
    selectedVideos,
    favoriteVideos,
    viewMode,
    setViewMode,
    toggleVideoSelection,
    selectAllVideos,
    clearSelectedVideos,
    addFavorite,
    removeFavorite,
  } = useYouTubeLensStore();

  const [sortBy, setSortBy] = useState<'date' | 'views' | 'likes'>('date');
  const infiniteLoaderRef = useRef<InfiniteLoader>(null);

  // 비디오 정렬
  const sortedVideos = [...videos].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.view_count - a.view_count;
      case 'likes':
        return b.like_count - a.like_count;
      default:
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    }
  });

  // 선택 토글
  const handleToggleSelect = useCallback(
    (video_id: string) => {
      toggleVideoSelection(video_id);
    },
    [toggleVideoSelection]
  );

  // 즐겨찾기 토글
  const handleToggleFavorite = useCallback(
    (video: FlattenedYouTubeVideo) => {
      if (favoriteVideos.has(video.id)) {
        removeFavorite(video.id);
      } else {
        addFavorite(video);
      }
    },
    [favoriteVideos, addFavorite, removeFavorite]
  );

  // 비디오 재생
  const handlePlay = useCallback(
    (video: FlattenedYouTubeVideo) => {
      onVideoSelect?.(video);
      // YouTube 플레이어 열기 또는 모달 표시
      window.open(`https://youtube.com/watch?v=${video.id}`, '_blank');
    },
    [onVideoSelect]
  );

  // 전체 선택 토글
  const handleToggleSelectAll = useCallback(() => {
    if (selectedVideos.size === videos.length) {
      clearSelectedVideos();
    } else {
      selectAllVideos();
    }
  }, [selectedVideos.size, videos.length, clearSelectedVideos, selectAllVideos]);

  // 선택된 비디오 다운로드
  const handleDownloadSelected = useCallback(() => {
    const selected = videos.filter((v) => selectedVideos.has(v.id));
    const data = JSON.stringify(selected, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-videos-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [videos, selectedVideos]);

  // 무한 스크롤 로드
  const loadMoreItems = useCallback(
    async (_startIndex: number, _stopIndex: number) => {
      if (onLoadMore && !isLoading) {
        await onLoadMore();
      }
    },
    [onLoadMore, isLoading]
  );

  // 아이템 로드 여부 확인
  const isItemLoaded = useCallback(
    (index: number) => !hasMore || index < videos.length,
    [hasMore, videos.length]
  );

  // 그리드 뷰 컬럼 계산
  const getColumnCount = (width: number) => {
    if (width < 640) {
      return 2;
    }
    if (width < 1024) {
      return 3;
    }
    if (width < 1280) {
      return 4;
    }
    return 5;
  };

  // 빈 상태
  if (!isLoading && videos.length === 0) {
    return (
      <Card className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
        <p className="text-muted-foreground text-center max-w-md">
          다른 검색어를 시도하거나 필터를 조정해보세요
        </p>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 툴바 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {/* 전체 선택 */}
          <Button variant="outline" size="sm" onClick={handleToggleSelectAll} className="gap-2">
            {selectedVideos.size === videos.length ? (
              <>
                <CheckSquare className="h-4 w-4" />
                전체 해제
              </>
            ) : (
              <>
                <Square className="h-4 w-4" />
                전체 선택
              </>
            )}
          </Button>

          {/* 선택된 항목 수 */}
          {selectedVideos.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selectedVideos.size}개 선택됨</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSelected}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                다운로드
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 정렬 */}
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as 'date' | 'views' | 'likes')}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">최신순</SelectItem>
              <SelectItem value="views">조회수순</SelectItem>
              <SelectItem value="likes">좋아요순</SelectItem>
            </SelectContent>
          </Select>

          {/* 뷰 모드 */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('compact')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 비디오 그리드 */}
      <div className="relative h-[600px]">
        {isLoading && videos.length === 0 ? (
          // 초기 로딩
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          // 가상 스크롤
          <AutoSizer>
            {({ height, width }) => {
              const itemData = {
                videos: sortedVideos,
                columns: viewMode === 'grid' ? getColumnCount(width) : 1,
                selectedVideos,
                favoriteVideos,
                onToggleSelect: handleToggleSelect,
                onToggleFavorite: handleToggleFavorite,
                onPlay: handlePlay,
              };

              if (viewMode === 'grid') {
                const columns = getColumnCount(width);
                const rowCount = Math.ceil(sortedVideos.length / columns);

                return (
                  <InfiniteLoader
                    ref={infiniteLoaderRef}
                    isItemLoaded={isItemLoaded}
                    itemCount={hasMore ? sortedVideos.length + 1 : sortedVideos.length}
                    loadMoreItems={loadMoreItems}
                  >
                    {({ onItemsRendered, ref }) => (
                      <FixedSizeGrid
                        ref={ref}
                        columnCount={columns}
                        columnWidth={width / columns}
                        height={height}
                        rowCount={rowCount}
                        rowHeight={400}
                        width={width}
                        itemData={itemData}
                        onItemsRendered={({
                          visibleRowStartIndex,
                          visibleRowStopIndex,
                          overscanRowStopIndex,
                          overscanRowStartIndex,
                        }) => {
                          onItemsRendered({
                            overscanStartIndex: overscanRowStartIndex * columns,
                            overscanStopIndex: overscanRowStopIndex * columns,
                            visibleStartIndex: visibleRowStartIndex * columns,
                            visibleStopIndex: visibleRowStopIndex * columns,
                          });
                        }}
                      >
                        {GridCell}
                      </FixedSizeGrid>
                    )}
                  </InfiniteLoader>
                );
              }
              const itemHeight = viewMode === 'list' ? 140 : 80;

              return (
                <InfiniteLoader
                  ref={infiniteLoaderRef}
                  isItemLoaded={isItemLoaded}
                  itemCount={hasMore ? sortedVideos.length + 1 : sortedVideos.length}
                  loadMoreItems={loadMoreItems}
                >
                  {({ onItemsRendered, ref }) => (
                    <FixedSizeList
                      ref={ref}
                      height={height}
                      itemCount={sortedVideos.length}
                      itemSize={itemHeight}
                      width={width}
                      itemData={itemData}
                      onItemsRendered={onItemsRendered}
                    >
                      {viewMode === 'list'
                        ? ListRow
                        : ({
                            index,
                            style,
                            data,
                          }: {
                            index: number;
                            style: React.CSSProperties;
                            data: typeof itemData;
                          }) => {
                            const video = data.videos[index];
                            if (!video) {
                              return null;
                            }

                            return (
                              <div style={style} className="px-4 py-1">
                                <VideoCard
                                  video={video}
                                  viewMode="compact"
                                  isSelected={data.selectedVideos.has(video.id)}
                                  isFavorite={data.favoriteVideos.has(video.id)}
                                  onSelect={data.onToggleSelect}
                                  onToggleFavorite={data.onToggleFavorite}
                                  onPlay={data.onPlay}
                                />
                              </div>
                            );
                          }}
                    </FixedSizeList>
                  )}
                </InfiniteLoader>
              );
            }}
          </AutoSizer>
        )}

        {/* 추가 로딩 표시 */}
        {isLoading && videos.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">더 불러오는 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}
