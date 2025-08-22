'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RevenueProofCard } from '@/components/features/revenue-proof/RevenueProofCard';
import { Button } from '@/components/ui/button';
import { getRevenueProofs } from '@/lib/api/revenue-proof';
import type { RevenueProof } from '@/types';
import { SectionTitle } from '../shared/SectionTitle';

export function RevenueGalleryNew() {
  const [items, set_items] = useState<RevenueProof[]>([]);
  const [is_loading, set_is_loading] = useState(true);

  useEffect(() => {
    const load_data = async () => {
      try {
        const result = await getRevenueProofs({
          limit: 12, // 더 많은 데이터 로드
          page: 1,
        });

        if (result.data && result.data.length > 0) {
          set_items(result.data);
        } else {
          // 데이터가 없을 때도 로딩 상태를 false로 설정
          set_items([]);
        }
      } catch (_error) {
        // 오류 발생 시 빈 배열로 설정
        set_items([]);
      } finally {
        set_is_loading(false);
      }
    };

    load_data();
  }, []);

  // 데이터가 있을 때 무한 스크롤을 위해 복제
  const duplicated_items = items.length > 0 ? [...items, ...items] : [];

  if (is_loading) {
    return (
      <section className="py-12 overflow-hidden bg-muted/30">
        <div className="container-responsive mb-8">
          <SectionTitle
            title="실시간 수익 인증"
            subtitle="투명한 수익 공개로 신뢰를 쌓아갑니다"
            align="center"
          />
        </div>
        <div className="flex gap-4 px-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-[280px] h-[350px] bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container-responsive">
          <SectionTitle
            title="실시간 수익 인증"
            subtitle="투명한 수익 공개로 신뢰를 쌓아갑니다"
            align="center"
          />
          <div className="text-center py-12">
            <div className="mx-auto max-w-md">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">첫 수익 인증을 기다리고 있어요!</h3>
              <p className="text-muted-foreground mb-6">
                크리에이터들의 실제 수익 인증이 곧 시작됩니다
              </p>
              <Link href="/revenue-proof/create">
                <Button size="lg">
                  첫 인증하러 가기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 overflow-hidden bg-muted/30">
      <div className="container-responsive mb-8">
        <div className="flex items-center justify-between">
          <SectionTitle
            title="실시간 수익 인증"
            subtitle="투명한 수익 공개로 신뢰를 쌓아갑니다"
            align="left"
          />
          <Link href="/revenue-proof">
            <Button variant="outline" size="sm">
              전체보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Revenue Cards Container - Custom max-width and padding for precise control */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{
              x: [0, -280 * items.length], // 카드 너비 * 개수
            }}
            transition={{
              x: {
                repeat: Number.POSITIVE_INFINITY,
                repeatType: 'loop',
                duration: items.length * 3, // 개수에 따라 속도 조절
                ease: 'linear',
              },
            }}
          >
            {duplicated_items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex-shrink-0 w-[280px]">
                <Link href={`/revenue-proof/${item.id}`}>
                  <div className="transform transition-transform hover:scale-105">
                    <RevenueProofCard data={item} />
                  </div>
                </Link>
              </div>
            ))}
          </motion.div>

          {/* Gradient Overlays - Position at exact edges of overflow container */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
        </div>
      </div>

      {/* Call to Action */}
      <div className="container-responsive mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {items.length}개의 수익 인증이 등록되었습니다
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/revenue-proof">
            <Button variant="default">갤러리 둘러보기</Button>
          </Link>
          <Link href="/revenue-proof/create">
            <Button variant="outline">내 수익 인증하기</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
