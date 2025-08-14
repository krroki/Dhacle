import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';
import { AdminSidebar } from './components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 관리자 권한 체크 (임시로 특정 이메일만 허용)
  const adminEmails = ['admin@dhacle.com', 'glemfkcl@naver.com'];
  
  if (!user || !adminEmails.includes(user.email || '')) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}