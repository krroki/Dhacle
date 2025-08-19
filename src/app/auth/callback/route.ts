import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  let isNewUser = false // Flag to track if this is a new user
  
  // 디버깅용 로그
  console.log('[Auth Callback] Started processing', {
    url: requestUrl.toString(),
    hasCode: !!code,
    next,
    timestamp: new Date().toISOString()
  })

  if (code) {
    const cookieStore = await cookies()
    
    // Get environment variables - these must be set properly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Auth Callback] Missing required environment variables')
      const errorUrl = new URL('/auth/error', requestUrl.origin)
      errorUrl.searchParams.set('error', 'configuration_error')
      errorUrl.searchParams.set('error_description', 'Authentication service is not properly configured. Please contact support.')
      return NextResponse.redirect(errorUrl.toString())
    }
    
    // Additional validation to prevent placeholder values
    if (supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-') || 
        supabaseAnonKey.includes('placeholder') || supabaseAnonKey === 'your-anon-key-here') {
      console.error('[Auth Callback] Invalid environment variables detected')
      const errorUrl = new URL('/auth/error', requestUrl.origin)
      errorUrl.searchParams.set('error', 'configuration_error')
      errorUrl.searchParams.set('error_description', 'Authentication service configuration is invalid. Please contact support.')
      return NextResponse.redirect(errorUrl.toString())
    }
    
    // Create a Supabase client with the cookie-based storage
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string) {
            try {
              cookieStore.delete(name)
            } catch {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    try {
      console.log('[Auth Callback] Attempting to exchange code for session', {
        supabaseUrl: supabaseUrl.substring(0, 30) + '...',
        hasAnonKey: !!supabaseAnonKey,
        code: code.substring(0, 10) + '...'
      })
      
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback] Error exchanging code for session:', {
          error,
          code: error.code,
          message: error.message,
          status: error.status,
          name: error.name,
          cause: error.cause,
          fullError: JSON.stringify(error, null, 2)
        })
        const errorUrl = new URL('/auth/error', requestUrl.origin)
        errorUrl.searchParams.set('error', error.code || 'unknown_error')
        errorUrl.searchParams.set('error_description', error.message || 'Failed to exchange code for session')
        return NextResponse.redirect(errorUrl.toString())
      }

      console.log('[Auth Callback] Session exchange successful')
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('[Auth Callback] User data retrieved', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email
      })
      
      if (user) {
        // Check if user profile exists in public.profiles table
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, random_nickname, naver_cafe_verified')
          .eq('id', user.id)
          .single()

        // If profile doesn't exist, create it with random nickname
        if (profileError?.code === 'PGRST116' || !userProfile) {
          console.log('[Auth Callback] Creating new profile for user', user.id)
          isNewUser = true // Mark as new user for onboarding
          
          // Call init-profile API to create profile with random nickname
          const initResponse = await fetch(`${requestUrl.origin}/api/user/init-profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': cookieStore.toString()
            }
          })
          
          if (!initResponse.ok) {
            console.error('[Auth Callback] Failed to initialize profile')
          } else {
            console.log('[Auth Callback] Profile initialized successfully')
          }
        } else if (userProfile && !userProfile.random_nickname) {
          // Profile exists but no random nickname, add one
          console.log('[Auth Callback] Adding random nickname to existing profile')
          
          const initResponse = await fetch(`${requestUrl.origin}/api/user/init-profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': cookieStore.toString()
            }
          })
          
          if (!initResponse.ok) {
            console.error('[Auth Callback] Failed to add random nickname')
          }
        }
      }
    } catch (error) {
      console.error('[Auth Callback] Caught error during authentication:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        supabaseUrl: supabaseUrl?.substring(0, 30) + '...'
      })
      
      const errorUrl = new URL('/auth/error', requestUrl.origin)
      errorUrl.searchParams.set('error', 'server_error')
      
      // Provide more specific error message for fetch failures
      let errorDescription = 'An unexpected error occurred during authentication'
      if (error instanceof Error) {
        if (error.message.includes('fetch failed')) {
          errorDescription = 'Connection to authentication server failed. This may be due to network issues or configuration problems.'
        } else {
          errorDescription = error.message
        }
      }
      
      errorUrl.searchParams.set('error_description', errorDescription)
      return NextResponse.redirect(errorUrl.toString())
    }
  }

  // URL to redirect to after sign in process completes
  // If this is a new user, redirect to onboarding instead of the requested page
  const redirectUrl = isNewUser ? '/onboarding' : next
  return NextResponse.redirect(`${requestUrl.origin}${redirectUrl}`)
}