import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  
  // 디버깅용 로그
  console.log('[Auth Callback] Started processing', {
    url: requestUrl.toString(),
    hasCode: !!code,
    next,
    timestamp: new Date().toISOString()
  })

  if (code) {
    const cookieStore = await cookies()
    
    // Get environment variables with fallback for Vercel
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Fix for Vercel having placeholder values
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      supabaseUrl = 'https://golbwnsytwbyoneucunx.supabase.co'
      console.log('[Auth Callback] Using fallback Supabase URL')
    }
    
    if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbGJ3bnN5dHdieW9uZXVjdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI1MTYsImV4cCI6MjA3MDE0ODUxNn0.8EaDU4a1-FuCeWuRtK0fzxrRDuMvNwoB0a0qALDm6iM'
      console.log('[Auth Callback] Using fallback Supabase Anon Key')
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
          set(name: string, value: string, options: CookieOptions) {
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
      const { error, data } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback] Error exchanging code for session:', {
          error,
          code: error.code,
          message: error.message,
          status: error.status
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
        // Check if user profile exists in public.users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('username, full_name')
          .eq('id', user.id)
          .single()

        // If profile doesn't exist or is incomplete, redirect to onboarding
        if (profileError || !userProfile?.username || !userProfile?.full_name) {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
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
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}