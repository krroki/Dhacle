import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types';

export async function createServerClient() {
  const cookieStore = await cookies();

  // Get environment variables with validation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Provide fallback for build time, but throw at runtime if missing
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build, use dummy values that won't be called
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      return createSupabaseServerClient<Database>(
        'https://dummy.supabase.co',
        'dummy-key',
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options) {
              cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options) {
              cookieStore.set({ name, value: '', ...options });
            },
          },
        }
      );
    }
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
