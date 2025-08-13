'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLayoutStore } from '@/store/layout'
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
  const { isBannerClosed, closeBanner } = useLayoutStore()

  useEffect(() => {
    // Check sessionStorage on mount
    const closed = sessionStorage.getItem('topBannerClosed')
    if (closed === 'true') {
      useLayoutStore.setState({ isBannerClosed: true })
    }
  }, [])

  return (
    <AnimatePresence>
      {!isBannerClosed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'var(--top-banner-height)', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            'relative flex items-center justify-center px-4 py-3 text-white overflow-hidden',
            bgColor
          )}
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
          <button
            onClick={closeBanner}
            className="absolute right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="배너 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}