'use client';

/**
 * ChannelFolders Component
 * Manage YouTube channel folders for monitoring
 * Phase 3: Core Features Implementation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { SourceFolder, YouTubeChannel } from '@/types/youtube-lens';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import {
  Folder,
  FolderPlus,
  Plus,
  Settings,
  Trash2,
  Edit,
  Users,
  Bell,
  BellOff,
  ChevronRight,
  MoreVertical,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ChannelFoldersProps {
  userId: string;
  onFolderSelect?: (folder: SourceFolder) => void;
}

export default function ChannelFolders({ userId, onFolderSelect }: ChannelFoldersProps) {
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
    check_interval_hours: 1,
    is_monitoring_enabled: true
  });

  // Fetch folders
  const fetchFolders = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<{ folders?: SourceFolder[] }>(`/api/youtube/folders?userId=${userId}`);
      
      console.log('[ChannelFolders] API Response:', data);
      setFolders(data.folders || []);
    } catch (err) {
      console.error('[ChannelFolders] Fetch error:', err);
      
      // Handle 401 errors - redirect to login
      if (err && typeof err === 'object' && 'status' in err) {
        const errorWithStatus = err as { status: number };
        if (errorWithStatus.status === 401) {
          window.location.href = '/auth/login?redirect=/tools/youtube-lens';
          return;
        }
      }
      
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFolders();
  }, [userId]);

  // Create folder
  const handleCreateFolder = async () => {
    try {
      const data = await apiPost<{ folder: SourceFolder }>('/api/youtube/folders', {
        ...formData,
        user_id: userId
      });

      console.log('[ChannelFolders] Create response:', data);
      setFolders([data.folder, ...folders]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error('[ChannelFolders] Create folder error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create folder';
      setError(errorMessage);
    }
  };

  // Update folder
  const handleUpdateFolder = async () => {
    if (!selectedFolder) return;

    try {
      const data = await apiPatch<{ folder: SourceFolder }>(`/api/youtube/folders/${selectedFolder.id}`, formData);
      
      setFolders(folders.map(f => f.id === data.folder.id ? data.folder : f));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error('[ChannelFolders] Update folder error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update folder');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('정말로 이 폴더를 삭제하시겠습니까?')) return;

    try {
      await apiDelete(`/api/youtube/folders/${folderId}`);
      
      setFolders(folders.filter(f => f.id !== folderId));
    } catch (err) {
      console.error('[ChannelFolders] Delete folder error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
    }
  };

  // Toggle monitoring
  const handleToggleMonitoring = async (folderId: string, enabled: boolean) => {
    try {
      await apiPatch(`/api/youtube/folders/${folderId}`, { is_monitoring_enabled: enabled });
      
      setFolders(folders.map(f => 
        f.id === folderId ? { ...f, is_monitoring_enabled: enabled } : f
      ));
    } catch (err) {
      console.error('[ChannelFolders] Toggle monitoring error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update monitoring');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      check_interval_hours: 1,
      is_monitoring_enabled: true
    });
    setSelectedFolder(null);
  };

  // Filter folders by search
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    folder.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get monitoring status
  const getMonitoringStatus = (folder: SourceFolder) => {
    if (!folder.is_monitoring_enabled) return 'disabled';
    if (!folder.last_checked_at) return 'never';
    
    const lastCheck = new Date(folder.last_checked_at);
    const hoursSince = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60);
    
    if (hoursSince < folder.check_interval_hours) return 'active';
    if (hoursSince < folder.check_interval_hours * 2) return 'pending';
    return 'overdue';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />활성</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="w-3 h-3 mr-1" />대기</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500 text-white"><AlertCircle className="w-3 h-3 mr-1" />지연</Badge>;
      case 'disabled':
        return <Badge variant="outline"><BellOff className="w-3 h-3 mr-1" />비활성</Badge>;
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
              <CardDescription>
                YouTube 채널을 폴더별로 정리하고 모니터링하세요
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  새 폴더
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
                      value={formData.check_interval_hours}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        check_interval_hours: parseInt(e.target.value) || 1 
                      })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="monitoring"
                      checked={formData.is_monitoring_enabled}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        is_monitoring_enabled: checked 
                      })}
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
          const channelCount = folder.folder_channels?.length || 0;

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
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>작업</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFolder(folder);
                        setFormData({
                          name: folder.name,
                          description: folder.description || '',
                          check_interval_hours: folder.check_interval_hours,
                          is_monitoring_enabled: folder.is_monitoring_enabled
                        });
                        setIsEditDialogOpen(true);
                      }}>
                        <Edit className="w-4 h-4 mr-2" />
                        편집
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMonitoring(
                          folder.id, 
                          !folder.is_monitoring_enabled
                        );
                      }}>
                        {folder.is_monitoring_enabled ? (
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
                    <span>{folder.check_interval_hours}h</span>
                  </div>

                  {/* Last checked */}
                  {folder.last_checked_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">마지막 확인</span>
                      <span>{new Date(folder.last_checked_at).toLocaleString()}</span>
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
            <DialogDescription>
              폴더 설정과 모니터링 구성을 수정하세요
            </DialogDescription>
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
                value={formData.check_interval_hours}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  check_interval_hours: parseInt(e.target.value) || 1 
                })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-monitoring"
                checked={formData.is_monitoring_enabled}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  is_monitoring_enabled: checked 
                })}
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