import { NextResponse } from 'next/server';

export async function GET() {
  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // 실제 값인지 placeholder인지 체크
  const isUrlPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');
  const isKeyPlaceholder = !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here';
  
  // Supabase에서 카카오 설정 확인하기 위한 정보
  const authCallbackUrl = supabaseUrl ? `${supabaseUrl}/auth/v1/callback` : 'NOT_SET';
  const expectedCallbackUrl = 'https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback';
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV || 'local',
    
    supabase_config: {
      url_configured: !isUrlPlaceholder,
      key_configured: !isKeyPlaceholder,
      url_preview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT_SET',
      callback_url: authCallbackUrl,
      is_correct_project: authCallbackUrl === expectedCallbackUrl
    },
    
    required_settings: {
      kakao_developer_center: {
        redirect_uri: expectedCallbackUrl,
        web_platform_domains: [
          'https://dhacle.com',
          'https://www.dhacle.com',
          'https://golbwnsytwbyoneucunx.supabase.co'
        ]
      },
      
      supabase_dashboard: {
        provider: 'Kakao',
        enabled: true,
        client_id: 'Set in Supabase Dashboard (REST API Key from Kakao)',
        client_secret: 'Set in Supabase Dashboard (Client Secret from Kakao)'
      },
      
      vercel_env_vars: {
        NEXT_PUBLIC_SUPABASE_URL: 'https://golbwnsytwbyoneucunx.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGci...(your anon key)'
      }
    },
    
    troubleshooting: {
      step1: 'Check Vercel environment variables are set correctly',
      step2: 'Verify Kakao Developer Center Redirect URI matches exactly',
      step3: 'Confirm Supabase Dashboard Kakao provider is enabled',
      step4: 'Ensure all domains are added to Kakao web platform',
      step5: 'Redeploy on Vercel after setting environment variables'
    }
  });
}