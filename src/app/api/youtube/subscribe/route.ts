/**
 * YouTube Channel Subscription Management API
 * Handles subscribing/unsubscribing to channel notifications
 */

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { pubsubManager } from '@/lib/youtube/pubsub';

/**
 * GET - Get user's active subscriptions
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    // Get authenticated user
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user's subscriptions
    const subscriptions = await pubsubManager.getUserSubscriptions();

    return NextResponse.json({
      success: true,
      subscriptions,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

/**
 * POST - Subscribe to a channel
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    // Get authenticated user
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { channel_id, channel_title } = body;

    if (!channel_id) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // Generate callback URL
    // In production, use your actual domain
    const base_url =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    const callback_url = `${base_url}/api/youtube/webhook`;

    // Subscribe to channel
    const result = await pubsubManager.subscribe({
      channel_id,
      channelTitle: channel_title || channel_id,
      user_id: user.id,
      callbackUrl: callback_url,
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
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to subscribe to channel' }, { status: 500 });
  }
}

/**
 * DELETE - Unsubscribe from a channel
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    // Get authenticated user
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get channel ID from query params
    const search_params = request.nextUrl.searchParams;
    const channel_id = search_params.get('channel_id');

    if (!channel_id) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // Unsubscribe from channel
    const result = await pubsubManager.unsubscribe(channel_id);

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
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to unsubscribe from channel' }, { status: 500 });
  }
}

/**
 * PATCH - Renew subscription
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    // Get authenticated user
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();

    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { channel_id } = body;

    if (!channel_id) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // Get existing subscription
    const { data: subscription, error: fetch_error } = await supabase
      .from('channelSubscriptions')
      .select('*')
      .eq('channel_id', channel_id)
      .eq('user_id', user.id)
      .single();

    if (fetch_error || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Generate callback URL
    const base_url =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    const callback_url = `${base_url}/api/youtube/webhook`;

    // Renew subscription
    const result = await pubsubManager.subscribe({
      channel_id,
      channelTitle: subscription.channel_title,
      user_id: user.id,
      callbackUrl: callback_url,
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
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to renew subscription' }, { status: 500 });
  }
}
