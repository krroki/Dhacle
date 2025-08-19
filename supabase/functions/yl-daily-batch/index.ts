// Supabase Edge Function for YouTube Lens Daily Batch
// Deploy: supabase functions deploy yl-daily-batch
// Schedule: 매일 오전 5시 KST (UTC+9)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BatchResult {
  success: boolean;
  processed: number;
  errors: string[];
  timestamp: string;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ytAdminKey = Deno.env.get('YT_ADMIN_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 크론 인증 체크 (Supabase Scheduler가 호출)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('Bearer')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: BatchResult = {
      success: false,
      processed: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // 1. 승인된 채널 목록 가져오기
    const { data: channels, error: channelError } = await supabase
      .from('yl_channels')
      .select('channel_id')
      .eq('approval_status', 'approved');

    if (channelError) {
      results.errors.push(`Failed to fetch channels: ${channelError.message}`);
      return new Response(JSON.stringify(results), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!channels || channels.length === 0) {
      results.success = true;
      results.errors.push('No approved channels to process');
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. YouTube API로 채널 통계 수집 (50개씩 배치)
    const YT_BASE = 'https://www.googleapis.com/youtube/v3';
    const chunks = [];
    for (let i = 0; i < channels.length; i += 50) {
      chunks.push(channels.slice(i, i + 50));
    }

    const allStats = [];
    for (const chunk of chunks) {
      const ids = chunk.map(c => c.channel_id).join(',');
      const url = `${YT_BASE}/channels?part=statistics,snippet&id=${ids}&key=${ytAdminKey}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
          results.errors.push(`YouTube API error: ${data.error.message}`);
          continue;
        }
        
        if (data.items) {
          allStats.push(...data.items);
        }
      } catch (error) {
        results.errors.push(`Failed to fetch YouTube data: ${error.message}`);
      }
    }

    // 3. 스냅샷 저장
    const today = new Date().toISOString().split('T')[0];
    const snapshots = allStats.map(item => ({
      channel_id: item.id,
      date: today,
      view_count_total: parseInt(item.statistics.viewCount || '0'),
      subscriber_count: parseInt(item.statistics.subscriberCount || '0'),
      video_count: parseInt(item.statistics.videoCount || '0'),
    }));

    if (snapshots.length > 0) {
      const { error: snapshotError } = await supabase
        .from('yl_channel_daily_snapshot')
        .upsert(snapshots, { onConflict: 'channel_id,date' });
      
      if (snapshotError) {
        results.errors.push(`Failed to save snapshots: ${snapshotError.message}`);
      }
    }

    // 4. 델타 계산
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const { data: yesterdaySnapshots, error: yesterdayError } = await supabase
      .from('yl_channel_daily_snapshot')
      .select('*')
      .eq('date', yesterday);

    if (!yesterdayError && yesterdaySnapshots && yesterdaySnapshots.length > 0) {
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
          growth_rate: parseFloat(growthRate),
        };
      });

      const { error: deltaError } = await supabase
        .from('yl_channel_daily_delta')
        .upsert(deltas, { onConflict: 'channel_id,date' });
      
      if (deltaError) {
        results.errors.push(`Failed to save deltas: ${deltaError.message}`);
      }
    }

    // 5. 30일 이상 된 데이터 삭제
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    
    const { error: cleanupError1 } = await supabase
      .from('yl_channel_daily_snapshot')
      .delete()
      .lt('date', thirtyDaysAgo);
    
    const { error: cleanupError2 } = await supabase
      .from('yl_channel_daily_delta')
      .delete()
      .lt('date', thirtyDaysAgo);
    
    if (cleanupError1 || cleanupError2) {
      results.errors.push('Some cleanup operations failed');
    }

    // 6. 결과 반환
    results.success = results.errors.length === 0;
    results.processed = allStats.length;

    // 로그 저장
    await supabase.from('yl_batch_logs').insert({
      function_name: 'yl-daily-batch',
      success: results.success,
      processed_count: results.processed,
      errors: results.errors,
      executed_at: results.timestamp,
    });

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Batch processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});