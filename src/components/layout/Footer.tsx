'use client'

import Link from 'next/link'
import { Youtube, Instagram, MessageCircle, Mail, Phone } from 'lucide-react'
import { Button, Input, Separator } from '@/components/ui'

const footerLinks = {
  service: [
    { label: '서비스 약관', href: '/terms' },
    { label: '개인정보 처리방침', href: '/privacy' },
    { label: '자주 묻는 질문', href: '/faq' },
    { label: '고객센터', href: '/support' },
  ],
  education: [
    { label: '전체 강의', href: '/courses' },
    { label: '무료 강의', href: '/courses/free' },
    { label: '신규 강의', href: '/courses/new' },
    { label: '로드맵', href: '/roadmap' },
  ],
  community: [
    { label: '공지사항', href: '/community/notice' },
    { label: 'Q&A', href: '/community/qna' },
    { label: '작품 공유', href: '/community/showcase' },
    { label: '스터디 모집', href: '/community/study' },
  ],
  company: [
    { label: '회사 소개', href: '/about' },
    { label: '채용 정보', href: '/careers' },
    { label: '제휴 문의', href: '/partnership' },
    { label: '광고 문의', href: '/advertising' },
  ],
}

const socialLinks = [
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com', color: 'hover:text-red-600' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', color: 'hover:text-pink-600' },
  { name: '카카오톡 채널', icon: MessageCircle, href: 'https://pf.kakao.com', color: 'hover:text-yellow-600' },
]

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 뉴스레터 구독 기능 구현 필요
    // - Supabase newsletter_subscribers 테이블 생성
    // - 이메일 유효성 검증 (Zod 스키마)
    // - 구독 API 엔드포인트 생성 (/api/newsletter/subscribe)
    // - 이메일 서비스 연동 (SendGrid, AWS SES 등)
    // - 구독 확인 이메일 발송
    console.log('뉴스레터 구독 기능 구현 예정')
  }

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container-responsive py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-primary">디하클</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                YouTube Shorts 크리에이터를 위한 체계적인 교육 플랫폼
              </p>
            </div>
            
            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-2">뉴스레터 구독</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className="flex-1"
                  required
                />
                <Button type="submit" size="sm">
                  구독하기
                </Button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">
                최신 강의와 유용한 팁을 이메일로 받아보세요
              </p>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-semibold mb-3">소셜 미디어</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full bg-background border transition-colors ${social.color}`}
                      aria-label={social.name}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">서비스</h4>
            <ul className="space-y-2">
              {footerLinks.service.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">교육</h4>
            <ul className="space-y-2">
              {footerLinks.education.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">커뮤니티</h4>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Business Info & Copyright */}
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span>사업자등록번호: 123-45-67890</span>
            <span className="hidden sm:inline">|</span>
            <span>대표: 홍길동</span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              support@dhacle.com
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              1588-0000
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p>© 2025 Dhacle. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/sitemap" className="hover:text-foreground transition-colors">
                사이트맵
              </Link>
              <Link href="/accessibility" className="hover:text-foreground transition-colors">
                접근성
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}