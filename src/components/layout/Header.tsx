'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  Search,
  Menu,
  X,
  User,
  BookOpen,
  Trophy,
  Heart,
  Settings,
  LogOut,
  Moon,
  Sun,
  Wrench,
  Shield,
  Calculator,
  Palette,
  Eye,
  Sparkles,
  Grid,
  Calendar,
  Rocket,
  Play,
  Gift,
  MessageSquare,
  HelpCircle,
  Users,
  Star,
  TrendingUp,
  Crown,
  GalleryHorizontalEnd,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  Button, 
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui'
import { useLayoutStore } from '@/store/layout'
import { NotificationDropdown } from './NotificationDropdown'
import { createBrowserClient } from '@/lib/supabase/browser-client'

interface SubItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
}

interface NavItem {
  label: string
  href: string
  badge?: string
  subItems?: SubItem[]
}

const navItems: NavItem[] = [
  { 
    label: '강의', 
    href: '/courses',
    subItems: [
      {
        label: '전체 강의',
        href: '/courses',
        icon: BookOpen,
        description: '모든 강의 보기'
      },
      {
        label: '인기 강의',
        href: '/courses/popular',
        icon: Trophy,
        description: '가장 인기있는 강의들'
      },
      {
        label: '신규 강의',
        href: '/courses/new',
        icon: Sparkles,
        description: '최근 추가된 강의'
      },
      {
        label: '카테고리별',
        href: '/courses/categories',
        icon: Grid,
        description: '분야별 강의 찾기'
      }
    ]
  },
  { 
    label: '무료 강의', 
    href: '/courses/free', 
    badge: 'NEW',
    subItems: [
      {
        label: '이번 주 무료',
        href: '/courses/free/weekly',
        icon: Calendar,
        description: '매주 업데이트되는 무료 강의'
      },
      {
        label: '입문자 추천',
        href: '/courses/free/beginner',
        icon: Rocket,
        description: '초보자를 위한 무료 강의'
      },
      {
        label: '체험판',
        href: '/courses/free/trial',
        icon: Play,
        description: '유료 강의 맛보기'
      },
      {
        label: '이벤트 무료',
        href: '/courses/free/event',
        icon: Gift,
        description: '기간 한정 무료 제공'
      }
    ]
  },
  { 
    label: '커뮤니티', 
    href: '/community',
    subItems: [
      {
        label: '자유 게시판',
        href: '/community/board',
        icon: MessageSquare,
        description: '자유로운 소통 공간'
      },
      {
        label: 'Q&A',
        href: '/community/qna',
        icon: HelpCircle,
        description: '질문과 답변'
      },
      {
        label: '스터디 모집',
        href: '/community/study',
        icon: Users,
        description: '함께 공부할 사람 찾기'
      },
      {
        label: '성공 사례',
        href: '/community/success',
        icon: Star,
        description: '수강생 성공 스토리'
      }
    ]
  },
  { 
    label: '도구', 
    href: '/tools', 
    badge: 'HOT',
    subItems: [
      {
        label: '디하클렌즈',
        href: '/tools/youtube-lens',
        icon: Eye,
        description: 'YouTube Shorts 영상 탐색 및 분석'
      },
      {
        label: '수익 계산기',
        href: '/tools/revenue-calculator',
        icon: Calculator,
        description: '예상 수익 계산'
      },
      {
        label: '썸네일 메이커',
        href: '/tools/thumbnail-maker',
        icon: Palette,
        description: '썸네일 제작 도구'
      },
      {
        label: '더 많은 도구',
        href: '/tools',
        icon: Wrench,
        description: '모든 도구 보기'
      }
    ]
  },
  { 
    label: '수익 인증', 
    href: '/revenue-proof',
    subItems: [
      {
        label: '수익 인증하기',
        href: '/revenue-proof/create',
        icon: TrendingUp,
        description: '내 수익 인증하기'
      },
      {
        label: '실시간 랭킹',
        href: '/revenue-proof/ranking',
        icon: Crown,
        description: '수익 랭킹 확인'
      },
      {
        label: '인증 갤러리',
        href: '/revenue-proof',
        icon: GalleryHorizontalEnd,
        description: '모든 인증 보기'
      },
      {
        label: '인증 가이드',
        href: '/revenue-proof/guide',
        icon: FileText,
        description: '인증 방법 안내'
      }
    ]
  },
]

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [userRole, setUserRole] = useState<'user' | 'instructor' | 'admin' | null>(null)
  
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
  } = useLayoutStore()

  // Get auth state from context
  const { user, signOut } = useAuth()
  const isAuthenticated = !!user

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch user role from profiles table
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (data && !error) {
          setUserRole(data.role as 'user' | 'instructor' | 'admin')
        }
      } else {
        setUserRole(null)
      }
    }

    fetchUserRole()
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Add scrolled class when scrolled more than 10px
      setIsScrolled(currentScrollY > 10)
      
      // Hide/show header based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setHeaderVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setHeaderVisible(true)
      }
      
      // Always show header when at top
      if (currentScrollY <= 10) {
        setHeaderVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, setHeaderVisible])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // TODO: 실제 검색 기능 구현 필요
      // - Supabase full-text search 구현
      // - 검색 결과 페이지 생성
      // - 검색 히스토리 저장
      console.log('검색 기능 구현 예정:', searchQuery)
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <header
      className={cn(
        'bg-background/95 backdrop-blur-sm border-b transition-all duration-300',
        isScrolled && 'shadow-sm'
      )}
      style={{
        height: isScrolled ? 'var(--header-height-scroll)' : 'var(--header-height)',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div className="container-responsive h-full flex items-center justify-between">
        {/* Logo and Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-32 h-8 flex items-center">
              <span className="text-xl font-bold text-primary">디하클</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navItems.map((item) => {
                if (item.subItems) {
                  return (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuTrigger 
                        className={cn(
                          'flex items-center gap-2 text-sm font-medium hover:text-primary data-[state=open]:text-primary transition-none',
                          pathname.startsWith(item.href) ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {item.label}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid gap-2 p-4 w-[400px] lg:w-[500px]">
                          {item.subItems.map((subItem) => (
                            <NavigationMenuLink key={subItem.href} asChild>
                              <Link
                                href={subItem.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary group"
                              >
                                <div className="flex items-center gap-3">
                                  {subItem.icon && (
                                    <subItem.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                  )}
                                  <div className="flex-1">
                                    <div className="text-sm font-medium leading-none mb-1">
                                      {subItem.label}
                                    </div>
                                    <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                      {subItem.description}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                } else {
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
                  )
                }
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-64 h-9"
              />
            </div>
          </form>

          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSearch}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationDropdown 
                isOpen={isNotificationOpen} 
                onOpenChange={toggleNotification} 
              />

              {/* Profile Dropdown */}
              <DropdownMenu open={isProfileOpen} onOpenChange={toggleProfile}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/mypage" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      마이페이지
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mypage/courses" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      내 강의
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mypage/achievements" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      업적
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mypage/wishlist" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      찜 목록
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      설정
                    </Link>
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        관리자
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">로그인</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/auth/signup">회원가입</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden border-t p-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-background border-b shadow-lg z-[1100]">
          <nav className="p-4 space-y-2 max-h-[calc(100vh-var(--header-height))] overflow-y-auto">
            {navItems.map((item) => {
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
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => toggleMobileMenu()}
                          className={cn(
                            'flex items-center gap-3 p-2 rounded-md hover:bg-primary/10 hover:text-primary',
                            pathname === subItem.href && 'bg-primary/10 text-primary'
                          )}
                        >
                          {subItem.icon && (
                            <subItem.icon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="flex-1">
                            <div className="text-sm">{subItem.label}</div>
                            <div className="text-xs text-muted-foreground">{subItem.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              } else {
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
                )
              }
            })}
          </nav>
        </div>
      )}
    </header>
  )
}