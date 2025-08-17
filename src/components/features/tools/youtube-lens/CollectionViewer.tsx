'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiDelete, ApiError } from '@/lib/api-client';
import { X, ExternalLink, Plus, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';
import type { Collection, CollectionItem, Video } from '@/types/youtube-lens';

interface CollectionViewerProps {
  collectionId: string;
  collectionName: string;
  onClose?: () => void;
}

export default function CollectionViewer({ collectionId, collectionName, onClose }: CollectionViewerProps) {
  const [items, setItems] = useState<(CollectionItem & { video: Video })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [notes, setNotes] = useState('');

  // 컬렉션 비디오 목록 조회
  const fetchCollectionVideos = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ items: (CollectionItem & { video: Video })[] }>(
        `/api/youtube/collections/items?collectionId=${collectionId}`
      );
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching collection videos:', error);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionVideos();
  }, [collectionId]);

  // 컬렉션에서 비디오 제거
  const handleRemoveVideo = async (videoId: string) => {
    if (!confirm('이 비디오를 컬렉션에서 제거하시겠습니까?')) {
      return;
    }

    try {
      await apiDelete(
        `/api/youtube/collections/items?collectionId=${collectionId}&videoId=${videoId}`
      );
      toast.success('비디오가 제거되었습니다');
      setItems(items.filter(item => item.video_id !== videoId));
    } catch (error) {
      console.error('Error removing video:', error);
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
  const openInYouTube = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  // 비디오 상세 보기
  const viewVideoDetails = (video: Video) => {
    setSelectedVideo(video);
  };

  // 조회수 포맷팅
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return '오늘';
    if (diffDays < 2) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
  };

  // Duration 포맷팅
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
          <p className="text-muted-foreground">
            {items.length}개의 비디오가 저장되어 있습니다
          </p>
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
            <p className="text-muted-foreground">
              이 컬렉션에 YouTube 비디오를 추가해보세요
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video">
                {item.video.thumbnails && (
                  <Image
                    src={typeof item.video.thumbnails === 'string' 
                      ? JSON.parse(item.video.thumbnails)?.high?.url || ''
                      : (item.video.thumbnails as { high?: { url: string } })?.high?.url || ''}
                    alt={item.video.title}
                    fill
                    className="object-cover"
                  />
                )}
                {item.video.is_short && (
                  <Badge className="absolute top-2 left-2 bg-red-600">
                    Shorts
                  </Badge>
                )}
                {item.video.duration_seconds && (
                  <Badge variant="secondary" className="absolute bottom-2 right-2">
                    {formatDuration(item.video.duration_seconds)}
                  </Badge>
                )}
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm line-clamp-2">
                  {item.video.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {item.video.channel_id}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>조회수 {formatViewCount(0)}</span>
                  <span>{formatDate(item.video.published_at)}</span>
                </div>
                {item.notes && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <p className="text-xs">{item.notes}</p>
                  </div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
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
                    onClick={() => viewVideoDetails(item.video)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    상세
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => openInYouTube(item.video.video_id)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    YouTube
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveVideo(item.video_id)}
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
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
            <DialogDescription>
              비디오 상세 정보
            </DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video relative">
                {selectedVideo.thumbnails && (
                  <Image
                    src={typeof selectedVideo.thumbnails === 'string'
                      ? JSON.parse(selectedVideo.thumbnails)?.high?.url || ''
                      : (selectedVideo.thumbnails as { high?: { url: string } })?.high?.url || ''}
                    alt={selectedVideo.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {selectedVideo.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span>채널: {selectedVideo.channel_id}</span>
                  <span>게시일: {new Date(selectedVideo.published_at).toLocaleDateString()}</span>
                </div>
                {selectedVideo.tags && (
                  <div className="flex flex-wrap gap-1">
                    {selectedVideo.tags.map((tag, idx) => (
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
              onClick={() => selectedVideo && openInYouTube(selectedVideo.video_id)}
            >
              YouTube에서 보기
            </Button>
            <Button onClick={() => setSelectedVideo(null)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}