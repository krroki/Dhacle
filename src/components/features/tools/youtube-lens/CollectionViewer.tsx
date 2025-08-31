'use client';

import { ExternalLink, Eye, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApiError, apiDelete, apiGet } from '@/lib/api-client';
import { mapVideo } from '@/lib/utils/type-mappers';
import type { CollectionItem, Video } from '@/types';

interface CollectionViewerProps {
  collection_id: string;
  collectionName: string;
  onClose?: () => void;
}

export default function CollectionViewer({
  collection_id,
  collectionName,
  onClose,
}: CollectionViewerProps) {
  const [items, set_items] = useState<(CollectionItem & { video: Video })[]>([]);
  const [loading, set_loading] = useState(true);
  const [selected_video, set_selected_video] = useState<Video | null>(null);
  const [_editingItem, _setEditingItem] = useState<CollectionItem | null>(null);
  const [_notes, _setNotes] = useState('');

  // 컬렉션 비디오 목록 조회
  const fetch_collection_videos = useCallback(async () => {
    set_loading(true);
    try {
      const data = await apiGet<{ items: (CollectionItem & { video: Video })[] }>(
        `/api/youtube/collections/items?collectionId=${collection_id}`
      );
      set_items(
        (data.items || []).map((item) => ({
          ...item,
          video: mapVideo(item.video),
        }))
      );
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          toast.error('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
        } else {
          toast.error(error.message || '비디오 목록을 불러오는데 실패했습니다');
        }
      } else {
        toast.error('비디오 목록을 불러오는데 실패했습니다');
      }
    } finally {
      set_loading(false);
    }
  }, [collection_id]);

  useEffect(() => {
    fetch_collection_videos();
  }, [fetch_collection_videos]);

  // 컬렉션에서 비디오 제거
  const handle_remove_video = async (video_id: string) => {
    if (!confirm('이 비디오를 컬렉션에서 제거하시겠습니까?')) {
      return;
    }

    try {
      await apiDelete(
        `/api/youtube/collections/items?collectionId=${collection_id}&video_id=${video_id}`
      );
      toast.success('비디오가 제거되었습니다');
      set_items(items.filter((item) => item.video_id !== video_id));
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          toast.error('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
        } else {
          toast.error(error.message || '비디오 제거에 실패했습니다');
        }
      } else {
        toast.error('비디오 제거에 실패했습니다');
      }
    }
  };

  // YouTube에서 열기
  const open_in_you_tube = (video_id: string) => {
    window.open(`https://www.youtube.com/watch?v=${video_id}`, '_blank');
  };

  // 비디오 상세 보기
  const view_video_details = (video: Video) => {
    set_selected_video(video);
  };

  // 조회수 포맷팅
  const format_view_count = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // 날짜 포맷팅
  const format_date = (date_string: string): string => {
    const date = new Date(date_string);
    const now = new Date();
    const diff_time = Math.abs(now.getTime() - date.getTime());
    const diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));

    if (diff_days < 1) {
      return '오늘';
    }
    if (diff_days < 2) {
      return '어제';
    }
    if (diff_days < 7) {
      return `${diff_days}일 전`;
    }
    if (diff_days < 30) {
      return `${Math.floor(diff_days / 7)}주 전`;
    }
    if (diff_days < 365) {
      return `${Math.floor(diff_days / 30)}개월 전`;
    }
    return `${Math.floor(diff_days / 365)}년 전`;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">비디오를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{collectionName}</h2>
          <p className="text-muted-foreground">{items.length}개의 비디오가 저장되어 있습니다</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 비디오 목록 */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">비디오가 없습니다</h3>
            <p className="text-muted-foreground">이 컬렉션에 YouTube 비디오를 추가해보세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video">
                {item.video.thumbnail_url && (
                  <Image
                    src={item.video.thumbnail_url}
                    alt={item.video.title}
                    fill={true}
                    className="object-cover"
                  />
                )}
                {item.video.duration && (
                  <Badge variant="secondary" className="absolute bottom-2 right-2">
                    {item.video.duration || '00:00'}
                  </Badge>
                )}
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm line-clamp-2">{item.video.title}</CardTitle>
                <CardDescription className="text-xs">{item.video.channel_id}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>조회수 {format_view_count(0)}</span>
                  <span>{item.video.published_at ? format_date(item.video.published_at) : '날짜 없음'}</span>
                </div>
                {item.notes && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <p className="text-xs">{item.notes}</p>
                  </div>
                )}
                {item.video.tags && item.video.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.video.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex gap-1 w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => view_video_details(item.video)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    상세
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => open_in_you_tube(item.video.id)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    YouTube
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handle_remove_video(item.video_id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* 비디오 상세 다이얼로그 */}
      <Dialog open={!!selected_video} onOpenChange={(open) => !open && set_selected_video(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selected_video?.title}</DialogTitle>
            <DialogDescription>비디오 상세 정보</DialogDescription>
          </DialogHeader>
          {selected_video && (
            <div className="space-y-4">
              <div className="aspect-video relative">
                {selected_video.thumbnail_url && (
                  <Image
                    src={selected_video.thumbnail_url}
                    alt={selected_video.title}
                    fill={true}
                    className="object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{selected_video.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span>채널: {selected_video.channel_id}</span>
                  <span>게시일: {selected_video.published_at ? new Date(selected_video.published_at).toLocaleDateString() : '날짜 없음'}</span>
                </div>
                {selected_video.tags && (
                  <div className="flex flex-wrap gap-1">
                    {selected_video.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selected_video && open_in_you_tube(selected_video.id)}
            >
              YouTube에서 보기
            </Button>
            <Button onClick={() => set_selected_video(null)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
