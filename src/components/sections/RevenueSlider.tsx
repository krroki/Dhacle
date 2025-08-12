'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Calendar, BookOpen } from 'lucide-react';
import { StripeTypography, StripeCard } from '@/components/design-system';
import { theme } from '@/components/design-system/common';

interface RevenueData {
  id: number;
  name: string;
  avatar: string;
  amount: number;
  date: string;
  course: string;
  verified: boolean;
}

const revenueData: RevenueData[] = [
  {
    id: 1,
    name: '김민수',
    avatar: 'https://i.pravatar.cc/150?img=1',
    amount: 3200000,
    date: '2025-01-09',
    course: '유튜브 쇼츠 마스터 클래스',
    verified: true
  },
  {
    id: 2,
    name: '이서연',
    avatar: 'https://i.pravatar.cc/150?img=2',
    amount: 5800000,
    date: '2025-01-09',
    course: 'AI 콘텐츠 자동화 시스템',
    verified: true
  },
  {
    id: 3,
    name: '박준호',
    avatar: 'https://i.pravatar.cc/150?img=3',
    amount: 12000000,
    date: '2025-01-08',
    course: '월 천만원 수익화 전략',
    verified: true
  },
  {
    id: 4,
    name: '최지원',
    avatar: 'https://i.pravatar.cc/150?img=4',
    amount: 4500000,
    date: '2025-01-08',
    course: '릴스 바이럴 마케팅',
    verified: true
  },
  {
    id: 5,
    name: '정현우',
    avatar: 'https://i.pravatar.cc/150?img=5',
    amount: 8900000,
    date: '2025-01-07',
    course: '유튜브 쇼츠 마스터 클래스',
    verified: true
  }
];

export function RevenueSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % revenueData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: number) => {
    return `₩${(amount / 10000).toFixed(0)}만원`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return dateStr;
  };

  return (
    <div style={{
      padding: `${theme.spacing[10]} ${theme.spacing[6]}`,
      backgroundColor: theme.colors.neutral.offWhite
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: theme.spacing[12] }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <StripeTypography variant="h2" color="dark">
              실시간 수익 인증 🔥
            </StripeTypography>
            <div style={{ marginTop: theme.spacing[2] }}>
              <StripeTypography variant="body" color="muted">
                디하클 수강생들의 실제 수익을 확인하세요
              </StripeTypography>
            </div>
          </motion.div>
        </div>

        {/* Revenue Cards Slider */}
        <div style={{
          position: 'relative',
          height: '200px',
          overflow: 'hidden'
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: theme.spacing[4]
              }}
            >
              {[0, 1, 2].map((offset) => {
                const index = (currentIndex + offset) % revenueData.length;
                const item = revenueData[index];
                
                return (
                  <StripeCard
                    key={item.id}
                    variant="bordered"
                    elevation="sm"
                    padding="md"
                  >
                    <div style={{ display: 'flex', gap: theme.spacing[4] }}>
                      {/* Avatar */}
                      <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          fill
                          sizes="60px"
                          style={{
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                      
                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[2] }}>
                          <StripeTypography 
                            variant="body" 
                            color="dark" 
                            style={{ fontWeight: theme.typography.fontWeight.semibold }}
                          >
                            {item.name}
                          </StripeTypography>
                          {item.verified && (
                            <span style={{
                              backgroundColor: '#10B981',
                              color: 'white',
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 'bold'
                            }}>
                              인증됨
                            </span>
                          )}
                        </div>
                        
                        {/* Amount */}
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold',
                          color: theme.colors.primary.blue.default,
                          marginBottom: theme.spacing[2]
                        }}>
                          {formatAmount(item.amount)}
                        </div>
                        
                        {/* Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[1] }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[1] }}>
                            <Calendar size={14} style={{ color: theme.colors.text.primary.light }} />
                            <StripeTypography variant="caption" color="muted">
                              {formatDate(item.date)}
                            </StripeTypography>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[1] }}>
                            <BookOpen size={14} style={{ color: theme.colors.text.primary.light }} />
                            <StripeTypography variant="caption" color="muted">
                              {item.course}
                            </StripeTypography>
                          </div>
                        </div>
                      </div>
                    </div>
                  </StripeCard>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: theme.spacing[2],
          marginTop: theme.spacing[8]
        }}>
          {revenueData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: index === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: index === currentIndex 
                  ? theme.colors.primary.blue.default 
                  : theme.colors.neutral.gray['300'],
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              aria-label={`수익 인증 ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}