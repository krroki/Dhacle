'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import content from '../../../content-map.complete.json';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Check for initial session
    const getInitialUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        // Login error handled by Supabase
        alert('로그인 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      } else {
        setUser(null);
        // Optionally redirect to home
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    }
  };

  // Extract display name from user metadata or email
  const getDisplayName = () => {
    if (!user) return '';
    
    // Check for Kakao profile name in user metadata
    const fullName = user.user_metadata?.full_name;
    const email = user.email;
    
    if (fullName) {
      return fullName;
    } else if (email) {
      // Show only the part before @ for privacy
      return email.split('@')[0];
    }
    return '사용자';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary hover:text-accent transition-colors">
          {content.extracted.navigation.logo}
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {content.extracted.navigation.mainMenu.map((item) => (
            <Link key={item.url} href={item.url} className="text-primary/80 hover:text-primary transition-colors">
              {item.text}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <span className="text-sm text-primary/60">로딩중...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-primary/80">
                  {getDisplayName()}
                </span>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                size="sm"
              >
                {content.extracted.navigation.userMenu.logout || '로그아웃'}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleKakaoLogin}
              className="bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-semibold"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                viewBox="0 0 18 18" 
                fill="none"
              >
                <path 
                  d="M9 1C4.58 1 1 3.94 1 7.55c0 2.31 1.46 4.34 3.67 5.51l-.8 2.89c-.04.15.02.31.14.4.08.05.17.08.26.08.06 0 .11-.01.17-.03l3.36-1.78c.4.05.8.08 1.2.08 4.42 0 8-2.94 8-6.55C17 3.94 13.42 1 9 1z" 
                  fill="currentColor"
                />
              </svg>
              {content.extracted.navigation.userMenu.login}
            </Button>
          )}
        </div>

        {/* Mobile Menu Button (optional - not implemented yet) */}
        <button className="md:hidden flex items-center">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
    </header>
  );
}