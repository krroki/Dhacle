'use client';

import { Edit2, Folder, Globe, Lock, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api-client';
import { mapCollection } from '@/lib/utils/type-mappers';
import type { Collection } from '@/types';

export default function CollectionBoard() {
  const [collections, set_collections] = useState<Collection[]>([]);
  const [loading, set_loading] = useState(true);
  const [is_create_dialog_open, set_is_create_dialog_open] = useState(false);
  const [editing_collection, set_editing_collection] = useState<Collection | null>(null);
  const [form_data, set_form_data] = useState({
    name: '',
    description: '',
    is_public: false,
    tags: '',
  });

  // 컬렉션 목록 조회
  const fetch_collections = useCallback(async () => {
    set_loading(true);
    try {
      const data = await apiGet<{ collections?: Collection[] }>('/api/youtube/collections');

      console.log('[CollectionBoard] API Response:', data);
      const mapped_collections = (data.collections || []).map((col) => mapCollection(col as any)) as Collection[];
      set_collections(mapped_collections);
    } catch (error) {
      // Handle 401 errors - distinguish between auth and API key issues
      if (error && typeof error === 'object' && 'status' in error) {
        const error_with_status = error as {
          status: number;
          data?: { requiresApiKey?: boolean; error_code?: string; error?: string };
        };
        if (error_with_status.status === 401) {
          // Check if it's an API key issue
          const error_message = (error_with_status.data?.error || '').toLowerCase();
          const is_api_key_error =
            error_with_status.data?.requiresApiKey ||
            error_with_status.data?.error_code === 'api_key_required' ||
            error_message.includes('api key') ||
            error_message.includes('api 키');

          if (is_api_key_error) {
            toast.error('YouTube API Key 설정이 필요합니다');
          } else {
            // Only redirect to login if truly not authenticated
            const is_logged_in = document.cookie.includes('sb-');
            if (!is_logged_in) {
              window.location.href = '/auth/login?redirect=/tools/youtube-lens';
            } else {
              toast.error('세션이 만료되었습니다. 새로고침 후 다시 시도해주세요.');
            }
          }
          return;
        }
        // Handle 400 errors for API key issues
        if (error_with_status.status === 400) {
          const data = error_with_status.data;
          if (data?.requiresApiKey || data?.error_code === 'api_key_required') {
            toast.error(
              'YouTube API Key 설정이 필요합니다. 설정 페이지에서 API Key를 등록해주세요.'
            );
            return;
          }
        }
      }

      const error_message =
        error instanceof Error ? error.message : '컬렉션 목록을 불러오는데 실패했습니다';
      toast.error(error_message);
    } finally {
      set_loading(false);
    }
  }, []);

  useEffect(() => {
    fetch_collections();
  }, [fetch_collections]);

  // 새 컬렉션 생성
  const handle_create_collection = async () => {
    if (!form_data.name.trim()) {
      toast.error('컬렉션 이름을 입력해주세요');
      return;
    }

    try {
      const data = await apiPost<{ collection: Collection }>('/api/youtube/collections', {
        name: form_data.name,
        description: form_data.description,
        is_public: form_data.is_public,
        tags: form_data.tags ? form_data.tags.split(',').map((tag) => tag.trim()) : [],
      });

      console.log('[CollectionBoard] Create response:', data);
      toast.success('컬렉션이 생성되었습니다');
      set_collections([mapCollection(data.collection), ...collections]);
      set_is_create_dialog_open(false);
      reset_form();
    } catch (error) {
      console.error('Component error:', error);
      toast.error('컬렉션 생성에 실패했습니다');
    }
  };

  // 컬렉션 업데이트
  const handle_update_collection = async () => {
    if (!editing_collection || !form_data.name.trim()) {
      toast.error('컬렉션 이름을 입력해주세요');
      return;
    }

    try {
      const data = await apiPut<{ collection: Collection }>('/api/youtube/collections', {
        id: editing_collection!.id,
        name: form_data.name,
        description: form_data.description,
        is_public: form_data.is_public,
        tags: form_data.tags ? form_data.tags.split(',').map((tag) => tag.trim()) : [],
      });

      toast.success('컬렉션이 업데이트되었습니다');
      set_collections(
        collections.map((c) =>
          c.id === editing_collection!.id ? mapCollection(data.collection) : c
        )
      );
      set_editing_collection(null);
      reset_form();
    } catch (error) {
      console.error('Component error:', error);
      toast.error('컬렉션 업데이트에 실패했습니다');
    }
  };

  // 컬렉션 삭제
  const handle_delete_collection = async (collection_id: string) => {
    if (!confirm('정말로 이 컬렉션을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiDelete(`/api/youtube/collections?id=${collection_id}`);

      toast.success('컬렉션이 삭제되었습니다');
      set_collections(collections.filter((c) => c.id !== collection_id));
    } catch (error) {
      console.error('Component error:', error);
      toast.error('컬렉션 삭제에 실패했습니다');
    }
  };

  // 편집 시작
  const start_edit = (collection: Collection) => {
    set_editing_collection(collection);
    set_form_data({
      name: collection.name,
      description: collection.description || '',
      is_public: collection.is_public ?? false,
      tags: collection.tags?.join(', ') || '',
    });
  };

  // 폼 초기화
  const reset_form = () => {
    set_form_data({
      name: '',
      description: '',
      is_public: false,
      tags: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">컬렉션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">내 컬렉션</h2>
          <p className="text-muted-foreground">관심있는 YouTube 동영상을 컬렉션으로 관리하세요</p>
        </div>
        <Dialog open={is_create_dialog_open} onOpenChange={set_is_create_dialog_open}>
          <DialogTrigger asChild={true}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />새 컬렉션
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 컬렉션 만들기</DialogTitle>
              <DialogDescription>
                YouTube 동영상을 저장할 새 컬렉션을 만들어보세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">컬렉션 이름</Label>
                <Input
                  id="name"
                  value={form_data.name}
                  onChange={(e) => set_form_data({ ...form_data, name: e.target.value })}
                  placeholder="예: 마케팅 참고 영상"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명 (선택)</Label>
                <Textarea
                  id="description"
                  value={form_data.description}
                  onChange={(e) => set_form_data({ ...form_data, description: e.target.value })}
                  placeholder="이 컬렉션에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
                <Input
                  id="tags"
                  value={form_data.tags}
                  onChange={(e) => set_form_data({ ...form_data, tags: e.target.value })}
                  placeholder="예: 마케팅, 광고, 트렌드"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={form_data.is_public}
                  onCheckedChange={(checked) => set_form_data({ ...form_data, is_public: checked })}
                />
                <Label htmlFor="public">공개 컬렉션으로 설정</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  set_is_create_dialog_open(false);
                  reset_form();
                }}
              >
                취소
              </Button>
              <Button onClick={handle_create_collection}>컬렉션 만들기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 컬렉션 목록 */}
      {collections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">컬렉션이 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              첫 번째 컬렉션을 만들어 YouTube 동영상을 저장해보세요
            </p>
            <Button onClick={() => set_is_create_dialog_open(true)}>
              <Plus className="mr-2 h-4 w-4" />첫 컬렉션 만들기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection: Collection) => (
            <Card key={collection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {collection.name}
                      {collection.is_public ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    {collection.description && (
                      <CardDescription className="mt-1">{collection.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => start_edit(collection)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handle_delete_collection(collection.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    {collection.itemCount ?? 0} 개의 동영상
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {collection.created_at ? new Date(collection.created_at).toLocaleDateString() : '날짜 없음'}
                  </span>
                </div>
                {collection.tags && collection.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {collection.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {collection.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{collection.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 편집 다이얼로그 */}
      <Dialog
        open={!!editing_collection}
        onOpenChange={(open) => !open && set_editing_collection(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>컬렉션 편집</DialogTitle>
            <DialogDescription>컬렉션 정보를 수정하세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">컬렉션 이름</Label>
              <Input
                id="edit-name"
                value={form_data.name}
                onChange={(e) => set_form_data({ ...form_data, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea
                id="edit-description"
                value={form_data.description}
                onChange={(e) => set_form_data({ ...form_data, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">태그 (쉼표로 구분)</Label>
              <Input
                id="edit-tags"
                value={form_data.tags}
                onChange={(e) => set_form_data({ ...form_data, tags: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-public"
                checked={form_data.is_public}
                onCheckedChange={(checked) => set_form_data({ ...form_data, is_public: checked })}
              />
              <Label htmlFor="edit-public">공개 컬렉션으로 설정</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                set_editing_collection(null);
                reset_form();
              }}
            >
              취소
            </Button>
            <Button onClick={handle_update_collection}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
