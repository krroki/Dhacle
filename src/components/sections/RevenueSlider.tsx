'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Calendar, BookOpen, CheckCircle } from 'lucide-react';
import { StripeTypography, StripeCard } from '@/components/design-system';
import * as S from './RevenueSlider.styled';

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
    amount: 8900000,
    date: '2025-01-08',
    course: '유튜브 쇼츠 마스터 클래스',
    verified: true
  },
  {
    id: 5,
    name: '정하늘',
    avatar: 'https://i.pravatar.cc/150?img=5',
    amount: 15000000,
    date: '2025-01-07',
    course: '월 천만원 수익화 전략',
    verified: true
  }
];

export default function RevenueSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(revenueData.length / 3));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: number) => {
    return `₩${(amount / 10000).toLocaleString()}만원`;
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
    <S.SliderSection>
      <S.BackgroundDecoration />
      
      <S.SliderContainer>
        {/* Section Title */}
        <S.SectionHeader>
          <S.TitleWrapper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <StripeTypography variant="h2" color="dark">
              실시간 수익 인증 🔥
            </StripeTypography>
            <S.SubtitleWrapper>
              <StripeTypography variant="body" color="muted">
                디하클 수강생들의 실제 수익을 확인하세요
              </StripeTypography>
            </S.SubtitleWrapper>
          </S.TitleWrapper>
        </S.SectionHeader>

        {/* Revenue Cards Slider */}
        <S.SliderWrapper>
          <AnimatePresence mode="wait">
            <S.SlideContainer
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
            >
              {[0, 1, 2].map((offset) => {
                const index = (currentIndex * 3 + offset) % revenueData.length;
                const item = revenueData[index];
                
                return (
                  <StripeCard
                    key={item.id}
                    variant="bordered"
                    elevation="sm"
                    padding="md"
                  >
                    <S.UserInfo>
                      {/* Avatar */}
                      <S.Avatar>
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          fill
                          sizes="48px"
                          style={{ objectFit: 'cover' }}
                        />
                      </S.Avatar>
                      
                      {/* User Details */}
                      <S.UserDetails>
                        <S.UserName>
                          {item.name}
                          {item.verified && (
                            <S.VerifiedBadge
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                            >
                              <CheckCircle size={12} />
                            </S.VerifiedBadge>
                          )}
                        </S.UserName>
                        
                        <S.UserDate>
                          <Calendar size={14} />
                          {formatDate(item.date)}
                        </S.UserDate>
                      </S.UserDetails>
                    </S.UserInfo>
                    
                    {/* Amount Display */}
                    <S.AmountDisplay>
                      <S.AmountLabel>월 수익</S.AmountLabel>
                      <S.AmountValue
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {formatAmount(item.amount)}
                      </S.AmountValue>
                    </S.AmountDisplay>
                    
                    {/* Course Info */}
                    <S.CourseInfo>
                      <S.CourseIcon>
                        <BookOpen size={16} />
                      </S.CourseIcon>
                      <S.CourseName>
                        {item.course}
                      </S.CourseName>
                    </S.CourseInfo>
                  </StripeCard>
                );
              })}
            </S.SlideContainer>
          </AnimatePresence>
        </S.SliderWrapper>

        {/* Progress Dots */}
        <S.ProgressDots>
          {Array.from({ length: Math.ceil(revenueData.length / 3) }).map((_, index) => (
            <S.Dot
              key={index}
              $active={index === currentIndex}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </S.ProgressDots>
      </S.SliderContainer>
    </S.SliderSection>
  );
}