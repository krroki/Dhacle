import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 🔒 Authentication check (MANDATORY) 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const data: VitalsData = await request.json();
    
    // Log authenticated user vitals
    console.log(`Core Web Vitals (authenticated):`, {
      metric: data.metric,
      value: data.value,
      rating: data.rating,
      url: data.url,
      userId: user.id
    });
    
    // 개발 환경에서는 로그만 남기고 반환
    if (env.NODE_ENV === 'development') {
      console.log('Core Web Vitals:', data);
      return NextResponse.json({ success: true });
    }
    
    // Supabase에 저장 (performance_metrics 테이블)
    // 위에서 생성한 supabase 인스턴스를 재사용
    
    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert({
          metric_name: data.metric,
          metric_value: data.value,
          rating: data.rating,
          page_url: data.url,
          user_agent: data.userAgent,
          navigation_type: data.navigationType,
          user_id: user?.id || null, // Include user_id if authenticated
          created_at: data.timestamp,
        });
      
      if (error) {
        console.error('Failed to save performance metrics:', error);
      } else {
        console.log('Performance metrics saved:', {
          metric: data.metric,
          value: data.value,
          rating: data.rating,
          url: data.url
        });
      }
    } catch (dbError) {
      console.error('Error saving performance metrics:', dbError);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing vitals:', error);
    return NextResponse.json(
      { error: 'Failed to process vitals' },
      { status: 500 }
    );
  }
}