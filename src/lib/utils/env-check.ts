/**
 * 환경 변수 검증 유틸리티
 * 필수 환경 변수가 설정되었는지 확인하고 디버깅 정보를 제공합니다.
 */

interface EnvCheckResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * 필수 환경 변수 검증
 */
export function checkRequiredEnvVars(): EnvCheckResult {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optional = [
    'SUPABASE_SERVICE_ROLE_KEY', // Optional - only needed for admin operations
    'ENCRYPTION_KEY', // Optional - only needed for API key encryption
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // 필수 환경 변수 체크
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // 선택적 환경 변수 체크
  for (const key of optional) {
    if (!process.env[key]) {
      warnings.push(`${key} is not set. Some features may not work.`);
    }
  }

  // ENCRYPTION_KEY 길이 체크
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 64) {
    warnings.push(`ENCRYPTION_KEY must be exactly 64 characters (current: ${process.env.ENCRYPTION_KEY.length})`);
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Supabase 연결 테스트
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  try {
    const { createSupabaseRouteHandlerClient } = await import('@/lib/supabase/server-client');
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 간단한 쿼리로 연결 테스트
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: 'Database connection failed',
        details: error,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create Supabase client',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 환경 변수 디버깅 정보 출력 (개발 환경 전용)
 */
export function logEnvDebugInfo(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const result = checkRequiredEnvVars();
  
  console.log('=== Environment Variables Check ===');
  console.log(`Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);
  
  if (result.missing.length > 0) {
    console.error('Missing required variables:', result.missing);
  }
  
  if (result.warnings.length > 0) {
    console.warn('Warnings:', result.warnings);
  }
  
  // Supabase URL 형식 체크
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    if (!supabaseUrl.includes('.supabase.co')) {
      console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL does not look like a valid Supabase URL');
    }
  }
  
  console.log('===================================');
}