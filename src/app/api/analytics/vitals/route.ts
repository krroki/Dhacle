import { NextResponse } from 'next/server';
// import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';

// Vitals 데이터 스키마
interface VitalsData {
  metric: string;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const data: VitalsData = await request.json();
    
    // 개발 환경에서는 로그만 남기고 반환
    if (process.env.NODE_ENV === 'development') {
      console.log('Core Web Vitals:', data);
      return NextResponse.json({ success: true });
    }
    
    // Supabase에 저장 (performance_metrics 테이블이 있는 경우)
    // TODO: performance_metrics 테이블 생성 후 아래 코드 활성화
    // const supabase = await createSupabaseRouteHandlerClient();
    // 
    // try {
    //   const { error } = await supabase
    //     .from('performance_metrics')
    //     .insert({
    //       metric_name: data.metric,
    //       value: data.value,
    //       rating: data.rating,
    //       page_url: data.url,
    //       user_agent: data.userAgent,
    //       navigation_type: data.navigationType,
    //       created_at: data.timestamp,
    //     });
    //   
    //   if (error) {
    //     console.error('Failed to save performance metrics:', error);
    //   }
    // } catch (_dbError) {
    //   console.log('Performance metrics table not found, skipping save');
    // }
    
    // 현재는 로그만 남기고 성공 반환
    console.log('Performance metrics received:', {
      metric: data.metric,
      value: data.value,
      rating: data.rating,
      url: data.url
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing vitals:', error);
    return NextResponse.json(
      { error: 'Failed to process vitals' },
      { status: 500 }
    );
  }
}