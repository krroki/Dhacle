/sc:implement --seq --validate --think
"Phase 4: 데이터베이스 호출 복원 - 9개 주석 처리된 코드 활성화"

# 🗄️ Phase 4: 데이터베이스 호출 복원 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- YouTube PubSub: `src/lib/youtube/pubsub.ts`
- Revenue Proof API: `src/app/api/revenue-proof/[id]/route.ts`
- YouTube Webhook: `src/app/api/youtube/webhook/route.ts`
- Course Page: `src/app/learn/[courseId]/[lessonId]/page.tsx`

### 프로젝트 컨텍스트 확인
```bash
# 주석 처리된 Supabase 호출 확인
grep -r "// .*supabase\." src/ | head -20

# 테이블 존재 확인
node scripts/verify-with-service-role.js

# RLS 정책 확인
cat supabase/migrations/*create_missing_tables*.sql | grep "CREATE POLICY"
```

## 📌 목적
**9개 주석 처리된 데이터베이스 호출을 완전히 복원**
- 현재: 핵심 기능 작동 불가 (웹훅, 수익 증명 등)
- 목표: 모든 DB 호출 정상 작동

## 🤖 실행 AI 역할
데이터베이스 전문가로서 주석 처리된 모든 DB 호출을 복원하고 정상 작동 확인

## 📝 작업 내용

### Step 1: YouTube PubSub 복원 (src/lib/youtube/pubsub.ts)

```typescript
// 현재: 5개 주석 처리된 호출
// 복원할 내용:

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { YouTubeWebhookEvent } from '@/types';

export class YouTubePubSubManager {
  private supabase;

  constructor() {
    this.supabase = createSupabaseServerClient();
  }

  async handleWebhookEvent(channelId: string, eventType: string, eventData: unknown) {
    try {
      // 1. webhook_events 테이블에 이벤트 저장 (주석 해제)
      const { data: webhookEvent, error: insertError } = await this.supabase
        .from('webhook_events')
        .insert({
          channel_id: channelId,
          event_type: eventType,
          payload: eventData,
          processed: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        logger.error('Failed to insert webhook event:', {
          error: insertError,
          channelId,
          eventType
        });
        throw new Error(`Webhook insert failed: ${insertError.message}`);
      }

      logger.info('Webhook event stored:', {
        id: webhookEvent.id,
        channelId,
        eventType
      });

      // 2. youtube_subscriptions 업데이트 (주석 해제)
      const { error: updateError } = await this.supabase
        .from('youtube_subscriptions')
        .update({
          last_event_at: new Date().toISOString(),
          status: 'active'
        })
        .eq('channel_id', channelId);

      if (updateError) {
        logger.error('Failed to update subscription:', {
          error: updateError,
          channelId
        });
        // 에러지만 계속 진행 (non-critical)
      }

      // 3. 이벤트 처리
      await this.processWebhookEvent(webhookEvent);

      return webhookEvent;
    } catch (error) {
      logger.error('PubSub webhook handling failed:', error);
      throw error;
    }
  }

  async processWebhookEvent(event: YouTubeWebhookEvent) {
    try {
      // 4. webhook_events 처리 상태 업데이트 (주석 해제)
      const { error } = await this.supabase
        .from('webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq('id', event.id);

      if (error) {
        logger.error('Failed to mark event as processed:', {
          error,
          eventId: event.id
        });
        throw error;
      }

      // 5. youtube_analytics 업데이트 (주석 해제)
      if (event.event_type === 'video.published') {
        const videoData = event.payload as any;
        
        const { error: analyticsError } = await this.supabase
          .from('youtube_analytics')
          .insert({
            channel_id: event.channel_id,
            video_id: videoData.id,
            title: videoData.title,
            views: 0,
            likes: 0,
            comments: 0,
            created_at: new Date().toISOString()
          });

        if (analyticsError) {
          logger.error('Failed to create analytics entry:', analyticsError);
        }
      }

      logger.info('Webhook event processed:', { eventId: event.id });
    } catch (error) {
      logger.error('Event processing failed:', error);
      throw error;
    }
  }

  async verifySubscription(channelId: string): Promise<boolean> {
    try {
      // 6. 구독 확인 (주석 해제)
      const { data, error } = await this.supabase
        .from('youtube_subscriptions')
        .select('*')
        .eq('channel_id', channelId)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        logger.warn('Subscription not found or inactive:', { channelId });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Subscription verification failed:', error);
      return false;
    }
  }
}
```

