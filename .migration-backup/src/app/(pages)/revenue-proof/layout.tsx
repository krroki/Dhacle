import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '수익 인증 갤러리 | 디하클',
  description: 'YouTube Shorts, Instagram Reels, TikTok 크리에이터들의 투명한 수익 공개 갤러리',
  keywords: '수익인증, 크리에이터, YouTube Shorts, Instagram Reels, TikTok, 수익공개',
};

export default function RevenueProofLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
