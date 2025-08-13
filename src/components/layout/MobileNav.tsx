'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Wrench, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavItem {
  icon: React.ElementType
  label: string
  href: string
}

const mobileNavItems: MobileNavItem[] = [
  { icon: Home, label: '홈', href: '/' },
  { icon: BookOpen, label: '무료 강의', href: '/courses/free' },
  { icon: Wrench, label: '도구', href: '/tools' },
  { icon: User, label: '마이페이지', href: '/mypage' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-[1000] safe-area-bottom">
      <div className="grid grid-cols-4 h-[var(--mobile-nav-height)]">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}