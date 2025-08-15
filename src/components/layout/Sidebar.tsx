'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useLayoutStore } from '@/store/layout'

interface SidebarItem {
  id: string
  label: string
  href?: string
  children?: SidebarItem[]
  progress?: number
}

const sidebarData: Record<string, SidebarItem[]> = {
  '/courses': [
    {
      id: 'intro',
      label: '강의 소개',
      href: '/courses/intro',
    },
    {
      id: 'beginner',
      label: '입문 강의',
      children: [
        { id: 'beginner-1', label: '유튜브 숏츠란?', href: '/courses/beginner/1' },
        { id: 'beginner-2', label: '첫 영상 만들기', href: '/courses/beginner/2' },
        { id: 'beginner-3', label: '채널 설정하기', href: '/courses/beginner/3' },
      ],
    },
    {
      id: 'intermediate',
      label: '중급 강의',
      children: [
        { id: 'inter-1', label: '콘텐츠 기획', href: '/courses/intermediate/1', progress: 75 },
        { id: 'inter-2', label: '편집 테크닉', href: '/courses/intermediate/2', progress: 50 },
        { id: 'inter-3', label: '알고리즘 이해', href: '/courses/intermediate/3', progress: 25 },
      ],
    },
    {
      id: 'advanced',
      label: '고급 강의',
      children: [
        { id: 'adv-1', label: '수익화 전략', href: '/courses/advanced/1' },
        { id: 'adv-2', label: '브랜드 협업', href: '/courses/advanced/2' },
        { id: 'adv-3', label: '성장 전략', href: '/courses/advanced/3' },
      ],
    },
  ],
  '/community': [
    {
      id: 'all',
      label: '전체 게시판',
      href: '/community',
    },
    {
      id: 'notice',
      label: '공지사항',
      href: '/community/notice',
    },
    {
      id: 'free',
      label: '자유게시판',
      href: '/community/free',
    },
    {
      id: 'qna',
      label: 'Q&A',
      href: '/community/qna',
    },
    {
      id: 'showcase',
      label: '작품 공유',
      href: '/community/showcase',
    },
  ],
  // '/mypage' is handled by its own layout sidebar
  '/tools': [
    {
      id: 'thumbnail',
      label: '썸네일 제작',
      href: '/tools/thumbnail',
    },
    {
      id: 'title',
      label: '제목 생성기',
      href: '/tools/title',
    },
    {
      id: 'hashtag',
      label: '해시태그 추천',
      href: '/tools/hashtag',
    },
    {
      id: 'analytics',
      label: '분석 도구',
      href: '/tools/analytics',
    },
    {
      id: 'transcribe',
      label: '자막 생성',
      href: '/tools/transcribe',
    },
  ],
}

export function Sidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, setSidebarOpen } = useLayoutStore()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Determine which sidebar data to use based on current path
  const getSidebarItems = () => {
    for (const [path, items] of Object.entries(sidebarData)) {
      if (pathname.startsWith(path)) {
        return items
      }
    }
    return null
  }

  const sidebarItems = getSidebarItems()

  // Don't show sidebar on mypage (has its own sidebar) or if no matching data
  if (pathname.startsWith('/mypage') || !sidebarItems) return null

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  const renderSidebarItem = (item: SidebarItem, depth = 0) => {
    const isExpanded = expandedItems.includes(item.id)
    const isActive = pathname === item.href
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id}>
        <div
          className={cn(
            'group flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer',
            depth > 0 && 'pl-8',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id)
            } else if (item.href) {
              // Navigation handled by Link component
            }
          }}
        >
          {item.href && !hasChildren ? (
            <Link href={item.href} className="flex-1 flex items-center gap-2">
              {depth > 0 && <Circle className="h-2 w-2" />}
              <span>{item.label}</span>
              {item.progress !== undefined && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.progress}%
                </span>
              )}
            </Link>
          ) : (
            <div className="flex-1 flex items-center gap-2">
              {depth > 0 && <Circle className="h-2 w-2" />}
              <span>{item.label}</span>
              {item.progress !== undefined && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.progress}%
                </span>
              )}
            </div>
          )}
          {hasChildren && (
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          )}
        </div>
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1">
                {item.children!.map((child) => renderSidebarItem(child, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {item.progress !== undefined && depth === 0 && (
          <div className="mx-4 mt-1 mb-2">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:block fixed left-0 bottom-0 bg-background border-r overflow-y-auto"
        style={{
          top: 'calc(var(--top-banner-height) + var(--header-height))',
          width: 'var(--sidebar-width)',
        }}
      >
        <div className="p-4">
          <h2 className="mb-4 text-lg font-semibold">
            {pathname.startsWith('/courses') && '강의 목차'}
            {pathname.startsWith('/community') && '커뮤니티'}
            {pathname.startsWith('/mypage') && '마이페이지'}
            {pathname.startsWith('/tools') && '도구 모음'}
          </h2>
          <nav className="space-y-1">
            {sidebarItems.map((item) => renderSidebarItem(item))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-[1099]"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="lg:hidden fixed left-0 bottom-0 bg-background border-r overflow-y-auto z-[1100] animate-slideIn"
            style={{
              top: 'calc(var(--top-banner-height) + var(--header-height))',
              width: '80vw',
              maxWidth: 'var(--sidebar-width)',
            }}
          >
            <div className="p-4">
              <h2 className="mb-4 text-lg font-semibold">
                {pathname.startsWith('/courses') && '강의 목차'}
                {pathname.startsWith('/community') && '커뮤니티'}
                {pathname.startsWith('/mypage') && '마이페이지'}
                {pathname.startsWith('/tools') && '도구 모음'}
              </h2>
              <nav className="space-y-1">
                {sidebarItems.map((item) => renderSidebarItem(item))}
              </nav>
            </div>
          </aside>
        </>
      )}
    </>
  )
}