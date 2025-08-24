import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side 환경변수
   */
  server: {
    // Supabase (필수)
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    
    // API Key 암호화 (필수) - 정확히 64자
    ENCRYPTION_KEY: z.string().length(64),
    
    // YouTube API
    YOUTUBE_API_KEY: z.string().optional(),
    YT_ADMIN_KEY: z.string().optional(),
    
    // TossPayments (결제 시스템)
    TOSS_SECRET_KEY: z.string().startsWith("test_sk_").optional(),
    
    // Cloudflare Stream
    CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
    CLOUDFLARE_STREAM_TOKEN: z.string().optional(),
    CLOUDFLARE_CUSTOMER_SUBDOMAIN: z.string().optional(),
    
    // Redis (캐싱)
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.string().optional(),
    
    // Admin
    ADMIN_USER_IDS: z.string().optional(),
    
    // Node 환경
    NODE_ENV: z.enum(["development", "test", "production"]),
    
    // Vercel
    VERCEL: z.string().optional(),
    VERCEL_ENV: z.string().optional(),
    VERCEL_REGION: z.string().optional(),
    VERCEL_URL: z.string().optional(),
    
    // Next.js
    NEXT_RUNTIME: z.string().optional(),
  },

  /**
   * Client-side 환경변수 (NEXT_PUBLIC_ prefix)
   */
  client: {
    // Supabase (필수)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    
    // TossPayments
    NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().startsWith("test_ck_").optional(),
    
    // Site URL
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  /**
   * 런타임 환경변수 (빌드 타임에 체크하지 않음)
   */
  runtimeEnv: {
    // Server
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    YT_ADMIN_KEY: process.env.YT_ADMIN_KEY,
    TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_STREAM_TOKEN: process.env.CLOUDFLARE_STREAM_TOKEN,
    CLOUDFLARE_CUSTOMER_SUBDOMAIN: process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    ADMIN_USER_IDS: process.env.ADMIN_USER_IDS,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    
    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * 빈 문자열을 undefined로 처리
   */
  emptyStringAsUndefined: true,
  
  /**
   * 개발 환경에서만 검증 건너뛰기 허용
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});