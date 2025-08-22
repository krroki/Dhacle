import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// Get environment variables with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy initialization to avoid build-time errors
let supabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    // Check environment variables at runtime
    if (!supabaseUrl || !supabaseAnonKey) {
      // Only throw in browser or when actually needed
      if (typeof window !== 'undefined') {
        throw new Error('Missing Supabase environment variables');
      }
      // During build, return a dummy client that will never be used
      return createSupabaseClient<Database>('https://dummy.supabase.co', 'dummy-key');
    }
    
    supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClient;
}

// Export as getter to ensure lazy initialization
export const supabase = getSupabaseClient();

// Export createClient function for compatibility
export const createClient = () => getSupabaseClient();

// Type definitions for our test table
export type TestConnection = {
  id: number;
  created_at: string;
  message: string;
};
