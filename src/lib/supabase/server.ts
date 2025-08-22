import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types';

export async function createServerClient() {
  const cookie_store = await cookies();

  // Get environment variables with validation
  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Provide fallback for build time, but throw at runtime if missing
  if (!supabase_url || !supabase_anon_key) {
    // During build, use dummy values that won't be called
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      return createSupabaseServerClient<Database>('https://dummy.supabase.co', 'dummy-key', {
        cookies: {
          get(name: string) {
            return cookie_store.get(name)?.value;
          },
          set(name: string, value: string, options) {
            cookie_store.set({ name, value, ...options });
          },
          remove(name: string, options) {
            cookie_store.set({ name, value: '', ...options });
          },
        },
      });
    }
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseServerClient<Database>(supabase_url, supabase_anon_key, {
    cookies: {
      get(name: string) {
        return cookie_store.get(name)?.value;
      },
      set(name: string, value: string, options) {
        cookie_store.set({ name, value, ...options });
      },
      remove(name: string, options) {
        cookie_store.set({ name, value: '', ...options });
      },
    },
  });
}
