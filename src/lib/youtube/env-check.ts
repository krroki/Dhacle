/**
 * YouTube Lens 환경 변수 체크 유틸리티
 */

import { env } from '@/env';

interface EnvCheckResult {
  isConfigured: boolean;
  missingVars: string[];
  warnings: string[];
}

/**
 * YouTube Lens에 필요한 환경 변수를 체크합니다.
 * 클라이언트 사이드에서도 사용 가능합니다.
 */
export function checkYouTubeEnvVars(): EnvCheckResult {
  const required_vars = {
    NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_APP_URL,
  };

  const missing_vars: string[] = [];
  const warnings: string[] = [];

  // 필수 환경 변수 체크
  Object.entries(required_vars).forEach(([key, value]) => {
    if (!value) {
      missing_vars.push(key);
    }
  });

  // localhost 경고
  if (
    required_vars.NEXT_PUBLIC_SITE_URL?.includes('localhost') &&
    typeof window !== 'undefined' &&
    !window.location.hostname.includes('localhost')
  ) {
    warnings.push('NEXT_PUBLIC_SITE_URL이 localhost로 설정되어 있지만 프로덕션에서 실행 중입니다.');
  }

  return {
    isConfigured: missing_vars.length === 0,
    missingVars: missing_vars,
    warnings,
  };
}

/**
 * 서버 사이드에서만 사용 가능한 환경 변수 체크
 */
export function checkYouTubeServerEnvVars(): EnvCheckResult {
  const server_vars = {
    ENCRYPTION_KEY: env.ENCRYPTION_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const client_check = checkYouTubeEnvVars();
  const missing_vars = [...client_check.missingVars];
  const warnings = [...client_check.warnings];

  // 서버 환경 변수 체크
  Object.entries(server_vars).forEach(([key, value]) => {
    if (!value) {
      missing_vars.push(key);
    }
  });

  // 암호화 키 길이 체크 (64자 = 32바이트 hex string)
  if (server_vars.ENCRYPTION_KEY && server_vars.ENCRYPTION_KEY.length !== 64) {
    warnings.push(
      `ENCRYPTION_KEY가 올바르지 않습니다 (현재: ${server_vars.ENCRYPTION_KEY.length}자, 필요: 64자)`
    );
  }

  return {
    isConfigured: missing_vars.length === 0 && warnings.length === 0,
    missingVars: missing_vars,
    warnings,
  };
}

/**
 * 개발 환경인지 체크
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Google OAuth URL이 올바르게 설정되었는지 체크
 */
export function validateOAuthRedirectUri(): boolean {
  const site_url = env.NEXT_PUBLIC_SITE_URL;
  if (!site_url) {
    return false;
  }

  try {
    const url = new URL(site_url);
    // localhost나 https를 사용하는지 체크
    return url.hostname === 'localhost' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
