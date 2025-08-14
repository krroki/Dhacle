/**
 * YouTube Lens 환경 변수 체크 유틸리티
 */

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
  const requiredVars = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  };

  const missingVars: string[] = [];
  const warnings: string[] = [];

  // 필수 환경 변수 체크
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    }
  });

  // localhost 경고
  if (requiredVars.NEXT_PUBLIC_SITE_URL?.includes('localhost') && 
      typeof window !== 'undefined' && 
      !window.location.hostname.includes('localhost')) {
    warnings.push('NEXT_PUBLIC_SITE_URL이 localhost로 설정되어 있지만 프로덕션에서 실행 중입니다.');
  }

  return {
    isConfigured: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

/**
 * 서버 사이드에서만 사용 가능한 환경 변수 체크
 */
export function checkYouTubeServerEnvVars(): EnvCheckResult {
  const serverVars = {
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  };

  const clientCheck = checkYouTubeEnvVars();
  const missingVars = [...clientCheck.missingVars];
  const warnings = [...clientCheck.warnings];

  // 서버 환경 변수 체크
  Object.entries(serverVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    }
  });

  // 암호화 키 길이 체크
  if (serverVars.ENCRYPTION_KEY && serverVars.ENCRYPTION_KEY.length < 32) {
    warnings.push(`ENCRYPTION_KEY가 너무 짧습니다 (현재: ${serverVars.ENCRYPTION_KEY.length}자, 최소: 32자)`);
  }

  return {
    isConfigured: missingVars.length === 0 && warnings.length === 0,
    missingVars,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return false;

  try {
    const url = new URL(siteUrl);
    // localhost나 https를 사용하는지 체크
    return url.hostname === 'localhost' || url.protocol === 'https:';
  } catch {
    return false;
  }
}