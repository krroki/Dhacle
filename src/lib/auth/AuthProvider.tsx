'use client';

import type { User } from '@supabase/supabase-js';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, set_user] = useState<User | null>(null);
  const [loading, set_loading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set_user(session?.user ?? null);
      set_loading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set_user(session?.user ?? null);
      set_loading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const sign_out = async () => {
    await supabase.auth.signOut();
    set_user(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut: sign_out }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
