'use client';

import { useWindowSize } from '@react-hook/window-size';
import { Plus } from 'lucide-react';
import { Masonry } from 'masonic';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { FilterBar } from '@/components/features/revenue-proof/FilterBar';
import { LiveRankingSidebar } from '@/components/features/revenue-proof/LiveRankingSidebar';
import { RevenueProofCard } from '@/components/features/revenue-proof/RevenueProofCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRevenueProofs } from '@/lib/api/revenue-proof';
// 더미 데이터 import 제거 - 실제 API만 사용
import type { RevenueProof } from '@/types/revenue-proof';

export default function RevenueProofGallery() {
  const [windowWidth] = useWindowSize();
  const [items, setItems] = useState<RevenueProof[]>([]);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [platform, setPlatform] = useState<'all' | 'youtube' | 'instagram' | 'tiktok'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [_hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드 (실제 API만 사용)
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 실제 API 호출
      const result = await getRevenueProofs({
        platform: platform === 'all' ? undefined : platform,
        filter,
        page,
        limit: 20,
      });

      if (result.data) {
        if (page === 1) {
          setItems(result.data);
        } else {
          setItems((prev) => [...prev, ...result.data]);
        }
        setHasMore(result.pagination.page < result.pagination.totalPages);
      }
    } catch (_error) {
      setError('수익 인증을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');

      // API 오류 시 빈 배열로 설정 (더미 데이터 사용하지 않음)
      if (page === 1) {
        setItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filter, platform, page]);

  // 필터 변경 시 데이터 재로드
  useEffect(() => {
    setPage(1);
    loadData();
  }, [loadData]);

  // 페이지 변경 시 추가 로드
  useEffect(() => {
    if (page > 1) {
      loadData();
    }
  }, [page, loadData]);

  // Masonry 컬럼 계산
  const getColumnCount = () => {
    if (!windowWidth) {
      return 3;
    }
    if (windowWidth < 768) {
      return 2;
    }
    if (windowWidth < 1024) {
      return 3;
    }
    return 4;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">수익 인증 갤러리</h1>
            <p className="text-muted-foreground mt-2">투명한 수익 공개로 함께 성장하는 커뮤니티</p>
          </div>
          <Link href="/revenue-proof/create">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              수익 인증하기
            </Button>
          </Link>
        </div>

        {/* 필터 탭 */}
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as 'all' | 'daily' | 'weekly' | 'monthly')}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="daily">오늘</TabsTrigger>
            <TabsTrigger value="weekly">이번 주</TabsTrigger>
            <TabsTrigger value="monthly">이번 달</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 플랫폼 필터 */}
        <FilterBar platform={platform} onPlatformChange={setPlatform} />

        {/* 에러 메시지 표시 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-8">
          {/* Masonic 갤러리 */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-[4/3]" />
                    <div className="mt-2 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <Masonry
                items={items}
                columnCount={getColumnCount()}
                columnWidth={300}
                columnGutter={16}
                overscanBy={5}
                render={RevenueProofCard}
                itemHeightEstimate={400}
                itemKey={(item) => item.id}
              />
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto max-w-md">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    아직 인증된 수익이 없습니다
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    첫 번째 수익 인증자가 되어보세요!
                  </p>
                  <div className="mt-6">
                    <Link href="/revenue-proof/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />첫 수익 인증하기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 실시간 랭킹 사이드바 (데스크톱만) */}
          <aside className="hidden lg:block w-80">
            <LiveRankingSidebar filter={filter} />
          </aside>
        </div>
      </div>
    </div>
  );
}
