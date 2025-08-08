import { createBrowserClient } from '@supabase/ssr'

// Create a Supabase client for browser/client-side usage
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Please check your .env.local file and ensure these variables are set.'
    )
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}