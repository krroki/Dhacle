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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useLayoutStore } from '@/store/layout'
import { NotificationDropdown } from './NotificationDropdown'

interface NavItem {
  label: string
  href: string
  badge?: string
}

const navItems: NavItem[] = [
  { label: '강의', href: '/courses' },
  { label: '무료 강의', href: '/courses/free', badge: 'NEW' },
  { label: '커뮤니티', href: '/community' },
  { label: '도구', href: '/tools', badge: 'HOT' },
  { label: '수익 인증', href: '/revenue' },
]

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  
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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Add scrolled class
      setIsScrolled(currentScrollY > 10)
      
      // Hide/show header based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false)
      } else {
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
        'relative bg-background/95 backdrop-blur-sm border-b transition-all duration-300',
        isScrolled && 'shadow-sm',
        !isHeaderVisible && '-translate-y-full'
      )}
      style={{
        height: isScrolled ? 'var(--header-height-scroll)' : 'var(--header-height)',
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
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
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
            ))}
          </nav>
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
        <div className="lg:hidden fixed inset-0 top-[var(--header-height)] bg-background z-[1100]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => toggleMobileMenu()}
                className={cn(
                  'flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors',
                  pathname === item.href && 'bg-muted'
                )}
              >
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}