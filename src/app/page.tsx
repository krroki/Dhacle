import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dhacle - 서비스 일시 중단 안내',
  description: '현재 Dhacle 프로젝트는 운영하지 않습니다. 새로운 소식이 준비되면 다시 찾아뵙겠습니다.',
  alternates: {
    canonical: 'https://dhacle.com',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center space-y-6 rounded-3xl border border-border/60 bg-card/80 backdrop-blur-md px-10 py-14 shadow-xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Service Notice</p>
          <h1 className="text-3xl font-bold sm:text-4xl">현재 사용되고 있지 않은 사이트입니다.</h1>
        </div>
        <p className="text-base leading-relaxed text-muted-foreground">
          현재 이 프로젝트는 운영하지 않는 상태입니다. 새로운 업데이트가 준비되는 대로 공지드리겠습니다.
        </p>
        <div className="text-sm text-muted-foreground/80">
          문의가 필요하시면 기존 연락처 채널을 통해 연락 부탁드립니다.
        </div>
      </div>
    </main>
  );
}
