import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { 
  User,
  BookOpen,
  TrendingUp,
  Award,
  Settings,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: '마이페이지 | 디하클',
  description: '디하클 마이페이지 - 프로필, 수강 강의, 수익 인증 관리',
};

const menuItems = [
  {
    href: '/mypage',
    label: '대시보드',
    icon: User,
    exact: true,
  },
  {
    href: '/mypage/profile',
    label: '프로필 관리',
    icon: User,
  },
  {
    href: '/mypage/courses',
    label: '수강 강의',
    icon: BookOpen,
  },
  {
    href: '/mypage/revenues',
    label: '수익 인증',
    icon: TrendingUp,
  },
  {
    href: '/mypage/badges',
    label: '획득 뱃지',
    icon: Award,
  },
  {
    href: '/mypage/settings',
    label: '계정 설정',
    icon: Settings,
  },
];

export default async function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인증 체크
  const supabase = await createSupabaseServerClient() as SupabaseClient<Database>;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
          <p className="mt-2 text-gray-600">
            안녕하세요, {profile?.display_nickname || profile?.username || '회원'}님
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 메뉴 */}
          <aside className="lg:col-span-1">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact 
                  ? false // 클라이언트 컴포넌트에서 처리
                  : false; // 클라이언트 컴포넌트에서 처리
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      "hover:bg-white hover:shadow-sm",
                      isActive
                        ? "bg-white shadow-sm text-purple-600"
                        : "text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                );
              })}
            </nav>

            {/* 디지털 노마드 하이클래스 카페 연동 상태 */}
            <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                닉네임 정보
              </h3>
              <div className="space-y-2 text-sm">
                {profile?.naver_cafe_verified ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-gray-600">디노하이클래스 연동</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      카페 닉네임 사용 중
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="text-gray-600">랜덤 닉네임 사용</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      카페 연동 시 변경 가능
                    </p>
                  </div>
                )}
                <p className="text-xs font-medium text-gray-700 mt-2">
                  현재: {profile?.display_nickname}
                </p>
              </div>
            </div>
          </aside>

          {/* 메인 컨텐츠 */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}