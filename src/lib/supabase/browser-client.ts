import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// Create a Supabase client for browser/client-side usage
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Return a mock client if environment variables are not set (development only)
  if (!supabaseUrl || !supabaseAnonKey) {
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
    } as unknown as ReturnType<typeof createBrowserClient<Database>>;
  }
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}