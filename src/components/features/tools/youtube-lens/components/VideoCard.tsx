'use client';

import {
  Calendar,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Heart,
  MessageSquare,
  MoreVertical,
  Play,
  Share2,
  ThumbsUp,
} from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { FlattenedYouTubeVideo } from '@/types';

interface VideoCardProps {
  video: FlattenedYouTubeVideo;
  viewMode?: 'grid' | 'list' | 'compact';
  isSelected?: boolean;
  isFavorite?: boolean;
  onSelect?: (video_id: string) => void;
  onToggleFavorite?: (video: FlattenedYouTubeVideo) => void;
  onPlay?: (video: FlattenedYouTubeVideo) => void;
  className?: string;
}

// 시간 포맷팅 함수 (초 단위를 시간 형태로 변환)
function formatDuration(seconds: number): string {
  if (!seconds) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// 조회수 포맷팅 함수
function formatViewCount(count: number): string {
  if (count >= 1000000000) {
    return `${(count / 1000000000).toFixed(1)}B`;
  }
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// 날짜 포맷팅 함수
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return '오늘';
  }
  if (days === 1) {
    return '어제';
  }
  if (days < 7) {
    return `${days}일 전`;
  }
  if (days < 30) {
    return `${Math.floor(days / 7)}주 전`;
  }
  if (days < 365) {
    return `${Math.floor(days / 30)}개월 전`;
  }
  return `${Math.floor(days / 365)}년 전`;
}

export const VideoCard = memo(function VideoCard({
  video,
  viewMode = 'grid',
  isSelected = false,
  isFavorite = false,
  onSelect,
  onToggleFavorite,
  onPlay,
  className,
}: VideoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect?.(video.id);
    },
    [video.id, onSelect]
  );

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite?.(video);
    },
    [video, onToggleFavorite]
  );

  const handlePlay = useCallback(() => {
    onPlay?.(video);
  }, [video, onPlay]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(`https://youtube.com/watch?v=${video.id}`);
  }, [video.id]);

  const handleOpenInYouTube = useCallback(() => {
    window.open(`https://youtube.com/watch?v=${video.id}`, '_blank');
  }, [video.id]);

  // Grid View
  if (viewMode === 'grid') {
    return (
      <Card
        className={cn(
          'group relative overflow-hidden transition-all duration-200 hover:shadow-lg',
          isSelected && 'ring-2 ring-primary',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePlay}
      >
        {/* 썸네일 영역 */}
        <div className="relative aspect-[9/16] overflow-hidden bg-muted">
          {/* 선택 체크박스 */}
          {onSelect && (
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(video.id)}
                onClick={handleSelect}
                className="bg-background/80 backdrop-blur-sm"
              />
            </div>
          )}

          {/* 즐겨찾기 버튼 */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-2 right-2 z-10 h-8 w-8',
                'bg-background/80 backdrop-blur-sm hover:bg-background/90',
                isFavorite && 'text-red-500'
              )}
              onClick={handleToggleFavorite}
            >
              <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
            </Button>
          )}

          {/* 재생시간 */}
          <div className="absolute bottom-2 right-2 z-10">
            <Badge variant="secondary" className="bg-black/80 text-white">
              {formatDuration(video.duration)}
            </Badge>
          </div>

          {/* 호버시 재생 버튼 */}
          {isHovered && (
            <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/40 transition-opacity">
              <div className="rounded-full bg-white/90 p-3">
                <Play className="h-8 w-8 text-black fill-current" />
              </div>
            </div>
          )}

          {/* 썸네일 이미지 */}
          {!imageError ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill={true}
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              onError={() => setImageError(true)}
              priority={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <Youtube className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* 비디오 정보 */}
        <CardContent className="p-3 space-y-2">
          <h3 className="font-medium line-clamp-2 text-sm">{video.title}</h3>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{video.channel_title}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{formatViewCount(video.view_count)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(video.published_at)}</span>
            </div>
          </div>

          {/* 통계 정보 */}
          {(video.like_count > 0 || video.comment_count > 0) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
              {video.like_count > 0 && (
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  <span>{formatViewCount(video.like_count)}</span>
                </div>
              )}
              {video.comment_count > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{formatViewCount(video.comment_count)}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // List View
  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          'group overflow-hidden transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-2 ring-primary',
          className
        )}
        onClick={handlePlay}
      >
        <CardContent className="p-3">
          <div className="flex gap-3">
            {/* 선택 체크박스 */}
            {onSelect && (
              <div className="flex items-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onSelect(video.id)}
                  onClick={handleSelect}
                />
              </div>
            )}

            {/* 썸네일 */}
            <div className="relative w-40 aspect-video flex-shrink-0 overflow-hidden rounded-md bg-muted">
              {!imageError ? (
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill={true}
                  className="object-cover"
                  sizes="160px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Youtube className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <Badge
                variant="secondary"
                className="absolute bottom-1 right-1 bg-black/80 text-white text-xs"
              >
                {formatDuration(video.duration)}
              </Badge>
            </div>

            {/* 비디오 정보 */}
            <div className="flex-1 space-y-1">
              <h3 className="font-medium line-clamp-2">{video.title}</h3>
              <p className="text-sm text-muted-foreground">{video.channel_title}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatViewCount(video.view_count)} 조회수</span>
                <span>{formatDate(video.published_at)}</span>
                {video.like_count > 0 && <span>좋아요 {formatViewCount(video.like_count)}</span>}
              </div>

              {/* 설명 미리보기 */}
              {video.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                  {video.description}
                </p>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={cn(isFavorite && 'text-red-500')}
                >
                  <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild={true}>
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleOpenInYouTube}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    YouTube에서 보기
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    링크 복사
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    공유하기
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    정보 다운로드
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact View
  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer',
        isSelected && 'bg-accent ring-2 ring-primary',
        className
      )}
      onClick={handlePlay}
    >
      {/* 선택 체크박스 */}
      {onSelect && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(video.id)}
          onClick={handleSelect}
        />
      )}

      {/* 썸네일 */}
      <div className="relative w-20 aspect-video flex-shrink-0 overflow-hidden rounded bg-muted">
        {!imageError ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill={true}
            className="object-cover"
            sizes="80px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Youtube className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{video.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {video.channel_title} • {formatViewCount(video.view_count)} •{' '}
          {formatDate(video.published_at)}
        </p>
      </div>

      {/* 재생시간 & 액션 */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {formatDuration(video.duration)}
        </Badge>
        {onToggleFavorite && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleFavorite}>
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current text-red-500')} />
          </Button>
        )}
      </div>
    </div>
  );
});

// YouTube import 추가
const Youtube = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
