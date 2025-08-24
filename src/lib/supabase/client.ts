import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types';
import { env } from '@/env';

// Get environment variables with type-safe access
const supabase_url = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabase_anon_key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy initialization to avoid build-time errors
let supabase_client: ReturnType<typeof createSupabaseClient<Database>> | null = null;

function get_supabase_client() {
  if (!supabase_client) {
    // Check environment variables at runtime
    if (!supabase_url || !supabase_anon_key) {
      // Only throw in browser or when actually needed
      if (typeof window !== 'undefined') {
        throw new Error('Missing Supabase environment variables');
      }
      // During build, return a dummy client that will never be used
      return createSupabaseClient<Database>('https://dummy.supabase.co', 'dummy-key');
    }

    supabase_client = createSupabaseClient<Database>(supabase_url, supabase_anon_key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabase_client;
}

// Export as getter to ensure lazy initialization
export const supabase = get_supabase_client();

// Export createClient function for compatibility
export const createClient = () => get_supabase_client();

// Type definitions for our test table
export type TestConnection = {
  id: number;
  created_at: string;
  message: string;
};