### Step 2: Revenue Proof API 복원

```typescript
// src/app/api/revenue-proof/[id]/route.ts

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 체크
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServerClient();

    // revenue_proofs 조회 (주석 해제)
    const { data: proof, error } = await supabase
      .from('revenue_proofs')
      .select(`
        *,
        user_profiles!user_id (
          name,
          avatar_url
        ),
        revenue_proof_views (
          count
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      logger.error('Failed to fetch revenue proof:', {
        error,
        proofId: params.id,
        userId: user.id
      });
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Revenue proof not found' },
          { status: 404 }
        );
      }
      
      throw error;
    }

    // 조회수 증가 (주석 해제) 
    if (proof.user_id !== user.id) {
      const { error: viewError } = await supabase
        .from('revenue_proof_views')
        .insert({
          proof_id: params.id,
          viewer_id: user.id,
          viewed_at: new Date().toISOString()
        });

      if (viewError && viewError.code !== '23505') { // Duplicate key 에러 무시
        logger.warn('Failed to record view:', viewError);
      }
    }

    return NextResponse.json({ data: proof });
  } catch (error) {
    logger.error('Revenue proof API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const supabase = createSupabaseServerClient();

    // 소유권 확인
    const { data: existing, error: checkError } = await supabase
      .from('revenue_proofs')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: 'Revenue proof not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // revenue_proofs 업데이트 (주석 해제)
    const { data: updated, error: updateError } = await supabase
      .from('revenue_proofs')
      .update({
        title: body.title,
        description: body.description,
        amount: body.amount,
        currency: body.currency,
        period_start: body.period_start,
        period_end: body.period_end,
        is_public: body.is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update revenue proof:', {
        error: updateError,
        proofId: params.id
      });
      throw updateError;
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    logger.error('Revenue proof update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 3: YouTube Webhook 복원

```typescript
// src/app/api/youtube/webhook/route.ts

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { YouTubePubSubManager } from '@/lib/youtube/pubsub';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // 서명 검증
    const signature = request.headers.get('x-hub-signature-256');
    const body = await request.text();
    
    if (!verifySignature(body, signature)) {
      logger.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // XML 파싱 (YouTube는 XML로 보냄)
    const eventData = parseYouTubeXML(body);
    
    if (!eventData.channelId) {
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // 1. 채널 확인 (주석 해제)
    const { data: channel, error: channelError } = await supabase
      .from('youtube_channels')
      .select('*')
      .eq('channel_id', eventData.channelId)
      .single();

    if (channelError || !channel) {
      logger.warn('Unknown channel webhook:', {
        channelId: eventData.channelId
      });
      return NextResponse.json(
        { error: 'Channel not registered' },
        { status: 404 }
      );
    }

    // 2. 웹훅 이벤트 저장 (주석 해제)
    const pubsub = new YouTubePubSubManager();
    const webhookEvent = await pubsub.handleWebhookEvent(
      eventData.channelId,
      eventData.eventType,
      eventData
    );

    // 3. 실시간 알림 전송 (선택사항)
    await sendRealtimeNotification(channel.user_id, webhookEvent);

    return NextResponse.json({ 
      success: true,
      eventId: webhookEvent.id 
    });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.YOUTUBE_WEBHOOK_SECRET) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.YOUTUBE_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}

function parseYouTubeXML(xml: string): any {
  // XML 파싱 로직
  // 실제 구현 필요
  return {
    channelId: 'parsed_channel_id',
    eventType: 'video.published',
    // ... 기타 데이터
  };
}

async function sendRealtimeNotification(userId: string, event: any) {
  // Supabase Realtime으로 알림 전송
  // 구현 필요
}
```

### Step 4: Course Page 복원

```typescript
// src/app/learn/[courseId]/[lessonId]/page.tsx

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { logger } from '@/lib/logger';

export default async function LessonPage({
  params
}: {
  params: { courseId: string; lessonId: string }
}) {
  const supabase = createSupabaseServerClient();

  try {
    // 레슨 정보 조회 (주석 해제)
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        *,
        courses!course_id (
          id,
          title,
          instructor_id
        )
      `)
      .eq('id', params.lessonId)
      .eq('course_id', params.courseId)
      .single();

    if (lessonError || !lesson) {
      logger.warn('Lesson not found:', {
        courseId: params.courseId,
        lessonId: params.lessonId
      });
      notFound();
    }

    // 레슨 진행 상황 조회/생성
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', params.lessonId)
        .single();

      if (!progress && !progressError) {
        // 진행 상황 생성
        await supabase
          .from('lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: params.lessonId,
            course_id: params.courseId,
            completed: false,
            progress_percentage: 0
          });
      }
    }

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
        <div className="prose max-w-none">
          {lesson.content}
        </div>
        {/* 레슨 컴포넌트 */}
      </div>
    );
  } catch (error) {
    logger.error('Failed to load lesson:', error);
    throw error;
  }
}
```

### Step 5: 테이블 생성 확인 및 실행

```sql
-- 누락된 테이블 생성 SQL 확인
-- supabase/migrations/20250825_restore_missing_tables.sql

