'use client';

import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Coins,
  Crown,
  Gift,
  Info,
  Medal,
  Minus,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RankingUser {
  rank: number;
  user_id: string;
  total_amount: number;
  proof_count?: number;
  user?: {
    id: string | null;
    username: string | null;
    avatar_url?: string;
  };
}

interface Reward {
  rank: number | string;
  prize: string;
  points: number;
  badge: string;
}

interface RankingDashboardProps {
  dailyRankings: RankingUser[];
  weeklyRankings: RankingUser[];
  monthlyRankings: RankingUser[];
  rewards: {
    monthly: Reward[];
  };
  currentMonth: string;
}

export function RankingDashboard({
  dailyRankings,
  weeklyRankings,
  monthlyRankings,
  rewards,
  currentMonth,
}: RankingDashboardProps) {
  const [selected_tab, set_selected_tab] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // 순위 변동 아이콘 (더미 데이터 - 실제로는 이전 순위와 비교)
  const get_rank_change_icon = (_rank: number) => {
    const random = Math.random();
    if (random < 0.3) {
      return <ChevronUp className="h-4 w-4 text-green-500" />;
    }
    if (random < 0.6) {
      return <ChevronDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  // 순위별 아이콘
  const get_rank_icon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  // 순위별 스타일
  const get_rank_style = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-gray-200 dark:border-gray-800';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800';
      default:
        return '';
    }
  };

  // 배지 색상
  const get_badge_color = (badge: string) => {
    switch (badge) {
      case 'gold':
        return 'bg-yellow-500 text-white';
      case 'silver':
        return 'bg-gray-400 text-white';
      case 'bronze':
        return 'bg-orange-600 text-white';
      case 'top10':
        return 'bg-purple-500 text-white';
      case 'top30':
        return 'bg-blue-500 text-white';
      case 'top100':
        return 'bg-green-500 text-white';
      default:
        return '';
    }
  };

  // 랭킹 리스트 렌더링
  const render_ranking_list = (rankings: RankingUser[], show_proof_count = false) => {
    if (rankings.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>아직 랭킹 데이터가 없습니다.</p>
          <p className="text-sm mt-2">수익 인증을 시작해보세요!</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[600px]">
        <div className="space-y-2 pr-4">
          {rankings.map((user) => (
            <Card
              key={user.user_id}
              className={`transition-all hover:shadow-md ${get_rank_style(user.rank)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* 순위 */}
                    <div className="flex items-center gap-2 min-w-[60px]">
                      <span className="text-2xl font-bold">{user.rank}</span>
                      {get_rank_icon(user.rank)}
                      {get_rank_change_icon(user.rank)}
                    </div>

                    {/* 사용자 정보 */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user?.avatar_url} />
                        <AvatarFallback>{user.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.user?.username}</p>
                        {show_proof_count && (
                          <p className="text-xs text-muted-foreground">인증 {user.proof_count}회</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 수익 금액 */}
                  <div className="text-right">
                    <p className="text-xl font-bold">₩{user.total_amount.toLocaleString()}</p>
                    {user.rank <= 3 && (
                      <Badge
                        className={get_badge_color(
                          user.rank === 1 ? 'gold' : user.rank === 2 ? 'silver' : 'bronze'
                        )}
                      >
                        {user.rank === 1 ? '1st' : user.rank === 2 ? '2nd' : '3rd'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          크리에이터 수익 랭킹
        </h1>
        <p className="text-muted-foreground">
          투명한 수익 공개로 함께 성장하는 크리에이터 커뮤니티
        </p>
      </div>

      {/* 보상 안내 */}
      <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950">
        <Gift className="h-4 w-4" />
        <AlertTitle>🎁 월간 랭킹 보상</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {rewards.monthly.slice(0, 3).map((reward, index) => (
              <div key={index} className="flex items-center gap-3">
                <Badge
                  className={get_badge_color(
                    index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'
                  )}
                >
                  {typeof reward.rank === 'number' ? `${reward.rank}위` : reward.rank}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{reward.prize}</p>
                  <p className="text-xs text-muted-foreground">
                    +{reward.points.toLocaleString()}P
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="link" className="mt-2 p-0" asChild={true}>
            <a href="#rewards">전체 보상 보기 →</a>
          </Button>
        </AlertDescription>
      </Alert>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 총 인증 수익</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{monthlyRankings.reduce((sum, user) => sum + user.total_amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">전월 대비 +23.5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">참여 크리에이터</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyRankings.length}명</div>
            <p className="text-xs text-muted-foreground">
              일일 평균 {Math.round(dailyRankings.length)}명
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최고 수익 인증</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{monthlyRankings[0]?.total_amount?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {monthlyRankings[0]?.user?.username || '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 랭킹 탭 */}
      <Tabs
        value={selected_tab}
        onValueChange={(v) => set_selected_tab(v as 'daily' | 'weekly' | 'monthly')}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">
            <Calendar className="h-4 w-4 mr-2" />
            일간 랭킹
          </TabsTrigger>
          <TabsTrigger value="weekly">
            <Calendar className="h-4 w-4 mr-2" />
            주간 랭킹
          </TabsTrigger>
          <TabsTrigger value="monthly">
            <Trophy className="h-4 w-4 mr-2" />
            월간 랭킹
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>오늘의 수익 랭킹</CardTitle>
                <CardDescription>{new Date().toLocaleDateString('ko-KR')} 기준</CardDescription>
              </CardHeader>
              <CardContent>{render_ranking_list(dailyRankings.slice(0, 20))}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle>이번 주 수익 랭킹</CardTitle>
                <CardDescription>최근 7일간 누적 수익 기준</CardDescription>
              </CardHeader>
              <CardContent>{render_ranking_list(weeklyRankings.slice(0, 50), true)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>{currentMonth} 월간 수익 랭킹</CardTitle>
                <CardDescription>이번 달 누적 수익 기준 TOP 100</CardDescription>
              </CardHeader>
              <CardContent>{render_ranking_list(monthlyRankings, true)}</CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* 보상 상세 정보 */}
      <Card id="rewards">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            월간 랭킹 보상 시스템
          </CardTitle>
          <CardDescription>
            매월 말일 기준으로 집계되며, 다음 달 첫째 주에 지급됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewards.monthly.map((reward, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${index < 3 ? get_rank_style(index + 1) : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {typeof reward.rank === 'number' && get_rank_icon(reward.rank)}
                      <Badge className={get_badge_color(reward.badge)}>
                        {typeof reward.rank === 'number' ? `${reward.rank}위` : `${reward.rank}위`}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{reward.prize}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Coins className="h-3 w-3" />
                        <span className="text-sm text-muted-foreground">
                          +{reward.points.toLocaleString()} 포인트
                        </span>
                        <Star className="h-3 w-3" />
                        <span className="text-sm text-muted-foreground">
                          {reward.badge.toUpperCase()} 배지
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>보상 지급 안내</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>• 실물 상품은 등록된 주소로 배송됩니다.</p>
              <p>• 기프티콘은 등록된 휴대폰 번호로 발송됩니다.</p>
              <p>• 포인트는 자동으로 계정에 적립됩니다.</p>
              <p>• 배지는 프로필에 영구적으로 표시됩니다.</p>
              <p className="text-xs text-muted-foreground mt-3">
                * 부정 행위 적발 시 보상이 취소될 수 있습니다.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
