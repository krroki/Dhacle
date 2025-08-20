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
import { useEffect, useState } from 'react';
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
import type { SourceFolder } from '@/types/youtube-lens';

interface ChannelFoldersProps {
  onFolderSelect?: (folder: SourceFolder) => void;
}

export default function ChannelFolders({ onFolderSelect }: ChannelFoldersProps) {
  const [folders, setFolders] = useState<SourceFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<SourceFolder | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    checkIntervalHours: 1,
    isMonitoringEnabled: true,
  });

  // Fetch folders
  const fetchFolders = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<{ folders?: SourceFolder[] }>('/api/youtube/folders');

      console.log('[ChannelFolders] API Response:', data);
      setFolders((data.folders || []).map(mapSourceFolder));
    } catch (error) {
      // Handle 401 errors - distinguish between auth and API key issues
      if (error && typeof error === 'object' && 'status' in error) {
        const errorWithStatus = error as {
          status: number;
          data?: { requiresApiKey?: boolean; errorCode?: string; error?: string };
        };
        if (errorWithStatus.status === 401) {
          // Check if it's an API key issue
          const errorMessage = (errorWithStatus.data?.error || '').toLowerCase();
          const isApiKeyError =
            errorWithStatus.data?.requiresApiKey ||
            errorWithStatus.data?.errorCode === 'api_key_required' ||
            errorMessage.includes('api key') ||
            errorMessage.includes('api 키');

          if (isApiKeyError) {
            setError('YouTube API Key 설정이 필요합니다');
          } else {
            // Only redirect to login if truly not authenticated
            const isLoggedIn = document.cookie.includes('sb-');
            if (!isLoggedIn) {
              window.location.href = '/auth/login?redirect=/tools/youtube-lens';
            } else {
              setError('세션이 만료되었습니다. 새로고침 후 다시 시도해주세요.');
            }
          }
          return;
        }
        // Handle 400 errors for API key issues
        if (errorWithStatus.status === 400) {
          const data = errorWithStatus.data;
          if (data?.requiresApiKey || data?.errorCode === 'api_key_required') {
            setError('YouTube API Key 설정이 필요합니다. 설정 페이지에서 API Key를 등록해주세요.');
            return;
          }
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Create folder
  const handleCreateFolder = async () => {
    try {
      const data = await apiPost<{ folder: SourceFolder }>('/api/youtube/folders', formData);

      console.log('[ChannelFolders] Create response:', data);
      setFolders([mapSourceFolder(data.folder), ...folders]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create folder';
      setError(errorMessage);
    }
  };

  // Update folder
  const handleUpdateFolder = async () => {
    if (!selectedFolder) {
      return;
    }

    try {
      const data = await apiPatch<{ folder: SourceFolder }>(
        `/api/youtube/folders/${selectedFolder.id}`,
        formData
      );

      setFolders(folders.map((f) => (f.id === data.folder.id ? mapSourceFolder(data.folder) : f)));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update folder');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('정말로 이 폴더를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiDelete(`/api/youtube/folders/${folderId}`);

      setFolders(folders.filter((f) => f.id !== folderId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete folder');
    }
  };

  // Toggle monitoring
  const handleToggleMonitoring = async (folderId: string, enabled: boolean) => {
    try {
      await apiPatch(`/api/youtube/folders/${folderId}`, { isMonitoringEnabled: enabled });

      setFolders(
        folders.map((f) => (f.id === folderId ? { ...f, isMonitoringEnabled: enabled } : f))
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update monitoring');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      checkIntervalHours: 1,
      isMonitoringEnabled: true,
    });
    setSelectedFolder(null);
  };

  // Filter folders by search
  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get monitoring status
  const getMonitoringStatus = (folder: SourceFolder) => {
    if (!folder.isMonitoringEnabled) {
      return 'disabled';
    }
    if (!folder.lastCheckedAt) {
      return 'never';
    }

    const lastCheck = new Date(folder.lastCheckedAt);
    const hoursSince = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60);

    if (hoursSince < folder.checkIntervalHours) {
      return 'active';
    }
    if (hoursSince < folder.checkIntervalHours * 2) {
      return 'pending';
    }
    return 'overdue';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="예: 게임 채널"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      value={formData.checkIntervalHours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          checkIntervalHours: Number.parseInt(e.target.value, 10) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="monitoring"
                      checked={formData.isMonitoringEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          isMonitoringEnabled: checked,
                        })
                      }
                    />
                    <Label htmlFor="monitoring">모니터링 활성화</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleCreateFolder}>폴더 생성</Button>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        {filteredFolders.map((folder) => {
          const status = getMonitoringStatus(folder);
          const channelCount = folder.folderChannels?.length || 0;

          return (
            <Card
              key={folder.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedFolder(folder);
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
                          setSelectedFolder(folder);
                          setFormData({
                            name: folder.name,
                            description: folder.description || '',
                            checkIntervalHours: folder.checkIntervalHours,
                            isMonitoringEnabled: folder.isMonitoringEnabled,
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        편집
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMonitoring(folder.id, !folder.isMonitoringEnabled);
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
                          handleDeleteFolder(folder.id);
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
                      채널 {channelCount}개
                    </span>
                    {getStatusBadge(status)}
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
                    setSelectedFolder(folder);
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
        {filteredFolders.length === 0 && !loading && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">아직 폴더가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                첫 번째 폴더를 만들어 채널을 정리해보세요
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                폴더 만들기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                value={formData.checkIntervalHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    checkIntervalHours: Number.parseInt(e.target.value, 10) || 1,
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-monitoring"
                checked={formData.isMonitoringEnabled}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isMonitoringEnabled: checked,
                  })
                }
              />
              <Label htmlFor="edit-monitoring">모니터링 활성화</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateFolder}>폴더 업데이트</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
