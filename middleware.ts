import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is being set, we need to update both the request and response
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is being removed, update both the request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // This will refresh the session if expired and update the cookies
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Optional: Add protected route logic here
  // For example, redirect to login if accessing protected routes without session
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/tools/transcribe')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  
  if (isProtectedRoute && !session && !isAuthRoute) {
    // Optional: Redirect to login page
    // const redirectUrl = request.nextUrl.clone()
    // redirectUrl.pathname = '/auth/login'
    // redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    // return NextResponse.redirect(redirectUrl)
    
    // For now, just log the auth state for debugging
    console.log('Protected route accessed without session:', request.nextUrl.pathname)
  }

  // Log session state for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Path:', request.nextUrl.pathname)
    console.log('Middleware - Session:', session ? 'Active' : 'None')
    console.log('Middleware - User:', session?.user?.email || 'Not authenticated')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}