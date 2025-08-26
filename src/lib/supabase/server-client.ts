import { type CookieOptions, createServerClient as createSupabaseSSRClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types';
import { env } from '@/env';

/**
 * Create a Supabase client for server-side usage
 * This client automatically handles cookie-based authentication
 * Must be used in Server Components, Route Handlers, and Server Actions
 */
export async function createSupabaseServerClient() {
  const cookie_store = await cookies();

  // Validate environment variables with type-safe access
  const supabase_url = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_anon_key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabase_url || !supabase_anon_key) {
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Please check your environment configuration.'
    );
  }

  return createSupabaseSSRClient<Database>(supabase_url, supabase_anon_key, {
    cookies: {
      get(name: string) {
        return cookie_store.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookie_store.set({ name, value, ...options });
        } catch (error) {
          console.error('Supabase client error:', error);
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string) {
        try {
          // Properly delete the cookie instead of just clearing its value
          cookie_store.delete(name);
        } catch (error) {
          console.error('Cookie removal error:', error);
          // The `remove` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

// Alias for backward compatibility
export const createServerClient = createSupabaseServerClient;
export const createServerSupabaseClient = createSupabaseServerClient;
export const createClient = createSupabaseServerClient;

/**
 * Create a Supabase client with Service Role Key for bypassing RLS
 * WARNING: This should only be used in secure server-side contexts
 * Never expose Service Role Key to the client
 */
export async function createSupabaseServiceRoleClient() {
  const supabase_url = env.NEXT_PUBLIC_SUPABASE_URL;
  const service_role_key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabase_url || !service_role_key) {
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Please check your environment configuration.'
    );
  }

  // Service Role Key bypasses RLS policies
  // Using createSupabaseClient directly for service role key
  return createSupabaseClient<Database>(supabase_url, service_role_key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client for server-side usage in Route Handlers
 * This version is optimized for API routes where we can modify cookies
 */
export async function createSupabaseRouteHandlerClient() {
  const cookie_store = await cookies();

  // Validate environment variables with type-safe access
  const supabase_url = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_anon_key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabase_url || !supabase_anon_key) {
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Please check your environment configuration.'
    );
  }

  return createSupabaseSSRClient<Database>(supabase_url, supabase_anon_key, {
    cookies: {
      get(name: string) {
        return cookie_store.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookie_store.set({ name, value, ...options });
      },
      remove(name: string) {
        cookie_store.delete(name);
      },
    },
  });
}
