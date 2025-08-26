import { cn } from '@/lib/utils'

interface ScreenReaderOnlyProps {
  children: React.ReactNode
  as?: React.ElementType
  className?: string
}

export function ScreenReaderOnly({
  children,
  as: Component = 'span',
  className,
}: ScreenReaderOnlyProps) {
  return (
    <Component
      className={cn(
        'sr-only',
        // Tailwind의 sr-only 클래스 정의
        'absolute w-px h-px p-0 -m-px overflow-hidden',
        'clip-[rect(0,0,0,0)] whitespace-nowrap border-0',
        className
      )}
    >
      {children}
    </Component>
  )
}

// 실시간 알림을 위한 컴포넌트 (스크린 리더가 즉시 읽음)
interface LiveRegionProps {
  children: React.ReactNode
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all' | 'additions text'
  className?: string
}

export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions text',
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  )
}

// 스킵 네비게이션 컴포넌트
interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'focus:bg-white focus:px-4 focus:py-2 focus:rounded-md',
        'focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
        'focus:text-blue-900 focus:font-medium',
        className
      )}
    >
      {children}
    </a>
  )
}