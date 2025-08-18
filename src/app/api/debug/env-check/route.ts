// 환경 변수 체크 엔드포인트 - 프로덕션 디버깅용
// 이 엔드포인트는 Vercel에서 환경 변수가 제대로 로드되는지 확인합니다

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 보안을 위해 특정 쿼리 파라미터가 있을 때만 동작
  const searchParams = request.nextUrl.searchParams;
  const debugKey = searchParams.get('key');
  
  // 간단한 보안 체크 (프로덕션에서는 더 강력한 인증 필요)
  if (debugKey !== 'debug-dhacle-2025') {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }
  
  // 환경 변수 존재 여부 체크 (값은 노출하지 않음)
  const envCheck = {
    timestamp: new Date().toISOString(),
    runtime: {
      nodeEnv: process.env.NODE_ENV,
      nextRuntime: process.env.NEXT_RUNTIME,
      vercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
      vercelRegion: process.env.VERCEL_REGION
    },
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
      serviceRoleKeyFirst4: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 4)
    },
    encryption: {
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
      encryptionKeyLength: process.env.ENCRYPTION_KEY?.length,
      isValid64Chars: process.env.ENCRYPTION_KEY?.length === 64,
      first4Chars: process.env.ENCRYPTION_KEY?.substring(0, 4)
    },
    payment: {
      hasTossClientKey: !!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
      hasTossSecretKey: !!process.env.TOSS_SECRET_KEY
    },
    processInfo: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  // 환경 변수 문제 진단
  const issues = [];
  
  if (!envCheck.supabase.hasUrl) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is missing');
  }
  
  if (!envCheck.supabase.hasAnonKey) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  }
  
  if (!envCheck.supabase.hasServiceRoleKey) {
    issues.push('SUPABASE_SERVICE_ROLE_KEY is missing');
  }
  
  if (!envCheck.encryption.hasEncryptionKey) {
    issues.push('ENCRYPTION_KEY is missing');
  } else if (!envCheck.encryption.isValid64Chars) {
    issues.push(`ENCRYPTION_KEY should be 64 chars, got ${envCheck.encryption.encryptionKeyLength}`);
  }
  
  return NextResponse.json({
    success: issues.length === 0,
    issues,
    envCheck,
    recommendation: issues.length > 0 
      ? 'Check Vercel dashboard > Settings > Environment Variables'
      : 'All required environment variables are present'
  });
}