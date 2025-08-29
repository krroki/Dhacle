import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side 환경변수
   */
  server: {
    // Supabase (필수)
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    
    // 보안 (필수)
    ENCRYPTION_KEY: z.string().length(64),
    JWT_SECRET: z.string().min(32),
    
    // YouTube API
    YOUTUBE_API_KEY: z.string().min(1),
    YT_ADMIN_KEY: z.string().optional(),
    
    // AI APIs (선택)
    OPENAI_API_KEY: z.string().min(1).optional(),
    
    // TossPayments (결제 시스템)
    TOSS_SECRET_KEY: z.string().startsWith("test_sk_").optional(),
    
    // Cloudflare Stream
    CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
    CLOUDFLARE_STREAM_TOKEN: z.string().optional(),
    CLOUDFLARE_CUSTOMER_SUBDOMAIN: z.string().optional(),
    
    // Redis (캐싱)
    REDIS_URL: z.string().url().optional(),
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.string().optional(),
    REDIS_TTL: z.string().optional().default("3600"),
    
    // 이메일 (선택)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().email().optional(),
    SMTP_PASS: z.string().optional(),
    
    // 모니터링 (선택)
    SENTRY_DSN: z.string().url().optional(),
    
    // Admin
    ADMIN_USER_IDS: z.string().optional(),
    ADMIN_EMAILS: z.string().optional(), // Comma-separated list of admin emails
    
    // Node 환경
    NODE_ENV: z.enum(["development", "test", "production"]),
    
    // E2E Test Configuration (개발 환경 전용)
    TEST_ADMIN_EMAIL: z.string().email().optional(),
    TEST_ADMIN_PASSWORD: z.string().min(1).optional(),
    TEST_ADMIN_USER_ID: z.string().optional(),
    
    // Vercel
    VERCEL: z.string().optional(),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
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
    
    // App Config (필수)
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_TIMEOUT: z.coerce.number().default(30000),
    
    // Feature Flags (선택)
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
    NEXT_PUBLIC_ENABLE_PWA: z.coerce.boolean().default(false),
    
    // Payment Systems
    NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().startsWith("test_ck_").optional(),
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().optional(),
  },

  /**
   * 런타임 환경변수 (빌드 타임에 체크하지 않음)
   */
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    YT_ADMIN_KEY: process.env.YT_ADMIN_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_STREAM_TOKEN: process.env.CLOUDFLARE_STREAM_TOKEN,
    CLOUDFLARE_CUSTOMER_SUBDOMAIN: process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_TTL: process.env.REDIS_TTL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SENTRY_DSN: process.env.SENTRY_DSN,
    ADMIN_USER_IDS: process.env.ADMIN_USER_IDS,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    TEST_ADMIN_EMAIL: process.env.TEST_ADMIN_EMAIL,
    TEST_ADMIN_PASSWORD: process.env.TEST_ADMIN_PASSWORD,
    TEST_ADMIN_USER_ID: process.env.TEST_ADMIN_USER_ID,
    
    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_TIMEOUT: process.env.NEXT_PUBLIC_TIMEOUT,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA,
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
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