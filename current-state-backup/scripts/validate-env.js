#!/usr/bin/env node

/**
 * 환경변수 검증 스크립트
 * Phase 1: 환경변수 타입 안전성
 * 
 * 사용법:
 * node scripts/validate-env.js
 * npm run env:validate
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// 아이콘
const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  check: '✓',
  cross: '✗'
};

// .env.local 파일 로드
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`${colors.blue}${icons.info} Loading environment from: ${envPath}${colors.reset}`);
} else {
  console.log(`${colors.yellow}${icons.warning} .env.local not found, using process.env${colors.reset}`);
}

// 필수 환경변수 정의
const requiredEnvVars = {
  server: [
    { name: 'DATABASE_URL', type: 'url', description: 'PostgreSQL database URL' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', type: 'string', minLength: 1, description: 'Supabase service role key' },
    { name: 'ENCRYPTION_KEY', type: 'string', length: 64, description: 'API key encryption key (64 chars)' },
    { name: 'JWT_SECRET', type: 'string', minLength: 32, description: 'JWT signing secret (min 32 chars)' },
    { name: 'YOUTUBE_API_KEY', type: 'string', minLength: 1, description: 'YouTube Data API v3 key' },
    { name: 'NODE_ENV', type: 'enum', values: ['development', 'test', 'production'], description: 'Node environment' }
  ],
  client: [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', type: 'url', description: 'Supabase project URL' },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', type: 'string', minLength: 1, description: 'Supabase anonymous key' },
    { name: 'NEXT_PUBLIC_APP_URL', type: 'url', description: 'Application URL' },
    { name: 'NEXT_PUBLIC_API_URL', type: 'url', description: 'API endpoint URL' }
  ]
};

// 선택적 환경변수 정의
const optionalEnvVars = {
  server: [
    { name: 'YT_ADMIN_KEY', type: 'string', description: 'Admin YouTube API key' },
    { name: 'OPENAI_API_KEY', type: 'string', description: 'OpenAI API key' },
    { name: 'TOSS_SECRET_KEY', type: 'string', pattern: /^test_sk_/, description: 'TossPayments secret key' },
    { name: 'CLOUDFLARE_ACCOUNT_ID', type: 'string', description: 'Cloudflare account ID' },
    { name: 'CLOUDFLARE_STREAM_TOKEN', type: 'string', description: 'Cloudflare stream token' },
    { name: 'REDIS_URL', type: 'url', description: 'Redis connection URL' },
    { name: 'SMTP_HOST', type: 'string', description: 'SMTP server host' },
    { name: 'SMTP_PORT', type: 'number', description: 'SMTP server port' },
    { name: 'SMTP_USER', type: 'email', description: 'SMTP user email' },
    { name: 'SMTP_PASS', type: 'string', description: 'SMTP password' },
    { name: 'SENTRY_DSN', type: 'url', description: 'Sentry DSN for error tracking' },
    { name: 'ADMIN_USER_IDS', type: 'string', description: 'Comma-separated admin user IDs' }
  ],
  client: [
    { name: 'NEXT_PUBLIC_SITE_URL', type: 'url', description: 'Production site URL' },
    { name: 'NEXT_PUBLIC_TIMEOUT', type: 'number', description: 'API request timeout' },
    { name: 'NEXT_PUBLIC_ENABLE_ANALYTICS', type: 'boolean', description: 'Analytics feature flag' },
    { name: 'NEXT_PUBLIC_ENABLE_PWA', type: 'boolean', description: 'PWA feature flag' },
    { name: 'NEXT_PUBLIC_TOSS_CLIENT_KEY', type: 'string', pattern: /^test_ck_/, description: 'TossPayments client key' },
    { name: 'NEXT_PUBLIC_STRIPE_PUBLIC_KEY', type: 'string', description: 'Stripe public key' }
  ]
};

// 검증 함수들
const validators = {
  url: (value) => {
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  },
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) 
      ? { valid: true }
      : { valid: false, error: 'Invalid email format' };
  },
  
  string: (value, config) => {
    if (typeof value !== 'string') {
      return { valid: false, error: 'Must be a string' };
    }
    if (config.minLength && value.length < config.minLength) {
      return { valid: false, error: `Must be at least ${config.minLength} characters` };
    }
    if (config.length && value.length !== config.length) {
      return { valid: false, error: `Must be exactly ${config.length} characters` };
    }
    if (config.pattern && !config.pattern.test(value)) {
      return { valid: false, error: `Does not match required pattern: ${config.pattern}` };
    }
    return { valid: true };
  },
  
  number: (value) => {
    const num = Number(value);
    return !isNaN(num) 
      ? { valid: true }
      : { valid: false, error: 'Must be a valid number' };
  },
  
  boolean: (value) => {
    return (value === 'true' || value === 'false' || value === '1' || value === '0')
      ? { valid: true }
      : { valid: false, error: 'Must be true/false or 1/0' };
  },
  
  enum: (value, config) => {
    return config.values.includes(value)
      ? { valid: true }
      : { valid: false, error: `Must be one of: ${config.values.join(', ')}` };
  }
};

// 환경변수 검증
function validateEnvVar(config) {
  const value = process.env[config.name];
  
  if (!value || value === '') {
    return { valid: false, error: 'Not set or empty' };
  }
  
  const validator = validators[config.type];
  if (!validator) {
    return { valid: false, error: `Unknown type: ${config.type}` };
  }
  
  return validator(value, config);
}

// 메인 검증 로직
function validateEnvironment() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}🔍 Environment Variables Validation${colors.reset}`);
  console.log('='.repeat(60) + '\n');
  
  let hasErrors = false;
  let hasWarnings = false;
  const stats = {
    required: { total: 0, valid: 0, invalid: 0 },
    optional: { total: 0, set: 0, notSet: 0 }
  };
  
  // 필수 환경변수 검증
  console.log(`${colors.blue}📋 Required Environment Variables${colors.reset}\n`);
  
  ['server', 'client'].forEach(category => {
    console.log(`${colors.gray}[${category.toUpperCase()}]${colors.reset}`);
    
    requiredEnvVars[category].forEach(config => {
      stats.required.total++;
      const result = validateEnvVar(config);
      
      if (result.valid) {
        stats.required.valid++;
        console.log(`  ${icons.check} ${colors.green}${config.name}${colors.reset}`);
        console.log(`    ${colors.gray}${config.description}${colors.reset}`);
      } else {
        stats.required.invalid++;
        hasErrors = true;
        console.log(`  ${icons.cross} ${colors.red}${config.name}${colors.reset}`);
        console.log(`    ${colors.red}Error: ${result.error}${colors.reset}`);
        console.log(`    ${colors.gray}${config.description}${colors.reset}`);
      }
    });
    
    console.log();
  });
  
  // 선택적 환경변수 검증
  console.log(`${colors.blue}📋 Optional Environment Variables${colors.reset}\n`);
  
  ['server', 'client'].forEach(category => {
    console.log(`${colors.gray}[${category.toUpperCase()}]${colors.reset}`);
    
    optionalEnvVars[category].forEach(config => {
      stats.optional.total++;
      const value = process.env[config.name];
      
      if (!value || value === '') {
        stats.optional.notSet++;
        console.log(`  ${colors.gray}○ ${config.name} (not set)${colors.reset}`);
      } else {
        stats.optional.set++;
        const result = validateEnvVar(config);
        if (result.valid) {
          console.log(`  ${icons.check} ${colors.green}${config.name}${colors.reset}`);
        } else {
          hasWarnings = true;
          console.log(`  ${icons.warning} ${colors.yellow}${config.name}${colors.reset}`);
          console.log(`    ${colors.yellow}Warning: ${result.error}${colors.reset}`);
        }
      }
    });
    
    console.log();
  });
  
  // 요약
  console.log('='.repeat(60));
  console.log(`${colors.cyan}📊 Validation Summary${colors.reset}`);
  console.log('='.repeat(60) + '\n');
  
  console.log(`Required Variables:`);
  console.log(`  Total: ${stats.required.total}`);
  console.log(`  ${colors.green}Valid: ${stats.required.valid}${colors.reset}`);
  console.log(`  ${colors.red}Invalid: ${stats.required.invalid}${colors.reset}`);
  
  console.log(`\nOptional Variables:`);
  console.log(`  Total: ${stats.optional.total}`);
  console.log(`  ${colors.green}Set: ${stats.optional.set}${colors.reset}`);
  console.log(`  ${colors.gray}Not Set: ${stats.optional.notSet}${colors.reset}`);
  
  // 최종 결과
  console.log('\n' + '='.repeat(60));
  if (hasErrors) {
    console.log(`${colors.red}${icons.error} VALIDATION FAILED${colors.reset}`);
    console.log(`${colors.red}Please fix the errors above before proceeding.${colors.reset}`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`${colors.yellow}${icons.warning} VALIDATION PASSED WITH WARNINGS${colors.reset}`);
    console.log(`${colors.yellow}Some optional variables have issues.${colors.reset}`);
  } else {
    console.log(`${colors.green}${icons.success} VALIDATION PASSED${colors.reset}`);
    console.log(`${colors.green}All environment variables are properly configured!${colors.reset}`);
  }
  console.log('='.repeat(60) + '\n');
  
  return !hasErrors;
}

// TypeScript 환경변수 타입 생성 확인
function checkTypeGeneration() {
  console.log(`${colors.blue}${icons.info} Checking TypeScript type generation...${colors.reset}`);
  
  const envTsPath = path.resolve(process.cwd(), 'src/env.ts');
  if (fs.existsSync(envTsPath)) {
    console.log(`${colors.green}${icons.check} src/env.ts found - type safety enabled${colors.reset}`);
    
    // Import 사용 확인
    console.log(`\n${colors.gray}To use typed environment variables:${colors.reset}`);
    console.log(`${colors.cyan}import { env } from '@/env';${colors.reset}`);
    console.log(`${colors.cyan}const apiKey = env.YOUTUBE_API_KEY; // Type-safe!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${icons.warning} src/env.ts not found${colors.reset}`);
    console.log(`${colors.yellow}Run 'npm run env:setup' to enable type safety${colors.reset}`);
  }
}

// 실행
if (require.main === module) {
  try {
    const isValid = validateEnvironment();
    checkTypeGeneration();
    
    if (!isValid) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}${icons.error} Validation error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

module.exports = { validateEnvironment };