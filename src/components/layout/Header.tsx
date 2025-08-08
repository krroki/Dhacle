'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '../ui/Button';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary hover:text-accent transition-colors">
          쇼츠 스튜디오
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/tools" className="text-primary/80 hover:text-primary transition-colors">
            툴박스
          </Link>
          <Link href="/resources" className="text-primary/80 hover:text-primary transition-colors">
            자료실
          </Link>
          <Link href="/community" className="text-primary/80 hover:text-primary transition-colors">
            커뮤니티
          </Link>
        </div>

        {/* Auth Button */}
        <div>
          {isLoggedIn ? (
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 text-primary/80 hover:text-primary transition-colors"
            >
              <span>마이페이지</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" />
            </button>
          ) : (
            <Button onClick={() => setIsLoggedIn(true)}>
              카카오 로그인
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}