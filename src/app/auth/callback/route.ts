import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { env } from '@/env';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const request_url = new URL(request.url);
  const code = request_url.searchParams.get('code');
  const next = request_url.searchParams.get('next') ?? '/';
  let is_new_user = false; // Flag to track if this is a new user

  // 디버깅용 로그
  logger.debug('[Auth Callback] Started processing', {
    metadata: {
      url: request_url.toString(),
      hasCode: !!code,
      next,
      timestamp: new Date().toISOString(),
    }
  });

  if (code) {
    // Get environment variables - these must be set properly
    const supabase_url = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase_anon_key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validate environment variables
    if (!supabase_url || !supabase_anon_key) {
      const error_url = new URL('/auth/error', request_url.origin);
      error_url.searchParams.set('error', 'configurationError');
      error_url.searchParams.set(
        'errorDescription',
        'Authentication service is not properly configured. Please contact support.'
      );
      return NextResponse.redirect(error_url.toString());
    }

    // Additional validation to prevent placeholder values
    if (
      supabase_url.includes('placeholder') ||
      supabase_url.includes('your-') ||
      supabase_anon_key.includes('placeholder') ||
      supabase_anon_key === 'your-anon-key-here'
    ) {
      const error_url = new URL('/auth/error', request_url.origin);
      error_url.searchParams.set('error', 'configurationError');
      error_url.searchParams.set(
        'errorDescription',
        'Authentication service configuration is invalid. Please contact support.'
      );
      return NextResponse.redirect(error_url.toString());
    }

    // Create a Supabase client with the cookie-based storage using project standard
    const supabase = await createSupabaseRouteHandlerClient();

    try {
      logger.debug('[Auth Callback] Attempting to exchange code for session', {
        metadata: {
          supabaseUrl: `${supabase_url.substring(0, 30)}...`,
          hasAnonKey: !!supabase_anon_key,
          code: `${code.substring(0, 10)}...`,
        }
      });

      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        const error_url = new URL('/auth/error', request_url.origin);
        error_url.searchParams.set('error', error.code || 'unknownError');
        error_url.searchParams.set(
          'errorDescription',
          error.message || 'Failed to exchange code for session'
        );
        return NextResponse.redirect(error_url.toString());
      }

      logger.info('[Auth Callback] Session exchange successful');

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      logger.debug('[Auth Callback] User data retrieved', {
        metadata: {
          hasUser: !!user,
          user_id: user?.id,
          email: user?.email,
        }
      });

      if (user) {
        // Check if user profile exists in public.profiles table
        const { data: user_profile, error: profile_error } = await supabase
          .from('profiles')
          .select('id') // TODO: Add randomNickname, naverCafeVerified when fields are implemented
          .eq('id', user.id)
          .single();

        // If profile doesn't exist, create it with random nickname
        if (profile_error?.code === 'PGRST116' || !user_profile) {
          logger.info('[Auth Callback] Creating new profile for user', { userId: user.id });
          is_new_user = true; // Mark as new user for onboarding

          // Create profile directly instead of calling API
          try {
            // Create profile with basic information
            const { data: new_profile, error: create_error } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                username: user.email?.split('@')[0] || 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (create_error) {
              logger.error('[Auth Callback] Failed to initialize profile', create_error, {
                metadata: {
                  code: create_error.code,
                  message: create_error.message,
                  details: create_error.details
                }
              });
              // Don't throw - allow user to continue with basic profile
            } else {
              logger.info('[Auth Callback] Profile initialized successfully', {
                metadata: {
                  profileId: new_profile?.id
                }
              });
            }
          } catch (initError) {
            logger.error('[Auth Callback] Failed to initialize profile', initError, {
              metadata: {
                error: initError instanceof Error ? initError.message : 'Unknown error'
              }
            });
            // Don't throw - allow user to continue with basic profile
          }
          // TODO: Uncomment when randomNickname field is implemented
          // } else if (userProfile && !userProfile.randomNickname) {
          //   // Profile exists but no random nickname, add one
          //   console.log('[Auth Callback] Adding random nickname to existing profile');

          //   const initResponse = await fetch(`${requestUrl.origin}/api/user/init-profile`, {
          //     method: 'POST',
          //     headers: {
          //       'Content-Type': 'application/json',
          //       Cookie: request.headers.get('cookie') || '',
          //     },
          //   });

          //   if (!initResponse.ok) {
          //   }
          // }
        }
      }
    } catch (error) {
      const error_url = new URL('/auth/error', request_url.origin);
      error_url.searchParams.set('error', 'serverError');

      // Provide more specific error message for fetch failures
      let error_description = 'An unexpected error occurred during authentication';
      if (error instanceof Error) {
        if (error.message.includes('fetch failed')) {
          error_description =
            'Connection to authentication server failed. This may be due to network issues or configuration problems.';
        } else {
          error_description = error.message;
        }
      }

      error_url.searchParams.set('errorDescription', error_description);
      return NextResponse.redirect(error_url.toString());
    }
  }

  // URL to redirect to after sign in process completes
  // If this is a new user, redirect to onboarding instead of the requested page
  const redirect_url = is_new_user ? '/onboarding' : next;
  return NextResponse.redirect(`${request_url.origin}${redirect_url}`);
}
