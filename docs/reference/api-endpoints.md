# API Endpoints Reference

## 📌 문서 관리 지침
**목적**: API 엔드포인트 전체 목록 - 경로, 메소드, 인증, 파라미터, 리스폰스 형식 완전 데이터
**대상**: API Route Agent, Backend 개발 AI (src/app/api/** 영역 작업시)
**범위**: 엔드포인트 명세만 포함 (구현 방법이나 사용법 없음)
**업데이트 기준**: src/app/api/** 경로 파일 추가/변경 시 자동 업데이트
**최대 길이**: 12000 토큰 (현재 약 10000 토큰)
**연관 문서**: [API Route Agent](../../src/app/api/CLAUDE.md), [데이터베이스 스키마](./database-schema.md)

## ⚠️ 금지사항
- API 구현 방법이나 사용 예제 추가 금지 (→ how-to/ 문서로 이관)
- 인증 패턴이나 코드 스니펫 추가 금지 (→ how-to/ 문서로 이관)
- API 설계 철학이나 아키텍처 설명 추가 금지 (→ explanation/ 문서로 이관)

---

**Project**: Dhacle - YouTube Creator Tools Platform  
**Last Updated**: 2025-08-31  
**Total Endpoints**: 40 route files  
**Architecture**: Next.js 15 App Router + Supabase + TypeScript  

## Current State Overview

- **Total Route Files**: 40 files
- **Authentication**: Supabase Auth integration required for most endpoints
- **Authorization**: Role-based (user, instructor, admin) and email-based admin access
- **Error States**: 18+ TypeScript compilation errors currently present
- **Runtime**: Node.js runtime specified for Supabase compatibility

## Authentication Pattern

**Standard Auth Pattern (Used in all protected routes)**:
```typescript
// Step 1: Authentication check (required!)
const user = await requireAuth(request);
if (!user) {
  return NextResponse.json(
    { error: 'User not authenticated' },
    { status: 401 }
  );
}

// Alternative pattern used in some routes
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json(
    { error: 'User not authenticated' },
    { status: 401 }
  );
}
```

## API Endpoints by Category

### 1. Health & Monitoring (3 endpoints)

#### `/api/health` - System Health Check
```typescript
GET /api/health?format=detailed&fresh=true&check=database
```
**Purpose**: Comprehensive system health monitoring  
**Authentication**: None (public)  
**Parameters**:
- `format`: detailed, simple, json (default: detailed)
- `fresh`: Force fresh check (default: false)
- `check`: Specific health check name

**Response Format**:
```json
{
  "overall_status": "healthy" | "unhealthy" | "degraded",
  "summary": {
    "healthy": 8,
    "unhealthy": 0,
    "total": 8
  },
  "checks": [...],
  "execution_time": 156,
  "timestamp": "2025-08-31T..."
}
```
**Current State**: ✅ Working (comprehensive health checks)

#### `/api/errors` - Error Logging
```typescript
POST /api/errors
```
**Purpose**: Client-side error reporting and logging  
**Authentication**: Optional  
**Body**: Error details (message, stack, context)  
**Current State**: ⚠️ Type errors present

#### `/api/errors/monitoring` - Error Monitoring Dashboard
```typescript
GET /api/errors/monitoring?type=metrics&timeframe=day
POST /api/errors/monitoring
```
**Purpose**: Real-time error metrics and alerts  
**Authentication**: Required (admin for detailed access)  
**Current State**: ❌ TypeScript errors (route context type mismatch)

### 2. User Management (9 endpoints)

#### `/api/user/dashboard` - User Dashboard Data
```typescript
GET /api/user/dashboard
```
**Purpose**: User profile and statistics  
**Authentication**: Required  
**Returns**: User profile, favorites count, collections count, account age  
**Current State**: ✅ Working (references users table correctly)

#### `/api/user/profile` - User Profile Management
```typescript
GET /api/user/profile
PUT /api/user/profile
```
**Purpose**: User profile CRUD operations  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/user/api-keys` - API Key Management
```typescript
GET /api/user/api-keys
POST /api/user/api-keys
PUT /api/user/api-keys
DELETE /api/user/api-keys
```
**Purpose**: YouTube API key management  
**Authentication**: Required  
**Features**: Encrypted storage, quota tracking  
**Current State**: ✅ Working

#### `/api/user/api-keys/auto-setup` - Automated API Key Setup
```typescript
POST /api/user/api-keys/auto-setup
```
**Purpose**: Automated YouTube API key configuration  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/user/check-username` - Username Availability
```typescript
POST /api/user/check-username
```
**Purpose**: Check username availability  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/user/generate-nickname` - Random Nickname Generation
```typescript
GET /api/user/generate-nickname
```
**Purpose**: Generate random user nicknames  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/user/generate-username` - Username Generation
```typescript
GET /api/user/generate-username
```
**Purpose**: Generate available usernames  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/user/init-profile` - Profile Initialization
```typescript
POST /api/user/init-profile
```
**Purpose**: Initialize user profile after registration  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/user/naver-cafe` - Naver Cafe Integration
```typescript
GET /api/user/naver-cafe
POST /api/user/naver-cafe
PUT /api/user/naver-cafe
```
**Purpose**: Naver Cafe membership verification  
**Authentication**: Required  
**Current State**: ✅ Working

### 3. Account Management (1 endpoint)

#### `/api/account/delete` - Account Deletion
```typescript
DELETE /api/account/delete
```
**Purpose**: Permanent account deletion  
**Authentication**: Required  
**Features**: Complete data removal, audit logging  
**Current State**: ✅ Working

### 4. YouTube Core API (13 endpoints)

#### `/api/youtube/search` - YouTube Content Search
```typescript
GET /api/youtube/search?q=query&type=video&maxResults=10
```
**Purpose**: YouTube content search with API key validation  
**Authentication**: Required  
**Parameters**: q (query), type, maxResults, channelId  
**Current State**: ✅ Working

#### `/api/youtube/validate-key` - API Key Validation
```typescript
POST /api/youtube/validate-key
```
**Purpose**: Validate YouTube API key functionality  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube/analysis` - Video Analysis
```typescript
POST /api/youtube/analysis
```
**Purpose**: Comprehensive video content analysis  
**Authentication**: Required  
**Features**: Transcript analysis, metrics extraction  
**Current State**: ⚠️ References analytics_logs table

#### `/api/youtube/batch` - Batch Operations
```typescript
POST /api/youtube/batch
```
**Purpose**: Bulk YouTube operations  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube/collections` - Video Collections
```typescript
GET /api/youtube/collections
POST /api/youtube/collections
PUT /api/youtube/collections
DELETE /api/youtube/collections
```
**Purpose**: User video collection management  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube/collections/items` - Collection Items
```typescript
GET /api/youtube/collections/items
POST /api/youtube/collections/items
DELETE /api/youtube/collections/items
```
**Purpose**: Manage items within collections  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube/favorites` - Favorites Management
```typescript
GET /api/youtube/favorites
POST /api/youtube/favorites
DELETE /api/youtube/favorites
```
**Purpose**: User favorite videos management  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube/favorites/[id]` - Individual Favorite
```typescript
GET /api/youtube/favorites/[id]
PUT /api/youtube/favorites/[id]
DELETE /api/youtube/favorites/[id]
```
**Purpose**: Individual favorite video operations  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube/folders` - Folder Management
```typescript
GET /api/youtube/folders
POST /api/youtube/folders
PUT /api/youtube/folders
DELETE /api/youtube/folders
```
**Purpose**: YouTube content folder organization  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube/metrics` - YouTube Metrics
```typescript
GET /api/youtube/metrics?videoId=abc123
```
**Purpose**: Video and channel metrics extraction  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube/popular` - Popular Content
```typescript
GET /api/youtube/popular?category=all&region=US
```
**Purpose**: Trending and popular YouTube content  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube/subscribe` - Channel Subscription
```typescript
POST /api/youtube/subscribe
DELETE /api/youtube/subscribe
```
**Purpose**: YouTube channel subscription management  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube/webhook` - YouTube Webhooks
```typescript
POST /api/youtube/webhook
```
**Purpose**: YouTube PubSubHubbub webhook handler  
**Authentication**: None (webhook endpoint)  
**Current State**: ✅ Working

### 5. YouTube Lens Tool API (5 endpoints)

Advanced YouTube analytics and monitoring features.

#### `/api/youtube-lens/admin/channels` - Channel Administration
```typescript
GET /api/youtube-lens/admin/channels
POST /api/youtube-lens/admin/channels
```
**Purpose**: Admin channel management and approval  
**Authentication**: Admin only (email-based)  
**Admin Emails**: Environment variable + fallback system  
**Current State**: ✅ Working (comprehensive admin auth)

#### `/api/youtube-lens/admin/channels/[channelId]` - Individual Channel Admin
```typescript
GET /api/youtube-lens/admin/channels/[channelId]
PUT /api/youtube-lens/admin/channels/[channelId]
DELETE /api/youtube-lens/admin/channels/[channelId]
```
**Purpose**: Individual channel administration  
**Authentication**: Admin only  
**Current State**: ✅ Working

#### `/api/youtube-lens/admin/channel-stats` - Channel Statistics
```typescript
GET /api/youtube-lens/admin/channel-stats
```
**Purpose**: Aggregated channel statistics for admins  
**Authentication**: Admin only  
**Current State**: ✅ Working

#### `/api/youtube-lens/admin/approval-logs/[channelId]` - Approval Logs
```typescript
GET /api/youtube-lens/admin/approval-logs/[channelId]
```
**Purpose**: Channel approval audit logs  
**Authentication**: Admin only  
**Current State**: ✅ Working

#### `/api/youtube-lens/categories` - Content Categories
```typescript
GET /api/youtube-lens/categories
POST /api/youtube-lens/categories
```
**Purpose**: YouTube content category management  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube-lens/keywords/trends` - Keyword Trends
```typescript
GET /api/youtube-lens/keywords/trends?period=7d
```
**Purpose**: Keyword trending analysis  
**Authentication**: Required  
**Current State**: ✅ Working

#### `/api/youtube-lens/trending-summary` - Trending Summary
```typescript
GET /api/youtube-lens/trending-summary
```
**Purpose**: Aggregated trending content summary  
**Authentication**: Required  
**Current State**: ✅ Working

### 6. Admin & System (4 endpoints)

#### `/api/admin/verify-naver` - Naver Cafe Verification
```typescript
POST /api/admin/verify-naver
```
**Purpose**: Admin verification of Naver Cafe memberships  
**Authentication**: Admin only  
**Current State**: ✅ Working

#### `/api/admin/video/upload` - Admin Video Upload
```typescript
POST /api/admin/video/upload
```
**Purpose**: Administrative video upload functionality  
**Authentication**: Admin only  
**Current State**: ✅ Working (Cloudflare Stream integration)

#### `/api/analytics/vitals` - Web Vitals Analytics
```typescript
POST /api/analytics/vitals
```
**Purpose**: Core Web Vitals performance data collection  
**Authentication**: Optional  
**Current State**: ✅ Working

#### `/api/notifications` - System Notifications
```typescript
GET /api/notifications
POST /api/notifications
PUT /api/notifications
```
**Purpose**: User notification management  
**Authentication**: Required  
**Current State**: ✅ Working

### 7. Development & Debug (3 endpoints)

#### `/api/debug/env-check` - Environment Check
```typescript
GET /api/debug/env-check
```
**Purpose**: Environment variable validation (development only)  
**Authentication**: None  
**Current State**: ✅ Working (development tool)

#### `/api/auth/test-login` - Test Authentication
```typescript
POST /api/auth/test-login
```
**Purpose**: Test authentication flow (development/testing)  
**Authentication**: Test only  
**Current State**: ✅ Working

#### `/api/upload` - General File Upload
```typescript
POST /api/upload
```
**Purpose**: General file upload endpoint  
**Authentication**: Required  
**Current State**: ✅ Working

## Common Error States

### Current TypeScript Errors (18+ errors)

1. **Route Context Type Mismatch** (`/api/errors/monitoring`)
   ```typescript
   // Error: Type mismatch in route handler signature
   export async function GET(
     request: NextRequest,
     _context: { params: Record<string, string> } // Should be Promise<any>
   ): Promise<NextResponse>
   ```

2. **Error Type Mismatches** (Multiple files)
   ```typescript
   // Error: Type incompatibility in error handling
   error: "NETWORK_ERROR" // Not in allowed union type
   ```

3. **Provider Type Issues** (`ErrorNotificationProvider`)
   ```typescript
   // Error: Property 'method' does not exist on type 'ErrorContext'
   ```

4. **UI Component Type Issues** (`error-display.tsx`)
   ```typescript
   // Error: Type 'string' is not assignable to type '"default" | "destructive"'
   ```

### Database Reference Issues

**Potential Missing Tables**:
- Some API endpoints reference tables that may not exist in current schema
- `analytics_logs` table referenced but may not be created in all environments
- YouTube Lens tables may have inconsistent schema across migrations

## API Response Patterns

### Success Response Format
```typescript
// Standard success format
{
  data: T,
  meta?: {
    page?: number,
    limit?: number,
    total?: number
  }
}

// Alternative format for some endpoints
{
  success: true,
  message: "Operation completed",
  data: T
}
```

### Error Response Format
```typescript
// Standard error format
{
  error: string,
  details?: string,
  code?: string,
  timestamp?: string
}

// Development mode includes debug info
{
  error: string,
  debug?: {
    userEmail: string,
    adminEmails: string[]
  }
}
```

### HTTP Status Codes Used
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not authorized)
- `404`: Not Found
- `429`: Too Many Requests (rate limiting)
- `500`: Internal Server Error
- `503`: Service Unavailable (health checks)

## Authentication & Authorization

### Authentication Methods
1. **Supabase JWT**: Primary authentication via `supabase.auth.getUser()`
2. **requireAuth**: Helper function for consistent auth checks
3. **API Keys**: For YouTube API integration (encrypted storage)

### Authorization Levels
1. **Public**: Health check, webhooks
2. **Authenticated**: Most user endpoints
3. **Admin (Role-based)**: Uses `users.role = 'admin'`
4. **Admin (Email-based)**: Uses environment variable `ADMIN_EMAILS`

### Admin Access Pattern
```typescript
// Email-based admin check (YouTube Lens)
const adminEmails = env.ADMIN_EMAILS?.split(',') || ['glemfkcl@naver.com'];
if (!adminEmails.includes(user.email || '')) {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
}

// Role-based admin check (general admin)
const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'admin') {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
}
```

## Performance & Caching

### Caching Strategies
```typescript
// User-specific private caching
headers: {
  'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60'
}

// Public caching with fresh option
headers: {
  'Cache-Control': fresh ? 'no-cache' : 'public, max-age=60'
}
```

### Rate Limiting
- **API Key Quotas**: Tracked in `api_usage` table
- **User Rate Limiting**: Implemented in some endpoints
- **Health Check Caching**: 60-second cache for health endpoints

## Integration Points

### External APIs
1. **YouTube Data API v3**: Video search, metrics, channel data
2. **Supabase Auth**: User authentication and management
3. **Cloudflare Stream**: Video upload and streaming
4. **OpenAI API**: AI-powered analysis features (optional)

### Internal Services
1. **Health Checker**: System health monitoring
2. **Error Monitoring**: Real-time error tracking
3. **API Client**: Standardized HTTP client
4. **Logger**: Structured logging system

## Security Features

### Input Validation
- **Zod Schema Validation**: Used in multiple endpoints
- **SQL Injection Protection**: Supabase ORM provides protection
- **XSS Protection**: Input sanitization

### API Security
- **CORS Configuration**: Proper cross-origin settings
- **Rate Limiting**: Prevents abuse
- **API Key Encryption**: YouTube API keys stored encrypted
- **Audit Logging**: Admin actions logged

### Data Protection
- **Row Level Security**: Database-level access control
- **User Data Isolation**: Users can only access their own data
- **Admin Audit Trail**: All admin actions tracked

## Deployment Considerations

### Environment Dependencies
```typescript
// Required environment variables
DATABASE_URL: string
SUPABASE_SERVICE_ROLE_KEY: string
YOUTUBE_API_KEY: string
ADMIN_EMAILS: string (comma-separated)

// Optional environment variables
OPENAI_API_KEY: string
CLOUDFLARE_STREAM_TOKEN: string
```

### Runtime Configuration
```typescript
// All routes use Node.js runtime
export const runtime = 'nodejs';
```

### Health Monitoring
- **System Health**: `/api/health` provides comprehensive monitoring
- **Error Tracking**: Real-time error monitoring and alerting
- **Performance Metrics**: Core Web Vitals collection

## Recommendations

### Immediate Fixes Needed
1. **Fix TypeScript Errors**: 18+ compilation errors need resolution
2. **Standardize Route Signatures**: Consistent parameter types
3. **Update Error Types**: Fix union type mismatches
4. **Verify Table References**: Ensure all referenced tables exist

### Performance Improvements
1. **Implement Response Compression**: For large data responses
2. **Add Request Validation**: Comprehensive input validation
3. **Optimize Database Queries**: Review N+1 queries
4. **Implement Caching Layer**: Redis for frequently accessed data

### Security Enhancements
1. **Add Request Rate Limiting**: Per-user/IP rate limiting
2. **Implement API Versioning**: For backward compatibility
3. **Add Request Logging**: Comprehensive audit trail
4. **Review Admin Access**: Consolidate admin authorization methods

---

*This documentation reflects the API structure as of 2025-08-31. Active development may result in frequent changes to endpoint functionality and availability.*