/**
 * YouTube Channel Subscription Management API
 * Handles subscribing/unsubscribing to channel notifications
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { pubsubManager } from '@/lib/youtube/pubsub';

/**
 * GET - Get user's active subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user's subscriptions
    const subscriptions = await pubsubManager.getUserSubscriptions(user.id);

    return NextResponse.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

/**
 * POST - Subscribe to a channel
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { channelId, channelTitle } = body;

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // Generate callback URL
    // In production, use your actual domain
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/youtube/webhook`;

    // Subscribe to channel
    const result = await pubsubManager.subscribe({
      channelId,
      channelTitle: channelTitle || channelId,
      userId: user.id,
      callbackUrl,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        subscriptionId: result.subscriptionId,
        message: 'Subscription request sent. Awaiting hub verification.',
      });
    }
    return NextResponse.json(
      {
        error: result.error || 'Failed to subscribe',
        success: false,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe to channel' }, { status: 500 });
  }
}

/**
 * DELETE - Unsubscribe from a channel
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get channel ID from query params
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // Unsubscribe from channel
    const result = await pubsubManager.unsubscribe(channelId, user.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Successfully unsubscribed from channel',
      });
    }
    return NextResponse.json(
      {
        error: result.error || 'Failed to unsubscribe',
        success: false,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe from channel' }, { status: 500 });
  }
}

/**
 * PATCH - Renew subscription
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { channelId } = body;

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // Get existing subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('channelSubscriptions')
      .select('*')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Generate callback URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/youtube/webhook`;

    // Renew subscription
    const result = await pubsubManager.subscribe({
      channelId,
      channelTitle: subscription.channelTitle,
      userId: user.id,
      callbackUrl,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Subscription renewal request sent',
      });
    }
    return NextResponse.json(
      {
        error: result.error || 'Failed to renew subscription',
        success: false,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Renew subscription error:', error);
    return NextResponse.json({ error: 'Failed to renew subscription' }, { status: 500 });
  }
}
