'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StripeLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const StripeContainer: React.FC<StripeLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('mx-auto max-w-[1080px] px-6 lg:px-8', className)}>
      {children}
    </div>
  );
};

interface StripeSectionProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  fadeIn?: boolean;
}

export const StripeSection: React.FC<StripeSectionProps> = ({ 
  children, 
  className,
  gradient = false,
  fadeIn = true 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      className={cn('relative py-24 lg:py-32', className)}
      initial={fadeIn ? { opacity: 0, y: 40 } : {}}
      animate={fadeIn && isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent pointer-events-none" />
      )}
      {children}
    </motion.section>
  );
};

interface StripeGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StripeGrid: React.FC<StripeGridProps> = ({ 
  children, 
  columns = 12,
  gap = 'md',
  className 
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6 lg:gap-8',
    lg: 'gap-8 lg:gap-12',
    xl: 'gap-12 lg:gap-16',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
  };

  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

interface StripeCardEnhancedProps {
  children: React.ReactNode;
  className?: string;
  hover?: 'lift' | 'glow' | 'border' | 'scale';
  delay?: number;
}

export const StripeCardEnhanced: React.FC<StripeCardEnhancedProps> = ({ 
  children, 
  className,
  hover = 'lift',
  delay = 0
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const hoverEffects = {
    lift: 'hover:-translate-y-1 hover:shadow-xl',
    glow: 'hover:shadow-[0_0_40px_rgba(99,91,255,0.2)]',
    border: 'hover:border-[#635BFF]',
    scale: 'hover:scale-105',
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8',
        'transition-all duration-300 ease-out',
        hoverEffects[hover],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      style={{
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all duration-500 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Animated Border Gradient */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20" />
      </div>
    </motion.div>
  );
};

interface StripeParallaxProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export const StripeParallax: React.FC<StripeParallaxProps> = ({ 
  children, 
  offset = 50,
  className 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StripeFeatureProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  reverse?: boolean;
  children?: React.ReactNode;
}

export const StripeFeature: React.FC<StripeFeatureProps> = ({
  title,
  description,
  icon,
  reverse = false,
  children,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className={cn(
        'flex flex-col lg:flex-row items-center gap-12 lg:gap-20',
        reverse && 'lg:flex-row-reverse'
      )}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      {/* Content */}
      <motion.div 
        className="flex-1"
        initial={{ opacity: 0, x: reverse ? 20 : -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {icon && (
          <div className="mb-6 text-[#635BFF]">
            {icon}
          </div>
        )}
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          {description}
        </p>
        {children}
      </motion.div>

      {/* Visual/Demo Area */}
      <motion.div 
        className="flex-1"
        initial={{ opacity: 0, x: reverse ? -20 : 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-3xl opacity-20" />
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 lg:p-12 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Feature Visual</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default {
  Container: StripeContainer,
  Section: StripeSection,
  Grid: StripeGrid,
  Card: StripeCardEnhanced,
  Parallax: StripeParallax,
  Feature: StripeFeature,
};