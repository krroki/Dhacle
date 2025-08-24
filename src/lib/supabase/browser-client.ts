import { createBrowserClient as createSupabaseBrowserClientSSR } from '@supabase/ssr';
import type { Database } from '@/types';
import { env } from '@/env';

// Create a Supabase client for browser/client-side usage
export function createBrowserClient() {
  // Get environment variables - type-safe access
  const supabase_url = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_anon_key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if we're on production and environment variables are missing
  if (!supabase_url || !supabase_anon_key) {
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

  return createSupabaseBrowserClientSSR<Database>(supabase_url, supabase_anon_key);
}

// Alias for backward compatibility
export const createClient = createBrowserClient;
