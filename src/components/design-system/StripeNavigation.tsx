'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface NavigationItem {
  name: string;
  href: string;
}

interface StripeNavigationProps {
  logo?: string;
  items?: NavigationItem[];
  className?: string;
}

const defaultItems: NavigationItem[] = [
  { name: '툴박스', href: '#tools' },
  { name: '자료실', href: '#resources' },
  { name: '커뮤니티', href: '#community' },
  { name: '가격', href: '#pricing' },
];

const StripeNavigation: React.FC<StripeNavigationProps> = ({
  logo = '쇼츠 스튜디오',
  items = defaultItems,
  className,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { theme } = useTheme();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        className
      )}
      style={{ height: '68px' }}
      initial={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}
      animate={{
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0)',
        backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'blur(0px)',
        boxShadow: isScrolled 
          ? '0 1px 0 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' 
          : '0 0 0 0 transparent',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="mx-auto max-w-[1080px] px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href="/"
              className={cn(
                'text-xl font-bold transition-colors duration-300',
                isScrolled ? 'text-gray-900' : 'text-white drop-shadow-lg'
              )}
              style={{ fontFamily: theme.typography.fontFamily.base }}
            >
              {logo}
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {items.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className={cn(
                  'text-[15px] font-medium transition-all duration-300 relative group',
                  isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
                )}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 3) }}
                whileHover={{ y: -1 }}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <a
              href="#signin"
              className={cn(
                'hidden sm:block text-[15px] font-medium transition-all duration-300',
                isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
              )}
            >
              로그인
            </a>
            <motion.a
              href="#start"
              className={cn(
                'px-4 py-2 text-[15px] font-medium rounded-full transition-all duration-300',
                isScrolled
                  ? 'bg-gradient-to-r from-[#635BFF] to-[#4F46E5] text-white hover:shadow-lg'
                  : 'bg-white/95 text-gray-900 hover:bg-white hover:shadow-xl'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: isScrolled 
                  ? '0 4px 14px 0 rgba(99, 91, 255, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.12)',
              }}
            >
              무료로 시작하기
            </motion.a>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className={cn(
              'md:hidden p-2 transition-colors duration-300',
              isScrolled ? 'text-gray-900' : 'text-white'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default StripeNavigation;