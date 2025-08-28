'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  
  // YouTube Lens 페이지에서는 사이드바 없는 풀 위드스 레이아웃 사용
  const isYouTubeLens = pathname.startsWith('/tools/youtube-lens');
  
  if (isYouTubeLens) {
    return (
      <main className="flex-1 flex flex-col max-w-full overflow-x-hidden">
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-full overflow-x-hidden">
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
    </>
  );
}