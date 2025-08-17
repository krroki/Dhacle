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
      const response = await fetch(`/api/youtube/folders?userId=${userId}`, {
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ChannelFolders] API Error:', errorData);
        const errorMessage = errorData.error || errorData.message || `Failed to fetch folders (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFolders(data.folders || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('[ChannelFolders] Fetch error:', {
        error: err,
        message: errorMessage,
        userId
      });
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
      const response = await fetch('/api/youtube/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...formData,
          user_id: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ChannelFolders] Create error:', errorData);
        const errorMessage = errorData.error || errorData.message || 'Failed to create folder';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFolders([data.folder, ...folders]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create folder';
      setError(errorMessage);
      console.error('[ChannelFolders] Create folder error:', err);
    }
  };

  // Update folder
  const handleUpdateFolder = async () => {
    if (!selectedFolder) return;

    try {
      const response = await fetch(`/api/youtube/folders/${selectedFolder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update folder');
      }

      const data = await response.json();
      setFolders(folders.map(f => f.id === data.folder.id ? data.folder : f));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update folder');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder?')) return;

    try {
      const response = await fetch(`/api/youtube/folders/${folderId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      setFolders(folders.filter(f => f.id !== folderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
    }
  };

  // Toggle monitoring
  const handleToggleMonitoring = async (folderId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/youtube/folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ is_monitoring_enabled: enabled })
      });

      if (!response.ok) {
        throw new Error('Failed to update monitoring status');
      }

      setFolders(folders.map(f => 
        f.id === folderId ? { ...f, is_monitoring_enabled: enabled } : f
      ));
    } catch (err) {
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
        return <Badge className="bg-green-500 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500 text-white"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case 'disabled':
        return <Badge variant="outline"><BellOff className="w-3 h-3 mr-1" />Disabled</Badge>;
      default:
        return <Badge variant="secondary">Never checked</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Channel Folders</CardTitle>
              <CardDescription>
                Organize and monitor YouTube channels in folders
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Create a folder to organize YouTube channels for monitoring
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Folder Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Gaming Channels"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the purpose of this folder..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval">Check Interval (hours)</Label>
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
                    <Label htmlFor="monitoring">Enable monitoring</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>Create Folder</Button>
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
              placeholder="Search folders..."
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
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
                        Edit
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
                            Disable Monitoring
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 mr-2" />
                            Enable Monitoring
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
                        Delete
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
                      {channelCount} channel{channelCount !== 1 ? 's' : ''}
                    </span>
                    {getStatusBadge(status)}
                  </div>

                  {/* Check interval */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Check every</span>
                    <span>{folder.check_interval_hours}h</span>
                  </div>

                  {/* Last checked */}
                  {folder.last_checked_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last check</span>
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
                  View Channels
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
              <h3 className="text-lg font-semibold mb-2">No folders yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first folder to start organizing channels
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Folder
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Update folder settings and monitoring configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Folder Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-interval">Check Interval (hours)</Label>
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
              <Label htmlFor="edit-monitoring">Enable monitoring</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFolder}>Update Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}