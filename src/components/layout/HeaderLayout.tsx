// Server Component: Header Layout (Static Parts)
// Contains logo, navigation structure without client interactions

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui';

interface NavItem {
  label: string;
  href: string;
  badge?: string;
  subItems?: SubItem[];
}

interface SubItem {
  label: string;
  href: string;
  description?: string;
}

const nav_items: NavItem[] = [
  {
    label: '도구',
    href: '/tools',
    badge: 'HOT',
    subItems: [
      {
        label: 'YouTube Lens',
        href: '/tools/youtube-lens',
        description: 'YouTube 채널 분석 및 키워드 트렌드',
      },
      {
        label: '수익 계산기',
        href: '/tools/revenue-calculator',
        description: 'YouTube 수익 예측 도구',
      },
      {
        label: '썸네일 제작기',
        href: '/tools/thumbnail-maker',
        description: 'AI 기반 썸네일 제작',
      },
    ],
  },
  {
    label: 'API',
    href: '/docs/get-api-key',
    subItems: [
      {
        label: 'API 키 발급',
        href: '/docs/get-api-key',
        description: 'YouTube API 키 설정하기',
      },
    ],
  },
];

interface HeaderLayoutProps {
  children?: React.ReactNode;
}

export function HeaderLayout({ children }: HeaderLayoutProps) {
  return (
    <header className="bg-background/95 backdrop-blur-sm border-b">
      <div className="container-responsive h-full flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            {/* Desktop Logo */}
            <Image
              src="/images/logo/dhacle-logo@2x.png"
              alt="디하클"
              width={120}
              height={36}
              className="hidden md:block"
              priority={true}
              quality={80}
            />
            {/* Mobile Logo */}
            <Image
              src="/images/logo/dhacle-logo-mobile.png"
              alt="디하클"
              width={90}
              height={27}
              className="block md:hidden"
              priority={true}
              quality={80}
            />
          </Link>

          {/* Desktop Navigation - Static Structure */}
          <nav className="hidden lg:flex">
            <ul className="flex items-center space-x-8">
              {nav_items.map((item) => (
                <li key={item.href} className="relative">
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2"
                  >
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Right Side - Interactive Components */}
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}