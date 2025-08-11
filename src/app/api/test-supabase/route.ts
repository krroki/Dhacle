import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // 직접 Supabase 클라이언트 생성 테스트
  const supabaseUrl = 'https://golbwnsytwbyoneucunx.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbGJ3bnN5dHdieW9uZXVjdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI1MTYsImV4cCI6MjA3MDE0ODUxNn0.8EaDU4a1-FuCeWuRtK0fzxrRDuMvNwoB0a0qALDm6iM';
  
  try {
    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 간단한 테스트 - auth 상태 확인
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    // 프로젝트 health check
    const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        client_creation: 'SUCCESS',
        session_check: {
          success: !sessionError,
          error: sessionError?.message || null,
          has_session: !!session?.session
        },
        health_check: {
          status: healthCheck.status,
          status_text: healthCheck.statusText,
          ok: healthCheck.ok
        }
      },
      config: {
        url: supabaseUrl,
        key_first_10: supabaseAnonKey.substring(0, 10),
        key_last_10: supabaseAnonKey.substring(supabaseAnonKey.length - 10)
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}