/**
 * YouTube PubSubHubbub Webhook Endpoint
 * Handles verification callbacks and notifications from YouTube
 */

import { NextRequest, NextResponse } from 'next/server';
import { pubsubManager } from '@/lib/youtube/pubsub';

/**
 * GET handler for hub verification
 * The hub will send a GET request to verify the subscription
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract verification parameters
    const mode = searchParams.get('hub.mode');
    const topic = searchParams.get('hub.topic');
    const challenge = searchParams.get('hub.challenge');
    const leaseSeconds = searchParams.get('hub.lease_seconds');

    // Validate required parameters
    if (!mode || !topic || !challenge) {
      console.error('Missing verification parameters:', { mode, topic, challenge });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the callback
    const result = await pubsubManager.verifyCallback({
      mode,
      topic,
      challenge,
      lease_seconds: leaseSeconds || undefined
    });

    if (result.success && result.challenge) {
      // Return the challenge to confirm subscription
      console.log('Webhook verified successfully:', { mode, topic });
      return new NextResponse(result.challenge, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    } else {
      console.error('Webhook verification failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Webhook GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for notifications
 * The hub will send POST requests with Atom feed updates
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const body = await request.text();
    
    // Get HMAC signature from headers
    const signature = request.headers.get('x-hub-signature') || null;
    
    // Extract channel ID from the XML (simplified parsing)
    const channelIdMatch = body.match(/<yt:channelId>([^<]+)<\/yt:channelId>/);
    
    if (!channelIdMatch) {
      console.error('No channel ID found in notification');
      return NextResponse.json(
        { error: 'Invalid notification format' },
        { status: 400 }
      );
    }
    
    const channelId = channelIdMatch[1];
    
    // Process the notification
    const result = await pubsubManager.processNotification(
      body,
      signature,
      channelId
    );
    
    if (result.success) {
      console.log('Notification processed:', {
        channelId,
        video: result.video
      });
      
      // Trigger any additional processing here
      // For example, update statistics, send alerts, etc.
      if (result.video) {
        await handleVideoUpdate(result.video);
      }
      
      // Hub expects 2xx response
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    } else {
      console.error('Notification processing failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Processing failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Webhook POST error:', error);
    // Return 200 to prevent hub from retrying
    // Log the error for debugging
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 200 }
    );
  }
}

/**
 * Handle video updates (called after successful notification processing)
 */
async function handleVideoUpdate(video: any) {
  try {
    // Import monitoring system dynamically to avoid circular dependencies
    const { MonitoringScheduler } = await import('@/lib/youtube/monitoring');
    const scheduler = new MonitoringScheduler();
    
    // Check if this video triggers any alerts
    // Note: Alert checking would be done through AlertRuleEngine
    // const alertEngine = new AlertRuleEngine(supabase);
    // await alertEngine.checkVideoAgainstRules(video, rules);
    
    // Update video statistics if needed
    if (video.videoId && !video.deleted) {
      // Fetch latest statistics from YouTube API
      // This would need to be implemented with proper YouTube API integration
      // const apiClient = new YouTubeAPIClient();
      // const videoData = await apiClient.getVideoDetails(video.videoId);
      
      // For now, we'll just log the update
      console.log(`Video update received for ${video.videoId}`);
        
        // TODO: Implement proper video data fetching and storage
        // This would require:
        // 1. Fetching video details from YouTube API
        // 2. Storing the data in Supabase
        // For now, we just acknowledge the update
        
        // const { createClient } = await import('@/lib/supabase/client');
        // const supabase = createClient();
        // await supabase.from('videos').upsert({...})
        // await supabase.from('video_stats').insert({...})
    }
  } catch (error) {
    console.error('Error handling video update:', error);
    // Don't throw - we don't want to fail the webhook response
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
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