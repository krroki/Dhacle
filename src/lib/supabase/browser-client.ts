import { createBrowserClient as createSupabaseBrowserClientSSR } from '@supabase/ssr'
import { Database } from '@/types/database'

// Create a Supabase client for browser/client-side usage
export function createBrowserClient() {
  // Get environment variables - Next.js will inline these at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // Check if we're on production and environment variables are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // If we're on production domain, throw a clear error
      if (hostname === 'dhacle.com' || hostname === 'www.dhacle.com') {
        throw new Error(
          'CRITICAL: Supabase environment variables are not configured on production. ' +
          'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.'
        );
      }
    }
    
    // Development mode - return mock client
    console.warn(
      'Supabase environment variables not set. Using mock client for development.'
    );
    
    // Return a mock object that mimics the Supabase client interface
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
    } as unknown as ReturnType<typeof createSupabaseBrowserClientSSR<Database>>;
  }
  
  // Skip validation for now - Vercel build issue
  // TODO: Re-enable after Vercel environment variables are properly configured
  
  return createSupabaseBrowserClientSSR<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}