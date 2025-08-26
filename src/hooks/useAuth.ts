/**
 * useAuth Hook
 * 
 * Phase 3: Client-side authentication management
 * 
 * Features:
 * - Real-time authentication state
 * - Automatic redirects for protected routes
 * - Session change detection
 * - Loading states
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/browser-client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface UseAuthOptions {
  requireAuth?: boolean; // Redirect to login if not authenticated
  redirectTo?: string;   // Custom redirect path after login
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

/**
 * Hook for managing authentication state in client components
 * 
 * @param options - Configuration options
 * @returns Authentication state and methods
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { user, loading } = useAuth();
 * 
 * // Require authentication
 * const { user, loading } = useAuth({ requireAuth: true });
 * 
 * // Custom redirect
 * const { user, signOut } = useAuth({ redirectTo: '/dashboard' });
 * ```
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { requireAuth = false, redirectTo = '/login' } = options;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Get current user (uses getUser, not getSession)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (authError) {
          setError(authError);
          setUser(null);
        } else {
          setUser(user);
          setError(null);
        }
        
        // Handle required authentication
        if (requireAuth && !user && !authError) {
          const currentPath = window.location.pathname;
          const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
          router.push(loginUrl);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err as Error);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;
        
        switch (event) {
          case 'SIGNED_IN':
            setUser(session?.user ?? null);
            setError(null);
            break;
            
          case 'SIGNED_OUT':
            setUser(null);
            setError(null);
            if (requireAuth) {
              router.push(redirectTo);
            }
            break;
            
          case 'TOKEN_REFRESHED':
            // Re-check user on token refresh
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            break;
            
          case 'USER_UPDATED':
            setUser(session?.user ?? null);
            break;
        }
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [requireAuth, redirectTo, router, supabase]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      
      // Redirect to home or login
      router.push('/');
    } catch (err) {
      setError(err as Error);
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
  };
}

/**
 * Hook to get current user without redirect logic
 * Simpler version of useAuth for non-protected components
 * 
 * @returns Current user or null
 * 
 * @example
 * ```typescript
 * const user = useCurrentUser();
 * if (user) {
 *   // Show authenticated content
 * }
 * ```
 */
export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    let mounted = true;

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
      if (mounted) setUser(user);
    });

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (mounted) setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return user;
}