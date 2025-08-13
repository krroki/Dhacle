'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
})

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.done()
    return () => {
      NProgress.start()
    }
  }, [pathname, searchParams])

  return null
}

export function ScrollProgressBar() {
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      
      // Update CSS variable for scroll progress
      document.documentElement.style.setProperty('--scroll-progress', `${scrollPercent}%`)
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20"
    >
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{
          width: 'var(--scroll-progress, 0%)',
        }}
      />
    </div>
  )
}