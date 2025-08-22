'use client';

/**
 * ChannelFolders Component
 * Manage YouTube channel folders for monitoring
 * Phase 3: Core Features Implementation
 */

import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit,
  Folder,
  FolderPlus,
  MoreVertical,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import { mapSourceFolder } from '@/lib/utils/type-mappers';
import type { SourceFolder } from '@/types';

interface ChannelFoldersProps {
  onFolderSelect?: (folder: SourceFolder) => void;
}

export default function ChannelFolders({ onFolderSelect }: ChannelFoldersProps) {
  const [folders, set_folders] = useState<SourceFolder[]>([]);
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);
  const [selected_folder, set_selected_folder] = useState<SourceFolder | null>(null);
  const [is_create_dialog_open, set_is_create_dialog_open] = useState(false);
  const [is_edit_dialog_open, set_is_edit_dialog_open] = useState(false);
  const [search_query, set_search_query] = useState('');

  // Form state
  const [form_data, set_form_data] = useState({
    name: '',
    description: '',
    checkIntervalHours: 1,
    isMonitoringEnabled: true,
  });

  // Fetch folders
  const fetch_folders = useCallback(async () => {
    set_loading(true);
    set_error(null);

    try {
      const data = await apiGet<{ folders?: SourceFolder[] }>('/api/youtube/folders');

      console.log('[ChannelFolders] API Response:', data);
      set_folders((data.folders || []).map(mapSourceFolder));
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
            set_error('YouTube API Key 설정이 필요합니다');
          } else {
            // Only redirect to login if truly not authenticated
            const is_logged_in = document.cookie.includes('sb-');
            if (!is_logged_in) {
              window.location.href = '/auth/login?redirect=/tools/youtube-lens';
            } else {
              set_error('세션이 만료되었습니다. 새로고침 후 다시 시도해주세요.');
            }
          }
          return;
        }
        // Handle 400 errors for API key issues
        if (error_with_status.status === 400) {
          const data = error_with_status.data;
          if (data?.requiresApiKey || data?.error_code === 'api_key_required') {
            set_error('YouTube API Key 설정이 필요합니다. 설정 페이지에서 API Key를 등록해주세요.');
            return;
          }
        }
      }

      const error_message = error instanceof Error ? error.message : 'An unexpected error occurred';
      set_error(error_message);
    } finally {
      set_loading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetch_folders();
  }, [fetch_folders]);

  // Create folder
  const handle_create_folder = async () => {
    try {
      const data = await apiPost<{ folder: SourceFolder }>('/api/youtube/folders', form_data);

      console.log('[ChannelFolders] Create response:', data);
      set_folders([mapSourceFolder(data.folder), ...folders]);
      set_is_create_dialog_open(false);
      reset_form();
    } catch (error) {
      const error_message = error instanceof Error ? error.message : 'Failed to create folder';
      set_error(error_message);
    }
  };

  // Update folder
  const handle_update_folder = async () => {
    if (!selected_folder) {
      return;
    }

    try {
      const data = await apiPatch<{ folder: SourceFolder }>(
        `/api/youtube/folders/${selected_folder.id}`,
        form_data
      );

      set_folders(folders.map((f) => (f.id === data.folder.id ? mapSourceFolder(data.folder) : f)));
      set_is_edit_dialog_open(false);
      reset_form();
    } catch (error) {
      set_error(error instanceof Error ? error.message : 'Failed to update folder');
    }
  };

  // Delete folder
  const handle_delete_folder = async (folder_id: string) => {
    if (!confirm('정말로 이 폴더를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiDelete(`/api/youtube/folders/${folder_id}`);

      set_folders(folders.filter((f) => f.id !== folder_id));
    } catch (error) {
      set_error(error instanceof Error ? error.message : 'Failed to delete folder');
    }
  };

  // Toggle monitoring
  const handle_toggle_monitoring = async (folder_id: string, enabled: boolean) => {
    try {
      await apiPatch(`/api/youtube/folders/${folder_id}`, { isMonitoringEnabled: enabled });

      set_folders(
        folders.map((f) => (f.id === folder_id ? { ...f, isMonitoringEnabled: enabled } : f))
      );
    } catch (error) {
      set_error(error instanceof Error ? error.message : 'Failed to update monitoring');
    }
  };

  // Reset form
  const reset_form = () => {
    set_form_data({
      name: '',
      description: '',
      checkIntervalHours: 1,
      isMonitoringEnabled: true,
    });
    set_selected_folder(null);
  };

  // Filter folders by search
  const filtered_folders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(search_query.toLowerCase()) ||
      folder.description?.toLowerCase().includes(search_query.toLowerCase())
  );

  // Get monitoring status
  const get_monitoring_status = (folder: SourceFolder) => {
    if (!folder.isMonitoringEnabled) {
      return 'disabled';
    }
    if (!folder.lastCheckedAt) {
      return 'never';
    }

    const last_check = new Date(folder.lastCheckedAt);
    const hours_since = (Date.now() - last_check.getTime()) / (1000 * 60 * 60);

    if (hours_since < folder.checkIntervalHours) {
      return 'active';
    }
    if (hours_since < folder.checkIntervalHours * 2) {
      return 'pending';
    }
    return 'overdue';
  };

  // Get status badge
  const get_status_badge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            활성
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            대기
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="bg-red-500 text-white">
            <AlertCircle className="w-3 h-3 mr-1" />
            지연
          </Badge>
        );
      case 'disabled':
        return (
          <Badge variant="outline">
            <BellOff className="w-3 h-3 mr-1" />
            비활성
          </Badge>
        );
      default:
        return <Badge variant="secondary">확인 안함</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>채널 폴더</CardTitle>
              <CardDescription>YouTube 채널을 폴더별로 정리하고 모니터링하세요</CardDescription>
            </div>
            <Dialog open={is_create_dialog_open} onOpenChange={set_is_create_dialog_open}>
              <DialogTrigger asChild={true}>
                <Button>
                  <FolderPlus className="w-4 h-4 mr-2" />새 폴더
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 폴더 만들기</DialogTitle>
                  <DialogDescription>
                    YouTube 채널 모니터링을 위한 폴더를 만들어보세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">폴더 이름</Label>
                    <Input
                      id="name"
                      value={form_data.name}
                      onChange={(e) => set_form_data({ ...form_data, name: e.target.value })}
                      placeholder="예: 게임 채널"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      value={form_data.description}
                      onChange={(e) => set_form_data({ ...form_data, description: e.target.value })}
                      placeholder="이 폴더의 목적을 설명해주세요..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval">확인 간격 (시간)</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      max="24"
                      value={form_data.checkIntervalHours}
                      onChange={(e) =>
                        set_form_data({
                          ...form_data,
                          checkIntervalHours: Number.parseInt(e.target.value, 10) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="monitoring"
                      checked={form_data.isMonitoringEnabled}
                      onCheckedChange={(checked) =>
                        set_form_data({
                          ...form_data,
                          isMonitoringEnabled: checked,
                        })
                      }
                    />
                    <Label htmlFor="monitoring">모니터링 활성화</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => set_is_create_dialog_open(false)}>
                    취소
                  </Button>
                  <Button onClick={handle_create_folder}>폴더 생성</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="폴더 검색..."
              value={search_query}
              onChange={(e) => set_search_query(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Error state */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Folders list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered_folders.map((folder) => {
          const status = get_monitoring_status(folder);
          const channel_count = folder.folderChannels?.length || 0;

          return (
            <Card
              key={folder.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                set_selected_folder(folder);
                onFolderSelect?.(folder);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{folder.name}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild={true} onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>작업</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          set_selected_folder(folder);
                          set_form_data({
                            name: folder.name,
                            description: folder.description || '',
                            checkIntervalHours: folder.checkIntervalHours,
                            isMonitoringEnabled: folder.isMonitoringEnabled,
                          });
                          set_is_edit_dialog_open(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        편집
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handle_toggle_monitoring(folder.id, !folder.isMonitoringEnabled);
                        }}
                      >
                        {folder.isMonitoringEnabled ? (
                          <>
                            <BellOff className="w-4 h-4 mr-2" />
                            모니터링 비활성화
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 mr-2" />
                            모니터링 활성화
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handle_delete_folder(folder.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {/* Description */}
                {folder.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {folder.description}
                  </p>
                )}

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      채널 {channel_count}개
                    </span>
                    {get_status_badge(status)}
                  </div>

                  {/* Check interval */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">확인 주기</span>
                    <span>{folder.checkIntervalHours}h</span>
                  </div>

                  {/* Last checked */}
                  {folder.lastCheckedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">마지막 확인</span>
                      <span>{new Date(folder.lastCheckedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* View details button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    set_selected_folder(folder);
                    onFolderSelect?.(folder);
                  }}
                >
                  채널 보기
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty state */}
        {filtered_folders.length === 0 && !loading && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">아직 폴더가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                첫 번째 폴더를 만들어 채널을 정리해보세요
              </p>
              <Button onClick={() => set_is_create_dialog_open(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                폴더 만들기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={is_edit_dialog_open} onOpenChange={set_is_edit_dialog_open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>폴더 편집</DialogTitle>
            <DialogDescription>폴더 설정과 모니터링 구성을 수정하세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">폴더 이름</Label>
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
              <Label htmlFor="edit-interval">확인 간격 (시간)</Label>
              <Input
                id="edit-interval"
                type="number"
                min="1"
                max="24"
                value={form_data.checkIntervalHours}
                onChange={(e) =>
                  set_form_data({
                    ...form_data,
                    checkIntervalHours: Number.parseInt(e.target.value, 10) || 1,
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-monitoring"
                checked={form_data.isMonitoringEnabled}
                onCheckedChange={(checked) =>
                  set_form_data({
                    ...form_data,
                    isMonitoringEnabled: checked,
                  })
                }
              />
              <Label htmlFor="edit-monitoring">모니터링 활성화</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => set_is_edit_dialog_open(false)}>
              취소
            </Button>
            <Button onClick={handle_update_folder}>폴더 업데이트</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
