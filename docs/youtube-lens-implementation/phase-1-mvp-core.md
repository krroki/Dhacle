# Phase 1: MVP 코어 구현

## 🎯 목표
- 승인 채널의 **전일 Δ 조회수** 집계 & 랭킹
- **RLS + 승인 게이트** (미승인 비노출)
- 대시보드 **"오늘의 30초"** 6블록 구현

## 📋 구현 작업 목록

### 1. 데이터베이스 설정

#### 1.1 마이그레이션 파일 생성
```sql
-- supabase/migrations/xxx_youtube_lens_delta.sql

-- 채널 마스터 테이블
CREATE TABLE yl_channels (
  channel_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  handle TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  source TEXT DEFAULT 'manual',
  subscriber_count BIGINT,
  view_count_total BIGINT,
  category TEXT,
  subcategory TEXT,
  dominant_format TEXT CHECK (dominant_format IN ('쇼츠', '롱폼', '라이브', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_yl_channels_status ON yl_channels(approval_status);
CREATE INDEX idx_yl_channels_category ON yl_channels(category, subcategory);

-- RLS 정책
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY yl_channels_select_approved ON yl_channels
  FOR SELECT USING (approval_status = 'approved');

CREATE POLICY yl_channels_admin_all ON yl_channels
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 일일 스냅샷
CREATE TABLE yl_channel_daily_snapshot (
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  view_count_total BIGINT NOT NULL,
  subscriber_count BIGINT,
  video_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(channel_id, date)
);

-- 일일 델타
CREATE TABLE yl_channel_daily_delta (
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  delta_views BIGINT NOT NULL,
  delta_subscribers BIGINT DEFAULT 0,
  growth_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(channel_id, date)
);

-- 승인 로그
CREATE TABLE yl_approval_logs (
  id SERIAL PRIMARY KEY,
  channel_id TEXT REFERENCES yl_channels(channel_id),
  action TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  before_status TEXT,
  after_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. API 엔드포인트 구현

#### 2.1 채널 통계 수집 배치
```typescript
// app/api/youtube-lens/batch/collect-stats/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Admin 체크
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 승인된 채널 목록 가져오기
    const { data: channels } = await supabase
      .from('yl_channels')
      .select('channel_id')
      .eq('approval_status', 'approved');

    if (!channels || channels.length === 0) {
      return NextResponse.json({ message: 'No approved channels' });
    }

    // 50개씩 배치 처리
    const chunks = [];
    for (let i = 0; i < channels.length; i += 50) {
      chunks.push(channels.slice(i, i + 50));
    }

    const results = [];
    for (const chunk of chunks) {
      const ids = chunk.map(c => c.channel_id).join(',');
      const url = `${YT_BASE}/channels?part=statistics,snippet&id=${ids}&key=${process.env.YT_ADMIN_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.items) {
        results.push(...data.items);
      }
    }

    // 스냅샷 저장
    const today = new Date().toISOString().split('T')[0];
    const snapshots = results.map(item => ({
      channel_id: item.id,
      date: today,
      view_count_total: parseInt(item.statistics.viewCount || '0'),
      subscriber_count: parseInt(item.statistics.subscriberCount || '0'),
      video_count: parseInt(item.statistics.videoCount || '0'),
    }));

    await supabase.from('yl_channel_daily_snapshot')
      .upsert(snapshots, { onConflict: 'channel_id,date' });

    // 델타 계산
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // 어제 스냅샷 가져오기
    const { data: yesterdaySnapshots } = await supabase
      .from('yl_channel_daily_snapshot')
      .select('*')
      .eq('date', yesterday);

    if (yesterdaySnapshots && yesterdaySnapshots.length > 0) {
      const yesterdayMap = new Map(
        yesterdaySnapshots.map(s => [s.channel_id, s])
      );

      const deltas = snapshots.map(today => {
        const yesterday = yesterdayMap.get(today.channel_id);
        const deltaViews = yesterday 
          ? Math.max(0, today.view_count_total - yesterday.view_count_total)
          : 0;
        const deltaSubscribers = yesterday
          ? today.subscriber_count - yesterday.subscriber_count
          : 0;
        const growthRate = yesterday && yesterday.view_count_total > 0
          ? ((deltaViews / yesterday.view_count_total) * 100).toFixed(2)
          : 0;

        return {
          channel_id: today.channel_id,
          date: today.date,
          delta_views: deltaViews,
          delta_subscribers: deltaSubscribers,
          growth_rate: growthRate,
        };
      });

      await supabase.from('yl_channel_daily_delta')
        .upsert(deltas, { onConflict: 'channel_id,date' });
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      date: today 
    });

  } catch (error) {
    console.error('Batch collection error:', error);
    return NextResponse.json(
      { error: 'Failed to collect stats' },
      { status: 500 }
    );
  }
}
```

#### 2.2 대시보드 요약 API
```typescript
// app/api/youtube-lens/trending-summary/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // 카테고리별 점유율
    const { data: categories } = await supabase
      .from('yl_channels')
      .select('category, subcategory')
      .eq('approval_status', 'approved');

    const categoryStats = categories?.reduce((acc: any, ch) => {
      const cat = ch.category || '기타';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Top 델타 채널
    const { data: topDeltas } = await supabase
      .from('yl_channel_daily_delta')
      .select(`
        *,
        channel:yl_channels(*)
      `)
      .eq('date', today)
      .order('delta_views', { ascending: false })
      .limit(10);

    // 신흥 채널 (최근 7일 내 신규 승인)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: newcomers } = await supabase
      .from('yl_channels')
      .select('*')
      .eq('approval_status', 'approved')
      .gte('created_at', sevenDaysAgo)
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        categoryStats,
        topDeltas,
        newcomers,
        // 키워드, Top 쇼츠는 Phase 2에서 구현
        keywords: [],
        topShorts: [],
        followUpdates: []
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
```

### 3. UI 컴포넌트 구현

#### 3.1 숫자 포맷 유틸리티
```typescript
// src/lib/youtube-lens/format-number-ko.ts
export function formatNumberKo(n: number, opts?: { 
  digitsSmall?: number; 
  digitsMan?: 0 | 1;
}): string {
  const digitsSmall = opts?.digitsSmall ?? 1;
  const digitsMan = opts?.digitsMan ?? 1;
  
  if (!isFinite(n)) return '0';
  
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  
  if (abs < 1000) return sign + String(abs);
  if (abs < 10000) {
    return sign + (abs/1000).toFixed(digitsSmall).replace(/\.0$/, '') + '천';
  }
  
  const v = abs / 10000;
  const d = v < 100 ? digitsMan : 0;
  return sign + v.toFixed(d).replace(/\.0$/, '') + '만';
}
```

#### 3.2 새 대시보드 컴포넌트
```typescript
// src/components/features/tools/youtube-lens/DeltaDashboard.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  PieChart, 
  Hash, 
  Sparkles, 
  Youtube,
  FolderOpen 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiGet } from '@/lib/api-client';
import { formatNumberKo } from '@/lib/youtube-lens/format-number-ko';

interface DashboardData {
  categoryStats: Record<string, number>;
  topDeltas: Array<{
    channel_id: string;
    delta_views: number;
    channel: {
      title: string;
      subscriber_count: number;
      view_count_total: number;
      category: string;
      subcategory: string;
      dominant_format: string;
    };
  }>;
  newcomers: Array<any>;
  keywords: Array<string>;
  topShorts: Array<any>;
  followUpdates: Array<any>;
}

export function DeltaDashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['yl/dash/summary', new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: DashboardData }>(
        '/api/youtube-lens/trending-summary'
      );
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // 5분마다 새로고침
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-gray-200" />
            <CardContent className="h-40 bg-gray-100" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">오늘의 30초</h2>
          <p className="text-muted-foreground">
            승인된 채널의 일일 성과 요약
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          새로고침
        </Button>
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
            {data?.categoryStats && (
              <div className="space-y-2">
                {Object.entries(data.categoryStats)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{category}</span>
                      <Badge variant="outline">{count}개</Badge>
                    </div>
                  ))}
              </div>
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
            <div className="text-center text-muted-foreground py-8">
              Phase 2에서 구현 예정
            </div>
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
                {data.newcomers.map((channel) => (
                  <div key={channel.channel_id} className="text-sm">
                    <div className="font-medium truncate">{channel.title}</div>
                    <div className="text-xs text-muted-foreground">
                      구독 {formatNumberKo(channel.subscriber_count)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                최근 신규 채널 없음
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Top 쇼츠 */}
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
                {data.topDeltas.slice(0, 5).map((item, index) => (
                  <div key={item.channel_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.channel.title}</div>
                        <div className="text-xs text-muted-foreground space-x-2">
                          <span>구독 {formatNumberKo(item.channel.subscriber_count)}</span>
                          <span>·</span>
                          <span>총 {formatNumberKo(item.channel.view_count_total)}</span>
                          <span>·</span>
                          <span>{item.channel.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">
                        +{formatNumberKo(item.delta_views)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                데이터 수집 중...
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. 팔로우 채널 업데이트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              팔로우 채널
            </CardTitle>
            <CardDescription>내 팔로우 채널 업데이트</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              Phase 2에서 구현 예정
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

#### 3.3 메인 페이지 수정
```typescript
// src/app/(pages)/tools/youtube-lens/page.tsx 수정 부분

// 상단에 import 추가
import { DeltaDashboard } from '@/components/features/tools/youtube-lens/DeltaDashboard';

// TabsContent 수정 (line 512 근처)
<TabsContent value="dashboard" className="space-y-4">
  {/* 기존 MetricsDashboard를 DeltaDashboard로 교체 */}
  <DeltaDashboard />
</TabsContent>
```

### 4. 관리자 채널 관리 페이지

```typescript
// src/app/(pages)/tools/youtube-lens/admin/channels/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { formatNumberKo } from '@/lib/youtube-lens/format-number-ko';
import { toast } from 'sonner';

export default function AdminChannelsPage() {
  const [newChannelId, setNewChannelId] = useState('');
  
  // 채널 목록 조회
  const { data: channels, refetch } = useQuery({
    queryKey: ['yl/admin/channels'],
    queryFn: () => apiGet('/api/youtube-lens/admin/channels'),
  });

  // 채널 추가
  const addChannelMutation = useMutation({
    mutationFn: (channelId: string) => 
      apiPost('/api/youtube-lens/admin/channels', { channelId }),
    onSuccess: () => {
      toast.success('채널이 추가되었습니다');
      setNewChannelId('');
      refetch();
    },
  });

  // 승인 상태 변경
  const updateStatusMutation = useMutation({
    mutationFn: ({ channelId, status }: { channelId: string; status: string }) =>
      apiPut(`/api/youtube-lens/admin/channels/${channelId}`, { 
        approval_status: status 
      }),
    onSuccess: () => {
      toast.success('상태가 변경되었습니다');
      refetch();
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">채널 관리</h1>
      
      {/* 채널 추가 */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="YouTube 채널 ID 입력"
          value={newChannelId}
          onChange={(e) => setNewChannelId(e.target.value)}
        />
        <Button 
          onClick={() => addChannelMutation.mutate(newChannelId)}
          disabled={!newChannelId}
        >
          채널 추가
        </Button>
      </div>

      {/* 채널 목록 */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>채널명</TableHead>
            <TableHead>구독자수</TableHead>
            <TableHead>총 조회수</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>형식</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels?.data?.map((channel: any) => (
            <TableRow key={channel.channel_id}>
              <TableCell>{channel.title}</TableCell>
              <TableCell>{formatNumberKo(channel.subscriber_count)}</TableCell>
              <TableCell>{formatNumberKo(channel.view_count_total)}</TableCell>
              <TableCell>{channel.category || '-'}</TableCell>
              <TableCell>{channel.dominant_format || '-'}</TableCell>
              <TableCell>
                <Select
                  value={channel.approval_status}
                  onValueChange={(status) => 
                    updateStatusMutation.mutate({ 
                      channelId: channel.channel_id, 
                      status 
                    })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">대기중</SelectItem>
                    <SelectItem value="approved">승인</SelectItem>
                    <SelectItem value="rejected">거부</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  상세
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 5. Cron Job 설정

```typescript
// vercel.json 또는 cron 설정
{
  "crons": [
    {
      "path": "/api/youtube-lens/batch/collect-stats",
      "schedule": "0 5 * * *"  // 매일 오전 5시
    }
  ]
}
```

## 🧪 테스트 체크리스트

### 단위 테스트
- [ ] `formatNumberKo()` 함수 테스트
- [ ] Delta 계산 로직 테스트 (음수 0 클립)
- [ ] API 응답 형식 검증

### E2E 테스트
- [ ] 승인 전 채널이 공용 화면에 노출되지 않음
- [ ] 대시보드 6블록이 한 화면에 표시됨
- [ ] 7필드가 모든 카드에 표시됨
- [ ] 천/만 포맷이 일관되게 적용됨

## ✅ Phase 1 완료 기준

- [ ] 1,000 채널 일일 배치 성공
- [ ] Δ 집계 정확성 확인
- [ ] 임계 필터(100K/300K) 동작
- [ ] 랭킹/카드/드로어에 7필드 표기
- [ ] 천/만 포맷 일관 적용
- [ ] RLS 정책 동작 확인

## 📌 다음 단계
Phase 2: Shorts/키워드/카테고리 구현으로 진행