'use client';

import { createBrowserClient } from '@/lib/supabase/browser-client';
import {
  Calculator,
  Eye,
  FileText,
  LogOut,
  Menu,
  Moon,
  Palette,
  Search,
  Settings,
  Shield,
  Sun,
  User,
  Wrench,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/store/layout';
import { NotificationDropdown } from './NotificationDropdown';

interface SubItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface NavItem {
  label: string;
  href: string;
  badge?: string;
  subItems?: SubItem[];
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
        icon: Eye,
        description: 'YouTube 채널 분석 및 키워드 트렌드',
      },
      {
        label: '수익 계산기',
        href: '/tools/revenue-calculator',
        icon: Calculator,
        description: 'YouTube 수익 예측 도구',
      },
      {
        label: '썸네일 제작기',
        href: '/tools/thumbnail-maker',
        icon: Palette,
        description: 'AI 기반 썸네일 제작',
      },
      {
        label: '모든 도구',
        href: '/tools',
        icon: Wrench,
        description: '전체 도구 모음',
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
        icon: FileText,
        description: 'YouTube API 키 설정하기',
      },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, set_mounted] = useState(false);
  const [is_scrolled, set_is_scrolled] = useState(false);
  const [last_scroll_y, set_last_scroll_y] = useState(0);
  const [search_query, set_search_query] = useState('');
  const [user_role, set_user_role] = useState<'user' | 'admin' | null>(null);

  const {
    isHeaderVisible,
    setHeaderVisible,
    isMobileMenuOpen,
    toggleMobileMenu,
    isSearchOpen,
    toggleSearch,
    isNotificationOpen,
    toggleNotification,
    isProfileOpen,
    toggleProfile,
  } = useLayoutStore();

  // Get auth state from context
  const { user, signOut } = useAuth();
  const is_authenticated = !!user;

  useEffect(() => {
    set_mounted(true);
  }, []);

  // Fetch user role from profiles table
  useEffect(() => {
    const fetch_user_role = async () => {
      if (user) {
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          set_user_role(data.role as 'user' | 'admin');
        } else {
          // Default to 'user' role if profile not found
          set_user_role('user');
        }
      } else {
        set_user_role(null);
      }
    };

    fetch_user_role();
  }, [user]);

  useEffect(() => {
    const handle_scroll = () => {
      const current_scroll_y = window.scrollY;

      // Add scrolled class when scrolled more than 10px
      set_is_scrolled(current_scroll_y > 10);

      // Hide/show header based on scroll direction
      if (current_scroll_y > last_scroll_y && current_scroll_y > 100) {
        // Scrolling down - hide header
        setHeaderVisible(false);
      } else if (current_scroll_y < last_scroll_y) {
        // Scrolling up - show header
        setHeaderVisible(true);
      }

      // Always show header when at top
      if (current_scroll_y <= 10) {
        setHeaderVisible(true);
      }

      set_last_scroll_y(current_scroll_y);
    };

    window.addEventListener('scroll', handle_scroll, { passive: true });
    return () => window.removeEventListener('scroll', handle_scroll);
  }, [last_scroll_y, setHeaderVisible]);

  const handle_search = (e: React.FormEvent) => {
    e.preventDefault();
    if (search_query.trim()) {
      // TODO: 실제 검색 기능 구현 필요
      // - Supabase full-text search 구현
      // - 검색 결과 페이지 생성
      // - 검색 히스토리 저장
      console.log('검색 기능 구현 예정:', search_query);
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(search_query)}`;
    }
  };

  const handle_logout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <header
      className={cn(
        'bg-background/95 backdrop-blur-sm border-b transition-all duration-300 relative z-[1000]',
        is_scrolled ? 'h-10 shadow-sm' : 'h-20',
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <div className="container-responsive h-full flex items-center justify-between">
        {/* Logo and Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            {/* 데스크톱 로고 */}
            <Image
              src="/images/logo/dhacle-logo@2x.png"
              alt="디하클"
              width={120}
              height={36}
              className="hidden md:block"
              priority={true}
              quality={80}
            />
            {/* 모바일 로고 */}
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

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {nav_items.map((item) => {
                if (item.subItems) {
                  return (
                    <NavigationMenuItem key={item.href}>
                      <Link href={item.href} className="block" passHref={true}>
                        <NavigationMenuTrigger
                          className={cn(
                            'cursor-pointer',
                            pathname.startsWith(item.href)
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          )}
                        >
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </NavigationMenuTrigger>
                      </Link>
                      <NavigationMenuContent>
                        <div className="grid gap-2 p-4 w-[400px] lg:w-[500px]">
                          {item.subItems.map((sub_item) => (
                            <NavigationMenuLink key={sub_item.href} asChild={true}>
                              <Link
                                href={sub_item.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary group"
                              >
                                <div className="flex items-center gap-3">
                                  {sub_item.icon && (
                                    <sub_item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                  )}
                                  <div className="flex-1">
                                    <div className="text-sm font-medium leading-none mb-1">
                                      {sub_item.label}
                                    </div>
                                    <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                      {sub_item.description}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                }
                return (
                  <NavigationMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 text-sm font-medium hover:text-primary px-3 py-2',
                        pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handle_search} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                value={search_query}
                onChange={(e) => set_search_query(e.target.value)}
                className="pl-10 pr-4 w-64 h-9"
              />
            </div>
          </form>

          {/* Mobile Search Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSearch}>
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {is_authenticated ? (
            <>
              {/* Notifications */}
              <NotificationDropdown isOpen={isNotificationOpen} onOpenChange={toggleNotification} />

              {/* Profile Dropdown */}
              <DropdownMenu open={isProfileOpen} onOpenChange={toggleProfile}>
                <DropdownMenuTrigger asChild={true}>
                  <Button variant="ghost" size="icon">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  alignOffset={-5}
                  sideOffset={8}
                  className="w-56 z-[1200] bg-background border shadow-lg"
                  forceMount={true}
                >
                  <DropdownMenuItem asChild={true}>
                    <Link href="/mypage" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      마이페이지
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild={true}>
                    <Link href="/settings/api-keys" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      API 키 관리
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild={true}>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      설정
                    </Link>
                  </DropdownMenuItem>
                  {user_role === 'admin' && (
                    <DropdownMenuItem asChild={true}>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        관리자
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handle_logout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild={true}>
                <Link href="/auth/login">로그인</Link>
              </Button>
              <Button asChild={true} className="hidden sm:inline-flex">
                <Link href="/auth/signup">회원가입</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden border-t p-4">
          <form onSubmit={handle_search}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                value={search_query}
                onChange={(e) => set_search_query(e.target.value)}
                className="pl-10 pr-4 w-full"
                autoFocus={true}
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-background border-b shadow-lg z-[1100]">
          <nav className="p-4 space-y-2 max-h-[calc(100vh-var(--header-height))] overflow-y-auto">
            {nav_items.map((item) => {
              if (item.subItems) {
                return (
                  <div key={item.href} className="space-y-1">
                    <div className="flex items-center justify-between p-3 rounded-md font-medium text-muted-foreground">
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="ml-4 space-y-1">
                      {item.subItems.map((sub_item) => (
                        <Link
                          key={sub_item.href}
                          href={sub_item.href}
                          onClick={() => toggleMobileMenu()}
                          className={cn(
                            'flex items-center gap-3 p-2 rounded-md hover:bg-primary/10 hover:text-primary',
                            pathname === sub_item.href && 'bg-primary/10 text-primary'
                          )}
                        >
                          {sub_item.icon && (
                            <sub_item.icon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="flex-1">
                            <div className="text-sm">{sub_item.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {sub_item.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => toggleMobileMenu()}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-md hover:bg-primary/10 hover:text-primary',
                    pathname === item.href && 'bg-primary/10 text-primary'
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
