'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  DollarSign,
  Settings,
  FileText,
  Video,
  Award,
  BarChart3,
  LogOut,
  Upload
} from 'lucide-react';

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: '대시보드', 
    href: '/admin' 
  },
  { 
    icon: BookOpen, 
    label: '강의 관리', 
    href: '/admin/courses' 
  },
  { 
    icon: Video, 
    label: '레슨 관리', 
    href: '/admin/lessons' 
  },
  {
    icon: Upload,
    label: '비디오 업로드',
    href: '/admin/courses/videos'
  },
  { 
    icon: Users, 
    label: '수강생 관리', 
    href: '/admin/users' 
  },
  { 
    icon: DollarSign, 
    label: '매출 관리', 
    href: '/admin/revenue' 
  },
  { 
    icon: Award, 
    label: '뱃지 관리', 
    href: '/admin/badges' 
  },
  { 
    icon: FileText, 
    label: '쿠폰 관리', 
    href: '/admin/coupons' 
  },
  { 
    icon: BarChart3, 
    label: '통계', 
    href: '/admin/analytics' 
  },
  { 
    icon: Settings, 
    label: '설정', 
    href: '/admin/settings' 
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r">
      <div className="p-6">
        <h2 className="text-xl font-bold">Dhacle Admin</h2>
      </div>
      
      <nav className="px-4 pb-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="mt-auto p-4 border-t">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <LogOut className="w-5 h-5" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}