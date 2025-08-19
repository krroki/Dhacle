'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, PieChart, Hash, Sparkles, Youtube, FolderOpen, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet } from '@/lib/api-client';
import { formatNumberKo, formatDelta, formatPercent } from '@/lib/youtube-lens/format-number-ko';

interface ChannelData {
  channel_id: string;
  title: string;
  subscriber_count: number;
  view_count_total: number;
  category: string;
  subcategory: string;
  dominant_format: '쇼츠' | '롱폼' | '라이브';
}

interface DeltaData {
  channel_id: string;
  date: string;
  delta_views: number;
  delta_subscribers: number;
  growth_rate: number;
  channel: ChannelData;
}

interface DashboardSummary {
  categoryStats: Array<{
    category: string;
    channelCount: number;
    totalDelta: number;
    share: number;
  }>;
  topDeltas: DeltaData[];
  newcomers: ChannelData[];
  trendingKeywords: Array<{
    keyword: string;
    count: number;
    growth: number;
  }>;
  topShorts: Array<{
    videoId: string;
    title: string;
    channelTitle: string;
    viewDelta: number;
  }>;
  followedChannels: DeltaData[];
}

// 7필드 표시 컴포넌트
function ChannelCard({ data }: { data: DeltaData }) {
  const formatMap = {
    '쇼츠': '⚡',
    '롱폼': '🎬',
    '라이브': '🔴'
  };

  return (
    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">{data.channel.title}</span>
          <span className="text-xs">{formatMap[data.channel.dominant_format]}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">구독:</span> {formatNumberKo(data.channel.subscriber_count)}
          </div>
          <div>
            <span className="text-gray-500">일일Δ:</span> 
            <span className="text-green-600 font-medium ml-1">{formatDelta(data.delta_views)}</span>
          </div>
          <div>
            <span className="text-gray-500">총:</span> {formatNumberKo(data.channel.view_count_total)}
          </div>
          <div>
            <span className="text-gray-500">성장:</span> 
            <span className="text-blue-600 ml-1">{formatPercent(data.growth_rate)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{data.channel.category}</Badge>
          {data.channel.subcategory && (
            <Badge variant="secondary" className="text-xs">{data.channel.subcategory}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function DeltaDashboard() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['yl/dash/summary', today],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: DashboardSummary }>(
        '/api/youtube-lens/trending-summary'
      );
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // 5분 캐싱
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">데이터 로드 실패</p>
        <Button onClick={() => refetch()} className="mt-4">다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">오늘의 30초</h2>
          <p className="text-muted-foreground">승인된 채널의 일일 델타 요약</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>새로고침</Button>
      </div>

      {/* 6블록 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. 카테고리 점유율 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              카테고리 점유율
            </CardTitle>
            <CardDescription>승인 채널 카테고리 분포</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.categoryStats && data.categoryStats.length > 0 ? (
              <div className="space-y-2">
                {data.categoryStats.slice(0, 5).map((stat) => (
                  <div key={stat.category} className="flex items-center justify-between">
                    <span className="text-sm">{stat.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stat.channelCount}개</Badge>
                      <span className="text-xs text-gray-500">{formatPercent(stat.share)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">데이터 없음</div>
            )}
          </CardContent>
        </Card>

        {/* 2. 급상승 키워드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              급상승 키워드
            </CardTitle>
            <CardDescription>오늘의 핫 키워드</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.trendingKeywords && data.trendingKeywords.length > 0 ? (
              <div className="space-y-2">
                {data.trendingKeywords.slice(0, 5).map((kw, idx) => (
                  <div key={kw.keyword} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                      <span className="text-sm font-medium">{kw.keyword}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {formatPercent(kw.growth)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">Phase 2 구현 예정</div>
            )}
          </CardContent>
        </Card>

        {/* 3. 신흥 채널 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              신흥 채널
            </CardTitle>
            <CardDescription>최근 승인된 채널</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.newcomers && data.newcomers.length > 0 ? (
              <div className="space-y-2">
                {data.newcomers.slice(0, 3).map((ch) => (
                  <div key={ch.channel_id} className="text-sm">
                    <div className="font-medium truncate">{ch.title}</div>
                    <div className="text-xs text-muted-foreground">
                      구독 {formatNumberKo(ch.subscriber_count)} · {ch.category}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">신규 채널 없음</div>
            )}
          </CardContent>
        </Card>

        {/* 4. Top 쇼츠 (2칸 차지) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="w-5 h-5" />
              Top 쇼츠 (어제 Δ 상위)
            </CardTitle>
            <CardDescription>전일 조회수 증가 상위 채널</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.topDeltas && data.topDeltas.length > 0 ? (
              <div className="space-y-3">
                {data.topDeltas.slice(0, 3).map((item, idx) => (
                  <div key={item.channel_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.channel.title}</div>
                        <div className="text-xs text-muted-foreground space-x-2">
                          <span>구독 {formatNumberKo(item.channel.subscriber_count)}</span>
                          <span>·</span>
                          <span>총 {formatNumberKo(item.channel.view_count_total)}</span>
                          <span>·</span>
                          <span>{item.channel.category}</span>
                          {item.channel.subcategory && (
                            <>
                              <span>·</span>
                              <span>{item.channel.subcategory}</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{item.channel.dominant_format}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {formatDelta(item.delta_views)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">데이터 수집 중...</div>
            )}
          </CardContent>
        </Card>

        {/* 5. 팔로우 채널 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              팔로우 채널
            </CardTitle>
            <CardDescription>내 팔로우 채널 업데이트</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">Phase 2 구현 예정</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}