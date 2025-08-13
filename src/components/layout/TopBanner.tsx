'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'

interface TopBannerProps {
  text?: string
  ctaText?: string
  ctaLink?: string
  bgColor?: string
}

export function TopBanner({
  text = '🎉 새로운 강의 출시! YouTube Shorts 마스터 클래스',
  ctaText = '지금 신청하기',
  ctaLink = '/courses/youtube-shorts-master',
  bgColor = 'bg-gradient-to-r from-purple-600 to-pink-600',
}: TopBannerProps) {
  // TopBanner는 항상 표시 (닫기 기능 제거)
  return (
    <div
      className={cn(
        'relative flex items-center justify-center px-4 py-3 text-white overflow-hidden',
        bgColor
      )}
      style={{ height: 'var(--top-banner-height)' }}
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{text}</span>
        <Link href={ctaLink}>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            {ctaText}
          </Button>
        </Link>
      </div>
    </div>
  )
}