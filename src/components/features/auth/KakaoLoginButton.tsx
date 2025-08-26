'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui';
import { createBrowserClient } from '@/lib/supabase/browser-client';

interface KakaoLoginButtonProps {
  redirectTo?: string;
  className?: string;
  variant?: 'default' | 'large' | 'small';
  text?: string;
}

export function KakaoLoginButton({
  redirectTo = '/',
  className = '',
  variant = 'default',
  text = '카카오로 시작하기',
}: KakaoLoginButtonProps) {
  const supabase = createBrowserClient();

  const handle_kakao_login = async () => {
    try {
      // Supabase의 signInWithOAuth 메서드 사용
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          scopes: 'profile_nickname profile_image account_email',
        },
      });

      if (error) {
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Component error:', error);
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 카카오 공식 디자인 가이드에 따른 스타일
  const size_classes = {
    small: 'h-10 px-4 text-sm',
    default: 'h-12 px-6 text-base',
    large: 'h-14 px-8 text-lg',
  };

  return (
    <Button
      onClick={handle_kakao_login}
      className={`
        ${size_classes[variant]}
        bg-[#FEE500] hover:bg-[#FDD835] text-[#000000]/85
        font-medium rounded-md transition-all duration-200
        flex items-center justify-center gap-2
        shadow-sm hover:shadow-md
        ${className}
      `}
    >
      <MessageSquare className={variant === 'large' ? 'h-6 w-6' : 'h-5 w-5'} />
      <span>{text}</span>
    </Button>
  );
}
