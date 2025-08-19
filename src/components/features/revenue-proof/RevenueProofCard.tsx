'use client';

import { AlertTriangle, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { RevenueProof } from '@/types/revenue-proof';

interface RevenueProofCardProps {
  data: RevenueProof;
}

export function RevenueProofCard({ data }: RevenueProofCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    if (days < 365) return `${Math.floor(days / 30)}개월 전`;
    return `${Math.floor(days / 365)}년 전`;
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'bg-red-500';
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'tiktok':
        return 'bg-black';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      {/* 이미지 섹션 */}
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image
          src={data.screenshot_url}
          alt={data.title}
          fill={true}
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          placeholder={data.screenshot_blur ? 'blur' : 'empty'}
          blurDataURL={data.screenshot_blur}
        />
        {/* 플랫폼 배지 */}
        <Badge
          className={`absolute top-2 left-2 ${getPlatformColor(data.platform)} text-white border-0`}
        >
          {data.platform}
        </Badge>
        {/* 수익 금액 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white font-bold text-lg">{formatAmount(data.amount)}</p>
        </div>
      </div>

      {/* 콘텐츠 섹션 */}
      <div className="p-4">
        {/* 제목 */}
        <h3 className="font-semibold text-sm line-clamp-2 mb-2">{data.title}</h3>

        {/* 사용자 정보 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
            {data.user?.avatar_url ? (
              <Image
                src={data.user.avatar_url}
                alt={data.user.username}
                width={24}
                height={24}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">{data.user?.username}</span>
          <span className="text-xs text-muted-foreground">· {formatDate(data.created_at)}</span>
        </div>

        {/* 상호작용 통계 */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {data.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {data.comments_count}
          </span>
          {data.reports_count > 0 && (
            <span className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              {data.reports_count}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