-- webhook_events 테이블
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  INDEX idx_webhook_events_channel (channel_id),
  INDEX idx_webhook_events_processed (processed),
  INDEX idx_webhook_events_created (created_at DESC)
);

-- youtube_subscriptions 테이블
CREATE TABLE IF NOT EXISTS youtube_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  callback_url TEXT NOT NULL,
  topic_url TEXT NOT NULL,
  lease_seconds INTEGER DEFAULT 86400,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  last_event_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- revenue_proof_views 테이블
CREATE TABLE IF NOT EXISTS revenue_proof_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proof_id UUID REFERENCES revenue_proofs(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(proof_id, viewer_id)
);

-- RLS 정책 추가
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_proof_views ENABLE ROW LEVEL SECURITY;

-- 정책 생성...
```

```bash
# SQL 실행
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/20250825_restore_missing_tables.sql
```

## ✅ 완료 조건
- [ ] 9개 주석 처리된 DB 호출 모두 복원
- [ ] 필요한 테이블 모두 생성
- [ ] RLS 정책 적용
- [ ] 에러 처리 추가
- [ ] 로깅 구현

## 📋 QA 테스트 시나리오

### 기능 테스트
1. YouTube 웹훅 수신 → DB 저장 확인
2. Revenue Proof 조회 → 조회수 증가 확인
3. 레슨 페이지 접속 → 진행률 생성 확인

### DB 연결 테스트
```bash
# DB 연결 테스트
node scripts/verify-with-service-role.js

# 테이블 존재 확인
npm run db:verify-tables
```

## 🔄 롤백 계획
```bash
# DB 마이그레이션 롤백
npx supabase db reset

# 코드 롤백
git checkout -- src/lib/youtube/pubsub.ts
git checkout -- src/app/api/revenue-proof/
```

## 🔍 검증 명령
```bash
# Phase 4 완료 검증
npm run verify:db

# 주석 처리된 DB 호출 확인
grep -r "// .*supabase\." src/ | wc -l
# Expected: 0

# 종합 검증
npm run verify:parallel
# Expected: 8/8 ✅
```

---

**⚠️ 주의사항**
1. 테이블 생성 전 확인 필수
2. RLS 정책 반드시 적용
3. 트랜잭션 처리 고려

**예상 작업 시간**: 4-6시간
**완료**: 모든 Phase 완료 후 종합 테스트

---

## 🎯 최종 검증 체크리스트

### 모든 Phase 완료 후 실행
```bash
# 종합 검증
npm run verify:all

# 개별 검증
npm run verify:security   # Phase 1
npm run verify:types      # Phase 2
npm run verify:api        # Phase 3
npm run verify:db         # Phase 4

# 빌드 및 배포 준비
npm run build
npm run test:e2e
```

### 성공 기준
- ✅ API 보호: 100%
- ✅ any 타입: 0개
- ✅ Silent failure: 0개
- ✅ DB 호출: 모두 활성화
- ✅ 빌드: 성공
- ✅ 테스트: 통과