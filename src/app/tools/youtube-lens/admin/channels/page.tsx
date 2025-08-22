import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ChannelApprovalConsole } from '@/components/features/tools/youtube-lens/admin/ChannelApprovalConsole';

// 동적 페이지로 설정 (빌드 시 정적 생성 방지)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'YouTube Lens 관리자 - 채널 승인 콘솔',
  description: '관리자 전용 YouTube 채널 승인 관리',
};

export default async function AdminChannelsPage(): Promise<React.JSX.Element> {
  // 서버 컴포넌트에서 인증 체크
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 체크
  if (!user) {
    redirect('/auth/login');
  }

  // 관리자 권한 체크
  const adminEmails = ['glemfkcl@naver.com'];
  if (!adminEmails.includes(user.email || '')) {
    // 관리자가 아니면 일반 YouTube Lens 페이지로 리다이렉트
    redirect('/tools/youtube-lens');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ChannelApprovalConsole />
    </div>
  );
}
