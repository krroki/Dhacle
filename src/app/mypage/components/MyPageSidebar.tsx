'use client';

import {
  Award,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  Settings,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    href: '/mypage',
    label: '대시보드',
    icon: LayoutDashboard,
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

interface Profile {
  id?: string;
  username?: string | null;
  displayNickname?: string | null;
  naverCafeVerified?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

interface MyPageSidebarProps {
  profile: Profile | null;
}

export function MyPageSidebar({ profile }: MyPageSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="lg:col-span-1">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                'hover:bg-white hover:shadow-sm',
                isActive ? 'bg-white shadow-sm text-purple-600' : 'text-gray-700'
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
        <h3 className="text-sm font-semibold text-gray-900 mb-2">닉네임 정보</h3>
        <div className="space-y-2 text-sm">
          {profile?.naverCafeVerified ? (
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600">디노하이클래스 연동</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">카페 닉네임 사용 중</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <span className="text-gray-600">랜덤 닉네임 사용</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">카페 연동 시 변경 가능</p>
            </div>
          )}
          <p className="text-xs font-medium text-gray-700 mt-2">
            현재: {profile?.displayNickname}
          </p>
        </div>
      </div>
    </aside>
  );
}
