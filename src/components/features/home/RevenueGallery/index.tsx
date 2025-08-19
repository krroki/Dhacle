'use client';

import { motion } from 'framer-motion';
import { dummyRevenueProofs } from '@/lib/dummy-data/home';
import { SectionTitle } from '../shared/SectionTitle';
import { RevenueCard } from './RevenueCard';

export function RevenueGallery() {
  // Duplicate the array for seamless loop
  const duplicatedProofs = [...dummyRevenueProofs, ...dummyRevenueProofs];

  return (
    <section className="py-12 overflow-hidden bg-muted/30">
      <div className="container-responsive mb-8">
        <SectionTitle
          title="실시간 수익 인증"
          subtitle="투명한 수익 공개로 신뢰를 쌓아갑니다"
          align="center"
        />
      </div>

      <div className="relative">
        <motion.div
          className="flex gap-4"
          animate={{
            x: [0, -50 * dummyRevenueProofs.length],
          }}
          transition={{
            x: {
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear',
            },
          }}
        >
          {duplicatedProofs.map((proof, index) => (
            <RevenueCard key={`${proof.id}-${index}`} proof={proof} />
          ))}
        </motion.div>

        {/* Gradient Overlays for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}
