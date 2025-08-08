'use client';

import { Button } from '../ui/Button';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Gradient Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(236, 72, 153, 0.3), transparent 40%), 
                       radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.2), transparent 50%)`
        }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-primary/80">AI 크리에이터 허브 베타</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 leading-tight">
            쇼츠 제작의 모든 과정,
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              AI로 스마트하게
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-primary/60 mb-8 max-w-2xl mx-auto">
            자막 생성부터 수익화 전략까지, 
            YouTube Shorts 크리에이터를 위한 올인원 플랫폼
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="min-w-[200px]">
              툴박스 무료로 사용하기
            </Button>
            <Button variant="outline" size="lg" className="min-w-[200px]">
              자세히 알아보기
            </Button>
          </div>
        </div>
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
    </section>
  );
}