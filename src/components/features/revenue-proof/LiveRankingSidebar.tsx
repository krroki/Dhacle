'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getRankings } from '@/lib/api/revenue-proof';

interface LiveRankingSidebarProps {
  filter: 'all' | 'daily' | 'weekly' | 'monthly';
}

interface Ranking {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  total_amount: number;
  rank: number;
}

export function LiveRankingSidebar({ filter }: LiveRankingSidebarProps) {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRankings = async () => {
      setIsLoading(true);
      try {
        const period = filter === 'all' ? 'monthly' : filter;
        const data = await getRankings(period as 'daily' | 'weekly' | 'monthly');
        setRankings(data.rankings || []);
      } catch (error) {
        console.error('Failed to load rankings:', error);
        setRankings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRankings();
  }, [filter]);
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm font-semibold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-gray-100 text-gray-800';
      case 3:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'daily':
        return '오늘';
      case 'weekly':
        return '이번 주';
      case 'monthly':
        return '이번 달';
      default:
        return '전체';
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>🏆 실시간 랭킹</span>
          <Badge variant="outline" className="text-xs">
            {getFilterLabel()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            아직 랭킹 데이터가 없습니다.
          </p>
        ) : (
          rankings.slice(0, 5).map((ranking: Ranking, index: number) => (
          <div key={`ranking-${ranking.user_id || index}`} className="flex items-center gap-3">
            {/* 순위 */}
            <div className="w-8 flex justify-center">
              {getRankIcon(ranking.rank)}
            </div>
            
            {/* 프로필 이미지 */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              {ranking.avatar_url ? (
                <Image
                  src={ranking.avatar_url}
                  alt={ranking.username}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
              )}
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1">
              <p className="text-sm font-medium line-clamp-1">
                {ranking.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatAmount(ranking.total_amount)}
              </p>
            </div>

            {/* 순위 배지 */}
            {ranking.rank <= 3 && (
              <Badge className={`text-xs ${getRankBadgeColor(ranking.rank)}`}>
                {ranking.rank}위
              </Badge>
            )}
          </div>
        )))}

        {/* 더보기 링크 */}
        <div className="pt-4 border-t">
          <Link 
            href="/revenue-proof/ranking"
            className="text-sm text-primary hover:underline text-center block"
          >
            전체 랭킹 보기 →
          </Link>
        </div>

        {/* 보상 안내 */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
          <p className="text-xs font-semibold mb-1">🎁 이달의 보상</p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• 1위: 에어팟 프로 + 100P</li>
            <li>• 2위: 스타벅스 기프티콘 + 50P</li>
            <li>• 3위: 배스킨라빈스 기프티콘 + 30P</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}