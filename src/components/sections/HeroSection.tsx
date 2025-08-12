'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { 
  StripeButton, 
  StripeTypography, 
  StripeGradient 
} from '@/components/design-system';
import { theme } from '@/components/design-system/common';

export function HeroSection() {
  const [studentCount, setStudentCount] = useState(10200);
  const [totalRevenue, setTotalRevenue] = useState(42.0);

  // Animate counters on mount
  useEffect(() => {
    // Animate student count
    const studentInterval = setInterval(() => {
      setStudentCount(prev => {
        if (prev >= 10342) {
          clearInterval(studentInterval);
          return 10342;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 50);

    // Animate revenue
    const revenueInterval = setInterval(() => {
      setTotalRevenue(prev => {
        if (prev >= 42.3) {
          clearInterval(revenueInterval);
          return 42.3;
        }
        return Math.min(prev + 0.1, 42.3);
      });
    }, 100);

    return () => {
      clearInterval(studentInterval);
      clearInterval(revenueInterval);
    };
  }, []);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <StripeGradient 
      variant="hero" 
      animated 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background overlay for better text readability */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          background: `linear-gradient(180deg, 
            ${theme.colors.neutral.white}00 0%, 
            ${theme.colors.neutral.white}40 50%, 
            ${theme.colors.neutral.white}80 100%)`
        }} 
      />

      {/* Main content container */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Main title with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <StripeTypography 
            variant="h1" 
            color="primary"
            className="mb-6 font-bold"
          >
            유튜브로 월 1000만원,
            <br />
            우리가 증명합니다
          </StripeTypography>
        </motion.div>

        {/* Statistics section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8"
        >
          {/* Student count */}
          <div className="text-center">
            <StripeTypography variant="caption" color="muted" className="mb-2">
              현재 수강생
            </StripeTypography>
            <div className="flex items-baseline gap-1">
              <StripeTypography variant="h3" color="primary" className="font-bold">
                {studentCount.toLocaleString('ko-KR')}
              </StripeTypography>
              <StripeTypography variant="body" color="muted">
                명
              </StripeTypography>
            </div>
          </div>

          {/* Divider */}
          <div 
            className="hidden sm:block w-px h-12" 
            style={{ backgroundColor: theme.colors.neutral.gray['200'] }}
          />

          {/* Total revenue */}
          <div className="text-center">
            <StripeTypography variant="caption" color="muted" className="mb-2">
              총 수익
            </StripeTypography>
            <div className="flex items-baseline gap-1">
              <StripeTypography variant="h3" color="primary" className="font-bold">
                ₩{totalRevenue.toFixed(1)}
              </StripeTypography>
              <StripeTypography variant="body" color="muted">
                억
              </StripeTypography>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <StripeButton 
            variant="primary" 
            size="lg"
            onClick={() => console.log('무료 체험 시작하기 클릭')}
          >
            무료 체험 시작하기
          </StripeButton>
          <StripeButton 
            variant="secondary" 
            size="lg"
            onClick={() => console.log('성공 사례 보기 클릭')}
          >
            성공 사례 보기
          </StripeButton>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={scrollToNext}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <ChevronDown 
              size={32} 
              style={{ color: theme.colors.text.primary.light }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left gradient orb */}
        <div 
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ 
            background: `radial-gradient(circle, ${theme.colors.primary.blue.default}, transparent)` 
          }}
        />
        {/* Bottom-right gradient orb */}
        <div 
          className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ 
            background: `radial-gradient(circle, ${theme.colors.primary.lightBlue}, transparent)` 
          }}
        />
      </div>
    </StripeGradient>
  );
}