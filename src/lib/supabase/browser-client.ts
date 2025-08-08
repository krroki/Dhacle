import { createBrowserClient } from '@supabase/ssr'

// Create a Supabase client for browser/client-side usage
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}