import {
  Coffee,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from 'lucide-react';
import Link from 'next/link';
import { Button, Separator } from '@/components/ui';

const footer_links = {
  service: [
    { label: '서비스 약관', href: '/terms' },
    { label: '개인정보 처리방침', href: '/privacy' },
  ],
  tools: [
    { label: 'YouTube Lens', href: '/tools/youtube-lens' },
    { label: '수익 계산기', href: '/tools/revenue-calculator' },
    { label: '썸네일 제작기', href: '/tools/thumbnail-maker' },
  ],
  support: [
    { label: 'API 키 발급', href: '/docs/get-api-key' },
    { label: '사용 가이드', href: '/docs/guide' },
    { label: '접근성', href: '/accessibility' },
  ],
};

const social_links = [
  {
    name: 'YouTube',
    icon: Youtube,
    href: 'https://www.youtube.com/@%EB%A7%88%EC%BC%80%ED%84%B0%EC%A0%9C%EC%9D%B4J',
    color: 'hover:text-red-600',
  },
  {
    name: 'Instagram', 
    icon: Instagram,
    href: 'https://www.instagram.com/marketerjjj',
    color: 'hover:text-pink-600',
  },
  {
    name: '카카오톡 오픈채팅',
    icon: MessageCircle,
    href: 'https://open.kakao.com/o/goShEsJg',
    color: 'hover:text-yellow-600',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    href: 'https://www.facebook.com/dhacle',
    color: 'hover:text-blue-600',
  },
];

interface FooterLayoutProps {
  children?: React.ReactNode;
}

export function FooterLayout({ children }: FooterLayoutProps) {
  return (
    <footer className="border-t bg-background">
      <div className="container-responsive py-12">
        {/* 메인 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* 회사 정보 */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Coffee className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">디하클</span>
            </div>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              크리에이터를 위한 올인원 플랫폼<br />
              YouTube 분석부터 수익화까지, 한 곳에서 해결하세요.
            </p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@dhacle.com</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>고객센터: 1588-0000</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>서울특별시 강남구</span>
              </div>
            </div>
          </div>

          {/* 도구 */}
          <div>
            <h3 className="font-semibold mb-4">도구</h3>
            <ul className="space-y-3">
              {footer_links.tools.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="font-semibold mb-4">고객지원</h3>
            <ul className="space-y-3">
              {footer_links.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 법적 정보 */}
          <div>
            <h3 className="font-semibold mb-4">법적 정보</h3>
            <ul className="space-y-3">
              {footer_links.service.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}

        <Separator className="my-8" />

        {/* 하단 섹션 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 디하클(Dhacle). All rights reserved.
          </div>
          
          {/* 소셜 미디어 링크 */}
          <div className="flex items-center gap-4">
            {social_links.map((social) => {
              const Icon = social.icon;
              return (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="icon"
                  asChild
                  className={`text-muted-foreground ${social.color} transition-colors`}
                >
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}