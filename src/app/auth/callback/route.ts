import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/types';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  let isNewUser = false; // Flag to track if this is a new user

  // 디버깅용 로그
  console.log('[Auth Callback] Started processing', {
    url: requestUrl.toString(),
    hasCode: !!code,
    next,
    timestamp: new Date().toISOString(),
  });

  if (code) {
    // Get environment variables - these must be set properly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      const errorUrl = new URL('/auth/error', requestUrl.origin);
      errorUrl.searchParams.set('error', 'configurationError');
      errorUrl.searchParams.set(
        'errorDescription',
        'Authentication service is not properly configured. Please contact support.'
      );
      return NextResponse.redirect(errorUrl.toString());
    }

    // Additional validation to prevent placeholder values
    if (
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('your-') ||
      supabaseAnonKey.includes('placeholder') ||
      supabaseAnonKey === 'your-anon-key-here'
    ) {
      const errorUrl = new URL('/auth/error', requestUrl.origin);
      errorUrl.searchParams.set('error', 'configurationError');
      errorUrl.searchParams.set(
        'errorDescription',
        'Authentication service configuration is invalid. Please contact support.'
      );
      return NextResponse.redirect(errorUrl.toString());
    }

    // Create a Supabase client with the cookie-based storage
    const supabase = createRouteHandlerClient<Database>({ cookies });

    try {
      console.log('[Auth Callback] Attempting to exchange code for session', {
        supabaseUrl: `${supabaseUrl.substring(0, 30)}...`,
        hasAnonKey: !!supabaseAnonKey,
        code: `${code.substring(0, 10)}...`,
      });

      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        const errorUrl = new URL('/auth/error', requestUrl.origin);
        errorUrl.searchParams.set('error', error.code || 'unknownError');
        errorUrl.searchParams.set(
          'errorDescription',
          error.message || 'Failed to exchange code for session'
        );
        return NextResponse.redirect(errorUrl.toString());
      }

      console.log('[Auth Callback] Session exchange successful');

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log('[Auth Callback] User data retrieved', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
      });

      if (user) {
        // Check if user profile exists in public.profiles table
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, randomNickname, naverCafeVerified')
          .eq('id', user.id)
          .single();

        // If profile doesn't exist, create it with random nickname
        if (profileError?.code === 'PGRST116' || !userProfile) {
          console.log('[Auth Callback] Creating new profile for user', user.id);
          isNewUser = true; // Mark as new user for onboarding

          // Call init-profile API to create profile with random nickname
          const initResponse = await fetch(`${requestUrl.origin}/api/user/init-profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: request.headers.get('cookie') || '',
            },
          });

          if (!initResponse.ok) {
          } else {
            console.log('[Auth Callback] Profile initialized successfully');
          }
        } else if (userProfile && !userProfile.randomNickname) {
          // Profile exists but no random nickname, add one
          console.log('[Auth Callback] Adding random nickname to existing profile');

          const initResponse = await fetch(`${requestUrl.origin}/api/user/init-profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: request.headers.get('cookie') || '',
            },
          });

          if (!initResponse.ok) {
          }
        }
      }
    } catch (error) {
      const errorUrl = new URL('/auth/error', requestUrl.origin);
      errorUrl.searchParams.set('error', 'serverError');

      // Provide more specific error message for fetch failures
      let errorDescription = 'An unexpected error occurred during authentication';
      if (error instanceof Error) {
        if (error.message.includes('fetch failed')) {
          errorDescription =
            'Connection to authentication server failed. This may be due to network issues or configuration problems.';
        } else {
          errorDescription = error.message;
        }
      }

      errorUrl.searchParams.set('errorDescription', errorDescription);
      return NextResponse.redirect(errorUrl.toString());
    }
  }

  // URL to redirect to after sign in process completes
  // If this is a new user, redirect to onboarding instead of the requested page
  const redirectUrl = isNewUser ? '/onboarding' : next;
  return NextResponse.redirect(`${requestUrl.origin}${redirectUrl}`);
}
