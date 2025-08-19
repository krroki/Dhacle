'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  AlertCircle,
  Eye,
  History,
  Users,
  Youtube
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { formatNumberKo } from '@/lib/youtube-lens/format-number-ko';

interface YLChannel {
  channelId: string;
  title: string;
  handle?: string;
  description?: string;
  thumbnailUrl?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  source: 'manual' | 'import' | 'search' | 'recommendation';
  subscriberCount?: number;
  viewCountTotal?: number;
  videoCount?: number;
  category?: string;
  subcategory?: string;
  dominantFormat?: '쇼츠' | '롱폼' | '라이브' | null;
  country?: string;
  language?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApprovalLog {
  id: number;
  channelId: string;
  action: 'approve' | 'reject' | 'pending';
  actorId: string;
  beforeStatus: string;
  afterStatus: string;
  notes?: string;
  createdAt: string;
}

export function ChannelApprovalConsole() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<YLChannel | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<YLChannel | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newChannelId, setNewChannelId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 채널 목록 조회
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['yl/admin/channels', filterStatus, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('q', searchQuery);
      
      const response = await apiGet<{ data: YLChannel[] }>(
        `/api/youtube-lens/admin/channels?${params}`
      );
      return response.data;
    },
  });

  // 채널 추가/수정
  const channelMutation = useMutation({
    mutationFn: async (data: { 
      channelId?: string;
      status?: string;
      notes?: string;
      category?: string;
      subcategory?: string;
    }) => {
      if (editingChannel) {
        return apiPut(`/api/youtube-lens/admin/channels/${editingChannel.channelId}`, data);
      } else {
        return apiPost('/api/youtube-lens/admin/channels', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yl/admin/channels'] });
      toast({
        title: editingChannel ? '채널 정보 수정됨' : '채널 추가됨',
        description: editingChannel 
          ? '채널 정보가 성공적으로 수정되었습니다.'
          : '새 채널이 추가되었습니다. YouTube API로 정보를 가져오는 중...',
      });
      setIsAddDialogOpen(false);
      setEditingChannel(null);
      setNewChannelId('');
    },
    onError: (error: any) => {
      toast({
        title: '오류 발생',
        description: error.message || '채널 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 채널 삭제
  const deleteMutation = useMutation({
    mutationFn: async (channelId: string) => {
      return apiDelete(`/api/youtube-lens/admin/channels/${channelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yl/admin/channels'] });
      toast({
        title: '채널 삭제됨',
        description: '채널이 성공적으로 삭제되었습니다.',
      });
    },
  });

  // 승인 로그 조회
  const { data: logs = [] } = useQuery({
    queryKey: ['yl/admin/approval-logs', selectedChannel?.channelId],
    queryFn: async () => {
      if (!selectedChannel) return [];
      const response = await apiGet<{ data: ApprovalLog[] }>(
        `/api/youtube-lens/admin/approval-logs/${selectedChannel.channelId}`
      );
      return response.data;
    },
    enabled: !!selectedChannel,
  });

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 상태별 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">채널 승인 콘솔</h2>
          <p className="text-muted-foreground mt-1">
            YouTube 채널 승인 관리 및 감사 로그
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          채널 추가
        </Button>
      </div>

      {/* 관리자 권한 알림 */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          관리자 전용 페이지입니다. 모든 작업은 감사 로그에 기록됩니다.
        </AlertDescription>
      </Alert>

      {/* 필터 & 검색 */}
      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기중</SelectItem>
            <SelectItem value="approved">승인됨</SelectItem>
            <SelectItem value="rejected">반려됨</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="채널명, ID로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Youtube className="w-4 h-4" />
            <span className="text-sm">전체 채널</span>
          </div>
          <div className="text-2xl font-bold">
            {channels.length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">승인됨</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {channels.filter(c => c.approvalStatus === 'approved').length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">대기중</span>
          </div>
          <div className="text-2xl font-bold text-yellow-700">
            {channels.filter(c => c.approvalStatus === 'pending').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">반려됨</span>
          </div>
          <div className="text-2xl font-bold text-red-700">
            {channels.filter(c => c.approvalStatus === 'rejected').length}
          </div>
        </div>
      </div>

      {/* 채널 테이블 */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>채널 정보</TableHead>
              <TableHead>통계</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channelsLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  데이터를 불러오는 중...
                </TableCell>
              </TableRow>
            ) : channels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  채널이 없습니다. 새 채널을 추가해주세요.
                </TableCell>
              </TableRow>
            ) : (
              channels.map((channel) => (
                <TableRow key={channel.channelId}>
                  <TableCell>
                    {channel.thumbnailUrl && (
                      <img
                        src={channel.thumbnailUrl}
                        alt={channel.title}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{channel.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {channel.channelId}
                      </div>
                      {channel.handle && (
                        <div className="text-xs text-muted-foreground">
                          @{channel.handle}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span>{formatNumberKo(channel.subscriberCount || 0)} 구독</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-muted-foreground" />
                        <span>{formatNumberKo(channel.viewCountTotal || 0)} 조회</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {channel.category && (
                        <Badge variant="outline" className="text-xs">
                          {channel.category}
                        </Badge>
                      )}
                      {channel.dominantFormat && (
                        <Badge variant="secondary" className="text-xs">
                          {channel.dominantFormat}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`gap-1 ${getStatusColor(channel.approvalStatus)}`}>
                      {getStatusIcon(channel.approvalStatus)}
                      {channel.approvalStatus === 'approved' && '승인됨'}
                      {channel.approvalStatus === 'pending' && '대기중'}
                      {channel.approvalStatus === 'rejected' && '반려됨'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(channel.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedChannel(channel)}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingChannel(channel);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('정말 이 채널을 삭제하시겠습니까?')) {
                            deleteMutation.mutate(channel.channelId);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 채널 추가/수정 다이얼로그 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingChannel ? '채널 정보 수정' : '새 채널 추가'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingChannel && (
              <div>
                <Label>YouTube 채널 ID</Label>
                <Input
                  placeholder="UCxxxxxxxxxxxxxxxx"
                  value={newChannelId}
                  onChange={(e) => setNewChannelId(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  채널 URL에서 /channel/ 뒤의 ID를 입력하세요
                </p>
              </div>
            )}
            
            {editingChannel && (
              <>
                <div>
                  <Label>승인 상태</Label>
                  <Select 
                    defaultValue={editingChannel.approvalStatus}
                    onValueChange={(value) => {
                      // 상태 변경 처리
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">대기중</SelectItem>
                      <SelectItem value="approved">승인</SelectItem>
                      <SelectItem value="rejected">반려</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>승인/반려 사유</Label>
                  <Textarea
                    placeholder="승인 또는 반려 사유를 입력하세요..."
                    defaultValue={editingChannel.approvalNotes}
                  />
                </div>
                
                <div>
                  <Label>카테고리</Label>
                  <Input
                    placeholder="예: 게임, 음악, 엔터테인먼트..."
                    defaultValue={editingChannel.category}
                  />
                </div>
                
                <div>
                  <Label>주요 형식</Label>
                  <Select defaultValue={editingChannel.dominantFormat || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="선택..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="쇼츠">쇼츠</SelectItem>
                      <SelectItem value="롱폼">롱폼</SelectItem>
                      <SelectItem value="라이브">라이브</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingChannel(null);
                  setNewChannelId('');
                }}
              >
                취소
              </Button>
              <Button
                onClick={() => {
                  if (editingChannel) {
                    // 수정 처리
                    channelMutation.mutate({
                      status: 'approved', // 실제 값으로 변경
                      notes: '테스트 승인',
                    });
                  } else {
                    // 추가 처리
                    channelMutation.mutate({
                      channelId: newChannelId,
                    });
                  }
                }}
                disabled={!editingChannel && !newChannelId}
              >
                {editingChannel ? '수정' : '추가'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 감사 로그 다이얼로그 */}
      <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedChannel?.title} - 승인 이력
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                승인 이력이 없습니다.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(log.afterStatus)}>
                        {log.afterStatus}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ← {log.beforeStatus}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      {log.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}