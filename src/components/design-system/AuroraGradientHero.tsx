"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface MousePosition {
  x: number;
  y: number;
}

interface AuroraGradientHeroProps {
  className?: string;
  children?: React.ReactNode;
}

const AuroraGradientHero: React.FC<AuroraGradientHeroProps> = ({ 
  className = "",
  children 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', () => setIsHovered(true));
      container.addEventListener('mouseleave', () => setIsHovered(false));

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', () => setIsHovered(true));
        container.removeEventListener('mouseleave', () => setIsHovered(false));
      };
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      style={{
        background: theme.colors.neutral.offWhite,
      }}
    >
      {/* Aurora Layer 1 - Base Layer */}
      <div
        className="absolute inset-0 opacity-60 will-change-transform"
        style={{
          background: `radial-gradient(ellipse ${isHovered ? '800px' : '600px'} ${isHovered ? '600px' : '400px'} at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(99, 91, 255, 0.3) 0%, 
            rgba(0, 214, 143, 0.2) 30%, 
            rgba(255, 98, 98, 0.1) 60%, 
            transparent 100%)`,
          transform: `translate(${(mousePosition.x - 50) * 0.02}px, ${(mousePosition.y - 50) * 0.02}px)`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: 'aurora-drift-1 20s ease-in-out infinite',
        }}
      />

      {/* Aurora Layer 2 - Secondary Layer */}
      <div
        className="absolute inset-0 opacity-40 will-change-transform mix-blend-screen"
        style={{
          background: `radial-gradient(ellipse ${isHovered ? '1000px' : '700px'} ${isHovered ? '500px' : '350px'} at ${100 - mousePosition.x}% ${mousePosition.y}%, 
            rgba(0, 214, 143, 0.4) 0%, 
            rgba(99, 91, 255, 0.2) 40%, 
            rgba(255, 196, 80, 0.1) 70%, 
            transparent 100%)`,
          transform: `translate(${(mousePosition.x - 50) * -0.015}px, ${(mousePosition.y - 50) * 0.025}px)`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: 'aurora-drift-2 25s ease-in-out infinite reverse',
        }}
      />

      {/* Aurora Layer 3 - Accent Layer */}
      <div
        className="absolute inset-0 opacity-30 will-change-transform mix-blend-color-dodge"
        style={{
          background: `radial-gradient(ellipse ${isHovered ? '900px' : '500px'} ${isHovered ? '700px' : '450px'} at ${mousePosition.x}% ${100 - mousePosition.y}%, 
            rgba(255, 196, 80, 0.3) 0%, 
            rgba(99, 91, 255, 0.2) 35%, 
            rgba(0, 214, 143, 0.1) 65%, 
            transparent 100%)`,
          transform: `translate(${(mousePosition.x - 50) * 0.01}px, ${(mousePosition.y - 50) * -0.02}px)`,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: 'aurora-drift-3 30s ease-in-out infinite',
        }}
      />

      {/* Aurora Layer 4 - Highlight Layer */}
      <div
        className="absolute inset-0 opacity-20 will-change-transform mix-blend-overlay"
        style={{
          background: `conic-gradient(from ${mousePosition.x * 3.6}deg at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(255, 196, 80, 0.2) 0deg, 
            rgba(0, 214, 143, 0.1) 60deg, 
            rgba(99, 91, 255, 0.2) 120deg, 
            rgba(255, 98, 98, 0.1) 180deg, 
            rgba(0, 214, 143, 0.2) 240deg, 
            rgba(255, 196, 80, 0.1) 300deg, 
            rgba(255, 196, 80, 0.2) 360deg)`,
          transform: `translate(${(mousePosition.x - 50) * -0.01}px, ${(mousePosition.y - 50) * 0.015}px) rotate(${mousePosition.x * 0.1}deg)`,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: 'aurora-rotate 40s linear infinite',
        }}
      />

      {/* Shimmer Effect */}
      <div
        className="absolute inset-0 opacity-10 will-change-transform pointer-events-none"
        style={{
          background: `linear-gradient(${45 + mousePosition.x * 0.5}deg, 
            transparent 30%, 
            rgba(255, 255, 255, 0.3) 50%, 
            transparent 70%)`,
          transform: `translateX(${isHovered ? '100%' : '-100%'})`,
          transition: 'transform 2s ease-in-out',
          animation: 'shimmer 8s ease-in-out infinite',
        }}
      />

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        {children}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes aurora-drift-1 {
          0%, 100% { 
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            opacity: 0.6;
          }
          25% { 
            transform: translate(20px, -30px) scale(1.1) rotate(1deg);
            opacity: 0.8;
          }
          50% { 
            transform: translate(-15px, 20px) scale(0.9) rotate(-1deg);
            opacity: 0.7;
          }
          75% { 
            transform: translate(25px, 10px) scale(1.05) rotate(0.5deg);
            opacity: 0.9;
          }
        }

        @keyframes aurora-drift-2 {
          0%, 100% { 
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            opacity: 0.4;
          }
          33% { 
            transform: translate(-25px, 15px) scale(1.15) rotate(-1.5deg);
            opacity: 0.6;
          }
          66% { 
            transform: translate(30px, -20px) scale(0.85) rotate(1.2deg);
            opacity: 0.5;
          }
        }

        @keyframes aurora-drift-3 {
          0%, 100% { 
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            opacity: 0.3;
          }
          20% { 
            transform: translate(15px, 25px) scale(1.2) rotate(2deg);
            opacity: 0.5;
          }
          40% { 
            transform: translate(-20px, -15px) scale(0.8) rotate(-1.5deg);
            opacity: 0.4;
          }
          60% { 
            transform: translate(35px, 5px) scale(1.1) rotate(1deg);
            opacity: 0.6;
          }
          80% { 
            transform: translate(-10px, 30px) scale(0.9) rotate(-0.5deg);
            opacity: 0.3;
          }
        }

        @keyframes aurora-rotate {
          0% { 
            transform: rotate(0deg) scale(1);
          }
          25% { 
            transform: rotate(90deg) scale(1.1);
          }
          50% { 
            transform: rotate(180deg) scale(0.9);
          }
          75% { 
            transform: rotate(270deg) scale(1.05);
          }
          100% { 
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes shimmer {
          0%, 100% { 
            transform: translateX(-100%) skewX(-15deg);
            opacity: 0;
          }
          50% { 
            transform: translateX(100%) skewX(-15deg);
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  );
};

export default AuroraGradientHero;