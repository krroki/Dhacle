import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
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
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to analytics vitals API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const data: VitalsData = await request.json();
    
    // 개발 환경에서는 로그만 남기고 반환
    if (env.NODE_ENV === 'development') {
      console.log('Core Web Vitals:', data);
      return NextResponse.json({ success: true });
    }
    
    // Supabase에 저장 (performance_metrics 테이블)
    const supabase = await createSupabaseRouteHandlerClient();
    
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