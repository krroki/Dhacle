'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode, useEffect, useState } from 'react'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { LayoutProvider } from '@/lib/layout/LayoutContext'
import { useLayoutStore } from '@/store/layout'

interface ProvidersProps {
  children: ReactNode
}

function DynamicPaddingProvider({ children }: { children: ReactNode }) {
  const { isBannerClosed } = useLayoutStore()
  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll() // 초기값 설정
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  useEffect(() => {
    const updatePadding = () => {
      const bannerHeight = isBannerClosed ? 0 : 48
      const headerHeight = isScrolled ? 40 : 80
      const totalHeight = bannerHeight + headerHeight
      
      // Main content padding 동적 조정
      const mainContent = document.querySelector('.flex.min-h-screen')
      if (mainContent) {
        (mainContent as HTMLElement).style.paddingTop = `${totalHeight}px`
      }
    }
    
    updatePadding()
  }, [isBannerClosed, isScrolled])
  
  return <>{children}</>
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        <LayoutProvider>
          <DynamicPaddingProvider>
            {children}
          </DynamicPaddingProvider>
        </LayoutProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}