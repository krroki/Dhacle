# Environment Variables Reference

## 📌 문서 관리 지침
**목적**: 환경변수 전체 목록 - 이름, 타입, 기본값, 설명, 사용처 완전 데이터
**대상**: 모든 AI (환경변수 설정이나 접근이 필요한 경우)
**범위**: 환경변수 사양만 포함 (설정 방법이나 사용법 없음)
**업데이트 기준**: src/env.ts 파일 변경 시 자동 업데이트
**최대 길이**: 5000 토큰 (현재 약 3500 토큰)
**연관 문서**: [Lib Agent](../../src/lib/CLAUDE.md), [프로젝트 구조](./project-structure.md)

## ⚠️ 금지사항
- 환경변수 설정 방법이나 사용 예제 추가 금지 (→ how-to/ 문서로 이관)
- .env 파일 관리 방법이나 보안 가이드 추가 금지 (→ how-to/ 문서로 이관)
- T3 Env 설계 철학이나 배경 설명 추가 금지 (→ explanation/ 문서로 이관)

---

**Project**: Dhacle - YouTube Creator Tools Platform  
**Last Updated**: 2025-08-31  
**Configuration File**: `src/env.ts`  
**Validation Framework**: T3 Environment Variables ([@t3-oss/env-nextjs](https://github.com/t3-oss/t3-env))  

## Overview

Dhacle uses a type-safe environment variable system powered by Zod schema validation. All environment variables are defined in `src/env.ts` and validated at build time.

**Key Features**:
- **Type Safety**: Full TypeScript support with auto-completion
- **Runtime Validation**: Zod schema validation prevents invalid configurations
- **Client/Server Separation**: Clear separation of client and server-side variables
- **Development Support**: Special handling for development and testing environments

## Usage Pattern

```typescript
// ✅ Correct usage - Type safe with validation
import { env } from '@/env';
console.log(env.DATABASE_URL); // Fully typed, validated

// ❌ Incorrect usage - No validation, not type-safe
console.log(process.env.DATABASE_URL); // Avoid direct access
```

## Server-Side Variables (27 variables)

These variables are only available on the server side and never exposed to the client.

### 🔒 Required Variables

#### Database & Storage
| Variable | Type | Purpose | Example |
|----------|------|---------|---------|
| `DATABASE_URL` | `z.string().url()` | Supabase PostgreSQL connection string | `postgresql://...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `z.string().min(1)` | Supabase service role key for admin operations | `eyJhbGciOiJIUzI1...` |

#### Security & Encryption
| Variable | Type | Purpose | Example |
|----------|------|---------|---------|
| `ENCRYPTION_KEY` | `z.string().length(64)` | 64-character encryption key for sensitive data | `abcd1234...` (64 chars) |
| `JWT_SECRET` | `z.string().min(32)` | JWT signing secret (minimum 32 characters) | `super-secret-jwt-key-here...` |

#### External APIs
| Variable | Type | Purpose | Example |
|----------|------|---------|---------|
| `YOUTUBE_API_KEY` | `z.string().min(1)` | YouTube Data API v3 key | `AIzaSyD...` |
| `NODE_ENV` | `z.enum(["development", "test", "production"])` | Node.js environment | `production` |

### ⚙️ Optional Variables

#### AI & Analysis
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `OPENAI_API_KEY` | `z.string().min(1).optional()` | OpenAI API key for AI features | `undefined` |
| `YT_ADMIN_KEY` | `z.string().optional()` | Special YouTube admin API key | `undefined` |

#### Payment Systems
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `TOSS_SECRET_KEY` | `z.string().startsWith("test_sk_").optional()` | TossPayments secret key | `undefined` |

#### Cloud Services
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | `z.string().optional()` | Cloudflare account identifier | `undefined` |
| `CLOUDFLARE_STREAM_TOKEN` | `z.string().optional()` | Cloudflare Stream API token | `undefined` |
| `CLOUDFLARE_CUSTOMER_SUBDOMAIN` | `z.string().optional()` | Cloudflare customer subdomain | `undefined` |

#### Redis Caching
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `REDIS_URL` | `z.string().url().optional()` | Redis connection URL | `undefined` |
| `REDIS_HOST` | `z.string().optional()` | Redis host address | `undefined` |
| `REDIS_PORT` | `z.string().optional()` | Redis port number | `undefined` |
| `REDIS_TTL` | `z.string().optional().default("3600")` | Redis TTL in seconds | `"3600"` |

#### Email Configuration
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `SMTP_HOST` | `z.string().optional()` | SMTP server hostname | `undefined` |
| `SMTP_PORT` | `z.coerce.number().optional()` | SMTP server port | `undefined` |
| `SMTP_USER` | `z.string().email().optional()` | SMTP username (email) | `undefined` |
| `SMTP_PASS` | `z.string().optional()` | SMTP password | `undefined` |

#### Monitoring & Analytics
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `SENTRY_DSN` | `z.string().url().optional()` | Sentry DSN for error monitoring | `undefined` |

#### Admin Configuration
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `ADMIN_USER_IDS` | `z.string().optional()` | Comma-separated admin user IDs | `undefined` |
| `ADMIN_EMAILS` | `z.string().optional()` | Comma-separated admin email addresses | `undefined` |

#### Testing Environment
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `TEST_ADMIN_EMAIL` | `z.string().email().optional()` | Test admin email for development | `undefined` |
| `TEST_ADMIN_PASSWORD` | `z.string().min(1).optional()` | Test admin password | `undefined` |
| `TEST_ADMIN_USER_ID` | `z.string().optional()` | Test admin user ID | `undefined` |

#### Deployment Platform
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `VERCEL` | `z.string().optional()` | Vercel deployment flag | `undefined` |
| `VERCEL_ENV` | `z.enum(['development', 'preview', 'production']).optional()` | Vercel environment | `undefined` |
| `VERCEL_REGION` | `z.string().optional()` | Vercel deployment region | `undefined` |
| `VERCEL_URL` | `z.string().optional()` | Vercel deployment URL | `undefined` |
| `NEXT_RUNTIME` | `z.string().optional()` | Next.js runtime configuration | `undefined` |

## Client-Side Variables (10 variables)

These variables are prefixed with `NEXT_PUBLIC_` and are available in the browser.

### 🌐 Required Variables

#### Supabase Configuration
| Variable | Type | Purpose | Example |
|----------|------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `z.string().url()` | Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `z.string().min(1)` | Supabase anonymous key | `eyJhbGciOiJIUzI1...` |

#### Application URLs
| Variable | Type | Purpose | Example |
|----------|------|---------|---------|
| `NEXT_PUBLIC_APP_URL` | `z.string().url()` | Primary application URL | `https://dhacle.com` |
| `NEXT_PUBLIC_API_URL` | `z.string().url()` | API base URL | `https://dhacle.com/api` |

### ⚙️ Optional Client Variables

#### Application Configuration
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | `z.string().url().optional()` | Canonical site URL | `undefined` |
| `NEXT_PUBLIC_TIMEOUT` | `z.coerce.number().default(30000)` | API timeout in milliseconds | `30000` |

#### Feature Flags
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `z.coerce.boolean().default(false)` | Enable analytics tracking | `false` |
| `NEXT_PUBLIC_ENABLE_PWA` | `z.coerce.boolean().default(false)` | Enable Progressive Web App features | `false` |

#### Payment Systems (Client)
| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | `z.string().startsWith("test_ck_").optional()` | TossPayments client key | `undefined` |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | `z.string().optional()` | Stripe publishable key | `undefined` |

## Environment Configuration

### Development Setup

Create a `.env.local` file in the project root:

```bash
# Required - Database
DATABASE_URL="postgresql://..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1..."

# Required - Security
ENCRYPTION_KEY="abcd1234..." # Must be exactly 64 characters
JWT_SECRET="super-secret-jwt-key-here-minimum-32-chars"

# Required - External APIs
YOUTUBE_API_KEY="AIzaSyD..."

# Required - Client Configuration
NEXT_PUBLIC_SUPABASE_URL="https://xyz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Optional - Admin Configuration
ADMIN_EMAILS="admin@dhacle.com,admin2@dhacle.com"
ADMIN_USER_IDS="uuid1,uuid2"

# Optional - Development/Testing
TEST_ADMIN_EMAIL="test-admin@example.com"
TEST_ADMIN_PASSWORD="test-password-123"
NODE_ENV="development"

# Optional - Feature Toggles
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
NEXT_PUBLIC_ENABLE_PWA="false"

# Optional - AI Features
OPENAI_API_KEY="sk-..."

# Optional - Payment (Development)
TOSS_SECRET_KEY="test_sk_..."
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."

# Optional - Cloud Services
CLOUDFLARE_ACCOUNT_ID="..."
CLOUDFLARE_STREAM_TOKEN="..."
CLOUDFLARE_CUSTOMER_SUBDOMAIN="..."

# Optional - Caching
REDIS_URL="redis://localhost:6379"
REDIS_TTL="3600"

# Optional - Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@dhacle.com"
SMTP_PASS="email-password"

# Optional - Monitoring
SENTRY_DSN="https://..."
```

### Production Environment

```bash
# Core Production Variables (Required)
DATABASE_URL="postgresql://production..."
SUPABASE_SERVICE_ROLE_KEY="production-service-key..."
ENCRYPTION_KEY="production-64-char-encryption-key..."
JWT_SECRET="production-jwt-secret-minimum-32-chars..."
YOUTUBE_API_KEY="production-youtube-api-key..."

# Client Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL="https://prod.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="production-anon-key..."
NEXT_PUBLIC_APP_URL="https://dhacle.com"
NEXT_PUBLIC_API_URL="https://dhacle.com/api"

# Admin Configuration
ADMIN_EMAILS="glemfkcl@naver.com,admin@dhacle.com"

# Environment
NODE_ENV="production"
VERCEL_ENV="production"

# Production Features
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
OPENAI_API_KEY="production-openai-key..."
SENTRY_DSN="https://production-sentry-dsn..."

# Production Payment Systems
TOSS_SECRET_KEY="live_sk_..."
NEXT_PUBLIC_TOSS_CLIENT_KEY="live_ck_..."
```

## Validation Features

### Schema Validation

The environment variables are validated using Zod schemas:

```typescript
// Example validation rules
server: {
  DATABASE_URL: z.string().url(),           // Must be valid URL
  ENCRYPTION_KEY: z.string().length(64),    // Exactly 64 characters
  JWT_SECRET: z.string().min(32),           // Minimum 32 characters
  TOSS_SECRET_KEY: z.string().startsWith("test_sk_").optional(), // Must start with prefix
}
```

### Build-Time Validation

Variables are validated at build time:

```bash
# Will fail if required variables are missing or invalid
npm run build

# Skip validation for development (not recommended)
SKIP_ENV_VALIDATION=true npm run build
```

### Runtime Access

```typescript
import { env } from '@/env';

// ✅ Type-safe access with validation
const dbUrl = env.DATABASE_URL;           // string (validated URL)
const timeout = env.NEXT_PUBLIC_TIMEOUT;  // number (default: 30000)
const adminEmails = env.ADMIN_EMAILS;     // string | undefined

// ✅ Client-side variables available in browser
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL; // Available client-side

// ❌ Server variables not available client-side
// const dbUrl = env.DATABASE_URL; // undefined in browser
```

## Special Configurations

### Admin Access Control

**Fallback Admin System**:
```typescript
// Admin emails are configured with fallback
const adminEmails = env.ADMIN_EMAILS?.split(',') || ['glemfkcl@naver.com'];

// Development environments can use test admin
if (env.NODE_ENV !== 'production' && env.TEST_ADMIN_EMAIL) {
  adminEmails.push(env.TEST_ADMIN_EMAIL);
}
```

### Environment-Specific Behavior

```typescript
// Different behavior based on environment
if (env.NODE_ENV === 'production') {
  // Production-only configuration
} else if (env.NODE_ENV === 'development') {
  // Development-only features
} else if (env.NODE_ENV === 'test') {
  // Test environment setup
}
```

### Feature Flags

```typescript
// Feature toggles via environment
if (env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
  // Initialize analytics
}

if (env.NEXT_PUBLIC_ENABLE_PWA) {
  // Enable PWA features
}
```

## Security Considerations

### Sensitive Data Protection

1. **Server-Only Variables**: Database URLs, service keys never exposed to client
2. **Encryption Keys**: 64-character encryption key for sensitive data storage
3. **JWT Secrets**: Minimum 32-character secrets for token security
4. **API Key Storage**: Third-party API keys encrypted before database storage

### Development vs Production

```typescript
// Development safeguards
if (env.NODE_ENV !== 'production') {
  console.log('Debug info:', { userEmail: user.email, adminEmails });
}

// Production-only security measures
if (env.NODE_ENV === 'production') {
  // Enhanced security logging
  // Rate limiting
  // Additional validation
}
```

### API Key Prefixes

```typescript
// Environment-specific API key validation
TOSS_SECRET_KEY: z.string().startsWith("test_sk_").optional(),     // Development
NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().startsWith("test_ck_").optional(), // Development

// Production would use:
// "live_sk_..." and "live_ck_..." prefixes
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check for missing required variables
   npm run build
   # Error: "DATABASE_URL" is required but not provided
   ```

2. **Type Errors**:
   ```typescript
   // ❌ Wrong type usage
   const port = env.SMTP_PORT; // Type: number | undefined
   
   // ✅ Correct handling
   const port = env.SMTP_PORT ?? 587;
   ```

3. **Client-Side Access**:
   ```typescript
   // ❌ Server variable in client code
   console.log(env.DATABASE_URL); // undefined in browser
   
   // ✅ Client variable in client code
   console.log(env.NEXT_PUBLIC_APP_URL); // Works in browser
   ```

### Validation Debugging

```bash
# Enable validation debugging
DEBUG=env npm run build

# Skip validation temporarily (development only)
SKIP_ENV_VALIDATION=true npm run dev
```

### Environment Loading Order

Next.js loads environment files in this order:
1. `.env.local` (always loaded, ignored by git)
2. `.env.${NODE_ENV}` (e.g., `.env.production`)
3. `.env` (fallback for shared variables)

## Best Practices

### Variable Naming
- **Server variables**: Use descriptive names without prefixes
- **Client variables**: Always use `NEXT_PUBLIC_` prefix
- **Secrets**: Use `_KEY`, `_SECRET`, `_TOKEN` suffixes
- **URLs**: Use `_URL` suffix with proper validation

### Security
- **Never commit**: `.env.local` to version control
- **Use strong keys**: Minimum length requirements enforced
- **Validate inputs**: All variables validated at runtime
- **Environment isolation**: Different keys for dev/prod

### Performance
- **Default values**: Use `.default()` for optional variables with sensible defaults
- **Type coercion**: Use `.coerce.number()` for numeric strings
- **Minimal client exposure**: Only expose necessary variables to client

---

*This reference covers all environment variables as configured in `src/env.ts`. Keep this documentation synchronized with any changes to the environment configuration.*