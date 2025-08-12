'use client'

import NavigationBar from '@/components/NavigationBar'
import { TopBanner } from '@/components/sections/TopBanner'
import { MainCarousel } from '@/components/sections/MainCarousel'
import { CategoryGrid } from '@/components/sections/CategoryGrid'
import RevenueSlider from '@/components/sections/RevenueSlider'
import { createBrowserClient } from '@/lib/supabase/browser-client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  
  // Supabase 클라이언트 생성
  const supabase = createBrowserClient();
  
  // 로그인 상태 확인
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        // 카카오 닉네임 우선 사용 (비즈니스 인증 전)
        const nickname = user.user_metadata?.profile_nickname || 
                        user.user_metadata?.nickname || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        '사용자';
        setUserName(nickname);
      }
    };
    
    checkUser();
    
    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        // 카카오 닉네임 우선 사용 (비즈니스 인증 전)
        const nickname = session.user.user_metadata?.profile_nickname || 
                        session.user.user_metadata?.nickname || 
                        session.user.user_metadata?.name || 
                        session.user.email?.split('@')[0] || 
                        '사용자';
        setUserName(nickname);
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);
  
  // 카카오 로그인 처리
  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('카카오 로그인 오류:', error);
        alert('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      alert('로그인 처리 중 문제가 발생했습니다.');
    }
  };
  
  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('로그아웃 오류:', error);
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
      } else {
        // 로그아웃 성공 시 상태 초기화
        setIsLoggedIn(false);
        setUserName('');
        // 홈페이지로 리다이렉션 (이미 홈페이지에 있으므로 선택사항)
        window.location.reload();
      }
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      alert('로그아웃 처리 중 문제가 발생했습니다.');
    }
  };
  
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top Banner - FastCampus Style */}
      <TopBanner />
      
      {/* Navigation Bar */}
      <NavigationBar 
        currentPath="/"
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogin={handleKakaoLogin}
        onLogout={handleLogout}
      />
      
      {/* Main Carousel - Hero Section Replacement */}
      <MainCarousel />
      
      {/* Category Grid */}
      <CategoryGrid />
      
      {/* Revenue Slider */}
      <RevenueSlider />
    </div>
  );
}