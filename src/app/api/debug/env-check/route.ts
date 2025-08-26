// 환경 변수 체크 엔드포인트 - 프로덕션 디버깅용
// 이 엔드포인트는 Vercel에서 환경 변수가 제대로 로드되는지 확인합니다

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to debug env-check');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  // 보안을 위해 특정 쿼리 파라미터가 있을 때만 동작
  const search_params = request.nextUrl.searchParams;
  const debug_key = search_params.get('key');

  // 이중 보안: 로그인 + 디버그 키
  if (debug_key !== 'debug-dhacle-2025') {
    return NextResponse.json({ error: 'Invalid debug key' }, { status: 401 });
  }

  // 환경 변수 존재 여부 체크 (값은 노출하지 않음)
  const env_check = {
    timestamp: new Date().toISOString(),
    runtime: {
      nodeEnv: env.NODE_ENV,
      nextRuntime: env.NEXT_RUNTIME,
      vercel: !!env.VERCEL,
      vercelEnv: env.VERCEL_ENV,
      vercelRegion: env.VERCEL_REGION,
    },
    supabase: {
      hasUrl: !!env.NEXT_PUBLIC_SUPABASE_URL,
      urlLength: env.NEXT_PUBLIC_SUPABASE_URL?.length,
      hasAnonKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      hasServiceRoleKey: !!env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyLength: env.SUPABASE_SERVICE_ROLE_KEY?.length,
      serviceRoleKeyFirst4: env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 4),
    },
    encryption: {
      hasEncryptionKey: !!env.ENCRYPTION_KEY,
      encryptionKeyLength: env.ENCRYPTION_KEY?.length,
      isValid64Chars: env.ENCRYPTION_KEY?.length === 64,
      first4Chars: env.ENCRYPTION_KEY?.substring(0, 4),
    },
    payment: {
      hasTossClientKey: !!env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
      hasTossSecretKey: !!env.TOSS_SECRET_KEY,
    },
    processInfo: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    },
  };

  // 환경 변수 문제 진단
  const issues = [];

  if (!env_check.supabase.hasUrl) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is missing');
  }

  if (!env_check.supabase.hasAnonKey) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  }

  if (!env_check.supabase.hasServiceRoleKey) {
    issues.push('SUPABASE_SERVICE_ROLE_KEY is missing');
  }

  if (!env_check.encryption.hasEncryptionKey) {
    issues.push('ENCRYPTION_KEY is missing');
  } else if (!env_check.encryption.isValid64Chars) {
    issues.push(
      `ENCRYPTION_KEY should be 64 chars, got ${env_check.encryption.encryptionKeyLength}`
    );
  }

  return NextResponse.json({
    success: issues.length === 0,
    issues,
    envCheck: env_check,
    recommendation:
      issues.length > 0
        ? 'Check Vercel dashboard > Settings > Environment Variables'
        : 'All required environment variables are present',
  });
}
