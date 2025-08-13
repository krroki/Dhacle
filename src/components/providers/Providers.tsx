'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { LayoutProvider } from '@/lib/layout/LayoutContext'

interface ProvidersProps {
  children: ReactNode
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
          {children}
        </LayoutProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}