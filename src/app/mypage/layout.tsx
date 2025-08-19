import type { SupabaseClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { Database } from '@/types/database';
import { MyPageSidebar } from './components/MyPageSidebar';

export const metadata: Metadata = {
  title: '마이페이지 | 디하클',
  description: '디하클 마이페이지 - 프로필, 수강 강의, 수익 인증 관리',
};

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  // 인증 체크
  const supabase = (await createSupabaseServerClient()) as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 프로필 정보 가져오기
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
          <p className="mt-2 text-gray-600">
            안녕하세요, {profile?.displayNickname || profile?.username || '회원'}님
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 메뉴 */}
          <MyPageSidebar profile={profile} />

          {/* 메인 컨텐츠 */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
