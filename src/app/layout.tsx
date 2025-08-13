import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { TopBanner } from '@/components/layout/TopBanner'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { ProgressBar, ScrollProgressBar } from '@/components/layout/ProgressBar'
import { Suspense } from 'react'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: '디하클 - YouTube Shorts 크리에이터 교육 플랫폼',
    template: '%s | 디하클'
  },
  description: 'YouTube Shorts 크리에이터를 위한 체계적인 교육과 커뮤니티 플랫폼. 전문가의 노하우로 성공적인 크리에이터가 되세요.',
  keywords: ['YouTube Shorts', '유튜브 쇼츠', '크리에이터', '교육', '온라인 강의', '동영상 편집'],
  authors: [{ name: '디하클 팀' }],
  creator: '디하클',
  publisher: '디하클',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://dhacle.com'),
  openGraph: {
    title: '디하클 - YouTube Shorts 크리에이터 교육 플랫폼',
    description: 'YouTube Shorts 크리에이터를 위한 체계적인 교육과 커뮤니티 플랫폼',
    url: 'https://dhacle.com',
    siteName: '디하클',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '디하클 - YouTube Shorts 크리에이터 교육 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '디하클 - YouTube Shorts 크리에이터 교육 플랫폼',
    description: 'YouTube Shorts 크리에이터를 위한 체계적인 교육과 커뮤니티 플랫폼',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://dhacle.com',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          {/* Progress Bar */}
          <Suspense fallback={null}>
            <ProgressBar />
          </Suspense>
          <ScrollProgressBar />
          
          {/* Top Banner */}
          <TopBanner />
          
          {/* Header */}
          <Header />
          
          {/* Main Layout */}
          <div className="flex flex-1" style={{ paddingTop: 'calc(var(--header-height) + var(--top-banner-height))' }}>
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-[calc(100vh-var(--header-height)-var(--top-banner-height))]">
              <div className="flex-1">
                {children}
              </div>
              
              {/* Footer */}
              <Footer />
            </main>
          </div>
          
          {/* Mobile Navigation */}
          <MobileNav />
          
          {/* Scroll to Top */}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}