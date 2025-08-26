/**
 * YouTube PubSubHubbub Webhook Endpoint
 * Handles verification callbacks and notifications from YouTube
 */

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { pubsubManager } from '@/lib/youtube/pubsub';

/**
 * GET handler for hub verification
 * The hub will send a GET request to verify the subscription
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Webhook endpoints must be public (no authentication required)
    // YouTube servers will call this without authentication
    const search_params = request.nextUrl.searchParams;

    // Extract verification parameters
    const mode = search_params.get('hub.mode');
    const topic = search_params.get('hub.topic');
    const challenge = search_params.get('hub.challenge');
    const lease_seconds = search_params.get('hub.leaseSeconds');

    // Validate required parameters
    if (!mode || !topic || !challenge) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify the callback
    const result = await pubsubManager.verifyCallback({
      mode,
      topic,
      challenge,
      leaseSeconds: lease_seconds || undefined,
    });

    if (result.success && result.challenge) {
      // Return the challenge to confirm subscription
      console.log('Webhook verified successfully:', { mode, topic });
      return new NextResponse(result.challenge, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    return NextResponse.json({ error: result.error || 'Verification failed' }, { status: 404 });
  } catch (error) {
    console.error('Webhook GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST handler for notifications
 * The hub will send POST requests with Atom feed updates
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Webhook endpoints must be public (no authentication required)
    // YouTube servers will call this without authentication

    // Get the raw body
    const body = await request.text();

    // Get HMAC signature from headers
    const signature = request.headers.get('x-hub-signature') || null;

    // Extract channel ID from the XML (simplified parsing)
    const channel_id_match = body.match(/<yt:channel_id>([^<]+)<\/yt:channel_id>/);

    if (!channel_id_match) {
      return NextResponse.json({ error: 'Invalid notification format' }, { status: 400 });
    }

    const channel_id = channel_id_match[1];

    // Process the notification
    const result = await pubsubManager.processNotification(body, signature || '', channel_id || '');

    if (result.success) {
      console.log('Notification processed:', {
        channel_id,
        video: result.video,
      });

      // Trigger any additional processing here
      // For example, update statistics, send alerts, etc.
      if (result.video) {
        await handle_video_update(result.video);
      }

      // Hub expects 2xx response
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ error: result.error || 'Processing failed' }, { status: 400 });
  } catch (error) {
    // Return 200 to prevent hub from retrying
    console.error('Webhook POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 200 });
  }
}

/**
 * Handle video updates (called after successful notification processing)
 */
async function handle_video_update(video: unknown): Promise<void> {
  try {
    // Type guard to check if video has expected properties
    const is_video_object = (v: unknown): v is { 
      video_id?: string; 
      channel_id?: string;
      title?: string;
      published_at?: string;
      deleted?: boolean 
    } => {
      return typeof v === 'object' && v !== null;
    };

    // Update video statistics if needed
    if (is_video_object(video) && video.video_id && !video.deleted) {
      // Import Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { env } = await import('@/env');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Store video data
      await supabase.from('videos').upsert({
        video_id: video.video_id,
        channel_id: video.channel_id,
        title: video.title,
        published_at: video.published_at,
        updated_at: new Date().toISOString()
      });

      // Initialize video stats
      await supabase.from('videoStats').insert({
        video_id: video.video_id,
        views: 0,
        likes: 0,
        comments: 0,
        created_at: new Date().toISOString()
      });

      console.log(`Video data stored for ${video.video_id}`);
    }
  } catch (error) {
    // Don't throw - we don't want to fail the webhook response
    console.error('Failed to handle video update:', error);
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Hub-Signature',
      'Access-Control-Max-Age': '86400',
    },
  });
}
