'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Youtube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type ChannelFilters,
  useAdminChannelStats,
  useAdminYouTubeChannels,
  useChannelCategories,
} from '@/hooks/queries/useAdminQueries';
import { formatNumberKo } from '@/lib/youtube-lens/format-number-ko';

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'approved':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'approved':
      return '승인';
    case 'pending':
      return '대기';
    case 'rejected':
      return '거부';
    default:
      return status;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
}

export function DeltaDashboard() {
  // State management
  const [filters, setFilters] = useState<ChannelFilters>({
    status: undefined,
    category: undefined,
    format: undefined,
    search: '',
  });

  // React Query hooks
  const {
    data: channelsData,
    isLoading: isLoadingChannels,
    error: channelsError,
    refetch,
  } = useAdminYouTubeChannels(filters);
  const { data: statsData, isLoading: isLoadingStats } = useAdminChannelStats();
  const { data: categoriesData, isLoading: isLoadingCategories } = useChannelCategories();

  const channels = channelsData?.data || [];
  const stats = statsData?.data;
  const categories = categoriesData?.data || [];

  // Event handlers
  const handleFilterChange = (key: keyof ChannelFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '전체' ? undefined : value,
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  // Loading state
  if (isLoadingChannels || isLoadingStats) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={`skeleton-${i}`} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (channelsError) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-500 mb-4">데이터 로드 실패</p>
          <Button onClick={() => refetch()}>다시 시도</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header with stats */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="w-6 h-6" />
          승인된 YouTube 채널 목록
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          총 {stats?.totalChannels || 0}개 채널 | 승인: {stats?.approvedChannels || 0} | 대기:{' '}
          {stats?.pendingChannels || 0} | 거부: {stats?.rejectedChannels || 0}
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Status filter */}
          <Select
            value={filters.status || '전체'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="전체 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체 상태</SelectItem>
              <SelectItem value="approved">승인</SelectItem>
              <SelectItem value="pending">대기</SelectItem>
              <SelectItem value="rejected">거부</SelectItem>
            </SelectContent>
          </Select>

          {/* Category filter */}
          <Select
            value={filters.category || '전체'}
            onValueChange={(value) => handleFilterChange('category', value)}
            disabled={isLoadingCategories}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue
                placeholder={isLoadingCategories ? '카테고리 로딩중...' : '전체 카테고리'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체 카테고리</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.categoryId} value={category.nameKo}>
                  {category.nameKo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Format filter */}
          <Select
            value={filters.format || '전체'}
            onValueChange={(value) => handleFilterChange('format', value)}
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="전체 형식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체 형식</SelectItem>
              <SelectItem value="쇼츠">쇼츠</SelectItem>
              <SelectItem value="롱폼">롱폼</SelectItem>
              <SelectItem value="라이브">라이브</SelectItem>
              <SelectItem value="혼합">혼합</SelectItem>
            </SelectContent>
          </Select>

          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="채널명/ID 검색"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table with data */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>채널명</TableHead>
                <TableHead>구독자</TableHead>
                <TableHead>조회수</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>형식</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>추가일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    채널이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                channels.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {channel.thumbnailUrl && (
                          <Image
                            src={channel.thumbnailUrl}
                            alt={channel.title}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium truncate max-w-48" title={channel.title}>
                            {channel.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {channel.channelId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {channel.subscriberCount ? formatNumberKo(channel.subscriberCount) : '-'}
                    </TableCell>
                    <TableCell>
                      {channel.viewCount ? formatNumberKo(channel.viewCount) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {channel.category && channel.subcategory
                          ? `${channel.category}>${channel.subcategory}`
                          : channel.category || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{channel.dominantFormat || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(channel.status)}>
                        {getStatusLabel(channel.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(channel.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        상세보기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
