import { Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';
import type { RevenueProof } from '@/lib/dummy-data/home';
import { VerifiedBadge } from './VerifiedBadge';

interface RevenueCardProps {
  proof: RevenueProof;
}

const PlatformIcon = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
};

export function RevenueCard({ proof }: RevenueCardProps) {
  const Icon = PlatformIcon[proof.platform];
  const formatted_amount = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(proof.amount);

  return (
    <div className="flex items-center gap-3 p-4 bg-card border rounded-lg min-w-[280px] hover:shadow-md transition-shadow">
      <div className="relative w-12 h-12 flex-shrink-0">
        <Image
          src={proof.userAvatar}
          alt={proof.user_name}
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm truncate">{proof.user_name}</h4>
          <VerifiedBadge verified={proof.verified} />
        </div>
        <p className="text-lg font-bold text-primary">{formatted_amount}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="w-3 h-3" />
          <span>{proof.date}</span>
        </div>
      </div>
    </div>
  );
}
